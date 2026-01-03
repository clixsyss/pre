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

// Firebase Messaging is still required to get FCM tokens (push notification tokens come from Firebase)
// But we only use AWS (DynamoDB) for storage and Cognito for auth
import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';
import { detectPlatformFromUrl } from 'src/boot/smartMirrorFirebase';
import { Notify } from 'quasar';
import logger from 'src/utils/logger';

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
    
    logger.log('FCMService: Constructor called (platform detection deferred)');
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
        logger.log('FCMService: Platform detected', { isNative: this.isNative, platform: this.platform });
      }
      
      // Prevent duplicate initialization
      if (this.isInitialized) {
        logger.log('FCMService: Already initialized, skipping...');
        return true;
      }
      
      logger.log('FCMService: Starting initialization...');
      
      if (this.isNative) {
        await this.initializeNative();
      } else {
        await this.initializeWeb();
      }
      
      this.isInitialized = true;
      logger.log('FCMService: Initialization complete');
      return true;
    } catch (error) {
      logger.error('FCMService: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize FCM for native platforms (iOS/Android) using @capacitor-firebase/messaging
   */
  async initializeNative() {
    logger.log('FCMService: Initializing native Firebase Messaging...');
    
    try {
      // Ensure the plugin module is loaded (registers the plugin)
      await import('@capacitor-firebase/messaging');
      
      // Access the NATIVE plugin from window.Capacitor (where iOS bridge registers it)
      if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.FirebaseMessaging) {
        throw new Error('FirebaseMessaging plugin not available in window.Capacitor.Plugins');
      }
      
      const FirebaseMessaging = window.Capacitor.Plugins.FirebaseMessaging;
      this.FirebaseMessaging = FirebaseMessaging;
      logger.log('FCMService: FirebaseMessaging plugin loaded from window.Capacitor.Plugins');
      logger.log('FCMService: Has requestPermissions?', typeof FirebaseMessaging?.requestPermissions);
      
      // Request permissions
      logger.log('FCMService: Requesting notification permissions...');
      const permissionResult = await FirebaseMessaging.requestPermissions();
      logger.log('FCMService: Permission result:', permissionResult);
      
      if (permissionResult.receive === 'granted') {
        logger.log('FCMService: Permission granted ✅');
        
        // Set up listeners FIRST
        this.setupNativeListeners();
        
        // Get the FCM token
        logger.log('FCMService: Getting FCM token...');
        const result = await FirebaseMessaging.getToken();
        const token = result.token;
        
        if (token) {
          logger.log('🎉 FCMService: Got FCM token:', token);
          logger.log('🎉 FCMService: Token length:', token.length);
          this.currentToken = token;
          
          // No longer writing to Firestore - only DynamoDB
          // Token will be saved to DynamoDB in saveTokenWithRetry below

          // Save token to DynamoDB (AWS-only, no Firestore)
          await this.saveTokenWithRetry(token, this.platform);
        } else {
          logger.warn('⚠️ FCMService: No token received');
        }
        
        logger.log('✅ FCMService: Native initialization complete');
      } else {
        logger.warn('FCMService: Push notification permission denied');
        throw new Error('Push notification permission denied');
      }
    } catch (error) {
      logger.error('FCMService: Native initialization error:', error);
      logger.error('FCMService: Error details:', error.message);
      throw error;
    }
  }

  /**
   * Save token with retry logic for when user authentication is delayed
   */
  async saveTokenWithRetry(token, platform, retryCount = 0) {
    try {
      // Use getCurrentUserId which handles Web SDK auth with wait logic
      logger.log(`🔍 FCMService: Getting user ID (attempt ${retryCount + 1}/10)...`);
      const currentUserId = await this.getCurrentUserId();
      
      if (currentUserId) {
        logger.log('🎉 FCMService: Saving token to DynamoDB for user:', currentUserId);
        await this.saveTokenToFirestore(token, platform);
        logger.log('✅ FCMService: Token saved successfully to DynamoDB!');
      } else if (retryCount < 10) {
        logger.log(`⚠️ FCMService: No authenticated user yet, retrying in 1s... (attempt ${retryCount + 1}/10)`);
        setTimeout(() => this.saveTokenWithRetry(token, platform, retryCount + 1), 1000);
      } else {
        logger.error('⚠️ FCMService: No authenticated user after 10 attempts, token not saved');
        throw new Error('Failed to save token: No authenticated user');
      }
    } catch (error) {
      logger.error('❌ FCMService: Error in saveTokenWithRetry:', error, 'Message:', error?.message, 'Stack:', error?.stack);
      if (retryCount < 10) {
        logger.log(`⚠️ FCMService: Retrying after error... (attempt ${retryCount + 1}/10)`);
        setTimeout(() => this.saveTokenWithRetry(token, platform, retryCount + 1), 1000);
      } else {
        logger.error('❌ FCMService: Max retries reached, giving up');
        throw error;
      }
    }
  }

  /**
   * Initialize FCM for web platform
   */
  async initializeWeb() {
    logger.log('FCMService: Initializing web push notifications...');
    
    try {
      // Check if messaging is supported
      if (!('Notification' in window)) {
        logger.warn('FCMService: Notifications not supported in this browser');
        return;
      }
      
      // Initialize messaging
      const { smartMirrorApp } = await import('src/boot/smartMirrorFirebase');
      this.messaging = getMessaging(smartMirrorApp);
      logger.log('FCMService: Messaging instance created');
      
      // Request permission
      const permission = await Notification.requestPermission();
      logger.log('FCMService: Notification permission:', permission);
      
      if (permission === 'granted') {
        // Get FCM token
        await this.getWebToken();
        
        // Set up foreground message handler
        this.setupWebListeners();
      } else {
        logger.warn('FCMService: Notification permission denied');
        throw new Error('Notification permission denied');
      }
    } catch (error) {
      logger.error('FCMService: Web initialization error:', error);
      throw error;
    }
  }

  /**
   * Get FCM token for web
   */
  async getWebToken() {
    try {
      logger.log('FCMService: Attempting to get FCM token...');
      
      // Check if service worker is registered
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        logger.log('FCMService: Service worker registrations:', registrations.length);
        
        if (registrations.length === 0) {
          logger.warn('FCMService: No service worker registered, registering now...');
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            logger.log('FCMService: Service worker registered successfully:', registration.scope);
            await navigator.serviceWorker.ready;
          } catch (swError) {
            logger.error('FCMService: Service worker registration failed:', swError);
            throw new Error('Service worker registration failed: ' + swError.message);
          }
        }
      }
      
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });
      
      logger.log('FCMService: Got web FCM token:', token);
      this.currentToken = token;
      
      // Save token to DynamoDB (AWS-only)
      const userId = await this.getCurrentUserId();
      if (userId) {
        await this.saveTokenToFirestore(token, 'web');
      }
      
      return token;
    } catch (error) {
      logger.error('FCMService: Error getting web token:', error);
      throw error;
    }
  }

  /**
   * Set up native platform listeners using @capacitor-firebase/messaging
   */
  setupNativeListeners() {
    logger.log('FCMService: Setting up native listeners...');
    
    if (!this.FirebaseMessaging) {
      logger.error('FCMService: FirebaseMessaging plugin not loaded');
      return;
    }

    // Check if listeners already set up to prevent duplicates
    if (this.listenersSetup) {
      logger.log('FCMService: Native listeners already set up, skipping...');
      return;
    }

    // Listen for token refresh
    this.FirebaseMessaging.addListener('tokenReceived', async (event) => {
      logger.log('🎉 FCMService: Token refreshed!');
      logger.log('🎉 FCMService: New token:', event.token);
      this.currentToken = event.token;
      
      // Update token in DynamoDB (use retry logic)
      logger.log('🔄 FCMService: Token refreshed, updating in DynamoDB...');
      await this.saveTokenWithRetry(event.token, this.platform);
    });

    // Listen for notification received (foreground)
    this.FirebaseMessaging.addListener('notificationReceived', (event) => {
      logger.log('📬 FCMService: Notification received (foreground):', event.notification);
      this.handleForegroundNotification(event.notification);
    });

    // Listen for notification action performed (tap)
    this.FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
      logger.log('👆 FCMService: Notification tapped:', event.notification);
      this.handleNotificationTap(event);
    });
    
    this.listenersSetup = true;
    logger.log('✅ FCMService: Native listeners set up successfully');
  }

  /**
   * Set up web platform listeners
   */
  setupWebListeners() {
    logger.log('FCMService: Setting up web listeners...');
    
    // Handle foreground messages
    onMessage(this.messaging, (payload) => {
      logger.log('FCMService: Message received (foreground):', payload);
      this.handleForegroundNotification(payload);
    });
  }

  /**
   * Handle foreground notifications
   */
  handleForegroundNotification(notification) {
    logger.log('FCMService: Handling foreground notification:', notification);
    
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
        logger.error('FCMService: Handler error:', error);
      }
    });
  }

  /**
   * Handle notification tap
   */
  async handleNotificationTap(event) {
    logger.log('FCMService: Handling notification tap:', event);
    
    // Extract data
    const data = event.notification?.data || {};
    
    await this.handleNotificationAction(data);
  }

  /**
   * Wait for authentication state to be ready
   * This is critical when app opens from a notification tap
   * iOS cold starts from notifications can take 8-10 seconds to restore Cognito session
   */
  async waitForAuthenticationState() {
    // iOS needs more time to restore auth state on app launch from notification
    // Cold starts on iOS can take 8-10 seconds for Cognito to restore session from keychain
    const maxWaitTime = this.platform === 'ios' ? 10000 : 5000; // 10s for iOS, 5s for others
    const checkInterval = 200; // Check every 200ms (less frequent to reduce CPU usage)
    let elapsed = 0;
    
    logger.log(`FCMService: Waiting for authentication state before navigation (max: ${maxWaitTime}ms, platform: ${this.platform})...`);
    
    while (elapsed < maxWaitTime) {
      try {
        // Use Cognito auth only (AWS-only, no Firebase Auth)
        const optimizedAuthService = await import('./optimizedAuthService').then(m => m.default);
        
        // Use waitForAuthState for better reliability on iOS
        const currentUser = this.platform === 'ios' 
          ? await optimizedAuthService.waitForAuthState(Math.min(maxWaitTime - elapsed, 3000))
          : await optimizedAuthService.getCurrentUser();
        
        if (currentUser) {
          const cognitoSub = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.userSub;
          logger.log('FCMService: Authentication state ready, user (Cognito sub):', cognitoSub);
          logger.log(`FCMService: Auth ready after ${elapsed}ms`);
          return true;
        }
      } catch (error) {
        logger.warn('FCMService: Error checking auth state:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }
    
    logger.warn(`FCMService: Authentication state not ready after ${maxWaitTime}ms timeout`);
    logger.warn('FCMService: This might cause navigation issues, but not signing out - auth may restore later');
    return false;
  }

  /**
   * Handle notification action (routing/navigation)
   */
  async handleNotificationAction(data) {
    logger.log('FCMService: Handling notification action:', data);
    
    // CRITICAL: Wait for authentication state to be ready before navigating
    // This prevents the "logout" issue when opening app from notification
    const isAuthReady = await this.waitForAuthenticationState();
    
    if (!isAuthReady) {
      logger.error('FCMService: Authentication not ready, cannot navigate from notification');
      // Still allow navigation, router guards will handle redirect if needed
    }
    
    // iOS needs extra time for Cognito auth persistence to fully restore
    // and for the app initialization to complete before navigation
    // After waiting for auth state above, add a small delay to ensure router is ready
    const additionalDelay = this.platform === 'ios' ? 2000 : 1000; // Increased for iOS
    logger.log(`FCMService: Waiting ${additionalDelay}ms before navigation (platform: ${this.platform})`);
    await new Promise(resolve => setTimeout(resolve, additionalDelay));
    
    // Import router dynamically to avoid circular dependencies
    import('src/router').then(({ default: router }) => {
      logger.log('FCMService: Router loaded, navigating to:', data.type);
      
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
      logger.error('FCMService: Error loading router:', error);
    });
  }

  /**
   * Save FCM token to DynamoDB (AWS-only storage)
   * No longer uses Firestore - only AWS DynamoDB for token storage
   */
  async saveTokenToFirestore(token, platform) {
    try {
      // Use getCurrentUserId which gets Cognito sub (DynamoDB user ID)
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        logger.error('FCMService: No authenticated user, cannot save token');
        throw new Error('No authenticated user');
      }

      logger.log('💾 FCMService: Registering token in DynamoDB (AWS-only storage)...', { 
        userId, 
        platform: platform || this.platform || 'web', 
        tokenLength: token?.length 
      });

      // Register token in DynamoDB for Lambda notification system
      // This is the ONLY storage location - no Firestore
      try {
        const { registerUserToken } = await import('./tokenRegistrationService');
        const result = await registerUserToken({
          userId,
          token,
          platform: platform || this.platform || 'web'
        });
        if (result) {
          logger.log('✅ FCMService: Token registered in DynamoDB userTokens table', { 
            userId, 
            tokenId: result.id, 
            platform: result.platform 
          });
        } else {
          logger.warn('⚠️ FCMService: Token registration returned null (may have been cached or failed silently)');
        }
      } catch (dynamoError) {
        // Critical: token registration failure means notifications won't work
        logger.error('❌ FCMService: Failed to register token in DynamoDB:', {
          error: dynamoError?.message || dynamoError,
          stack: dynamoError?.stack,
          userId,
          platform: platform || this.platform || 'web'
        });
        // Don't throw - allow app to continue, but log the error
      }
      
      // Store current token in memory
      this.currentToken = token;
      
    } catch (error) {
      logger.error('❌ FCMService: Error saving token:', error, 'Message:', error?.message, 'Code:', error?.code);
      throw error;
    }
  }

  /**
   * Get current authenticated user ID (works on both native and web)
   * Returns Cognito sub (DynamoDB user ID) for token registration compatibility with Lambda
   */
  async getCurrentUserId() {
    try {
      // Use optimizedAuthService to get Cognito user (which has Cognito sub)
      // This ensures we get the DynamoDB user ID, not Firebase UID
      const optimizedAuthService = await import('./optimizedAuthService').then(m => m.default);
      const currentUser = await optimizedAuthService.getCurrentUser();
      
      if (!currentUser) {
        logger.log('FCMService: Waiting for authenticated user...');
        // Wait up to 3 seconds for auth to be ready
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
          const retryUser = await optimizedAuthService.getCurrentUser();
          if (retryUser) {
            logger.log(`FCMService: Auth ready after ${(i + 1) * 100}ms`);
            // Get Cognito sub (DynamoDB user ID)
            // Priority: attributes.sub > cognitoAttributes.sub > userSub
            // DO NOT fall back to uid as it might be Firebase UID or username
            const cognitoSub = retryUser.attributes?.sub || retryUser.cognitoAttributes?.sub || retryUser.userSub;
            
            if (!cognitoSub) {
              logger.error('FCMService: No Cognito sub found in retry user object');
              continue; // Try again
            }
            
            logger.log(`FCMService: Got user ID (Cognito sub): ${cognitoSub}`);
            return cognitoSub;
          }
        }
      }
      
      if (!currentUser) {
        logger.error('FCMService: No authenticated user found after waiting');
        return null;
      }
      
      // Get Cognito sub (DynamoDB user ID) - this is what Lambda uses
      // Priority: attributes.sub > cognitoAttributes.sub > userSub
      // DO NOT fall back to uid as it might be Firebase UID or username
      const cognitoSub = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.userSub;
      
      if (!cognitoSub) {
        logger.error('FCMService: No Cognito sub found in user object. Available fields:', {
          hasAttributes: !!currentUser.attributes,
          hasCognitoAttributes: !!currentUser.cognitoAttributes,
          hasUserSub: !!currentUser.userSub,
          hasUid: !!currentUser.uid,
          uidValue: currentUser.uid,
          attributesKeys: currentUser.attributes ? Object.keys(currentUser.attributes) : [],
          cognitoAttributesKeys: currentUser.cognitoAttributes ? Object.keys(currentUser.cognitoAttributes) : []
        });
        return null;
      }
      
      // Validate that it's a Cognito sub format (UUID v4 format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const cognitoSubPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!cognitoSubPattern.test(cognitoSub)) {
        logger.warn(`FCMService: User ID "${cognitoSub}" doesn't match Cognito sub format. This might be a Firebase UID or username.`);
        // Still return it, but log a warning
      }
      
      logger.log(`FCMService: Got user ID (Cognito sub): ${cognitoSub}`);
      return cognitoSub;
    } catch (error) {
      logger.error('FCMService: Error getting current user:', error, error?.message, error?.stack);
      return null;
    }
  }

  /**
   * Update token's last seen timestamp in DynamoDB
   */
  async updateTokenLastSeen() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId || !this.currentToken) {
        return;
      }

      // Update token in DynamoDB
      const { updateItem, query } = await import('../aws/dynamodbClient');
      
      // Query to find the token first
      const existingTokens = await query('userTokens', {
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: '#token = :token',
        ExpressionAttributeNames: {
          '#token': 'token',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':token': this.currentToken,
        },
      });

      if (existingTokens.length > 0) {
        const existingToken = existingTokens[0];
        await updateItem(
          'userTokens',
          { userId, id: existingToken.id },
          {
            UpdateExpression: 'SET updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':updatedAt': Date.now(),
            },
          }
        );
        logger.log('FCMService: Token last seen updated in DynamoDB');
      }
    } catch (error) {
      logger.error('FCMService: Error updating token last seen:', error);
    }
  }

  /**
   * Remove FCM token from DynamoDB (mark as inactive)
   */
  async removeTokenFromFirestore(token) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        logger.warn('FCMService: No authenticated user, skipping token removal');
        return;
      }

      logger.log('FCMService: Marking token as inactive in DynamoDB:', token);

      // Find token in DynamoDB
      const { query, updateItem } = await import('../aws/dynamodbClient');
      const existingTokens = await query('userTokens', {
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: '#token = :token',
        ExpressionAttributeNames: {
          '#token': 'token',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':token': token,
        },
      });

      if (existingTokens.length > 0) {
        // Mark token as inactive instead of deleting
        await updateItem(
          'userTokens',
          { userId, id: existingTokens[0].id },
          {
            UpdateExpression: 'SET isActive = :isActive, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':isActive': false,
              ':updatedAt': Date.now(),
            },
          }
        );
        logger.log('FCMService: Token marked as inactive in DynamoDB');
      }
    } catch (error) {
      logger.error('FCMService: Error removing token:', error);
      // Don't throw - token removal failure shouldn't break logout
    }
  }

  /**
   * Remove all tokens for current user (mark as inactive in DynamoDB)
   */
  async removeAllTokens() {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return;
      }

      logger.log('FCMService: Marking all tokens as inactive for user:', userId);

      // Query all active tokens for this user
      const { query, updateItem } = await import('../aws/dynamodbClient');
      const tokens = await query('userTokens', {
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'isActive = :isActive',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':isActive': true,
        },
      });

      // Mark all as inactive
      const updatePromises = tokens.map(token => 
        updateItem(
          'userTokens',
          { userId, id: token.id },
          {
            UpdateExpression: 'SET isActive = :isActive, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
              ':isActive': false,
              ':updatedAt': Date.now(),
            },
          }
        )
      );
      await Promise.all(updatePromises);

      logger.log('FCMService: All tokens marked as inactive in DynamoDB');
    } catch (error) {
      logger.error('FCMService: Error removing all tokens:', error);
      // Don't throw - token removal failure shouldn't break logout
    }
  }

  /**
   * Unregister from push notifications
   */
  async unregister() {
    try {
      logger.log('FCMService: Unregistering from push notifications...');

      // Remove token from DynamoDB (mark as inactive)
      if (this.currentToken) {
        await this.removeTokenFromFirestore(this.currentToken);
      }

      // Platform-specific unregistration
      if (this.isNative && this.FirebaseMessaging) {
        await this.FirebaseMessaging.removeAllListeners();
        logger.log('FCMService: Native listeners removed');
        this.listenersSetup = false; // Reset listener flag
      } else if (this.messaging) {
        // Delete token from FCM
        await deleteToken(this.messaging);
        logger.log('FCMService: Web token deleted');
      }

      this.currentToken = null;
      this.isInitialized = false; // Reset initialization flag
      logger.log('FCMService: Unregistered successfully');
    } catch (error) {
      logger.error('FCMService: Error unregistering:', error);
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
    logger.log('FCMService: Topic subscription must be done server-side:', topic);
    // This should be implemented as a Cloud Function
  }

  /**
   * Unsubscribe from a topic
   * Note: Topic unsubscription must be done server-side via Cloud Functions
   */
  async unsubscribeFromTopic(topic) {
    logger.log('FCMService: Topic unsubscription must be done server-side:', topic);
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
