<template>
  <div class="face-verification-settings-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading face verification...</p>
    </div>
    <FaceVerification 
      v-else
      :auto-start="!hasExistingPhotos"
      :existing-photos="existingPhotos"
      :read-only="hasExistingPhotos"
      @complete="handleVerificationComplete"
      @cancel="handleCancel"
      @skip="handleSkip"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notifications'
import FaceVerification from '../../components/FaceVerification.vue'
import fileUploadService from '../../services/fileUploadService'
import { updateUser, getUserById, getUserByAuthUid } from '../../services/dynamoDBUsersService'
import optimizedAuthService from '../../services/optimizedAuthService'

// Component name
defineOptions({
  name: 'FaceVerificationSettingsPage'
})

const router = useRouter()
const notificationStore = useNotificationStore()

const existingPhotos = ref(null)
const hasExistingPhotos = ref(false)
const loading = ref(true)

onMounted(async () => {
  try {
    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      loading.value = false
      return
    }
    
    // Get Cognito sub to look up user by authUid (more reliable than assuming ID = Cognito sub)
    const cognitoSub = currentUser?.attributes?.sub || currentUser?.cognitoAttributes?.sub || currentUser?.userSub || currentUser?.uid
    if (!cognitoSub) {
      loading.value = false
      return
    }

    // Try getUserByAuthUid first (searches by authUid field, more reliable)
    let userData = await getUserByAuthUid(cognitoSub)
    
    // Fallback to getUserById if authUid lookup fails
    if (!userData) {
      userData = await getUserById(cognitoSub)
    }
    
    if (userData) {
      console.log('[FaceVerificationSettingsPage] User data found:', {
        userId: userData.id,
        hasDocuments: !!userData?.documents,
        documentsKeys: userData?.documents ? Object.keys(userData.documents) : [],
        documents: userData?.documents
      })
      
      if (userData?.documents) {
        const { faceFrontUrl, faceLeftUrl, faceRightUrl } = userData.documents
        console.log('[FaceVerificationSettingsPage] Face verification URLs:', {
          faceFrontUrl,
          faceLeftUrl,
          faceRightUrl,
          hasAny: !!(faceFrontUrl || faceLeftUrl || faceRightUrl)
        })
        
        if (faceFrontUrl || faceLeftUrl || faceRightUrl) {
          existingPhotos.value = {
            faceFrontUrl,
            faceLeftUrl,
            faceRightUrl
          }
          hasExistingPhotos.value = true
          console.log('[FaceVerificationSettingsPage] User already has face verification photos')
        } else {
          console.log('[FaceVerificationSettingsPage] No face verification photos found')
        }
      }
    } else {
      console.warn('[FaceVerificationSettingsPage] User not found in DynamoDB')
    }
  } catch (error) {
    console.error('[FaceVerificationSettingsPage] Error checking existing photos:', error)
  } finally {
    loading.value = false
  }
})

