<template>
  <div class="profile-page">

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading profile...</p>
    </div>

    <!-- Profile Content -->
    <div v-else-if="userProfile" class="profile-content">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-avatar">
          <div class="avatar-initial">
            {{ getInitials(userProfile.firstName, userProfile.lastName) }}
          </div>
        </div>
        <h2 class="profile-name">{{ getFullName(userProfile.firstName, userProfile.lastName) }}</h2>
        <p class="profile-email">{{ userProfile.email }}</p>
        <div class="profile-status">
          <span class="status-badge" :class="getStatusClass(userProfile.registrationStatus)">
            {{ formatStatus(userProfile.registrationStatus) }}
          </span>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="info-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Personal Information
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>First Name</label>
            <span>{{ userProfile.firstName || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Last Name</label>
            <span>{{ userProfile.lastName || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Mobile</label>
            <span>{{ userProfile.mobile || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Date of Birth</label>
            <span>{{ formatDate(userProfile.dateOfBirth) || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Gender</label>
            <span>{{ formatGender(userProfile.gender) || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>National ID</label>
            <span>{{ userProfile.nationalId || 'Not provided' }}</span>
          </div>
        </div>
      </div>

      <!-- Current Projects -->
      <div class="info-section">
        <div class="section-header">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            My Projects
          </h3>
          <button @click="showAddProjectModal = true" class="add-project-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Join Project
          </button>
        </div>
        
      <!-- Unified Project Management -->
      <div v-if="userProjects.length > 0" class="unified-projects-section">
        <div 
          v-for="project in userProjects" 
          :key="project.id"
          :class="['unified-project-card', { 'current': project.id === currentProjectId }]"
        >
          <!-- Project Header -->
          <div class="project-header">
            <div class="project-main-info">
              <div class="project-title-section">
                <h4 class="project-name">{{ project.name || 'Unnamed Project' }}</h4>
                <p class="project-location">{{ project.location || 'Location not set' }}</p>
              </div>
              <div class="project-status-badges">
                <span class="project-status" :class="project.status">{{ project.status || 'active' }}</span>
                <span v-if="project.id === currentProjectId" class="current-badge">Current</span>
              </div>
            </div>
            <div class="project-role-info">
              <span class="project-unit">Unit {{ project.userUnit || 'N/A' }}</span>
              <span class="project-role">{{ project.userRole || 'Member' }}</span>
            </div>
          </div>

          <!-- Smart Mirror Integration Section -->
          <div class="smart-mirror-section">
            <div class="smart-mirror-header">
              <div class="smart-mirror-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Smart Home</span>
              </div>
              <div class="smart-mirror-status">
                <span v-if="smartMirrorStore.isProjectConnected(project.id)" class="status-badge connected">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Connected
                </span>
                <span v-else class="status-badge disconnected">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Not Connected
                </span>
              </div>
            </div>

            <div v-if="smartMirrorStore.isProjectConnected(project.id)" class="smart-mirror-connected">
              <div class="device-summary">
                <span class="device-count">{{ getProjectDeviceCount(project.id) }} devices</span>
                <span class="device-types">Lights, Climate, Plugs</span>
                <div v-if="smartMirrorStore.needsReAuthentication(project.id)" class="reauth-indicator">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Stored data
                </div>
              </div>
              <div class="smart-mirror-actions">
                <button @click="goToDevices" class="control-devices-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Control Devices
                </button>
                <button @click="disconnectSmartMirror(project.id)" class="disconnect-btn" :disabled="disconnectingProject === project.id">
                  <svg v-if="disconnectingProject === project.id" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="spinning">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ disconnectingProject === project.id ? 'Disconnecting...' : 'Disconnect' }}
                </button>
              </div>
            </div>

            <div v-else class="smart-mirror-disconnected">
              <p class="disconnected-message">Connect your smart home devices to control them from this app!</p>
              <button @click="showLoginModal(project.id)" class="connect-smart-mirror-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Connect Smart Home
              </button>
            </div>
          </div>

          <!-- Project Actions -->
          <div class="project-actions">
            <button 
              v-if="project.id !== currentProjectId"
              @click="switchToProject(project)"
              class="switch-project-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3 17H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 3L4 7L8 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13L20 17L16 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Switch to Project
            </button>
          </div>
        </div>
      </div>
      
      <!-- No Projects State -->
      <div v-else class="no-projects">
        <div class="no-projects-icon">🏠</div>
        <p>You don't have any projects yet.</p>
        <button @click="showAddProjectModal = true" class="add-first-project-btn">
          Join Your First Project
        </button>
      </div>
    </div>

      <!-- Account Information -->
      <div class="info-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16V12" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8H12.01" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Account Information
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Email Verified</label>
            <span class="verification-status" :class="{ verified: userProfile.emailVerified, unverified: !userProfile.emailVerified }">
              {{ userProfile.emailVerified ? 'Yes' : 'No' }}
            </span>
          </div>
          <div class="info-item">
            <label>Registration Date</label>
            <span>{{ formatDate(userProfile.createdAt) || 'Not available' }}</span>
          </div>
          <div class="info-item">
            <label>Last Updated</label>
            <span>{{ formatDate(userProfile.updatedAt) || 'Not available' }}</span>
          </div>
          <div class="info-item">
            <label>Profile Complete</label>
            <span class="completion-status" :class="{ complete: userProfile.isProfileComplete, incomplete: !userProfile.isProfileComplete }">
              {{ userProfile.isProfileComplete ? 'Yes' : 'No' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Smart Home Settings - Only show if current project has Smart Mirror connection -->
      <div v-if="smartMirrorStore.isProjectConnected(currentProjectId)" class="info-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Smart Home Settings
        </h3>
        <div class="smart-home-settings">
          <div class="settings-description">
            <p>Manage which devices are displayed on your home page dashboard.</p>
          </div>
          
          <button @click="openDeviceManagementModal" class="manage-devices-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Manage Home Page Devices
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <button @click="editProfile" class="edit-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Edit Profile
        </button>
        
        <button @click="showLogoutConfirm = true" class="logout-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Logout
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
          <path d="M15 9L9 15M9 9L15 15" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>Failed to Load Profile</h3>
      <p>{{ error }}</p>
      <button @click="loadProfile" class="retry-btn">Try Again</button>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" class="modal-overlay" @click="showLogoutConfirm = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirm Logout</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to logout?</p>
          <p class="modal-subtitle">You'll need to sign in again to access your account.</p>
        </div>
        <div class="modal-actions">
          <button @click="showLogoutConfirm = false" class="cancel-btn">Cancel</button>
          <button @click="handleLogout" class="confirm-btn" :disabled="logoutLoading">
            <span v-if="logoutLoading">Logging out...</span>
            <span v-else>Logout</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Project Modal -->
    <div v-if="showAddProjectModal" class="modal-overlay" @click="showAddProjectModal = false">
      <div class="modal-content add-project-modal" @click.stop>
        <div class="modal-header">
          <h3>Join Existing Project</h3>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addNewProject" class="add-project-form">
            <div class="form-group">
              <label for="projectSelection">Select Project</label>
              <select 
                id="projectSelection"
                v-model="newProject.projectId" 
                required
                @change="onProjectChange"
                :disabled="loadingAvailableProjects"
              >
                <option value="">
                  {{ loadingAvailableProjects ? 'Loading projects...' : 'Choose a project to join' }}
                </option>
                <option 
                  v-for="project in availableProjects" 
                  :key="project.id" 
                  :value="project.id"
                >
                  {{ project.name }} - {{ project.location }}
                </option>
              </select>
              <div v-if="loadingAvailableProjects" class="loading-indicator">
                <div class="loading-dots">
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="userUnit">Your Unit</label>
              <input 
                id="userUnit"
                v-model="newProject.userUnit" 
                type="text" 
                placeholder="e.g., A1, B2, etc."
                required
              />
            </div>
            
            <div class="form-group">
              <label for="userRole">Your Role</label>
              <select id="userRole" v-model="newProject.userRole" required>
                <option value="">Select your role</option>
                <option value="owner">Owner</option>
                <option value="family">Family Member</option>
              </select>
            </div>
          </form>
        </div>
        <!-- Success State -->
        <div v-if="projectJoinSuccess" class="success-state">
          <div class="success-icon">✅</div>
          <h3>Successfully Joined Project!</h3>
          <p>You can now access your new project from the home page.</p>
        </div>
        
        <!-- Form Actions -->
        <div v-else class="modal-actions">
          <button @click="showAddProjectModal = false" class="cancel-btn">Cancel</button>
          <button @click="addNewProject" class="confirm-btn" :disabled="addProjectLoading || !newProject.projectId">
            <span v-if="addProjectLoading">Joining Project...</span>
            <span v-else>Join Project</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Smart Mirror Login Modal -->
    <Teleport to="body">
      <div v-if="showLoginModalFlag" class="modal-overlay" @click="closeLoginModal">
        <div class="modal-content" @click.stop>
          <!-- Modal Header with Icon -->
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="header-text">
                <h3>Connect Smart Home Account</h3>
                <p>Link your smart home devices to {{ userProjects.find(p => p.id === selectedProjectId)?.name || 'this project' }}</p>
              </div>
            </div>
            <button class="close-btn" @click="closeLoginModal" :disabled="smartMirrorStore.isConnecting">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <!-- Project Selection Card -->
          <div class="project-selection-card">
            <div class="project-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 22V12H15V22" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="project-details">
              <h4>{{ userProjects.find(p => p.id === selectedProjectId)?.name || 'Selected Project' }}</h4>
              <p>{{ userProjects.find(p => p.id === selectedProjectId)?.location || 'Location not set' }}</p>
              <div v-if="smartMirrorStore.isProjectConnected(selectedProjectId)" class="existing-connection">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Already connected to a different account</span>
              </div>
            </div>
          </div>
          
          <!-- Login Form -->
          <div class="modal-body">
            <form @submit.prevent="handleLogin" class="login-form">
              <div class="form-group">
                <label for="email">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Email Address
                </label>
                <div class="input-wrapper">
                  <input 
                    id="email"
                    v-model="loginForm.email" 
                    type="email" 
                    placeholder="Enter your Smart Mirror email"
                    required
                    :disabled="smartMirrorStore.isConnecting"
                    autocomplete="email"
                  />
                  <div class="input-focus-indicator"></div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="password">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Password
                </label>
                <div class="input-wrapper">
                  <input 
                    id="password"
                    v-model="loginForm.password" 
                    type="password" 
                    placeholder="Enter your Smart Mirror password"
                    required
                    :disabled="smartMirrorStore.isConnecting"
                    autocomplete="current-password"
                  />
                  <div class="input-focus-indicator"></div>
                </div>
              </div>
              
              <div v-if="smartMirrorStore.connectionError" class="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ smartMirrorStore.connectionError }}
              </div>
            </form>
          </div>
          
          <!-- Modal Footer -->
          <div class="modal-footer">
            <button 
              @click="closeLoginModal" 
              class="cancel-btn" 
              :disabled="smartMirrorStore.isConnecting"
              type="button"
            >
              Cancel
            </button>
            <button 
              @click="handleLogin" 
              class="connect-btn" 
              :disabled="smartMirrorStore.isConnecting || !loginForm.email || !loginForm.password"
              type="submit"
            >
              <svg v-if="smartMirrorStore.isConnecting" class="loading-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                  <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                  <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                </circle>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12A10 10 0 1 1 5.93 5.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-if="smartMirrorStore.isConnecting">Connecting...</span>
              <span v-else>Connect Account</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Device Management Modal -->
    <Teleport to="body">
      <div v-if="showDeviceManagementModal" class="modal-overlay" @click="closeDeviceManagementModal">
        <div class="modal-content device-management-modal" @click.stop>
          <div class="modal-header">
            <h3>Manage Home Page Devices</h3>
            <p>Select which devices to display on your home page dashboard</p>
          </div>
          
          <div class="modal-body">
            <!-- Device Categories -->
            <div class="device-categories">
              <!-- Dynamic Device Categories -->
              <div 
                v-for="(categoryDevices, categoryType) in filteredGroupedDevices" 
                :key="categoryType"
                class="device-category"
              >
                <div class="category-header">
                  <div :class="['category-icon', categoryType]">
                    <svg :width="20" :height="20" :viewBox="getCategoryIcon(categoryType).viewBox" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path v-for="(path, index) in getCategoryIcon(categoryType).paths" :key="index" :d="path.d" :stroke="path.stroke || 'currentColor'" :stroke-width="path.strokeWidth || '2'" :stroke-linecap="path.strokeLinecap || 'round'" :stroke-linejoin="path.strokeLinejoin || 'round'" :fill="path.fill"/>
                    </svg>
                  </div>
                  <div class="category-info">
                    <h4>{{ getCategoryName(categoryType) }}</h4>
                    <span class="device-count">{{ categoryDevices.length }} devices</span>
                  </div>
                </div>
                <div class="device-list">
                  <div 
                    v-for="device in categoryDevices" 
                    :key="device.id"
                    class="device-item"
                  >
                    <div class="device-info">
                      <div class="device-name">{{ device.name }}</div>
                      <div class="device-room">{{ device.roomName || 'Unknown Room' }}</div>
                      <div class="device-type">{{ device.type }}</div>
                    </div>
                    <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          :checked="selectedDevices[categoryType] && selectedDevices[categoryType].includes(device.id)"
                          @change="toggleDevice(categoryType, device.id, $event.target.checked)"
                        >
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Devices Message -->
            <div v-if="totalDevices === 0" class="no-devices-message">
              <div class="no-devices-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h4>No Devices Available</h4>
              <p>No smart home devices are currently connected to this project.</p>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeDeviceManagementModal" class="cancel-btn">Cancel</button>
            <button @click="saveDeviceSettings" class="save-btn" :disabled="savingSettings">
              <svg v-if="savingSettings" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="spinning">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ savingSettings ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../../boot/firebase'
import { getUserDocument } from '../../utils/firestore'
import { useNotificationStore } from '../../stores/notifications'
import { useProjectStore } from '../../stores/projectStore'
import { useSmartMirrorStore } from '../../stores/smartMirrorStore'
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../../boot/firebase'

// Component name for ESLint
defineOptions({
  name: 'ProfilePage'
})

const router = useRouter()
const notificationStore = useNotificationStore()
const projectStore = useProjectStore()
const smartMirrorStore = useSmartMirrorStore()

// Reactive state
const loading = ref(true)
const error = ref(null)
const userProfile = ref(null)
const showLogoutConfirm = ref(false)
const logoutLoading = ref(false)
const showAddProjectModal = ref(false)
const addProjectLoading = ref(false)
const projectJoinSuccess = ref(false)

// New project form data
const newProject = ref({
  projectId: '',
  userUnit: '',
  userRole: ''
})

// Available projects from Firestore
const availableProjects = ref([])
const loadingAvailableProjects = ref(false)

// Smart Mirror modal state
const showLoginModalFlag = ref(false)
const selectedProjectId = ref(null)
const loginForm = ref({
  email: '',
  password: ''
})

// Device settings state
const showDeviceManagementModal = ref(false)
const selectedDevices = ref({
  lights: [],
  climate: [],
  plugs: []
})
const savingSettings = ref(false)

// Smart Mirror disconnect state
const disconnectingProject = ref(null)

// Computed properties
const userProjects = computed(() => projectStore.userProjects)
const currentProjectId = computed(() => projectStore.selectedProject?.id)

// Total devices count
const totalDevices = computed(() => {
  return smartMirrorStore.devices.length
})

// Group devices by type dynamically
const groupedDevices = computed(() => {
  const groups = {}
  smartMirrorStore.devices.forEach(device => {
    const categoryType = getDeviceCategory(device.type)
    if (!groups[categoryType]) {
      groups[categoryType] = []
    }
    groups[categoryType].push(device)
  })
  return groups
})

// Filtered grouped devices (only categories with devices)
const filteredGroupedDevices = computed(() => {
  const filtered = {}
  Object.entries(groupedDevices.value).forEach(([categoryType, devices]) => {
    if (devices.length > 0) {
      filtered[categoryType] = devices
    }
  })
  return filtered
})

// Load user profile from Firestore
const loadProfile = async () => {
  if (!auth.currentUser) {
    error.value = 'No authenticated user found'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null
    
    const profile = await getUserDocument(auth.currentUser.uid)
    if (profile) {
      userProfile.value = profile
      
      // Also load user projects and available projects
      await projectStore.fetchUserProjects(auth.currentUser.uid)
      await fetchAvailableProjects()
    } else {
      error.value = 'Profile not found'
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    error.value = 'Failed to load profile. Please try again.'
  } finally {
    loading.value = false
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    logoutLoading.value = true
    
    await signOut(auth)
    
    notificationStore.showSuccess('Logged out successfully')
    
    // Redirect to login/register page
    router.push('/onboarding')
  } catch (err) {
    console.error('Logout error:', err)
    notificationStore.showError('Failed to logout. Please try again.')
  } finally {
    logoutLoading.value = false
    showLogoutConfirm.value = false
  }
}

// Edit profile (placeholder for future implementation)
const editProfile = () => {
  notificationStore.showInfo('Edit profile functionality coming soon!')
}

// Project management methods
const fetchAvailableProjects = async () => {
  try {
    loadingAvailableProjects.value = true
    const projectsRef = collection(db, 'projects')
    const snapshot = await getDocs(projectsRef)
    
    availableProjects.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error fetching available projects:', err)
    notificationStore.showError('Failed to load available projects')
  } finally {
    loadingAvailableProjects.value = false
  }
}

const addNewProject = async () => {
  if (!auth.currentUser) {
    notificationStore.showError('You must be logged in to join a project')
    return
  }

  if (!newProject.value.projectId || !newProject.value.userUnit || !newProject.value.userRole) {
    notificationStore.showError('Please fill in all required fields')
    return
  }

  try {
    addProjectLoading.value = true
    
    // Get the selected project details
    const selectedProject = availableProjects.value.find(p => p.id === newProject.value.projectId)
    
    if (!selectedProject) {
      notificationStore.showError('Selected project not found')
      return
    }

    // Update the user's document in Firestore to add the new project
    const userRef = doc(db, 'users', auth.currentUser.uid)
    
    // Create the project object to add to the user's projects array
    const newUserProject = {
      projectId: newProject.value.projectId,
      role: newProject.value.userRole,
      unit: newProject.value.userUnit,
      updatedAt: new Date()
    }
    
    // Add the new project to the user's projects array
    await updateDoc(userRef, {
      projects: arrayUnion(newUserProject)
    })
    
    notificationStore.showSuccess(`Successfully joined ${selectedProject.name}!`)
    
    // Show success state briefly before closing
    projectJoinSuccess.value = true
    setTimeout(() => {
      projectJoinSuccess.value = false
      showAddProjectModal.value = false
      resetNewProjectForm()
    }, 1500)
    
    // Refresh user's projects
    await projectStore.fetchUserProjects(auth.currentUser.uid)
    
  } catch (err) {
    console.error('Error joining project:', err)
    notificationStore.showError('Failed to join project. Please try again.')
  } finally {
    addProjectLoading.value = false
  }
}

const resetNewProjectForm = () => {
  newProject.value = {
    projectId: '',
    userUnit: '',
    userRole: ''
  }
}

const onProjectChange = () => {
  // Reset unit and role when project changes
  newProject.value.userUnit = ''
  newProject.value.userRole = ''
}

const switchToProject = async (project) => {
  try {
    projectStore.selectProject(project)
    
    // Check if we need to re-authenticate for a different smart home account
    if (smartMirrorStore.needsReAuthentication(project.id)) {
      // Show login modal for this project
      showLoginModal(project.id)
      return
    }
    
    // Switch Smart Mirror data to the new project
    await smartMirrorStore.switchToProject(project.id)
    
    notificationStore.showSuccess(`Switched to ${project.name}`)
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push('/home')
    }, 1000)
    
  } catch (err) {
    console.error('Error switching project:', err)
    notificationStore.showError('Failed to switch project. Please try again.')
  }
}

// Smart Mirror related methods
const getProjectDeviceCount = (projectId) => {
  const status = smartMirrorStore.getProjectConnectionStatus(projectId)
  return status.devicesCount
}

const goToDevices = () => {
  router.push('/smart-devices')
}

const showLoginModal = (projectId) => {
  selectedProjectId.value = projectId
  showLoginModalFlag.value = true
  loginForm.value.email = ''
  loginForm.value.password = ''
  smartMirrorStore.clearError()
}

const closeLoginModal = () => {
  showLoginModalFlag.value = false
  selectedProjectId.value = null
  loginForm.value.email = ''
  loginForm.value.password = ''
  smartMirrorStore.clearError()
}

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password || !selectedProjectId.value) {
    notificationStore.showError('Please enter both email and password')
    return
  }

  const result = await smartMirrorStore.connect(loginForm.value.email, loginForm.value.password, selectedProjectId.value)
  
  if (result.success) {
    const project = userProjects.value.find(p => p.id === selectedProjectId.value)
    notificationStore.showSuccess(`Successfully connected Smart Mirror to ${project?.name}!`)
    closeLoginModal()
  } else {
    notificationStore.showError(result.error || 'Failed to connect to Smart Mirror')
  }
}

const disconnectSmartMirror = async (projectId) => {
  try {
    disconnectingProject.value = projectId
    
    const result = await smartMirrorStore.disconnect(projectId)
    
    if (result.success) {
      const project = userProjects.value.find(p => p.id === projectId)
      notificationStore.showSuccess(`Successfully disconnected Smart Mirror from ${project?.name}`)
    } else {
      notificationStore.showError(result.error || 'Failed to disconnect from Smart Mirror')
    }
  } catch (error) {
    console.error('Error disconnecting Smart Mirror:', error)
    notificationStore.showError('Failed to disconnect from Smart Mirror. Please try again.')
  } finally {
    disconnectingProject.value = null
  }
}

// Utility functions
const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last || 'U'
}

const getFullName = (firstName, lastName) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  } else if (firstName) {
    return firstName
  } else if (lastName) {
    return lastName
  }
  return 'User'
}

const formatStatus = (status) => {
  if (!status) return 'Unknown'
  
  const statusMap = {
    'pending': 'Pending',
    'completed': 'Completed',
    'verified': 'Verified'
  }
  
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  if (!status) return 'status-unknown'
  
  const classMap = {
    'pending': 'status-pending',
    'completed': 'status-completed',
    'verified': 'status-verified'
  }
  
  return classMap[status] || 'status-unknown'
}

const formatDate = (date) => {
  if (!date) return null
  
  try {
    if (date.toDate) {
      // Firestore timestamp
      return date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else if (typeof date === 'string') {
      // String date
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  } catch (err) {
    console.warn('Error formatting date:', err)
  }
  
  return date
}

const formatGender = (gender) => {
  if (!gender) return null
  
  const genderMap = {
    'male': 'Male',
    'female': 'Female',
    'other': 'Other'
  }
  
  return genderMap[gender] || gender
}

// Device management methods
const getDeviceCategory = (deviceType) => {
  const categoryMap = {
    'light': 'lights',
    'thermostat': 'climate',
    'climate': 'climate',
    'fan': 'climate', // Map fans to climate for home page display
    'heater': 'climate',
    'ac': 'climate',
    'air_conditioner': 'climate',
    'air-conditioner': 'climate',
    'plug': 'plugs',
    'outlet': 'plugs',
    'switch': 'plugs', // Map switches to plugs for home page display
    'sensor': 'plugs', // Map sensors to plugs for home page display
    'camera': 'plugs', // Map cameras to plugs for home page display
    'door': 'plugs', // Map doors to plugs for home page display
    'window': 'plugs' // Map windows to plugs for home page display
  }
  return categoryMap[deviceType] || 'plugs' // Default to plugs instead of other
}

const getCategoryName = (categoryType) => {
  const nameMap = {
    'lights': 'Lights',
    'climate': 'Climate Control',
    'plugs': 'Smart Plugs',
    'switches': 'Switches',
    'sensors': 'Sensors',
    'cameras': 'Cameras',
    'doors': 'Doors',
    'windows': 'Windows',
    'fans': 'Fans',
    'other': 'Other Devices'
  }
  return nameMap[categoryType] || 'Other Devices'
}

const getCategoryIcon = (categoryType) => {
  const icons = {
    'lights': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z' },
        { d: 'M12 2V4' },
        { d: 'M12 18V20' },
        { d: 'M4.22 4.22L5.64 5.64' },
        { d: 'M18.36 18.36L19.78 19.78' },
        { d: 'M1 12H3' },
        { d: 'M21 12H23' },
        { d: 'M4.22 19.78L5.64 18.36' },
        { d: 'M18.36 5.64L19.78 4.22' }
      ]
    },
    'climate': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z' },
        { d: 'M12 6V18' },
        { d: 'M8 8L6 6' },
        { d: 'M16 8L18 6' },
        { d: 'M8 16L6 18' },
        { d: 'M16 16L18 18' }
      ]
    },
    'plugs': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M2 3H22C22.5523 3 23 3.44772 23 4V18C23 18.5523 22.5523 19 22 19H2C1.44772 19 1 18.5523 1 18V4C1 3.44772 1.44772 3 2 3Z' },
        { d: 'M8 21H16' },
        { d: 'M12 17V21' }
      ]
    },
    'switches': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M3 7H21' },
        { d: 'M3 17H21' },
        { d: 'M8 3L4 7L8 11' },
        { d: 'M16 13L20 17L16 21' }
      ]
    },
    'sensors': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z' },
        { d: 'M12 6V18' },
        { d: 'M8 8L6 6' },
        { d: 'M16 8L18 6' },
        { d: 'M8 16L6 18' },
        { d: 'M16 16L18 18' }
      ]
    },
    'cameras': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z' }
      ]
    },
    'doors': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M3 21H21' },
        { d: 'M3 3H21V21H3V3Z' },
        { d: 'M9 9H15' }
      ]
    },
    'windows': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M3 3H21V21H3V3Z' },
        { d: 'M3 9H21' },
        { d: 'M3 15H21' },
        { d: 'M9 3V21' },
        { d: 'M15 3V21' }
      ]
    },
    'fans': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z' },
        { d: 'M12 6V18' },
        { d: 'M8 8L6 6' },
        { d: 'M16 8L18 6' },
        { d: 'M8 16L6 18' },
        { d: 'M16 16L18 18' }
      ]
    },
    'other': {
      viewBox: '0 0 24 24',
      paths: [
        { d: 'M12 2L2 7L12 12L22 7L12 2Z' },
        { d: 'M2 17L12 22L22 17' },
        { d: 'M2 12L12 17L22 12' }
      ]
    }
  }
  return icons[categoryType] || icons['other']
}

