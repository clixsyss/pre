import { Network } from '@capacitor/network'
import { Notify } from 'quasar'

/**
 * Check if device is online
 */
export async function isOnline() {
  try {
    const status = await Network.getStatus()
    return status.connected
  } catch (error) {
    console.error('Error checking network status:', error)
    return true // Assume online if check fails
  }
}

/**
 * Retry a function with exponential backoff when network is available
 * @param {Function} fn - The async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {boolean} options.showNotification - Show notification on failure (default: true)
 * @returns {Promise} - The result of the function or throws error
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    showNotification = true
  } = options

  let lastError
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if online before attempting
      const online = await isOnline()
      if (!online) {
        throw new Error('No internet connection')
      }
      
      // Attempt the function
      return await fn()
    } catch (error) {
      lastError = error
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, error.message)
      
      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt)
      console.log(`Retrying in ${delay}ms...`)
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // All retries failed
  if (showNotification) {
    Notify.create({
      type: 'negative',
      message: 'Network Error',
      caption: 'Unable to complete request. Please check your connection.',
      position: 'top',
      timeout: 3000,
      classes: 'notif-with-safe-area'
    })
  }
  
  throw lastError
}

/**
 * Execute a function only if network is available
 * @param {Function} fn - The async function to execute
 * @param {Object} options - Options
 * @param {boolean} options.showOfflineMessage - Show notification if offline (default: true)
 * @returns {Promise} - The result of the function or null if offline
 */
export async function executeIfOnline(fn, options = {}) {
  const { showOfflineMessage = true } = options
  
  const online = await isOnline()
  
  if (!online) {
    if (showOfflineMessage) {
      Notify.create({
        type: 'warning',
        message: 'No Internet Connection',
        caption: 'This action requires an internet connection',
        position: 'top',
        timeout: 3000,
        icon: 'wifi_off',
        classes: 'notif-with-safe-area'
      })
    }
    return null
  }
  
  return await fn()
}

/**
 * Handle network errors and provide user-friendly messages
 * @param {Error} error - The error to handle
 * @param {string} context - Context for the error (e.g., 'loading data', 'submitting form')
 */
export function handleNetworkError(error, context = 'performing this action') {
  console.error('Network error:', error)
  
  // Check for common network-related error codes
  const isNetworkError = 
    error.code === 'auth/network-request-failed' ||
    error.code === 'unavailable' ||
    error.message?.toLowerCase().includes('network') ||
    error.message?.toLowerCase().includes('connection') ||
    error.message?.toLowerCase().includes('timeout')
  
  if (isNetworkError) {
    Notify.create({
      type: 'negative',
      message: 'Connection Issue',
      caption: `Unable to complete ${context}. Please check your internet connection and try again.`,
      position: 'top',
      timeout: 4000,
      icon: 'wifi_off',
      classes: 'notif-with-safe-area'
    })
  } else {
    Notify.create({
      type: 'negative',
      message: 'Error',
      caption: error.message || `An error occurred while ${context}`,
      position: 'top',
      timeout: 3000,
      classes: 'notif-with-safe-area'
    })
  }
}

/**
 * Wait for network to be available
 * @param {number} timeout - Maximum time to wait in ms (default: 30000)
 * @returns {Promise<boolean>} - True if network becomes available, false if timeout
 */
export async function waitForNetwork(timeout = 30000) {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const online = await isOnline()
    if (online) {
      return true
    }
    // Check every second
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return false
}

