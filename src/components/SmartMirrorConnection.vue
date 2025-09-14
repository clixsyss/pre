<template>
  <div class="smart-mirror-connection">
    <!-- Project-based Connections -->
    <div class="project-connections">
      <h3 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Smart Mirror Integration
      </h3>
      
      <!-- Project List -->
      <div v-if="userProjects.length > 0" class="projects-list">
        <div 
          v-for="project in userProjects" 
          :key="project.id"
          class="project-connection-item"
        >
          <div class="project-info">
            <h4 class="project-name">{{ project.name || 'Unnamed Project' }}</h4>
            <p class="project-location">{{ project.location || 'Location not set' }}</p>
          </div>
          
          <div class="connection-status">
            <div v-if="smartMirrorStore.isProjectConnected(project.id)" class="connected-state">
              <span class="status-badge connected">Connected</span>
              <div class="device-summary">
                <span>{{ getProjectDeviceCount(project.id) }} devices</span>
              </div>
              <button 
                @click="goToDevices" 
                class="control-devices-btn"
                :disabled="smartMirrorStore.isConnecting"
              >
                Control Devices
              </button>
            </div>
            <div v-else class="disconnected-state">
              <span class="status-badge disconnected">Not Connected</span>
              <button 
                @click="showLoginModal(project.id)" 
                class="connect-btn"
                :disabled="smartMirrorStore.isConnecting"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Projects State -->
      <div v-else class="no-projects">
        <div class="no-projects-icon">🏠</div>
        <p>No projects available for Smart Mirror integration.</p>
      </div>
    </div>

    <!-- Login Modal -->
    <Teleport to="body">
      <div v-if="showLoginModalFlag" class="modal-overlay" @click="closeLoginModal">
        <div class="modal-content" @click.stop>
        <!-- Modal Header with Icon -->
        <div class="modal-header">
          <div class="header-content">
            <div class="header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="header-text">
              <h3>Connect Smart Mirror</h3>
              <p>Link your smart home devices to this project</p>
            </div>
          </div>
          <button class="close-btn" @click="closeLoginModal" :disabled="smartMirrorStore.isConnecting">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Project Selection Card -->
        <div class="project-selection-card">
          <div class="project-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="project-details">
            <h4>{{ selectedProject?.name || 'Selected Project' }}</h4>
            <p>{{ selectedProject?.location || 'Location not set' }}</p>
          </div>
        </div>
        
        <!-- Login Form -->
        <div class="modal-body">
          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label for="email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Email Address
              </label>
              <div class="input-wrapper">
                <input 
                  id="email"
                  v-model="loginForm.email" 
                  type="email" 
                  placeholder="Enter your Smart Mirror email"
                  required
                  :disabled="smartMirrorStore.isConnecting"
                  autocomplete="email"
                />
                <div class="input-focus-indicator"></div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="password">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Password
              </label>
              <div class="input-wrapper">
                <input 
                  id="password"
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="Enter your Smart Mirror password"
                  required
                  :disabled="smartMirrorStore.isConnecting"
                  autocomplete="current-password"
                />
                <div class="input-focus-indicator"></div>
              </div>
            </div>
            
            <div v-if="smartMirrorStore.connectionError" class="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ smartMirrorStore.connectionError }}
            </div>
          </form>
        </div>
        
        <!-- Modal Footer -->
        <div class="modal-footer">
          <button 
            @click="closeLoginModal" 
            class="cancel-btn" 
            :disabled="smartMirrorStore.isConnecting"
            type="button"
          >
            Cancel
          </button>
          <button 
            @click="handleLogin" 
            class="connect-btn" 
            :disabled="smartMirrorStore.isConnecting || !loginForm.email || !loginForm.password"
            type="submit"
          >
            <svg v-if="smartMirrorStore.isConnecting" class="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12A10 10 0 1 1 5.93 5.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="smartMirrorStore.isConnecting">Connecting...</span>
            <span v-else>Connect Account</span>
          </button>
        </div>
      </div>
    </div>
    </Teleport>

    <!-- Disconnect Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDisconnectConfirm" class="modal-overlay" @click="showDisconnectConfirm = false">
        <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Disconnect Smart Mirror</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to disconnect Smart Mirror from this project?</p>
          <p class="modal-subtitle">You'll need to reconnect to control devices for this project again.</p>
        </div>
        <div class="modal-actions">
          <button @click="showDisconnectConfirm = false" class="cancel-btn">Cancel</button>
          <button @click="handleDisconnect" class="disconnect-btn" :disabled="smartMirrorStore.isConnecting">
            <span v-if="smartMirrorStore.isConnecting">Disconnecting...</span>
            <span v-else>Disconnect</span>
          </button>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSmartMirrorStore } from '../stores/smartMirrorStore'
