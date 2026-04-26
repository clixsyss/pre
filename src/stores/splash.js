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

  // Add app-loaded only after the router has completed its first navigation.
  // This prevents the body background from switching from black to #f6f6f6 before
  // the first page is painted, which causes the white flash between splash and content.
  const applyAppLoaded = () => {
    if (document.body.classList.contains('app-loaded')) return
    document.body.classList.add('app-loaded')
    console.log('✅ Splash: App loaded class added to body')
    // Enable transitions only after two animation frames so the initial paint
    // (background switch from black to #f6f6f6) happens instantly with no animation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('transitions-ready')
      })
    })
  }

  const checkAndHideSplash = async () => {
    if (videoCompleted.value && appInitialized.value) {
      console.log('🎬 Splash: Both video and app ready — hiding splash')
      // Apply app-loaded BEFORE hiding the splash so the content underneath
      // already has the correct background when the fade-out completes.
      applyAppLoaded()
      hideSplash()
      setTimeout(async () => {
        try {
          if (Capacitor.isNativePlatform()) {
            await SplashScreen.hide()
            console.log('✅ Native splash hidden - app is fully loaded')
          }
        } catch (error) {
          console.warn('⚠️ Could not hide native splash:', error)
        }
      }, 250)
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
      applyAppLoaded()
      hideSplash()
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
