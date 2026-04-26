import firestoreService from './firestoreService';

// Feature IDs that can be partially blocked
export const SUSPENSION_FEATURES = ['bookings', 'services', 'requests', 'complaints', 'support', 'qr_codes'];

/**
 * Check if a user is currently suspended for a specific project.
 * Returns both full-suspension status and the list of blocked features
 * for partial suspensions.
 *
 * @param {string} userId
 * @param {string|null} projectId  — resolved from store if omitted
 * @returns {Promise<{isSuspended: boolean, suspensionDetails: object|null}>}
 */
export const checkUserSuspension = async (userId, projectId = null) => {
  try {
    if (!projectId) {
      const { useProjectStore } = await import('../stores/projectStore');
      const projectStore = useProjectStore();
      projectId = projectStore.selectedProject?.id;
    }

    if (!projectId) {
      console.warn('⚠️ SuspensionService: No project ID available for suspension check');
      return { isSuspended: false, suspensionDetails: null };
    }

    console.log('🔍 SuspensionService: Checking suspension for user:', userId, 'project:', projectId);

    const userDoc = await firestoreService.getDoc(`users/${userId}`);

    if (!userDoc.exists()) {
      console.warn('⚠️ SuspensionService: User document does not exist:', userId);
      return { isSuspended: false, suspensionDetails: null };
    }

    const userData = userDoc.data();
    if (!userData) {
      return { isSuspended: false, suspensionDetails: null };
    }

    const projects = Array.isArray(userData.projects) ? userData.projects : [];
    const userProject = projects.find((p) => {
      const projId = p.projectId || p.M?.projectId?.S || p.M?.projectId;
      return projId === projectId;
    });

    if (!userProject) {
      console.warn('⚠️ SuspensionService: User not found in project:', projectId);
      return { isSuspended: false, suspensionDetails: null };
    }

    // Extract isSuspended (JS or DynamoDB format)
    let isSuspended = false;
    if (userProject.isSuspended !== undefined) {
      isSuspended =
        typeof userProject.isSuspended === 'boolean'
          ? userProject.isSuspended
          : userProject.isSuspended === true || userProject.isSuspended === 'true';
    } else if (userProject.M?.isSuspended?.BOOL !== undefined) {
      isSuspended = userProject.M.isSuspended.BOOL;
    } else if (userProject.M?.isSuspended?.S) {
      isSuspended = userProject.M.isSuspended.S === 'true';
    }

    // Check familyMembersSuspended regardless of whether the current user is suspended
    const familyMembersSuspended =
      userProject.familyMembersSuspended === true ||
      userProject.M?.familyMembersSuspended?.BOOL === true ||
      userProject.M?.familyMembersSuspended?.S === 'true';

    if (!isSuspended) {
      return { isSuspended: false, suspensionDetails: null, familyMembersSuspended };
    }

    // Extract fields (both JS and DynamoDB formats)
    const extractField = (fieldName) => {
      if (userProject[fieldName] !== undefined) return userProject[fieldName];
      if (userProject.M?.[fieldName]?.S) return userProject.M[fieldName].S;
      if (userProject.M?.[fieldName]?.BOOL !== undefined) return userProject.M[fieldName].BOOL;
      if (userProject.M?.[fieldName]?.N) return Number(userProject.M[fieldName].N);
      if (userProject.M?.[fieldName]?.L) {
        // DynamoDB list (blockedFeatures)
        return userProject.M[fieldName].L.map((item) => item.S || item).filter(Boolean);
      }
      return null;
    };

    const suspensionType = extractField('suspensionType');
    const suspensionEndDate = extractField('suspensionEndDate');
    const suspensionReason = extractField('suspensionReason');
    const suspensionLevel = extractField('suspensionLevel') || 'full';
    const blockedFeatures = extractField('blockedFeatures') || [];
    const suspendedAt = extractField('suspendedAt');
    const suspendedBy = extractField('suspendedBy');

    // Auto-expire temporary suspensions
    if (suspensionType === 'temporary' && suspensionEndDate) {
      let endDate;
      if (suspensionEndDate instanceof Date) {
        endDate = suspensionEndDate;
      } else if (suspensionEndDate?.toDate) {
        endDate = suspensionEndDate.toDate();
      } else {
        endDate = new Date(suspensionEndDate);
      }

      if (!isNaN(endDate.getTime()) && new Date() > endDate) {
        console.log('⏰ SuspensionService: Temporary suspension expired, auto-unsuspending');
        await _unsuspendUser(userId, projectId);
        return { isSuspended: false, suspensionDetails: null };
      }
    }

    console.log('🚫 SuspensionService: User is suspended for project:', projectId, {
      level: suspensionLevel,
      blockedFeatures,
    });

    return {
      isSuspended: true,
      familyMembersSuspended,
      suspensionDetails: {
        reason: suspensionReason,
        type: suspensionType,
        level: suspensionLevel,
        blockedFeatures: Array.isArray(blockedFeatures) ? blockedFeatures : [],
        suspendedAt,
        suspendedBy,
        suspensionEndDate,
        projectId,
      },
    };
  } catch (error) {
    console.error('Error checking user suspension:', error);
    return { isSuspended: false, suspensionDetails: null };
  }
};

