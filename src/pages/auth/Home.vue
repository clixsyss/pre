<template>
  <div class="home-page">
    <!-- Content -->
    <div class="content">
      <!-- Enhanced Greeting Section -->
      <div class="greeting-section">
        <div class="greeting-content">
          <div class="greeting-text">
            <h1 class="greeting-title">Hello {{ user?.displayName?.split(' ')[0] || 'User' }}</h1>
          </div>
          <div class="greeting-actions">
            <button class="project-switcher-btn" @click="showProjectSwitcher = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Switch Project</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Enhanced Dashboard Grid -->
      <div class="dashboard-grid">
        <div class="dashboard-section">
          <HomeCalendar />
        </div>
        <div class="dashboard-section">
          <UpcomingBookingsCard />
        </div>
      </div>

      <!-- Enhanced Quick Actions -->
      <div class="quick-actions-section">
        <div class="section-header">
          <h2>Quick Actions</h2>
          <p>Access your most used features</p>
        </div>
        <div class="actions-grid">
          <button class="action-card" @click="navigateToServices">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-title">Book Services</span>
              <span class="action-description">Schedule court time & programs</span>
            </div>
          </button>
          
          <button class="action-card" @click="navigateToMyBookings">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-title">My Bookings</span>
              <span class="action-description">View & manage reservations</span>
            </div>
          </button>
          
          <button class="action-card" @click="navigateToCalendar">
            <div class="action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 2V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="action-content">
              <span class="action-title">Full Calendar</span>
              <span class="action-description">Browse all available slots</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Enhanced News Feed Section -->
      <div class="news-section">
        <div class="section-header">
          <div class="header-content">
            <h2>Community Updates</h2>
            <p>Stay informed about what's happening</p>
          </div>
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

        <div class="news-feed">
          <div v-for="item in filteredNews" :key="item.id" class="news-card">
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
    </div>

    <!-- Enhanced Project Switcher Modal -->
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
    if (projectStore.selectedProject?.id) {
      await sampleDataService.initializeAllSampleData(projectStore.selectedProject.id)
    }
  } catch (error) {
    console.error('Error initializing sample data:', error)
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fafafa;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.greeting-section {
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

.greeting-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.greeting-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 1;
}

.greeting-text {
  display: flex;
  flex-direction: column;
}

.greeting-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
}

.greeting-subtitle {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
}

.greeting-actions {
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

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.dashboard-section {
  min-height: 300px;
}

.quick-actions-section {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.header-content h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.header-content p {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 400;
}

.filter-tabs {
  display: flex;
  gap: 12px;
}

.filter-tab {
  background: none;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.filter-tab:hover {
  border-color: #ff6b35;
  color: #ff6b35;
  transform: translateY(-1px);
}

.filter-tab.active {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fafafa;
  border: 2px solid #f0f0f0;
  border-radius: 16px;
  padding: 28px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.action-card:hover {
  background: white;
  border-color: #ff6b35;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(255, 107, 53, 0.15);
}

.action-icon {
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

.action-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  letter-spacing: -0.2px;
}

.action-description {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
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
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  border-radius: 16px;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
}

.news-content {
  flex: 1;
}

.news-timestamp {
  color: #888;
  font-size: 0.875rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.news-text {
  color: #333;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 400;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .greeting-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .greeting-actions {
    width: 100%;
  }
  
  .project-switcher-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 20px 16px;
  }
  
  .greeting-section {
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .greeting-title {
    font-size: 2rem;
  }
  
  .greeting-subtitle {
    font-size: 1rem;
  }
  
  .quick-actions-section,
  .news-section {
    padding: 24px;
  }
  
  .section-header {
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
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    padding: 24px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }
  
  .action-icon {
    width: 56px;
    height: 56px;
  }
  
  .action-content {
    text-align: center;
  }
  
  .action-title {
    font-size: 1.1rem;
  }
  
  .action-description {
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
  .content {
    padding: 16px 12px;
  }
  
  .greeting-section {
    padding: 20px;
    border-radius: 16px;
  }
  
  .greeting-title {
    font-size: 1.75rem;
  }
  
  .greeting-subtitle {
    font-size: 0.9rem;
  }
  
  .quick-actions-section,
  .news-section {
    padding: 20px;
    border-radius: 16px;
  }
  
  .action-card {
    padding: 20px;
  }
  
  .action-icon {
    width: 48px;
    height: 48px;
  }
  
  .action-title {
    font-size: 1rem;
  }
  
  .action-description {
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
</style>
