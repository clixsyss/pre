<template>
  <div class="face-verification">
    <!-- Welcome Screen -->
    <div v-if="currentStep === 'welcome'" class="welcome-screen">
      <div class="welcome-content">
        <div class="welcome-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 4.5L14.5 6.5L12 8L9.5 6.5L10.5 4.5L9 4L3 7V9L9 11.5V19L7 20.5V22L12 20L17 22V20.5L15 19V11.5L21 9Z"
              fill="#AF1E23" />
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
            <path d="M19 12H5M12 19L5 12L12 5" stroke="black" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
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
          <h3 class="instruction-title">{{ instructionTitle }}</h3>
          <p class="instruction-text">{{ instructionText }}</p>
        </div>

        <!-- Preview/Photo Display -->
        <div class="camera-preview">
          <!-- Captured Photo Preview -->
          <div v-if="currentPhoto" class="photo-preview">
            <img :src="currentPhoto" alt="Captured photo" class="preview-image" :class="currentPhotoType" />
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
          <!-- Live Camera Preview -->
          <div v-else-if="isCameraActive" class="live-camera-preview">
            <video ref="videoElement" autoplay playsinline class="camera-video" :class="currentPhotoType"></video>
            <div class="camera-overlay">
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
          <!-- Placeholder (when camera not started) -->
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
            <p v-if="cameraError" class="camera-error-text">{{ cameraError }}</p>
          </div>
        </div>

        <!-- Angle Detection Feedback -->
        <div v-if="angleFeedback" class="angle-feedback" :class="angleFeedback.type">
          <div class="feedback-icon">
            <svg v-if="angleFeedback.type === 'good'" width="24" height="24" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <p class="feedback-text">{{ angleFeedback.message }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="camera-actions">
        <div class="camera-action-buttons">
          <button v-if="currentPhoto" @click="retakePhoto" class="action-btn secondary">
            Retake
          </button>
          <button @click="currentPhoto ? acceptPhoto() : capturePhoto()" class="action-btn primary"
            :disabled="isCapturing">
            <span v-if="isCapturing">Processing...</span>
            <span v-else>{{ currentPhoto ? 'Use This Photo' : 'Take Photo' }}</span>
          </button>
        </div>
        <button @click="skipVerification" class="action-btn skip">
          Skip for Now
        </button>
      </div>
    </div>

    <!-- Review Screen -->
    <div v-else-if="currentStep === 'review'" class="review-screen">
      <div class="review-header">
        <h2 class="review-title">{{ readOnly ? 'Your Face Verification Photos' : 'Review Your Photos' }}</h2>
        <p class="review-description">
          <span v-if="readOnly">Your face verification photos are set and cannot be changed.</span>
          <span v-else>Please review the photos we captured. You can retake any photo if needed.</span>
        </p>
      </div>

      <div class="photos-grid">
        <div v-for="(photo, index) in capturedPhotos" :key="index" class="photo-item">
          <div class="photo-card">
            <img :src="photo.data" :alt="photo.type" class="review-image" />
            <div class="photo-label">{{ photoLabels[index] }}</div>
            <button v-if="!readOnly" @click="retakeSpecificPhoto(index)" class="retake-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
                  stroke="currentColor" stroke-width="2" />
                <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              Retake
            </button>
          </div>
        </div>
      </div>

      <div class="review-actions">
        <button v-if="!readOnly" @click="goBackToCapture" class="action-btn secondary">
          Back
        </button>
        <button v-if="readOnly" @click="$emit('cancel')" class="action-btn primary">
          Close
        </button>
        <button v-else @click="completeVerification" class="action-btn primary" :disabled="isSubmitting || capturedPhotos.length !== 3">
          <span v-if="isSubmitting" class="button-loading">
            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
            </svg>
            Saving...
          </span>
          <span v-else>Complete Verification</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
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
  },
  existingPhotos: {
    type: Object,
    default: null
  },
  readOnly: {
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
const cameraStream = ref(null)
const videoElement = ref(null)
const isCameraActive = ref(false)
const cameraError = ref(null)

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

// const instructionIconClass = computed(() => {
//   return currentPhotoType.value
// })

// Methods
const startVerification = () => {
  // Note: Read-only mode with existing photos is handled in onMounted
  // This function is only called for new verification flows
  
  console.log('[FaceVerification] Starting verification, setting step to capture')
  currentStep.value = 'capture'
  currentPhotoIndex.value = 0
  currentPhoto.value = null
  capturedPhotos.value = []
  angleFeedback.value = null
  cameraError.value = null
  console.log('[FaceVerification] Current step:', currentStep.value, 'Photo index:', currentPhotoIndex.value)

  // Start camera when entering capture step
  nextTick(() => {
    startCamera()
  })
}

// Start live camera preview
const startCamera = async () => {
  if (isCameraActive.value || cameraStream.value) {
    return // Already active
  }

  try {
    console.log('[FaceVerification] Starting camera preview...')
    cameraError.value = null

    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera API not supported on this device')
    }

    // Request camera access with higher resolution for better face recognition
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user', // Front camera
        width: { ideal: 1920, min: 1280 }, // Higher resolution for better quality
        height: { ideal: 1080, min: 720 }
      },
      audio: false
    })

    cameraStream.value = stream
    isCameraActive.value = true

    // Wait for video element to be available
    await nextTick()

    if (videoElement.value) {
      videoElement.value.srcObject = stream
      await videoElement.value.play()
      console.log('[FaceVerification] ✅ Camera preview started')
    } else {
      console.warn('[FaceVerification] ⚠️ Video element not found')
    }
  } catch (error) {
    console.error('[FaceVerification] ❌ Error starting camera:', error)
    cameraError.value = error.message || 'Could not access camera. Please check permissions.'
    isCameraActive.value = false

    // Provide helpful error messages
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      cameraError.value = 'Camera permission denied. Please enable camera access in settings.'
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      cameraError.value = 'No camera found on this device.'
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      cameraError.value = 'Camera is being used by another application.'
    }
  }
}

