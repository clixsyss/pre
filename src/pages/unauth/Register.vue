<template>
  <div class="register-page">
    <!-- Header -->
    <div class="header">
      <button @click="goToOnboarding" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="page-title">Registration</h1>
      <div class="header-actions">
        <button @click="goToSignIn" class="signin-header-btn">Sign In</button>
      </div>
    </div>

    <!-- Orange Separator Line -->
    <div class="separator-line"></div>

    <!-- Progress Indicator -->
    <div class="progress-indicator">
      <div class="progress-line"></div>

      <!-- Personal Step -->
      <div class="progress-step"
        :class="{ active: currentStep === 'personal' && !isPersonalDetailsCompleted, completed: currentStep === 'property' || currentStep === 'details' || isPersonalDetailsCompleted }">
        <div class="step-icon">
          <svg v-if="currentStep === 'personal' && !isPersonalDetailsCompleted" width="24" height="24" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="7" r="4" stroke="white" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#2196F3" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
        <span class="step-label">Personal</span>
      </div>

      <!-- Property Step -->
      <div class="progress-step" :class="{ active: currentStep === 'property' || isPersonalDetailsCompleted, completed: currentStep === 'details' }">
        <div class="step-icon">
          <svg v-if="currentStep === 'property' || isPersonalDetailsCompleted" width="24" height="24" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
        <span class="step-label">Property</span>
      </div>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      <!-- Personal Step -->
      <div v-if="currentStep === 'personal'" class="step-panel">
        <div class="icon-section">
          <div class="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="#ff6b35" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <form @submit.prevent="handlePersonalSubmit" class="form">
          <div class="form-group">
            <label for="email" class="form-label">E-mail</label>
            <input id="email" v-model="personalForm.email" type="email" class="form-input"
              placeholder="Example@gmail.com" required />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input id="password" v-model="personalForm.password" type="password" class="form-input"
              placeholder="Create a strong password" required minlength="8" />
            <div class="password-requirements">
              <small>Password must be at least 8 characters long</small>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input id="confirmPassword" v-model="personalForm.confirmPassword" type="password" class="form-input"
              placeholder="Confirm your password" required />
          </div>

          <button type="submit" class="proceed-btn" :disabled="loading || !canProceed">
            <span v-if="loading">Processing...</span>
            <span v-else>Proceed</span>
          </button>
        </form>



        <!-- Navigation Options -->
        <div class="step-navigation">
          <div class="nav-divider">
            <span>or</span>
          </div>
          <div class="nav-options">
            <a @click="goToSignIn" class="nav-link">
              Already have an account? Sign In
            </a>
            <a @click="goToOnboarding" class="nav-link">
              Back to Onboarding
            </a>
          </div>
        </div>

        <div class="registration-notice">
          <div class="notice-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 8V12" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 16H12.01" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="notice-title">Important Notice</h3>
          <p class="notice-text">
            To ensure proper account setup and verification, all new users must complete our custom registration
            process.
            This helps us maintain security and provide personalized service for PRE Group members.
          </p>
        </div>
      </div>

      <!-- Property Step -->
      <div v-if="currentStep === 'property'" class="step-panel">
        <div class="icon-section">
          <div class="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <polyline points="9,22 9,12 15,12 15,22" stroke="#ff6b35" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>

        <!-- Project Selection Form -->
        <form @submit.prevent="handlePropertySubmit" class="form">
          <div class="step-header">
            <h3 class="step-title">Property Selection</h3>
            <p class="step-description">Select your primary property and optionally add additional properties.</p>
          </div>

          <!-- Primary Property Section -->
          <div v-if="selectedProjects.length === 0" class="property-section primary-property">
            <div class="section-header">
              <div class="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h4 class="section-title">Primary Property</h4>
            </div>

            <!-- Project Selection -->
            <div class="form-group">
              <label for="project" class="form-label">Project *</label>
              <div class="select-wrapper">
                <select id="project" v-model="propertyForm.selectedProject" class="form-input custom-select" required
                  @change="onProjectChange">
                  <option value="" disabled>Select Project</option>
                  <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                    {{ project.name }} - {{ project.type }} ({{ project.location }})
                  </option>
                </select>
                <div class="select-arrow"></div>
              </div>
            </div>

            <!-- Unit Input -->
            <div class="form-group">
              <label for="unit" class="form-label">Unit Number/Name *</label>
              <input id="unit" v-model="propertyForm.unit" type="text" class="form-input"
                placeholder="e.g., A1, Villa 5, Office 12" required :disabled="!propertyForm.selectedProject" />
            </div>

            <!-- Role Selection -->
            <div class="form-group">
              <label class="form-label">Role *</label>
              <div class="role-buttons">
                <button type="button" @click="propertyForm.role = 'owner'"
                  :class="['role-btn', { active: propertyForm.role === 'owner' }]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Owner
                </button>
                <button type="button" @click="propertyForm.role = 'family'"
                  :class="['role-btn', { active: propertyForm.role === 'family' }]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Family Member
                </button>
              </div>
            </div>

            <!-- Add Project Button -->
            <div class="form-group">
              <button type="button" @click="addProjectToSelection" class="add-project-btn" :disabled="!canAddProject">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                Add This Property
              </button>
            </div>
          </div>

          <!-- Primary Property Summary (when primary property is added) -->
          <div v-if="selectedProjects.length > 0" class="property-section primary-property-summary">
            <div class="section-header">
              <div class="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h4 class="section-title">Primary Property Added</h4>
              <p class="section-subtitle">Your primary property has been selected. You can now add additional properties if needed.</p>
            </div>
            
            <div class="primary-property-display">
              <div class="property-card primary">
                <div class="property-info">
                  <div class="property-name">{{ getProjectName(selectedProjects[0].projectId) }}</div>
                  <div class="property-details">
                    <span class="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ selectedProjects[0].unit }}
                    </span>
                    <span class="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ selectedProjects[0].role }}
                    </span>
                  </div>
                </div>
                <div class="property-badge primary-badge">Primary</div>
              </div>
            </div>
          </div>

          <!-- Additional Properties Section -->
          <div v-if="selectedProjects.length > 0" class="property-section additional-properties">
            <div class="section-header">
              <div class="section-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H13V5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h4 class="section-title">Additional Properties (Optional)</h4>
              <p class="section-subtitle">You can add more properties if you own or have access to multiple units</p>
            </div>

            <div class="projects-list">
              <div v-for="(project, index) in selectedProjects" :key="index" class="project-item">
                <div class="project-info">
                  <div class="project-name">{{ getProjectName(project.projectId) }}</div>
                  <div class="project-details">
                    <span class="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ project.unit }}
                    </span>
                    <span class="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {{ project.role }}
                    </span>
                  </div>
                </div>
                <button type="button" @click="removeProject(index)" class="remove-project-btn" title="Remove property">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Add Another Property Button -->
            <div class="add-another-section">
              <button type="button" @click="showAddAnotherForm = true" class="add-another-btn" v-if="!showAddAnotherForm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Add Another Property
              </button>
              
              <!-- Additional Property Form -->
              <div v-if="showAddAnotherForm" class="additional-property-form">
                <div class="form-group">
                  <label for="additional-project" class="form-label">Project</label>
                  <div class="select-wrapper">
                    <select id="additional-project" v-model="additionalPropertyForm.selectedProject" class="form-input custom-select"
                      @change="onAdditionalProjectChange">
                      <option value="" disabled>Select Project</option>
                      <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                        {{ project.name }} - {{ project.type }} ({{ project.location }})
                      </option>
                    </select>
                    <div class="select-arrow"></div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="additional-unit" class="form-label">Unit Number/Name</label>
                  <input id="additional-unit" v-model="additionalPropertyForm.unit" type="text" class="form-input"
                    placeholder="e.g., A2, Villa 6, Office 15" :disabled="!additionalPropertyForm.selectedProject" />
                </div>

                <div class="form-group">
                  <label class="form-label">Role</label>
                  <div class="role-buttons">
                    <button type="button" @click="additionalPropertyForm.role = 'owner'"
                      :class="['role-btn', { active: additionalPropertyForm.role === 'owner' }]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Owner
                    </button>
                    <button type="button" @click="additionalPropertyForm.role = 'family'"
                      :class="['role-btn', { active: additionalPropertyForm.role === 'family' }]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Family Member
                    </button>
                  </div>
                </div>

                <div class="additional-form-actions">
                  <button type="button" @click="addAdditionalProperty" class="add-property-btn" 
                    :disabled="!canAddAdditionalProperty">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Add Property
                  </button>
                  <button type="button" @click="cancelAdditionalProperty" class="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="goToPreviousStep" class="back-action-btn">
              Back
            </button>
            <button type="submit" class="verify-btn" :disabled="loading || !canProceedToNext">
              <span v-if="loading">Verifying...</span>
              <span v-else>Continue</span>
            </button>
          </div>
        </form>

        <!-- Navigation Options -->
        <div class="step-navigation">
          <div class="nav-divider">
            <span>or</span>
          </div>
          <div class="nav-options">
            <a @click="goToSignIn" class="nav-link">
              Already have an account? Sign In
            </a>
            <a @click="goToOnboarding" class="nav-link">
              Back to Onboarding
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../../stores/registration'
import { useNotificationStore } from '../../stores/notifications'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../../boot/firebase'

