/**
 * Optimized Auth Service - Cached authentication with reduced Firebase calls
 */

import { auth, isNative, detectPlatformFromUrl } from '../boot/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'
import cacheService from './cacheService'

class OptimizedAuthService {
  constructor() {
    this.isNative = isNative
    this.auth = auth
    this.capacitorAuth = null
    this.initialized = false
    this.currentUser = null
    this.userCache = new Map()
    this.authListeners = new Set()
  }

  async initialize() {
    if (this.initialized) {
      console.log('OptimizedAuthService: Already initialized, skipping')
      return
    }
    
    try {
      // Skip Capacitor Firebase - use Web SDK exclusively
      console.log('OptimizedAuthService: Using Web SDK for all platforms')
      
      // Use reliable platform detection
      const platformInfo = detectPlatformFromUrl()
      console.log('OptimizedAuthService: Platform info:', platformInfo)
      
      // Wait a bit for Firebase to be fully ready on iOS
      if (platformInfo.platform === 'ios' && platformInfo.isNative) {
        console.log('OptimizedAuthService: iOS detected, waiting for Firebase to stabilize...')
        await new Promise(resolve => setTimeout(resolve, 1000)) // Increased delay for iOS
      }
      
      this.initialized = true
      console.log('OptimizedAuthService: Initialization complete')
    } catch (error) {
      console.error('OptimizedAuthService: Initialization error:', error)
      // Don't throw - allow app to continue even if there's an error
      this.initialized = true
    }
  }

  /**
   * Clear cached user (useful for logout or when auth state changes)
   */
  clearCachedUser() {
    this.currentUser = null
    console.log('🚀 OptimizedAuthService: Cleared cached user')
  }

  /**
   * Get current user with caching
   */
  async getCurrentUser() {
    // Return cached user if available and not expired
    if (this.currentUser) {
      console.log('🚀 OptimizedAuthService: Using cached current user')
      return this.currentUser
    }

    try {
      // Wait for initialization if needed
      if (!this.initialized) {
        console.log('🚀 OptimizedAuthService: Waiting for initialization before getting current user...')
        await this.initialize()
      }
      
      // On iOS, use Web SDK with longer wait time
      const platformInfo = detectPlatformFromUrl()
      if (platformInfo.platform === 'ios' && platformInfo.isNative) {
        // Wait longer for iOS auth state to be established
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Use Web SDK - wait for auth state to be established
      await new Promise(resolve => setTimeout(resolve, 300))
      
      this.currentUser = this.auth.currentUser
      console.log('🚀 OptimizedAuthService: Current user from Web SDK:', this.currentUser ? 'authenticated' : 'not authenticated')
      
      return this.currentUser
    } catch (error) {
      console.error('❌ Get current user error:', error)
      this.currentUser = null
      return null
    }
  }

  /**
   * Sign in with email and password
   * Uses Firebase Web SDK with timeout protection
   */
  async signInWithEmailAndPassword(email, password) {
    try {
      console.log('🔐 OptimizedAuthService: Starting sign in...')
      
      // Ensure service is initialized
      if (!this.initialized) {
        console.log('🔐 OptimizedAuthService: Initializing before sign in...')
        await this.initialize()
      }
      
      console.log('🌐 Using Firebase Web SDK for sign in (all platforms)')
      
      // Add 10 second timeout to detect hanging requests
      const authPromise = signInWithEmailAndPassword(this.auth, email, password)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.error('⚠️ Firebase Web SDK is hanging - this is a WKWebView networking issue on iOS')
          reject(new Error('Authentication request timed out after 10 seconds. This indicates a networking issue in iOS WebView. Please check your internet connection or try again.'))
        }, 10000)
      )
      
