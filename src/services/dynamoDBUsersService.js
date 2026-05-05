/**
 * DynamoDB Users Service
 * 
 * Handles all operations for the "users" DynamoDB table.
 * This service replaces Firebase/Firestore calls for users data.
 * 
 * Table structure:
 * - Primary Key: id (String) - User ID
 * - Fields: accountType, approvalStatus, approvedAt, approvedBy, authUid,
 *           createdAt, createdByAdmin, dateOfBirth, documents (Map),
 *           email, emailVerified, firstName, fullName, gender,
 *           isProfileComplete, isSuspended, isTemporary, lastLoginAt,
 *           lastName, mobile, nationalId, oldId, passwordResetCount,
 *           passwordResetSent, passwordResetSentAt, projects (List of Maps),
 *           registrationStatus, registrationStep, role, suspendedAt,
 *           suspendedBy, suspensionEndDate, suspensionReason,
 *           suspensionType, unit, unsuspendedAt, unsuspendedBy, updatedAt,
 *           validityStartDate, validityEndDate (temporary accounts)
 */

import { getItem, scan, scanAll, putItem, updateItem } from '../aws/dynamodbClient'

const TABLE_NAME = 'users'
const JOIN_TABLE = 'usersByProject'

// Keep the usersByProject join table in sync so the dashboard's fast-path
// (Query join table → BatchGet users) can find this user for every project they belong to.
async function syncUsersByProject(userId, projects) {
  if (!userId || !projects) return
  const ids = []
  if (Array.isArray(projects)) {
    for (const p of projects) {
      const id = typeof p === 'object' && p !== null ? (p.projectId || p.id) : p
      if (id) ids.push(id)
    }
  } else if (typeof projects === 'object') {
    const id = projects.projectId || projects.id
    if (id) ids.push(id)
  }
  await Promise.all(
    ids.map(projectId =>
      putItem(JOIN_TABLE, { projectId, userId }).catch(err =>
        console.warn(`[DynamoDBUsersService] usersByProject sync failed for ${projectId}:`, err?.message)
      )
    )
  )
}

/** Partition / sort key attribute names — must never appear in UpdateItem SET (DynamoDB rejects). */
const TABLE_KEY_ATTRIBUTES = ['id']

// Short-lived in-memory cache for user lookups — avoids redundant full-table scans
// within a single session (auth guard fires on every navigation).
const USER_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const _userCache = new Map() // key → { user, expiresAt }

function _getCachedUser(key) {
  const entry = _userCache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    _userCache.delete(key)
    return undefined
  }
  return entry.user
}

function _setCachedUser(key, user) {
  _userCache.set(key, { user, expiresAt: Date.now() + USER_CACHE_TTL })
}

/** Call after any write that changes user state so the cache stays fresh. */
export function invalidateUserCache(userId) {
  for (const key of _userCache.keys()) {
    if (key.includes(userId)) _userCache.delete(key)
  }
}

/**
 * Unmarshall DynamoDB Map for documents object
 * @param {Object} dynamoDocuments - DynamoDB Map format
 * @returns {Object} JavaScript object
 */
function unmarshallDocuments(dynamoDocuments) {
  if (!dynamoDocuments || typeof dynamoDocuments !== 'object') {
    return {}
  }
  
  // If already in JavaScript format, return as is
  if (!dynamoDocuments.M) {
    return dynamoDocuments
  }
  
  const documents = {}
  for (const key in dynamoDocuments.M) {
    const valueWrapper = dynamoDocuments.M[key]
    if (valueWrapper.S) documents[key] = valueWrapper.S
    else if (valueWrapper.N) documents[key] = Number(valueWrapper.N)
    else if (valueWrapper.BOOL !== undefined) documents[key] = valueWrapper.BOOL
    else if (valueWrapper.M) documents[key] = unmarshallDocuments(valueWrapper.M)
  }
  
  return documents
}

/**
 * Unmarshall DynamoDB List for projects array
 * @param {Array} dynamoProjects - DynamoDB List format
 * @returns {Array} JavaScript array of project objects
 */
