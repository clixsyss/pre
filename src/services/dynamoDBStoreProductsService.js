/**
 * DynamoDB Store Products Service
 * 
 * Handles all operations for the "projects__stores__products" DynamoDB table.
 * This service replaces Firebase/Firestore calls for store products data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Store ID (or composite: projectId#storeId)
 * - Sort Key: id (String) - Product ID
 * - Fields: category, createdAt, description, image, name, price (number),
 *           storeId, updatedAt
 */

import { getItem, query } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__stores__products'

/**
 * Convert DynamoDB product item to JavaScript object
 * @param {Object} item - DynamoDB item
 * @returns {Object} JavaScript object
 */
function convertProductFromDynamoDB(item) {
  if (!item) return null
  
  return {
    id: item.id,
    parentId: item.parentId,
    storeId: item.storeId || '',
    name: item.name || '',
    description: item.description || '',
    category: item.category || '',
    image: item.image || '',
    price: item.price ? Number(item.price) : 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null
  }
}

/**
 * Get all products for a specific store
 * @param {string} projectId - Project ID
 * @param {string} storeId - Store ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of products to return
 * @param {string} options.category - Filter by category
 * @returns {Promise<Array>} Array of product objects
 */
export async function getProductsByStore(projectId, storeId, options = {}) {
  try {
    console.log(`[DynamoDBStoreProductsService] Fetching products for store: ${storeId} in project: ${projectId}`)
    
    if (!projectId || !storeId) {
      console.warn('[DynamoDBStoreProductsService] Missing projectId or storeId')
      return []
    }
    
    // Try composite key first: projectId#storeId
    let queryOptions = {
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': `${projectId}#${storeId}`
      }
    }
    
    // If composite key doesn't work, try simple storeId
    if (options.limit) {
      queryOptions.Limit = options.limit
    }
    
    // Build filter expression if needed
    const filterParts = []
    if (options.category) {
      filterParts.push('category = :category')
      queryOptions.ExpressionAttributeValues[':category'] = options.category
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    let items = []
    try {
      items = await query(TABLE_NAME, queryOptions)
    } catch (error) {
      // If composite key fails, try simple storeId
      if (error.name === 'ValidationException' || error.message?.includes('key')) {
        console.log('[DynamoDBStoreProductsService] Trying simple storeId as parentId')
        queryOptions.ExpressionAttributeValues[':parentId'] = storeId
        items = await query(TABLE_NAME, queryOptions)
      } else {
        throw error
      }
    }
    
    // If still no results, try filtering by storeId field
    if (items.length === 0) {
      console.log('[DynamoDBStoreProductsService] Trying scan with storeId filter')
      const { scan } = await import('../aws/dynamodbClient')
      const scanOptions = {
        FilterExpression: 'storeId = :storeId',
        ExpressionAttributeValues: {
          ':storeId': storeId
        }
      }
      if (options.limit) {
        scanOptions.Limit = options.limit
      }
      if (options.category) {
        scanOptions.FilterExpression += ' AND category = :category'
        scanOptions.ExpressionAttributeValues[':category'] = options.category
      }
      items = await scan(TABLE_NAME, scanOptions)
    }
    
    // Convert DynamoDB format to JavaScript objects
    const products = items.map(convertProductFromDynamoDB)
    
    // Filter by storeId if not already filtered
    const filteredProducts = products.filter(p => p.storeId === storeId)
    
    // Sort by name
    filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    
    console.log(`[DynamoDBStoreProductsService] ✅ Fetched ${filteredProducts.length} products for store ${storeId}`)
    
    return filteredProducts
  } catch (error) {
    console.error(`[DynamoDBStoreProductsService] ❌ Error fetching products for store ${storeId}:`, error)
    throw error
  }
}

/**
 * Get all products for a project (across all stores)
 * @param {string} projectId - Project ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of products to return
 * @param {string} options.category - Filter by category
 * @param {string} options.storeId - Filter by store ID
 * @returns {Promise<Array>} Array of product objects
 */
