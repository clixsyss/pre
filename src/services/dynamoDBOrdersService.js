/**
 * DynamoDB Orders Service
 * 
 * Handles all operations for the "projects__orders" DynamoDB table.
 * This service replaces Firebase/Firestore calls for orders data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Order ID
 * - Fields: createdAt, deliveryFee (number), estimatedDelivery, items (array),
 *           orderNumber, projectId, status, subtotal (number), total (number),
 *           userEmail, userId
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__orders'

/**
 * Unmarshall DynamoDB List for items array
 * @param {Array} dynamoItems - DynamoDB List format
 * @returns {Array} JavaScript array of items
 */
function unmarshallItems(dynamoItems) {
  if (!Array.isArray(dynamoItems)) {
    return []
  }
  
  return dynamoItems.map(item => {
    // If item is already in JavaScript format, return as is
    if (!item || typeof item !== 'object' || !item.M) {
      return item
    }
    
    // Convert DynamoDB Map to JavaScript object
    const convertedItem = {}
    for (const key in item.M) {
      const valueWrapper = item.M[key]
      if (valueWrapper.S) convertedItem[key] = valueWrapper.S
      else if (valueWrapper.N) convertedItem[key] = Number(valueWrapper.N)
      else if (valueWrapper.BOOL !== undefined) convertedItem[key] = valueWrapper.BOOL
      else if (valueWrapper.L) {
        convertedItem[key] = valueWrapper.L.map(subItem => {
          if (subItem.S) return subItem.S
          if (subItem.N) return Number(subItem.N)
          if (subItem.BOOL !== undefined) return subItem.BOOL
          return subItem
        })
      }
      else if (valueWrapper.M) {
        convertedItem[key] = unmarshallItems([{ M: valueWrapper.M }])[0] || {}
      }
    }
    return convertedItem
  })
}

/**
 * Convert DynamoDB order item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertOrderFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id,
    parentId: item.parentId,
    projectId: item.projectId || item.parentId,
    orderNumber: item.orderNumber || '',
    userId: item.userId || '',
    userEmail: item.userEmail || '',
    status: item.status || 'pending',
    items: unmarshallItems(item.items || []),
    subtotal: item.subtotal ? Number(item.subtotal) : 0,
    deliveryFee: item.deliveryFee ? Number(item.deliveryFee) : 0,
    total: item.total ? Number(item.total) : 0,
    estimatedDelivery: item.estimatedDelivery || null,
    createdAt: item.createdAt || null
  }
}

/**
 * Get all orders for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of orders to return
 * @param {string} options.status - Filter by status (e.g., 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
 * @param {string} options.userId - Filter by userId
 * @returns {Promise<Array>} Array of order objects
 */
export async function getOrdersByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBOrdersService] Fetching orders for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBOrdersService] No projectId provided')
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
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const orders = items.map(convertOrderFromDynamoDB)
    
    // Sort by createdAt (descending - newest first)
    orders.sort((a, b) => {
      const timeA = a.createdAt || ''
      const timeB = b.createdAt || ''
      return timeB.localeCompare(timeA)
    })
    
    console.log(`[DynamoDBOrdersService] ✅ Fetched ${orders.length} orders for project ${projectId}`)
    
    return orders
  } catch (error) {
    console.error(`[DynamoDBOrdersService] ❌ Error fetching orders for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get orders for a specific user within a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of order objects
 */
export async function getUserOrders(projectId, userId, options = {}) {
  try {
    return await getOrdersByProject(projectId, {
      ...options,
      userId
    })
  } catch (error) {
    console.error(`[DynamoDBOrdersService] ❌ Error fetching user orders:`, error)
    throw error
  }
}

/**
 * Get orders by status for a project
 * @param {string} projectId - Project ID
 * @param {string} status - Order status (e.g., 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of order objects
 */
export async function getOrdersByStatus(projectId, status, options = {}) {
  try {
    return await getOrdersByProject(projectId, {
      ...options,
      status
    })
  } catch (error) {
    console.error(`[DynamoDBOrdersService] ❌ Error fetching orders by status:`, error)
    throw error
  }
}

/**
 * Get a single order by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} orderId - Order ID
 * @returns {Promise<Object|null>} Order object or null if not found
 */
export async function getOrderById(projectId, orderId) {
  try {
    console.log(`[DynamoDBOrdersService] Fetching order: ${orderId} in project: ${projectId}`)
    
    if (!projectId || !orderId) {
      console.warn('[DynamoDBOrdersService] Missing projectId or orderId')
      return null
    }
    
    const order = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: orderId
    })
    
    if (order) {
      return convertOrderFromDynamoDB(order)
    }
    
    console.log(`[DynamoDBOrdersService] ⚠️ Order not found: ${orderId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBOrdersService] ❌ Error fetching order ${orderId}:`, error)
    throw error
  }
}

/**
 * Get order by order number
 * @param {string} projectId - Project ID
 * @param {string} orderNumber - Order number
 * @returns {Promise<Object|null>} Order object or null if not found
 */
export async function getOrderByOrderNumber(projectId, orderNumber) {
  try {
    console.log(`[DynamoDBOrdersService] Fetching order by number: ${orderNumber} in project: ${projectId}`)
    
    if (!projectId || !orderNumber) {
      console.warn('[DynamoDBOrdersService] Missing projectId or orderNumber')
      return null
    }
    
    // Query all orders for the project and filter by orderNumber
    const orders = await getOrdersByProject(projectId, { limit: 1000 })
    const order = orders.find(o => o.orderNumber === orderNumber)
    
    if (order) {
      console.log(`[DynamoDBOrdersService] ✅ Found order: ${orderNumber}`)
      return order
    }
    
    console.log(`[DynamoDBOrdersService] ⚠️ Order not found: ${orderNumber}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBOrdersService] ❌ Error fetching order by number ${orderNumber}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getOrdersByProject,
  getUserOrders,
  getOrdersByStatus,
  getOrderById,
  getOrderByOrderNumber
}

