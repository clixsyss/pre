import { ref, onMounted, onUnmounted, unref } from 'vue'
import { Capacitor } from '@capacitor/core'

/**
 * Composable for detecting shake gestures on mobile devices
 * Uses the device's accelerometer to detect rapid motion
 * 
 * @param {Function} onShake - Callback function to execute when shake is detected
 * @param {Object} options - Configuration options
 * @param {Number|Ref} options.threshold - Shake detection threshold (default: 15) - can be reactive
 * @param {Number} options.timeout - Minimum time between shakes in ms (default: 1000)
 */
export function useShakeDetection(onShake, options = {}) {
  const isShakeEnabled = ref(true)
  const lastShakeTime = ref(0)
  
  // Configuration - support both static and reactive threshold
  const getThreshold = () => unref(options.threshold) || 15 // Shake sensitivity
  const timeout = options.timeout || 1000 // Minimum time between shakes
  
  // Store last acceleration values
  let lastX = 0
  let lastY = 0
  let lastZ = 0
  let lastUpdate = 0

  /**
   * Handle device motion events
   * Calculates acceleration delta and triggers shake callback if threshold is exceeded
   */
  const handleMotion = (event) => {
    if (!isShakeEnabled.value) return

    const current = Date.now()
    
    // Throttle updates to every 100ms
    if (current - lastUpdate < 100) return
    
    lastUpdate = current

    // Get acceleration data
    const acceleration = event.accelerationIncludingGravity || event.acceleration
    if (!acceleration) return

    const { x, y, z } = acceleration

    // Calculate the change in acceleration
    const deltaX = Math.abs(x - lastX)
    const deltaY = Math.abs(y - lastY)
    const deltaZ = Math.abs(z - lastZ)

    // Calculate total acceleration change
    const accelerationChange = deltaX + deltaY + deltaZ

    // Get current threshold (supports reactive values)
    const currentThreshold = getThreshold()

    // Detect shake based on acceleration change
    if (accelerationChange > currentThreshold) {
      const currentTime = Date.now()
      
      // Prevent multiple rapid shake triggers
      if (currentTime - lastShakeTime.value > timeout) {
        lastShakeTime.value = currentTime
        
        console.log('🎯 Shake detected!', {
          accelerationChange: accelerationChange.toFixed(2),
          threshold: currentThreshold
        })
        
        // Trigger the shake callback
        if (typeof onShake === 'function') {
          onShake()
        }
      }
    }

    // Store current values for next comparison
    lastX = x
    lastY = y
    lastZ = z
  }

  /**
   * Request permission for motion sensors on iOS 13+
   */
  const requestMotionPermission = async () => {
    // iOS 13+ requires permission for motion sensors
    if (typeof DeviceMotionEvent !== 'undefined' && 
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission()
        if (permission === 'granted') {
          console.log('✅ Motion permission granted')
          return true
        } else {
          console.warn('⚠️ Motion permission denied')
          return false
        }
      } catch (error) {
        console.error('❌ Error requesting motion permission:', error)
        return false
      }
    }
    
    // For non-iOS or older iOS versions, permission is not required
    return true
  }

  /**
   * Start listening for shake gestures
   */
  const startShakeDetection = async () => {
    // Only enable on native platforms or web with motion support
    if (!Capacitor.isNativePlatform() && typeof DeviceMotionEvent === 'undefined') {
      console.warn('⚠️ Device motion not supported on this platform')
      return
    }

    // Request permission if needed (iOS 13+)
    const hasPermission = await requestMotionPermission()
    if (!hasPermission) return

    // Start listening to device motion
    if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleMotion, true)
      console.log('✅ Shake detection started')
    }
  }

  /**
   * Stop listening for shake gestures
   */
  const stopShakeDetection = () => {
    if (typeof DeviceMotionEvent !== 'undefined') {
      window.removeEventListener('devicemotion', handleMotion, true)
      console.log('🛑 Shake detection stopped')
    }
  }

  /**
   * Enable shake detection
   */
  const enableShake = () => {
    isShakeEnabled.value = true
  }

  /**
   * Disable shake detection temporarily
   */
  const disableShake = () => {
    isShakeEnabled.value = false
  }

  // Auto-start on mount
  onMounted(() => {
    startShakeDetection()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopShakeDetection()
  })

  return {
    isShakeEnabled,
    enableShake,
    disableShake,
    startShakeDetection,
    stopShakeDetection
  }
}