export async function getProductsByProject(projectId, options = {}) {
  try {
    console.log(`[DynamoDBStoreProductsService] Fetching products for project: ${projectId}`)
    
    if (!projectId) {
      console.warn('[DynamoDBStoreProductsService] No projectId provided')
      return []
    }
    
    // Use scan with filter for project-wide search
    const { scan } = await import('../aws/dynamodbClient')
    const scanOptions = {}
    
    // Build filter expression
    const filterParts = []
    if (options.storeId) {
      filterParts.push('storeId = :storeId')
      scanOptions.ExpressionAttributeValues = scanOptions.ExpressionAttributeValues || {}
      scanOptions.ExpressionAttributeValues[':storeId'] = options.storeId
    }
    if (options.category) {
      filterParts.push('category = :category')
      scanOptions.ExpressionAttributeValues = scanOptions.ExpressionAttributeValues || {}
      scanOptions.ExpressionAttributeValues[':category'] = options.category
    }
    
    if (filterParts.length > 0) {
      scanOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    if (options.limit) {
      scanOptions.Limit = options.limit
    }
    
    const items = await scan(TABLE_NAME, scanOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const products = items.map(convertProductFromDynamoDB)
    
    // Sort by name
    products.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    
    console.log(`[DynamoDBStoreProductsService] ✅ Fetched ${products.length} products for project ${projectId}`)
    
    return products
  } catch (error) {
    console.error(`[DynamoDBStoreProductsService] ❌ Error fetching products for project ${projectId}:`, error)
    throw error
  }
}

/**
 * Get products by category
 * @param {string} projectId - Project ID
 * @param {string} category - Category name
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of product objects
 */
export async function getProductsByCategory(projectId, category, options = {}) {
  try {
    return await getProductsByProject(projectId, {
      ...options,
      category
    })
  } catch (error) {
    console.error(`[DynamoDBStoreProductsService] ❌ Error fetching products by category:`, error)
    throw error
  }
}

/**
 * Get a single product by ID
 * @param {string} projectId - Project ID
 * @param {string} storeId - Store ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object|null>} Product object or null if not found
 */
export async function getProductById(projectId, storeId, productId) {
  try {
    console.log(`[DynamoDBStoreProductsService] Fetching product: ${productId} in store: ${storeId}`)
    
    if (!projectId || !storeId || !productId) {
      console.warn('[DynamoDBStoreProductsService] Missing projectId, storeId, or productId')
      return null
    }
    
    // Try composite key first
    let product = null
    try {
      product = await getItem(TABLE_NAME, {
        parentId: `${projectId}#${storeId}`,
        id: productId
      })
    } catch (error) {
      // If composite key fails, try simple storeId
      if (error.name === 'ValidationException' || error.message?.includes('key')) {
        product = await getItem(TABLE_NAME, {
          parentId: storeId,
          id: productId
        })
      } else {
        throw error
      }
    }
    
    if (product) {
      return convertProductFromDynamoDB(product)
    }
    
    // If not found, try querying with FilterExpression
    const { query } = await import('../aws/dynamodbClient')
    const queryOptions = {
      KeyConditionExpression: 'parentId = :parentId',
      FilterExpression: 'id = :productId AND storeId = :storeId',
      ExpressionAttributeValues: {
        ':parentId': storeId,
        ':productId': productId,
        ':storeId': storeId
      }
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    if (items.length > 0) {
      return convertProductFromDynamoDB(items[0])
    }
    
    console.log(`[DynamoDBStoreProductsService] ⚠️ Product not found: ${productId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBStoreProductsService] ❌ Error fetching product ${productId}:`, error)
    throw error
  }
}

// Export default for convenience
export default {
  getProductsByStore,
  getProductsByProject,
  getProductsByCategory,
  getProductById
}

