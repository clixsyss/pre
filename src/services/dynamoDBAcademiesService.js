/**
 * DynamoDB Academies Service
 * 
 * Handles all operations for the "projects__academies" DynamoDB table.
 * This service replaces Firebase/Firestore calls for academies data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Academy ID
 * - Fields: description, email, name, phone, programs (array), updatedAt, website
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__academies'

/**
 * Convert DynamoDB formatted programs array to JavaScript objects
 * DynamoDB format: [{ "M": { "name": { "S": "..." }, ... } }]
 * JavaScript format: [{ name: "...", ... }]
 * @param {Array} dynamoPrograms - Programs array in DynamoDB format
 * @returns {Array} Programs array in JavaScript format
 */
function convertProgramsFromDynamoDB(dynamoPrograms) {
  if (!Array.isArray(dynamoPrograms)) {
    console.log('[DynamoDBAcademiesService] convertProgramsFromDynamoDB: Not an array, returning empty:', dynamoPrograms)
    return []
  }
  
  if (dynamoPrograms.length === 0) {
    console.log('[DynamoDBAcademiesService] convertProgramsFromDynamoDB: Empty array')
    return []
  }
  
  console.log('[DynamoDBAcademiesService] convertProgramsFromDynamoDB: Processing', dynamoPrograms.length, 'programs')
  console.log('[DynamoDBAcademiesService] convertProgramsFromDynamoDB: First program sample:', JSON.stringify(dynamoPrograms[0], null, 2))
  
  return dynamoPrograms.map((program, index) => {
    // Check if it's in DynamoDB format (has .M property)
    if (program && typeof program === 'object' && program.M) {
      console.log(`[DynamoDBAcademiesService] convertProgramsFromDynamoDB: Program ${index} is in DynamoDB format`)
      // DynamoDB format: { "M": { "field": { "S": "value" } } }
      const converted = {}
      for (const [key, value] of Object.entries(program.M)) {
        if (value && typeof value === 'object') {
          if (value.S) {
            // String value
            converted[key] = value.S
          } else if (value.N) {
            // Number value (convert to number)
            converted[key] = parseFloat(value.N)
          } else if (value.BOOL !== undefined) {
            // Boolean value
            converted[key] = value.BOOL
          } else if (value.L) {
            // List value
            converted[key] = value.L.map(item => {
              if (item && typeof item === 'object') {
                if (item.S) return item.S
                if (item.N) return parseFloat(item.N)
                if (item.BOOL !== undefined) return item.BOOL
              }
              return item
            })
          } else if (value.M) {
            // Map value (nested object) - recursively convert
            converted[key] = convertProgramsFromDynamoDB([{ M: value.M }])[0] || {}
          }
        } else {
          // Direct value
          converted[key] = value
        }
      }
      console.log(`[DynamoDBAcademiesService] convertProgramsFromDynamoDB: Converted program ${index}:`, converted)
      return converted
    }
    // Already in JavaScript format
    console.log(`[DynamoDBAcademiesService] convertProgramsFromDynamoDB: Program ${index} already in JS format:`, program)
    return program
  })
}

/**
 * Get all academies for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of academies to return
 * @returns {Promise<Array>} Array of academy objects
 */
