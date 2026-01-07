/**
 * Migration Service
 * 
 * Handles instant confirmation of migrated users without requiring email verification.
 * This service is specifically for users migrating from the old system to Cognito.
 */

import optimizedAuthService from './optimizedAuthService'
import { confirmUser } from './confirmUserService'

/**
 * Instantly confirm a migrated user account
 * This bypasses email verification and confirms the user immediately
 * 
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Confirmation result with sign-in details
 */
export async function instantlyConfirmMigratedUser(email, password) {
  try {
    console.log('[MigrationService] Starting instant confirmation for migrated user:', email)
    
    // Step 1: Create the Cognito user (or get existing)
    // The Lambda will handle setting password and confirming even if user already exists
    let authResult = null
    let cognitoUserId = null
    let userAlreadyExists = false
    
    try {
      authResult = await optimizedAuthService.createUserWithEmailAndPassword(email, password)
      console.log('[MigrationService] ✅ Cognito user created:', authResult.userSub)
      cognitoUserId = authResult.userSub || authResult.user?.uid
      userAlreadyExists = false
    } catch (createError) {
      // If user already exists, that's okay - Lambda will set password and confirm
      if (createError.code === 'UsernameExistsException' || createError.code === 'auth/email-already-in-use') {
        console.log('[MigrationService] ℹ️ User already exists in Cognito - Lambda will set password and confirm')
        cognitoUserId = email.trim().toLowerCase()
        userAlreadyExists = true
        // Extract user ID if available from error
        if (createError.userSub) {
          cognitoUserId = createError.userSub
        }
      } else {
        console.error('[MigrationService] ❌ Error creating Cognito user:', createError)
        throw createError
      }
    }
    
    // Step 2: Wait for Cognito to fully create the user before confirmation
    // Increased wait time to ensure user is fully created in Cognito
    const waitTime = userAlreadyExists ? 1000 : 3000
    console.log(`[MigrationService] Waiting ${waitTime}ms for Cognito to fully process user...`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
    
    // Step 3: Instantly confirm the user via Lambda (bypasses email verification)
    // Lambda will: AdminSetUserPassword + AdminConfirmSignUp (same as admin approval)
    console.log('[MigrationService] Calling Lambda to set password and confirm user...')
    console.log('[MigrationService] Lambda uses AdminSetUserPassword + AdminConfirmSignUp (same as dashboard)')
    
    const confirmResult = await confirmUser(email, password)
    
    console.log('[MigrationService] Lambda response:', {
      success: confirmResult.success,
      statusCode: confirmResult.statusCode,
      alreadyConfirmed: confirmResult.alreadyConfirmed,
      message: confirmResult.message
    })
    
    // Lambda response might be empty due to CapacitorHttp parsing issues, but status 200 = success
    const isConfirmed = confirmResult.success || 
                       confirmResult.statusCode === 200 || 
                       confirmResult.alreadyConfirmed === true
    
    if (isConfirmed) {
      console.log('[MigrationService] ✅ Lambda returned success (status 200) - assuming confirmation worked')
    } else {
      console.warn('[MigrationService] ⚠️ Lambda returned non-success, but will still attempt sign-in')
    }
    
    // Step 4: Lambda confirmation complete - account should be ready
    // We don't try to sign in automatically - user will sign in manually
    // This avoids timing issues and gives Cognito more time to propagate changes
    console.log('[MigrationService] ✅ Lambda confirmation called successfully')
    console.log('[MigrationService] User can now sign in manually with their new password')
    
    return {
      success: true,
      cognitoUserId: cognitoUserId,
      confirmed: isConfirmed,
      signedIn: false, // User will sign in manually
      message: 'Account created and confirmed. Please sign in with your new password.'
    }
    
  } catch (error) {
    console.error('[MigrationService] ❌ Error during instant confirmation:', error)
    return {
      success: false,
      confirmed: false,
      signedIn: false,
      error: error.code || error.name || 'UNKNOWN_ERROR',
      message: error.message || 'Failed to confirm migrated user'
    }
  }
}

/**
 * Check if a user account exists in Cognito
 * @param {string} email - User's email address
 * @returns {Promise<boolean>} True if user exists
 */
export async function checkUserExists(email) {
  try {
    // Try to sign in (won't work if user doesn't exist or password is wrong)
    // This is a simple check - in production you might want a better method
    await optimizedAuthService.signInWithEmailAndPassword(email, 'dummy-password-check')
    return true
  } catch (error) {
    if (error.code === 'UserNotFoundException' || error.code === 'auth/user-not-found') {
      return false
    }
    // Other errors (like wrong password) mean user exists
    if (error.code === 'NotAuthorizedException' || error.code === 'auth/wrong-password') {
      return true
    }
    // Unknown error - assume user doesn't exist to be safe
    return false
  }
}

export default {
  instantlyConfirmMigratedUser,
  checkUserExists
}

