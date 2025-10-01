<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Welcome back!</h1>
          <p class="hero-subtitle">Here's what's happening in your community</p>
        </div>
        <!-- <button @click="showProjectSwitcher = true" class="project-switcher-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Switch Project
        </button> -->
      </div>
    </div>

    <!-- Ads Carousel -->
    <AdsCarousel />

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <h2 class="section-title">Quick Actions</h2>
      <div class="actions-scroll">

        <button class="action-card" @click="navigateToGate">
          <div class="action-icon">
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
          </div>
          <div class="action-content">
            <h3>Gate Access</h3>
          </div>
        </button>

        <button class="action-card" @click="navigateToServices">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="action-content">
            <h3>Services</h3>
          </div>
        </button>

        <button class="action-card" @click="navigateToMyBookings">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <div class="action-content">
            <h3>Bookings</h3>
          </div>
        </button>

        <button class="action-card" @click="navigateToSmartDevices">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="action-content">
            <h3>Smart Devices</h3>
          </div>
        </button>

        <button class="action-card" @click="navigateToCalendar">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M16 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
              <path d="M3 10H21" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <div class="action-content">
            <h3>Calendar</h3>
          </div>
        </button>

        <button class="action-card" @click="navigateToMyOrders">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="action-content">
            <h3>My Orders</h3>
          </div>
        </button>

        <button class="action-card" @click="navigateToStores">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div class="action-content">
            <h3>Stores</h3>
          </div>
        </button>

        <button class="action-card" @click="navigateToNews">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                stroke="currentColor" stroke-width="2" />
              <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <div class="action-content">
            <h3>News</h3>
          </div>
        </button>

        <!-- <button class="action-card" @click="navigateToMyBookings">
          <div class="action-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V19A4 4 0 0 0 12 15H8A4 4 0 0 0 4 19V21" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
            </svg>
          </div>
          <div class="action-content">
            <h3>Profile</h3>
          </div>
        </button> -->
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card" :class="{ 'loading': isStatsLoading }" @click="navigateToCalendar">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M16 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ isStatsLoading ? '...' : upcomingEventsCount }}</div>
          <div class="stat-label">Upcoming Events</div>
        </div>
      </div>

      <!-- <div class="stat-card" :class="{ 'loading': isStatsLoading }" @click="navigateToMyBookings">
        <div class="stat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ isStatsLoading ? '...' : activeBookingsCount }}</div>
          <div class="stat-label">My Bookings</div>
        </div>
      </div> -->
    </div>

    <!-- Smart Device Widget - Only show if current project has Smart Mirror connection -->
    <SmartDeviceWidget v-if="hasSmartMirrorConnection" :key="currentProjectId" />

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- News Feed -->
      <div class="news-section">
        <ModernNewsFeed :project-id="currentProjectId" />
      </div>

      <!-- Upcoming Bookings -->
      <div class="bookings-section">
        <UpcomingBookingsCard />
      </div>
    </div>

    <!-- Project Switcher Modal -->
    <div v-if="showProjectSwitcher" class="modal-overlay" @click="showProjectSwitcher = false">
      <div class="modal-content project-switcher-modal" @click.stop>
        <div class="modal-header">
          <h3>Switch Project</h3>
          <button @click="showProjectSwitcher = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="userProjects.length > 0" class="projects-list">
            <div v-for="project in userProjects" :key="project.id"
              :class="['project-option', { 'current': project.id === currentProjectId }]"
              @click="switchToProject(project)">
              <div class="project-option-info">
                <h4 class="project-option-name">{{ project.name || 'Unnamed Project' }}</h4>
                <p class="project-option-location">{{ project.location || 'Location not set' }}</p>
                <div class="project-option-details">
                  <span class="project-option-unit">Unit {{ project.userUnit || 'N/A' }}</span>
                  <span class="project-option-role">{{ project.userRole || 'Member' }}</span>
                </div>
              </div>
              <div class="project-option-status">
                <span v-if="project.id === currentProjectId" class="current-badge">Current</span>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div v-else class="no-projects">
            <p>No projects available</p>
            <button @click="goToProjectSelection" class="go-to-selection-btn">
              Go to Project Selection
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="goToProjectSelection" class="secondary-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Manage Projects
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from '../../boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useProjectStore } from '../../stores/projectStore'
import { useAcademiesStore } from '../../stores/academyStore'
import { useSmartMirrorStore } from '../../stores/smartMirrorStore'
import UpcomingBookingsCard from '../../components/UpcomingBookingsCard.vue'
import ModernNewsFeed from '../../components/ModernNewsFeed.vue'
import SmartDeviceWidget from '../../components/SmartDeviceWidget.vue'
import AdsCarousel from '../../components/AdsCarousel.vue'
// import sampleDataService from '../../services/sampleDataService.js' // Disabled - using real Firebase data only
import notificationService from '../../services/notificationService.js'

