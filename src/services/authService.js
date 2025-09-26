import { auth, isNative } from '../boot/firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth'

class AuthService {
  constructor() {
    this.isNative = isNative
    this.auth = auth
    this.capacitorAuth = null
    this.initialized = false
  }

  async initialize() {
    if (this.isNative && !this.initialized) {
      try {
        const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
        this.capacitorAuth = FirebaseAuthentication
        this.initialized = true
        console.log('AuthService: Capacitor Firebase Authentication initialized')
      } catch (error) {
        console.error('AuthService: Failed to initialize Capacitor Firebase Authentication:', error)
      }
    }
  }

  // Sign in with email and password
  async signInWithEmailAndPassword(email, password) {
    try {
      if (this.isNative) {
        // Use Capacitor Firebase Authentication
        await this.initialize()
        const result = await this.capacitorAuth.signInWithEmailAndPassword({
          email,
          password
        })
        return {
          user: result.user,
          credential: result.credential
        }
      } else {
        // Use Firebase Web SDK
        const result = await signInWithEmailAndPassword(this.auth, email, password)
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

  // Create user with email and password
  async createUserWithEmailAndPassword(email, password) {
    try {
      if (this.isNative) {
        // Use Capacitor Firebase Authentication
        await this.initialize()
        const result = await this.capacitorAuth.createUserWithEmailAndPassword({
          email,
          password
        })
        return {
          user: result.user,
          credential: result.credential
        }
      } else {
        // Use Firebase Web SDK
        const result = await createUserWithEmailAndPassword(this.auth, email, password)
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

  // Sign out
  async signOut() {
    try {
      if (this.isNative) {
        // Use Capacitor Firebase Authentication
        await this.initialize()
        await this.capacitorAuth.signOut()
      } else {
        // Use Firebase Web SDK
        await firebaseSignOut(this.auth)
      }
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      if (this.isNative) {
        // Use Capacitor Firebase Authentication
        await this.initialize()
        const result = await this.capacitorAuth.getCurrentUser()
        return result.user
      } else {
        // Use Firebase Web SDK
        return this.auth.currentUser
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    if (this.isNative) {
      // Use Capacitor Firebase Authentication
      this.initialize().then(() => {
        return this.capacitorAuth.addListener('authStateChange', (result) => {
          console.log('AuthService: Auth state changed, user:', result.user ? 'authenticated' : 'not authenticated')
          callback(result.user)
        })
      })
      // Return a dummy unsubscribe function for native
      return () => {}
    } else {
      // Use Firebase Web SDK
      return onAuthStateChanged(this.auth, callback)
    }
  }

  // Send email verification
  async sendEmailVerification(user) {
    try {
      if (this.isNative) {
        // Use Capacitor Firebase Authentication
        await this.initialize()
        await this.capacitorAuth.sendEmailVerification()
      } else {
        // Use Firebase Web SDK
        const { sendEmailVerification } = await import('firebase/auth')
        await sendEmailVerification(user)
      }
    } catch (error) {
      console.error('Send email verification error:', error)
      throw error
    }
  }

  // Update profile
  async updateProfile(user, profile) {
    try {
      if (this.isNative) {
        // Use Capacitor Firebase Authentication
        await this.initialize()
        await this.capacitorAuth.updateProfile(profile)
      } else {
        // Use Firebase Web SDK
        const { updateProfile } = await import('firebase/auth')
        await updateProfile(user, profile)
      }
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      if (this.isNative) {
        // Use Capacitor Firebase Authentication
        await this.initialize()
        const result = await this.capacitorAuth.signInWithGoogle()
        return {
          user: result.user,
          credential: result.credential
        }
      } else {
        // Use Firebase Web SDK
        const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(this.auth, provider)
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
}

// Create and export singleton instance
const authService = new AuthService()
export default authService
