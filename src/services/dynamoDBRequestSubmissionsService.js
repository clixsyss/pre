/**
 * DynamoDB Request Submissions Service
 * 
 * Handles all operations for the "projects__requestSubmissions" DynamoDB table.
 * This service replaces Firebase/Firestore calls for request submissions data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Project ID
 * - Sort Key: id (String) - Submission ID
 * - Fields: categoryId, categoryName, userId, userName, userEmail, userPhone,
 *           formData (object), fieldMetadata (array), mediaFiles (array),
 *           status, createdAt, updatedAt, projectId
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__requestSubmissions'

/**
 * Unmarshall DynamoDB Map for formData object
 * @param {Object} dynamoFormData - DynamoDB Map format
 * @returns {Object} JavaScript object
 */
function unmarshallFormData(dynamoFormData) {
  if (!dynamoFormData || typeof dynamoFormData !== 'object') {
    return {}
  }
  
  // If already in JavaScript format, return as is
  if (!dynamoFormData.M) {
    return dynamoFormData
  }
  
  const formData = {}
  for (const key in dynamoFormData.M) {
    const valueWrapper = dynamoFormData.M[key]
    if (valueWrapper.S) formData[key] = valueWrapper.S
    else if (valueWrapper.N) formData[key] = Number(valueWrapper.N)
    else if (valueWrapper.BOOL !== undefined) formData[key] = valueWrapper.BOOL
    else if (valueWrapper.L) {
      formData[key] = valueWrapper.L.map(item => {
        if (item.S) return item.S
        if (item.N) return Number(item.N)
        if (item.BOOL !== undefined) return item.BOOL
        return item
      })
    }
    else if (valueWrapper.M) {
      formData[key] = unmarshallFormData(valueWrapper.M)
    }
  }
  
  return formData
}

/**
 * Unmarshall DynamoDB List for fieldMetadata array
 * @param {Array} dynamoFieldMetadata - DynamoDB List format
 * @returns {Array} JavaScript array of field metadata objects
 */
function unmarshallFieldMetadata(dynamoFieldMetadata) {
  if (!Array.isArray(dynamoFieldMetadata)) {
    return []
  }
  
  return dynamoFieldMetadata.map(field => {
    // If field is already in JavaScript format, return as is
    if (!field || typeof field !== 'object' || !field.M) {
      return field
    }
    
    // Convert DynamoDB Map to JavaScript object
    const convertedField = {}
    for (const key in field.M) {
      const valueWrapper = field.M[key]
      if (valueWrapper.S) convertedField[key] = valueWrapper.S
      else if (valueWrapper.N) convertedField[key] = Number(valueWrapper.N)
      else if (valueWrapper.BOOL !== undefined) convertedField[key] = valueWrapper.BOOL
      else if (valueWrapper.L) {
        convertedField[key] = valueWrapper.L.map(subItem => {
          if (subItem.S) return subItem.S
          if (subItem.N) return Number(subItem.N)
          if (subItem.BOOL !== undefined) return subItem.BOOL
          return subItem
        })
      }
    }
    return convertedField
  })
}

/**
 * Unmarshall DynamoDB List for mediaFiles array
 * @param {Array} dynamoMediaFiles - DynamoDB List format
 * @returns {Array} JavaScript array of media file objects
 */
function unmarshallMediaFiles(dynamoMediaFiles) {
  if (!Array.isArray(dynamoMediaFiles)) {
    return []
  }
  
  return dynamoMediaFiles.map(file => {
    // If file is already in JavaScript format, return as is
    if (!file || typeof file !== 'object' || !file.M) {
      return file
    }
    
    // Convert DynamoDB Map to JavaScript object
    const convertedFile = {}
    for (const key in file.M) {
      const valueWrapper = file.M[key]
      if (valueWrapper.S) convertedFile[key] = valueWrapper.S
      else if (valueWrapper.N) convertedFile[key] = Number(valueWrapper.N)
      else if (valueWrapper.BOOL !== undefined) convertedFile[key] = valueWrapper.BOOL
    }
    return convertedFile
  })
}

/**
 * Convert DynamoDB request submission item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertRequestSubmissionFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id,
    parentId: item.parentId,
    projectId: item.projectId || item.parentId,
    categoryId: item.categoryId || '',
    categoryName: item.categoryName || '',
    userId: item.userId || '',
    userName: item.userName || '',
    userEmail: item.userEmail || '',
    userPhone: item.userPhone || '',
    formData: unmarshallFormData(item.formData || {}),
    fieldMetadata: unmarshallFieldMetadata(item.fieldMetadata || []),
    mediaFiles: unmarshallMediaFiles(item.mediaFiles || []),
    status: item.status || 'pending',
    // createdAt and updatedAt are stored as numbers (timestamps) in DynamoDB for GSI compatibility
    // Convert to Date objects or ISO strings for UI display if needed
    createdAt: item.createdAt ? (typeof item.createdAt === 'number' ? item.createdAt : new Date(item.createdAt).getTime()) : null,
    updatedAt: item.updatedAt ? (typeof item.updatedAt === 'number' ? item.updatedAt : new Date(item.updatedAt).getTime()) : null
  }
}

/**
 * Get all request submissions for a specific project
 * @param {string} projectId - Project ID (parentId)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of submissions to return
 * @param {string} options.status - Filter by status (e.g., 'pending', 'processing', 'completed', 'rejected')
 * @param {string} options.userId - Filter by userId
 * @param {string} options.categoryId - Filter by categoryId
 * @returns {Promise<Array>} Array of submission objects
 */
