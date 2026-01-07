<template>
  <div class="face-verification">
    <!-- Welcome Screen -->
    <div v-if="currentStep === 'welcome'" class="welcome-screen">
      <div class="welcome-content">
        <div class="welcome-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 4.5L14.5 6.5L12 8L9.5 6.5L10.5 4.5L9 4L3 7V9L9 11.5V19L7 20.5V22L12 20L17 22V20.5L15 19V11.5L21 9Z"
              fill="#AF1E23"
            />
          </svg>
        </div>
        <h2 class="welcome-title">Face Verification</h2>
        <p class="welcome-description">
          We'll take photos of your face from different angles to help you access the gates of your compound securely.
        </p>
        <p class="welcome-subdescription">
          Make sure you're in a well-lit area and follow the on-screen instructions.
        </p>
        <div class="welcome-buttons">
          <button @click="startVerification" class="start-btn primary">
            Get Started
          </button>
          <button @click="skipVerification" class="start-btn secondary">
            Skip for Now
          </button>
        </div>
      </div>
    </div>

    <!-- Camera Screen -->
    <div v-else-if="currentStep === 'capture'" class="camera-screen">
      <div class="camera-header">
        <button @click="goBack" class="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="step-indicator">
          <span class="step-number">{{ currentPhotoIndex + 1 }}</span>
          <span class="step-separator">/</span>
          <span class="step-total">3</span>
        </div>
      </div>

      <div class="camera-content">
        <!-- Instructions -->
        <div class="instructions-box">
          <div class="instruction-icon" :class="instructionIconClass">
            <svg v-if="currentPhotoType === 'front'" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else-if="currentPhotoType === 'left'" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9Z" stroke="currentColor" stroke-width="2"/>
              <path d="M2 18C2 15.7909 3.79086 14 6 14H18C20.2091 14 22 15.7909 22 18" stroke="currentColor" stroke-width="2"/>
              <path d="M6 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H6" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9Z" stroke="currentColor" stroke-width="2"/>
              <path d="M22 18C22 15.7909 20.2091 14 18 14H6C3.79086 14 2 15.7909 2 18" stroke="currentColor" stroke-width="2"/>
              <path d="M18 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3 class="instruction-title">{{ instructionTitle }}</h3>
          <p class="instruction-text">{{ instructionText }}</p>
        </div>

        <!-- Preview/Photo Display -->
        <div class="camera-preview">
          <div v-if="currentPhoto" class="photo-preview">
            <img :src="currentPhoto" alt="Captured photo" class="preview-image" />
            <div class="photo-overlay">
              <div class="face-guide" :class="currentPhotoType">
                <div class="guide-circle"></div>
                <div class="guide-lines">
                  <div class="guide-line horizontal top"></div>
                  <div class="guide-line horizontal middle"></div>
                  <div class="guide-line horizontal bottom"></div>
                  <div class="guide-line vertical left" v-if="currentPhotoType !== 'front'"></div>
                  <div class="guide-line vertical center"></div>
                  <div class="guide-line vertical right" v-if="currentPhotoType !== 'front'"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="camera-placeholder">
            <div class="face-guide" :class="currentPhotoType">
              <div class="guide-circle"></div>
              <div class="guide-lines">
                <div class="guide-line horizontal top"></div>
                <div class="guide-line horizontal middle"></div>
                <div class="guide-line horizontal bottom"></div>
                <div class="guide-line vertical left" v-if="currentPhotoType !== 'front'"></div>
                <div class="guide-line vertical center"></div>
                <div class="guide-line vertical right" v-if="currentPhotoType !== 'front'"></div>
              </div>
            </div>
            <p class="placeholder-text">Position your face within the guide</p>
          </div>
        </div>

        <!-- Angle Detection Feedback -->
        <div v-if="angleFeedback" class="angle-feedback" :class="angleFeedback.type">
          <div class="feedback-icon">
            <svg v-if="angleFeedback.type === 'good'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="feedback-text">{{ angleFeedback.message }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="camera-actions">
        <button @click="skipVerification" class="action-btn skip">
          Skip for Now
        </button>
        <div class="camera-action-buttons">
          <button v-if="currentPhoto" @click="retakePhoto" class="action-btn secondary">
            Retake
          </button>
          <button @click="currentPhoto ? acceptPhoto() : capturePhoto()" class="action-btn primary" :disabled="isCapturing">
            <span v-if="isCapturing">Processing...</span>
            <span v-else>{{ currentPhoto ? 'Use This Photo' : 'Take Photo' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Review Screen -->
    <div v-else-if="currentStep === 'review'" class="review-screen">
      <div class="review-header">
        <h2 class="review-title">Review Your Photos</h2>
        <p class="review-description">Please review the photos we captured. You can retake any photo if needed.</p>
      </div>

      <div class="photos-grid">
        <div v-for="(photo, index) in capturedPhotos" :key="index" class="photo-item">
          <div class="photo-card">
            <img :src="photo.data" :alt="photo.type" class="review-image" />
            <div class="photo-label">{{ photoLabels[index] }}</div>
            <button @click="retakeSpecificPhoto(index)" class="retake-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Retake
            </button>
          </div>
        </div>
      </div>

      <div class="review-actions">
        <button @click="goBackToCapture" class="action-btn secondary">
          Back
        </button>
        <button @click="completeVerification" class="action-btn primary" :disabled="isSubmitting">
          <span v-if="isSubmitting">Submitting...</span>
          <span v-else>Complete Verification</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

// Component name
defineOptions({
  name: 'FaceVerification'
})

// Props
const props = defineProps({
  autoStart: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['complete', 'cancel', 'skip'])

// State
const currentStep = ref('welcome')
const currentPhotoIndex = ref(0)
const currentPhoto = ref(null)
const capturedPhotos = ref([])
const isCapturing = ref(false)
const isSubmitting = ref(false)
const angleFeedback = ref(null)

const photoTypes = ['front', 'left', 'right']
const photoLabels = ['Front View', 'Left Side', 'Right Side']

// Computed
const currentPhotoType = computed(() => photoTypes[currentPhotoIndex.value])

const instructionTitle = computed(() => {
  if (currentPhotoType.value === 'front') {
    return 'Look Straight Ahead'
  } else if (currentPhotoType.value === 'left') {
    return 'Turn Your Head Left'
  } else {
    return 'Turn Your Head Right'
  }
})

const instructionText = computed(() => {
  if (currentPhotoType.value === 'front') {
    return 'Position your face straight on, looking at the camera. Make sure your face is centered and fully visible.'
  } else if (currentPhotoType.value === 'left') {
    return 'Slowly turn your head to the left until you can see your left profile. Keep your shoulders straight.'
  } else {
    return 'Slowly turn your head to the right until you can see your right profile. Keep your shoulders straight.'
  }
})

const instructionIconClass = computed(() => {
  return currentPhotoType.value
})

// Methods
const startVerification = () => {
  currentStep.value = 'capture'
  currentPhotoIndex.value = 0
  currentPhoto.value = null
  capturedPhotos.value = []
}

const capturePhoto = async () => {
  console.log('📷 capturePhoto called, isCapturing:', isCapturing.value)
  
  if (isCapturing.value) {
    console.log('📷 Already capturing, returning early')
    return
  }

  try {
    isCapturing.value = true
    angleFeedback.value = null
    console.log('📷 Starting photo capture...')

    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // For web, use file input fallback
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'user'
      
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const dataUrl = event.target.result
            processCapturedPhoto(dataUrl)
          }
          reader.readAsDataURL(file)
        }
        isCapturing.value = false
      }
      
      input.oncancel = () => {
        isCapturing.value = false
      }
      
      input.click()
      return
    }

    console.log('📷 Opening camera for face verification...')
    console.log('📷 Platform:', Capacitor.getPlatform())
    console.log('📷 Is native:', Capacitor.isNativePlatform())

    // Check and request camera permissions if needed
    try {
      const permissions = await Camera.checkPermissions()
      console.log('📷 Current permissions:', permissions)
      
      if (permissions.camera !== 'granted') {
        console.log('📷 Requesting camera permission...')
        const requestResult = await Camera.requestPermissions({ permissions: ['camera'] })
        console.log('📷 Permission request result:', requestResult)
        
        if (requestResult.camera !== 'granted') {
          throw new Error('Camera permission denied. Please enable camera access in your device settings.')
        }
      }
      
      console.log('📷 Camera permission granted, opening camera...')
    } catch (permError) {
      console.error('📷 Permission error:', permError)
      throw permError
    }

    // Use Capacitor Camera for native platforms
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // Use DataUrl for better iOS compatibility
        source: CameraSource.Camera, // Force camera for face verification
        correctOrientation: true
      })

      console.log('📷 Image captured:', { hasDataUrl: !!image?.dataUrl, format: image?.format })

      if (!image || !image.dataUrl) {
        throw new Error('No image captured')
      }

      // Simulate angle detection (you can enhance this with actual ML face detection later)
      await simulateAngleDetection(image.dataUrl)
      
      processCapturedPhoto(image.dataUrl)
    } catch (cameraError) {
      console.error('📷 Camera API error:', cameraError)
      console.error('📷 Error details:', {
        message: cameraError.message,
        code: cameraError.code,
        name: cameraError.name
      })
      throw cameraError
    }

  } catch (error) {
    console.error('📷 Error capturing photo:', error)
    console.error('📷 Full error object:', JSON.stringify(error, null, 2))
    
    // Handle user cancellation gracefully
    const errorMessage = error.message || ''
    const errorCode = error.code || ''
    const errorName = error.name || ''
    
    if (errorMessage.includes('cancel') || 
        errorMessage.includes('User cancelled') || 
        errorCode === 'User cancelled' ||
        errorName === 'User cancelled') {
      // User cancelled - don't show error
      console.log('📷 User cancelled camera capture')
      return
    }
    
    // Provide more helpful error messages
    let userMessage = 'Failed to capture photo. Please try again.'
    if (errorMessage.includes('permission') || 
        errorMessage.includes('Permission') ||
        errorCode.includes('permission')) {
      userMessage = 'Camera permission denied. Please enable camera access in your device settings.'
    } else if (errorMessage) {
      userMessage = errorMessage
    }
    
    angleFeedback.value = {
      type: 'error',
      message: userMessage
    }
  } finally {
    isCapturing.value = false
  }
}

