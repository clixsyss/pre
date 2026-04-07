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
  let bleInitialized = false
  let disconnectListeners = new Map()
  let scanListener = null

  const getRuntimeCapacitor = () => {
    return window.Capacitor || Capacitor
  }

  const encodeHex = (value) => {
    return Array.from(value).map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  const decodeHexString = (hex) => {
    if (!hex || typeof hex !== 'string') return ''

    const bytes = []
    for (let index = 0; index < hex.length; index += 2) {
      bytes.push(parseInt(hex.slice(index, index + 2), 16))
    }

    return new TextDecoder().decode(new Uint8Array(bytes))
  }

  const clearDisconnectListener = async (deviceId) => {
    const listener = disconnectListeners.get(deviceId)
    if (listener?.remove) {
      await listener.remove()
    }
    disconnectListeners.delete(deviceId)
  }

  const clearScanListener = async () => {
    if (scanListener?.remove) {
      await scanListener.remove()
    }
    scanListener = null
  }

  const createNativePluginFacade = (plugin) => {
    return {
      initialize: async (options) => plugin.initialize(options),
      requestDevice: async (options) => plugin.requestDevice(options),
      connect: async (deviceId, onDisconnect) => {
        await clearDisconnectListener(deviceId)
        if (onDisconnect && plugin.addListener) {
          const listener = await plugin.addListener(`disconnected|${deviceId}`, () => {
            onDisconnect(deviceId)
          })
          disconnectListeners.set(deviceId, listener)
        }
        await plugin.connect({ deviceId })
      },
      write: async (deviceId, service, characteristic, value) => {
        await plugin.write({
          deviceId,
          service,
          characteristic,
          value: encodeHex(value),
        })
      },
      read: async (deviceId, service, characteristic) => {
        const result = await plugin.read({
          deviceId,
          service,
          characteristic,
        })
        return decodeHexString(result?.value || '')
      },
      disconnect: async (deviceId) => {
        await clearDisconnectListener(deviceId)
        await plugin.disconnect({ deviceId })
      },
      requestLEScan: async (options, callback) => {
        await clearScanListener()
        scanListener = await plugin.addListener('onScanResult', callback)
        await plugin.requestLEScan(options)
      },
      stopLEScan: async () => {
        await clearScanListener()
        await plugin.stopLEScan()
      },
      readRssi: async (deviceId) => {
        const result = await plugin.readRssi({ deviceId })
        return Number(result?.value)
      },
    }
  }

  const loadNativeBleClient = async () => {
    if (bluetoothLE) {
      return bluetoothLE
    }

    const runtimePlugin = window.Capacitor?.Plugins?.BluetoothLe
    if (runtimePlugin?.initialize) {
      bluetoothLE = createNativePluginFacade(runtimePlugin)
      return bluetoothLE
    }

    const { BleClient } = await import('@capacitor-community/bluetooth-le')
    bluetoothLE = BleClient
    return bluetoothLE
  }

  const initializeNativeBle = async () => {
    const client = await loadNativeBleClient()

    if (bleInitialized) {
      return client
    }

    try {
      await client.initialize({
        androidNeverForLocation: true,
      })
      bleInitialized = true
      lastError.value = null
      return client
    } catch (error) {
      const message = String(error?.message || error || '')
      const alreadyInitialized = /already.*initialized|initialized/i.test(message)
      if (alreadyInitialized) {
        bleInitialized = true
        lastError.value = null
        return client
      }
      throw error
    }
  }

  /**
   * Check if we're actually running on a native platform
   * More reliable than just Capacitor.isNativePlatform()
   */
  const isReallyNative = () => {
    const runtimeCapacitor = getRuntimeCapacitor()
    const platform = runtimeCapacitor?.getPlatform?.() || Capacitor.getPlatform()
    const isNative = runtimeCapacitor?.isNativePlatform?.() || Capacitor.isNativePlatform()
    
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
      const runtimeCapacitor = getRuntimeCapacitor()
      console.log('📱 Platform:', runtimeCapacitor?.getPlatform?.() || Capacitor.getPlatform())
      console.log('📱 Is Native (standard):', runtimeCapacitor?.isNativePlatform?.() || Capacitor.isNativePlatform())
      console.log('📱 Protocol:', window.location.protocol)
      
      const isNative = isReallyNative()
      console.log('📱 Is Native (enhanced):', isNative)
      
      if (isNative) {
        // For Capacitor, dynamically import the BLE plugin
        try {
          console.log('📦 Dynamically importing BLE plugin...')
          await loadNativeBleClient()
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
          await initializeNativeBle()
          console.log('✅ Capacitor BLE initialized successfully')
          isBLESupported.value = true
          lastError.value = null
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
          // Native app still supports BLE if the plugin is present; initialization can fail
          // temporarily when Bluetooth is off or permissions have not been granted yet.
          isBLESupported.value = true
          lastError.value = initError?.message || 'Bluetooth is unavailable right now. Please enable it and try again.'
          return true
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
  const connectCapacitor = async (serviceUUID, options = {}) => {
    try {
      await initializeNativeBle()
      isConnecting.value = true
      isScanning.value = true
      console.log('🔍 Scanning for BLE devices with service:', serviceUUID)

      const requestOptions = {
        services: [serviceUUID],
        optionalServices: [serviceUUID],
      }

      if (options.name) {
        requestOptions.name = options.name
      } else if (options.namePrefix) {
        requestOptions.namePrefix = options.namePrefix
      }

      if (options.scanMode !== undefined) {
        requestOptions.scanMode = options.scanMode
      }

      // Request device and connect
      const device = await bluetoothLE.requestDevice(requestOptions)

      console.log('📱 Device found:', device)
      bleDevice = device
      lastError.value = null

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

  const scanAndConnectNearestCapacitor = async (serviceUUID, options = {}) => {
    try {
      await initializeNativeBle()
      isConnecting.value = true
      isScanning.value = true
      lastError.value = null

      const timeoutMs = options.timeoutMs || 3000
      const minRssi = options.minRssi ?? -55
      const candidateNames = Array.isArray(options.deviceNames) ? options.deviceNames : []

      let strongestResult = null

      await bluetoothLE.requestLEScan(
        {
          services: [serviceUUID],
          allowDuplicates: true,
          scanMode: options.scanMode !== undefined ? options.scanMode : 2,
        },
        (result) => {
          const candidateName = result?.localName || result?.device?.name || ''
          const matchesName =
            candidateNames.length === 0 || candidateNames.includes(candidateName)

          if (!matchesName || typeof result?.rssi !== 'number') {
            return
          }

          if (!strongestResult || result.rssi > strongestResult.rssi) {
            strongestResult = result
          }
        }
      )

      await new Promise((resolve) => {
        window.setTimeout(resolve, timeoutMs)
      })

      await bluetoothLE.stopLEScan()
      isScanning.value = false

      if (!strongestResult?.device?.deviceId) {
        throw new Error('No suitable gate found nearby')
      }

      if (strongestResult.rssi < minRssi) {
        throw new Error('No suitable gate found nearby')
      }

      bleDevice = strongestResult.device
      await bluetoothLE.connect(bleDevice.deviceId, () => {
        console.log('🔌 Device disconnected')
        handleDisconnect()
      })

      deviceName.value =
        strongestResult.localName || strongestResult.device.name || strongestResult.device.deviceId
      isConnected.value = true

      Notify.create({
        type: 'positive',
        message: `Connected to ${deviceName.value}`,
        position: 'top',
        timeout: 2000,
      })

      return {
        success: true,
        rssi: strongestResult.rssi,
        deviceName: deviceName.value,
      }
    } catch (error) {
      console.error('❌ Capacitor BLE nearest scan error:', error)
      lastError.value = error?.message || 'Failed to find a nearby gate'
      isConnected.value = false
      isScanning.value = false

      Notify.create({
        type: 'negative',
        message: lastError.value,
        position: 'top',
        timeout: 3000,
      })

      return {
        success: false,
        error: lastError.value,
      }
    } finally {
      isConnecting.value = false
      isScanning.value = false
    }
  }

  /**
   * Connect to a BLE device using Web Bluetooth API
   *
   * @param {string} serviceUUID - The service UUID to filter devices
   * @returns {Promise<boolean>} Connection success
   */
  const connectWebBluetooth = async (serviceUUID, options = {}) => {
    try {
      isConnecting.value = true
      isScanning.value = true
      console.log('🔍 Requesting Web Bluetooth device with service:', serviceUUID)

      const filter = { services: [serviceUUID] }
      if (options.name) {
        filter.name = options.name
      } else if (options.namePrefix) {
        filter.namePrefix = options.namePrefix
      }

      // Request device from user
      bleDevice = await navigator.bluetooth.requestDevice({
        filters: [filter],
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
  const connect = async (serviceUUID, options = {}) => {
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
      return await connectCapacitor(serviceUUID, options)
    } else {
      return await connectWebBluetooth(serviceUUID, options)
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

  const readCapacitor = async (serviceUUID, characteristicUUID) => {
    try {
      if (!bleDevice) {
        throw new Error('No device connected')
      }

      const value = await bluetoothLE.read(bleDevice.deviceId, serviceUUID, characteristicUUID)
      if (typeof value === 'string') {
        return value
      }

      if (value?.buffer) {
        return new TextDecoder().decode(new Uint8Array(value.buffer))
      }

      return ''
    } catch (error) {
      console.error('❌ Read error:', error)
      lastError.value = error?.message || 'Failed to read gate response'
      return ''
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

  const readWebBluetooth = async (serviceUUID, characteristicUUID) => {
    try {
      if (!bleDevice || !bleDevice.gatt.connected) {
        throw new Error('No device connected')
      }

      const server = bleDevice.gatt
      const service = await server.getPrimaryService(serviceUUID)
      const characteristic = await service.getCharacteristic(characteristicUUID)
      const value = await characteristic.readValue()

      return new TextDecoder().decode(new Uint8Array(value.buffer))
    } catch (error) {
      console.error('❌ Read error:', error)
      lastError.value = error?.message || 'Failed to read gate response'
      return ''
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

  const read = async (serviceUUID, characteristicUUID) => {
    if (!isConnected.value) {
      return ''
    }

    if (isReallyNative()) {
      return await readCapacitor(serviceUUID, characteristicUUID)
    }

    return await readWebBluetooth(serviceUUID, characteristicUUID)
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
    scanAndConnectNearest: async (serviceUUID, options = {}) => {
      if (!isReallyNative()) {
        return { success: false, error: 'Nearest gate scan is only available on native devices.' }
      }

      const isSupported = await checkBLESupport()
      if (!isSupported) {
        return { success: false, error: 'Bluetooth is not supported on this device.' }
      }

      return await scanAndConnectNearestCapacitor(serviceUUID, options)
    },
    read,
    write,
    disconnect,
  }
}
