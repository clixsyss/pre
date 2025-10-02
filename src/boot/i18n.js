import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

export default defineBoot(({ app }) => {
  // Get saved language from localStorage or default to 'en-US'
  // Only access localStorage if we're in a browser environment
  const savedLanguage = (typeof window !== 'undefined' && localStorage.getItem('app-language')) || 'en-US'
  
  const i18n = createI18n({
    locale: savedLanguage,
    fallbackLocale: 'en-US',
    globalInjection: true,
    messages,
  })

  // Set i18n instance on app
  app.use(i18n)
  
  // Make i18n available globally
  app.config.globalProperties.$i18n = i18n
})
