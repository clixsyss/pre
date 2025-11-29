import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import { Quasar } from 'quasar'
import messages from 'src/i18n'
import { setI18nInstance } from 'src/stores/settingsStore'

// Import Quasar language packs
import langEn from 'quasar/lang/en-US'
import langAr from 'quasar/lang/ar'

export default defineBoot(({ app }) => {
  // Get saved language from localStorage or default to 'en-US'
  // Only access localStorage if we're in a browser environment
  const savedLanguage = (typeof window !== 'undefined' && localStorage.getItem('app-language')) || 'en-US'
  
  const i18n = createI18n({
    locale: savedLanguage,
    fallbackLocale: 'en-US',
    globalInjection: true,
    legacy: false, // Use Composition API mode
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
  
  // Make i18n available globally
  app.config.globalProperties.$i18n = i18n
  
  // Register i18n instance with settings store for language switching
  setI18nInstance(i18n)
  
  // Set initial RTL direction based on saved language
  const isRTL = savedLanguage === 'ar-SA' || savedLanguage.startsWith('ar')
  
  // Set Quasar language pack
  if (isRTL) {
    Quasar.lang.set(langAr)
  } else {
    Quasar.lang.set(langEn)
  }
  
  // Set HTML dir attribute
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', isRTL ? 'ar' : 'en')
  }
})
