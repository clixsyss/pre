import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppSettingsStore = defineStore('appSettings', () => {
  // Shake detection settings
  // Default: enabled, with a less sensitive default threshold
  const shakeEnabled = ref(true)
  const shakeSensitivity = ref(20) // Higher number = requires stronger shake
  const autoOpenGateEnabled = ref(false)
  const autoOpenRssiThreshold = ref(-65)
  
  // Initialize settings from localStorage
  const initSettings = () => {
    const savedShakeEnabled = localStorage.getItem('shakeEnabled')
    const savedShakeSensitivity = localStorage.getItem('shakeSensitivity')
    const savedAutoOpenGateEnabled = localStorage.getItem('autoOpenGateEnabled')
    const savedAutoOpenRssiThreshold = localStorage.getItem('autoOpenRssiThreshold')
    
    if (savedShakeEnabled !== null) {
      shakeEnabled.value = savedShakeEnabled === 'true'
    }
    
    if (savedShakeSensitivity !== null) {
      shakeSensitivity.value = parseInt(savedShakeSensitivity)
    }

    if (savedAutoOpenGateEnabled !== null) {
      autoOpenGateEnabled.value = savedAutoOpenGateEnabled === 'true'
    }

    if (savedAutoOpenRssiThreshold !== null) {
      const parsed = parseInt(savedAutoOpenRssiThreshold, 10)
      if (!Number.isNaN(parsed)) {
        autoOpenRssiThreshold.value = parsed
      }
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

  const setAutoOpenGateEnabled = (enabled) => {
    autoOpenGateEnabled.value = enabled
    localStorage.setItem('autoOpenGateEnabled', String(enabled))
  }

  const setAutoOpenRssiThreshold = (threshold) => {
    autoOpenRssiThreshold.value = threshold
    localStorage.setItem('autoOpenRssiThreshold', String(threshold))
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
    autoOpenGateEnabled,
    autoOpenRssiThreshold,
    initSettings,
    setShakeEnabled,
    setShakeSensitivity,
    setAutoOpenGateEnabled,
    setAutoOpenRssiThreshold,
    getSensitivityLabel
  }
})

