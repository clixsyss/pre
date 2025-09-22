import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../boot/firebase';

/**
 * Check if a user is currently suspended
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Suspension status and details
 */
export const checkUserSuspension = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    const userData = userDoc.data();
    
    // Check if user is suspended
    if (!userData.isSuspended) {
      return {
        isSuspended: false,
        suspensionDetails: null
      };
    }
    
    // Check if temporary suspension has expired
    if (userData.suspensionType === 'temporary' && userData.suspensionEndDate) {
      const endDate = userData.suspensionEndDate.toDate ? 
        userData.suspensionEndDate.toDate() : 
        new Date(userData.suspensionEndDate);
      
      if (new Date() > endDate) {
        // Suspension has expired, automatically unsuspend
        await unsuspendUser(userId);
        return {
          isSuspended: false,
          suspensionDetails: null
        };
      }
    }
    
    // User is suspended
    return {
      isSuspended: true,
      suspensionDetails: {
        reason: userData.suspensionReason,
        type: userData.suspensionType,
        suspendedAt: userData.suspendedAt,
        suspendedBy: userData.suspendedBy,
        suspensionEndDate: userData.suspensionEndDate
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
 * Automatically unsuspend a user when temporary suspension expires
 * @param {string} userId - The user's ID
 */
const unsuspendUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isSuspended: false,
      suspensionReason: null,
      suspensionType: null,
      suspendedAt: null,
      suspendedBy: null,
      suspensionEndDate: null,
      unsuspendedAt: new Date(),
      unsuspendedBy: 'system'
    });
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
    '/gate'
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
