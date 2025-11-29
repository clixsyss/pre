/**
 * DynamoDB Ads Service
 * 
 * Handles all operations for the "projects__ads" DynamoDB table.
 * This service replaces Firebase/Firestore calls for ads data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Ad ID
 * - Fields: createdAt, imagePath, imageUrl, isActive (boolean), linkUrl,
 *           order (number), updatedAt
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__ads'

/**
 * Get all ads for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of ads to return
 * @param {boolean} options.activeOnly - Filter by isActive = true
 * @returns {Promise<Array>} Array of ad objects
 */
export async function getAdsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBAdsService] Fetching ads for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBAdsService] No projectId provided')
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
    
    // Add filter expression if activeOnly is true
    if (options.activeOnly) {
      queryOptions.FilterExpression = 'isActive = :isActive'
      queryOptions.ExpressionAttributeValues[':isActive'] = true
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const ads = items.map(item => {
      const ad = {
        id: item.id,
        parentId: item.parentId || projectId,
        imageUrl: item.imageUrl || '',
        imagePath: item.imagePath || '',
        linkUrl: item.linkUrl || '',
        isActive: item.isActive !== undefined ? (typeof item.isActive === 'boolean' ? item.isActive : item.isActive === true || item.isActive === 'true') : true,
        order: item.order ? parseFloat(item.order) : 0,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null
      }
      
      return ad
    })
    
    // Sort by order (ascending)
    ads.sort((a, b) => a.order - b.order)
    
    console.log(`[DynamoDBAdsService] ✅ Fetched ${ads.length} ads for project ${projectId}`)
    
    return ads
  } catch (error) {
    console.error(`[DynamoDBAdsService] ❌ Error fetching ads for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get active ads for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of active ad objects
 */
export async function getActiveAdsByProject(projectId, options = {}) {
  try {
    return await getAdsByProject(projectId, {
      ...options,
      activeOnly: true
    })
  } catch (error) {
    console.error(`[DynamoDBAdsService] ❌ Error fetching active ads for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get a single ad by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} adId - Ad ID
 * @returns {Promise<Object|null>} Ad object or null if not found
 */
export async function getAdById(projectId, adId) {
  try {
    console.log(`[DynamoDBAdsService] Fetching ad: ${adId} in project: ${projectId}`)
    
    if (!projectId || !adId) {
      console.warn('[DynamoDBAdsService] Missing projectId or adId')
      return null
    }
    
    const ad = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: adId
    })
    
    if (ad) {
      // Convert to JavaScript format
      const converted = {
        id: ad.id,
        parentId: ad.parentId || projectId,
        imageUrl: ad.imageUrl || '',
        imagePath: ad.imagePath || '',
        linkUrl: ad.linkUrl || '',
        isActive: ad.isActive !== undefined ? (typeof ad.isActive === 'boolean' ? ad.isActive : ad.isActive === true || ad.isActive === 'true') : true,
        order: ad.order ? parseFloat(ad.order) : 0,
        createdAt: ad.createdAt || null,
        updatedAt: ad.updatedAt || null
      }
      
      console.log(`[DynamoDBAdsService] ✅ Found ad: ${adId}`)
      return converted
    }
    
    console.log(`[DynamoDBAdsService] ⚠️ Ad not found: ${adId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBAdsService] ❌ Error fetching ad ${adId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getAdsByProject,
  getActiveAdsByProject,
  getAdById
}

