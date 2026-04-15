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
  const normalizeLanguage = (language) => {
    const lang = String(language || '').toLowerCase()
    return lang.startsWith('ar') ? 'ar' : 'en-US'
  }

  // State - safely access localStorage
  const getStoredLanguage = () => {
    if (typeof window !== 'undefined' && localStorage) {
      return normalizeLanguage(localStorage.getItem('app-language') || 'en-US')
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
  const isRTL = ref(currentLanguage.value.startsWith('ar'))

  // Computed properties
  const languageOptions = computed(() => [
    { value: 'en-US', label: 'English', flag: '🇺🇸' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' }
  ])

  const themeOptions = computed(() => [
    { value: 'light', label: 'Light Mode', icon: '☀️' },
    { value: 'dark', label: 'Dark Mode', icon: '🌙' }
  ])

  // Actions
  const setLanguage = (language, skipReload = false) => {
    const resolvedLanguage = normalizeLanguage(language)
    const isSameLanguage = currentLanguage.value === resolvedLanguage

    // Prevent unnecessary work when language is unchanged.
    // On some iOS builds, repeatedly re-applying locale packs can throw native tokenizer errors.
    if (isSameLanguage && skipReload) {
      isRTL.value = resolvedLanguage.startsWith('ar')
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('dir', isRTL.value ? 'rtl' : 'ltr')
        document.documentElement.setAttribute('lang', isRTL.value ? 'ar' : 'en')
      }
      return
    }

    // Prevent infinite reload - check if language is actually changing
    if (isSameLanguage && !skipReload) {
      console.log('⏭️ Language already set to:', language)
      return
    }
    
    console.log('🌍 Changing language from', currentLanguage.value, 'to', resolvedLanguage)
    
    currentLanguage.value = resolvedLanguage
    isRTL.value = resolvedLanguage.startsWith('ar')
    
    // Save to localStorage
    if (typeof window !== 'undefined' && localStorage) {
      try {
        localStorage.setItem('app-language', resolvedLanguage)
      } catch (error) {
        console.warn('Failed to persist language to localStorage:', error)
      }
    }
    
    // Update Vue I18n locale
    if (i18nInstance) {
      try {
        i18nInstance.global.locale.value = resolvedLanguage
      } catch (error) {
        if (!(error?.code === 10 && error?.domain === 'tokenizer')) {
          console.warn('Failed to apply i18n locale:', error)
        }
      }
    }
    
    // Update Quasar language pack (native-safe)
    try {
      if (isRTL.value) {
        Quasar.lang.set(langAr)
      } else {
        Quasar.lang.set(langEn)
      }
    } catch (error) {
      console.warn('Failed to apply Quasar language pack:', error)
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
    const newLanguage = currentLanguage.value === 'en-US' ? 'ar' : 'en-US'
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
