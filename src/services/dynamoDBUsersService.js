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
 *           suspensionType, unit, unsuspendedAt, unsuspendedBy, updatedAt
 */

import { getItem, scan, putItem } from '../aws/dynamodbClient'

const TABLE_NAME = 'users'

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
    updatedAt: item.updatedAt || null
  }
}

/**
 * Get a user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserById(userId) {
  try {
    console.log(`[DynamoDBUsersService] Fetching user: ${userId}`)
    
    // Try different possible key structures
    let user = null
    
    // Try with 'id' as key
    try {
      user = await getItem(TABLE_NAME, { id: userId })
    } catch {
      // Try with 'userId' as key
      try {
        user = await getItem(TABLE_NAME, { userId: userId })
      } catch {
        console.warn(`[DynamoDBUsersService] User not found with id or userId: ${userId}`)
      }
    }
    
    if (user) {
      const convertedUser = convertUserFromDynamoDB(user)
      console.log(`[DynamoDBUsersService] ✅ Found user: ${convertedUser.email || userId}`)
      return convertedUser
    }
    
    console.log(`[DynamoDBUsersService] ⚠️ User not found: ${userId}`)
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
    
    // Use filtered scan to find user by email (more efficient than scanning all and filtering in memory)
    // Note: For even better performance, consider adding a GSI on email field
    const items = await scan(TABLE_NAME, {
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': normalizedEmail
      },
      Limit: 1 // Only need one result
    })
    
    if (items.length === 0) {
      return null
    }
    
    // If multiple users found (shouldn't happen), return the first one
    if (items.length > 1) {
      console.warn(`[DynamoDBUsersService] Multiple users found with email ${email}, returning first match`)
    }
    
    const convertedUser = convertUserFromDynamoDB(items[0])
    return convertedUser
  } catch (error) {
    console.error(`[DynamoDBUsersService] Error fetching user by email:`, error)
    throw error
  }
}

/**
 * Get all users (with optional limit)
 * @param {Object} options - Options
 * @param {number} options.limit - Maximum number of users to return
 * @returns {Promise<Array>} Array of user objects
 */
export async function getAllUsers(options = {}) {
  try {
    console.log('[DynamoDBUsersService] Fetching all users from DynamoDB...')
    
    const scanOptions = {}
    if (options.limit) {
      scanOptions.Limit = options.limit
    }
    
    const items = await scan(TABLE_NAME, scanOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const users = items.map(convertUserFromDynamoDB)
    
    console.log(`[DynamoDBUsersService] ✅ Fetched ${users.length} users from DynamoDB`)
    
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
    
    // Check if email already exists
    if (userData.email) {
      const existingUser = await getUserByEmail(userData.email)
      if (existingUser) {
        console.warn(`[DynamoDBUsersService] ⚠️ User with email ${userData.email} already exists: ${existingUser.id}`)
        throw new Error(`An account with this email already exists`)
      }
    }
    
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
    
    console.log(`[DynamoDBUsersService] ✅ Created new user: ${userId}`)
    
    return item
  } catch (error) {
    console.error(`[DynamoDBUsersService] ❌ Error creating user ${userId}:`, error)
    throw error
  }
}

/**
 * Update or create a user
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUser(userId, userData) {
  try {
    console.log(`[DynamoDBUsersService] Updating user: ${userId}`)
    
    // Normalize email if provided to ensure consistent storage
    const normalizedUserData = { ...userData }
    if (normalizedUserData.email) {
      normalizedUserData.email = normalizedUserData.email.trim().toLowerCase()
    }
    
    const item = {
      id: userId,
      userId: userId,
      ...normalizedUserData,
      updatedAt: new Date().toISOString()
    }
    
    await putItem(TABLE_NAME, item)
    
    console.log(`[DynamoDBUsersService] ✅ Updated user: ${userId}`)
    
    return item
  } catch (error) {
    console.error(`[DynamoDBUsersService] ❌ Error updating user ${userId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getUserById,
  getUserByEmail,
  getAllUsers,
  createUser,
  updateUser
}