// Stop camera preview
const stopCamera = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => {
      track.stop()
    })
    cameraStream.value = null
  }

  if (videoElement.value) {
    videoElement.value.srcObject = null
  }

  isCameraActive.value = false
  console.log('[FaceVerification] Camera preview stopped')
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

    // If we have a live camera preview, capture from video element
    if (isCameraActive.value && videoElement.value && videoElement.value.readyState >= 2) {
      console.log('📷 Capturing from live camera preview...')

      try {
        // Create canvas to capture frame from video
        // Use higher resolution for better quality
        const videoWidth = videoElement.value.videoWidth || 1920
        const videoHeight = videoElement.value.videoHeight || 1080
        
        const canvas = document.createElement('canvas')
        // Maintain aspect ratio but ensure good quality
        canvas.width = Math.min(videoWidth, 1920)
        canvas.height = Math.min(videoHeight, 1080)

        const ctx = canvas.getContext('2d')
        // Use better image smoothing for quality
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        // Draw video frame to canvas (mirrored for better UX)
        ctx.save()
        ctx.scale(-1, 1)
        ctx.drawImage(videoElement.value, -canvas.width, 0, canvas.width, canvas.height)
        ctx.restore()

        // Convert to data URL with high quality (0.95 for better face recognition)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)

        console.log('📷 Image captured from video:', { width: canvas.width, height: canvas.height })

        // Simulate angle detection
        await simulateAngleDetection(dataUrl)

        processCapturedPhoto(dataUrl)
        return
      } catch (captureError) {
        console.error('📷 Error capturing from video:', captureError)
        // Fall through to native camera fallback
      }
    }

    // Fallback: Use native camera if live preview not available
    console.log('📷 Using native camera fallback...')

    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // For web without getUserMedia, use file input fallback
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
        quality: 95, // Higher quality for face verification (was 90)
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // Use DataUrl for better iOS compatibility
        source: CameraSource.Camera, // Force camera for face verification
        correctOrientation: true,
        width: 1920, // Request higher resolution
        height: 1080
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
    // Always restart camera for next photo to ensure it's active
    // Stop first to ensure clean restart
    stopCamera()
    nextTick(() => {
      startCamera()
    })
  } else {
    // All photos captured, stop camera and move to review
    stopCamera()
    currentStep.value = 'review'
  }
}

