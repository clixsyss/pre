import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  onSnapshot, 
  updateDoc 
} from 'firebase/firestore'
import { smartMirrorAuth, smartMirrorDb } from '../boot/smartMirrorFirebase'

class SmartMirrorService {
  constructor() {
    this.currentUser = null
    this.userProfile = null
    this.rooms = []
    this.devices = []
    this.listeners = []
    this.isConnected = false
    this.currentProjectId = null
    this.projectConnections = new Map() // Store connections per project
    this.onDevicesUpdate = null // Callback for device updates
  }

  // Authentication methods
  async login(email, password, projectId) {
    try {
      const result = await signInWithEmailAndPassword(smartMirrorAuth, email, password)
      this.currentUser = result.user
      this.currentProjectId = projectId
      
      // Fetch user profile
      await this.fetchUserProfile()
      
      // Fetch devices
      await this.fetchDevices()
      
  // Store connection for this project with project-specific data
  this.projectConnections.set(projectId, {
    user: result.user,
    userProfile: this.userProfile,
    rooms: this.rooms,
    devices: this.devices,
    isConnected: true,
    projectId: projectId,
    lastUpdated: Date.now()
  })
      
      // Save to localStorage for persistence
      this.saveProjectConnections()
      
      // Set up real-time listeners for this project
      this.setupRealtimeListeners()
      
      this.isConnected = true
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Smart Mirror login error:', error)
      throw error
    }
  }

  async logout(projectId = null) {
    try {
      if (projectId) {
        // Logout from specific project
        this.projectConnections.delete(projectId)
        
        // Save updated connections
        this.saveProjectConnections()
        
        // If this was the current project, clear current state
        if (this.currentProjectId === projectId) {
          this.currentUser = null
          this.userProfile = null
          this.rooms = []
          this.devices = []
          this.isConnected = false
          this.currentProjectId = null
          this.cleanup()
        }
      } else {
        // Logout from all projects
        await signOut(smartMirrorAuth)
        this.currentUser = null
        this.userProfile = null
        this.rooms = []
        this.devices = []
        this.isConnected = false
        this.currentProjectId = null
        this.projectConnections.clear()
        this.cleanup()
        
        // Clear localStorage
        localStorage.removeItem('smartMirrorProjectConnections')
      }
      
      return { success: true }
    } catch (error) {
      console.error('Smart Mirror logout error:', error)
      throw error
    }
  }

  // Switch to a different project's connection
  async switchToProject(projectId) {
    try {
      const connection = this.projectConnections.get(projectId)
      
      // Clean up existing listeners first
      this.cleanup()
      
      if (connection) {
        // Project has Smart Mirror connection - restore its data
        this.currentUser = connection.user
        this.userProfile = connection.userProfile
        this.rooms = connection.rooms
        this.devices = connection.devices
        this.isConnected = connection.isConnected
        this.currentProjectId = projectId
        
        // Set up real-time listeners for this project
        this.setupRealtimeListeners()
        
        console.log(`Switched to project ${projectId} - Smart Mirror connected`)
        return { success: true }
      } else {
        // Project has no Smart Mirror connection - clear all data
        this.currentUser = null
        this.userProfile = null
        this.rooms = []
        this.devices = []
        this.isConnected = false
        this.currentProjectId = projectId
        
        console.log(`Switched to project ${projectId} - no Smart Mirror connection, cleared data`)
        
        return { success: true }
      }
    } catch (error) {
      console.error('Error switching to project:', error)
      return { success: false, error: error.message }
    }
  }

  // Check if a project has Smart Mirror connection
  isProjectConnected(projectId) {
    return this.projectConnections.has(projectId)
  }

  // Get connection status for a specific project
  getProjectConnectionStatus(projectId) {
    const connection = this.projectConnections.get(projectId)
    if (connection) {
      return {
        isConnected: connection.isConnected,
        hasUser: !!connection.user,
        hasProfile: !!connection.userProfile,
        roomsCount: connection.rooms.length,
        devicesCount: connection.devices.length
      }
    }
    return {
      isConnected: false,
      hasUser: false,
      hasProfile: false,
      roomsCount: 0,
      devicesCount: 0
    }
  }

  // Get devices for a specific project
  getProjectDevices(projectId) {
    const connection = this.projectConnections.get(projectId)
    if (connection && connection.isConnected) {
      return {
        rooms: connection.rooms || [],
        devices: connection.devices || [],
        userProfile: connection.userProfile
      }
    }
    return {
      rooms: [],
      devices: [],
      userProfile: null
    }
  }