export async function getRequestSubmissionsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBRequestSubmissionsService] Fetching request submissions for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBRequestSubmissionsService] No projectId provided')
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
    if (options.status) {
      filterParts.push('#status = :status')
      queryOptions.ExpressionAttributeNames = queryOptions.ExpressionAttributeNames || {}
      queryOptions.ExpressionAttributeNames['#status'] = 'status'
      queryOptions.ExpressionAttributeValues[':status'] = options.status
    }
    if (options.userId) {
      filterParts.push('userId = :userId')
      queryOptions.ExpressionAttributeValues[':userId'] = options.userId
    }
    if (options.categoryId) {
      filterParts.push('categoryId = :categoryId')
      queryOptions.ExpressionAttributeValues[':categoryId'] = options.categoryId
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const submissions = items.map(convertRequestSubmissionFromDynamoDB)
    
    // Sort by createdAt (descending - newest first)
    // createdAt is stored as a number (timestamp) in DynamoDB for GSI compatibility
    submissions.sort((a, b) => {
      const timeA = a.createdAt || 0
      const timeB = b.createdAt || 0
      // Handle both number (timestamp) and string (ISO) formats for backward compatibility
      const numA = typeof timeA === 'number' ? timeA : (timeA ? new Date(timeA).getTime() : 0)
      const numB = typeof timeB === 'number' ? timeB : (timeB ? new Date(timeB).getTime() : 0)
      return numB - numA // Descending order (newest first)
    })
    
    console.log(`[DynamoDBRequestSubmissionsService] ✅ Fetched ${submissions.length} request submissions for project ${projectId}`)
    
    return submissions
  } catch (error) {
    console.error(`[DynamoDBRequestSubmissionsService] ❌ Error fetching request submissions for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get request submissions for a specific user within a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of submission objects
 */
export async function getUserSubmissions(projectId, userId, options = {}) {
  try {
    return await getRequestSubmissionsByProject(projectId, {
      ...options,
      userId
    })
  } catch (error) {
    console.error(`[DynamoDBRequestSubmissionsService] ❌ Error fetching user submissions:`, error)
    throw error
  }
}

/**
 * Get request submissions for a specific category
 * @param {string} projectId - Project ID
 * @param {string} categoryId - Category ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of submission objects
 */
export async function getCategorySubmissions(projectId, categoryId, options = {}) {
  try {
    return await getRequestSubmissionsByProject(projectId, {
      ...options,
      categoryId
    })
  } catch (error) {
    console.error(`[DynamoDBRequestSubmissionsService] ❌ Error fetching category submissions:`, error)
    throw error
  }
}

/**
 * Get request submissions by status
 * @param {string} projectId - Project ID
 * @param {string} status - Submission status (e.g., 'pending', 'processing', 'completed', 'rejected')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of submission objects
 */
export async function getSubmissionsByStatus(projectId, status, options = {}) {
  try {
    return await getRequestSubmissionsByProject(projectId, {
      ...options,
      status
    })
  } catch (error) {
    console.error(`[DynamoDBRequestSubmissionsService] ❌ Error fetching submissions by status:`, error)
    throw error
  }
}

/**
 * Get a single request submission by ID
 * @param {string} projectId - Project ID (parentId)
 * @param {string} submissionId - Submission ID
 * @returns {Promise<Object|null>} Submission object or null if not found
 */
export async function getRequestSubmissionById(projectId, submissionId) {
  try {
    console.log(`[DynamoDBRequestSubmissionsService] Fetching request submission: ${submissionId} in project: ${projectId}`)
    
    if (!projectId || !submissionId) {
      console.warn('[DynamoDBRequestSubmissionsService] Missing projectId or submissionId')
      return null
    }
    
    const submission = await getItem(TABLE_NAME, {
      parentId: projectId,
      id: submissionId
    })
    
    if (submission) {
      return convertRequestSubmissionFromDynamoDB(submission)
    }
    
    console.log(`[DynamoDBRequestSubmissionsService] ⚠️ Request submission not found: ${submissionId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBRequestSubmissionsService] ❌ Error fetching request submission ${submissionId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getRequestSubmissionsByProject,
  getUserSubmissions,
  getCategorySubmissions,
  getSubmissionsByStatus,
  getRequestSubmissionById
}

