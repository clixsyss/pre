import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  // Notification state
  const notifications = ref([])
  const nextId = ref(1)

  // Add a new notification
  const addNotification = (type, message, duration = 5000) => {
    const id = nextId.value++
    const notification = {
      id,
      type,
      message,
      timestamp: Date.now(),
      visible: true
    }

    notifications.value.push(notification)

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  // Remove a specific notification
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Clear all notifications
  const clearNotifications = () => {
    notifications.value = []
  }

  // Convenience methods for different notification types
  const showSuccess = (message, duration) => addNotification('success', message, duration)
  const showError = (message, duration) => addNotification('error', message, duration)
  const showWarning = (message, duration) => addNotification('warning', message, duration)
  const showInfo = (message, duration) => addNotification('info', message, duration)

  return {
    // State
    notifications,
    
    // Methods
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