// Component name for ESLint
defineOptions({
  name: 'HomePage'
})

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()
const academiesStore = useAcademiesStore()
const smartMirrorStore = useSmartMirrorStore()
const user = ref(null)
// const activeTab = ref('all')
const showProjectSwitcher = ref(false)
const notifications = ref([])
const isLoadingNotifications = ref(false)
const userProjects = computed(() => projectStore.userProjects)
const currentProjectId = computed(() => projectStore.selectedProject?.id)

// Computed property to check if current project has Smart Mirror connection
const hasSmartMirrorConnection = computed(() => {
  return currentProjectId.value ? smartMirrorStore.isProjectConnected(currentProjectId.value) : false
})

// Computed properties for dynamic stats
const upcomingEventsCount = computed(() => {
  if (!academiesStore.userBookings || academiesStore.userBookings.length === 0) return 0

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    const upcomingBookings = academiesStore.userBookings.filter(booking => {
      if (booking.type === 'court' && booking.date) {
        const bookingDate = new Date(booking.date)
        bookingDate.setHours(0, 0, 0, 0) // Reset time to start of day
        return bookingDate >= today && booking.status !== 'cancelled'
      }
      return false
    })

    return upcomingBookings.length
  } catch (error) {
    console.error('Error calculating upcoming events:', error)
    return 0
  }
})

// const activeBookingsCount = computed(() => {
//   if (!academiesStore.userBookings || academiesStore.userBookings.length === 0) return 0

//   try {
//     const activeBookings = academiesStore.userBookings.filter(booking => {
//       return booking.status === 'confirmed' || booking.status === 'enrolled'
//     })

//     return activeBookings.length
//   } catch (error) {
//     console.error('Error calculating active bookings:', error)
//     return 0
//   }
// })

// Check if stats are loading - only show loading when we're actively fetching data
const isStatsLoading = computed(() => {
  // If we have no bookings array yet, we're still loading
  if (!academiesStore.userBookings) return true

  // If we have an empty array, it means we've fetched data but found nothing
  // This is not loading, it's just no data
  return false
})

// Fetch notifications from Firestore
const fetchNotifications = async () => {
  console.log('🔍 Fetching notifications...')
  console.log('📋 Current Project ID:', currentProjectId.value)
  console.log('📋 Selected Project:', projectStore.selectedProject)

  if (!currentProjectId.value) {
    console.log('❌ No project ID available, skipping notification fetch')
    return
  }

  try {
    isLoadingNotifications.value = true
    console.log('🔄 Calling notificationService.fetchNotifications with:', currentProjectId.value, { activeOnly: true })
    const fetchedNotifications = await notificationService.fetchNotifications(currentProjectId.value, { activeOnly: true })
    console.log('✅ Fetched notifications:', fetchedNotifications)
    notifications.value = fetchedNotifications
  } catch (error) {
    console.error('❌ Error fetching notifications:', error)
    // Fallback to sample data if Firestore fails
    notifications.value = [
      {
        id: 'fallback-1',
        title: 'Welcome to PRE Group!',
        message: 'We\'re excited to have you as part of our community.',
        type: 'announcement',
        priority: 'normal',
        createdAt: new Date(Date.now() - 40 * 60 * 1000), // 40 minutes ago
        isActive: true
      },
      {
        id: 'fallback-2',
        title: 'Community Guidelines Updated',
        message: 'New community guidelines have been updated. Please review the latest policies.',
        type: 'announcement',
        priority: 'normal',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isActive: true
      },
      {
        id: 'fallback-3',
        title: 'Emergency Maintenance',
        message: 'Emergency maintenance scheduled for tomorrow. Please be prepared for temporary service interruption.',
        type: 'emergency',
        priority: 'high',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isActive: true
      }
    ]
  } finally {
    isLoadingNotifications.value = false
  }
}

