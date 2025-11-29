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
    
    // Build FCM messages with proper badge counts
    const messages = await buildMessages(notification, tokens, projectId)
    
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
  const tokenSet = new Set() // Track unique tokens to avoid duplicates
  
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
            
            // Collect tokens for this user - check both subcollection AND flat fcmToken field
            // Use Set to avoid duplicate tokens
            
            // 1. Check subcollection (existing approach)
            const tokensRef = userDoc.ref.collection('tokens')
            const tokensSnapshot = await tokensRef.get()
            
            tokensSnapshot.docs.forEach(tokenDoc => {
              const tokenData = tokenDoc.data()
              if (tokenData.token && !tokenSet.has(tokenData.token)) {
                tokenSet.add(tokenData.token)
                tokens.push({
                  token: tokenData.token,
                  userId: userDoc.id,
                  platform: tokenData.platform
                })
              }
            })
            
            // 2. Check flat fcmToken field (orange-pharmacies approach)
            // Only add if not already in set
            if (userData.fcmToken && !tokenSet.has(userData.fcmToken)) {
              tokenSet.add(userData.fcmToken)
              tokens.push({
                token: userData.fcmToken,
                userId: userDoc.id,
                platform: 'ios' // Default platform for flat token
              })
            }
          }
        }
      }
      
      console.log('[collectTokens] Found', projectUserCount, 'users in project')
      console.log('[collectTokens] Collected', tokens.length, 'unique tokens (deduplicated)')
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
        
        // Collect tokens for this user - check both subcollection AND flat fcmToken field
        // Use Set to avoid duplicate tokens
        
        // 1. Check subcollection (existing approach)
        const tokensRef = admin.firestore()
          .collection('users')
          .doc(uid)
          .collection('tokens')
        
        const tokensSnapshot = await tokensRef.get()
        
        tokensSnapshot.docs.forEach(tokenDoc => {
          const tokenData = tokenDoc.data()
          if (tokenData.token && !tokenSet.has(tokenData.token)) {
            tokenSet.add(tokenData.token)
            tokens.push({
              token: tokenData.token,
              userId: uid,
              platform: tokenData.platform
            })
          }
        })
        
        // 2. Check flat fcmToken field (orange-pharmacies approach)
        // Only add if not already in set
        if (userData.fcmToken && !tokenSet.has(userData.fcmToken)) {
          tokenSet.add(userData.fcmToken)
          tokens.push({
            token: userData.fcmToken,
            userId: uid,
            platform: 'ios' // Default platform for flat token
          })
        }
      }
      
      console.log('[collectTokens] Collected', tokens.length, 'unique tokens for specific users (deduplicated)')
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
 * Get unread notification count for a user in a project
 */
async function getUserUnreadCount(projectId, userId) {
  try {
    const notificationsRef = admin.firestore()
      .collection('projects')
      .doc(projectId)
      .collection('notifications')
    
    // Query for unread notifications for this user
    const unreadQuery = notificationsRef.where('status', '==', 'sent')
    const snapshot = await unreadQuery.get()
    
    let unreadCount = 0
    
    snapshot.forEach(doc => {
      const data = doc.data()
      
      // Check if this notification is for the user
      let isForUser = false
      if (data.audience) {
        if (data.audience.all) {
          isForUser = true
        } else if (data.audience.uids && data.audience.uids.includes(userId)) {
          isForUser = true
        }
      } else if (data.userId === userId) {
        isForUser = true
      }
      
      // Check if user has read this notification
      if (isForUser && !data.read) {
        unreadCount++
      }
    })
    
    // Add 1 for the new notification being sent
    return unreadCount + 1
  } catch (error) {
    console.error('[getUserUnreadCount] Error:', error)
    return 1 // Default to 1 if error
  }
}

/**
 * Build FCM messages for each token
 */
