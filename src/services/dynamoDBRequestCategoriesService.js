/**
 * DynamoDB Request Categories Service
 * 
 * Handles all operations for the "projects__requestCategories" DynamoDB table.
 * This service replaces Firebase/Firestore calls for request categories data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Category ID
 * - Fields: allowMediaUpload (boolean), arabicTitle, createdAt, description,
 *           englishTitle, fields (array), imageUrl, mediaRequired (boolean),
 *           status, updatedAt
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__requestCategories'

/**
 * Unmarshall DynamoDB List for fields array
 * @param {Array} dynamoFields - DynamoDB List format
 * @returns {Array} JavaScript array of field objects
 */
function unmarshallFields(dynamoFields) {
  if (!Array.isArray(dynamoFields)) {
    return []
  }
  
  return dynamoFields.map(field => {
    // If field is already in JavaScript format, return as is
    if (!field || typeof field !== 'object' || !field.M) {
      return field
    }
    
    // Convert DynamoDB Map to JavaScript object
    const convertedField = {}
    for (const key in field.M) {
      const valueWrapper = field.M[key]
      if (valueWrapper.S) convertedField[key] = valueWrapper.S
      else if (valueWrapper.N) convertedField[key] = Number(valueWrapper.N)
      else if (valueWrapper.BOOL !== undefined) convertedField[key] = valueWrapper.BOOL
      else if (valueWrapper.L) {
        convertedField[key] = valueWrapper.L.map(subItem => {
          if (subItem.S) return subItem.S
          if (subItem.N) return Number(subItem.N)
          if (subItem.BOOL !== undefined) return subItem.BOOL
          return subItem
        })
      }
      else if (valueWrapper.M) {
        convertedField[key] = unmarshallFields([{ M: valueWrapper.M }])[0] || {}
      }
    }
    return convertedField
  })
}

/**
 * Convert DynamoDB request category item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertRequestCategoryFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id,
    parentId: item.parentId,
    projectId: item.projectId || item.parentId,
    englishTitle: item.englishTitle || '',
    arabicTitle: item.arabicTitle || '',
    description: item.description || '',
    imageUrl: item.imageUrl || '',
    status: item.status || 'draft',
    allowMediaUpload: item.allowMediaUpload !== undefined 
      ? (typeof item.allowMediaUpload === 'boolean' ? item.allowMediaUpload : item.allowMediaUpload === true || item.allowMediaUpload === 'true')
      : false,
    mediaRequired: item.mediaRequired !== undefined 
      ? (typeof item.mediaRequired === 'boolean' ? item.mediaRequired : item.mediaRequired === true || item.mediaRequired === 'true')
      : false,
    fields: unmarshallFields(item.fields || []),
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null
  }
}

/**
 * Get all request categories for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of categories to return
 * @param {string} options.status - Filter by status (e.g., 'available', 'draft')
 * @returns {Promise<Array>} Array of category objects
 */
export async function getRequestCategoriesByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBRequestCategoriesService] Fetching request categories for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBRequestCategoriesService] No projectId provided')
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
    
    // Add filter expression if status is provided
    if (options.status) {
      queryOptions.FilterExpression = '#status = :status'
      queryOptions.ExpressionAttributeNames = {
        '#status': 'status'
      }
      queryOptions.ExpressionAttributeValues[':status'] = options.status
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const categories = items.map(convertRequestCategoryFromDynamoDB)
    
    // Sort by englishTitle
    categories.sort((a, b) => (a.englishTitle || '').localeCompare(b.englishTitle || ''))
    
    console.log(`[DynamoDBRequestCategoriesService] ✅ Fetched ${categories.length} request categories for project ${projectId}`)
    
    return categories
  } catch (error) {
    console.error(`[DynamoDBRequestCategoriesService] ❌ Error fetching request categories for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get available request categories for a project
 * @param {string} projectId - Project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of available category objects
 */
export async function getAvailableRequestCategories(projectId, options = {}) {
  try {
    return await getRequestCategoriesByProject(projectId, {
      ...options,
      status: 'available'
    })
  } catch (error) {
    console.error(`[DynamoDBRequestCategoriesService] ❌ Error fetching available request categories:`, error)
    throw error
  }
}

/**
 * Get a single request category by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export async function getRequestCategoryById(projectId, categoryId) {
  try {
    console.log(`[DynamoDBRequestCategoriesService] Fetching request category: ${categoryId} in project: ${projectId}`)
    
    if (!projectId || !categoryId) {
      console.warn('[DynamoDBRequestCategoriesService] Missing projectId or categoryId')
      return null
    }
    
    const category = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: categoryId
    })
    
    if (category) {
      return convertRequestCategoryFromDynamoDB(category)
    }
    
    console.log(`[DynamoDBRequestCategoriesService] ⚠️ Request category not found: ${categoryId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBRequestCategoriesService] ❌ Error fetching request category ${categoryId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getRequestCategoriesByProject,
  getAvailableRequestCategories,
  getRequestCategoryById
}

