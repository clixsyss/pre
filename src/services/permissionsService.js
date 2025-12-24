/**
 * Permissions Service
 * Handles all app permissions initialization
 * Requests critical permissions upfront for better UX
 */

import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

class PermissionsService {
  constructor() {
    // Enhanced platform detection for iOS
    const protocol = window.location.protocol
    const hasIOSBridge = window.webkit?.messageHandlers !== undefined
    
    if (protocol === 'capacitor:' || hasIOSBridge) {
      this.platform = 'ios'
    } else {
      this.platform = Capacitor.getPlatform()
    }
    
    this.permissionsRequested = false
    console.log('🔍 PermissionsService: Platform detected:', this.platform)
  }

  /**
   * Request all critical permissions upfront
   * This ensures users grant permissions before using features
   */
  async requestAllPermissions() {
    if (this.permissionsRequested) {
      console.log('📋 Permissions already requested, skipping...')
      return
    }

    // Re-check platform to ensure accuracy
    const protocol = window.location.protocol
    const hasIOSBridge = window.webkit?.messageHandlers !== undefined
    
    // Enhanced platform detection
    if (protocol === 'capacitor:' || hasIOSBridge) {
      this.platform = 'ios'
    } else {
      this.platform = Capacitor.getPlatform()
    }

    console.log('📋 Requesting critical permissions...')
    console.log('📋 Platform:', this.platform)
    console.log('📋 Platform detection details:', { 
      protocol, 
      hasIOSBridge, 
      capacitorPlatform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform()
    })
    
    // Only request permissions on native platforms
    if (this.platform === 'web') {
      // Double-check if we're actually on web or if detection failed
      const isActuallyNative = protocol === 'capacitor:' || hasIOSBridge || Capacitor.isNativePlatform()
      if (isActuallyNative) {
        console.log('⚠️ Platform detected as web but appears to be native, correcting...')
        this.platform = Capacitor.getPlatform() || 'ios'
      } else {
        console.log('📋 Web platform detected - skipping native permission requests')
        this.permissionsRequested = true
        return { location: false, bluetooth: false, notifications: false }
      }
    }
    
    const results = {
      location: false,
      bluetooth: false,
      notifications: false
    }
    
    // Request Notification Permission (needed for push notifications)
    try {
      console.log('🔔 [1/3] Requesting Notification Permission...')
      results.notifications = await this.requestNotificationPermission()
      console.log(`🔔 Notification permission result: ${results.notifications ? 'SUCCESS ✅' : 'FAILED ❌'}`)
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error)
      results.notifications = false
    }
    
    // Request Location Permission (needed for guest passes)
    try {
      console.log('📍 [2/3] Requesting Location Permission...')
      results.location = await this.requestLocationPermission()
      console.log(`📍 Location permission result: ${results.location ? 'SUCCESS ✅' : 'FAILED ❌'}`)
    } catch (error) {
      console.error('❌ Error requesting location permission:', error)
      results.location = false
    }
    
    // Request Bluetooth Permission (needed for gate control)
    try {
      console.log('📶 [3/3] Requesting Bluetooth Permission...')
      results.bluetooth = await this.requestBluetoothPermission()
      console.log(`📶 Bluetooth permission result: ${results.bluetooth ? 'SUCCESS ✅' : 'FAILED ❌'}`)
    } catch (error) {
      console.error('❌ Error requesting Bluetooth permission:', error)
      results.bluetooth = false
    }
    
    this.permissionsRequested = true
    console.log('✅ All critical permissions requested')
    console.log('📊 Results:', results)
    
