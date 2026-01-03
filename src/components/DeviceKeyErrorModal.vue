<template>
  <div class="device-key-modal-overlay">
    <div class="device-key-modal-container">
      <!-- Header -->
      <div class="device-key-modal-header">
        <h2 class="device-key-modal-title">Device Not Registered</h2>
      </div>

      <!-- Body -->
      <div class="device-key-modal-body">
        <!-- Status Message -->
        <div class="status-message">
          <div class="status-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="status-title">Account Security Alert</h3>
          <p class="status-description">
            {{ message }}
          </p>
        </div>

        <!-- What This Means -->
        <div class="info-section">
          <h4 class="info-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            {{ $t('whatThisMeans') }}
          </h4>
          <p class="info-text">
            {{ $t('deviceSecurityExplanation') }}
          </p>
        </div>

        <!-- Steps to Resolve -->
        <div class="steps-section">
          <h4 class="steps-title">{{ $t('howToResolveThis') }}</h4>
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h5>{{ $t('goToYourProfile') }}</h5>
              <p>{{ $t('goToYourProfileDesc') }}</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h5>{{ $t('requestDeviceKeyReset') }}</h5>
              <p>{{ $t('requestDeviceKeyResetDesc') }}</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h5>{{ $t('waitForAdminApproval') }}</h5>
              <p>{{ $t('waitForAdminApprovalDesc') }}</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h5>{{ $t('loginOnNewDevice') }}</h5>
              <p>{{ $t('loginOnNewDeviceDesc') }}</p>
            </div>
          </div>
        </div>

        <!-- Divider with OR -->
        <div class="divider-section">
          <div class="divider-line"></div>
          <span class="divider-text">Or Request Reset Now</span>
          <div class="divider-line"></div>
        </div>

        <!-- Device Key Reset Form -->
        <div class="reset-form-section">
          <div class="reset-form-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h4>Request Device Key Reset</h4>
          </div>
          <p class="reset-form-description">
            Submit a reset request directly. Our admin will review and approve it.
          </p>

          <form @submit.prevent="handleDeviceKeyResetSubmit" class="reset-form">
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input
                v-model="deviceKeyResetForm.email"
                type="email"
                class="form-input"
                placeholder="Enter your registered email"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">National ID *</label>
              <input
                v-model="deviceKeyResetForm.nationalId"
                type="text"
                class="form-input"
                placeholder="Enter your national ID"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Mobile Number *</label>
              <input
                v-model="deviceKeyResetForm.mobile"
                type="tel"
                class="form-input"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Your Project *</label>
              <select
                v-model="deviceKeyResetForm.projectId"
                class="form-input"
                required
                :disabled="loadingProjects"
              >
                <option value="" v-if="loadingProjects">Loading projects...</option>
                <option value="" v-else-if="availableProjects.length === 0">No projects available</option>
                <option value="" v-else>Select your project</option>
                <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
              <span v-if="loadingProjects" class="loading-text">⏳ Loading projects...</span>
              <span v-else-if="availableProjects.length === 0" class="error-text">⚠️ No active projects found.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Reason for Reset *</label>
              <textarea
                v-model="deviceKeyResetForm.reason"
                class="form-textarea"
                placeholder="Please explain why you need a device key reset (e.g., new phone, lost device)..."
                rows="4"
                maxlength="500"
                required
              ></textarea>
              <div class="char-count">{{ deviceKeyResetForm.reason.length }}/500</div>
            </div>

            <div class="form-actions">
              <button type="button" @click="handleClose" class="action-btn secondary" :disabled="submittingDeviceKeyReset">
                Cancel
              </button>
              <button type="submit" class="action-btn primary" :disabled="submittingDeviceKeyReset">
                <span v-if="submittingDeviceKeyReset">Submitting...</span>
                <span v-else>Submit Request</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Support Information -->
        <div class="support-info">
          <h3 class="support-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18.364 5.636L14.828 9.172M14.828 14.828L18.364 18.364M9.172 9.172L5.636 5.636M9.172 14.828L5.636 18.364M12 2.25C17.3848 2.25 21.75 6.61522 21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12C2.25 6.61522 6.61522 2.25 12 2.25Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Need Help?
          </h3>
          <div class="support-item">
            <svg class="support-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 8L7.89 12.26C8.22 12.52 8.78 12.52 9.11 12.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="support-text">
              Email: <a href="mailto:support@pre-group.com" class="support-link">support@pre-group.com</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore'
