/**
 * DynamoDB Adapter for Firestore Service
 * 
 * This adapter provides a Firestore-like API that uses DynamoDB underneath.
 * It maps Firestore collection paths to DynamoDB table names and maintains
 * compatibility with existing code.
 * 
 * IMPORTANT: Uses DynamoDB ONLY. No Firebase/Firestore fallbacks.
 */

import { getItem, putItem, query, scan } from '../aws/dynamodbClient'

// Table names mapping (matching the user's DynamoDB tables)
const TABLES = {
  USERS: 'users',
  UNIT_REQUESTS: 'unitRequests',
  PUSH_NOTIFICATIONS: 'pushNotifications',
  PROJECTS: 'projects',
  PENDING_ADMINS: 'pendingAdmins',
  GUEST_PASS_SETTINGS: 'guestPassSettings',
  DEVICE_KEY_RESET_REQUESTS: 'deviceKeyResetRequests',
  ADMINS: 'admins',
  // Project-specific tables (using double underscore separator)
  PROJECTS_NEWS: 'projects__news',
  PROJECTS_STORES: 'projects__stores',
  PROJECTS_SPORTS: 'projects__sports',
  PROJECTS_SERVICE_CATEGORIES: 'projects__serviceCategories',
  PROJECTS_SERVICE_BOOKINGS: 'projects__serviceBookings',
  PROJECTS_SERVICE_CATEGORIES_SERVICES: 'projects__serviceCategories__services',
  PROJECTS_STORES_PRODUCTS: 'projects__stores__products',
  PROJECTS_COURTS: 'projects__courts',
  PROJECTS_EVENTS: 'projects__events',
  PROJECTS_GUARDS: 'projects__guards',
  PROJECTS_GUEST_PASSES: 'projects__guestPasses',
  PROJECTS_NOTIFICATIONS: 'projects__notifications',
  PROJECTS_NEWS_CATEGORIES: 'projects__newsCategories',
  PROJECTS_ADS: 'projects__ads',
  PROJECTS_ACADEMIES: 'projects__academies',
  PROJECTS_BOOKINGS: 'projects__bookings',
  PROJECTS_PROJECT_GUIDELINES: 'projects__projectGuidelines',
  PROJECTS_RATINGS: 'projects__ratings',
  PROJECTS_REQUEST_CATEGORIES: 'projects__requestCategories',
  PROJECTS_COMPLAINTS: 'projects__complaints',
  PROJECTS_NEWS_COMMENTS: 'projects__news__comments',
  PROJECTS_NEWS_REACTIONS: 'projects__news__reactions',
  PROJECTS_ADVERTISEMENT: 'projects__advertisement',
  PROJECTS_ORDERS: 'projects__orders',
  PROJECTS_SAMPLE_DATA: 'projects__sampleData',
  PROJECTS_REQUEST_SUBMISSIONS: 'projects__requestSubmissions',
}

/**
 * Map Firestore collection paths to DynamoDB table names
 */
