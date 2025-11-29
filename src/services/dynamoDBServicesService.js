/**
 * DynamoDB Services Service
 * 
 * Handles all operations for the "projects__serviceCategories__services" DynamoDB table.
 * This service replaces Firebase/Firestore calls for services data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Service ID
 * - Fields: arabicDescription, arabicTitle, categoryId, categoryName, createdAt,
 *           englishDescription, englishTitle, price, status, timeSlotEnd,
 *           timeSlotInterval, timeSlotStart, updatedAt
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__serviceCategories__services'

/**
 * Get all services for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of services to return
 * @param {string} options.categoryId - Filter by category ID
 * @param {string} options.status - Filter by status (e.g., 'available', 'draft')
 * @returns {Promise<Array>} Array of service objects
 */
export async function getServicesByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBServicesService] Fetching services for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBServicesService] No projectId provided')
      return []
    }
    
    // Handle composite parentId (projectId#categoryId) or simple parentId (projectId)
    // If categoryId is provided, use composite key; otherwise, try simple projectId
    let keyCondition = 'parentId = :parentId'
    const expressionValues = {
      ':parentId': projectId
    }
    
    // If categoryId is provided, try composite key format: projectId#categoryId
    if (options.categoryId) {
      const compositeKey = `${projectId}#${options.categoryId}`
      keyCondition = 'parentId = :compositeKey'
      expressionValues[':compositeKey'] = compositeKey
      // Remove :parentId from expressionValues since we're using compositeKey
      delete expressionValues[':parentId']
    }
    
    const queryOptions = {
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues
    }
    
    if (options.limit) {
      queryOptions.Limit = options.limit
    }
    
    // Add filter expressions if provided
    // Note: If we used composite key, we don't need categoryId filter
    const filterParts = []
    if (options.categoryId && !keyCondition.includes('compositeKey')) {
      // Only add categoryId filter if we're not using composite key
      filterParts.push('categoryId = :categoryId')
      queryOptions.ExpressionAttributeValues[':categoryId'] = options.categoryId
    }
    if (options.status) {
      filterParts.push('#status = :status')
      queryOptions.ExpressionAttributeNames = queryOptions.ExpressionAttributeNames || {}
      queryOptions.ExpressionAttributeNames['#status'] = 'status'
      queryOptions.ExpressionAttributeValues[':status'] = options.status
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    let items = []
    try {
      items = await query(TABLE_NAME, queryOptions)
    } catch (queryError) {
      // If query fails (e.g., parentId is composite and we used simple projectId),
      // try scanning with filter (less efficient but works)
      if (!options.categoryId && queryError.message && queryError.message.includes('ValidationException')) {
        console.warn('[DynamoDBServicesService] Query failed, trying scan with filter (parentId might be composite)')
        const { scan } = await import('../aws/dynamodbClient')
        const scanOptions = {
          FilterExpression: 'begins_with(parentId, :parentIdPrefix)',
          ExpressionAttributeValues: {
            ':parentIdPrefix': `${projectId}#`
          }
        }
        if (options.limit) {
          scanOptions.Limit = options.limit
        }
        if (options.status) {
          scanOptions.FilterExpression = scanOptions.FilterExpression 
            ? `${scanOptions.FilterExpression} AND #status = :status`
            : '#status = :status'
          scanOptions.ExpressionAttributeNames = scanOptions.ExpressionAttributeNames || {}
          scanOptions.ExpressionAttributeNames['#status'] = 'status'
          scanOptions.ExpressionAttributeValues[':status'] = options.status
        }
        items = await scan(TABLE_NAME, scanOptions)
      } else {
        throw queryError
      }
    }
    
    // Convert DynamoDB format to JavaScript objects
    const services = items.map(item => {
      const service = {
        id: item.id,
        parentId: item.parentId || projectId,
        categoryId: item.categoryId || '',
        categoryName: item.categoryName || '',
        englishTitle: item.englishTitle || '',
        arabicTitle: item.arabicTitle || '',
        englishDescription: item.englishDescription || '',
        arabicDescription: item.arabicDescription || '',
        price: item.price ? parseFloat(item.price) : 0,
        status: item.status || 'draft',
        timeSlotStart: item.timeSlotStart || '',
        timeSlotEnd: item.timeSlotEnd || '',
        timeSlotInterval: item.timeSlotInterval ? parseFloat(item.timeSlotInterval) : 0,
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null
      }
      
      return service
    })
    
    console.log(`[DynamoDBServicesService] ✅ Fetched ${services.length} services for project ${projectId}`)
    
    return services
  } catch (error) {
    console.error(`[DynamoDBServicesService] ❌ Error fetching services for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get services for a specific category in a project
 * @param {string} projectId - Project ID (parentId)
 * @param {string} categoryId - Category ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of services to return
 * @param {string} options.status - Filter by status (e.g., 'available', 'draft')
 * @returns {Promise<Array>} Array of service objects
 */
export async function getServicesByCategory(projectId, categoryId, options = {}) {
  try {
    console.log(`[DynamoDBServicesService] Fetching services for category: ${categoryId} in project: ${projectId}`)
    
    if (!projectId || !categoryId) {
      console.warn('[DynamoDBServicesService] Missing projectId or categoryId')
      return []
    }
    
    return await getServicesByProject(projectId, {
      ...options,
      categoryId: categoryId
    })
  } catch (error) {
    console.error(`[DynamoDBServicesService] ❌ Error fetching services for category ${categoryId}:`, error)
    throw error
  }
}

/**
 * Get a single service by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} serviceId - Service ID
 * @returns {Promise<Object|null>} Service object or null if not found
 */
export async function getServiceById(projectId, serviceId, categoryId = null) {
  try {
    console.log(`[DynamoDBServicesService] Fetching service: ${serviceId} in project: ${projectId}`)
    
    if (!projectId || !serviceId) {
      console.warn('[DynamoDBServicesService] Missing projectId or serviceId')
      return null
    }
    
    // Try to get service - parentId might be projectId or projectId#categoryId
    let service = null
    
    // If categoryId is provided, try composite key first
    if (categoryId) {
      const compositeKey = `${projectId}#${categoryId}`
      try {
        service = await getItem(TABLE_NAME, {
          parentId: compositeKey,
          id: serviceId
        })
      } catch (err) {
        console.warn(`[DynamoDBServicesService] Composite key lookup failed:`, err)
      }
    }
    
    // If not found with composite key, try simple projectId
    if (!service) {
      try {
        service = await getItem(TABLE_NAME, {
          parentId: projectId,
          id: serviceId
        })
      } catch (err) {
        console.warn(`[DynamoDBServicesService] Simple key lookup failed:`, err)
      }
    }
    
    // If still not found, try querying with begins_with
    if (!service) {
      try {
        const queryOptions = {
          KeyConditionExpression: 'begins_with(parentId, :parentIdPrefix)',
          FilterExpression: 'id = :serviceId',
          ExpressionAttributeValues: {
            ':parentIdPrefix': `${projectId}#`,
            ':serviceId': serviceId
          },
          Limit: 1
        }
        const results = await query(TABLE_NAME, queryOptions)
        if (results.length > 0) {
          service = results[0]
        }
      } catch (err) {
        console.warn(`[DynamoDBServicesService] Query lookup failed:`, err)
      }
    }
    
    if (service) {
      // Convert to JavaScript format
      const converted = {
        id: service.id,
        parentId: service.parentId || projectId,
        categoryId: service.categoryId || '',
        categoryName: service.categoryName || '',
        englishTitle: service.englishTitle || '',
        arabicTitle: service.arabicTitle || '',
        englishDescription: service.englishDescription || '',
        arabicDescription: service.arabicDescription || '',
        price: service.price ? parseFloat(service.price) : 0,
        status: service.status || 'draft',
        timeSlotStart: service.timeSlotStart || '',
        timeSlotEnd: service.timeSlotEnd || '',
        timeSlotInterval: service.timeSlotInterval ? parseFloat(service.timeSlotInterval) : 0,
        createdAt: service.createdAt || null,
        updatedAt: service.updatedAt || null
      }
      
      console.log(`[DynamoDBServicesService] ✅ Found service: ${converted.englishTitle || serviceId}`)
      return converted
    }
    
    console.log(`[DynamoDBServicesService] ⚠️ Service not found: ${serviceId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBServicesService] ❌ Error fetching service ${serviceId}:`, error)
    throw error
  }
}

