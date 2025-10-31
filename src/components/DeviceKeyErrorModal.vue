<template>
  <div class="device-key-modal-overlay">
    <div class="device-key-modal-container">
      <!-- Header -->
      <div class="device-key-modal-header">
        <h2 class="device-key-modal-title">{{ $t('deviceNotRegistered') }}</h2>
      </div>

      <!-- Body -->
      <div class="device-key-modal-body">
        <!-- Status Message -->
        <div class="status-message">
          <div class="status-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 2L19 4M19 4L15.5 7.5M19 4L17 6M15.5 7.5L13 10L15 12L10 17H7V14L12 9L14.5 11.5L15.5 7.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="status-title">{{ $t('accountSecurityAlert') }}</h3>
          <p class="status-description">
            {{ message }}
          </p>
        </div>

        <!-- What This Means -->
        <div class="info-section">
          <h4 class="info-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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

        <!-- Support Information -->
        <div class="support-info">
          <h4 class="support-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('needHelpQuestion') }}
          </h4>
          <p class="support-text">
            {{ $t('needHelpDesc') }}
          </p>
          <div class="support-contact">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 8L7.89 12.26C8.22 12.52 8.78 12.52 9.11 12.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <a href="mailto:support@pre-group.com" class="support-link">{{ $t('supportEmail') }}</a>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="handleClose" class="action-btn primary">
            {{ $t('gotIt') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'DeviceKeyErrorModal',
})

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
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
  backdrop-filter: blur(4px);
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
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header - matches app's dark header */
.device-key-modal-header {
  background-color: #222222;
  color: white;
  padding: 30px;
  border-radius: 12px 12px 0 0;
  text-align: center;
}

.device-key-modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

/* Body */
.device-key-modal-body {
  padding: 35px 30px;
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
  background-color: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #856404;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
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

/* Support Info */
.support-info {
  background-color: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
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
  padding: 16px 40px;
  border: none;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
}

.action-btn.primary {
  background-color: #af1e23;
  color: white;
}

.action-btn.primary:active {
  opacity: 0.9;
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
  
  .support-info {
    padding: 16px;
  }
  
  .action-btn {
    padding: 14px 30px;
    font-size: 1rem;
  }
}
</style>

