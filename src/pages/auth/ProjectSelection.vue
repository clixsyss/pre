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
        <h1>Welcome Back, {{ userDisplayName }}!</h1>
        <p>Select your project to continue</p>
      </div>
      <!-- Loading State -->
      <div v-if="projectStore.loading" class="loading-container">
        <div class="loading-card">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <h3>Loading Projects</h3>
          <p>Please wait while we fetch your projects...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="projectStore.error" class="error-container">
        <div class="error-card">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>Oops! Something went wrong</h3>
          <p>{{ projectStore.error }}</p>
          <button @click="retryLoading" class="retry-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12A9 9 0 0 1 12 3A9 9 0 0 1 21 12A9 9 0 0 1 12 21A9 9 0 0 1 3 12Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 3V12L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Try Again
          </button>
        </div>
      </div>

      <!-- No Projects State -->
      <div v-else-if="userProjects.length === 0" class="no-projects-container">
        <div class="no-projects-card">
          <div class="no-projects-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>No Projects Available</h3>
          <p>You don't have access to any projects yet. Please contact your administrator to get started.</p>
          <button @click="goToSupport" class="support-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Contact Support
          </button>
        </div>
      </div>

      <!-- Projects Grid -->
      <div v-else class="projects-section">
        <div class="projects-grid">
          <transition-group name="project-card" tag="div" class="projects-list">
            <div 
              v-for="(project, index) in userProjects" 
              :key="project.id" 
              @click="selectProject(project)"
              :class="['project-card', { 'selected': selectedProject?.id === project.id }]"
              :style="{ '--delay': `${index * 0.1}s` }"
            >
              <div class="project-header">
                <div class="project-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h3 class="project-name">{{ project.name || 'Unnamed Project' }}</h3>
               
              </div>

              <div class="project-content">
                
                <div class="project-details">
                  <div class="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <span>{{ project.location || 'Location not set' }}</span>
                  </div>
                  <div class="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>Unit {{ project.userUnit || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>{{ project.userRole || 'Member' }}</span>
                  </div>
                </div>
              </div>

              <div class="project-action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- Help Section -->
      <div class="help-section">
        <div class="help-card">
          <div class="help-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="help-content">
            <h3>Need Help?</h3>
            <p>Can't find your project or need assistance? Our support team is here to help.</p>
            <button @click="goToSupport" class="help-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 3H20C21.1046 3 22 3.89543 22 5V16C22 17.1046 21.1046 18 20 18H4C2.89543 18 2 17.1046 2 16V5C2 3.89543 2.89543 3 4 3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 8H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 12H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Get Support
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../../stores/projectStore'
import { auth } from '../../boot/firebase'
import optimizedAuthService from '../../services/optimizedAuthService'

// Component name for ESLint
defineOptions({
  name: 'ProjectSelection'
})

const router = useRouter()
const projectStore = useProjectStore()

// Reactive user data
const currentUser = ref(null)

// Computed properties
const userProjects = computed(() => projectStore.userProjects)
const selectedProject = computed(() => projectStore.selectedProject)

// Computed property for user's display name with fallbacks
const userDisplayName = computed(() => {
  if (!currentUser.value) return 'User'

  // Try different name sources in order of preference
  if (currentUser.value.displayName) {
    return currentUser.value.displayName.split(' ')[0] // First name only
  }

  if (currentUser.value.email) {
    // Extract name from email if available
    const emailName = currentUser.value.email.split('@')[0]
    return emailName.charAt(0).toUpperCase() + emailName.slice(1)
  }

  return 'User'
})

// Methods
const selectProject = async (project) => {
  projectStore.selectProject(project)

  // Add a small delay for smooth UX, then redirect
  setTimeout(() => {
    router.push('/home')
  }, 300)
}



const retryLoading = async () => {
  if (auth.currentUser) {
    await projectStore.fetchUserProjects(auth.currentUser.uid)
  }
}

const goToSupport = () => {
  router.push('/support')
}

// const goToHome = () => {
//   router.push('/home')
// }

