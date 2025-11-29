/**
 * DynamoDB Service Bookings Service
 * 
 * Handles all operations for the "projects__serviceBookings" DynamoDB table.
 * This service replaces Firebase/Firestore calls for service bookings data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Booking ID
 * - Fields: categoryId, categoryName, createdAt, lastMessageAt, messages (array),
 *           notes, paymentStatus, projectId, selectedDate, selectedTime,
 *           serviceId, serviceName, servicePrice (number), status, updatedAt,
 *           userEmail, userId, userName
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__serviceBookings'

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
        convertedMessage[key] = unmarshallMessages([{ M: valueWrapper.M }])[0] || {}
      }
    }
    return convertedMessage
  })
}

/**
 * Convert DynamoDB service booking item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertServiceBookingFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id,
    parentId: item.parentId,
    projectId: item.projectId || item.parentId,
    categoryId: item.categoryId || '',
    categoryName: item.categoryName || '',
    serviceId: item.serviceId || '',
    serviceName: item.serviceName || '',
    servicePrice: item.servicePrice ? Number(item.servicePrice) : 0,
    userId: item.userId || '',
    userName: item.userName || '',
    userEmail: item.userEmail || '',
    selectedDate: item.selectedDate || '',
    selectedTime: item.selectedTime || '',
    status: item.status || 'open',
    paymentStatus: item.paymentStatus || 'pending',
    notes: item.notes || '',
    messages: unmarshallMessages(item.messages || []),
    createdAt: item.createdAt || null,
    lastMessageAt: item.lastMessageAt || null,
    updatedAt: item.updatedAt || null
  }
}

/**
 * Get all service bookings for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of bookings to return
 * @param {string} options.status - Filter by status (e.g., 'open', 'closed', 'cancelled')
 * @param {string} options.userId - Filter by userId
 * @param {string} options.categoryId - Filter by categoryId
 * @param {string} options.serviceId - Filter by serviceId
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getServiceBookingsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBServiceBookingsService] Fetching service bookings for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBServiceBookingsService] No projectId provided')
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
    if (options.categoryId) {
      filterParts.push('categoryId = :categoryId')
      queryOptions.ExpressionAttributeValues[':categoryId'] = options.categoryId
    }
    if (options.serviceId) {
      filterParts.push('serviceId = :serviceId')
      queryOptions.ExpressionAttributeValues[':serviceId'] = options.serviceId
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const bookings = items.map(convertServiceBookingFromDynamoDB)
    
    // Sort by createdAt (descending - newest first)
    // Handle both number (timestamp) and string (ISO) formats
    bookings.sort((a, b) => {
      const timeA = a.createdAt || 0
      const timeB = b.createdAt || 0
      const numA = typeof timeA === 'number' ? timeA : (timeA ? new Date(timeA).getTime() : 0)
      const numB = typeof timeB === 'number' ? timeB : (timeB ? new Date(timeB).getTime() : 0)
      return numB - numA // Descending order (newest first)
    })
    
    console.log(`[DynamoDBServiceBookingsService] ✅ Fetched ${bookings.length} service bookings for project ${projectId}`)
    
    return bookings
  } catch (error) {
    console.error(`[DynamoDBServiceBookingsService] ❌ Error fetching service bookings for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get service bookings for a specific user within a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getUserServiceBookings(projectId, userId, options = {}) {
  try {
    return await getServiceBookingsByProject(projectId, {
      ...options,
      userId
    })
  } catch (error) {
    console.error(`[DynamoDBServiceBookingsService] ❌ Error fetching user service bookings:`, error)
    throw error
  }
}

/**
 * Get service bookings for a specific category
 * @param {string} projectId - Project ID
 * @param {string} categoryId - Category ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getServiceBookingsByCategory(projectId, categoryId, options = {}) {
  try {
    return await getServiceBookingsByProject(projectId, {
      ...options,
      categoryId
    })
  } catch (error) {
    console.error(`[DynamoDBServiceBookingsService] ❌ Error fetching service bookings by category:`, error)
    throw error
  }
}

/**
 * Get service bookings for a specific service
 * @param {string} projectId - Project ID
 * @param {string} serviceId - Service ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getServiceBookingsByService(projectId, serviceId, options = {}) {
  try {
    return await getServiceBookingsByProject(projectId, {
      ...options,
      serviceId
    })
  } catch (error) {
    console.error(`[DynamoDBServiceBookingsService] ❌ Error fetching service bookings by service:`, error)
    throw error
  }
}

/**
 * Get service bookings by status
 * @param {string} projectId - Project ID
 * @param {string} status - Booking status (e.g., 'open', 'closed', 'cancelled')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of booking objects
 */
export async function getServiceBookingsByStatus(projectId, status, options = {}) {
  try {
    return await getServiceBookingsByProject(projectId, {
      ...options,
      status
    })
  } catch (error) {
    console.error(`[DynamoDBServiceBookingsService] ❌ Error fetching service bookings by status:`, error)
    throw error
  }
}

/**
 * Get a single service booking by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object|null>} Booking object or null if not found
 */
export async function getServiceBookingById(projectId, bookingId) {
  try {
    console.log(`[DynamoDBServiceBookingsService] Fetching service booking: ${bookingId} in project: ${projectId}`)
    
    if (!projectId || !bookingId) {
      console.warn('[DynamoDBServiceBookingsService] Missing projectId or bookingId')
      return null
    }
    
    const booking = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: bookingId
    })
    
    if (booking) {
      return convertServiceBookingFromDynamoDB(booking)
    }
    
    console.log(`[DynamoDBServiceBookingsService] ⚠️ Service booking not found: ${bookingId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBServiceBookingsService] ❌ Error fetching service booking ${bookingId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getServiceBookingsByProject,
  getUserServiceBookings,
  getServiceBookingsByCategory,
  getServiceBookingsByService,
  getServiceBookingsByStatus,
  getServiceBookingById
}
