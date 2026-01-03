/**
 * User validation utilities for PRE Group app
 * Handles checking if users exist before authentication
 */

import { collection, query, where, getDocs } from 'firebase/firestore'
import { smartMirrorDb as db } from '../boot/smartMirrorFirebase'

/**
 * Check if a user exists in the system by email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - User existence status and data
 */
export const checkUserExistsByEmail = async (email) => {
  try {
    if (!email) {
      return {
        exists: false,
        userData: null,
        message: 'No email provided'
      }
    }

    // Query Firestore to check if user exists by email
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return {
        exists: false,
        userData: null,
        message: 'User not found'
      }
    }

    // Get the first (and should be only) user document
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    return {
      exists: true,
      userData: {
        ...userData,
        uid: userDoc.id
      },
      message: 'User found'
    }
  } catch (error) {
    console.error('Error checking user existence:', error)
    return {
      exists: false,
      userData: null,
      message: 'Error checking user existence',
      error: error.message
    }
  }
}

/**
 * Check if a user can use Google sign-in
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Google sign-in eligibility
 */
export const canUseGoogleSignIn = async (email) => {
  try {
    const userCheck = await checkUserExistsByEmail(email)
    
    if (!userCheck.exists) {
      return {
        allowed: false,
        reason: 'User account does not exist. Please use our custom registration process.',
        userData: null
      }
    }

    // Check if user has completed registration
    const userData = userCheck.userData
    const hasRequiredFields = userData.firstName && userData.lastName && 
                             userData.mobile && userData.dateOfBirth && 
                             userData.nationalId && userData.compound && 
                             userData.unit && userData.role

    if (!hasRequiredFields) {
      return {
        allowed: false,
        reason: 'Profile incomplete. Please complete your profile before using Google sign-in.',
        userData: userData,
        missingFields: getMissingFields(userData)
      }
    }

    return {
      allowed: true,
      reason: 'User can use Google sign-in',
      userData: userData
    }
  } catch (error) {
    console.error('Error checking Google sign-in eligibility:', error)
    return {
      allowed: false,
      reason: 'Error checking eligibility. Please try again.',
      error: error.message
    }
  }
}

/**
 * Get missing fields for a user
 * @param {Object} userData - User data from Firestore
 * @returns {Array} - Array of missing field names
 */
const getMissingFields = (userData) => {
  const requiredFields = [
    'firstName', 'lastName', 'mobile', 'dateOfBirth', 
    'nationalId', 'compound', 'unit', 'role'
  ]
  
  return requiredFields.filter(field => !userData[field] || userData[field].toString().trim() === '')
}

/**
 * Validate user email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if email domain is allowed (optional security feature)
 * @param {string} email - Email to check
 * @param {Array} allowedDomains - Array of allowed email domains
 * @returns {boolean} - Whether email domain is allowed
 */
export const isEmailDomainAllowed = (email, allowedDomains = []) => {
  if (!allowedDomains.length) return true // No restrictions
  
  const domain = email.split('@')[1]
  return allowedDomains.includes(domain)
}
