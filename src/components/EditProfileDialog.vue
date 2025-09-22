<template>
  <div v-if="isOpen" class="edit-profile-overlay" @click="closeDialog">
    <div class="edit-profile-dialog" @click.stop>
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-content">
          <h2 class="dialog-title">Edit Profile</h2>
          <p class="dialog-subtitle">Update your personal information</p>
        </div>
        <button @click="closeDialog" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Form Content -->
      <div class="dialog-content">
        <form @submit.prevent="saveProfile" class="profile-form">
          <!-- Profile Picture Section -->
          <div class="form-section">
            <h3 class="section-title">Profile Picture</h3>
            
            <div class="profile-picture-section">
              <div class="current-profile-pic">
                <img 
                  v-if="formData.profilePictureUrl" 
                  :src="formData.profilePictureUrl" 
                  alt="Profile Picture" 
                  class="profile-pic-image"
                />
                <div v-else class="profile-pic-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="profile-pic-actions">
                <input
                  id="profilePicUpload"
                  type="file"
                  accept="image/*"
                  @change="handleProfilePictureChange"
                  class="file-input"
                  style="display: none;"
                />
                <label for="profilePicUpload" class="upload-profile-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ profilePicUploading ? 'Uploading...' : 'Change Picture' }}
                </label>
              </div>
            </div>
          </div>
          <!-- Personal Information Section -->
          <div class="form-section">
            <h3 class="section-title">Personal Information</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name *</label>
                <input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  class="form-input"
                  :class="{ error: errors.firstName }"
                  placeholder="Enter your first name"
                  required
                />
                <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  class="form-input"
                  :class="{ error: errors.lastName }"
                  placeholder="Enter your last name"
                  required
                />
                <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="mobile">Mobile Number *</label>
              <input
                id="mobile"
                v-model="formData.mobile"
                type="tel"
                class="form-input"
                :class="{ error: errors.mobile }"
                placeholder="Enter your mobile number"
                required
              />
              <span v-if="errors.mobile" class="error-message">{{ errors.mobile }}</span>
            </div>

            <div class="form-group">
              <label for="gender">Gender</label>
              <select
                id="gender"
                v-model="formData.gender"
                class="form-select"
                :class="{ error: errors.gender }"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <span v-if="errors.gender" class="error-message">{{ errors.gender }}</span>
            </div>

            <div class="form-group">
              <label for="nationalId">National ID</label>
              <input
                id="nationalId"
                v-model="formData.nationalId"
                type="text"
                class="form-input"
                :class="{ error: errors.nationalId }"
                placeholder="Enter your national ID"
              />
              <span v-if="errors.nationalId" class="error-message">{{ errors.nationalId }}</span>
            </div>
          </div>

          <!-- Read-only Information Section -->
          <div class="form-section">
            <h3 class="section-title">Account Information</h3>
            <p class="section-description">These fields cannot be changed for security reasons</p>
            
            <div class="readonly-group">
              <label>Email Address</label>
              <div class="readonly-field">
                <span>{{ userProfile?.email || 'Not provided' }}</span>
                <div class="readonly-badge">Cannot be changed</div>
              </div>
            </div>

            <div class="readonly-group">
              <label>Date of Birth</label>
              <div class="readonly-field">
                <span>{{ formatDate(userProfile?.dateOfBirth) || 'Not provided' }}</span>
                <div class="readonly-badge">Cannot be changed</div>
              </div>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="form-section">
            <h3 class="section-title">Uploaded Documents</h3>
            <p class="section-description">View your uploaded identification documents</p>
            
            <div class="documents-grid">
              <!-- Front National ID -->
              <div class="document-card">
                <div class="document-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="document-info">
                  <h5>Front National ID</h5>
                  <p v-if="formData.documents?.frontIdUrl">Document uploaded</p>
                  <p v-else class="missing">Not uploaded</p>
                </div>
                <button 
                  v-if="formData.documents?.frontIdUrl"
                  @click="viewDocument(formData.documents.frontIdUrl, 'Front National ID')"
                  class="view-doc-btn"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  View
                </button>
              </div>

              <!-- Back National ID -->
              <div class="document-card">
                <div class="document-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="document-info">
                  <h5>Back National ID</h5>
                  <p v-if="formData.documents?.backIdUrl">Document uploaded</p>
                  <p v-else class="missing">Not uploaded</p>
                </div>
                <button 
                  v-if="formData.documents?.backIdUrl"
                  @click="viewDocument(formData.documents.backIdUrl, 'Back National ID')"
                  class="view-doc-btn"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  View
                </button>
              </div>
            </div>
          </div>

          <!-- Password Reset Section -->
          <div class="form-section">
            <h3 class="section-title">Password</h3>
            
            <div class="password-actions">
              <button
                type="button"
                @click="resetPassword"
                class="password-reset-btn"
                :disabled="passwordResetLoading"
              >
                <svg v-if="!passwordResetLoading" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 2L2 21M21 2L15 8M21 2V8H15M2 21L8 15M2 21V15H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-else class="loading-spinner-small"></div>
                {{ passwordResetLoading ? 'Sending...' : 'Reset Password' }}
              </button>
              <p class="password-help">
                A password reset link will be sent to your email address
              </p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="button"
              @click="closeDialog"
              class="cancel-btn"
              :disabled="saving"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="save-btn"
              :disabled="saving || !isFormValid"
            >
              <div v-if="saving" class="loading-spinner-small"></div>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 21V13H7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 3V8H12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <div v-if="showDocumentModal" class="modal-overlay" @click="showDocumentModal = false">
      <div class="document-modal" @click.stop>
        <div class="document-modal-header">
          <h3>{{ documentModalTitle }}</h3>
          <button @click="showDocumentModal = false" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="document-modal-content">
          <img :src="documentModalUrl" :alt="documentModalTitle" class="document-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../boot/firebase';
