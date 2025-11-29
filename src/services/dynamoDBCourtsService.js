/**
 * DynamoDB Courts Service
 * 
 * Handles all operations for the "projects__courts" DynamoDB table.
 * This service replaces Firebase/Firestore calls for courts data.
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__courts'

/**
 * Get all courts for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of courts to return
 * @param {string} options.sport - Filter by sport ID
 * @returns {Promise<Array>} Array of court objects
 */
export async function getCourtsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBCourtsService] Fetching courts for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBCourtsService] No projectId provided')
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
    
    // Add filter expression if sport is provided
    if (options.sport) {
      queryOptions.FilterExpression = '#sport = :sport'
      queryOptions.ExpressionAttributeNames = {
        '#sport': 'sport'
      }
      queryOptions.ExpressionAttributeValues[':sport'] = options.sport
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const courts = items.map(item => {
      const court = {
        id: item.id,
        parentId: item.parentId || projectId,
        name: item.name || '',
        sport: item.sport || '',
        location: item.location || '',
        hourlyRate: item.hourlyRate ? parseFloat(item.hourlyRate) : 0,
        imageUrl: item.imageUrl || null,
        imageFileName: item.imageFileName || null,
        unavailability: item.unavailability || [],
        createdAt: item.createdAt || null,
        updatedAt: item.updatedAt || null
      }
      
      return court
    })
    
    console.log(`[DynamoDBCourtsService] ✅ Fetched ${courts.length} courts for project ${projectId}`)
    
    return courts
  } catch (error) {
    console.error(`[DynamoDBCourtsService] ❌ Error fetching courts for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get courts for a specific sport in a project
 * @param {string} projectId - Project ID (parentId)
 * @param {string} sportId - Sport ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of court objects
 */
export async function getCourtsBySport(projectId, sportId, options = {}) {
  try {
    console.log(`[DynamoDBCourtsService] Fetching courts for sport: ${sportId} in project: ${projectId}`)
    
    if (!projectId || !sportId) {
      console.warn('[DynamoDBCourtsService] Missing projectId or sportId')
      return []
    }
    
    return await getCourtsByProject(projectId, {
      ...options,
      sport: sportId
    })
  } catch (error) {
    console.error(`[DynamoDBCourtsService] ❌ Error fetching courts for sport ${sportId}:`, error)
    throw error
  }
}

/**
 * Get a single court by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} courtId - Court ID
 * @returns {Promise<Object|null>} Court object or null if not found
 */
export async function getCourtById(projectId, courtId) {
  try {
    console.log(`[DynamoDBCourtsService] Fetching court: ${courtId} in project: ${projectId}`)
    
    if (!projectId || !courtId) {
      console.warn('[DynamoDBCourtsService] Missing projectId or courtId')
      return null
    }
    
    const court = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: courtId
    })
    
    if (court) {
      // Convert to JavaScript format
      const converted = {
        id: court.id,
        parentId: court.parentId || projectId,
        name: court.name || '',
        sport: court.sport || '',
        location: court.location || '',
        hourlyRate: court.hourlyRate ? parseFloat(court.hourlyRate) : 0,
        imageUrl: court.imageUrl || null,
        imageFileName: court.imageFileName || null,
        unavailability: court.unavailability || [],
        createdAt: court.createdAt || null,
        updatedAt: court.updatedAt || null
      }
      
      console.log(`[DynamoDBCourtsService] ✅ Found court: ${converted.name || courtId}`)
      return converted
    }
    
    console.log(`[DynamoDBCourtsService] ⚠️ Court not found: ${courtId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBCourtsService] ❌ Error fetching court ${courtId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getCourtsByProject,
  getCourtsBySport,
  getCourtById
}

