<template>
  <div class="signin-page">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">Sign In</h1>
      <div class="placeholder"></div>
    </div>

    <!-- Pending Approval Modal -->
    <PendingApprovalModal 
      v-if="showPendingModal" 
      @close="showPendingModal = false"
      @refresh="checkUserApprovalStatus"
    />

    <!-- Content -->
    <div class="content">
      <div class="welcome-section">
        <h2 class="welcome-title">Welcome Back!</h2>
      </div>

      <form @submit.prevent="handleSignIn" class="signin-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="password-toggle"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 12 6 4 12 4C18 4 22 12 22 12C22 12 18 20 12 20C6 20 2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="formData.rememberMe" class="checkbox" />
            <span class="checkmark"></span>
            Remember me
          </label>
          <button type="button" @click="forgotPassword" class="forgot-link">
            Forgot Password?
          </button>
        </div>

        <button type="submit" class="signin-btn" :disabled="loading">
          <span v-if="loading">Signing In...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="divider">
        <span>or</span>
      </div>

      <div class="google-signin-section">
        
        <button @click="signInWithGoogle" class="social-btn google-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <div class="signup-prompt">
        <span>Don't have an account?</span>
        <button @click="goToSignUp" class="signup-link">Sign up</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import optimizedAuthService from '../../services/optimizedAuthService'
import firestoreService from '../../services/firestoreService'
import { smartMirrorService } from '../../services/smartMirrorService'
import { useNotificationStore } from '../../stores/notifications'
import { useRegistrationStore } from '../../stores/registration'
import { validateProfileCompletion, getNextProfileStep } from '../../utils/profileValidation'
import { attemptGoogleSignIn } from '../../utils/googleAuthHelper'
import PendingApprovalModal from '../../components/PendingApprovalModal.vue'

// Component name for ESLint
defineOptions({
  name: 'SignInPage'
})

