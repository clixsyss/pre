import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSplashStore = defineStore('splash', () => {
  const show = ref(true)
  const loading = ref(false)

  const hideSplash = () => {
    show.value = false
  }

  const showSplash = () => {
    show.value = true
  }

  const setLoading = (value) => {
    loading.value = value
  }

  return {
    show,
    loading,
    hideSplash,
    showSplash,
    setLoading
  }
})