import { useProjectStore } from '../stores/projectStore'
import { useNotificationStore } from '../stores/notifications'

// Component name for ESLint
defineOptions({
  name: 'SmartMirrorConnection'
})

const router = useRouter()
const smartMirrorStore = useSmartMirrorStore()
const projectStore = useProjectStore()
const notificationStore = useNotificationStore()

// Initialize Smart Mirror app on component mount
onMounted(async () => {
  await smartMirrorStore.initializeApp()
})

// Reactive state
const showLoginModalFlag = ref(false)
const showDisconnectConfirm = ref(false)
const selectedProjectId = ref(null)
const loginForm = reactive({
  email: '',
  password: ''
})

// Computed properties
const userProjects = computed(() => projectStore.userProjects)

const selectedProject = computed(() => {
  return userProjects.value.find(p => p.id === selectedProjectId.value)
})

// Methods
const showLoginModal = (projectId) => {
  selectedProjectId.value = projectId
  showLoginModalFlag.value = true
  loginForm.email = ''
  loginForm.password = ''
  smartMirrorStore.clearError()
}

const closeLoginModal = () => {
  showLoginModalFlag.value = false
  selectedProjectId.value = null
  loginForm.email = ''
  loginForm.password = ''
  smartMirrorStore.clearError()
}

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password || !selectedProjectId.value) {
    notificationStore.showError('Please enter both email and password')
    return
  }

  const result = await smartMirrorStore.connect(loginForm.email, loginForm.password, selectedProjectId.value)
  
  if (result.success) {
    notificationStore.showSuccess(`Successfully connected Smart Mirror to ${selectedProject.value?.name}!`)
    closeLoginModal()
  } else {
    notificationStore.showError(result.error || 'Failed to connect to Smart Mirror')
  }
}

const handleDisconnect = async (projectId) => {
  const result = await smartMirrorStore.disconnect(projectId)
  
  if (result.success) {
    notificationStore.showSuccess('Disconnected Smart Mirror from project')
    showDisconnectConfirm.value = false
  } else {
    notificationStore.showError(result.error || 'Failed to disconnect from Smart Mirror')
  }
}

const getProjectDeviceCount = (projectId) => {
  const status = smartMirrorStore.getProjectConnectionStatus(projectId)
  return status.devicesCount
}

const goToDevices = () => {
  router.push('/smart-devices')
}
</script>

<style scoped>
.smart-mirror-connection {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  padding: 0;
  margin-bottom: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.project-connections {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-connection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.project-connection-item:hover {
  border-color: #AF1E23;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.15);
  transform: translateY(-2px);
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px 0;
}

.project-location {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

.connection-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.connected-state {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.disconnected-state {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.device-summary {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.control-devices-btn {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.control-devices-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);
}

.control-devices-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.connected {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.status-badge.disconnected {
  background: #f3f4f6;
  color: #6b7280;
}

.connect-btn {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);
}

.no-projects {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-projects-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-projects p {
  margin: 0;
  font-size: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.connected {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.disconnected {
  background-color: #f8d7da;
  color: #721c24;
}

.connection-content,
.connected-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.connection-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.info-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.info-text h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.info-text p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.connect-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.connect-btn:hover:not(:disabled) {
  background: #AF1E23;
  transform: translateY(-2px);
}

.connect-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.device-summary {
  display: flex;
  gap: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #AF1E23;
}

.connected-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.control-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: #218838;
  transform: translateY(-1px);
}

.disconnect-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #dc3545;
  border: 1px solid #dc3545;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.disconnect-btn:hover {
  background: #dc3545;
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 24px;
  padding: 0;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  margin: auto;
  transform: none;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px 32px 24px 32px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.header-text h3 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.header-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.project-selection-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
}

.project-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 12px;
  color: white;
}

.project-details h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 700;
}

.project-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.modal-body {
  padding: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 500;
  background: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #AF1E23;
  background: #fefefe;
  transform: translateY(-1px);
  box-shadow: 
    0 0 0 4px rgba(255, 107, 53, 0.1),
    0 4px 12px rgba(255, 107, 53, 0.15);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.input-focus-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #AF1E23, #AF1E23);
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus + .input-focus-indicator {
  transform: scaleX(1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #fecaca;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.modal-footer {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding: 24px 32px 32px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 100px;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cancel-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.connect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding: 24px 32px 32px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-top: 1px solid #e2e8f0;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 8px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .device-summary {
    flex-direction: column;
    gap: 12px;
  }
  
  .connected-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-btn,
  .disconnect-btn {
    justify-content: center;
  }
}
</style>
