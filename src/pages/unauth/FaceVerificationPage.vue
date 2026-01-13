<template>
  <div class="face-verification-page">
    <FaceVerification 
      :auto-start="true"
      @complete="handleVerificationComplete"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../../stores/registration'
import { useNotificationStore } from '../../stores/notifications'
import FaceVerification from '../../components/FaceVerification.vue'

// Component name
defineOptions({
  name: 'FaceVerificationPage'
})

const router = useRouter()
const registrationStore = useRegistrationStore()
const notificationStore = useNotificationStore()

const handleVerificationComplete = async (data) => {
  try {
    console.log('[FaceVerificationPage] Face verification completed:', data)
    
    if (data.skipped) {
      // User skipped face verification
      console.log('[FaceVerificationPage] Face verification was skipped')
      registrationStore.setFaceVerificationPhotos({
        frontPhoto: null,
        leftPhoto: null,
        rightPhoto: null,
        allPhotos: [],
        skipped: true
      })
      
      notificationStore.showInfo('Face verification skipped. You can complete it later from your profile settings.')
    } else {
      // User completed face verification - upload to AWS S3
      console.log('[FaceVerificationPage] Uploading face verification photos to AWS S3...')
      
      try {
        // Get user ID from registration store or tempUserId
        const userId = registrationStore.firestoreUserId || registrationStore.tempUserId
        
        if (!userId) {
          console.warn('[FaceVerificationPage] No user ID available yet, storing photos for later upload')
          // Store photos in registration store for later upload
          registrationStore.setFaceVerificationPhotos({
            frontPhoto: data.frontPhoto,
            leftPhoto: data.leftPhoto,
            rightPhoto: data.rightPhoto,
            allPhotos: data.photos,
            skipped: false
          })
          notificationStore.showSuccess('Face verification completed! Photos will be saved after account creation.')
        } else {
          // Upload photos to AWS S3
          const fileUploadService = (await import('../../services/fileUploadService')).default
          
          const uploadedPhotos = await fileUploadService.uploadFaceVerificationPhotos(userId, data.photos)
          console.log('[FaceVerificationPage] ✅ Face photos uploaded to S3:', uploadedPhotos)
          
          // Save photo URLs to DynamoDB
          try {
            const { updateUser, getUserById } = await import('../../services/dynamoDBUsersService')
            
            // Get existing user to preserve existing documents
            const existingUser = await getUserById(userId)
            const existingDocuments = existingUser?.documents || {}
            
            // Merge face verification URLs with existing documents
            const updatedDocuments = {
              ...existingDocuments,
              faceFrontUrl: uploadedPhotos.faceFrontUrl || uploadedPhotos.faceFront || null,
              faceLeftUrl: uploadedPhotos.faceLeftUrl || uploadedPhotos.faceLeft || null,
              faceRightUrl: uploadedPhotos.faceRightUrl || uploadedPhotos.faceRight || null
            }
            
            // Remove null values to keep documents clean
            Object.keys(updatedDocuments).forEach(key => {
              if (updatedDocuments[key] === null) {
                delete updatedDocuments[key]
              }
            })
            
            // Update user document with merged documents
            await updateUser(userId, {
              documents: updatedDocuments
            })
            
            console.log('[FaceVerificationPage] ✅ Face verification photos saved to DynamoDB')
          } catch (dbError) {
            console.error('[FaceVerificationPage] Error saving to DynamoDB:', dbError)
            // Photos are already uploaded to S3, so continue
          }
          
          // Store in registration store for reference
          registrationStore.setFaceVerificationPhotos({
            frontPhoto: data.frontPhoto,
            leftPhoto: data.leftPhoto,
            rightPhoto: data.rightPhoto,
            allPhotos: data.photos,
            skipped: false,
            uploaded: true,
            urls: uploadedPhotos
          })
          
          notificationStore.showSuccess('Face verification completed and saved!')
        }
      } catch (uploadError) {
        console.error('[FaceVerificationPage] Error uploading photos:', uploadError)
        // Store photos in registration store as fallback
        registrationStore.setFaceVerificationPhotos({
          frontPhoto: data.frontPhoto,
          leftPhoto: data.leftPhoto,
          rightPhoto: data.rightPhoto,
          allPhotos: data.photos,
          skipped: false
        })
        notificationStore.showWarning('Face verification completed, but photos will be saved after account creation.')
      }
    }
    
    // Navigate to property selection
    setTimeout(() => {
      router.push('/register')
    }, 1000)
  } catch (error) {
    console.error('[FaceVerificationPage] Error handling verification:', error)
    notificationStore.showError('Failed to save verification photos. Please try again.')
  }
}

const handleCancel = () => {
  // User canceled, go back to personal details
  router.push('/register/personal-details')
}
</script>

<style scoped>
.face-verification-page {
  width: 100%;
  padding: 20px;
}
</style>
