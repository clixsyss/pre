<template>
  <div class="register-page">
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

    <!-- Orange Separator Line -->
    <div class="separator-line"></div>

    <!-- Progress Indicator -->
    <div class="progress-indicator">
      <div class="progress-line"></div>
      
      <!-- Personal Step -->
      <div class="progress-step" :class="{ active: currentStep === 'personal', completed: currentStep === 'property' || currentStep === 'details' }">
        <div class="step-icon">
          <svg v-if="currentStep === 'personal'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="step-label">Personal</span>
      </div>
      
      <!-- Property Step -->
      <div class="progress-step" :class="{ active: currentStep === 'property', completed: currentStep === 'details' }">
        <div class="step-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="step-label">Property</span>
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      <!-- Personal Step -->
      <div v-if="currentStep === 'personal'" class="step-panel">
        <div class="icon-section">
          <div class="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <form @submit.prevent="handlePersonalSubmit" class="form">
          <div class="form-group">
            <label for="email" class="form-label">E-mail</label>
            <input
              id="email"
              v-model="personalForm.email"
              type="email"
              class="form-input"
              placeholder="Example@gmail.com"
              required
            />
          </div>

          <button type="submit" class="proceed-btn" :disabled="loading">
            <span v-if="loading">Processing...</span>
            <span v-else>Proceed</span>
          </button>
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <div class="social-signin">
          <button @click="signInWithGoogle" class="social-btn google-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>

      <!-- Property Step -->
      <div v-if="currentStep === 'property'" class="step-panel">
        <div class="icon-section">
          <div class="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <form @submit.prevent="handlePropertySubmit" class="form">
          <div class="form-group">
            <label for="compound" class="form-label">Compound</label>
            <select id="compound" v-model="propertyForm.compound" class="form-input" required>
              <option value="" disabled>Select Compound</option>
              <option value="palm_hills">Palm Hills Compound</option>
              <option value="beverly_hills">Beverly Hills Compound</option>
              <option value="garden_city">Garden City Compound</option>
              <option value="sunset_valley">Sunset Valley Compound</option>
              <option value="oasis_gardens">Oasis Gardens Compound</option>
            </select>
          </div>

          <div class="form-group">
            <label for="unit" class="form-label">Unit</label>
            <select id="unit" v-model="propertyForm.unit" class="form-input" required :disabled="!propertyForm.compound">
              <option value="" disabled>{{ propertyForm.compound ? 'Select Unit' : 'Select Compound First' }}</option>
              <option v-if="propertyForm.compound" value="A1">Unit A1</option>
              <option v-if="propertyForm.compound" value="A2">Unit A2</option>
              <option v-if="propertyForm.compound" value="A3">Unit A3</option>
              <option v-if="propertyForm.compound" value="B1">Unit B1</option>
              <option v-if="propertyForm.compound" value="B2">Unit B2</option>
              <option v-if="propertyForm.compound" value="B3">Unit B3</option>
              <option v-if="propertyForm.compound" value="C1">Unit C1</option>
              <option v-if="propertyForm.compound" value="C2">Unit C2</option>
              <option v-if="propertyForm.compound" value="C3">Unit C3</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <div class="role-buttons">
              <button 
                type="button"
                @click="propertyForm.role = 'owner'"
                :class="['role-btn', { active: propertyForm.role === 'owner' }]"
              >
                Owner
              </button>
              <button 
                type="button"
                @click="propertyForm.role = 'family'"
                :class="['role-btn', { active: propertyForm.role === 'family' }]"
              >
                Family Member
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="goToPreviousStep" class="back-action-btn">
              Back
            </button>
            <button type="submit" class="verify-btn" :disabled="loading || !canProceedToNext">
              <span v-if="loading">Verifying...</span>
              <span v-else>Continue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../../stores/registration'
import { useNotificationStore } from '../../stores/notifications'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../../boot/firebase'
import { signInWithPopup } from 'firebase/auth'

// Component name for ESLint
defineOptions({
  name: 'RegisterPage'
})

const router = useRouter()
const registrationStore = useRegistrationStore()
const notificationStore = useNotificationStore()
const currentStep = ref('personal')
const loading = ref(false)

const personalForm = reactive({
  email: ''
})

const propertyForm = reactive({
  compound: '',
  unit: '',
  role: ''
})

