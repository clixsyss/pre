<template>
  <div class="document-verification-overlay" @click.stop>
    <div class="document-verification-container" @click.stop>
      <!-- Header -->
      <div class="verification-header">
        <h2 class="verification-title">Complete Your Profile</h2>
        <p class="verification-subtitle">Please upload the following documents to continue using the app</p>
      </div>

      <!-- Body -->
      <div class="verification-body">
        <!-- Upload Sections -->
        <div class="upload-sections">
        <!-- Profile Picture - Only show if missing -->
        <div v-if="missingDocuments.profilePicture" class="upload-section" :class="{ 'uploaded': profilePicturePreview }">
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

        <!-- Front ID - Only show if missing -->
        <div v-if="missingDocuments.frontId" class="upload-section" :class="{ 'uploaded': frontIdFile }">
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
            <div v-if="frontIdFile" class="check-icon">✓</div>
          </div>
          
          <div class="upload-area" @click="selectFrontId">
            <input 
              ref="frontIdInput" 
              type="file" 
              accept="image/*,.pdf,application/pdf" 
              @change="handleFrontIdUpload"
              style="display: none;"
            />
            <div v-if="!frontIdFile" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span>Tap to upload</span>
            </div>
            <img v-else-if="frontIdPreview" :src="frontIdPreview" alt="Front ID Preview" class="preview-image" />
            <div v-else class="document-preview">{{ frontIdFile?.name || 'Document selected' }}</div>
          </div>
          <button v-if="frontIdFile" @click.stop="removeFrontId" class="remove-btn">Remove</button>
        </div>

        <!-- Back ID - Only show if missing -->
        <div v-if="missingDocuments.backId" class="upload-section" :class="{ 'uploaded': backIdFile }">
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
            <div v-if="backIdFile" class="check-icon">✓</div>
          </div>
          
          <div class="upload-area" @click="selectBackId">
            <input 
              ref="backIdInput" 
              type="file" 
              accept="image/*,.pdf,application/pdf" 
              @change="handleBackIdUpload"
              style="display: none;"
            />
            <div v-if="!backIdFile" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span>Tap to upload</span>
            </div>
            <img v-else-if="backIdPreview" :src="backIdPreview" alt="Back ID Preview" class="preview-image" />
            <div v-else class="document-preview">{{ backIdFile?.name || 'Document selected' }}</div>
          </div>
          <button v-if="backIdFile" @click.stop="removeBackId" class="remove-btn">Remove</button>
        </div>

        <!-- Property Contract - Only show if missing -->
        <div v-if="missingDocuments.propertyContract" class="upload-section" :class="{ 'uploaded': propertyContractFiles.length > 0 }">
          <div class="section-header">
            <div class="section-icon id">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H6.75A2.25 2.25 0 004.5 4.5v15A2.25 2.25 0 006.75 21.75h10.5a2.25 2.25 0 002.25-2.25V16.5" />
              </svg>
            </div>
            <div class="section-title">
              <h3>{{ t('propertyDeedContract') }}</h3>
              <p>Upload deed/contract (image or PDF)</p>
            </div>
            <div v-if="propertyContractFiles.length > 0" class="check-icon">✓</div>
          </div>

          <div class="upload-area" @click="selectPropertyContract">
            <input
              ref="propertyContractInput"
              type="file"
              accept="image/*,.pdf,application/pdf"
              @change="handlePropertyContractUpload"
              style="display: none;"
            />
            <div v-if="!propertyContractFiles.length" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="upload-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span>Tap to upload</span>
            </div>
            <img v-else-if="propertyContractPreview" :src="propertyContractPreview" alt="Property Contract Preview" class="preview-image" />
            <div v-else class="document-preview">{{ propertyContractFiles.length > 1 ? `${propertyContractFiles.length} files selected` : (propertyContractFiles[0]?.name || 'Document selected') }}</div>
          </div>
          <button v-if="propertyContractFiles.length" @click.stop="removePropertyContract" class="remove-btn">Remove</button>
          <button v-if="propertyContractFiles.length" @click.stop="selectPropertyContract" class="remove-btn">{{ t('addAnotherContractDeed') }}</button>
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
import { useI18n } from 'vue-i18n'
import fileUploadService from '../services/fileUploadService'
import optimizedAuthService from '../services/optimizedAuthService'
import { updateUser, getUserById } from '../services/dynamoDBUsersService'
import { useNotificationStore } from '../stores/notifications'