function unmarshallProjects(dynamoProjects) {
  if (!Array.isArray(dynamoProjects)) {
    return []
  }
  
  return dynamoProjects.map(project => {
    // If project is already in JavaScript format, return as is
    if (!project || typeof project !== 'object' || !project.M) {
      return project
    }
    
    // Convert DynamoDB Map to JavaScript object
    const convertedProject = {}
    for (const key in project.M) {
      const valueWrapper = project.M[key]
      if (valueWrapper.S) convertedProject[key] = valueWrapper.S
      else if (valueWrapper.N) convertedProject[key] = Number(valueWrapper.N)
      else if (valueWrapper.BOOL !== undefined) convertedProject[key] = valueWrapper.BOOL
    }
    
    return convertedProject
  })
}

/**
 * Convert DynamoDB user item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertUserFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id || '',
    accountType: item.accountType || '',
    approvalStatus: item.approvalStatus || '',
    approvedAt: item.approvedAt || null,
    approvedBy: item.approvedBy || '',
    authUid: item.authUid || '',
    createdAt: item.createdAt || null,
    createdByAdmin: item.createdByAdmin !== undefined 
      ? (typeof item.createdByAdmin === 'boolean' ? item.createdByAdmin : item.createdByAdmin === true || item.createdByAdmin === 'true')
      : false,
    dateOfBirth: item.dateOfBirth || null,
    deviceKey: item.deviceKey || null, // Device key for device-based authentication
    deviceKeyUpdatedAt: item.deviceKeyUpdatedAt || null, // Timestamp when device key was last updated
    documents: item.documents ? unmarshallDocuments(item.documents) : {},
    email: item.email || '',
    emailVerified: item.emailVerified !== undefined 
      ? (typeof item.emailVerified === 'boolean' ? item.emailVerified : item.emailVerified === true || item.emailVerified === 'true')
      : false,
    firstName: item.firstName || '',
    fullName: item.fullName || '',
    gender: item.gender || '',
    isProfileComplete: item.isProfileComplete !== undefined 
      ? (typeof item.isProfileComplete === 'boolean' ? item.isProfileComplete : item.isProfileComplete === true || item.isProfileComplete === 'true')
      : false,
    isSuspended: item.isSuspended !== undefined 
      ? (typeof item.isSuspended === 'boolean' ? item.isSuspended : item.isSuspended === true || item.isSuspended === 'true')
      : false,
    isTemporary: item.isTemporary !== undefined 
      ? (typeof item.isTemporary === 'boolean' ? item.isTemporary : item.isTemporary === true || item.isTemporary === 'true')
      : false,
    lastLoginAt: item.lastLoginAt || null,
    lastName: item.lastName || '',
    mobile: item.mobile || '',
    nationalId: item.nationalId || '',
    oldId: item.oldId || '',
    passwordResetCount: item.passwordResetCount ? Number(item.passwordResetCount) : 0,
    passwordResetSent: item.passwordResetSent !== undefined 
      ? (typeof item.passwordResetSent === 'boolean' ? item.passwordResetSent : item.passwordResetSent === true || item.passwordResetSent === 'true')
      : false,
    passwordResetSentAt: item.passwordResetSentAt || null,
    projects: item.projects ? unmarshallProjects(item.projects) : [],
    registrationStatus: item.registrationStatus || '',
    registrationStep: item.registrationStep || '',
    role: item.role || '',
    suspendedAt: item.suspendedAt || null,
    suspendedBy: item.suspendedBy || '',
    suspensionEndDate: item.suspensionEndDate || null,
    suspensionReason: item.suspensionReason || '',
    suspensionType: item.suspensionType || '',
    unit: item.unit || '',
    unsuspendedAt: item.unsuspendedAt || null,
    unsuspendedBy: item.unsuspendedBy || '',
    updatedAt: item.updatedAt || null,
    validityStartDate: item.validityStartDate ?? null,
    validityEndDate: item.validityEndDate ?? null
  }
}

/**
 * Get a user by Cognito authUid
 * @param {string} authUid - Cognito user ID (authUid)
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserByAuthUid(authUid) {
  try {
    if (!authUid) {
      return null
    }

    const cacheKey = `authUid:${authUid}`
    const cached = _getCachedUser(cacheKey)
    if (cached !== undefined) return cached

    let lastEvaluatedKey = null

    do {
      const scanOptions = {
        FilterExpression: 'authUid = :authUid',
        ExpressionAttributeValues: {
          ':authUid': authUid
        },
        Limit: 500
      }
      if (lastEvaluatedKey) {
        scanOptions.ExclusiveStartKey = lastEvaluatedKey
      }

      const scanResult = await scan(TABLE_NAME, scanOptions)
      const batchItems = Array.isArray(scanResult) ? scanResult : []

      if (batchItems.length > 0) {
        const convertedUser = convertUserFromDynamoDB(batchItems[0])
        _setCachedUser(cacheKey, convertedUser)
        _setCachedUser(`id:${convertedUser.id}`, convertedUser)
        if (convertedUser.email) _setCachedUser(`email:${convertedUser.email}`, convertedUser)
        return convertedUser
      }

      lastEvaluatedKey = scanResult.LastEvaluatedKey || null
    } while (lastEvaluatedKey)

    _setCachedUser(cacheKey, null)
    return null
  } catch (error) {
    console.error(`[DynamoDBUsersService] Error fetching user by authUid:`, error)
    throw error
  }
}

/**
 * Get a user by ID (supports both Cognito sub ID and email)
 * @param {string} userId - User ID (Cognito sub ID) or email
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserById(userId) {
  try {
    const cacheKey = `id:${userId}`
    const cached = _getCachedUser(cacheKey)
    if (cached !== undefined) return cached

    // Try direct primary-key lookup first (O(1), no scan)
    let user = null
    try {
      user = await getItem(TABLE_NAME, { id: userId })
      if (user) {
        const convertedUser = convertUserFromDynamoDB(user)
        _setCachedUser(cacheKey, convertedUser)
        if (convertedUser.email) _setCachedUser(`email:${convertedUser.email}`, convertedUser)
        if (convertedUser.authUid) _setCachedUser(`authUid:${convertedUser.authUid}`, convertedUser)
        return convertedUser
      }
    } catch { /* fallthrough */ }

    // If userId looks like an email (contains @), try email lookup as fallback
    if (userId && userId.includes('@')) {
      try {
        user = await getUserByEmail(userId)
        if (user) return user
      } catch (emailError) {
        console.warn(`[DynamoDBUsersService] Email lookup also failed:`, emailError)
      }
    }

    // Cognito sub is often stored in authUid while partition key is an internal id
    const looksLikeCognitoSub =
      userId &&
      !userId.includes('@') &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    if (looksLikeCognitoSub) {
      try {
        const byAuth = await getUserByAuthUid(userId)
        if (byAuth) return byAuth
      } catch (authErr) {
        console.warn(`[DynamoDBUsersService] authUid lookup failed:`, authErr?.message || authErr)
      }
    }
    
    _setCachedUser(cacheKey, null)
    return null
  } catch (error) {
    console.error(`[DynamoDBUsersService] ❌ Error fetching user ${userId}:`, error)
    throw error
  }
}