const openDeviceManagementModal = () => {
  showDeviceManagementModal.value = true
  // Load current device settings when opening
  loadDeviceSettings()
}

const closeDeviceManagementModal = () => {
  showDeviceManagementModal.value = false
  // Reset to current settings
  loadDeviceSettings()
}

const loadDeviceSettings = () => {
  // Load current device settings from localStorage or default to all devices
  const savedSettings = localStorage.getItem(`deviceSettings_${currentProjectId.value}`)
  if (savedSettings) {
    selectedDevices.value = JSON.parse(savedSettings)
  } else {
    // Default to all devices selected
    selectedDevices.value = {}
    smartMirrorStore.devices.forEach(device => {
      const categoryType = getDeviceCategory(device.type)
      if (!selectedDevices.value[categoryType]) {
        selectedDevices.value[categoryType] = []
      }
      selectedDevices.value[categoryType].push(device.id)
    })
  }
}

const toggleDevice = (category, deviceId, isSelected) => {
  // Ensure the category array exists
  if (!selectedDevices.value[category]) {
    selectedDevices.value[category] = []
  }
  
  if (isSelected) {
    if (!selectedDevices.value[category].includes(deviceId)) {
      selectedDevices.value[category].push(deviceId)
    }
  } else {
    selectedDevices.value[category] = selectedDevices.value[category].filter(id => id !== deviceId)
  }
}

