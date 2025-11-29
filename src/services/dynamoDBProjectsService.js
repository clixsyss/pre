/**
 * DynamoDB Projects Service
 * 
 * Handles all operations for the "projects" DynamoDB table.
 * This service replaces Firebase/Firestore calls for projects data.
 * 
 * IMPORTANT: UI components remain unchanged - only data source changes.
 */

import { scan, getItem } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects'

/**
 * Fetch all projects from DynamoDB
 * 
 * This function scans the "projects" table and returns data in the format
 * expected by the existing UI components.
 * 
 * @param {Object} options - Optional scan parameters
 * @param {number} options.limit - Maximum number of projects to return
 * @returns {Promise<Array>} Array of project objects matching UI format
 */
export async function fetchProjects(options = {}) {
  try {
    console.log('[DynamoDBProjectsService] Fetching projects from DynamoDB...')
    
    // Scan the projects table
    const scanOptions = {}
    if (options.limit) {
      scanOptions.Limit = options.limit
    }
    
    const items = await scan(TABLE_NAME, scanOptions)
    
    // Transform DynamoDB items to match UI format
    // UI expects: { id, name, description, location, status, type, ... }
    const projects = items.map(item => ({
      id: item.id || item.projectId || item._id,
      name: item.name || item.projectName || 'Unnamed Project',
      description: item.description || item.desc || '',
      location: item.location || '',
      status: item.status || 'active',
      type: item.type || 'residential',
      // Include all other fields as-is
      ...item
    }))
    
    console.log(`[DynamoDBProjectsService] ✅ Fetched ${projects.length} projects from DynamoDB`)
    
    return projects
  } catch (error) {
    console.error('[DynamoDBProjectsService] ❌ Error fetching projects:', error)
    throw error
  }
}

/**
 * Get a single project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise<Object|null>} Project object or null if not found
 */
export async function getProjectById(projectId) {
  try {
    console.log(`[DynamoDBProjectsService] Fetching project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBProjectsService] No projectId provided')
      return null
    }
    
    // Try different possible key structures
    let project = null
    let lastError = null
    
    // Try with 'id' as key (most common)
    try {
      console.log(`[DynamoDBProjectsService] Trying to get project with key: { id: "${projectId}" }`)
      project = await getItem(TABLE_NAME, { id: projectId })
      if (project) {
        console.log(`[DynamoDBProjectsService] ✅ Found project with 'id' key:`, project.name || projectId)
      }
    } catch (error) {
      lastError = error
      console.log(`[DynamoDBProjectsService] Project not found with 'id' key, trying 'projectId'...`)
      
      // Try with 'projectId' as key
      try {
        console.log(`[DynamoDBProjectsService] Trying to get project with key: { projectId: "${projectId}" }`)
        project = await getItem(TABLE_NAME, { projectId: projectId })
        if (project) {
          console.log(`[DynamoDBProjectsService] ✅ Found project with 'projectId' key:`, project.name || projectId)
        }
      } catch (err) {
        lastError = err
        console.warn(`[DynamoDBProjectsService] ⚠️ Project not found with 'id' or 'projectId' key: ${projectId}`)
        console.warn(`[DynamoDBProjectsService] Error details:`, err.message || err)
      }
    }
    
    if (project) {
      // Transform to match UI format
      const transformed = {
        id: project.id || project.projectId || projectId,
        name: project.name || project.projectName || 'Unnamed Project',
        description: project.description || project.desc || '',
        location: project.location || '',
        status: project.status || 'active',
        type: project.type || 'residential',
        ...project
      }
      console.log(`[DynamoDBProjectsService] ✅ Returning transformed project:`, transformed.name)
      return transformed
    }
    
    console.warn(`[DynamoDBProjectsService] ⚠️ Project ${projectId} not found in DynamoDB`)
    if (lastError) {
      console.error(`[DynamoDBProjectsService] Last error:`, lastError)
    }
    return null
  } catch (error) {
    console.error(`[DynamoDBProjectsService] ❌ Error fetching project ${projectId}:`, error)
    console.error(`[DynamoDBProjectsService] Error stack:`, error.stack)
    throw error
  }
}

// Export default for convenience
export default {
  fetchProjects,
  getProjectById
}
