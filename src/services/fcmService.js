/**
 * FCM Service for PRE Group App
 * Handles Firebase Cloud Messaging for push notifications across Web, iOS, and Android
 * 
 * Features:
 * - Device token registration and management
 * - Foreground notification handling
 * - Background notification handling (via service worker for web)
 * - Token refresh handling
 * - Bilingual notification support (English/Arabic)
 */

import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from 'src/boot/firebase';
import { Notify } from 'quasar';

class FCMService {
  constructor() {
    this.messaging = null;
    this.isNative = Capacitor.isNativePlatform();
    this.platform = Capacitor.getPlatform();
    this.currentToken = null;
    this.notificationHandlers = [];
    
    // VAPID key for web push (get this from Firebase Console > Project Settings > Cloud Messaging)
    this.vapidKey = 'BDL03mUP_fsEjpZLMLwj-EW0XGFUPXDu8alAQgAKrlcGrHe39yxSF8DH1yn75Y93vOYc-5nNcRctEhMoBPvQatQ'; // TODO: Replace with your actual VAPID key
    
    console.log('FCMService: Initialized', { isNative: this.isNative, platform: this.platform });
  }

  /**
   * Initialize FCM based on platform
   */
  async initialize() {
    try {
      console.log('FCMService: Starting initialization...');
      
      if (this.isNative) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
      
      console.log('FCMService: Initialization complete');
      return true;
    } catch (error) {
      console.error('FCMService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize FCM for native platforms (iOS/Android)
   */
  async initializeNative() {
    console.log('FCMService: Initializing native push notifications...');
    
    try {
      // Request permission
      const permissionResult = await PushNotifications.requestPermissions();
      console.log('FCMService: Permission result:', permissionResult);
      
      if (permissionResult.receive === 'granted') {
        // Register with FCM
        await PushNotifications.register();
        console.log('FCMService: Registered for push notifications');
        
        // Set up listeners
        this.setupNativeListeners();
      } else {
        console.warn('FCMService: Push notification permission denied');
        throw new Error('Push notification permission denied');
      }
    } catch (error) {
      console.error('FCMService: Native initialization error:', error);
      throw error;
    }
  }

  /**
   * Initialize FCM for web platform
   */
  async initializeWeb() {
    console.log('FCMService: Initializing web push notifications...');
    
    try {
      // Check if messaging is supported
      if (!('Notification' in window)) {
        console.warn('FCMService: Notifications not supported in this browser');
        return;
      }
      
      // Initialize messaging
      const { app } = await import('src/boot/firebase');
      this.messaging = getMessaging(app);
      console.log('FCMService: Messaging instance created');
      
      // Request permission
      const permission = await Notification.requestPermission();
      console.log('FCMService: Notification permission:', permission);
      
      if (permission === 'granted') {
        // Get FCM token
        await this.getWebToken();
        
        // Set up foreground message handler
        this.setupWebListeners();
      } else {
        console.warn('FCMService: Notification permission denied');
        throw new Error('Notification permission denied');
      }
    } catch (error) {
      console.error('FCMService: Web initialization error:', error);
      throw error;
    }
  }

  /**
   * Get FCM token for web
   */
  async getWebToken() {
    try {
      console.log('FCMService: Attempting to get FCM token...');
      console.log('FCMService: VAPID key:', this.vapidKey.substring(0, 10) + '...');
      
      // Check if service worker is registered
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('FCMService: Service worker registrations:', registrations.length);
        
        if (registrations.length === 0) {
          console.warn('FCMService: No service worker registered, registering now...');
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('FCMService: Service worker registered successfully:', registration.scope);
            // Wait a bit for the service worker to be ready
            await navigator.serviceWorker.ready;
          } catch (swError) {
            console.error('FCMService: Service worker registration failed:', swError);
            throw new Error('Service worker registration failed: ' + swError.message);
          }
        }
      }
      
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });
      
      console.log('FCMService: Got web FCM token:', token);
      this.currentToken = token;
      
      // Save token to Firestore
      if (auth.currentUser) {
        await this.saveTokenToFirestore(token, 'web');
      }
      
      return token;
    } catch (error) {
      console.error('FCMService: Error getting web token:', error);
      console.error('FCMService: Error details:', error.code, error.message);
      throw error;
    }
  }

  /**
   * Set up native platform listeners
   */
  setupNativeListeners() {
    console.log('FCMService: Setting up native listeners...');
    console.log('FCMService: Platform:', this.platform);
    console.log('FCMService: Current user:', auth.currentUser?.uid);
    
    // Listen for registration success
    PushNotifications.addListener('registration', async (token) => {
      console.log('🎉 FCMService: Native registration success!');
      console.log('🎉 FCMService: Token:', token.value);
      this.currentToken = token.value;
      
      // Save token to Firestore
      if (auth.currentUser) {
        console.log('🎉 FCMService: Saving token to Firestore for user:', auth.currentUser.uid);
        await this.saveTokenToFirestore(token.value, this.platform);
        console.log('✅ FCMService: Token saved successfully!');
      } else {
        console.warn('⚠️ FCMService: No authenticated user, token not saved');
      }
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('❌ FCMService: Registration error:', error);
      console.error('❌ FCMService: Error details:', JSON.stringify(error));
    });

    // Listen for push notification received (foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('FCMService: Push notification received (foreground):', notification);
      this.handleForegroundNotification(notification);
    });

    // Listen for push notification tapped (background/killed)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('FCMService: Push notification action performed:', notification);
      this.handleNotificationTap(notification);
    });
  }

  /**
   * Set up web platform listeners
   */
  setupWebListeners() {
    console.log('FCMService: Setting up web listeners...');
    
    // Handle foreground messages
    onMessage(this.messaging, (payload) => {
      console.log('FCMService: Message received (foreground):', payload);
      this.handleForegroundNotification(payload);
    });
  }

  /**
   * Handle foreground notifications
   */
  handleForegroundNotification(notification) {
    console.log('FCMService: Handling foreground notification:', notification);
    
    // Extract notification data based on platform
    let title, body, data;
    
    if (this.isNative) {
      // Capacitor format
      title = notification.title;
      body = notification.body;
      data = notification.data || {};
    } else {
      // Web FCM format
      title = notification.notification?.title || notification.data?.title_en;
      body = notification.notification?.body || notification.data?.body_en;
      data = notification.data || {};
    }
    
    // Get user's preferred language (assuming you have i18n set up)
    const userLang = localStorage.getItem('user-language') || 'en';
    
    // Use bilingual content if available
    if (userLang === 'ar' && data.title_ar) {
      title = data.title_ar;
      body = data.body_ar;
    }
    
    // Show in-app notification using Quasar Notify
    Notify.create({
      type: 'info',
      message: title,
      caption: body,
      position: 'top',
      timeout: 5000,
      actions: [
        {
          label: userLang === 'ar' ? 'عرض' : 'View',
          color: 'white',
          handler: () => {
            this.handleNotificationAction(data);
          }
        },
        {
          label: userLang === 'ar' ? 'إغلاق' : 'Dismiss',
          color: 'white'
        }
      ]
    });
    
    // Call registered handlers
    this.notificationHandlers.forEach(handler => {
      try {
        handler({ title, body, data });
      } catch (error) {
        console.error('FCMService: Handler error:', error);
      }
    });
  }

  /**
   * Handle notification tap (when user taps on notification)
   */
  handleNotificationTap(notification) {
    console.log('FCMService: Handling notification tap:', notification);
    
    // Extract data based on platform
    let data;
    
    if (this.isNative) {
      data = notification.notification?.data || {};
    } else {
      data = notification.data || {};
    }
    
    this.handleNotificationAction(data);
  }

  /**
   * Handle notification action (routing/navigation)
   */
  handleNotificationAction(data) {
    console.log('FCMService: Handling notification action:', data);
    
    // Import router dynamically to avoid circular dependencies
    import('src/router').then(({ default: router }) => {
      // Handle different notification types
      switch (data.type) {
        case 'booking':
          router.push('/bookings');
          break;
        case 'order':
          router.push('/orders');
          break;
        case 'news':
          if (data.newsId) {
            router.push(`/news/${data.newsId}`);
          } else {
            router.push('/news');
          }
          break;
        case 'announcement':
          router.push('/notifications');
          break;
        case 'promo':
        case 'promotion':
          router.push('/promotions');
          break;
        default:
          // Default to notifications page
          router.push('/notifications');
      }
    });
  }

  /**
   * Save FCM token to Firestore
   */
  async saveTokenToFirestore(token, platform) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('FCMService: No authenticated user, skipping token save');
        return;
      }

      console.log('FCMService: Saving token to Firestore:', { token, platform, userId: user.uid });

      // Create a unique ID for this token (use the token itself as the ID)
      const tokenId = this.hashToken(token);
      
      // Save to users/{uid}/tokens/{tokenId}
      const tokenRef = doc(db, 'users', user.uid, 'tokens', tokenId);
      
      await setDoc(tokenRef, {
        token,
        platform,
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        deviceInfo: {
          userAgent: navigator.userAgent || 'Unknown',
          isNative: this.isNative,
          platformType: this.platform
        }
      }, { merge: true });

      console.log('FCMService: Token saved successfully');
    } catch (error) {
      console.error('FCMService: Error saving token:', error);
      throw error;
    }
  }

  /**
   * Update token's last seen timestamp
   */
  async updateTokenLastSeen() {
    try {
      const user = auth.currentUser;
      if (!user || !this.currentToken) {
        return;
      }

      const tokenId = this.hashToken(this.currentToken);
      const tokenRef = doc(db, 'users', user.uid, 'tokens', tokenId);
      
      await updateDoc(tokenRef, {
        lastSeenAt: serverTimestamp()
      });

      console.log('FCMService: Token last seen updated');
    } catch (error) {
      console.error('FCMService: Error updating token last seen:', error);
    }
  }

  /**
   * Remove FCM token from Firestore
   */
  async removeTokenFromFirestore(token) {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('FCMService: No authenticated user, skipping token removal');
        return;
      }

      console.log('FCMService: Removing token from Firestore:', token);

      const tokenId = this.hashToken(token);
      const tokenRef = doc(db, 'users', user.uid, 'tokens', tokenId);
      
      await deleteDoc(tokenRef);

      console.log('FCMService: Token removed successfully');
    } catch (error) {
      console.error('FCMService: Error removing token:', error);
      throw error;
    }
  }

  /**
   * Remove all tokens for current user
   */
  async removeAllTokens() {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      console.log('FCMService: Removing all tokens for user:', user.uid);

      const tokensRef = collection(db, 'users', user.uid, 'tokens');
      const q = query(tokensRef);
      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      console.log('FCMService: All tokens removed');
    } catch (error) {
      console.error('FCMService: Error removing all tokens:', error);
      throw error;
    }
  }

  /**
   * Unregister from push notifications
   */
  async unregister() {
    try {
      console.log('FCMService: Unregistering from push notifications...');

      // Remove token from Firestore
      if (this.currentToken) {
        await this.removeTokenFromFirestore(this.currentToken);
      }

      // Platform-specific unregistration
      if (this.isNative) {
        await PushNotifications.removeAllListeners();
        console.log('FCMService: Native listeners removed');
      } else if (this.messaging) {
        // Delete token from FCM
        await deleteToken(this.messaging);
        console.log('FCMService: Web token deleted');
      }

      this.currentToken = null;
      console.log('FCMService: Unregistered successfully');
    } catch (error) {
      console.error('FCMService: Error unregistering:', error);
      throw error;
    }
  }

  /**
   * Register a notification handler
   */
  onNotification(handler) {
    if (typeof handler === 'function') {
      this.notificationHandlers.push(handler);
    }
  }

  /**
   * Remove a notification handler
   */
  offNotification(handler) {
    const index = this.notificationHandlers.indexOf(handler);
    if (index > -1) {
      this.notificationHandlers.splice(index, 1);
    }
  }

  /**
   * Get current FCM token
   */
  getCurrentToken() {
    return this.currentToken;
  }

  /**
   * Subscribe to a topic
   * Note: Topic subscription must be done server-side via Cloud Functions
   */
  async subscribeToTopic(topic) {
    console.log('FCMService: Topic subscription must be done server-side:', topic);
    // This should be implemented as a Cloud Function that the client calls
    // The function would use admin.messaging().subscribeToTopic([tokens], topic)
  }

  /**
   * Unsubscribe from a topic
   * Note: Topic unsubscription must be done server-side via Cloud Functions
   */
  async unsubscribeFromTopic(topic) {
    console.log('FCMService: Topic unsubscription must be done server-side:', topic);
    // This should be implemented as a Cloud Function that the client calls
    // The function would use admin.messaging().unsubscribeFromTopic([tokens], topic)
  }

  /**
   * Create a simple hash of the token for use as document ID
   */
  hashToken(token) {
    // Simple hash function for token ID
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if notifications are enabled
   */
  async isNotificationsEnabled() {
    if (this.isNative) {
      const result = await PushNotifications.checkPermissions();
      return result.receive === 'granted';
    } else {
      return Notification.permission === 'granted';
    }
  }

  /**
   * Get notification permission status
   */
  async getPermissionStatus() {
    if (this.isNative) {
      const result = await PushNotifications.checkPermissions();
      return result.receive;
    } else {
      return Notification.permission;
    }
  }
}

// Export singleton instance
export const fcmService = new FCMService();

// Export class for testing
export default FCMService;

