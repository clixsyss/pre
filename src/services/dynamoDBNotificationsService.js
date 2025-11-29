/**
 * DynamoDB Notifications Service
 * 
 * Handles all operations for the "projects__notifications" DynamoDB table.
 * This service replaces Firebase/Firestore calls for notifications data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Notification ID
 * - Fields: audience (Map), body_ar, body_en, category, createdAt, createdBy,
 *           failureCount, invalidTokensRemoved, message, meta (Map), projectId,
 *           projectName, read (boolean), scheduledAt, sendNow (boolean),
 *           sendResults (Map), sentAt, status, successCount, title, title_ar,
 *           title_en, tokensCount, type, updatedAt, userId
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__notifications'

/**
 * Unmarshall DynamoDB Map for audience object
 * @param {Object} dynamoAudience - DynamoDB Map format
 * @returns {Object} JavaScript object
 */
function unmarshallAudience(dynamoAudience) {
  if (!dynamoAudience || typeof dynamoAudience !== 'object') {
    return {
      all: false,
      topic: null,
      units: [],
      uids: [],
      buildings: []
    }
  }

  // If already in JavaScript format, return as is
  if (!dynamoAudience.M && !dynamoAudience.L) {
    return dynamoAudience
  }

  const audience = {
    all: dynamoAudience.all !== undefined 
      ? (typeof dynamoAudience.all === 'boolean' ? dynamoAudience.all : dynamoAudience.all === true || dynamoAudience.all === 'true')
      : (dynamoAudience.M?.all?.BOOL !== undefined ? dynamoAudience.M.all.BOOL : false),
    topic: dynamoAudience.topic || (dynamoAudience.M?.topic?.NULL ? null : dynamoAudience.M?.topic?.S || null),
    units: [],
    uids: [],
    buildings: []
  }

  // Handle units array
  if (dynamoAudience.M?.units?.L) {
    audience.units = dynamoAudience.M.units.L.map(item => item.S || item)
  } else if (Array.isArray(dynamoAudience.units)) {
    audience.units = dynamoAudience.units
  }

  // Handle uids array
  if (dynamoAudience.M?.uids?.L) {
    audience.uids = dynamoAudience.M.uids.L.map(item => item.S || item)
  } else if (Array.isArray(dynamoAudience.uids)) {
    audience.uids = dynamoAudience.uids
  }

  // Handle buildings array
  if (dynamoAudience.M?.buildings?.L) {
    audience.buildings = dynamoAudience.M.buildings.L.map(item => item.S || item)
  } else if (Array.isArray(dynamoAudience.buildings)) {
    audience.buildings = dynamoAudience.buildings
  }

  return audience
}

/**
 * Unmarshall DynamoDB Map for meta object
 * @param {Object} dynamoMeta - DynamoDB Map format
 * @returns {Object} JavaScript object
 */
function unmarshallMeta(dynamoMeta) {
  if (!dynamoMeta || typeof dynamoMeta !== 'object') {
    return {}
  }

  // If already in JavaScript format, return as is
  if (!dynamoMeta.M) {
    return dynamoMeta
  }

  const meta = {}
  for (const key in dynamoMeta.M) {
    const valueWrapper = dynamoMeta.M[key]
    if (valueWrapper.S) meta[key] = valueWrapper.S
    else if (valueWrapper.N) meta[key] = Number(valueWrapper.N)
    else if (valueWrapper.BOOL !== undefined) meta[key] = valueWrapper.BOOL
    else if (valueWrapper.NULL) meta[key] = null
    // Add other types as needed
  }

  return meta
}

/**
 * Unmarshall DynamoDB Map for sendResults object
 * @param {Object} dynamoSendResults - DynamoDB Map format
 * @returns {Object} JavaScript object
 */
function unmarshallSendResults(dynamoSendResults) {
  if (!dynamoSendResults || typeof dynamoSendResults !== 'object') {
    return {
      successCount: 0,
      failCount: 0,
      totalUsers: 0
    }
  }

  // If already in JavaScript format, return as is
  if (!dynamoSendResults.M) {
    return dynamoSendResults
  }

  const sendResults = {}
  for (const key in dynamoSendResults.M) {
    const valueWrapper = dynamoSendResults.M[key]
    if (valueWrapper.N) {
      sendResults[key] = Number(valueWrapper.N)
    } else if (valueWrapper.S) {
      sendResults[key] = valueWrapper.S
    }
  }

  return sendResults
}

