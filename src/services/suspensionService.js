import firestoreService from './firestoreService';

/**
 * Check if a user is currently suspended for a specific project
 * @param {string} userId - The user's ID
 * @param {string} projectId - The project ID (optional, gets from store if not provided)
 * @returns {Promise<Object>} - Suspension status and details
 */
export const checkUserSuspension = async (userId, projectId = null) => {
  try {
    // Get project ID from store if not provided
    if (!projectId) {
      const { useProjectStore } = await import('../stores/projectStore');
      const projectStore = useProjectStore();
      projectId = projectStore.selectedProject?.id;
    }
    
    if (!projectId) {
      console.warn('⚠️ SuspensionService: No project ID available for suspension check');
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    console.log('🔍 SuspensionService: Checking suspension for user:', userId, 'project:', projectId);
    
    const userDoc = await firestoreService.getDoc(`users/${userId}`);
    
    if (!userDoc.exists()) {
      console.warn('⚠️ SuspensionService: User document does not exist:', userId);
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    const userData = userDoc.data();
    
    if (!userData) {
      console.warn('⚠️ SuspensionService: User data is null or undefined');
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    // Ensure projects is an array
    const projects = Array.isArray(userData.projects) ? userData.projects : [];
    console.log('🔍 SuspensionService: User has', projects.length, 'projects');
    
    // Find the project-specific data
    const userProject = projects.find(p => {
      // Handle both direct projectId and nested projectId
      const projId = p.projectId || p.M?.projectId?.S || p.M?.projectId;
      return projId === projectId;
    });
    
    if (!userProject) {
      console.warn('⚠️ SuspensionService: User not found in project:', projectId);
      console.log('🔍 SuspensionService: Available project IDs:', projects.map(p => p.projectId || p.M?.projectId?.S || p.M?.projectId));
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    // Extract isSuspended - handle both JavaScript format and DynamoDB format
    let isSuspended = false;
    if (userProject.isSuspended !== undefined) {
      // JavaScript format
      isSuspended = typeof userProject.isSuspended === 'boolean' 
        ? userProject.isSuspended 
        : userProject.isSuspended === true || userProject.isSuspended === 'true';
    } else if (userProject.M?.isSuspended?.BOOL !== undefined) {
      // DynamoDB format
      isSuspended = userProject.M.isSuspended.BOOL;
    } else if (userProject.M?.isSuspended?.S) {
      // DynamoDB string format
      isSuspended = userProject.M.isSuspended.S === 'true';
    }
    
    console.log('🔍 SuspensionService: User project isSuspended:', isSuspended, 'for project:', projectId);
    
    // Check if user is suspended for THIS PROJECT
    if (!isSuspended) {
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    // Extract suspension details - handle both JavaScript and DynamoDB formats
    const extractField = (fieldName) => {
      if (userProject[fieldName] !== undefined) {
        return userProject[fieldName];
      } else if (userProject.M?.[fieldName]?.S) {
        return userProject.M[fieldName].S;
      } else if (userProject.M?.[fieldName]?.BOOL !== undefined) {
        return userProject.M[fieldName].BOOL;
      } else if (userProject.M?.[fieldName]?.N) {
        return Number(userProject.M[fieldName].N);
      }
      return null;
    };
    
    const suspensionType = extractField('suspensionType');
    const suspensionEndDate = extractField('suspensionEndDate');
    const suspensionReason = extractField('suspensionReason');
    const suspendedAt = extractField('suspendedAt');
    const suspendedBy = extractField('suspendedBy');
    
    // Check if temporary suspension has expired
    if (suspensionType === 'temporary' && suspensionEndDate) {
      let endDate;
      if (suspensionEndDate instanceof Date) {
        endDate = suspensionEndDate;
      } else if (suspensionEndDate.toDate) {
        endDate = suspensionEndDate.toDate();
      } else if (typeof suspensionEndDate === 'string') {
        endDate = new Date(suspensionEndDate);
      } else if (typeof suspensionEndDate === 'number') {
        endDate = new Date(suspensionEndDate);
      } else {
        endDate = new Date(suspensionEndDate);
      }
      
      if (isNaN(endDate.getTime())) {
        console.warn('⚠️ SuspensionService: Invalid suspensionEndDate:', suspensionEndDate);
      } else if (new Date() > endDate) {
        // Suspension has expired, automatically unsuspend for this project
        console.log('⏰ SuspensionService: Temporary suspension has expired, auto-unsuspending');
        await unsuspendUser(userId, projectId);
        return {
          isSuspended: false,
          suspensionDetails: null
        };
      }
    }
    
    // User is suspended for this project
    console.log('🚫 SuspensionService: User is suspended for project:', projectId, {
      reason: suspensionReason,
      type: suspensionType,
      endDate: suspensionEndDate
    });
    
    return {
      isSuspended: true,
      suspensionDetails: {
        reason: suspensionReason,
        type: suspensionType,
        suspendedAt: suspendedAt,
        suspendedBy: suspendedBy,
        suspensionEndDate: suspensionEndDate,
        projectId: projectId
      }
    };
    
  } catch (error) {
    console.error('Error checking user suspension:', error);
    return {
      isSuspended: false,
      suspensionDetails: null
    };
  }
};

/**
 * Automatically unsuspend a user when temporary suspension expires (project-specific)
 * @param {string} userId - The user's ID
 * @param {string} projectId - The project ID
 */
const unsuspendUser = async (userId, projectId) => {
  try {
    const userDoc = await firestoreService.getDoc(`users/${userId}`);
    const userData = userDoc.data();
    
    // Update the projects array to remove suspension for this specific project
    const updatedProjects = (userData.projects || []).map(proj => {
      if (proj.projectId === projectId) {
        return {
          ...proj,
          isSuspended: false,
          suspensionReason: null,
          suspensionType: null,
          suspendedAt: null,
          suspendedBy: null,
          suspensionEndDate: null,
          unsuspendedAt: new Date(),
          unsuspendedBy: 'system'
        };
      }
      return proj;
    });

    await firestoreService.updateDoc(`users/${userId}`, {
      projects: updatedProjects,
      updatedAt: new Date()
    });
    
    console.log('✅ Auto-unsuspended user for project:', projectId);
  } catch (error) {
    console.error('Error auto-unsuspending user:', error);
  }
};

/**
 * Check if a user can access a specific route
 * @param {string} userId - The user's ID
 * @param {string} route - The route being accessed
 * @returns {Promise<boolean>} - Whether the user can access the route
 */
export const canUserAccessRoute = async (userId, route) => {
  const suspensionStatus = await checkUserSuspension(userId);
  
  if (!suspensionStatus.isSuspended) {
    return true;
  }
  
  // Define allowed routes for suspended users
  const allowedRoutes = [
    '/',
    '/home',
    '/profile',
    '/access',
    '/gate-access',
    '/gate',
    '/support',
    '/support-chat'
  ];
  
  return allowedRoutes.includes(route);
};

/**
 * Get suspension message for display to user
 * @param {Object} suspensionDetails - Suspension details from checkUserSuspension
 * @returns {Object} - Formatted message for display
 */
export const getSuspensionMessage = (suspensionDetails) => {
  if (!suspensionDetails) {
    return null;
  }
  
  const { reason, type, suspensionEndDate } = suspensionDetails;
  
  let message = `Your account has been suspended. Reason: ${reason}`;
  
  if (type === 'temporary' && suspensionEndDate) {
    const endDate = suspensionEndDate.toDate ? 
      suspensionEndDate.toDate() : 
      new Date(suspensionEndDate);
    
    message += `\n\nSuspension will end on: ${endDate.toLocaleString()}`;
  } else if (type === 'permanent') {
    message += '\n\nThis is a permanent suspension.';
  }
  
  message += '\n\nYou can still access your profile and gate functionality.';
  
  return {
    title: 'Account Suspended',
    message: message,
    type: type,
    endDate: suspensionEndDate
  };
};
