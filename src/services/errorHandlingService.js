class ErrorHandlingService {
  // Handle Firebase/Firestore errors
  handleFirestoreError(error, context = '') {
    console.error(`Firestore Error${context ? ` in ${context}` : ''}:`, error)
    
    // Extract error code and message
    const errorCode = error.code || 'unknown'
    const errorMessage = error.message || 'An unknown error occurred'
    
    // Log detailed error information
    console.error('Error details:', {
      code: errorCode,
      message: errorMessage,
      context: context,
      timestamp: new Date().toISOString()
    })
    
    // Show user-friendly message based on error code
    let userMessage = this.getUserFriendlyMessage(errorCode, errorMessage)
    
    // Log the error instead of showing notification (to avoid Notify dependency issues)
    console.error('User-friendly error message:', userMessage)
    
    return {
      code: errorCode,
      message: errorMessage,
      userMessage: userMessage,
      timestamp: new Date().toISOString()
    }
  }

  // Handle authentication errors
  handleAuthError(error, context = '') {
    console.error(`Auth Error${context ? ` in ${context}` : ''}:`, error)
    
    const errorCode = error.code || 'unknown'
    const errorMessage = error.message || 'Authentication failed'
    
    let userMessage = this.getAuthErrorMessage(errorCode, errorMessage)
    
    // Log the error instead of showing notification
    console.error('Auth error message:', userMessage)
    
    return {
      code: errorCode,
      message: errorMessage,
      userMessage: userMessage
    }
  }

  // Handle network errors
  handleNetworkError(error, context = '') {
    console.error(`Network Error${context ? ` in ${context}` : ''}:`, error)
    
    const userMessage = 'Network error. Please check your connection and try again.'
    console.error('Network error message:', userMessage)
    
    return {
      code: 'network-error',
      message: 'Network connection failed',
      userMessage: userMessage
    }
  }

  // Get user-friendly error messages for Firestore errors
  getUserFriendlyMessage(errorCode) {
    switch (errorCode) {
      case 'invalid-argument':
        return 'Invalid request. Please try again or contact support if the problem persists.'
      
      case 'not-found':
        return 'The requested data was not found.'
      
      case 'permission-denied':
        return 'You do not have permission to access this data.'
      
      case 'unauthenticated':
        return 'You need to sign in to access this data.'
      
      case 'unavailable':
        return 'Service temporarily unavailable. Please try again later.'
      
      case 'resource-exhausted':
        return 'Service is temporarily overloaded. Please try again in a moment.'
      
      case 'failed-precondition':
        return 'Request failed due to a precondition. Please try again.'
      
      case 'aborted':
        return 'Request was cancelled. Please try again.'
      
      case 'out-of-range':
        return 'Request is out of range. Please check your input.'
      
      case 'data-loss':
        return 'Data corruption detected. Please contact support.'
      
      case 'deadline-exceeded':
        return 'Request timed out. Please try again.'
      
      case 'already-exists':
        return 'This item already exists.'
      
      case 'cancelled':
        return 'Operation was cancelled.'
      
      case 'internal':
        return 'An internal error occurred. Please try again later.'
      
      case 'unimplemented':
        return 'This feature is not available on your device.'
      
      default:
        return 'An error occurred. Please try again or contact support if the problem persists.'
    }
  }

  // Get user-friendly error messages for Auth errors
  getAuthErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.'
      
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.'
      
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.'
      
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password.'
      
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.'
      
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.'
      
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.'
      
      case 'auth/requires-recent-login':
        return 'Please sign in again to continue.'
      
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please check your email and password.'
      
      default:
        return 'Authentication failed. Please try again.'
    }
  }

  // Handle generic errors
  handleGenericError(error, context = '') {
    console.error(`Generic Error${context ? ` in ${context}` : ''}:`, error)
    
    const errorMessage = error.message || 'An unexpected error occurred'
    const userMessage = 'Something went wrong. Please try again.'
    
    console.error('Generic error message:', userMessage)
    
    return {
      code: 'generic-error',
      message: errorMessage,
      userMessage: userMessage
    }
  }

  // Wrapper for async operations with error handling
  async withErrorHandling(operation, context = '', errorType = 'generic') {
    try {
      return await operation()
    } catch (error) {
      switch (errorType) {
        case 'firestore':
          return this.handleFirestoreError(error, context)
        case 'auth':
          return this.handleAuthError(error, context)
        case 'network':
          return this.handleNetworkError(error, context)
        default:
          return this.handleGenericError(error, context)
      }
    }
  }
}

// Create and export singleton instance
const errorHandlingService = new ErrorHandlingService()
export default errorHandlingService
