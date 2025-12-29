/**
 * Token Registration Service
 *
 * Registers FCM tokens in DynamoDB userTokens table.
 * This replaces Firestore token storage for the Lambda notification system.
 *
 * Table: userTokens
 * - PK: userId (String)
 * - SK: id (String) - UUID format
 * - Fields: userId, id, token, platform, isActive, createdAt, updatedAt
 *
 * IMPORTANT: This service is idempotent - it checks for existing tokens
 * and reactivates inactive ones rather than creating duplicates.
 */

import { putItem, query, updateItem } from '../aws/dynamodbClient'

const TABLE_NAME = 'userTokens'

// In-memory cache to avoid repeated registrations of the same token
// Format: Map<userId, { token: { item: TokenItem, timestamp: number } }>
const tokenCache = new Map()

// Generate UUID v4 (simple implementation)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Simple logger wrapper with once functionality to prevent spam
const logOnceMap = new Map()
const logOnce = (key, level, ...args) => {
  if (!logOnceMap.has(key)) {
    logOnceMap.set(key, true)
    if (level === 'info' && import.meta.env?.MODE !== 'production') {
      console.log('[TokenRegistrationService]', ...args)
    } else if (level === 'warn') {
      console.warn('[TokenRegistrationService]', ...args)
    } else if (level === 'error') {
      console.error('[TokenRegistrationService]', ...args)
    }
  }
}

const log = {
  info: (...args) => {
    if (import.meta.env?.MODE !== 'production') {
      console.log('[TokenRegistrationService]', ...args)
    }
  },
  warn: (...args) => console.warn('[TokenRegistrationService]', ...args),
  error: (...args) => console.error('[TokenRegistrationService]', ...args),
  once: logOnce,
}

/**
 * Register user FCM token in DynamoDB userTokens table
 *
 * This is idempotent:
 * - If token already exists → updates updatedAt only (no duplicate)
 * - If token exists but is inactive → reactivates it
 * - If token doesn't exist → creates new record with isActive=true
 *
 * Uses DynamoDB Query (not Scan) for efficient lookup by partition key (userId).
 * FilterExpression is used to find exact token match within user's tokens.
 *
 * IMPORTANT: iOS devices using Firebase Cloud Messaging generate FCM tokens
 * (format: contains colons, starts with FCM patterns). These tokens should be
 * saved with platform='ios' (correct - it's from an iOS device), but the Lambda
 * will detect the FCM format and use GCM/FCM SNS platform for sending.
 *
 * @param {Object} params - Registration parameters
 * @param {string} params.userId - User ID (Cognito/Firebase Auth user ID)
 * @param {string} params.token - FCM token string
 * @param {string} [params.platform='web'] - Platform: 'web', 'ios', or 'android'
 *   Note: iOS devices can have FCM tokens (Firebase format) or native APNS tokens (hex format)
 * @returns {Promise<Object|null>} Registered token object or null if failed
 */
export async function registerUserToken({ userId, token, platform = 'web' }) {
  try {
    // Validation
    if (!userId || !token) {
      log.once('missing-params', 'warn', 'registerUserToken called without userId or token')
      return null
    }

    // Normalize platform
    const normalizedPlatform = platform.toLowerCase()
    if (!['web', 'ios', 'android'].includes(normalizedPlatform)) {
      log.warn('Unknown platform, defaulting to web:', platform)
      platform = 'web'
    } else {
      platform = normalizedPlatform
    }

    const now = Date.now()

    // Check cache to avoid repeated registrations (refresh every 5 minutes is fine)
    const userCache = tokenCache.get(userId) || {}
    const cachedEntry = userCache[token]
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    if (cachedEntry && now - cachedEntry.timestamp < CACHE_DURATION) {
      log.once(
        `cache-hit-${userId}`,
        'info',
        `Token recently registered (cached), skipping: ${userId}`,
      )
      // Return cached item
      return cachedEntry.item
    }

    // Check if token already exists for this user
    // Use DynamoDB Query (not Scan) for efficient lookup by partition key
    let existingToken = null
    try {
      // Query structure:
      // - KeyConditionExpression: Uses partition key (userId) - REQUIRED for Query
      // - FilterExpression: Filters on non-key attribute (token) - OPTIONAL optimization
      const existingTokens = await query(TABLE_NAME, {
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: '#token = :token',
        ExpressionAttributeNames: {
          '#token': 'token',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':token': token,
        },
      })

      // Find exact token match (FilterExpression already filters, but double-check for safety)
      existingToken = existingTokens.find((t) => t.token === token)
    } catch (queryError) {
      // If query fails, proceed with creating new token
      log.warn('Error querying existing tokens, creating new:', queryError.message)
    }

    let tokenItem

    if (existingToken) {
      // Token exists: use UpdateItem to update only updatedAt, isActive, and platform
      const tokenId = existingToken.id
      const wasInactive = !existingToken.isActive

      await updateItem(
        TABLE_NAME,
        { userId, id: tokenId },
        {
          UpdateExpression:
            'SET #updatedAt = :updatedAt, #isActive = :isActive, #platform = :platform',
          ExpressionAttributeNames: {
            '#updatedAt': 'updatedAt',
            '#isActive': 'isActive',
            '#platform': 'platform',
          },
          ExpressionAttributeValues: {
            ':updatedAt': now,
            ':isActive': true,
            ':platform': platform,
          },
        },
      )

      // Build return object with preserved fields
      tokenItem = {
        userId,
        id: tokenId,
        token,
        platform,
        isActive: true,
        createdAt: existingToken.createdAt || now,
        updatedAt: now,
      }

      if (wasInactive) {
        log.once(`reactivate-${userId}`, 'info', `Reactivated inactive token for user ${userId}`)
      } else {
        log.once(`update-${userId}`, 'info', `Updated existing token for user ${userId}`)
      }
    } else {
      // Token doesn't exist: create new record with PutItem
      const tokenId = generateUUID()

      tokenItem = {
        userId,
        id: tokenId,
        token,
        platform,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }

      await putItem(TABLE_NAME, tokenItem)
      log.once(`create-${userId}`, 'info', `Registered new token for user ${userId} on ${platform}`)
    }

    // Update cache
    if (!tokenCache.has(userId)) {
      tokenCache.set(userId, {})
    }
    tokenCache.get(userId)[token] = {
      item: tokenItem,
      timestamp: now,
    }

    return tokenItem
  } catch (error) {
    log.error('Error registering FCM token:', error)
    // Don't throw - token registration failure shouldn't break the app
    return null
  }
}

// Export alias for backward compatibility
export const registerFcmToken = registerUserToken

// Export default for convenience
export default {
  registerUserToken,
  registerFcmToken, // Alias for backward compatibility
}

// Debug helper (dev only)
if (import.meta.env?.MODE !== 'production' && typeof window !== 'undefined') {
  window.__debugRegisterToken = async ({ userId, token, platform = 'web' } = {}) => {
    if (!userId || !token) {
      console.error(
        'Usage: __debugRegisterToken({ userId: "user123", token: "fcm-token", platform: "web" })',
      )
      return null
    }
    console.log('[DEBUG] Manually registering token...', {
      userId,
      token: token.substring(0, 20) + '...',
      platform,
    })
    const result = await registerUserToken({ userId, token, platform })
    console.log('[DEBUG] Registration result:', result)
    return result
  }
  console.log(
    '[TokenRegistrationService] Debug helper available: window.__debugRegisterToken({ userId, token, platform })',
  )
}
