/**
 * Firebase Cloud Functions for PRE Group
 * 
 * This file contains serverless functions that run on Firebase Cloud Functions.
 * They are triggered by HTTPS requests or other Firebase events.
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')

// Initialize Firebase Admin SDK
admin.initializeApp()

/**
 * migrateOldUser - Migrates a user from old Firestore-only system to Firebase Auth
 * 
 * This function:
 * 1. Verifies email and password are provided
 * 2. Checks if user exists in Firestore with oldId and is not migrated
 * 3. Creates a new Firebase Auth user with the provided credentials
 * 4. Updates Firestore user document with:
 *    - migrated: true
 *    - authUid: <new auth user uid>
 *    - updatedAt: server timestamp
 * 5. Keeps oldId intact for traceability
 * 
 * @param {Object} data - Request data
 * @param {string} data.email - User's email address
 * @param {string} data.password - New password for the user
 * 
 * @returns {Object} Success message or error
 */
exports.migrateOldUser = functions.https.onCall(async (data, context) => {
  try {
    console.log('[migrateOldUser] Starting migration process...')
    
    // Validate input
    const { email, password } = data
    
    if (!email || typeof email !== 'string') {
      console.error('[migrateOldUser] ❌ Invalid email provided')
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email is required and must be a valid string'
      )
    }
    
    if (!password || typeof password !== 'string' || password.length < 6) {
      console.error('[migrateOldUser] ❌ Invalid password provided')
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Password is required and must be at least 6 characters long'
      )
    }
    
    console.log('[migrateOldUser] 📧 Email:', email)
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()
    
    // Step 1: Check if user exists in Firestore with oldId
    console.log('[migrateOldUser] Step 1: Querying Firestore for user...')
    const usersRef = admin.firestore().collection('users')
    const querySnapshot = await usersRef.where('email', '==', normalizedEmail).get()
    
    if (querySnapshot.empty) {
      console.error('[migrateOldUser] ❌ No user found with email:', normalizedEmail)
      throw new functions.https.HttpsError(
        'not-found',
        'No user found with this email address'
      )
    }
    
    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()
    const firestoreUserId = userDoc.id
    
    console.log('[migrateOldUser] ✅ Found user in Firestore:', firestoreUserId)
    console.log('[migrateOldUser] 📋 User data:', {
      hasOldId: !!userData.oldId,
      migrated: userData.migrated,
      email: userData.email
    })
    
    // Step 2: Verify user has oldId and is not migrated
    if (!userData.oldId) {
      console.error('[migrateOldUser] ❌ User does not have oldId field')
      throw new functions.https.HttpsError(
        'failed-precondition',
        'This user does not require migration'
      )
    }
    
    if (userData.migrated === true) {
      console.error('[migrateOldUser] ❌ User already migrated')
      throw new functions.https.HttpsError(
        'already-exists',
        'This account has already been migrated. Please try signing in.'
      )
    }
    
    console.log('[migrateOldUser] ✅ User is eligible for migration')
    
    // Step 3: Check if Firebase Auth user already exists (shouldn't happen, but check anyway)
    let authUserExists = false
    try {
      await admin.auth().getUserByEmail(normalizedEmail)
      authUserExists = true
      console.warn('[migrateOldUser] ⚠️ Auth user already exists for this email')
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        console.error('[migrateOldUser] ❌ Error checking for existing auth user:', error)
        throw error
      }
      console.log('[migrateOldUser] ✅ No existing auth user found (expected)')
    }
    
    if (authUserExists) {
      console.error('[migrateOldUser] ❌ Firebase Auth user already exists')
      throw new functions.https.HttpsError(
        'already-exists',
        'An authentication account with this email already exists. Please try signing in.'
      )
    }
    
    // Step 4: Create Firebase Auth user
    console.log('[migrateOldUser] Step 2: Creating Firebase Auth user...')
    let newAuthUser
    try {
      newAuthUser = await admin.auth().createUser({
        email: normalizedEmail,
        password: password,
        emailVerified: userData.emailVerified || false,
        displayName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || undefined,
      })
      console.log('[migrateOldUser] ✅ Firebase Auth user created:', newAuthUser.uid)
    } catch (error) {
      console.error('[migrateOldUser] ❌ Error creating Firebase Auth user:', error)
      
      // Provide more specific error messages
      if (error.code === 'auth/email-already-exists') {
        throw new functions.https.HttpsError(
          'already-exists',
          'An account with this email already exists. Please try signing in.'
        )
      } else if (error.code === 'auth/invalid-email') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid email address format'
        )
      } else if (error.code === 'auth/invalid-password') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Password must be at least 6 characters long'
        )
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to create authentication account: ' + error.message
      )
    }
    
    // Step 5: Update Firestore user document
    console.log('[migrateOldUser] Step 3: Updating Firestore user document...')
    try {
      await usersRef.doc(firestoreUserId).update({
        migrated: true,
        authUid: newAuthUser.uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Keep oldId as-is for traceability
        // Do NOT delete or modify oldId
      })
      console.log('[migrateOldUser] ✅ Firestore user document updated')
    } catch (error) {
      console.error('[migrateOldUser] ❌ Error updating Firestore:', error)
      
      // Rollback: Delete the Firebase Auth user we just created
      console.warn('[migrateOldUser] ⚠️ Rolling back: Deleting Firebase Auth user...')
      try {
        await admin.auth().deleteUser(newAuthUser.uid)
        console.log('[migrateOldUser] ✅ Rollback successful')
      } catch (rollbackError) {
        console.error('[migrateOldUser] ❌ Rollback failed:', rollbackError)
        // Continue to throw original error
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to update user profile. Migration rolled back.'
      )
    }
    
    console.log('[migrateOldUser] ✅ Migration completed successfully!')
    console.log('[migrateOldUser] 📊 Summary:', {
      firestoreUserId: firestoreUserId,
      authUid: newAuthUser.uid,
      email: normalizedEmail,
      oldId: userData.oldId,
      migrated: true
    })
    
    return {
      success: true,
      message: 'User migrated successfully',
      userId: newAuthUser.uid
    }
    
  } catch (error) {
    console.error('[migrateOldUser] ❌ Migration failed:', error)
    
    // If it's already an HttpsError, rethrow it
    if (error instanceof functions.https.HttpsError) {
      throw error
    }
    
    // Otherwise, wrap it in a generic error
    throw new functions.https.HttpsError(
      'internal',
      'Migration failed: ' + error.message
    )
  }
})

/**
 * Additional helper function to check if a user needs migration
 * This can be called from the client to check before attempting migration
 */
exports.checkMigrationStatus = functions.https.onCall(async (data, context) => {
  try {
    const { email } = data
    
    if (!email || typeof email !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Email is required'
      )
    }
    
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check Firestore
    const usersRef = admin.firestore().collection('users')
    const querySnapshot = await usersRef.where('email', '==', normalizedEmail).get()
    
    if (querySnapshot.empty) {
      return { needsMigration: false, reason: 'User not found' }
    }
    
    const userData = querySnapshot.docs[0].data()
    
    if (!userData.oldId) {
      return { needsMigration: false, reason: 'No oldId field' }
    }
    
    if (userData.migrated === true) {
      return { needsMigration: false, reason: 'Already migrated' }
    }
    
    return { needsMigration: true, reason: 'Eligible for migration' }
    
  } catch (error) {
    console.error('[checkMigrationStatus] Error:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to check migration status: ' + error.message
    )
  }
})

