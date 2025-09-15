<template>
  <div class="main-layout">
    <!-- Header (Black)  padding top-->
    <header class="app-header" style="padding: 20px;">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">
            <img src="../assets/logo.png" alt="PRE Logo" class="logo-image" />
          </div>
        </div>
        
        <div class="header-right">
          <!-- Loading State -->
          <div v-if="projectStore.loading && !currentProject" class="loading-projects">
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            <span>Loading projects...</span>
          </div>
          
          <!-- Restoring Project State -->
          <div v-else-if="!projectStore.loading && !currentProject && projectStore.userProjects.length > 0" class="restoring-project">
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            <span>Restoring project...</span>
          </div>
          
          <!-- Current Project Display -->
          <div v-else-if="currentProject" class="current-project">
            <span class="project-label">Project:</span>
            <span class="project-name">{{ currentProject.name }}</span>
            <span v-if="currentProject.userUnit" class="project-unit">Unit: {{ currentProject.userUnit }}</span>
            <button @click="showProjectSwitcher = true" class="change-project-btn" title="Switch Project">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Project Switcher Modal -->
    <div v-if="showProjectSwitcher" class="modal-overlay" @click="showProjectSwitcher = false">
      <div class="modal-content project-switcher-modal" @click.stop>
        <div class="modal-header">
          <h3>Switch Project</h3>
          <button @click="showProjectSwitcher = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="projects-list">
            <div 
              v-for="project in userProjects" 
              :key="project.id" 
              class="project-option"
              :class="{ 'current': project.id === currentProjectId }"
            >
              <div class="project-info">
                <h4>{{ project.name }}</h4>
                <p>{{ project.location }}</p>
                <span class="project-role">{{ project.userRole }} • Unit {{ project.userUnit }}</span>
              </div>
              
              <div class="project-actions">
                <span v-if="project.id === currentProjectId" class="current-badge">Current</span>
                <button 
                  v-else 
                  @click="switchToProject(project)" 
                  class="switch-btn"
                  :disabled="projectStore.loading"
                >
                  <div v-if="projectStore.loading" class="loading-spinner"></div>
                  <span v-else>Switch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="goToProjectSelection" class="secondary-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Add New Project
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav class="bottom-navigation">
      <router-link to="/home" class="nav-item" :class="{ active: isActiveTab('home') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Home</span>
      </router-link>

      <router-link to="/access" class="nav-item" :class="{ active: isActiveTab('access') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H7V7H3V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 17H7V21H3V17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 3H21V7H17V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 17H21V21H17V17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 9H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 9H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Access</span>
      </router-link>

      <router-link to="/services" class="nav-item" :class="{ active: isActiveTab('services') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Services</span>
      </router-link>

      <router-link to="/facilities" class="nav-item" :class="{ active: isActiveTab('facilities') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 21V7L13 2L21 7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 17V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Facilities</span>
      </router-link>

      <router-link to="/complaints" class="nav-item" :class="{ active: isActiveTab('complaints') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Complaints</span>
      </router-link>

      <router-link to="/profile" class="nav-item" :class="{ active: isActiveTab('profile') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { useSmartMirrorStore } from '../stores/smartMirrorStore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Component name for ESLint
defineOptions({
  name: 'MainLayout'
})

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const smartMirrorStore = useSmartMirrorStore()

// Reactive state
const showProjectSwitcher = ref(false)

// Computed properties
const currentProject = computed(() => projectStore.selectedProject)
const userProjects = computed(() => projectStore.userProjects)
const currentProjectId = computed(() => currentProject.value?.id)

// Methods
const switchToProject = async (project) => {
  try {
    // Show loading state
    projectStore.setLoading(true)
    
    // Switch project in store
    projectStore.selectProject(project)
    
    // Switch Smart Mirror data to the new project
    await smartMirrorStore.switchToProject(project.id)
    
    showProjectSwitcher.value = false
    projectStore.setLoading(false)
    
    // No redirect - stay on current page and let reactive data update
    console.log('Project switched successfully to:', project.name)
  } catch (err) {
    console.error('Error switching project:', err)
    projectStore.setLoading(false)
  }
}

const goToProjectSelection = () => {
  showProjectSwitcher.value = false
  router.push('/profile')
}

// Method to determine which tab should be active
const isActiveTab = (tabName) => {
  const currentPath = route.path
  
  switch (tabName) {
    case 'home':
      return currentPath === '/home'
    
    case 'access':
      return currentPath === '/access'
    
    case 'profile':
      return currentPath === '/profile'
    
    case 'complaints':
      return currentPath === '/complaints' || currentPath.startsWith('/complaints/')
    
    case 'services':
      // Services tab is active for smart devices and other service pages
      return currentPath === '/services' || 
             currentPath === '/smart-devices' ||
             currentPath === '/service-category' ||
             currentPath === '/my-bookings' || 
             currentPath === '/calendar' ||
             currentPath === '/analytics' ||
             currentPath === '/profile' ||
             currentPath === '/news' ||
             currentPath === '/complaints'
    
    case 'facilities':
      // Facilities tab is active for court booking, academy programs, and shopping
      return currentPath === '/facilities' ||
             currentPath === '/court-booking' ||
             currentPath === '/academy-programs' ||
             currentPath === '/academy-details' ||
             currentPath === '/academy-registration' ||
             currentPath === '/academy-booking' ||
             currentPath === '/stores-shopping' ||
             currentPath === '/store' ||
             currentPath === '/shopping-cart' ||
             currentPath.startsWith('/store/') ||
             currentPath.startsWith('/academy-details/') ||
             currentPath.startsWith('/academy-registration/')
    
    default:
      return false
  }
}

