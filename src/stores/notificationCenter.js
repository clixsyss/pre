import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
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
      return b.createdAt?.toMillis() - a.createdAt?.toMillis()
    })
  )

  /**
   * Subscribe to user notifications from the last month
   * @param {string} userId - The user's ID
   * @param {string} projectId - The current project ID
   */
  const subscribeToNotifications = (userId, projectId) => {
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
      
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('createdAt', '>=', oneMonthAgoTimestamp),
        orderBy('createdAt', 'desc')
      )
      
      console.log('NotificationCenter: Query created, setting up listener...')

      // Listen for real-time updates
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
            console.log('NotificationCenter: Processing notification:', { id: doc.id, read: data.read, title: data.title })
            notificationsList.push({
              id: doc.id,
              ...data
            })
            
            if (!data.read) {
              unreadCounter++
            }
          })

          notifications.value = notificationsList
          unreadCount.value = unreadCounter
          isLoading.value = false

          console.log(`NotificationCenter: ✅ Loaded ${notificationsList.length} notifications, ${unreadCounter} unread`)
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
   */
  const markAsRead = async (notificationId, projectId) => {
    try {
      if (!projectId) {
        console.error('NotificationCenter: projectId required to mark as read')
        return
      }
      
      const notificationRef = doc(db, `projects/${projectId}/notifications`, notificationId)
      await updateDoc(notificationRef, {
        read: true,
        readAt: Timestamp.now()
      })
      
      console.log(`NotificationCenter: Marked notification ${notificationId} as read`)
    } catch (error) {
      console.error('NotificationCenter: Error marking notification as read:', error)
    }
  }

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async (projectId) => {
    try {
      if (!projectId) {
        console.error('NotificationCenter: projectId required to mark all as read')
        return
      }
      
      const batch = writeBatch(db)
      const unreadNotifs = notifications.value.filter(n => !n.read)

      if (unreadNotifs.length === 0) {
        console.log('NotificationCenter: No unread notifications to mark')
        return
      }

      unreadNotifs.forEach((notification) => {
        const notificationRef = doc(db, `projects/${projectId}/notifications`, notification.id)
        batch.update(notificationRef, {
          read: true,
          readAt: Timestamp.now()
        })
      })

      await batch.commit()
      console.log(`NotificationCenter: Marked ${unreadNotifs.length} notifications as read`)
    } catch (error) {
      console.error('NotificationCenter: Error marking all notifications as read:', error)
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