const retakePhoto = () => {
  currentPhoto.value = null
  angleFeedback.value = null
  // Restart camera if not active
  if (!isCameraActive.value) {
    startCamera()
  }
}

const retakeSpecificPhoto = (index) => {
  currentPhotoIndex.value = index
  currentPhoto.value = null
  capturedPhotos.value.splice(index, 1)
  currentStep.value = 'capture'
  // Start camera when retaking
  nextTick(() => {
    startCamera()
  })
}

const goBack = () => {
  if (currentStep.value === 'capture') {
    if (currentPhotoIndex.value > 0) {
      currentPhotoIndex.value--
      currentPhoto.value = capturedPhotos.value[currentPhotoIndex.value]?.data || null
      capturedPhotos.value.splice(currentPhotoIndex.value, 1)
      // Restart camera when going back
      if (!isCameraActive.value && !currentPhoto.value) {
        startCamera()
      }
    } else {
      stopCamera()
      currentStep.value = 'welcome'
      resetState()
    }
  }
}

const goBackToCapture = () => {
  currentPhotoIndex.value = capturedPhotos.value.length
  if (currentPhotoIndex.value < photoTypes.length) {
    currentStep.value = 'capture'
    // Restart camera when going back to capture
    nextTick(() => {
      startCamera()
    })
  } else {
    // All photos captured, go to last one
    currentPhotoIndex.value = photoTypes.length - 1
    currentPhoto.value = capturedPhotos.value[currentPhotoIndex.value]?.data || null
    currentStep.value = 'capture'
    // Restart camera when going back to capture
    nextTick(() => {
      startCamera()
    })
  }
}

const completeVerification = async () => {
  if (capturedPhotos.value.length !== 3 || isSubmitting.value) {
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
    // Keep isSubmitting true - parent component will handle upload and navigation
    // The component will be unmounted when parent navigates, so we don't need to reset
    emit('complete', {
      photos: photosData,
      frontPhoto: photosData.find(p => p.type === 'front'),
      leftPhoto: photosData.find(p => p.type === 'left'),
      rightPhoto: photosData.find(p => p.type === 'right')
    })
    
    // Note: We don't reset isSubmitting here because:
    // 1. The parent component will handle the upload asynchronously
    // 2. The parent will navigate away after completion, unmounting this component
    // 3. This keeps the button in loading state during the entire upload process
  } catch (error) {
    console.error('Error completing verification:', error)
    // Only reset on error (though emit shouldn't throw)
    isSubmitting.value = false
  }
}

const resetState = () => {
  stopCamera()
  currentPhotoIndex.value = 0
  currentPhoto.value = null
  capturedPhotos.value = []
  angleFeedback.value = null
  cameraError.value = null
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
// Watch for currentStep changes to manage camera
watch(currentStep, (newStep) => {
  if (newStep === 'capture' && !props.readOnly) {
    console.log('[FaceVerification] Step changed to capture, starting camera...')
    nextTick(() => {
      startCamera()
    })
  } else {
    stopCamera()
  }
})

// Watch for readOnly prop changes to handle async loading
watch(() => [props.readOnly, props.existingPhotos], ([readOnly, existingPhotos]) => {
  if (readOnly && existingPhotos && currentStep.value !== 'review') {
    console.log('[FaceVerification] Read-only mode detected with existing photos, showing review screen')
    currentStep.value = 'review'
    // Convert existing photo URLs to captured photos format
    capturedPhotos.value = [
      { type: 'front', data: existingPhotos.faceFrontUrl, timestamp: Date.now() },
      { type: 'left', data: existingPhotos.faceLeftUrl, timestamp: Date.now() },
      { type: 'right', data: existingPhotos.faceRightUrl, timestamp: Date.now() }
    ].filter(photo => photo.data) // Only include photos that exist
  }
}, { immediate: true })

onMounted(() => {
  // If read-only mode with existing photos, show them immediately
  if (props.readOnly && props.existingPhotos) {
    console.log('[FaceVerification] Read-only mode with existing photos, showing review screen')
    currentStep.value = 'review'
    // Convert existing photo URLs to captured photos format
    capturedPhotos.value = [
      { type: 'front', data: props.existingPhotos.faceFrontUrl, timestamp: Date.now() },
      { type: 'left', data: props.existingPhotos.faceLeftUrl, timestamp: Date.now() },
      { type: 'right', data: props.existingPhotos.faceRightUrl, timestamp: Date.now() }
    ].filter(photo => photo.data) // Only include photos that exist
    return
  }
  
  // Small delay to ensure modal is fully rendered before starting
  if (props.autoStart) {
    // Use nextTick to ensure DOM is ready
    setTimeout(() => {
      console.log('[FaceVerification] Auto-starting verification...')
      startVerification()
    }, 200)
  }
})

onUnmounted(() => {
  resetState()
})
</script>

<style scoped>
.face-verification {
  width: 100%;
  min-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* Welcome Screen */
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 400px;
  overflow-y: auto;
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

.start-btn.primary:active {
  transform: translateY(0);
}

.start-btn.secondary {
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
}

.start-btn.secondary:active {
  background-color: #eee;
}

/* Camera Screen */
.camera-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
}

.camera-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: black;
}

