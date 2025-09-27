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
    if (this.isNative && !this.initialized) {
      try {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
        this.capacitorAuth = FirebaseAuthentication
        this.initialized = true
        console.log('OptimizedAuthService: Capacitor Firebase Authentication initialized')
      } catch (error) {
        console.error('OptimizedAuthService: Failed to initialize Capacitor Firebase Authentication:', error)
      }
    }
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
      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorAuth.getCurrentUser()
        this.currentUser = result.user
      } else {
        this.currentUser = this.auth.currentUser
      }
      
      console.log('🚀 OptimizedAuthService: Fetched fresh current user')
      return this.currentUser
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmailAndPassword(email, password) {
    try {
      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorAuth.signInWithEmailAndPassword({
          email,
          password
        })
        this.currentUser = result.user
        return {
          user: result.user,
          credential: result.credential
        }
      } else {
        const result = await signInWithEmailAndPassword(this.auth, email, password)
        this.currentUser = result.user
        return {
          user: result.user,
          credential: result.credential
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  /**
   * Create user with email and password
   */
  async createUserWithEmailAndPassword(email, password) {
    try {
      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorAuth.createUserWithEmailAndPassword({
          email,
          password
        })
        this.currentUser = result.user
        return {
          user: result.user,
          credential: result.credential
        }
      } else {
        const result = await createUserWithEmailAndPassword(this.auth, email, password)
        this.currentUser = result.user
        return {
          user: result.user,
          credential: result.credential
        }
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
      if (this.isNative) {
        await this.initialize()
        await this.capacitorAuth.signOut()
      } else {
        await firebaseSignOut(this.auth)
      }
      
      // Clear cached user
      this.currentUser = null
      cacheService.clear()
      
      console.log('🚀 OptimizedAuthService: User signed out, cache cleared')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Listen to auth state changes with caching
   */
  onAuthStateChanged(callback) {
    if (this.isNative) {
      this.initialize().then(() => {
        return this.capacitorAuth.addListener('authStateChange', (result) => {
          console.log('🚀 OptimizedAuthService: Auth state changed, user:', result.user ? 'authenticated' : 'not authenticated')
          this.currentUser = result.user
          callback(result.user)
        })
      })
      // Return a dummy unsubscribe function for native
      return () => {}
    } else {
      return onAuthStateChanged(this.auth, (user) => {
        console.log('🚀 OptimizedAuthService: Auth state changed, user:', user ? 'authenticated' : 'not authenticated')
        this.currentUser = user
        
        // Clear cache on sign out
        if (!user) {
          cacheService.clear()
        }
        
        callback(user)
      })
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user) {
    try {
      if (this.isNative) {
        await this.initialize()
        await this.capacitorAuth.sendEmailVerification()
      } else {
        const { sendEmailVerification } = await import('firebase/auth')
        await sendEmailVerification(user)
      }
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
      if (this.isNative) {
        await this.initialize()
        await this.capacitorAuth.updateProfile(profile)
      } else {
        const { updateProfile } = await import('firebase/auth')
        await updateProfile(user, profile)
      }
      
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
   */
  async signInWithGoogle() {
    try {
      if (this.isNative) {
        await this.initialize()
        const result = await this.capacitorAuth.signInWithGoogle()
        this.currentUser = result.user
        return {
          user: result.user,
          credential: result.credential
        }
      } else {
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