import { defineBoot } from '#q-app/wrappers'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ,
  appId: import.meta.env.VITE_FIREBASE_APP_ID 
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default defineBoot(({ app }) => {
  // Make Firebase services available globally
  app.config.globalProperties.$firebase = app
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$db = db
  app.config.globalProperties.$storage = storage
  app.config.globalProperties.$googleProvider = googleProvider
})

// Export Firebase services for use in components
export { app, auth, db, storage, googleProvider }
