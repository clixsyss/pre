<template>
  <div class="face-verification">
    <!-- Welcome -->
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
        <p class="welcome-description" v-if="!required">
          Capture or upload a single photo of your face for compound access via Face ID.
        </p>
        <div v-else class="welcome-description-container">
          <p class="welcome-description">
            <strong>Face verification is required</strong> to complete your registration and access your compound.
          </p>
          <p class="welcome-description">
            Capture or upload <strong>one</strong> clear photo of your face. Ensure you're in a well-lit area and your face is fully visible.
          </p>
        </div>
        <div class="welcome-buttons">
          <button @click="startVerification" class="start-btn primary">Get Started</button>
          <button v-if="!required" @click="skipVerification" class="start-btn secondary">Skip for Now</button>
        </div>
      </div>
    </div>

    <!-- Capture: single image only -->
    <div v-else-if="currentStep === 'capture'" class="camera-screen">
      <div class="camera-header">
        <button @click="goBack" class="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="step-label">Face ID</span>
      </div>

      <div class="camera-content">
        <div class="instructions-box">
          <h3 class="instruction-title">Look straight ahead</h3>
          <p class="instruction-text">
            Take or upload <strong>one</strong> clear photo. Face the camera directly in a well-lit area.
          </p>
          <div v-if="isCameraActive && isFaceDetecting" class="face-detection-feedback">
            <div v-if="isLoadingFaceModels" class="detection-status loading">
              <span class="status-icon">⏳</span>
              <span>Loading face detection...</span>
            </div>
            <div v-else-if="faceDetected && isFaceWellPositioned()" class="detection-status success">
              <span class="status-icon">✓</span>
              <span>Face detected and positioned correctly</span>
            </div>
            <div v-else-if="faceDetected" class="detection-status warning">
              <span class="status-icon">⚠</span>
              <span>Center your face in the frame.</span>
            </div>
            <div v-else class="detection-status error">
              <span class="status-icon">👤</span>
              <span>Position your face in the camera frame</span>
            </div>
          </div>
        </div>

        <div class="camera-preview">
          <div v-if="previewDataUrl" class="photo-preview">
            <img :src="previewDataUrl" alt="Face" class="preview-image" />
          </div>
          <div v-else class="live-camera-preview" :class="{ 'camera-placeholder': !isCameraActive }">
            <video ref="videoElement" autoplay playsinline class="camera-video"></video>
            <div class="camera-overlay">
              <div class="face-guide">
                <div class="guide-circle"></div>
              </div>
            </div>
            <p v-if="!isCameraActive" class="placeholder-text">
              {{ isStartingCamera ? 'Starting camera...' : 'Take a photo or upload an image' }}
            </p>
            <p v-if="cameraError" class="camera-error-text">{{ cameraError }}</p>
          </div>
        </div>

        <div v-if="angleFeedback" class="angle-feedback" :class="angleFeedback.type">
          <p class="feedback-text">{{ angleFeedback.message }}</p>
        </div>
      </div>

      <div class="camera-actions">
        <div class="camera-action-buttons">
          <template v-if="previewDataUrl">
            <button @click="retakePhoto" class="action-btn secondary">Retake</button>
            <button @click="acceptPhoto" class="action-btn primary" :disabled="isCapturing">
              <span v-if="isCapturing">Processing...</span>
              <span v-else>Use This Photo</span>
            </button>
          </template>
          <template v-else>
            <button @click="openFilePicker" class="action-btn secondary">Upload</button>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="file-input-hidden"
              @change="onFileSelected"
            />
            <button @click="capturePhoto" class="action-btn primary" :disabled="isCapturing">
              <span v-if="isCapturing">Processing...</span>
              <span v-else>Take Photo</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Review: single image -->
    <div v-else-if="currentStep === 'review'" class="review-screen">
      <div class="review-header">
        <h2 class="review-title">Review your photo</h2>
        <p class="review-description">Confirm this image for Face ID enrollment.</p>
      </div>
      <div class="review-single">
        <div class="photo-card">
          <img :src="previewDataUrl" alt="Face" class="review-image" />
          <button @click="goBackToCapture" class="retake-btn">Retake</button>
        </div>
      </div>
      <div class="review-actions">
        <button @click="goBackToCapture" class="action-btn secondary">Back</button>
        <button @click="completeVerification" class="action-btn primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="button-loading">
            <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" />
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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { useFaceDetection } from '../composables/useFaceDetection'
import {
  dataUrlToBase64,
  processImageForEnrollment,
} from '../services/faceEnrollmentService'

defineOptions({ name: 'FaceVerification' })

