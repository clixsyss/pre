/**
 * Optimized Auth Service - Cached authentication with reduced Firebase calls
 */

import { auth, isNative } from '../boot/firebase'
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
      
      // Wait a bit for Firebase to be fully ready on iOS
      const { Capacitor } = await import('@capacitor/core')
      if (Capacitor.getPlatform() === 'ios') {
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
      // Check Capacitor plugin for iOS first
      const { Capacitor } = await import('@capacitor/core')
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
      
      if (isIOS) {
        try {
          // Wait for Firebase to be ready on iOS
          if (!this.initialized) {
            console.log('🚀 OptimizedAuthService: Waiting for initialization before getting current user...')
            await this.initialize()
          }
          
          // Additional wait for iOS to ensure auth state is ready
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
          
          // Wrap in timeout to prevent hanging
          const getUserPromise = FirebaseAuthentication.getCurrentUser()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('getCurrentUser timeout')), 5000) // Increased timeout
          )
          
          const result = await Promise.race([getUserPromise, timeoutPromise])
          
          if (result && result.user) {
            console.log('🚀 OptimizedAuthService: Current user from Capacitor plugin:', result.user.uid)
            this.currentUser = result.user
            return this.currentUser
          }
        } catch (capError) {
          console.warn('Capacitor getCurrentUser failed, trying Web SDK:', capError?.message)
        }
      }
      
      // Use Web SDK for all platforms (simpler and more reliable)
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
   */
  async signInWithEmailAndPassword(email, password) {
    try {
      console.log('🔐 OptimizedAuthService: Starting sign in...')
      
      // Ensure service is initialized
      if (!this.initialized) {
        console.log('🔐 OptimizedAuthService: Initializing before sign in...')
        await this.initialize()
      }
      
      // Check if iOS native platform
      const { Capacitor } = await import('@capacitor/core')
      const platform = Capacitor.getPlatform()
      const isIOS = platform === 'ios' && Capacitor.isNativePlatform()
      
      if (isIOS) {
        // Use Capacitor Firebase Authentication plugin for iOS
        console.log('📱 iOS: Using Capacitor plugin for email/password sign in')
        
        try {
          const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
          
          // Add timeout protection
          const signInPromise = FirebaseAuthentication.signInWithEmailAndPassword({
            email,
            password
          })
          
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Sign in timeout after 15 seconds')), 15000)
          )
          
          const result = await Promise.race([signInPromise, timeoutPromise])
          
          console.log('📱 iOS: Capacitor sign in successful:', result.user?.uid)
          
          // Wait for auth state to sync
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Get user from Web SDK (for consistency)
          this.currentUser = this.auth.currentUser || result.user
          
          console.log('📱 iOS: Final user:', this.currentUser?.uid)
          
          return {
            user: this.currentUser,
            credential: result.credential
          }
        } catch (iosError) {
          console.warn('📱 iOS: Capacitor sign in failed, falling back to Web SDK:', iosError.message)
          // Fall through to Web SDK
        }
      }
      
      // Use Web SDK for Android, web, or iOS fallback
      console.log('🌐 Using Web SDK for sign in')
      const result = await signInWithEmailAndPassword(this.auth, email, password)
      this.currentUser = result.user
      console.log('🌐 Web SDK sign in successful:', result.user.uid)
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
      throw error
    }
  }

  /**
   * Create user with email and password
   */
  async createUserWithEmailAndPassword(email, password) {
    try {
      // Use Web SDK for all platforms
      const result = await createUserWithEmailAndPassword(this.auth, email, password)
      this.currentUser = result.user
      return {
        user: result.user,
        credential: result.credential
      }
    } catch (error) {
      console.error('Create user error:', error)
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
      
      // Use Capacitor plugin for iOS, Web SDK for others
      const { Capacitor } = await import('@capacitor/core')
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
      
      if (isIOS) {
        console.log('🚀 OptimizedAuthService: Signing out via Capacitor plugin...')
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
        await FirebaseAuthentication.signOut()
        console.log('🚀 OptimizedAuthService: Capacitor sign out complete')
      } else {
        await firebaseSignOut(this.auth)
      }
      
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
   * Supports both web (popup) and native (Capacitor) platforms
   * Note: Only iOS uses Capacitor plugin, Android uses Web SDK for reliability
   */
  async signInWithGoogle() {
    try {
      const { Capacitor } = await import('@capacitor/core')
      const platform = Capacitor.getPlatform()
      const isIOS = platform === 'ios' && Capacitor.isNativePlatform()
      
      if (isIOS) {
        // Use Capacitor Firebase Authentication plugin for iOS only
        console.log('[OptimizedAuth] Using Capacitor Google Sign-In for iOS')
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
        
        const result = await FirebaseAuthentication.signInWithGoogle()
        
        // Get the user from Firebase Auth
        const user = this.auth.currentUser
        
        if (!user) {
          // If for some reason currentUser is not set, wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        this.currentUser = this.auth.currentUser
        
        return {
          user: this.currentUser,
          credential: result.credential || null
        }
      } else {
        // Use Web SDK popup for Android and web (more reliable)
        console.log(`[OptimizedAuth] Using Web SDK for ${platform}`)
        const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(this.auth, provider)
        this.currentUser = result.user
        return {
          user: result.user,
          credential: result.credential
        }
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