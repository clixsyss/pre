<template>
  <div class="smart-devices-page">
    <!-- Page Header -->
    <PageHeader 
      :title="$t('smartDevicesTitle')" 
      :subtitle="isCurrentProjectConnected ? $t('connected').toLowerCase() : $t('notConnected')"
    >
      <template #actions>
        <button class="refresh-button" @click="refreshDevices" :disabled="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12A9 9 0 0 1 12 3A9 9 0 0 1 21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12A9 9 0 0 1 12 21A9 9 0 0 1 3 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3V12L16.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </template>
    </PageHeader>

    <!-- Not Connected State -->
    <div v-if="!isCurrentProjectConnected" class="not-connected-state">
      <div class="not-connected-icon">🏠</div>
      <h3>{{ $t('smartHomeNotConnected') }}</h3>
      <p>{{ $t('connectSmartHomeMessage') }}</p>
      <button @click="$router.push('/profile')" class="connect-btn">
        {{ $t('goToProfile') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingDevices') }}</p>
    </div>

    <!-- Devices Content -->
    <div v-else class="devices-content">
      <!-- Room Selector -->
      <div v-if="smartMirrorStore.rooms.length > 1" class="room-selector">
        <div class="room-selector-header">
          <h3>{{ $t('selectRoom') }}</h3>
          <span class="room-count">{{ smartMirrorStore.rooms.length }} rooms available</span>
        </div>
        <div class="room-tabs">
          <button 
            v-for="room in smartMirrorStore.rooms" 
            :key="room.id"
            :class="['room-tab', { active: selectedRoomId === room.id }]"
            @click="selectRoom(room.id)"
          >
            <div class="room-tab-content">
              <span class="room-name">{{ room.name }}</span>
              <span class="room-device-count">{{ getRoomDeviceCount(room.id) }} devices</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Devices by Category -->
      <div class="devices-sections">
        <!-- Lights Section -->
        <div v-if="roomLights.length > 0" class="devices-section">
          <div class="section-header">
            <div class="section-title">
              <div class="section-icon lights-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="section-text">
                <h3>Lights</h3>
                <span class="device-count">{{ roomLights.length }} device{{ roomLights.length !== 1 ? 's' : '' }}</span>
              </div>
            </div>
            <div class="section-actions">
              <button class="action-btn" @click="toggleAllLights">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Toggle All
              </button>
            </div>
          </div>
          <div class="devices-grid">
            <div 
              v-for="light in roomLights" 
              :key="light.id"
              class="device-card light-card"
              :class="{ 'device-on': light.state, 'device-off': !light.state }"
            >
              <div class="device-header">
                <div class="device-info">
                  <h4 class="device-name">{{ light.name }}</h4>
                  <span class="device-room">{{ light.roomName }}</span>
                </div>
                <div class="device-status" :class="{ on: light.state, off: !light.state }">
                  <div class="status-indicator"></div>
                  <span class="status-text">{{ light.state ? 'ON' : 'OFF' }}</span>
                </div>
              </div>
              
              <div class="device-controls">
                <div class="toggle-switch-container">
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      :checked="light.state"
                      :disabled="lightLoading === light.id"
                      @change="toggleLight(light)"
                    >
                    <span class="toggle-slider">
                      <div v-if="lightLoading === light.id" class="loading-spinner-small"></div>
                    </span>
                  </label>
                  <span class="toggle-label">{{ light.state ? 'ON' : 'OFF' }}</span>
                </div>
                
                <div v-if="light.state" class="brightness-control">
                  <div class="control-header">
                    <label>Brightness</label>
                    <span class="brightness-value">{{ light.brightness || 0 }}%</span>
                  </div>
                  <input 
                    type="range" 
                    :value="light.brightness || 0" 
                    @input="setBrightness(light, $event.target.value)"
                    min="0" 
                    max="100" 
                    class="brightness-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Climate Section -->
        <div v-if="roomClimateDevices.length > 0" class="devices-section">
          <div class="section-header">
            <div class="section-title">
              <div class="section-icon climate-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 4V10.54C14 11.5 14.5 12.4 15.3 12.9L16.7 13.8C17.5 14.3 18 15.2 18 16.2V17C18 18.1 17.1 19 16 19H8C6.9 19 6 18.1 6 17V16.2C6 15.2 6.5 14.3 7.3 13.8L8.7 12.9C9.5 12.4 10 11.5 10 10.5V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 4H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="section-text">
                <h3>Climate Control</h3>
                <span class="device-count">{{ roomClimateDevices.length }} device{{ roomClimateDevices.length !== 1 ? 's' : '' }}</span>
              </div>
            </div>
            <div class="section-actions">
              <button class="action-btn" @click="toggleAllClimate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Toggle All
              </button>
            </div>
          </div>
          <div class="devices-grid">
            <div 
              v-for="climate in roomClimateDevices" 
              :key="climate.id"
              class="device-card climate-card"
              :class="{ 'device-on': climate.state, 'device-off': !climate.state }"
            >
              <div class="device-header">
                <div class="device-info">
                  <h4 class="device-name">{{ climate.name }}</h4>
                  <span class="device-room">{{ climate.roomName }}</span>
                </div>
                <div class="device-status" :class="{ on: climate.state, off: !climate.state }">
                  <div class="status-indicator"></div>
                  <span class="status-text">{{ climate.state ? 'ON' : 'OFF' }}</span>
                </div>
              </div>
              
              <div class="device-controls">
                <div class="toggle-switch-container">
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      :checked="climate.state"
                      :disabled="climateLoading === climate.id"
                      @change="toggleClimate(climate)"
                    >
                    <span class="toggle-slider">
                      <div v-if="climateLoading === climate.id" class="loading-spinner-small"></div>
                    </span>
                  </label>
                  <span class="toggle-label">{{ climate.state ? 'ON' : 'OFF' }}</span>
                </div>
                
                <div v-if="climate.state" class="climate-controls">
                  <div class="temperature-control">
                    <div class="control-header">
                      <label>Temperature</label>
                      <span class="temperature-value">{{ climate.temperature || 22 }}°C</span>
                    </div>
                    <input 
                      type="range" 
                      :value="climate.temperature || 22" 
                      @input="setTemperature(climate, $event.target.value)"
                      min="16" 
                      max="30" 
                      class="temperature-slider"
                    />
                  </div>
                  
                  <div class="mode-control">
                    <label>Mode</label>
                    <select 
                      :value="climate.mode || 'heat'" 
                      @change="setMode(climate, $event.target.value)"
                      class="mode-select"
                    >
                      <option value="heat">Heat</option>
                      <option value="cool">Cool</option>
                      <option value="auto">Auto</option>
                      <option value="fan">Fan</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Plugs Section -->
        <div v-if="roomPlugs.length > 0" class="devices-section">
          <div class="section-header">
            <div class="section-title">
              <div class="section-icon plugs-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 18V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="section-text">
                <h3>Smart Plugs</h3>
                <span class="device-count">{{ roomPlugs.length }} device{{ roomPlugs.length !== 1 ? 's' : '' }}</span>
              </div>
            </div>
            <div class="section-actions">
              <button class="action-btn" @click="toggleAllPlugs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Toggle All
              </button>
            </div>
          </div>
          <div class="devices-grid">
            <div 
              v-for="plug in roomPlugs" 
              :key="plug.id"
              class="device-card plug-card"
              :class="{ 'device-on': plug.state, 'device-off': !plug.state }"
            >
              <div class="device-header">
                <div class="device-info">
                  <h4 class="device-name">{{ plug.name }}</h4>
                  <span class="device-room">{{ plug.roomName }}</span>
                </div>
                <div class="device-status" :class="{ on: plug.state, off: !plug.state }">
                  <div class="status-indicator"></div>
                  <span class="status-text">{{ plug.state ? 'ON' : 'OFF' }}</span>
                </div>
              </div>
              
              <div class="device-controls">
                <div class="toggle-switch-container">
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      :checked="plug.state"
                      :disabled="plugLoading === plug.id"
                      @change="togglePlug(plug)"
                    >
                    <span class="toggle-slider">
                      <div v-if="plugLoading === plug.id" class="loading-spinner-small"></div>
                    </span>
                  </label>
                  <span class="toggle-label">{{ plug.state ? 'ON' : 'OFF' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Devices State -->
        <div v-if="roomDevices.length === 0" class="no-devices-state">
          <div class="no-devices-icon">🔌</div>
          <h3>No Devices Found</h3>
          <p>No devices are available in this room.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { useSmartMirrorStore } from '../../stores/smartMirrorStore'
import { useNotificationStore } from '../../stores/notifications'
import { useProjectStore } from '../../stores/projectStore'
import PageHeader from '../../components/PageHeader.vue'

// Component name for ESLint
defineOptions({
  name: 'SmartDevicesPage'
})

const route = useRoute()
const smartMirrorStore = useSmartMirrorStore()
const notificationStore = useNotificationStore()
const projectStore = useProjectStore()

// Check if current project is connected to smart home
const isCurrentProjectConnected = computed(() => {
  const currentProjectId = projectStore.selectedProject?.id
  if (!currentProjectId) return false
  
  // Check if we have devices loaded for the current project
  const hasDevices = smartMirrorStore.devices.length > 0 && smartMirrorStore.currentProjectId === currentProjectId
  return hasDevices
})

// Reactive state
const loading = ref(false)
const selectedRoomId = ref(null)
const lightLoading = ref(null)
const climateLoading = ref(null)
const plugLoading = ref(null)

// Computed properties
const roomDevices = computed(() => {
  if (selectedRoomId.value) {
    return smartMirrorStore.getRoomDevices(selectedRoomId.value)
  }
  return smartMirrorStore.devices
})

const roomLights = computed(() => 
  roomDevices.value.filter(device => device.type === 'light')
)

const roomClimateDevices = computed(() => 
  roomDevices.value.filter(device => 
    device.type === 'thermostat' || 
    device.type === 'climate' || 
    device.type === 'fan' || 
    device.type === 'heater' || 
    device.type === 'ac' || 
    device.type === 'air_conditioner' ||
    device.type === 'air-conditioner'
  )
)

const roomPlugs = computed(() => 
  roomDevices.value.filter(device => 
    device.type === 'plug' || 
    device.type === 'outlet' || 
    device.type === 'switch' || 
    device.type === 'sensor' || 
    device.type === 'camera' || 
    device.type === 'door' || 
    device.type === 'window'
  )
)

// Methods
const selectRoom = (roomId) => {
  selectedRoomId.value = roomId
  smartMirrorStore.selectRoom(roomId)
}

const getRoomDeviceCount = (roomId) => {
  return smartMirrorStore.getRoomDevices(roomId).length
}

const toggleAllLights = async () => {
  const allOn = roomLights.value.every(light => light.state)
  const promises = roomLights.value.map(light => 
    smartMirrorStore.toggleLight(light.roomId, light.id, !allOn)
  )
  await Promise.all(promises)
}

const toggleAllClimate = async () => {
  const allOn = roomClimateDevices.value.every(climate => climate.state)
  const promises = roomClimateDevices.value.map(climate => 
    smartMirrorStore.setClimateState(climate.roomId, climate.id, !allOn)
  )
  await Promise.all(promises)
}

const toggleAllPlugs = async () => {
  const allOn = roomPlugs.value.every(plug => plug.state)
  const promises = roomPlugs.value.map(plug => 
    smartMirrorStore.toggleLight(plug.roomId, plug.id, !allOn)
  )
  await Promise.all(promises)
}

const toggleLight = async (light) => {
  lightLoading.value = light.id
  try {
    const result = await smartMirrorStore.toggleLight(light.roomId, light.id, !light.state)
    if (result.success) {
      notificationStore.showSuccess(`Light ${!light.state ? 'turned on' : 'turned off'}`)
    } else {
      notificationStore.showError(result.error || 'Failed to control light')
    }
  } catch {
    notificationStore.showError('Failed to control light')
  } finally {
    lightLoading.value = null
  }
}

const setBrightness = async (light, brightness) => {
  try {
    const result = await smartMirrorStore.setLightBrightness(light.roomId, light.id, parseInt(brightness))
    if (!result.success) {
      notificationStore.showError(result.error || 'Failed to set brightness')
    }
  } catch {
    notificationStore.showError('Failed to set brightness')
  }
}

const toggleClimate = async (climate) => {
  climateLoading.value = climate.id
  try {
    const result = await smartMirrorStore.setClimateState(climate.roomId, climate.id, !climate.state)
    if (result.success) {
      notificationStore.showSuccess(`Climate control ${!climate.state ? 'turned on' : 'turned off'}`)
    } else {
      notificationStore.showError(result.error || 'Failed to control climate')
    }
  } catch {
    notificationStore.showError('Failed to control climate')
  } finally {
    climateLoading.value = null
  }
}

const setTemperature = async (climate, temperature) => {
  try {
    const result = await smartMirrorStore.setClimateTemperature(climate.roomId, climate.id, parseInt(temperature))
    if (!result.success) {
      notificationStore.showError(result.error || 'Failed to set temperature')
    }
  } catch {
    notificationStore.showError('Failed to set temperature')
  }
}

const setMode = async (climate, mode) => {
  try {
    const result = await smartMirrorStore.setClimateMode(climate.roomId, climate.id, mode)
    if (result.success) {
      notificationStore.showSuccess(`Mode changed to ${mode}`)
    } else {
      notificationStore.showError(result.error || 'Failed to change mode')
    }
  } catch {
    notificationStore.showError('Failed to change mode')
  }
}

const togglePlug = async (plug) => {
  plugLoading.value = plug.id
  try {
    const result = await smartMirrorStore.toggleLight(plug.roomId, plug.id, !plug.state) // Using same method as lights
    if (result.success) {
      notificationStore.showSuccess(`Plug ${!plug.state ? 'turned on' : 'turned off'}`)
    } else {
      notificationStore.showError(result.error || 'Failed to control plug')
    }
  } catch {
    notificationStore.showError('Failed to control plug')
  } finally {
    plugLoading.value = null
  }
}

const refreshDevices = async () => {
  loading.value = true
  try {
    await checkAndLoadProjectData()
    notificationStore.showSuccess('Devices refreshed successfully')
  } catch (error) {
    console.error('Error refreshing devices:', error)
    notificationStore.showError('Failed to refresh devices')
  } finally {
    loading.value = false
  }
}

// Method to load devices for current project
const loadDevicesForCurrentProject = async () => {
  const currentProjectId = projectStore.selectedProject?.id
  
  console.log('SmartDevices: Loading devices for project:', currentProjectId)
  console.log('SmartDevices: Current project ID in store:', smartMirrorStore.currentProjectId)
  console.log('SmartDevices: Devices count:', smartMirrorStore.devices.length)
  console.log('SmartDevices: Is connected:', smartMirrorStore.isConnected)
  
  // Check if we have devices for the current project
  const hasDevices = smartMirrorStore.devices.length > 0 && smartMirrorStore.currentProjectId === currentProjectId
  
  if (hasDevices) {
    loading.value = true
    try {
      // Select first room if available
      if (smartMirrorStore.rooms.length > 0) {
        selectedRoomId.value = smartMirrorStore.rooms[0].id
      }
      console.log('SmartDevices: Devices loaded successfully:', smartMirrorStore.devices.length)
    } catch (error) {
      console.error('SmartDevices: Error loading devices:', error)
      notificationStore.showError('Failed to load devices')
    } finally {
      loading.value = false
    }
  } else {
    // Clear selected room if not connected
    selectedRoomId.value = null
    loading.value = false
    console.log('SmartDevices: No devices available for current project')
  }
}

// Method to check and load the correct project data
const checkAndLoadProjectData = async () => {
  if (!projectStore.selectedProject) return
  
  try {
    // Switch to the selected project in the smart mirror service
    if (projectStore.selectedProject?.id) {
      console.log('SmartDevices: Switching to project:', projectStore.selectedProject.id)
      await smartMirrorStore.switchToProject(projectStore.selectedProject.id)
      
      // Load devices for the current project after switching
      await loadDevicesForCurrentProject()
    }
  } catch (error) {
    console.error('Error switching to selected project:', error)
  }
}

// Watch for project changes
watch(() => projectStore.selectedProject, async (newProject, oldProject) => {
  if (newProject && newProject.id !== oldProject?.id) {
    await loadDevicesForCurrentProject()
  }
}, { immediate: true })

// Watch for changes in devices to ensure page updates
watch(() => smartMirrorStore.devices, () => {
  // This will trigger reactivity in the computed properties
}, { deep: true })

// Watch for currentProjectId changes to ensure page updates
watch(() => smartMirrorStore.currentProjectId, async (newProjectId, oldProjectId) => {
  if (newProjectId && newProjectId !== oldProjectId) {
    await loadDevicesForCurrentProject()
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // Initialize Smart Mirror app first
  await smartMirrorStore.initializeApp()
  
  // Check and load the correct project data (this will also load devices)
  await checkAndLoadProjectData()
})

// Watch for route changes to check project data
watch(() => route.path, async () => {
  if (route.path === '/smart-devices') {
    await checkAndLoadProjectData()
  }
})

// Check project data when component is activated (when navigating back to this page)
onActivated(async () => {
  await checkAndLoadProjectData()
})
</script>

<style scoped>
.smart-devices-page {
  padding: 16px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-button:hover {
  background: #e9ecef;
  color: #333;
  border-color: #AF1E23;
}

.header-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.header-content h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #666;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f44336;
}

.status-dot.connected {
  background: #4caf50;
}

.refresh-button {
  background: #AF1E23;
  border: none;
  color: #F6F6F6;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.refresh-button:hover:not(:disabled) {
  background: #AF1E23;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.not-connected-state,
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.not-connected-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.not-connected-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px 0;
}

.not-connected-state p {
  color: #999;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0 0 24px 0;
}

.connect-btn {
  background: #AF1E23;
  color: #F6F6F6;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.connect-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  margin: 0;
}

.devices-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.room-selector {
  background: #F6F6F6;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.room-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.room-selector h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  letter-spacing: -0.01em;
}

.room-count {
  font-size: 0.75rem;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 8px;
}

.room-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.room-tab {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  color: #666;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  font-weight: 500;
}

.room-tab:hover {
  background: #e9ecef;
  color: #333;
  border-color: #AF1E23;
}

.room-tab.active {
  background: #AF1E23;
  color: #F6F6F6;
  border-color: #AF1E23;
}

.room-tab-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.room-name {
  font-weight: 600;
  font-size: 0.8rem;
}

.room-device-count {
  font-size: 0.7rem;
  opacity: 0.8;
}

.devices-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.devices-section {
  background: #F6F6F6;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F6F6F6;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.section-text h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 2px 0;
  letter-spacing: -0.01em;
}

.device-count {
  font-size: 0.75rem;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 8px;
}

.section-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 3px;
}

.action-btn:hover {
  background: #e9ecef;
  color: #333;
  border-color: #AF1E23;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.device-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  background: #F6F6F6;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.device-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.15);
  transform: translateY(-1px);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 3px 0;
}

.device-room {
  font-size: 0.75rem;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 6px;
  display: inline-block;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.device-status.on {
  background: #e8f5e8;
  color: #2e7d32;
}

.device-status.off {
  background: #ffebee;
  color: #c62828;
}

.status-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

.device-controls {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: row-reverse;
  gap: 12px;
}

.toggle-switch-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: #F6F6F6;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #AF1E23;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


.loading-spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.brightness-control,
.temperature-control,
.mode-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brightness-control label,
.temperature-control label,
.mode-control label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
}

.brightness-value,
.temperature-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #AF1E23;
  background: #F6F6F6;
  padding: 2px 6px;
  border-radius: 8px;
}

.brightness-slider,
.temperature-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e1e5e9;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.brightness-slider::-webkit-slider-thumb,
.temperature-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #AF1E23;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
  transition: all 0.2s ease;
}

.brightness-slider::-webkit-slider-thumb:hover,
.temperature-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(255, 107, 53, 0.4);
}

.brightness-slider::-moz-range-thumb,
.temperature-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #AF1E23;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
}

.mode-select {
  padding: 10px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  background: #F6F6F6;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  padding-right: 40px;
  color: #333; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.mode-select:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.15);
  transform: translateY(-1px);
}

.mode-select:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1), 0 4px 12px rgba(255, 107, 53, 0.2);
  transform: translateY(-1px);
}

.mode-select:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(255, 107, 53, 0.2);
}

.climate-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-devices-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-devices-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-devices-state h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 8px 0;
}

.no-devices-state p {
  color: #999;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .smart-devices-page {
    padding: 12px;
  }
  
  /* Page header responsive styles moved to PageHeader component */
  
  .devices-grid {
    grid-template-columns: 1fr;
  }
  
  .room-tabs {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .section-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .smart-devices-page {
    padding: 8px;
  }
  
  /* Page header responsive styles moved to PageHeader component */
  
  .devices-section {
    padding: 12px;
  }
  
  .device-card {
    padding: 12px;
  }
}
</style>
