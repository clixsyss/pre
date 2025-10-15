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

// ============================================================================
// PUSH NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Send push notification immediately when a notification document is created
 * Triggers on: onCreate of /projects/{projectId}/notifications/{notificationId}
 */
exports.sendNotificationOnCreate = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '1GB'
  })
  .firestore
  .document('projects/{projectId}/notifications/{notificationId}')
  .onCreate(async (snap, context) => {
    try {
      const { projectId, notificationId } = context.params
      const notification = snap.data()
      
      console.log('[sendNotificationOnCreate] Processing notification:', {
        projectId,
        notificationId,
        projectName: notification.projectName
      })
      
      // Only send if sendNow is true
      if (!notification.sendNow) {
        console.log('[sendNotificationOnCreate] Skipping - sendNow is false')
        return null
      }
      
      // Check if already sent
      if (notification.status === 'sent') {
        console.log('[sendNotificationOnCreate] Skipping - already sent')
        return null
      }
      
      // Send the notification
      await sendNotification(projectId, notificationId, notification)
      
      return null
    } catch (error) {
      console.error('[sendNotificationOnCreate] Error:', error)
      // Update notification status to failed
      try {
        await admin.firestore()
          .collection('projects')
          .doc(context.params.projectId)
          .collection('notifications')
          .doc(context.params.notificationId)
          .update({
            status: 'failed',
            error: error.message,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
      } catch (updateError) {
        console.error('[sendNotificationOnCreate] Error updating status:', updateError)
      }
      throw error
    }
  })

/**
 * Scheduled function to send pending notifications
 * TEMPORARILY DISABLED - Will be re-enabled with project-specific support
 * Runs every minute to check for scheduled notifications across all projects
 */
// exports.sendScheduledNotifications = functions.pubsub
//   .schedule('every 1 minutes')
//   .onRun(async (context) => {
//     try {
//       console.log('[sendScheduledNotifications] Running scheduled check...')
//       
//       // TODO: Update to iterate through all projects
//       // const projectsSnapshot = await admin.firestore().collection('projects').get()
//       // for (const projectDoc of projectsSnapshot.docs) {
//       //   const projectId = projectDoc.id
//       //   // Query project-specific notifications...
//       // }
//       
//       return null
//     } catch (error) {
//       console.error('[sendScheduledNotifications] Error:', error)
//       throw error
//     }
//   })

/**
 * Helper function to send a notification
 * Handles token collection, message building, and sending
 */
async function sendNotification(projectId, notificationId, notification) {
  console.log('[sendNotification] Sending notification:', {
    projectId,
    notificationId,
    projectName: notification.projectName
  })
  
  try {
    // Validate notification data
    if (!notification.title_en || !notification.body_en) {
      throw new Error('Missing required English content')
    }
    
    if (!notification.title_ar || !notification.body_ar) {
      throw new Error('Missing required Arabic content')
    }
    
    // Collect device tokens based on audience and project
    const tokens = await collectTokens(projectId, notification.audience)
    
    if (tokens.length === 0) {
      console.log('[sendNotification] No tokens found for notification:', notificationId)
      
      // Update status to sent (even though no tokens, to avoid retrying)
      await admin.firestore()
        .collection('projects')
        .doc(projectId)
        .collection('notifications')
        .doc(notificationId)
        .update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          tokensCount: 0,
          successCount: 0,
          failureCount: 0
        })
      
      return
    }
    
    console.log('[sendNotification] Sending to', tokens.length, 'tokens')
    
    // Build FCM messages
    const messages = buildMessages(notification, tokens)
    
    // Send in batches of 500 (FCM limit)
    const batchSize = 500
    let totalSuccess = 0
    let totalFailure = 0
    const invalidTokens = []
    
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize)
      
      console.log('[sendNotification] Sending batch', Math.floor(i / batchSize) + 1, 'of', Math.ceil(messages.length / batchSize))
      
      try {
        const response = await admin.messaging().sendEach(batch)
        
        console.log('[sendNotification] Batch results:', {
          successCount: response.successCount,
          failureCount: response.failureCount
        })
        
        totalSuccess += response.successCount
        totalFailure += response.failureCount
        
        // Collect invalid tokens
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error
            if (
              error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(batch[idx].token)
            }
          }
        })
      } catch (error) {
        console.error('[sendNotification] Batch error:', error)
        totalFailure += batch.length
      }
    }
    
    // Remove invalid tokens
    if (invalidTokens.length > 0) {
      console.log('[sendNotification] Removing', invalidTokens.length, 'invalid tokens')
      await removeInvalidTokens(invalidTokens)
    }
    
    // Update notification status
    await admin.firestore()
      .collection('projects')
      .doc(projectId)
      .collection('notifications')
      .doc(notificationId)
      .update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        tokensCount: tokens.length,
        successCount: totalSuccess,
        failureCount: totalFailure,
        invalidTokensRemoved: invalidTokens.length
      })
    
    console.log('[sendNotification] Notification sent successfully:', {
      projectId,
      notificationId,
      tokens: tokens.length,
      success: totalSuccess,
      failure: totalFailure,
      invalidRemoved: invalidTokens.length
    })
  } catch (error) {
    console.error('[sendNotification] Error:', error)
    throw error
  }
}

