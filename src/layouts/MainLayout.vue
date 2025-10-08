<template>
  <div class="main-layout">
    <!-- Header (Black)  padding top-->
    <header class="app-header" style="padding: 20px;">
      <div class="header-content">
        <!-- Project Selection Section -->
        <div class="header-left">
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
            <span class="project-name">{{ currentProject.name }}</span>
            <!-- <span v-if="currentProject.userUnit" class="project-unit"> - {{ currentProject.userUnit }}</span> -->
            <button @click="showProjectSwitcher = true" class="change-project-btn" title="Switch Project">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Logo Section (Center) -->
        <div class="header-center">
          <div class="logo">
            <img src="../assets/logo.png" alt="PRE Logo" class="logo-image" />
          </div>
        </div>
        
        <!-- Gate Access Section (Right) -->
        <div class="header-right">
          <router-link to="/access" class="gate-access-btn" title="Gate Access">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- QR Code outer border -->
              <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="1.5" fill="none"/>
              
              <!-- Top-left finder pattern -->
              <rect x="4" y="4" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/>
              <rect x="5" y="5" width="4" height="4" fill="currentColor"/>
              <rect x="6" y="6" width="2" height="2" fill="white"/>
              
              <!-- Top-right finder pattern -->
              <rect x="14" y="4" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/>
              <rect x="15" y="5" width="4" height="4" fill="currentColor"/>
              <rect x="16" y="6" width="2" height="2" fill="white"/>
              
              <!-- Bottom-left finder pattern -->
              <rect x="4" y="14" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/>
              <rect x="5" y="15" width="4" height="4" fill="currentColor"/>
              <rect x="6" y="16" width="2" height="2" fill="white"/>
              
              <!-- Data pattern (random-looking squares) -->
              <rect x="11" y="5" width="1" height="1" fill="currentColor"/>
              <rect x="12" y="6" width="1" height="1" fill="currentColor"/>
              <rect x="11" y="7" width="1" height="1" fill="currentColor"/>
              <rect x="13" y="7" width="1" height="1" fill="currentColor"/>
              <rect x="5" y="11" width="1" height="1" fill="currentColor"/>
              <rect x="7" y="11" width="1" height="1" fill="currentColor"/>
              <rect x="9" y="11" width="1" height="1" fill="currentColor"/>
              <rect x="6" y="12" width="1" height="1" fill="currentColor"/>
              <rect x="8" y="12" width="1" height="1" fill="currentColor"/>
              <rect x="11" y="12" width="1" height="1" fill="currentColor"/>
              <rect x="13" y="12" width="1" height="1" fill="currentColor"/>
              <rect x="15" y="11" width="1" height="1" fill="currentColor"/>
              <rect x="17" y="11" width="1" height="1" fill="currentColor"/>
              <rect x="19" y="11" width="1" height="1" fill="currentColor"/>
              <rect x="16" y="12" width="1" height="1" fill="currentColor"/>
              <rect x="18" y="12" width="1" height="1" fill="currentColor"/>
              <rect x="11" y="15" width="1" height="1" fill="currentColor"/>
              <rect x="13" y="15" width="1" height="1" fill="currentColor"/>
              <rect x="15" y="15" width="1" height="1" fill="currentColor"/>
              <rect x="17" y="15" width="1" height="1" fill="currentColor"/>
              <rect x="19" y="15" width="1" height="1" fill="currentColor"/>
              <rect x="12" y="16" width="1" height="1" fill="currentColor"/>
              <rect x="14" y="16" width="1" height="1" fill="currentColor"/>
              <rect x="18" y="16" width="1" height="1" fill="currentColor"/>
            </svg>
            <span class="gate-access-text">Access</span>
          </router-link>
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
                <span class="project-role">{{ project.location }} • Unit {{ project.userUnit }}</span>
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
    <main class="main-content" :class="{ 'keyboard-visible': isKeyboardVisible && isChatPage }">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav class="bottom-navigation" :class="{ 'hidden': shouldHideBottomNav }">
      <router-link to="/home" class="nav-item" :class="{ active: isActiveTab('home') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Home</span>
      </router-link>


      <router-link to="/services" class="nav-item" :class="{ active: isActiveTab('services') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Services</span>
      </router-link>

      <router-link to="/facilities" class="nav-item" :class="{ active: isActiveTab('facilities') }">
        <div class="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-label">Requests</span>
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

    <!-- Violation Notification Popup -->
    <ViolationNotificationPopup
      v-if="showViolationNotification"
      :is-visible="showViolationNotification"
      :violation-count="violationCount"
      @close="closeViolationNotification"
      @view-violations="viewViolations"
    />

      <!-- Suspension Message -->
      <SuspensionMessage
        v-if="showSuspensionMessage"
        :show="showSuspensionMessage"
        :message="suspensionMessage"
        @dismiss="handleSuspensionDismiss"
        @contactSupport="handleContactSupport"
      />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { useSmartMirrorStore } from '../stores/smartMirrorStore'
