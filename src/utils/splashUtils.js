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
 */
export const showSplashWhileExecuting = async (asyncFunction, minDuration = 1000) => {
  const splashStore = useSplashStore()
  const startTime = Date.now()
  
  splashStore.showSplash()
  splashStore.setLoading(true)
  
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
      }, 500)
    }, remaining)
  }
}