const simulateAngleDetection = async (imageDataUrl) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Simple validation: check if image has reasonable size
  const img = new Image()
  img.src = imageDataUrl
  
  return new Promise((resolve) => {
    img.onload = () => {
      // Basic validation - in production, you'd use face detection here
      const isValid = img.width > 200 && img.height > 200
      
      if (isValid) {
        angleFeedback.value = {
          type: 'good',
          message: 'Perfect angle! Hold still...'
        }
        setTimeout(() => {
          angleFeedback.value = null
          resolve()
        }, 1500)
      } else {
        angleFeedback.value = {
          type: 'warning',
          message: 'Please move closer and ensure your face is fully visible'
        }
        setTimeout(() => {
          angleFeedback.value = null
          resolve()
        }, 2000)
      }
    }
    img.onerror = () => {
      angleFeedback.value = {
        type: 'error',
        message: 'Invalid image. Please try again.'
      }
      resolve()
    }
  })
}

const processCapturedPhoto = (dataUrl) => {
  currentPhoto.value = dataUrl
  // Don't auto-advance - let user review and accept manually
}

const acceptPhoto = () => {
  if (!currentPhoto.value) return

  capturedPhotos.value.push({
    type: currentPhotoType.value,
    data: currentPhoto.value,
    timestamp: Date.now()
  })

  // Move to next photo or review
  if (currentPhotoIndex.value < photoTypes.length - 1) {
    currentPhotoIndex.value++
    currentPhoto.value = null
    angleFeedback.value = null
  } else {
    currentStep.value = 'review'
  }
}

