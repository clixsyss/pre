<template>
  <div class="smart-device-widget">
    <!-- Header -->
    <div class="widget-header">
      <div class="header-content">
        <div class="title-section">
          <div class="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="title-text">
            <h3>Smart Home</h3>
            <p v-if="smartMirrorStore.isConnected">{{ totalDevices }} devices connected</p>
            <p v-else>Connect to control your devices</p>
          </div>
        </div>
        <button @click="goToDevices" class="view-all-btn" v-if="smartMirrorStore.isConnected">
          <span>View All</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Not Connected State -->
    <div v-if="!smartMirrorStore.isConnected" class="not-connected-state">
      <div class="not-connected-content">
        <div class="not-connected-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h4>Connect Smart Mirror</h4>
        <p>Link your smart home devices for seamless control</p>
        <button @click="goToProfile" class="connect-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12L10 7M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Connect Now
        </button>
      </div>
    </div>

    <!-- Connected State -->
    <div v-else class="connected-state">
      <!-- Device Grid -->
      <div class="device-grid">
        <!-- Lights -->
        <div v-if="smartMirrorStore.lights.length > 0" class="device-category">
          <div class="category-header">
            <div class="category-icon lights">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18V20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="category-info">
              <h4>Lights</h4>
              <span class="device-count">{{ smartMirrorStore.lights.length }}</span>
            </div>
          </div>
          <div class="device-list">
            <div 
              v-for="light in smartMirrorStore.lights.slice(0, 2)" 
              :key="light.id"
              class="device-card"
            >
              <div class="device-content">
                <div class="device-name">{{ light.name }}</div>
                <div class="device-status" :class="{ on: light.state, off: !light.state }">
                  <div class="status-indicator"></div>
                  <span>{{ light.state ? 'ON' : 'OFF' }}</span>
                </div>
              </div>
              <button 
                @click="toggleLight(light)"
                :class="['device-toggle', { on: light.state, off: !light.state }]"
                :disabled="lightLoading === light.id"
              >
                <div class="toggle-slider"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Climate -->
        <div v-if="smartMirrorStore.climateDevices.length > 0" class="device-category">
          <div class="category-header">
            <div class="category-icon climate">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 4V10.38C14.71 10.11 15.5 10 16.31 10C19.74 10 22.5 12.76 22.5 16.19C22.5 19.62 19.74 22.38 16.31 22.38C14.39 22.38 12.7 21.34 11.73 19.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 6H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 10H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 14H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 18H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="category-info">
              <h4>Climate</h4>
              <span class="device-count">{{ smartMirrorStore.climateDevices.length }}</span>
            </div>
          </div>
          <div class="device-list">
            <div 
              v-for="climate in smartMirrorStore.climateDevices.slice(0, 2)" 
              :key="climate.id"
              class="device-card"
            >
              <div class="device-content">
                <div class="device-name">{{ climate.name }}</div>
                <div class="device-status" :class="{ on: climate.state, off: !climate.state }">
                  <div class="status-indicator"></div>
                  <span>{{ climate.state ? `${climate.temperature || 22}°C` : 'OFF' }}</span>
                </div>
              </div>
              <button 
                @click="toggleClimate(climate)"
                :class="['device-toggle', { on: climate.state, off: !climate.state }]"
                :disabled="climateLoading === climate.id"
              >
                <div class="toggle-slider"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Plugs -->
        <div v-if="smartMirrorStore.plugs.length > 0" class="device-category">
          <div class="category-header">
            <div class="category-icon plugs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="category-info">
              <h4>Smart Plugs</h4>
              <span class="device-count">{{ smartMirrorStore.plugs.length }}</span>
            </div>
          </div>
          <div class="device-list">
            <div 
              v-for="plug in smartMirrorStore.plugs.slice(0, 2)" 
              :key="plug.id"
              class="device-card"
            >
              <div class="device-content">
                <div class="device-name">{{ plug.name }}</div>
                <div class="device-status" :class="{ on: plug.state, off: !plug.state }">
                  <div class="status-indicator"></div>
                  <span>{{ plug.state ? 'ON' : 'OFF' }}</span>
                </div>
              </div>
              <button 
                @click="togglePlug(plug)"
                :class="['device-toggle', { on: plug.state, off: !plug.state }]"
                :disabled="plugLoading === plug.id"
              >
                <div class="toggle-slider"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- No Devices State -->
        <div v-if="totalDevices === 0" class="no-devices">
          <div class="no-devices-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h4>No Devices Found</h4>
          <p>Add devices to your Smart Mirror to control them here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSmartMirrorStore } from '../stores/smartMirrorStore'