import { useSwipeNavigation } from '../composables/useSwipeNavigation'
import ViolationNotificationPopup from '../components/ViolationNotificationPopup.vue'
import SuspensionMessage from '../components/SuspensionMessage.vue'
import { markViolationsAsShown, hasActiveViolations, clearOldNotificationHistory } from '../services/violationNotificationService'
import { checkUserSuspension, getSuspensionMessage } from '../services/suspensionService'
import optimizedAuthService from '../services/optimizedAuthService'

// Component name for ESLint
defineOptions({
  name: 'MainLayout'
})

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const smartMirrorStore = useSmartMirrorStore()

// Initialize swipe navigation
const {
  addDeadZone
} = useSwipeNavigation()

// Reactive state
const showProjectSwitcher = ref(false)
const showSwipeHint = ref(false)
const showViolationNotification = ref(false)
const violationCount = ref(0)

// Suspension state
const showSuspensionMessage = ref(false)
const suspensionMessage = ref(null)
const isUserSuspended = ref(false)

// Keyboard state
const isKeyboardVisible = ref(false)
const isChatPage = ref(false)

// Computed properties
const currentProject = computed(() => projectStore.selectedProject)
const userProjects = computed(() => projectStore.userProjects)
const currentProjectId = computed(() => currentProject.value?.id)

// Hide bottom navigation when keyboard is visible on chat pages
const shouldHideBottomNav = computed(() => {
  // return isKeyboardVisible.value && isChatPage.value
  return false
})

// Methods
// Keyboard detection methods
const detectKeyboardVisibility = () => {
  const initialViewportHeight = window.innerHeight
  let resizeTimeout = null
  
  const handleResize = () => {
    // Debounce resize events
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    
    resizeTimeout = setTimeout(() => {
      const currentViewportHeight = window.innerHeight
      const heightDifference = initialViewportHeight - currentViewportHeight
      
      // Consider keyboard visible if viewport height decreased by more than 150px
      const keyboardVisible = heightDifference > 150
      
      // Only update if the state actually changed
      if (isKeyboardVisible.value !== keyboardVisible) {
        isKeyboardVisible.value = keyboardVisible
        console.log('Keyboard visibility changed:', keyboardVisible, 'Height difference:', heightDifference)
      }
    }, 100)
  }
  
  window.addEventListener('resize', handleResize)
  
  // Also listen for focus events on input elements
  const handleFocus = (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      // Only set to true if we're on a chat page
      if (isChatPage.value) {
        setTimeout(() => {
          isKeyboardVisible.value = true
        }, 300) // Small delay to allow keyboard animation
      }
    }
  }
  
  const handleBlur = (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      // Only set to false if we're on a chat page
      if (isChatPage.value) {
        setTimeout(() => {
          isKeyboardVisible.value = false
        }, 300) // Small delay to allow keyboard animation
      }
    }
  }
  
  document.addEventListener('focusin', handleFocus)
  document.addEventListener('focusout', handleBlur)
  
  // Cleanup function
  return () => {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('focusin', handleFocus)
    document.removeEventListener('focusout', handleBlur)
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
  }
}

const checkIfChatPage = () => {
  const chatRoutes = [
    '/complaint-chat/',
    '/violation-chat/',
    '/support-chat/',
    '/service-booking-chat/',
    '/request-chat/'
  ]
  
  isChatPage.value = chatRoutes.some(chatRoute => route.path.includes(chatRoute))
}

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

