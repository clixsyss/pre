import { useSplashStore } from '../stores/splash'

/**
 * Utility functions for controlling the splash screen
 */

/**
 * Show the splash screen
 */
export const showSplash = () => {
  const splashStore = useSplashStore()
  splashStore.showSplash()
}

/**
 * Hide the splash screen
 */
export const hideSplash = () => {
  const splashStore = useSplashStore()
  splashStore.hideSplash()
}

/**
 * Set loading state
 * @param {boolean} loading - Whether to show loading indicator
 */
export const setLoading = (loading) => {
  const splashStore = useSplashStore()
  splashStore.setLoading(loading)
}

/**
 * Show splash screen with loading for a specific duration
 * @param {number} duration - Duration in milliseconds
 * @param {boolean} showLoading - Whether to show loading indicator
 */
export const showSplashForDuration = (duration = 3000, showLoading = true) => {
  const splashStore = useSplashStore()
  
  splashStore.showSplash()
  if (showLoading) {
    splashStore.setLoading(true)
  }
  
  setTimeout(() => {
    if (showLoading) {
      splashStore.setLoading(false)
      setTimeout(() => {
        splashStore.hideSplash()
      }, 500)
    } else {
      splashStore.hideSplash()
    }
  }, duration)
}

/**
 * Show splash screen while executing an async function
 * @param {Function} asyncFunction - The async function to execute
 * @param {number} minDuration - Minimum duration to show splash (ms)
 * @param {string} message - Loading message to display
 */
export const showSplashWhileExecuting = async (asyncFunction, minDuration = 1000, message = '') => {
  const splashStore = useSplashStore()
  const startTime = Date.now()
  
  splashStore.showSplash()
  splashStore.setLoading(true)
  if (message) {
    splashStore.setLoadingMessage(message)
  }
  
  try {
    await asyncFunction()
  } catch (error) {
    console.error('Error during splash screen execution:', error)
    throw error
  } finally {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minDuration - elapsed)
    
    setTimeout(() => {
      splashStore.setLoading(false)
      setTimeout(() => {
        splashStore.hideSplash()
        splashStore.setLoadingMessage('')
      }, 500)
    }, remaining)
  }
}

/**
 * Show loading screen with custom message
 * @param {string} message - Loading message to display
 * @param {number} duration - Duration to show loading (ms)
 */
export const showLoadingWithMessage = (message, duration = 3000) => {
  const splashStore = useSplashStore()
  splashStore.showLoadingWithMessage(message, duration)
}
