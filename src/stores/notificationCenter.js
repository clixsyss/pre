import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  // onSnapshot removed - using polling instead for cost optimization
  doc,
  setDoc,
  getDocs,
  writeBatch,
  Timestamp,
  limit
} from 'firebase/firestore'
import { db, detectPlatformFromUrl } from '../boot/firebase'

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
        
        // FETCH 2: Get user's read status from subcollection (LIMITED to 100 most recent)
        // CRITICAL FIX: Add limit to prevent reading thousands of read status documents
        const readStatusRef = collection(db, `users/${userId}/notificationReadStatus`)
        const readStatusQuery = query(readStatusRef, limit(100)) // LIMIT to 100 most recent read statuses
        const readStatusSnapshot = await getDocs(readStatusQuery).catch(err => {
          console.log('NotificationCenter: Error fetching read status, assuming all unread:', err)
          return { docs: [] }
        })
        
        // Update read status map
        readStatusMap.value = new Map()
        readStatusSnapshot.docs.forEach(doc => {
          readStatusMap.value.set(doc.id, doc.data())
        })
        console.log(`NotificationCenter: Fetched read status for ${readStatusMap.value.size} notifications [Reads: ${readStatusSnapshot.size}]`)
        
        // Apply read status from Firestore
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
        
        console.log(`NotificationCenter: ✅ Loaded ${recentNotifications.length} notifications from DynamoDB, ${unreadCounter} unread [Total Reads: ${readStatusSnapshot.size}]`)
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
        
        // FETCH 2: Get user's read status from subcollection (LIMITED to 100 most recent)
        // CRITICAL FIX: Add limit to prevent reading thousands of read status documents
        const readStatusRef = collection(db, `users/${userId}/notificationReadStatus`)
        const readStatusQuery = query(readStatusRef, limit(100)) // LIMIT to 100 most recent read statuses
        const readStatusSnapshot = await getDocs(readStatusQuery).catch(err => {
          console.log('NotificationCenter: Error fetching read status, assuming all unread:', err)
          return { docs: [] }
        })
        
        // Update read status map
        readStatusMap.value = new Map()
        readStatusSnapshot.docs.forEach(doc => {
          readStatusMap.value.set(doc.id, doc.data())
        })
        console.log(`NotificationCenter: Fetched read status for ${readStatusMap.value.size} notifications [Reads: ${readStatusSnapshot.size}]`)
        
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

        console.log(`NotificationCenter: ✅ Loaded ${notificationsList.length} notifications (${notificationsSnapshot.size} total), ${unreadCounter} unread [Total Reads: ${notificationsSnapshot.size + readStatusSnapshot.size}]`)
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
   * Mark a notification as read
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
      
      // Check if iOS to use Capacitor Firebase
      const { Capacitor } = await import('@capacitor/core')
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
      
      if (isIOS) {
        // Use Capacitor Firebase for iOS - store read status in user subcollection
        const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
        
        try {
          await FirebaseFirestore.setDocument({
            reference: `users/${userId}/notificationReadStatus/${notificationId}`,
            data: {
              read: true,
              readAt: Date.now()
            },
            merge: true // Changed to true to properly merge/create document
          })
          
          console.log(`NotificationCenter: ✅ iOS - Notification ${notificationId} marked as read (verified)`)
        } catch (iosError) {
          console.error('NotificationCenter: ❌ iOS - Failed to mark as read:', iosError)
          throw iosError
        }
      } else {
        // Use Web SDK for web - store read status in user subcollection
        const readStatusRef = doc(db, `users/${userId}/notificationReadStatus`, notificationId)
        
        try {
          await setDoc(readStatusRef, {
            read: true,
            readAt: Timestamp.now()
          }, { merge: true }) // Explicitly set merge option
          
          console.log(`NotificationCenter: ✅ Web - Notification ${notificationId} marked as read (verified)`)
        } catch (webError) {
          console.error('NotificationCenter: ❌ Web - Failed to mark as read:', webError)
          throw webError
        }
      }
      
      // Update read status map so listener uses correct status
      readStatusMap.value.set(notificationId, { read: true, readAt: Date.now() })
      
      // Update local state only after successful database write
      const notif = notifications.value.find(n => n.id === notificationId)
      if (notif) {
        notif.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
        console.log(`NotificationCenter: Local state updated - ${unreadCount.value} unread remaining`)
      }
    } catch (error) {
      console.error('NotificationCenter: ❌ Error marking notification as read:', { 
        notificationId,
        code: error?.code, 
        message: error?.message,
        stack: error?.stack
      })
      // Re-throw to let caller know it failed
      throw error
    }
  }

  /**
   * Mark all notifications as read
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
      
      // Update read status map FIRST (before Firestore write)
      unreadNotifs.forEach(notification => {
        readStatusMap.value.set(notification.id, { read: true, readAt: Date.now() })
      })
      
      // Update local state FIRST (before Firestore write)
      unreadNotifs.forEach(notif => {
        notif.read = true
      })
      unreadCount.value = 0
      
      console.log(`NotificationCenter: Local state updated - ${unreadCount.value} unread`)
      
      try {
        // Use DynamoDB for read status (more reliable than Firestore)
        const { usersNotificationReadStatusService } = await import('../services/dynamoDBTableServices')
        
        console.log(`NotificationCenter: Using DynamoDB to mark ${unreadNotifs.length} notifications as read...`)
        const notificationIds = unreadNotifs.map(n => n.id)
        
        await usersNotificationReadStatusService.markMultipleAsRead(userId, notificationIds)
        
        console.log(`NotificationCenter: ✅ Successfully marked ${unreadNotifs.length} notifications as read in DynamoDB`)
      } catch (dynamoError) {
        // Fallback to Firestore if DynamoDB fails
        console.warn(`NotificationCenter: DynamoDB failed, falling back to Firestore:`, dynamoError)
        
        try {
          const batch = writeBatch(db)
          
          unreadNotifs.forEach((notification) => {
            const readStatusRef = doc(db, `users/${userId}/notificationReadStatus`, notification.id)
            batch.set(readStatusRef, {
              read: true,
              readAt: Timestamp.now()
            })
          })

          await batch.commit()
          console.log(`NotificationCenter: ✅ Firestore fallback - Successfully marked ${unreadNotifs.length} notifications as read`)
        } catch (firestoreError) {
          console.error('NotificationCenter: Both DynamoDB and Firestore failed:', firestoreError)
          // Rollback local state changes if all writes fail
          unreadNotifs.forEach(notification => {
            readStatusMap.value.delete(notification.id)
            notification.read = false
          })
          unreadCount.value = originalUnreadCount
          throw firestoreError
        }
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