/**
 * Get a user by email address
 * @param {string} email - User's email address (case-insensitive)
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserByEmail(email) {
  try {
    if (!email) {
      return null
    }

    // Normalize email (lowercase, trim) - emails are stored normalized in DynamoDB
    const normalizedEmail = email.trim().toLowerCase()

    const cacheKey = `email:${normalizedEmail}`
    const cached = _getCachedUser(cacheKey)
    if (cached !== undefined) return cached
    
    // Use filtered scan to find user by email (more efficient than scanning all and filtering in memory)
    // Note: For even better performance, consider adding a GSI on email field
    // IMPORTANT: When using FilterExpression with Limit, Limit applies to items SCANNED, not items RETURNED
    // For migration checks, we need to scan more items to find users who might be further in the table
    let items = []
    let lastEvaluatedKey = null

    do {
      const scanOptions = {
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': normalizedEmail
        },
        Limit: 500
      }

      if (lastEvaluatedKey) {
        scanOptions.ExclusiveStartKey = lastEvaluatedKey
      }

      const scanResult = await scan(TABLE_NAME, scanOptions)
      const batchItems = Array.isArray(scanResult) ? scanResult : []
      items = items.concat(batchItems)
      lastEvaluatedKey = scanResult.LastEvaluatedKey || null

      if (items.length > 0) {
        break
      }
    } while (lastEvaluatedKey)
    
    if (items.length === 0) {
      _setCachedUser(cacheKey, null)
      return null
    }

    if (items.length > 1) {
      console.warn(`[DynamoDBUsersService] Multiple users found with email ${email}, returning first match`)
    }

    const convertedUser = convertUserFromDynamoDB(items[0])
    _setCachedUser(cacheKey, convertedUser)
    _setCachedUser(`id:${convertedUser.id}`, convertedUser)
    if (convertedUser.authUid) _setCachedUser(`authUid:${convertedUser.authUid}`, convertedUser)
    return convertedUser
  } catch (error) {
    console.error(`[DynamoDBUsersService] Error fetching user by email "${email}":`, error)
    throw error
  }
}

/**
 * Get all users. Single-page scan when `limit` is set; otherwise paginates until the table is exhausted
 * (required for same-unit family matching — a plain Limit only returns the first scan page).
 * @param {Object} options
 * @param {number} [options.limit] - If set, one scan page only (max items scanned per page, not total matches)
 * @param {number} [options.pageSize] - Page size when paginating (default 500)
 * @param {number} [options.maxPages] - Safety cap on pages when paginating (default 400 → up to 200k rows)
 * @returns {Promise<Array>} Array of user objects
 */