// Watch for project changes and trigger data refresh
watch(
  () => projectStore.selectedProject,
  async (newProject, oldProject) => {
    if (newProject && newProject.id !== oldProject?.id) {
      console.log('Project changed, triggering data refresh...')
      
      // Force a small delay to ensure all stores are updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Emit a custom event that child components can listen to
      window.dispatchEvent(new CustomEvent('projectChanged', {
        detail: { newProject, oldProject }
      }))
    }
  },
  { deep: true }
)

// Load user projects when component mounts
onMounted(async () => {
  const auth = getAuth()
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Rehydrate the store (fetch projects and restore selection)
      const restored = await projectStore.rehydrateStore(user.uid)
      
      if (!restored) {
        console.log('No project restored, user needs to select a project')
      }
    }
  })
  return () => unsubscribe()
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F6F6F6;
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal overflow */
}



/* Header Styles */
.app-header {
  background-color: #231F20;
  color: #F6F6F6;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0; /* Allow flex item to shrink */
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Loading State */
.loading-projects {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.restoring-project {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 193, 7, 0.1);
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 193, 7, 0.2);
  color: rgba(255, 193, 7, 0.8);
  font-size: 0.875rem;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #AF1E23;
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Current Project Display */
.current-project {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.project-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 500;
}

.project-name {
  color: #F6F6F6;
  font-size: 0.875rem;
  font-weight: 600;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-unit {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  font-weight: 500;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.change-project-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.change-project-btn:hover {
  color: #F6F6F6;
  background: rgba(255, 255, 255, 0.1);
}

.qr-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal overflow */
  min-width: 0; /* Allow flex item to shrink below content size */
  margin-bottom: 80px;
}

/* Bottom Navigation */
.bottom-navigation {
  background-color: #2a2a2a;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 16px 20px 32px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  position: fixed;
  bottom: 0;
  z-index: 100;
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #F6F6F6;
  transition: all 0.3s ease;
  position: relative;
  flex: 1;
  max-width: 80px;
}

.nav-item:hover {
  color: #ccc;
}

.nav-item.active {
  color: #F6F6F6;
}

.nav-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: -18px;
}

.nav-item.active .nav-icon {
  background-color: #AF1E23;
  color: #F6F6F6;
  transform: translateY(-40px);
  border: 5px solid white;
  width: 64px;
  height: 64px;
}

.nav-item.active .nav-icon svg {
  stroke: white;
  stroke-width: 2;
}

.nav-item:not(.active) .nav-icon {
  background: none;
}

.nav-item:not(.active) .nav-icon svg {
  stroke: white;
  stroke-width: 2;
}

.nav-item .nav-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s ease;
  color: #F6F6F6;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.nav-item.active .nav-label {
  opacity: 1;
  transform: translateY(0);
}

/* Project Switcher Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #F6F6F6;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: modal-slide-up 0.3s ease-out;
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.project-switcher-modal {
  width: 500px;
  max-height: 600px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 16px 24px;
  max-height: 400px;
  overflow-y: auto;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: #F6F6F6;
}

.project-option:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
}

.project-option.current {
  border-color: #AF1E23;
  background: #F6F6F6;
}

.project-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.project-info p {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.project-role {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
}

.project-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-badge {
  background: #AF1E23;
  color: #F6F6F6;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.switch-btn {
  background: #AF1E23;
  color: #F6F6F6;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-btn:hover:not(:disabled) {
  background: #AF1E23;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.switch-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

.secondary-btn {
  background: none;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.secondary-btn:hover {
  border-color: #AF1E23;
  color: #AF1E23;
  background: #F6F6F6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-left, .header-center, .header-right {
    width: 100%;
    justify-content: center;
  }
  
  /* Removed main-content padding adjustment since we removed the main padding */
  
  .bottom-navigation {
    padding: 12px 16px 24px;
  }
  
  .nav-icon {
    width: 48px;
    height: 48px;
  }
  
  .nav-item.active .nav-icon {
    transform: translateY(-32px);
    width: 56px;
    height: 56px;
  }
  
  .nav-item {
    max-width: 70px;
  }
  
  .project-switcher-modal {
    width: 90vw;
    max-height: 80vh;
  }
  
  .modal-header {
    padding: 20px 20px 16px;
  }
  
  .modal-body {
    padding: 16px 20px;
  }
  
  .modal-footer {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 10px 12px;
  }
  
  /* Removed main-content padding adjustment since we removed the main padding */
  
  .bottom-navigation {
    padding: 10px 12px 20px;
  }
  
  .nav-icon {
    width: 44px;
    height: 44px;
  }
  
  .nav-item.active .nav-icon {
    transform: translateY(-28px);
    width: 52px;
    height: 52px;
  }
  
  .nav-item {
    max-width: 65px;
  }
  
  .nav-item .nav-label {
    font-size: 0.7rem;
  }
  
  .project-switcher-modal {
    width: 95vw;
    max-height: 85vh;
  }
  
  .project-option {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
  }
  
  .project-actions {
    justify-content: flex-end;
  }
}

/* Very narrow screens (like mobile simulation) */
@media (max-width: 480px) {
  .app-header {
    padding: 12px 16px;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .project-name {
    max-width: 80px;
  }
  
  .project-unit {
    max-width: 60px;
  }
  
  .bottom-navigation {
    padding: 12px 16px 24px;
  }
  
  .nav-label {
    font-size: 0.75rem;
  }
}
</style>
