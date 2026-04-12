/**
 * Centralized AWS DynamoDB Client
 * 
 * Uses AWS SDK v3 and environment variables for credentials.
 * DO NOT hardcode any secrets - all credentials come from process.env
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// AWS Configuration from environment variables
// Supports both Node.js (process.env) and Vite/browser (import.meta.env)
// In Vite, env vars must be prefixed with VITE_ to be accessible in browser
// IMPORTANT: Never hardcode credentials. Always use environment variables.

const AWS_REGION = 
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

// DynamoDB client instances (singleton pattern)
let dynamoDBClient = null
let dynamoDBDocClient = null

/**
 * Initialize DynamoDB client with credentials from environment variables
 * @returns {Object} DynamoDB client instances
 */
function initializeDynamoDBClient() {
  // Return existing clients if already initialized
  if (dynamoDBClient && dynamoDBDocClient) {
    return { client: dynamoDBClient, docClient: dynamoDBDocClient }
  }
  
  // Validate credentials are available
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.warn('[DynamoDBClient] AWS credentials not found in environment variables. DynamoDB operations will fail.')
    console.warn('[DynamoDBClient] Required: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION')
  }
  
  // Create DynamoDB client with credentials from environment
  const clientConfig = {
    region: AWS_REGION
  }
  
  // Add credentials if available
  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
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
  
  console.log('[DynamoDBClient] ✅ DynamoDB client initialized', {
    region: AWS_REGION,
    hasCredentials: !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY)
  })
  
  return { client: dynamoDBClient, docClient: dynamoDBDocClient }
}

// Initialize on module load
const { docClient } = initializeDynamoDBClient()

/**
 * Get a single item by primary key
 * @param {string} tableName - Table name
 * @param {Object} key - Primary key object (e.g., { id: 'item-123' })
 * @param {Object} options - Optional settings (e.g. { consistentRead: true })
 * @returns {Promise<Object|null>} - Item or null if not found
 */
export async function getItem(tableName, key, options = {}) {
  try {
    const { GetCommand } = await import('@aws-sdk/lib-dynamodb')
    const { consistentRead = true } = options

    const command = new GetCommand({
      TableName: tableName,
      Key: key,
      ConsistentRead: consistentRead
    })

    const response = await docClient.send(command)
    return response.Item || null
  } catch (error) {
    console.error(`[DynamoDBClient] Error getting item from ${tableName}:`, error)
    throw error
  }
}

/**
 * Put (create or replace) an item
 * @param {string} tableName - Table name
 * @param {Object} item - Item to put
 * @returns {Promise<void>}
 */
