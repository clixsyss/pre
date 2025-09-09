import { ref } from 'vue'

const notifications = ref([])
let notificationId = 0

export function useNotification() {
  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = ++notificationId
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      timestamp: Date.now()
    }
    
    notifications.value.push(notification)
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
    
    return id
  }
  
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    notifications.value = []
  }
  
  // Convenience methods
  const success = (message, duration = 5000) => addNotification(message, 'success', duration)
  const error = (message, duration = 7000) => addNotification(message, 'error', duration)
  const warning = (message, duration = 6000) => addNotification(message, 'warning', duration)
  const info = (message, duration = 5000) => addNotification(message, 'info', duration)
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
