import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import smartMirrorService from '../services/smartMirrorService'

export const useSmartMirrorStore = defineStore('smartMirror', () => {
  // State
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref(null)
  const userProfile = ref(null)
  const rooms = ref([])
  const devices = ref([])
  const selectedRoom = ref(null)
  const currentProjectId = ref(null)
  const projectConnections = ref(new Map())

  // Computed properties
  const connectionStatus = computed(() => ({
    isConnected: isConnected.value,
    isConnecting: isConnecting.value,
    hasError: !!connectionError.value,
    error: connectionError.value,
    hasUser: !!userProfile.value,
    roomsCount: rooms.value.length,
    devicesCount: devices.value.length
  }))

  const lights = computed(() => 
    devices.value.filter(device => device.type === 'light')
  )

  const climateDevices = computed(() => 
    devices.value.filter(device => device.type === 'thermostat' || device.type === 'climate')
  )

  const plugs = computed(() => 
    devices.value.filter(device => device.type === 'plug' || device.type === 'outlet')
  )

  const devicesByRoom = computed(() => {
    const grouped = {}
    rooms.value.forEach(room => {
      grouped[room.id] = room.devices || []
    })
    return grouped
  })

  // Selected devices for homepage display
  const selectedHomepageDevices = ref({})

  // Actions
  const connect = async (email, password, projectId) => {
    try {
      isConnecting.value = true
      connectionError.value = null

      const result = await smartMirrorService.login(email, password, projectId)
      
      if (result.success) {
        isConnected.value = true
        userProfile.value = smartMirrorService.userProfile
        rooms.value = smartMirrorService.rooms
        devices.value = smartMirrorService.devices
        currentProjectId.value = projectId
        
        // Update project connections
        projectConnections.value.set(projectId, {
          isConnected: true,
          userProfile: smartMirrorService.userProfile,
          rooms: smartMirrorService.rooms,
          devices: smartMirrorService.devices
        })
        
        // Set up real-time update callback with project filtering
        smartMirrorService.setDevicesUpdateCallback((updatedRooms, updatedDevices, updatedProjectId) => {
          // Only update if it's for the current project
          if (updatedProjectId === projectId) {
            rooms.value = updatedRooms
            devices.value = updatedDevices
          }
        })
        
        // Set up auth state listener
        smartMirrorService.setupAuthListener()
        
        return { success: true }
      }
    } catch (error) {
      console.error('Smart Mirror connection error:', error)
      connectionError.value = error.message
      return { success: false, error: error.message }
    } finally {
      isConnecting.value = false
    }
  }

  // Initialize the Smart Mirror app
  const initializeApp = async () => {
    try {
      await smartMirrorService.initializeApp()
      
      // Update store state with restored connections
      isConnected.value = smartMirrorService.isConnected
      userProfile.value = smartMirrorService.userProfile
      rooms.value = smartMirrorService.rooms
      devices.value = smartMirrorService.devices
      currentProjectId.value = smartMirrorService.currentProjectId
      
      // Update project connections map
      projectConnections.value = new Map(smartMirrorService.projectConnections)
      
      // Load selected homepage devices from localStorage
      if (currentProjectId.value) {
        const savedSettings = localStorage.getItem(`deviceSettings_${currentProjectId.value}`)
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings)
          // Check if we need to migrate old categorization
          if (parsedSettings.fans || parsedSettings.other) {
            console.log('Migrating old device categorization...')
            // Clear old settings and let them be recategorized
            localStorage.removeItem(`deviceSettings_${currentProjectId.value}`)
            selectedHomepageDevices.value = {}
          } else {
            selectedHomepageDevices.value = parsedSettings
            console.log('Loaded selected homepage devices:', selectedHomepageDevices.value)
          }
        }
      }
      
      // Debug logging
      console.log('Smart Mirror Store initialized:', {
        isConnected: isConnected.value,
        currentProjectId: currentProjectId.value,
        projectConnections: Array.from(projectConnections.value.keys()),
        devicesCount: devices.value.length,
        selectedHomepageDevices: selectedHomepageDevices.value
      })
      
      // Set up real-time update callback with project filtering
      smartMirrorService.setDevicesUpdateCallback((updatedRooms, updatedDevices, updatedProjectId) => {
        // Only update if it's for the current project
        if (updatedProjectId === currentProjectId.value) {
          rooms.value = updatedRooms
          devices.value = updatedDevices
        }
      })
      
      // Set up auth state listener
      smartMirrorService.setupAuthListener()
      
      return { success: true }
    } catch (error) {
      console.error('Error initializing Smart Mirror app:', error)
      return { success: false, error: error.message }
    }
  }

  const disconnect = async (projectId = null) => {
    try {
      const result = await smartMirrorService.logout(projectId)
      
      if (result.success) {
        if (projectId) {
          // Disconnect from specific project
          projectConnections.value.delete(projectId)
          
          // If this was the current project, clear current state
          if (currentProjectId.value === projectId) {
            isConnected.value = false
            userProfile.value = null
            rooms.value = []
            devices.value = []
            selectedRoom.value = null
            currentProjectId.value = null
          }
        } else {
          // Disconnect from all projects
          isConnected.value = false
          userProfile.value = null
          rooms.value = []
          devices.value = []
          selectedRoom.value = null
          currentProjectId.value = null
          projectConnections.value.clear()
        }
        
        connectionError.value = null
        return { success: true }
      }
    } catch (error) {
      console.error('Smart Mirror disconnection error:', error)
      connectionError.value = error.message
      return { success: false, error: error.message }
    }
  }

  const switchToProject = async (projectId) => {
    try {
      const result = smartMirrorService.switchToProject(projectId)
      
      if (result.success) {
        // Update store state with service state
        isConnected.value = smartMirrorService.isConnected
        userProfile.value = smartMirrorService.userProfile
        rooms.value = smartMirrorService.rooms
        devices.value = smartMirrorService.devices
        currentProjectId.value = smartMirrorService.currentProjectId
        
        // Set up real-time update callback with project filtering
        smartMirrorService.setDevicesUpdateCallback((updatedRooms, updatedDevices, updatedProjectId) => {
          // Only update if it's for the current project
          if (updatedProjectId === currentProjectId.value) {
            rooms.value = updatedRooms
            devices.value = updatedDevices
          }
        })
        
        console.log(`Switched to project ${projectId}:`, {
          isConnected: isConnected.value,
          devicesCount: devices.value.length,
          roomsCount: rooms.value.length
        })
        
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Error switching to project:', error)
      return { success: false, error: error.message }
    }
  }

  const isProjectConnected = (projectId) => {
    // Check both service and store state
    const serviceConnected = smartMirrorService.isProjectConnected(projectId)
    const storeConnected = projectConnections.value.has(projectId)
    return serviceConnected || storeConnected
  }

  const getProjectConnectionStatus = (projectId) => {
    return smartMirrorService.getProjectConnectionStatus(projectId)
  }

  const getProjectDevices = (projectId) => {
    return smartMirrorService.getProjectDevices(projectId)
  }

  const refreshDevices = async () => {
    if (!isConnected.value) return

    try {
      const result = await smartMirrorService.fetchDevices()
      if (result) {
        rooms.value = result.rooms
        devices.value = result.devices
      }
    } catch (error) {
      console.error('Error refreshing devices:', error)
      connectionError.value = error.message
    }
  }

  const selectRoom = (roomId) => {
    selectedRoom.value = roomId
  }

  const getRoomDevices = (roomId) => {
    const room = rooms.value.find(r => r.id === roomId)
    return room ? room.devices : []
  }

  // Device control actions
  const toggleLight = async (roomId, deviceId, state) => {
    try {
      const result = await smartMirrorService.toggleLight(roomId, deviceId, state)
      if (result.success) {
        // Update local state
        refreshDevices()
        return { success: true }
      }
    } catch (error) {
      console.error('Error toggling light:', error)
      return { success: false, error: error.message }
    }
  }

  const setLightBrightness = async (roomId, deviceId, brightness) => {
    try {
      const result = await smartMirrorService.setLightBrightness(roomId, deviceId, brightness)
      if (result.success) {
        // Update local state
        refreshDevices()
        return { success: true }
      }
    } catch (error) {
      console.error('Error setting light brightness:', error)
      return { success: false, error: error.message }
    }
  }

  const setClimateState = async (roomId, deviceId, state) => {
    try {
      const result = await smartMirrorService.setClimateState(roomId, deviceId, state)
      if (result.success) {
        // Update local state
        refreshDevices()
        return { success: true }
      }
    } catch (error) {
      console.error('Error setting climate state:', error)
      return { success: false, error: error.message }
    }
  }

  const setClimateTemperature = async (roomId, deviceId, temperature) => {
    try {
      const result = await smartMirrorService.setClimateTemperature(roomId, deviceId, temperature)
      if (result.success) {
        // Update local state
        refreshDevices()
        return { success: true }
      }
    } catch (error) {
      console.error('Error setting climate temperature:', error)
      return { success: false, error: error.message }
    }
  }

  const setClimateMode = async (roomId, deviceId, mode) => {
    try {
      const result = await smartMirrorService.setClimateMode(roomId, deviceId, mode)
      if (result.success) {
        // Update local state
        refreshDevices()
        return { success: true }
      }
    } catch (error) {
      console.error('Error setting climate mode:', error)
      return { success: false, error: error.message }
    }
  }

  const clearError = () => {
    connectionError.value = null
  }

  const setSelectedDevices = (selectedDevices) => {
    selectedHomepageDevices.value = selectedDevices
  }

  const reset = () => {
    isConnected.value = false
    isConnecting.value = false
    connectionError.value = null
    userProfile.value = null
    rooms.value = []
    devices.value = []
    selectedRoom.value = null
    selectedHomepageDevices.value = {}
  }

  return {
    // State
    isConnected,
    isConnecting,
    connectionError,
    userProfile,
    rooms,
    devices,
    selectedRoom,
    currentProjectId,
    projectConnections,

    // Computed
    connectionStatus,
    lights,
    climateDevices,
    plugs,
    devicesByRoom,
    selectedHomepageDevices,

    // Actions
    connect,
    initializeApp,
    disconnect,
    switchToProject,
    isProjectConnected,
    getProjectConnectionStatus,
    getProjectDevices,
    refreshDevices,
    selectRoom,
    getRoomDevices,
    toggleLight,
    setLightBrightness,
    setClimateState,
    setClimateTemperature,
    setClimateMode,
    setSelectedDevices,
    clearError,
    reset
  }
})