async function buildMessages(notification, tokens, projectId) {
  console.log('[buildMessages] Building messages for', tokens.length, 'tokens')
  
  // Group tokens by user to calculate badge count per user
  const tokensByUser = {}
  tokens.forEach(tokenData => {
    if (!tokensByUser[tokenData.userId]) {
      tokensByUser[tokenData.userId] = []
    }
    tokensByUser[tokenData.userId].push(tokenData)
  })
  
  // Calculate unread count for each user
  const badgeCounts = {}
  for (const userId of Object.keys(tokensByUser)) {
    badgeCounts[userId] = await getUserUnreadCount(projectId, userId)
  }
  
  const messages = tokens.map(tokenData => {
    const badgeCount = badgeCounts[tokenData.userId] || 1
    
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
            badge: badgeCount,
            'interruption-level': 'time-sensitive'
          }
        },
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert'
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

/**
 * Process push notification queue
 * This function processes pending push notifications and sends them via FCM
 */
exports.processPushNotifications = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    console.log('Processing push notification queue...');
    
    try {
      const db = admin.firestore();
      
      // Get pending and retry push notifications
      const pendingNotifications = await db
        .collection('pushNotifications')
        .where('status', 'in', ['pending', 'retry'])
        .limit(100)
        .get();

      if (pendingNotifications.empty) {
        console.log('No pending notifications to process');
        return null;
      }

      console.log(`Processing ${pendingNotifications.size} pending notifications`);

      const batch = db.batch();
      const results = [];

      for (const doc of pendingNotifications.docs) {
        const notification = doc.data();
        
        try {
          // Get user's FCM tokens (including those without isActive field for backward compatibility)
          const tokensSnapshot = await db
            .collection(`users/${notification.userId}/tokens`)
            .get();

          if (tokensSnapshot.empty) {
            console.log(`No active FCM tokens found for user ${notification.userId}`);
            
            // Mark notification as failed - no tokens available
            batch.update(doc.ref, {
              status: 'failed',
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              error: 'No active FCM tokens found for user',
              retryCount: admin.firestore.FieldValue.increment(1)
            });

            results.push({
              id: doc.id,
              status: 'failed',
              error: 'No active FCM tokens found'
            });
            
            continue; // Skip to next notification
          }

          // Send to all user's tokens
          let successCount = 0;
          let failCount = 0;
          const tokenResults = [];

          for (const tokenDoc of tokensSnapshot.docs) {
            const tokenData = tokenDoc.data();
            
            // Skip inactive tokens (but treat missing isActive as active for backward compatibility)
            if (tokenData.isActive === false) {
              console.log(`Skipping inactive token ${tokenData.token.substring(0, 20)}...`);
              continue;
            }
            
            try {
              // Send FCM message
              const message = {
                token: tokenData.token,
                notification: {
                  title: notification.title,
                  body: notification.message,
                  icon: '/favicon.ico',
                  badge: '/favicon.ico',
                  image: notification.imageUrl || undefined,
                  click_action: notification.actionUrl || undefined
                },
                data: {
                  actionType: notification.actionType || 'general',
                  projectId: notification.projectId || '',
                  userId: notification.userId || '',
                  category: notification.category || 'general',
                  priority: notification.priority || 'normal',
                  requiresAction: notification.requiresAction ? 'true' : 'false',
                  actionUrl: notification.actionUrl || '',
                  actionText: notification.actionText || '',
                  ...notification.metadata
                },
                android: {
                  priority: 'high',
                  notification: {
                    sound: 'default',
                    click_action: notification.actionUrl || undefined
                  }
                },
                apns: {
                  payload: {
                    aps: {
                      sound: 'default',
                      badge: 1,
                      'interruption-level': 'time-sensitive'
                    }
                  },
                  headers: {
                    'apns-priority': '10',
                    'apns-push-type': 'alert'
                  }
                }
              };

              // Send the message
              const response = await admin.messaging().send(message);
              
              console.log(`Successfully sent message to token ${tokenData.token.substring(0, 20)}...`, response);
              successCount++;
              
              tokenResults.push({
                token: tokenData.token.substring(0, 20) + '...',
                success: true,
                fcmMessageId: response
              });

            } catch (tokenError) {
              console.error(`Error sending to token ${tokenData.token.substring(0, 20)}...:`, tokenError);
              failCount++;
              
              tokenResults.push({
                token: tokenData.token.substring(0, 20) + '...',
                success: false,
                error: tokenError.message
              });

              // If token is invalid, mark it as inactive
              if (tokenError.code === 'messaging/invalid-registration-token' || 
                  tokenError.code === 'messaging/registration-token-not-registered') {
                await tokenDoc.ref.update({
                  isActive: false,
                  deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  deactivationReason: tokenError.message
                });
                console.log(`Marked token as inactive: ${tokenData.token.substring(0, 20)}...`);
              }
            }
          }

          // Update notification status based on results
          if (successCount > 0) {
            // At least one token received the notification
            batch.update(doc.ref, {
              status: 'sent',
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
              tokensAttempted: tokensSnapshot.size,
              tokensSucceeded: successCount,
              tokensFailed: failCount,
              tokenResults: tokenResults,
              retryCount: admin.firestore.FieldValue.increment(1)
            });

            results.push({
              id: doc.id,
              status: 'sent',
              tokensSucceeded: successCount,
              tokensFailed: failCount
            });
          } else {
            // All tokens failed
            throw new Error(`Failed to send to all ${tokensSnapshot.size} tokens`);
          }

        } catch (error) {
          console.error(`Error sending notification ${doc.id}:`, error);
          
          const retryCount = (notification.retryCount || 0) + 1;
          const maxRetries = notification.maxRetries || 3;
          
          if (retryCount >= maxRetries) {
            // Mark as failed after max retries
            batch.update(doc.ref, {
              status: 'failed',
              failedAt: admin.firestore.FieldValue.serverTimestamp(),
              error: error.message,
              retryCount: retryCount
            });
            
            results.push({
              id: doc.id,
              status: 'failed',
              error: error.message
            });
          } else {
            // Schedule for retry
            batch.update(doc.ref, {
              status: 'retry',
              scheduledFor: admin.firestore.FieldValue.serverTimestamp(),
              retryCount: retryCount,
              lastError: error.message
            });
            
            results.push({
              id: doc.id,
              status: 'retry',
              retryCount: retryCount
            });
          }
        }
      }

      // Commit all updates
      await batch.commit();
      
      console.log('Push notification processing completed:', results);
      return results;

    } catch (error) {
      console.error('Error processing push notifications:', error);
      throw error;
    }
  });