  // Update devices for a specific project
  updateProjectDevices(projectId, rooms, devices) {
    const connection = this.projectConnections.get(projectId)
    if (connection) {
      connection.rooms = rooms
      connection.devices = devices
      connection.lastUpdated = Date.now()
      this.projectConnections.set(projectId, connection)
      
      // Save updated connections
      this.saveProjectConnections()
    }
  }

  // Set up auth state listener
  setupAuthListener() {
    return onAuthStateChanged(smartMirrorAuth, async (user) => {
      if (user) {
        this.currentUser = user
        await this.fetchUserProfile()
        await this.fetchDevices()
        this.isConnected = true
        
        // Restore project connections from localStorage
        await this.restoreProjectConnections()
        
        // If we have project connections, set up the first one as current
        if (this.projectConnections.size > 0) {
          const firstProjectId = this.projectConnections.keys().next().value
          this.switchToProject(firstProjectId)
        }
      } else {
        this.currentUser = null
        this.userProfile = null
        this.rooms = []
        this.devices = []
        this.isConnected = false
        this.currentProjectId = null
        this.projectConnections.clear()
        this.cleanup()
      }
    })
  }

  // Initialize app with stored connections
  async initializeApp() {
    try {
      // Set up auth state listener to handle authentication restoration
      this.setupAuthListener()
      
      // Check if user is already authenticated (immediate check)
      if (smartMirrorAuth.currentUser) {
        this.currentUser = smartMirrorAuth.currentUser
        await this.fetchUserProfile()
        this.isConnected = true
        
        // Restore project connections from localStorage
        await this.restoreProjectConnections()
        
        // If we have project connections, set up the first one as current
        if (this.projectConnections.size > 0) {
          const firstProjectId = this.projectConnections.keys().next().value
          this.switchToProject(firstProjectId)
        }
      }
    } catch (error) {
      console.error('Error initializing Smart Mirror app:', error)
    }
  }

  // Restore project connections from localStorage
  async restoreProjectConnections() {
    try {
      const storedConnections = localStorage.getItem('smartMirrorProjectConnections')
      console.log('Restoring project connections from localStorage:', storedConnections)
      
      if (storedConnections) {
        const connections = JSON.parse(storedConnections)
        console.log('Parsed connections:', connections)
        
        for (const [projectId, connectionData] of Object.entries(connections)) {
          if (connectionData.isConnected && connectionData.userId === this.currentUser?.uid) {
            // Restore connection data
            this.projectConnections.set(projectId, {
              user: this.currentUser,
              userProfile: connectionData.userProfile,
              rooms: connectionData.rooms || [],
              devices: connectionData.devices || [],
              isConnected: true
            })
            console.log(`Restored connection for project ${projectId}`)
          }
        }
      }
      
      console.log('Final projectConnections:', Array.from(this.projectConnections.keys()))
    } catch (error) {
      console.error('Error restoring project connections:', error)
    }
  }

  // Save project connections to localStorage
  saveProjectConnections() {
    try {
      const connectionsToSave = {}
      
      for (const [projectId, connection] of this.projectConnections.entries()) {
        if (connection.isConnected) {
          connectionsToSave[projectId] = {
            isConnected: true,
            userId: this.currentUser?.uid,
            userProfile: connection.userProfile,
            rooms: connection.rooms,
            devices: connection.devices,
            lastUpdated: Date.now()
          }
        }
      }
      
      localStorage.setItem('smartMirrorProjectConnections', JSON.stringify(connectionsToSave))
    } catch (error) {
      console.error('Error saving project connections:', error)
    }
  }

  // Update project connection data
  updateProjectConnection() {
    if (this.currentProjectId && this.projectConnections.has(this.currentProjectId)) {
      const connection = this.projectConnections.get(this.currentProjectId)
      connection.rooms = this.rooms
      connection.devices = this.devices
      this.projectConnections.set(this.currentProjectId, connection)
      
      // Save updated connections
      this.saveProjectConnections()
    }
  }

  // Set callback for device updates
  setDevicesUpdateCallback(callback) {
    this.onDevicesUpdate = callback
  }

