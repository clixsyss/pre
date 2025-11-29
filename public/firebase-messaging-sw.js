/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications for web platform
 * 
 * This file must be in the public directory and served at the root
 * It will be registered automatically when the app initializes FCM
 */

// Import Firebase scripts (use the same version as in your package.json)
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Use the same config as in your boot/firebase.js
firebase.initializeApp({
  apiKey: "AIzaSyB9kD9dw5DzEAys-kss-aSBqRGEuaT9A-0",
  authDomain: "pre-group.firebaseapp.com",
  projectId: "pre-group",
  storageBucket: "pre-group.firebasestorage.app",
  messagingSenderId: "871778209250",
  appId: "1:871778209250:web:79e726a4f5b5579bfc7dbb"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification data
  const notificationData = payload.notification || {};
  const customData = payload.data || {};

  // Determine language based on browser settings or use English as default
  const userLang = navigator.language.startsWith('ar') ? 'ar' : 'en';

  // Use bilingual content if available
  const notificationTitle = userLang === 'ar' && customData.title_ar 
    ? customData.title_ar 
    : (notificationData.title || customData.title_en || 'New Notification');

  const notificationBody = userLang === 'ar' && customData.body_ar 
    ? customData.body_ar 
    : (notificationData.body || customData.body_en || 'You have a new notification');

  const notificationOptions = {
    body: notificationBody,
    icon: '/icons/icon-192x192.png', // Your app icon
    badge: '/icons/icon-96x96.png',
    tag: customData.notificationId || 'default',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      ...customData,
      url: customData.click_action || '/',
      dateOfArrival: Date.now()
    }
  };

  // Add image if provided
  if (notificationData.image || customData.image) {
    notificationOptions.image = notificationData.image || customData.image;
  }

  // Add actions if this is an actionable notification
  if (customData.type === 'booking' || customData.type === 'order') {
    notificationOptions.actions = [
      {
        action: 'view',
        title: userLang === 'ar' ? 'عرض' : 'View'
      },
      {
        action: 'dismiss',
        title: userLang === 'ar' ? 'إغلاق' : 'Dismiss'
      }
    ];
  }

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  // Get the notification data
  const data = event.notification.data || {};
  const action = event.action;

  // Don't do anything if user clicked "dismiss"
  if (action === 'dismiss') {
    return;
  }

  // Determine the URL to open based on notification type
  let urlToOpen = '/';

  if (data.url) {
    urlToOpen = data.url;
  } else if (data.click_action) {
    urlToOpen = data.click_action;
  } else {
    // Route based on notification type
    switch (data.type) {
      case 'booking':
        urlToOpen = '/bookings';
        break;
      case 'order':
        urlToOpen = '/orders';
        break;
      case 'news':
        urlToOpen = data.newsId ? `/news/${data.newsId}` : '/news';
        break;
      case 'announcement':
        urlToOpen = '/notifications';
        break;
      case 'promo':
      case 'promotion':
        urlToOpen = '/promotions';
        break;
      default:
        urlToOpen = '/notifications';
    }
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.indexOf(self.registration.scope) === 0 && 'focus' in client) {
          // Focus the existing window and navigate to the URL
          return client.focus().then((focusedClient) => {
            if ('navigate' in focusedClient) {
              // Add a small delay to allow the app to initialize
              setTimeout(() => {
                return focusedClient.navigate(urlToOpen);
              }, 100);
            }
            // If navigate is not supported, post a message with delay
            setTimeout(() => {
              focusedClient.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: urlToOpen,
                data: data
              });
            }, 100);
          });
        }
      }

      // If no window is open, open a new one with a small delay
      if (clients.openWindow) {
        setTimeout(() => {
          return clients.openWindow(urlToOpen);
        }, 100);
      }
    })
  );
});

// Optional: Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installed');
  self.skipWaiting();
});

// Optional: Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activated');
  event.waitUntil(clients.claim());
});

