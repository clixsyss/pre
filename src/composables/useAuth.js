import { Auth } from 'aws-amplify'
import { useNotificationStore } from '../stores/notification'

export const useAuth = () => {
  const notificationStore = useNotificationStore()

  const registerUser = async (email, password) => {
    try {
      const result = await Auth.signUp({
        username: email,
        password,
        autoSignIn: { enabled: true },
      })

      notificationStore.showSuccess(
        'Account created successfully! Please check your email to verify your account.',
      )

      return { success: true, user: result.user }

    } catch (error) {
      console.error('Registration error:', error)

      let errorMessage = 'Registration failed'
      const errorCode = error.code || error.name

      if (errorCode === 'UsernameExistsException') {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (errorCode === 'InvalidParameterException' || errorCode === 'InvalidEmailException') {
        errorMessage = 'Invalid email address. Please check your email format.'
      } else if (errorCode === 'InvalidPasswordException') {
        errorMessage =
          'Password does not meet complexity requirements. Please choose a stronger password.'
      } else if (errorCode === 'NetworkError') {
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
