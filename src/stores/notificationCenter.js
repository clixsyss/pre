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

  const sortedNotifications = computed(() => {
    const toMs = (item) => {
      const candidates = [
        item?.createdAt,
        item?.updatedAt,
        item?.sentAt,
        item?.scheduledAt,
        item?.issuedAt,
        item?.startDate,
      ]
      for (const value of candidates) {
        if (!value) continue
        if (typeof value?.toMillis === 'function') return value.toMillis()
        if (typeof value === 'object' && value.seconds) return value.seconds * 1000
        if (typeof value === 'number') return value
        const parsed = new Date(value).getTime()
        if (!Number.isNaN(parsed)) return parsed
      }
      return 0
    }
    return [...notifications.value].sort((a, b) => toMs(b) - toMs(a))
  })

  const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase()

  const valueMatchesUser = (value, identifiers) => {
    if (!value) return false
    const normalized = normalizeIdentifier(value)
    return identifiers.has(normalized)
  }

  const anyValueMatchesUser = (values, identifiers) => {
    if (!Array.isArray(values)) return false
    return values.some((value) => valueMatchesUser(value, identifiers))
  }

  const resolveUserIdentifiers = async (primaryUserId) => {
    const identifiers = new Set()
    if (primaryUserId) identifiers.add(normalizeIdentifier(primaryUserId))
    try {
      const { default: optimizedAuthService } = await import('../services/optimizedAuthService')
      const currentUser = await optimizedAuthService.getCurrentUser()
      const candidates = [
        currentUser?.uid,
        currentUser?.userSub,
        currentUser?.attributes?.sub,
        currentUser?.cognitoAttributes?.sub,
        currentUser?.email,
        currentUser?.attributes?.email,
        currentUser?.cognitoAttributes?.email
      ]
      candidates.forEach((value) => {
        if (value) identifiers.add(normalizeIdentifier(value))
      })
    } catch (error) {
      console.warn('NotificationCenter: Could not resolve user aliases:', error)
    }
    return identifiers
  }

  const isNotificationForCurrentUser = (notif, userIdentifiers) => {
    if (!notif) return false
    const audience = notif.audience || {}
    if (audience.all === true) return true
    if (
      anyValueMatchesUser(audience.uids, userIdentifiers) ||
      anyValueMatchesUser(audience.userIds, userIdentifiers) ||
      anyValueMatchesUser(audience.emails, userIdentifiers) ||
      valueMatchesUser(audience.userId, userIdentifiers) ||
      valueMatchesUser(audience.uid, userIdentifiers) ||
      valueMatchesUser(audience.email, userIdentifiers)
    ) {
      return true
    }

    return (
      valueMatchesUser(notif.userId, userIdentifiers) ||
      valueMatchesUser(notif.uid, userIdentifiers) ||
      valueMatchesUser(notif.recipientId, userIdentifiers) ||
      valueMatchesUser(notif.targetUserId, userIdentifiers) ||
      valueMatchesUser(notif.userEmail, userIdentifiers) ||
      valueMatchesUser(notif.email, userIdentifiers)
    )
  }

  const getNotificationTimestampMs = (notification) => {
    const value = notification?.createdAt || notification?.scheduledAt || notification?.issuedAt || notification?.startDate || 0
    if (value && typeof value.toMillis === 'function') return value.toMillis()
    if (value && typeof value === 'object' && value.seconds) return value.seconds * 1000
    if (typeof value === 'number') return value
    const parsed = new Date(value).getTime()
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const mergeAndSortNotifications = (items = []) => {
    const byId = new Map()
    items.forEach((item) => {
      if (!item?.id) return
      byId.set(String(item.id), item)
    })
    return [...byId.values()].sort((a, b) => getNotificationTimestampMs(b) - getNotificationTimestampMs(a))
  }

  const fetchSupplementalNotifications = async (projectId, userId) => {
    const supplemental = []

    try {
      const { getUserFines } = await import('../services/finesService')
      const fines = await getUserFines(projectId, userId)
      fines.forEach((fine) => {
        supplemental.push({
          id: `fine-${fine.id}`,
          type: 'violation',
          title: fine.reason || fine.title || 'Fine Update',
          message: fine.description || `Fine status: ${fine.status || 'issued'}`,
          actionUrl: '/violations',
          createdAt: fine.createdAt || fine.issuingDate || fine.occurrenceDate || Date.now(),
          read: false
        })
      })
    } catch (error) {
      console.log('NotificationCenter: Unable to fetch fines for supplemental feed:', error?.message || error)
    }

    try {
      const warningModule = await import('../services/warningsService')
      const getUserWarnings = warningModule.getUserWarnings || warningModule.default?.getUserWarnings
      if (typeof getUserWarnings === 'function') {
        const warnings = await getUserWarnings(projectId, userId)
        warnings.forEach((warning) => {
          supplemental.push({
            id: `warning-${warning.id}`,
            type: 'warning',
            title: warning.title || 'Warning',
            message: warning.description || '',
            actionUrl: '/warnings',
            createdAt: warning.createdAt || warning.startDate || Date.now(),
            read: false
          })
        })
      }
    } catch (error) {
      // Some apps might not include warnings feature; ignore silently.
      console.log('NotificationCenter: Warnings feed unavailable:', error?.message || error)
    }

    return supplemental
  }

  /**
   * Fetch notifications manually (polling-based, not real-time)
   * COST OPTIMIZATION: Replaces onSnapshot with periodic getDocs calls
   * @param {string} userId - The user's ID
   * @param {string} projectId - The current project ID
   */
  const mergeWithEphemeralNotifications = (serverNotifications = []) => {
    const ephemeral = notifications.value.filter((n) => n?.isEphemeral)
    const seenIds = new Set(serverNotifications.map((n) => n.id))
    const merged = [...serverNotifications]
    ephemeral.forEach((n) => {
      if (!seenIds.has(n.id)) merged.push(n)
    })
    return merged
  }

  const registerIncomingNotification = (notificationPayload = {}) => {
    const rawId =
      notificationPayload.id ||
      notificationPayload.notificationId ||
      notificationPayload.messageId ||
      notificationPayload.data?.id ||
      notificationPayload.data?.notificationId

    const generatedId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const id = rawId ? String(rawId) : generatedId

    const title = notificationPayload.title || notificationPayload.data?.title_en || notificationPayload.data?.title_ar || ''
    const message = notificationPayload.message || notificationPayload.body || notificationPayload.data?.body_en || notificationPayload.data?.body_ar || ''
    const type = notificationPayload.type || notificationPayload.data?.type || notificationPayload.data?.actionType || 'announcement'
    const actionUrl = notificationPayload.actionUrl || notificationPayload.data?.actionUrl || notificationPayload.data?.deepLink || null

    const existingIndex = notifications.value.findIndex((n) => n.id === id)
    const normalized = {
      id,
      title,
      message,
      type,
      actionUrl,
      data: notificationPayload.data || null,
      createdAt: notificationPayload.createdAt || Date.now(),
      read: false,
      isEphemeral: true
    }

    if (existingIndex >= 0) {
      const next = [...notifications.value]
      next[existingIndex] = { ...next[existingIndex], ...normalized, read: next[existingIndex].read ?? false }
      notifications.value = next
    } else {
      notifications.value = [normalized, ...notifications.value]
      unreadCount.value += 1
    }
  }

  const fetchNotifications = async (userId, projectId, options = {}) => {
    const force = !!options.force
    if (!userId || !projectId) {
      console.warn('NotificationCenter: Cannot fetch without userId and projectId')
      return
    }

    // Check cache to prevent duplicate fetches
    if (!force && lastFetchTime.value && Date.now() - lastFetchTime.value < CACHE_DURATION_MS) {
      console.log('NotificationCenter: ⚡ Using cached data (fetched', Math.round((Date.now() - lastFetchTime.value) / 1000), 'seconds ago)')
      return
    }

    isLoading.value = true

    try {
      console.log('NotificationCenter: 📊 Fetching notifications (polling mode)...', { userId, projectId })
      const userIdentifiers = await resolveUserIdentifiers(userId)
      
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
          
          const isForCurrentUser = isNotificationForCurrentUser(notif, userIdentifiers)
          
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
          const readStatus = readStatusMap.value.get(String(notif.id))
          if (readStatus) {
            notif.read = readStatus.read || false
          }
        })
        
        const supplementalNotifications = await fetchSupplementalNotifications(projectId, userId)
        supplementalNotifications.forEach((item) => {
          const status = readStatusMap.value.get(String(item.id))
          if (status) item.read = status.read || false
        })

        const combinedNotifications = mergeAndSortNotifications([
          ...recentNotifications,
          ...supplementalNotifications
        ]).slice(0, 100)

        // Recalculate unread count after applying read status
        unreadCounter = combinedNotifications.filter(n => !n.read).length
        
        const mergedNotifications = mergeWithEphemeralNotifications(combinedNotifications)
        notifications.value = mergeAndSortNotifications(mergedNotifications)
        unreadCount.value = mergedNotifications.filter((n) => !n.read).length
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
          const supplementalNotifications = await fetchSupplementalNotifications(projectId, userId)
          supplementalNotifications.forEach((item) => {
            const status = readStatusMap.value.get(String(item.id))
            if (status) item.read = status.read || false
          })
          const mergedNotifications = mergeWithEphemeralNotifications(supplementalNotifications)
          notifications.value = mergeAndSortNotifications(mergedNotifications)
          unreadCount.value = notifications.value.filter((n) => !n.read).length
          isLoading.value = false
          lastFetchTime.value = Date.now()
          console.log('NotificationCenter: No notifications found')
          return
        }
        
        const notificationsList = []
        let unreadCounter = 0

        notificationsSnapshot.forEach((doc) => {
          const data = doc.data()
          const readStatus = readStatusMap.value.get(String(doc.id))
          const isRead = readStatus?.read || false
          
          const isForCurrentUser = isNotificationForCurrentUser(data, userIdentifiers)
          
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

        const supplementalNotifications = await fetchSupplementalNotifications(projectId, userId)
        supplementalNotifications.forEach((item) => {
          const status = readStatusMap.value.get(String(item.id))
          if (status) item.read = status.read || false
        })

        const combinedNotifications = mergeAndSortNotifications([
          ...notificationsList,
          ...supplementalNotifications
        ]).slice(0, 100)

        const mergedNotifications = mergeWithEphemeralNotifications(combinedNotifications)
        notifications.value = mergeAndSortNotifications(mergedNotifications)
        unreadCount.value = notifications.value.filter((n) => !n.read).length
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

      const normalizedNotificationId = String(notificationId || '').trim()
      const normalizedUserId = String(userId || '').trim()
      if (!normalizedNotificationId || !normalizedUserId) return

      const isEphemeralNotification = normalizedNotificationId.startsWith('local-') || normalizedNotificationId.startsWith('toast-')

      console.log(`NotificationCenter: Marking notification ${normalizedNotificationId} as read for user ${normalizedUserId}`)

      if (!isEphemeralNotification) {
        const { usersNotificationReadStatusService } = await import('../services/dynamoDBTableServices')
        await usersNotificationReadStatusService.markAsRead(normalizedUserId, normalizedNotificationId)
        console.log(`NotificationCenter: ✅ Notification ${normalizedNotificationId} marked as read in DynamoDB (AWS)`)
      }

      readStatusMap.value.set(normalizedNotificationId, { read: true, readAt: Date.now() })

      const idx = notifications.value.findIndex(n => String(n.id) === normalizedNotificationId)
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
      
      const unreadIds = new Set(unreadNotifs.map(n => String(n.id)))
      unreadNotifs.forEach(notification => {
        readStatusMap.value.set(String(notification.id), { read: true, readAt: Date.now() })
      })

      // Replace array to trigger Vue reactivity (avoid in-place mutation)
      notifications.value = notifications.value.map(n =>
        unreadIds.has(n.id) ? { ...n, read: true } : n
      )
      unreadCount.value = 0

      console.log(`NotificationCenter: Local state updated - ${unreadCount.value} unread`)

      const { usersNotificationReadStatusService } = await import('../services/dynamoDBTableServices')
      const notificationIds = unreadNotifs
        .map(n => String(n.id))
        .filter((id) => !id.startsWith('local-') && !id.startsWith('toast-'))

      try {
        if (notificationIds.length > 0) {
          await usersNotificationReadStatusService.markMultipleAsRead(String(userId), notificationIds)
        }
        console.log(`NotificationCenter: ✅ Successfully marked ${unreadNotifs.length} notifications as read`)
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
    registerIncomingNotification,
    markAsRead,
    markAllAsRead,
    unsubscribeFromNotifications,
    clearNotifications,
    toggleModal,
    openModal,
    closeModal
  }
})

