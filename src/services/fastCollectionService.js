/**
 * Fast Collection Service - Optimized collection data fetching with real Firebase data
 * Uses caching and timeout handling to ensure fast, reliable data access
 */

import cacheService from './cacheService'
import performanceService from './performanceService'
import firestoreService from './firestoreService'

class FastCollectionService {
  constructor() {
    // No longer using mock data - all data comes from Firebase
  }

  /**
   * Get ads for a project (optimized with real Firebase data)
   */
  async getAds(projectId, useCache = true) {
    return performanceService.timeOperation('getAds', async () => {
      
      // Check cache first
      if (useCache) {
        const cachedAds = cacheService.getCollectionData(`projects/${projectId}/ads`, { active: true })
        if (cachedAds) {
          console.log(`🚀 FastCollection: Using cached ads for project ${projectId}`)
          return cachedAds
        }
      }

      try {
        console.log(`🚀 FastCollection: Fetching real ads for project ${projectId}`)
        
        // Use the optimized firestoreService with timeout handling
        const snapshot = await firestoreService.getDocs(`projects/${projectId}/ads`, 6000) // 6 second timeout
        
        if (snapshot.empty) {
          console.log(`🚀 FastCollection: No ads found for project ${projectId}`)
          const emptyResult = []
          cacheService.setCollectionData(`projects/${projectId}/ads`, { active: true }, emptyResult)
          return emptyResult
        }
        
        // Process the real data
        const ads = snapshot.docs.map(doc => ({
          id: doc.id,
          projectId,
          ...doc.data()
        }))
        
        // Cache the real data
        cacheService.setCollectionData(`projects/${projectId}/ads`, { active: true }, ads)
        
        console.log(`🚀 FastCollection: Successfully fetched ${ads.length} ads for project ${projectId}`)
        return ads
        
      } catch (error) {
        console.warn(`🚀 FastCollection: Error fetching ads for project ${projectId}:`, error.message)
        
        // Return empty array instead of mock data to maintain data integrity
        const emptyResult = []
        cacheService.setCollectionData(`projects/${projectId}/ads`, { active: true }, emptyResult)
        return emptyResult
      }
    })
  }

  /**
   * Get news for a project (optimized with real Firebase data)
   */
  async getNews(projectId, options = {}, useCache = true) {
    
    // Check cache first
    if (useCache) {
      const cachedNews = cacheService.getCollectionData(`projects/${projectId}/news`, options)
      if (cachedNews) {
        console.log(`🚀 FastCollection: Using cached news for project ${projectId}`)
        return cachedNews
      }
    }

    try {
      console.log(`🚀 FastCollection: Fetching real news for project ${projectId}`)
      
      // Use the optimized firestoreService with timeout handling
      const snapshot = await firestoreService.getDocs(`projects/${projectId}/news`, 6000) // 6 second timeout
      
      if (snapshot.empty) {
        console.log(`🚀 FastCollection: No news found for project ${projectId}`)
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
      
      // Apply client-side filtering based on options
      if (options.publishedOnly) {
        news = news.filter(item => item.isPublished !== false)
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
      
      console.log(`🚀 FastCollection: Successfully fetched ${news.length} news items for project ${projectId}`)
      return news
      
    } catch (error) {
      console.warn(`🚀 FastCollection: Error fetching news for project ${projectId}:`, error.message)
      
      // Return empty array instead of mock data to maintain data integrity
      const emptyResult = []
      cacheService.setCollectionData(`projects/${projectId}/news`, options, emptyResult)
      return emptyResult
    }
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
      console.log(`🚀 FastCollection: Fetching real service categories for project ${projectId}`)
      
      // Use the optimized firestoreService with timeout handling
      const snapshot = await firestoreService.getDocs(`projects/${projectId}/serviceCategories`, 6000) // 6 second timeout
      
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
      
      console.log(`🚀 FastCollection: Successfully fetched ${categories.length} service categories for project ${projectId}`)
      return categories
      
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
      console.log(`🚀 FastCollection: Fetching real services for category ${categoryId}`)
      
      // Use the optimized firestoreService with timeout handling
      const snapshot = await firestoreService.getDocs(`projects/${projectId}/serviceCategories/${categoryId}/services`, 6000) // 6 second timeout
      
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
        services = services.filter(service => service.status === 'available')
      }
      
      // Sort by name
      services.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      
      // Cache the processed data
      cacheService.setCollectionData(`projects/${projectId}/serviceCategories/${categoryId}/services`, { availableOnly }, services)
      
      console.log(`🚀 FastCollection: Successfully fetched ${services.length} services for category ${categoryId}`)
      return services
      
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
}

// Create singleton instance
const fastCollectionService = new FastCollectionService()
export default fastCollectionService