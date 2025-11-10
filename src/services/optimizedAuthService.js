/**
 * Optimized Auth Service - Amplify powered auth with caching
 */

import { Auth, Hub } from 'aws-amplify'
import cacheService from './cacheService'

class OptimizedAuthService {
  constructor() {
    this.currentUser = null
    this.userCache = new Map()
    this.authListeners = new Set()
    this.hubListener = null
  }

  ensureHubListener() {
    if (this.hubListener) {
      return
    }

    this.hubListener = Hub.listen('auth', async ({ payload }) => {
      const { event } = payload

      if (event === 'signOut' || event === 'signIn_failure') {
        this.currentUser = null
        cacheService.clear()
        this.authListeners.forEach((callback) => callback(null))
        return
      }

      const requiresUser = new Set(['signIn', 'autoSignIn', 'cognitoHostedUI', 'tokenRefresh'])
      if (requiresUser.has(event)) {
        this.currentUser = await this.fetchCurrentUser()
        this.authListeners.forEach((callback) => callback(this.currentUser))
      }
    })
  }

  async fetchCurrentUser() {
    try {
      const user = await Auth.currentAuthenticatedUser({ bypassCache: true })
      this.currentUser = user
      return user
    } catch {
      this.currentUser = null
      return null
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
    if (this.currentUser) {
      console.log('🚀 OptimizedAuthService: Using cached current user')
      return this.currentUser
    }

    try {
      this.currentUser = await this.fetchCurrentUser()
      console.log(
        '🚀 OptimizedAuthService: Current user from Amplify:',
        this.currentUser ? 'authenticated' : 'not authenticated',
      )

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

      const user = await Auth.signIn({ username: email, password })

      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('⚠️ OptimizedAuthService: NEW_PASSWORD_REQUIRED challenge encountered')
        return { challenge: user.challengeName, user }
      }

      this.currentUser = await this.fetchCurrentUser()
      console.log('✅ Sign in successful:', this.currentUser?.username)
      return { user: this.currentUser }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      throw error
    }
  }

  async completeNewPassword(cognitoUser, newPassword) {
    try {
      const user = await Auth.completeNewPassword(cognitoUser, newPassword)
      this.currentUser = await this.fetchCurrentUser()
      return { user }
    } catch (error) {
      console.error('❌ completeNewPassword error:', error)
      throw error
    }
  }

  /**
   * Create user with email and password
   */
  async createUserWithEmailAndPassword(email, password) {
    try {
      console.log('🔐 OptimizedAuthService: Creating user account...')

      const result = await Auth.signUp({
        username: email,
        password,
        autoSignIn: { enabled: true },
      })
      console.log('🌐 Cognito sign up successful:', result.user?.username)
      return { user: result.user }
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
      await Auth.signOut()
      this.currentUser = null
      cacheService.clear()
      console.log('🚀 OptimizedAuthService: User signed out, cache cleared')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  /**
   * Initialize notifications for the user (no-op placeholder)
   */
  async initializeNotifications() {
    console.log('🔔 OptimizedAuthService: Notification initialization skipped (handled elsewhere)')
  }

  /**
   * Listen to auth state changes with caching
   */
  onAuthStateChanged(callback) {
    this.ensureHubListener()
    this.authListeners.add(callback)
    this.getCurrentUser().then((user) => callback(user))

    return () => {
      this.authListeners.delete(callback)
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user) {
    try {
      if (user?.attributes?.email) {
        await Auth.verifyCurrentUserAttribute('email')
      } else if (user?.username) {
        await Auth.resendSignUp(user.username)
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
      await Auth.updateUserAttributes(user, profile)
      if (user?.username) {
        cacheService.invalidateUser(user.username)
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
      console.log('[OptimizedAuth] Using Amplify for Google Sign-In')
      await Auth.federatedSignIn({ provider: 'Google' })
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

