import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../boot/firebase'
import { useNotificationStore } from '../stores/notification'

export const useAuth = () => {
  const notificationStore = useNotificationStore()

  const registerUser = async (email, password) => {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      console.log('User created successfully:', user.uid)

      // Ensure user is properly authenticated before sending verification
      if (!auth.currentUser) {
        console.log('No current user found, re-authenticating...')
        await signInWithEmailAndPassword(auth, email, password)
        console.log('User re-authenticated successfully')
      }

      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500))

      // Send verification email
      await sendEmailVerification(auth.currentUser || user)
      console.log('Verification email sent successfully to:', email)

      // Show success notification
      notificationStore.showSuccess('Account created successfully! Verification email sent to your inbox.')

      return { success: true, user }

    } catch (error) {
      console.error('Registration error:', error)

      let errorMessage = 'Registration failed'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email format.'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.'
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else {
        errorMessage += ': ' + error.message
      }

      notificationStore.showError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  return {
    registerUser
  }
}
