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
    // Request deduplication: share the same promise for concurrent requests
    this._fetchPromise = null
    this._fetchPromiseTimestamp = null
    // Cache auth state in localStorage for faster startup
    this.AUTH_CACHE_KEY = 'pre_auth_state_cache'
    this.AUTH_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Get cache duration (iOS-optimized: longer for iOS)
   */
  _getCacheDuration() {
    if (this.AUTH_CACHE_DURATION) {
      return this.AUTH_CACHE_DURATION
    }
    
    // Detect iOS platform
    const isIOS = typeof window !== 'undefined' && (
      window.location.protocol === 'capacitor:' ||
      window.webkit?.messageHandlers !== undefined ||
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (window.Capacitor && window.Capacitor.getPlatform() === 'ios')
    )
    
    // iOS-optimized: Longer cache duration for iOS (10 minutes) since sessions are more stable
    this.AUTH_CACHE_DURATION = isIOS ? 10 * 60 * 1000 : 5 * 60 * 1000
    return this.AUTH_CACHE_DURATION
  }

  /**
   * Load cached auth state from localStorage
   */
  _loadCachedAuthState() {
    try {
      const cached = localStorage.getItem(this.AUTH_CACHE_KEY)
      if (!cached) return null
      
      const { user, timestamp } = JSON.parse(cached)
      const age = Date.now() - timestamp
      
      // Only use cache if it's fresh (iOS-optimized duration)
      const cacheDuration = this._getCacheDuration()
      if (age < cacheDuration && user) {
        return user
      }
    } catch {
      // Ignore cache errors
    }
    return null
  }

  /**
   * Save auth state to localStorage
   */
  _saveCachedAuthState(user) {
    try {
      if (user) {
        localStorage.setItem(this.AUTH_CACHE_KEY, JSON.stringify({
          user,
          timestamp: Date.now()
        }))
      } else {
        localStorage.removeItem(this.AUTH_CACHE_KEY)
      }
    } catch {
      // Ignore cache errors (localStorage might be full)
    }
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
        // Don't fetch user immediately on signIn - causes 400 errors and user isn't ready yet
        // The sign-in flow already has the user object from the sign-in result
        if (event === 'signIn') {
          // Skip fetching for signIn event - the sign-in result already has the user cached
          // Don't call fetchCurrentUser here to avoid 400 errors
          console.log('⚠️ OptimizedAuthService: Skipping fetchCurrentUser for signIn event (user already cached from sign-in result)')
          // Use cached user if available, otherwise notify with null
          const cachedUser = this.currentUser
          this.authListeners.forEach((callback) => callback(cachedUser))
        } else {
          // For other events, try to fetch but handle errors gracefully
          try {
            this.currentUser = await this.fetchCurrentUser()
            this.authListeners.forEach((callback) => callback(this.currentUser))
          } catch (error) {
            console.warn('⚠️ OptimizedAuthService: Could not fetch user in Hub listener:', error)
            // If fetch fails, use cached user if available
            if (this.currentUser) {
              this.authListeners.forEach((callback) => callback(this.currentUser))
            }
          }
        }
      }
    })
  }

  async fetchCurrentUser() {
    try {
      // Use cached user first - don't call Cognito if we have cached user
      // This prevents 400 errors right after sign-in
      if (this.currentUser) {
        return this.currentUser
      }
      
      // Check localStorage cache for faster startup
      const cachedUser = this._loadCachedAuthState()
      if (cachedUser) {
        this.currentUser = cachedUser
        return cachedUser
      }
      
      // Request deduplication: if a fetch is already in progress, return the same promise
      const now = Date.now()
      if (this._fetchPromise && this._fetchPromiseTimestamp && (now - this._fetchPromiseTimestamp) < 2000) {
        return this._fetchPromise
      }
      
      // Create new fetch promise
      this._fetchPromiseTimestamp = now
      this._fetchPromise = (async () => {
        try {
          // Only call Cognito if we don't have a cached user
          // Use cache first (faster and avoids 400 errors)
          let user
          try {
            user = await Auth.currentAuthenticatedUser({ bypassCache: false })
          } catch (cacheError) {
            // If cache fails and error indicates user is not authenticated, don't try bypassCache
            // This prevents hundreds of failed attempts
            if (cacheError?.code === 'NotAuthorizedException' || 
                cacheError?.message?.includes('not authenticated') ||
                cacheError?.message?.includes('No current user')) {
              // User is clearly not authenticated, don't retry
              this._saveCachedAuthState(null)
              throw cacheError
            }
            
            // Only try bypassCache for other errors (network issues, etc.)
            try {
              user = await Auth.currentAuthenticatedUser({ bypassCache: true })
            } catch (bypassError) {
              // If both fail, cache the failure to prevent repeated attempts
              this._saveCachedAuthState(null)
              throw bypassError
            }
          }
          
          // Add uid property for Firebase compatibility (use username or sub)
          if (user && !user.uid) {
            user.uid = user.username || user.attributes?.sub || user.attributes?.email
          }
          
          // Enhance user object with all Cognito attributes
          if (user && user.attributes) {
        // Parse birthdate if it exists (format: DD/MM/YYYY or YYYY-MM-DD)
        let birthdate = null
        if (user.attributes.birthdate) {
          try {
            // Try to parse different date formats
            const dateStr = user.attributes.birthdate
            if (typeof dateStr === 'string') {
              if (dateStr.includes('/')) {
                // DD/MM/YYYY format
                const [day, month, year] = dateStr.split('/')
                birthdate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              } else {
                // Try ISO format or other string formats
                birthdate = new Date(dateStr)
              }
            } else if (dateStr instanceof Date) {
              birthdate = dateStr
            } else {
              birthdate = new Date(dateStr)
            }
            if (birthdate && isNaN(birthdate.getTime())) birthdate = null
          } catch (err) {
            console.warn('Error parsing birthdate from Cognito:', err, user.attributes.birthdate)
            birthdate = null
          }
        }
        
        // Map Cognito attributes to a more accessible format
        user.cognitoAttributes = {
          username: user.username,
          sub: user.attributes.sub,
          email: user.attributes.email,
          emailVerified: user.attributes.email_verified === 'true' || user.attributes.email_verified === true,
          phoneNumber: user.attributes.phone_number,
          phoneNumberVerified: user.attributes.phone_number_verified === 'true' || user.attributes.phone_number_verified === true,
          name: user.attributes.name,
          gender: user.attributes.gender,
          birthdate: birthdate,
          // Include all other attributes
          ...user.attributes
        }
        
          }
          
          // Cache the user in memory and localStorage
          this.currentUser = user
          this._saveCachedAuthState(user)
          
          // Clear fetch promise
          this._fetchPromise = null
          this._fetchPromiseTimestamp = null
          
          return user
        } catch (error) {
          // Clear fetch promise on error
          this._fetchPromise = null
          this._fetchPromiseTimestamp = null
          throw error
        }
      })()
      
      return this._fetchPromise
    } catch (error) {
      // Fallback error handling
      this._fetchPromise = null
      this._fetchPromiseTimestamp = null
      throw error
    }
  }

  /**
   * Clear cached user (useful for logout or when auth state changes)
   */
  clearCachedUser() {
    this.currentUser = null
    this._saveCachedAuthState(null) // Clear localStorage cache too
    this._fetchPromise = null // Clear any pending fetch
    this._fetchPromiseTimestamp = null
    console.log('🚀 OptimizedAuthService: Cleared cached user')
  }

  /**
   * Wait for authentication state to be restored (especially important on iOS)
   * Optimized with exponential backoff and early exit
   * iOS-optimized: Uses localStorage cache first, then minimal polling
   * @param {number} maxWaitTime - Maximum time to wait in ms (default: 1500ms for iOS, 1000ms for others)
   * @returns {Promise<Object|null>} - User object or null
   */
  async waitForAuthState(maxWaitTime = null) {
    // Detect iOS platform (more reliable detection)
    const protocol = window.location.protocol
    const hasIOSBridge = window.webkit?.messageHandlers !== undefined
    const isIOS = protocol === 'capacitor:' || hasIOSBridge || 
                  /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (window.Capacitor && window.Capacitor.getPlatform() === 'ios')
    
    // iOS-optimized: Much shorter wait time since we have localStorage cache
    // 1500ms for iOS (was 3000ms), 1000ms for others (was 2000ms)
    const waitTime = maxWaitTime || (isIOS ? 1500 : 1000)
    
    // First check if we already have a cached user (memory or localStorage)
    if (this.currentUser) {
      return this.currentUser
    }
    
    // Check localStorage cache first (fastest)
    const cachedUser = this._loadCachedAuthState()
    if (cachedUser) {
      this.currentUser = cachedUser
      return cachedUser
    }
    
    // Try immediate fetch (might work if auth is already ready)
    try {
      const user = await this.fetchCurrentUser()
      if (user) {
        return user
      }
    } catch (error) {
      // If error clearly indicates user is not authenticated, exit early
      if (error?.code === 'NotAuthorizedException' || 
          error?.message?.includes('not authenticated') ||
          error?.message?.includes('No current user')) {
        return null
      }
    }
    
    // iOS-optimized: Use longer intervals to reduce API calls
    // iOS needs fewer checks since localStorage cache is fast
    let checkInterval = isIOS ? 300 : 200 // Start with 300ms for iOS, 200ms for others
    let elapsed = 0
    const maxInterval = isIOS ? 800 : 1000 // Max 800ms for iOS, 1000ms for others
    
    while (elapsed < waitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval))
      elapsed += checkInterval
      
      try {
        const user = await this.fetchCurrentUser()
        if (user) {
          return user
        }
      } catch (error) {
        // If error clearly indicates user is not authenticated, exit early
        if (error?.code === 'NotAuthorizedException' || 
            error?.message?.includes('not authenticated') ||
            error?.message?.includes('No current user')) {
          return null
        }
        // For other errors, continue polling but increase interval
        checkInterval = Math.min(checkInterval * 1.5, maxInterval)
      }
    }
    
    // Final attempt
    try {
      const user = await this.fetchCurrentUser()
      return user || null
    } catch {
      return null
    }
  }

  /**
   * Get current user with caching
   * Returns cached user immediately if available to avoid Cognito API calls
   */
  async getCurrentUser() {
    // Always return cached user if available - don't fetch from Cognito
    // This prevents 400 errors when called right after sign-in
    if (this.currentUser) {
      // Reduced logging - cached user access is frequent and not critical
      return this.currentUser
    }

    // Only fetch if we don't have a cached user
    try {
      this.currentUser = await this.fetchCurrentUser()
      return this.currentUser
    } catch (error) {
      // Silently fail - user might not be authenticated yet or Cognito session not ready
      console.warn('⚠️ OptimizedAuthService: Could not get current user (non-critical):', error?.message || error)
      this.currentUser = null
      return null
    }
  }

  /**
   * Convert Cognito errors to Firebase-like error format for compatibility
   */
  _normalizeError(error) {
    const errorCode = error.code || error.name
    const errorMessage = error.message || 'An error occurred'

    // Special handling for NotAuthorizedException - check message to distinguish cases
    if (errorCode === 'NotAuthorizedException') {
      // Check if it's a signup not permitted error
      if (errorMessage && errorMessage.toLowerCase().includes('signup is not permitted')) {
        const normalizedError = new Error(errorMessage)
        normalizedError.code = 'auth/signup-disabled'
        normalizedError.name = 'NotAuthorizedException'
        return normalizedError
      }
      // Otherwise, treat as wrong password
      const normalizedError = new Error(errorMessage)
      normalizedError.code = 'auth/wrong-password'
      normalizedError.name = 'NotAuthorizedException'
      return normalizedError
    }

    // Map Cognito error codes to Firebase-like codes
    const errorCodeMap = {
      'UserNotFoundException': 'auth/user-not-found',
      'InvalidParameterException': 'auth/invalid-email',
      'UserNotConfirmedException': 'auth/email-not-verified',
      'UsernameExistsException': 'auth/email-already-in-use',
      'InvalidPasswordException': 'auth/weak-password',
      'LimitExceededException': 'auth/too-many-requests',
      'NetworkError': 'auth/network-request-failed',
      'UserDisabledException': 'auth/user-disabled',
    }

    const normalizedCode = errorCodeMap[errorCode] || errorCode

    // Create error object with Firebase-like structure
    const normalizedError = new Error(errorMessage)
    normalizedError.code = normalizedCode
    normalizedError.name = errorCode || 'AuthError'
    
    return normalizedError
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmailAndPassword(email, password) {
    try {
      console.log('🔐 OptimizedAuthService: Starting sign in...')

      const cognitoUser = await Auth.signIn({ username: email.trim().toLowerCase(), password })

      if (cognitoUser.challengeName === 'NEW_PASSWORD_REQUIRED') {
        console.log('⚠️ OptimizedAuthService: NEW_PASSWORD_REQUIRED challenge encountered')
        return { challenge: cognitoUser.challengeName, user: cognitoUser }
      }

      // Use sign-in result directly (don't call fetchCurrentUser immediately as it causes 400 errors)
      // The sign-in result already contains all necessary attributes
      const enhancedUser = cognitoUser
      
      // Enhance user object with compatibility properties
      if (enhancedUser && !enhancedUser.uid) {
        enhancedUser.uid = enhancedUser.username || enhancedUser.attributes?.sub || enhancedUser.attributes?.email
      }
      
      // Parse birthdate if it exists
      let birthdate = null
      if (enhancedUser?.attributes?.birthdate) {
        try {
          const dateStr = enhancedUser.attributes.birthdate
          if (typeof dateStr === 'string') {
            if (dateStr.includes('/')) {
              const [day, month, year] = dateStr.split('/')
              birthdate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
            } else {
              birthdate = new Date(dateStr)
            }
          } else if (dateStr instanceof Date) {
            birthdate = dateStr
          } else {
            birthdate = new Date(dateStr)
          }
          if (birthdate && isNaN(birthdate.getTime())) birthdate = null
        } catch (err) {
          console.warn('Error parsing birthdate from Cognito sign-in result:', err)
          birthdate = null
        }
      }
      
      // Create cognitoAttributes from sign-in result (most reliable source)
      if (enhancedUser?.attributes) {
        // Check email verification from ALL possible locations
        const emailVerifiedValue = enhancedUser.attributes.email_verified || 
                                   enhancedUser.attributes.emailVerified ||
                                   enhancedUser.attributes.EmailVerified ||
                                   enhancedUser.attributes['email_verified']
        
        const isEmailVerified = emailVerifiedValue === 'true' || 
                               emailVerifiedValue === true || 
                               emailVerifiedValue === 'True' ||
                               emailVerifiedValue === 'TRUE'
        
        enhancedUser.cognitoAttributes = {
          username: enhancedUser.username,
          sub: enhancedUser.attributes.sub,
          email: enhancedUser.attributes.email,
          emailVerified: isEmailVerified,
          phoneNumber: enhancedUser.attributes.phone_number,
          phoneNumberVerified: enhancedUser.attributes.phone_number_verified === 'true' || enhancedUser.attributes.phone_number_verified === true,
          name: enhancedUser.attributes.name,
          gender: enhancedUser.attributes.gender,
          birthdate: birthdate,
          // Include all other attributes
          ...enhancedUser.attributes
        }
      }
      
      console.log('✅ Sign in successful, using sign-in result directly:', enhancedUser?.username)
      console.log('✅ Email verified from sign-in result:', enhancedUser?.cognitoAttributes?.emailVerified)
      
      // Cache the user immediately after sign-in
      this.currentUser = enhancedUser
      this._saveCachedAuthState(enhancedUser)
      console.log('✅ Raw email_verified attribute:', enhancedUser?.attributes?.email_verified, 'type:', typeof enhancedUser?.attributes?.email_verified)
      console.log('✅ All user attributes keys:', enhancedUser?.attributes ? Object.keys(enhancedUser.attributes) : 'no attributes')
      
      // Cache the user immediately from sign-in result - this prevents need to call Cognito
      this.currentUser = enhancedUser
      console.log('✅ Cognito attributes available:', !!enhancedUser?.cognitoAttributes)
      console.log('✅ Email verified:', enhancedUser?.cognitoAttributes?.emailVerified || enhancedUser?.attributes?.email_verified)
      console.log('✅ User cached in optimizedAuthService for future getCurrentUser() calls')
      
      // Return user in Firebase-like format for compatibility
      return { 
        user: {
          ...enhancedUser,
          uid: enhancedUser?.username || enhancedUser?.attributes?.sub,
          email: enhancedUser?.attributes?.email || email,
          // Include Cognito attributes for profile page
          cognitoAttributes: enhancedUser?.cognitoAttributes,
          // Also preserve original attributes for direct access
          attributes: enhancedUser?.attributes
        }
      }
    } catch (error) {
      console.error('❌ Sign in error:', error)
      throw this._normalizeError(error)
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
        username: email.trim().toLowerCase(),
        password,
        attributes: {
          email: email.trim().toLowerCase(),
        },
        autoSignIn: { enabled: false }, // Don't auto sign in, let the app handle it
      })
      
      console.log('🌐 Cognito sign up successful:', result.userSub)
      
      // Return in Firebase-like format for compatibility
      return { 
        user: {
          uid: result.userSub,
          email: email.trim().toLowerCase(),
          username: email.trim().toLowerCase(),
        },
        userSub: result.userSub,
        userConfirmed: result.userConfirmed,
      }
    } catch (error) {
      console.error('❌ Create user error:', error)
      throw this._normalizeError(error)
    }
  }

  /**
   * Register or sign in (handles both cases - similar to firebaseRestAuth.registerOrSignIn)
   * Tries to create account first, if it exists, signs in instead
   */
  async registerOrSignIn(email, password) {
    try {
      console.log('🔐 OptimizedAuthService: Register or sign in...')
      
      // Try to create account first
      try {
        const createResult = await this.createUserWithEmailAndPassword(email, password)
        console.log('✅ Account created successfully')
        
        // Return in Firebase-like format for compatibility with Register.vue
        return {
          uid: createResult.userSub || createResult.user?.uid,
          idToken: null, // Cognito doesn't provide token until sign in
          refreshToken: null,
          email: email.trim().toLowerCase(),
        }
      } catch (createError) {
        // If account already exists, try to sign in
        if (createError.code === 'auth/email-already-in-use' || 
            createError.code === 'UsernameExistsException' ||
            createError.message?.includes('already exists')) {
          console.log('ℹ️ Account exists, signing in instead...')
          
          const signInResult = await this.signInWithEmailAndPassword(email, password)
          
          // Get tokens for compatibility
          try {
            const session = await Auth.currentSession()
            const idToken = session.getIdToken().getJwtToken()
            const refreshToken = session.getRefreshToken().getToken()
            
            return {
              uid: signInResult.user?.uid || signInResult.user?.username,
              idToken,
              refreshToken,
              email: email.trim().toLowerCase(),
            }
          } catch {
            // If we can't get tokens, still return user info
            return {
              uid: signInResult.user?.uid || signInResult.user?.username,
              idToken: null,
              refreshToken: null,
              email: email.trim().toLowerCase(),
            }
          }
        }
        
        // Re-throw other errors
        throw createError
      }
    } catch (error) {
      console.error('❌ Register or sign in error:', error)
      throw this._normalizeError(error)
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      await Auth.signOut()
      this.currentUser = null
      this._saveCachedAuthState(null) // Clear our cache
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
    
    // Only call callback with cached user if available - don't fetch immediately
    // This prevents 400 errors when called right after sign-in
    // The Hub listener will call the callback when auth state actually changes
    if (this.currentUser) {
      callback(this.currentUser)
    }
    // Don't call getCurrentUser() here - wait for Hub listener to fire

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
   * Resend sign up confirmation code
   * Used for sending verification email to newly created users
   */
  async resendSignUpConfirmationCode(email) {
    try {
      console.log('🔐 Resending signup confirmation code to:', email)
      await Auth.resendSignUp(email.trim().toLowerCase())
      console.log('✅ Confirmation code sent successfully')
    } catch (error) {
      console.error('❌ Error resending confirmation code:', error)
      throw this._normalizeError(error)
    }
  }

  /**
   * Send password reset email via AWS Cognito.
   * Cognito sends a verification code to the user's email (username is email in this app).
   * @param {string} username - User's email (used as username in Cognito)
   * @returns {Promise<void>}
   */
  async sendPasswordResetEmail(username) {
    try {
      const email = (username || '').trim().toLowerCase()
      if (!email) {
        const err = new Error('Email is required')
        err.code = 'auth/invalid-email'
        throw err
      }
      console.log('🔐 Sending password reset code to:', email)
      await Auth.forgotPassword(email)
      console.log('✅ Password reset code sent successfully')
    } catch (error) {
      console.error('❌ Error sending password reset:', error)
      throw this._normalizeError(error)
    }
  }

  /**
   * Confirm password reset with the code sent by Cognito and set new password.
   * @param {string} username - User's email (used as username in Cognito)
   * @param {string} code - Verification code from email
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async confirmPasswordReset(username, code, newPassword) {
    try {
      const email = (username || '').trim().toLowerCase()
      if (!email || !code || !newPassword) {
        const err = new Error('Email, code, and new password are required')
        err.code = 'auth/invalid-credential'
        throw err
      }
      console.log('🔐 Confirming password reset for:', email)
      await Auth.forgotPasswordSubmit(email, code.trim(), newPassword)
      console.log('✅ Password reset confirmed successfully')
    } catch (error) {
      console.error('❌ Error confirming password reset:', error)
      throw this._normalizeError(error)
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

