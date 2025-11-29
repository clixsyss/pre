<template>
  <div class="document-verification-overlay">
    <div class="document-verification-container">
      <!-- Header -->
      <div class="verification-header">
        <h2 class="verification-title">Complete Your Profile</h2>
        <p class="verification-subtitle">Please upload the following documents to continue using the app</p>
      </div>

      <!-- Body -->
      <div class="verification-body">
        <!-- Upload Sections -->
        <div class="upload-sections">
        <!-- Profile Picture -->
        <div class="upload-section" :class="{ 'uploaded': profilePicturePreview }">
          <div class="section-header">
            <div class="section-icon profile">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="section-title">
              <h3>Profile Picture</h3>
              <p>Upload a clear photo of yourself</p>
            </div>
            <div v-if="profilePicturePreview" class="check-icon">✓</div>
          </div>
          
          <div class="upload-area" @click="selectProfilePicture">
            <input 
              ref="profilePictureInput" 
              type="file" 
              accept="image/*" 
              @change="handleProfilePictureUpload"
              style="display: none;"
            />
            <div v-if="!profilePicturePreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span>Tap to upload</span>
            </div>
            <img v-else :src="profilePicturePreview" alt="Profile Preview" class="preview-image" />
          </div>
          <button v-if="profilePicturePreview" @click.stop="removeProfilePicture" class="remove-btn">Remove</button>
        </div>

        <!-- Front ID -->
        <div class="upload-section" :class="{ 'uploaded': frontIdPreview }">
          <div class="section-header">
            <div class="section-icon id">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
            </div>
            <div class="section-title">
              <h3>Front of National ID</h3>
              <p>Clear photo of the front side</p>
            </div>
            <div v-if="frontIdPreview" class="check-icon">✓</div>
          </div>
          
          <div class="upload-area" @click="selectFrontId">
            <input 
              ref="frontIdInput" 
              type="file" 
              accept="image/*" 
              @change="handleFrontIdUpload"
              style="display: none;"
            />
            <div v-if="!frontIdPreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span>Tap to upload</span>
            </div>
            <img v-else :src="frontIdPreview" alt="Front ID Preview" class="preview-image" />
          </div>
          <button v-if="frontIdPreview" @click.stop="removeFrontId" class="remove-btn">Remove</button>
        </div>

        <!-- Back ID -->
        <div class="upload-section" :class="{ 'uploaded': backIdPreview }">
          <div class="section-header">
            <div class="section-icon id">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
              </svg>
            </div>
            <div class="section-title">
              <h3>Back of National ID</h3>
              <p>Clear photo of the back side</p>
            </div>
            <div v-if="backIdPreview" class="check-icon">✓</div>
          </div>
          
          <div class="upload-area" @click="selectBackId">
            <input 
              ref="backIdInput" 
              type="file" 
              accept="image/*" 
              @change="handleBackIdUpload"
              style="display: none;"
            />
            <div v-if="!backIdPreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span>Tap to upload</span>
            </div>
            <img v-else :src="backIdPreview" alt="Back ID Preview" class="preview-image" />
          </div>
          <button v-if="backIdPreview" @click.stop="removeBackId" class="remove-btn">Remove</button>
        </div>
      </div>

        <!-- Submit Button -->
        <button 
        @click="handleSubmit" 
        class="submit-btn"
        :disabled="!canSubmit || loading"
        :class="{ 'loading': loading }"
      >
        <span v-if="!loading">Submit Documents</span>
        <span v-else class="loading-text">
          <svg class="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
          </svg>
          Uploading...
        </span>
        </button>

        <!-- Info Message -->
        <p class="info-message">
          All documents are required to use the app. Your information will be kept secure and private.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../boot/firebase'
import fileUploadService from '../services/fileUploadService'
import optimizedAuthService from '../services/optimizedAuthService'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()

const emit = defineEmits(['documentsUploaded'])

// Props to check what documents are missing
const props = defineProps({
  missingDocuments: {
    type: Object,
    required: true,
    default: () => ({
      profilePicture: true,
      frontId: true,
      backId: true
    })
  }
})

// File refs
const profilePictureInput = ref(null)
const frontIdInput = ref(null)
const backIdInput = ref(null)

// Preview refs
const profilePicturePreview = ref(null)
const frontIdPreview = ref(null)
const backIdPreview = ref(null)

// File data refs
const profilePictureFile = ref(null)
const frontIdFile = ref(null)
const backIdFile = ref(null)

const loading = ref(false)

