import { defineBoot } from '#q-app/wrappers'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { Capacitor } from '@capacitor/core'

// Smart Mirror Firebase configuration (Web SDK config)
const smartMirrorFirebaseConfig = {
  apiKey: "AIzaSyAur1VKqvq2qAMl5qPfkpcu0nqD53VD4Lg",
  authDomain: "clixsys-4d367.firebaseapp.com",
  projectId: "clixsys-4d367",
  storageBucket: "clixsys-4d367.firebasestorage.app",
  messagingSenderId: "775251400128",
  appId: "1:775251400128:web:2fe2decdd9c49ef39a6425",
  measurementId: "G-XZX0B7TMSR"
}

// Platform detection
const isNative = Capacitor.isNativePlatform()
const platform = Capacitor.getPlatform()

// For iOS: Always use Web SDK with unique name (native config is incomplete)
// For Web: Use smartMirrorApp
const appName = 'smartMirrorApp'

console.log('Smart Mirror Firebase Boot: Platform detected:', platform, 'Native:', isNative, 'App name:', appName)

// Initialize Smart Mirror Firebase app (separate from PRE app)
let smartMirrorApp
let smartMirrorAuth
let smartMirrorDb

const initializeSmartMirrorApp = () => {
  const existingApps = getApps()
  const existingApp = existingApps.find(app => app.name === appName)

  if (existingApp) {
    console.log('Smart Mirror Firebase Boot: Using existing app instance:', appName)
    smartMirrorApp = existingApp
  } else {
    console.log('Smart Mirror Firebase Boot: Creating new app instance:', appName)
    smartMirrorApp = initializeApp(smartMirrorFirebaseConfig, appName)
  }

  // For native platforms (iOS/Android), use Web SDK Auth exclusively
  if (isNative) {
    console.log(`Smart Mirror Firebase Boot: ${platform} - Initializing Web SDK Auth with persistence`)
    try {
      // Try to initialize auth with persistence for native platforms
      smartMirrorAuth = initializeAuth(smartMirrorApp, {
        persistence: indexedDBLocalPersistence
      })
    } catch (err) {
      // If already initialized, just get it
      console.log('Smart Mirror Firebase Boot: Auth already initialized, using existing instance')
      console.log('Smart Mirror Firebase Boot: Init error (expected):', err.message)
      smartMirrorAuth = getAuth(smartMirrorApp)
    }
  } else {
    // For web, use standard getAuth
    smartMirrorAuth = getAuth(smartMirrorApp)
  }
  
  smartMirrorDb = getFirestore(smartMirrorApp)
  
  console.log('✅ Smart Mirror Firebase services initialized:', {
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

export default defineBoot(async ({ app }) => {
  // For native platforms (iOS/Android), wait briefly for services to stabilize
  if (isNative) {
    console.log(`Smart Mirror Firebase Boot: ${platform} detected - stabilizing services...`)
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`Smart Mirror Firebase Boot: ${platform} services stable ✅`)
  }
  
  // Make Smart Mirror Firebase services available globally
  app.config.globalProperties.$smartMirrorAuth = smartMirrorAuth
  app.config.globalProperties.$smartMirrorDb = smartMirrorDb
  app.config.globalProperties.$smartMirrorApp = smartMirrorApp
  
  console.log('Smart Mirror Firebase Boot: Global properties set ✅')
  console.log('Smart Mirror Firebase Boot: Ready for authentication requests')
})

// Export Smart Mirror Firebase services for use in components
export { smartMirrorApp, smartMirrorAuth, smartMirrorDb }
