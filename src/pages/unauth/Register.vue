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

    <!-- Registration Info -->
    <div class="registration-info">
      <div class="info-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8V12" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 16H12.01" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="info-content">
        <h3>Create Your PRE Group Account</h3>
        <p>Complete the registration process to access PRE Group services. You'll be able to sign in after completing all steps.</p>
      </div>
    </div>

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

        <div class="registration-notice">
          <div class="notice-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8V12" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16H12.01" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="notice-title">Important Notice</h3>
          <p class="notice-text">
            To ensure proper account setup and verification, all new users must complete our custom registration process. 
            This helps us maintain security and provide personalized service for PRE Group members.
          </p>
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

        <div class="project-selection-info">
          <h3 class="info-title">Select Your Projects</h3>
          <p class="info-text">
            Choose from our available projects and specify your units. You can add multiple projects if needed.
          </p>
        </div>

        <!-- Project Selection Form -->
        <form @submit.prevent="handlePropertySubmit" class="form">
          <!-- Project Selection -->
          <div class="form-group">
            <label for="project" class="form-label">Project</label>
            <select id="project" v-model="propertyForm.selectedProject" class="form-input" required @change="onProjectChange">
              <option value="" disabled>Select Project</option>
              <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                {{ project.name }} - {{ project.type }} ({{ project.location }})
              </option>
            </select>
          </div>

          <!-- Unit Input -->
          <div class="form-group">
            <label for="unit" class="form-label">Unit Number/Name</label>
            <input
              id="unit"
              v-model="propertyForm.unit"
              type="text"
              class="form-input"
              placeholder="e.g., A1, Villa 5, Office 12"
              required
              :disabled="!propertyForm.selectedProject"
            />
          </div>

          <!-- Role Selection -->
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

          <!-- Add Project Button -->
          <div class="form-group">
            <button 
              type="button" 
              @click="addProjectToSelection" 
              class="add-project-btn"
              :disabled="!canAddProject"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Add This Project
            </button>
          </div>

          <!-- Selected Projects List -->
          <div v-if="selectedProjects.length > 0" class="selected-projects">
            <h4 class="selected-projects-title">Selected Projects</h4>
            <div class="projects-list">
              <div 
                v-for="(project, index) in selectedProjects" 
                :key="index" 
                class="project-item"
              >
                <div class="project-info">
                  <div class="project-name">{{ getProjectName(project.projectId) }}</div>
                  <div class="project-details">
                    Unit: {{ project.unit }} | Role: {{ project.role }}
                  </div>
                </div>
                <button 
                  type="button" 
                  @click="removeProject(index)" 
                  class="remove-project-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
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
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../../boot/firebase'

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
  selectedProject: '', // Stores the ID of the selected project
  unit: '',
  role: ''
})

const availableProjects = ref([])
const selectedProjects = ref([])

// Function to fetch available projects from Firestore
const fetchAvailableProjects = async () => {
  try {
    const projectsRef = collection(db, 'projects')
    const snapshot = await getDocs(projectsRef)
    availableProjects.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching available projects:', error)
    notificationStore.showError('Failed to load projects. Please try again later.')
  }
}

// Function to get project name by ID
const getProjectName = (projectId) => {
  const project = availableProjects.value.find(p => p.id === projectId)
  return project ? `${project.name} - ${project.type}` : 'N/A'
}

// Function to add a project to the selected projects list
const addProjectToSelection = () => {
  if (propertyForm.selectedProject && propertyForm.unit) {
    selectedProjects.value.push({
      projectId: propertyForm.selectedProject,
      unit: propertyForm.unit,
      role: propertyForm.role
    })
    propertyForm.selectedProject = ''
    propertyForm.unit = ''
    propertyForm.role = ''
    notificationStore.showSuccess('Project added to selection!')
  } else {
    notificationStore.showError('Please select a project and enter a unit number/name.')
  }
}

// Function to remove a project from the selected projects list
const removeProject = (index) => {
  selectedProjects.value.splice(index, 1)
  notificationStore.showSuccess('Project removed from selection!')
}

// Function to handle project selection change
const onProjectChange = () => {
  // Clear unit input when project changes
  propertyForm.unit = ''
  propertyForm.role = ''
}

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
  
  // Fetch available projects on mount
  fetchAvailableProjects()
  
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
    return selectedProjects.value.length > 0 && !loading.value
  }
  return false
})

const canAddProject = computed(() => {
  return propertyForm.selectedProject && propertyForm.unit && propertyForm.role
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
  
  if (selectedProjects.value.length === 0) {
    notificationStore.showError('Please select at least one project.')
    return
  }
  
  loading.value = true
  
  try {
    // Store property data in registration store
    registrationStore.setPropertyData({
      compound: '', // Compound is not directly stored here, handled by individual projects
      unit: '', // Unit is not directly stored here, handled by individual projects
      role: '', // Role is not directly stored here, handled by individual projects
      projects: selectedProjects.value
    })
    
    // Update user data in Firestore with property information
    if (registrationStore.tempUserId) {
      const propertyUpdateData = {
        projects: selectedProjects.value,
        registrationStep: 'property'
      }
      
      await updateUserDataInFirestore(registrationStore.tempUserId, propertyUpdateData)
    }
    
    console.log('Property form submitted:', selectedProjects.value)
    
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

.registration-info {
  display: flex;
  align-items: center;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  margin-top: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  margin-right: 15px;
}

.info-content {
  flex: 1;
}

.info-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #856404;
  margin: 0 0 10px 0;
}

.info-content p {
  color: #856404;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
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

.registration-notice {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.notice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  margin-bottom: 15px;
}

.notice-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #856404;
  margin: 0 0 10px 0;
}

.notice-text {
  color: #856404;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
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

.add-project-btn {
  width: 100%;
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.add-project-btn:hover:not(:disabled) {
  background-color: #1976D2;
}

.add-project-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.selected-projects {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.selected-projects-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.projects-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.project-item:last-child {
  border-bottom: none;
}

.project-info {
  flex: 1;
}

.project-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.project-details {
  font-size: 0.9rem;
  color: #666;
}

.remove-project-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.remove-project-btn:hover {
  background-color: #f0f0f0;
}

.remove-project-btn svg {
  stroke: #ff6b35;
}

.project-selection-info {
  background-color: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
  margin: 0 0 10px 0;
}

.info-text {
  color: #1976d2;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
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