import { smartMirrorDb as db } from '../boot/smartMirrorFirebase'
import { Notify } from 'quasar'

defineProps({
  message: {
    type: String,
    default: 'This device is not registered. Your account can only be accessed from your registered device.'
  }
})

const emit = defineEmits(['close'])

// Form state
const deviceKeyResetForm = reactive({
  email: '',
  nationalId: '',
  mobile: '',
  projectId: '',
  reason: ''
})

// Loading states
const loadingProjects = ref(false)
const availableProjects = ref([])
const submittingDeviceKeyReset = ref(false)

// Fetch available projects
const fetchProjects = async () => {
  try {
    loadingProjects.value = true
    const projectsRef = collection(db, 'projects')
    const snapshot = await getDocs(projectsRef)
    availableProjects.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    console.log('Fetched projects:', availableProjects.value.length)
  } catch (error) {
    console.error('Error fetching projects:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to load projects',
      position: 'top'
    })
  } finally {
    loadingProjects.value = false
  }
}

// Handle device key reset form submission
const handleDeviceKeyResetSubmit = async () => {
  if (submittingDeviceKeyReset.value) return

  try {
    submittingDeviceKeyReset.value = true

    console.log('Submitting device key reset request...')
    console.log('Form data:', deviceKeyResetForm)

    // Verify user exists and matches provided details
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('email', '==', deviceKeyResetForm.email.toLowerCase().trim())
    )
    const userSnapshot = await getDocs(q)

    if (userSnapshot.empty) {
      Notify.create({
        type: 'negative',
        message: 'No account found with this email address.',
        position: 'top',
        timeout: 4000
      })
      return
    }

    const userDoc = userSnapshot.docs[0]
    const userData = userDoc.data()

    // Verify National ID matches
    if (userData.nationalId !== deviceKeyResetForm.nationalId.trim()) {
      Notify.create({
        type: 'negative',
        message: 'National ID does not match our records.',
        position: 'top',
        timeout: 4000
      })
      return
    }

    // Verify Mobile matches
    if (userData.mobile !== deviceKeyResetForm.mobile.trim()) {
      Notify.create({
        type: 'negative',
        message: 'Mobile number does not match our records.',
        position: 'top',
        timeout: 4000
      })
      return
    }

    // Verify user has access to the selected project
    const hasProject = userData.projects?.some(p => {
      const projectId = typeof p === 'string' ? p : p.projectId
      return projectId === deviceKeyResetForm.projectId
    })

    if (!hasProject) {
      Notify.create({
        type: 'negative',
        message: 'You do not have access to the selected project.',
        position: 'top',
        timeout: 4000
      })
      return
    }

    // Skip duplicate check for unauthenticated users
    // The admin dashboard will handle any duplicate requests
    // Unauthenticated users don't have permission to query the collection
    console.log('ℹ️ Skipping duplicate check (user not authenticated)')

    // Create device key reset request
    const resetRequestsRef = collection(db, `projects/${deviceKeyResetForm.projectId}/deviceKeyResetRequests`)
    const resetRequest = {
      userId: userDoc.id,
      userEmail: userData.email,
      userName: `${userData.firstName} ${userData.lastName}`,
      nationalId: userData.nationalId,
      mobile: userData.mobile,
      projectId: deviceKeyResetForm.projectId,
      projectName: availableProjects.value.find(p => p.id === deviceKeyResetForm.projectId)?.name || 'Unknown Project',
      reason: deviceKeyResetForm.reason.trim(),
      status: 'pending',
      requestedAt: serverTimestamp(),
      resolvedAt: null,
      resolvedBy: null,
      adminNotes: null
    }

    await addDoc(resetRequestsRef, resetRequest)

    console.log('Device key reset request submitted successfully')

    Notify.create({
      type: 'positive',
      message: 'Reset request submitted! Admin will review your request within 24-48 hours.',
      position: 'top',
      timeout: 5000
    })

    // Close modal after successful submission
    setTimeout(() => {
      handleClose()
    }, 1500)

  } catch (error) {
    console.error('Error submitting device key reset request:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to submit reset request. Please try again.',
      position: 'top',
      timeout: 4000
    })
  } finally {
    submittingDeviceKeyReset.value = false
  }
}

