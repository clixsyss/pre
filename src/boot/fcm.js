/**
 * FCM Boot File
 * Initializes Firebase Cloud Messaging when the app starts
 * Only initializes if user is authenticated
 */

import { defineBoot } from '#q-app/wrappers';
import { fcmService } from 'src/services/fcmService';
import { auth } from 'src/boot/firebase';

export default defineBoot(async ({ app, router }) => {
  console.log('FCM Boot: Starting...');

  // Make FCM service available globally
  app.config.globalProperties.$fcm = fcmService;

  // Check if user is already authenticated (from persistence)
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log('FCM Boot: User already authenticated, initializing FCM immediately...');
    
    try {
      // Small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize FCM
      const success = await fcmService.initialize();
      
      if (success) {
        console.log('FCM Boot: FCM initialized successfully for existing user');
      } else {
        console.warn('FCM Boot: FCM initialization failed for existing user');
      }
    } catch (error) {
      console.error('FCM Boot: Error initializing FCM for existing user:', error);
    }
  }

  // Initialize FCM when user logs in (for future auth state changes)
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('FCM Boot: Auth state changed - user authenticated, initializing FCM...');
      
      try {
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Initialize FCM
        const success = await fcmService.initialize();
        
        if (success) {
          console.log('FCM Boot: FCM initialized successfully');
          
          // Update token last seen periodically (every 24 hours)
          setInterval(() => {
            fcmService.updateTokenLastSeen();
          }, 24 * 60 * 60 * 1000);
        } else {
          console.warn('FCM Boot: FCM initialization failed');
        }
      } catch (error) {
        console.error('FCM Boot: Error initializing FCM:', error);
      }
    } else {
      console.log('FCM Boot: User logged out, unregistering FCM...');
      
      try {
        // Unregister FCM when user logs out
        await fcmService.unregister();
      } catch (error) {
        console.error('FCM Boot: Error unregistering FCM:', error);
      }
    }
  });

  // Listen for navigation messages from service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        console.log('FCM Boot: Received navigation message from service worker:', event.data);
        router.push(event.data.url);
      }
    });
  }

  console.log('FCM Boot: Complete');
});

// Export fcmService for use in components
export { fcmService };

