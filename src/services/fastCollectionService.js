/**
 * Fast Collection Service - Optimized collection data fetching with real Firebase data
 * Uses caching and timeout handling to ensure fast, reliable data access
 */

import cacheService from './cacheService'
import performanceService from './performanceService'
import firestoreService from './firestoreService'
import errorHandlingService from './errorHandlingService'
import { getServiceCategoriesByProject } from './dynamoDBServiceCategoriesService'
import { getServicesByCategory } from './dynamoDBServicesService'
import { getActiveAdsByProject } from './dynamoDBAdsService'

class FastCollectionService {
  constructor() {
    // In-flight request deduplication: prevents duplicate concurrent fetches for the same key
    this._inFlight = new Map()
  }

  /**
   * Deduplicates concurrent requests for the same key.
   * If a fetch for `key` is already in-flight, returns that same promise.
   */
  _dedupe(key, fn) {
    if (this._inFlight.has(key)) return this._inFlight.get(key)
    const promise = fn().finally(() => this._inFlight.delete(key))
    this._inFlight.set(key, promise)
    return promise
  }

  /**
   * Get ads for a project (optimized with real Firebase data)
   */
  async getAds(projectId, useCache = true) {
    return this._dedupe(`ads:${projectId}`, () => performanceService.timeOperation('getAds', async () => {

      // Check cache first
      if (useCache) {
        const cachedAds = cacheService.getCollectionData(`projects/${projectId}/ads`, { active: true })
        if (cachedAds) {
          return cachedAds
        }
      }

      try {
        // Use DynamoDB service first, fall back to Firestore
        try {
          const ads = await getActiveAdsByProject(projectId, { limit: 100 })
          const adsWithProjectId = ads.map(ad => ({ ...ad, projectId: ad.parentId || projectId }))
          cacheService.setCollectionData(`projects/${projectId}/ads`, { active: true }, adsWithProjectId)
          return adsWithProjectId
        } catch (dynamoError) {
          console.warn('FastCollection: DynamoDB fetch failed, falling back to Firestore:', dynamoError)
          const snapshot = await firestoreService.getDocs(`projects/${projectId}/ads`, { timeoutMs: 6000 })
          const result = snapshot.empty ? [] : snapshot.docs.map(doc => ({ id: doc.id, projectId, ...doc.data() }))
          cacheService.setCollectionData(`projects/${projectId}/ads`, { active: true }, result)
          return result
        }
      } catch (error) {
        console.warn(`FastCollection: Error fetching ads for project ${projectId}:`, error.message)
        const emptyResult = []
        cacheService.setCollectionData(`projects/${projectId}/ads`, { active: true }, emptyResult)
        return emptyResult
      }
    }))
  }

