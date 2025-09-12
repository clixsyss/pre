<template>
  <div class="smart-devices-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>Smart Devices</h1>
      </div>
      <p class="header-subtitle">Control your Smart Mirror devices</p>
    </div>

    <!-- Not Connected State -->
    <div v-if="!smartMirrorStore.isConnected" class="not-connected-state">
      <div class="not-connected-icon">🏠</div>
      <h3>Smart Mirror Not Connected</h3>
      <p>Please connect your Smart Mirror account for the current project in your profile to control devices.</p>
      <button @click="$router.push('/profile')" class="connect-btn">
        Go to Profile
      </button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading devices...</p>
    </div>

    <!-- Devices Content -->
    <div v-else class="devices-content">
      <!-- Room Selector -->
      <div v-if="smartMirrorStore.rooms.length > 1" class="room-selector">
        <h3>Select Room</h3>
        <div class="room-tabs">
          <button 
            v-for="room in smartMirrorStore.rooms" 
            :key="room.id"
            :class="['room-tab', { active: selectedRoomId === room.id }]"
            @click="selectRoom(room.id)"
          >
            {{ room.name }}
          </button>
        </div>
      </div>

      <!-- Devices by Category -->
      <div class="devices-sections">
        <!-- Lights Section -->
        <div v-if="roomLights.length > 0" class="devices-section">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Lights ({{ roomLights.length }})
          </h3>
          <div class="devices-grid">
            <div 
              v-for="light in roomLights" 
              :key="light.id"
              class="device-card light-card"
            >
              <div class="device-header">
                <h4 class="device-name">{{ light.name }}</h4>
                <div class="device-status" :class="{ on: light.state, off: !light.state }">
                  {{ light.state ? 'ON' : 'OFF' }}
                </div>
              </div>
              
              <div class="device-controls">
                <button 
                  @click="toggleLight(light)"
                  :class="['toggle-btn', { on: light.state, off: !light.state }]"
                  :disabled="lightLoading === light.id"
                >
                  <span v-if="lightLoading === light.id">...</span>
                  <span v-else>{{ light.state ? 'Turn Off' : 'Turn On' }}</span>
                </button>
                
                <div v-if="light.state" class="brightness-control">
                  <label>Brightness: {{ light.brightness || 0 }}%</label>
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
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 4V10.54C14 11.5 14.5 12.4 15.3 12.9L16.7 13.8C17.5 14.3 18 15.2 18 16.2V17C18 18.1 17.1 19 16 19H8C6.9 19 6 18.1 6 17V16.2C6 15.2 6.5 14.3 7.3 13.8L8.7 12.9C9.5 12.4 10 11.5 10 10.5V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 4H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Climate Control ({{ roomClimateDevices.length }})
          </h3>
          <div class="devices-grid">
            <div 
              v-for="climate in roomClimateDevices" 
              :key="climate.id"
              class="device-card climate-card"
            >
              <div class="device-header">
                <h4 class="device-name">{{ climate.name }}</h4>
                <div class="device-status" :class="{ on: climate.state, off: !climate.state }">
                  {{ climate.state ? 'ON' : 'OFF' }}
                </div>
              </div>
              
              <div class="device-controls">
                <button 
                  @click="toggleClimate(climate)"
                  :class="['toggle-btn', { on: climate.state, off: !climate.state }]"
                  :disabled="climateLoading === climate.id"
                >
                  <span v-if="climateLoading === climate.id">...</span>
                  <span v-else>{{ climate.state ? 'Turn Off' : 'Turn On' }}</span>
                </button>
                
                <div v-if="climate.state" class="climate-controls">
                  <div class="temperature-control">
                    <label>Temperature: {{ climate.temperature || 22 }}°C</label>
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
          <h3 class="section-title">
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
            Smart Plugs ({{ roomPlugs.length }})
          </h3>
          <div class="devices-grid">
            <div 
              v-for="plug in roomPlugs" 
              :key="plug.id"
              class="device-card plug-card"
            >
              <div class="device-header">
                <h4 class="device-name">{{ plug.name }}</h4>
                <div class="device-status" :class="{ on: plug.state, off: !plug.state }">
                  {{ plug.state ? 'ON' : 'OFF' }}
                </div>
              </div>
              
              <div class="device-controls">
                <button 
                  @click="togglePlug(plug)"
                  :class="['toggle-btn', { on: plug.state, off: !plug.state }]"
                  :disabled="plugLoading === plug.id"
                >
                  <span v-if="plugLoading === plug.id">...</span>
                  <span v-else>{{ plug.state ? 'Turn Off' : 'Turn On' }}</span>
                </button>
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
import { ref, computed, onMounted } from 'vue'
import { useSmartMirrorStore } from '../../stores/smartMirrorStore'
import { useNotificationStore } from '../../stores/notifications'

// Component name for ESLint
defineOptions({
  name: 'SmartDevicesPage'
})

const smartMirrorStore = useSmartMirrorStore()
const notificationStore = useNotificationStore()

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
  roomDevices.value.filter(device => device.type === 'thermostat' || device.type === 'climate')
)

const roomPlugs = computed(() => 
  roomDevices.value.filter(device => device.type === 'plug' || device.type === 'outlet')
)

// Methods
const selectRoom = (roomId) => {
  selectedRoomId.value = roomId
  smartMirrorStore.selectRoom(roomId)
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

// Lifecycle
onMounted(async () => {
  // Initialize Smart Mirror app first
  await smartMirrorStore.initializeApp()
  
  if (smartMirrorStore.isConnected) {
    loading.value = true
    try {
      await smartMirrorStore.refreshDevices()
      // Select first room if available
      if (smartMirrorStore.rooms.length > 0) {
        selectedRoomId.value = smartMirrorStore.rooms[0].id
      }
    } catch {
      notificationStore.showError('Failed to load devices')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.smart-devices-page {
  padding: 20px 0;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #f5f5f5;
  color: #333;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
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
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.connect-btn:hover {
  background: #e55a2b;
  transform: translateY(-1px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
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
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.room-selector h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.room-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.room-tab {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  color: #666;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-tab:hover {
  background: #e9ecef;
  color: #333;
}

.room-tab.active {
  background: #ff6b35;
  color: white;
  border-color: #ff6b35;
}

.devices-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.devices-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.device-card {
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.device-card:hover {
  border-color: #ff6b35;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.device-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.device-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.device-status.on {
  background: #d4edda;
  color: #155724;
}

.device-status.off {
  background: #f8d7da;
  color: #721c24;
}

.device-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-btn.on {
  background: #dc3545;
  color: white;
}

.toggle-btn.off {
  background: #28a745;
  color: white;
}

.toggle-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.brightness-control,
.temperature-control,
.mode-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.brightness-control label,
.temperature-control label,
.mode-control label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
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
}

.brightness-slider::-webkit-slider-thumb,
.temperature-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff6b35;
  cursor: pointer;
}

.brightness-slider::-moz-range-thumb,
.temperature-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff6b35;
  cursor: pointer;
  border: none;
}

.mode-select {
  padding: 8px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.mode-select:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.climate-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
    padding: 16px 0;
  }
  
  .devices-grid {
    grid-template-columns: 1fr;
  }
  
  .room-tabs {
    flex-direction: column;
  }
  
  .room-tab {
    text-align: center;
  }
}
</style>
