import { defineBoot } from '#q-app/wrappers'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpYVhP_uLDecqds0VD7g409N_AMj-OMF8",
  authDomain: "pre-group.firebaseapp.com",
  projectId: "pre-group",
  storageBucket: "pre-group.firebasestorage.app",
  messagingSenderId: "871778209250",
  appId: "1:871778209250:web:79e726a4f5b5579bfc7dbb"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export default defineBoot(({ app }) => {
  // Make Firebase services available globally
  app.config.globalProperties.$firebase = app
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$db = db
  app.config.globalProperties.$storage = storage
})

// Export Firebase services for use in components
export { app, auth, db, storage }