const notificationStore = useNotificationStore()
const { t } = useI18n()

const emit = defineEmits(['documentsUploaded'])

// Props to check what documents are missing
const props = defineProps({
  missingDocuments: {
    type: Object,
    required: true,
    default: () => ({
      profilePicture: true,
      frontId: true,
      backId: true,
      propertyContract: true
    })
  }
})

// File refs
const profilePictureInput = ref(null)
const frontIdInput = ref(null)
const backIdInput = ref(null)
const propertyContractInput = ref(null)

// Preview refs
const profilePicturePreview = ref(null)
const frontIdPreview = ref(null)
const backIdPreview = ref(null)
const propertyContractPreview = ref(null)

// File data refs
const profilePictureFile = ref(null)
const frontIdFile = ref(null)
const backIdFile = ref(null)
const propertyContractFiles = ref([])

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
  event.target.value = ''
  if (file) {
    const mime = (file.type || '').toLowerCase()
    const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(file.name || '')
    if (!mime.startsWith('image/') && !isPdf) {
      notificationStore.showError('Please select an image or PDF document')
      return
    }
    frontIdFile.value = file
    if ((file.type || '').startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        frontIdPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    } else {
      frontIdPreview.value = null
    }
  }
}

const handleBackIdUpload = (event) => {
  const file = event.target.files[0]
  event.target.value = ''
  if (file) {
    const mime = (file.type || '').toLowerCase()
    const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(file.name || '')
    if (!mime.startsWith('image/') && !isPdf) {
      notificationStore.showError('Please select an image or PDF document')
      return
    }
    backIdFile.value = file
    if ((file.type || '').startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        backIdPreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    } else {
      backIdPreview.value = null
    }
  }
}

const handlePropertyContractUpload = (event) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (files.length > 0) {
    for (const file of files) {
      const mime = (file.type || '').toLowerCase()
      const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(file.name || '')
      if (!mime.startsWith('image/') && !isPdf) {
        notificationStore.showError('Please select image or PDF documents only')
        return
      }
    }
    const nextFiles = [...propertyContractFiles.value]
    files.forEach((file) => nextFiles.push(file))
    propertyContractFiles.value = nextFiles
    const first = propertyContractFiles.value[0]
    if ((first.type || '').startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        propertyContractPreview.value = e.target.result
      }
      reader.readAsDataURL(first)
    } else {
      propertyContractPreview.value = null
    }
  }
}

// Select handlers
const selectProfilePicture = () => {
  if (profilePictureInput.value) profilePictureInput.value.value = ''
  profilePictureInput.value.click()
}

const selectFrontId = () => {
  if (frontIdInput.value) frontIdInput.value.value = ''
  frontIdInput.value.click()
}

const selectBackId = () => {
  if (backIdInput.value) backIdInput.value.value = ''
  backIdInput.value.click()
}

