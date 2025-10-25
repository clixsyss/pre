import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  Timestamp
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
   * Subscribe to user notifications from the last month
   * @param {string} userId - The user's ID
   * @param {string} projectId - The current project ID
   */
  const subscribeToNotifications = async (userId, projectId) => {
    if (!userId || !projectId) {
      console.warn('NotificationCenter: Cannot subscribe without userId and projectId')
      return
    }

    // Unsubscribe from previous listeners if exist
    if (unsubscribe.value) {
      unsubscribe.value()
    }
    if (unsubscribeReadStatus.value) {
      unsubscribeReadStatus.value()
    }

    isLoading.value = true

    try {
      console.log('NotificationCenter: Setting up subscription...', { userId, projectId })
      
      // Calculate date 1 month ago
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      const oneMonthAgoTimestamp = Timestamp.fromDate(oneMonthAgo)
      
      console.log('NotificationCenter: Date filter - from:', oneMonthAgo.toISOString())

      // Create query for notifications - Using project-specific collection
      const notificationsRef = collection(db, `projects/${projectId}/notifications`)
      console.log('NotificationCenter: Collection ref created for path:', `projects/${projectId}/notifications`)
      
      // Query for notifications - dashboard notifications don't have userId field
      // They have audience.all or audience.uids array, so we need to fetch all and filter
      const q = query(
        notificationsRef,
        where('createdAt', '>=', oneMonthAgoTimestamp),
        orderBy('createdAt', 'desc')
      )
      
      console.log('NotificationCenter: Query created, setting up listener...')

      // Use Web SDK for all platforms - simpler and more reliable
      // Fetch read status once, then use real-time listener
      console.log('NotificationCenter: Using Web SDK with real-time listener (all platforms)')
      
      // First, fetch user's read status from subcollection
      console.log('NotificationCenter: Fetching read status for user:', userId)
      const readStatusRef = collection(db, `users/${userId}/notificationReadStatus`)
      const readStatusSnapshot = await getDocs(readStatusRef).catch(err => {
        console.log('NotificationCenter: Error fetching read status, assuming all unread:', err)
        return { docs: [] }
      })
      
      // Store in reactive ref for updates
      readStatusMap.value = new Map()
      readStatusSnapshot.docs.forEach(doc => {
        readStatusMap.value.set(doc.id, doc.data())
      })
      console.log('NotificationCenter: Fetched read status for', readStatusMap.value.size, 'notifications')
      
      // Set up real-time listener for read status changes
      unsubscribeReadStatus.value = onSnapshot(readStatusRef, (snapshot) => {
        console.log('NotificationCenter: Read status update received:', snapshot.size, 'documents')
        snapshot.forEach((doc) => {
          readStatusMap.value.set(doc.id, doc.data())
        })
        console.log('NotificationCenter: Read status map updated, total:', readStatusMap.value.size)
      })
      
      // Now set up listener
      unsubscribe.value = onSnapshot(q, 
        (snapshot) => {
          console.log('NotificationCenter: Snapshot received!', { size: snapshot.size, empty: snapshot.empty })
          
          // If empty, set loading to false immediately
          if (snapshot.empty) {
            notifications.value = []
            unreadCount.value = 0
            isLoading.value = false
            console.log('NotificationCenter: No notifications found (empty collection)')
            return
          }
          
          const notificationsList = []
          let unreadCounter = 0

          snapshot.forEach((doc) => {
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
              console.log('NotificationCenter: Processing notification:', { id: doc.id, read: isRead, title: data.title_en || data.title })
              notificationsList.push({
                id: doc.id,
                ...data,
                read: isRead // Use read status from user subcollection
              })
              
              if (!isRead) {
                unreadCounter++
              }
            }
          })

          notifications.value = notificationsList
          unreadCount.value = unreadCounter
          isLoading.value = false

          console.log(`NotificationCenter: ✅ Loaded ${notificationsList.length} notifications (${snapshot.size} total, filtered by audience), ${unreadCounter} unread`)
        }, 
        (error) => {
          console.error('NotificationCenter: ❌ onSnapshot error:', error)
          console.error('NotificationCenter: Error code:', error?.code)
          console.error('NotificationCenter: Error message:', error?.message)
          // Set empty state on error
          notifications.value = []
          unreadCount.value = 0
          isLoading.value = false
        }
      )
      
      console.log('NotificationCenter: Listener attached successfully')
    } catch (error) {
      console.error('NotificationCenter: Error setting up subscription:', error)
      console.error('NotificationCenter: Error details:', error?.message, error?.code)
      isLoading.value = false
    }
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

      // Check if iOS to use Capacitor Firebase (use reliable platform detection)
      const platformInfo = detectPlatformFromUrl()
      const isIOS = platformInfo.platform === 'ios' && platformInfo.isNative
      
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
        if (isIOS) {
          // Use Capacitor Firebase for iOS - create read status for each notification
          const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
          
          console.log(`NotificationCenter: iOS - Marking ${unreadNotifs.length} notifications as read...`)
          
          await Promise.all(unreadNotifs.map(notification =>
            FirebaseFirestore.setDocument({
              reference: `users/${userId}/notificationReadStatus/${notification.id}`,
              data: {
                read: true,
                readAt: Date.now()
              },
              merge: true
            })
          ))
          
          console.log(`NotificationCenter: ✅ Marked ${unreadNotifs.length} notifications as read in user collection`)
        } else {
          // Use Web SDK batch for web - create read status for all notifications
          const batch = writeBatch(db)
          
          unreadNotifs.forEach((notification) => {
            const readStatusRef = doc(db, `users/${userId}/notificationReadStatus`, notification.id)
            batch.set(readStatusRef, {
              read: true,
              readAt: Timestamp.now()
            })
          })

          await batch.commit()
          
          console.log(`NotificationCenter: ✅ Marked ${unreadNotifs.length} notifications as read in user collection`)
        }
      } catch (firestoreError) {
        // Rollback local state changes if Firestore write fails
        console.error('NotificationCenter: Firestore write failed, rolling back local state:', firestoreError)
        unreadNotifs.forEach(notification => {
          readStatusMap.value.delete(notification.id)
          notification.read = false
        })
        unreadCount.value = originalUnreadCount
        throw firestoreError
      }
    } catch (error) {
      console.error('NotificationCenter: Error marking all notifications as read:', { code: error?.code, errorMessage: error?.message })
      throw error
    }
  }

  /**
   * Unsubscribe from notifications
   */
  const unsubscribeFromNotifications = () => {
    if (unsubscribe.value) {
      unsubscribe.value()
      unsubscribe.value = null
      console.log('NotificationCenter: Unsubscribed from notifications')
    }
    if (unsubscribeReadStatus.value) {
      unsubscribeReadStatus.value()
      unsubscribeReadStatus.value = null
      console.log('NotificationCenter: Unsubscribed from read status')
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
    markAsRead,
    markAllAsRead,
    unsubscribeFromNotifications,
    clearNotifications,
    toggleModal,
    openModal,
    closeModal
  }
})

