import { defineBoot } from '#q-app/wrappers'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { Capacitor } from '@capacitor/core'
import logger from 'src/utils/logger'

// Smart Mirror Firebase configuration (Web SDK config) - pre-group project
const smartMirrorFirebaseConfig = {
  apiKey: "AIzaSyDpYVhP_uLDecqds0VD7g409N_AMj-OMF8",
  authDomain: "pre-group.firebaseapp.com",
  projectId: "pre-group",
  storageBucket: "pre-group.firebasestorage.app",
  messagingSenderId: "871778209250",
  appId: "1:871778209250:web:79e726a4f5b5579bfc7dbb"
}

// Platform detection using URL scheme and native bridge detection (more reliable)
const detectPlatformFromUrl = () => {
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const hasIOSBridge = window.webkit?.messageHandlers !== undefined
  
  // Capacitor iOS uses capacitor:// scheme or has WebKit bridge
  if (protocol === 'capacitor:' || hasIOSBridge) {
    return { isNative: true, platform: 'ios' }
  }
  
  // Capacitor Android uses https://localhost
  if ((protocol === 'https:' || protocol === 'http:') && hostname === 'localhost') {
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

// For iOS: Always use Web SDK with unique name (native config is incomplete)
// For Web: Use smartMirrorApp
const appName = 'smartMirrorApp'

logger.log('Smart Mirror Firebase Boot: Platform detected:', platform, 'Native:', isNative, 'App name:', appName)

// Initialize Smart Mirror Firebase app (separate from PRE app)
let smartMirrorApp
let smartMirrorAuth
let smartMirrorDb

const initializeSmartMirrorApp = () => {
  const existingApps = getApps()
  const existingApp = existingApps.find(app => app.name === appName)

  if (existingApp) {
    logger.log('Smart Mirror Firebase Boot: Using existing app instance:', appName)
    smartMirrorApp = existingApp
  } else {
    logger.log('Smart Mirror Firebase Boot: Creating new app instance:', appName)
    smartMirrorApp = initializeApp(smartMirrorFirebaseConfig, appName)
  }

  // For native platforms (iOS/Android), use Web SDK Auth exclusively
  if (isNative) {
    logger.log(`Smart Mirror Firebase Boot: ${platform} - Initializing Web SDK Auth with persistence`)
    try {
      // Try to initialize auth with persistence for native platforms
      smartMirrorAuth = initializeAuth(smartMirrorApp, {
        persistence: indexedDBLocalPersistence
      })
    } catch (err) {
      // If already initialized, just get it
      logger.log('Smart Mirror Firebase Boot: Auth already initialized, using existing instance')
      logger.log('Smart Mirror Firebase Boot: Init error (expected):', err.message)
      smartMirrorAuth = getAuth(smartMirrorApp)
    }
  } else {
    // For web, use standard getAuth
    smartMirrorAuth = getAuth(smartMirrorApp)
  }
  
  smartMirrorDb = getFirestore(smartMirrorApp)
  
  logger.log('✅ Smart Mirror Firebase services initialized:', {
    platform,
    isNative,
    appName,
    projectId: smartMirrorApp.options.projectId,
    authDomain: smartMirrorApp.options.authDomain,
    authInitialized: !!smartMirrorAuth,
    dbInitialized: !!smartMirrorDb
  })
  
  return { smartMirrorApp, smartMirrorAuth, smartMirrorDb }
}

// Initialize immediately
const { smartMirrorApp: app, smartMirrorAuth: auth, smartMirrorDb: db } = initializeSmartMirrorApp()
smartMirrorApp = app
smartMirrorAuth = auth
smartMirrorDb = db

export default defineBoot(({ app }) => {
  const platformInfo = detectPlatformFromUrl()
  isNative = platformInfo.isNative
  platform = platformInfo.platform

  // Make Smart Mirror Firebase services available globally
  app.config.globalProperties.$smartMirrorAuth = smartMirrorAuth
  app.config.globalProperties.$smartMirrorDb = smartMirrorDb
  app.config.globalProperties.$smartMirrorApp = smartMirrorApp

  logger.log('Smart Mirror Firebase Boot: Complete ✅', { platform, isNative })
})

// Export Smart Mirror Firebase services for use in components
export { smartMirrorApp, smartMirrorAuth, smartMirrorDb, detectPlatformFromUrl }
