/**
 * DynamoDB Services Service
 *
 * Table: projects__serviceCategories__services
 *
 * Keys must match `dynamoDBAdapter.addDoc` (this repo and PRE admin) for nested path
 * `projects/{projectId}/serviceCategories/{categoryId}/services`:
 * partition key `parentId` is the **projectId** (not projectId#categoryId).
 * Each item includes `categoryId` for filtering.
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
    
    // Dashboard writes services with parentId = projectId (see dynamoDBAdapter.addDoc).
    const queryOptions = {
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': projectId
      }
    }

    if (options.limit) {
      queryOptions.Limit = options.limit
    }

    const filterParts = []
    const expressionNames = {}

    if (options.categoryId) {
      filterParts.push('categoryId = :categoryId')
      queryOptions.ExpressionAttributeValues[':categoryId'] = options.categoryId
    }

    // Dashboard create flow may omit `status`; treat missing as published/available for the app.
    if (options.status === 'available') {
      expressionNames['#status'] = 'status'
      filterParts.push('(attribute_not_exists(#status) OR #status = :statusAvailable)')
      queryOptions.ExpressionAttributeValues[':statusAvailable'] = 'available'
    } else if (options.status) {
      expressionNames['#status'] = 'status'
      filterParts.push('#status = :status')
      queryOptions.ExpressionAttributeValues[':status'] = options.status
    }

    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
      if (Object.keys(expressionNames).length > 0) {
        queryOptions.ExpressionAttributeNames = expressionNames
      }
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
        status: item.status != null && item.status !== '' ? item.status : 'available',
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
    
    let service = null

    try {
      service = await getItem(TABLE_NAME, {
        parentId: projectId,
        id: serviceId
      })
    } catch (err) {
      console.warn(`[DynamoDBServicesService] getItem lookup failed:`, err)
    }

    if (service && categoryId && service.categoryId && service.categoryId !== categoryId) {
      service = null
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
        status: service.status != null && service.status !== '' ? service.status : 'available',
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
      status: item.status != null && item.status !== '' ? item.status : 'available',
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