      const result = await Promise.race([authPromise, timeoutPromise])
      this.currentUser = result.user
      console.log('✅ Sign in successful:', result.user.uid)
      return {
        user: result.user,
        credential: result.credential
      }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        name: error.name
      })
      
      // If it's a timeout error, provide helpful message
      if (error.message && error.message.includes('timed out')) {
        throw new Error('Unable to connect to authentication service. Please check your internet connection and try again.')
      }
      
      throw error
    }
  }

  /**
   * Create user with email and password
   */
  async createUserWithEmailAndPassword(email, password) {
    try {
      console.log('🔐 OptimizedAuthService: Creating user account...')
      
      // Use Web SDK for all platforms (most reliable)
      console.log('🌐 Using Web SDK for create user')
      const result = await createUserWithEmailAndPassword(this.auth, email, password)
      this.currentUser = result.user
      console.log('🌐 Web SDK create user successful:', result.user.uid)
      return {
        user: result.user,
        credential: result.credential
      }
    } catch (error) {
      console.error('❌ Create user error:', error)
      throw error
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      // FCM token cleanup is handled by the fcm boot file (onAuthStateChanged)
      // No need to manually clear here to avoid conflicts
      
      // Use Web SDK for all platforms
      await firebaseSignOut(this.auth)
      
      // Clear cached user (FCM cleanup handled by fcm boot file)
      this.currentUser = null
      cacheService.clear()
      
      console.log('🚀 OptimizedAuthService: User signed out, cache cleared')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Initialize notifications for the user
   * NOTE: This method is now deprecated - FCM is handled by fcmService via the fcm boot file
   * Keeping this for backward compatibility but it does nothing
   */
  async initializeNotifications() {
    // Notifications are now handled by fcmService in the fcm boot file
    // This prevents duplicate listener registration
    console.log('🔔 OptimizedAuthService: Notification initialization skipped (handled by fcmService)')
  }

  /**
   * Listen to auth state changes with caching
   */
  onAuthStateChanged(callback) {
    // Use Web SDK for all platforms
    return onAuthStateChanged(this.auth, async (user) => {
      console.log('🚀 OptimizedAuthService: Auth state changed, user:', user ? 'authenticated' : 'not authenticated')
      this.currentUser = user
      
      if (user) {
        // Notifications are initialized by fcmService via the fcm boot file
        // No need to initialize here to avoid duplicates
        console.log('🔔 User authenticated - FCM is handled by boot file')
      } else {
        // Clear cache on sign out (FCM cleanup handled by fcm boot file)
        cacheService.clear()
      }
      
      callback(user)
    })
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user) {
    try {
      // Use Web SDK for all platforms
      const { sendEmailVerification } = await import('firebase/auth')
      await sendEmailVerification(user)
    } catch (error) {
      console.error('Send email verification error:', error)
      throw error
    }
  }

  /**
   * Update profile
   */
  async updateProfile(user, profile) {
    try {
      // Use Web SDK for all platforms
      const { updateProfile } = await import('firebase/auth')
      await updateProfile(user, profile)
      
      // Invalidate user cache
      if (user && user.uid) {
        cacheService.invalidateUser(user.uid)
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  /**
   * Sign in with Google
   * Uses Web SDK for all platforms for reliability
   */
  async signInWithGoogle() {
    try {
      // Use Web SDK popup for all platforms (most reliable)
      console.log('[OptimizedAuth] Using Web SDK for Google Sign-In')
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(this.auth, provider)
      this.currentUser = result.user
      console.log('🌐 Google sign in successful:', result.user.uid)
      return {
        user: result.user,
        credential: result.credential
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  /**
   * Clear user cache
   */
  clearUserCache() {
    this.currentUser = null
    this.userCache.clear()
    console.log('🚀 OptimizedAuthService: User cache cleared')
  }

  /**
   * Get cached user data
   */
  getCachedUser() {
    return this.currentUser
  }

  /**
   * Set cached user data
   */
  setCachedUser(user) {
    this.currentUser = user
  }
}

// Create and export singleton instance
const optimizedAuthService = new OptimizedAuthService()
export default optimizedAuthService