// Violation notification methods
const checkForViolations = async () => {
  console.log('🔍 checkForViolations called')
  console.log('🔍 Current project:', currentProject.value)
  
  try {
    const currentUser = await optimizedAuthService.getCurrentUser()
    console.log('🔍 Current user:', currentUser?.uid)
    console.log('🔍 Auth object:', currentUser ? 'initialized' : 'not initialized')
    
    if (!currentProject.value || !currentUser) {
      console.warn('⚠️ Cannot check violations: missing project or user')
      return
    }
    
    console.log('🔍 Checking for active violations...')
    // Check for any active violations (issued or disputed) that need attention
    const result = await hasActiveViolations(currentProject.value.id, currentUser.uid)
    
    console.log('✅ Violation check result:', result)
    
    if (result.hasActiveViolations) {
      console.log('⚠️ Active violations found:', result.violationCount)
      violationCount.value = result.violationCount
      showViolationNotification.value = true
      
      // Mark violations as shown to prevent repeated notifications in same session
      const violationIds = result.violations.map(v => v.id)
      markViolationsAsShown(violationIds)
      console.log('✅ Violation notification shown')
    } else {
      console.log('✅ No active violations found')
      // No active violations, hide notification if it was showing
      showViolationNotification.value = false
      violationCount.value = 0
    }
  } catch (error) {
    console.error('❌ Error checking for violations:', error)
    // On error, don't show violation notifications
    showViolationNotification.value = false
    violationCount.value = 0
  }
}

const closeViolationNotification = () => {
  showViolationNotification.value = false
  violationCount.value = 0
}

const viewViolations = () => {
  router.push('/profile')
}

// Suspension check methods
const checkUserSuspensionStatus = async () => {
  try {
    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) return
    
    const suspensionStatus = await checkUserSuspension(currentUser.uid)
    
    if (suspensionStatus.isSuspended) {
      isUserSuspended.value = true
      suspensionMessage.value = getSuspensionMessage(suspensionStatus.suspensionDetails)
      showSuspensionMessage.value = true
    } else {
      isUserSuspended.value = false
      showSuspensionMessage.value = false
      suspensionMessage.value = null
    }
  } catch (error) {
    console.error('Error checking user suspension:', error)
  }
}

  const handleSuspensionDismiss = () => {
    showSuspensionMessage.value = false
  }

  const handleContactSupport = () => {
    // Navigate to support page
    router.push('/support')
    showSuspensionMessage.value = false
  }

// Removed unused canAccessCurrentRoute function

// Reset violation notification state (clear history so notifications show again)
const resetViolationNotifications = () => {
  clearOldNotificationHistory()
  showViolationNotification.value = false
  violationCount.value = 0
}

// Method to determine which tab should be active
const isActiveTab = (tabName) => {
  const currentPath = route.path
  
  switch (tabName) {
    case 'home':
      return currentPath === '/home'
    
    case 'profile':
      return currentPath === '/profile' || 
             currentPath === '/complaints' || 
             currentPath.startsWith('/complaints/') ||
             currentPath === '/violations' ||
             currentPath.startsWith('/violation-chat/') ||
             currentPath === '/support' ||
             currentPath.startsWith('/support-chat/')
    
    case 'services':
      // Services tab is active for smart devices and other service pages
      return currentPath === '/services' || 
             currentPath === '/smart-devices' ||
             currentPath === '/service-category' ||
             currentPath === '/my-bookings' || 
             currentPath === '/calendar' ||
             currentPath === '/analytics' ||
             currentPath === '/news' ||
             currentPath.startsWith('/service-category/') ||
             currentPath.startsWith('/service-booking-chat/') ||
             currentPath === '/court-booking' ||
             currentPath === '/academy-programs' ||
             currentPath === '/academy-details' ||
             currentPath === '/academy-registration' ||
             currentPath === '/academy-booking' ||
             currentPath === '/stores-shopping' ||
             currentPath === '/store' ||
             currentPath === '/shopping-cart' ||
             currentPath.startsWith('/store/') ||
             currentPath.startsWith('/academy-details/')
    
    case 'facilities':
      // Requests tab is active for request categories and submissions
      return currentPath === '/facilities' ||
             currentPath.startsWith('/request-chat/') ||
             currentPath.startsWith('/request-category/') ||
             currentPath.startsWith('//request-category/:id/')
    
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
      
      // Reset violation notifications when switching projects
      resetViolationNotifications()
      
      // Check for violations with a small delay to ensure everything is loaded
      setTimeout(async () => {
        try {
          await checkForViolations()
        } catch (error) {
          console.error('❌ Error checking violations after project change:', error)
        }
      }, 800) // Small delay to ensure project data is loaded
      
      // Emit a custom event that child components can listen to
      window.dispatchEvent(new CustomEvent('projectChanged', {
        detail: { newProject, oldProject }
      }))
      
      // Check user suspension status when switching projects
      setTimeout(() => {
        checkUserSuspensionStatus()
      }, 1000)
    }
  },
  { deep: true }
)

