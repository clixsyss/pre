<template>
  <div class="home-page">
    <!-- Content -->
    <div class="content">
      <div class="greeting">
        <h2>Hello {{ user?.displayName?.split(' ')[0] || 'User' }}.</h2>
        <div class="project-info">
          <p class="project-name">Project: {{ projectName }}</p>
          <p class="project-location">{{ projectLocation }}</p>
          <div class="user-details">
            <span class="user-unit">Unit: {{ userUnit }}</span>
            <span class="user-role">Role: {{ userRole }}</span>
          </div>
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

// Computed properties
const projectName = computed(() => projectStore.selectedProject?.name || 'No Project Selected')
const projectLocation = computed(() => projectStore.selectedProject?.location || 'Location not set')
const userUnit = computed(() => projectStore.selectedProject?.userUnit || 'N/A')
const userRole = computed(() => projectStore.selectedProject?.userRole || 'Member')

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
</style>
