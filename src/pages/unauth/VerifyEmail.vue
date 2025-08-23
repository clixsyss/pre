<template>
  <div class="verify-email-page">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">Registration</h1>
      <div class="placeholder"></div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn active">Personal</button>
      <button class="tab-btn">Property</button>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="icon-section">
        <div class="icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <div class="verification-instructions">
        <p>We've sent a verification email to:</p>
        <p class="email-display">{{ formData.email }}</p>
        <p>Please check your inbox and click the verification link in the email.</p>
        <p class="note">If you don't see the email, check your spam folder.</p>
        <div class="verification-tips">
          <p><strong>After clicking the verification link:</strong></p>
          <ul>
            <li>Click the verification link in your email</li>
            <li>Return to this app (keep this tab open)</li>
            <li>Wait a few seconds for automatic detection</li>
            <li>Or click "Check Verification Status" below</li>
          </ul>
        </div>
      </div>

      <div class="verification-actions">
        <!-- Manual Check Section -->
        <div class="action-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Ready to Continue?</h3>
          </div>
          <p>If you've already clicked the verification link in your email:</p>
          <button 
            @click="checkVerificationStatus" 
            class="action-btn primary"
          >
            Check Verification Status
          </button>
        </div>

        <!-- Auto Check Section -->
        <div class="action-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M7.76 7.76L4.93 4.93M19.07 19.07L16.24 16.24" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Automatic Detection</h3>
          </div>
          <p>We'll automatically check your verification status every 3 seconds</p>
          <div class="countdown-info">
            <span class="countdown-text">Next check in <strong>{{ nextCheckIn }}s</strong></span>
          </div>
        </div>

        <!-- Resend Section -->
        <div class="action-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="#FF9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3>Didn't Receive Email?</h3>
          </div>
          <p>Check your spam folder or request a new verification email</p>
          <button 
            @click="resendCode" 
            class="action-btn secondary" 
            :disabled="resendCountdown > 0"
          >
            <span v-if="resendCountdown > 0">
              Resend in {{ formatTime(resendCountdown) }}
            </span>
            <span v-else>
              Resend Verification Email
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../../stores/registration'
import { useNotificationStore } from '../../stores/notifications'
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../boot/firebase'

// Component name for ESLint
defineOptions({
  name: 'VerifyEmailPage'
})

const router = useRouter()
// route removed - not needed in this component
const registrationStore = useRegistrationStore()
const notificationStore = useNotificationStore()
const resendCountdown = ref(0)
const nextCheckIn = ref(3)
let countdownTimer = null

const formData = reactive({
  email: '',
  verificationCode: ''
})

// Function to update user data in Firestore when email is verified
const updateEmailVerificationInFirestore = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    
    const updateDocument = {
      emailVerified: true,
      registrationStep: 'email_verified',
      updatedAt: serverTimestamp()
    }
    
    await setDoc(userDocRef, updateDocument, { merge: true })
    
    console.log('Email verification status updated in Firestore successfully')
    return true
  } catch (error) {
    console.error('Error updating email verification in Firestore:', error)
    throw error
  }
}

onMounted(() => {
  // Get email from registration store
  const email = registrationStore.personalData.email || 'Example@gmail.com'
  formData.email = email
  
  // Start countdown for resend
  startResendCountdown()
  
  // Check if user is already verified
  if (registrationStore.tempUserId) {
    checkEmailVerification()
    
    // Set up periodic check for email verification
    const verificationCheckInterval = setInterval(async () => {
      try {
        // Reload the current user to get latest verification status
        if (auth.currentUser) {
          await auth.currentUser.reload()
          
          if (auth.currentUser.emailVerified) {
            console.log('Periodic check: Email verified, proceeding to next step')
            clearInterval(verificationCheckInterval)
            
            // Update Firestore with email verification status
            try {
              await updateEmailVerificationInFirestore(auth.currentUser.uid)
            } catch (firestoreError) {
              console.warn('Failed to update Firestore, but continuing with registration:', firestoreError)
            }
            
            notificationStore.showSuccess('Email verified! Redirecting to continue registration...')
            registrationStore.setEmailVerified(true)
            router.push('/register')
          }
        }
      } catch (error) {
        console.error('Error in periodic check:', error)
      }
    }, 3000) // Check every 3 seconds
    
    // Set up countdown for next check
    const countdownInterval = setInterval(() => {
      nextCheckIn.value = nextCheckIn.value > 1 ? nextCheckIn.value - 1 : 3
    }, 1000)
    
    // Clean up intervals when component unmounts
    onUnmounted(() => {
      if (verificationCheckInterval) clearInterval(verificationCheckInterval)
      clearInterval(countdownInterval)
    })
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

const startResendCountdown = () => {
  resendCountdown.value = 60 // 60 seconds
  countdownTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const goBack = () => {
  router.go(-1)
}

const checkEmailVerification = () => {
  // Listen for auth state changes to check if email is verified
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {
      // Email is verified, proceed to next step
      
      // Update Firestore with email verification status
      try {
        await updateEmailVerificationInFirestore(user.uid)
      } catch (firestoreError) {
        console.warn('Failed to update Firestore, but continuing with registration:', firestoreError)
      }
      
      registrationStore.setEmailVerified(true)
      router.push('/register')
      unsubscribe()
    }
  })
}

const checkVerificationStatus = async () => {
  try {
    // Reload the current user to get latest verification status
    await auth.currentUser?.reload()
    
    const currentUser = auth.currentUser
    if (currentUser && currentUser.emailVerified) {
      console.log('Manual check: Email verified, proceeding to next step')
      
      // Update Firestore with email verification status
      try {
        await updateEmailVerificationInFirestore(currentUser.uid)
      } catch (firestoreError) {
        console.warn('Failed to update Firestore, but continuing with registration:', firestoreError)
      }
      
      notificationStore.showSuccess('Email verified! Redirecting to continue registration...')
      registrationStore.setEmailVerified(true)
      router.push('/register')
    } else {
      notificationStore.showInfo('Email not yet verified. Please check your inbox and click the verification link.')
    }
  } catch (error) {
    console.error('Error checking verification status:', error)
    notificationStore.showError('Failed to check verification status. Please try again.')
  }
}



const resendCode = async () => {
  if (resendCountdown.value > 0) return
  
  try {
    // Resend verification email via Firebase
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser)
      console.log('Verification email resent to:', formData.email)
      
      // Restart countdown
      startResendCountdown()
      
      notificationStore.showSuccess('Verification email resent successfully!')
    } else {
      throw new Error('No user found. Please try again.')
    }
  } catch (error) {
    console.error('Resend error:', error)
    notificationStore.showError('Failed to resend email: ' + error.message)
  }
}
</script>

