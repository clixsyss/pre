import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../boot/firebase';

/**
 * Update user profile data in Firestore
 * @param {string} userId - The user's UID
 * @param {Object} updateData - The data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, updateData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update the document
    await updateDoc(userRef, updateData);
    
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
};

/**
 * Get user profile data from Firestore
 * @param {string} userId - The user's UID
 * @returns {Promise<Object|null>}
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log('No user document found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
};

/**
 * Check if user profile is complete
 * @param {Object} userData - The user data object
 * @returns {boolean}
 */
export const isProfileComplete = (userData) => {
  if (!userData) return false;
  
  const requiredFields = ['firstName', 'lastName', 'mobile', 'email'];
  return requiredFields.every(field => userData[field] && userData[field].trim());
};

/**
 * Validate user profile data
 * @param {Object} userData - The user data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateUserProfile = (userData) => {
  const errors = {};
  
  // Required fields validation
  if (!userData.firstName || !userData.firstName.trim()) {
    errors.firstName = 'First name is required';
  } else if (userData.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }
  
  if (!userData.lastName || !userData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  } else if (userData.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }
  
  if (!userData.mobile || !userData.mobile.trim()) {
    errors.mobile = 'Mobile number is required';
  } else if (!/^[0-9+\-\s()]+$/.test(userData.mobile.trim())) {
    errors.mobile = 'Please enter a valid mobile number';
  }
  
  // Optional fields validation
  if (userData.nationalId && userData.nationalId.length < 5) {
    errors.nationalId = 'National ID must be at least 5 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
