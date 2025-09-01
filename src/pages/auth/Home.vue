<template>
  <div class="home-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Welcome back, {{ user?.displayName?.split(' ')[0] || 'User' }}</h1>
        </div>
        <div class="hero-actions">
          <button class="project-switcher-btn" @click="showProjectSwitcher = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Switch Project
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-section">
      <div class="stat-card clickable" :class="{ 'loading': isStatsLoading }" @click="navigateToCalendar">
        <div class="stat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ isStatsLoading ? '...' : upcomingEventsCount }}</span>
          <span class="stat-label">Upcoming Events</span>
        </div>
      </div>
      
      <div class="stat-card clickable" :class="{ 'loading': isStatsLoading }" @click="navigateToMyBookings">
        <div class="stat-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ isStatsLoading ? '...' : activeBookingsCount }}</span>
          <span class="stat-label">Upcoming Bookings</span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="main-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Quick Actions -->
        <div class="quick-actions-card">
          <div class="card-header">
            <h2>Quick Actions</h2>
            <p>Access your most used features</p>
          </div>
          <div class="actions-list">
            <button class="action-item" @click="navigateToServices">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Book Services</span>
                <span class="action-subtitle">Schedule court time & programs</span>
              </div>
              <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <button class="action-item" @click="navigateToMyBookings">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">My Bookings</span>
                <span class="action-subtitle">View & manage reservations</span>
              </div>
              <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <button class="action-item" @click="navigateToCalendar">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Full Calendar</span>
                <span class="action-subtitle">Browse all available slots</span>
              </div>
              <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>


          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Upcoming Bookings -->
        <div class="upcoming-bookings-card">
          <UpcomingBookingsCard />
        </div>

        <!-- News Feed -->
        <div class="news-feed-card">
          <div class="card-header">
            <h2>Community Updates</h2>
            <div class="filter-tabs">
              <button 
                @click="activeTab = 'all'" 
                :class="['filter-tab', { active: activeTab === 'all' }]"
              >
                All
              </button>
              <button 
                @click="activeTab = 'emergency'" 
                :class="['filter-tab', { active: activeTab === 'emergency' }]"
              >
                Emergency
              </button>
            </div>
          </div>

          <div class="news-list">
            <!-- Loading State -->
            <div v-if="isLoadingNotifications" class="loading-state">
              <div class="loading-item" v-for="n in 3" :key="n">
                <div class="loading-icon"></div>
                <div class="loading-content">
                  <div class="loading-text"></div>
                  <div class="loading-timestamp"></div>
                </div>
              </div>
            </div>
            
            <!-- Notifications List -->
            <div v-else-if="filteredNews.length > 0">
              <div v-for="item in filteredNews" :key="item.id" class="news-item" :class="{ 'emergency': item.type === 'emergency' || item.priority === 'high' }">
                <div class="news-icon" :class="{ 'emergency': item.type === 'emergency' || item.priority === 'high' }">
                  <span v-if="item.type === 'emergency' || item.priority === 'high'" class="emergency-icon">!</span>
                  <span v-else class="pre-logo">P RE</span>
                </div>
                <div class="news-content">
                  <div class="news-title">{{ item.title || item.message }}</div>
                  <div v-if="item.title && item.message" class="news-text">{{ item.message }}</div>
                  <div class="news-timestamp">{{ formatTimestamp(item.createdAt) }}</div>
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-else class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="empty-text">No {{ activeTab === 'emergency' ? 'emergency' : '' }} notifications yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Project Switcher Modal -->
    <div v-if="showProjectSwitcher" class="modal-overlay" @click="showProjectSwitcher = false">
      <div class="modal-content project-switcher-modal" @click.stop>
        <div class="modal-header">
          <h3>Switch Project</h3>
          <button @click="showProjectSwitcher = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="userProjects.length > 0" class="projects-list">
            <div 
              v-for="project in userProjects" 
              :key="project.id"
              :class="['project-option', { 'current': project.id === currentProjectId }]"
              @click="switchToProject(project)"
            >
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
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Manage Projects
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useProjectStore } from '../../stores/projectStore'
import { useAcademiesStore } from '../../stores/academyStore'
import UpcomingBookingsCard from '../../components/UpcomingBookingsCard.vue'
import sampleDataService from '../../services/sampleDataService.js'
import notificationService from '../../services/notificationService.js'

