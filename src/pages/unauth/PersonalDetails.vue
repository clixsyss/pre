<template>
  <div class="personal-details-page">
    <!-- Header -->
    <div class="header">
      <button @click="goToOnboarding" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
      <div class="progress-step" :class="{ active: true }">
        <div class="step-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span class="step-label">Personal</span>
      </div>

      <!-- Property Step -->
      <div class="progress-step" :class="{ active: false, completed: false }">
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

    <!-- Content -->
    <div class="content">
      <div class="icon-section">
        <div class="icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="personal-form">
        <div class="form-group">
          <label for="email" class="form-label">E-mail</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            placeholder="Example@gmail.com"
            readonly
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              class="form-input"
              placeholder="First Name"
              required
              @input="saveToStore"
            />
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              class="form-input"
              placeholder="Last Name"
              required
              @input="saveToStore"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="mobile" class="form-label">Mobile Number</label>
                      <input
              id="mobile"
              v-model="formData.mobile"
              type="tel"
              class="form-input"
              placeholder="Mobile Number"
              required
              @input="saveToStore"
            />
        </div>

        <div class="form-group">
          <label for="dateOfBirth" class="form-label">Date of Birth</label>
          <div class="date-input-wrapper">
            <input
              id="dateOfBirth"
              v-model="formData.dateOfBirth"
              type="date"
              class="form-input"
              required
              @change="saveToStore"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="calendar-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Gender</label>
          <div class="gender-buttons">
                          <button 
                type="button"
                @click="() => { formData.gender = 'male'; saveToStore(); }"
                :class="['gender-btn', { active: formData.gender === 'male' }]"
              >
                Male
              </button>
                          <button 
                type="button"
                @click="() => { formData.gender = 'female'; saveToStore(); }"
                :class="['gender-btn', { active: formData.gender === 'female' }]"
              >
                Female
              </button>
          </div>
        </div>

        <div class="form-group">
          <label for="nationalId" class="form-label">National ID</label>
                      <input
              id="nationalId"
              v-model="formData.nationalId"
              type="text"
              class="form-input"
              placeholder="National ID"
              required
              @input="saveToStore"
            />
        </div>

        <div class="form-group">
          <label for="profilePicture" class="form-label">Profile Picture (Optional)</label>
          <div class="file-upload">
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              @change="handleProfilePictureUpload"
              class="file-input"
            />
            <label for="profilePicture" class="file-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ profilePictureFile ? profilePictureFile.name : 'Upload Profile Picture' }}</span>
            </label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="frontId" class="form-label">Front National ID Picture <span class="required">*</span></label>
            <div class="file-upload" :class="{ 'has-file': frontIdFile, 'required': true }">
              <input
                id="frontId"
                type="file"
                accept="image/*"
                @change="handleFrontIdUpload"
                class="file-input"
                required
              />
              <label for="frontId" class="file-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ frontIdFile ? frontIdFile.name : 'Upload Front ID' }}</span>
              </label>
            </div>
            <div v-if="frontIdFile" class="file-preview">
              <img :src="frontIdPreview" alt="Front ID Preview" class="preview-image" />
              <button type="button" @click="removeFrontId" class="remove-file-btn">Remove</button>
            </div>
          </div>

          <div class="form-group">
            <label for="backId" class="form-label">Back National ID Picture <span class="required">*</span></label>
            <div class="file-upload" :class="{ 'has-file': backIdFile, 'required': true }">
              <input
                id="backId"
                type="file"
                accept="image/*"
                @change="handleBackIdUpload"
                class="file-input"
                required
              />
              <label for="backId" class="file-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ backIdFile ? backIdFile.name : 'Upload Back ID' }}</span>
              </label>
            </div>
            <div v-if="backIdFile" class="file-preview">
              <img :src="backIdPreview" alt="Back ID Preview" class="preview-image" />
              <button type="button" @click="removeBackId" class="remove-file-btn">Remove</button>
            </div>
          </div>
        </div>

        <button type="submit" class="continue-btn" :disabled="loading">
          <span v-if="loading">Creating Account...</span>
          <span v-else>Continue</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../boot/firebase'
import { useRegistrationStore } from '../../stores/registration'
import { useNotificationStore } from '../../stores/notifications'
import fileUploadService from '../../services/fileUploadService'

// Component name for ESLint
defineOptions({
  name: 'PersonalDetailsPage'
})

const router = useRouter()
const registrationStore = useRegistrationStore()
const notificationStore = useNotificationStore()
const loading = ref(false)
const frontIdFile = ref(null)
const backIdFile = ref(null)
const profilePictureFile = ref(null)
const frontIdPreview = ref(null)
const backIdPreview = ref(null)

const formData = reactive({
  email: '',
  firstName: '',
  lastName: '',
  mobile: '',
  dateOfBirth: '',
  gender: 'male',
  nationalId: '',
})

onMounted(() => {
  // Get email from registration store
  const email = registrationStore.personalData.email || 'Example@gmail.com'
  formData.email = email
  
  // Load existing data from store if available
  if (registrationStore.userDetails.firstName) {
    formData.firstName = registrationStore.userDetails.firstName
    formData.lastName = registrationStore.userDetails.lastName
    formData.mobile = registrationStore.userDetails.mobile
    formData.dateOfBirth = registrationStore.userDetails.dateOfBirth
    formData.gender = registrationStore.userDetails.gender
    formData.nationalId = registrationStore.userDetails.nationalId
  }
})