  // Fetch user profile
  async fetchUserProfile() {
    if (!this.currentUser) return null

    try {
      const userDoc = await getDoc(doc(smartMirrorDb, 'users', this.currentUser.uid))
      if (userDoc.exists()) {
        this.userProfile = userDoc.data()
        
        // Check if user is approved
        if (!this.userProfile.approved && this.userProfile.role !== 'admin') {
          throw new Error('User account is not approved')
        }
        
        return this.userProfile
      } else {
        throw new Error('User profile not found')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  // Fetch devices from Smart Mirror database
  async fetchDevices() {
    if (!this.currentUser) return []

    try {
      // Fetch rooms using hierarchical structure
      const roomsQuery = query(collection(smartMirrorDb, 'users', this.currentUser.uid, 'rooms'))
      const querySnapshot = await getDocs(roomsQuery)

      const fetchedRooms = []
      const allDevices = []

      for (const roomDoc of querySnapshot.docs) {
        const roomData = {
          ...roomDoc.data(),
          id: roomDoc.id,
          devices: []
        }
        
        // Debug: Log room data to see what fields are available
        console.log('Room data:', roomData)
        console.log('Room name field:', roomData.name)
        console.log('Room title field:', roomData.title)
        console.log('Room displayName field:', roomData.displayName)

        // Fetch devices for this room
        const devicesQuery = query(
          collection(smartMirrorDb, 'users', this.currentUser.uid, 'rooms', roomDoc.id, 'devices')
        )
        const devicesSnapshot = await getDocs(devicesQuery)

        roomData.devices = devicesSnapshot.docs.map((deviceDoc) => ({
          id: deviceDoc.id,
          roomId: roomDoc.id,
          roomName: roomData.name || roomData.roomName || roomData.title || roomData.displayName || 'Unknown Room',
          ...deviceDoc.data()
        }))

        allDevices.push(...roomData.devices)
        fetchedRooms.push(roomData)
      }

      this.rooms = fetchedRooms
      this.devices = allDevices

      // Set up real-time listeners
      this.setupRealtimeListeners()

      return { rooms: fetchedRooms, devices: allDevices }
    } catch (error) {
      console.error('Error fetching devices:', error)
      throw error
    }
  }

  // Set up real-time listeners for device updates
  setupRealtimeListeners() {
    if (!this.currentUser) return

    // Clean up existing listeners
    this.cleanup()

    // Set up real-time listener for rooms
    const roomsRef = collection(smartMirrorDb, 'users', this.currentUser.uid, 'rooms')
    const roomsUnsubscribe = onSnapshot(roomsRef, async (roomsSnapshot) => {
      const updatedRooms = []
      
      for (const roomDoc of roomsSnapshot.docs) {
        const roomData = {
          ...roomDoc.data(),
          id: roomDoc.id,
          devices: []
        }
        
        // Debug: Log room data in real-time listener
        console.log('Real-time room data:', roomData)

        // Get devices for this room with real-time listener
        const devicesRef = collection(smartMirrorDb, 'users', this.currentUser.uid, 'rooms', roomDoc.id, 'devices')
        
        // Immediate fetch for current state
        const devicesQuery = query(devicesRef)
        const devicesSnapshot = await getDocs(devicesQuery)
        roomData.devices = devicesSnapshot.docs.map((deviceDoc) => ({
          id: deviceDoc.id,
          roomId: roomDoc.id,
          roomName: roomData.name || roomData.roomName || roomData.title || roomData.displayName || 'Unknown Room',
          ...deviceDoc.data()
        }))

        // Set up real-time listener for devices in this room
        const devicesUnsubscribe = onSnapshot(devicesRef, (devicesSnapshot) => {
          // Update devices for this specific room
          const updatedDevices = devicesSnapshot.docs.map((deviceDoc) => ({
            id: deviceDoc.id,
            roomId: roomDoc.id,
            roomName: roomData.name || roomData.roomName || roomData.title || roomData.displayName || 'Unknown Room',
            ...deviceDoc.data()
          }))
          
          // Find and update the room in the current rooms array
          const roomIndex = this.rooms.findIndex(r => r.id === roomDoc.id)
          if (roomIndex !== -1) {
            this.rooms[roomIndex].devices = updatedDevices
            this.devices = this.rooms.flatMap(room => room.devices || [])
            
            // Update project connection data for current project
            this.updateProjectConnection()
            
            // Update project-specific devices
            if (this.currentProjectId) {
              this.updateProjectDevices(this.currentProjectId, this.rooms, this.devices)
            }
            
            // Trigger store update callback if available
            if (this.onDevicesUpdate) {
              this.onDevicesUpdate(this.rooms, this.devices, this.currentProjectId)
            }
          }
        }, (error) => {
          console.error(`Firebase listener error for room ${roomDoc.id}:`, error)
        })

        this.listeners.push(devicesUnsubscribe)
        updatedRooms.push(roomData)
      }

      this.rooms = updatedRooms
      this.devices = this.rooms.flatMap(room => room.devices || [])
      
      // Update project connection data for current project
      this.updateProjectConnection()
      
      // Update project-specific devices
      if (this.currentProjectId) {
        this.updateProjectDevices(this.currentProjectId, this.rooms, this.devices)
      }
      
      // Trigger store update callback if available
      if (this.onDevicesUpdate) {
        this.onDevicesUpdate(this.rooms, this.devices, this.currentProjectId)
      }
    }, (error) => {
      console.error('Firebase listener error for rooms:', error)
    })

    this.listeners.push(roomsUnsubscribe)
  }

  // Device control methods
  async toggleLight(roomId, deviceId, state) {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      const deviceRef = doc(smartMirrorDb, 'users', this.currentUser.uid, 'rooms', roomId, 'devices', deviceId)
      await updateDoc(deviceRef, { state })
      
      // Update local state immediately for responsive UI
      this.updateLocalDeviceState(roomId, deviceId, { state })
      
      return { success: true }
    } catch (error) {
      console.error('Error toggling light:', error)
      throw error
    }
  }

  async setLightBrightness(roomId, deviceId, brightness) {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      const deviceRef = doc(smartMirrorDb, 'users', this.currentUser.uid, 'rooms', roomId, 'devices', deviceId)
      await updateDoc(deviceRef, { brightness })
      
      // Update local state immediately for responsive UI
      this.updateLocalDeviceState(roomId, deviceId, { brightness })
      
      return { success: true }
    } catch (error) {
      console.error('Error setting light brightness:', error)
      throw error
    }
  }

  async setClimateState(roomId, deviceId, state) {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      const deviceRef = doc(smartMirrorDb, 'users', this.currentUser.uid, 'rooms', roomId, 'devices', deviceId)
      await updateDoc(deviceRef, { state })
      
      // Update local state immediately for responsive UI
      this.updateLocalDeviceState(roomId, deviceId, { state })
      
      return { success: true }
    } catch (error) {
      console.error('Error setting climate state:', error)
      throw error
    }
  }