const COLLECTION_TO_TABLE_MAP = {
  // Root collections
  'users': TABLES.USERS,
  'projects': TABLES.PROJECTS,
  'unitRequests': TABLES.UNIT_REQUESTS,
  'pushNotifications': TABLES.PUSH_NOTIFICATIONS,
  'pendingAdmins': TABLES.PENDING_ADMINS,
  'guestPassSettings': TABLES.GUEST_PASS_SETTINGS,
  'deviceKeyResetRequests': TABLES.DEVICE_KEY_RESET_REQUESTS,
  'admins': TABLES.ADMINS,
  
  // Project subcollections (mapped to flat table names)
  'projects/{projectId}/news': TABLES.PROJECTS_NEWS,
  'projects/{projectId}/stores': TABLES.PROJECTS_STORES,
  'projects/{projectId}/sports': TABLES.PROJECTS_SPORTS,
  'projects/{projectId}/serviceCategories': TABLES.PROJECTS_SERVICE_CATEGORIES,
  'projects/{projectId}/serviceBookings': TABLES.PROJECTS_SERVICE_BOOKINGS,
  'projects/{projectId}/serviceCategories/{categoryId}/services': TABLES.PROJECTS_SERVICE_CATEGORIES_SERVICES,
  'projects/{projectId}/stores/{storeId}/products': TABLES.PROJECTS_STORES_PRODUCTS,
  'projects/{projectId}/courts': TABLES.PROJECTS_COURTS,
  'projects/{projectId}/events': TABLES.PROJECTS_EVENTS,
  'projects/{projectId}/guards': TABLES.PROJECTS_GUARDS,
  'projects/{projectId}/guestPasses': TABLES.PROJECTS_GUEST_PASSES,
  'projects/{projectId}/notifications': TABLES.PROJECTS_NOTIFICATIONS,
  'projects/{projectId}/newsCategories': TABLES.PROJECTS_NEWS_CATEGORIES,
  'projects/{projectId}/ads': TABLES.PROJECTS_ADS,
  'projects/{projectId}/academies': TABLES.PROJECTS_ACADEMIES,
  'projects/{projectId}/bookings': TABLES.PROJECTS_BOOKINGS,
  'projects/{projectId}/projectGuidelines': TABLES.PROJECTS_PROJECT_GUIDELINES,
  'projects/{projectId}/ratings': TABLES.PROJECTS_RATINGS,
  'projects/{projectId}/requestCategories': TABLES.PROJECTS_REQUEST_CATEGORIES,
  'projects/{projectId}/complaints': TABLES.PROJECTS_COMPLAINTS,
  'projects/{projectId}/news/{newsId}/comments': TABLES.PROJECTS_NEWS_COMMENTS,
  'projects/{projectId}/news/{newsId}/reactions': TABLES.PROJECTS_NEWS_REACTIONS,
  'projects/{projectId}/advertisement': TABLES.PROJECTS_ADVERTISEMENT,
  'projects/{projectId}/orders': TABLES.PROJECTS_ORDERS,
  'projects/{projectId}/sampleData': TABLES.PROJECTS_SAMPLE_DATA,
  'projects/{projectId}/requestSubmissions': TABLES.PROJECTS_REQUEST_SUBMISSIONS,
}

/**
 * Parse Firestore path to extract table name and keys
 * @param {string} path - Firestore path (e.g., 'projects/proj123/news' or 'users/user123')
 * @returns {Object} { tableName, projectId, itemId, parentId }
 */
