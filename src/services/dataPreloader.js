import { useServiceCategoriesStore } from '../stores/serviceCategoriesStore'
import { useServiceBookingStore } from '../stores/serviceBookingStore'
import { useRequestCategoriesStore } from '../stores/requestCategoriesStore'
import { useCartStore } from '../stores/cartStore'
import { useNotificationCenterStore } from '../stores/notificationCenter'
import optimizedAuthService from './optimizedAuthService'
import requestSubmissionService from './requestSubmissionService'

/**
 * DataPreloader - Intelligently preloads app data in the background
 * Loads data in priority order for optimal perceived performance
 */
class DataPreloader {
  constructor() {
    this.isPreloading = false
    this.preloadComplete = false
    this.preloadPromise = null
  }

  /**
   * Start preloading all app data
   * @param {string} userId - Current user ID
   * @param {string} projectId - Current project ID
   */
  async preloadAppData(userId, projectId) {
    // Prevent multiple simultaneous preloads
    if (this.isPreloading) {
      console.log('⏳ DataPreloader: Preload already in progress, returning existing promise')
      return this.preloadPromise
    }

    console.log('🚀 DataPreloader: Starting background data preload...')
    this.isPreloading = true
    
    this.preloadPromise = this._executePreload(userId, projectId)
    
    try {
      await this.preloadPromise
      this.preloadComplete = true
      console.log('✅ DataPreloader: All data preloaded successfully!')
    } catch (error) {
      console.error('❌ DataPreloader: Error during preload:', error)
    } finally {
      this.isPreloading = false
    }

    return this.preloadPromise
  }

  /**
   * Execute the actual preload logic
   */
  async _executePreload(userId, projectId) {
    if (!userId || !projectId) {
      console.warn('⚠️ DataPreloader: Missing userId or projectId, skipping preload')
      return
    }

    // Get store instances
    const serviceCategoriesStore = useServiceCategoriesStore()
    const serviceBookingStore = useServiceBookingStore()
    const requestCategoriesStore = useRequestCategoriesStore()
    const cartStore = useCartStore()
    const notificationCenterStore = useNotificationCenterStore()

    try {
      // ==========================================
      // PHASE 1: CRITICAL DATA (Parallel)
      // These are the TOP 3 most important items:
      // 1. Profile Page Data
      // 2. Service Bookings
      // 3. Request Submissions
      // ==========================================
      console.log('📊 DataPreloader: Phase 1 - Loading TOP 3 CRITICAL data...')
      
      const phase1Results = await Promise.allSettled([
        // 1️⃣ User profile data (for Profile Page)
        this._loadUserProfile(),
        // 2️⃣ User's service bookings (for My Bookings page)
        serviceBookingStore.fetchUserBookings(projectId, userId),
        // 3️⃣ User's request submissions (for Requests page)
        this._loadUserRequestSubmissions(userId, projectId)
      ])

      // Log Phase 1 results
      phase1Results.forEach((result, index) => {
        const names = ['Profile', 'Service Bookings', 'Request Submissions']
        if (result.status === 'fulfilled') {
          console.log(`✅ DataPreloader Phase 1 [${names[index]}]: Success`)
        } else {
          console.error(`❌ DataPreloader Phase 1 [${names[index]}]: Failed`, result.reason)
        }
      })

      console.log('✅ DataPreloader: Phase 1 complete - TOP 3 CRITICAL items loaded!')

      // ==========================================
      // PHASE 2: Frequently Accessed Data (Parallel)
      // Load data user will likely need soon
      // ==========================================
      console.log('📊 DataPreloader: Phase 2 - Loading frequently accessed data...')
      
      const phase2Results = await Promise.allSettled([
        // Service categories (for Services page)
        serviceCategoriesStore.fetchCategories(projectId),
        // Request categories (for Requests page)
        requestCategoriesStore.fetchCategories(projectId),
        // Notifications (for notification bell)
        notificationCenterStore.fetchNotifications(userId, projectId),
        // Shopping cart (loads from localStorage)
        Promise.resolve(cartStore.loadCart())
      ])

      // Log Phase 2 results
      phase2Results.forEach((result, index) => {
        const names = ['Service Categories', 'Request Categories', 'Notifications', 'Shopping Cart']
        if (result.status === 'fulfilled') {
          console.log(`✅ DataPreloader Phase 2 [${names[index]}]: Success`)
        } else {
          console.error(`❌ DataPreloader Phase 2 [${names[index]}]: Failed`, result.reason)
        }
      })

      console.log('✅ DataPreloader: Phase 2 complete')

      // ==========================================
      // PHASE 3: Secondary Data (Sequential, Low Priority)
      // Load less critical data in background
      // ==========================================
      console.log('📊 DataPreloader: Phase 3 - Loading secondary data...')
      
      // Use setTimeout to defer this even further (non-blocking)
      setTimeout(async () => {
        try {
          await Promise.allSettled([
            // Add any other data sources here
            // Examples: News feed, guidelines, etc.
            this._loadAdditionalData()
          ])
          console.log('✅ DataPreloader: Phase 3 complete')
        } catch (error) {
          console.error('⚠️ DataPreloader: Phase 3 error (non-critical):', error)
        }
      }, 1000) // Defer by 1 second

    } catch (error) {
      console.error('❌ DataPreloader: Critical error during preload:', error)
      throw error
    }
  }

  /**
   * Load user profile data
   */
  async _loadUserProfile() {
    try {
      console.log('👤 DataPreloader: Loading user profile...')
      const user = await optimizedAuthService.getCurrentUser()
      if (!user) {
        console.warn('⚠️ DataPreloader: No user found')
      } else {
        console.log('✅ DataPreloader: User profile loaded')
      }
    } catch (error) {
      console.error('❌ DataPreloader: Error loading user profile:', error)
      throw error
    }
  }

  /**
   * Load user request submissions
   */
  async _loadUserRequestSubmissions(userId, projectId) {
    try {
      console.log('📝 DataPreloader: Loading user request submissions...')
      const submissions = await requestSubmissionService.getUserSubmissions(projectId, userId)
      console.log(`✅ DataPreloader: ${submissions.length} request submissions loaded`)
      return submissions
    } catch (error) {
      console.error('❌ DataPreloader: Error loading request submissions:', error)
      // Don't throw - this shouldn't block the entire preload
      return []
    }
  }

  /**
   * Load additional non-critical data
   */
  async _loadAdditionalData() {
    try {
      console.log('📦 DataPreloader: Loading additional data...')
      // Add any additional data loading here
      // Examples:
      // - News feed items
      // - Guidelines
      // - Store categories
      // - etc.
    } catch (error) {
      console.error('⚠️ DataPreloader: Error loading additional data:', error)
      // Don't throw - this is non-critical
    }
  }

  /**
   * Reset preloader state (useful for logout/project switch)
   */
  reset() {
    console.log('🔄 DataPreloader: Resetting preloader state')
    this.isPreloading = false
    this.preloadComplete = false
    this.preloadPromise = null
  }

  /**
   * Check if preload is complete
   */
  isComplete() {
    return this.preloadComplete
  }
}

// Export singleton instance
export const dataPreloader = new DataPreloader()

// Export composable for Vue components
export function useDataPreloader() {
  return {
    preloadAppData: dataPreloader.preloadAppData.bind(dataPreloader),
    reset: dataPreloader.reset.bind(dataPreloader),
    isComplete: dataPreloader.isComplete.bind(dataPreloader)
  }
}