// Component name for ESLint
defineOptions({
  name: 'RegisterPage'
})

const router = useRouter()
const registrationStore = useRegistrationStore()
const notificationStore = useNotificationStore()
const currentStep = ref('personal')
const loading = ref(false)

const personalForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

const propertyForm = reactive({
  selectedProject: '', // Stores the ID of the selected project
  unit: '',
  role: ''
})

const availableProjects = ref([])
const selectedProjects = ref([])
const showAddAnotherForm = ref(false)

const additionalPropertyForm = reactive({
  selectedProject: '',
  unit: '',
  role: ''
})

// Function to fetch available projects from Firestore
const fetchAvailableProjects = async () => {
  try {
    const projectsRef = collection(db, 'projects')
    const snapshot = await getDocs(projectsRef)
    availableProjects.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching available projects:', error)
    notificationStore.showError('Failed to load projects. Please try again later.')
  }
}

// Function to get project name by ID
const getProjectName = (projectId) => {
  const project = availableProjects.value.find(p => p.id === projectId)
  return project ? `${project.name} - ${project.type}` : 'N/A'
}

// Function to add a project to the selected projects list
const addProjectToSelection = () => {
  if (propertyForm.selectedProject && propertyForm.unit) {
    selectedProjects.value.push({
      projectId: propertyForm.selectedProject,
      unit: propertyForm.unit,
      role: propertyForm.role
    })
    propertyForm.selectedProject = ''
    propertyForm.unit = ''
    propertyForm.role = ''
    notificationStore.showSuccess('Project added to selection!')
  } else {
    notificationStore.showError('Please select a project and enter a unit number/name.')
  }
}