/**
 * Send immediate push notification
 * This function can be called directly to send a push notification immediately
 */
exports.sendImmediatePushNotification = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { userId, projectId, title, message, actionType, actionUrl, actionText } = data;

  if (!userId || !projectId || !title || !message) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    const db = admin.firestore();
    
    // Get user's FCM tokens (including those without isActive field for backward compatibility)
    const tokensSnapshot = await db
      .collection(`users/${userId}/tokens`)
      .get();

    if (tokensSnapshot.empty) {
      return {
        success: false,
        message: 'No FCM tokens found for user',
        tokensFound: 0
      };
    }

    const results = [];
    
    for (const tokenDoc of tokensSnapshot.docs) {
      const tokenData = tokenDoc.data();
      
      // Skip inactive tokens (but treat missing isActive as active for backward compatibility)
      if (tokenData.isActive === false) {
        console.log(`Skipping inactive token ${tokenData.token.substring(0, 20)}...`);
        continue;
      }
      
      try{
        const messagePayload = {
          token: tokenData.token,
          notification: {
            title: title,
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            click_action: actionUrl || undefined
          },
          data: {
            actionType: actionType || 'general',
            projectId: projectId,
            userId: userId,
            actionUrl: actionUrl || '',
            actionText: actionText || ''
          },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              click_action: actionUrl || undefined
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
                'interruption-level': 'time-sensitive'
              }
            },
            headers: {
              'apns-priority': '10',
              'apns-push-type': 'alert'
            }
          }
        };

        const response = await admin.messaging().send(messagePayload);
        
        results.push({
          token: tokenData.token,
          success: true,
          fcmMessageId: response
        });

      } catch (error) {
        console.error(`Error sending to token ${tokenData.token}:`, error);
        results.push({
          token: tokenData.token,
          success: false,
          error: error.message
        });
      }
    }

    const successfulSends = results.filter(r => r.success).length;
    
    return {
      success: successfulSends > 0,
      results,
      totalTokens: tokensSnapshot.size,
      successfulSends,
      message: `Sent to ${successfulSends}/${tokensSnapshot.size} devices`
    };

  } catch (error) {
    console.error('Error sending immediate push notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send push notification');
  }
});

