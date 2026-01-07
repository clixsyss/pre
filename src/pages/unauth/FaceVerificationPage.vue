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
      // User completed face verification
      // Store face verification photos in registration store
      registrationStore.setFaceVerificationPhotos({
        frontPhoto: data.frontPhoto,
        leftPhoto: data.leftPhoto,
        rightPhoto: data.rightPhoto,
        allPhotos: data.photos,
        skipped: false
      })
      
      // TODO: Upload photos to backend/storage when backend integration is ready
      // For now, we'll just store them in the registration store
      // The photos are stored as base64 data URLs
      
      notificationStore.showSuccess('Face verification completed!')
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
  height: 100vh;
  overflow: hidden;
}
</style>
