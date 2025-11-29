/**
 * FCM Service for PRE Group App
 * Handles Firebase Cloud Messaging for push notifications across Web, iOS, and Android
 * 
 * Features:
 * - Device token registration and management using @capacitor-firebase/messaging
 * - Foreground notification handling
 * - Background notification handling
 * - Token refresh handling
 * - Bilingual notification support (English/Arabic)
 */

import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
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
import { db, auth, detectPlatformFromUrl } from 'src/boot/firebase';
import { Notify } from 'quasar';

class FCMService {
  constructor() {
    this.messaging = null;
    this.isNative = null; // Will be set during initialize()
    this.platform = null; // Will be set during initialize()
    this.currentToken = null;
    this.notificationHandlers = [];
    this.FirebaseMessaging = null; // Will be loaded dynamically
    this.listenersSetup = false; // Track if listeners have been set up
    this.isInitialized = false; // Track if FCM has been initialized
    this.hasTokenUpdateInterval = false; // Track if token update interval is set
    
    // VAPID key for web push - uses environment variable with fallback
    this.vapidKey = import.meta.env.VITE_FCM_VAPID_KEY || 'BDL03mUP_fsEjpZLMLwj-EW0XGFUPXDu8alAQgAKrlcGrHe39yxSF8DH1yn75Y93vOYc-5nNcRctEhMoBPvQatQ';
    
    console.log('FCMService: Constructor called (platform detection deferred)');
  }

