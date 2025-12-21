// Script to create an admin user
// Run this script to add yourself as an admin in Firestore

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

// Your Firebase config (same as in src/boot/firebase.js)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'YOUR_API_KEY_HERE',
  authDomain: 'pre-group.firebaseapp.com',
  projectId: 'pre-group',
  storageBucket: 'pre-group.firebasestorage.app',
  messagingSenderId: '871778209250',
  appId: '1:871778209250:web:79e726a4f5b5579bfc7dbb',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
// Function to create admin user
async function createAdminUser(email, password) {
  try {
    // Sign in with your credentials
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log('Signed in as:', user.email)
    console.log('User ID:', user.uid)

    // Create admin document
    const adminRef = doc(db, 'admins', user.uid)
    await setDoc(adminRef, {
      email: user.email,
      role: 'admin',
      createdAt: new Date(),
      createdBy: user.uid,
    })

    console.log('✅ Admin user created successfully!')
    console.log('You can now access the dashboard with admin privileges.')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    if (error.code === 'auth/user-not-found') {
      console.log('User not found. Make sure you have registered an account first.')
    } else if (error.code === 'auth/wrong-password') {
      console.log('Wrong password. Please check your credentials.')
    }
  }
}

// Usage instructions
console.log('🔐 Admin User Creation Script')
console.log('==============================')
console.log('')
console.log('To create an admin user:')
console.log('1. Make sure you have registered an account first')
console.log('2. Update the email and password below')
console.log('3. Run this script')
console.log('')

// Update these values with your actual credentials
const ADMIN_EMAIL = 'your-email@example.com' // Replace with your email
const ADMIN_PASSWORD = 'your-password' // Replace with your password

console.log('Current settings:')
console.log('Email:', ADMIN_EMAIL)
console.log('Password:', ADMIN_PASSWORD)
console.log('')

// Uncomment the line below to run the script
// createAdminUser(ADMIN_EMAIL, ADMIN_PASSWORD);

console.log('To run the script:')
console.log('1. Update the email and password above')
console.log('2. Uncomment the createAdminUser() call')
console.log('3. Run: node create-admin.js')
