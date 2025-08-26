<template>
  <div class="home-page">
    <!-- Content -->
    <div class="content">
      <div class="greeting">
        <div class="greeting-header">
          <h2>Hello {{ user?.displayName?.split(' ')[0] || 'User' }}.</h2>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Calendar Section -->
        <div class="dashboard-section">
          <HomeCalendar />
        </div>

        <!-- Upcoming Bookings Section -->
        <div class="dashboard-section">
          <UpcomingBookingsCard />
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn" @click="navigateToServices">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>Book Services</span>
          </button>
          
          <button class="action-btn" @click="navigateToMyBookings">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <span>My Bookings</span>
          </button>
          
          <button class="action-btn" @click="navigateToCalendar">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <span>Full Calendar</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          @click="activeTab = 'all'" 
          :class="['tab-btn', { active: activeTab === 'all' }]"
        >
          ALL
        </button>
        <button 
          @click="activeTab = 'emergency'" 
          :class="['tab-btn', { active: activeTab === 'emergency' }]"
        >
          Emergency
        </button>
      </div>

      <!-- News Feed -->
      <div class="news-feed">
        <div v-for="item in filteredNews" :key="item.id" class="news-item">
          <div class="news-icon">
            <span class="pre-logo">P RE</span>
          </div>
          <div class="news-content">
            <div class="news-timestamp">{{ item.timestamp }}</div>
            <div class="news-text">{{ item.text }}</div>
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
import HomeCalendar from '../../components/HomeCalendar.vue'
import UpcomingBookingsCard from '../../components/UpcomingBookingsCard.vue'
import sampleDataService from '../../services/sampleDataService.js'

// Component name for ESLint
defineOptions({
  name: 'HomePage'
})

const router = useRouter()
const projectStore = useProjectStore()
const user = ref(null)
const activeTab = ref('all')
const showProjectSwitcher = ref(false)
const userProjects = computed(() => projectStore.userProjects)
const currentProjectId = computed(() => projectStore.selectedProject?.id)

// Sample news data
const newsItems = ref([
  {
    id: 1,
    type: 'community',
    text: 'Welcome to PRE Group! We\'re excited to have you as part of our community.',
    timestamp: '40 Minutes ago'
  },
  {
    id: 2,
    type: 'general',
    text: 'New community guidelines have been updated. Please review the latest policies.',
    timestamp: '2 Hours ago'
  },
  {
    id: 3,
    type: 'emergency',
    text: 'Emergency maintenance scheduled for tomorrow. Please be prepared for temporary service interruption.',
    timestamp: '1 Day ago'
  }
])

const filteredNews = computed(() => {
  if (activeTab.value === 'emergency') {
    return newsItems.value.filter(item => item.type === 'emergency')
  }
  return newsItems.value
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
  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      user.value = currentUser
    }
  })

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

  // Initialize sample data for testing
  try {
    await sampleDataService.initializeAllSampleData()
  } catch (error) {
    console.error('Error initializing sample data:', error)
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.greeting {
  margin-bottom: 32px;
}

.greeting-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.project-switcher {
  flex-shrink: 0;
}

.switch-project-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e1e5e9;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switch-project-btn:hover {
  background: #fff5f2;
  border-color: #ff6b35;
  color: #ff6b35;
  transform: translateY(-2px);
}

.greeting h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.greeting p {
  color: #666;
  font-size: 1.125rem;
  margin: 0;
}

.project-info {
  margin-top: 8px;
}

.project-name {
  color: #ff6b35;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.project-location {
  color: #888;
  font-size: 0.875rem;
  margin: 0;
}

.user-details {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.user-unit,
.user-role {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.user-unit {
  background: #e3f2fd;
  color: #1565c0;
}

.user-role {
  background: #f3e5f5;
  color: #7b1fa2;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.dashboard-section {
  min-height: 300px;
}

.quick-actions {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.quick-actions h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: #333;
}

.action-btn:hover {
  background: #fff5f2;
  border-color: #ff6b35;
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: #ff6b35;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.action-btn span {
  font-weight: 500;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.tab-btn {
  background: none;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
}

.tab-btn:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.tab-btn.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
}

.news-feed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.news-item {
  display: flex;
  gap: 16px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.news-icon {
  flex-shrink: 0;
}

.pre-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #ff6b35;
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.75rem;
}

.news-content {
  flex: 1;
}

.news-timestamp {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 8px;
}

.news-text {
  color: #333;
  font-size: 1rem;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .greeting h2 {
    font-size: 1.75rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 12px;
  }
  
  .greeting h2 {
    font-size: 1.5rem;
  }
  
  .quick-actions {
    padding: 20px;
  }
  
  .action-btn {
    padding: 16px;
  }
  
  .news-item {
    flex-direction: column;
    text-align: center;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.3);
}

.project-switcher-modal {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
}

.modal-body {
  margin-bottom: 24px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-option:hover {
  background: white;
  border-color: #ff6b35;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-option.current {
  background: #fff5f2;
  border-color: #ff6b35;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.15);
}

.project-option-info {
  flex: 1;
}

.project-option-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.project-option-location {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
}

.project-option-details {
  display: flex;
  gap: 12px;
}

.project-option-unit,
.project-option-role {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
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
  width: 40px;
  height: 40px;
}

.current-badge {
  background: #ff6b35;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.project-option-status svg {
  color: #ff6b35;
}

.no-projects {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-projects p {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
}

.go-to-selection-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.go-to-selection-btn:hover {
  background: #e55a2b;
  transform: translateY(-2px);
}

.modal-footer {
  padding-top: 16px;
  border-top: 1px solid #e1e5e9;
  text-align: center;
}

.secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e1e5e9;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: #fff5f2;
  border-color: #ff6b35;
  color: #ff6b35;
}
</style>
