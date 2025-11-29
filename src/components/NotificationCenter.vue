<template>
  <!-- Details Modal -->
  <div v-if="selectedNotification" class="notification-details-overlay" @click="closeDetails">
    <div class="notification-details-modal" @click.stop>
      <!-- Header -->
      <div class="details-header">
        <h3>{{ $t('notificationDetails') }}</h3>
        <button @click="closeDetails" class="close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="details-content">
        <div class="details-icon" :class="getIconClass(selectedNotification.type)">
          <component :is="getIconComponent(selectedNotification.type)" />
        </div>
        
        <h2 class="details-title">{{ getNotificationTitle(selectedNotification) }}</h2>
        <p class="details-body">{{ getNotificationBody(selectedNotification) }}</p>
        
        <div class="details-meta">
          <span class="details-time">{{ formatTime(selectedNotification.createdAt) }}</span>
          <span class="details-type">{{ selectedNotification.type || $t('general') }}</span>
        </div>
        
        <!-- Image if available -->
        <img v-if="selectedNotification.meta?.image" :src="selectedNotification.meta.image" alt="Notification image" class="details-image" />
        
        <!-- Action button if available -->
        <button v-if="selectedNotification.meta?.deepLink || selectedNotification.actionUrl" @click="handleDetailsAction" class="details-action-btn">
          {{ $t('viewDetails') }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <div v-if="isOpen" class="notification-center-overlay" @click="handleOverlayClick">
    <div class="notification-center-modal" @click.stop>
      <!-- Header -->
      <div class="notification-header">
        <div class="header-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>{{ $t('notifications') }}</h3>
        </div>
        <button @click="closeNotificationCenter" class="close-btn" title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Actions Bar -->
      <div v-if="unreadCount > 0" class="actions-bar">
        <button 
          @click="handleMarkAllAsRead" 
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
          class="mark-all-read-btn" 
          :class="{ 'touching': isTouching, 'loading': isMarkingAsRead }"
          :disabled="isMarkingAsRead"
        >
          <!-- Loading Spinner -->
          <div v-if="isMarkingAsRead" class="button-spinner-small"></div>
          <!-- Check Icon -->
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ isMarkingAsRead ? $t('marking') : $t('markAllAsRead') }}</span>
        </button>
        <span class="unread-badge">{{ unreadCount }} {{ $t('unread') }}</span>
      </div>

      <!-- Notifications List -->
      <div class="notifications-list" :class="{ 'empty': sortedNotifications.length === 0 }">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ $t('loadingNotifications') }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="sortedNotifications.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h4>{{ $t('noNotifications') }}</h4>
          <p>{{ $t('noNotificationsMessage') }}</p>
        </div>

        <!-- Notifications -->
        <div 
          v-else 
          v-for="notification in sortedNotifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
          @click="handleNotificationClick(notification)"
        >
          <!-- Unread Indicator -->
          <div v-if="!notification.read" class="unread-indicator"></div>
          
          <!-- Icon -->
          <div class="notification-icon" :class="getIconClass(notification.type)">
            <component :is="getIconComponent(notification.type)" />
          </div>

          <!-- Content -->
          <div class="notification-content">
            <h4 class="notification-title">{{ getNotificationTitle(notification) }}</h4>
            <p class="notification-message">{{ getNotificationBody(notification) }}</p>
            <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
          </div>

          <!-- Action Arrow (if applicable) -->
          <div v-if="notification.actionUrl" class="notification-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="notification-footer">
        <p class="footer-text">{{ $t('notificationsFooter') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationCenterStore } from '../stores/notificationCenter'
import { formatDistanceToNow } from 'date-fns'

// Component name for ESLint
defineOptions({
  name: 'NotificationCenter'
})

const router = useRouter()
const notificationStore = useNotificationCenterStore()

// State
const selectedNotification = ref(null)

// Computed
const isOpen = computed(() => notificationStore.isModalOpen)
const sortedNotifications = computed(() => notificationStore.sortedNotifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const isLoading = computed(() => notificationStore.isLoading)

// Methods
const closeNotificationCenter = () => {
  notificationStore.closeModal()
}

const handleOverlayClick = () => {
  closeNotificationCenter()
}

// Touch handling for iOS
const isTouching = ref(false)
const isMarkingAsRead = ref(false)

const handleTouchStart = () => {
  isTouching.value = true
  console.log('NotificationCenter: Touch started on mark all as read button')
}

const handleTouchEnd = () => {
  isTouching.value = false
  console.log('NotificationCenter: Touch ended on mark all as read button')
}

const handleMarkAllAsRead = async () => {
  if (isMarkingAsRead.value) {
    console.log('NotificationCenter: Already marking as read, ignoring duplicate click')
    return
  }
  
  // Add haptic feedback on iOS for immediate tactile response
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Light })
    console.log('NotificationCenter: Haptic feedback triggered')
  } catch {
    // Haptics not available on this platform
    console.log('NotificationCenter: Haptics not available')
  }
  
  try {
    isMarkingAsRead.value = true
    console.log('NotificationCenter: Mark all as read clicked')
    console.log('NotificationCenter: Platform:', navigator.userAgent)
    
    // Get userId from optimizedAuthService
    const { default: optimizedAuthService } = await import('../services/optimizedAuthService')
    const currentUser = await optimizedAuthService.getCurrentUser()
    const userId = currentUser?.uid
    
    console.log('NotificationCenter: User ID:', userId)
    console.log('NotificationCenter: Current user:', { uid: userId, email: currentUser?.email })
    console.log('NotificationCenter: Unread count before:', unreadCount.value)
    console.log('NotificationCenter: Total notifications:', notificationStore.notifications.length)
    
    if (!userId) {
      console.error('NotificationCenter: No userId available for mark all as read')
      
      // Import notification store for toast
      const { useNotificationStore } = await import('../stores/notifications')
      const toastStore = useNotificationStore()
      toastStore.showError('Unable to mark notifications as read. Please try logging in again.')
      return
    }
    
    const countBefore = unreadCount.value
    console.log(`NotificationCenter: About to mark ${countBefore} notifications as read for user ${userId}`)
    
    await notificationStore.markAllAsRead(userId)
    
    console.log('NotificationCenter: ✅ Mark all as read completed successfully')
    console.log('NotificationCenter: Unread count after:', unreadCount.value)
    
    // Add success haptic
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics')
      await Haptics.notification({ type: NotificationType.Success })
    } catch {
      // Haptics not available
    }
    
    // Show success toast with correct parameters
    const { useNotificationStore } = await import('../stores/notifications')
    const toastStore = useNotificationStore()
    toastStore.showSuccess(`${countBefore} notification${countBefore > 1 ? 's' : ''} marked as read`)
    
  } catch (error) {
    console.error('NotificationCenter: ❌ Error in handleMarkAllAsRead:', error)
    console.error('NotificationCenter: Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    
    // Add error haptic
    try {
      const { Haptics, NotificationType } = await import('@capacitor/haptics')
      await Haptics.notification({ type: NotificationType.Error })
    } catch {
      // Haptics not available
    }
    
    // Show error toast with correct parameters
    const { useNotificationStore } = await import('../stores/notifications')
    const toastStore = useNotificationStore()
    toastStore.showError('Failed to mark notifications as read. Please try again.')
  } finally {
    isMarkingAsRead.value = false
    console.log('NotificationCenter: Mark all as read operation finished, isMarkingAsRead:', isMarkingAsRead.value)
  }
}