// Function to save user data to Firestore
const saveUserDataToFirestore = async (userId, userData) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    
    // Prepare the user document data
    const userDocument = {
      // Personal Information
      email: userData.personal.email,
      emailVerified: userData.personal.emailVerified || false,
      
      // Property Information
      compound: userData.property.compound || '',
      unit: userData.property.unit || '',
      role: userData.property.role || '',
      
      // User Details (if available)
      firstName: userData.userDetails?.firstName || '',
      lastName: userData.userDetails?.lastName || '',
      mobile: userData.userDetails?.mobile || '',
      dateOfBirth: userData.userDetails?.dateOfBirth || '',
      gender: userData.userDetails?.gender || '',
      nationalId: userData.userDetails?.nationalId || '',
      
      // Metadata
      registrationStatus: 'pending', // pending, completed, verified
      registrationStep: 'personal', // personal, property, details, complete
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Firebase Auth Info
      authUid: userId,
      lastLoginAt: serverTimestamp()
    }
    
    // Save to Firestore
    await setDoc(userDocRef, userDocument)
    
    console.log('User data saved to Firestore successfully:', userDocument)
    return true
  } catch (error) {
    console.error('Error saving user data to Firestore:', error)
    throw error
  }
}

// Function to update user data in Firestore
const updateUserDataInFirestore = async (userId, updateData) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    
    const updateDocument = {
      ...updateData,
      updatedAt: serverTimestamp()
    }
    
    await setDoc(userDocRef, updateDocument, { merge: true })
    
    console.log('User data updated in Firestore successfully:', updateDocument)
    return true
  } catch (error) {
    console.error('Error updating user data in Firestore:', error)
    throw error
  }
}

onMounted(() => {
  // Load existing data from store if available
  if (registrationStore.personalData.email) {
    personalForm.email = registrationStore.personalData.email
  }
  if (registrationStore.propertyData.compound) {
    propertyForm.compound = registrationStore.propertyData.compound
    propertyForm.unit = registrationStore.propertyData.unit
    propertyForm.role = registrationStore.propertyData.role
  }
  
  // If email is verified, show property step
  if (registrationStore.isEmailVerified) {
    console.log('Email verified, switching to property step')
    currentStep.value = 'property'
    notificationStore.showInfo('Email verified! Please complete your property details.')
  }
  
  // Listen for verification code display (development only)
  const handleShowCode = (event) => {
    const { code, email } = event.detail
    notificationStore.showInfo(`🔐 Verification Code: ${code} (sent to ${email})`, 10000)
  }
  
  window.addEventListener('showVerificationCode', handleShowCode)
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('showVerificationCode', handleShowCode)
  })
})

const goBack = () => {
  router.go(-1)
}

const goToPreviousStep = () => {
  if (currentStep.value === 'property') {
    currentStep.value = 'personal'
  }
}

const canProceedToNext = computed(() => {
  if (currentStep.value === 'personal') {
    return personalForm.email && !loading.value
  } else if (currentStep.value === 'property') {
    return propertyForm.compound && propertyForm.unit && propertyForm.role && !loading.value
  }
  return false
})

const handlePersonalSubmit = async () => {
  if (loading.value) return
  
  if (!personalForm.email) {
    notificationStore.showError('Please enter your email address')
    return
  }
  
  loading.value = true
  
  try {
    // Store email in registration store
    registrationStore.setPersonalData({ email: personalForm.email })
    
    // Create a temporary user account with a random password
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      personalForm.email,
      tempPassword
    )
    
    // Send verification email via Firebase
    await sendEmailVerification(userCredential.user)
    
    // Store the user ID for later use
    registrationStore.setTempUserId(userCredential.user.uid)
    
    // Save initial user data to Firestore
    const initialUserData = {
      personal: { email: personalForm.email, emailVerified: false },
      property: { compound: '', unit: '', role: '' },
      userDetails: {}
    }
    
    await saveUserDataToFirestore(userCredential.user.uid, initialUserData)
    
    console.log('Verification email sent to:', personalForm.email)
    notificationStore.showSuccess('Verification email sent! Please check your inbox and click the verification link.')
    
    // Move to email verification step
    router.push('/register/verify-email')
  } catch (error) {
    console.error('Personal submit error:', error)
    
    let errorMessage = 'Failed to proceed'
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists. Please sign in instead.'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address. Please check your email format.'
    } else if (error.code === 'firestore/permission-denied') {
      errorMessage = 'Database access denied. Please contact support.'
    } else {
      errorMessage += ': ' + error.message
    }
    
    notificationStore.showError(errorMessage)
  } finally {
    loading.value = false
  }
}

