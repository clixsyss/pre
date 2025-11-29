/**
 * Cache Service - Comprehensive caching layer for Firebase data
 * Provides in-memory caching with expiration and persistence
 */

class CacheService {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 24 * 60 * 60 * 1000 // 24 hours default TTL (extended for cost optimization)
    this.maxCacheSize = 200 // Maximum number of cached items (increased for longer cache)
  }

  /**
   * Generate cache key from path and query
   */
  generateKey(path, query = null) {
    if (query) {
      return `${path}?${JSON.stringify(query)}`
    }
    return path
  }

  /**
   * Set cache item with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    const expiresAt = Date.now() + ttl
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    })

    console.log(`🗄️ Cache set: ${key} (expires in ${ttl}ms)`)
  }

  /**
   * Get cache item if not expired
   */
  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      console.log(`🗄️ Cache miss: ${key}`)
      return null
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      console.log(`🗄️ Cache expired: ${key}`)
      return null
    }

    console.log(`🗄️ Cache hit: ${key} (age: ${Date.now() - item.createdAt}ms)`)
    return item.data
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    const item = this.cache.get(key)
    return item && Date.now() <= item.expiresAt
  }

  /**
   * Delete cache item
   */
  delete(key) {
    const deleted = this.cache.delete(key)
    if (deleted) {
      console.log(`🗄️ Cache deleted: ${key}`)
    }
    return deleted
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
    console.log('🗄️ Cache cleared')
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let valid = 0
    let expired = 0
    
    for (const [, item] of this.cache.entries()) {
      if (now <= item.expiresAt) {
        valid++
      } else {
        expired++
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.maxCacheSize
    }
  }

  /**
   * Clean up expired items
   */
  cleanup() {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🗄️ Cache cleanup: removed ${cleaned} expired items`)
    }

    return cleaned
  }

  // Convenience methods for common cache patterns

  /**
   * Cache user document
   */
  setUserDocument(userId, userData) {
    const key = this.generateKey(`users/${userId}`)
    this.set(key, userData, 24 * 60 * 60 * 1000) // 24 hours for user data
  }

  /**
   * Get user document from cache
   */
  getUserDocument(userId) {
    const key = this.generateKey(`users/${userId}`)
    return this.get(key)
  }

  /**
   * Cache project document
   */
  setProjectDocument(projectId, projectData) {
    const key = this.generateKey(`projects/${projectId}`)
    this.set(key, projectData, 7 * 24 * 60 * 60 * 1000) // 7 days for project data
  }

  /**
   * Get project document from cache
   */
  getProjectDocument(projectId) {
    const key = this.generateKey(`projects/${projectId}`)
    return this.get(key)
  }

  /**
   * Cache collection data
   */
  setCollectionData(collectionPath, query, data) {
    const key = this.generateKey(collectionPath, query)
    this.set(key, data, 2 * 60 * 60 * 1000) // 2 hours for collection data
  }

  /**
   * Get collection data from cache
   */
  getCollectionData(collectionPath, query) {
    const key = this.generateKey(collectionPath, query)
    return this.get(key)
  }

  /**
   * Invalidate cache for a path pattern
   */
  invalidatePattern(pattern) {
    let invalidated = 0
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        invalidated++
      }
    }
    
    if (invalidated > 0) {
      console.log(`🗄️ Cache invalidated: ${invalidated} items matching "${pattern}"`)
    }
    
    return invalidated
  }

  /**
   * Invalidate user-related cache
   */
  invalidateUser(userId) {
    this.invalidatePattern(`users/${userId}`)
  }

  /**
   * Invalidate project-related cache
   */
  invalidateProject(projectId) {
    this.invalidatePattern(`projects/${projectId}`)
  }
}

// Create singleton instance
const cacheService = new CacheService()

// Clean up expired items every 2 hours (less frequent with longer cache)
setInterval(() => {
  cacheService.cleanup()
}, 2 * 60 * 60 * 1000)

export default cacheService