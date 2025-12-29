<template>
  <div class="main-layout">
    <!-- Header (Black)  padding top-->
    <header class="app-header" :class="{ 'hide-for-modal': showProjectSwitcher }">
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
            <span>{{ $t('loadingProjects') }}</span>
          </div>
          
          <!-- Restoring Project State -->
          <div v-else-if="!projectStore.loading && !currentProject && projectStore.userProjects.length > 0" class="restoring-project">
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
            <span>{{ $t('restoringProject') }}</span>
          </div>
          
          <!-- Current Project Display -->
          <button v-else-if="currentProject" @click="showProjectSwitcher = true" class="current-project" :title="$t('switchProject')">
            <span class="project-name">{{ currentProject.name }}</span>
            <svg class="project-arrow" width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Logo Section (Center) -->
        <div class="header-center">
          <button @click="toggleQuickMenu" class="logo-button" :class="{ 'menu-open': showQuickMenu, 'first-time': !hasSeenLogoHint }">
            <div class="logo-wrapper">
              <img src="../assets/logo.png" alt="PRE Logo" class="logo-image" />
              <!-- Enhanced arrow with shimmer effect -->
              <svg class="logo-arrow" :class="{ 'pulse': !hasSeenLogoHint && !showQuickMenu }" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <!-- Always-visible subtle label -->
            <span class="quick-actions-label">{{ $t('quickActions') }}</span>
          </button>
          
          <!-- Enhanced first-time hint with pointer -->
          <transition name="hint-fade">
            <div v-if="showLogoHint" class="logo-hint">
              <div class="hint-content">
                <svg class="hint-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="currentColor"/>
                </svg>
                <span>{{ $t('tapHereQuickNav') }}</span>
              </div>
            </div>
          </transition>
        </div>
        
        <!-- Gate Access Section (Right) -->
        <div class="header-right">
          <!-- Notification Bell -->
          <button @click="openNotificationCenter" class="notification-bell-btn" :title="$t('notifications')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="notificationUnreadCount > 0" class="notification-badge">{{ notificationUnreadCount }}</span>
          </button>
          
          <router-link to="/access" class="gate-access-btn" :title="$t('gateAccess')">
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
            <span class="gate-access-text">{{ $t('access') }}</span>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Project Switcher Modal -->
    <div v-if="showProjectSwitcher" class="modal-overlay" @click="showProjectSwitcher = false">
      <div class="modal-content project-switcher-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('switchProject') }}</h3>
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
              :class="{ 'current': project.id === currentProjectId, 'clickable': project.id !== currentProjectId }"
              @click="project.id !== currentProjectId && !projectStore.loading && switchToProject(project)"
            >
              <div class="project-info">
                <h4>{{ project.name }}</h4>
                <span class="project-role">{{ project.location }} • Unit {{ project.userUnit }}</span>
              </div>
              
              <div class="project-actions">
                <span v-if="project.id === currentProjectId" class="current-badge">{{ $t('currentBadge') }}</span>
                <div v-else class="switch-indicator">
                  <div v-if="projectStore.loading" class="loading-spinner"></div>
                  <span v-else class="switch-text">{{ $t('tapToSwitch') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="goToProjectSelection" class="secondary-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('addNewProject') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content with Page Transitions -->
    <main class="main-content" :class="{ 'keyboard-visible': isKeyboardVisible }">
      <transition :name="pageTransition" mode="out-in">
        <slot />
      </transition>
    </main>

    <!-- Bottom Navigation -->
    <nav class="bottom-navigation" :class="{ 'hidden': shouldHideBottomNav, 'hide-for-modal': showProjectSwitcher }">
      <router-link to="/home" class="nav-item" :class="{ active: isActiveTab('home') }">
        <div class="nav-icon">
          <img src="../assets/ic_round-home.svg" alt="Home" width="24" height="24" />
        </div>
        <span class="nav-label">{{ $t('home') }}</span>
      </router-link>


      <router-link to="/services" class="nav-item" :class="{ active: isActiveTab('services') }">
        <div class="nav-icon">
          <img src="../assets/Services.svg" alt="Services" width="24" height="24" />
        </div>
        <span class="nav-label">{{ $t('services') }}</span>
      </router-link>

      <router-link to="/requests" class="nav-item" :class="{ active: isActiveTab('requests') }">
        <div class="nav-icon">
          <img src="../assets/request.svg" alt="Requests" width="24" height="24" />
        </div>
        <span class="nav-label">{{ $t('requests') }}</span>
      </router-link>


      <router-link to="/profile" class="nav-item" :class="{ active: isActiveTab('profile') }">
        <div class="nav-icon">
          <img src="../assets/profile.svg" alt="Profile" width="24" height="24" />
        </div>
        <span class="nav-label">{{ $t('profile') }}</span>
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

      <!-- Notification Center -->
      <NotificationCenter />
      
      <!-- Shake Feedback -->
      <ShakeFeedback ref="shakeFeedbackRef" />

      <!-- Quick Menu Backdrop (must be before dropdown to ensure proper stacking) -->
      <transition name="quick-menu-backdrop">
        <div 
          v-if="showQuickMenu" 
          class="quick-menu-backdrop" 
          @click.stop="showQuickMenu = false"
        ></div>
      </transition>

      <!-- Quick Menu Dropdown -->
      <transition name="quick-menu">
        <div v-if="showQuickMenu" class="quick-menu-dropdown" :data-open="showQuickMenu" @click.stop>
          <div class="quick-menu-content">
            <div class="quick-menu-grid">
              <button 
                v-for="item in quickMenuItems" 
                :key="item.path"
                @click="navigateToPage(item.path)"
                class="quick-menu-item"
                :class="{ 'active': isActivePage(item.path) }"
              >
                <div class="quick-menu-icon" v-html="item.icon"></div>
                <span class="quick-menu-label">{{ item.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProjectStore } from '../stores/projectStore'
import { useSmartMirrorStore } from '../stores/smartMirrorStore'
import { useNotificationCenterStore } from '../stores/notificationCenter'
import { useAppSettingsStore } from '../stores/appSettings'
import { useSwipeNavigation } from '../composables/useSwipeNavigation'
import { useModalState } from '../composables/useModalState'
import { useGlobalKeyboard } from '../composables/useGlobalKeyboard'
import { useShakeDetection } from '../composables/useShakeDetection'
import ViolationNotificationPopup from '../components/ViolationNotificationPopup.vue'
import SuspensionMessage from '../components/SuspensionMessage.vue'
import NotificationCenter from '../components/NotificationCenter.vue'
import ShakeFeedback from '../components/ShakeFeedback.vue'
import { markViolationsAsShown, hasActiveViolations, clearOldNotificationHistory } from '../services/violationNotificationService'
import { checkUserSuspension, getSuspensionMessage } from '../services/suspensionService'
import optimizedAuthService from '../services/optimizedAuthService'
import { useDataPreloader } from '../services/dataPreloader'
import permissionsService from '../services/permissionsService'
import { Capacitor } from '@capacitor/core'

// Component name for ESLint
defineOptions({
  name: 'MainLayout'
})

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const projectStore = useProjectStore()
const smartMirrorStore = useSmartMirrorStore()
const notificationCenterStore = useNotificationCenterStore()
const appSettingsStore = useAppSettingsStore()
const { openModal, closeModal } = useModalState()
const { preloadAppData, reset: resetPreloader } = useDataPreloader()

// Initialize global keyboard handling
const { isKeyboardVisible } = useGlobalKeyboard()

// Initialize swipe navigation
const {
  addDeadZone
} = useSwipeNavigation()

// Shake feedback component ref
const shakeFeedbackRef = ref(null)

// Handle shake to open gate access
const handleShake = () => {
  // Check if shake is enabled in settings
  if (!appSettingsStore.shakeEnabled) {
    return
  }
  
  // Only navigate if not already on gate access page
  if (route.path !== '/access') {
    console.log('🚪 Shake detected! Opening gate access...')
    
    // Show visual feedback
    if (shakeFeedbackRef.value) {
      shakeFeedbackRef.value.show()
    }
    
    // Navigate to gate access with a slight delay for feedback
    setTimeout(() => {
      router.push('/access')
    }, 300)
  }
}

// Initialize shake detection with settings from store
const shakeDetection = ref(null)

// Watch for settings changes and update shake detection
watch(() => [appSettingsStore.shakeEnabled, appSettingsStore.shakeSensitivity], () => {
  // Recreate shake detection when settings change
  if (shakeDetection.value) {
    shakeDetection.value.stopShakeDetection()
  }
  
  if (appSettingsStore.shakeEnabled) {
    shakeDetection.value = useShakeDetection(handleShake, {
      threshold: appSettingsStore.shakeSensitivity,
      timeout: 1000
    })
  }
}, { immediate: true })

// Reactive state
const showProjectSwitcher = ref(false)
const showSwipeHint = ref(false)
const showViolationNotification = ref(false)
const violationCount = ref(0)
const showQuickMenu = ref(false)
const showLogoHint = ref(false)
const hasSeenLogoHint = ref(false)

// Track if violation notification has been shown in this session
const hasShownViolationInSession = ref(false)

// Suspension state
const showSuspensionMessage = ref(false)
const suspensionMessage = ref(null)
const isUserSuspended = ref(false)

// Chat page state
const isChatPage = ref(false)

// Page transition state
const transitionDirection = ref('slide-left')
const previousRoute = ref(null)

// Tab order for determining transition direction
const tabOrder = ['/home', '/services', '/requests', '/profile']

// Computed properties
const currentProject = computed(() => projectStore.selectedProject)
const userProjects = computed(() => projectStore.userProjects)
const currentProjectId = computed(() => currentProject.value?.id)
const notificationUnreadCount = computed(() => notificationCenterStore.unreadCount)

// Page transition name based on navigation direction
const pageTransition = computed(() => {
  return transitionDirection.value
})

// Hide bottom navigation when keyboard is visible
const shouldHideBottomNav = computed(() => {
  return isKeyboardVisible.value
})

// Quick menu items
const quickMenuItems = computed(() => [
  {
    path: '/home',
    label: t('home'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    path: '/services',
    label: t('services'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    path: '/access',
    label: t('gateAccess'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="4" y="4" width="6" height="6" stroke="currentColor" stroke-width="1" fill="none"/><rect x="5" y="5" width="4" height="4" fill="currentColor"/></svg>'
  },
  {
    path: '/my-bookings',
    label: t('myBookings'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/></svg>'
  },
  {
    path: '/calendar',
    label: t('calendar'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 10H21" stroke="currentColor" stroke-width="2"/></svg>'
  },
  {
    path: '/smart-devices',
    label: t('smartDevices'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    path: '/stores-shopping',
    label: t('stores'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    path: '/news',
    label: t('news'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/><path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2"/></svg>'
  },
  {
    path: '/requests',
    label: t('requests'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  },
  {
    path: '/profile',
    label: t('profile'),
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  }
])

// Methods
const toggleQuickMenu = () => {
  showQuickMenu.value = !showQuickMenu.value
  
  // Hide hint and mark as seen when user interacts
  if (showLogoHint.value) {
    showLogoHint.value = false
    hasSeenLogoHint.value = true
    localStorage.setItem('hasSeenLogoHint', 'true')
  }
}

const navigateToPage = (path) => {
  router.push(path)
  showQuickMenu.value = false
}

const isActivePage = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

// Keyboard handling is now managed globally by useGlobalKeyboard

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

// Notification Center methods
const openNotificationCenter = () => {
  notificationCenterStore.openModal()
}

const initializeNotificationCenter = async () => {
  try {
    const currentUser = await optimizedAuthService.getCurrentUser()
    
    if (!currentUser || !currentProject.value) {
      console.log('NotificationCenter: Cannot initialize without user and project')
      return
    }

    console.log('NotificationCenter: Initializing for user:', currentUser.uid, 'project:', currentProject.value.id)
    notificationCenterStore.subscribeToNotifications(currentUser.uid, currentProject.value.id)
  } catch (error) {
    console.error('NotificationCenter: Error initializing:', error)
  }
}

// Violation notification methods
const checkForViolations = async (forceShow = false) => {
  console.log('🔍 checkForViolations called, forceShow:', forceShow)
  console.log('🔍 Current project:', currentProject.value)
  console.log('🔍 Has shown in session:', hasShownViolationInSession.value)
  
  // Skip if already shown in this session and not forced
  if (hasShownViolationInSession.value && !forceShow) {
    console.log('⏭️ Violation notification already shown in this session, skipping')
    return
  }
  
  try {
    const currentUser = await optimizedAuthService.getCurrentUser()
    console.log('🔍 Current user:', currentUser?.uid)
    console.log('🔍 Auth object:', currentUser ? 'initialized' : 'not initialized')
    
    if (!currentProject.value || !currentUser) {
      console.warn('⚠️ Cannot check violations: missing project or user')
      return
    }
    
    // Get Cognito sub (the actual user ID stored in fines) instead of uid (which might be email)
    const cognitoSub = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.id || currentUser.userSub || currentUser.uid
    const userEmail = currentUser.email || currentUser.attributes?.email || currentUser.cognitoAttributes?.email || currentUser.uid
    
    console.log('🔍 User identifiers for violation check:', { 
      uid: currentUser.uid, 
      cognitoSub, 
      userEmail 
    })
    
    console.log('🔍 Checking for active violations...')
    // Check for any active violations (issued or disputed) that need attention
    // Use Cognito sub (primary) or email (fallback) - getUserFines handles both
    const result = await hasActiveViolations(currentProject.value.id, cognitoSub || userEmail)
    
    console.log('✅ Violation check result:', result)
    
    if (result.hasActiveViolations) {
      console.log('⚠️ Active violations found:', result.violationCount)
      violationCount.value = result.violationCount
      showViolationNotification.value = true
      hasShownViolationInSession.value = true
      
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
  router.push('/violations')
}

// Suspension check methods
const checkUserSuspensionStatus = async () => {
  try {
    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      console.warn('⚠️ MainLayout: No current user for suspension check')
      return
    }
    
    // Use Cognito sub (which is the DynamoDB user ID) instead of uid which might be email
    const userId = currentUser.attributes?.sub || currentUser.cognitoAttributes?.sub || currentUser.uid
    console.log('🔍 MainLayout: Checking suspension for user ID:', userId)
    
    const suspensionStatus = await checkUserSuspension(userId)
    
    console.log('🔍 MainLayout: Suspension status:', {
      isSuspended: suspensionStatus.isSuspended,
      hasDetails: !!suspensionStatus.suspensionDetails
    })
    
    if (suspensionStatus.isSuspended) {
      isUserSuspended.value = true
      suspensionMessage.value = getSuspensionMessage(suspensionStatus.suspensionDetails)
      showSuspensionMessage.value = true
      console.log('🚫 MainLayout: User is suspended, showing suspension message')
    } else {
      isUserSuspended.value = false
      showSuspensionMessage.value = false
      suspensionMessage.value = null
    }
  } catch (error) {
    console.error('❌ MainLayout: Error checking user suspension:', error)
  }
}

  const handleSuspensionDismiss = () => {
    showSuspensionMessage.value = false
  }

// Handle visibility change for permission checking (defined outside onMounted so it can be removed in onUnmounted)
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    try {
      const protocol = window.location.protocol
      const hasIOSBridge = window.webkit?.messageHandlers !== undefined
      const platform = Capacitor.getPlatform()
      const isNative = platform === 'ios' || platform === 'android' || protocol === 'capacitor:' || hasIOSBridge
      
      // Only check if permissions were requested, don't force request again
      // This is just for logging/debugging
      if (isNative && !permissionsService.permissionsRequested) {
        console.log('🔐 MainLayout: App became visible, permissions not requested yet')
        // Don't auto-request here to avoid annoying users, just log
      }
    } catch (error) {
      console.error('❌ MainLayout: Error checking permissions on visibility change:', error)
    }
  }
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
  hasShownViolationInSession.value = false
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
    
    case 'requests':
      // Requests tab is active for request categories and submissions
      return currentPath === '/requests' ||
             currentPath.startsWith('/request-chat/') ||
             currentPath.startsWith('/request-category/')
    
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
      
      // Reset and restart data preloader for new project
      resetPreloader()
      
      // Re-initialize notification center for new project
      setTimeout(async () => {
        try {
          await initializeNotificationCenter()
        } catch (error) {
          console.error('❌ Error initializing notification center after project change:', error)
        }
      }, 500)
      
      // Start background data preloading for new project immediately
      setTimeout(async () => {
        try {
          const currentUser = await optimizedAuthService.getCurrentUser()
          if (currentUser && newProject) {
            console.log('🚀 MainLayout: Preloading data for new project:', newProject.id)
            await preloadAppData(currentUser.uid, newProject.id)
          } else {
            console.warn('⚠️ MainLayout: Cannot preload - missing user or project', { 
              hasUser: !!currentUser, 
              hasProject: !!newProject 
            })
          }
        } catch (error) {
          console.error('❌ Error preloading data for new project:', error)
          console.error('❌ Error stack:', error.stack)
          // Don't block the UI if preload fails
        }
      }, 800) // Shorter delay for better perceived performance
      
      // Check for violations when project is first selected (initial load)
      // Only check on initial selection (when oldProject is null/undefined)
      if (!oldProject) {
        setTimeout(async () => {
          try {
            await checkForViolations()
            console.log('✅ Initial violation check completed after project selection')
          } catch (error) {
            console.error('❌ Error in checkForViolations after project selection:', error)
          }
        }, 1500) // Delay to ensure project and user are fully loaded
      }
      
      // Emit a custom event that child components can listen to
      window.dispatchEvent(new CustomEvent('projectChanged', {
        detail: { newProject, oldProject }
      }))
      
      // Emit app ready event for splash screen
      window.dispatchEvent(new CustomEvent('appReady'))
      
      // Check user suspension status when switching projects
      setTimeout(() => {
        checkUserSuspensionStatus()
      }, 1000)
    }
  },
  { deep: true }
)

// Watch for route changes to detect chat pages
watch(
  () => route.path,
  () => {
    checkIfChatPage()
    // Violation check removed - only show once on app load, not on every navigation
  },
  { immediate: true }
)

// Watch for modal state changes - iOS fix to hide navigation bars
watch(
  showProjectSwitcher,
  (isOpen) => {
    if (isOpen) {
      openModal()
    } else {
      closeModal()
    }
  }
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

// Watch for route changes to set transition direction and close quick menu
watch(() => route.path, (newPath, oldPath) => {
  if (!oldPath || !newPath) return
  
  // Close quick menu on route change
  showQuickMenu.value = false
  
  // Determine transition direction based on tab order
  const getBaseRoute = (path) => {
    return tabOrder.find(tab => path.startsWith(tab)) || path
  }
  
  const oldBaseRoute = getBaseRoute(oldPath)
  const newBaseRoute = getBaseRoute(newPath)
  
  const oldIndex = tabOrder.indexOf(oldBaseRoute)
  const newIndex = tabOrder.indexOf(newBaseRoute)
  
  if (oldIndex !== -1 && newIndex !== -1) {
    // Navigation within main tabs
    if (newIndex > oldIndex) {
      transitionDirection.value = 'slide-left'
    } else if (newIndex < oldIndex) {
      transitionDirection.value = 'slide-right'
    } else {
      transitionDirection.value = 'fade'
    }
  } else {
    // Default fade for non-tab navigation
    transitionDirection.value = 'fade'
  }
  
  previousRoute.value = oldPath
})

// Load user projects when component mounts
onMounted(async () => {
  // Initialize app settings
  appSettingsStore.initSettings()
  
  // Reset violation notifications when app starts
  resetViolationNotifications()
  
  window.addEventListener('projectStoreReady', handleProjectStoreReady)
  
  // Initialize notification center
  if (projectStore.hasSelectedProject) {
    setTimeout(async () => {
      try {
        await initializeNotificationCenter()
      } catch (error) {
        console.error('❌ Error initializing notification center during mount:', error)
      }
    }, 500)
    
    // Start background data preloading immediately (async, non-blocking)
    // This runs in parallel with page loads
    setTimeout(async () => {
      try {
        const currentUser = await optimizedAuthService.getCurrentUser()
        if (currentUser && projectStore.selectedProject) {
          console.log('🚀 MainLayout: Starting background data preload...')
          await preloadAppData(currentUser.uid, projectStore.selectedProject.id)
        } else {
          console.warn('⚠️ MainLayout: Cannot start preload - missing user or project')
        }
      } catch (error) {
        console.error('❌ Error preloading app data:', error)
        // Don't block the UI if preload fails
      }
    }, 1000) // Start after 1 second
  }
  
  // Check for violations once when app first loads (will only show once due to session flag)
  if (projectStore.hasSelectedProject) {
    setTimeout(async () => {
      try {
        await checkForViolations()
        console.log('✅ Initial violation check completed')
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
  
  // Emit app ready event after initial load
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('appReady'))
  }, 2000) // Give time for app to fully initialize
  
  // Fallback: Request permissions if they weren't requested yet (in case boot file missed it)
  setTimeout(async () => {
    try {
      const protocol = window.location.protocol
      const hasIOSBridge = window.webkit?.messageHandlers !== undefined
      const platform = Capacitor.getPlatform()
      const isNative = platform === 'ios' || platform === 'android' || protocol === 'capacitor:' || hasIOSBridge
      
      if (isNative && !permissionsService.permissionsRequested) {
        console.log('🔐 MainLayout: Permissions not requested yet, requesting now as fallback...')
        const results = await permissionsService.requestAllPermissions()
        console.log('✅ MainLayout: Fallback permission request completed:', results)
      }
    } catch (error) {
      console.error('❌ MainLayout: Error in fallback permission request:', error)
    }
  }, 3000) // Wait 3 seconds after mount
  
  // Register visibility change listener
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  window.addEventListener('showSuspensionMessage', handleSuspensionMessage)
  
  // Keyboard detection is now handled globally
  
  // Add dead zones for areas where swipe should be disabled
  // Bottom navigation area (prevent accidental swipes when tapping nav items)
  const navHeight = 80 // Smaller dead zone
  addDeadZone(0, window.innerHeight - navHeight, window.innerWidth, navHeight)
  
  // Touch listener is handled by backdrop click now - removed redundant listener
  
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
  
  // Show logo hint for first-time users
  const seenLogoHint = localStorage.getItem('hasSeenLogoHint')
  if (!seenLogoHint) {
    hasSeenLogoHint.value = false
    // Show hint after swipe hint disappears
    setTimeout(() => {
      showLogoHint.value = true
      // Hide hint after 8 seconds (longer for better visibility)
      setTimeout(() => {
        showLogoHint.value = false
        if (!hasSeenLogoHint.value) {
          localStorage.setItem('hasSeenLogoHint', 'true')
          hasSeenLogoHint.value = true
        }
      }, 8000)
    }, hasSeenSwipeHint ? 2000 : 7000) // Show after swipe hint or earlier if swipe hint already seen
  } else {
    hasSeenLogoHint.value = true
  }
  
  return () => {
    // Keyboard cleanup is handled globally
  }
})

// Cleanup event listeners on unmount
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('showSuspensionMessage', handleSuspensionMessage)
  window.removeEventListener('projectStoreReady', handleProjectStoreReady)
  
  // Clean up notification center
  notificationCenterStore.clearNotifications()
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
  /* padding-top: 60px !important; */
  /* iOS Safari fix */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  transition: opacity 0.2s ease, visibility 0.2s ease;
  padding-bottom: 5px;
  /* Force header to always be LTR, even in Arabic */
  direction: ltr !important;
}

/* Hide header when modal is open - iOS fix */
.app-header.hide-for-modal {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.header-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  gap: 16px;
  /* Keep header content LTR */
  direction: ltr !important;
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
  position: relative;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

/* RTL Support for Header - DISABLED to keep header always LTR */
/* Header will always maintain LTR layout regardless of app language */
[dir="rtl"] .header-left {
  justify-content: flex-start !important; /* Keep left aligned */
}

[dir="rtl"] .header-right {
  justify-content: flex-end !important; /* Keep right aligned */
}

[dir="rtl"] .header-content {
  grid-template-columns: 1fr auto 1fr;
  direction: ltr !important; /* Force LTR */
}

/* Logo Button Styles */
.logo-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 10px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Shimmer effect for first-time users */
.logo-button.first-time::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(175, 30, 35, 0.2) 50%, 
    transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 2.5s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes shimmer {
  0%, 100% {
    background-position: 200% 0;
  }
  50% {
    background-position: -200% 0;
  }
}

.logo-button.menu-open {
  background: rgba(175, 30, 35, 0.08);
}

.logo-button:active {
  transform: scale(0.98);
}

.logo-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
}

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
  display: block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 0 transparent);
}

/* Removed hover effects for mobile */

.logo-button.menu-open .logo-image {
  filter: drop-shadow(0 4px 12px rgba(175, 30, 35, 0.5));
}

/* Always-visible label */
.quick-actions-label {
  font-size: 0.6rem;
  font-weight: 700;
  color: #AF1E23;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.85;
  transition: all 0.3s ease;
  z-index: 1;
}

.logo-button:active .quick-actions-label {
  opacity: 1;
  transform: scale(1.05);
}

.logo-arrow {
  color: #AF1E23;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 3px rgba(175, 30, 35, 0.3));
}

/* Enhanced pulsing animation for first-time hint */
.logo-arrow.pulse {
  animation: arrowPulse 1.5s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
    filter: drop-shadow(0 2px 6px rgba(175, 30, 35, 0.4));
  }
  50% {
    transform: translateY(3px) scale(1.2);
    opacity: 1;
    filter: drop-shadow(0 4px 12px rgba(175, 30, 35, 0.7));
  }
}

/* Removed hover effects for mobile */

.logo-button.menu-open .logo-arrow {
  transform: rotate(180deg);
  opacity: 1;
  filter: drop-shadow(0 2px 4px rgba(175, 30, 35, 0.4));
  animation: none;
}

/* Enhanced logo hint tooltip with icon */
.logo-hint {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 16px;
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  color: #F6F6F6;
  padding: 12px 20px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 
    0 8px 24px rgba(175, 30, 35, 0.5),
    0 0 0 3px rgba(175, 30, 35, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 1001;
  pointer-events: none;
  animation: hintBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), hintGlow 2s ease-in-out infinite;
}

.hint-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-icon {
  flex-shrink: 0;
  animation: iconPulse 1.5s ease-in-out infinite;
}

/* RTL Support for Logo Hint */
[dir="rtl"] .hint-content {
  flex-direction: row-reverse;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15) rotate(5deg);
  }
}

.logo-hint::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #AF1E23;
}

@keyframes hintBounce {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-15px) scale(0.85);
  }
  60% {
    opacity: 1;
    transform: translateX(-50%) translateY(3px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes hintGlow {
  0%, 100% {
    box-shadow: 
      0 8px 24px rgba(175, 30, 35, 0.5),
      0 0 0 3px rgba(175, 30, 35, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 
      0 8px 32px rgba(175, 30, 35, 0.7),
      0 0 0 3px rgba(175, 30, 35, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

.hint-fade-enter-active {
  animation: hintBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hint-fade-leave-active {
  animation: hintFadeOut 0.3s ease;
}

@keyframes hintFadeOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px) scale(0.95);
  }
}

/* Notification Bell Button */
.notification-bell-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(175, 30, 35, 0.1);
  border: 2px solid rgba(175, 30, 35, 0.3);
  border-radius: 12px;
  padding: 10px;
  color: #F6F6F6;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  min-width: 44px;
  min-height: 44px;
}

.notification-bell-btn:active {
  transform: scale(0.95);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #AF1E23;
  color: #F6F6F6;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #231F20;
  box-shadow: 0 2px 6px rgba(175, 30, 35, 0.4);
  animation: badge-pulse 2s ease-in-out infinite;
}

/* RTL Support for Notification Badge */
[dir="rtl"] .notification-badge {
  right: auto;
  left: -4px;
}

@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 6px rgba(175, 30, 35, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(175, 30, 35, 0.6);
  }
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

/* Mobile app - hover effects disabled */
/* .gate-access-btn:hover {
  background: rgba(175, 30, 35, 0.2);
  border-color: rgba(175, 30, 35, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
} */

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

/* RTL Support for Gate Access Button */
[dir="rtl"] .gate-access-btn {
  flex-direction: row-reverse;
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
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(175, 30, 35, 0.1);
  border: 2px solid rgba(175, 30, 35, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.current-project:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.15);
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

.project-arrow {
  color: rgba(246, 246, 246, 0.5);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

/* RTL Support for Current Project Button */
[dir="rtl"] .current-project {
  flex-direction: row-reverse;
}

[dir="rtl"] .project-arrow {
  transform: rotate(180deg);
}

.current-project:active .project-arrow {
  color: rgba(246, 246, 246, 0.8);
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
  /* padding-top: 100px; */
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
  transition: transform 0.3s ease-in-out, opacity 0.2s ease, visibility 0.2s ease;
  /* iOS Safari fix */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

/* RTL Support for Bottom Navigation */
[dir="rtl"] .bottom-navigation {
  flex-direction: row-reverse;
}

.bottom-navigation.hidden {
  transform: translateY(100%);
  -webkit-transform: translateY(100%);
}

/* Hide bottom nav when modal is open - iOS fix */
.bottom-navigation.hide-for-modal {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* Hide bottom nav when keyboard is open or ProfilePage modals are open */
body.keyboard-open .bottom-navigation,
body.hide-bottom-nav .bottom-navigation {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transform: translateY(100%) !important;
  -webkit-transform: translateY(100%) !important;
  z-index: -1 !important;
  /* Disable transitions to ensure immediate hiding */
  transition: none !important;
  -webkit-transition: none !important;
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

/* Mobile app - hover effects disabled */
/* .nav-item:hover {
  color: #ccc;
} */

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

.nav-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) invert(1); /* Makes the icons white */
  transition: all 0.3s ease;
}

.nav-item.active .nav-icon {
  background-color: #AF1E23;
  color: #F6F6F6;
  transform: translateY(-40px);
  border: 5px solid white;
  width: 64px;
  height: 64px;
}

.nav-item.active .nav-icon img {
  filter: brightness(0) invert(1); /* Keep icons white when active */
  width: 28px;
  height: 28px;
}

.nav-item:not(.active) .nav-icon {
  background: none;
}

.nav-item:not(.active) .nav-icon img {
  filter: brightness(0) invert(1); /* Keep icons white when inactive */
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
  z-index: 999999;
  backdrop-filter: blur(4px);
  /* iOS Safari fixes */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.modal-content {
  background: rgba(35, 31, 32, 0.98);
  border: 2px solid rgba(175, 30, 35, 0.3);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(175, 30, 35, 0.1);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: modal-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-slide-up {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
    filter: blur(4px);
  }
  50% {
    opacity: 0.8;
    filter: blur(1px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.project-switcher-modal {
  width: 520px;
  max-height: 650px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 2px solid rgba(175, 30, 35, 0.2);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #F6F6F6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(175, 30, 35, 0.1);
  border: 2px solid rgba(175, 30, 35, 0.3);
  border-radius: 12px;
  padding: 8px;
  color: #F6F6F6;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 36px;
  min-height: 36px;
}

.close-btn:active {
  transform: scale(0.95);
  background: rgba(175, 30, 35, 0.2);
  border-color: rgba(175, 30, 35, 0.4);
}

/* RTL Support for Modal Header */
[dir="rtl"] .modal-header {
  flex-direction: row-reverse;
  text-align: right;
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
  background: rgba(175, 30, 35, 0.05);
  border: 2px solid rgba(175, 30, 35, 0.2);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
}

.project-option.clickable {
  cursor: pointer;
}

.project-option.clickable:active {
  background: rgba(175, 30, 35, 0.15);
  border-color: rgba(175, 30, 35, 0.5);
  transform: scale(0.97);
}

.project-option.current {
  background: rgba(175, 30, 35, 0.2);
  border-color: #AF1E23;
  box-shadow: 
    0 4px 16px rgba(175, 30, 35, 0.3),
    0 0 0 2px rgba(175, 30, 35, 0.15);
  transform: scale(1.02);
  cursor: default;
}

.project-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #F6F6F6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.project-info p {
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  color: rgba(246, 246, 246, 0.7);
}

.project-role {
  font-size: 0.75rem;
  color: rgba(246, 246, 246, 0.6);
  font-weight: 500;
}

.project-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* RTL Support for Project Options */
[dir="rtl"] .project-option {
  flex-direction: row-reverse;
}

[dir="rtl"] .project-info {
  text-align: right;
}

[dir="rtl"] .project-actions {
  flex-direction: row-reverse;
}

.current-badge {
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  color: #F6F6F6;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid rgba(175, 30, 35, 0.3);
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.3);
  backdrop-filter: blur(10px);
}

.switch-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(175, 30, 35, 0.1);
  border: 2px solid rgba(175, 30, 35, 0.3);
  border-radius: 12px;
  padding: 10px 20px;
  color: #F6F6F6;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  min-width: 80px;
  pointer-events: none;
  transition: all 0.3s ease;
}

.switch-text {
  color: rgba(246, 246, 246, 0.9);
  font-weight: 600;
  white-space: nowrap;
}

.project-option.clickable:active .switch-indicator {
  background: rgba(175, 30, 35, 0.2);
  border-color: rgba(175, 30, 35, 0.4);
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
  border-top: 2px solid rgba(175, 30, 35, 0.2);
  display: flex;
  justify-content: center;
}

.secondary-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(175, 30, 35, 0.1);
  border: 2px solid rgba(175, 30, 35, 0.3);
  border-radius: 12px;
  padding: 12px 24px;
  color: #F6F6F6;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.secondary-btn:active {
  transform: scale(0.95);
  background: rgba(175, 30, 35, 0.15);
  border-color: rgba(175, 30, 35, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
    padding-bottom: 5px;
  }
  
  .header-content {
    gap: 8px;
  }
  
  .main-content {
    padding-top: 50px; /* Adjust for smaller header */
    padding-bottom: 40px;
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
  
  .notification-bell-btn {
    padding: 8px;
    border-radius: 10px;
    min-width: 40px;
    min-height: 40px;
  }

  .notification-bell-btn svg {
    width: 18px;
    height: 18px;
  }

  .notification-badge {
    font-size: 0.6rem;
    min-width: 16px;
    height: 16px;
    top: -3px;
    right: -3px;
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
    height: 36px;
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
    padding-bottom: 5px;
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
    padding-bottom: 5px;
  }
  
  .header-content {
    gap: 6px;
  }
  
  .main-content {
    padding: 16px;
    padding-top: 50px; /* Adjust for smallest header */
    padding-bottom: 40px;
  }
  
  .logo-image {
    height: 28px;
  }
  
  .notification-bell-btn {
    padding: 6px;
    min-width: 36px;
    min-height: 36px;
  }

  .notification-bell-btn svg {
    width: 16px;
    height: 16px;
  }

  .notification-badge {
    font-size: 0.55rem;
    min-width: 14px;
    height: 14px;
    top: -2px;
    right: -2px;
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

/* ================================
   Quick Menu Dropdown Styles
   ================================ */

/* Quick Menu Backdrop */
.quick-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Quick Menu Dropdown */
.quick-menu-dropdown {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 1000;
  width: 90%;
  max-width: 520px;
  transform-origin: 50% 0;
}

.quick-menu-content {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 0 1px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 70px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.quick-menu-content::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #ffffff;
  filter: drop-shadow(0 -2px 4px rgba(0, 0, 0, 0.1));
}

/* Grid layout for menu items */
.quick-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

/* Individual menu items */
.quick-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 18px 12px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-align: center;
  min-height: 95px;
  position: relative;
  overflow: hidden;
}

.quick-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(175, 30, 35, 0.05) 0%, rgba(212, 32, 40, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Removed hover effects for mobile */

.quick-menu-item:active {
  transform: translateY(-2px) scale(1);
  transition: all 0.1s ease;
}

.quick-menu-item.active {
  background: linear-gradient(135deg, #fff5f4 0%, #ffe8e8 100%);
  border-color: #AF1E23;
  box-shadow: 
    0 4px 16px rgba(175, 30, 35, 0.25),
    0 0 0 2px rgba(175, 30, 35, 0.1);
  transform: scale(1.05);
}

.quick-menu-item.active::before {
  opacity: 1;
}

/* Menu item icon */
.quick-menu-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F6F6F6;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
  position: relative;
  z-index: 1;
}

.quick-menu-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, #d42028 0%, #AF1E23 100%);
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.quick-menu-item.active .quick-menu-icon {
  background: linear-gradient(135deg, #d42028 0%, #AF1E23 100%);
  box-shadow: 
    0 6px 20px rgba(175, 30, 35, 0.4),
    0 0 0 3px rgba(175, 30, 35, 0.1);
  transform: scale(1.15) rotate(5deg);
}

/* Removed hover effects for mobile */

/* Menu item label */
.quick-menu-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.quick-menu-item.active .quick-menu-label {
  color: #AF1E23;
  font-weight: 700;
}

/* RTL Support for Quick Menu */
[dir="rtl"] .quick-menu-grid {
  direction: rtl;
}

[dir="rtl"] .quick-menu-item {
  text-align: right;
}

/* Scrollbar styling */
.quick-menu-content::-webkit-scrollbar {
  width: 6px;
}

.quick-menu-content::-webkit-scrollbar-track {
  background: transparent;
}

.quick-menu-content::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

/* Removed hover effects for mobile */

/* SUPER SMOOTH PREMIUM ANIMATIONS*/

/* Backdrop - Smooth fade with blur */
.quick-menu-backdrop-enter-active {
  transition: opacity 400ms cubic-bezier(0.16, 1, 0.3, 1),
              backdrop-filter 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
.quick-menu-backdrop-leave-active {
  transition: opacity 300ms cubic-bezier(0.4, 0, 1, 1),
              backdrop-filter 300ms cubic-bezier(0.4, 0, 1, 1);
}
.quick-menu-backdrop-enter-from,
.quick-menu-backdrop-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

/* Main Dropdown - Spring-like entrance with scale and bounce */
.quick-menu-enter-active {
  animation: quick-menu-enter 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.quick-menu-leave-active {
  animation: quick-menu-leave 300ms cubic-bezier(0.6, 0, 0.9, 0.4);
}

@keyframes quick-menu-enter {
  0% {
    opacity: 0;
    transform: translate3d(0, -60px, 0) scale(0.85) rotateX(10deg);
    filter: blur(8px);
  }
  50% {
    opacity: 0.8;
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1) rotateX(0deg);
    filter: blur(0);
  }
}

@keyframes quick-menu-leave {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translate3d(0, -40px, 0) scale(0.9);
    filter: blur(6px);
  }
}

/* Menu Items - Staggered cascade with spring physics */
.quick-menu-item {
  opacity: 0;
  transform: translate3d(0, 30px, 0) scale(0.85) rotateZ(-3deg);
  filter: blur(4px);
  transition: 
    opacity 450ms cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 450ms cubic-bezier(0.34, 1.56, 0.64, 1),
    background 250ms ease,
    box-shadow 250ms ease,
    border-color 250ms ease;
  will-change: transform, opacity, filter;
}

.quick-menu-dropdown[data-open="true"] .quick-menu-item {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1) rotateZ(0deg);
  filter: blur(0);
}

/* Cascading delays with perfect rhythm */
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(1) { 
  transition-delay: 50ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(2) { 
  transition-delay: 100ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(3) { 
  transition-delay: 150ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(4) { 
  transition-delay: 200ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(5) { 
  transition-delay: 250ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(6) { 
  transition-delay: 300ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(7) { 
  transition-delay: 350ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(8) { 
  transition-delay: 400ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(9) { 
  transition-delay: 450ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(10) { 
  transition-delay: 500ms;
}

/* Icon animations - subtle pulse on menu open */
.quick-menu-icon {
  animation: icon-settle 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-fill-mode: both;
}

.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(1) .quick-menu-icon { 
  animation-delay: 50ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(2) .quick-menu-icon { 
  animation-delay: 100ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(3) .quick-menu-icon { 
  animation-delay: 150ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(4) .quick-menu-icon { 
  animation-delay: 200ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(5) .quick-menu-icon { 
  animation-delay: 250ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(6) .quick-menu-icon { 
  animation-delay: 300ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(7) .quick-menu-icon { 
  animation-delay: 350ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(8) .quick-menu-icon { 
  animation-delay: 400ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(9) .quick-menu-icon { 
  animation-delay: 450ms;
}
.quick-menu-dropdown[data-open="true"] .quick-menu-item:nth-child(10) .quick-menu-icon { 
  animation-delay: 500ms;
}

@keyframes icon-settle {
  0% {
    transform: scale(0.6) rotate(-180deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.15) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Enhanced press interaction - satisfying tactile feedback */
.quick-menu-item:active {
  transform: translateY(-2px) scale(0.96);
  transition: all 80ms cubic-bezier(0.4, 0, 0.6, 1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.12),
    0 1px 4px rgba(0, 0, 0, 0.08);
}

.quick-menu-item:active .quick-menu-icon {
  transform: scale(0.92) rotate(-2deg);
  box-shadow: 
    0 2px 6px rgba(175, 30, 35, 0.3),
    inset 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: all 80ms cubic-bezier(0.4, 0, 0.6, 1);
}

/* Improve container paint performance */
.quick-menu-dropdown,
.quick-menu-content {
  will-change: transform, opacity;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  perspective: 1000px;
  -webkit-perspective: 1000px;
}

/* Accessibility: respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .quick-menu-enter-active,
  .quick-menu-leave-active,
  .quick-menu-backdrop-enter-active,
  .quick-menu-backdrop-leave-active {
    transition-duration: 1ms !important;
  }
  .quick-menu-item {
    transition-duration: 1ms !important;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .quick-menu-dropdown {
    top: 0;
    width: 95%;
  }

  .quick-menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
  }

  .quick-menu-item {
    padding: 12px 8px;
    min-height: 80px;
  }

  .quick-menu-icon {
    width: 36px;
    height: 36px;
  }

  .quick-menu-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .quick-menu-dropdown {
    top: 0;
    width: calc(100% - 16px);
  }

  .quick-menu-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .quick-menu-item {
    padding: 10px 6px;
    min-height: 75px;
  }

  .quick-menu-icon {
    width: 32px;
    height: 32px;
  }

  .quick-menu-label {
    font-size: 0.75rem;
  }
}

/* ================================
   Page Transition Animations
   ================================ */

/* Slide Left Transition (going forward) */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Slide Right Transition (going backward) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Fade Transition (for non-tab navigation) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure smooth transitions */
.main-content {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  height: 100%;
}

.main-content > * {
  width: 100%;
}
</style>