// Function to remove a project from the selected projects list
const removeProject = (index) => {
  selectedProjects.value.splice(index, 1)
  notificationStore.showSuccess('Project removed from selection!')
}

// Function to handle project selection change
const onProjectChange = () => {
  // Clear unit input when project changes
  propertyForm.unit = ''
  propertyForm.role = ''
}

// Function to handle additional project selection change
const onAdditionalProjectChange = () => {
  // Clear unit input when project changes
  additionalPropertyForm.unit = ''
  additionalPropertyForm.role = ''
}

// Function to add additional property
const addAdditionalProperty = () => {
  if (additionalPropertyForm.selectedProject && additionalPropertyForm.unit && additionalPropertyForm.role) {
    selectedProjects.value.push({
      projectId: additionalPropertyForm.selectedProject,
      unit: additionalPropertyForm.unit,
      role: additionalPropertyForm.role
    })
    
    // Reset form
    additionalPropertyForm.selectedProject = ''
    additionalPropertyForm.unit = ''
    additionalPropertyForm.role = ''
    showAddAnotherForm.value = false
    
    notificationStore.showSuccess('Additional property added!')
  } else {
    notificationStore.showError('Please fill in all fields for the additional property.')
  }
}

// Function to cancel adding additional property
const cancelAdditionalProperty = () => {
  additionalPropertyForm.selectedProject = ''
  additionalPropertyForm.unit = ''
  additionalPropertyForm.role = ''
  showAddAnotherForm.value = false
}