/**
 * Collect device tokens based on audience targeting and project
 */
async function collectTokens(projectId, audience) {
  console.log('[collectTokens] Collecting tokens for:', { projectId, audience })
  
  const tokens = []
  
  try {
    if (audience.all) {
      // Get all users belonging to this project
      console.log('[collectTokens] Getting tokens for all users in project:', projectId)
      const usersRef = admin.firestore().collection('users')
      const usersSnapshot = await usersRef.get()
      
      console.log('[collectTokens] Found', usersSnapshot.size, 'total users, filtering by project')
      
      // Filter users by project and collect their tokens
      let projectUserCount = 0
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data()
        
        // Check if user belongs to this project
        if (userData.projects && Array.isArray(userData.projects)) {
          const belongsToProject = userData.projects.some(p => p.projectId === projectId)
          
          if (belongsToProject) {
            projectUserCount++
            
            // Collect tokens for this user
            const tokensRef = userDoc.ref.collection('tokens')
            const tokensSnapshot = await tokensRef.get()
            
            tokensSnapshot.docs.forEach(tokenDoc => {
              const tokenData = tokenDoc.data()
              if (tokenData.token) {
                tokens.push({
                  token: tokenData.token,
                  userId: userDoc.id,
                  platform: tokenData.platform
                })
              }
            })
          }
        }
      }
      
      console.log('[collectTokens] Found', projectUserCount, 'users in project')
    } else if (audience.uids && audience.uids.length > 0) {
      // Get tokens for specific users (still verify they belong to project)
      console.log('[collectTokens] Getting tokens for', audience.uids.length, 'specific users')
      
      for (const uid of audience.uids) {
        // Verify user belongs to project
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(uid)
          .get()
        
        if (!userDoc.exists) {
          console.warn('[collectTokens] User not found:', uid)
          continue
        }
        
        const userData = userDoc.data()
        const belongsToProject = userData.projects && 
          Array.isArray(userData.projects) &&
          userData.projects.some(p => p.projectId === projectId)
        
        if (!belongsToProject) {
          console.warn('[collectTokens] User does not belong to project:', uid, projectId)
          continue
        }
        
        // Collect tokens for this user
        const tokensRef = admin.firestore()
          .collection('users')
          .doc(uid)
          .collection('tokens')
        
        const tokensSnapshot = await tokensRef.get()
        
        tokensSnapshot.docs.forEach(tokenDoc => {
          const tokenData = tokenDoc.data()
          if (tokenData.token) {
            tokens.push({
              token: tokenData.token,
              userId: uid,
              platform: tokenData.platform
            })
          }
        })
      }
    } else if (audience.topic) {
      // Topic-based sending
      // Note: Topics must be managed separately via subscribeToTopic API
      console.log('[collectTokens] Topic-based sending not yet implemented:', audience.topic)
      // TODO: Implement topic-based token collection or use admin.messaging().sendToTopic()
    }
    
    console.log('[collectTokens] Collected', tokens.length, 'tokens for project', projectId)
    return tokens
  } catch (error) {
    console.error('[collectTokens] Error:', error)
    throw error
  }
}

