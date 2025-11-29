// Admin User Blocking Utility Script
// This script helps admins block/unblock users from generating gate passes
// Run with: node admin-user-blocking.js

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import readline from 'readline'

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Helper function to prompt user input
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      // Basic input sanitization
      const sanitized = answer.trim().replace(/[<>"'&]/g, '')
      resolve(sanitized)
    })
  })
}

// Input validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format')
  }
  return email.toLowerCase().trim()
}

const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID')
  }
  // Firebase UIDs are typically 28 characters and alphanumeric
  if (!/^[a-zA-Z0-9]{28}$/.test(userId)) {
    throw new Error('Invalid user ID format')
  }
  return userId
}

const validateReason = (reason) => {
  if (!reason || reason.length < 3) {
    throw new Error('Reason must be at least 3 characters long')
  }
  if (reason.length > 500) {
    throw new Error('Reason must be less than 500 characters')
  }
  return reason.trim()
}

// Helper function to close readline
const closeReadline = () => {
  rl.close()
}

// Function to sign in as admin
async function signInAsAdmin() {
  try {
    const email = validateEmail(await askQuestion('Enter admin email: '))
    const password = await askQuestion('Enter admin password: ')

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log('✅ Signed in as admin')
    return user.uid
  } catch (error) {
    console.error('❌ Error signing in:', error.message)
    throw error
  }
}

// Function to find user by email
async function findUserByEmail(email) {
  try {
    validateEmail(email) // Validate but don't store
    console.log('🔍 Searching for user with email')

    // Note: In a real implementation, you'd query the users collection
    // For now, we'll ask for the user ID directly
    const userId = validateUserId(
      await askQuestion('Enter user ID (or email if you know the document ID): '),
    )
    return userId
  } catch (error) {
    console.error('❌ Error finding user:', error.message)
    throw error
  }
}

// Function to block user from gate passes
async function blockUserFromGatePasses(adminId) {
  try {
    const userEmail = validateEmail(await askQuestion('Enter user email to block: '))
    const userId = await findUserByEmail(userEmail)
    const reason = validateReason(await askQuestion('Enter reason for blocking: '))
    const blockedUntilInput = await askQuestion(
      'Enter block end date (YYYY-MM-DD) or press Enter for permanent: ',
    )

    let blockedUntil = null
    if (blockedUntilInput) {
      const date = new Date(blockedUntilInput)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD')
      }
      if (date <= new Date()) {
        throw new Error('Block end date must be in the future')
      }
      blockedUntil = date
    }

    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      console.log('❌ User not found')
      return
    }

    const updateData = {
      blockedFromGatePasses: true,
      blockedFromGatePassesAt: serverTimestamp(),
      blockedFromGatePassesBy: adminId,
      blockedFromGatePassesReason: reason,
      updatedAt: serverTimestamp(),
    }

    if (blockedUntil.trim()) {
      updateData.blockedFromGatePassesUntil = new Date(blockedUntil)
    }

    await updateDoc(userDocRef, updateData)
    console.log('✅ User blocked from gate passes successfully')
  } catch (error) {
    console.error('❌ Error blocking user:', error.message)
  }
}

// Function to unblock user from gate passes
async function unblockUserFromGatePasses(adminId) {
  try {
    const userEmail = validateEmail(await askQuestion('Enter user email to unblock: '))
    const userId = await findUserByEmail(userEmail)
    const reason = validateReason(await askQuestion('Enter reason for unblocking: '))

    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      console.log('❌ User not found')
      return
    }

    const updateData = {
      blockedFromGatePasses: false,
      unblockedFromGatePassesAt: serverTimestamp(),
      unblockedFromGatePassesBy: adminId,
      unblockedFromGatePassesReason: reason,
      blockedFromGatePassesAt: null,
      blockedFromGatePassesBy: null,
      blockedFromGatePassesReason: null,
      blockedFromGatePassesUntil: null,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(userDocRef, updateData)
    console.log('✅ User unblocked from gate passes successfully')
  } catch (error) {
    console.error('❌ Error unblocking user:', error.message)
  }
}

// Function to check user blocking status
async function checkUserBlockingStatus() {
  try {
    const userEmail = validateEmail(await askQuestion('Enter user email to check: '))
    const userId = await findUserByEmail(userEmail)

    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (!userDoc.exists()) {
      console.log('❌ User not found')
      return
    }

    const userData = userDoc.data()
    const isBlocked = userData.blockedFromGatePasses === true

    console.log('\n📊 User Blocking Status:')
    console.log('Email:', userData.email || 'N/A')
    console.log('Name:', userData.fullName || userData.firstName + ' ' + userData.lastName || 'N/A')
    console.log('Blocked from Gate Passes:', isBlocked ? 'YES' : 'NO')

    if (isBlocked) {
      console.log('Blocked At:', userData.blockedFromGatePassesAt?.toDate?.() || 'N/A')
      console.log('Blocked By:', userData.blockedFromGatePassesBy || 'N/A')
      console.log('Reason:', userData.blockedFromGatePassesReason || 'N/A')
      console.log('Blocked Until:', userData.blockedFromGatePassesUntil?.toDate?.() || 'Permanent')
    }
  } catch (error) {
    console.error('❌ Error checking user status:', error.message)
  }
}

// Main menu
async function showMenu() {
  console.log('\n🔐 Admin User Blocking Utility')
  console.log('================================')
  console.log('1. Block user from gate passes')
  console.log('2. Unblock user from gate passes')
  console.log('3. Check user blocking status')
  console.log('4. Exit')
  console.log('================================')
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Admin User Blocking Utility...')

    // Sign in as admin
    const adminId = await signInAsAdmin()

    while (true) {
      await showMenu()
      const choice = await askQuestion('Enter your choice (1-4): ')

      switch (choice) {
        case '1':
          await blockUserFromGatePasses(adminId)
          break
        case '2':
          await unblockUserFromGatePasses(adminId)
          break
        case '3':
          await checkUserBlockingStatus()
          break
        case '4':
          console.log('👋 Goodbye!')
          closeReadline()
          process.exit(0)
          break
        default:
          console.log('❌ Invalid choice. Please enter 1-4.')
          break
      }

      console.log('\nPress Enter to continue...')
      await askQuestion('')
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    closeReadline()
    process.exit(1)
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!')
  closeReadline()
  process.exit(0)
})

// Run the script
main()
