import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Quasar } from 'quasar'

// Import Quasar language packs
import langEn from 'quasar/lang/en-US'
import langAr from 'quasar/lang/ar'

// Store i18n instance globally so it can be accessed
let i18nInstance = null

export const setI18nInstance = (i18n) => {
  i18nInstance = i18n
}

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
  const setLanguage = (language, skipReload = false) => {
    // Prevent infinite reload - check if language is actually changing
    if (currentLanguage.value === language && !skipReload) {
      console.log('⏭️ Language already set to:', language)
      return
    }
    
    console.log('🌍 Changing language from', currentLanguage.value, 'to', language)
    
    currentLanguage.value = language
    isRTL.value = language === 'ar-SA'
    
    // Save to localStorage
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('app-language', language)
    }
    
    // Update Vue I18n locale
    if (i18nInstance) {
      i18nInstance.global.locale.value = language
    }
    
    // Update Quasar language pack
    if (isRTL.value) {
      Quasar.lang.set(langAr)
    } else {
      Quasar.lang.set(langEn)
    }
    
    // Update document direction and language
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', isRTL.value ? 'ar' : 'en')
    }
    
    // Only reload if this was a user-initiated change (not during initialization)
    if (!skipReload && typeof window !== 'undefined') {
      console.log('🔄 Reloading page to apply RTL styles...')
      window.location.reload()
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
      // Apply saved settings on app start (skip reload during initialization)
      setLanguage(currentLanguage.value, true) // true = skipReload
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