/**
 * Returns true if the user is suspended from the given feature.
 * Full suspension blocks all features; partial suspension blocks listed features only.
 *
 * @param {object|null} suspensionDetails  — from checkUserSuspension
 * @param {string} featureId  — e.g. 'bookings', 'services', 'requests', 'complaints', 'support'
 * @returns {boolean}
 */
export const isFeatureBlocked = (suspensionDetails, featureId) => {
  if (!suspensionDetails) return false;
  if (suspensionDetails.level === 'full') return true;
  return (suspensionDetails.blockedFeatures || []).includes(featureId);
};

/**
 * Check if a user can access a specific route.
 */
export const canUserAccessRoute = async (userId, route) => {
  const suspensionStatus = await checkUserSuspension(userId);
  if (!suspensionStatus.isSuspended) return true;

  const allowedRoutes = ['/', '/home', '/profile', '/access', '/gate-access', '/gate', '/support', '/support-chat'];
  return allowedRoutes.includes(route);
};

/**
 * Build a structured, bilingual suspension message object.
 * The modal renders each field individually — no concatenated strings.
 */
export const getSuspensionMessage = (suspensionDetails) => {
  if (!suspensionDetails) return null;

  const { reason, type, suspensionEndDate, level, blockedFeatures } = suspensionDetails;

  // Resolve end date once
  let endDateObj = null;
  if (suspensionEndDate) {
    endDateObj = suspensionEndDate?.toDate ? suspensionEndDate.toDate() : new Date(suspensionEndDate);
    if (isNaN(endDateObj?.getTime())) endDateObj = null;
  }

  const isPartial = level === 'partial';

  return {
    // EN titles / subtitles
    title:    isPartial ? 'Partial Suspension'  : 'Account Suspended',
    title_ar: isPartial ? 'تعليق جزئي'          : 'تم تعليق الحساب',

    // EN / AR body (short, single sentence — detail cards below handle the rest)
    body:    isPartial
      ? 'Some features on your account have been temporarily restricted.'
      : 'Your account has been suspended. You can view the app but cannot perform any actions.',
    body_ar: isPartial
      ? 'تم تقييد بعض الميزات على حسابك.'
      : 'تم تعليق حسابك. يمكنك عرض التطبيق فقط ولا يمكنك اتخاذ أي إجراءات.',

    // Reason — always required now, shown in its own card
    reason:    reason || '',
    reason_ar: reason || '',   // admin enters one reason; Arabic label wraps it

    // Suspension meta
    type,
    level: level || 'full',
    blockedFeatures: blockedFeatures || [],
    endDate: endDateObj ? endDateObj.toISOString() : null,
    endDateFormatted:    endDateObj ? endDateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null,
    endDateFormatted_ar: endDateObj ? endDateObj.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : null,

    // Feature labels (id → display name)
    blockedFeatureLabels: buildFeatureLabels(blockedFeatures || []),
  };
};

const FEATURE_LABELS = {
  bookings:   { en: 'Bookings',      ar: 'الحجوزات' },
  services:   { en: 'Services',      ar: 'الخدمات' },
  requests:   { en: 'Requests',      ar: 'الطلبات' },
  complaints: { en: 'Complaints',    ar: 'الشكاوى' },
  support:    { en: 'Support',       ar: 'الدعم الفني' },
  qr_codes:   { en: 'QR Codes / Guest Passes', ar: 'رموز QR / تصاريح الزوار' },
};

const buildFeatureLabels = (features) =>
  features.map((id) => ({
    id,
    en: FEATURE_LABELS[id]?.en || id,
    ar: FEATURE_LABELS[id]?.ar || id,
  }));

// ─── internal ──────────────────────────────────────────────────────────────────

const _unsuspendUser = async (userId, projectId) => {
  try {
    const userDoc = await firestoreService.getDoc(`users/${userId}`);
    const userData = userDoc.data();

    const updatedProjects = (userData.projects || []).map((proj) => {
      if (proj.projectId === projectId) {
        return {
          ...proj,
          isSuspended: false,
          suspensionReason: null,
          suspensionType: null,
          suspensionLevel: null,
          blockedFeatures: [],
          suspendedAt: null,
          suspendedBy: null,
          suspensionEndDate: null,
          unsuspendedAt: new Date().toISOString(),
          unsuspendedBy: 'system',
        };
      }
      return proj;
    });

    await firestoreService.updateDoc(`users/${userId}`, {
      isSuspended: false,
      suspensionLevel: null,
      blockedFeatures: [],
      projects: updatedProjects,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ Auto-unsuspended user for project:', projectId);
  } catch (error) {
    console.error('Error auto-unsuspending user:', error);
  }
};
