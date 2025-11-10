import { Auth, Hub } from 'aws-amplify'

class AuthService {
  constructor() {
    this.listeners = new Set()
    this.hubListener = null
  }

  ensureHubListener() {
    if (this.hubListener) {
      return
    }

    this.hubListener = Hub.listen('auth', async ({ payload }) => {
      const eventsRequiringUser = new Set([
        'signIn',
        'cognitoHostedUI',
        'tokenRefresh',
        'autoSignIn',
      ])

      if (eventsRequiringUser.has(payload.event)) {
        const user = await this.getCurrentUser()
        this.listeners.forEach((callback) => callback(user))
      }

      if (payload.event === 'signOut' || payload.event === 'signIn_failure') {
        this.listeners.forEach((callback) => callback(null))
      }
    })
  }

  // Sign in with email and password
  async signInWithEmailAndPassword(email, password) {
    try {
      const user = await Auth.signIn({ username: email, password })
      return { user }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  // Create user with email and password
  async createUserWithEmailAndPassword(email, password) {
    try {
      const result = await Auth.signUp({
        username: email,
        password,
        autoSignIn: { enabled: true },
      })
      return { user: result.user }
    } catch (error) {
      console.error('Create user error:', error)
      throw error
    }
  }

  // Sign out
  async signOut() {
    try {
      await Auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      return await Auth.currentAuthenticatedUser()
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    this.ensureHubListener()
    this.listeners.add(callback)
    this.getCurrentUser().then((user) => callback(user))

    return () => {
      this.listeners.delete(callback)
    }
  }

  // Send email verification
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

  // Update profile
  async updateProfile(user, profile) {
    try {
      if (!user) {
        throw new Error('No authenticated user')
      }

      await Auth.updateUserAttributes(user, profile)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      await Auth.federatedSignIn({ provider: 'Google' })
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }
}

// Create and export singleton instance
const authService = new AuthService()
export default authService