const handleNotificationClick = async (notification) => {
  // Get userId from optimizedAuthService
  const { default: optimizedAuthService } = await import('../services/optimizedAuthService')
  const currentUser = await optimizedAuthService.getCurrentUser()
  const userId = currentUser?.uid
  
  console.log('NotificationCenter: Notification clicked:', { 
    id: notification.id, 
    read: notification.read, 
    userId 
  })
  
  // Mark as read
  if (!notification.read && userId) {
    try {
      console.log('NotificationCenter: Marking notification as read:', notification.id)
      await notificationStore.markAsRead(notification.id, userId)
      console.log('NotificationCenter: Successfully marked as read')
    } catch (error) {
      console.error('NotificationCenter: Failed to mark notification as read:', error)
      // Still show the notification even if marking as read fails
    }
  }

  // Show details modal instead of navigating
  selectedNotification.value = notification
}

const closeDetails = () => {
  selectedNotification.value = null
}

const handleDetailsAction = () => {
  const url = selectedNotification.value?.meta?.deepLink || selectedNotification.value?.actionUrl
  if (url) {
    closeDetails()
    closeNotificationCenter()
    router.push(url)
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  try {
    const date = timestamp.toDate()
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return ''
  }
}

// Get notification title based on language and format
const getNotificationTitle = (notification) => {
  // Get user's preferred language
  const userLang = localStorage.getItem('user-language') || 'en'
  
  // Dashboard notifications have title_en/title_ar
  if (notification.title_en || notification.title_ar) {
    return userLang === 'ar' ? (notification.title_ar || notification.title_en) : notification.title_en
  }
  
  // In-app notifications have simple title
  return notification.title || ''
}

// Get notification body based on language and format
const getNotificationBody = (notification) => {
  // Get user's preferred language
  const userLang = localStorage.getItem('user-language') || 'en'
  
  // Dashboard notifications have body_en/body_ar
  if (notification.body_en || notification.body_ar) {
    return userLang === 'ar' ? (notification.body_ar || notification.body_en) : notification.body_en
  }
  
  // In-app notifications have simple message
  return notification.message || ''
}

const getIconClass = (type) => {
  const typeMap = {
    'info': 'icon-info',
    'success': 'icon-success',
    'warning': 'icon-warning',
    'error': 'icon-error',
    'announcement': 'icon-announcement',
    'booking': 'icon-booking',
    'payment': 'icon-payment',
    'violation': 'icon-violation',
    'service': 'icon-service',
    'request': 'icon-request',
    'complaint': 'icon-complaint',
    'gate': 'icon-gate',
    'default': 'icon-default'
  }
  
  return typeMap[type] || typeMap.default
}

const getIconComponent = (type) => {
  const icons = {
    'info': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('circle', { cx: 12, cy: 12, r: 10, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M12 16V12M12 8H12.01', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'success': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('path', { d: 'M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
      h('path', { d: 'M22 4L12 14.01L9 11.01', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'warning': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('path', { d: 'M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7632 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
      h('path', { d: 'M12 9V13M12 17H12.01', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'error': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('circle', { cx: 12, cy: 12, r: 10, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M15 9L9 15M9 9L15 15', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'announcement': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('path', { d: 'M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'booking': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M16 2V6M8 2V6M3 10H21', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'payment': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { x: 1, y: 4, width: 22, height: 16, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M1 10H23', stroke: 'currentColor', 'stroke-width': 2 })
    ]),
    'violation': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('path', { d: 'M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'service': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('path', { d: 'M12 2L2 7L12 12L22 7L12 2Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
      h('path', { d: 'M2 17L12 22L22 17M2 12L12 17L22 12', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'request': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('path', { d: 'M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
      h('path', { d: 'M14 2V8H20M16 13H8M16 17H8M10 9H8', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'complaint': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('path', { d: 'M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ]),
    'gate': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { x: 3, y: 3, width: 18, height: 18, stroke: 'currentColor', 'stroke-width': 2, fill: 'none' }),
      h('rect', { x: 4, y: 4, width: 6, height: 6, stroke: 'currentColor', 'stroke-width': 1.5, fill: 'none' }),
      h('rect', { x: 14, y: 4, width: 6, height: 6, stroke: 'currentColor', 'stroke-width': 1.5, fill: 'none' }),
      h('rect', { x: 4, y: 14, width: 6, height: 6, stroke: 'currentColor', 'stroke-width': 1.5, fill: 'none' })
    ]),
    'default': () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('circle', { cx: 12, cy: 12, r: 10, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M12 8V12L15 15', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ])
  }
  
  return icons[type] || icons.default
}
</script>

<style scoped>
.notification-center-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  padding-top: 80px;
}

.notification-center-modal {
  background: #F6F6F6;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90vw;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  animation: modal-slide-in 0.3s ease-out;
  overflow: hidden;
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 2px solid rgba(35, 31, 32, 0.1);
  background: #231F20;
  color: #F6F6F6;
padding-top: 40px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title svg {
  color: #AF1E23;
}

.header-title h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #F6F6F6;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(246, 246, 246, 0.7);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Removed hover effect for mobile */

/* Actions Bar */
.actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #FFFFFF;
  border-bottom: 1px solid rgba(35, 31, 32, 0.1);
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: #AF1E23;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  user-select: none;
  /* iOS minimum touch target size */
  min-height: 44px;
  min-width: 44px;
}

/* iOS touch feedback */
.mark-all-read-btn.touching {
  background: rgba(175, 30, 35, 0.15);
  transform: scale(0.98);
}

/* Active state for immediate feedback */
.mark-all-read-btn:active {
  background: rgba(175, 30, 35, 0.15);
  transform: scale(0.98);
}

/* Loading state */
.mark-all-read-btn.loading {
  opacity: 0.7;
  pointer-events: none;
}

.mark-all-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Small button spinner */
.button-spinner-small {
  border: 2px solid rgba(175, 30, 35, 0.3);
  border-top: 2px solid #AF1E23;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  animation: spin 0.8s linear infinite;
}

/* Removed hover effect for mobile */

.unread-badge {
  background: rgba(175, 30, 35, 0.1);
  color: #AF1E23;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Notifications List */
.notifications-list {
  flex: 1;
  overflow-y: auto;
  background: #F6F6F6;
  padding: 8px;
}

.notifications-list.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(175, 30, 35, 0.2);
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;
}

.empty-state svg {
  color: rgba(35, 31, 32, 0.2);
  margin-bottom: 20px;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #231F20;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  max-width: 300px;
}

/* Notification Item */
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #FFFFFF;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border: 2px solid transparent;
}

/* Removed hover effect for mobile */

.notification-item.unread {
  background: #FFFFFF;
  border-color: rgba(175, 30, 35, 0.15);
}

.unread-indicator {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: #AF1E23;
  border-radius: 0 4px 4px 0;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(35, 31, 32, 0.05);
  color: #231F20;
}

/* Icon Colors */
.icon-info { background: rgba(49, 204, 236, 0.1); color: #31ccec; }
.icon-success { background: rgba(33, 186, 69, 0.1); color: #21ba45; }
.icon-warning { background: rgba(242, 192, 55, 0.1); color: #f2c037; }
.icon-error { background: rgba(193, 0, 21, 0.1); color: #c10015; }
.icon-announcement { background: rgba(175, 30, 35, 0.1); color: #AF1E23; }
.icon-booking { background: rgba(175, 30, 35, 0.1); color: #AF1E23; }
.icon-payment { background: rgba(33, 186, 69, 0.1); color: #21ba45; }
.icon-violation { background: rgba(193, 0, 21, 0.1); color: #c10015; }
.icon-service { background: rgba(49, 204, 236, 0.1); color: #31ccec; }
.icon-request { background: rgba(242, 192, 55, 0.1); color: #f2c037; }
.icon-complaint { background: rgba(193, 0, 21, 0.1); color: #c10015; }
.icon-gate { background: rgba(175, 30, 35, 0.1); color: #AF1E23; }
.icon-default { background: rgba(35, 31, 32, 0.1); color: #231F20; }

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #231F20;
  line-height: 1.4;
}

.notification-message {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.notification-action {
  flex-shrink: 0;
  color: #AF1E23;
  display: flex;
  align-items: center;
}

/* Footer */
.notification-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(35, 31, 32, 0.1);
  background: #FFFFFF;
  text-align: center;
}

.footer-text {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {

  .notification-center-modal {
    width: 95vw;
    max-height: calc(100vh - 80px);
    border-radius: 16px;
  }

  .notification-header {
    padding: 12px 20px 12px;
  }

  .header-title h3 {
    font-size: 1.25rem;
  }

  .actions-bar {
    padding: 10px 20px;
  }

  .notifications-list {
    padding: 6px;
  }

  .notification-item {
    padding: 14px;
    gap: 10px;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .notification-center-modal {
    width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }

  .notification-center-overlay {
    padding-top: 0;
  }

  .header-title svg {
    width: 20px;
    height: 20px;
  }

  .header-title h3 {
    font-size: 1.125rem;
  }

  .notification-title {
    font-size: 0.875rem;
  }

  .notification-message {
    font-size: 0.8125rem;
  }
}

/* Scrollbar Styling */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: transparent;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: rgba(35, 31, 32, 0.2);
  border-radius: 3px;
}

/* Removed hover effect for mobile */

/* Details Modal */
.notification-details-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
}

.notification-details-modal {
  background: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.details-header {
  background: #231F20;
  color: #F6F6F6;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px 16px 0 0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.details-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.details-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.details-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 28px;
}

.details-title {
  font-size: 22px;
  font-weight: 700;
  color: #231F20;
  margin: 0;
  text-align: center;
}

.details-body {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin: 0;
  text-align: center;
  white-space: pre-wrap;
}

.details-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
}

.details-time {
  font-size: 14px;
  color: #999;
}

.details-type {
  font-size: 14px;
  color: #AF1E23;
  font-weight: 600;
  text-transform: capitalize;
}

.details-image {
  width: 100%;
  border-radius: 12px;
  object-fit: cover;
  max-height: 300px;
}

.details-action-btn {
  background: #AF1E23;
  color: #F6F6F6;
  border: none;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  width: 100%;
}

.details-action-btn:active {
  transform: scale(0.98);
  background: #8A1820;
}
</style>