  async setClimateTemperature(roomId, deviceId, temperature) {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      const deviceRef = doc(smartMirrorDb, 'users', this.currentUser.uid, 'rooms', roomId, 'devices', deviceId)
      await updateDoc(deviceRef, { temperature })
      
      // Update local state immediately for responsive UI
      this.updateLocalDeviceState(roomId, deviceId, { temperature })
      
      return { success: true }
    } catch (error) {
      console.error('Error setting climate temperature:', error)
      throw error
    }
  }

  async setClimateMode(roomId, deviceId, mode) {
    if (!this.currentUser) {
      throw new Error('User not authenticated')
    }

    try {
      const deviceRef = doc(smartMirrorDb, 'users', this.currentUser.uid, 'rooms', roomId, 'devices', deviceId)
      await updateDoc(deviceRef, { mode })
      
      // Update local state immediately for responsive UI
      this.updateLocalDeviceState(roomId, deviceId, { mode })
      
      return { success: true }
    } catch (error) {
      console.error('Error setting climate mode:', error)
      throw error
    }
  }

  // Helper method to update local device state immediately
  updateLocalDeviceState(roomId, deviceId, updates) {
    const roomIndex = this.rooms.findIndex(room => room.id === roomId)
    
    if (roomIndex !== -1) {
      const deviceIndex = this.rooms[roomIndex].devices.findIndex(device => device.id === deviceId)
      if (deviceIndex !== -1) {
        this.rooms[roomIndex].devices[deviceIndex] = {
          ...this.rooms[roomIndex].devices[deviceIndex],
          ...updates
        }
        
        // Update the devices array
        this.devices = this.rooms.flatMap(room => room.devices || [])
      }
    }
  }

  // Get device by ID
  getDeviceById(deviceId) {
    for (const room of this.rooms) {
      const device = room.devices.find(d => d.id === deviceId)
      if (device) return device
    }
    return null
  }

  // Get room by ID
  getRoomById(roomId) {
    return this.rooms.find(room => room.id === roomId)
  }

  // Get devices by type
  getDevicesByType(type) {
    return this.devices.filter(device => device.type === type)
  }

  // Get devices by room
  getDevicesByRoom(roomId) {
    const room = this.getRoomById(roomId)
    return room ? room.devices : []
  }

  // Cleanup listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners = []
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      hasUser: !!this.currentUser,
      hasProfile: !!this.userProfile,
      roomsCount: this.rooms.length,
      devicesCount: this.devices.length
    }
  }
}

// Create singleton instance
export const smartMirrorService = new SmartMirrorService()
export default smartMirrorService
