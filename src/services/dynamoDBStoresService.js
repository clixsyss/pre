/**
 * DynamoDB Stores Service
 * 
 * Handles all operations for the "projects__stores" DynamoDB table.
 * This service replaces Firebase/Firestore calls for stores data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Store ID
 * - Fields: averageDeliveryTime (number), contactInfo, createdAt, deliveryFee (number),
 *           image, location, name, rating (number), reviewCount (number),
 *           specialNotes, status, updatedAt, workingDays, workingHours
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__stores'

/**
 * Convert DynamoDB store item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertStoreFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id,
    parentId: item.parentId,
    projectId: item.projectId || item.parentId,
    name: item.name || '',
    description: item.description || '',
    image: item.image || '',
    location: item.location || '',
    contactInfo: item.contactInfo || '',
    specialNotes: item.specialNotes || '',
    workingHours: item.workingHours || '',
    workingDays: item.workingDays || '',
    status: item.status || 'active',
    rating: item.rating ? Number(item.rating) : 0,
    reviewCount: item.reviewCount ? Number(item.reviewCount) : 0,
    deliveryFee: item.deliveryFee ? Number(item.deliveryFee) : 0,
    averageDeliveryTime: item.averageDeliveryTime ? Number(item.averageDeliveryTime) : 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null
  }
}

/**
 * Get all stores for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of stores to return
 * @param {string} options.status - Filter by status (e.g., 'active', 'inactive')
 * @returns {Promise<Array>} Array of store objects
 */
export async function getStoresByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBStoresService] Fetching stores for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBStoresService] No projectId provided')
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
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const stores = items.map(convertStoreFromDynamoDB)
    
    // Sort by name
    stores.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    
    console.log(`[DynamoDBStoresService] ✅ Fetched ${stores.length} stores for project ${projectId}`)
    
    return stores
  } catch (error) {
    console.error(`[DynamoDBStoresService] ❌ Error fetching stores for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get active stores for a project
 * @param {string} projectId - Project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of active store objects
 */
export async function getActiveStoresByProject(projectId, options = {}) {
  try {
    return await getStoresByProject(projectId, {
      ...options,
      status: 'active'
    })
  } catch (error) {
    console.error(`[DynamoDBStoresService] ❌ Error fetching active stores:`, error)
    throw error
  }
}

/**
 * Get a single store by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} storeId - Store ID
 * @returns {Promise<Object|null>} Store object or null if not found
 */
export async function getStoreById(projectId, storeId) {
  try {
    console.log(`[DynamoDBStoresService] Fetching store: ${storeId} in project: ${projectId}`)
    
    if (!projectId || !storeId) {
      console.warn('[DynamoDBStoresService] Missing projectId or storeId')
      return null
    }
    
    const store = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: storeId
    })
    
    if (store) {
      return convertStoreFromDynamoDB(store)
    }
    
    console.log(`[DynamoDBStoresService] ⚠️ Store not found: ${storeId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBStoresService] ❌ Error fetching store ${storeId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getStoresByProject,
  getActiveStoresByProject,
  getStoreById
}

