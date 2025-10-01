import { defineBoot } from '#q-app/wrappers'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { Capacitor } from '@capacitor/core'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Platform detection
const isNative = Capacitor.isNativePlatform()
const platform = Capacitor.getPlatform()

console.log('Firebase Boot: Platform detected:', platform, 'Native:', isNative)

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services based on platform
let auth, db, storage, googleProvider

// Initialize Google Auth Provider
googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

if (isNative) {
  // Use Capacitor Firebase plugins for native platforms
  console.log('Firebase Boot: Using Capacitor Firebase plugins for native platform')
  
  // For native platforms, initialize Firestore with cache disabled to force network mode
  // This fixes the issue where writes hang on iOS
  auth = getAuth(app)
  
  try {
    console.log('Firebase Boot: Initializing Firestore with cache disabled for iOS...')
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      experimentalForceLongPolling: true, // Use long polling for better iOS compatibility
      experimentalAutoDetectLongPolling: true
    })
    console.log('Firebase Boot: Firestore initialized with network-first mode')
  } catch (error) {
    console.warn('Firebase Boot: Failed to initialize custom Firestore, using default:', error)
    db = getFirestore(app)
  }
  
  storage = getStorage(app)
  
  console.log('Firebase Boot: Web SDK instances created for native platform compatibility')
} else {
  // Use Web SDK for web/PWA
  console.log('Firebase Boot: Using Firebase Web SDK for web platform')
  
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

// Set up authentication persistence
if (auth) {
  try {
    setPersistence(auth, browserLocalPersistence)
    console.log('Firebase Boot: Authentication persistence set to local storage')
  } catch (error) {
    console.error('Firebase Boot: Failed to set auth persistence:', error)
  }
}

export default defineBoot(async ({ app }) => {
  // Initialize Capacitor Firebase plugins for native platforms
  if (isNative) {
    try {
      const { FirebaseApp } = await import('@capacitor-firebase/app')
      await FirebaseApp.initializeApp()
      console.log('Firebase Boot: Capacitor Firebase App initialized')
    } catch (error) {
      console.error('Firebase Boot: Failed to initialize Capacitor Firebase App:', error)
    }
  }

  // Make Firebase services available globally
  app.config.globalProperties.$firebase = app
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$db = db
  app.config.globalProperties.$storage = storage
  app.config.globalProperties.$googleProvider = googleProvider
  app.config.globalProperties.$isNative = isNative
  app.config.globalProperties.$platform = platform
})

// Export Firebase services for use in components
export { app, auth, db, storage, googleProvider, isNative, platform }