const goToOnboarding = () => {
  console.log('goToOnboarding called from PersonalDetails, navigating to /onboarding')
  router.push('/onboarding')
}

const goToSignIn = () => {
  router.push('/signin')
}

const saveToStore = () => {
  // Save current form data to store
  registrationStore.setUserDetails({
    firstName: formData.firstName,
    lastName: formData.lastName,
    mobile: formData.mobile,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
    nationalId: formData.nationalId,
  })
}

const handleFrontIdUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    frontIdFile.value = file
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      frontIdPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleBackIdUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    backIdFile.value = file
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      backIdPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleProfilePictureUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    profilePictureFile.value = file
  }
}

const removeFrontId = () => {
  frontIdFile.value = null
  frontIdPreview.value = null
}

const removeBackId = () => {
  backIdFile.value = null
  backIdPreview.value = null
}

const handleSubmit = async () => {
  if (loading.value) return
  
  // Validate required fields
  if (!formData.firstName || !formData.lastName || !formData.mobile || 
      !formData.dateOfBirth || !formData.nationalId) {
    notificationStore.showError('Please fill in all required fields')
    return
  }

  // Validate required file uploads
  if (!frontIdFile.value || !backIdFile.value) {
    notificationStore.showError('Please upload both front and back National ID pictures')
    return
  }
  
  loading.value = true
  
  try {
    if (!auth.currentUser) {
      throw new Error('Not authenticated. Please start over.')
    }

    const userId = auth.currentUser.uid
    
    // Upload files
    const uploadedDocuments = await fileUploadService.uploadUserDocuments(
      userId,
      frontIdFile.value,
      backIdFile.value,
      profilePictureFile.value
    )
    console.log('Documents uploaded')

    // Save user details to store
    registrationStore.setUserDetails({
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      nationalId: formData.nationalId,
    })
    
    // Update Firebase profile
    await updateProfile(auth.currentUser, {
      displayName: `${formData.firstName} ${formData.lastName}`,
      photoURL: uploadedDocuments.profilePicture || null
    })
    console.log('Profile updated')
      
    // Save to Firestore
    await setDoc(doc(db, 'users', userId), {
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      nationalId: formData.nationalId,
      email: formData.email,
      fullName: `${formData.firstName} ${formData.lastName}`,
      documents: {
        frontIdUrl: uploadedDocuments.frontId,
        backIdUrl: uploadedDocuments.backId,
        profilePictureUrl: uploadedDocuments.profilePicture || null
      },
      projects: registrationStore.propertyData.projects || [],
      registrationStep: 'personal_complete',
      registrationStatus: 'in_progress',
      isProfileComplete: true,
      updatedAt: serverTimestamp()
    }, { merge: true })
    console.log('User data saved')
      
    notificationStore.showSuccess('Details saved! Continue to property selection.')
      
    // Navigate back to register
    router.push('/register')
  } catch (error) {
    console.error('Save error:', error)
    notificationStore.showError('Failed to save: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.personal-details-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.separator-line {
  height: 3px;
  background-color: #AF1E23;
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
  color: white;
  width: 48px;
  height: 48px;
}

.progress-step.completed .step-label {
  color: white;
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
  stroke: white;
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

.placeholder {
  width: 40px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.signin-header-btn {
  background-color: #AF1E23;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
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
  color: #AF1E23;
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #AF1E23;
}

.completion-info {
  display: flex;
  align-items: center;
  background-color: #e8f5e9; /* Light green background */
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #a5d6a7; /* Green border */
}

.info-icon {
  margin-right: 15px;
}

.info-icon svg {
  color: #4caf50; /* Green color for the icon */
}

.info-content h3 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1.1rem;
}

.info-content p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.step-navigation {
  margin-top: 30px;
  text-align: center;
}

.nav-divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #666;
  font-size: 0.9rem;
}

.nav-divider::before,
.nav-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e1e5e9;
}

.nav-divider span {
  padding: 0 15px;
  background-color: #f8f9fa;
}

.nav-options {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.nav-btn {
  flex: 1;
  padding: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.nav-btn.secondary {
  background-color: white;
  color: #666;
}

.content {
  padding: 40px 20px;
  max-width: 500px;
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

.personal-form {
  width: 100%;
}

.form-group {
  margin-bottom: 25px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
  font-weight: 700;
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
  /* iOS improvements */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
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

.date-input-wrapper {
  position: relative;
}

.date-input-wrapper input[type="date"] {
  /* iOS date input improvements */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none;
}

.date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.calendar-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
}

.gender-buttons {
  display: flex;
  gap: 15px;
}

.gender-btn {
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

.gender-btn.active {
  border-color: #AF1E23;
  background-color: #AF1E23;
  color: white;
}

.file-upload {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border: 2px dashed #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload.required .file-label {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.file-upload.has-file .file-label {
  border-color: #10b981;
  background-color: #f0fdf4;
  color: #059669;
}

.file-preview {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.preview-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 6px;
  margin-bottom: 10px;
}

.remove-file-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.continue-btn {
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

.continue-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 30px 15px;
  }
  
  .form-input {
    padding: 14px;
  }
  
  .gender-buttons {
    flex-direction: column;
  }
}
</style>
