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
  const href = window.location.href
  
  console.log('🔍 Platform Detection Debug:', {
    protocol,
    hostname,
    href,
    hasCapacitor: window.Capacitor !== undefined,
    hasWebkit: window.webkit !== undefined,
    hasNativeBridge: window.webkit?.messageHandlers !== undefined
  })
  
  // Check for iOS native bridge (most reliable)
  const hasIOSBridge = window.webkit?.messageHandlers !== undefined
  
  // Capacitor iOS uses capacitor:// scheme
  if (protocol === 'capacitor:' || hasIOSBridge) {
    console.log('✅ iOS detected via', protocol === 'capacitor:' ? 'URL scheme' : 'WebKit bridge')
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

console.log('Firebase Boot: Platform detected:', platform, 'Native:', isNative)
console.log('Firebase Boot: Initializing Firebase app with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
})

// Initialize Firebase
const app = initializeApp(firebaseConfig)
console.log('Firebase Boot: Firebase app initialized successfully ✅')

// Initialize Firebase services - same for all platforms
console.log('Firebase Boot: Initializing Firebase services...')

// Initialize auth with persistence - handle already initialized case
let auth
try {
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence
  })
  console.log('Firebase Boot: Auth initialized with persistence')
} catch (initError) {
  // If already initialized, just get the existing instance
  console.log('Firebase Boot: Auth already initialized, using existing instance:', initError.message)
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

console.log('Firebase Boot: Services initialized successfully')

// Set up auth state listener to sync PRE user with Smart Mirror service
// Check if user is already logged in (from persistence)
if (auth.currentUser) {
  console.log('Firebase Boot: PRE user already logged in (from persistence), syncing with Smart Mirror service:', auth.currentUser.uid)
  smartMirrorService.setPreUserId(auth.currentUser.uid)
}

// Set up listener for future auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('🔐 Firebase Boot: PRE user logged in:', user.uid)
    console.log('🔐 User email:', user.email)
    console.log('🔐 Auth instance:', auth ? 'Valid' : 'Invalid')
    console.log('🔐 Current user accessible:', auth.currentUser ? 'Yes' : 'No')
    smartMirrorService.setPreUserId(user.uid)
  } else {
    console.log('Firebase Boot: PRE user logged out, clearing Smart Mirror service')
    smartMirrorService.clearPreUserId()
  }
})

export default defineBoot(async ({ app }) => {
  // Verify auth is properly initialized
  if (!auth) {
    console.error('🚨 CRITICAL: Auth is not initialized!')
    throw new Error('Firebase Auth failed to initialize')
  }
  
  console.log('🔐 Firebase Boot: Auth verification:', {
    authExists: !!auth,
    currentUser: auth.currentUser?.uid || 'none',
    authApp: auth.app?.name
  })
  
  // Make Firebase services available globally
  app.config.globalProperties.$firebase = app
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$db = db
  app.config.globalProperties.$storage = storage
  app.config.globalProperties.$functions = functions
  app.config.globalProperties.$googleProvider = googleProvider
  app.config.globalProperties.$isNative = isNative
  app.config.globalProperties.$platform = platform
  
  console.log('Firebase Boot: Complete ✅')
})

// Export Firebase services and platform info for use in components
// Note: isNative and platform may be updated during boot, use detectPlatformFromUrl() for current values
export { app, auth, db, storage, functions, googleProvider, isNative, platform, detectPlatformFromUrl }