// Upload handlers
const handleProfilePictureUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    profilePictureFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePicturePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleFrontIdUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    frontIdFile.value = file
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
    const reader = new FileReader()
    reader.onload = (e) => {
      backIdPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Select handlers
const selectProfilePicture = () => {
  profilePictureInput.value.click()
}

const selectFrontId = () => {
  frontIdInput.value.click()
}

const selectBackId = () => {
  backIdInput.value.click()
}

// Remove handlers
const removeProfilePicture = () => {
  profilePictureFile.value = null
  profilePicturePreview.value = null
}

const removeFrontId = () => {
  frontIdFile.value = null
  frontIdPreview.value = null
}

const removeBackId = () => {
  backIdFile.value = null
  backIdPreview.value = null
}

// Check if all required documents are uploaded
const canSubmit = computed(() => {
  const needsProfilePicture = props.missingDocuments.profilePicture
  const needsFrontId = props.missingDocuments.frontId
  const needsBackId = props.missingDocuments.backId

  const hasProfilePicture = !needsProfilePicture || profilePictureFile.value
  const hasFrontId = !needsFrontId || frontIdFile.value
  const hasBackId = !needsBackId || backIdFile.value

  return hasProfilePicture && hasFrontId && hasBackId
})

// Submit handler
const handleSubmit = async () => {
  if (!canSubmit.value || loading.value) return

  loading.value = true

  try {
    console.log('[DocumentVerification] Starting document upload...')
    
    // Get current user
    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      throw new Error('No authenticated user found')
    }

    const userId = currentUser.uid

    // Prepare files to upload (only upload missing documents)
    const filesToUpload = {
      profilePicture: props.missingDocuments.profilePicture ? profilePictureFile.value : null,
      frontId: props.missingDocuments.frontId ? frontIdFile.value : null,
      backId: props.missingDocuments.backId ? backIdFile.value : null
    }

    console.log('[DocumentVerification] Uploading documents:', {
      userId,
      hasProfilePicture: !!filesToUpload.profilePicture,
      hasFrontId: !!filesToUpload.frontId,
      hasBackId: !!filesToUpload.backId
    })

    // Upload documents using the file upload service
    const uploadedDocuments = await fileUploadService.uploadUserDocuments(
      userId,
      filesToUpload.frontId,
      filesToUpload.backId,
      filesToUpload.profilePicture
    )

    console.log('[DocumentVerification] Documents uploaded:', uploadedDocuments)

    // Update user document in Firestore
    const userDocRef = doc(db, 'users', userId)
    const updateData = {
      updatedAt: serverTimestamp()
    }

    // Only update the documents that were uploaded
    if (uploadedDocuments.profilePicture) {
      updateData['documents.profilePictureUrl'] = uploadedDocuments.profilePicture
    }
    if (uploadedDocuments.frontId) {
      updateData['documents.frontIdUrl'] = uploadedDocuments.frontId
    }
    if (uploadedDocuments.backId) {
      updateData['documents.backIdUrl'] = uploadedDocuments.backId
    }

    await updateDoc(userDocRef, updateData)

    console.log('[DocumentVerification] Firestore updated successfully')

    notificationStore.showSuccess('Documents uploaded successfully!')

    // Emit event to notify parent component
    emit('documentsUploaded')
  } catch (error) {
    console.error('[DocumentVerification] Error uploading documents:', error)
    notificationStore.showError('Failed to upload documents. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Modal Overlay - matches app's dark theme */
.document-verification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
}

/* Modal Container - matches app's card styling */
.document-verification-container {
  background: white;
  border-radius: 8px;
  max-width: 95%;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Header - matches app's header styling */
.verification-header {
  background-color: #222222;
  color: white;
  padding: 30px;
  border-radius: 8px 8px 0 0;
  text-align: center;
}

.verification-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.verification-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

/* Body - matches app's content padding */
.verification-body {
  padding: 40px 30px;
}

.upload-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.upload-section {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  background: white;
}

.upload-section.uploaded {
  border-color: #4CAF50;
  background-color: #e8f5e9;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-icon.profile {
  background-color: #AF1E23;
}

.section-icon.id {
  background-color: #AF1E23;
}

.section-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.section-title {
  flex: 1;
}

.section-title h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: normal;
}

.section-title p {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.check-icon {
  width: 28px;
  height: 28px;
  background: #4CAF50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.upload-area {
  background: #f8f9fa;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.upload-area:active {
  border-color: #AF1E23;
  background: #fef2f2;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  padding: 20px;
}

.upload-icon {
  width: 32px;
  height: 32px;
}

.upload-placeholder span {
  font-size: 0.9rem;
  font-weight: 500;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 120px;
  max-height: 200px;
}

.remove-btn {
  margin-top: 8px;
  width: 100%;
  padding: 10px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:active {
  background: #fecaca;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background-color: #AF1E23;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:active:not(:disabled) {
  background-color: #8B1A1F;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.submit-btn.loading {
  pointer-events: none;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.info-message {
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 480px) {
  .document-verification-container {
    margin: 10px;
    border-radius: 6px;
  }
  
  .verification-header {
    padding: 25px 20px;
  }
  
  .verification-title {
    font-size: 1.5rem;
  }
  
  .verification-body {
    padding: 30px 20px;
  }
  
  .upload-section {
    padding: 12px;
  }
  
  .section-title h3 {
    font-size: 0.9rem;
  }
  
  .section-title p {
    font-size: 0.8rem;
  }
  
  .submit-btn {
    padding: 14px;
    font-size: 0.95rem;
  }
}
</style>

