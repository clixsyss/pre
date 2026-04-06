/**
 * DynamoDB News Reactions Service
 * 
 * Handles all operations for the "projects__news__reactions" DynamoDB table.
 * This service replaces Firebase/Firestore calls for news reactions data.
 * 
 * Table structure:
 * - Primary Key: parentId (String) - Composite key: "projectId#newsId"
 * - Sort Key: id (String) - Reaction ID
 * - Fields: createdAt, emoji, timestamp, userId, userName
 * 
 * Note: parentId format is "projectId#newsId" (e.g., "BiHENuiMdDrivwbPccNE#FhLH8hOe0d5Ihjfr4gno")
 */

import { getItem, query, putItem, deleteItem } from '../aws/dynamodbClient'

const TABLE_NAME = 'projects__news__reactions'

/**
 * Build parentId from projectId and newsId
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @returns {string} Composite parentId
 */
function buildParentId(projectId, newsId) {
  return `${projectId}#${newsId}`
}

/**
 * Parse parentId to extract projectId and newsId
 * @param {string} parentId - Composite parentId
 * @returns {Object} { projectId, newsId }
 */
function parseParentId(parentId) {
  const parts = parentId.split('#')
  return {
    projectId: parts[0] || '',
    newsId: parts[1] || ''
  }
}

/**
 * Get all reactions for a specific news item
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of reactions to return
 * @param {string} options.emoji - Filter by emoji type (e.g., "like")
 * @param {string} options.userId - Filter by userId
 * @returns {Promise<Array>} Array of reaction objects
 */
export async function getReactionsByNews(projectId, newsId, options = {}) {
  try {
    console.log(`[DynamoDBNewsReactionsService] Fetching reactions for news: ${newsId} in project: ${projectId}`)
    
    if (!projectId || !newsId) {
      console.warn('[DynamoDBNewsReactionsService] Missing projectId or newsId')
      return []
    }
    
    const parentId = buildParentId(projectId, newsId)
    
    const queryOptions = {
      KeyConditionExpression: 'parentId = :parentId',
      ExpressionAttributeValues: {
        ':parentId': parentId
      }
    }
    
    if (options.limit) {
      queryOptions.Limit = options.limit
    }
    
    // Build filter expression if needed
    const filterParts = []
    if (options.emoji) {
      filterParts.push('emoji = :emoji')
      queryOptions.ExpressionAttributeValues[':emoji'] = options.emoji
    }
    if (options.userId) {
      filterParts.push('userId = :userId')
      queryOptions.ExpressionAttributeValues[':userId'] = options.userId
    }
    
    if (filterParts.length > 0) {
      queryOptions.FilterExpression = filterParts.join(' AND ')
    }
    
    const items = await query(TABLE_NAME, queryOptions)
    
    // Convert DynamoDB format to JavaScript objects
    const reactions = items.map(item => {
      const parsed = parseParentId(item.parentId || parentId)
      const reaction = {
        id: item.id,
        parentId: item.parentId || parentId,
        projectId: parsed.projectId,
        newsId: parsed.newsId,
        emoji: item.emoji || '',
        userId: item.userId || '',
        userName: item.userName || 'Anonymous',
        timestamp: item.timestamp || item.createdAt || null,
        createdAt: item.createdAt || null
      }
      
      return reaction
    })
    
    // Sort by timestamp/createdAt (descending - newest first)
    reactions.sort((a, b) => {
      const timeA = a.timestamp || a.createdAt || ''
      const timeB = b.timestamp || b.createdAt || ''
      return timeB.localeCompare(timeA)
    })
    
    console.log(`[DynamoDBNewsReactionsService] ✅ Fetched ${reactions.length} reactions for news ${newsId}`)
    
    return reactions
  } catch (error) {
    console.error(`[DynamoDBNewsReactionsService] ❌ Error fetching reactions for news ${newsId}:`, error)
    throw error
  }
}

/**
 * Get reactions by emoji type for a news item
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @param {string} emoji - Emoji type (e.g., "like")
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of reaction objects
 */
export async function getReactionsByEmoji(projectId, newsId, emoji, options = {}) {
  try {
    return await getReactionsByNews(projectId, newsId, {
      ...options,
      emoji
    })
  } catch (error) {
    console.error(`[DynamoDBNewsReactionsService] ❌ Error fetching reactions by emoji for news ${newsId}:`, error)
    throw error
  }
}

/**
 * Get reactions by user for a news item
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of reaction objects
 */
export async function getReactionsByUser(projectId, newsId, userId, options = {}) {
  try {
    return await getReactionsByNews(projectId, newsId, {
      ...options,
      userId
    })
  } catch (error) {
    console.error(`[DynamoDBNewsReactionsService] ❌ Error fetching reactions by user for news ${newsId}:`, error)
    throw error
  }
}

/**
 * Get a single reaction by ID
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @param {string} reactionId - Reaction ID
 * @returns {Promise<Object|null>} Reaction object or null if not found
 */
