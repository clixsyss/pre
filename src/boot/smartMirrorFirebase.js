import { defineBoot } from '#q-app/wrappers'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Smart Mirror Firebase configuration
const smartMirrorFirebaseConfig = {
  apiKey: "AIzaSyAur1VKqvq2qAMl5qPfkpcu0nqD53VD4Lg",
  authDomain: "clixsys-4d367.firebaseapp.com",
  projectId: "clixsys-4d367",
  storageBucket: "clixsys-4d367.firebasestorage.app",
  messagingSenderId: "775251400128",
  appId: "1:775251400128:web:2fe2decdd9c49ef39a6425",
  measurementId: "G-XZX0B7TMSR"
}

// Initialize Smart Mirror Firebase app (separate from PRE app)
let smartMirrorApp
const existingApps = getApps()
const existingApp = existingApps.find(app => app.name === 'smartMirrorApp')

if (existingApp) {
  smartMirrorApp = existingApp
} else {
  smartMirrorApp = initializeApp(smartMirrorFirebaseConfig, 'smartMirrorApp')
}

// Initialize Smart Mirror Firebase services
const smartMirrorAuth = getAuth(smartMirrorApp)
const smartMirrorDb = getFirestore(smartMirrorApp)

export default defineBoot(({ app }) => {
  // Make Smart Mirror Firebase services available globally
  app.config.globalProperties.$smartMirrorAuth = smartMirrorAuth
  app.config.globalProperties.$smartMirrorDb = smartMirrorDb
})

// Export Smart Mirror Firebase services for use in components
export { smartMirrorApp, smartMirrorAuth, smartMirrorDb }