const handleVerificationComplete = async (data) => {
  try {
    console.log('[FaceVerificationSettingsPage] Face verification completed:', data)
    
    // If user has existing photos, they can't update them
    if (hasExistingPhotos.value) {
      console.log('[FaceVerificationSettingsPage] User already has face verification, cannot update')
      notificationStore.showInfo('Face verification photos cannot be changed once uploaded.')
      router.back()
      return
    }
    
    if (data.skipped) {
      notificationStore.showInfo('Face verification skipped. You can complete it later.')
      router.back()
      return
    }

    // Get current authenticated user BEFORE any operations
    let currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      console.error('[FaceVerificationSettingsPage] ❌ User not authenticated')
      notificationStore.showError('You must be logged in to save face verification. Please log in again.')
      router.push('/sign-in')
      return
    }
    
    // Get Cognito sub to look up user by authUid (more reliable than assuming ID = Cognito sub)
    const cognitoSub = currentUser?.attributes?.sub || currentUser?.cognitoAttributes?.sub || currentUser?.userSub || currentUser?.uid
    if (!cognitoSub) {
      console.error('[FaceVerificationSettingsPage] ❌ Cognito sub not available')
      notificationStore.showError('User ID not found. Please try again.')
      return
    }

    // Get the correct user record using authUid (more reliable)
    let userData = await getUserByAuthUid(cognitoSub)
    if (!userData) {
      // Fallback to getUserById if authUid lookup fails
      userData = await getUserById(cognitoSub)
    }
    
    if (!userData || !userData.id) {
      console.error('[FaceVerificationSettingsPage] ❌ User data not found in DynamoDB')
      notificationStore.showError('User data not found. Please try again.')
      return
    }
    
    // Use the actual DynamoDB user ID (not the Cognito sub, which might not match)
    const userId = userData.id
    console.log('[FaceVerificationSettingsPage] Using DynamoDB user ID:', userId)

    // Upload photos to AWS S3 (use the actual DynamoDB user ID)
    console.log('[FaceVerificationSettingsPage] Uploading face verification photos to AWS S3...')
    const uploadedUrls = await fileUploadService.uploadFaceVerificationPhotos(userId, data.photos)
    console.log('[FaceVerificationSettingsPage] ✅ Face photos uploaded to S3:', uploadedUrls)

    // Verify user is still authenticated after upload
    currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      console.error('[FaceVerificationSettingsPage] ❌ User logged out during upload')
      notificationStore.showError('Session expired during upload. Please log in again.')
      router.push('/sign-in')
      return
    }

    // Re-fetch user data to ensure we have the latest documents
    userData = await getUserByAuthUid(cognitoSub)
    if (!userData) {
      userData = await getUserById(cognitoSub)
    }
    
    if (!userData) {
      console.error('[FaceVerificationSettingsPage] ❌ User data not found after upload')
      notificationStore.showError('User data not found. Please try again.')
      return
    }
    
    const existingDocuments = userData?.documents || {}
    
    // Merge face verification URLs with existing documents (don't overwrite existing fields)
    const updatedDocuments = {
      ...existingDocuments,
      faceFrontUrl: uploadedUrls.faceFrontUrl || uploadedUrls.faceFront || existingDocuments.faceFrontUrl || null,
      faceLeftUrl: uploadedUrls.faceLeftUrl || uploadedUrls.faceLeft || existingDocuments.faceLeftUrl || null,
      faceRightUrl: uploadedUrls.faceRightUrl || uploadedUrls.faceRight || existingDocuments.faceRightUrl || null,
    }
    
    console.log('[FaceVerificationSettingsPage] Merging documents:', {
      existing: existingDocuments,
      updated: updatedDocuments
    })

    // Verify user is still authenticated before update
    currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      console.error('[FaceVerificationSettingsPage] ❌ User logged out before update')
      notificationStore.showError('Session expired. Please log in again.')
      router.push('/sign-in')
      return
    }

    // Update DynamoDB user record with merged documents
    // Only update the documents field to avoid touching other fields
    let updatedUser
    try {
      updatedUser = await updateUser(userId, {
        documents: updatedDocuments
      })
      console.log('[FaceVerificationSettingsPage] ✅ DynamoDB user updated with face verification URLs')
    } catch (updateError) {
      console.error('[FaceVerificationSettingsPage] ❌ Error updating user in DynamoDB:', updateError)
      // Verify user is still authenticated after the failed update
      currentUser = await optimizedAuthService.getCurrentUser()
      if (!currentUser) {
        console.error('[FaceVerificationSettingsPage] ❌ User logged out due to update error')
        notificationStore.showError('Session expired. Please log in again.')
        router.push('/sign-in')
        return
      }
      // Re-throw the error to be caught by the outer catch block
      throw updateError
    }
    
    // Verify the update actually saved the face verification URLs
    if (updatedUser) {
      const savedDocs = updatedUser.documents || {}
      const hasFaceUrls = !!(savedDocs.faceFrontUrl || savedDocs.faceLeftUrl || savedDocs.faceRightUrl)
      if (!hasFaceUrls) {
        console.warn('[FaceVerificationSettingsPage] ⚠️ Face verification URLs not found in updated user data')
        // Don't fail - the update might have succeeded but the fetch failed
      }
    }
    
    // Final authentication check before navigation
    currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      console.error('[FaceVerificationSettingsPage] ❌ User logged out after update')
      notificationStore.showError('Session expired after update. Please log in again.')
      router.push('/sign-in')
      return
    }
    
    notificationStore.showSuccess('Face ID saved successfully!')
    
    // Clear any profile cache to force refresh
    if (window.__profileCache) {
      window.__profileCache = null
    }
    if (sessionStorage.getItem('profilePage_cache')) {
      sessionStorage.removeItem('profilePage_cache')
    }
    
    // Navigate back to profile
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    console.error('[FaceVerificationSettingsPage] ❌ Error handling face verification:', error)
    console.error('[FaceVerificationSettingsPage] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    // Check if user is still authenticated
    try {
      const currentUser = await optimizedAuthService.getCurrentUser()
      if (!currentUser) {
        console.error('[FaceVerificationSettingsPage] ❌ User was logged out due to error')
        notificationStore.showError('Session expired. Please log in again.')
        router.push('/sign-in')
        return
      }
    } catch (authError) {
      console.error('[FaceVerificationSettingsPage] ❌ Error checking auth state:', authError)
      notificationStore.showError('Authentication error. Please log in again.')
      router.push('/sign-in')
      return
    }
    
    // If still authenticated, show generic error
    notificationStore.showError('Failed to save Face ID. Please try again.')
  }
}

const handleCancel = () => {
  router.back()
}

const handleSkip = () => {
  notificationStore.showInfo('Face verification skipped. You can complete it later from your profile settings.')
  router.back()
}
</script>

<style scoped>
.face-verification-settings-page {
  width: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  color: #666;
  font-size: 14px;
}
</style>