export async function putItem(tableName, item) {
  try {
    const { PutCommand } = await import('@aws-sdk/lib-dynamodb')
    
    const command = new PutCommand({
      TableName: tableName,
      Item: item
    })
    
    await docClient.send(command)
  } catch (error) {
    console.error(`[DynamoDBClient] Error putting item to ${tableName}:`, error)
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
 * @returns {Promise<Array>} - Array of items
 */
export async function query(tableName, options = {}) {
  try {
    const { QueryCommand } = await import('@aws-sdk/lib-dynamodb')
    
    const queryParams = {
      TableName: tableName
    }
    
    // Only include options that are defined and not empty
    if (options.KeyConditionExpression) {
      queryParams.KeyConditionExpression = options.KeyConditionExpression
    }
    if (options.FilterExpression) {
      queryParams.FilterExpression = options.FilterExpression
    }
    if (options.ExpressionAttributeNames && Object.keys(options.ExpressionAttributeNames).length > 0) {
      queryParams.ExpressionAttributeNames = options.ExpressionAttributeNames
    }
    if (options.ExpressionAttributeValues && Object.keys(options.ExpressionAttributeValues).length > 0) {
      queryParams.ExpressionAttributeValues = options.ExpressionAttributeValues
    }
    if (options.Limit) {
      queryParams.Limit = options.Limit
    }
    if (options.IndexName) {
      queryParams.IndexName = options.IndexName
    }
    
    const command = new QueryCommand(queryParams)
    const response = await docClient.send(command)
    
    return response.Items || []
  } catch (error) {
    console.error(`[DynamoDBClient] Error querying ${tableName}:`, error)
    throw error
  }
}

/**
 * Query all pages for a partition (or key condition) until LastEvaluatedKey is absent.
 * Use for large children collections (e.g. all units in a project) — plain `query` with Limit only returns one page.
 * @param {string} tableName
 * @param {Object} options - Same as query(); optional pageSize (default 500), maxPages (default 200)
 */
export async function queryAll(tableName, options = {}) {
  const { QueryCommand } = await import('@aws-sdk/lib-dynamodb')
  const pageSize = Math.min(Math.max(Number(options.pageSize) || 500, 1), 1000)
  const maxPages = Math.min(Math.max(Number(options.maxPages) || 200, 1), 500)

  const rest = { ...options }
  delete rest.pageSize
  delete rest.maxPages
  delete rest.Limit
  delete rest.limit
  delete rest.ExclusiveStartKey

  const all = []
  let exclusiveStartKey = undefined

  for (let page = 0; page < maxPages; page += 1) {
    const queryParams = {
      TableName: tableName,
      Limit: pageSize,
      ...rest
    }
    if (exclusiveStartKey) {
      queryParams.ExclusiveStartKey = exclusiveStartKey
    }

    const command = new QueryCommand(queryParams)
    const response = await docClient.send(command)
    const batch = response.Items || []
    all.push(...batch)
    exclusiveStartKey = response.LastEvaluatedKey
    if (!exclusiveStartKey) break
  }

  return all
}

/**
 * Scan entire table
 * @param {string} tableName - Table name
 * @param {Object} options - Scan options
 * @param {number} options.limit - Maximum items to return
 * @param {string} options.filterExpression - Filter expression
 * @param {Object} options.expressionAttributeNames - Attribute names
 * @param {Object} options.expressionAttributeValues - Attribute values
 * @returns {Promise<Array>} - Array of items
 */
export async function scan(tableName, options = {}) {
  try {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb')
    
    const scanParams = {
      TableName: tableName
    }
    
    // Only include options that are defined and not empty
    if (options.FilterExpression) {
      scanParams.FilterExpression = options.FilterExpression
    }
    if (options.ExpressionAttributeNames && Object.keys(options.ExpressionAttributeNames).length > 0) {
      scanParams.ExpressionAttributeNames = options.ExpressionAttributeNames
    }
    if (options.ExpressionAttributeValues && Object.keys(options.ExpressionAttributeValues).length > 0) {
      scanParams.ExpressionAttributeValues = options.ExpressionAttributeValues
    }
    if (options.Limit) {
      scanParams.Limit = options.Limit
    }
    if (options.ExclusiveStartKey) {
      scanParams.ExclusiveStartKey = options.ExclusiveStartKey
    }
    
    const command = new ScanCommand(scanParams)
    const response = await docClient.send(command)
    
    // Return items array directly for backward compatibility
    // If LastEvaluatedKey is needed, attach it to the array (non-standard but maintains compatibility)
    const items = response.Items || []
    if (response.LastEvaluatedKey) {
      items.LastEvaluatedKey = response.LastEvaluatedKey
    }
    
    return items
  } catch (error) {
    console.error(`[DynamoDBClient] Error scanning ${tableName}:`, error)
    throw error
  }
}

/**
 * Update an item
 * @param {string} tableName - Table name
 * @param {Object} key - Primary key object
 * @param {Object} updateOptions - Update options
 * @param {string} updateOptions.UpdateExpression - Update expression
 * @param {Object} updateOptions.ExpressionAttributeNames - Attribute names
 * @param {Object} updateOptions.ExpressionAttributeValues - Attribute values
 * @returns {Promise<void>}
 */
export async function updateItem(tableName, key, updateOptions) {
  try {
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb')
    
    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      ...updateOptions
    })
    
    await docClient.send(command)
  } catch (error) {
    console.error(`[DynamoDBClient] Error updating item in ${tableName}:`, error)
    throw error
  }
}

/**
 * Delete an item
 * @param {string} tableName - Table name
 * @param {Object} key - Primary key object
 * @returns {Promise<void>}
 */
export async function deleteItem(tableName, key) {
  try {
    const { DeleteCommand } = await import('@aws-sdk/lib-dynamodb')
    
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key
    })
    
    await docClient.send(command)
  } catch (error) {
    console.error(`[DynamoDBClient] Error deleting item from ${tableName}:`, error)
    throw error
  }
}

// Export the document client for advanced usage
export { docClient }
export default { getItem, putItem, query, scan, updateItem, deleteItem }

