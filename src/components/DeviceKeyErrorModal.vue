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
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="status-title">Account Security Alert</h3>
          <p class="status-description">
            {{ message }}
          </p>
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
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="handleClose" class="action-btn primary">
            OK, Got It
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'This device is not registered. Your account can only be accessed from your registered device.'
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
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
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Support Info */
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
  padding: 8px 0;
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

/* Action Buttons */
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

/* Responsive Design */
@media (max-width: 480px) {
  .device-key-modal-container {
    margin: 10px;
    border-radius: 6px;
  }
  
  .device-key-modal-header {
    padding: 25px 20px;
  }
  
  .device-key-modal-title {
    font-size: 1.5rem;
  }
  
  .device-key-modal-body {
    padding: 30px 20px;
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