const props = defineProps({
  autoStart: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  /** Set to true when enrollment fails so we reset "Saving..." state */
  submissionError: { type: Boolean, default: false },
})

const emit = defineEmits(['complete', 'cancel', 'skip'])

const currentStep = ref('welcome')
const previewDataUrl = ref(null)
const img_b64 = ref(null)
const isCapturing = ref(false)
const isSubmitting = ref(false)
const angleFeedback = ref(null)
const cameraStream = ref(null)
const videoElement = ref(null)
const fileInputRef = ref(null)
const isCameraActive = ref(false)
const cameraError = ref(null)
const isStartingCamera = ref(false)

const {
  isDetecting: isFaceDetecting,
  faceDetected,
  isLoadingModels: isLoadingFaceModels,
  startDetection: startFaceDetection,
  stopDetection: stopFaceDetection,
  isFaceWellPositioned,
} = useFaceDetection()

function startVerification() {
  currentStep.value = 'capture'
  previewDataUrl.value = null
  img_b64.value = null
  angleFeedback.value = null
  cameraError.value = null
  nextTick(() => startCamera())
}

async function startCamera() {
  if (isStartingCamera.value || isCameraActive.value || cameraStream.value) return
  isStartingCamera.value = true
  cameraError.value = null
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera not supported')
    await nextTick()
    if (!videoElement.value) {
      await new Promise(r => setTimeout(r, 100))
      if (!videoElement.value) throw new Error('Video element not available')
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    })
    if (!videoElement.value) {
      stream.getTracks().forEach(t => t.stop())
      throw new Error('Video element no longer available')
    }
    cameraStream.value = stream
    isCameraActive.value = true
    videoElement.value.srcObject = stream
    await videoElement.value.play()
    await new Promise(r => setTimeout(r, 200))
    if (videoElement.value?.readyState >= 2) {
      startFaceDetection(videoElement.value, null, { detectionInterval: 150, minConfidence: 0.5, inputSize: 320 })
    }
  } catch (e) {
    if (cameraStream.value) {
      cameraStream.value.getTracks().forEach(t => t.stop())
      cameraStream.value = null
    }
    isCameraActive.value = false
    cameraError.value =
      e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError'
        ? 'Camera permission denied.'
        : e.message || 'Could not access camera.'
  } finally {
    isStartingCamera.value = false
  }
}

function stopCamera() {
  isStartingCamera.value = false
  stopFaceDetection()
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(t => t.stop())
    cameraStream.value = null
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null
    videoElement.value.pause()
  }
  isCameraActive.value = false
}

