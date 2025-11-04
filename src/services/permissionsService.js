/**
 * Permissions Service
 * Handles all app permissions initialization
 * Requests critical permissions upfront for better UX
 */

import { Geolocation } from '@capacitor/geolocation'
import { Capacitor } from '@capacitor/core'

class PermissionsService {
  constructor() {
    this.platform = Capacitor.getPlatform()
    this.permissionsRequested = false
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
    
    try {
      // Request Location Permission (needed for guest passes)
      await this.requestLocationPermission()
      
      // Request Bluetooth Permission (needed for gate control)
      await this.requestBluetoothPermission()
      
      this.permissionsRequested = true
      console.log('✅ All critical permissions requested')
    } catch (error) {
      console.error('❌ Error requesting permissions:', error)
      // Don't throw - let app continue even if permissions denied
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
      
      if (permission.location === 'denied') {
        console.log('⚠️ Location permission previously denied')
        return false
      }
      
      // Request permission
      console.log('📍 Requesting location permission...')
      const result = await Geolocation.requestPermissions()
      console.log('📍 Location permission result:', result.location)
      
      if (result.location === 'granted') {
        console.log('✅ Location permission granted')
        return true
      } else {
        console.log('⚠️ Location permission denied by user')
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
      // Only request on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('📱 Not a native platform, skipping Bluetooth permission')
        return true
      }

      console.log('📱 Checking Bluetooth permissions...')
      
      // Dynamically import BLE plugin
      const { BleClient } = await import('@capacitor-community/bluetooth-le')
      
      // Check if BLE is available
      const isAvailable = await BleClient.isEnabled()
      console.log('📱 Bluetooth enabled:', isAvailable)
      
      // On Android, we need to request location permission for BLE scanning
      if (this.platform === 'android') {
        console.log('📱 Android detected - location permission needed for BLE')
        // Location permission already requested above
      }
      
      // Request Bluetooth permissions by initializing BLE
      // This will trigger the permission dialog on first use
      await BleClient.initialize()
      console.log('✅ Bluetooth permissions initialized')
      
      return true
    } catch (error) {
      console.error('❌ Error requesting Bluetooth permission:', error)
      // Don't fail if Bluetooth is not available or user doesn't have BLE hardware
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
      if (Capacitor.isNativePlatform()) {
        try {
          const { BleClient } = await import('@capacitor-community/bluetooth-le')
          bluetoothAvailable = await BleClient.isEnabled()
        } catch (error) {
          console.warn('Bluetooth check failed:', error)
        }
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
    const isIOS = this.platform === 'ios'
    
    const instructions = {
      location: isIOS
        ? 'Go to Settings → PRE Group → Location → Select "While Using the App"'
        : 'Go to Settings → Apps → PRE Group → Permissions → Location → Allow',
      bluetooth: isIOS
        ? 'Go to Settings → PRE Group → Bluetooth → Enable'
        : 'Go to Settings → Apps → PRE Group → Permissions → Nearby devices → Allow',
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

