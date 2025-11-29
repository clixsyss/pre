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
      console.warn('⚠️ No project ID available for suspension check');
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    const userDoc = await firestoreService.getDoc(`users/${userId}`);
    
    if (!userDoc.exists()) {
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    const userData = userDoc.data();
    
    // Find the project-specific data
    const userProject = (userData.projects || []).find(p => p.projectId === projectId);
    
    if (!userProject) {
      console.warn('⚠️ User not found in project:', projectId);
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    // Check if user is suspended for THIS PROJECT
    if (!userProject.isSuspended) {
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    // Check if temporary suspension has expired
    if (userProject.suspensionType === 'temporary' && userProject.suspensionEndDate) {
      const endDate = userProject.suspensionEndDate.toDate ? 
        userProject.suspensionEndDate.toDate() : 
        new Date(userProject.suspensionEndDate);
      
      if (new Date() > endDate) {
        // Suspension has expired, automatically unsuspend for this project
        await unsuspendUser(userId, projectId);
        return {
          isSuspended: false,
          suspensionDetails: null
        };
      }
    }
    
    // User is suspended for this project
    console.log('🚫 User is suspended for project:', projectId);
    return {
      isSuspended: true,
      suspensionDetails: {
        reason: userProject.suspensionReason,
        type: userProject.suspensionType,
        suspendedAt: userProject.suspendedAt,
        suspendedBy: userProject.suspendedBy,
        suspensionEndDate: userProject.suspensionEndDate,
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
