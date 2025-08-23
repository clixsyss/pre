/**
 * Profile validation utilities for PRE Group app
 * Handles checking if user profiles are complete and valid
 */

/**
 * Check if a user's profile is complete
 * @param {Object} userData - User data from Firestore
 * @returns {Object} - Validation result with status and missing fields
 */
export const validateProfileCompletion = (userData) => {
  if (!userData) {
    return {
      isComplete: false,
      missingFields: ['all'],
      message: 'No user data found'
    }
  }

  const requiredFields = {
    personal: ['firstName', 'lastName', 'mobile', 'dateOfBirth', 'nationalId'],
    property: ['compound', 'unit', 'role'],
    system: ['email', 'emailVerified']
  }

  const missingFields = []
  let hasPersonalDetails = true
  let hasPropertyDetails = true
  let hasSystemDetails = true

  // Check personal details
  requiredFields.personal.forEach(field => {
    if (!userData[field] || userData[field].toString().trim() === '') {
      missingFields.push(field)
      hasPersonalDetails = false
    }
  })

  // Check property details
  requiredFields.property.forEach(field => {
    if (!userData[field] || userData[field].toString().trim() === '') {
      missingFields.push(field)
      hasPropertyDetails = false
    }
  })

  // Check system details
  requiredFields.system.forEach(field => {
    if (!userData[field] || userData[field].toString().trim() === '') {
      missingFields.push(field)
      hasSystemDetails = false
    }
  })

  // Special check for email verification
  if (!userData.emailVerified) {
    missingFields.push('emailVerification')
    hasSystemDetails = false
  }

  const isComplete = hasPersonalDetails && hasPropertyDetails && hasSystemDetails

  let message = ''
  if (isComplete) {
    message = 'Profile is complete'
  } else {
    const missingCategories = []
    if (!hasPersonalDetails) missingCategories.push('personal details')
    if (!hasPropertyDetails) missingCategories.push('property details')
    if (!hasSystemDetails) missingCategories.push('system details')
    
    message = `Profile incomplete. Missing: ${missingCategories.join(', ')}`
  }

  return {
    isComplete,
    missingFields,
    hasPersonalDetails,
    hasPropertyDetails,
    hasSystemDetails,
    message
  }
}

/**
 * Get the next step for profile completion
 * @param {Object} userData - User data from Firestore
 * @returns {string} - Next step to complete
 */
export const getNextProfileStep = (userData) => {
  const validation = validateProfileCompletion(userData)
  
  if (validation.isComplete) {
    return 'complete'
  }

  if (!validation.hasSystemDetails || !userData.emailVerified) {
    return 'email_verification'
  }

  if (!validation.hasPropertyDetails) {
    return 'property_details'
  }

  if (!validation.hasPersonalDetails) {
    return 'personal_details'
  }

  return 'unknown'
}

/**
 * Check if user can proceed to a specific step
 * @param {Object} userData - User data from Firestore
 * @param {string} targetStep - Step to check access for
 * @returns {boolean} - Whether user can access the step
 */
export const canAccessStep = (userData, targetStep) => {
  const validation = validateProfileCompletion(userData)
  
  switch (targetStep) {
    case 'email_verification':
      return true // Always accessible
    
    case 'property_details':
      return validation.hasSystemDetails && userData.emailVerified
    
    case 'personal_details':
      return validation.hasSystemDetails && validation.hasPropertyDetails && userData.emailVerified
    
    case 'complete':
      return validation.isComplete
    
    default:
      return false
  }
}

/**
 * Get user-friendly messages for missing fields
 * @param {Array} missingFields - Array of missing field names
 * @returns {Array} - Array of user-friendly messages
 */
export const getMissingFieldMessages = (missingFields) => {
  const fieldMessages = {
    firstName: 'First Name',
    lastName: 'Last Name',
    mobile: 'Mobile Number',
    dateOfBirth: 'Date of Birth',
    nationalId: 'National ID',
    compound: 'Compound Selection',
    unit: 'Unit Selection',
    role: 'Role Selection',
    email: 'Email Address',
    emailVerification: 'Email Verification'
  }

  return missingFields.map(field => fieldMessages[field] || field)
}

/**
 * Check if user is eligible for Google sign-in
 * @param {Object} userData - User data from Firestore
 * @returns {boolean} - Whether user can use Google sign-in
 */
export const canUseGoogleSignIn = (userData) => {
  if (!userData) return false
  
  // User must exist and have some basic data
  return userData.email && userData.createdAt
}
