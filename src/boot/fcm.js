/**
 * FCM Boot File
 * Initializes Firebase Cloud Messaging when the app starts
 * Only initializes if user is authenticated
 */

import { defineBoot } from '#q-app/wrappers';
import { fcmService } from 'src/services/fcmService';
import optimizedAuthService from 'src/services/optimizedAuthService';
import logger from 'src/utils/logger';

export default defineBoot(async ({ app, router }) => {
  logger.log('FCM Boot: Starting...');

  // Make FCM service available globally
  app.config.globalProperties.$fcm = fcmService;

  // Helper function to initialize FCM (uses fcmService's internal tracking)
  const initializeFCM = async (source) => {
    // Check fcmService's internal flag instead of local variable
    if (fcmService.isInitialized) {
      logger.log(`FCM Boot: Already initialized, skipping (source: ${source})`);
      return;
    }

    logger.log(`FCM Boot: Initializing FCM (source: ${source})...`);
    
    try {
      // Initialize FCM (this sets fcmService.isInitialized internally)
      const success = await fcmService.initialize();
      
      if (success) {
        logger.log(`FCM Boot: FCM initialized successfully (source: ${source})`);
        
        // Update token last seen periodically (every 24 hours)
        // Only set interval once
        if (!fcmService.hasTokenUpdateInterval) {
          fcmService.hasTokenUpdateInterval = true;
          setInterval(() => {
            fcmService.updateTokenLastSeen();
          }, 24 * 60 * 60 * 1000);
        }
      } else {
        logger.warn(`FCM Boot: FCM initialization failed (source: ${source})`);
      }
    } catch (error) {
      logger.error(`FCM Boot: Error initializing FCM (source: ${source}):`, error);
    }
  };

  // Detect platform early (before any platform-specific checks)
  const detectPlatform = () => {
    try {
      const protocol = window.location.protocol;
      const hasIOSBridge = window.webkit?.messageHandlers !== undefined;
      if (protocol === 'capacitor:' || hasIOSBridge) {
        return 'ios';
      }
      // Try Capacitor API
      if (window.Capacitor) {
        const platform = window.Capacitor.getPlatform();
        if (platform === 'android' || platform === 'ios') {
          return platform;
        }
      }
    } catch (e) {
      logger.warn('FCM Boot: Error detecting platform:', e);
    }
    return 'web';
  };

  const detectedPlatform = detectPlatform();
  logger.log('FCM Boot: Detected platform:', detectedPlatform);

  // Listen for Cognito auth state changes (AWS-only, no Firebase Auth)
  optimizedAuthService.onAuthStateChanged(async (user) => {
    if (user) {
      logger.log('FCM Boot: Cognito auth state changed - user authenticated');
      
      // iOS-optimized: Shorter delay since auth state is cached
      const delay = detectedPlatform === 'ios' ? 1500 : 1000;
      
      setTimeout(() => {
        initializeFCM('optimizedAuthService.onAuthStateChanged');
      }, delay);
    } else {
      logger.log('FCM Boot: User logged out, unregistering FCM...');
      
      try {
        await fcmService.unregister();
      } catch (error) {
        logger.error('FCM Boot: Error unregistering FCM:', error);
      }
    }
  });

  // iOS-optimized: Check for authenticated user after shorter delay (cache is fast)
  // This handles cases where auth state doesn't fire on app launch
  if (detectedPlatform === 'ios') {
    logger.log('FCM Boot: iOS detected - Setting up optimized fallback user check (Cognito)...');
    
    setTimeout(async () => {
      try {
        const currentUser = await optimizedAuthService.getCurrentUser();
        
        if (currentUser && !fcmService.isInitialized) {
          logger.log('FCM Boot: iOS fallback - Found authenticated user (Cognito), initializing FCM...');
          const cognitoSub = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.userSub;
          logger.log('FCM Boot: User ID (Cognito sub):', cognitoSub);
          
          // iOS-optimized: Shorter delay since cache is fast
          setTimeout(() => {
            initializeFCM('ios-fallback-check-cognito');
          }, 500); // Reduced from 1000ms
        } else if (!currentUser) {
          logger.log('FCM Boot: iOS fallback - No user authenticated');
        } else if (fcmService.isInitialized) {
          logger.log('FCM Boot: iOS fallback - FCM already initialized, skipping');
        }
      } catch (error) {
        logger.error('FCM Boot: iOS fallback check failed:', error);
      }
    }, 2000); // iOS-optimized: Reduced from 5000ms to 2000ms (cache is fast)
  }

  // Listen for navigation messages from service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        logger.log('FCM Boot: Received navigation message from service worker:', event.data);
        
        // Wait for authentication state to be ready before navigating
        await waitForAuthenticationState();
        
        // Navigate to the URL
        router.push(event.data.url);
      }
    });
  }

  // Helper function to wait for authentication state to be ready
  const waitForAuthenticationState = async () => {
    const maxWaitTime = 5000; // 5 seconds max wait
    const checkInterval = 100; // Check every 100ms
    let elapsed = 0;
    
    logger.log('FCM Boot: Waiting for authentication state...');
    
    while (elapsed < maxWaitTime) {
      try {
        const currentUser = await optimizedAuthService.getCurrentUser();
        if (currentUser) {
          logger.log('FCM Boot: Authentication state ready, user:', currentUser.uid);
          return true;
        }
      } catch (error) {
        logger.warn('FCM Boot: Error checking auth state:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }
    
    logger.warn('FCM Boot: Authentication state not ready after timeout, proceeding anyway');
    return false;
  };

  // iOS-optimized: Check if user is already authenticated via Cognito (on app startup)
  // Shorter delay for iOS since localStorage cache is fast
  const startupCheckDelay = detectedPlatform === 'ios' ? 1000 : 2000;
  setTimeout(async () => {
    try {
      const currentUser = await optimizedAuthService.getCurrentUser();
      if (currentUser && !fcmService.isInitialized) {
        logger.log('FCM Boot: Found authenticated user on startup, initializing FCM...');
        const delay = detectedPlatform === 'ios' ? 1000 : 1000; // iOS-optimized: Same delay for both
        setTimeout(() => {
          initializeFCM('startup-check');
        }, delay);
      }
    } catch (error) {
      logger.warn('FCM Boot: Error checking for authenticated user on startup:', error);
    }
  }, startupCheckDelay);

  logger.log('FCM Boot: Complete');
});

// Export fcmService for use in components
export { fcmService };