.back-button {
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.step-indicator {
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
  overflow-y: auto;
  min-height: 0;
  position: relative;
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
  line-height: normal;
}

.instruction-text {
  font-size: 0.75rem;
  color: #666;
  line-height: 1.6;
}

.camera-preview {
  flex: 1;
  min-height: 300px;
  height: 400px;
  border-radius: 20px;
  overflow: hidden;
  background-color: #1a1a1a;
  position: relative;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Live Camera Preview */
.live-camera-preview {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Mirror the video for front view only (like a selfie camera) */
}

.camera-video.front {
  transform: scaleX(-1);
}

.camera-video.left,
.camera-video.right {
  /* Don't mirror side profile views */
  transform: scaleX(1);
  /* Ensure full face is visible for profile views */
  object-position: center;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.camera-error-text {
  color: #ff4444;
  font-size: 0.9rem;
  margin-top: 12px;
  text-align: center;
  padding: 0 20px;
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
  /* Mirror the image for front view to match camera preview */
  transform: scaleX(-1);
}

.preview-image.front {
  transform: scaleX(-1);
}

.preview-image.left,
.preview-image.right {
  /* Don't mirror side profile views */
  transform: scaleX(1);
  /* Ensure full face is visible for profile views */
  object-position: center;
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
  border: 3px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  background: transparent;
  overflow: hidden;
}

.face-guide.front {
  border-radius: 50%;
}

.face-guide.left,
.face-guide.right {
  /* Professional oval shape for profile views */
  border-radius: 50% 45% 45% 50%;
  width: 320px;
  height: 380px;
}

.face-guide.right {
  border-radius: 45% 50% 50% 45%;
}

.guide-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px dashed rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  pointer-events: none;
}

.guide-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.guide-line {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.5);
}

.guide-line.horizontal {
  width: 100%;
  height: 2px;
  left: 0;
}

.guide-line.horizontal.top {
  top: 25%;
  width: 85%;
  left: 50%;
  transform: translateX(-50%);
}

.guide-line.horizontal.middle {
  top: 50%;
  width: 100%;
}

.guide-line.horizontal.bottom {
  top: 75%;
  width: 85%;
  left: 50%;
  transform: translateX(-50%);
}

.guide-line.vertical {
  width: 2px;
  height: 100%;
  top: 0;
}

.guide-line.vertical.left {
  left: 30%;
}

.guide-line.vertical.center {
  left: 50%;
}

.guide-line.vertical.right {
  right: 30%;
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

.action-btn.primary:disabled {
  background-color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn.secondary {
  background-color: transparent;
  color: black;
  border: 2px solid black;
}

.action-btn.skip {
  background-color: transparent;
  color: black;
  border: 2px solid black;
  width: 100%;
}

/* Review Screen */
.review-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.review-actions {
  display: flex;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  flex-direction: column;
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
