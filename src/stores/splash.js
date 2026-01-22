import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'

export const useSplashStore = defineStore('splash', () => {
  const show = ref(true)
  const loading = ref(false)
  const loadingMessage = ref('')
  const videoCompleted = ref(false)
  const appInitialized = ref(false)

  const hideSplash = () => {
    show.value = false
  }

  const showSplash = () => {
    show.value = true
  }

  const setLoading = (value) => {
    loading.value = value
  }

  const setLoadingMessage = (message) => {
    loadingMessage.value = message
  }

  const setVideoCompleted = () => {
    console.log('📹 Splash: Video completed')
    videoCompleted.value = true
    checkAndHideSplash()
  }

  const setAppInitialized = () => {
    console.log('✅ Splash: App initialized')
    appInitialized.value = true
    checkAndHideSplash()
  }

  const checkAndHideSplash = async () => {
    if (videoCompleted.value && appInitialized.value) {
      console.log('🎬 Splash: Both video and app ready, hiding splash...')
      
      // Wait a moment to ensure custom splash is fully visible
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Start fading out custom splash
      hideSplash()
      
      // Wait for custom splash fade-out to complete (0.8s from CSS)
      setTimeout(async () => {
        // Only hide native splash AFTER custom splash has faded out
        // This prevents white screen flash
        try {
          if (Capacitor.isNativePlatform()) {
            await SplashScreen.hide()
            console.log('✅ Native splash hidden - app is fully loaded')
          }
        } catch (error) {
          console.warn('⚠️ Could not hide native splash:', error)
        }
        
        // Add app-loaded class to body to allow background color transition
        setTimeout(() => {
          document.body.classList.add('app-loaded')
          console.log('✅ Splash: App loaded class added to body')
        }, 100)
      }, 800) // Match the splash-fade-leave-active transition duration
    } else {
      console.log('⏳ Splash: Waiting...', {
        videoCompleted: videoCompleted.value,
        appInitialized: appInitialized.value
      })
    }
  }

  // Safety timeout: Force hide splash after 6 seconds if still showing
  // This prevents black screen on Android if video/app initialization fails
  setTimeout(() => {
    if (show.value) {
      console.warn('⏱️ Splash Store: Safety timeout reached, forcing hide')
      videoCompleted.value = true
      appInitialized.value = true
      hideSplash()
      // Also hide native splash
      if (Capacitor.isNativePlatform()) {
        SplashScreen.hide().catch(err => {
          console.warn('⚠️ Could not hide native splash on timeout:', err)
        })
      }
    }
  }, 6000)

  const showLoadingWithMessage = (message, duration = 3000) => {
    setLoadingMessage(message)
    showSplash()
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      setTimeout(() => {
        hideSplash()
        setLoadingMessage('')
      }, 500)
    }, duration)
  }

  const reset = () => {
    show.value = true
    loading.value = false
    loadingMessage.value = ''
    videoCompleted.value = false
    appInitialized.value = false
  }

  return {
    show,
    loading,
    loadingMessage,
    videoCompleted,
    appInitialized,
    hideSplash,
    showSplash,
    setLoading,
    setLoadingMessage,
    setVideoCompleted,
    setAppInitialized,
    showLoadingWithMessage,
    reset
  }
})
