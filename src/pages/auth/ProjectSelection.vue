<template>
  <div class="project-selection-page">
    <!-- Clean Header -->
    <div class="clean-header">
      <div class="logo">
        <img src="../../assets/logo.png" alt="PRE Group Logo" class="logo-image" />
      </div>
    </div>

    <div class="content">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-icon">🏠</div>
        <h1>Welcome Back!</h1>
        <p>Choose the project you want to work with today</p>
      </div>

      <!-- Loading State -->
      <div v-if="projectStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your projects...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="projectStore.error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error Loading Projects</h3>
        <p>{{ projectStore.error }}</p>
        <button @click="retryLoading" class="retry-btn">Try Again</button>
      </div>

      <!-- No Projects State -->
      <div v-else-if="userProjects.length === 0" class="no-projects-state">
        <div class="no-projects-icon">🏠</div>
        <h3>No Projects Available</h3>
        <p>You don't have access to any projects yet. Please contact your administrator.</p>
        <button @click="goToSupport" class="support-btn">Contact Support</button>
      </div>

      <!-- Projects Selection -->
      <div v-else class="projects-selection">
        <div class="projects-grid">
          <div 
            v-for="project in userProjects" 
            :key="project.id"
            @click="selectProject(project)"
            :class="['project-card', { 'selected': selectedProject?.id === project.id }]"
          >
            <div class="project-header">
              <div class="project-icon">
                <span class="project-logo">{{ project.name?.charAt(0) || 'P' }}</span>
              </div>
              <div class="project-status" :class="project.status">
                {{ project.status || 'active' }}
              </div>
            </div>
            
            <div class="project-content">
              <h3 class="project-name">{{ project.name || 'Unnamed Project' }}</h3>
              <p class="project-description">{{ project.description || 'No description available' }}</p>
              
              <div class="project-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ project.location || 'Location not set' }}
              </div>
              
              <div class="user-info">
                <div class="user-unit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Unit {{ project.userUnit || 'N/A' }}
                </div>
                <div class="user-role">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ project.userRole || 'Member' }}
                </div>
              </div>
            </div>
            
            <div class="selection-indicator">
              <div class="radio-button" :class="{ 'selected': projectStore.selectedProject?.id === project.id }">
                <div v-if="projectStore.selectedProject?.id === project.id" class="radio-inner"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Continue Button -->
        <div v-if="hasSelectedProject" class="continue-section">
          <button @click="continueToApp" class="continue-btn">
            <span>Continue to {{ selectedProject?.name || 'App' }}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <h3>Need Help?</h3>
        <p>If you can't see your projects or need assistance, please contact support.</p>
        <button @click="goToSupport" class="help-btn">Get Help</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../../stores/projectStore'
import { auth } from '../../boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Component name for ESLint
defineOptions({
  name: 'ProjectSelection'
})

const router = useRouter()
const projectStore = useProjectStore()

// Computed properties
const userProjects = computed(() => projectStore.userProjects)
const selectedProject = computed(() => projectStore.selectedProject)
const hasSelectedProject = computed(() => projectStore.hasSelectedProject)

// Methods
const selectProject = (project) => {
  projectStore.selectProject(project)
}

const continueToApp = () => {
  if (projectStore.hasSelectedProject) {
    router.push('/home')
  }
}

const retryLoading = async () => {
  if (auth.currentUser) {
    await projectStore.fetchUserProjects(auth.currentUser.uid)
  }
}

const goToSupport = () => {
  router.push('/support')
}

  // Lifecycle
  onMounted(async () => {
    console.log('ProjectSelection component mounted')
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User authenticated' : 'No user')
      
      if (user) {
        console.log('User authenticated, fetching projects for:', user.uid)
        
        // Fetch user projects from their saved data
        await projectStore.fetchUserProjects(user.uid)
        
        console.log('Projects fetched, count:', userProjects.value.length)
        console.log('Projects data:', userProjects.value)
        
        // Load previously selected project if any
        projectStore.loadSelectedProject()
        
        // If user has only one project, auto-select it
        if (userProjects.value.length === 1 && !hasSelectedProject.value) {
          console.log('Auto-selecting single project')
          projectStore.selectProject(userProjects.value[0])
        }
        
        // If no projects found, show appropriate message
        if (userProjects.value.length === 0) {
          console.log('No projects found for user')
        }
      } else {
        console.log('User not authenticated, redirecting to signin')
        // User not authenticated, redirect to sign in
        router.push('/signin')
      }
    })

    // Cleanup subscription
    return () => unsubscribe()
  })
</script>

<style scoped>
.project-selection-page {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

/* Clean Header */
.clean-header {
  background: #2a2a2a;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
}

.logo-image {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.content {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Welcome Section */
.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.welcome-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.welcome-section p {
  font-size: 1.125rem;
  color: #666;
  margin: 0;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e1e5e9;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-state h3 {
  color: #dc3545;
  margin: 0 0 16px 0;
}

.retry-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
}

/* No Projects State */
.no-projects-state {
  text-align: center;
  padding: 60px 20px;
}

.no-projects-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.support-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
}

/* Projects Selection */
.projects-selection {
  margin-bottom: 40px;
}

.projects-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 40px;
}

.project-card {
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.project-card:hover {
  border-color: #ff6b35;
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.project-card.selected {
  border-color: #ff6b35;
  background: #fff5f2;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.15);
}

/* Project Header */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.project-icon {
  width: 60px;
  height: 60px;
  background: #ff6b35;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-logo {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.project-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-status.active {
  background: #d4edda;
  color: #155724;
}

.project-status.inactive,
.project-status.unknown,
.project-status.error {
  background: #f8d7da;
  color: #721c24;
}

/* Project Content */
.project-content {
  margin-bottom: 20px;
}

.project-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.project-description {
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.6;
  font-size: 1rem;
}

.project-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.project-location svg {
  color: #ff6b35;
}

/* User Info */
.user-info {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.user-unit,
.user-role {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  padding: 8px 12px;
  border-radius: 12px;
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

.user-unit svg,
.user-role svg {
  color: currentColor;
}

/* Selection Indicator */
.selection-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
}

.radio-button {
  width: 24px;
  height: 24px;
  border: 2px solid #e1e5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.radio-button.selected {
  border-color: #ff6b35;
  background: #ff6b35;
}

.radio-inner {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
}

/* Continue Section */
.continue-section {
  text-align: center;
  margin-bottom: 40px;
}

.continue-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.continue-btn:hover {
  background: #e55a2b;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
}

/* Help Section */
.help-section {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e1e5e9;
}

.help-section h3 {
  color: #333;
  margin: 0 0 16px 0;
}

.help-section p {
  color: #666;
  margin: 0 0 20px 0;
}

.help-btn {
  background: transparent;
  color: #ff6b35;
  border: 2px solid #ff6b35;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.help-btn:hover {
  background: #ff6b35;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .project-meta {
    justify-content: center;
  }
  
  .welcome-section h1 {
    font-size: 2rem;
  }
  
  .logo-image {
    height: 50px;
  }
}

@media (max-width: 480px) {
  .logo-image {
    height: 45px;
  }
  
  .welcome-section h1 {
    font-size: 1.75rem;
  }
}
</style>