import { useNotificationStore } from '../stores/notifications';
import { updateUserProfile } from '../services/userService';
import fileUploadService from '../services/fileUploadService';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  userProfile: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);

const notificationStore = useNotificationStore();

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  mobile: '',
  gender: '',
  nationalId: '',
  profilePictureUrl: '',
  documents: {
    frontIdUrl: '',
    backIdUrl: ''
  }
});

// Form state
const saving = ref(false);
const passwordResetLoading = ref(false);
const profilePicUploading = ref(false);
const errors = ref({});

// Document modal state
const showDocumentModal = ref(false);
const documentModalUrl = ref('');
const documentModalTitle = ref('');

// Computed
const isFormValid = computed(() => {
  return formData.value.firstName.trim() && 
         formData.value.lastName.trim() && 
         formData.value.mobile.trim() &&
         !Object.keys(errors.value).length;
});

// Methods
const closeDialog = () => {
  if (!saving.value) {
    resetForm();
    emit('close');
  }
};

const resetForm = () => {
  formData.value = {
    firstName: '',
    lastName: '',
    mobile: '',
    gender: '',
    nationalId: '',
    profilePictureUrl: '',
    documents: {
      frontIdUrl: '',
      backIdUrl: ''
    }
  };
  errors.value = {};
};

const loadUserData = () => {
  if (props.userProfile) {
    formData.value = {
      firstName: props.userProfile.firstName || '',
      lastName: props.userProfile.lastName || '',
      mobile: props.userProfile.mobile || '',
      gender: props.userProfile.gender || '',
      nationalId: props.userProfile.nationalId || '',
      profilePictureUrl: props.userProfile.documents?.profilePictureUrl || '',
      documents: {
        frontIdUrl: props.userProfile.documents?.frontIdUrl || '',
        backIdUrl: props.userProfile.documents?.backIdUrl || ''
      }
    };
  }
};

const validateForm = () => {
  errors.value = {};

  // First Name validation
  if (!formData.value.firstName.trim()) {
    errors.value.firstName = 'First name is required';
  } else if (formData.value.firstName.trim().length < 2) {
    errors.value.firstName = 'First name must be at least 2 characters';
  }

  // Last Name validation
  if (!formData.value.lastName.trim()) {
    errors.value.lastName = 'Last name is required';
  } else if (formData.value.lastName.trim().length < 2) {
    errors.value.lastName = 'Last name must be at least 2 characters';
  }

  // Mobile validation
  if (!formData.value.mobile.trim()) {
    errors.value.mobile = 'Mobile number is required';
  } else if (!/^[0-9+\-\s()]+$/.test(formData.value.mobile.trim())) {
    errors.value.mobile = 'Please enter a valid mobile number';
  }

  // National ID validation (optional but if provided, should be valid)
  if (formData.value.nationalId && formData.value.nationalId.length < 5) {
    errors.value.nationalId = 'National ID must be at least 5 characters';
  }

  return Object.keys(errors.value).length === 0;
};

