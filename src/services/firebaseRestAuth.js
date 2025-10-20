/**
 * Firebase REST Authentication
 * Uses Capacitor HTTP for iOS reliability (bypasses WebView Firebase SDK issues)
 */

import { CapacitorHttp } from '@capacitor/core'

// Firebase API key from the main config
const API_KEY = 'AIzaSyB9kD9dw5DzEAys-kss-aSBqRGEuaT9A-0'

class FirebaseRestAuth {
  /**
   * Create account via REST API
   */
  async createAccount(email, password) {
    console.log('[RestAuth] Creating account via REST...')
    console.log('[RestAuth] Using API key:', API_KEY ? 'KEY PRESENT' : 'KEY MISSING')
    
    try {
      const response = await CapacitorHttp.post({
        url: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        headers: { 'Content-Type': 'application/json' },
        data: { email, password, returnSecureToken: true }
      })

      console.log('[RestAuth] Create account response:', response.status)
      console.log('[RestAuth] Response data:', JSON.stringify(response.data))
      
      if (response.status === 200 && response.data.idToken) {
        console.log('[RestAuth] ✅ Account created')
        return {
          success: true,
          uid: response.data.localId,
          idToken: response.data.idToken,
          refreshToken: response.data.refreshToken
        }
      } else {
        const errorMsg = response.data?.error?.message || 'Unknown error'
        console.error('[RestAuth] ❌ Create account error:', errorMsg)
        console.error('[RestAuth] Full error details:', JSON.stringify(response.data))
        
        if (errorMsg === 'EMAIL_EXISTS') {
          return { success: false, alreadyExists: true }
        }
        return { success: false, error: errorMsg }
      }
    } catch (error) {
      console.error('[RestAuth] Create account exception:', error)
      console.error('[RestAuth] Error message:', error?.message)
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
        data: { email, password, returnSecureToken: true }
      })

      console.log('[RestAuth] Sign in response:', response.status)
      
      if (response.status === 200) {
        console.log('[RestAuth] ✅ Signed in')
        return {
          success: true,
          uid: response.data.localId,
          idToken: response.data.idToken,
          refreshToken: response.data.refreshToken,
          email: response.data.email
        }
      } else {
        const errorMsg = response.data?.error?.message || 'Sign in failed'
        throw new Error(errorMsg)
      }
    } catch (error) {
      console.error('[RestAuth] Sign in failed:', error)
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