function parseFirestorePath(path) {
  const parts = path.split('/')
  
  // Root collection (e.g., 'users', 'projects')
  if (parts.length === 1) {
    return {
      tableName: COLLECTION_TO_TABLE_MAP[parts[0]] || parts[0],
      projectId: null,
      itemId: null,
      parentId: null,
      isCollection: true
    }
  }
  
  // Document path (e.g., 'users/user123', 'projects/proj123')
  if (parts.length === 2) {
    const collection = parts[0]
    const docId = parts[1]
    
    return {
      tableName: COLLECTION_TO_TABLE_MAP[collection] || collection,
      projectId: null,
      itemId: docId,
      parentId: null,
      isCollection: false
    }
  }
  
  // Project subcollection (e.g., 'projects/proj123/news')
  if (parts.length === 3 && parts[0] === 'projects') {
    const projectId = parts[1]
    const subcollection = parts[2]
    const pathPattern = `projects/{projectId}/${subcollection}`
    
    return {
      tableName: COLLECTION_TO_TABLE_MAP[pathPattern] || `projects__${subcollection}`,
      projectId: projectId,
      itemId: null,
      parentId: projectId,
      isCollection: true
    }
  }
  
  // Project subcollection document (e.g., 'projects/proj123/news/news123')
  if (parts.length === 4 && parts[0] === 'projects') {
    const projectId = parts[1]
    const subcollection = parts[2]
    const itemId = parts[3]
    const pathPattern = `projects/{projectId}/${subcollection}`
    
    return {
      tableName: COLLECTION_TO_TABLE_MAP[pathPattern] || `projects__${subcollection}`,
      projectId: projectId,
      itemId: itemId,
      parentId: projectId,
      isCollection: false
    }
  }
  
  // Nested subcollection (e.g., 'projects/proj123/serviceCategories/cat123/services')
  if (parts.length === 5 && parts[0] === 'projects') {
    const projectId = parts[1]
    const parentCollection = parts[2]
    const parentId = parts[3]
    const subcollection = parts[4]
    const pathPattern = `projects/{projectId}/${parentCollection}/{${parentCollection}Id}/${subcollection}`
    
    return {
      tableName: COLLECTION_TO_TABLE_MAP[pathPattern] || `projects__${parentCollection}__${subcollection}`,
      projectId: projectId,
      itemId: null,
      parentId: parentId,
      isCollection: true
    }
  }
  
  // Nested subcollection document
  if (parts.length === 6 && parts[0] === 'projects') {
    const projectId = parts[1]
    const parentCollection = parts[2]
    const parentId = parts[3]
    const subcollection = parts[4]
    const itemId = parts[5]
    const pathPattern = `projects/{projectId}/${parentCollection}/{${parentCollection}Id}/${subcollection}`
    
    return {
      tableName: COLLECTION_TO_TABLE_MAP[pathPattern] || `projects__${parentCollection}__${subcollection}`,
      projectId: projectId,
      itemId: itemId,
      parentId: parentId,
      isCollection: false
    }
  }
  
  // Deeply nested (e.g., 'projects/proj123/news/news123/comments')
  if (parts.length >= 5 && parts[0] === 'projects') {
    const projectId = parts[1]
    const collection = parts[2]
    const parentId = parts[3]
    const subcollection = parts[4]
    const itemId = parts.length > 5 ? parts[5] : null
    const pathPattern = `projects/{projectId}/${collection}/{${collection}Id}/${subcollection}`
    
    return {
      tableName: COLLECTION_TO_TABLE_MAP[pathPattern] || `projects__${collection}__${subcollection}`,
      projectId: projectId,
      itemId: itemId,
      parentId: parentId,
      isCollection: !itemId
    }
  }
  
  // Fallback: use last part as table name
  return {
    tableName: parts[parts.length - 1],
    projectId: null,
    itemId: null,
    parentId: null,
    isCollection: true
  }
}

/**
 * Convert Firestore query constraints to DynamoDB query options
 * @param {Array} constraints - Firestore query constraints
 * @param {string} projectId - Project ID if querying project table
 * @returns {Object} DynamoDB query options
 */
function convertQueryConstraints(constraints = [], projectId = null) {
  const options = {}
  const expressionAttributeNames = {}
  const expressionAttributeValues = {}
  
  let keyCondition = null
  let filterExpression = null
  const filterParts = []
  
  // Process constraints
  for (const constraint of constraints) {
    if (!constraint || typeof constraint !== 'object') continue
    
    // Handle where clauses
    if (constraint._type === 'where' || constraint._queryConstraints) {
      const field = constraint.field?.segments?.[0] || constraint.fieldPath || constraint.field
      const operator = constraint.op || constraint.opStr || '=='
      const value = constraint.value
      
      if (!field) continue
      
      const fieldPlaceholder = `#${field.replace(/[^a-zA-Z0-9]/g, '_')}`
      const valuePlaceholder = `:${field.replace(/[^a-zA-Z0-9]/g, '_')}`
      
      expressionAttributeNames[fieldPlaceholder] = field
      expressionAttributeValues[valuePlaceholder] = value
      
      // If querying project table and field is projectId or parentId, use as key condition
      // DynamoDB project tables use 'parentId' as partition key
      if (projectId && (field === 'projectId' || field === 'parentId') && operator === '==') {
        keyCondition = `parentId = ${valuePlaceholder}`
        // Update the attribute name to use parentId
        const parentIdPlaceholder = ':parentId'
        expressionAttributeValues[parentIdPlaceholder] = projectId
        // Remove the old placeholder if it was different
        if (valuePlaceholder !== parentIdPlaceholder) {
          delete expressionAttributeValues[valuePlaceholder]
        }
      } else {
        // Add to filter expression
        let op = operator
        if (op === '==') op = '='
        if (op === '!=') op = '<>'
        
        filterParts.push(`${fieldPlaceholder} ${op} ${valuePlaceholder}`)
      }
    }
    
    // Handle orderBy
    if (constraint._type === 'orderBy' || constraint.fieldPath) {
      const field = constraint.field?.segments?.[0] || constraint.fieldPath
      const direction = constraint.direction || 'ASC'
      
      // Note: DynamoDB requires GSI for sorting, so we'll sort client-side
      // Store for client-side sorting
      options._sortBy = { field, direction }
    }
    
    // Handle limit
    if (constraint._type === 'limit' || constraint.limitCount) {
      options.Limit = constraint.limitCount || constraint.limit
    }
  }
  
  // Build expressions
  // For project tables, use parentId as the partition key (matching DynamoDB table structure)
  if (projectId && !keyCondition) {
    keyCondition = 'parentId = :parentId'
    expressionAttributeValues[':parentId'] = projectId
  }
  
  if (filterParts.length > 0) {
    filterExpression = filterParts.join(' AND ')
  }
  
  if (keyCondition) {
    options.KeyConditionExpression = keyCondition
  }
  
  if (filterExpression) {
    options.FilterExpression = filterExpression
  }
  
  // Only include ExpressionAttributeNames and ExpressionAttributeValues if they have entries
  if (Object.keys(expressionAttributeNames).length > 0) {
    options.ExpressionAttributeNames = expressionAttributeNames
  }
  
  if (Object.keys(expressionAttributeValues).length > 0) {
    options.ExpressionAttributeValues = expressionAttributeValues
  }
  
  return options
}