/**
 * Clean up old push notification records
 * This function runs daily to clean up old notification records
 */
exports.cleanupPushNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    console.log('Cleaning up old push notification records...');
    
    try {
      const db = admin.firestore();
      
      // Delete notifications older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const oldNotifications = await db
        .collection('pushNotifications')
        .where('createdAt', '<', thirtyDaysAgo)
        .limit(500)
        .get();

      if (oldNotifications.empty) {
        console.log('No old notifications to clean up');
        return null;
      }

      const batch = db.batch();
      oldNotifications.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      console.log(`Cleaned up ${oldNotifications.size} old notification records`);
      return { cleaned: oldNotifications.size };

    } catch (error) {
      console.error('Error cleaning up push notifications:', error);
      throw error;
    }
  });

/**
 * verifyGuestPass - Verify and mark a guest pass as used (one-time use enforcement)
 * 
 * This function is called by hardware QR code scanners at the gate to:
 * 1. Verify the guest pass exists and hasn't been deleted
 * 2. Validate the verification token (prevents QR code tampering)
 * 3. Check if the pass has already been used (one-time use enforcement)
 * 4. Check if the pass has expired
 * 5. Mark the pass as used with timestamp
 * 
 * Security Features:
 * - Verification token must match exactly (prevents forged QR codes)
 * - Pass can only be used once (prevents reuse)
 * - Expiration time is enforced
 * - Soft-deleted passes are rejected
 * - All verification attempts are logged
 * 
 * @param {Object} data - Request data
 * @param {string} data.projectId - Project ID (from QR code)
 * @param {string} data.passId - Pass ID (from QR code)
 * @param {string} data.verificationToken - Secret token (from QR code)
 * 
 * @returns {Object} Verification result with guest info or error
 * 
 * @example Success Response:
 * {
 *   success: true,
 *   message: "Pass verified and marked as used",
 *   data: {
 *     passId: "GP-1730123456789-ABC12",
 *     guestName: "John Doe",
 *     purpose: "Guest Visit",
 *     usedAt: "2024-11-05T21:15:30.000Z"
 *   }
 * }
 * 
 * @example Error Response (Already Used):
 * {
 *   success: false,
 *   error: "Already used",
 *   message: "This pass has already been used",
 *   data: { usedAt: "2024-11-05T21:00:00.000Z" }
 * }
 */
