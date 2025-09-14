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
        <div class="welcome-subtitle">Tap any project to get started</div>
      </div>

      <!-- Loading State -->
      <div v-if="projectStore.loading" class="loading-state">
        <div class="loading-animation">
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        <p class="loading-text">Loading your projects...</p>
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
        <!-- Skeleton Loading -->
        <div v-if="projectStore.loading" class="projects-grid">
          <div v-for="i in 3" :key="`skeleton-${i}`" class="project-card skeleton">
            <div class="skeleton-header">
              <div class="skeleton-icon"></div>
              <div class="skeleton-status"></div>
            </div>
            <div class="skeleton-content">
              <div class="skeleton-title"></div>
              <div class="skeleton-location"></div>
              <div class="skeleton-user-info">
                <div class="skeleton-unit"></div>
                <div class="skeleton-role"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actual Projects -->
        <transition-group name="project-list" tag="div" class="projects-grid">
          <div v-for="(project, index) in userProjects" :key="project.id" @click="selectProject(project)"
            :class="['project-card', { 'selected': selectedProject?.id === project.id }]"
            :style="{ '--delay': `${index * 0.1}s` }">
            <div class="project-header">
              <h3 class="project-name">{{ project.name || 'Unnamed Project' }}</h3>
            </div>

            <div class="project-content">
              <div class="user-info">
                <!-- location -->
                <div class="user-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                      stroke="currentColor" stroke-width="2" />
                  </svg>
                  {{ project.location || 'Location not set' }}
                </div>

                <div class="user-unit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                      stroke="currentColor" stroke-width="2" />
                  </svg>
                  Unit {{ project.userUnit || 'N/A' }}
                </div>
                <div class="user-role">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21"
                      stroke="currentColor" stroke-width="2" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                  </svg>
                  {{ project.userRole || 'Member' }}
                </div>
              </div>
            </div>

            <!-- Click indicator -->
            <div class="click-indicator">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </transition-group>


      </div>

      <!-- Help Section -->
      <div class="help-section">
        <h3>Need Help?</h3>
        <p>If you can't see your projects or need assistance, please contact support.</p>
        <button @click="goToSupport" class="help-btn">Get Help</button>
      </div>

      <!-- Back to Home Section (if user already has a project selected) -->
      <div v-if="selectedProject" class="back-home-section">
        <h3>Already have a project selected?</h3>
        <p>You're currently working with: <strong>{{ selectedProject.name }}</strong></p>
        <button @click="goToHome" class="back-home-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Continue with Current Project
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
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

const goToHome = () => {
  router.push('/home')
}

// Lifecycle
onMounted(async () => {
  // Listen for auth state changes
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Store current user data
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
      currentUser.value = null
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
  margin-bottom: 50px;
  color: #333;
  position: relative;
}

.welcome-icon {
  margin-bottom: 24px;
}

.icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #AF1E23, #AF1E23);
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(255, 107, 53, 0.3);
  animation: icon-float 3s ease-in-out infinite;
}

