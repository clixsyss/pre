/**
 * DynamoDB Support Chats Service
 * 
 * Handles all operations for the "projects__supportChats" DynamoDB table.
 * This service replaces Firebase/Firestore calls for support chats data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Chat ID
 * - Fields: category, createdAt, lastMessageAt, messages (List of Maps),
 *           status, title, updatedAt, userEmail, userId, userName
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__supportChats'

/**
 * Unmarshall DynamoDB List for messages array
 * @param {Array} dynamoMessages - DynamoDB List format
 * @returns {Array} JavaScript array of message objects
 */
function unmarshallMessages(dynamoMessages) {
  if (!Array.isArray(dynamoMessages)) {
    return []
  }
  
  return dynamoMessages.map(message => {
    // If message is already in JavaScript format, return as is
    if (!message || typeof message !== 'object' || !message.M) {
      return message
    }
    
    // Convert DynamoDB Map to JavaScript object
    const convertedMessage = {}
    for (const key in message.M) {
      const valueWrapper = message.M[key]
      if (valueWrapper.S) convertedMessage[key] = valueWrapper.S
      else if (valueWrapper.N) convertedMessage[key] = Number(valueWrapper.N)
      else if (valueWrapper.BOOL !== undefined) convertedMessage[key] = valueWrapper.BOOL
      else if (valueWrapper.L) {
        convertedMessage[key] = valueWrapper.L.map(subItem => {
          if (subItem.S) return subItem.S
          if (subItem.N) return Number(subItem.N)
          if (subItem.BOOL !== undefined) return subItem.BOOL
          return subItem
        })
      }
      else if (valueWrapper.M) {
        // Handle nested Maps
        convertedMessage[key] = {}
        for (const nestedKey in valueWrapper.M) {
          const nestedValueWrapper = valueWrapper.M[nestedKey]
          if (nestedValueWrapper.S) convertedMessage[key][nestedKey] = nestedValueWrapper.S
          else if (nestedValueWrapper.N) convertedMessage[key][nestedKey] = Number(nestedValueWrapper.N)
          else if (nestedValueWrapper.BOOL !== undefined) convertedMessage[key][nestedKey] = nestedValueWrapper.BOOL
        }
      }
    }
    
    return convertedMessage
  })
}

/**
 * Convert DynamoDB support chat item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertSupportChatFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id,
    parentId: item.parentId,
    projectId: item.projectId || item.parentId,
    title: item.title || '',
    category: item.category || '',
    status: item.status || 'open',
    userId: item.userId || '',
    userName: item.userName || '',
    userEmail: item.userEmail || '',
    messages: item.messages ? unmarshallMessages(item.messages) : [],
    createdAt: item.createdAt || null,
    lastMessageAt: item.lastMessageAt || null,
    updatedAt: item.updatedAt || null
  }
}

/**
 * Get all support chats for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of chats to return
 * @param {string} options.status - Filter by status (e.g., 'open', 'closed')
 * @param {string} options.userId - Filter by user ID
 * @param {string} options.category - Filter by category
 * @returns {Promise<Array>} Array of support chat objects
 */
export async function getSupportChatsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBSupportChatsService] Fetching support chats for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBSupportChatsService] No projectId provided')
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
    if (options.userId) {
      filterParts.push('userId = :userId')
      queryOptions.ExpressionAttributeValues[':userId'] = options.userId
    }
    if (options.category) {
      filterParts.push('category = :category')
      queryOptions.ExpressionAttributeValues[':category'] = options.category
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const chats = items.map(convertSupportChatFromDynamoDB)
    
    // Sort by lastMessageAt (descending - most recent first), then by createdAt
    chats.sort((a, b) => {
      const timeA = a.lastMessageAt || a.createdAt || 0
      const timeB = b.lastMessageAt || b.createdAt || 0
      const numA = typeof timeA === 'number' ? timeA : (timeA ? new Date(timeA).getTime() : 0)
      const numB = typeof timeB === 'number' ? timeB : (timeB ? new Date(timeB).getTime() : 0)
      return numB - numA // Descending order (newest first)
    })
    
    console.log(`[DynamoDBSupportChatsService] ✅ Fetched ${chats.length} support chats for project ${projectId}`)
    
    return chats
  } catch (error) {
    console.error(`[DynamoDBSupportChatsService] ❌ Error fetching support chats for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get support chats for a specific user within a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of support chat objects
 */
export async function getUserSupportChats(projectId, userId, options = {}) {
  try {
    return await getSupportChatsByProject(projectId, {
      ...options,
      userId
    })
  } catch (error) {
    console.error(`[DynamoDBSupportChatsService] ❌ Error fetching user support chats:`, error)
    throw error
  }
}

/**
 * Get support chats by status
 * @param {string} projectId - Project ID
 * @param {string} status - Status (e.g., 'open', 'closed')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of support chat objects
 */
export async function getSupportChatsByStatus(projectId, status, options = {}) {
  try {
    return await getSupportChatsByProject(projectId, {
      ...options,
      status
    })
  } catch (error) {
    console.error(`[DynamoDBSupportChatsService] ❌ Error fetching support chats by status:`, error)
    throw error
  }
}

/**
 * Get support chats by category
 * @param {string} projectId - Project ID
 * @param {string} category - Category name
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of support chat objects
 */
export async function getSupportChatsByCategory(projectId, category, options = {}) {
  try {
    return await getSupportChatsByProject(projectId, {
      ...options,
      category
    })
  } catch (error) {
    console.error(`[DynamoDBSupportChatsService] ❌ Error fetching support chats by category:`, error)
    throw error
  }
}

/**
 * Get a single support chat by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} chatId - Chat ID
 * @returns {Promise<Object|null>} Support chat object or null if not found
 */
export async function getSupportChatById(projectId, chatId) {
  try {
    console.log(`[DynamoDBSupportChatsService] Fetching support chat: ${chatId} in project: ${projectId}`)
    
    if (!projectId || !chatId) {
      console.warn('[DynamoDBSupportChatsService] Missing projectId or chatId')
      return null
    }
    
    const chat = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: chatId
    })
    
    if (chat) {
      return convertSupportChatFromDynamoDB(chat)
    }
    
    console.log(`[DynamoDBSupportChatsService] ⚠️ Support chat not found: ${chatId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBSupportChatsService] ❌ Error fetching support chat ${chatId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getSupportChatsByProject,
  getUserSupportChats,
  getSupportChatsByStatus,
  getSupportChatsByCategory,
  getSupportChatById
}