async function capturePhoto() {
  if (isCapturing.value) return
  isCapturing.value = true
  angleFeedback.value = null
  try {
    if (isCameraActive.value && videoElement.value?.readyState >= 2) {
      const w = videoElement.value.videoWidth || 1920
      const h = videoElement.value.videoHeight || 1080
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(videoElement.value, -w, 0, w, h)
      ctx.restore()
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0)
      await simulateAngleDetection(dataUrl)
      setPreviewAndBase64(dataUrl)
      return
    }
    if (!Capacitor.isNativePlatform()) {
      openFilePicker()
      isCapturing.value = false
      return
    }
    const perms = await Camera.checkPermissions()
    if (perms.camera !== 'granted') {
      const req = await Camera.requestPermissions({ permissions: ['camera'] })
      if (req.camera !== 'granted') throw new Error('Camera permission denied.')
    }
    const image = await Camera.getPhoto({
      quality: 95,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      correctOrientation: true,
      width: 1920,
      height: 1080,
    })
    if (!image?.dataUrl) throw new Error('No image captured')
    await simulateAngleDetection(image.dataUrl)
    setPreviewAndBase64(image.dataUrl)
  } catch (e) {
    if (/cancel|cancelled/i.test(e.message || e.name || '')) return
    angleFeedback.value = { type: 'error', message: e.message || 'Failed to capture. Try again.' }
  } finally {
    isCapturing.value = false
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function onFileSelected(e) {
  const file = e.target?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    const dataUrl = ev.target?.result
    if (!dataUrl) return
    const img = new Image()
    img.onload = () => {
      if (img.width > 200 && img.height > 200) {
        setPreviewAndBase64(dataUrl)
        angleFeedback.value = null
      } else {
        angleFeedback.value = { type: 'error', message: 'Image too small. Use a clearer, larger face photo.' }
      }
    }
    img.onerror = () => {
      angleFeedback.value = { type: 'error', message: 'Invalid image. Try another file.' }
    }
    img.src = dataUrl
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

function setPreviewAndBase64(dataUrl) {
  previewDataUrl.value = dataUrl
  try {
    img_b64.value = dataUrlToBase64(dataUrl)
  } catch {
    img_b64.value = null
  }
  stopCamera()
}

async function simulateAngleDetection(dataUrl) {
  await new Promise(r => setTimeout(r, 300))
  const img = new Image()
  img.src = dataUrl
  return new Promise(resolve => {
    img.onload = () => {
      const ok = img.width > 200 && img.height > 200
      angleFeedback.value = ok
        ? { type: 'good', message: 'Good. Hold still...' }
        : { type: 'warning', message: 'Move closer so your face is fully visible.' }
      setTimeout(() => {
        angleFeedback.value = null
        resolve()
      }, ok ? 800 : 1200)
    }
    img.onerror = () => resolve()
  })
}

function acceptPhoto() {
  if (!previewDataUrl.value || !img_b64.value) return
  stopCamera()
  currentStep.value = 'review'
}

function retakePhoto() {
  previewDataUrl.value = null
  img_b64.value = null
  angleFeedback.value = null
  cameraError.value = null
  stopCamera()
  nextTick(() => startCamera())
}

function goBack() {
  stopCamera()
  if (props.autoStart) {
    emit('cancel')
    return
  }
  currentStep.value = 'welcome'
  previewDataUrl.value = null
  img_b64.value = null
  angleFeedback.value = null
  cameraError.value = null
}

function goBackToCapture() {
  previewDataUrl.value = null
  img_b64.value = null
  angleFeedback.value = null
  cameraError.value = null
  currentStep.value = 'capture'
}

async function completeVerification() {
  if (isSubmitting.value || !previewDataUrl.value) return
  isSubmitting.value = true
  try {
    const record = await processImageForEnrollment(previewDataUrl.value)
    if (!record) {
      angleFeedback.value = { type: 'error', message: 'Failed to process image.' }
      isSubmitting.value = false
      return
    }
    emit('complete', { img_b64: record, skipped: false })
  } catch (e) {
    angleFeedback.value = {
      type: 'error',
      message: e?.message || 'Failed to process image.',
    }
    isSubmitting.value = false
  }
}

function skipVerification() {
  emit('complete', { img_b64: null, skipped: true })
}

watch(currentStep, step => {
  if (step === 'capture') nextTick(() => startCamera())
  else stopCamera()
})

watch(() => props.submissionError, err => {
  if (err) isSubmitting.value = false
})

onMounted(() => {
  if (props.autoStart) setTimeout(() => startVerification(), 200)
})

onUnmounted(() => {
  stopCamera()
  previewDataUrl.value = null
  img_b64.value = null
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

.welcome-description-container {
  margin-bottom: 20px;
}

.welcome-description-container .welcome-description {
  margin-bottom: 12px;
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

.start-btn.secondary {
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
}

.camera-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
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
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.step-label {
  font-size: 1rem;
  font-weight: 600;
  color: #231F20;
}

.camera-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
}

.instructions-box {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding-bottom: 12px;
  margin-bottom: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.instruction-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #231F20;
  line-height: normal;
}

.instruction-text {
  font-size: 0.9rem;
  color: #666;
  line-height: normal;
  margin-bottom: 12px;
}

.face-detection-feedback {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.detection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.detection-status.loading { color: #666; background-color: #f5f5f5; }
.detection-status.success { color: #4CAF50; background-color: #e8f5e9; }
.detection-status.warning { color: #FF9800; background-color: #fff3e0; }
.detection-status.error { color: #f44336; background-color: #ffebee; }

.status-icon { font-size: 1.1rem; }

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
  transform: scaleX(-1);
}

.camera-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.face-guide {
  width: 280px;
  height: 350px;
  position: relative;
  border: 3px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
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
}

.photo-preview,
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.preview-image {
  transform: scaleX(-1);
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.camera-error-text {
  color: #ff4444;
  font-size: 0.9rem;
  margin-top: 12px;
  text-align: center;
  padding: 0 20px;
}

.angle-feedback {
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.angle-feedback.good { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
.angle-feedback.warning { background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
.angle-feedback.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

.feedback-text { font-size: 0.95rem; font-weight: 500; margin: 0; }

.file-input-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
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

.review-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.review-header {
  text-align: center;
  margin-bottom: 24px;
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

.review-single {
  margin-bottom: 24px;
}

.photo-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.review-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
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
}

.review-actions {
  display: flex;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  flex-direction: column;
}

.button-loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .welcome-title { font-size: 1.6rem; }
  .instruction-title { font-size: 1.2rem; }
  .face-guide { width: 240px; height: 300px; }
}
</style>