/**
 * Convert DynamoDB notification item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertNotificationFromDynamoDB(item) {
  if (!item) return null

  return {
    id: item.id,
    parentId: item.parentId,
    projectId: item.projectId || item.parentId,
    projectName: item.projectName || '',
    userId: item.userId || null,
    type: item.type || 'announcement',
    category: item.category || '',
    status: item.status || 'pending',
    title: item.title || '',
    title_en: item.title_en || item.title || '',
    title_ar: item.title_ar || '',
    body_en: item.body_en || item.message || '',
    body_ar: item.body_ar || '',
    message: item.message || '',
    audience: unmarshallAudience(item.audience),
    meta: unmarshallMeta(item.meta),
    sendResults: unmarshallSendResults(item.sendResults),
    read: item.read !== undefined ? (typeof item.read === 'boolean' ? item.read : item.read === true || item.read === 'true') : false,
    sendNow: item.sendNow !== undefined ? (typeof item.sendNow === 'boolean' ? item.sendNow : item.sendNow === true || item.sendNow === 'true') : false,
    successCount: item.successCount ? Number(item.successCount) : 0,
    failureCount: item.failureCount ? Number(item.failureCount) : 0,
    tokensCount: item.tokensCount ? Number(item.tokensCount) : 0,
    invalidTokensRemoved: item.invalidTokensRemoved ? Number(item.invalidTokensRemoved) : 0,
    createdBy: item.createdBy || 'unknown',
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    scheduledAt: item.scheduledAt || null,
    sentAt: item.sentAt || null
  }
}

/**
 * Get all notifications for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of notifications to return
 * @param {string} options.status - Filter by status (e.g., 'sent', 'failed', 'pending')
 * @param {string} options.type - Filter by type (e.g., 'announcement')
 * @param {string} options.userId - Filter by userId
 * @param {boolean} options.unreadOnly - Filter by read = false
 * @returns {Promise<Array>} Array of notification objects
 */
export async function getNotificationsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBNotificationsService] Fetching notifications for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBNotificationsService] No projectId provided')
      return []
    }
    
    const queryOptions = {
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': projectId
      }
    }
    
    if (options.limit) {
      queryOptions.Limit = options.limit
    }
    
    // Build filter expression if needed
    const filterParts = []
    if (options.status) {
      filterParts.push('#status = :status')
      queryOptions.ExpressionAttributeNames = queryOptions.ExpressionAttributeNames || {}
      queryOptions.ExpressionAttributeNames['#status'] = 'status'
      queryOptions.ExpressionAttributeValues[':status'] = options.status
    }
    if (options.type) {
      filterParts.push('#type = :type')
      queryOptions.ExpressionAttributeNames = queryOptions.ExpressionAttributeNames || {}
      queryOptions.ExpressionAttributeNames['#type'] = 'type'
      queryOptions.ExpressionAttributeValues[':type'] = options.type
    }
    if (options.userId) {
      filterParts.push('userId = :userId')
      queryOptions.ExpressionAttributeValues[':userId'] = options.userId
    }
    if (options.unreadOnly) {
      filterParts.push('#read = :read')
      queryOptions.ExpressionAttributeNames = queryOptions.ExpressionAttributeNames || {}
      queryOptions.ExpressionAttributeNames['#read'] = 'read'
      queryOptions.ExpressionAttributeValues[':read'] = false
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const notifications = items.map(convertNotificationFromDynamoDB)
    
    // Sort by createdAt (descending - newest first)
    notifications.sort((a, b) => {
      const timeA = a.createdAt
      const timeB = b.createdAt
      
      // Handle different data types
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
      
      // Sort descending (newest first)
      return timeBValue - timeAValue
    })
    
    console.log(`[DynamoDBNotificationsService] ✅ Fetched ${notifications.length} notifications for project ${projectId}`)
    
    return notifications
  } catch (error) {
    console.error(`[DynamoDBNotificationsService] ❌ Error fetching notifications for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get notifications for a specific user within a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of notification objects
 */
export async function getUserNotifications(projectId, userId, options = {}) {
  try {
    return await getNotificationsByProject(projectId, {
      ...options,
      userId
    })
  } catch (error) {
    console.error(`[DynamoDBNotificationsService] ❌ Error fetching user notifications:`, error)
    throw error
  }
}

/**
 * Get unread notifications for a user
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of unread notification objects
 */
export async function getUnreadNotifications(projectId, userId, options = {}) {
  try {
    return await getNotificationsByProject(projectId, {
      ...options,
      userId,
      unreadOnly: true
    })
  } catch (error) {
    console.error(`[DynamoDBNotificationsService] ❌ Error fetching unread notifications:`, error)
    throw error
  }
}

/**
 * Get notifications by status
 * @param {string} projectId - Project ID
 * @param {string} status - Status (e.g., 'sent', 'failed', 'pending')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of notification objects
 */
export async function getNotificationsByStatus(projectId, status, options = {}) {
  try {
    return await getNotificationsByProject(projectId, {
      ...options,
      status
    })
  } catch (error) {
    console.error(`[DynamoDBNotificationsService] ❌ Error fetching notifications by status:`, error)
    throw error
  }
}

/**
 * Get a single notification by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object|null>} Notification object or null if not found
 */
export async function getNotificationById(projectId, notificationId) {
  try {
    console.log(`[DynamoDBNotificationsService] Fetching notification: ${notificationId} in project: ${projectId}`)
    
    if (!projectId || !notificationId) {
      console.warn('[DynamoDBNotificationsService] Missing projectId or notificationId')
      return null
    }
    
    const notification = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: notificationId
    })
    
    if (notification) {
      return convertNotificationFromDynamoDB(notification)
    }
    
    console.log(`[DynamoDBNotificationsService] ⚠️ Notification not found: ${notificationId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBNotificationsService] ❌ Error fetching notification ${notificationId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getNotificationsByProject,
  getUserNotifications,
  getUnreadNotifications,
  getNotificationsByStatus,
  getNotificationById
}

