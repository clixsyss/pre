import { ref } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Notify } from 'quasar'

/**
 * Reusable BLE Composable for connecting to BLE devices
 * Supports both Capacitor (native) and Web Bluetooth API
 *
 * @returns {Object} Bluetooth utilities and state
 */
export function useBluetooth() {
  // State management
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const isScanning = ref(false)
  const deviceName = ref('')
  const lastError = ref(null)
  const isBLESupported = ref(false)

  // BLE device references
  let bleDevice = null
  let bluetoothLE = null

  /**
   * Check if we're actually running on a native platform
   * More reliable than just Capacitor.isNativePlatform()
   */
  const isReallyNative = () => {
    const platform = Capacitor.getPlatform()
    const isNative = Capacitor.isNativePlatform()
    
    // Also check if we're in a capacitor:// scheme
    const isCapacitorScheme = window.location.protocol === 'capacitor:'
    
    console.log('🔍 Platform detection:', {
      platform,
      isNative,
      protocol: window.location.protocol,
      isCapacitorScheme,
    })
    
    // Consider it native if any of these are true
    return isNative || isCapacitorScheme || platform === 'ios' || platform === 'android'
  }

  /**
   * Check if BLE is supported on the current platform
   */
  const checkBLESupport = async () => {
    try {
      console.log('🔍 Checking BLE support...')
      console.log('📱 Platform:', Capacitor.getPlatform())
      console.log('📱 Is Native (standard):', Capacitor.isNativePlatform())
      console.log('📱 Protocol:', window.location.protocol)
      
      const isNative = isReallyNative()
      console.log('📱 Is Native (enhanced):', isNative)
      
      if (isNative) {
        // For Capacitor, dynamically import the BLE plugin
        try {
          console.log('📦 Dynamically importing BLE plugin...')
          const { BleClient } = await import('@capacitor-community/bluetooth-le')
          bluetoothLE = BleClient
          console.log('✅ BLE plugin imported successfully')
        } catch (importError) {
          console.error('❌ BLE plugin import failed!')
          console.error('Import error:', importError)
          isBLESupported.value = false
          lastError.value = 'BLE plugin not installed. Please install @capacitor-community/bluetooth-le'
          return false
        }

        // Check if BLE is enabled and initialize
        try {
          console.log('🔧 Attempting to initialize BLE...')
          await bluetoothLE.initialize()
          console.log('✅ Capacitor BLE initialized successfully')
          isBLESupported.value = true
          return true
        } catch (initError) {
          console.error('❌ BLE initialization failed!')
          console.error('Error type:', typeof initError)
          console.error('Error:', initError)
          console.error('Error message:', initError?.message)
          console.error('Error code:', initError?.code)
          console.error('Error stack:', initError?.stack)
          if (initError.toString) {
            console.error('Error toString:', initError.toString())
          }
          isBLESupported.value = false
          lastError.value = initError?.message || 'BLE initialization failed. Please enable Bluetooth.'
          return false
        }
      } else {
        // For web, check if Web Bluetooth API is available
        console.log('🌐 Checking Web Bluetooth API...')
        if (navigator.bluetooth) {
          isBLESupported.value = true
          console.log('✅ Web Bluetooth API available')
          return true
        } else {
          console.warn('⚠️ Web Bluetooth API not available')
          isBLESupported.value = false
          lastError.value = 'Web Bluetooth not supported in this browser. Use Chrome or Edge.'
          return false
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error checking BLE support:', error)
      console.error('Error details:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      })
      lastError.value = error?.message || 'Unknown error checking BLE support'
      isBLESupported.value = false
      return false
    }
  }

  /**
   * Connect to a BLE device using Capacitor Bluetooth LE
   *
   * @param {string} serviceUUID - The service UUID to filter devices
   * @returns {Promise<boolean>} Connection success
   */
  const connectCapacitor = async (serviceUUID) => {
    try {
      isConnecting.value = true
      isScanning.value = true
      console.log('🔍 Scanning for BLE devices with service:', serviceUUID)

      // Request device and connect
      const device = await bluetoothLE.requestDevice({
        services: [serviceUUID],
        optionalServices: [serviceUUID],
      })

      console.log('📱 Device found:', device)
      bleDevice = device

      // Connect to the device
      await bluetoothLE.connect(device.deviceId, () => {
        console.log('🔌 Device disconnected')
        handleDisconnect()
      })

      deviceName.value = device.name || device.deviceId
      isConnected.value = true
      isScanning.value = false
      console.log('✅ Connected to device:', deviceName.value)

      Notify.create({
        type: 'positive',
        message: `Connected to ${deviceName.value}`,
        position: 'top',
        timeout: 2000,
      })

      return true
    } catch (error) {
      console.error('❌ Capacitor BLE connection error:', error)
      lastError.value = error.message
      isConnected.value = false
      isScanning.value = false

      Notify.create({
        type: 'negative',
        message: error.message || 'Failed to connect to device',
        position: 'top',
        timeout: 3000,
      })

      return false
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * Connect to a BLE device using Web Bluetooth API
   *
   * @param {string} serviceUUID - The service UUID to filter devices
   * @returns {Promise<boolean>} Connection success
   */
  const connectWebBluetooth = async (serviceUUID) => {
    try {
      isConnecting.value = true
      isScanning.value = true
      console.log('🔍 Requesting Web Bluetooth device with service:', serviceUUID)

      // Request device from user
      bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceUUID] }],
        optionalServices: [serviceUUID],
      })

      console.log('📱 Device selected:', bleDevice.name)
      deviceName.value = bleDevice.name || 'Unknown Device'

      // Connect to GATT server
      await bleDevice.gatt.connect()
      console.log('✅ Connected to GATT server')

      // Set up disconnect handler
      bleDevice.addEventListener('gattserverdisconnected', handleDisconnect)

      isConnected.value = true
      isScanning.value = false

      Notify.create({
        type: 'positive',
        message: `Connected to ${deviceName.value}`,
        position: 'top',
        timeout: 2000,
      })

      return true
    } catch (error) {
      console.error('❌ Web Bluetooth connection error:', error)
      lastError.value = error.message
      isConnected.value = false
      isScanning.value = false

      // User cancelled the dialog
      if (error.name === 'NotFoundError') {
        Notify.create({
          type: 'info',
          message: 'Device selection cancelled',
          position: 'top',
          timeout: 2000,
        })
      } else {
        Notify.create({
          type: 'negative',
          message: error.message || 'Failed to connect to device',
          position: 'top',
          timeout: 3000,
        })
      }

      return false
    } finally {
      isConnecting.value = false
    }
  }

  /**
   * Generic connect function that uses the appropriate method based on platform
   *
   * @param {string} serviceUUID - The service UUID to filter devices
   * @returns {Promise<boolean>} Connection success
   */
  const connect = async (serviceUUID) => {
    // Check BLE support first
    const isSupported = await checkBLESupport()
    if (!isSupported) {
      Notify.create({
        type: 'negative',
        message: 'Bluetooth is not supported on this device',
        position: 'top',
        timeout: 3000,
      })
      return false
    }

    // Use appropriate connection method
    if (isReallyNative()) {
      return await connectCapacitor(serviceUUID)
    } else {
      return await connectWebBluetooth(serviceUUID)
    }
  }

  /**
   * Write data to a BLE characteristic using Capacitor
   *
   * @param {string} serviceUUID - The service UUID
   * @param {string} characteristicUUID - The characteristic UUID
   * @param {string} data - The data to write
   * @returns {Promise<boolean>} Write success
   */
  const writeCapacitor = async (serviceUUID, characteristicUUID, data) => {
    try {
      if (!bleDevice) {
        throw new Error('No device connected')
      }

      console.log('📝 Writing to characteristic:', characteristicUUID)
      console.log('📝 Data:', data)

      // Convert string to DataView
      const encoder = new TextEncoder()
      const dataArray = encoder.encode(data)

      await bluetoothLE.write(bleDevice.deviceId, serviceUUID, characteristicUUID, dataArray)

      console.log('✅ Data written successfully')
      return true
    } catch (error) {
      console.error('❌ Write error:', error)
      lastError.value = error.message

      Notify.create({
        type: 'negative',
        message: 'Failed to send command',
        position: 'top',
        timeout: 3000,
      })

      return false
    }
  }

  /**
   * Write data to a BLE characteristic using Web Bluetooth API
   *
   * @param {string} serviceUUID - The service UUID
   * @param {string} characteristicUUID - The characteristic UUID
   * @param {string} data - The data to write
   * @returns {Promise<boolean>} Write success
   */
  const writeWebBluetooth = async (serviceUUID, characteristicUUID, data) => {
    try {
      if (!bleDevice || !bleDevice.gatt.connected) {
        throw new Error('No device connected')
      }

      console.log('📝 Writing to characteristic:', characteristicUUID)
      console.log('📝 Data:', data)

      // Get service and characteristic
      const server = bleDevice.gatt
      const service = await server.getPrimaryService(serviceUUID)
      const characteristic = await service.getCharacteristic(characteristicUUID)

      // Convert string to ArrayBuffer
      const encoder = new TextEncoder()
      const dataArray = encoder.encode(data)

      // Write to characteristic
      await characteristic.writeValue(dataArray)

      console.log('✅ Data written successfully')
      return true
    } catch (error) {
      console.error('❌ Write error:', error)
      lastError.value = error.message

      Notify.create({
        type: 'negative',
        message: 'Failed to send command',
        position: 'top',
        timeout: 3000,
      })

      return false
    }
  }

  /**
   * Generic write function that uses the appropriate method based on platform
   *
   * @param {string} serviceUUID - The service UUID
   * @param {string} characteristicUUID - The characteristic UUID
   * @param {string} data - The data to write
   * @returns {Promise<boolean>} Write success
   */
  const write = async (serviceUUID, characteristicUUID, data) => {
    if (!isConnected.value) {
      Notify.create({
        type: 'warning',
        message: 'Please connect to a device first',
        position: 'top',
        timeout: 2000,
      })
      return false
    }

    if (isReallyNative()) {
      return await writeCapacitor(serviceUUID, characteristicUUID, data)
    } else {
      return await writeWebBluetooth(serviceUUID, characteristicUUID, data)
    }
  }

  /**
   * Disconnect from the current BLE device
   */
  const disconnect = async () => {
    try {
      if (!bleDevice) {
        console.log('⚠️ No device to disconnect')
        return
      }

      console.log('🔌 Disconnecting from device...')

      if (isReallyNative()) {
        await bluetoothLE.disconnect(bleDevice.deviceId)
      } else {
        if (bleDevice.gatt.connected) {
          await bleDevice.gatt.disconnect()
        }
      }

      handleDisconnect()

      Notify.create({
        type: 'info',
        message: 'Disconnected from device',
        position: 'top',
        timeout: 2000,
      })
    } catch (error) {
      console.error('❌ Disconnect error:', error)
      lastError.value = error.message
      handleDisconnect()
    }
  }

  /**
   * Handle device disconnection (called by event listeners or manual disconnect)
   */
  const handleDisconnect = () => {
    isConnected.value = false
    deviceName.value = ''
    bleDevice = null
    console.log('🔌 Device disconnected and state cleared')
  }

  return {
    // State
    isConnected,
    isConnecting,
    isScanning,
    isBLESupported,
    deviceName,
    lastError,

    // Methods
    checkBLESupport,
    connect,
    write,
    disconnect,
  }
}