const handleClose = () => {
  emit('close')
}

// Fetch projects on mount
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped>
/* Modal Overlay */
.device-key-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
}

/* Modal Container */
.device-key-modal-container {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Header */
.device-key-modal-header {
  background-color: #222222;
  color: white;
  padding: 30px;
  border-radius: 8px 8px 0 0;
  text-align: center;
}

.device-key-modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

/* Body */
.device-key-modal-body {
  padding: 40px 30px;
}

/* Status Message */
.status-message {
  text-align: center;
  margin-bottom: 30px;
}

.status-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background-color: #ffebee;
  border: 2px solid #ef9a9a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c62828;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
}


.status-description {
  font-size: 1.05rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

/* Info Section */
.info-section {
  background-color: #f0f7ff;
  border-left: 4px solid #2196F3;
  border-radius: 6px;
  padding: 18px 20px;
  margin-bottom: 25px;
}

.info-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976D2;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-text {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

/* Steps Section */
.steps-section {
  margin-bottom: 25px;
}

.steps-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 20px 0;
}

.step-item {
  display: flex;
  gap: 15px;
  margin-bottom: 18px;
  padding: 16px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 32px;
  height: 32px;
  min-width: 32px;
  background-color: #af1e23;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.step-content h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
}

.step-content p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* Divider Section */
.divider-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 30px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #e0e0e0, transparent);
}

.divider-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
  padding: 0 8px;
}

/* Reset Form Section */
.reset-form-section {
  background-color: #f8f9fa;
  border: 2px solid #af1e23;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 25px;
}

.reset-form-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.reset-form-header svg {
  color: #af1e23;
  flex-shrink: 0;
}

.reset-form-header h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #af1e23;
  margin: 0;
}

.reset-form-description {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

/* Form Styles */
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  font-size: 0.95rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
  background-color: white;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #af1e23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.char-count {
  font-size: 0.85rem;
  color: #999;
  text-align: right;
  margin-top: 4px;
}

.loading-text,
.error-text {
  font-size: 0.85rem;
  margin-top: 6px;
  display: block;
}

.loading-text {
  color: #666;
}

.error-text {
  color: #c62828;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

/* Support Info */
.support-info {
  background-color: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 0;
}

.support-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.support-text {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.support-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.support-icon {
  color: #af1e23;
  flex-shrink: 0;
}

.support-contact {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #af1e23;
}

.support-link {
  color: #af1e23;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.primary {
  background-color: #af1e23;
  color: white;
  border: 2px solid #af1e23;
}

.action-btn.primary:not(:disabled):active {
  opacity: 0.9;
  transform: scale(0.98);
}

.action-btn.secondary {
  background-color: white;
  color: #666;
  border: 2px solid #ddd;
}

.action-btn.secondary:not(:disabled):active {
  background-color: #f5f5f5;
}

/* Responsive Design */
@media (max-width: 480px) {
  .device-key-modal-container {
    margin: 10px;
    border-radius: 8px;
  }
  
  .device-key-modal-header {
    padding: 25px 20px;
  }
  
  .device-key-modal-title {
    font-size: 1.5rem;
  }
  
  .device-key-modal-body {
    padding: 25px 20px;
  }
  
  .step-item {
    padding: 12px;
    gap: 12px;
  }
  
  .step-number {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: 0.9rem;
  }
  
  .step-content h5 {
    font-size: 0.95rem;
  }
  
  .step-content p {
    font-size: 0.85rem;
  }

  .reset-form-section {
    padding: 18px;
  }

  .reset-form-header h4 {
    font-size: 1.1rem;
  }

  .form-input,
  .form-textarea {
    padding: 10px 14px;
    font-size: 0.9rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .action-btn {
    padding: 12px 24px;
    font-size: 0.95rem;
  }
  
  .support-info {
    padding: 16px;
  }
}
</style>