  /**
   * Get news for a project (optimized with real Firebase data)
   */
  async getNews(projectId, options = {}, useCache = true) {
    return this._dedupe(`news:${projectId}:${JSON.stringify(options)}`, async () => {

    // Check cache first
    if (useCache) {
      const cachedNews = cacheService.getCollectionData(`projects/${projectId}/news`, options)
      if (cachedNews) {
        return cachedNews
      }
    }

    try {
      const snapshot = await firestoreService.getDocs(`projects/${projectId}/news`, { timeoutMs: 6000 })

      if (snapshot.empty) {
        const emptyResult = []
        cacheService.setCollectionData(`projects/${projectId}/news`, options, emptyResult)
        return emptyResult
      }

      // Process the real data
      let news = snapshot.docs.map(doc => ({
        id: doc.id,
        projectId,
        ...doc.data()
      }))
      
      const newsScheduleToDate = (value) => {
        if (!value) return null
        if (value instanceof Date && !isNaN(value.getTime())) return value
        if (typeof value.toDate === 'function') {
          const d = value.toDate()
          return d instanceof Date && !isNaN(d.getTime()) ? d : null
        }
        const d = new Date(value)
        return isNaN(d.getTime()) ? null : d
      }

      const newsItemIsReaderVisible = (item) => {
        if (item.isPublished === true) return true
        const t = newsScheduleToDate(item.scheduledPublishAt)
        if (t && Date.now() >= t.getTime()) return true
        return false
      }

      // Apply client-side filtering based on options
      if (options.publishedOnly) {
        news = news.filter(newsItemIsReaderVisible)
      }
      
      if (options.featuredOnly) {
        news = news.filter(item => item.featured === true)
      }
      
      // Sort by creation date (newest first)
      news.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB - dateA
      })
      
      // Apply limit if specified
      if (options.limit) {
        news = news.slice(0, options.limit)
      }
      
      // Cache the processed data
      cacheService.setCollectionData(`projects/${projectId}/news`, options, news)
      
      return news

    } catch (error) {
      console.warn(`🚀 FastCollection: Error fetching news for project ${projectId}:`, error.message)
      const emptyResult = []
      cacheService.setCollectionData(`projects/${projectId}/news`, options, emptyResult)
      return emptyResult
    }
    }) // end _dedupe
  }

  /**
   * Get service categories for a project (optimized with real Firebase data)
   */
  async getServiceCategories(projectId, availableOnly = true, useCache = true) {
    
    // Check cache first
    if (useCache) {
      const cachedCategories = cacheService.getCollectionData(`projects/${projectId}/serviceCategories`, { availableOnly })
      if (cachedCategories) {
        console.log(`🚀 FastCollection: Using cached service categories for project ${projectId}`)
        return cachedCategories
      }
    }

    try {
      console.log(`🚀 FastCollection: Fetching service categories for project ${projectId}`)
      
      // Use DynamoDB service first
      try {
        // Fetch all categories first (no status filter at DynamoDB level)
        const allCategories = await getServiceCategoriesByProject(projectId, { 
          limit: 100
        })
        
        console.log(`🚀 FastCollection: Fetched ${allCategories.length} total categories from DynamoDB`)
        
        // Apply client-side filtering for status
        let categories = allCategories
        if (availableOnly) {
          categories = categories.filter((cat) => cat.status === 'available')
          console.log(`🚀 FastCollection: Filtered to ${categories.length} available categories`)
        }
        
        // Sort by englishTitle
        categories.sort((a, b) => (a.englishTitle || '').localeCompare(b.englishTitle || ''))
        
        // Cache the data
        cacheService.setCollectionData(`projects/${projectId}/serviceCategories`, { availableOnly }, categories)
        
        console.log(`🚀 FastCollection: Successfully fetched ${categories.length} service categories from DynamoDB for project ${projectId}`)
        return categories
      } catch (dynamoError) {
        console.warn('FastCollection: DynamoDB fetch failed, falling back to Firestore:', dynamoError)
        // Fallback to Firestore
        const snapshot = await firestoreService.getDocs(`projects/${projectId}/serviceCategories`, { timeoutMs: 6000 })
        
        if (snapshot.empty) {
          console.log(`🚀 FastCollection: No service categories found for project ${projectId}`)
          const emptyResult = []
          cacheService.setCollectionData(`projects/${projectId}/serviceCategories`, { availableOnly }, emptyResult)
          return emptyResult
        }
        
        // Process the real data
        let categories = snapshot.docs.map(doc => ({
          id: doc.id,
          projectId,
          ...doc.data()
        }))
        
        // Apply client-side filtering
        if (availableOnly) {
          categories = categories.filter(cat => cat.status === 'available')
        }
        
        // Sort by name
        categories.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        
        // Cache the processed data
        cacheService.setCollectionData(`projects/${projectId}/serviceCategories`, { availableOnly }, categories)
        
        console.log(`🚀 FastCollection: Successfully fetched ${categories.length} service categories from Firestore (fallback) for project ${projectId}`)
        return categories
      }
      
    } catch (error) {
      console.warn(`🚀 FastCollection: Error fetching service categories for project ${projectId}:`, error.message)
      
      // Return empty array instead of mock data to maintain data integrity
      const emptyResult = []
      cacheService.setCollectionData(`projects/${projectId}/serviceCategories`, { availableOnly }, emptyResult)
      return emptyResult
    }
  }

  /**
   * Get services by category (optimized with real Firebase data)
   */
  async getServicesByCategory(projectId, categoryId, availableOnly = true, useCache = true) {
    
    // Check cache first
    if (useCache) {
      const cachedServices = cacheService.getCollectionData(`projects/${projectId}/serviceCategories/${categoryId}/services`, { availableOnly })
      if (cachedServices) {
        console.log(`🚀 FastCollection: Using cached services for category ${categoryId}`)
        return cachedServices
      }
    }

    try {
      console.log(`🚀 FastCollection: Fetching services for category ${categoryId}`)
      
      // Use DynamoDB service first
      try {
        const statusFilter = availableOnly ? 'available' : undefined
        let services = await getServicesByCategory(projectId, categoryId, { 
          limit: 100,
          status: statusFilter
        })

        if (availableOnly) {
          services = services.filter((service) => service.status === 'available')
        }
        
        // Sort by englishTitle (or name if available)
        services.sort((a, b) => {
          const nameA = a.englishTitle || a.name || ''
          const nameB = b.englishTitle || b.name || ''
          return nameA.localeCompare(nameB)
        })
        
        // Cache the data
        cacheService.setCollectionData(`projects/${projectId}/serviceCategories/${categoryId}/services`, { availableOnly }, services)
        
        console.log(`🚀 FastCollection: Successfully fetched ${services.length} services from DynamoDB for category ${categoryId}`)
        return services
      } catch (dynamoError) {
        console.warn('FastCollection: DynamoDB fetch failed, falling back to Firestore:', dynamoError)
        // Fallback to Firestore
        const snapshot = await firestoreService.getDocs(`projects/${projectId}/serviceCategories/${categoryId}/services`, { timeoutMs: 6000 })
        
        if (snapshot.empty) {
          console.log(`🚀 FastCollection: No services found for category ${categoryId}`)
          const emptyResult = []
          cacheService.setCollectionData(`projects/${projectId}/serviceCategories/${categoryId}/services`, { availableOnly }, emptyResult)
          return emptyResult
        }
        
        // Process the real data
        let services = snapshot.docs.map(doc => ({
          id: doc.id,
          categoryId,
          projectId,
          ...doc.data()
        }))
        
        // Apply client-side filtering
        if (availableOnly) {
          services = services.filter((service) => service.status === 'available')
        }

        services.sort((a, b) =>
          (a.englishTitle || a.name || '').localeCompare(b.englishTitle || b.name || '')
        )
        
        // Cache the processed data
        cacheService.setCollectionData(`projects/${projectId}/serviceCategories/${categoryId}/services`, { availableOnly }, services)
        
        console.log(`🚀 FastCollection: Successfully fetched ${services.length} services from Firestore (fallback) for category ${categoryId}`)
        return services
      }
      
    } catch (error) {
      console.warn(`🚀 FastCollection: Error fetching services for category ${categoryId}:`, error.message)
      
      // Return empty array instead of mock data to maintain data integrity
      const emptyResult = []
      cacheService.setCollectionData(`projects/${projectId}/serviceCategories/${categoryId}/services`, { availableOnly }, emptyResult)
      return emptyResult
    }
  }

  /**
   * Clear cache for a project
   */
  clearProjectCache(projectId) {
    cacheService.invalidateProject(projectId)
    console.log(`🚀 FastCollection: Cleared cache for project ${projectId}`)
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getStats()
  }

  /**
   * Get request categories for a project (optimized with real Firebase data)
   */
  async getRequestCategories(projectId, availableOnly = true, useCache = true) {
    
    // Check cache first
    if (useCache) {
      const cachedCategories = cacheService.getCollectionData(`projects/${projectId}/requestCategories`, { availableOnly })
      if (cachedCategories) {
        console.log(`🚀 FastCollection: Using cached request categories for project ${projectId}`)
        return cachedCategories
      }
    }

    try {
      console.log(`🚀 FastCollection: Fetching request categories for project ${projectId}`)
      
      // Use DynamoDB service first
      try {
        const { getRequestCategoriesByProject, getAvailableRequestCategories } = await import('./dynamoDBRequestCategoriesService')
        
        const categories = availableOnly
          ? await getAvailableRequestCategories(projectId, { limit: 100 })
          : await getRequestCategoriesByProject(projectId, { limit: 100 })
        
        // Cache the data
        cacheService.setCollectionData(`projects/${projectId}/requestCategories`, { availableOnly }, categories)
        
        console.log(`🚀 FastCollection: Successfully fetched ${categories.length} request categories from DynamoDB for project ${projectId}`)
        return categories
      } catch (dynamoError) {
        console.warn('FastCollection: DynamoDB fetch failed, falling back to Firestore:', dynamoError)
        
        // Fallback to Firestore
        const snapshot = await firestoreService.getDocs(`projects/${projectId}/requestCategories`, { timeoutMs: 6000 })
        
        if (snapshot.empty) {
          console.log(`🚀 FastCollection: No request categories found for project ${projectId}`)
          const emptyResult = []
          cacheService.setCollectionData(`projects/${projectId}/requestCategories`, { availableOnly }, emptyResult)
          return emptyResult
        }
        
        // Process the real data
        let categories = snapshot.docs.map(doc => ({
          id: doc.id,
          projectId,
          ...doc.data()
        }))
        
        // Apply client-side filtering
        if (availableOnly) {
          categories = categories.filter(cat => cat.status === 'available')
        }
        
        // Sort by name
        categories.sort((a, b) => (a.englishTitle || '').localeCompare(b.englishTitle || ''))
        
        // Cache the processed data
        cacheService.setCollectionData(`projects/${projectId}/requestCategories`, { availableOnly }, categories)
        
        console.log(`🚀 FastCollection: Successfully fetched ${categories.length} request categories from Firestore (fallback) for project ${projectId}`)
        return categories
      }
    } catch (error) {
      console.warn(`🚀 FastCollection: Error fetching request categories for project ${projectId}:`, error)
      errorHandlingService.handleFirestoreError(error, 'getRequestCategories')
      return []
    }
  }

  /**
   * Get request categories by category (optimized with real Firebase data)
   */
  async getRequestCategoriesByCategory(projectId, categoryId, availableOnly = true, useCache = true) {
    
    // Check cache first
    if (useCache) {
      const cachedRequestCategories = cacheService.getCollectionData(`projects/${projectId}/requestCategories/${categoryId}/requestCategories`, { availableOnly })
      if (cachedRequestCategories) {
        console.log(`🚀 FastCollection: Using cached request categories for category ${categoryId}`)
        return cachedRequestCategories
      }
    }

    try {
      console.log(`🚀 FastCollection: Fetching real request categories for category ${categoryId}`)
      
      // Use the optimized firestoreService with timeout handling
      const snapshot = await firestoreService.getDocs(`projects/${projectId}/requestCategories/${categoryId}/requestCategories`, { timeoutMs: 6000 }) // 6 second timeout
      
      if (snapshot.empty) {
        console.log(`🚀 FastCollection: No request categories found for category ${categoryId}`)
        const emptyResult = []
        cacheService.setCollectionData(`projects/${projectId}/requestCategories/${categoryId}/requestCategories`, { availableOnly }, emptyResult)
        return emptyResult
      }
      
      // Process the real data
      let requestCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        categoryId,
        projectId,
        ...doc.data()
      }))
      
      // Apply client-side filtering
      if (availableOnly) {
        requestCategories = requestCategories.filter(requestCategory => requestCategory.status === 'available')
      }
      
      // Sort by name
      requestCategories.sort((a, b) => (a.englishTitle || '').localeCompare(b.englishTitle || ''))
      
      // Cache the processed data
      cacheService.setCollectionData(`projects/${projectId}/requestCategories/${categoryId}/requestCategories`, { availableOnly }, requestCategories)
      
      console.log(`🚀 FastCollection: Successfully fetched ${requestCategories.length} request categories for category ${categoryId}`)
      return requestCategories
      
    } catch (error) {
      console.warn(`🚀 FastCollection: Error fetching request categories for category ${categoryId}:`, error)
      errorHandlingService.handleFirestoreError(error, 'getRequestCategoriesByCategory')
      return []
    }
  }

  /**
   * Clear all caches (for debugging)
   */
  clearAllCaches() {
    console.log('🗑️ FastCollection: Clearing all caches')
    cacheService.clear()
  }
}

// Create singleton instance
const fastCollectionService = new FastCollectionService()
export default fastCollectionService