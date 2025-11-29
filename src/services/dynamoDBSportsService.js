/**
 * DynamoDB Sports Service
 * 
 * Handles all operations for the "projects__sports" DynamoDB table.
 * This service replaces Firebase/Firestore calls for sports data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Sport ID
 * - Fields: active (boolean), ageGroup, category, createdAt, description,
 *           difficulty, duration, equipment, image, maxParticipants (number),
 *           name, rules, updatedAt
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__sports'

/**
 * Convert DynamoDB sport item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertSportFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id,
    parentId: item.parentId,
    projectId: item.projectId || item.parentId,
    name: item.name || '',
    description: item.description || '',
    category: item.category || '',
    ageGroup: item.ageGroup || '',
    difficulty: item.difficulty || '',
    duration: item.duration || '',
    equipment: item.equipment || '',
    rules: item.rules || '',
    image: item.image || '',
    maxParticipants: item.maxParticipants ? Number(item.maxParticipants) : 0,
    active: item.active !== undefined 
      ? (typeof item.active === 'boolean' ? item.active : item.active === true || item.active === 'true')
      : true,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null
  }
}

/**
 * Get all sports for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of sports to return
 * @param {boolean} options.activeOnly - Filter by active status (default: false)
 * @param {string} options.category - Filter by category
 * @param {string} options.ageGroup - Filter by age group
 * @returns {Promise<Array>} Array of sport objects
 */
export async function getSportsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBSportsService] Fetching sports for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBSportsService] No projectId provided')
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
    if (options.activeOnly) {
      filterParts.push('active = :active')
      queryOptions.ExpressionAttributeValues[':active'] = true
    }
    if (options.category) {
      filterParts.push('category = :category')
      queryOptions.ExpressionAttributeValues[':category'] = options.category
    }
    if (options.ageGroup) {
      filterParts.push('ageGroup = :ageGroup')
      queryOptions.ExpressionAttributeValues[':ageGroup'] = options.ageGroup
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const sports = items.map(convertSportFromDynamoDB)
    
    // Sort by name
    sports.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    
    console.log(`[DynamoDBSportsService] ✅ Fetched ${sports.length} sports for project ${projectId}`)
    
    return sports
  } catch (error) {
    console.error(`[DynamoDBSportsService] ❌ Error fetching sports for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get active sports for a project
 * @param {string} projectId - Project ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of active sport objects
 */
export async function getActiveSportsByProject(projectId, options = {}) {
  try {
    return await getSportsByProject(projectId, {
      ...options,
      activeOnly: true
    })
  } catch (error) {
    console.error(`[DynamoDBSportsService] ❌ Error fetching active sports:`, error)
    throw error
  }
}

/**
 * Get sports by category
 * @param {string} projectId - Project ID
 * @param {string} category - Category name
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of sport objects
 */
export async function getSportsByCategory(projectId, category, options = {}) {
  try {
    return await getSportsByProject(projectId, {
      ...options,
      category
    })
  } catch (error) {
    console.error(`[DynamoDBSportsService] ❌ Error fetching sports by category:`, error)
    throw error
  }
}

/**
 * Get sports by age group
 * @param {string} projectId - Project ID
 * @param {string} ageGroup - Age group
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of sport objects
 */
export async function getSportsByAgeGroup(projectId, ageGroup, options = {}) {
  try {
    return await getSportsByProject(projectId, {
      ...options,
      ageGroup
    })
  } catch (error) {
    console.error(`[DynamoDBSportsService] ❌ Error fetching sports by age group:`, error)
    throw error
  }
}

/**
 * Get a single sport by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} sportId - Sport ID
 * @returns {Promise<Object|null>} Sport object or null if not found
 */
export async function getSportById(projectId, sportId) {
  try {
    console.log(`[DynamoDBSportsService] Fetching sport: ${sportId} in project: ${projectId}`)
    
    if (!projectId || !sportId) {
      console.warn('[DynamoDBSportsService] Missing projectId or sportId')
      return null
    }
    
    const sport = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: sportId
    })
    
    if (sport) {
      return convertSportFromDynamoDB(sport)
    }
    
    console.log(`[DynamoDBSportsService] ⚠️ Sport not found: ${sportId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBSportsService] ❌ Error fetching sport ${sportId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getSportsByProject,
  getActiveSportsByProject,
  getSportsByCategory,
  getSportsByAgeGroup,
  getSportById
}

