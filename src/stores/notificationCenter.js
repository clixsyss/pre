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
  writeBatch,
  Timestamp
} from 'firebase/firestore'
import { db } from '../boot/firebase'

export const useNotificationCenterStore = defineStore('notificationCenter', () => {
  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const unsubscribe = ref(null)
  const isModalOpen = ref(false)

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

    // Unsubscribe from previous listener if exists
    if (unsubscribe.value) {
      unsubscribe.value()
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

      // For iOS, use a simpler approach - just fetch once instead of real-time listener
      // The real-time listener doesn't work properly with Capacitor Firebase on iOS
      const { Capacitor } = await import('@capacitor/core')
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
      
      if (isIOS) {
        console.log('NotificationCenter: iOS detected - using Capacitor Firebase instead of listener')
        
        // Use Capacitor Firebase Firestore for iOS
        const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
        
        try {
          // Fetch using Capacitor plugin - fetch all notifications and filter client-side
          // The compositeFilter format is complex and unreliable, so we fetch all recent ones
          console.log('NotificationCenter: Fetching notifications via Capacitor Firebase...')
          
          const getDocsPromise = FirebaseFirestore.getCollection({
            reference: `projects/${projectId}/notifications`
          })
          
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Notification fetch timeout')), 10000)
          )
          
          const result = await Promise.race([getDocsPromise, timeoutPromise])
          const allSnapshots = result.snapshots || []
          
          console.log('NotificationCenter: Raw snapshots received:', allSnapshots.length)
          
          // Log first notification to see structure
          if (allSnapshots.length > 0) {
            console.log('NotificationCenter: First notification sample:', {
              id: allSnapshots[0].id,
              hasData: !!allSnapshots[0].data,
              hasCreatedAt: !!allSnapshots[0].data?.createdAt,
              createdAtValue: allSnapshots[0].data?.createdAt,
              createdAtType: typeof allSnapshots[0].data?.createdAt,
              allFields: Object.keys(allSnapshots[0].data || {})
            })
          }
          
          // Filter by date client-side (last 30 days)
          const oneMonthAgoMs = oneMonthAgoTimestamp.toMillis()
          const snapshots = allSnapshots.filter(snap => {
            const createdAt = snap.data?.createdAt
            
            // If no createdAt field, include it (dashboard notifications may not have this)
            if (!createdAt) {
              console.log('NotificationCenter: No createdAt field, including notification:', snap.id)
              return true
            }
            
            // Handle different timestamp formats
            let timestampMs
            if (typeof createdAt === 'number') {
              timestampMs = createdAt
            } else if (createdAt.seconds) {
              timestampMs = createdAt.seconds * 1000
            } else if (createdAt.toMillis) {
              timestampMs = createdAt.toMillis()
            } else {
              console.log('NotificationCenter: Unknown timestamp format, including notification:', snap.id, createdAt)
              return true // Include if we can't determine age
            }
            
            const isRecent = timestampMs >= oneMonthAgoMs
            if (!isRecent) {
              console.log('NotificationCenter: Notification too old:', snap.id, new Date(timestampMs).toISOString())
            }
            return isRecent
          })
          
          console.log('NotificationCenter: After date filter:', snapshots.length, 'of', allSnapshots.length)
          
          console.log('NotificationCenter: Snapshot received (iOS)!', { size: snapshots.length, empty: snapshots.length === 0 })
          
          if (snapshots.length === 0) {
            notifications.value = []
            unreadCount.value = 0
            isLoading.value = false
            console.log('NotificationCenter: No notifications found (empty collection)')
            return
          }
          
          // Fetch user's read status for all notifications
          console.log('NotificationCenter: Fetching read status for user:', userId)
          const readStatusResult = await FirebaseFirestore.getCollection({
            reference: `users/${userId}/notificationReadStatus`
          }).catch(err => {
            console.log('NotificationCenter: Error fetching read status, assuming all unread:', err)
            return { snapshots: [] }
          })
          
          const readStatusMap = new Map()
          if (readStatusResult?.snapshots) {
            readStatusResult.snapshots.forEach(snap => {
              readStatusMap.set(snap.id, snap.data)
            })
            console.log('NotificationCenter: Fetched read status for', readStatusMap.size, 'notifications')
          }
          
          const notificationsList = []
          let unreadCounter = 0

          snapshots.forEach((doc) => {
            const data = doc.data
            const readStatus = readStatusMap.get(doc.id)
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
                read: isRead
              })
              
              if (!isRead) {
                unreadCounter++
              }
            }
          })

          // Sort notifications by newest first (if they have createdAt)
          notificationsList.sort((a, b) => {
            const aTime = a.createdAt || a.scheduledAt || 0
            const bTime = b.createdAt || b.scheduledAt || 0
            
            // Convert to milliseconds if needed
            const aMs = typeof aTime === 'number' ? aTime : (aTime.seconds ? aTime.seconds * 1000 : 0)
            const bMs = typeof bTime === 'number' ? bTime : (bTime.seconds ? bTime.seconds * 1000 : 0)
            
            return bMs - aMs // Newest first
          })

          notifications.value = notificationsList
          unreadCount.value = unreadCounter
          isLoading.value = false

          console.log(`NotificationCenter: ✅ Loaded ${notificationsList.length} notifications (${snapshots.length} total, filtered by audience), ${unreadCounter} unread`)
        } catch (error) {
          console.error('NotificationCenter: ❌ getDocs error:', error)
          notifications.value = []
          unreadCount.value = 0
          isLoading.value = false
        }
        
        return
      }

      // For web, use real-time listener
      console.log('NotificationCenter: Web detected - using real-time listener')
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
              console.log('NotificationCenter: Processing notification:', { id: doc.id, read: data.read, title: data.title_en || data.title })
              notificationsList.push({
                id: doc.id,
                ...data
              })
              
              if (!data.read) {
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
      
      // Check if iOS to use Capacitor Firebase
      const { Capacitor } = await import('@capacitor/core')
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
      
      if (isIOS) {
        // Use Capacitor Firebase for iOS - store read status in user subcollection
        const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
        await FirebaseFirestore.setDocument({
          reference: `users/${userId}/notificationReadStatus/${notificationId}`,
          data: {
            read: true,
            readAt: Date.now()
          },
          merge: false
        })
        
        console.log(`NotificationCenter: ✅ Marked notification ${notificationId} as read in user collection`)
      } else {
        // Use Web SDK for web - store read status in user subcollection
        const readStatusRef = doc(db, `users/${userId}/notificationReadStatus`, notificationId)
        await setDoc(readStatusRef, {
          read: true,
          readAt: Timestamp.now()
        })
        
        console.log(`NotificationCenter: ✅ Marked notification ${notificationId} as read in user collection`)
      }
      
      // Update local state
      const notif = notifications.value.find(n => n.id === notificationId)
      if (notif) {
        notif.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('NotificationCenter: Error marking notification as read:', { code: error?.code, errorMessage: error?.message })
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

      // Check if iOS to use Capacitor Firebase
      const { Capacitor } = await import('@capacitor/core')
      const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
      
      if (isIOS) {
        // Use Capacitor Firebase for iOS - create read status for each notification
        const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
        
        await Promise.all(unreadNotifs.map(notification =>
          FirebaseFirestore.setDocument({
            reference: `users/${userId}/notificationReadStatus/${notification.id}`,
            data: {
              read: true,
              readAt: Date.now()
            },
            merge: false
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
      
      // Update local state
      unreadNotifs.forEach(notif => {
        notif.read = true
      })
      unreadCount.value = 0
    } catch (error) {
      console.error('NotificationCenter: Error marking all notifications as read:', { code: error?.code, errorMessage: error?.message })
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

