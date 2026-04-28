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

  // Track cleanup handle for the token update interval (cleared on logout)
  let tokenUpdateIntervalId = null;

  // Helper function to initialize FCM (uses fcmService's internal tracking)
  const initializeFCM = async (source) => {
    // Check fcmService's internal flag instead of local variable
    if (fcmService.isInitialized) {
      logger.log(`FCM Boot: Already initialized, skipping (source: ${source})`);
      setTimeout(() => {
        fcmService
          .syncTokenRegistration({ source: `${source}-already-initialized` })
          .catch((error) => logger.warn('FCM Boot: Background token sync failed:', error?.message || error));
      }, 0);
      return;
    }

    logger.log(`FCM Boot: Initializing FCM (source: ${source})...`);
    
    try {
      // Initialize FCM (this sets fcmService.isInitialized internally)
      const success = await fcmService.initialize();
      
      if (success) {
        logger.log(`FCM Boot: FCM initialized successfully (source: ${source})`);
        setTimeout(() => {
          fcmService
            .syncTokenRegistration({ source: `${source}-post-init` })
            .catch((error) => logger.warn('FCM Boot: Post-init token sync failed:', error?.message || error));
        }, 0);
        
        // Update token last seen periodically (every 24 hours)
        // Only set interval once; store the ID so it can be cleared on logout
        if (!fcmService.hasTokenUpdateInterval) {
          fcmService.hasTokenUpdateInterval = true;
          tokenUpdateIntervalId = setInterval(() => {
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

  // ── Early launch detection (non-blocking) ────────────────────────────────
  // Run fire-and-forget so these async checks never delay app startup.
  // They write to localStorage which the router guard reads synchronously.
  if (detectedPlatform === 'ios' || detectedPlatform === 'android') {
    Promise.resolve().then(async () => {
      // Notification cold-start: getLaunchNotification captures a tap that fired
      // before FCM listeners were registered.
      try {
        await import('@capacitor-firebase/messaging');
        const FirebaseMessaging = window.Capacitor?.Plugins?.FirebaseMessaging;
        if (FirebaseMessaging?.getLaunchNotification) {
          const launchResult = await FirebaseMessaging.getLaunchNotification();
          if (launchResult?.notification?.data) {
            const data = launchResult.notification.data;
            const pendingRoute = fcmService._resolveNotificationRoute(data);
            if (pendingRoute) {
              localStorage.setItem('pendingDeepLink', pendingRoute);
              logger.log('FCM Boot: Stored launch notification deep-link:', pendingRoute);
            }
          }
        }
      } catch (launchCheckErr) {
        logger.warn('FCM Boot: Early launch notification check failed:', launchCheckErr?.message);
      }

    });
  }

  // Listen for Cognito auth state changes — used ONLY for logout/unregister.
  // Login-side FCM init is handled directly in SignIn.vue via fcmService.registerTokenForUser(),
  // because the Hub signIn event fires before currentUser is set, making this callback
  // unreliable for the login path (it would receive null and trigger unregister instead).
  optimizedAuthService.onAuthStateChanged(async (user) => {
    if (!user) {
      logger.log('FCM Boot: User logged out, unregistering FCM...');

      if (tokenUpdateIntervalId !== null) {
        clearInterval(tokenUpdateIntervalId);
        tokenUpdateIntervalId = null;
        fcmService.hasTokenUpdateInterval = false;
      }

      try {
        await fcmService.unregister();
      } catch (error) {
        logger.error('FCM Boot: Error unregistering FCM:', error);
      }
      return;
    }

    // Ensure token registration on ANY authenticated state change
    // (covers login flows that don't pass through SignIn.vue directly).
    try {
      const cognitoSub = user?.attributes?.sub || user?.cognitoAttributes?.sub || user?.userSub;
      if (!cognitoSub) {
        logger.warn('FCM Boot: Authenticated user without Cognito sub, skipping token registration');
        return;
      }

      if (!fcmService.isInitialized) {
        await initializeFCM('auth-state-change');
      }

      await fcmService.registerTokenForUser(cognitoSub);
      // Force a non-throttled consistency sync to DynamoDB for active sessions.
      await fcmService.syncTokenRegistration({ source: 'auth-state-change', force: true, minIntervalMs: 0 });
      logger.log('FCM Boot: Auth-state token registration/sync complete');
    } catch (error) {
      logger.warn('FCM Boot: Auth-state token registration failed:', error?.message || error);
    }
  });

  // iOS-optimized: Check for authenticated user after shorter delay (cache is fast)
  // This handles cases where auth state doesn't fire on app launch
  if (detectedPlatform === 'ios') {
    logger.log('FCM Boot: iOS detected - Setting up optimized fallback user check (Cognito)...');

    setTimeout(async () => {
      try {
        const currentUser = await optimizedAuthService.getCurrentUser();

        if (currentUser) {
          const cognitoSub = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.userSub;
          logger.log('FCM Boot: iOS fallback - Found authenticated user (Cognito sub):', cognitoSub);

          if (!fcmService.isInitialized) {
            // FCM not yet initialized — run full init then register token with known userId
            setTimeout(async () => {
              await initializeFCM('ios-fallback-check-cognito');
              if (cognitoSub) {
                fcmService.registerTokenForUser(cognitoSub).catch((e) =>
                  console.error('[FCM Boot] iOS fallback registerTokenForUser failed:', e?.message)
                );
              }
            }, 500);
          } else if (cognitoSub) {
            // FCM already initialized — just ensure token is registered for this user
            fcmService.registerTokenForUser(cognitoSub).catch((e) =>
              console.error('[FCM Boot] iOS fallback registerTokenForUser failed:', e?.message)
            );
          }
        } else {
          logger.log('FCM Boot: iOS fallback - No user authenticated');
        }
      } catch (error) {
        logger.error('FCM Boot: iOS fallback check failed:', error);
      }
    }, 2000);
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

  // Re-sync token whenever app returns to foreground.
  // This makes token persistence resilient to OS token rotation and stale sessions.
  try {
    if (window.Capacitor?.Plugins?.App?.addListener) {
      window.Capacitor.Plugins.App.addListener('appStateChange', async ({ isActive }) => {
        if (!isActive) return;
        try {
          const currentUser = await optimizedAuthService.getCurrentUser();
          const cognitoSub = currentUser?.attributes?.sub || currentUser?.cognitoAttributes?.sub || currentUser?.userSub;
          if (!cognitoSub) return;
          await fcmService.registerTokenForUser(cognitoSub);
          await fcmService.syncTokenRegistration({ source: 'app-resume', force: true, minIntervalMs: 0 });
          logger.log('FCM Boot: Foreground token sync complete');
        } catch (resumeError) {
          logger.warn('FCM Boot: Foreground token sync failed:', resumeError?.message || resumeError);
        }
      });
    }
  } catch (listenerError) {
    logger.warn('FCM Boot: Could not attach appStateChange listener:', listenerError?.message || listenerError);
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

  // Check if user is already authenticated on app startup (handles session restore)
  const startupCheckDelay = detectedPlatform === 'ios' ? 1000 : 2000;
  setTimeout(async () => {
    try {
      const currentUser = await optimizedAuthService.getCurrentUser();
      if (currentUser) {
        const cognitoSub = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.userSub;
        logger.log('FCM Boot: Found authenticated user on startup, cognitoSub:', cognitoSub);

        if (!fcmService.isInitialized) {
          logger.log('FCM Boot: Initializing FCM for restored session...');
          setTimeout(async () => {
            await initializeFCM('startup-check');
            // After init, register token with known userId to guarantee the save
            if (cognitoSub) {
              fcmService.registerTokenForUser(cognitoSub).catch((e) =>
                console.error('[FCM Boot] Startup registerTokenForUser failed:', e?.message)
              );
            }
          }, 1000);
        } else if (cognitoSub) {
          // Already initialized — just make sure token is saved under the current user
          fcmService.registerTokenForUser(cognitoSub).catch((e) =>
            console.error('[FCM Boot] Startup registerTokenForUser (already init) failed:', e?.message)
          );
        }
      }
    } catch (error) {
      logger.warn('FCM Boot: Error checking for authenticated user on startup:', error);
    }
  }, startupCheckDelay);

  logger.log('FCM Boot: Complete');
});

// Export fcmService for use in components
export { fcmService };

