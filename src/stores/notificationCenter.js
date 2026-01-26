import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp,
  limit
} from 'firebase/firestore'
import { smartMirrorDb as db, detectPlatformFromUrl } from '../boot/smartMirrorFirebase'

export const useNotificationCenterStore = defineStore('notificationCenter', () => {
  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const unsubscribe = ref(null)
  const unsubscribeReadStatus = ref(null)
  const isModalOpen = ref(false)
  const readStatusMap = ref(new Map()) // Store read status for persistence
  const pollingInterval = ref(null) // Polling interval for periodic updates
  const lastFetchTime = ref(null) // Track last fetch to prevent duplicate fetches
  const POLLING_INTERVAL_MS = 5 * 60 * 1000 // Poll every 5 minutes (reduced from real-time)
  const CACHE_DURATION_MS = 2 * 60 * 1000 // Cache for 2 minutes

  // Computed
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  )

  const sortedNotifications = computed(() => 
    [...notifications.value].sort((a, b) => {
      // Sort by timestamp, most recent first
      // Handle different timestamp formats (Firestore web SDK vs Capacitor Firebase)
      const aTime = a.createdAt || a.scheduledAt || 0
      const bTime = b.createdAt || b.scheduledAt || 0
      
      // Convert to milliseconds if needed
      let aMs, bMs
      
      // Handle Firestore Timestamp objects (web SDK)
      if (aTime && typeof aTime.toMillis === 'function') {
        aMs = aTime.toMillis()
      }
      // Handle plain objects with seconds property (Capacitor Firebase)
      else if (aTime && typeof aTime === 'object' && aTime.seconds) {
        aMs = aTime.seconds * 1000
      }
      // Handle plain numbers
      else if (typeof aTime === 'number') {
        aMs = aTime
      } else {
        aMs = 0
      }
      
      // Same for bTime
      if (bTime && typeof bTime.toMillis === 'function') {
        bMs = bTime.toMillis()
      }
      else if (bTime && typeof bTime === 'object' && bTime.seconds) {
        bMs = bTime.seconds * 1000
      }
      else if (typeof bTime === 'number') {
        bMs = bTime
      } else {
        bMs = 0
      }
      
      return bMs - aMs // Newest first
    })
  )

  /**
   * Fetch notifications manually (polling-based, not real-time)
   * COST OPTIMIZATION: Replaces onSnapshot with periodic getDocs calls
   * @param {string} userId - The user's ID
   * @param {string} projectId - The current project ID
   */
  const fetchNotifications = async (userId, projectId) => {
    if (!userId || !projectId) {
      console.warn('NotificationCenter: Cannot fetch without userId and projectId')
      return
    }

    // Check cache to prevent duplicate fetches
    if (lastFetchTime.value && Date.now() - lastFetchTime.value < CACHE_DURATION_MS) {
      console.log('NotificationCenter: ⚡ Using cached data (fetched', Math.round((Date.now() - lastFetchTime.value) / 1000), 'seconds ago)')
      return
    }

    isLoading.value = true

    try {
      console.log('NotificationCenter: 📊 Fetching notifications (polling mode)...', { userId, projectId })
      
      // Use DynamoDB service first
      try {
        // Dynamically import to avoid build-time errors
        let getNotificationsByProject
        try {
          const dynamoDBModule = await import('../services/dynamoDBNotificationsService')
          getNotificationsByProject = dynamoDBModule.getNotificationsByProject || dynamoDBModule.default?.getNotificationsByProject
        } catch (importError) {
          console.warn('⚠️ Failed to import DynamoDB notifications service:', importError)
          throw importError // Re-throw to trigger Firestore fallback
        }
        
        if (!getNotificationsByProject) {
          throw new Error('getNotificationsByProject function not found')
        }
        
        // Calculate date 1 month ago for filtering
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        
        // Fetch notifications from DynamoDB
        const allNotifications = await getNotificationsByProject(projectId, {
          limit: 100 // Fetch more to filter by date and audience
        })
        
        // Filter by date (last month) and audience targeting
        const notificationsList = []
        let unreadCounter = 0
        
        allNotifications.forEach((notif) => {
          // Filter by date
          if (!notif.createdAt) return
          const notifDate = new Date(notif.createdAt)
          if (notifDate < oneMonthAgo) return
          
          // Filter notifications based on audience targeting
          let isForCurrentUser = false
          
          // Check if this is a dashboard notification (has audience field)
          if (notif.audience) {
            // Check if sent to all users
            if (notif.audience.all) {
              isForCurrentUser = true
            }
            // Check if sent to specific users
            else if (notif.audience.uids && Array.isArray(notif.audience.uids)) {
              isForCurrentUser = notif.audience.uids.includes(userId)
            }
          }
          // Check if this is an in-app notification (has userId field)
          else if (notif.userId === userId) {
            isForCurrentUser = true
          }
          
          // Only include notifications meant for this user
          if (isForCurrentUser) {
            notificationsList.push(notif)
            
            if (!notif.read) {
              unreadCounter++
            }
          }
        })
        
        // Limit to 50 most recent
        const recentNotifications = notificationsList.slice(0, 50)
        
        // FETCH 2: Get user's read status from DynamoDB (PRE app uses AWS)
        let readStatusMapFromDb = new Map()
        try {
          const { usersNotificationReadStatusService } = await import('../services/dynamoDBTableServices')
          readStatusMapFromDb = await usersNotificationReadStatusService.getAllReadStatuses(userId)
          readStatusMap.value = readStatusMapFromDb
          console.log(`NotificationCenter: Fetched read status from DynamoDB for ${readStatusMapFromDb.size} notifications`)
        } catch (readErr) {
          console.log('NotificationCenter: Error fetching read status from DynamoDB, assuming all unread:', readErr)
          readStatusMap.value = new Map()
        }
        
        // Apply read status from DynamoDB
        recentNotifications.forEach(notif => {
          const readStatus = readStatusMap.value.get(notif.id)
          if (readStatus) {
            notif.read = readStatus.read || false
          }
        })
        
        // Recalculate unread count after applying read status
        unreadCounter = recentNotifications.filter(n => !n.read).length
        
        notifications.value = recentNotifications
        unreadCount.value = unreadCounter
        lastFetchTime.value = Date.now()
        isLoading.value = false
        
        console.log(`NotificationCenter: ✅ Loaded ${recentNotifications.length} notifications from DynamoDB, ${unreadCounter} unread [Read status from DynamoDB]`)
        return
      } catch (dynamoError) {
        console.warn('⚠️ DynamoDB fetch failed, falling back to Firestore:', dynamoError)
        
        // Fallback to Firestore
        // Calculate date 1 month ago
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        const oneMonthAgoTimestamp = Timestamp.fromDate(oneMonthAgo)

        // Create query for notifications - Using project-specific collection
        const notificationsRef = collection(db, `projects/${projectId}/notifications`)
        
        // Query for notifications - AGGRESSIVE OPTIMIZATION with limit
        const q = query(
          notificationsRef,
          where('createdAt', '>=', oneMonthAgoTimestamp),
          orderBy('createdAt', 'desc'),
          limit(50) // AGGRESSIVE: Limit to 50 most recent notifications
        )
        
        console.log('NotificationCenter: ⚡ Fetching with limit(50) to reduce Firebase reads')
        
        // FETCH 1: Get notifications (1 read = 50 documents max)
        const notificationsSnapshot = await getDocs(q)
        console.log(`NotificationCenter: Fetched ${notificationsSnapshot.size} notifications from Firestore (fallback) [Reads: ${notificationsSnapshot.size}]`)
        
        // FETCH 2: Get user's read status from DynamoDB (PRE app uses AWS; keeps read state consistent)
        try {
          const { usersNotificationReadStatusService } = await import('../services/dynamoDBTableServices')
          const mapFromDb = await usersNotificationReadStatusService.getAllReadStatuses(userId)
          readStatusMap.value = mapFromDb
          console.log(`NotificationCenter: Fetched read status from DynamoDB for ${mapFromDb.size} notifications`)
        } catch (readErr) {
          console.log('NotificationCenter: Error fetching read status from DynamoDB, assuming all unread:', readErr)
          readStatusMap.value = new Map()
        }
        
        // Process notifications
        if (notificationsSnapshot.empty) {
          notifications.value = []
          unreadCount.value = 0
          isLoading.value = false
          lastFetchTime.value = Date.now()
          console.log('NotificationCenter: No notifications found')
          return
        }
        
        const notificationsList = []
        let unreadCounter = 0

        notificationsSnapshot.forEach((doc) => {
          const data = doc.data()
          const readStatus = readStatusMap.value.get(doc.id)
          const isRead = readStatus?.read || false
          
          // Filter notifications based on audience targeting
          let isForCurrentUser = false
          
          // Check if this is a dashboard notification (has audience field)
          if (data.audience) {
            // Check if sent to all users
            if (data.audience.all) {
              isForCurrentUser = true
            }
            // Check if sent to specific users
            else if (data.audience.uids && Array.isArray(data.audience.uids)) {
              isForCurrentUser = data.audience.uids.includes(userId)
            }
          }
          // Check if this is an in-app notification (has userId field)
          else if (data.userId === userId) {
            isForCurrentUser = true
          }
          
          // Only include notifications meant for this user
          if (isForCurrentUser) {
            notificationsList.push({
              id: doc.id,
              ...data,
              read: isRead
            })
            
            if (!isRead) {
              unreadCounter++
            }
          }
        })

        notifications.value = notificationsList
        unreadCount.value = unreadCounter
        lastFetchTime.value = Date.now()
        isLoading.value = false

        console.log(`NotificationCenter: ✅ Loaded ${notificationsList.length} notifications (${notificationsSnapshot.size} total), ${unreadCounter} unread [Read status from DynamoDB]`)
      } // End of catch (dynamoError) - Firestore fallback
    } catch (error) {
      console.error('NotificationCenter: ❌ Error fetching notifications:', error)
      isLoading.value = false
    }
  }

  /**
   * Subscribe to user notifications using POLLING (not real-time)
   * COST OPTIMIZATION: Replaces onSnapshot with periodic getDocs calls
   * @param {string} userId - The user's ID
   * @param {string} projectId - The current project ID
   */
  const subscribeToNotifications = async (userId, projectId) => {
    if (!userId || !projectId) {
      console.warn('NotificationCenter: Cannot subscribe without userId and projectId')
      return
    }

    // Stop any existing polling
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }

    console.log('NotificationCenter: 🔄 Starting polling mode (every 5 minutes) to reduce costs')
    
    // Initial fetch
    await fetchNotifications(userId, projectId)
    
    // Set up polling interval
    pollingInterval.value = setInterval(async () => {
      console.log('NotificationCenter: 🔄 Polling for new notifications...')
      await fetchNotifications(userId, projectId)
    }, POLLING_INTERVAL_MS)
    
    console.log('NotificationCenter: ✅ Polling started successfully')
  }

  /**
   * Mark a notification as read.
   * READ STATUS IS STORED IN AWS DYNAMODB ONLY — never Firestore.
   * Uses users__notificationReadStatus table via usersNotificationReadStatusService.
   * @param {string} notificationId - The notification ID
   * @param {string} userId - The current user ID
   */
  const markAsRead = async (notificationId, userId) => {
    try {
      if (!userId) {
        console.error('NotificationCenter: userId required to mark as read')
        return
      }

      console.log(`NotificationCenter: Marking notification ${notificationId} as read for user ${userId}`)

      const { usersNotificationReadStatusService } = await import('../services/dynamoDBTableServices')
      await usersNotificationReadStatusService.markAsRead(userId, notificationId)
      console.log(`NotificationCenter: ✅ Notification ${notificationId} marked as read in DynamoDB (AWS)`)

      readStatusMap.value.set(notificationId, { read: true, readAt: Date.now() })

      const idx = notifications.value.findIndex(n => n.id === notificationId)
      if (idx !== -1) {
        const next = [...notifications.value]
        next[idx] = { ...next[idx], read: true }
        notifications.value = next
        unreadCount.value = Math.max(0, unreadCount.value - 1)
        console.log(`NotificationCenter: Local state updated - ${unreadCount.value} unread remaining`)
      }
    } catch (error) {
      console.error('NotificationCenter: ❌ Error marking notification as read (AWS):', {
        notificationId,
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      })
      throw error
    }
  }

  /**
   * Mark all notifications as read.
   * READ STATUS IS STORED IN AWS DYNAMODB ONLY — never Firestore.
   * Uses users__notificationReadStatus table via usersNotificationReadStatusService.
   * @param {string} userId - The current user ID
   */
  const markAllAsRead = async (userId) => {
    try {
      if (!userId) {
        console.error('NotificationCenter: userId required to mark all as read')
        return
      }
      
      const unreadNotifs = notifications.value.filter(n => !n.read)

      if (unreadNotifs.length === 0) {
        console.log('NotificationCenter: No unread notifications to mark')
        return
      }

      // Platform detection for logging (DynamoDB works on all platforms)
      const platformInfo = detectPlatformFromUrl()
      console.log('NotificationCenter: Mark all as read - Platform:', platformInfo)
      
      // Store original unread count for potential rollback
      const originalUnreadCount = unreadCount.value
      
      const unreadIds = new Set(unreadNotifs.map(n => n.id))
      unreadNotifs.forEach(notification => {
        readStatusMap.value.set(notification.id, { read: true, readAt: Date.now() })
      })

      // Replace array to trigger Vue reactivity (avoid in-place mutation)
      notifications.value = notifications.value.map(n =>
        unreadIds.has(n.id) ? { ...n, read: true } : n
      )
      unreadCount.value = 0

      console.log(`NotificationCenter: Local state updated - ${unreadCount.value} unread`)

      const { usersNotificationReadStatusService } = await import('../services/dynamoDBTableServices')
      const notificationIds = unreadNotifs.map(n => n.id)

      try {
        await usersNotificationReadStatusService.markMultipleAsRead(userId, notificationIds)
        console.log(`NotificationCenter: ✅ Successfully marked ${unreadNotifs.length} notifications as read in DynamoDB (AWS)`)
      } catch (dynamoError) {
        console.error('NotificationCenter: DynamoDB (AWS) mark-all-as-read failed:', dynamoError)
        unreadNotifs.forEach(({ id }) => readStatusMap.value.delete(id))
        notifications.value = notifications.value.map(n =>
          unreadIds.has(n.id) ? { ...n, read: false } : n
        )
        unreadCount.value = originalUnreadCount
        throw dynamoError
      }
    } catch (error) {
      console.error('NotificationCenter: Error marking all notifications as read:', { code: error?.code, errorMessage: error?.message })
      throw error
    }
  }

  /**
   * Unsubscribe from notifications (stop polling)
   */
  const unsubscribeFromNotifications = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
      console.log('NotificationCenter: Stopped polling')
    }
    // Legacy cleanup (kept for backwards compatibility)
    if (unsubscribe.value) {
      unsubscribe.value()
      unsubscribe.value = null
    }
    if (unsubscribeReadStatus.value) {
      unsubscribeReadStatus.value()
      unsubscribeReadStatus.value = null
    }
  }

  /**
   * Clear all notifications (for cleanup)
   */
  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
    unsubscribeFromNotifications()
  }

  /**
   * Toggle modal visibility
   */
  const toggleModal = () => {
    isModalOpen.value = !isModalOpen.value
  }

  const openModal = () => {
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
  }

  /**
   * Update app badge when unread count changes (iOS/Android)
   */
  watch(unreadCount, async (newCount) => {
    try {
      console.log('NotificationCenter: Updating app badge to:', newCount)
      
      // Lazy load Badge plugin to avoid bundling issues
      const { Badge } = await import('@capawesome/capacitor-badge')
      
      if (newCount > 0) {
        await Badge.set({ count: newCount })
        console.log('NotificationCenter: Badge set to', newCount)
      } else {
        await Badge.clear()
        console.log('NotificationCenter: Badge cleared')
      }
    } catch (error) {
      console.error('NotificationCenter: Error updating badge:', error)
      // Badge plugin may not be available on web, ignore error
    }
  })

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    isModalOpen,
    
    // Computed
    unreadNotifications,
    sortedNotifications,
    
    // Methods
    subscribeToNotifications,
    fetchNotifications, // Manual refresh function
    markAsRead,
    markAllAsRead,
    unsubscribeFromNotifications,
    clearNotifications,
    toggleModal,
    openModal,
    closeModal
  }
})