export async function getReactionById(projectId, newsId, reactionId) {
  try {
    console.log(`[DynamoDBNewsReactionsService] Fetching reaction: ${reactionId} for news: ${newsId}`)
    
    if (!projectId || !newsId || !reactionId) {
      console.warn('[DynamoDBNewsReactionsService] Missing projectId, newsId, or reactionId')
      return null
    }
    
    const parentId = buildParentId(projectId, newsId)
    
    const reaction = await getItem(TABLE_NAME, {
      parentId,
      id: reactionId
    })
    
    if (reaction) {
      // Convert to JavaScript format
      const parsed = parseParentId(reaction.parentId || parentId)
      const converted = {
        id: reaction.id,
        parentId: reaction.parentId || parentId,
        projectId: parsed.projectId,
        newsId: parsed.newsId,
        emoji: reaction.emoji || '',
        userId: reaction.userId || '',
        userName: reaction.userName || 'Anonymous',
        timestamp: reaction.timestamp || reaction.createdAt || null,
        createdAt: reaction.createdAt || null
      }
      
      console.log(`[DynamoDBNewsReactionsService] ✅ Found reaction: ${reactionId}`)
      return converted
    }
    
    console.log(`[DynamoDBNewsReactionsService] ⚠️ Reaction not found: ${reactionId}`)
    return null
  } catch (error) {
    console.error(`[DynamoDBNewsReactionsService] ❌ Error fetching reaction ${reactionId}:`, error)
    throw error
  }
}

/**
 * Get reaction count by emoji for a news item
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @param {string} emoji - Emoji type (e.g., "like")
 * @returns {Promise<number>} Count of reactions
 */
export async function getReactionCountByEmoji(projectId, newsId, emoji) {
  try {
    const reactions = await getReactionsByEmoji(projectId, newsId, emoji)
    return reactions.length
  } catch (error) {
    console.error(`[DynamoDBNewsReactionsService] ❌ Error getting reaction count for emoji ${emoji}:`, error)
    return 0
  }
}

/**
 * Check if a user has reacted to a news item
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @param {string} userId - User ID
 * @param {string} emoji - Optional emoji type to check
 * @returns {Promise<Object|null>} Reaction object if found, null otherwise
 */
export async function getUserReaction(projectId, newsId, userId, emoji = null) {
  try {
    const reactions = await getReactionsByUser(projectId, newsId, userId)
    
    if (emoji) {
      return reactions.find(r => r.emoji === emoji) || null
    }
    
    return reactions.length > 0 ? reactions[0] : null
  } catch (error) {
    console.error(`[DynamoDBNewsReactionsService] ❌ Error getting user reaction:`, error)
    return null
  }
}

/**
 * Add a reaction for a user on a news item
 * Uses deterministic id to keep one reaction per user+emoji per news.
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @param {Object} reaction - Reaction payload
 * @param {string} reaction.userId - User ID
 * @param {string} reaction.userName - User display name
 * @param {string} reaction.emoji - Emoji type
 * @returns {Promise<Object>} Created reaction item
 */
export async function addReaction(projectId, newsId, reaction) {
  try {
    if (!projectId || !newsId || !reaction?.userId || !reaction?.emoji) {
      throw new Error('Missing required fields for addReaction')
    }

    const parentId = buildParentId(projectId, newsId)
    const nowIso = new Date().toISOString()
    const item = {
      parentId,
      id: `${reaction.userId}_${reaction.emoji}`,
      userId: reaction.userId,
      userName: reaction.userName || 'Anonymous',
      emoji: reaction.emoji,
      timestamp: nowIso,
      createdAt: nowIso
    }

    await putItem(TABLE_NAME, item)
    return item
  } catch (error) {
    console.error('[DynamoDBNewsReactionsService] ❌ Error adding reaction:', error)
    throw error
  }
}

/**
 * Remove a user's reaction from a news item.
 * @param {string} projectId - Project ID
 * @param {string} newsId - News ID
 * @param {string} userId - User ID
 * @param {string} emoji - Emoji type
 * @returns {Promise<number>} Number of deleted reaction records
 */
export async function removeReaction(projectId, newsId, userId, emoji) {
  try {
    if (!projectId || !newsId || !userId || !emoji) {
      throw new Error('Missing required fields for removeReaction')
    }

    const parentId = buildParentId(projectId, newsId)

    // Delete deterministic key first (new format)
    try {
      await deleteItem(TABLE_NAME, { parentId, id: `${userId}_${emoji}` })
      return 1
    } catch (deterministicDeleteError) {
      console.warn('[DynamoDBNewsReactionsService] Deterministic delete failed, trying scan-delete fallback:', deterministicDeleteError?.message || deterministicDeleteError)
    }

    // Fallback for legacy ids: find and delete all user+emoji reactions
    const matches = await getReactionsByNews(projectId, newsId, { userId, emoji })
    if (!matches.length) {
      return 0
    }

    await Promise.all(
      matches.map((reaction) => deleteItem(TABLE_NAME, { parentId, id: reaction.id }))
    )
    return matches.length
  } catch (error) {
    console.error('[DynamoDBNewsReactionsService] ❌ Error removing reaction:', error)
    throw error
  }
}

// Export default for convenience
export default {
  getReactionsByNews,
  getReactionsByEmoji,
  getReactionsByUser,
  getReactionById,
  getReactionCountByEmoji,
  getUserReaction,
  addReaction,
  removeReaction,
  buildParentId,
  parseParentId
}

