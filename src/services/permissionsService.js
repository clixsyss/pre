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

    console.log('📋 Requesting critical permissions...')
    console.log('📋 Platform:', this.platform)
    
    // Only request permissions on native platforms
    if (this.platform === 'web') {
      console.log('📋 Web platform detected - skipping native permission requests')
      this.permissionsRequested = true
      return { location: false, bluetooth: false }
    }
    
    const results = {
      location: false,
      bluetooth: false
    }
    
    // Request Location Permission (needed for guest passes)
    try {
      console.log('📍 [1/2] Requesting Location Permission...')
      results.location = await this.requestLocationPermission()
      console.log(`📍 Location permission result: ${results.location ? 'SUCCESS ✅' : 'FAILED ❌'}`)
    } catch (error) {
      console.error('❌ Error requesting location permission:', error)
      results.location = false
    }
    
    // Request Bluetooth Permission (needed for gate control)
    try {
      console.log('📶 [2/2] Requesting Bluetooth Permission...')
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
      
      return {
        location: locationPermission.location,
        bluetooth: bluetoothAvailable,
      }
    } catch (error) {
      console.error('Error checking permission status:', error)
      return {
        location: 'prompt',
        bluetooth: false,
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

