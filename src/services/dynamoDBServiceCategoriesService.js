/**
 * DynamoDB Service Categories Service
 * 
 * Handles all operations for the "projects__serviceCategories" DynamoDB table.
 * This service replaces Firebase/Firestore calls for service categories data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Category ID
 * - Fields: arabicTitle, availability (nested object), createdAt, englishTitle,
 *           imageUrl, status, updatedAt
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__serviceCategories'

/**
 * Convert DynamoDB formatted availability object to JavaScript object
 * DynamoDB format: { "sunday": { "M": { "available": { "BOOL": true }, ... } } }
 * JavaScript format: { sunday: { available: true, startTime: "09:00", endTime: "17:00" } }
 * @param {Object} dynamoAvailability - Availability object in DynamoDB format
 * @returns {Object} Availability object in JavaScript format
 */
function convertAvailabilityFromDynamoDB(dynamoAvailability) {
  if (!dynamoAvailability || typeof dynamoAvailability !== 'object') {
    return {}
  }
  
  const converted = {}
  
  // Days of the week
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  
  for (const day of days) {
    if (dynamoAvailability[day]) {
      const dayData = dynamoAvailability[day]
      
      if (dayData.M) {
        // DynamoDB format: { "M": { "available": { "BOOL": true }, ... } }
        const dayObj = {}
        for (const [key, value] of Object.entries(dayData.M)) {
          if (value.BOOL !== undefined) {
            dayObj[key] = value.BOOL
          } else if (value.S) {
            dayObj[key] = value.S
          } else if (value.N) {
            dayObj[key] = parseFloat(value.N)
          } else if (value.L) {
            dayObj[key] = value.L.map(item => {
              if (item.S) return item.S
              if (item.N) return parseFloat(item.N)
              if (item.BOOL !== undefined) return item.BOOL
              return item
            })
          } else if (value.M) {
            dayObj[key] = convertAvailabilityFromDynamoDB({ temp: { M: value.M } }).temp
          }
        }
        converted[day] = dayObj
      } else {
        // Already in JavaScript format
        converted[day] = dayData
      }
    }
  }
  
  return converted
}

/**
 * Get all service categories for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of categories to return
 * @param {string} options.status - Filter by status (e.g., 'available', 'draft')
 * @returns {Promise<Array>} Array of category objects
 */
export async function getServiceCategoriesByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBServiceCategoriesService] Fetching service categories for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBServiceCategoriesService] No projectId provided')
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
    
    console.log(`[DynamoDBServiceCategoriesService] Raw items from DynamoDB: ${items.length}`)
    items.forEach((item, index) => {
      console.log(`[DynamoDBServiceCategoriesService] Item ${index + 1}:`, {
        id: item.id,
        englishTitle: item.englishTitle,
        status: item.status,
        statusType: typeof item.status
      })
    })
    
    // Convert DynamoDB format to JavaScript objects
    const categories = items.map(item => {
      // Handle status - it might be stored as DynamoDB type (S) or plain string
      let status = item.status || 'draft'
      if (status && typeof status === 'object' && status.S) {
        status = status.S
      }
      
      const category = {
        id: item.id,
        parentId: item.parentId || projectId,
        englishTitle: item.englishTitle || '',
        arabicTitle: item.arabicTitle || '',
        imageUrl: item.imageUrl || '',
        status: status,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null,
        // Convert availability from DynamoDB format
        availability: convertAvailabilityFromDynamoDB(item.availability || {})
      }
      
      return category
    })
    
    console.log(`[DynamoDBServiceCategoriesService] ✅ Fetched ${categories.length} service categories for project ${projectId}`)
    console.log(`[DynamoDBServiceCategoriesService] Categories by status:`, {
      available: categories.filter(c => c.status === 'available').length,
      draft: categories.filter(c => c.status === 'draft').length,
      other: categories.filter(c => c.status !== 'available' && c.status !== 'draft').length
    })
    
    return categories
  } catch (error) {
    console.error(`[DynamoDBServiceCategoriesService] ❌ Error fetching service categories for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get a single service category by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export async function getServiceCategoryById(projectId, categoryId) {
  try {
    console.log(`[DynamoDBServiceCategoriesService] Fetching service category: ${categoryId} in project: ${projectId}`)
    
    if (!projectId || !categoryId) {
      console.warn('[DynamoDBServiceCategoriesService] Missing projectId or categoryId')
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
        englishTitle: category.englishTitle || '',
        arabicTitle: category.arabicTitle || '',
        imageUrl: category.imageUrl || '',
        status: category.status || 'draft',
        createdAt: category.createdAt || null,
        updatedAt: category.updatedAt || null,
        // Convert availability from DynamoDB format
        availability: convertAvailabilityFromDynamoDB(category.availability || {})
      }
      
      console.log(`[DynamoDBServiceCategoriesService] ✅ Found category: ${converted.englishTitle || categoryId}`)
      return converted
    }
    
    console.log(`[DynamoDBServiceCategoriesService] ⚠️ Service category not found: ${categoryId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBServiceCategoriesService] ❌ Error fetching service category ${categoryId}:`, error)
    throw error
  }
}

/**
 * Get all service categories across all projects (use with caution - scans entire table)
 * @param {Object} options - Scan options
 * @param {number} options.limit - Maximum number of categories to return
 * @returns {Promise<Array>} Array of category objects
 */
export async function getAllServiceCategories(options = {}) {
  try {
    console.log('[DynamoDBServiceCategoriesService] Fetching all service categories from DynamoDB...')
    
    const { scan } = await import('../aws/dynamodbClient')
    
    const scanOptions = {}
    if (options.limit) {
      scanOptions.Limit = options.limit
    }
    
    const items = await scan(TABLE_NAME, scanOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const categories = items.map(item => ({
      id: item.id,
      parentId: item.parentId,
      englishTitle: item.englishTitle || '',
      arabicTitle: item.arabicTitle || '',
      imageUrl: item.imageUrl || '',
      status: item.status || 'draft',
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null,
      // Convert availability from DynamoDB format
      availability: convertAvailabilityFromDynamoDB(item.availability || {})
    }))
    
    console.log(`[DynamoDBServiceCategoriesService] ✅ Fetched ${categories.length} service categories from DynamoDB`)
    
    return categories
  } catch (error) {
    console.error('[DynamoDBServiceCategoriesService] ❌ Error fetching all service categories:', error)
    throw error
  }
}

// Export default for convenience
export default {
  getServiceCategoriesByProject,
  getServiceCategoryById,
  getAllServiceCategories
}