export async function getAllUsers(options = {}) {
  try {
    const hasSinglePageLimit = options.limit != null && options.limit !== ''

    if (hasSinglePageLimit) {
      console.log('[DynamoDBUsersService] Fetching users (single scan page, limit)...')
      const scanOptions = { Limit: options.limit }
      const items = await scan(TABLE_NAME, scanOptions)
      const batch = Array.isArray(items) ? items : []
      const users = batch.map(convertUserFromDynamoDB)
      console.log(`[DynamoDBUsersService] ✅ Fetched ${users.length} users (single page)`)
      return users
    }

    const pageSize = Math.min(Math.max(Number(options.pageSize) || 500, 1), 1000)
    const maxPages = Math.min(Math.max(Number(options.maxPages) || 400, 1), 500)

    console.log('[DynamoDBUsersService] Fetching all users (paginated scan)...', { pageSize, maxPages })
    const raw = await scanAll(TABLE_NAME, { pageSize, maxPages })
    const users = raw.map(convertUserFromDynamoDB)
    console.log(`[DynamoDBUsersService] ✅ Fetched ${users.length} users (full paginated scan)`)

    return users
  } catch (error) {
    console.error('[DynamoDBUsersService] ❌ Error fetching users:', error)
    throw error
  }
}

/**
 * Create a new user in the users table
 * @param {string} userId - User ID (Cognito UID)
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user object
 */
