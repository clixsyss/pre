/**
 * DynamoDB Admins Service
 * 
 * Handles all operations for the "admins" DynamoDB table.
 * This service replaces Firebase/Firestore calls for admins data.
 * 
 * Table structure:
 * - Primary Key: id (String) - Admin ID
 * - Fields: accountType, approvedAt, approvedBy, assignedProjects (array),
 *           createdAt, email, firebaseUid, firstName, isActive (boolean),
 *           lastLogin, lastName, mobile, nationalId, permissions (object/array),
 *           updatedAt
 */

import { getItem, scan, putItem, updateItem, deleteItem } from '../aws/dynamodbClient'

const TABLE_NAME = 'admins'

/**
 * Convert DynamoDB admin item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertAdminFromDynamoDB(item) {
  if (!item) return null

  return {
    id: item.id,
    accountType: item.accountType || '',
    approvedAt: item.approvedAt || null,
    approvedBy: item.approvedBy || null,
    assignedProjects: Array.isArray(item.assignedProjects) ? item.assignedProjects : [],
    createdAt: item.createdAt || null,
    email: item.email || '',
    firebaseUid: item.firebaseUid || item.id || null,
    firstName: item.firstName || '',
    isActive: item.isActive !== undefined 
      ? (typeof item.isActive === 'boolean' ? item.isActive : item.isActive === true || item.isActive === 'true')
      : true,
    lastLogin: item.lastLogin || null,
    lastName: item.lastName || '',
    mobile: item.mobile || '',
    nationalId: item.nationalId || '',
    permissions: item.permissions || {},
    updatedAt: item.updatedAt || null
  }
}

/**
 * Get an admin by ID
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object|null>} Admin object or null if not found
 */
export async function getAdminById(adminId) {
  try {
    console.log(`[DynamoDBAdminsService] Fetching admin: ${adminId}`)
    
    if (!adminId) {
      console.warn('[DynamoDBAdminsService] No adminId provided')
      return null
    }
    
    const admin = await getItem(TABLE_NAME, { id: adminId })
    
    if (admin) {
      const convertedAdmin = convertAdminFromDynamoDB(admin)
      console.log(`[DynamoDBAdminsService] ✅ Found admin: ${convertedAdmin.email || adminId}`)
      return convertedAdmin
    }
    
    console.log(`[DynamoDBAdminsService] ⚠️ Admin not found: ${adminId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBAdminsService] ❌ Error fetching admin ${adminId}:`, error)
    throw error
  }
}

/**
 * Get an admin by Firebase UID
 * @param {string} firebaseUid - Firebase UID
 * @returns {Promise<Object|null>} Admin object or null if not found
 */
export async function getAdminByFirebaseUid(firebaseUid) {
  try {
    console.log(`[DynamoDBAdminsService] Fetching admin by Firebase UID: ${firebaseUid}`)
    
    if (!firebaseUid) {
      console.warn('[DynamoDBAdminsService] No firebaseUid provided')
      return null
    }
    
    // Scan the table to find admin by firebaseUid
    // Note: This is not efficient for large tables. Consider adding a GSI if needed.
    const items = await scan(TABLE_NAME, {
      FilterExpression: 'firebaseUid = :firebaseUid',
      ExpressionAttributeValues: {
        ':firebaseUid': firebaseUid
      }
    })
    
    if (items.length > 0) {
      const convertedAdmin = convertAdminFromDynamoDB(items[0])
      console.log(`[DynamoDBAdminsService] ✅ Found admin by Firebase UID: ${convertedAdmin.email || firebaseUid}`)
      return convertedAdmin
    }
    
    console.log(`[DynamoDBAdminsService] ⚠️ Admin not found with Firebase UID: ${firebaseUid}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBAdminsService] ❌ Error fetching admin by Firebase UID ${firebaseUid}:`, error)
    throw error
  }
}

/**
 * Get an admin by email
 * @param {string} email - Admin email
 * @returns {Promise<Object|null>} Admin object or null if not found
 */
export async function getAdminByEmail(email) {
  try {
    console.log(`[DynamoDBAdminsService] Fetching admin by email: ${email}`)
    
    if (!email) {
      console.warn('[DynamoDBAdminsService] No email provided')
      return null
    }
    
    // Scan the table to find admin by email
    // Note: This is not efficient for large tables. Consider adding a GSI if needed.
    const items = await scan(TABLE_NAME, {
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    })
    
    if (items.length > 0) {
      const convertedAdmin = convertAdminFromDynamoDB(items[0])
      console.log(`[DynamoDBAdminsService] ✅ Found admin by email: ${email}`)
      return convertedAdmin
    }
    
    console.log(`[DynamoDBAdminsService] ⚠️ Admin not found with email: ${email}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBAdminsService] ❌ Error fetching admin by email ${email}:`, error)
    throw error
  }
}

/**
 * Get all admins
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of admins to return
 * @param {boolean} options.activeOnly - Only return active admins
 * @returns {Promise<Array>} Array of admin objects
 */
