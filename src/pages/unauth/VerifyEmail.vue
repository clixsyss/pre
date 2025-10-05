<template>
  <div class="verify-email-page">
    <!-- Header -->
    <div class="header">
      <button @click="goToOnboarding" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="page-title">Registration</h1>
      <div class="header-actions">
        <button @click="goToSignIn" class="signin-header-btn">Sign In</button>
      </div>
    </div>

    <!-- Orange Separator Line -->
    <div class="separator-line"></div>

    <!-- Progress Indicator -->
    <div class="progress-indicator">
      <div class="progress-line"></div>

      <!-- Personal Step -->
      <div class="progress-step" :class="{ active: activeTab === 'personal', completed: isEmailVerified }"
        @click="activeTab = 'personal'">
        <div class="step-icon">
          <svg v-if="activeTab === 'personal'" width="24" height="24" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="white" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#2196F3" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
        <span class="step-label">Personal</span>
      </div>

      <!-- Property Step -->
      <div class="progress-step"
        :class="{ active: activeTab === 'property', completed: isEmailVerified && isPersonalDetailsCompleted(), disabled: !isEmailVerified || !isPersonalDetailsCompleted() }"
        @click="handlePropertyTabClick">
        <div class="step-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
        <span class="step-label">Property</span>
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      <!-- Personal Step -->
      <div v-if="activeTab === 'personal'" class="step-panel">
        <div class="icon-section">
          <div class="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="#AF1E23" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <div class="verification-instructions">
          <p>We've sent a verification email to:</p>
          <p class="email-display">{{ formData.email }}</p>
          <p v-if="formData.email === 'Example@gmail.com'" class="debug-info">
            <small>Debug: Using fallback email. Store email: {{ registrationStore.personalData.email || 'Not set'
              }}</small>
          </p>
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
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <h3>Ready to Continue?</h3>
            </div>
            <p>If you've already clicked the verification link in your email:</p>
            <button @click="manualCheckVerification" class="action-btn primary">
              Check Verification Status
            </button>
          </div>

          <!-- Auto Check Section -->
          <div class="action-section">
            <div class="section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M7.76 7.76L4.93 4.93M19.07 19.07L16.24 16.24"
                  stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
                <path
                  d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
                  stroke="#FF9800" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <h3>Didn't Receive Email?</h3>
            </div>
            <p>Check your spam folder or request a new verification email</p>
            <button @click="resendCode" class="action-btn secondary" :disabled="resendCountdown > 0">
              <span v-if="resendCountdown > 0">
                Resend in {{ resendCountdown }}s
              </span>
              <span v-else>
                Resend Verification Email
              </span>
            </button>
          </div>

          <!-- Proceed to Personal Details Section (shown when email is verified) -->
          <div v-if="isEmailVerified" class="action-section">
            <div class="section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <h3>Email Verified!</h3>
            </div>
            <p>Great! Your email has been verified. You can now complete your personal information.</p>
            <button @click="goToPersonalDetails" class="action-btn primary">
              Complete Personal Info
            </button>
          </div>
        </div>
      </div>

      <!-- Property Step -->
      <div v-if="activeTab === 'property'" class="step-panel">
        <div class="icon-section">
          <div class="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <polyline points="9,22 9,12 15,12 15,22" stroke="#AF1E23" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <div class="verification-instructions">
          <h3>Property Information</h3>
          <p v-if="!isEmailVerified">You need to verify your email address first before you can add properties.</p>
          <p v-else-if="!isPersonalDetailsCompleted()">You need to complete your personal information before you can add
            properties.</p>
          <p v-else>Great! You can now add your properties.</p>
          <div class="verification-tips">
            <p><strong>Next steps:</strong></p>
            <ul>
              <li v-if="!isEmailVerified">Verify your email address (Personal tab)</li>
              <li v-else-if="!isPersonalDetailsCompleted()">Complete your personal details (Personal tab)</li>
              <li v-else>Add your properties below</li>
            </ul>
          </div>
        </div>

        <div class="verification-actions">
          <div class="action-section">
            <div class="section-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <h3>Ready to Add Properties?</h3>
            </div>
            <p v-if="!isEmailVerified">Switch to the Personal tab to verify your email first.</p>
            <p v-else-if="!isPersonalDetailsCompleted()">Switch to the Personal tab to complete your personal
              information first.</p>
            <p v-else>You're all set! Add your properties below.</p>
            <button v-if="!isEmailVerified || !isPersonalDetailsCompleted()" @click="activeTab = 'personal'"
              class="action-btn primary">
              Go to Personal Tab
            </button>
          </div>
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
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../boot/firebase'
import { Capacitor } from '@capacitor/core'
import iosAuthHelper from '../../services/iosAuthHelper'

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
const activeTab = ref('personal')
const isEmailVerified = ref(false)
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
  // Get email from multiple sources in order of priority
  let email = ''

  // First try to get from registration store
  if (registrationStore.personalData.email) {
    email = registrationStore.personalData.email
  }
  // Then try to get from current user if available
  else if (auth.currentUser && auth.currentUser.email) {
    email = auth.currentUser.email
    // Save it to the store for future use
    registrationStore.setPersonalData({ email: email })
  }
  // Finally fallback to example
  else {
    email = 'Example@gmail.com'
  }

  formData.email = email
  console.log('Email loaded:', email, 'from store:', registrationStore.personalData.email)

  // Start countdown for resend
  startResendCountdown()

  // Check if user is already verified
  if (registrationStore.tempUserId || auth.currentUser) {
    // Immediate check for current verification status
    if (auth.currentUser && auth.currentUser.emailVerified) {
      console.log('User already verified on mount, proceeding to next step')
      handleEmailVerified(auth.currentUser.uid)
      return
    }

    checkEmailVerification()

    console.log('Setting up periodic email verification check every 3 seconds')
    // Set up periodic check for email verification
    const verificationCheckInterval = setInterval(async () => {
      try {
        // Reload the current user to get latest verification status
        if (auth.currentUser) {
          await auth.currentUser.reload()

          if (auth.currentUser.emailVerified) {
            console.log('Periodic check: Email verified, proceeding to next step')
            clearInterval(verificationCheckInterval)

            // Use the helper function to handle verification
            handleEmailVerified(auth.currentUser.uid)
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

const goToOnboarding = () => {
  console.log('goToOnboarding called from VerifyEmail, navigating to /onboarding')
  router.push('/onboarding')
}

const goToSignIn = () => {
  router.push('/signin')
}

const checkEmailVerification = () => {
  console.log('checkEmailVerification called, current user:', auth.currentUser?.email, 'verified:', auth.currentUser?.emailVerified)

  // First, check if current user is already verified
  if (auth.currentUser && auth.currentUser.emailVerified) {
    console.log('Current user already verified, proceeding to next step')
    handleEmailVerified(auth.currentUser.uid)
    return
  }

  console.log('Setting up auth state change listener for email verification')
  // Listen for auth state changes to check if email is verified
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {
      console.log('Auth state change: Email verified, proceeding to next step')
      handleEmailVerified(user.uid)
      unsubscribe()
    }
  })
}

// Helper function to handle email verification
const handleEmailVerified = async (userId) => {
  try {
    // Update Firestore with email verification status
    await updateEmailVerificationInFirestore(userId)
  } catch (firestoreError) {
    console.warn('Failed to update Firestore, but continuing with registration:', firestoreError)
  }

  // Update store and local state
  registrationStore.setEmailVerified(true)
  isEmailVerified.value = true

  // Show success message
  notificationStore.showSuccess('Email verified! Redirecting to personal details...')

  // Redirect to PersonalDetails.vue to complete personal information
  setTimeout(() => {
    router.push('/register/personal-details')
  }, 1500)
}

const checkVerificationStatus = async () => {
  try {
    // Reload the current user to get latest verification status
    await auth.currentUser?.reload()

    const currentUser = auth.currentUser
    if (currentUser && currentUser.emailVerified) {
      console.log('Manual check: Email verified, proceeding to next step')

      // Use the helper function to handle verification
      handleEmailVerified(currentUser.uid)
    } else {
      notificationStore.showInfo('Email not yet verified. Please check your inbox and click the verification link.')
    }
  } catch (error) {
    console.error('Error checking verification status:', error)
    notificationStore.showError('Error checking verification status. Please try again.')
  }
}



const goToPersonalDetails = () => {
  // Navigate to personal details page
  router.push('/register')
}

// Check if personal details are completed
const isPersonalDetailsCompleted = () => {
  const userDetails = registrationStore.userDetails
  return userDetails.firstName && userDetails.lastName && userDetails.mobile &&
    userDetails.dateOfBirth && userDetails.nationalId
}

// Function to manually check verification status (useful for testing)
const manualCheckVerification = async () => {
  console.log('Manual verification check triggered')
  await checkVerificationStatus()
}



const handlePropertyTabClick = () => {
  if (!isEmailVerified.value) {
    notificationStore.showInfo('Please verify your email first before accessing the Property tab.')

    // Add shake animation to the disabled tab
    const propertyTab = document.querySelector('.progress-step.disabled')
    if (propertyTab) {
      propertyTab.classList.add('shake')
      setTimeout(() => {
        propertyTab.classList.remove('shake')
      }, 300)
    }
    return
  }

  if (!isPersonalDetailsCompleted()) {
    notificationStore.showInfo('Please complete your personal information first before accessing the Property tab.')
    activeTab.value = 'personal'
    return
  }

  activeTab.value = 'property'
}

const resendCode = async () => {
  if (resendCountdown.value > 0) return

  try {
    // Resend verification email via Firebase with iOS-specific handling
    if (auth.currentUser) {
      console.log('Attempting to resend verification email to:', auth.currentUser.email)
      console.log('User email verified status:', auth.currentUser.emailVerified)
      console.log('User UID:', auth.currentUser.uid)
      console.log('Platform:', Capacitor.getPlatform(), 'Native:', Capacitor.isNativePlatform())

      // Use iOS-specific authentication helper for resend
      if (iosAuthHelper.isIOSNative()) {
        console.log('iOS native detected - using enhanced resend approach')
        await iosAuthHelper.waitForIOSAuthStabilization()
        await iosAuthHelper.refreshUserToken(auth.currentUser)
      }

      // Send verification email with platform-specific retry logic
      await iosAuthHelper.sendEmailVerificationWithRetry(auth.currentUser)
      console.log('Verification email resent successfully to:', formData.email)

      // Restart countdown
      startResendCountdown()

      notificationStore.showSuccess('Verification email resent successfully!')
    } else {
      console.error('No authenticated user found for resend')
      throw new Error('No user found. Please try again.')
    }
  } catch (error) {
    console.error('Resend error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })

    // Use platform-specific error message helper
    const errorMessage = iosAuthHelper.getPlatformErrorMessage(error) || `Failed to resend email: ${error.message}`

    notificationStore.showError(errorMessage)
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

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.signin-header-btn {
  background: none;
  border: 1px solid white;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.placeholder {
  width: 40px;
}

.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  padding: 0 40px;
  position: relative;
  gap: 120px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.separator-line {
  height: 3px;
  background-color: #AF1E23;
  margin: 0;
  width: 100%;
  margin-bottom: 0;
}

.progress-line {
  position: absolute;
  height: 2px;
  background-color: #e1e5e9;
  width: 70%;
  margin-left: 15%;
  top: 30%;
  left: 0;
  transform: translateY(-50%);
  z-index: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  border-radius: 8px;
  min-width: 80px;
  cursor: pointer;
}

.progress-step.active .step-icon {
  background-color: #231F20;
  border-color: #231F20;
  color: white;
  width: 48px;
  height: 48px;
}

.progress-step.active .step-label {
  color: #231F20;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 12px;
}

.progress-step.completed .step-icon {
  background-color: #e1e5e9;
  border-color: #e1e5e9;
  color: #2196F3;
  width: 48px;
  height: 48px;
}

.progress-step.completed .step-label {
  color: #2196F3;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 12px;
}

.progress-step:not(.active):not(.completed) .step-icon {
  background-color: #e1e5e9;
  border-color: #e1e5e9;
  color: #999;
  width: 48px;
  height: 48px;
  z-index: 9999;
}

.progress-step:not(.active):not(.completed) .step-label {
  color: #999;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 12px;
}

.progress-step.disabled {
  cursor: not-allowed;
  opacity: 1;
  position: relative;
}

.progress-step.disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  pointer-events: none;
}

.progress-step.disabled .step-icon {
  background-color: #f5f5f5;
  border-color: #ccc;
  color: #ccc;
}

.progress-step.disabled .step-label {
  color: #ccc;
}

.step-icon {
  border: 2px solid #e1e5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.step-icon svg {
  width: 24px;
  height: 24px;
  display: block;
  flex-shrink: 0;
}

.progress-step.active .step-icon svg {
  stroke: white;
}

.progress-step.completed .step-icon svg {
  stroke: #2196F3;
}

.progress-step:not(.active):not(.completed) .step-icon svg {
  stroke: #999;
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
  color: #AF1E23;
  font-size: 1.1rem;
}

.debug-info {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 8px;
  margin: 8px 0;
  font-size: 0.8rem;
  color: #856404;
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
  border-color: #AF1E23;
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
  border-color: #AF1E23;
}

.form-input[readonly] {
  background-color: #f8f9fa;
  color: #666;
  cursor: not-allowed;
}

.verify-btn {
  width: 100%;
  background-color: #AF1E23;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
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
  color: #AF1E23;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
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

.action-btn.secondary {
  background-color: #FF9800;
  color: white;
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

/* Step Content Styles */
.step-content {
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
}

.step-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-2px);
  }

  75% {
    transform: translateX(2px);
  }
}

.progress-step.disabled.shake {
  animation: shake 0.3s ease-in-out;
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
