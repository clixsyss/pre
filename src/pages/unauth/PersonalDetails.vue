<template>
  <div class="personal-details-page">
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

      <form @submit.prevent="handleSubmit" class="personal-form">
        <div class="form-group">
          <label for="email" class="form-label">E-mail</label>
          <input id="email" v-model="formData.email" type="email" class="form-input" placeholder="Example@gmail.com"
            readonly />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <input id="firstName" v-model="formData.firstName" type="text" class="form-input" placeholder="John"
              required @input="saveToStore" />
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <input id="lastName" v-model="formData.lastName" type="text" class="form-input" placeholder="Doe" required
              @input="saveToStore" />
          </div>
        </div>

        <div class="form-group">
          <label for="mobile" class="form-label">Mobile Number</label>
          <input id="mobile" v-model="formData.mobile" type="tel" class="form-input" placeholder="+20 123 456 7890"
            required @input="saveToStore" />
        </div>

        <div class="form-group">
          <label for="dateOfBirth" class="form-label">Date of Birth</label>
          <div class="date-input-wrapper">
            <input id="dateOfBirth" v-model="formData.dateOfBirth" type="date" class="form-input" required
              @change="saveToStore" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              class="calendar-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" />
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" />
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Gender</label>
          <div class="gender-buttons">
            <button type="button" @click="() => { formData.gender = 'male'; saveToStore(); }"
              :class="['gender-btn', { active: formData.gender === 'male' }]">
              Male
            </button>
            <button type="button" @click="() => { formData.gender = 'female'; saveToStore(); }"
              :class="['gender-btn', { active: formData.gender === 'female' }]">
              Female
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="nationalId" class="form-label">National ID</label>
          <input id="nationalId" v-model="formData.nationalId" type="text" class="form-input"
            placeholder="29912345678901" required @input="saveToStore" />
        </div>

        <div class="form-group">
          <label class="form-label">Profile Picture <span class="required">*</span></label>
          <div class="media-upload-options">
            <button type="button" @click="selectProfilePicture" class="upload-option-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              Upload Image
            </button>
          </div>
          <input ref="profilePictureInput" type="file" accept="image/*" @change="handleProfilePictureUpload"
            style="display: none" />
          <div v-if="profilePictureFile" class="file-preview">
            <img :src="profilePicturePreview" alt="Profile Picture Preview" class="preview-image" />
            <button type="button" @click="removeProfilePicture" class="remove-file-btn">✕ Remove</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Front National ID Picture <span class="required">*</span></label>
            <div class="media-upload-options">
              <button type="button" @click="selectFrontIdFromGallery" class="upload-option-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                Upload Image
              </button>
            </div>
            <input ref="frontIdInput" type="file" accept="image/*" @change="handleFrontIdUpload"
              style="display: none" />
            <div v-if="frontIdFile" class="file-preview">
              <img :src="frontIdPreview" alt="Front ID Preview" class="preview-image" />
              <button type="button" @click="removeFrontId" class="remove-file-btn">✕ Remove</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Back National ID Picture <span class="required">*</span></label>
            <div class="media-upload-options">
              <button type="button" @click="selectBackIdFromGallery" class="upload-option-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                Upload Image
              </button>
            </div>
            <input ref="backIdInput" type="file" accept="image/*" @change="handleBackIdUpload" style="display: none" />
            <div v-if="backIdFile" class="file-preview">
              <img :src="backIdPreview" alt="Back ID Preview" class="preview-image" />
              <button type="button" @click="removeBackId" class="remove-file-btn">✕ Remove</button>
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
import { useFormKeyboard } from '../../composables/useFormKeyboard'
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
const profilePicturePreview = ref(null)
const profilePictureInput = ref(null)
const frontIdInput = ref(null)
const backIdInput = ref(null)

// Setup keyboard handling for better mobile UX
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
  scrollOffset: 180
})

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
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePicturePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const selectProfilePicture = () => {
  profilePictureInput.value.click();
};

const removeProfilePicture = () => {
  profilePictureFile.value = null;
  profilePicturePreview.value = null;
};


const selectFrontIdFromGallery = () => {
  frontIdInput.value.click();
};

const removeFrontId = () => {
  frontIdFile.value = null;
  frontIdPreview.value = null;
};


const selectBackIdFromGallery = () => {
  backIdInput.value.click();
};