<style scoped>
.verify-email-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #222222;
  color: white;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.placeholder {
  width: 40px;
}

.tabs {
  display: flex;
  background-color: white;
  border-bottom: 1px solid #e1e5e9;
}

.tab-btn {
  flex: 1;
  padding: 20px;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn.active {
  color: #ff6b35;
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #ff6b35;
}

.content {
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.icon-section {
  text-align: center;
  margin-bottom: 40px;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
}

.verification-instructions {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.verification-instructions p {
  margin: 8px 0;
  color: #333;
}

.email-display {
  font-weight: 600;
  color: #ff6b35;
  font-size: 1.1rem;
}

.note {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}



.verification-tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #e3f2fd;
  border-radius: 6px;
  border-left: 4px solid #1976d2;
}

.verification-tips p {
  margin: 8px 0;
  color: #1976d2;
  font-weight: 500;
}

.verification-tips ul {
  margin: 10px 0;
  padding-left: 20px;
}

.verification-tips li {
  margin: 5px 0;
  color: #333;
  font-size: 0.9rem;
}

.verification-form {
  margin-bottom: 30px;
}

.code-input-container {
  position: relative;
}

.code-input {
  width: 100%;
  padding: 18px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: white;
  font-family: 'Courier New', monospace;
}

.code-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.code-input::placeholder {
  color: #ccc;
  letter-spacing: 1px;
}

.code-input-hint {
  text-align: center;
  margin-top: 8px;
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}



.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
}

.form-input[readonly] {
  background-color: #f8f9fa;
  color: #666;
  cursor: not-allowed;
}

.verify-btn {
  width: 100%;
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verify-btn:hover:not(:disabled) {
  background-color: #e55a2b;
}

.verify-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.resend-section {
  text-align: center;
}

.resend-btn {
  background: none;
  border: none;
  color: #ff6b35;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  color: #e55a2b;
}

.resend-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  text-decoration: none;
}

/* Minimal design styles */
.verification-actions {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-section {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  transition: border-color 0.2s ease;
}

.action-section:hover {
  border-color: #ff6b35;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-header svg {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

.action-section p {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0 0 16px 0;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background-color: #4CAF50;
  color: white;
}

.action-btn.primary:hover {
  background-color: #43A047;
}

.action-btn.secondary {
  background-color: #FF9800;
  color: white;
}

.action-btn.secondary:hover:not(:disabled) {
  background-color: #F57C00;
}

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.countdown-info {
  margin-top: 12px;
}

.countdown-text {
  color: #666;
  font-size: 0.8rem;
}

.countdown-text strong {
  color: #2196F3;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 480px) {
  .content {
    padding: 30px 15px;
  }
  
  .form-input {
    padding: 14px;
  }
  
  .action-section {
    padding: 16px;
    border-radius: 6px;
  }
  
  .section-header h3 {
    font-size: 0.95rem;
  }
  
  .action-section p {
    font-size: 0.8rem;
  }
  
  .action-btn {
    padding: 8px 14px;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .verification-actions {
    gap: 20px;
  }
  
  .action-section {
    padding: 16px;
  }
}
</style>