// Watch for route changes to detect chat pages and check violations
watch(
  () => route.path,
  (newPath) => {
    checkIfChatPage()
    
    // Check for violations when navigating to main app pages (not on every page to avoid spam)
    const mainPages = ['/home', '/profile']
    if (mainPages.includes(newPath) && projectStore.hasSelectedProject) {
      console.log('📍 Navigated to main page, checking violations...')
      setTimeout(async () => {
        try {
          await checkForViolations()
        } catch (error) {
          console.error('❌ Error checking violations on navigation:', error)
        }
      }, 500)
    }
  },
  { immediate: true }
)

// Listen for suspension message events from router
const handleSuspensionMessage = (event) => {
  const { suspensionDetails, attemptedRoute } = event.detail
  console.log('Suspension message triggered for route:', attemptedRoute)
  
  if (suspensionDetails) {
    isUserSuspended.value = true
    suspensionMessage.value = getSuspensionMessage(suspensionDetails)
    showSuspensionMessage.value = true
  }
}

// Listen for project store ready event to check violations
const handleProjectStoreReady = async () => {
  console.log('📦 Project store ready - checking for violations...')
  // Use setTimeout to avoid blocking UI
  setTimeout(async () => {
    try {
      await checkForViolations()
    } catch (error) {
      console.error('❌ Error in handleProjectStoreReady:', error)
    }
  }, 500) // Small delay to ensure UI loads first
}

// Load user projects when component mounts
onMounted(async () => {
  // Reset violation notifications when app starts
  resetViolationNotifications()
  
  window.addEventListener('projectStoreReady', handleProjectStoreReady)
  
  // Check for violations with a delay to avoid blocking UI
  if (projectStore.hasSelectedProject) {
    setTimeout(async () => {
      try {
        await checkForViolations()
      } catch (error) {
        console.error('❌ Error in checkForViolations during mount:', error)
        // Don't block the UI if violation check fails
      }
    }, 1000) // 1 second delay to ensure UI loads first
  }
  
  // Check user suspension status
  setTimeout(() => {
    checkUserSuspensionStatus()
  }, 1500) // Check after violations check
  
  window.addEventListener('showSuspensionMessage', handleSuspensionMessage)
  
  // Initialize keyboard detection
  const cleanupKeyboardDetection = detectKeyboardVisibility()
  
  // Add dead zones for areas where swipe should be disabled
  // Bottom navigation area (prevent accidental swipes when tapping nav items)
  const navHeight = 80 // Smaller dead zone
  addDeadZone(0, window.innerHeight - navHeight, window.innerWidth, navHeight)
  
  // Show swipe hint for first-time users
  const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint')
  if (!hasSeenSwipeHint) {
    // Show hint after a brief delay
    setTimeout(() => {
      showSwipeHint.value = true
      // Hide hint after 4 seconds
      setTimeout(() => {
        showSwipeHint.value = false
        localStorage.setItem('hasSeenSwipeHint', 'true')
      }, 4000)
    }, 2000)
  }
  
  return () => {
    cleanupKeyboardDetection()
  }
})

// Cleanup event listeners on unmount
onUnmounted(() => {
  window.removeEventListener('showSuspensionMessage', handleSuspensionMessage)
  window.removeEventListener('projectStoreReady', handleProjectStoreReady)
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
  padding-top: 40px;
}

/* Header Styles */
.app-header {
  background-color: #231F20;
  color: #F6F6F6;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-top: 60px !important;
}

.header-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-width: 0; /* Allow flex item to shrink */
}

.header-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
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