const selectPropertyContract = () => {
  if (propertyContractInput.value) propertyContractInput.value.value = ''
  propertyContractInput.value.click()
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

const removePropertyContract = () => {
  propertyContractFiles.value = []
  propertyContractPreview.value = null
}

// Check if all required documents are uploaded
const canSubmit = computed(() => {
  const needsProfilePicture = props.missingDocuments.profilePicture
  const needsFrontId = props.missingDocuments.frontId
  const needsBackId = props.missingDocuments.backId
  const needsPropertyContract = props.missingDocuments.propertyContract

  const hasProfilePicture = !needsProfilePicture || profilePictureFile.value
  const hasFrontId = !needsFrontId || frontIdFile.value
  const hasBackId = !needsBackId || backIdFile.value
  const hasPropertyContract = !needsPropertyContract || propertyContractFiles.value.length > 0

  return hasProfilePicture && hasFrontId && hasBackId && hasPropertyContract
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

    // Resolve canonical DynamoDB user ID
    let userId = currentUser.uid || currentUser.userSub || currentUser.id || currentUser.username
    const currentEmail = (currentUser.email || currentUser.attributes?.email || '').trim().toLowerCase()
    
    // If userId looks like an email, try to get DynamoDB user ID
    if (userId && userId.includes('@')) {
      try {
        const { getUserByEmail } = await import('../services/dynamoDBUsersService')
        const dynamoUser = await getUserByEmail(userId)
        if (dynamoUser && dynamoUser.id) {
          userId = dynamoUser.id
          console.log('[DocumentVerification] Using DynamoDB user ID:', userId)
        }
      } catch (error) {
        console.warn('[DocumentVerification] Could not fetch DynamoDB user by email:', error)
      }
    }

    if (!userId && currentEmail) {
      try {
        const { getUserByEmail } = await import('../services/dynamoDBUsersService')
        const byEmail = await getUserByEmail(currentEmail)
        if (byEmail?.id) {
          userId = byEmail.id
          console.log('[DocumentVerification] Resolved user ID by email:', userId)
        }
      } catch (error) {
        console.warn('[DocumentVerification] Could not resolve user by email:', error)
      }
    }
    
    if (!userId) {
      throw new Error('User ID not found')
    }

    // Prepare files to upload (only upload missing documents)
    const filesToUpload = {
      profilePicture: props.missingDocuments.profilePicture ? profilePictureFile.value : null,
      frontId: props.missingDocuments.frontId ? frontIdFile.value : null,
      backId: props.missingDocuments.backId ? backIdFile.value : null,
      propertyContract: props.missingDocuments.propertyContract ? propertyContractFiles.value : null
    }

    console.log('[DocumentVerification] Uploading documents:', {
      userId,
      hasProfilePicture: !!filesToUpload.profilePicture,
      hasFrontId: !!filesToUpload.frontId,
      hasBackId: !!filesToUpload.backId,
      propertyContractFiles: Array.isArray(filesToUpload.propertyContract) ? filesToUpload.propertyContract.length : 0
    })

    // Upload documents using the file upload service
    const uploadedDocuments = await fileUploadService.uploadUserDocuments(
      userId,
      filesToUpload.frontId,
      filesToUpload.backId,
      filesToUpload.profilePicture,
      filesToUpload.propertyContract
    )

    console.log('[DocumentVerification] Documents uploaded:', uploadedDocuments)

    // Get existing user to preserve existing documents
    let existingUser = await getUserById(userId)
    if (!existingUser && currentEmail) {
      try {
        const { getUserByEmail } = await import('../services/dynamoDBUsersService')
        const byEmail = await getUserByEmail(currentEmail)
        if (byEmail?.id) {
          userId = byEmail.id
          existingUser = byEmail
          console.log('[DocumentVerification] Switched to DynamoDB user ID for update:', userId)
        }
      } catch (error) {
        console.warn('[DocumentVerification] Could not fetch fallback user by email:', error)
      }
    }
    const existingDocuments = existingUser?.documents || {}

    // Merge uploaded documents with existing documents
    const updatedDocuments = {
      ...existingDocuments
    }

    // Only update the documents that were uploaded
    if (uploadedDocuments.profilePicture) {
      updatedDocuments.profilePictureUrl = uploadedDocuments.profilePicture
    }
    if (uploadedDocuments.frontId) {
      updatedDocuments.frontIdUrl = uploadedDocuments.frontId
    }
    if (uploadedDocuments.backId) {
      updatedDocuments.backIdUrl = uploadedDocuments.backId
    }
    if (uploadedDocuments.propertyContract) {
      updatedDocuments.propertyContractUrl = uploadedDocuments.propertyContract
    }
    if (uploadedDocuments.propertyContractUrls?.length) {
      updatedDocuments.propertyContractUrls = uploadedDocuments.propertyContractUrls
    }

    // Update user document in DynamoDB
    await updateUser(userId, {
      documents: updatedDocuments,
      updatedAt: new Date().toISOString()
    })

    console.log('[DocumentVerification] DynamoDB updated successfully')

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
/* Modal Overlay - matches app's dark theme - non-skippable */
.document-verification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
  /* Prevent clicking outside modal - make it non-skippable */
  pointer-events: auto;
  /* Prevent scrolling when modal is open */
  overflow: hidden;
}

/* Modal Container - matches app's card styling */
.document-verification-container {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-height: 93vh;
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

.document-preview {
  width: 100%;
  min-height: 120px;
  max-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
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

