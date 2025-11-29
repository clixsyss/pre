/**
 * DynamoDB News Categories Service
 * 
 * Handles all operations for the "projects__newsCategories" DynamoDB table.
 * This service replaces Firebase/Firestore calls for news categories data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Category ID
 * - Fields: color, createdAt, description, descriptionAr, displayOrder (number),
 *           icon, isActive (boolean), name, nameAr, updatedAt
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__newsCategories'

/**
 * Get all news categories for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of categories to return
 * @param {boolean} options.activeOnly - Filter by isActive = true
 * @returns {Promise<Array>} Array of category objects
 */
export async function getNewsCategoriesByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBNewsCategoriesService] Fetching news categories for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBNewsCategoriesService] No projectId provided')
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
    const categories = items.map(item => {
      const category = {
        id: item.id,
        parentId: item.parentId || projectId,
        name: item.name || '',
        nameAr: item.nameAr || '',
        description: item.description || '',
        descriptionAr: item.descriptionAr || '',
        color: item.color || '#000000',
        icon: item.icon || '',
        isActive: item.isActive !== undefined ? (typeof item.isActive === 'boolean' ? item.isActive : item.isActive === true || item.isActive === 'true') : true,
        displayOrder: item.displayOrder ? parseFloat(item.displayOrder) : 0,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null
      }
      
      return category
    })
    
    // Sort by displayOrder (ascending)
    categories.sort((a, b) => a.displayOrder - b.displayOrder)
    
    console.log(`[DynamoDBNewsCategoriesService] ✅ Fetched ${categories.length} news categories for project ${projectId}`)
    
    return categories
  } catch (error) {
    console.error(`[DynamoDBNewsCategoriesService] ❌ Error fetching news categories for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get active news categories for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of active category objects
 */
export async function getActiveNewsCategoriesByProject(projectId, options = {}) {
  try {
    return await getNewsCategoriesByProject(projectId, {
      ...options,
      activeOnly: true
    })
  } catch (error) {
    console.error(`[DynamoDBNewsCategoriesService] ❌ Error fetching active news categories for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get a single news category by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export async function getNewsCategoryById(projectId, categoryId) {
  try {
    console.log(`[DynamoDBNewsCategoriesService] Fetching news category: ${categoryId} in project: ${projectId}`)
    
    if (!projectId || !categoryId) {
      console.warn('[DynamoDBNewsCategoriesService] Missing projectId or categoryId')
      return null
    }
    
    const category = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: categoryId
    })
    
    if (category) {
      // Convert to JavaScript format
      const converted = {
        id: category.id,
        parentId: category.parentId || projectId,
        name: category.name || '',
        nameAr: category.nameAr || '',
        description: category.description || '',
        descriptionAr: category.descriptionAr || '',
        color: category.color || '#000000',
        icon: category.icon || '',
        isActive: category.isActive !== undefined ? (typeof category.isActive === 'boolean' ? category.isActive : category.isActive === true || category.isActive === 'true') : true,
        displayOrder: category.displayOrder ? parseFloat(category.displayOrder) : 0,
        createdAt: category.createdAt || null,
        updatedAt: category.updatedAt || null
      }
      
      console.log(`[DynamoDBNewsCategoriesService] ✅ Found category: ${converted.name || categoryId}`)
      return converted
    }
    
    console.log(`[DynamoDBNewsCategoriesService] ⚠️ News category not found: ${categoryId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBNewsCategoriesService] ❌ Error fetching news category ${categoryId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getNewsCategoriesByProject,
  getActiveNewsCategoriesByProject,
  getNewsCategoryById
}