// const filteredNews = computed(() => {
//   if (activeTab.value === 'emergency') {
//     return notifications.value.filter(item => item.type === 'emergency' || item.priority === 'high')
//   }
//   return notifications.value
// })

// Navigation methods
const navigateToGate = () => {
  router.push('/access')
}

const navigateToServices = () => {
  router.push('/services')
}

const navigateToMyBookings = () => {
  router.push('/my-bookings')
}

const navigateToCalendar = () => {
  router.push('/calendar')
}

const navigateToMyOrders = () => {
  router.push('/stores-shopping?tab=orders')
}

const navigateToStores = () => {
  router.push('/stores-shopping?tab=stores')
}

const navigateToSmartDevices = () => {
  router.push('/smart-devices')
}

const navigateToNews = () => {
  router.push('/news')
}

// Format timestamp for display
// const formatTimestamp = (timestamp) => {
//   if (!timestamp) return 'Just now'

//   try {
//     const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
//     const now = new Date()
//     const diffInSeconds = Math.floor((now - date) / 1000)

//     if (diffInSeconds < 60) return 'Just now'
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
//     if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

//     return date.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   } catch {
//     return 'Recently'
//   }
// }

// Project switching methods
const switchToProject = async (project) => {
  try {
    // Show loading state
    projectStore.setLoading(true)

    // Switch project in store
    projectStore.selectProject(project)

    // Switch Smart Mirror data to the new project
    await smartMirrorStore.switchToProject(project.id)

    // Load device settings for the new project using the store method
    smartMirrorStore.loadDeviceSettingsForProject(project.id)

    // Fetch user bookings for the new project
    if (user.value?.uid) {
      await academiesStore.fetchUserBookings(user.value.uid, project.id)
    }

    showProjectSwitcher.value = false
    projectStore.setLoading(false)

  } catch (err) {
    console.error('Error switching project:', err)
    projectStore.setLoading(false)
  }
}

const goToProjectSelection = () => {
  showProjectSwitcher.value = false
  router.push('/project-selection')
}

// Method to check and load the correct project data
const checkAndLoadProjectData = async () => {
  if (!user.value || !projectStore.selectedProject) return

  try {
    // Switch to the selected project in the smart mirror service
    if (projectStore.selectedProject?.id) {
      await smartMirrorStore.switchToProject(projectStore.selectedProject.id)
    }
  } catch (error) {
    console.error('Error switching to selected project:', error)
  }
}

onMounted(async () => {
  // Listen for auth state changes
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      user.value = currentUser

      // Check if project is selected, if not redirect to project selection
      if (!projectStore.hasSelectedProject) {
        // Try to load the selected project from localStorage
        projectStore.loadSelectedProject()

        // If still no project selected, redirect to project selection
        if (!projectStore.hasSelectedProject) {
          router.push('/project-selection')
          return
        }
      }

      // Fetch user bookings for the selected project
      try {
        if (projectStore.selectedProject?.id) {
          await academiesStore.fetchUserBookings(currentUser.uid, projectStore.selectedProject.id)
          console.log('User bookings fetched:', academiesStore.userBookings)
        }
      } catch (error) {
        console.error('Error fetching user bookings:', error)
      }

      // Initialize Smart Mirror app to restore authentication and project connections
      try {
        await smartMirrorStore.initializeApp()

        // Check and load the correct project data
        await checkAndLoadProjectData()
      } catch (error) {
        console.error('Error initializing Smart Mirror app:', error)
      }

      // Sample data initialization disabled - using real Firebase data only
      // try {
      //   if (projectStore.selectedProject?.id) {
      //     await sampleDataService.initializeAllSampleData(projectStore.selectedProject.id)
      //   }
      // } catch (error) {
      //   console.error('Error initializing sample data:', error)
      // }

      // Fetch notifications
      await fetchNotifications()
    }
  })

  // Listen for project changes from MainLayout
  const handleProjectChange = async (event) => {
    const { newProject } = event.detail

    try {
      // Load device settings for the new project using the store method
      smartMirrorStore.loadDeviceSettingsForProject(newProject.id)

      // Fetch user bookings for the new project
      if (user.value?.uid && newProject?.id) {
        await academiesStore.fetchUserBookings(user.value.uid, newProject.id)
      }

      // Refresh notifications for the new project
      await fetchNotifications()
    } catch (error) {
      console.error('Error refreshing data for new project:', error)
    }
  }


  // Add event listener for project changes
  window.addEventListener('projectChanged', handleProjectChange)

  // Cleanup event listener on unmount
  onUnmounted(() => {
    window.removeEventListener('projectChanged', handleProjectChange)
  })
})

