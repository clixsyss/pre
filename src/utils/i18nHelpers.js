/**
 * Helper functions for handling bilingual data from Firestore
 */

/**
 * Get the text in the current locale from a bilingual field
 * @param {Object|String} field - The bilingual field object { en: '...', ar: '...' } or a string
 * @param {String} locale - The current locale (e.g., 'en-US' or 'ar-SA')
 * @param {String} fallback - Fallback text if field is empty
 * @returns {String} The text in the current language
 */
export function getLocalizedText(field, locale = 'en-US', fallback = '') {
  // If field is null or undefined, return fallback
  if (!field) return fallback

  // If field is a string (old format), return it as is
  if (typeof field === 'string') return field

  // If field is an object with language keys
  if (typeof field === 'object') {
    // Extract language code from locale (e.g., 'en-US' -> 'en', 'ar-SA' -> 'ar')
    const lang = locale.split('-')[0]
    
    // Try to get the text in the current language
    if (field[lang]) return field[lang]
    
    // Try the full locale key
    if (field[locale]) return field[locale]
    
    // Fallback to English
    if (field.en || field['en-US']) return field.en || field['en-US']
    
    // Fallback to Arabic
    if (field.ar || field['ar-SA']) return field.ar || field['ar-SA']
    
    // Return the first available value
    const values = Object.values(field)
    if (values.length > 0) return values[0]
  }

  return fallback
}

/**
 * Create a bilingual field object
 * @param {String} enText - English text
 * @param {String} arText - Arabic text
 * @returns {Object} Bilingual field object { en: '...', ar: '...' }
 */
export function createBilingualField(enText, arText) {
  return {
    en: enText || '',
    ar: arText || ''
  }
}

/**
 * Check if a field is bilingual (has en and ar keys)
 * @param {*} field - The field to check
 * @returns {Boolean} True if field is bilingual
 */
export function isBilingualField(field) {
  return (
    field &&
    typeof field === 'object' &&
    !Array.isArray(field) &&
    (('en' in field && 'ar' in field) || 
     ('en-US' in field && 'ar-SA' in field))
  )
}

/**
 * Convert a document with bilingual fields to use current locale
 * @param {Object} doc - Firestore document
 * @param {String} locale - Current locale
 * @param {Array} bilingualFields - Array of field names that are bilingual
 * @returns {Object} Document with localized text
 */
export function localizeDocument(doc, locale = 'en-US', bilingualFields = []) {
  if (!doc) return doc
  
  const localized = { ...doc }
  
  bilingualFields.forEach(fieldName => {
    if (doc[fieldName]) {
      localized[fieldName] = getLocalizedText(doc[fieldName], locale, doc[fieldName])
    }
  })
  
  return localized
}

/**
 * Auto-detect and localize all bilingual fields in a document
 * @param {Object} doc - Firestore document
 * @param {String} locale - Current locale
 * @returns {Object} Document with localized text
 */
export function autoLocalizeDocument(doc, locale = 'en-US') {
  if (!doc) return doc
  
  const localized = { ...doc }
  
  Object.keys(doc).forEach(key => {
    if (isBilingualField(doc[key])) {
      localized[key] = getLocalizedText(doc[key], locale, '')
      // Also keep the original bilingual field for reference
      localized[`${key}_bilingual`] = doc[key]
    }
  })
  
  return localized
}

/**
 * Sort an array of documents by a bilingual field
 * @param {Array} documents - Array of documents
 * @param {String} fieldName - Field name to sort by
 * @param {String} locale - Current locale
 * @param {String} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export function sortByBilingualField(documents, fieldName, locale = 'en-US', order = 'asc') {
  return [...documents].sort((a, b) => {
    const aText = getLocalizedText(a[fieldName], locale, '')
    const bText = getLocalizedText(b[fieldName], locale, '')
    
    const comparison = aText.localeCompare(bText, locale.split('-')[0])
    return order === 'asc' ? comparison : -comparison
  })
}

/**
 * Filter documents by searching in bilingual fields
 * @param {Array} documents - Array of documents
 * @param {String} searchTerm - Search term
 * @param {Array} searchFields - Field names to search in
 * @param {String} locale - Current locale
 * @returns {Array} Filtered array
 */
export function searchBilingualDocuments(documents, searchTerm, searchFields = [], locale = 'en-US') {
  if (!searchTerm) return documents
  
  const lowerSearchTerm = searchTerm.toLowerCase()
  
  return documents.filter(doc => {
    return searchFields.some(fieldName => {
      const fieldValue = doc[fieldName]
      
      // If bilingual, search in current locale
      if (isBilingualField(fieldValue)) {
        const localizedText = getLocalizedText(fieldValue, locale, '')
        return localizedText.toLowerCase().includes(lowerSearchTerm)
      }
      
      // If string, search directly
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(lowerSearchTerm)
      }
      
      return false
    })
  })
}

export default {
  getLocalizedText,
  createBilingualField,
  isBilingualField,
  localizeDocument,
  autoLocalizeDocument,
  sortByBilingualField,
  searchBilingualDocuments
}

