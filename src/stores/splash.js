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
    videoCompleted.value = true
    checkAndHideSplash()
  }

  const setAppInitialized = () => {
    appInitialized.value = true
    checkAndHideSplash()
  }

  // Apply app-loaded class after the router completes its first navigation.
  // Prevents the body background switching from black → #f6f6f6 before first paint,
  // which is what causes the white flash.
  const applyAppLoaded = () => {
    if (document.body.classList.contains('app-loaded')) return
    document.body.classList.add('app-loaded')
    // Enable CSS transitions after two rAF frames so the initial paint is instant
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('transitions-ready')
      })
    })
  }

  const checkAndHideSplash = async () => {
    if (videoCompleted.value && appInitialized.value) {
      applyAppLoaded()
      hideSplash()
      setTimeout(async () => {
        try {
          if (Capacitor.isNativePlatform()) await SplashScreen.hide()
        } catch (error) {
          console.warn('⚠️ Could not hide native splash:', error)
        }
      }, 250)
    }
  }

  // Safety: force-hide after 4.5s if video or app init never resolved
  setTimeout(() => {
    if (show.value) {
      videoCompleted.value = true
      appInitialized.value = true
      applyAppLoaded()
      hideSplash()
      if (Capacitor.isNativePlatform()) {
        SplashScreen.hide().catch(() => {})
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