/**
 * Get all services across all projects (use with caution - scans entire table)
 * @param {Object} options - Scan options
 * @param {number} options.limit - Maximum number of services to return
 * @returns {Promise<Array>} Array of service objects
 */
export async function getAllServices(options = {}) {
  try {
    console.log('[DynamoDBServicesService] Fetching all services from DynamoDB...')
    
    const { scan } = await import('../aws/dynamodbClient')
    
    const scanOptions = {}
    if (options.limit) {
      scanOptions.Limit = options.limit
    }
    
    const items = await scan(TABLE_NAME, scanOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const services = items.map(item => ({
      id: item.id,
      parentId: item.parentId,
      categoryId: item.categoryId || '',
      categoryName: item.categoryName || '',
      englishTitle: item.englishTitle || '',
      arabicTitle: item.arabicTitle || '',
      englishDescription: item.englishDescription || '',
      arabicDescription: item.arabicDescription || '',
      price: item.price ? parseFloat(item.price) : 0,
      status: item.status || 'draft',
      timeSlotStart: item.timeSlotStart || '',
      timeSlotEnd: item.timeSlotEnd || '',
      timeSlotInterval: item.timeSlotInterval ? parseFloat(item.timeSlotInterval) : 0,
      createdAt: item.createdAt || null,
      updatedAt: item.updatedAt || null
    }))
    
    console.log(`[DynamoDBServicesService] ✅ Fetched ${services.length} services from DynamoDB`)
    
    return services
  } catch (error) {
    console.error('[DynamoDBServicesService] ❌ Error fetching all services:', error)
    throw error
  }
}

// Export default for convenience
export default {
  getServicesByProject,
  getServicesByCategory,
  getServiceById,
  getAllServices
}