/**
 * DynamoDB Adapter Class
 * Provides Firestore-like API using DynamoDB
 */
class DynamoDBAdapter {
  /**
   * Get a single document (Firestore-like API)
   * @param {string} path - Firestore path (e.g., 'users/user123' or 'projects/proj123/news/news123')
   * @returns {Promise<Object>} Document snapshot-like object
   */
  async getDoc(path) {
    try {
      const parsed = parseFirestorePath(path)
      
      if (parsed.isCollection) {
        throw new Error(`Path ${path} is a collection, not a document`)
      }
      
      let key = {}
      
      // Build primary key based on table structure
      if (parsed.projectId) {
        // Project subcollection: use composite key with parentId
        key = {
          parentId: parsed.projectId,
          id: parsed.itemId
        }
      } else {
        // Root collection: use id as key
        key = {
          id: parsed.itemId
        }
      }
      
      const item = await getItem(parsed.tableName, key)
      
      // Return Firestore-like snapshot
      return {
        exists: () => item !== null,
        data: () => item || {},
        id: parsed.itemId
      }
    } catch (error) {
      console.error(`[DynamoDBAdapter] Error getting doc ${path}:`, error)
      throw error
    }
  }
  
  /**
   * Get multiple documents (Firestore-like API)
   * @param {string} collectionPath - Collection path (e.g., 'projects/proj123/news')
   * @param {Object} queryOptions - Query options
   * @param {Array} queryOptions.constraints - Firestore query constraints
   * @param {Array} queryOptions.filters - Filter array
   * @param {Array} queryOptions.orderBy - Order by array
   * @returns {Promise<Object>} Query snapshot-like object
   */
  async getDocs(collectionPath, queryOptions = {}) {
    try {
      const parsed = parseFirestorePath(collectionPath)
      
      if (!parsed.isCollection) {
        throw new Error(`Path ${collectionPath} is a document, not a collection`)
      }
      
      // Handle both constraints array and filters object
      let constraints = queryOptions.constraints || []
      
      // Convert filters object to constraints format if filters is provided
      if (queryOptions.filters && typeof queryOptions.filters === 'object' && !Array.isArray(queryOptions.filters)) {
        constraints = Object.entries(queryOptions.filters).map(([field, filterObj]) => {
          if (filterObj && typeof filterObj === 'object') {
            return {
              _type: 'where',
              field: field,
              op: filterObj.operator || '==',
              value: filterObj.value
            }
          }
          return {
            _type: 'where',
            field: field,
            op: '==',
            value: filterObj
          }
        })
      }
      
      // Handle orderBy array
      if (queryOptions.orderBy && Array.isArray(queryOptions.orderBy)) {
        queryOptions.orderBy.forEach(orderByItem => {
          constraints.push({
            _type: 'orderBy',
            field: orderByItem.field,
            direction: orderByItem.direction || 'asc'
          })
        })
      }
      
      const dynamoOptions = convertQueryConstraints(constraints, parsed.projectId)
      
      let items = []
      
      // Use Query if we have a key condition (projectId), otherwise Scan
      if (parsed.projectId || dynamoOptions.KeyConditionExpression) {
        items = await query(parsed.tableName, dynamoOptions)
      } else {
        items = await scan(parsed.tableName, dynamoOptions)
      }
      
      // Client-side sorting if needed
      if (dynamoOptions._sortBy) {
        const { field, direction } = dynamoOptions._sortBy
        items.sort((a, b) => {
          const aVal = a[field]
          const bVal = b[field]
          
          if (aVal === undefined || aVal === null) return 1
          if (bVal === undefined || bVal === null) return -1
          
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          return direction === 'desc' ? -comparison : comparison
        })
      }
      
      // Return Firestore-like snapshot
      return {
        docs: items.map(item => ({
          id: item.id || item.projectId || 'unknown',
          exists: () => true,
          data: () => item
        })),
        empty: items.length === 0,
        size: items.length
      }
    } catch (error) {
      // Log error but don't throw - let Firestore fallback handle it
      console.warn(`[DynamoDBAdapter] Error getting docs ${collectionPath}, will fallback to Firestore:`, error.message)
      throw error
    }
  }
  