/* Gate Access Button */
.gate-access-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(175, 30, 35, 0.1);
  border: 2px solid rgba(175, 30, 35, 0.3);
  border-radius: 12px;
  padding: 10px 16px;
  text-decoration: none;
  color: #F6F6F6;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.gate-access-btn:hover {
  background: rgba(175, 30, 35, 0.2);
  border-color: rgba(175, 30, 35, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

.gate-access-btn.router-link-active {
  background: rgba(175, 30, 35, 0.3);
  border-color: #AF1E23;
  box-shadow: 0 0 0 2px rgba(175, 30, 35, 0.2);
}

.gate-access-btn svg {
  flex-shrink: 0;
}

.gate-access-text {
  white-space: nowrap;
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
  padding-top: 100px; /* Account for fixed header */
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal overflow */
  min-width: 0; /* Allow flex item to shrink below content size */
  margin-bottom: 80px;
  transition: margin-bottom 0.3s ease-in-out;
}

/* Adjust main content margin when keyboard is visible on chat pages */
.main-content.keyboard-visible {
  margin-bottom: 0;
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
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  transition: transform 0.3s ease-in-out;
}

.bottom-navigation.hidden {
  transform: translateY(100%);
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
    gap: 8px;
  }
  
  .main-content {
    padding-top: 80px; /* Adjust for smaller header */
  }
  
  .header-left {
    flex: 1;
    min-width: 0;
  }
  
  .header-center {
    flex: 0 0 auto;
  }
  
  .header-right {
    flex: 0 0 auto;
    gap: 8px;
  }
  
  .gate-access-btn {
    padding: 8px;
    font-size: 0.8rem;
    border-radius: 10px;
    min-width: 44px;
    justify-content: center;
  }
  
  .gate-access-text {
    display: none; /* Hide text on mobile, show only icon */
  }
  
  .logo-image {
    height: 32px;
  }
  
  /* Make project info more compact on mobile */
  .current-project {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .project-name {
    max-width: 100px;
    font-size: 0.8rem;
  }
  
  .project-unit {
    max-width: 70px;
    font-size: 0.7rem;
  }
  
  .project-label {
    font-size: 0.7rem;
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

/* Swipe Indicator Styles */
.swipe-indicator {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(35, 31, 32, 0.95);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 1000;
  opacity: 0.8;
  transition: all 0.2s ease;
  pointer-events: none;
  min-width: 200px;
}

.swipe-indicator.swipe-active {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.05);
}

.swipe-progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-bottom: 16px;
  overflow: hidden;
}

.swipe-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #AF1E23, #ff4757);
  border-radius: 2px;
  transition: width 0.1s ease;
  box-shadow: 0 0 10px rgba(175, 30, 35, 0.5);
}

.swipe-tabs-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.swipe-tab-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.swipe-tab-dot.active {
  opacity: 1;
  transform: scale(1.2);
}

.swipe-tab-dot.next,
.swipe-tab-dot.prev {
  opacity: 0.7;
  transform: scale(1.1);
}

.swipe-tab-dot::before {
  content: '';
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.swipe-tab-dot.active::before {
  background: #AF1E23;
  box-shadow: 0 0 8px rgba(175, 30, 35, 0.8);
  width: 10px;
  height: 10px;
}

.swipe-tab-dot.next::before,
.swipe-tab-dot.prev::before {
  background: rgba(255, 255, 255, 0.7);
  width: 9px;
  height: 9px;
}

.tab-name {
  font-size: 0.7rem;
  color: #F6F6F6;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.swipe-tab-dot.active .tab-name {
  font-weight: 700;
  color: #AF1E23;
  text-shadow: 0 0 4px rgba(175, 30, 35, 0.5);
}

/* Swipe Hint Styles */
.swipe-hint {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  pointer-events: none;
  animation: swipe-hint-appear 0.5s ease-out;
}

@keyframes swipe-hint-appear {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.swipe-hint-content {
  background: rgba(35, 31, 32, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 12px 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.swipe-hint-arrows {
  display: flex;
  align-items: center;
  gap: 12px;
}

.swipe-hint-text {
  font-size: 0.85rem;
  color: #F6F6F6;
  font-weight: 600;
  white-space: nowrap;
}

.swipe-arrow {
  font-size: 1.2rem;
  animation: swipe-bounce 2s ease-in-out infinite;
}

.swipe-arrow.left {
  animation-delay: 0s;
}

.swipe-arrow.right {
  animation-delay: 1s;
}

@keyframes swipe-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(-3px);
  }
  60% {
    transform: translateX(3px);
  }
}

/* Very narrow screens (like mobile simulation) */
@media (max-width: 480px) {
  .app-header {
    padding: 10px 12px;
  }
  
  .header-content {
    gap: 6px;
  }
  
  .main-content {
    padding: 16px;
    padding-top: 90px; /* Adjust for smallest header */
  }
  
  .logo-image {
    height: 28px;
  }
  
  .gate-access-btn {
    padding: 6px;
    min-width: 40px;
  }
  
  .project-name {
    max-width: 70px;
    font-size: 0.75rem;
  }
  
  .project-unit {
    max-width: 50px;
    font-size: 0.65rem;
  }
  
  .project-label {
    font-size: 0.65rem;
  }
  
  .current-project {
    padding: 4px 8px;
    gap: 4px;
  }
  
  .bottom-navigation {
    padding: 12px 16px 24px;
  }
  
  .nav-label {
    font-size: 0.75rem;
  }
  
  /* Responsive swipe indicator */
  .swipe-indicator {
    min-width: 180px;
    padding: 16px;
  }
  
  .swipe-tabs-preview {
    gap: 8px;
  }
  
  .tab-name {
    font-size: 0.65rem;
  }
}
</style>