/**
 * Build FCM messages for each token
 */
function buildMessages(notification, tokens) {
  console.log('[buildMessages] Building messages for', tokens.length, 'tokens')
  
  const messages = tokens.map(tokenData => {
    // Build notification payload with default language (English)
    const message = {
      token: tokenData.token,
      notification: {
        title: notification.title_en,
        body: notification.body_en
      },
      data: {
        notificationId: notification.id || '',
        type: notification.type || 'announcement',
        title_en: notification.title_en,
        body_en: notification.body_en,
        title_ar: notification.title_ar,
        body_ar: notification.body_ar
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title_en,
              body: notification.body_en
            },
            sound: 'default',
            badge: 1
          }
        }
      }
    }
    
    // Add image if provided
    if (notification.meta && notification.meta.image) {
      message.notification.imageUrl = notification.meta.image
      message.data.image = notification.meta.image
    }
    
    // Add click action based on type
    const clickActions = {
      booking: '/bookings',
      order: '/orders',
      news: '/news',
      announcement: '/notifications',
      promo: '/promotions',
      promotion: '/promotions'
    }
    
    const clickAction = clickActions[notification.type] || '/notifications'
    message.data.click_action = clickAction
    
    return message
  })
  
  return messages
}

/**
 * Remove invalid tokens from Firestore
 */
async function removeInvalidTokens(tokens) {
  console.log('[removeInvalidTokens] Removing', tokens.length, 'invalid tokens')
  
  try {
    // Query all users to find and remove invalid tokens
    const usersRef = admin.firestore().collection('users')
    const usersSnapshot = await usersRef.get()
    
    const deletePromises = []
    
    for (const userDoc of usersSnapshot.docs) {
      const tokensRef = userDoc.ref.collection('tokens')
      const tokensSnapshot = await tokensRef.get()
      
      tokensSnapshot.docs.forEach(tokenDoc => {
        const tokenData = tokenDoc.data()
        if (tokens.includes(tokenData.token)) {
          console.log('[removeInvalidTokens] Deleting token:', tokenDoc.id, 'for user:', userDoc.id)
          deletePromises.push(tokenDoc.ref.delete())
        }
      })
    }
    
    await Promise.all(deletePromises)
    console.log('[removeInvalidTokens] Removed', deletePromises.length, 'invalid tokens')
  } catch (error) {
    console.error('[removeInvalidTokens] Error:', error)
    // Don't throw - this is cleanup, shouldn't fail the main operation
  }
}

/**
 * Callable function to subscribe a user to a topic
 */
exports.subscribeToTopic = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      )
    }
    
    const { token, topic } = data
    
    if (!token || !topic) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Token and topic are required'
      )
    }
    
    console.log('[subscribeToTopic] Subscribing token to topic:', topic)
    
    // Subscribe to topic
    const response = await admin.messaging().subscribeToTopic([token], topic)
    
    console.log('[subscribeToTopic] Success:', response.successCount, 'Failure:', response.failureCount)
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    }
  } catch (error) {
    console.error('[subscribeToTopic] Error:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to subscribe to topic: ' + error.message
    )
  }
})

/**
 * Callable function to unsubscribe a user from a topic
 */
exports.unsubscribeFromTopic = functions.https.onCall(async (data, context) => {
  try {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      )
    }
    
    const { token, topic } = data
    
    if (!token || !topic) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Token and topic are required'
      )
    }
    
    console.log('[unsubscribeFromTopic] Unsubscribing token from topic:', topic)
    
    // Unsubscribe from topic
    const response = await admin.messaging().unsubscribeFromTopic([token], topic)
    
    console.log('[unsubscribeFromTopic] Success:', response.successCount, 'Failure:', response.failureCount)
    
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount
    }
  } catch (error) {
    console.error('[unsubscribeFromTopic] Error:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Failed to unsubscribe from topic: ' + error.message
    )
  }
})