const saveDeviceSettings = async () => {
  try {
    savingSettings.value = true
    
    // Save settings to localStorage
    localStorage.setItem(`deviceSettings_${currentProjectId.value}`, JSON.stringify(selectedDevices.value))
    
    // Update Smart Mirror store with selected devices
    smartMirrorStore.setSelectedDevices(selectedDevices.value)
    
    notificationStore.showSuccess('Device settings saved successfully!')
    closeDeviceManagementModal()
    
  } catch (err) {
    console.error('Error saving device settings:', err)
    notificationStore.showError('Failed to save device settings. Please try again.')
  } finally {
    savingSettings.value = false
  }
}

// Load profile on component mount
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e1e5e9;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.profile-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  margin-bottom: 20px;
}

.avatar-initial {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 32px;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.3);
}

.profile-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #333;
}

.profile-email {
  font-size: 1rem;
  color: #666;
  margin: 0 0 16px 0;
}

.profile-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-verified {
  background-color: #cce5ff;
  color: #004085;
}

.status-unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.info-section {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.add-project-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ff6b35 !important;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-project-btn:hover {
  background: #e55a2b;
  transform: translateY(-2px);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

/* Projects List */
.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.project-item:hover {
  background: white;
  border-color: #ff6b35;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-item.current {
  background: #fff5f2;
  border-color: #ff6b35;
  box-shadow: 0 4px 16px rgba(255, 107, 53, 0.15);
}

.project-info {
  flex: 1;
}

.project-main {
  margin-bottom: 8px;
}

.project-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.project-location {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.project-details {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}

.project-details h4{
  line-height: 1.2;
  margin: 0;
}

.project-unit,
.project-role,
.project-status {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.project-unit {
  background: #e3f2fd;
  color: #1565c0;
}

.project-role {
  background: #f3e5f5;
  color: #7b1fa2;
}

.project-status {
  background: #d4edda;
  color: #155724;
}

.project-status.inactive,
.project-status.unknown,
.project-status.error {
  background: #f8d7da;
  color: #721c24;
}

.project-actions {
  flex-shrink: 0;
}

.switch-project-btn {
  background: transparent;
  border: 2px solid #ff6b35;
  color: #ff6b35;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.switch-project-btn:hover {
  background: #ff6b35;
  color: white;
  transform: translateY(-2px);
}

.current-project-badge {
  background: #ff6b35;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* No Projects State */
.no-projects {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.no-projects-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.no-projects p {
  margin: 0 0 20px 0;
  font-size: 1.1rem;
}

.add-first-project-btn {
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

.add-first-project-btn:hover {
  background: #e55a2b;
  transform: translateY(-2px);
}

/* Update button text to reflect new functionality */
.add-project-btn {
  background: #28a745;
}

.add-project-btn:hover {
  background: #218838;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.verification-status,
.completion-status {
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.verification-status.verified,
.completion-status.complete {
  background-color: #d4edda;
  color: #155724;
}

.verification-status.unverified,
.completion-status.incomplete {
  background-color: #f8d7da;
  color: #721c24;
}

.actions-section {
  text-align: center;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: #e55a2b;
  transform: translateY(-2px);
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.error-container {
  text-align: center;
  padding: 60px 20px;
}

.error-icon {
  margin-bottom: 20px;
}

.error-container h3 {
  color: #dc3545;
  margin: 0 0 16px 0;
}

.error-container p {
  color: #666;
  margin: 0 0 24px 0;
}

.retry-btn {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background-color: #e55a2b;
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
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.3);
}

.modal-header h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.3rem;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #666;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #999;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cancel-btn {
  background-color: #e1e5e9;
  color: #666;
}

.cancel-btn:hover {
  background-color: #cbd3da;
}

.confirm-btn {
  background-color: #dc3545;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.confirm-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Add Project Modal Styles */
.add-project-modal {
  max-width: 500px;
}

/* Success State */
.success-state {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: success-bounce 0.6s ease-out;
}

.success-state h3 {
  color: #28a745;
  margin: 0 0 16px 0;
  font-size: 1.4rem;
  font-weight: 700;
}

.success-state p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

@keyframes success-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.add-project-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

/* Enhanced form group spacing */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group select {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 16px center;
  background-repeat: no-repeat;
  background-size: 20px;
  padding-right: 52px;
  min-height: 48px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.form-group select:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-group select:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  transform: translateY(-1px);
}

.form-group select:hover {
  border-color: #ff6b35;
  background-color: #fff5f2;
}

/* Custom dropdown options styling */
.form-group select option {
  padding: 16px 20px;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  background: white;
  border: none;
  transition: all 0.2s ease;
}

.form-group select option:hover {
  background-color: #fff5f2;
  color: #ff6b35;
  transform: translateX(4px);
}

.form-group select option:checked {
  background: linear-gradient(135deg, #ff6b35, #ff8a65);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

/* Placeholder styling for select */
.form-group select:invalid {
  color: #9ca3af;
}

.form-group select:valid {
  color: #2c3e50;
}

/* Enhanced form group styling */
.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group label::before {
  content: '';
  width: 4px;
  height: 4px;
  background: #ff6b35;
  border-radius: 50%;
  display: inline-block;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Loading indicator for project selection */
.loading-indicator {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #ff6b35;
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

/* Responsive Design */
@media (max-width: 768px) {
  .profile-content {
    padding: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    padding: 30px 16px;
  }
  
  .profile-name {
    font-size: 1.5rem;
  }
  
  .info-section {
    padding: 20px;
  }
}

/* Unified Project Cards Styles */
.unified-projects-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.unified-project-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  position: relative;
}

.unified-project-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.unified-project-card.current {
  border-color: #ff6b35;
  background: linear-gradient(135deg, #fff7f3 0%, #ffffff 100%);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.1);
}

/* Project Header */
.project-header {
  margin-bottom: 16px;
}

.project-main-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.project-title-section h4 {
  margin: 0 0 2px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.project-title-section p {
  margin: 0;
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 400;
}

.project-status-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.project-status {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.project-status.active {
  background: #dcfce7;
  color: #166534;
}

.current-badge {
  background: #ff6b35;
  color: white;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.project-role-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.project-unit, .project-role {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  background: #f9fafb;
}

/* Smart Mirror Section */
.smart-mirror-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.settings-description {
  margin-bottom: 16px;
}

.settings-description p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.manage-devices-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.manage-devices-btn:hover {
  background: #e55a2b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.smart-mirror-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.smart-mirror-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.smart-mirror-title svg {
  color: #ff6b35;
  width: 16px;
  height: 16px;
}

.smart-mirror-status {
  display: flex;
  align-items: center;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.connected {
  background: #dcfce7;
  color: #166534;
}

.status-badge.disconnected {
  background: #fef2f2;
  color: #dc2626;
}

.smart-mirror-connected {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-count {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ff6b35;
}

.device-types {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 400;
}

.smart-mirror-actions {
  display: flex;
  gap: 8px;
}

.control-devices-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ff6b35;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-devices-btn:hover {
  background: #e55a2b;
  transform: translateY(-1px);
}

.disconnect-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.disconnect-btn:hover:not(:disabled) {
  background: #b91c1c;
  transform: translateY(-1px);
}

.disconnect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

.reauth-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 4px 8px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #92400e;
  font-weight: 500;
}

.reauth-warning svg {
  color: #f59e0b;
}

.reauth-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  padding: 3px 6px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 500;
}

.reauth-indicator svg {
  color: #6b7280;
}

.smart-mirror-disconnected {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.disconnected-message {
  margin: 0;
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 400;
  line-height: 1.4;
}

.connect-smart-mirror-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ff6b35;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.connect-smart-mirror-btn:hover {
  background: #e55a2b;
  transform: translateY(-1px);
}

/* Project Actions */
.project-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.switch-project-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-project-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

/* Modal Styles (reused from SmartMirrorConnection) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 24px;
  padding: 0;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  margin: auto;
  transform: none;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 32px 32px 24px 32px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.header-text h3 {
  margin: 0 0 4px 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.header-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-weight: 500;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.project-selection-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
}

.project-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  border-radius: 12px;
  color: white;
}

.project-details h4 {
  margin: 0 0 4px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 700;
}

.project-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
}

.existing-connection {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 10px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #92400e;
  font-weight: 500;
}

.existing-connection svg {
  color: #f59e0b;
}

.modal-body {
  padding: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.form-group input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 500;
  background: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #ff6b35;
  background: #fefefe;
  transform: translateY(-1px);
  box-shadow: 
    0 0 0 4px rgba(255, 107, 53, 0.1),
    0 4px 12px rgba(255, 107, 53, 0.15);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

.input-focus-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #ff6b35, #ff8a65);
  border-radius: 1px;
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus + .input-focus-indicator {
  transform: scaleX(1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  color: #dc2626;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #fecaca;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.modal-footer {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding: 24px 32px 32px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 100px;
}

.cancel-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cancel-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.connect-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 140px;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .unified-project-card {
    padding: 16px;
  }
  
  .project-main-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .smart-mirror-connected {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .smart-mirror-actions {
    width: 100%;
  }
  
  .control-devices-btn,
  .connect-smart-mirror-btn {
    width: 100%;
    justify-content: center;
  }
  
  .project-actions {
    justify-content: center;
  }
  
  .switch-project-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Device Management Modal Styles */
.device-management-modal {
  max-width: 700px;
  max-height: 85vh;
  width: 95%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.device-management-modal .modal-header {
  padding: 32px 32px 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  flex-shrink: 0;
  position: relative;
}

.device-management-modal .modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.device-management-modal .modal-header h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-management-modal .modal-header h3::before {
  content: '⚙️';
  font-size: 20px;
}

.device-management-modal .modal-header p {
  margin: 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  font-weight: 400;
}

.device-management-modal .modal-body {
  padding: 0;
  flex: 1;
  overflow-y: auto;
  background: #fafafa;
}

.device-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 32px;
}

.device-category {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.category-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.2);
}

.category-icon.lights {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
}

.category-icon.climate {
  background: linear-gradient(135deg, #ff8a65 0%, #ffab91 100%);
}

.category-icon.plugs {
  background: linear-gradient(135deg, #ffab91 0%, #ffccbc 100%);
}

.category-icon.switches {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.category-icon.sensors {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.category-icon.cameras {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
}

.category-icon.doors {
  background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%);
}

.category-icon.windows {
  background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
}

.category-icon.fans {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
}

.category-icon.other {
  background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
}

.category-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.device-count {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.device-item:hover {
  border-color: #ff6b35;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px 0;
}

.device-room {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0 0 2px 0;
}

.device-type {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 12px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background-color: #ff6b35;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.no-devices-message {
  text-align: center;
  padding: 60px 32px;
  background: white;
  margin: 24px 32px;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
}

.no-devices-icon {
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #9ca3af;
}

.no-devices-message h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.no-devices-message p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Device Management Modal Actions */
.device-management-modal .modal-actions {
  display: flex;
  gap: 16px;
  padding: 24px 32px;
  background: white;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.device-management-modal .cancel-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.device-management-modal .cancel-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  color: #374151;
}

.device-management-modal .save-btn {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8a65 100%);
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.device-management-modal .save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.device-management-modal .save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.device-management-modal .spinning {
  animation: spin 1s linear infinite;
}
</style>
