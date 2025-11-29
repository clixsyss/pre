/**
 * DynamoDB Units Service
 * 
 * Handles all operations for the "projects__units" DynamoDB table.
 * This service replaces Firebase/Firestore calls for units data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Unit ID
 * - Fields: buildingNum, developer, floor, unitNum
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__units'

/**
 * Convert DynamoDB unit item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @param {string} projectId - Project ID (for backward compatibility)
 * @returns {Object} JavaScript object
 */
function convertUnitFromDynamoDB(item, projectId) {
  if (!item) return null
  
  return {
    id: item.id || '',
    parentId: item.parentId || projectId || '',
    projectId: item.projectId || item.parentId || projectId || '',
    buildingNum: item.buildingNum || '',
    developer: item.developer || '',
    floor: item.floor || '',
    unitNum: item.unitNum || ''
  }
}

/**
 * Get units for a specific project
 * @param {string} projectId - Project ID (used as parentId)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of unit objects
 */
export async function getUnitsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBUnitsService] Fetching units for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBUnitsService] No projectId provided')
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
    const units = items.map(item => convertUnitFromDynamoDB(item, projectId))
    
    // Sort by buildingNum, then floor, then unitNum
    units.sort((a, b) => {
      const buildingA = String(a.buildingNum || '').padStart(10, '0')
      const buildingB = String(b.buildingNum || '').padStart(10, '0')
      if (buildingA !== buildingB) {
        return buildingA.localeCompare(buildingB)
      }
      
      const floorA = String(a.floor || '').padStart(10, '0')
      const floorB = String(b.floor || '').padStart(10, '0')
      if (floorA !== floorB) {
        return floorA.localeCompare(floorB)
      }
      
      const unitA = String(a.unitNum || '').padStart(10, '0')
      const unitB = String(b.unitNum || '').padStart(10, '0')
      return unitA.localeCompare(unitB)
    })
    
    console.log(`[DynamoDBUnitsService] ✅ Fetched ${units.length} units for project ${projectId}`)
    
    return units
  } catch (error) {
    console.error(`[DynamoDBUnitsService] ❌ Error fetching units for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get a single unit by ID
 * @param {string} projectId - Project ID (used as parentId)
 * @param {string} unitId - Unit ID
 * @returns {Promise<Object|null>} Unit object or null if not found
 */
export async function getUnitById(projectId, unitId) {
  try {
    console.log(`[DynamoDBUnitsService] Fetching unit: ${unitId} in project: ${projectId}`)
    
    if (!projectId || !unitId) {
      console.warn('[DynamoDBUnitsService] Missing projectId or unitId')
      return null
    }
    
    const unit = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: unitId
    })
    
    if (unit) {
      const convertedUnit = convertUnitFromDynamoDB(unit, projectId)
      console.log(`[DynamoDBUnitsService] ✅ Found unit: ${unitId}`)
      return convertedUnit
    }
    
    console.log(`[DynamoDBUnitsService] ⚠️ Unit not found: ${unitId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBUnitsService] ❌ Error fetching unit ${unitId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getUnitsByProject,
  getUnitById
}


