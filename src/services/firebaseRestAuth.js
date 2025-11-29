/**
 * Firebase REST Authentication
 * Uses Capacitor HTTP for iOS reliability (bypasses WebView Firebase SDK issues)
 */

import { CapacitorHttp } from '@capacitor/core'

// Firebase API key - uses environment variable with fallback
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDpYVhP_uLDecqds0VD7g409N_AMj-OMF8'

class FirebaseRestAuth {
  /**
   * Create account via REST API
   */
  async createAccount(email, password) {
    console.log('[RestAuth] Creating account via REST...')
    console.log('[RestAuth] Email:', email)
    console.log('[RestAuth] Using API key:', API_KEY ? 'KEY PRESENT' : 'KEY MISSING')

    try {
      const requestUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`
      console.log('[RestAuth] Request URL:', requestUrl)

      const response = await CapacitorHttp.post({
        url: requestUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email,
          password,
          returnSecureToken: true,
        },
      })

      console.log('[RestAuth] Create account response status:', response.status)
      console.log('[RestAuth] Response data type:', typeof response.data)
      console.log('[RestAuth] Response data:', JSON.stringify(response.data))

      // Handle the response data - it might be a string on iOS/Android
      let responseData = response.data
      if (typeof responseData === 'string') {
        try {
          console.log('[RestAuth] Raw string response:', responseData.substring(0, 200))
          responseData = JSON.parse(responseData)
          console.log('[RestAuth] Parsed string response to object')
        } catch (e) {
          console.error('[RestAuth] Failed to parse response data:', e)
          throw new Error('Failed to parse server response')
        }
      }

      // Check if response data is empty object or null
      if (!responseData || Object.keys(responseData).length === 0) {
        console.error('[RestAuth] ⚠️ Response data is empty!')
        console.log('[RestAuth] Attempting to use Firebase Web SDK instead...')

        // Fallback to Firebase Web SDK
        try {
          const { auth } = await import('../boot/firebase')
          const { createUserWithEmailAndPassword } = await import('firebase/auth')

          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const idToken = await userCredential.user.getIdToken()

          console.log('[RestAuth] ✅ Account created via Web SDK fallback')
          return {
            success: true,
            uid: userCredential.user.uid,
            idToken: idToken,
            refreshToken: userCredential.user.refreshToken,
          }
        } catch (sdkError) {
          console.error('[RestAuth] Web SDK fallback also failed:', sdkError)
          if (sdkError.code === 'auth/email-already-in-use') {
            return { success: false, alreadyExists: true }
          }
          throw sdkError
        }
      }

      if (response.status === 200 && responseData?.idToken) {
        console.log('[RestAuth] ✅ Account created')
        return {
          success: true,
          uid: responseData.localId,
          idToken: responseData.idToken,
          refreshToken: responseData.refreshToken,
        }
      } else {
        // Check for EMAIL_EXISTS in error message
        const errorMsg = responseData?.error?.message || 'Unknown error'
        console.error('[RestAuth] ❌ Create account error:', errorMsg)
        console.error('[RestAuth] Full error details:', JSON.stringify(responseData))

        if (errorMsg.includes('EMAIL_EXISTS') || errorMsg === 'EMAIL_EXISTS') {
          return { success: false, alreadyExists: true }
        }
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('[RestAuth] Create account exception:', error)
      console.error('[RestAuth] Error message:', error?.message)
      console.error('[RestAuth] Error code:', error?.code)
      console.error(
        '[RestAuth] Error details:',
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      )

      // Check if it's a network error
      if (error?.message?.includes('network') || error?.message?.includes('connection')) {
        throw new Error('Network error. Please check your internet connection.')
      }

      // Check if it's EMAIL_EXISTS in the error message
      if (error?.message?.includes('EMAIL_EXISTS')) {
        return { success: false, alreadyExists: true }
      }

      throw error
    }
  }

  /**
   * Sign in via REST API
   */
  async signIn(email, password) {
    console.log('[RestAuth] Signing in via REST...')

    try {
      const response = await CapacitorHttp.post({
        url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        headers: { 'Content-Type': 'application/json' },
        data: { email, password, returnSecureToken: true },
      })

      console.log('[RestAuth] Sign in response:', response.status)
      console.log('[RestAuth] Response data type:', typeof response.data)

      // Handle the response data - it might be a string on iOS/Android
      let responseData = response.data
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData)
          console.log('[RestAuth] Parsed string response to object')
        } catch (e) {
          console.error('[RestAuth] Failed to parse response data:', e)
          throw new Error('Failed to parse server response')
        }
      }

      if (response.status === 200 && responseData?.idToken) {
        console.log('[RestAuth] ✅ Signed in')
        return {
          success: true,
          uid: responseData.localId,
          idToken: responseData.idToken,
          refreshToken: responseData.refreshToken,
          email: responseData.email,
        }
      } else {
        const errorMsg = responseData?.error?.message || 'Sign in failed'
        console.error('[RestAuth] Sign in error:', errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('[RestAuth] Sign in failed:', error)
      console.error('[RestAuth] Error message:', error?.message)
      console.error('[RestAuth] Error code:', error?.code)
      console.error(
        '[RestAuth] Error details:',
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      )

      // Check if it's a network error
      if (error?.message?.includes('network') || error?.message?.includes('connection')) {
        throw new Error('Network error. Please check your internet connection.')
      }

      throw error
    }
  }

  /**
   * Register or sign in (handles both cases)
   */
  async registerOrSignIn(email, password) {
    console.log('[RestAuth] Register or sign in...')

    // Try to create account
    const createResult = await this.createAccount(email, password)

    if (createResult.success) {
      return createResult
    }

    // If account exists, sign in
    if (createResult.alreadyExists) {
      console.log('[RestAuth] Account exists, signing in...')
      return await this.signIn(email, password)
    }

    throw new Error(createResult.error || 'Registration failed')
  }
}

export default new FirebaseRestAuth()
