/**
 * Notification Service
 * Handles Firebase Cloud Messaging (FCM) for push notifications
 * Implementation matches orange-pharmacies app pattern
 */

import { FirebaseMessaging } from '@capacitor-firebase/messaging'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../boot/firebase'

class NotificationService {
  constructor() {
    this.initialized = false
    this.currentToken = null
  }

  /**
   * Request notification permissions and get FCM token
   * This matches the getNotificationsOnLaunch function from orange-pharmacies
   */
  async initializeNotifications(userId) {
    try {
      if (!userId) {
        console.log('NotificationService: No user ID provided, skipping initialization')
        return null
      }

      console.log('NotificationService: Requesting notification permissions...')
      
      // Request notification permissions
      const permissions = await FirebaseMessaging.requestPermissions()
      
      // Check if permission was granted
      if (permissions.receive !== 'granted') {
        console.log('NotificationService: Notification permission not granted')
        return null
      }

      console.log('NotificationService: Permission granted, getting FCM token...')
      
      // Get FCM token
      const { token } = await FirebaseMessaging.getToken()
      
      if (!token) {
        console.warn('NotificationService: No FCM token received')
        return null
      }

      console.log('NotificationService: FCM token received, saving to Firestore...')
      this.currentToken = token
      
      // Save token to user's Firestore document
      const userRef = doc(db, 'Users', userId)
      await updateDoc(userRef, {
        fcmToken: token,
      })
      
      console.log('NotificationService: FCM token saved successfully')
      this.initialized = true
      
      return token
    } catch (error) {
      console.error('NotificationService: Error initializing notifications:', error)
      return null
    }
  }

  /**
   * Add listener for incoming notifications
   * This can be called to handle notifications when app is in foreground
   */
  addNotificationListeners() {
    try {
      // Listen for notifications received while app is in foreground
      FirebaseMessaging.addListener('notificationReceived', (notification) => {
        console.log('NotificationService: Notification received:', notification)
        // You can handle the notification here (show toast, update UI, etc.)
      })

      // Listen for notification actions (when user taps on notification)
      FirebaseMessaging.addListener('notificationActionPerformed', (action) => {
        console.log('NotificationService: Notification action performed:', action)
        // You can handle navigation or other actions here
      })

      console.log('NotificationService: Notification listeners added')
    } catch (error) {
      console.error('NotificationService: Error adding notification listeners:', error)
    }
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners() {
    try {
      FirebaseMessaging.removeAllListeners()
      console.log('NotificationService: All notification listeners removed')
    } catch (error) {
      console.error('NotificationService: Error removing notification listeners:', error)
    }
  }

  /**
   * Clear FCM token from Firestore (useful for logout)
   */
  async clearToken(userId) {
    try {
      if (!userId) {
        console.log('NotificationService: No user ID provided, skipping token clear')
        return
      }

      console.log('NotificationService: Clearing FCM token from Firestore...')
      
      const userRef = doc(db, 'Users', userId)
      await updateDoc(userRef, {
        fcmToken: null,
      })
      
      this.currentToken = null
      this.initialized = false
      
      console.log('NotificationService: FCM token cleared successfully')
    } catch (error) {
      console.error('NotificationService: Error clearing FCM token:', error)
    }
  }

  /**
   * Get current FCM token
   */
  getCurrentToken() {
    return this.currentToken
  }

  /**
   * Check if notifications are initialized
   */
  isInitialized() {
    return this.initialized
  }
}

// Create and export singleton instance
const notificationService = new NotificationService()
export default notificationService