const retakePhoto = () => {
  currentPhoto.value = null
  angleFeedback.value = null
}

const retakeSpecificPhoto = (index) => {
  currentPhotoIndex.value = index
  currentPhoto.value = null
  capturedPhotos.value.splice(index, 1)
  currentStep.value = 'capture'
}

const goBack = () => {
  if (currentStep.value === 'capture') {
    if (currentPhotoIndex.value > 0) {
      currentPhotoIndex.value--
      currentPhoto.value = capturedPhotos.value[currentPhotoIndex.value]?.data || null
      capturedPhotos.value.splice(currentPhotoIndex.value, 1)
    } else {
      currentStep.value = 'welcome'
      resetState()
    }
  }
}

const goBackToCapture = () => {
  currentPhotoIndex.value = capturedPhotos.value.length
  if (currentPhotoIndex.value < photoTypes.length) {
    currentStep.value = 'capture'
  } else {
    // All photos captured, go to last one
    currentPhotoIndex.value = photoTypes.length - 1
    currentPhoto.value = capturedPhotos.value[currentPhotoIndex.value]?.data || null
    currentStep.value = 'capture'
  }
}

const completeVerification = async () => {
  if (capturedPhotos.value.length !== 3) {
    return
  }

  isSubmitting.value = true

  try {
    // Prepare photos for backend (base64 data URLs)
    const photosData = capturedPhotos.value.map((photo, index) => ({
      type: photo.type,
      data: photo.data,
      label: photoLabels[index],
      timestamp: photo.timestamp
    }))

    // Emit complete event with photos
    emit('complete', {
      photos: photosData,
      frontPhoto: photosData.find(p => p.type === 'front'),
      leftPhoto: photosData.find(p => p.type === 'left'),
      rightPhoto: photosData.find(p => p.type === 'right')
    })
  } catch (error) {
    console.error('Error completing verification:', error)
  } finally {
    isSubmitting.value = false
  }
}

