/**
 * Service to confirm Cognito users via Lambda function
 * 
 * This service calls a Lambda function (via API Gateway) to confirm Cognito users,
 * allowing them to sign in immediately after account creation.
 */

import { CapacitorHttp } from '@capacitor/core'

// API Gateway endpoint for the confirm-user Lambda function
// This should be set as an environment variable
const CONFIRM_USER_API_URL = import.meta.env.VITE_CONFIRM_USER_API_URL || ''

/**
 * Confirm a Cognito user account and set password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Confirmation result
 */
export async function confirmUser(email, password) {
  if (!email) {
    throw new Error('Email is required to confirm user')
  }

  if (!password) {
    throw new Error('Password is required to confirm user')
  }

  if (!CONFIRM_USER_API_URL) {
    console.warn('[ConfirmUserService] ⚠️ CONFIRM_USER_API_URL not configured. User confirmation will be skipped.')
    return { success: false, skipped: true, message: 'API URL not configured' }
  }

  try {
    console.log('[ConfirmUserService] Setting password and confirming user:', email)
    console.log('[ConfirmUserService] Calling API:', CONFIRM_USER_API_URL)
    
    // ALWAYS use native fetch to avoid CapacitorHttp parsing issues
    // This ensures we can see the actual Lambda response
    console.log('[ConfirmUserService] Using native fetch to ensure proper response parsing...')
    let response
    let responseData
    
    try {
      const fetchResponse = await fetch(CONFIRM_USER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      })
      
      const responseText = await fetchResponse.text()
      console.log('[ConfirmUserService] ✅ Fetch response status:', fetchResponse.status)
      console.log('[ConfirmUserService] ✅ Fetch response text (raw):', responseText)
      
      try {
        responseData = JSON.parse(responseText)
        console.log('[ConfirmUserService] ✅ Parsed fetch response:', responseData)
      } catch (parseError) {
        console.error('[ConfirmUserService] ❌ Failed to parse fetch response as JSON:', parseError)
        console.error('[ConfirmUserService] Raw response text:', responseText)
        // Still try to return something useful
        responseData = { rawText: responseText }
      }
      
      response = {
        status: fetchResponse.status,
        data: responseData,
      }
    } catch (fetchError) {
      console.error('[ConfirmUserService] ❌ Fetch failed:', fetchError)
      // Fall back to CapacitorHttp if fetch fails
      console.log('[ConfirmUserService] Falling back to CapacitorHttp...')
      response = await CapacitorHttp.post({
        url: CONFIRM_USER_API_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email: email.trim().toLowerCase(),
          password: password,
        },
      })
      responseData = response.data
    }

    console.log('[ConfirmUserService] Response status:', response.status)
    console.log('[ConfirmUserService] Response data type:', typeof response.data)
    console.log('[ConfirmUserService] Response keys:', Object.keys(response))
    
    // Log ALL response properties in detail to debug parsing issue
    console.log('[ConfirmUserService] 🔍 DETAILED RESPONSE INSPECTION:')
    for (const key in response) {
      const value = response[key]
      const valueType = typeof value
      if (valueType === 'string') {
        console.log(`  ${key}: (string, length: ${value.length})`, value.length < 500 ? value : value.substring(0, 500) + '...')
      } else if (valueType === 'object' && value !== null) {
        console.log(`  ${key}: (object)`, Array.isArray(value) ? `array[${value.length}]` : `${Object.keys(value).length} keys`)
        if (Object.keys(value).length < 10) {
          console.log(`    Content:`, JSON.stringify(value))
        }
      } else {
        console.log(`  ${key}: (${valueType})`, value)
      }
    }
    
    // Log the entire response for debugging
    try {
      console.log('[ConfirmUserService] Full response object:', JSON.stringify(response, null, 2))
    } catch (e) {
      console.log('[ConfirmUserService] Could not stringify response:', e)
    }

    // Use the responseData we parsed from fetch (or CapacitorHttp fallback)
    if (!responseData) {
      responseData = response.data || response.body || response.response || {}
    }
    
    // If responseData is empty object, check ALL possible properties
    if (!responseData || (typeof responseData === 'object' && Object.keys(responseData).length === 0)) {
      console.warn('[ConfirmUserService] ⚠️ Response data is empty, checking all response properties...')
      console.log('[ConfirmUserService] response.body:', response.body)
      console.log('[ConfirmUserService] response.data:', response.data)
      console.log('[ConfirmUserService] response.headers:', response.headers)
      
      // Try response.body if it exists
      if (response.body) {
        if (typeof response.body === 'string') {
          try {
            responseData = JSON.parse(response.body)
            console.log('[ConfirmUserService] ✅ Parsed response.body:', responseData)
          } catch (e) {
            console.error('[ConfirmUserService] Failed to parse response.body:', e)
          }
        } else if (typeof response.body === 'object') {
          responseData = response.body
          console.log('[ConfirmUserService] ✅ Using response.body as object:', responseData)
        }
      }
    }
    
    // If still empty, try parsing response.data as string
    if ((!responseData || (typeof responseData === 'object' && Object.keys(responseData).length === 0)) && typeof response.data === 'string') {
      try {
        responseData = JSON.parse(response.data)
        console.log('[ConfirmUserService] ✅ Parsed response.data as string:', responseData)
      } catch (e) {
        console.error('[ConfirmUserService] Failed to parse response.data:', e)
      }
    }
    
    if (typeof responseData === 'string') {
      try {
        responseData = JSON.parse(responseData)
        console.log('[ConfirmUserService] Parsed response data:', responseData)
      } catch (e) {
        console.error('[ConfirmUserService] Failed to parse response:', e)
        console.error('[ConfirmUserService] Raw response data:', responseData)
        throw new Error('Failed to parse server response')
      }
    }

    console.log('[ConfirmUserService] Final response data:', responseData)

    // If we couldn't parse the response, that's a problem
    if (!responseData || (typeof responseData === 'object' && Object.keys(responseData).length === 0 && !responseData.rawText)) {
      console.error('[ConfirmUserService] ❌ No valid response data received from Lambda')
      console.error('[ConfirmUserService] Response status:', response.status)
      return {
        success: false,
        statusCode: response.status || 500,
        message: 'Lambda response could not be parsed',
        confirmed: false
      }
    }

    // Check the actual Lambda response
    if (response.status === 200) {
      // Lambda returned 200 - check if it actually confirmed the user
      if (responseData.success && responseData.confirmed) {
        console.log('[ConfirmUserService] ✅ User confirmed successfully:', email)
        console.log('[ConfirmUserService] User status:', responseData.userStatus)
        return {
          success: true,
          email: email,
          alreadyConfirmed: responseData.alreadyConfirmed || false,
          message: responseData.message || 'User confirmed successfully',
          confirmed: true,
          userStatus: responseData.userStatus
        }
      } else if (responseData.success === false || responseData.confirmed === false) {
        // Lambda returned success: false or confirmed: false
        console.error('[ConfirmUserService] ❌ Lambda reported confirmation failed:', responseData.message)
        console.error('[ConfirmUserService] User status:', responseData.userStatus)
        return {
          success: false,
          message: responseData.message || 'Confirmation failed in Lambda',
          confirmed: false,
          userStatus: responseData.userStatus,
          lambdaError: true
        }
      } else if (responseData.success) {
        // Lambda returned success: true but no confirmed field - assume it worked
        console.log('[ConfirmUserService] ✅ Lambda returned success (assuming confirmed):', email)
        return {
          success: true,
          email: email,
          message: responseData.message || 'User confirmed successfully',
          confirmed: true,
          userStatus: responseData.userStatus
        }
      } else {
        // Lambda returned success: false
        const errorMsg = responseData.message || responseData.error || 'Lambda reported failure'
        console.error('[ConfirmUserService] ❌ Lambda returned failure:', errorMsg)
        return {
          success: false,
          message: errorMsg,
          confirmed: false,
          userStatus: responseData.userStatus,
          lambdaError: true
        }
      }
    } else {
      // Non-200 status code
      const errorMsg = responseData.message || responseData.error || `Lambda returned status ${response.status}`
      console.error('[ConfirmUserService] ❌ Lambda returned non-200 status:', response.status)
      console.error('[ConfirmUserService] Error:', errorMsg)
      return {
        success: false,
        statusCode: response.status,
        message: errorMsg,
        confirmed: false,
        userStatus: responseData.userStatus
      }
    }
  } catch (error) {
    console.error('[ConfirmUserService] ❌ Error confirming user:', error)
    console.error('[ConfirmUserService] Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      data: error.data
    })
    
    // Return failure instead of throwing - migration can continue without confirmation
    console.warn('[ConfirmUserService] ⚠️ Confirmation failed, but migration will continue. User will need admin approval.')
    return { success: false, skipped: true, error: error.message || 'Confirmation failed' }
  }
}

export default {
  confirmUser
}

