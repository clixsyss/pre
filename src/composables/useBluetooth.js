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
   * Check if BLE is supported on the current platform
   */
  const checkBLESupport = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // For Capacitor, check if bluetooth-le plugin is available
        try {
          const { BleClient } = await import('@capacitor-community/bluetooth-le')
          bluetoothLE = BleClient

          // Check if BLE is enabled
          try {
            await bluetoothLE.initialize()
            isBLESupported.value = true
            console.log('✅ Capacitor BLE initialized')
            return true
          } catch (initError) {
            console.error('❌ BLE initialization failed:', initError)
            isBLESupported.value = false
            lastError.value = 'BLE initialization failed. Please enable Bluetooth.'
            return false
          }
        } catch (importError) {
          console.error('❌ BLE plugin not found:', importError)
          isBLESupported.value = false
          lastError.value =
            'BLE plugin not installed. Please install @capacitor-community/bluetooth-le'
          return false
        }
      } else {
        // For web, check if Web Bluetooth API is available
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
      console.error('❌ Error checking BLE support:', error)
      lastError.value = error.message || 'Unknown error checking BLE support'
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

      let selectedDevice = null
      const scanTimeout = 10000 // 10 seconds scan timeout
      const startTime = Date.now()

      // Start scanning for devices with the service UUID
      await bluetoothLE.requestLEScan(
        {
          services: [serviceUUID],
        },
        (result) => {
          // Called when a device is found
          if (result.isConnectable && !selectedDevice) {
            console.log('📱 Device found:', result)
            selectedDevice = {
              deviceId: result.device.deviceId,
              name: result.device.name || result.device.deviceId,
              rssi: result.rssi,
            }
          }
        },
      )

      // Wait for a device to be found or timeout
      while (!selectedDevice && Date.now() - startTime < scanTimeout) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Stop scanning
      try {
        await bluetoothLE.stopLEScan()
      } catch (stopError) {
        console.warn('⚠️ Error stopping scan:', stopError)
      }

      isScanning.value = false

      if (!selectedDevice) {
        throw new Error(
          'No device found with the specified service. Make sure the gate device is powered on and in range.',
        )
      }

      console.log('📱 Connecting to device:', selectedDevice)
      bleDevice = selectedDevice

      // Connect to the device
      await bluetoothLE.connect(selectedDevice.deviceId, (deviceId) => {
        console.log('🔌 Device disconnected:', deviceId)
        handleDisconnect()
      })

      deviceName.value = selectedDevice.name || selectedDevice.deviceId
      isConnected.value = true
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

      // Stop scanning if still active
      try {
        await bluetoothLE.stopLEScan()
      } catch {
        // Ignore stop errors
      }

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
    if (Capacitor.isNativePlatform()) {
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

    if (Capacitor.isNativePlatform()) {
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

      if (Capacitor.isNativePlatform()) {
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