// Computed property to check if additional property can be added
const canAddAdditionalProperty = computed(() => {
  return additionalPropertyForm.selectedProject && additionalPropertyForm.unit && additionalPropertyForm.role
})

// Function to save user data to Firestore
const saveUserDataToFirestore = async (userId, userData) => {
  try {
    const userDocRef = doc(db, 'users', userId)

    // Prepare the user document data
    const userDocument = {
      // Personal Information
      email: userData.personal.email,
      emailVerified: userData.personal.emailVerified || false,

      // Property Information
      projects: userData.property.projects || [], // Use projects array instead of individual fields
      compound: userData.property.compound || '', // Keep for backward compatibility
      unit: userData.property.unit || '', // Keep for backward compatibility
      role: userData.property.role || '', // Keep for backward compatibility

      // User Details (if available)
      firstName: userData.userDetails?.firstName || '',
      lastName: userData.userDetails?.lastName || '',
      mobile: userData.userDetails?.mobile || '',
      dateOfBirth: userData.userDetails?.dateOfBirth || '',
      gender: userData.userDetails?.gender || '',
      nationalId: userData.userDetails?.nationalId || '',

      // Metadata
      registrationStatus: 'pending', // pending, completed, verified
      registrationStep: 'personal', // personal, property, details, complete
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      // Firebase Auth Info
      authUid: userId,
      lastLoginAt: serverTimestamp()
    }

    // Save to Firestore
    await setDoc(userDocRef, userDocument)

    console.log('User data saved to Firestore successfully:', userDocument)
    return true
  } catch (error) {
    console.error('Error saving user data to Firestore:', error)
    throw error
  }
}

// Function to update user data in Firestore
const updateUserDataInFirestore = async (userId, updateData) => {
  try {
    const userDocRef = doc(db, 'users', userId)

    const updateDocument = {
      ...updateData,
      updatedAt: serverTimestamp()
    }

    await setDoc(userDocRef, updateDocument, { merge: true })

    console.log('User data updated in Firestore successfully:', updateDocument)
    return true
  } catch (error) {
    console.error('Error updating user data in Firestore:', error)
    throw error
  }
}

onMounted(() => {
  // Load existing data from store if available
  if (registrationStore.personalData.email) {
    personalForm.email = registrationStore.personalData.email
  }
  if (registrationStore.propertyData.compound) {
    propertyForm.compound = registrationStore.propertyData.compound
    propertyForm.unit = registrationStore.propertyData.unit
    propertyForm.role = registrationStore.propertyData.role
  }
  
  // Clear password fields for security
  personalForm.password = ''
  personalForm.confirmPassword = ''

  // If email is verified, show property step
  if (registrationStore.isEmailVerified) {
    console.log('Email verified, switching to property step')
    currentStep.value = 'property'
    notificationStore.showInfo('Email verified! Please complete your property details.')
  }
  
  // If personal details are already completed, show property step and hide personal step
  if (isPersonalDetailsCompleted.value) {
    console.log('Personal details completed, switching to property step')
    currentStep.value = 'property'
    notificationStore.showInfo('Personal details completed! Please complete your property details.')
    
    // Hide the personal step content since it's already completed
    // The user should only see the property step
  }

  // Fetch available projects on mount
  fetchAvailableProjects()

  // Listen for verification code display (development only)
  const handleShowCode = (event) => {
    const { code, email } = event.detail
    notificationStore.showInfo(`🔐 Verification Code: ${code} (sent to ${email})`, 10000)
  }

  window.addEventListener('showVerificationCode', handleShowCode)

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('showVerificationCode', handleShowCode)
  })
})

const goToPreviousStep = () => {
  if (currentStep.value === 'property') {
    currentStep.value = 'personal'
  }
}

