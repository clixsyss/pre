import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppSettingsStore = defineStore('appSettings', () => {
  // Shake detection settings (commented out for now - default off)
  const shakeEnabled = ref(false)
  const shakeSensitivity = ref(15) // Default: 15 (lower = more sensitive)
  
  // Initialize settings from localStorage
  const initSettings = () => {
    const savedShakeEnabled = localStorage.getItem('shakeEnabled')
    const savedShakeSensitivity = localStorage.getItem('shakeSensitivity')
    
    if (savedShakeEnabled !== null) {
      shakeEnabled.value = savedShakeEnabled === 'true'
    }
    
    if (savedShakeSensitivity !== null) {
      shakeSensitivity.value = parseInt(savedShakeSensitivity)
    }
  }
  
  // Update shake enabled setting
  const setShakeEnabled = (enabled) => {
    shakeEnabled.value = enabled
    localStorage.setItem('shakeEnabled', String(enabled))
  }
  
  // Update shake sensitivity setting
  const setShakeSensitivity = (sensitivity) => {
    shakeSensitivity.value = sensitivity
    localStorage.setItem('shakeSensitivity', String(sensitivity))
  }
  
  // Get sensitivity label
  const getSensitivityLabel = (value) => {
    if (value <= 10) return 'Very Sensitive'
    if (value <= 15) return 'Normal'
    if (value <= 20) return 'Less Sensitive'
    return 'Least Sensitive'
  }
  
  return {
    shakeEnabled,
    shakeSensitivity,
    initSettings,
    setShakeEnabled,
    setShakeSensitivity,
    getSensitivityLabel
  }
})