const handlePropertySubmit = async () => {
  if (loading.value) return
  
  if (!propertyForm.compound || !propertyForm.unit || !propertyForm.role) {
    notificationStore.showError('Please fill in all property details')
    return
  }
  
  loading.value = true
  
  try {
    // Store property data in registration store
    registrationStore.setPropertyData({
      compound: propertyForm.compound,
      unit: propertyForm.unit,
      role: propertyForm.role
    })
    
    // Update user data in Firestore with property information
    if (registrationStore.tempUserId) {
      const propertyUpdateData = {
        compound: propertyForm.compound,
        unit: propertyForm.unit,
        role: propertyForm.role,
        registrationStep: 'property'
      }
      
      await updateUserDataInFirestore(registrationStore.tempUserId, propertyUpdateData)
    }
    
    console.log('Property form submitted:', propertyForm)
    
    // Show success notification
    notificationStore.showSuccess('Property details saved! Now let\'s complete your personal information.')
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Move to personal details step
    router.push('/register/personal-details')
  } catch (error) {
    console.error('Property submit error:', error)
    
    let errorMessage = 'Failed to save property details'
    if (error.code === 'firestore/permission-denied') {
      errorMessage = 'Database access denied. Please contact support.'
    } else {
      errorMessage += ': ' + error.message
    }
    
    notificationStore.showError(errorMessage)
  } finally {
    loading.value = false
  }
}

const signInWithGoogle = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Check if user already exists in Firestore
    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)
    
    if (!userDoc.exists()) {
      // New Google user - create user document with basic info
      const userData = {
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        emailVerified: user.emailVerified,
        registrationStep: 'personal',
        registrationCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        authProvider: 'google',
        lastLogin: serverTimestamp()
      }
      
      await setDoc(userDocRef, userData)
      
      // Store basic info in registration store
      registrationStore.setPersonalData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: ''
      })
      
      notificationStore.showSuccess('Google account connected! Please complete your property details.')
      
      // Move to property step
      currentStep.value = 'property'
    } else {
      // Existing user - redirect to home
      await setDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true })
      
      notificationStore.showSuccess('Welcome back!')
      router.push('/home')
    }
    
  } catch (error) {
    console.error('Google sign in error:', error)
    
    if (error.code === 'auth/popup-closed-by-user') {
      notificationStore.showError('Sign in was cancelled')
    } else if (error.code === 'auth/popup-blocked') {
      notificationStore.showError('Pop-up was blocked. Please allow pop-ups for this site.')
    } else {
      notificationStore.showError('Google sign in failed: ' + error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #000000;
  color: white;
  margin-bottom: 0;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.placeholder {
  width: 40px;
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

.back-btn svg {
  stroke: white;
}

.separator-line {
  height: 3px;
  background-color: #ff6b35;
  margin: 0;
  width: 100%;
  margin-bottom: 0;
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
}

.progress-step.active .step-icon {
  background-color: #000000;
  border-color: #000000;
  color: white;
  width: 48px;
  height: 48px;
}

.progress-step.active .step-label {
  color: #000000;
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
}

.progress-step:not(.active):not(.completed) .step-label {
  color: #999;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 12px;
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

.step-label {
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
}

.step-content {
  padding: 40px 20px;
  max-width: 500px;
  margin: 0 auto;
  margin-top: 20px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 30px 0;
  color: #666;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e1e5e9;
}

.divider span {
  padding: 0 15px;
  background-color: #f8f9fa;
}

.social-signin {
  margin-top: 20px;
}

.social-btn {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.social-btn:hover {
  border-color: #ff6b35;
  background-color: #fff5f2;
}

.google-btn {
  border-color: #4285F4;
  color: #4285F4;
}

.google-btn:hover {
  background-color: #4285F4;
  color: white;
}

.google-btn svg {
  flex-shrink: 0;
}

.step-panel {
  animation: fadeIn 0.3s ease;
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

.form {
  width: 100%;
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

select.form-input {
  cursor: pointer;
}

.role-buttons {
  display: flex;
  gap: 15px;
}

.role-btn {
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-btn.active {
  border-color: #ff6b35;
  background-color: #ff6b35;
  color: white;
}

.role-btn:hover:not(.active) {
  border-color: #ff6b35;
  color: #ff6b35;
}

.proceed-btn,
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

.proceed-btn:hover:not(:disabled),
.verify-btn:hover:not(:disabled) {
  background-color: #e55a2b;
}

.proceed-btn:disabled,
.verify-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 15px;
}

.back-action-btn {
  flex: 1;
  background-color: white;
  color: #666;
  border: 2px solid #e1e5e9;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-action-btn:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.verify-btn {
  flex: 2;
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

/* Responsive design */
@media (max-width: 480px) {
  .step-content {
    padding: 30px 15px;
  }
  
  .form-input {
    padding: 14px;
  }
  
  .role-buttons {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .verify-btn {
    flex: 1;
  }
  
  .progress-indicator {
    gap: 40px;
    padding: 0 15px;
  }
  
  .step-icon {
    width: 36px;
    height: 36px;
  }
  
  .step-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.1rem;
  }
  
  .progress-indicator {
    gap: 50px;
  }
}
</style>