  /**
   * Initialize FCM based on platform
   */
  async initialize() {
    try {
      // Detect platform using reliable URL-based detection (same as firebase.js)
      if (this.isNative === null || this.platform === null) {
        const platformInfo = detectPlatformFromUrl();
        this.isNative = platformInfo.isNative;
        this.platform = platformInfo.platform;
        console.log('FCMService: Platform detected', { isNative: this.isNative, platform: this.platform });
      }
      
      // Prevent duplicate initialization
      if (this.isInitialized) {
        console.log('FCMService: Already initialized, skipping...');
        return true;
      }
      
      console.log('FCMService: Starting initialization...');
      
      if (this.isNative) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
      
      this.isInitialized = true;
      console.log('FCMService: Initialization complete');
      return true;
    } catch (error) {
      console.error('FCMService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize FCM for native platforms (iOS/Android) using @capacitor-firebase/messaging
   */
  async initializeNative() {
    console.log('FCMService: Initializing native Firebase Messaging...');
    
    try {
      // Ensure the plugin module is loaded (registers the plugin)
      await import('@capacitor-firebase/messaging');
      
      // Access the NATIVE plugin from window.Capacitor (where iOS bridge registers it)
      if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.FirebaseMessaging) {
        throw new Error('FirebaseMessaging plugin not available in window.Capacitor.Plugins');
      }
      
      const FirebaseMessaging = window.Capacitor.Plugins.FirebaseMessaging;
      this.FirebaseMessaging = FirebaseMessaging;
      console.log('FCMService: FirebaseMessaging plugin loaded from window.Capacitor.Plugins');
      console.log('FCMService: Has requestPermissions?', typeof FirebaseMessaging?.requestPermissions);
      
      // Request permissions
      console.log('FCMService: Requesting notification permissions...');
      const permissionResult = await FirebaseMessaging.requestPermissions();
      console.log('FCMService: Permission result:', permissionResult);
      
      if (permissionResult.receive === 'granted') {
        console.log('FCMService: Permission granted ✅');
        
        // Set up listeners FIRST
        this.setupNativeListeners();
        
        // Get the FCM token
        console.log('FCMService: Getting FCM token...');
        const result = await FirebaseMessaging.getToken();
        const token = result.token;
        
        if (token) {
          console.log('🎉 FCMService: Got FCM token:', token);
          console.log('🎉 FCMService: Token length:', token.length);
          this.currentToken = token;
          
          // Mirror orange-pharmacies: write flat fcmToken immediately after retrieval
          try {
            const userId = await this.getCurrentUserId();
            if (userId) {
              const { FirebaseFirestore } = await import('@capacitor-firebase/firestore');
              await FirebaseFirestore.setDocument({
                reference: `users/${userId}`,
                data: { fcmToken: token },
                merge: true
              });
              console.log('✅ FCMService: Immediate user fcmToken updated (native)');
            }
          } catch (e) {
            console.warn('⚠️ FCMService: Immediate flat fcmToken write failed (native):', e);
          }

          // Save token to Firestore with retry for subcollection record
          await this.saveTokenWithRetry(token, this.platform);
        } else {
          console.warn('⚠️ FCMService: No token received');
        }
        
        console.log('✅ FCMService: Native initialization complete');
      } else {
        console.warn('FCMService: Push notification permission denied');
        throw new Error('Push notification permission denied');
      }
    } catch (error) {
      console.error('FCMService: Native initialization error:', error);
      console.error('FCMService: Error details:', error.message);
      throw error;
    }
  }

  /**
   * Save token with retry logic for when user authentication is delayed
   */
  async saveTokenWithRetry(token, platform, retryCount = 0) {
    try {
      // Use getCurrentUserId which handles Web SDK auth with wait logic
      console.log(`🔍 FCMService: Getting user ID (attempt ${retryCount + 1}/10)...`);
      const currentUserId = await this.getCurrentUserId();
      
      if (currentUserId) {
        console.log('🎉 FCMService: Saving token to Firestore for user:', currentUserId);
        await this.saveTokenToFirestore(token, platform);
        console.log('✅ FCMService: Token saved successfully!');
      } else if (retryCount < 10) {
        console.log(`⚠️ FCMService: No authenticated user yet, retrying in 1s... (attempt ${retryCount + 1}/10)`);
        setTimeout(() => this.saveTokenWithRetry(token, platform, retryCount + 1), 1000);
      } else {
        console.error('⚠️ FCMService: No authenticated user after 10 attempts, token not saved');
        throw new Error('Failed to save token: No authenticated user');
      }
    } catch (error) {
      console.error('❌ FCMService: Error in saveTokenWithRetry:', error, 'Message:', error?.message, 'Stack:', error?.stack);
      if (retryCount < 10) {
        console.log(`⚠️ FCMService: Retrying after error... (attempt ${retryCount + 1}/10)`);
        setTimeout(() => this.saveTokenWithRetry(token, platform, retryCount + 1), 1000);
      } else {
        console.error('❌ FCMService: Max retries reached, giving up');
        throw error;
      }
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
      
      // Check if service worker is registered
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('FCMService: Service worker registrations:', registrations.length);
        
        if (registrations.length === 0) {
          console.warn('FCMService: No service worker registered, registering now...');
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('FCMService: Service worker registered successfully:', registration.scope);
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
      throw error;
    }
  }

  /**
   * Set up native platform listeners using @capacitor-firebase/messaging
   */
  setupNativeListeners() {
    console.log('FCMService: Setting up native listeners...');
    
    if (!this.FirebaseMessaging) {
      console.error('FCMService: FirebaseMessaging plugin not loaded');
      return;
    }

    // Check if listeners already set up to prevent duplicates
    if (this.listenersSetup) {
      console.log('FCMService: Native listeners already set up, skipping...');
      return;
    }

    // Listen for token refresh
    this.FirebaseMessaging.addListener('tokenReceived', async (event) => {
      console.log('🎉 FCMService: Token refreshed!');
      console.log('🎉 FCMService: New token:', event.token);
      this.currentToken = event.token;
      
      // Update token in Firestore (use retry logic)
      console.log('🔄 FCMService: Triggering token save after refresh...');
      await this.saveTokenWithRetry(event.token, this.platform);
    });

    // Listen for notification received (foreground)
    this.FirebaseMessaging.addListener('notificationReceived', (event) => {
      console.log('📬 FCMService: Notification received (foreground):', event.notification);
      this.handleForegroundNotification(event.notification);
    });

    // Listen for notification action performed (tap)
    this.FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      console.log('👆 FCMService: Notification tapped:', event.notification);
      this.handleNotificationTap(event);
    });
    
    this.listenersSetup = true;
    console.log('✅ FCMService: Native listeners set up successfully');
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
      // @capacitor-firebase/messaging format
      title = notification.title;
      body = notification.body;
      data = notification.data || {};
    } else {
      // Web FCM format
      title = notification.notification?.title || notification.data?.title_en;
      body = notification.notification?.body || notification.data?.body_en;
      data = notification.data || {};
    }
    
    // Get user's preferred language
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
          handler: async () => {
            await this.handleNotificationAction(data);
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
   * Handle notification tap
   */
  async handleNotificationTap(event) {
    console.log('FCMService: Handling notification tap:', event);
    
    // Extract data
    const data = event.notification?.data || {};
    
    await this.handleNotificationAction(data);
  }

  /**
   * Wait for authentication state to be ready
   * This is critical when app opens from a notification tap
   */
  async waitForAuthenticationState() {
    // iOS needs more time to restore auth state on app launch from notification
    const maxWaitTime = this.platform === 'ios' ? 8000 : 5000; // 8s for iOS, 5s for others
    const checkInterval = 100; // Check every 100ms
    let elapsed = 0;
    
    console.log(`FCMService: Waiting for authentication state before navigation (max: ${maxWaitTime}ms)...`);
    
    while (elapsed < maxWaitTime) {
      try {
        let currentUser = null;
        
        if (this.isNative) {
          // Use Capacitor Firebase Authentication on native
          const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
          const { user } = await FirebaseAuthentication.getCurrentUser();
          currentUser = user;
        } else {
          // Use Web SDK
          currentUser = auth.currentUser;
        }
        
        if (currentUser && currentUser.uid) {
          console.log('FCMService: Authentication state ready, user:', currentUser.uid);
          console.log(`FCMService: Auth ready after ${elapsed}ms`);
          return true;
        }
      } catch (error) {
        console.warn('FCMService: Error checking auth state:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }
    
    console.warn(`FCMService: Authentication state not ready after ${maxWaitTime}ms timeout`);
    return false;
  }

  /**
   * Handle notification action (routing/navigation)
   */
  async handleNotificationAction(data) {
    console.log('FCMService: Handling notification action:', data);
    
    // CRITICAL: Wait for authentication state to be ready before navigating
    // This prevents the "logout" issue when opening app from notification
    const isAuthReady = await this.waitForAuthenticationState();
    
    if (!isAuthReady) {
      console.error('FCMService: Authentication not ready, cannot navigate from notification');
      // Still allow navigation, router guards will handle redirect if needed
    }
    
    // iOS needs extra time for Firebase Auth persistence to fully restore
    // and for the app initialization to complete before navigation
    const additionalDelay = this.platform === 'ios' ? 1500 : 500;
    console.log(`FCMService: Waiting ${additionalDelay}ms before navigation (platform: ${this.platform})`);
    await new Promise(resolve => setTimeout(resolve, additionalDelay));
    
    // Import router dynamically to avoid circular dependencies
    import('src/router').then(({ default: router }) => {
      console.log('FCMService: Router loaded, navigating to:', data.type);
      
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
        case 'alert':
          router.push('/notifications');
          break;
        case 'promo':
        case 'promotion':
          router.push('/promotions');
          break;
        default:
          router.push('/notifications');
      }
    }).catch(error => {
      console.error('FCMService: Error loading router:', error);
    });
  }

  /**
   * Save FCM token to Firestore
   */
  async saveTokenToFirestore(token, platform) {
    try {
      // Use getCurrentUserId which handles Web SDK auth for all platforms
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        console.error('FCMService: No authenticated user, cannot save token');
        throw new Error('No authenticated user');
      }

      console.log('💾 FCMService: Preparing to save token to Firestore:', { token, platform, userId });

      // Create a unique ID for this token
      const tokenId = this.hashToken(token);
      
      // Use Web SDK Firestore for all platforms (consistent with auth)
      console.log('🌐 FCMService: Using Web SDK to save token...');
      const tokenRef = doc(db, 'users', userId, 'tokens', tokenId);
        
      await setDoc(tokenRef, {
        token,
        platform,
        isActive: true,
        createdAt: serverTimestamp(),
        lastSeenAt: serverTimestamp(),
        deviceInfo: {
          userAgent: navigator.userAgent || 'Unknown',
            isNative: this.isNative,
            platformType: this.platform
          }
      }, { merge: true });
        
      console.log('✅ FCMService: Token saved successfully to subcollection!');
      
      // Also store flat fcmToken on the user document for compatibility
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { fcmToken: token });
        console.log('✅ FCMService: User fcmToken field updated');
      } catch (e) {
        console.warn('⚠️ FCMService: Failed to set flat fcmToken:', e?.message || e);
      }
      
      // Store current token in memory
      this.currentToken = token;
      
    } catch (error) {
      console.error('❌ FCMService: Error saving token:', error, 'Message:', error?.message, 'Code:', error?.code);
      throw error;
    }
  }

  /**
   * Get current authenticated user ID (works on both native and web)
   */
  async getCurrentUserId() {
    try {
      // Always use Web SDK auth (matches optimizedAuthService behavior)
      // The app uses Web SDK for authentication on all platforms
      
      // Wait for auth to be ready (with timeout)
      let userId = auth.currentUser?.uid;
      
      if (!userId) {
        console.log('FCMService: Waiting for auth.currentUser to be available...');
        // Wait up to 3 seconds for auth to be ready
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          userId = auth.currentUser?.uid;
          if (userId) {
            console.log(`FCMService: Auth ready after ${(i + 1) * 100}ms`);
            break;
          }
        }
      }
      
      if (!userId) {
        console.error('FCMService: No authenticated user found after waiting');
        return null;
      }
      
      console.log(`FCMService: Got user ID: ${userId}`);
      return userId;
    } catch (error) {
      console.error('FCMService: Error getting current user:', error, error?.message, error?.stack);
      return null;
    }
  }

