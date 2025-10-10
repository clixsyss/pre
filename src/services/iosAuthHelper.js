/**
 * Native Platform Authentication Helper
 * Provides platform-specific authentication utilities for iOS and Android
 */

import { Capacitor } from '@capacitor/core'
import { auth } from '../boot/firebase'

class IOSAuthHelper {
  constructor() {
    this.isNative = Capacitor.isNativePlatform()
    this.platform = Capacitor.getPlatform()
    // Keep isIOS for backward compatibility
    this.isIOS = this.platform === 'ios' && this.isNative
  }

  /**
   * Ensure user is properly authenticated on native platforms
   * @param {Object} userCredential - Firebase user credential
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Authenticated user
   */
  async ensureIOSAuthentication(userCredential, email, password) {
    if (!this.isNative) {
      return auth.currentUser || userCredential.user
    }

    console.log(`${this.platform} Auth Helper: Ensuring proper authentication on ${this.platform}`)
    
    // Check if current user is available
    if (!auth.currentUser) {
      console.log(`${this.platform} Auth Helper: No current user, re-authenticating...`)
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      await signInWithEmailAndPassword(auth, email, password)
      console.log(`${this.platform} Auth Helper: User re-authenticated successfully`)
    }

    // Wait for iOS auth state to stabilize
    await this.waitForIOSAuthStabilization()

    // Force refresh user token for iOS
    await this.refreshUserToken(userCredential.user)

    return auth.currentUser || userCredential.user
  }

  /**
   * Wait for native platform authentication state to stabilize
   * @returns {Promise<void>}
   */
  async waitForIOSAuthStabilization() {
    if (!this.isNative) return

    console.log(`${this.platform} Auth Helper: Waiting for auth state to stabilize...`)
    
    // Longer wait for iOS
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Additional wait if needed
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log(`${this.platform} Auth Helper: Auth state stabilized`)
  }

  /**
   * Refresh user token for iOS
   * @param {Object} user - Firebase user
   * @returns {Promise<void>}
   */
  async refreshUserToken(user) {
    if (!this.isNative) return

    try {
      console.log(`${this.platform} Auth Helper: Refreshing user token...`)
      await user.getIdToken(true)
      console.log(`${this.platform} Auth Helper: User token refreshed successfully`)
    } catch (tokenError) {
      console.warn('iOS Auth Helper: Token refresh failed:', tokenError)
      // Don't throw - this is not critical for email verification
    }
  }

  /**
   * Send email verification with iOS-specific retry logic
   * @param {Object} user - Firebase user
   * @returns {Promise<void>}
   */
  async sendEmailVerificationWithRetry(user) {
    const { sendEmailVerification } = await import('firebase/auth')
    
    let emailSent = false
    let retryCount = 0
    const maxRetries = this.isIOS ? 5 : 3 // More retries for iOS
    const retryDelay = this.isIOS ? 2000 : 1000 // Longer delay for iOS

    while (!emailSent && retryCount < maxRetries) {
      try {
        console.log(`iOS Auth Helper: Sending email verification attempt ${retryCount + 1}/${maxRetries}`)
        await sendEmailVerification(user)
        console.log(`${this.platform} Auth Helper: Email verification sent successfully`)
        emailSent = true
      } catch (error) {
        retryCount++
        console.warn(`iOS Auth Helper: Email verification attempt ${retryCount} failed:`, error)
        
        if (retryCount < maxRetries) {
          console.log(`iOS Auth Helper: Retrying in ${retryDelay}ms... (${retryCount}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        } else {
          console.error('iOS Auth Helper: All email verification attempts failed')
          throw error
        }
      }
    }
  }

  /**
   * Get platform-specific error message
   * @param {Error} error - Firebase error
   * @returns {string} - User-friendly error message
   */
  getPlatformErrorMessage(error) {
    const baseMessage = 'Account created but verification email failed to send. Please try signing in and request a new verification email.'
    
    if (error.code === 'auth/too-many-requests') {
      return 'Account created but too many verification emails sent. Please wait before requesting another email.'
    } else if (error.code === 'auth/network-request-failed') {
      return 'Account created but network error prevented email sending. Please check your connection and try signing in to request a new verification email.'
    } else if (error.code === 'auth/user-not-found') {
      return 'Account created but user authentication failed. Please try signing in and request a new verification email.'
    } else if (error.code === 'auth/invalid-user-token') {
      return 'Account created but authentication token expired. Please try signing in and request a new verification email.'
    } else if (this.isIOS && error.code === 'auth/operation-not-allowed') {
      return 'Account created but email verification is not enabled for this app. Please contact support.'
    }
    
    return baseMessage
  }

  /**
   * Check if running on native platform (iOS or Android)
   * @returns {boolean}
   */
  isIOSNative() {
    return this.isNative
  }
}

// Create and export singleton instance
const iosAuthHelper = new IOSAuthHelper()
export default iosAuthHelper