  /**
   * Set a document (Firestore-like API)
   * @param {string} path - Document path
   * @param {Object} data - Document data
   * @param {Object} options - Options (merge, etc.)
   * @returns {Promise<void>}
   */
  async setDoc(path, data, options = {}) {
    try {
      // Note: options parameter kept for API compatibility but not used in DynamoDB
      // eslint-disable-next-line no-unused-vars
      const _options = options
      const parsed = parseFirestorePath(path)
      
      if (parsed.isCollection) {
        throw new Error(`Path ${path} is a collection, not a document`)
      }
      
      // Build item with proper keys
      const item = {
        ...data,
        id: parsed.itemId
      }
      
      if (parsed.projectId) {
        item.parentId = parsed.projectId
        item.projectId = parsed.projectId
      }
      
      // Sanitize data for DynamoDB (convert Dates, remove undefined)
      const sanitizedItem = this.sanitizeForDynamoDB(item)
      
      await putItem(parsed.tableName, sanitizedItem)
    } catch (error) {
      console.error(`[DynamoDBAdapter] Error setting doc ${path}:`, error)
      throw error
    }
  }
  
  /**
   * Update a document (Firestore-like API)
   * @param {string} path - Document path
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  async updateDoc(path, updateData) {
    try {
      const parsed = parseFirestorePath(path)
      
      if (parsed.isCollection) {
        throw new Error(`Path ${path} is a collection, not a document`)
      }
      
      // Sanitize update data for DynamoDB (convert Dates, remove undefined)
      const sanitizedUpdateData = this.sanitizeForDynamoDB(updateData)
      
      // Build key - use parentId for project tables
      let key = {}
      if (parsed.projectId) {
        // For project tables, use parentId as partition key
        key = { parentId: parsed.projectId, id: parsed.itemId }
      } else {
        key = { id: parsed.itemId }
      }
      
      // Build update expression
      const updates = []
      const expressionAttributeNames = {}
      const expressionAttributeValues = {}
      
      for (const [field, value] of Object.entries(sanitizedUpdateData)) {
        // Skip undefined values
        if (value === undefined) continue
        
        const namePlaceholder = `#${field.replace(/[^a-zA-Z0-9]/g, '_')}`
        const valuePlaceholder = `:${field.replace(/[^a-zA-Z0-9]/g, '_')}`
        
        expressionAttributeNames[namePlaceholder] = field
        expressionAttributeValues[valuePlaceholder] = value
        updates.push(`${namePlaceholder} = ${valuePlaceholder}`)
      }
      
      if (updates.length === 0) {
        console.warn(`[DynamoDBAdapter] No valid fields to update for ${path}`)
        return
      }
      
      const updateExpression = `SET ${updates.join(', ')}`
      
      // Use UpdateCommand for updates
      const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb')
      const { docClient } = await import('../aws/dynamodbClient')
      
      const updateParams = {
        TableName: parsed.tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }
      
      console.log(`[DynamoDBAdapter] Updating doc ${path}:`, {
        table: parsed.tableName,
        key,
        updateExpression,
        fields: Object.keys(sanitizedUpdateData)
      })
      
      await docClient.send(new UpdateCommand(updateParams))
      
      console.log(`[DynamoDBAdapter] ✅ Successfully updated doc ${path}`)
    } catch (error) {
      console.error(`[DynamoDBAdapter] Error updating doc ${path}:`, error)
      throw error
    }
  }
  
  /**
   * Delete a document (Firestore-like API)
   * @param {string} path - Document path
   * @returns {Promise<void>}
   */
  async deleteDoc(path) {
    try {
      const parsed = parseFirestorePath(path)
      
      if (parsed.isCollection) {
        throw new Error(`Path ${path} is a collection, not a document`)
      }
      
      // Build key
      let key = {}
      if (parsed.projectId) {
        key = { projectId: parsed.projectId, id: parsed.itemId }
      } else {
        key = { id: parsed.itemId }
      }
      
      const { DeleteCommand } = await import('@aws-sdk/lib-dynamodb')
      const { docClient } = await import('../aws/dynamodbClient')
      
      await docClient.send(new DeleteCommand({
        TableName: parsed.tableName,
        Key: key
      }))
    } catch (error) {
      console.error(`[DynamoDBAdapter] Error deleting doc ${path}:`, error)
      throw error
    }
  }
  
