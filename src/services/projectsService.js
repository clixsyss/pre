/**
 * Projects Service
 * Handles project data operations using DynamoDB
 * 
 * This service uses the centralized DynamoDB client from src/aws/dynamodbClient
 * which reads credentials from environment variables.
 */

import { getItem, scan, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects'

class ProjectsService {
  /**
   * Get a single project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object|null>} - Project object or null
   */
  async getProject(projectId) {
    try {
      console.log(`[ProjectsService] Fetching project: ${projectId}`)
      
      // Try different possible key structures
      let project = null
      
      // Try with 'id' as key
      try {
        project = await getItem(TABLE_NAME, { id: projectId })
      } catch {
        // Try with 'projectId' as key
        try {
          project = await getItem(TABLE_NAME, { projectId: projectId })
        } catch {
          console.warn(`[ProjectsService] Project not found with id or projectId: ${projectId}`)
        }
      }
      
      if (project) {
        console.log(`[ProjectsService] ✅ Found project: ${project.name || projectId}`)
      } else {
        console.log(`[ProjectsService] ⚠️ Project not found: ${projectId}`)
      }
      
      return project
    } catch (error) {
      console.error(`[ProjectsService] ❌ Error fetching project ${projectId}:`, error)
      throw error
    }
  }
  
  /**
   * Get multiple projects by IDs
   * @param {Array<string>} projectIds - Array of project IDs
   * @returns {Promise<Array>} - Array of project objects
   */
  async getProjectsByIds(projectIds) {
    try {
      console.log(`[ProjectsService] Fetching ${projectIds.length} projects`)
      
      // DynamoDB doesn't support batch get by default in the same way
      // We'll fetch them in parallel
      const projectPromises = projectIds.map(id => this.getProject(id))
      const projects = await Promise.all(projectPromises)
      
      // Filter out null results
      const validProjects = projects.filter(p => p !== null)
      
      console.log(`[ProjectsService] ✅ Fetched ${validProjects.length} projects`)
      return validProjects
    } catch (error) {
      console.error('[ProjectsService] ❌ Error fetching projects:', error)
      throw error
    }
  }
  
  /**
   * Get all available projects (scan - use with caution)
   * @param {Object} options - Options (limit, filter, etc.)
   * @returns {Promise<Array>} - Array of all projects
   */
  async getAllProjects(options = {}) {
    try {
      console.log('[ProjectsService] Fetching all projects')
      
      const scanOptions = {}
      
      // Add limit if specified
      if (options.limit) {
        scanOptions.Limit = options.limit
      }
      
      // Add filter expression if needed
      if (options.filter) {
        scanOptions.FilterExpression = options.filter.expression
        scanOptions.ExpressionAttributeNames = options.filter.attributeNames || {}
        scanOptions.ExpressionAttributeValues = options.filter.attributeValues || {}
      }
      
      const projects = await scan(TABLE_NAME, scanOptions)
      
      console.log(`[ProjectsService] ✅ Fetched ${projects.length} projects`)
      return projects
    } catch (error) {
      console.error('[ProjectsService] ❌ Error fetching all projects:', error)
      throw error
    }
  }
  
  /**
   * Query projects (more efficient than scan when you have partition key)
   * @param {Object} queryOptions - Query options
   * @returns {Promise<Array>} - Array of projects
   */
  async queryProjects(queryOptions = {}) {
    try {
      console.log('[ProjectsService] Querying projects')
      
      const queryParams = {
        ...queryOptions
      }
      
      const projects = await query(TABLE_NAME, queryParams)
      
      console.log(`[ProjectsService] ✅ Queried ${projects.length} projects`)
      return projects
    } catch (error) {
      console.error('[ProjectsService] ❌ Error querying projects:', error)
      throw error
    }
  }
}

// Export singleton instance
export default new ProjectsService()

