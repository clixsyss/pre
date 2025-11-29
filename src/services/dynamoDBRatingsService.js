/**
 * DynamoDB Ratings Service
 * 
 * Handles all operations for the "projects__ratings" DynamoDB table.
 * This service replaces Firebase/Firestore calls for ratings data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Rating ID
 * - Fields: (table is currently empty, structure to be determined)
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__ratings'

/**
 * Get all ratings for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of ratings to return
 * @param {string} options.userId - Filter by userId
 * @param {string} options.itemId - Filter by itemId (e.g., storeId, productId)
 * @param {string} options.itemType - Filter by itemType (e.g., 'store', 'product')
 * @returns {Promise<Array>} Array of rating objects
 */
export async function getRatingsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBRatingsService] Fetching ratings for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBRatingsService] No projectId provided')
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
    if (options.userId) {
      filterParts.push('userId = :userId')
      queryOptions.ExpressionAttributeValues[':userId'] = options.userId
    }
    if (options.itemId) {
      filterParts.push('itemId = :itemId')
      queryOptions.ExpressionAttributeValues[':itemId'] = options.itemId
    }
    if (options.itemType) {
      filterParts.push('itemType = :itemType')
      queryOptions.ExpressionAttributeValues[':itemType'] = options.itemType
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const ratings = items.map(item => ({
      id: item.id,
      parentId: item.parentId || projectId,
      projectId: item.projectId || item.parentId || projectId,
      ...item
    }))
    
    // Sort by createdAt if available (descending - newest first)
    if (ratings[0]?.createdAt) {
      ratings.sort((a, b) => {
        const timeA = a.createdAt || ''
        const timeB = b.createdAt || ''
        return timeB.localeCompare(timeA)
      })
    }
    
    console.log(`[DynamoDBRatingsService] ✅ Fetched ${ratings.length} ratings for project ${projectId}`)
    
    return ratings
  } catch (error) {
    console.error(`[DynamoDBRatingsService] ❌ Error fetching ratings for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get ratings for a specific user within a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of rating objects
 */
export async function getUserRatings(projectId, userId, options = {}) {
  try {
    return await getRatingsByProject(projectId, {
      ...options,
      userId
    })
  } catch (error) {
    console.error(`[DynamoDBRatingsService] ❌ Error fetching user ratings:`, error)
    throw error
  }
}

/**
 * Get ratings for a specific item (e.g., store, product)
 * @param {string} projectId - Project ID
 * @param {string} itemId - Item ID
 * @param {string} itemType - Item type (e.g., 'store', 'product')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of rating objects
 */
export async function getRatingsByItem(projectId, itemId, itemType, options = {}) {
  try {
    return await getRatingsByProject(projectId, {
      ...options,
      itemId,
      itemType
    })
  } catch (error) {
    console.error(`[DynamoDBRatingsService] ❌ Error fetching ratings by item:`, error)
    throw error
  }
}

/**
 * Get a single rating by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} ratingId - Rating ID
 * @returns {Promise<Object|null>} Rating object or null if not found
 */
export async function getRatingById(projectId, ratingId) {
  try {
    console.log(`[DynamoDBRatingsService] Fetching rating: ${ratingId} in project: ${projectId}`)
    
    if (!projectId || !ratingId) {
      console.warn('[DynamoDBRatingsService] Missing projectId or ratingId')
      return null
    }
    
    const rating = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: ratingId
    })
    
    if (rating) {
      const converted = {
        id: rating.id,
        parentId: rating.parentId || projectId,
        projectId: rating.projectId || rating.parentId || projectId,
        ...rating
      }
      
      console.log(`[DynamoDBRatingsService] ✅ Found rating: ${ratingId}`)
      return converted
    }
    
    console.log(`[DynamoDBRatingsService] ⚠️ Rating not found: ${ratingId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBRatingsService] ❌ Error fetching rating ${ratingId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getRatingsByProject,
  getUserRatings,
  getRatingsByItem,
  getRatingById
}

