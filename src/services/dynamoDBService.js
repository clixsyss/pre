/**
 * Comprehensive DynamoDB Service
 * 
 * Handles all DynamoDB interactions for all tables in the application.
 * Uses environment variables for AWS credentials (NO Firebase/Firestore).
 * 
 * IMPORTANT: This service uses DynamoDB ONLY. No Firebase fallbacks.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, GetCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb'

// Configuration from environment variables
// Supports both Node.js (process.env) and Vite/browser (import.meta.env)
const REGION = 
  process.env.AWS_REGION || 
  process.env.VITE_AWS_REGION || 
  import.meta.env.AWS_REGION || 
  import.meta.env.VITE_AWS_REGION || 
  'us-east-1'

const AWS_ACCESS_KEY_ID = 
  process.env.AWS_ACCESS_KEY_ID || 
  process.env.VITE_AWS_ACCESS_KEY_ID || 
  import.meta.env.AWS_ACCESS_KEY_ID || 
  import.meta.env.VITE_AWS_ACCESS_KEY_ID

const AWS_SECRET_ACCESS_KEY = 
  process.env.AWS_SECRET_ACCESS_KEY || 
  process.env.VITE_AWS_SECRET_ACCESS_KEY || 
  import.meta.env.AWS_SECRET_ACCESS_KEY || 
  import.meta.env.VITE_AWS_SECRET_ACCESS_KEY

// Table names mapping
export const TABLES = {
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

// DynamoDB client instances (singleton pattern)
let dynamoDBClient = null
let dynamoDBDocClient = null

/**
 * Initialize DynamoDB client with authenticated credentials
 * @returns {Promise<Object>} DynamoDB client instances
 */
function initializeDynamoDBClient() {
  // Return existing clients if already initialized
  if (dynamoDBClient && dynamoDBDocClient) {
    return { client: dynamoDBClient, docClient: dynamoDBDocClient }
  }
  
  // Validate credentials are available
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    const error = new Error('[DynamoDBService] AWS credentials not found in environment variables. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.')
    console.error(error.message)
    throw error
  }
  
  // Create DynamoDB client with credentials from environment variables
  const clientConfig = {
    region: REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
  }
  
  dynamoDBClient = new DynamoDBClient(clientConfig)
  
  // Create DynamoDB Document Client for easier data handling
  dynamoDBDocClient = DynamoDBDocumentClient.from(dynamoDBClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: false
    },
    unmarshallOptions: {
      wrapNumbers: false
    }
  })
  
  console.log('[DynamoDBService] ✅ DynamoDB client initialized with environment variables', {
    region: REGION,
    hasCredentials: !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY)
  })
  
  return { client: dynamoDBClient, docClient: dynamoDBDocClient }
}

/**
 * DynamoDB Service Class
 * Provides all CRUD operations for DynamoDB tables
 */
class DynamoDBService {
  constructor() {
    this.initialized = false
  }
  
  /**
   * Ensure DynamoDB is initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await initializeDynamoDBClient()
      this.initialized = true
    }
    return dynamoDBDocClient
  }
  
  /**
   * Get a single item by primary key
   * @param {string} tableName - Table name
   * @param {Object} key - Primary key object (e.g., { id: 'item-123' })
   * @returns {Promise<Object|null>} - Item or null if not found
   */
  async getItem(tableName, key) {
    try {
      const docClient = await this.ensureInitialized()
      
      const command = new GetCommand({
        TableName: tableName,
        Key: key
      })
      
      const response = await docClient.send(command)
      return response.Item || null
    } catch (error) {
      console.error(`[DynamoDBService] Error getting item from ${tableName}:`, error)
      throw error
    }
  }
  
  /**
   * Scan entire table
   * @param {string} tableName - Table name
   * @param {Object} options - Scan options
   * @param {number} options.limit - Maximum items to return
   * @param {string} options.filterExpression - Filter expression
   * @param {Object} options.expressionAttributeNames - Attribute names
   * @param {Object} options.expressionAttributeValues - Attribute values
   * @param {string} options.exclusiveStartKey - Pagination token
   * @returns {Promise<Object>} - { Items: [], Count: number, LastEvaluatedKey?: string }
   */
  async scan(tableName, options = {}) {
    try {
      const docClient = await this.ensureInitialized()
      
      const scanParams = {
        TableName: tableName,
        ...options
      }
      
      const command = new ScanCommand(scanParams)
      const response = await docClient.send(command)
      
      return {
        Items: response.Items || [],
        Count: response.Count || 0,
        ScannedCount: response.ScannedCount || 0,
        LastEvaluatedKey: response.LastEvaluatedKey
      }
    } catch (error) {
      console.error(`[DynamoDBService] Error scanning ${tableName}:`, error)
      throw error
    }
  }
  
