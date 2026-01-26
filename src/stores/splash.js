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
      console.log('🎬 Splash: Both video and app ready')
      
      // 1. Poll for layout (keep body black until we hide native splash)
      const maxAttempts = 8 // ~400ms max
      const poll = (attempt = 0) => {
        if (document.querySelector('.main-layout, .auth-layout') || attempt >= maxAttempts) {
          // 2. Fade custom splash, hide native splash — body stays black (:not(.app-loaded))
          hideSplash()
          const fadeMs = 250
          setTimeout(async () => {
            try {
              if (Capacitor.isNativePlatform()) {
                await SplashScreen.hide()
                console.log('✅ Native splash hidden - app is fully loaded')
              }
              // 3. Add app-loaded ONLY after native splash hidden + brief delay (reduces white flash)
              setTimeout(() => {
                document.body.classList.add('app-loaded')
                console.log('✅ Splash: App loaded class added to body')
              }, 120)
            } catch (error) {
              console.warn('⚠️ Could not hide native splash:', error)
              document.body.classList.add('app-loaded')
            }
          }, fadeMs)
          return
        }
        setTimeout(() => poll(attempt + 1), 50)
      }
      poll(0)
    } else {
      console.log('⏳ Splash: Waiting...', {
        videoCompleted: videoCompleted.value,
        appInitialized: appInitialized.value
      })
    }
  }

  // Safety timeout: Force hide splash after 4.5s if still showing
  setTimeout(() => {
    if (show.value) {
      console.warn('⏱️ Splash Store: Safety timeout reached, forcing hide')
      videoCompleted.value = true
      appInitialized.value = true
      hideSplash()
      document.body.classList.add('app-loaded')
      if (Capacitor.isNativePlatform()) {
        SplashScreen.hide().catch(err => {
          console.warn('⚠️ Could not hide native splash on timeout:', err)
        })
      }
    }
  }, 4500)

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