exports.verifyGuestPass = functions.https.onCall(async (data, context) => {
  try {
    console.log('[verifyGuestPass] 🔍 Starting pass verification...')
    
    // Validate input parameters
    const { projectId, passId, verificationToken } = data
    
    if (!projectId || typeof projectId !== 'string') {
      console.error('[verifyGuestPass] ❌ Invalid projectId')
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Project ID is required and must be a string'
      )
    }
    
    if (!passId || typeof passId !== 'string') {
      console.error('[verifyGuestPass] ❌ Invalid passId')
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Pass ID is required and must be a string'
      )
    }
    
    if (!verificationToken || typeof verificationToken !== 'string') {
      console.error('[verifyGuestPass] ❌ Invalid verificationToken')
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Verification token is required and must be a string'
      )
    }
    
    console.log('[verifyGuestPass] 📋 Verifying pass:', { projectId, passId })
    
    // Get the pass document from Firestore
    const db = admin.firestore()
    const passRef = db.doc(`projects/${projectId}/guestPasses/${passId}`)
    const passDoc = await passRef.get()
    
    // Check if pass exists
    if (!passDoc.exists) {
      console.error('[verifyGuestPass] ❌ Pass not found')
      return {
        success: false,
        error: 'Pass not found',
        message: 'This guest pass does not exist'
      }
    }
    
    const passData = passDoc.data()
    console.log('[verifyGuestPass] ✅ Pass found')
    
    // Check if pass was soft-deleted
    if (passData.deleted === true) {
      console.error('[verifyGuestPass] ❌ Pass was deleted')
      return {
        success: false,
        error: 'Pass deleted',
        message: 'This pass has been deleted and is no longer valid'
      }
    }
    
    // Verify the verification token (security check)
    if (passData.verificationToken !== verificationToken) {
      console.error('[verifyGuestPass] ❌ Invalid verification token')
      console.error('[verifyGuestPass] Expected:', passData.verificationToken)
      console.error('[verifyGuestPass] Received:', verificationToken)
      return {
        success: false,
        error: 'Invalid token',
        message: 'Invalid verification token - QR code may be forged or corrupted'
      }
    }
    
    console.log('[verifyGuestPass] ✅ Verification token valid')
    
    // Check if pass has already been used (ONE-TIME USE ENFORCEMENT)
    if (passData.used === true) {
      console.error('[verifyGuestPass] ❌ Pass already used')
      
      // Convert Firestore Timestamp to ISO string if needed
      let usedAtString = null
      if (passData.usedAt) {
        usedAtString = passData.usedAt.toDate 
          ? passData.usedAt.toDate().toISOString()
          : passData.usedAt
      }
      
      return {
        success: false,
        error: 'Already used',
        message: 'This pass has already been used and cannot be used again',
        data: {
          usedAt: usedAtString,
          guestName: passData.guestName
        }
      }
    }
    
    console.log('[verifyGuestPass] ✅ Pass not yet used')
    
    // Check if pass has expired
    const now = new Date()
    let validUntil
    
    // Handle Firestore Timestamp or ISO string
    if (passData.validUntil && passData.validUntil.toDate) {
      validUntil = passData.validUntil.toDate()
    } else {
      validUntil = new Date(passData.validUntil)
    }
    
    if (now > validUntil) {
      console.error('[verifyGuestPass] ❌ Pass expired')
      console.error('[verifyGuestPass] Valid until:', validUntil)
      console.error('[verifyGuestPass] Current time:', now)
      return {
        success: false,
        error: 'Expired',
        message: 'This pass has expired and is no longer valid'
      }
    }
    
    console.log('[verifyGuestPass] ✅ Pass not expired')
    console.log('[verifyGuestPass] 🎉 All checks passed - marking pass as used')
    
    // Mark pass as used (CRITICAL: One-time use enforcement)
    await passRef.update({
      used: true,
      usedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
    
    console.log('[verifyGuestPass] ✅ Pass marked as used successfully')
    console.log('[verifyGuestPass] 🚪 ACCESS GRANTED for:', passData.guestName)
    
    // Return success with guest information
    return {
      success: true,
      message: 'Pass verified and marked as used',
      data: {
        passId: passId,
        guestName: passData.guestName,
        purpose: passData.purpose || 'Guest Visit',
        unit: passData.unit || '',
        usedAt: new Date().toISOString()
      }
    }
    
  } catch (error) {
    console.error('[verifyGuestPass] ❌ Unexpected error:', error)
    
    // Don't expose internal errors to clients
    throw new functions.https.HttpsError(
      'internal',
      'Unable to verify pass. Please try again or contact support.'
    )
  }
})