  /**
   * Query table with partition key (and optional sort key)
   * @param {string} tableName - Table name
   * @param {Object} options - Query options
   * @param {string} options.keyConditionExpression - Key condition (e.g., "projectId = :projectId")
   * @param {string} options.filterExpression - Filter expression
   * @param {Object} options.expressionAttributeNames - Attribute names
   * @param {Object} options.expressionAttributeValues - Attribute values
   * @param {number} options.limit - Maximum items to return
   * @param {string} options.indexName - GSI name if querying on index
   * @param {string} options.exclusiveStartKey - Pagination token
   * @returns {Promise<Object>} - { Items: [], Count: number, LastEvaluatedKey?: string }
   */
  async query(tableName, options = {}) {
    try {
      const docClient = await this.ensureInitialized()
      
      const queryParams = {
        TableName: tableName,
        ...options
      }
      
      const command = new QueryCommand(queryParams)
      const response = await docClient.send(command)
      
      return {
        Items: response.Items || [],
        Count: response.Count || 0,
        LastEvaluatedKey: response.LastEvaluatedKey
      }
    } catch (error) {
      console.error(`[DynamoDBService] Error querying ${tableName}:`, error)
      throw error
    }
  }
  
  /**
   * Put (create or replace) an item
   * @param {string} tableName - Table name
   * @param {Object} item - Item to put
   * @returns {Promise<void>}
   */
  async putItem(tableName, item) {
    try {
      const docClient = await this.ensureInitialized()
      
      const command = new PutCommand({
        TableName: tableName,
        Item: item
      })
      
      await docClient.send(command)
    } catch (error) {
      console.error(`[DynamoDBService] Error putting item to ${tableName}:`, error)
      throw error
    }
  }
  
  /**
   * Update an item
   * @param {string} tableName - Table name
   * @param {Object} key - Primary key
   * @param {string} updateExpression - Update expression (e.g., 'SET #name = :name')
   * @param {Object} expressionAttributeNames - Expression attribute names
   * @param {Object} expressionAttributeValues - Expression attribute values
   * @returns {Promise<Object>} - Updated item attributes
   */
  async updateItem(tableName, key, updateExpression, expressionAttributeNames = {}, expressionAttributeValues = {}) {
    try {
      const docClient = await this.ensureInitialized()
      
      const command = new UpdateCommand({
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      })
      
      const response = await docClient.send(command)
      return response.Attributes || {}
    } catch (error) {
      console.error(`[DynamoDBService] Error updating item in ${tableName}:`, error)
      throw error
    }
  }
  
  /**
   * Delete an item
   * @param {string} tableName - Table name
   * @param {Object} key - Primary key
   * @returns {Promise<void>}
   */
  async deleteItem(tableName, key) {
    try {
      const docClient = await this.ensureInitialized()
      
      const command = new DeleteCommand({
        TableName: tableName,
        Key: key
      })
      
      await docClient.send(command)
    } catch (error) {
      console.error(`[DynamoDBService] Error deleting item from ${tableName}:`, error)
      throw error
    }
  }
  
  /**
   * Helper: Query project-specific table by projectId
   * @param {string} tableName - Project table name (e.g., 'projects__news')
   * @param {string} projectId - Project ID
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} - Array of items
   */
  async queryByProjectId(tableName, projectId, options = {}) {
    try {
      // Most project tables use projectId as partition key
      const queryOptions = {
        KeyConditionExpression: 'projectId = :projectId',
        ExpressionAttributeValues: {
          ':projectId': projectId
        },
        ...options
      }
      
      const result = await this.query(tableName, queryOptions)
      return result.Items
    } catch (error) {
      console.error(`[DynamoDBService] Error querying ${tableName} by projectId:`, error)
      throw error
    }
  }
  
  /**
   * Helper: Get item from project-specific table
   * @param {string} tableName - Project table name
   * @param {string} projectId - Project ID
   * @param {string} itemId - Item ID
   * @returns {Promise<Object|null>} - Item or null
   */
  async getProjectItem(tableName, projectId, itemId) {
    try {
      // Most project tables use composite key: projectId (PK) + id (SK)
      const key = {
        projectId: projectId,
        id: itemId
      }
      
      return await this.getItem(tableName, key)
    } catch (error) {
      console.error(`[DynamoDBService] Error getting item from ${tableName}:`, error)
      throw error
    }
  }
}

// Export singleton instance
export default new DynamoDBService()
// TABLES is already exported above on line 16