.icon-text {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.welcome-section h1 {
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #333, #555);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-section p {
  font-size: 1.25rem;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.welcome-subtitle {
  font-size: 0.95rem;
  color: #888;
  font-weight: 400;
  opacity: 0.8;
}

@keyframes icon-float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-8px);
  }
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-animation {
  margin-bottom: 20px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  background: #AF1E23;
  border-radius: 50%;
  animation: dot-bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes dot-bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
  animation: fade-in 0.5s ease-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  background: #AF1E23;
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
  background: #AF1E23;
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

/* Skeleton Loading */
.project-card.skeleton {
  pointer-events: none;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.skeleton-icon {
  width: 60px;
  height: 60px;
  background: #e1e5e9;
  border-radius: 16px;
}

.skeleton-status {
  width: 80px;
  height: 24px;
  background: #e1e5e9;
  border-radius: 20px;
}

.skeleton-content {
  margin-bottom: 20px;
}

.skeleton-title {
  width: 70%;
  height: 24px;
  background: #e1e5e9;
  border-radius: 4px;
  margin-bottom: 12px;
}

.skeleton-description {
  width: 90%;
  height: 16px;
  background: #e1e5e9;
  border-radius: 4px;
  margin-bottom: 20px;
}

.skeleton-location {
  width: 60%;
  height: 16px;
  background: #e1e5e9;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-user-info {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.skeleton-unit,
.skeleton-role {
  width: 80px;
  height: 32px;
  background: #e1e5e9;
  border-radius: 12px;
}

@keyframes skeleton-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.projects-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 40px;
}

.project-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 20px;
  padding: 28px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #AF1E23, #AF1E23);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.project-card:hover {
  border-color: transparent;
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.project-card:hover::before {
  transform: scaleX(1);
}

.project-card.selected {
  border-color: transparent;
  background: linear-gradient(135deg, #fff5f2, #fff);
  box-shadow: 0 16px 32px rgba(255, 107, 53, 0.15);
}

.project-card.selected::before {
  transform: scaleX(1);
}

/* Project Header */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.project-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #AF1E23, #AF1E23);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;
}

.project-card:hover .project-icon {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.project-logo {
  color: white;
  font-size: 1.6rem;
  font-weight: 800;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.project-status {
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.project-status.active {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.project-status.inactive,
.project-status.unknown,
.project-status.error {
  background: linear-gradient(135deg, #f44336, #ef5350);
  color: white;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

/* Project Content */
.project-content {
  margin-bottom: 20px;
}

.project-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 16px 0;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.project-card:hover .project-name {
  color: #AF1E23;
}

.project-description {
  color: #7f8c8d;
  margin: 0 0 24px 0;
  line-height: 1.7;
  font-size: 1.05rem;
  font-weight: 400;
}

.project-location {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.project-card:hover .project-location {
  background: #fff5f2;
  color: #AF1E23;
}

.project-location svg {
  color: #AF1E23;
  transition: transform 0.3s ease;
}

.project-card:hover .project-location svg {
  transform: scale(1.1);
}

/* User Info */
.user-info {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.user-unit,
.user-role,
.user-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  padding: 12px 16px;
  border-radius: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-unit {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1565c0;
}

.user-location {
  background: linear-gradient(135deg, #f6e3dc, #ffcfc0);
  color: #AF1E23;
}

.user-role {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  color: #7b1fa2;
}

.user-unit:hover,
.user-role:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.user-unit svg,
.user-role svg {
  color: currentColor;
  transition: transform 0.3s ease;
}

.user-unit:hover svg,
.user-role:hover svg {
  transform: scale(1.1);
}

/* Click Indicator */
.click-indicator {
  position: absolute;
  top: 24px;
  right: 24px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.click-indicator svg {
  color: #AF1E23;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.project-card:hover .click-indicator {
  opacity: 1;
  transform: scale(1.1);
}

/* Continue Section */
.continue-section {
  text-align: center;
  margin-bottom: 40px;
}

/* Transitions */
.project-list-enter-active,
.project-list-leave-active {
  transition: all 0.5s ease;
}

.project-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.project-list-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

.project-list-move {
  transition: transform 0.5s ease;
}

.fade-slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
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

.continue-btn {
  background: #AF1E23;
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
  background: #AF1E23;
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
  color: #AF1E23;
  border: 2px solid #AF1E23;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.help-btn:hover {
  background: #AF1E23;
  color: white;
}

/* Back to Home Section */
.back-home-section {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, #fff5f2, #fff);
  border-radius: 12px;
  border: 1px solid #AF1E23;
  margin-top: 20px;
}

.back-home-section h3 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 1.2rem;
}

.back-home-section p {
  color: #666;
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.back-home-section strong {
  color: #AF1E23;
  font-weight: 700;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  background: #AF1E23;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
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