export async function createUser(userId, userData) {
  try {
    console.log(`[DynamoDBUsersService] Creating new user: ${userId}`)
    
    const nowISO = new Date().toISOString()
    
    // Skip email check here - it's already checked before Cognito user creation in the registration flow
    // This prevents duplicate expensive scans. If there's a race condition, DynamoDB will handle it via id uniqueness.
    
    // Create user object with all required fields
    // Normalize email to ensure consistent storage (lowercase, trimmed)
    const normalizedEmail = userData.email ? userData.email.trim().toLowerCase() : ''
    
    const item = {
      id: userId,
      // Core user information
      email: normalizedEmail,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      fullName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || '',
      mobile: userData.mobile || '',
      dateOfBirth: userData.dateOfBirth || null,
      gender: userData.gender || null,
      nationalId: userData.nationalId || '',
      
      // Account and status fields
      accountType: userData.accountType || '',
      approvalStatus: userData.approvalStatus || 'pending', // Default to pending for new registrations
      approvedAt: userData.approvedAt || null,
      approvedBy: userData.approvedBy || '',
      registrationStatus: userData.registrationStatus || 'pending', // Pending admin approval
      registrationStep: userData.registrationStep || 'completed',
      role: userData.role || '',
      
      // Profile completion and verification
      isProfileComplete: userData.isProfileComplete !== undefined ? userData.isProfileComplete : false,
      emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : false,
      
      // Suspension and account status
      isSuspended: false,
      isTemporary: false,
      suspendedAt: null,
      suspendedBy: '',
      suspensionEndDate: null,
      suspensionReason: '',
      suspensionType: '',
      unsuspendedAt: null,
      unsuspendedBy: '',
      
      // Project and unit information
      unit: userData.unit || '',
      projects: userData.projects || [],
      
      // Documents and additional data
      documents: userData.documents || {},
      
      // Password reset fields
      passwordResetCount: 0,
      passwordResetSent: false,
      passwordResetSentAt: null,
      
      // Timestamps
      createdAt: userData.createdAt || nowISO,
      updatedAt: userData.updatedAt || nowISO,
      lastLoginAt: null,
      
      // Admin and creation fields
      createdByAdmin: false,
      oldId: userData.oldId || '',
      
      // Auth UID (Cognito UID)
      authUid: userId
    }
    
    await putItem(TABLE_NAME, item)
    syncUsersByProject(userId, item.projects)

    console.log(`[DynamoDBUsersService] ✅ Created new user: ${userId}`)

    return item
  } catch (error) {
    console.error(`[DynamoDBUsersService] ❌ Error creating user ${userId}:`, error)
    throw error
  }
}

/**
 * Update a user (preserves existing fields, only updates provided fields)
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(userId, userData) {
  try {
    console.log(`[DynamoDBUsersService] Updating user: ${userId}`)
    
    if (!userId) {
      throw new Error('User ID is required')
    }
    
    // Normalize email if provided to ensure consistent storage
    const normalizedUserData = { ...userData }
    if (normalizedUserData.email) {
      normalizedUserData.email = normalizedUserData.email.trim().toLowerCase()
    }
    
    // Add updatedAt timestamp
    const updateFields = {
      ...normalizedUserData,
      updatedAt: new Date().toISOString()
    }
    
    // Remove undefined values
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key]
      }
    })

    // Callers often spread full user records (e.g. from Firestore) which include `id`; SET on key attrs fails.
    TABLE_KEY_ATTRIBUTES.forEach((k) => {
      delete updateFields[k]
    })
    
    // Build update expression
    const updateExpression = []
    const expressionAttributeNames = {}
    const expressionAttributeValues = {}
    
    Object.keys(updateFields).forEach((key, index) => {
      const nameKey = `#attr${index}`
      const valueKey = `:val${index}`
      
      updateExpression.push(`${nameKey} = ${valueKey}`)
      expressionAttributeNames[nameKey] = key
      expressionAttributeValues[valueKey] = updateFields[key]
    })
    
    if (updateExpression.length === 0) {
      console.warn(`[DynamoDBUsersService] No fields to update for user ${userId}`)
      return null
    }
    
    await updateItem(TABLE_NAME, { id: userId }, {
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    })

    // Sync join table so the dashboard can find this user under every project they belong to.
    // Fire-and-forget — must not block or fail the user-facing update.
    if (updateFields.projects) {
      syncUsersByProject(userId, updateFields.projects)
    }

    console.log(`[DynamoDBUsersService] ✅ Updated user: ${userId}`)

    // Fetch and return the updated user
    const updatedUser = await getUserById(userId)
    return updatedUser
  } catch (error) {
    console.error(`[DynamoDBUsersService] ❌ Error updating user ${userId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getUserById,
  getUserByEmail,
  getUserByAuthUid,
  getAllUsers,
  createUser,
  updateUser
}


