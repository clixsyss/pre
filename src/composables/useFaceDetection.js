import { ref, onUnmounted } from 'vue'
import * as faceapi from 'face-api.js'
import { Capacitor } from '@capacitor/core'

/**
 * Composable for face detection using face-api.js
 * Optimized for both web and mobile (iOS/Android) platforms
 * Works in Capacitor WebView on native platforms
 */
export function useFaceDetection() {
  const isDetecting = ref(false)
  const isModelLoaded = ref(false)
  const faceDetected = ref(false)
  const facePosition = ref(null) // { x, y, width, height }
  const detectionConfidence = ref(0)
  const isLoadingModels = ref(false)
  const detectionError = ref(null)

  let detectionInterval = null
  let videoElement = null
  let canvas = null

  /**
   * Load face-api.js models
   * Models are loaded from CDN or local assets
   */
  const loadModels = async () => {
    if (isModelLoaded.value) {
      return true
    }

    if (isLoadingModels.value) {
      // Wait for ongoing load
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (isModelLoaded.value) {
            clearInterval(checkLoaded)
            resolve(true)
          }
        }, 100)
      })
    }

    isLoadingModels.value = true
    detectionError.value = null

    try {
      // Use CDN for models - face-api.js models
      // Alternative: Can also use local models by placing them in /public/models/
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/'

      console.log('[FaceDetection] Loading face-api.js models...')

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      ])

      isModelLoaded.value = true
      isLoadingModels.value = false
      console.log('[FaceDetection] ✅ Models loaded successfully')
      return true
    } catch (error) {
      console.error('[FaceDetection] ❌ Error loading models:', error)
      detectionError.value = 'Failed to load face detection models. Please refresh the page.'
      isLoadingModels.value = false
      return false
    }
  }

  /**
   * Start detecting faces in a video stream
   * @param {HTMLVideoElement} video - Video element with camera stream
   * @param {HTMLCanvasElement} detectionCanvas - Optional canvas for drawing
   * @param {Object} options - Detection options
   */
  const startDetection = async (video, detectionCanvas = null, options = {}) => {
    if (!video) {
      console.error('[FaceDetection] Video element required')
      return
    }

    if (isDetecting.value) {
      stopDetection()
    }

    // Load models if not loaded
    const modelsLoaded = await loadModels()
    if (!modelsLoaded) {
      return
    }

    videoElement = video
    canvas = detectionCanvas

    if (canvas) {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
    }

    isDetecting.value = true
    faceDetected.value = false
    detectionError.value = null

    // Detect platform for optimization
    const isNative = Capacitor.isNativePlatform()
    
    // Optimize settings based on platform
    // Mobile devices (iOS/Android) need lower detection frequency and smaller input size for better performance
    const {
      detectionInterval: interval = isNative ? 200 : 100, // Slower on mobile (200ms) vs web (100ms)
      minConfidence = 0.5,
      inputSize = isNative ? 224 : 320 // Smaller input on mobile for better performance (224 vs 320)
    } = options

    // Start detection loop
    const detectFace = async () => {
      if (!isDetecting.value || !videoElement || videoElement.readyState < 2) {
        return
      }

      try {
        // Detect faces using TinyFaceDetector (fastest, good for real-time)
        const detections = await faceapi
          .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize }))
          .withFaceLandmarks()

        if (detections) {
          const score = detections.detection.score
          if (score >= minConfidence) {
            faceDetected.value = true
            detectionConfidence.value = score

            // Extract face position (relative to video dimensions)
            const box = detections.detection.box
            facePosition.value = {
              x: box.x / videoElement.videoWidth,
              y: box.y / videoElement.videoHeight,
              width: box.width / videoElement.videoWidth,
              height: box.height / videoElement.videoHeight,
              absoluteX: box.x,
              absoluteY: box.y,
              absoluteWidth: box.width,
              absoluteHeight: box.height
            }
          } else {
            faceDetected.value = false
            detectionConfidence.value = score
          }
        } else {
          faceDetected.value = false
          detectionConfidence.value = 0
          facePosition.value = null
        }
      } catch (error) {
        console.error('[FaceDetection] Detection error:', error)
        // Don't set error state for detection errors (they're transient)
      }
    }

    // Run detection at intervals
    detectionInterval = setInterval(detectFace, interval)
    
    // Run initial detection
    detectFace()
  }

  /**
   * Stop face detection
   */
  const stopDetection = () => {
    isDetecting.value = false
    faceDetected.value = false
    facePosition.value = null
    detectionConfidence.value = 0

    if (detectionInterval) {
      clearInterval(detectionInterval)
      detectionInterval = null
    }

    videoElement = null
    canvas = null
  }

  /**
   * Check if face is centered and properly positioned
   * @param {Number} centerThreshold - Threshold for center position (0-1, default 0.3)
   * @param {Number} sizeThreshold - Minimum face size relative to video (0-1, default 0.2)
   */
  const isFaceWellPositioned = (centerThreshold = 0.3, sizeThreshold = 0.2) => {
    if (!faceDetected.value || !facePosition.value) {
      return false
    }

    const pos = facePosition.value
    
    // Check if face is centered horizontally
    const centerX = pos.x + pos.width / 2
    const horizontalCentered = Math.abs(centerX - 0.5) < centerThreshold

    // Check if face is at a good vertical position (slightly above center)
    const centerY = pos.y + pos.height / 2
    const verticalCentered = centerY > 0.3 && centerY < 0.7

    // Check if face size is reasonable (not too small, not too large)
    const faceSize = Math.max(pos.width, pos.height)
    const sizeGood = faceSize >= sizeThreshold && faceSize <= 0.8

    return horizontalCentered && verticalCentered && sizeGood && detectionConfidence.value >= 0.7
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopDetection()
  })

  return {
    // State
    isDetecting,
    isModelLoaded,
    faceDetected,
    facePosition,
    detectionConfidence,
    isLoadingModels,
    detectionError,

    // Methods
    loadModels,
    startDetection,
    stopDetection,
    isFaceWellPositioned
  }
}