const removeBackId = () => {
  backIdFile.value = null;
  backIdPreview.value = null;
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

  // Validate profile picture is uploaded
  if (!profilePictureFile.value) {
    notificationStore.showError('Please upload a profile picture')
    return
  }

  loading.value = true

  try {
    console.log('[PersonalDetails] Getting user ID...')

    // Get the DynamoDB user ID (MongoDB ObjectId format) instead of Cognito userSub
    // This ensures S3 folders match the existing structure
    let userId = registrationStore.tempUserId // Fallback to Cognito userSub

    // Try to get the DynamoDB user by email to get the actual user ID
    try {
      const { getUserByEmail } = await import('src/services/dynamoDBUsersService')
      const dynamoUser = await getUserByEmail(formData.email.trim().toLowerCase())

      if (dynamoUser && dynamoUser.id) {
        // Use DynamoDB user ID (MongoDB ObjectId format) for S3 uploads
        userId = dynamoUser.id
        console.log('[PersonalDetails] ✅ Using DynamoDB user ID for S3 upload:', userId)
      } else {
        console.warn('[PersonalDetails] ⚠️ DynamoDB user not found, using Cognito userSub:', userId)
      }
    } catch (error) {
      console.warn('[PersonalDetails] ⚠️ Could not fetch DynamoDB user, using Cognito userSub:', error.message)
    }

    if (!userId) {
      console.error('[PersonalDetails] ❌ No userId found. Registration may have failed.')
      throw new Error('User ID not found. Please start registration over.')
    }

    console.log('[PersonalDetails] Using userId for S3 upload:', userId)

    // Upload files with detailed logging
    console.log('[PersonalDetails] Starting file upload...', {
      userId,
      hasFrontId: !!frontIdFile.value,
      hasBackId: !!backIdFile.value,
      hasProfile: !!profilePictureFile.value
    })

    const uploadedDocuments = await fileUploadService.uploadUserDocuments(
      userId,
      frontIdFile.value,
      backIdFile.value,
      profilePictureFile.value
    )
    console.log('[PersonalDetails] ✅ Documents uploaded:', uploadedDocuments)

    // Save user details to store
    registrationStore.setUserDetails({
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      nationalId: formData.nationalId,
    })

    console.log('[PersonalDetails] Saving user data to Firestore (non-blocking)...')

    // Save user details to store (for property page to use)
    registrationStore.setUserDetails({
      ...registrationStore.userDetails,
      firstName: formData.firstName,
      lastName: formData.lastName,
      mobile: formData.mobile,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      nationalId: formData.nationalId,
      documents: {
        frontIdUrl: uploadedDocuments.frontId,
        backIdUrl: uploadedDocuments.backId,
        profilePictureUrl: uploadedDocuments.profilePicture || null
      }
    })

    // Save to DynamoDB users table (non-blocking - don't wait)
    console.log('[PersonalDetails] Saving to DynamoDB users table (background)...')
      ; (async () => {
        try {
          const { updateUser } = await import('src/services/dynamoDBUsersService')
          await updateUser(userId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            mobile: formData.mobile,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            nationalId: formData.nationalId,
            email: formData.email.trim().toLowerCase(),
            fullName: `${formData.firstName} ${formData.lastName}`,
            documents: {
              frontIdUrl: uploadedDocuments.frontId,
              backIdUrl: uploadedDocuments.backId,
              profilePictureUrl: uploadedDocuments.profilePicture || null
            },
            registrationStep: 'personal_complete',
            registrationStatus: 'pending', // Still pending admin approval
            isProfileComplete: true
          })
          console.log('[PersonalDetails] ✅ DynamoDB save completed')
        } catch (e) {
          console.warn('[PersonalDetails] Background DynamoDB save failed:', e)
        }
      })()

    console.log('[PersonalDetails] DynamoDB save initiated in background')

    // DON'T clear password/token yet - needed for final save in Register.vue
    // Will be cleared after complete registration

    console.log('[PersonalDetails] Showing success notification')
    notificationStore.showSuccess('Details saved! Now let\'s verify your face.')

    console.log('[PersonalDetails] NAVIGATING to /register/face-verification')
    router.push('/register/face-verification')
    console.log('[PersonalDetails] ✅ Navigation triggered')
  } catch (error) {
    console.error('[PersonalDetails] ❌ Save error:', error)
    console.error('[PersonalDetails] Error type:', typeof error)
    console.error('[PersonalDetails] Error code:', error?.code)
    console.error('[PersonalDetails] Error message:', error?.message)
    console.error('[PersonalDetails] Error stack:', error?.stack)

    notificationStore.showError('Failed to save: ' + (error?.message || 'Unknown error'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.personal-details-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  /* Enable scrolling for keyboard visibility */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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
  line-height: normal;
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
  background-color: #e8f5e9;
  /* Light green background */
  padding: 15px 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  border: 1px solid #a5d6a7;
  /* Green border */
}

.info-icon {
  margin-right: 15px;
}

.info-icon svg {
  color: #4caf50;
  /* Green color for the icon */
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
  margin: 10px 0;
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
  /* Add extra bottom padding for keyboard */
  padding-bottom: 200px;
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
  margin-bottom: 20px;
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

/* Media Upload Options */
.media-upload-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.upload-option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.upload-option-btn:active {
  transform: scale(0.98);
  border-color: #AF1E23;
  background: #fef2f2;
  color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.upload-option-btn svg {
  flex-shrink: 0;
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
  margin-top: 12px;
  padding: 12px;
  border: 2px solid #10b981;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.preview-image {
  width: 100%;
  max-width: 250px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid white;
}

.remove-file-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.remove-file-btn:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.3);
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
    grid-template-columns: 1fr 1fr !important;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 30px 15px;
  }

  .form-input {
    padding: 14px;
  }
}
</style>