const saveProfile = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    saving.value = true;
    
    const updateData = {
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      mobile: formData.value.mobile.trim(),
      gender: formData.value.gender || null,
      nationalId: formData.value.nationalId.trim() || null,
      updatedAt: new Date()
    };

    await updateUserProfile(auth.currentUser.uid, updateData);
    
    notificationStore.showSuccess('Profile updated successfully!');
    emit('saved', updateData);
    closeDialog();
    
  } catch (error) {
    console.error('Error updating profile:', error);
    notificationStore.showError('Failed to update profile. Please try again.');
  } finally {
    saving.value = false;
  }
};

const resetPassword = async () => {
  if (!auth.currentUser?.email) {
    notificationStore.showError('No email address found for password reset');
    return;
  }

  try {
    passwordResetLoading.value = true;
    
    await sendPasswordResetEmail(auth, auth.currentUser.email);
    notificationStore.showSuccess('Password reset email sent! Check your inbox.');
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    notificationStore.showError('Failed to send password reset email. Please try again.');
  } finally {
    passwordResetLoading.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return null;
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Document functions
const viewDocument = (url, title) => {
  documentModalUrl.value = url;
  documentModalTitle.value = title;
  showDocumentModal.value = true;
};

const handleProfilePictureChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    notificationStore.showError('Please select a valid image file (JPEG, PNG, or WebP)');
    return;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    notificationStore.showError('File size must be less than 10MB');
    return;
  }

  profilePicUploading.value = true;

  try {
    const userId = auth.currentUser.uid;
    const uploadedDocuments = await fileUploadService.uploadUserDocuments(
      userId,
      null, // frontId
      null, // backId
      file  // profilePicture
    );

    // Update user profile in Firebase Auth
    await updateProfile(auth.currentUser, {
      photoURL: uploadedDocuments.profilePicture
    });

    // Update user document in Firestore
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      'documents.profilePictureUrl': uploadedDocuments.profilePicture,
      updatedAt: new Date()
    });

    // Update local form data
    formData.value.profilePictureUrl = uploadedDocuments.profilePicture;

    notificationStore.showSuccess('Profile picture updated successfully!');
  } catch (error) {
    console.error('Error updating profile picture:', error);
    notificationStore.showError('Failed to update profile picture. Please try again.');
  } finally {
    profilePicUploading.value = false;
  }
};

// Watch for dialog open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadUserData();
  }
});

// Watch for user profile changes
watch(() => props.userProfile, () => {
  if (props.isOpen) {
    loadUserData();
  }
});

onMounted(() => {
  if (props.isOpen) {
    loadUserData();
  }
});
</script>

<style scoped>
.edit-profile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.edit-profile-dialog {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.dialog-header {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-content p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 12px;
  padding: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e2e8f0;
}

.section-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input, .form-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.form-input.error, .form-select.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.error-message {
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
}

.readonly-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.readonly-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.readonly-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  color: #64748b;
}

.readonly-badge {
  background: #e2e8f0;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.password-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.password-reset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 12px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.password-reset-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #475569;
}

.password-reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-help {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn, .save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.cancel-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #475569;
}

.save-btn {
  background: #AF1E23;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #8b1a1e;
}

.save-btn:disabled, .cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .edit-profile-dialog {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Profile Picture Section */
.profile-picture-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e1e5e9;
}

.current-profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  flex-shrink: 0;
}

.profile-pic-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-pic-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.profile-pic-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-profile-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-profile-btn:hover {
  background: #8b161a;
}

/* Documents Section */
.documents-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.document-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  transition: border-color 0.3s ease;
}

.document-card:hover {
  border-color: #AF1E23;
}

.document-icon {
  width: 48px;
  height: 48px;
  background: #f0f9ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0369a1;
  flex-shrink: 0;
}

.document-info {
  flex: 1;
}

.document-info h5 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.document-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.document-info p.missing {
  color: #ef4444;
}

.view-doc-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-doc-btn:hover {
  background: #AF1E23;
  color: white;
  border-color: #AF1E23;
}

/* Document Modal Styles */
.document-modal {
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.document-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.document-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.document-modal-content {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.document-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .profile-picture-section {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .documents-grid {
    gap: 12px;
  }
  
  .document-card {
    padding: 12px;
    gap: 12px;
  }
  
  .document-icon {
    width: 40px;
    height: 40px;
  }
  
  .document-modal {
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .document-modal-header {
    padding: 16px;
  }
  
  .document-modal-content {
    padding: 16px;
  }
}
</style>
