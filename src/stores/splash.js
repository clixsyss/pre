import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  const checkAndHideSplash = () => {
    if (videoCompleted.value && appInitialized.value) {
      console.log('🎬 Splash: Both video and app ready, hiding splash after delay...')
      // Add a small delay for smooth transition
      setTimeout(() => {
        hideSplash()
        // Add app-loaded class to body to allow background color transition
        setTimeout(() => {
          document.body.classList.add('app-loaded')
          console.log('✅ Splash: App loaded class added to body')
        }, 300)
      }, 800)
    } else {
      console.log('⏳ Splash: Waiting...', {
        videoCompleted: videoCompleted.value,
        appInitialized: appInitialized.value
      })
    }
  }

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