// Component name for ESLint
defineOptions({
  name: 'HomePage'
})

const router = useRouter()
const projectStore = useProjectStore()
const academiesStore = useAcademiesStore()
const user = ref(null)
const activeTab = ref('all')
const showProjectSwitcher = ref(false)
const notifications = ref([])
const isLoadingNotifications = ref(false)
const userProjects = computed(() => projectStore.userProjects)
const currentProjectId = computed(() => projectStore.selectedProject?.id)

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

const activeBookingsCount = computed(() => {
  if (!academiesStore.userBookings || academiesStore.userBookings.length === 0) return 0
  
  try {
    const activeBookings = academiesStore.userBookings.filter(booking => {
      return booking.status === 'confirmed' || booking.status === 'enrolled'
    })
    
    return activeBookings.length
  } catch (error) {
    console.error('Error calculating active bookings:', error)
    return 0
  }
})

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

const filteredNews = computed(() => {
  if (activeTab.value === 'emergency') {
    return notifications.value.filter(item => item.type === 'emergency' || item.priority === 'high')
  }
  return notifications.value
})

// Navigation methods
const navigateToServices = () => {
  router.push('/services')
}

const navigateToMyBookings = () => {
  router.push('/my-bookings')
}

const navigateToCalendar = () => {
  router.push('/calendar')
}

// Format timestamp for display
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Just now'
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Recently'
  }
}

// Project switching methods
const switchToProject = async (project) => {
  try {
    projectStore.selectProject(project)
    showProjectSwitcher.value = false
    
    // Show success message
    // You can add a notification system here if you have one
    
    // Refresh the page to show new project data
    setTimeout(() => {
      window.location.reload()
    }, 500)
    
  } catch (err) {
    console.error('Error switching project:', err)
  }
}

const goToProjectSelection = () => {
  showProjectSwitcher.value = false
  router.push('/project-selection')
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
      
      // Initialize sample data for testing
      try {
        if (projectStore.selectedProject?.id) {
          await sampleDataService.initializeAllSampleData(projectStore.selectedProject.id)
        }
      } catch (error) {
        console.error('Error initializing sample data:', error)
      }
      
      // Fetch notifications
      await fetchNotifications()
    }
  })
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fafafa;
}

.hero-section {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.25);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 1;
}

.hero-text {
  display: flex;
  flex-direction: column;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.project-switcher-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #ff6b35;
  border: 2px solid white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.project-switcher-btn:hover {
  background: #fff5f2;
  border-color: #fff5f2;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-card.loading {
  opacity: 0.7;
  pointer-events: none;
  background: #f0f0f0;
  border-color: #e0e0e0;
  box-shadow: none;
}

.stat-card.loading .stat-number {
  color: #999;
}

.stat-card:not(.loading) .stat-number {
  color: #333;
}

.stat-card:not(.loading) .stat-number:empty::before {
  content: "0";
}

.stat-card.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card.clickable:hover {
  border-color: #ff6b35;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.15);
  transform: translateY(-2px);
}

.stat-card.clickable:active {
  transform: translateY(0);
}

.stat-card.loading.clickable {
  cursor: not-allowed;
  pointer-events: none;
}

.stat-card.loading.clickable:hover {
  border-color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: none;
}

.stat-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.quick-actions-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.card-header p {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 400;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fafafa;
  border: 2px solid #f0f0f0;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.action-item:hover {
  background: white;
  border-color: #ff6b35;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
}

.action-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  letter-spacing: -0.2px;
}

