/**
 * FCM Boot File
 * Initializes Firebase Cloud Messaging when the app starts
 * Only initializes if user is authenticated
 */

import { defineBoot } from '#q-app/wrappers';
import { fcmService } from 'src/services/fcmService';
import optimizedAuthService from 'src/services/optimizedAuthService';

export default defineBoot(async ({ app, router }) => {
  console.log('FCM Boot: Starting...');

  // Make FCM service available globally
  app.config.globalProperties.$fcm = fcmService;

  // Helper function to initialize FCM (uses fcmService's internal tracking)
  const initializeFCM = async (source) => {
    // Check fcmService's internal flag instead of local variable
    if (fcmService.isInitialized) {
      console.log(`FCM Boot: Already initialized, skipping (source: ${source})`);
      return;
    }

    console.log(`FCM Boot: Initializing FCM (source: ${source})...`);
    
    try {
      // Initialize FCM (this sets fcmService.isInitialized internally)
      const success = await fcmService.initialize();
      
      if (success) {
        console.log(`FCM Boot: FCM initialized successfully (source: ${source})`);
        
        // Update token last seen periodically (every 24 hours)
        // Only set interval once
        if (!fcmService.hasTokenUpdateInterval) {
          fcmService.hasTokenUpdateInterval = true;
          setInterval(() => {
            fcmService.updateTokenLastSeen();
          }, 24 * 60 * 60 * 1000);
        }
      } else {
        console.warn(`FCM Boot: FCM initialization failed (source: ${source})`);
      }
    } catch (error) {
      console.error(`FCM Boot: Error initializing FCM (source: ${source}):`, error);
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
      console.warn('FCM Boot: Error detecting platform:', e);
    }
    return 'web';
  };

  const detectedPlatform = detectPlatform();
  console.log('FCM Boot: Detected platform:', detectedPlatform);

  // Listen for Cognito auth state changes (AWS-only, no Firebase Auth)
  optimizedAuthService.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('FCM Boot: Cognito auth state changed - user authenticated');
      
      // Delay to ensure everything is ready (longer for iOS)
      const delay = detectedPlatform === 'ios' ? 3000 : 1000;
      
      setTimeout(() => {
        initializeFCM('optimizedAuthService.onAuthStateChanged');
      }, delay);
    } else {
      console.log('FCM Boot: User logged out, unregistering FCM...');
      
      try {
        await fcmService.unregister();
      } catch (error) {
        console.error('FCM Boot: Error unregistering FCM:', error);
      }
    }
  });

  // iOS-specific: Check for authenticated user after a delay using Cognito
  // This handles cases where auth state doesn't fire on app launch
  if (detectedPlatform === 'ios') {
    console.log('FCM Boot: iOS detected - Setting up fallback user check (Cognito)...');
    
    setTimeout(async () => {
      try {
        const currentUser = await optimizedAuthService.getCurrentUser();
        
        if (currentUser && !fcmService.isInitialized) {
          console.log('FCM Boot: iOS fallback - Found authenticated user (Cognito), initializing FCM...');
          const cognitoSub = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.userSub;
          console.log('FCM Boot: User ID (Cognito sub):', cognitoSub);
          
          // Wait a bit more to ensure auth context is fully ready
          setTimeout(() => {
            initializeFCM('ios-fallback-check-cognito');
          }, 1000);
        } else if (!currentUser) {
          console.log('FCM Boot: iOS fallback - No user authenticated');
        } else if (fcmService.isInitialized) {
          console.log('FCM Boot: iOS fallback - FCM already initialized, skipping');
        }
      } catch (error) {
        console.error('FCM Boot: iOS fallback check failed:', error);
      }
    }, 5000); // Check after 5 seconds to allow auth to restore
  }

  // Listen for navigation messages from service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        console.log('FCM Boot: Received navigation message from service worker:', event.data);
        
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
    
    console.log('FCM Boot: Waiting for authentication state...');
    
    while (elapsed < maxWaitTime) {
      try {
        const currentUser = await optimizedAuthService.getCurrentUser();
        if (currentUser) {
          console.log('FCM Boot: Authentication state ready, user:', currentUser.uid);
          return true;
        }
      } catch (error) {
        console.warn('FCM Boot: Error checking auth state:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }
    
    console.warn('FCM Boot: Authentication state not ready after timeout, proceeding anyway');
    return false;
  };

  // Check if user is already authenticated via Cognito (on app startup)
  setTimeout(async () => {
    try {
      const currentUser = await optimizedAuthService.getCurrentUser();
      if (currentUser && !fcmService.isInitialized) {
        console.log('FCM Boot: Found authenticated user on startup, initializing FCM...');
        const delay = detectedPlatform === 'ios' ? 3000 : 1000;
        setTimeout(() => {
          initializeFCM('startup-check');
        }, delay);
      }
    } catch (error) {
      console.warn('FCM Boot: Error checking for authenticated user on startup:', error);
    }
  }, 2000); // Check after 2 seconds to allow auth to restore

  console.log('FCM Boot: Complete');
});

// Export fcmService for use in components
export { fcmService };

