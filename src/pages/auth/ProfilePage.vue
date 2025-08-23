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

      <!-- Property Information -->
      <div class="info-section">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Property Information
        </h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Project</label>
            <span>{{ userProfile.project || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Unit</label>
            <span>{{ userProfile.unit || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Role</label>
            <span>{{ formatRole(userProfile.role) || 'Not provided' }}</span>
          </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../../boot/firebase'
import { getUserDocument } from '../../utils/firestore'
import { useNotificationStore } from '../../stores/notifications'

// Component name for ESLint
defineOptions({
  name: 'ProfilePage'
})

const router = useRouter()
const notificationStore = useNotificationStore()

// Reactive state
const loading = ref(true)
const error = ref(null)
const userProfile = ref(null)
const showLogoutConfirm = ref(false)
const logoutLoading = ref(false)

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
    router.push('/register')
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

const formatRole = (role) => {
  if (!role) return null
  
  const roleMap = {
    'owner': 'Owner',
    'family': 'Family Member'
  }
  
  return roleMap[role] || role
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

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
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
</style>