import { useNotificationStore } from '../stores/notifications'

// Component name for ESLint
defineOptions({
  name: 'SmartDeviceWidget'
})

const router = useRouter()
const smartMirrorStore = useSmartMirrorStore()
const notificationStore = useNotificationStore()

// Initialize Smart Mirror app on component mount
onMounted(async () => {
  await smartMirrorStore.initializeApp()
})

// Reactive state
const lightLoading = ref(null)
const climateLoading = ref(null)
const plugLoading = ref(null)

// Computed properties
const totalDevices = computed(() => {
  return smartMirrorStore.lights.length + smartMirrorStore.climateDevices.length + smartMirrorStore.plugs.length
})


// Methods
const goToDevices = () => {
  router.push('/smart-devices')
}

const goToProfile = () => {
  router.push('/profile')
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
</script>

<style scoped>
.smart-device-widget {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 0;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

/* Header */
.widget-header {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  padding: 24px;
  color: white;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.title-text h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: white;
}

.title-text p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 500;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Not Connected State */
.not-connected-state {
  padding: 48px 24px;
  text-align: center;
}

.not-connected-content {
  max-width: 300px;
  margin: 0 auto;
}

.not-connected-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: white;
}

.not-connected-content h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.not-connected-content p {
  color: #6b7280;
  margin: 0 0 24px 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.connect-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);
}

/* Connected State */
.connected-state {
  padding: 24px;
}

.device-grid {
  display: grid;
  gap: 20px;
}

.device-category {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.category-icon.lights {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
}

.category-icon.climate {
  background: linear-gradient(135deg, #ff8a65 0%, #ffab91 100%);
}

.category-icon.plugs {
  background: linear-gradient(135deg, #ffab91 0%, #ffccbc 100%);
}

.category-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-info h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.device-count {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.device-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.device-content {
  flex: 1;
}

.device-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.device-status.on .status-indicator {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.device-status.off .status-indicator {
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.device-status.on span {
  color: #10b981;
}

.device-status.off span {
  color: #ef4444;
}

.device-toggle {
  position: relative;
  width: 48px;
  height: 28px;
  background: #e5e7eb;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.device-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.device-toggle.on {
  background: #10b981;
}

.device-toggle.off {
  background: #e5e7eb;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.device-toggle.on .toggle-slider {
  transform: translateX(20px);
}

.device-toggle.off .toggle-slider {
  transform: translateX(0);
}

/* No Devices State */
.no-devices {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.no-devices-icon {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: #9ca3af;
}

.no-devices h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 8px 0;
}

.no-devices p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .smart-device-widget {
    margin: 0 -16px 24px;
    border-radius: 0;
  }
  
  .widget-header {
    padding: 20px 16px;
  }
  
  .connected-state {
    padding: 20px 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .title-section {
    gap: 12px;
  }
  
  .icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .title-text h3 {
    font-size: 1.25rem;
  }
  
  .device-card {
    padding: 12px;
  }
  
  .device-name {
    font-size: 0.9rem;
  }
  
  .device-status {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .device-grid {
    gap: 16px;
  }
  
  .device-category {
    padding: 16px;
  }
  
  .category-header {
    gap: 10px;
    margin-bottom: 12px;
  }
  
  .category-icon {
    width: 36px;
    height: 36px;
  }
  
  .category-info h4 {
    font-size: 1rem;
  }
}
</style>