    return results
  }

  /**
   * Request Notification Permission
   * Required for push notifications
   */
  async requestNotificationPermission() {
    try {
      console.log('🔔 Checking notification permissions...')
      
      // Check if we're on a native platform
      if (this.platform === 'web') {
        // Use browser Notification API
        if (!('Notification' in window)) {
          console.log('⚠️ Browser does not support notifications')
          return false
        }
        
        const permission = Notification.permission
        console.log('🔔 Current notification permission:', permission)
        
        if (permission === 'granted') {
          console.log('✅ Notification permission already granted')
          return true
        }
        
        if (permission === 'denied') {
          console.log('⚠️ Notification permission previously denied')
          return false
        }
        
        // Request permission
        console.log('🔔 Requesting notification permission...')
        const result = await Notification.requestPermission()
        console.log('🔔 Notification permission result:', result)
        
        return result === 'granted'
      } else {
        // Native platform - use Capacitor Firebase Messaging
        try {
          // Ensure the plugin module is loaded (registers the plugin)
          await import('@capacitor-firebase/messaging')
          
          // Access the native plugin from window.Capacitor (where iOS bridge registers it)
          if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.FirebaseMessaging) {
            console.error('❌ FirebaseMessaging plugin not available in window.Capacitor.Plugins')
            return false
          }
          
          const FirebaseMessagingPlugin = window.Capacitor.Plugins.FirebaseMessaging
          console.log('🔔 FirebaseMessaging plugin loaded from window.Capacitor.Plugins')
          
          console.log('🔔 Requesting notification permission via Capacitor Firebase...')
          const result = await FirebaseMessagingPlugin.requestPermissions()
          console.log('🔔 Notification permission result:', result)
          
          if (result.receive === 'granted') {
            console.log('✅ Notification permission granted')
            return true
          } else {
            console.log('⚠️ Notification permission denied')
            return false
          }
        } catch (error) {
          console.error('❌ Error requesting notification permission:', error)
          return false
        }
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error)
      return false
    }
  }

  /**
   * Request Location Permission
   * Required for guest pass generation with location restrictions
   */
  async requestLocationPermission() {
    try {
      console.log('📍 Checking location permissions...')
      
      // Check current permission status
      const permission = await Geolocation.checkPermissions()
      console.log('📍 Current location permission:', permission.location)
      
      if (permission.location === 'granted') {
        console.log('✅ Location permission already granted')
        return true
      }
      
      // Don't skip if denied - still try to request (user might have changed settings)
      if (permission.location === 'denied') {
        console.log('⚠️ Location permission previously denied - will still attempt to request')
      }
      
      // ALWAYS request permission if not granted (even if previously denied or prompt)
      console.log('📍 Requesting location permission...')
      const result = await Geolocation.requestPermissions()
      console.log('📍 Location permission result:', result.location)
      
      if (result.location === 'granted') {
        console.log('✅ Location permission granted')
        return true
      } else {
        console.log('⚠️ Location permission denied by user or needs to be enabled in settings')
        console.log(`💡 User should go to Settings → ${this.platform === 'ios' ? 'PRE Group → Location' : 'Apps → PRE Group → Permissions → Location'}`)
        return false
      }
    } catch (error) {
      console.error('❌ Error requesting location permission:', error)
      return false
    }
  }

  /**
   * Request Bluetooth Permission
   * Required for gate control and smart device features
   */
  async requestBluetoothPermission() {
    try {
      console.log('📱 Requesting Bluetooth permissions...')
      console.log('📱 Platform:', this.platform)
      
      // Dynamically import BLE plugin
      console.log('📱 Importing @capacitor-community/bluetooth-le...')
      const bleModule = await import('@capacitor-community/bluetooth-le')
      console.log('📱 BLE module imported:', bleModule)
      
      // Access BleClient from module
      const BleClient = bleModule.BleClient
      if (!BleClient) {
        console.error('❌ BleClient not found in module')
        return false
      }
      
      console.log('📱 BleClient found:', typeof BleClient)
      console.log('📱 BleClient.initialize exists:', typeof BleClient.initialize)
      
      // Initialize BLE - this will request permissions on first use
      console.log('📱 Initializing BLE client...')
      await BleClient.initialize()
      console.log('✅ BLE client initialized successfully')
      
      // Check if BLE is available/enabled
      try {
        const isEnabled = await BleClient.isEnabled()
        console.log('📱 Bluetooth enabled on device:', isEnabled)
        
        if (!isEnabled) {
          console.log('⚠️ Bluetooth is not enabled on device')
          if (this.platform === 'ios') {
            console.log('💡 User needs to turn on Bluetooth in Control Center')
          } else {
            console.log('💡 User needs to enable Bluetooth in Settings')
          }
        }
      } catch (enableError) {
        console.warn('⚠️ Could not check if Bluetooth is enabled:', enableError)
      }
      
      // On Android, location permission is required for BLE scanning (Android OS requirement)
      if (this.platform === 'android') {
        console.log('📱 Android: Location permission needed for BLE scanning (already requested)')
      }
      
      console.log('✅ Bluetooth permissions requested')
      return true
    } catch (error) {
      console.error('❌ Error requesting Bluetooth permission:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        type: typeof error
      })
      // Don't fail - gate control features will handle missing permissions
      return false
    }
  }

  /**
   * Check Bluetooth permission status
   * @returns {Promise<boolean>} True if Bluetooth is available and enabled
   */
  async checkBluetoothPermission() {
    try {
      const bleModule = await import('@capacitor-community/bluetooth-le')
      const BleClient = bleModule.BleClient
      
      if (!BleClient) {
        return false
      }
      
      // Try to check if BLE is enabled
      try {
        const isEnabled = await BleClient.isEnabled()
        return isEnabled
      } catch (error) {
        console.warn('Could not check Bluetooth status:', error)
        return false
      }
    } catch (error) {
      console.error('Error checking Bluetooth permission:', error)
      return false
    }
  }

  /**
   * Check if all critical permissions are granted
   * @returns {Promise<Object>} Permission status for each type
   */
  async checkPermissionStatus() {
    try {
      const locationPermission = await Geolocation.checkPermissions()
      
      let bluetoothAvailable = false
      try {
        const bleModule = await import('@capacitor-community/bluetooth-le')
        const BleClient = bleModule.BleClient
        if (BleClient) {
          bluetoothAvailable = await BleClient.isEnabled()
        }
      } catch (error) {
        console.warn('Bluetooth check failed:', error)
      }
      
      let notificationPermission = 'prompt'
      try {
        if (this.platform === 'web') {
          notificationPermission = Notification.permission || 'prompt'
        } else {
          // Native platform - check via Capacitor Firebase Messaging
          await import('@capacitor-firebase/messaging')
          if (window.Capacitor?.Plugins?.FirebaseMessaging) {
            // Note: There's no checkPermissions method, so we'll try to get token
            // If we can get token, permission is granted
            try {
              const result = await window.Capacitor.Plugins.FirebaseMessaging.getToken()
              notificationPermission = result?.token ? 'granted' : 'denied'
            } catch {
              notificationPermission = 'denied'
            }
          }
        }
      } catch (error) {
        console.warn('Notification permission check failed:', error)
      }
      
      return {
        location: locationPermission.location,
        bluetooth: bluetoothAvailable,
        notifications: notificationPermission,
      }
    } catch (error) {
      console.error('Error checking permission status:', error)
      return {
        location: 'prompt',
        bluetooth: false,
        notifications: 'prompt',
      }
    }
  }

  /**
   * Guide user to settings if permissions are denied
   * @param {string} permissionType - Type of permission (location, bluetooth)
   */
  getPermissionInstructions(permissionType) {
    const instructions = {
      location: this.platform === 'ios'
        ? 'Settings → PRE Group → Location → Select "While Using the App"'
        : 'Settings → Apps → PRE Group → Permissions → Location → Allow',
      bluetooth: this.platform === 'ios'
        ? 'Settings → PRE Group → Bluetooth → Enable'
        : 'Settings → Apps → PRE Group → Permissions → Nearby devices → Allow',
    }
    
    return instructions[permissionType] || 'Please enable permissions in your device settings.'
  }

  /**
   * Reset the permissions requested flag (useful for testing)
   */
  resetPermissionsFlag() {
    this.permissionsRequested = false
    console.log('🔄 Permissions flag reset')
  }
}

// Export singleton instance
const permissionsService = new PermissionsService()
export default permissionsService

