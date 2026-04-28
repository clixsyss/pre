import { defineBoot } from '#q-app/wrappers'
import { initializeApp } from 'firebase/app'
import { initializeAuth, getAuth, browserLocalPersistence, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'
import { Capacitor } from '@capacitor/core'
import { smartMirrorService } from '../services/smartMirrorService'

// Your web app's Firebase configuration - PRE Group project
// Uses environment variables with fallback to hardcoded values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpYVhP_uLDecqds0VD7g409N_AMj-OMF8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pre-group.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pre-group",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pre-group.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "871778209250",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:871778209250:web:79e726a4f5b5579bfc7dbb"
}

// Platform detection using URL scheme and native bridge detection
const detectPlatformFromUrl = () => {
  const protocol = window.location.protocol
  const hostname = window.location.hostname

  // Check for iOS native bridge (most reliable)
  const hasIOSBridge = window.webkit?.messageHandlers !== undefined

  // Capacitor iOS uses capacitor:// scheme
  if (protocol === 'capacitor:' || hasIOSBridge) {
    return { isNative: true, platform: 'ios' }
  }
  
  // Capacitor Android uses https://localhost
  if ((protocol === 'https:' || protocol === 'http:') && hostname === 'localhost') {
    // Could be Android or local dev server
    try {
      const cap = Capacitor.getPlatform()
      if (cap === 'android') {
        return { isNative: true, platform: 'android' }
      }
    } catch {
      // Capacitor not available
    }
  }
  
  // Fallback to Capacitor API
  try {
    return {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform()
    }
  } catch {
    return { isNative: false, platform: 'web' }
  }
}

// Get platform info from URL (immediately accurate)
let { isNative, platform } = detectPlatformFromUrl()

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services - same for all platforms
let auth
try {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  })
} catch {
  auth = getAuth(app)
}

const db = getFirestore(app)
const storage = getStorage(app)
const functions = getFunctions(app)

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Sync PRE user with Smart Mirror service on auth state changes
if (auth.currentUser) {
  smartMirrorService.setPreUserId(auth.currentUser.uid)
}

export const unsubscribeFirebaseAuth = onAuthStateChanged(auth, (user) => {
  if (user) {
    smartMirrorService.setPreUserId(user.uid)
  } else {
    void smartMirrorService.clearPreUserId().catch((err) => {
      console.warn('Firebase Boot: clearPreUserId failed (non-fatal):', err?.message || err)
    })
  }
})

export default defineBoot(async ({ app }) => {
  if (!auth) throw new Error('Firebase Auth failed to initialize')

  // Make Firebase services available globally
  app.config.globalProperties.$firebase = app
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$db = db
  app.config.globalProperties.$storage = storage
  app.config.globalProperties.$functions = functions
  app.config.globalProperties.$googleProvider = googleProvider
  app.config.globalProperties.$isNative = isNative
  app.config.globalProperties.$platform = platform

  app.config.errorHandler = (err, instance, info) => {
    console.error('[RuntimeError][vue]', {
      info,
      message: err?.message || String(err),
      stack: err?.stack,
      route: window?.location?.href,
      component: instance?.type?.name || instance?.type?.__name || 'unknown',
    })
  }
})

// Export Firebase services and platform info for use in components
// Note: isNative and platform may be updated during boot, use detectPlatformFromUrl() for current values
export { app, auth, db, storage, functions, googleProvider, isNative, platform, detectPlatformFromUrl }