const router = useRouter()
const notificationStore = useNotificationStore()
const loading = ref(false)
const showPassword = ref(false)
const showPendingModal = ref(false)

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const goBack = () => {
  router.go(-1)
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Check user approval status
const checkUserApprovalStatus = async (userId) => {
  try {
    console.log('🔍 Checking approval status for user:', userId)
    
    const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
    let userData
    
    if (isIOS) {
      console.log('🔍 Using Capacitor Firestore for iOS...')
      const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
      const result = await FirebaseFirestore.getDocument({
        reference: `users/${userId}`
      })
      userData = result.snapshot?.data
      console.log('📋 User document data (iOS):', userData)
    } else {
      const userDoc = await firestoreService.getDoc(`users/${userId}`)
      if (userDoc.exists()) {
        userData = userDoc.data()
        console.log('📋 User document data:', userData)
      }
    }
    
    if (userData) {
      console.log('✅ Approval status field:', userData.approvalStatus)
      console.log('✅ Registration status field:', userData.registrationStatus)
      
      const result = {
        approvalStatus: userData.approvalStatus || 'pending',
        registrationStatus: userData.registrationStatus || 'pending'
      }
      
      console.log('🎯 Final approval check result:', result)
      return result
    }
    
    console.log('❌ User document does not exist')
    return { approvalStatus: 'pending', registrationStatus: 'pending' }
  } catch (error) {
    console.error('❌ Error checking user approval status:', error)
    return { approvalStatus: 'pending', registrationStatus: 'pending' }
  }
}

const handleSignIn = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    console.log('[SignIn] Starting sign in...')
    
    // Use Capacitor plugin for iOS, Web SDK for others
    const { Capacitor } = await import('@capacitor/core')
    const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
    
    let userId
    if (isIOS) {
      console.log('[SignIn] Using Capacitor Auth plugin for iOS...')
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
      
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({
        email: formData.email,
        password: formData.password
      })
      
      userId = result.user.uid
      console.log('[SignIn] ✅ Capacitor auth successful:', userId)
    } else {
      const userCredential = await optimizedAuthService.signInWithEmailAndPassword(formData.email, formData.password)
      userId = userCredential.user.uid
    }
    
    // Sync PRE user with Smart Mirror service for user isolation
    console.log('[SignIn] 🔐 Syncing PRE user with Smart Mirror service:', userId)
    smartMirrorService.setPreUserId(userId)
    
    // Check user approval status
    const status = await checkUserApprovalStatus(userId)
    console.log('🚀 Sign-in approval check result:', status)
    
    if (status.approvalStatus === 'pending') {
      console.log('⏳ User is pending approval, showing modal')
      // Show pending approval modal
      showPendingModal.value = true
      return
    } else if (status.approvalStatus === 'rejected') {
      console.log('❌ User is rejected')
      notificationStore.showError('Your account has been rejected. Please contact support for more information.')
      return
    }
    
    console.log('✅ User is approved, proceeding to home')
    // User is approved, proceed to home
    router.push('/home')
  } catch (error) {
    console.error('Sign in error:', error)
    notificationStore.showError('Sign in failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

const signInWithGoogle = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    // Attempt Google sign-in with validation
    const signInResult = await attemptGoogleSignIn()
    
    if (!signInResult.success) {
      // Sign-in was rejected
      notificationStore.showError(signInResult.reason)
      return
    }
    
    // Sync PRE user with Smart Mirror service for user isolation
    const googleUserId = signInResult.user?.uid
    if (googleUserId) {
      console.log('[SignIn] 🔐 Syncing Google user with Smart Mirror service:', googleUserId)
      smartMirrorService.setPreUserId(googleUserId)
    }
    
    // User is eligible for Google sign-in
    // Check if profile is complete
    const userData = signInResult.userData
    const profileValidation = validateProfileCompletion(userData)
    
    if (!profileValidation.isComplete) {
      // Profile incomplete - redirect to appropriate completion step
      const nextStep = getNextProfileStep(userData)
      notificationStore.showWarning(`Please complete your profile information before proceeding. Missing: ${profileValidation.message}`)
      
      // Store user data in registration store for completion
      const registrationStore = useRegistrationStore()
      registrationStore.setPersonalData({ email: userData.email })
      registrationStore.setPropertyData({
        compound: userData.compound || '',
        unit: userData.unit || '',
        role: userData.role || '',
        projects: userData.projects || [] // Include projects data
      })
      registrationStore.setUserDetails({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        mobile: userData.mobile || '',
        dateOfBirth: userData.dateOfBirth || '',
        gender: userData.gender || 'male',
        nationalId: userData.nationalId || ''
      })
      registrationStore.setTempUserId(userData.uid)
      registrationStore.setEmailVerified(userData.emailVerified || false)
      
      // Redirect to appropriate completion step
      switch (nextStep) {
        case 'email_verification':
          router.push('/register/verify-email')
          break
        case 'property_details':
          router.push('/register')
          break
        case 'personal_details':
          router.push('/register/personal-details')
          break
        default:
          router.push('/register')
      }
      return
    }
    
    // Check user approval status
    const status = await checkUserApprovalStatus(userData.uid)
    console.log('🚀 Google sign-in approval check result:', status)
    
    if (status.approvalStatus === 'pending') {
      console.log('⏳ User is pending approval, showing modal')
      // Show pending approval modal
      showPendingModal.value = true
      return
    } else if (status.approvalStatus === 'rejected') {
      console.log('❌ User is rejected')
      notificationStore.showError('Your account has been rejected. Please contact support for more information.')
      return
    }
    
    // User is approved - update last login and proceed
    await firestoreService.setDoc(`users/${userData.uid}`, {
      lastLogin: new Date(),
      updatedAt: new Date()
    }, { merge: true })
    
    notificationStore.showSuccess('Welcome back!')
    router.push('/home')
    
  } catch (error) {
    console.error('Google sign in error:', error)
    notificationStore.showError('Google sign in failed. Please try again.')
  } finally {
    loading.value = false
  }
}

const forgotPassword = () => {
  // TODO: Implement forgot password
  console.log('Forgot password clicked')
}

const goToSignUp = () => {
  router.push('/register')
}
</script>

<style scoped>
.signin-page {
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
  padding-top: 60px;
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
  line-height: 1;
}

.placeholder {
  width: 40px;
}

.content {
  padding: 40px 20px;
  max-width: 400px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.welcome-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.new-user-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #e8f5e9; /* Light green background */
  border: 1px solid #a5d6a7; /* Green border */
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  color: #2e7d32; /* Dark green text */
  font-size: 0.9rem;
  font-weight: 500;
}

.new-user-message svg {
  flex-shrink: 0;
}

.signin-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
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
}

.form-input:focus {
  outline: none;
  border-color: #AF1E23;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
}

.checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox:checked + .checkmark {
  background-color: #AF1E23;
  border-color: #AF1E23;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.forgot-link {
  background: none;
  border: none;
  color: #AF1E23;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
}

.signin-btn {
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

.signin-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  margin: 30px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e1e5e9;
}

.divider span {
  background-color: #f8f9fa;
  padding: 0 20px;
  color: #666;
  font-size: 0.9rem;
}

.google-signin-section {
  margin-bottom: 30px;
}

.google-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 15px;
  color: #666;
  font-size: 0.85rem;
}

.google-notice svg {
  flex-shrink: 0;
}

.social-signin {
  margin-bottom: 30px;
}

.social-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.signup-prompt {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.signup-link {
  background: none;
  border: none;
  color: #AF1E23;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 5px;
}

/* Responsive design */
@media (max-width: 480px) {
  .content {
    padding: 30px 15px;
  }
  
  .welcome-title {
    font-size: 1.6rem;
  }
  
  .form-input {
    padding: 14px;
  }
}
</style>