  /**
   * Update token's last seen timestamp
   */
  async updateTokenLastSeen() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId || !this.currentToken) {
        return;
      }

      const tokenId = this.hashToken(this.currentToken);
      const tokenRef = doc(db, 'users', userId, 'tokens', tokenId);
      
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
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn('FCMService: No authenticated user, skipping token removal');
        return;
      }

      console.log('FCMService: Removing token from Firestore:', token);

      const tokenId = this.hashToken(token);
      const tokenRef = doc(db, 'users', userId, 'tokens', tokenId);
      
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
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return;
      }

      console.log('FCMService: Removing all tokens for user:', userId);

      const tokensRef = collection(db, 'users', userId, 'tokens');
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
      if (this.isNative && this.FirebaseMessaging) {
        await this.FirebaseMessaging.removeAllListeners();
        console.log('FCMService: Native listeners removed');
        this.listenersSetup = false; // Reset listener flag
      } else if (this.messaging) {
        // Delete token from FCM
        await deleteToken(this.messaging);
        console.log('FCMService: Web token deleted');
      }

      this.currentToken = null;
      this.isInitialized = false; // Reset initialization flag
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
    // This should be implemented as a Cloud Function
  }

  /**
   * Unsubscribe from a topic
   * Note: Topic unsubscription must be done server-side via Cloud Functions
   */
  async unsubscribeFromTopic(topic) {
    console.log('FCMService: Topic unsubscription must be done server-side:', topic);
    // This should be implemented as a Cloud Function
  }

  /**
   * Create a simple hash of the token for use as document ID
   */
  hashToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if notifications are enabled
   */
  async isNotificationsEnabled() {
    if (this.isNative && this.FirebaseMessaging) {
      const result = await this.FirebaseMessaging.checkPermissions();
      return result.receive === 'granted';
    } else if (!this.isNative) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  /**
   * Get notification permission status
   */
  async getPermissionStatus() {
    if (this.isNative && this.FirebaseMessaging) {
      const result = await this.FirebaseMessaging.checkPermissions();
      return result.receive;
    } else if (!this.isNative) {
      return Notification.permission;
    }
    return 'prompt';
  }
}

// Export singleton instance
export const fcmService = new FCMService();

// Export class for testing
export default FCMService;