export async function getAllAdmins(options = {}) {
  try {
    console.log('[DynamoDBAdminsService] Fetching all admins from DynamoDB...')
    
    const scanOptions = {}
    
    if (options.activeOnly) {
      scanOptions.FilterExpression = '#isActive = :isActive'
      scanOptions.ExpressionAttributeNames = {
        '#isActive': 'isActive'
      }
      scanOptions.ExpressionAttributeValues = {
        ':isActive': true
      }
    }
    
    if (options.limit) {
      scanOptions.Limit = options.limit
    }
    
    const items = await scan(TABLE_NAME, scanOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const admins = items.map(convertAdminFromDynamoDB)
    
    // Sort by createdAt (newest first) if available
    admins.sort((a, b) => {
      const timeA = a.createdAt
      const timeB = b.createdAt
      
      let timeAValue = 0
      let timeBValue = 0
      
      if (timeA) {
        if (typeof timeA === 'number') {
          timeAValue = timeA
        } else if (typeof timeA === 'string') {
          timeAValue = new Date(timeA).getTime() || 0
        } else if (timeA instanceof Date) {
          timeAValue = timeA.getTime()
        }
      }
      
      if (timeB) {
        if (typeof timeB === 'number') {
          timeBValue = timeB
        } else if (typeof timeB === 'string') {
          timeBValue = new Date(timeB).getTime() || 0
        } else if (timeB instanceof Date) {
          timeBValue = timeB.getTime()
        }
      }
      
      return timeBValue - timeAValue
    })
    
    console.log(`[DynamoDBAdminsService] ✅ Fetched ${admins.length} admins from DynamoDB`)
    
    return admins
  } catch (error) {
    console.error('[DynamoDBAdminsService] ❌ Error fetching all admins:', error)
    throw error
  }
}

/**
 * Create or update an admin
 * @param {string} adminId - Admin ID
 * @param {Object} adminData - Admin data
 * @returns {Promise<void>}
 */
export async function createOrUpdateAdmin(adminId, adminData) {
  try {
    console.log(`[DynamoDBAdminsService] Creating/updating admin: ${adminId}`)
    
    if (!adminId) {
      throw new Error('Admin ID is required')
    }
    
    // Prepare data for DynamoDB
    const item = {
      id: adminId,
      ...adminData,
      updatedAt: adminData.updatedAt || new Date().toISOString()
    }
    
    // If creating new admin, set createdAt
    if (!adminData.createdAt) {
      item.createdAt = new Date().toISOString()
    }
    
    // Remove undefined values
    Object.keys(item).forEach(key => {
      if (item[key] === undefined) {
        delete item[key]
      }
    })
    
    await putItem(TABLE_NAME, item)
    
    console.log(`[DynamoDBAdminsService] ✅ Admin created/updated successfully: ${adminId}`)
  } catch (error) {
    console.error(`[DynamoDBAdminsService] ❌ Error creating/updating admin ${adminId}:`, error)
    throw error
  }
}

/**
 * Update an admin
 * @param {string} adminId - Admin ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<void>}
 */
export async function updateAdmin(adminId, updateData) {
  try {
    console.log(`[DynamoDBAdminsService] Updating admin: ${adminId}`)
    
    if (!adminId) {
      throw new Error('Admin ID is required')
    }
    
    // Add updatedAt timestamp
    const updateFields = {
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    // Remove undefined values
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key]
      }
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
    
    await updateItem(TABLE_NAME, { id: adminId }, {
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues
    })
    
    console.log(`[DynamoDBAdminsService] ✅ Admin updated successfully: ${adminId}`)
  } catch (error) {
    console.error(`[DynamoDBAdminsService] ❌ Error updating admin ${adminId}:`, error)
    throw error
  }
}

/**
 * Delete an admin
 * @param {string} adminId - Admin ID
 * @returns {Promise<void>}
 */
export async function deleteAdmin(adminId) {
  try {
    console.log(`[DynamoDBAdminsService] Deleting admin: ${adminId}`)
    
    if (!adminId) {
      throw new Error('Admin ID is required')
    }
    
    await deleteItem(TABLE_NAME, { id: adminId })
    
    console.log(`[DynamoDBAdminsService] ✅ Admin deleted successfully: ${adminId}`)
  } catch (error) {
    console.error(`[DynamoDBAdminsService] ❌ Error deleting admin ${adminId}:`, error)
    throw error
  }
}

/**
 * Check if a user is an admin
 * @param {string} userId - User ID (Firebase UID)
 * @returns {Promise<boolean>} True if user is an admin
 */
export async function isAdmin(userId) {
  try {
    if (!userId) {
      return false
    }
    
    const admin = await getAdminByFirebaseUid(userId)
    return admin !== null && admin.isActive === true
  } catch (error) {
    console.error(`[DynamoDBAdminsService] ❌ Error checking if user is admin ${userId}:`, error)
    return false
  }
}

// Export default for convenience
export default {
  getAdminById,
  getAdminByFirebaseUid,
  getAdminByEmail,
  getAllAdmins,
  createOrUpdateAdmin,
  updateAdmin,
  deleteAdmin,
  isAdmin
}

