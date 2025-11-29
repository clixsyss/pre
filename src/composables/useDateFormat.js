import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Composable for formatting dates with proper locale support
 * Uses Gregorian calendar even for Arabic to avoid Hijri calendar issues
 */
export function useDateFormat() {
  const { locale } = useI18n()
  
  /**
   * Get the appropriate locale for date formatting
   * For Arabic, use ar-EG (Egypt) which defaults to Gregorian calendar
   * instead of ar-SA which defaults to Hijri calendar
   */
  const dateLocale = computed(() => {
    return locale.value === 'ar-SA' ? 'ar-EG' : 'en-US'
  })
  
  /**
   * Format a date with long month names
   * @param {Date|Object} date - Date object or Firestore timestamp
   * @returns {string} Formatted date string
   */
  const formatDate = (date) => {
    if (!date) return null

    try {
      const currentLocale = dateLocale.value
      
      if (date.toDate && typeof date.toDate === 'function') {
        // Firestore timestamp
        return date.toDate().toLocaleDateString(currentLocale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          calendar: 'gregory' // Force Gregorian calendar
        })
      } else if (typeof date === 'string') {
        // String date
        return new Date(date).toLocaleDateString(currentLocale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          calendar: 'gregory' // Force Gregorian calendar
        })
      }
    } catch (err) {
      console.warn('Error formatting date:', err)
    }

    return date
  }
  
  /**
   * Format a date with short month names
   * @param {Date|Object} date - Date object or Firestore timestamp
   * @returns {string} Formatted date string
   */
  const formatDateShort = (date) => {
    if (!date) return null

    try {
      const currentLocale = dateLocale.value
      let dateObj
      
      if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate()
      } else if (typeof date === 'string') {
        // Handle ISO date strings
        if (date.includes('-')) {
          dateObj = new Date(date + 'T00:00:00')
        } else {
          dateObj = new Date(date)
        }
      } else {
        dateObj = date
      }
      
      return dateObj.toLocaleDateString(currentLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        calendar: 'gregory' // Force Gregorian calendar
      })
    } catch (err) {
      console.warn('Error formatting date:', err)
    }

    return date
  }
  
  /**
   * Format a date with time
   * @param {Date|Object} date - Date object or Firestore timestamp
   * @returns {string} Formatted date and time string
   */
  const formatDateTime = (date) => {
    if (!date) return null

    try {
      const currentLocale = dateLocale.value
      let dateObj
      
      if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate()
      } else if (date.seconds) {
        // Firestore-like object
        dateObj = new Date(date.seconds * 1000)
      } else if (typeof date === 'string') {
        dateObj = new Date(date)
      } else {
        dateObj = date
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return null
      }
      
      return dateObj.toLocaleDateString(currentLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        calendar: 'gregory' // Force Gregorian calendar
      })
    } catch (err) {
      console.warn('Error formatting date time:', err)
    }

    return date
  }
  
  /**
   * Format a date with weekday
   * @param {Date|Object} date - Date object or Firestore timestamp
   * @returns {string} Formatted date string with weekday
   */
  const formatDateWithWeekday = (date) => {
    if (!date) return null

    try {
      const currentLocale = dateLocale.value
      let dateObj
      
      if (date.toDate && typeof date.toDate === 'function') {
        dateObj = date.toDate()
      } else if (date.seconds) {
        dateObj = new Date(date.seconds * 1000)
      } else if (typeof date === 'string') {
        // Handle ISO date strings
        if (date.includes('-')) {
          dateObj = new Date(date + 'T00:00:00')
        } else {
          dateObj = new Date(date)
        }
      } else {
        dateObj = date
      }
      
      return dateObj.toLocaleDateString(currentLocale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        calendar: 'gregory' // Force Gregorian calendar
      })
    } catch (err) {
      console.warn('Error formatting date with weekday:', err)
    }

    return date
  }

  return {
    formatDate,
    formatDateShort,
    formatDateTime,
    formatDateWithWeekday,
    dateLocale
  }
}