const canProceedToNext = computed(() => {
  if (currentStep.value === 'personal') {
    return personalForm.email && !loading.value
  } else if (currentStep.value === 'property') {
    return selectedProjects.value.length > 0 && !loading.value
  }
  return false
})

// Check if personal details are completed
const isPersonalDetailsCompleted = computed(() => {
  const userDetails = registrationStore.userDetails
  return userDetails.firstName && userDetails.lastName && userDetails.mobile && 
         userDetails.dateOfBirth && userDetails.nationalId
})

const canProceed = computed(() => {
  return personalForm.email && 
         personalForm.password && 
         personalForm.confirmPassword && 
         personalForm.password === personalForm.confirmPassword &&
         personalForm.password.length >= 8 &&
         !loading.value
})

const canAddProject = computed(() => {
  return propertyForm.selectedProject && propertyForm.unit && propertyForm.role
})

const handlePersonalSubmit = async () => {
  if (loading.value) return

  if (!personalForm.email) {
    notificationStore.showError('Please enter your email address')
    return
  }

  if (!personalForm.password) {
    notificationStore.showError('Please enter a password')
    return
  }

  if (personalForm.password.length < 8) {
    notificationStore.showError('Password must be at least 8 characters long')
    return
  }

  if (personalForm.password !== personalForm.confirmPassword) {
    notificationStore.showError('Passwords do not match')
    return
  }

  loading.value = true

  try {
    // Store email in registration store
    registrationStore.setPersonalData({ email: personalForm.email })

    // Create user account with the password they provided
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      personalForm.email,
      personalForm.password
    )

    // Send verification email via Firebase
    await sendEmailVerification(userCredential.user)

    // Store the user ID for later use
    registrationStore.setTempUserId(userCredential.user.uid)

    // Save initial user data to Firestore
    const initialUserData = {
      personal: { email: personalForm.email, emailVerified: false },
      property: { projects: [], compound: '', unit: '', role: '' },
      userDetails: {}
    }

    await saveUserDataToFirestore(userCredential.user.uid, initialUserData)

    console.log('Verification email sent to:', personalForm.email)
    notificationStore.showSuccess('Verification email sent! Please check your inbox and click the verification link.')

    // Clear password fields for security
    personalForm.password = ''
    personalForm.confirmPassword = ''

    // Move to email verification step
    router.push('/register/verify-email')
  } catch (error) {
    console.error('Personal submit error:', error)

    let errorMessage = 'Failed to proceed'
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists. Please sign in instead.'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address. Please check your email format.'
    } else if (error.code === 'firestore/permission-denied') {
      errorMessage = 'Database access denied. Please contact support.'
    } else {
      errorMessage += ': ' + error.message
    }

    notificationStore.showError(errorMessage)
  } finally {
    loading.value = false
  }
}

const handlePropertySubmit = async () => {
  if (loading.value) return

  if (selectedProjects.value.length === 0) {
    notificationStore.showError('Please select at least one project.')
    return
  }

  loading.value = true

  try {
    // Store property data in registration store
    registrationStore.setPropertyData({
      compound: '', // Compound is not directly stored here, handled by individual projects
      unit: '', // Unit is not directly stored here, handled by individual projects
      role: '', // Role is not directly stored here, handled by individual projects
      projects: selectedProjects.value
    })

    // Update user data in Firestore with property information
    if (registrationStore.tempUserId) {
      const propertyUpdateData = {
        projects: selectedProjects.value,
        registrationStep: 'property'
      }

      await updateUserDataInFirestore(registrationStore.tempUserId, propertyUpdateData)
    }

    console.log('Property form submitted:', selectedProjects.value)

    // Show success notification
    notificationStore.showSuccess('Property details saved! Now let\'s complete your personal information.')

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Move to personal details step
    router.push('/register/personal-details')
  } catch (error) {
    console.error('Property submit error:', error)

    let errorMessage = 'Failed to save property details'
    if (error.code === 'firestore/permission-denied') {
      errorMessage = 'Database access denied. Please contact support.'
    } else {
      errorMessage += ': ' + error.message
    }

    notificationStore.showError(errorMessage)
  } finally {
    loading.value = false
  }
}

