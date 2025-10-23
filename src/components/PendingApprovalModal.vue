<template>
  <div class="pending-modal-overlay">
    <div class="pending-modal-container">
      <!-- Header -->
      <div class="pending-modal-header">
        <h2 class="pending-modal-title">What Happens Next?</h2>
      </div>

      <!-- Body -->
      <div class="pending-modal-body">
        <!-- Status Message -->
        <div class="status-message">
          <div class="status-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="status-title">Account Pending Approval</h3>
          <p class="status-description">
            Your registration is complete! An admin will review your account shortly. You'll be notified once your account is approved.
          </p>
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps">
          <div class="step completed">
            <div class="step-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="step-label">Registration Completed</span>
          </div>
          <div class="step active">
            <div class="step-icon">
              <div class="loading-dot"></div>
            </div>
            <span class="step-label">Admin Review In Progress</span>
          </div>
          <div class="step">
            <div class="step-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="step-label">Account Approved</span>
          </div>
        </div>

        <!-- Support Information -->
        <div class="support-info">
          <h3 class="support-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.364 5.636L14.828 9.172M14.828 14.828L18.364 18.364M9.172 9.172L5.636 5.636M9.172 14.828L5.636 18.364M12 2.25C17.3848 2.25 21.75 6.61522 21.75 12C21.75 17.3848 17.3848 21.75 12 21.75C6.61522 21.75 2.25 17.3848 2.25 12C2.25 6.61522 6.61522 2.25 12 2.25Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Need Help?
          </h3>
          <div class="support-item">
            <svg class="support-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 8L7.89 12.26C8.22 12.52 8.78 12.52 9.11 12.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="support-text">
              Email: <a href="mailto:support@pre-group.com" class="support-link">support@pre-group.com</a>
            </span>
          </div>
          <div class="support-item">
            <svg class="support-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.31623C10.8618 8.72457 11.2439 9 11.6744 9H16.7053C17.4218 9 17.9129 9.67412 17.6081 10.3162L16.1141 13.6838C15.8093 14.3259 16.3004 15 17.0169 15H21C22.1046 15 23 15.8954 23 17V19C23 20.1046 22.1046 21 21 21H5C3.89543 21 3 20.1046 3 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="support-text">
              Phone: <a href="tel:+201234567890" class="support-link">+20 123 456 7890</a>
            </span>
          </div>
          <div class="support-item">
            <svg class="support-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.657 16.657L13.414 20.9C13.0235 21.2905 12.3903 21.2905 11.9998 20.9L7.75699 16.657C7.36646 16.2665 7.36646 15.6333 7.75699 15.2428L9.1718 13.828C9.56233 13.4375 10.1955 13.4375 10.586 13.828L12 15.242L13.414 13.828C13.8045 13.4375 14.4377 13.4375 14.8282 13.828L16.243 15.2428C16.6335 15.6333 16.6335 16.2665 16.243 16.657Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 11C15 12.6569 13.6569 14 12 14C10.3431 14 9 12.6569 9 11C9 9.34315 10.3431 8 12 8C13.6569 8 15 9.34315 15 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="support-text">
              Office: <span class="support-link">Visit our office for assistance</span>
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="handleLogout" class="action-btn primary">
            OK, Got It
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Define emits
const emit = defineEmits(['close'])

const handleLogout = () => {
  console.log('[PendingModal] Close button clicked')
  // Just emit close - the parent component will handle the actual logout
  emit('close')
  // Navigate to onboarding as a fallback
  router.push('/onboarding')
}
</script>

<style scoped>
/* Modal Overlay - matches app's dark theme */
.pending-modal-overlay {
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

/* Modal Container - matches app's card styling */
.pending-modal-container {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Header - matches app's header styling */
.pending-modal-header {
  background-color: #222222;
  color: white;
  padding: 30px;
  border-radius: 8px 8px 0 0;
  text-align: center;
}

.pending-modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.pending-modal-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* Body - matches app's content padding */
.pending-modal-body {
  padding: 40px 30px;
}

/* Status Message - matches app's message styling */
.status-message {
  text-align: center;
  margin-bottom: 30px;
}

.status-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  background-color: #e8f5e9;
  border: 2px solid #a5d6a7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2e7d32;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
}

.status-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Progress Steps - matches app's form styling */
.progress-steps {
  margin-bottom: 30px;
}

.step {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.step:last-child {
  margin-bottom: 0;
}

.step.completed {
  border-color: #4CAF50;
  background-color: #e8f5e9;
}

.step.active {
  border-color: #AF1E23;
  background-color: rgba(175, 30, 35, 0.05);
}

.step-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step.completed .step-icon {
  background-color: #4CAF50;
  color: white;
}

.step.active .step-icon {
  background-color: #AF1E23;
  color: white;
}

.step:not(.completed):not(.active) .step-icon {
  background-color: #e1e5e9;
  color: #999;
}

.step-label {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.step.completed .step-label {
  color: #2e7d32;
}

.step.active .step-label {
  color: #AF1E23;
}

.step:not(.completed):not(.active) .step-label {
  color: #666;
}

/* Loading dot animation */
.loading-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

/* Support Info - matches app's info styling */
.support-info {
  background-color: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.support-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.support-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 0;
}

.support-item:last-child {
  margin-bottom: 0;
}

.support-icon {
  width: 20px;
  height: 20px;
  color: #AF1E23;
  flex-shrink: 0;
}

.support-text {
  font-size: 0.95rem;
  color: #555;
  font-weight: 500;
}

.support-link {
  color: #AF1E23;
  text-decoration: none;
  font-weight: 600;
}

/* Mobile app - hover effects disabled */
/* .support-link:hover {
  text-decoration: underline;
} */

/* Action Buttons - matches app's button styling */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-btn {
  padding: 16px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
  display: inline-block;
}

.action-btn.primary {
  background-color: #AF1E23;
  color: white;
}

/* Mobile app - hover effects disabled */
/* .action-btn.primary:hover:not(:disabled) {
  background-color: #8B1A1F;
} */

.action-btn.secondary {
  background-color: #f8f9fa;
  color: #666;
  border: 2px solid #e1e5e9;
}

/* Mobile app - hover effects disabled */
/* .action-btn.secondary:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
} */

.action-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 480px) {
  .pending-modal-container {
    margin: 10px;
    border-radius: 6px;
  }
  
  .pending-modal-header {
    padding: 25px 20px;
  }
  
  .pending-modal-title {
    font-size: 1.5rem;
  }
  
  .pending-modal-body {
    padding: 30px 20px;
  }
  
  .step {
    padding: 12px;
  }
  
  .support-info {
    padding: 16px;
  }
  
  
  .action-btn {
    padding: 12px 20px;
    font-size: 0.95rem;
  }
}
</style>