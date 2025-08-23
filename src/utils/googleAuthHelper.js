/**
 * Google Authentication Helper for PRE Group app
 * Handles Google sign-in with proper validation and cleanup
 */

import { signInWithPopup, signOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../boot/firebase'
import { canUseGoogleSignIn } from './userValidation'

/**
 * Attempt Google sign-in with proper validation
 * @returns {Promise<Object>} - Sign-in result
 */
export const attemptGoogleSignIn = async () => {
  try {
    // Attempt Google sign-in
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Immediately validate if this user can use Google sign-in
    const eligibilityCheck = await canUseGoogleSignIn(user.email)
    
    if (!eligibilityCheck.allowed) {
      // User cannot use Google sign-in - clean up immediately
      await cleanupRejectedSignIn(user, eligibilityCheck.reason)
      return {
        success: false,
        reason: eligibilityCheck.reason,
        userData: null
      }
    }
    
    // User is eligible - return success with user data
    return {
      success: true,
      userData: eligibilityCheck.userData,
      firebaseUser: user
    }
    
  } catch (error) {
    console.error('Google sign-in error:', error)
    return {
      success: false,
      reason: getErrorMessage(error),
      error: error
    }
  }
}

/**
 * Clean up rejected sign-in attempts
 * @param {Object} user - Firebase user object
 * @param {string} reason - Reason for rejection
 */
const cleanupRejectedSignIn = async (user, reason) => {
  try {
    // Sign out the user immediately
    await signOut(auth)
    
    // Create a rejection record for tracking
    const rejectionRef = doc(db, 'rejectedSignUps', user.uid)
    await setDoc(rejectionRef, {
      email: user.email,
      attemptedAt: serverTimestamp(),
      rejectionReason: reason,
      authProvider: 'google',
      userAgent: navigator.userAgent,
      timestamp: serverTimestamp(),
      cleanedUp: true
    })
    
    console.log('Rejected sign-in cleaned up successfully')
  } catch (cleanupError) {
    console.error('Error during cleanup:', cleanupError)
  }
}

/**
 * Get user-friendly error message from Firebase error
 * @param {Error} error - Firebase authentication error
 * @returns {string} - User-friendly error message
 */
const getErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled'
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Please allow pop-ups for this site.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.'
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please try again later.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this app.'
    default:
      return 'Google sign in failed. Please try again.'
  }
}

/**
 * Check if user is currently signed in
 * @returns {boolean} - Whether user is signed in
 */
export const isUserSignedIn = () => {
  return !!auth.currentUser
}

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    return { success: false, error: error.message }
  }
}
