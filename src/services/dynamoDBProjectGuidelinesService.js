/**
 * DynamoDB Project Guidelines Service
 * 
 * Handles all operations for the "projects__projectGuidelines" DynamoDB table.
 * This service replaces Firebase/Firestore calls for project guidelines data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Guideline ID
 * - Fields: (table is currently empty, structure to be determined)
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__projectGuidelines'

/**
 * Get all guidelines for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of guidelines to return
 * @returns {Promise<Array>} Array of guideline objects
 */
export async function getGuidelinesByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBProjectGuidelinesService] Fetching guidelines for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBProjectGuidelinesService] No projectId provided')
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
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const guidelines = items.map(item => ({
      id: item.id,
      parentId: item.parentId || projectId,
      projectId: item.projectId || item.parentId || projectId,
      ...item
    }))
    
    // Sort by createdAt if available (descending - newest first)
    if (guidelines[0]?.createdAt) {
      guidelines.sort((a, b) => {
        const timeA = a.createdAt || ''
        const timeB = b.createdAt || ''
        return timeB.localeCompare(timeA)
      })
    }
    
    console.log(`[DynamoDBProjectGuidelinesService] ✅ Fetched ${guidelines.length} guidelines for project ${projectId}`)
    
    return guidelines
  } catch (error) {
    console.error(`[DynamoDBProjectGuidelinesService] ❌ Error fetching guidelines for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get a single guideline by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} guidelineId - Guideline ID
 * @returns {Promise<Object|null>} Guideline object or null if not found
 */
export async function getGuidelineById(projectId, guidelineId) {
  try {
    console.log(`[DynamoDBProjectGuidelinesService] Fetching guideline: ${guidelineId} in project: ${projectId}`)
    
    if (!projectId || !guidelineId) {
      console.warn('[DynamoDBProjectGuidelinesService] Missing projectId or guidelineId')
      return null
    }
    
    const guideline = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: guidelineId
    })
    
    if (guideline) {
      const converted = {
        id: guideline.id,
        parentId: guideline.parentId || projectId,
        projectId: guideline.projectId || guideline.parentId || projectId,
        ...guideline
      }
      
      console.log(`[DynamoDBProjectGuidelinesService] ✅ Found guideline: ${guidelineId}`)
      return converted
    }
    
    console.log(`[DynamoDBProjectGuidelinesService] ⚠️ Guideline not found: ${guidelineId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBProjectGuidelinesService] ❌ Error fetching guideline ${guidelineId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getGuidelinesByProject,
  getGuidelineById
}