// Watch for route changes to check project data
watch(() => route.path, async () => {
  if (route.path === '/home' && user.value) {
    await checkAndLoadProjectData()
  }
})

// Check project data when component is activated (when navigating back to this page)
onActivated(async () => {
  if (user.value) {
    await checkAndLoadProjectData()
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fafafa;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: #F6F6F6;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.2);
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

.project-switcher-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F6F6F6;
  color: #AF1E23;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  background: #F6F6F6;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card.loading {
  opacity: 0.7;
  pointer-events: none;
  background: #f0f0f0;
  border-color: #e0e0e0;
  box-shadow: none;
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F6F6F6;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  letter-spacing: -0.01em;
}

.actions-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* Prevent swipe navigation interference */
  touch-action: pan-x;
  overscroll-behavior-x: contain;
}

.actions-scroll::-webkit-scrollbar {
  display: none;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  min-width: 140px;
  flex-shrink: 0;
}

.action-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F6F6F6;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-content h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-content p {
  font-size: 0.8rem;
  color: #666;
  margin: 4px 0 0 0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.bookings-section,
.news-section {
  background: #F6F6F6;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .hero-content h1 {
    line-height: normal;
  }

  .project-switcher-btn {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {

  .hero-section {
    padding: 20px;
    border-radius: 16px;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
  }

  .stats-overview {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .actions-scroll {
    gap: 10px;
    padding: 2px 0 6px 0;
  }

  .action-card {
    padding: 14px;
    min-width: 100px;
  }

  .action-icon {
    width: 36px;
    height: 36px;
  }

  .action-content h3 {
    font-size: 0.85rem;
  }

  .action-content p {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 16px;
    border-radius: 12px;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .actions-scroll {
    gap: 8px;
    padding: 2px 0 4px 0;
  }

  .action-card {
    padding: 12px;
    min-width: 100px;
  }

  .action-icon {
    width: 32px;
    height: 32px;
  }

  .action-content h3 {
    font-size: 0.8rem;
  }

  .action-content p {
    font-size: 0.7rem;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: #F6F6F6;
  border-radius: 24px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.project-switcher-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #64748b;
}

.modal-body {
  margin-bottom: 28px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-option.current {
  background: #fff5f2;
  border-color: #AF1E23;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
}

.project-option-info {
  flex: 1;
}

.project-option-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
  letter-spacing: -0.01em;
}

.project-option-location {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0 0 12px 0;
}

.project-option-details {
  display: flex;
  gap: 12px;
}

.project-option-unit,
.project-option-role {
  font-size: 0.85rem;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
}

.project-option-unit {
  background: #dbeafe;
  color: #1e40af;
}

.project-option-role {
  background: #e0e7ff;
  color: #3730a3;
}

.project-option-status {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
}

.current-badge {
  background: #AF1E23;
  color: #F6F6F6;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
}

.project-option-status svg {
  color: #AF1E23;
}

.no-projects {
  text-align: center;
  padding: 48px 20px;
  color: #64748b;
}

.no-projects p {
  margin: 0 0 24px 0;
  font-size: 1.1rem;
}

.go-to-selection-btn {
  background: #AF1E23;
  color: #F6F6F6;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
}

.modal-footer {
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}
</style>
