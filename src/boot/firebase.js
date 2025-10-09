import { defineBoot } from '#q-app/wrappers'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { Capacitor } from '@capacitor/core'
import { smartMirrorService } from '../services/smartMirrorService'

// Your web app's Firebase configuration - PRE Group project
const firebaseConfig = {
  apiKey: "AIzaSyB9kD9dw5DzEAys-kss-aSBqRGEuaT9A-0",
  authDomain: "pre-group.firebaseapp.com",
  projectId: "pre-group",
  storageBucket: "pre-group.firebasestorage.app",
  messagingSenderId: "871778209250",
  appId: "1:871778209250:web:79e726a4f5b5579bfc7dbb"
}

// Platform detection
const isNative = Capacitor.isNativePlatform()
const platform = Capacitor.getPlatform()

console.log('Firebase Boot: Platform detected:', platform, 'Native:', isNative)
console.log('Firebase Boot: Initializing Firebase app with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)
console.log('Firebase Boot: Firebase app initialized successfully ✅')

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
  
  // For native platforms, we still need Web SDK instances for compatibility
  // This ensures authentication persistence works properly
  auth = getAuth(app)
  db = getFirestore(app)
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

// Set up auth state listener to sync PRE user with Smart Mirror service
if (auth) {
  // Check if user is already logged in (from persistence)
  if (auth.currentUser) {
    console.log('Firebase Boot: PRE user already logged in (from persistence), syncing with Smart Mirror service:', auth.currentUser.uid)
    smartMirrorService.setPreUserId(auth.currentUser.uid)
  }
  
  // Set up listener for future auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Firebase Boot: PRE user logged in, syncing with Smart Mirror service:', user.uid)
      smartMirrorService.setPreUserId(user.uid)
    } else {
      console.log('Firebase Boot: PRE user logged out, clearing Smart Mirror service')
      smartMirrorService.clearPreUserId()
    }
  })
}

export default defineBoot(async ({ app }) => {
  console.log('Firebase Boot: Starting initialization...', { isNative, platform })
  
  // Skip Capacitor Firebase plugins - use Web SDK exclusively for reliability
  console.log('Firebase Boot: Using Firebase Web SDK for all platforms (no Capacitor plugins)')
  
  // Simple iOS-specific initialization
  if (platform === 'ios' && isNative) {
    try {
      console.log('Firebase Boot: iOS - Waiting for services to stabilize...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Check if user is already logged in on iOS (via Capacitor)
      if (auth.currentUser) {
        console.log('Firebase Boot: iOS - User already logged in, syncing with Smart Mirror:', auth.currentUser.uid)
        smartMirrorService.setPreUserId(auth.currentUser.uid)
      }
      
      console.log('Firebase Boot: iOS - Services ready', {
        auth: !!auth,
        db: !!db,
        storage: !!storage,
        currentUser: auth.currentUser?.uid || 'none'
      })
    } catch (iosError) {
      console.error('Firebase Boot: iOS initialization error:', iosError)
    }
  }
  
  // Android-specific initialization
  if (platform === 'android' && isNative) {
    try {
      console.log('Firebase Boot: Android - Waiting for services to stabilize...')
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Check if user is already logged in on Android
      if (auth.currentUser) {
        console.log('Firebase Boot: Android - User already logged in, syncing with Smart Mirror:', auth.currentUser.uid)
        smartMirrorService.setPreUserId(auth.currentUser.uid)
      }
      
      console.log('Firebase Boot: Android - Services ready', {
        auth: !!auth,
        db: !!db,
        storage: !!storage,
        currentUser: auth.currentUser?.uid || 'none'
      })
    } catch (androidError) {
      console.error('Firebase Boot: Android initialization error:', androidError)
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
  
  console.log('Firebase Boot: Complete - Web SDK ready')
})

// Export Firebase services for use in components
export { app, auth, db, storage, googleProvider, isNative, platform }