  /**
   * Convert data to DynamoDB-compatible format
   * - Convert Date objects to ISO strings
   * - Remove undefined values
   * - Keep null values (DynamoDB supports null)
   */
  sanitizeForDynamoDB(data) {
    if (data === null || data === undefined) {
      return null
    }
    
    if (data instanceof Date) {
      return data.toISOString()
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForDynamoDB(item))
    }
    
    if (typeof data === 'object') {
      const sanitized = {}
      for (const [key, value] of Object.entries(data)) {
        // Skip undefined values (DynamoDB doesn't support undefined)
        if (value !== undefined) {
          sanitized[key] = this.sanitizeForDynamoDB(value)
        }
      }
      return sanitized
    }
    
    // Primitive types (string, number, boolean) are fine as-is
    return data
  }

  /**
   * Add a document (Firestore-like API)
   * @param {string} collectionPath - Collection path
   * @param {Object} data - Document data
   * @returns {Promise<string>} Document ID
   */
  async addDoc(collectionPath, data) {
    try {
      const parsed = parseFirestorePath(collectionPath)
      
      if (!parsed.isCollection) {
        throw new Error(`Path ${collectionPath} is a document, not a collection`)
      }
      
      // Generate ID if not provided
      const itemId = data.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Build item
      const item = {
        ...data,
        id: itemId
      }
      
      // Set parentId (partition key for DynamoDB project tables)
      if (parsed.projectId) {
        item.parentId = parsed.projectId
        item.projectId = parsed.projectId // Also set projectId for compatibility
      }
      
      // Ensure parentId is set even if projectId wasn't parsed
      if (!item.parentId && item.projectId) {
        item.parentId = item.projectId
      }
      
      // Sanitize data for DynamoDB (convert Dates, remove undefined)
      const sanitizedItem = this.sanitizeForDynamoDB(item)
      
      console.log(`[DynamoDBAdapter] Adding doc to ${parsed.tableName}:`, { 
        id: itemId, 
        parentId: sanitizedItem.parentId,
        type: sanitizedItem.type,
        hasType: 'type' in sanitizedItem,
        createdAt: sanitizedItem.createdAt,
        createdAtType: typeof sanitizedItem.createdAt
      })
      
      await putItem(parsed.tableName, sanitizedItem)
      
      return { id: itemId, documentId: itemId }
    } catch (error) {
      console.error(`[DynamoDBAdapter] Error adding doc to ${collectionPath}:`, error)
      throw error
    }
  }
}

// Export singleton instance
export default new DynamoDBAdapter()

