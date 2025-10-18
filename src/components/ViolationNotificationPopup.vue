<template>
  <div v-if="isVisible" class="notification-overlay" @click="closeNotification">
    <div class="notification-popup" @click.stop>
      <!-- Animated Background -->
      <div class="notification-bg">
        <div class="pulse-ring"></div>
        <div class="pulse-ring delay-1"></div>
        <div class="pulse-ring delay-2"></div>
      </div>
      
      <!-- Notification Content -->
      <div class="notification-content">
        <!-- Icon with Animation -->
        <div class="notification-icon">
          <div class="icon-container">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="icon-glow"></div>
        </div>
        
        <!-- Text Content -->
        <div class="notification-text">
          <h3 class="notification-title">
            <span class="title-highlight">{{ $t('violationNotice') }}</span>
            <span class="title-subtitle">{{ $t('actionRequired') }}</span>
          </h3>
          <p class="notification-message">
            {{ $t('outstandingViolation') }} <strong>{{ violationCount }}</strong> {{ violationCount > 1 ? $t('outstandingViolationsPlural') : $t('outstandingViolations') }} {{ violationCount === 1 ? $t('requiresAttention') : $t('requireAttention') }}.
          </p>
          <div class="notification-details">
            <div class="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ $t('pleaseReviewAction') }}</span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="notification-actions">
          <button @click="viewViolations" class="action-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('reviewViolations') }}
          </button>
          <button @click="closeNotification" class="action-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// Component name for ESLint
defineOptions({
  name: 'ViolationNotificationPopup'
})

// Props
const props = defineProps({
  violationCount: {
    type: Number,
    required: true
  },
  isVisible: {
    type: Boolean,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'view-violations'])


// Methods
const closeNotification = () => {
  emit('close')
}

const viewViolations = () => {
  emit('view-violations')
  closeNotification()
}

// Auto-close after 15 seconds
onMounted(() => {
  if (props.isVisible) {
    setTimeout(() => {
      closeNotification()
    }, 15000)
  }
})
</script>

<style scoped>
.notification-overlay {
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
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.notification-popup {
  position: relative;
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.notification-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  pointer-events: none;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 1px solid #AF1E23;
  border-radius: 50%;
  animation: pulse 3s infinite;
  opacity: 0.2;
}

.pulse-ring.delay-1 {
  animation-delay: 1s;
  width: 90px;
  height: 90px;
}

.pulse-ring.delay-2 {
  animation-delay: 2s;
  width: 100px;
  height: 100px;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0;
  }
}

.notification-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.notification-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.icon-container {
  width: 72px;
  height: 72px;
  background: #AF1E23;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(175, 30, 35, 0.2);
  animation: iconBounce 0.6s ease-out;
}

@keyframes iconBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  background: radial-gradient(circle, rgba(175, 30, 35, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.notification-text {
  margin-bottom: 32px;
}

.notification-title {
  margin: 0 0 16px 0;
  font-size: 1.375rem;
  font-weight: 700;
  line-height: 1.3;
}

.title-highlight {
  display: block;
  color: #AF1E23;
  font-weight: 800;
}

.title-subtitle {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notification-message {
  margin: 0 0 20px 0;
  font-size: 1rem;
  color: #374151;
  line-height: 1.5;
}

.notification-details {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 8px 16px;
  border-radius: 20px;
}

.notification-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 120px;
  justify-content: center;
}

.action-btn.primary {
  background: #AF1E23;
  color: white;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

/* Mobile app - hover effects disabled */
/* .action-btn.primary:hover {
  background: #991b1f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
} */

.action-btn.secondary {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

/* Mobile app - hover effects disabled */
/* .action-btn.secondary:hover {
  background: #e5e7eb;
  color: #374151;
} */

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

/* Mobile app - hover effects disabled */
/* .close-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #374151;
  transform: scale(1.1);
} */

/* Mobile Optimizations */
@media (max-width: 480px) {
  .notification-overlay {
    padding: 16px;
  }
  
  .notification-popup {
    padding: 24px;
    border-radius: 20px;
  }
  
  .icon-container {
    width: 64px;
    height: 64px;
  }
  
  .notification-title {
    font-size: 1.25rem;
  }
  
  .notification-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

/* Dark mode support - currently disabled for mobile app */
/* @media (prefers-color-scheme: dark) {
  .notification-popup {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    color: white;
  }
  
  .notification-message {
    color: #d1d5db;
  }
  
  .detail-item {
    background: #374151;
    color: #9ca3af;
  }
  
  .action-btn.secondary {
    background: #374151;
    color: #d1d5db;
    border-color: #4b5563;
  }
  
  .action-btn.secondary:hover {
    background: #4b5563;
    color: white;
  }
  
  .close-btn {
    background: rgba(31, 41, 55, 0.8);
    color: #9ca3af;
  }
  
  .close-btn:hover {
    background: rgba(31, 41, 55, 1);
    color: white;
  }
} */
</style>
