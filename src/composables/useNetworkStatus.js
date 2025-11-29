import { ref } from 'vue'
import { Network } from '@capacitor/network'
import { Notify } from 'quasar'

let networkStatusListener = null
let isListenerActive = false

// Shared state across all instances
const isOnline = ref(true)
const connectionType = ref('unknown')
const isSlowConnection = ref(false)

export function useNetworkStatus() {
  
  const checkConnectionSpeed = async () => {
    try {
      const status = await Network.getStatus()
      
      // Consider 2G and slow-2g as slow connections
      if (status.connectionType === 'cellular') {
        // On cellular, we can't directly detect speed in Capacitor
        // but we can infer from the connection type
        isSlowConnection.value = false
      } else if (status.connectionType === '2g' || status.connectionType === 'slow-2g') {
        isSlowConnection.value = true
      } else {
        isSlowConnection.value = false
      }
      
      return status
    } catch (error) {
      console.error('Error checking connection speed:', error)
      return null
    }
  }

  const showOfflineNotification = () => {
    Notify.create({
      type: 'negative',
      message: 'No Internet Connection',
      caption: 'Please check your internet connection and try again',
      position: 'top',
      timeout: 0, // Don't auto-dismiss
      icon: 'wifi_off',
      classes: 'notif-with-safe-area',
      actions: [
        {
          label: 'Dismiss',
          color: 'white',
          handler: () => {
            // Notification will be dismissed
          }
        }
      ]
    })
  }

  const showSlowConnectionNotification = () => {
    Notify.create({
      type: 'warning',
      message: 'Weak Internet Connection',
      caption: 'Your connection is slow. Some features may not work properly',
      position: 'top',
      timeout: 5000,
      icon: 'signal_wifi_statusbar_connected_no_internet_4',
      classes: 'notif-with-safe-area'
    })
  }

  const showOnlineNotification = () => {
    Notify.create({
      type: 'positive',
      message: 'Back Online',
      caption: 'Your internet connection has been restored',
      position: 'top',
      timeout: 3000,
      icon: 'wifi',
      classes: 'notif-with-safe-area'
    })
  }

  const handleNetworkChange = async (status) => {
    console.log('🌐 Network status changed:', status)
    
    const wasOffline = !isOnline.value
    isOnline.value = status.connected
    connectionType.value = status.connectionType

    if (!status.connected) {
      // No internet connection
      console.warn('⚠️ No internet connection detected')
      showOfflineNotification()
    } else if (wasOffline) {
      // Connection restored
      console.log('✅ Internet connection restored')
      showOnlineNotification()
      
      // Check if connection is slow
      await checkConnectionSpeed()
      if (isSlowConnection.value) {
        showSlowConnectionNotification()
      }
    }
  }

  const initNetworkMonitoring = async () => {
    try {
      // Only initialize once globally
      if (isListenerActive) {
        console.log('🌐 Network monitoring already active')
        return
      }

      // Get initial network status
      const status = await Network.getStatus()
      console.log('🌐 Initial network status:', status)
      isOnline.value = status.connected
      connectionType.value = status.connectionType

      // Show notification if starting offline
      if (!status.connected) {
        showOfflineNotification()
      }

      // Add network status listener
      networkStatusListener = await Network.addListener('networkStatusChange', handleNetworkChange)
      isListenerActive = true
      
      console.log('✅ Network monitoring initialized')
    } catch (error) {
      console.error('❌ Error initializing network monitoring:', error)
    }
  }

  const stopNetworkMonitoring = async () => {
    try {
      if (networkStatusListener) {
        await networkStatusListener.remove()
        networkStatusListener = null
        isListenerActive = false
        console.log('🛑 Network monitoring stopped')
      }
    } catch (error) {
      console.error('❌ Error stopping network monitoring:', error)
    }
  }

  // Check current network status
  const checkNetworkStatus = async () => {
    try {
      const status = await Network.getStatus()
      isOnline.value = status.connected
      connectionType.value = status.connectionType
      
      if (!status.connected) {
        showOfflineNotification()
      }
      
      return status
    } catch (error) {
      console.error('❌ Error checking network status:', error)
      return null
    }
  }

  return {
    isOnline,
    connectionType,
    isSlowConnection,
    initNetworkMonitoring,
    stopNetworkMonitoring,
    checkNetworkStatus,
    checkConnectionSpeed
  }
}

