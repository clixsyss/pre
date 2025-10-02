import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // State - safely access localStorage
  const getStoredLanguage = () => {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('app-language') || 'en-US'
    }
    return 'en-US'
  }
  
  const getStoredTheme = () => {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('app-theme') || 'light'
    }
    return 'light'
  }
  
  const currentLanguage = ref(getStoredLanguage())
  const currentTheme = ref(getStoredTheme())
  const isRTL = ref(currentLanguage.value === 'ar-SA')

  // Computed properties
  const languageOptions = computed(() => [
    { value: 'en-US', label: 'English', flag: '🇺🇸' },
    { value: 'ar-SA', label: 'العربية', flag: '🇸🇦' }
  ])

  const themeOptions = computed(() => [
    { value: 'light', label: 'Light Mode', icon: '☀️' },
    { value: 'dark', label: 'Dark Mode', icon: '🌙' }
  ])

  // Actions
  const setLanguage = (language) => {
    currentLanguage.value = language
    isRTL.value = language === 'ar-SA'
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('app-language', language)
    }
    
    // Update document direction
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', language)
    }
    
    // Update i18n locale - only if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        // Try to get the i18n instance from the global app
        const app = window.__VUE_APP__ || window.app
        if (app && app.config && app.config.globalProperties && app.config.globalProperties.$i18n) {
          app.config.globalProperties.$i18n.locale = language
        }
      } catch (error) {
        console.warn('Could not update i18n locale:', error)
      }
    }
  }

  const setTheme = (theme) => {
    currentTheme.value = theme
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('app-theme', theme)
    }
    
    // Update document class for theme
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    }
  }

  const initializeSettings = () => {
    // Only initialize if we're in a browser environment
    if (typeof window === 'undefined') return
    
    try {
      // Apply saved settings on app start
      setLanguage(currentLanguage.value)
      setTheme(currentTheme.value)
    } catch (error) {
      console.warn('Error initializing settings:', error)
    }
  }

  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const toggleLanguage = () => {
    const newLanguage = currentLanguage.value === 'en-US' ? 'ar-SA' : 'en-US'
    setLanguage(newLanguage)
  }

  return {
    // State
    currentLanguage,
    currentTheme,
    isRTL,
    
    // Computed
    languageOptions,
    themeOptions,
    
    // Actions
    setLanguage,
    setTheme,
    initializeSettings,
    toggleTheme,
    toggleLanguage
  }
})
