import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { smartMirrorDb as db } from '../boot/smartMirrorFirebase'

/**
 * User Management Functions
 */

/**
 * Create a new user document in Firestore
 * @param {string} userId - Firebase Auth UID
 * @param {Object} userData - User data to save
 * @returns {Promise<boolean>} - Success status
 */
export const createUserDocument = async (userId, userData) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    
    const userDocument = {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      authUid: userId
    }
    
    await setDoc(userDocRef, userDocument)
    console.log('✅ User document created successfully:', userId)
    return true
  } catch (error) {
    console.error('❌ Error creating user document:', error)
    throw error
  }
}

/**
 * Update an existing user document in Firestore
 * @param {string} userId - Firebase Auth UID
 * @param {Object} updateData - Data to update
 * @param {boolean} merge - Whether to merge with existing data (default: true)
 * @returns {Promise<boolean>} - Success status
 */
export const updateUserDocument = async (userId, updateData, merge = true) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    
    const updateDocument = {
      ...updateData,
      updatedAt: serverTimestamp()
    }
    
    await setDoc(userDocRef, updateDocument, { merge })
    console.log('✅ User document updated successfully:', userId)
    return true
  } catch (error) {
    console.error('❌ Error updating user document:', error)
    throw error
  }
}

/**
 * Get a user document from Firestore
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const getUserDocument = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() }
    } else {
      console.log('⚠️ User document not found:', userId)
      return null
    }
  } catch (error) {
    console.error('❌ Error getting user document:', error)
    throw error
  }
}

/**
 * Delete a user document from Firestore
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteUserDocument = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    await deleteDoc(userDocRef)
    console.log('✅ User document deleted successfully:', userId)
    return true
  } catch (error) {
    console.error('❌ Error deleting user document:', error)
    throw error
  }
}

/**
 * Find users by specific criteria
 * @param {string} field - Field to search in
 * @param {string} value - Value to search for
 * @returns {Promise<Array>} - Array of matching users
 */
export const findUsersByField = async (field, value) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where(field, '==', value))
    const querySnapshot = await getDocs(q)
    
    const users = []
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() })
    })
    
    console.log(`✅ Found ${users.length} users with ${field}: ${value}`)
    return users
  } catch (error) {
    console.error('❌ Error finding users by field:', error)
    throw error
  }
}

/**
 * Get all users (admin only)
 * @returns {Promise<Array>} - Array of all users
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)
    
    const users = []
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() })
    })
    
    console.log(`✅ Retrieved ${users.length} users`)
    return users
  } catch (error) {
    console.error('❌ Error getting all users:', error)
    throw error
  }
}

/**
 * Update user registration status
 * @param {string} userId - Firebase Auth UID
 * @param {string} status - New registration status
 * @param {string} step - Current registration step
 * @returns {Promise<boolean>} - Success status
 */
export const updateRegistrationStatus = async (userId, status, step) => {
  try {
    await updateUserDocument(userId, {
      registrationStatus: status,
      registrationStep: step
    })
    console.log(`✅ Registration status updated: ${status} at step: ${step}`)
    return true
  } catch (error) {
    console.error('❌ Error updating registration status:', error)
    throw error
  }
}

/**
 * Mark user profile as complete
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<boolean>} - Success status
 */
export const markProfileComplete = async (userId) => {
  try {
    await updateUserDocument(userId, {
      isProfileComplete: true,
      registrationStatus: 'completed',
      registrationStep: 'complete'
    })
    console.log('✅ User profile marked as complete')
    return true
  } catch (error) {
    console.error('❌ Error marking profile complete:', error)
    throw error
  }
}

/**
 * Update user last login timestamp
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<boolean>} - Success status
 */
export const updateLastLogin = async (userId) => {
  try {
    await updateUserDocument(userId, {
      lastLoginAt: serverTimestamp()
    })
    console.log('✅ Last login timestamp updated')
    return true
  } catch (error) {
    console.error('❌ Error updating last login:', error)
    throw error
  }
}

/**
 * Check if user document exists
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<boolean>} - Whether user document exists
 */
export const userDocumentExists = async (userId) => {
  try {
    const userDoc = await getUserDocument(userId)
    return userDoc !== null
  } catch (error) {
    console.error('❌ Error checking if user document exists:', error)
    return false
  }
}

/**
 * Get user registration progress
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object>} - Registration progress information
 */
export const getRegistrationProgress = async (userId) => {
  try {
    const userDoc = await getUserDocument(userId)
    if (!userDoc) return null
    
    const progress = {
      email: !!userDoc.email,
      emailVerified: userDoc.emailVerified || false,
      propertyDetails: !!(userDoc.project && userDoc.unit && userDoc.role),
      personalDetails: !!(userDoc.firstName && userDoc.lastName && userDoc.mobile),
      isComplete: userDoc.isProfileComplete || false,
      currentStep: userDoc.registrationStep || 'personal',
      status: userDoc.registrationStatus || 'pending'
    }
    
    return progress
  } catch (error) {
    console.error('❌ Error getting registration progress:', error)
    throw error
  }
}
