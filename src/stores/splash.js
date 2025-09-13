import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSplashStore = defineStore('splash', () => {
  const show = ref(true)
  const loading = ref(false)
  const loadingMessage = ref('')

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

  return {
    show,
    loading,
    loadingMessage,
    hideSplash,
    showSplash,
    setLoading,
    setLoadingMessage,
    showLoadingWithMessage
  }
})