// Lifecycle
onMounted(async () => {
  // Wait for auth state to be established - use optimized auth service instead of direct auth.currentUser
  try {
    const user = await optimizedAuthService.getCurrentUser()
    if (user) {
      currentUser.value = user

      // Fetch user projects from their saved data
      await projectStore.fetchUserProjects(user.uid)

      // Load previously selected project if any
      projectStore.loadSelectedProject()

      // Only auto-redirect if user has exactly one project AND no project is currently selected
      // This prevents auto-redirect when user intentionally comes back to project selection
      if (userProjects.value.length === 1 && !projectStore.selectedProject) {
        projectStore.selectProject(userProjects.value[0])
        // Small delay for smooth UX
        setTimeout(() => {
          router.push('/home')
        }, 500)
      }
    } else {
      // User not authenticated, redirect to sign in
      console.log('No authenticated user found in ProjectSelection component, redirecting to signin')
      currentUser.value = null
      router.push('/signin')
    }
  } catch (error) {
    console.error('Error getting current user in ProjectSelection component:', error)
    // On error, redirect to sign in as fallback
    currentUser.value = null
    router.push('/signin')
  }
})
</script>

<style scoped>
.project-selection-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Clean Header */
.clean-header {
  background: #2a2a2a;
  padding: 20px;
  padding-top: 60px;
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

/* Welcome Section */
.welcome-section {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  position: relative;
}

.welcome-section h1 {
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #333, #555);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: normal;
}

.welcome-section p {
  font-size: 1rem;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
  line-height: normal;
}

/* Content */
.content {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-width: 400px;
  width: 100%;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.spinner-ring {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-card h3 {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.loading-card p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

/* Error State */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-width: 400px;
  width: 100%;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 1.5rem;
}

.error-card h3 {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.error-card p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
}

.retry-button {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* .retry-button:hover {
  background: #8b161a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
} */

/* No Projects State */
.no-projects-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.no-projects-card {
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-width: 400px;
  width: 100%;
}

.no-projects-icon {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.no-projects-card h3 {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.no-projects-card p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.support-button {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* .support-button:hover {
  background: #8b161a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
} */

/* Projects Section */
.projects-section {
  margin-bottom: 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: #1e293b;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.section-header p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

/* Projects Grid */
.projects-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.projects-list {
  display: contents;
}

.project-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #AF1E23 0%, #d32f2f 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

/* .project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #AF1E23;
}

.project-card:hover::before {
  transform: scaleX(1);
} */

.project-card.selected {
  border-color: #AF1E23;
  background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
  box-shadow: 0 20px 40px rgba(175, 30, 35, 0.15);
}

.project-card.selected::before {
  transform: scaleX(1);
}

/* Project Header */
.project-header {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 20px;
}

.project-header h3 {
  margin: 0;
}

.project-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
  transition: all 0.3s ease;
}

/* .project-card:hover .project-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.4);
} */

.project-icon svg {
  color: white;
}

.project-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Project Content */
.project-content {
  flex: 1;
}

.project-name {
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.project-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.detail-item svg {
  color: #AF1E23;
  flex-shrink: 0;
}

/* Project Action */
.project-action {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  color: #cbd5e1;
  transition: all 0.3s ease;
}

/* .project-card:hover .project-action {
  color: #AF1E23;
  transform: translateX(4px);
} */

/* Help Section */
.help-section {
  margin-top: 3rem;
}

.help-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.help-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.help-icon svg {
  color: white;
}

.help-content {
  flex: 1;
}

.help-content h3 {
  color: #1e293b;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.help-content p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.help-button {
  background: transparent;
  color: #AF1E23;
  border: 2px solid #AF1E23;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* .help-button:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
} */

/* Transitions */
.project-card-enter-active,
.project-card-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.project-card-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.project-card-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Project card entrance animation */
.project-card {
  animation: slide-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--delay, 0s);
}

@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .content {
    padding: 1.5rem 1rem;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .help-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
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
    font-size: 1.5rem;
  }
  
  .project-card {
    padding: 1rem;
  }
  
  .help-card {
    padding: 1.5rem;
  }
}
</style>