const resetState = () => {
  currentPhotoIndex.value = 0
  currentPhoto.value = null
  capturedPhotos.value = []
  angleFeedback.value = null
}

const skipVerification = () => {
  console.log('[FaceVerification] User skipped face verification')
  // Emit skip event with empty photos
  emit('complete', {
    photos: [],
    frontPhoto: null,
    leftPhoto: null,
    rightPhoto: null,
    skipped: true
  })
}

// Lifecycle
onMounted(() => {
  if (props.autoStart) {
    startVerification()
  }
})

onUnmounted(() => {
  resetState()
})
</script>

<style scoped>
.face-verification {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

/* Welcome Screen */
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.welcome-content {
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.welcome-icon {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #231F20;
  margin-bottom: 20px;
}

.welcome-description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.welcome-subdescription {
  font-size: 0.95rem;
  color: #999;
  line-height: 1.5;
  margin-bottom: 40px;
}

.welcome-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 300px;
}

.start-btn {
  width: 100%;
  padding: 18px 40px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn.primary {
  background-color: #AF1E23;
  color: white;
  box-shadow: 0 4px 15px rgba(175, 30, 35, 0.3);
}

.start-btn.primary:hover {
  background-color: #8b181c;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(175, 30, 35, 0.4);
}

.start-btn.primary:active {
  transform: translateY(0);
}

.start-btn.secondary {
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
}

.start-btn.secondary:hover {
  background-color: #f5f5f5;
  border-color: #999;
}

.start-btn.secondary:active {
  background-color: #eee;
}

/* Camera Screen */
.camera-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.camera-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
}

.back-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.step-indicator {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.step-number {
  color: #AF1E23;
}

.camera-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

.instructions-box {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.instruction-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
  color: #AF1E23;
}

.instruction-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #231F20;
  margin-bottom: 12px;
}

.instruction-text {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
}

.camera-preview {
  flex: 1;
  min-height: 400px;
  border-radius: 20px;
  overflow: hidden;
  background-color: #1a1a1a;
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.placeholder-text {
  position: absolute;
  bottom: 30px;
  color: white;
  font-size: 1rem;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 12px 24px;
  border-radius: 20px;
}

.face-guide {
  width: 280px;
  height: 350px;
  position: relative;
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.guide-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px dashed rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.guide-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.guide-line {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.4);
}

.guide-line.horizontal {
  width: 100%;
  height: 1px;
  left: 0;
}

.guide-line.horizontal.top {
  top: 25%;
}

.guide-line.horizontal.middle {
  top: 50%;
}

.guide-line.horizontal.bottom {
  top: 75%;
}

.guide-line.vertical {
  width: 1px;
  height: 100%;
  top: 0;
}

.guide-line.vertical.left {
  left: 25%;
}

.guide-line.vertical.center {
  left: 50%;
}

.guide-line.vertical.right {
  right: 25%;
}

.face-guide.left {
  border-radius: 30% 50% 50% 30%;
  transform: rotate(-15deg);
}

.face-guide.right {
  border-radius: 50% 30% 30% 50%;
  transform: rotate(15deg);
}

.angle-feedback {
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease;
}

.angle-feedback.good {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.angle-feedback.warning {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.angle-feedback.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.feedback-icon {
  flex-shrink: 0;
}

.feedback-text {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
}

.camera-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
}

.camera-action-buttons {
  display: flex;
  gap: 15px;
}

.action-btn {
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background-color: #AF1E23;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background-color: #8b181c;
  transform: translateY(-2px);
}

.action-btn.primary:disabled {
  background-color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn.secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.action-btn.secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.action-btn.skip {
  background-color: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.3);
  width: 100%;
}

.action-btn.skip:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Review Screen */
.review-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow-y: auto;
}

.review-header {
  text-align: center;
  margin-bottom: 30px;
}

.review-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #231F20;
  margin-bottom: 12px;
}

.review-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.photo-item {
  width: 100%;
}

.photo-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
}

.review-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.photo-label {
  padding: 16px;
  font-weight: 600;
  color: #231F20;
  text-align: center;
  background-color: #f8f9fa;
}

.retake-btn {
  width: 100%;
  padding: 12px;
  background-color: #f8f9fa;
  border: none;
  border-top: 1px solid #e1e5e9;
  color: #AF1E23;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.3s ease;
}

.retake-btn:hover {
  background-color: #e9ecef;
}

.review-actions {
  display: flex;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: 1fr;
  }

  .welcome-title {
    font-size: 1.6rem;
  }

  .instruction-title {
    font-size: 1.2rem;
  }

  .face-guide {
    width: 240px;
    height: 300px;
  }
}
</style>