.action-subtitle {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.action-arrow {
  flex-shrink: 0;
  color: #ff6b35;
}

.calendar-widget {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.upcoming-bookings-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.news-feed-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.news-section {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.news-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-card {
  display: flex;
  gap: 20px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.news-card:hover {
  background: white;
  border-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.news-icon {
  flex-shrink: 0;
}

.pre-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.news-content {
  flex: 1;
}

.news-text {
  color: #333;
  font-size: 0.9rem;
  line-height: 1.5;
  font-weight: 400;
  margin-bottom: 6px;
}

.news-timestamp {
  color: #888;
  font-size: 0.8rem;
  font-weight: 500;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .hero-actions {
    width: 100%;
  }
  
  .project-switcher-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 20px 16px;
  }
  
  .hero-section {
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }

  .quick-actions-card,
  .calendar-widget,
  .upcoming-bookings-card,
  .news-feed-card {
    padding: 24px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .filter-tabs {
    width: 100%;
  }
  
  .filter-tab {
    flex: 1;
    text-align: center;
  }
  
  .actions-list {
    grid-template-columns: 1fr;
  }
  
  .action-item {
    padding: 20px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }
  
  .action-icon {
    width: 56px;
    height: 56px;
  }
  
  .action-details {
    text-align: center;
  }
  
  .action-title {
    font-size: 1.1rem;
  }
  
  .action-subtitle {
    font-size: 0.85rem;
  }
  
  .news-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .news-icon {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 16px 12px;
  }
  
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
  
  .quick-actions-card,
  .calendar-widget,
  .upcoming-bookings-card,
  .news-feed-card {
    padding: 20px;
    border-radius: 16px;
  }
  
  .action-item {
    padding: 20px;
  }
  
  .action-icon {
    width: 48px;
    height: 48px;
  }
  
  .action-title {
    font-size: 1rem;
  }
  
  .action-subtitle {
    font-size: 0.8rem;
  }
  
  .news-card {
    padding: 16px;
  }
  
  .pre-logo {
    width: 48px;
    height: 48px;
    font-size: 0.8rem;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  color: #666;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
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
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-option:hover {
  background: white;
  border-color: #ff6b35;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.15);
  transform: translateY(-2px);
}

.project-option.current {
  background: #fff5f2;
  border-color: #ff6b35;
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.2);
}

.project-option-info {
  flex: 1;
}

.project-option-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 6px 0;
  letter-spacing: -0.2px;
}

.project-option-location {
  color: #666;
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
  background: #e3f2fd;
  color: #1565c0;
}

.project-option-role {
  background: #f3e5f5;
  color: #7b1fa2;
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
  background: #ff6b35;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
}

.project-option-status svg {
  color: #ff6b35;
}

.no-projects {
  text-align: center;
  padding: 48px 20px;
  color: #666;
}

.no-projects p {
  margin: 0 0 24px 0;
  font-size: 1.1rem;
}

.go-to-selection-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
}

.go-to-selection-btn:hover {
  background: #e55a2b;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
}

.modal-footer {
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fafafa;
  color: #666;
  border: 2px solid #f0f0f0;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: #fff5f2;
  border-color: #ff6b35;
  color: #ff6b35;
  transform: translateY(-2px);
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  background: none;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
  font-size: 0.8rem;
}

.filter-tab:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.filter-tab.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.news-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.news-item:hover {
  background: white;
  border-color: #e0e0e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.news-icon {
  flex-shrink: 0;
}

.pre-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.news-content {
  flex: 1;
}

.news-text {
  color: #333;
  font-size: 0.9rem;
  line-height: 1.5;
  font-weight: 400;
  margin-bottom: 6px;
}

.news-timestamp {
  color: #888;
  font-size: 0.8rem;
  font-weight: 500;
}

.news-title {
  color: #333;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 4px;
  line-height: 1.4;
}

.news-item.emergency {
  border-color: #ff4444;
  background: #fff5f5;
}

.news-item.emergency:hover {
  border-color: #ff2222;
  background: #fff0f0;
}

.news-icon.emergency {
  background: linear-gradient(135deg, #ff4444 0%, #ff6666 100%);
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
}

.emergency-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff4444 0%, #ff6666 100%);
  color: white;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
}

/* Loading States */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
}

.loading-icon {
  width: 40px;
  height: 40px;
  background: #e0e0e0;
  border-radius: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-text {
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-timestamp {
  height: 12px;
  width: 80px;
  background: #e0e0e0;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  text-align: center;
  color: #666;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #f0f0f0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #999;
}

.empty-text {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
}
</style>