export async function getAcademiesByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBAcademiesService] Fetching academies for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBAcademiesService] No projectId provided')
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
    
    console.log(`[DynamoDBAcademiesService] Raw items from DynamoDB:`, items.length, items)
    
    // Convert DynamoDB format to JavaScript objects
    const academies = items.map(item => {
      console.log(`[DynamoDBAcademiesService] Processing academy item:`, item.id, 'Programs raw:', item.programs)
      
      const programs = convertProgramsFromDynamoDB(item.programs || [])
      
      console.log(`[DynamoDBAcademiesService] Converted programs for ${item.name}:`, programs)
      
      const academy = {
        id: item.id,
        parentId: item.parentId || projectId,
        projectId: item.projectId || item.parentId || projectId,
        name: item.name || 'Unnamed Academy',
        description: item.description || '',
        email: item.email || '',
        phone: item.phone || '',
        website: item.website || '',
        updatedAt: item.updatedAt || null,
        // Convert programs from DynamoDB format
        programs: programs
      }
      
      // Log programs for debugging
      if (programs.length > 0) {
        console.log(`[DynamoDBAcademiesService] ✅ Academy "${academy.name}" has ${programs.length} programs:`, programs.map(p => p.name || p.id))
      } else {
        console.warn(`[DynamoDBAcademiesService] ⚠️ Academy "${academy.name}" has NO programs`)
      }
      
      return academy
    })
    
    console.log(`[DynamoDBAcademiesService] ✅ Fetched ${academies.length} academies for project ${projectId}`)
    
    // Log total programs count
    const totalPrograms = academies.reduce((sum, academy) => sum + (academy.programs?.length || 0), 0)
    console.log(`[DynamoDBAcademiesService] Total programs across all academies: ${totalPrograms}`)
    
    return academies
  } catch (error) {
    console.error(`[DynamoDBAcademiesService] ❌ Error fetching academies for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get a single academy by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} academyId - Academy ID
 * @returns {Promise<Object|null>} Academy object or null if not found
 */
export async function getAcademyById(projectId, academyId) {
  try {
    console.log(`[DynamoDBAcademiesService] Fetching academy: ${academyId} in project: ${projectId}`)
    
    if (!projectId || !academyId) {
      console.warn('[DynamoDBAcademiesService] Missing projectId or academyId')
      return null
    }
    
    const academy = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: academyId
    })
    
    if (academy) {
      // Convert to JavaScript format
      const converted = {
        id: academy.id,
        parentId: academy.parentId || projectId,
        name: academy.name || 'Unnamed Academy',
        description: academy.description || '',
        email: academy.email || '',
        phone: academy.phone || '',
        website: academy.website || '',
        updatedAt: academy.updatedAt || null,
        // Convert programs from DynamoDB format
        programs: convertProgramsFromDynamoDB(academy.programs || [])
      }
      
      console.log(`[DynamoDBAcademiesService] ✅ Found academy: ${converted.name}`)
      return converted
    }
    
    console.log(`[DynamoDBAcademiesService] ⚠️ Academy not found: ${academyId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBAcademiesService] ❌ Error fetching academy ${academyId}:`, error)
    throw error
  }
}

/**
 * Get all academies across all projects (use with caution - scans entire table)
 * @param {Object} options - Scan options
 * @param {number} options.limit - Maximum number of academies to return
 * @returns {Promise<Array>} Array of academy objects
 */
export async function getAllAcademies(options = {}) {
  try {
    console.log('[DynamoDBAcademiesService] Fetching all academies from DynamoDB...')
    
    const { scan } = await import('../aws/dynamodbClient')
    
    const scanOptions = {}
    if (options.limit) {
      scanOptions.Limit = options.limit
    }
    
    const items = await scan(TABLE_NAME, scanOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const academies = items.map(item => ({
      id: item.id,
      parentId: item.parentId,
      name: item.name || 'Unnamed Academy',
      description: item.description || '',
      email: item.email || '',
      phone: item.phone || '',
      website: item.website || '',
      updatedAt: item.updatedAt || null,
      // Convert programs from DynamoDB format
      programs: convertProgramsFromDynamoDB(item.programs || [])
    }))
    
    console.log(`[DynamoDBAcademiesService] ✅ Fetched ${academies.length} academies from DynamoDB`)
    
    return academies
  } catch (error) {
    console.error('[DynamoDBAcademiesService] ❌ Error fetching all academies:', error)
    throw error
  }
}

// Export default for convenience
export default {
  getAcademiesByProject,
  getAcademyById,
  getAllAcademies
}