const goToOnboarding = () => {
  console.log('goToOnboarding called, navigating to /onboarding')
  router.push('/onboarding')
}

const goToSignIn = () => {
  router.push('/signin')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #000000;
  color: white;
  margin-bottom: 0;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.placeholder {
  width: 40px;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.back-btn svg {
  stroke: white;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.signin-header-btn {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.signin-header-btn:hover {
  background-color: #e55a2b;
}

.separator-line {
  height: 3px;
  background-color: #ff6b35;
  margin: 0;
  width: 100%;
  margin-bottom: 0;
}

.registration-info {
  display: flex;
  align-items: center;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  margin-top: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  margin-right: 15px;
}

.info-content {
  flex: 1;
}

.info-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #856404;
  margin: 0 0 10px 0;
}

.info-content p {
  color: #856404;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  padding: 0 40px;
  position: relative;
  gap: 120px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.progress-line {
  position: absolute;
  height: 2px;
  background-color: #e1e5e9;
  width: 70%;
  margin-left: 15%;
  top: 30%;
  left: 0;
  transform: translateY(-50%);
  z-index: 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  border-radius: 8px;
  min-width: 80px;
}

.progress-step.active .step-icon {
  background-color: #000000;
  border-color: #000000;
  color: white;
  width: 48px;
  height: 48px;
}

.progress-step.active .step-label {
  color: #000000;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 12px;
}

.progress-step.completed .step-icon {
  background-color: #e1e5e9;
  border-color: #e1e5e9;
  color: #2196F3;
  width: 48px;
  height: 48px;
}

.progress-step.completed .step-label {
  color: #2196F3;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 12px;
}

.progress-step:not(.active):not(.completed) .step-icon {
  background-color: #e1e5e9;
  border-color: #e1e5e9;
  color: #999;
  width: 48px;
  height: 48px;
}

.progress-step:not(.active):not(.completed) .step-label {
  color: #999;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 12px;
}

.step-icon {
  border: 2px solid #e1e5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.step-icon svg {
  width: 24px;
  height: 24px;
  display: block;
  flex-shrink: 0;
}

.progress-step.active .step-icon svg {
  stroke: white;
}

.progress-step.completed .step-icon svg {
  stroke: #2196F3;
}

.progress-step:not(.active):not(.completed) .step-icon svg {
  stroke: #999;
}

.step-label {
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  white-space: nowrap;
}

.step-content {
  padding: 40px 20px;
  max-width: 500px;
  margin: 0 auto;
  margin-top: 20px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 30px 0;
  color: #666;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e1e5e9;
}

.divider span {
  padding: 0 15px;
  background-color: #f8f9fa;
}

.social-signin {
  margin-top: 20px;
}

.social-btn {
  width: 100%;
  padding: 12px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.social-btn:hover {
  border-color: #ff6b35;
  background-color: #fff5f2;
}

.google-btn {
  border-color: #4285F4;
  color: #4285F4;
}

.google-btn:hover {
  background-color: #4285F4;
  color: white;
}

.google-btn svg {
  flex-shrink: 0;
}

.step-panel {
  animation: fadeIn 0.3s ease;
}

.icon-section {
  text-align: center;
  margin-bottom: 40px;
}

.registration-notice {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 20px;
  margin-top: 30px;
  text-align: center;
}

.notice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  margin-bottom: 15px;
}

.notice-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #856404;
  margin: 0 0 10px 0;
}

.notice-text {
  color: #856404;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
}

.form {
  width: 100%;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: white;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

select.form-input {
  cursor: pointer;
  background-color: white;
}

select.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.password-requirements {
  margin-top: 5px;
  color: #666;
  font-size: 0.85rem;
}



.proceed-btn,
.verify-btn {
  width: 100%;
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.proceed-btn:hover:not(:disabled),
.verify-btn:hover:not(:disabled) {
  background-color: #e55a2b;
}

.proceed-btn:disabled,
.verify-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 15px;
}

.back-action-btn {
  flex: 1;
  background-color: white;
  color: #666;
  border: 2px solid #e1e5e9;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-action-btn:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.verify-btn {
  flex: 2;
}

.add-project-btn {
  width: 100%;
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.add-project-btn:hover:not(:disabled) {
  background-color: #1976D2;
}

.add-project-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}



.remove-project-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.remove-project-btn:hover {
  background-color: #f0f0f0;
}

.remove-project-btn svg {
  stroke: #ff6b35;
}



.step-navigation {
  margin-top: 30px;
  text-align: center;
}

.nav-divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #666;
  font-size: 0.9rem;
}

.nav-divider::before,
.nav-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e1e5e9;
}

.nav-divider span {
  padding: 0 15px;
  background-color: #f8f9fa;
}

.nav-options {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 8px 12px;
  border-radius: 4px;
}

.nav-link:hover {
  color: #ff6b35;
  background-color: rgba(255, 107, 53, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Property Selection Styles */
.step-header {
  text-align: center;
  margin-bottom: 30px;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.step-description {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.property-section {
  background-color: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
}

.primary-property {
  border-left: 4px solid #ff6b35;
}

.additional-properties {
  border-left: 4px solid #2196F3;
}

.primary-property-summary {
  border-left: 4px solid #4CAF50;
  background-color: #f1f8e9;
}

.primary-property-summary .section-icon {
  background-color: rgba(76, 175, 80, 0.1);
}

.primary-property-summary .section-icon svg {
  stroke: #4CAF50;
}

.section-header {
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 8px;
}

.additional-properties .section-icon {
  background-color: rgba(33, 150, 243, 0.1);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 5px 0 0 0;
  font-style: italic;
}

/* Enhanced Dropdown Styles */
.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: none;
  padding-right: 45px;
}

.select-arrow {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #666;
  pointer-events: none;
  transition: border-top-color 0.3s ease;
}

.custom-select:focus + .select-arrow {
  border-top-color: #ff6b35;
}

/* Enhanced Role Buttons */
.role-buttons {
  display: flex;
  gap: 15px;
}

.role-btn {
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.role-btn.active {
  border-color: #ff6b35;
  background-color: #ff6b35;
  color: white;
}

.role-btn:hover:not(.active) {
  border-color: #ff6b35;
  color: #ff6b35;
  background-color: rgba(255, 107, 53, 0.05);
}

.role-btn svg {
  stroke: currentColor;
}

/* Enhanced Project Items */
.projects-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.project-item:hover {
  border-color: #ff6b35;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
}

.project-item:last-child {
  margin-bottom: 0;
}

.project-info {
  flex: 1;
}

.project-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 1rem;
}

.project-details {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

.detail-item svg {
  stroke: #666;
}

/* Add Another Property Section */
.add-another-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.add-another-btn {
  width: 100%;
  background-color: transparent;
  color: #2196F3;
  border: 2px dashed #2196F3;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.add-another-btn:hover {
  background-color: rgba(33, 150, 243, 0.1);
  border-color: #1976D2;
  color: #1976D2;
}

.additional-property-form {
  background-color: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
}

.additional-form-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.add-property-btn {
  flex: 2;
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.add-property-btn:hover:not(:disabled) {
  background-color: #1976D2;
}

.add-property-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  flex: 1;
  background-color: white;
  color: #666;
  border: 2px solid #e1e5e9;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

/* Primary Property Display */
.primary-property-display {
  margin-top: 15px;
}

.property-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.property-card.primary {
  border-color: #4CAF50;
  background-color: #f8fff8;
}

.property-card:hover {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.property-info {
  flex: 1;
}

.property-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.property-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.primary-badge {
  background-color: #4CAF50;
  color: white;
}

/* Responsive design */
@media (max-width: 480px) {
  .step-content {
    padding: 30px 15px;
  }

  .form-input {
    padding: 14px;
  }

  .role-buttons {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .verify-btn {
    flex: 1;
  }

  .progress-indicator {
    gap: 40px;
    padding: 0 15px;
  }

  .step-icon {
    width: 36px;
    height: 36px;
  }

  .step-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 16px;
  }

  .page-title {
    font-size: 1.1rem;
  }

  .progress-indicator {
    gap: 50px;
  }
}
</style>
