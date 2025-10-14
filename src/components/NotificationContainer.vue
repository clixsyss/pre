<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <i v-if="notification.type === 'success'" class="fas fa-check-circle"></i>
            <i v-else-if="notification.type === 'error'" class="fas fa-exclamation-circle"></i>
            <i v-else-if="notification.type === 'warning'" class="fas fa-exclamation-triangle"></i>
            <i v-else class="fas fa-info-circle"></i>
          </div>
          <div class="notification-message">{{ notification.message }}</div>
          <button class="notification-close" @click.stop="removeNotification(notification.id)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="notification-progress" :style="{ animationDuration: `${notification.duration}ms` }"></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotification } from '@/composables/useNotification'

const { notifications, removeNotification } = useNotification()
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  pointer-events: none;
}

.notification {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  margin-bottom: 12px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  position: relative;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

/* Mobile app - hover effects disabled */
/* .notification:hover {
  transform: translateX(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
} */

.notification-success {
  border-left-color: #10b981;
}

.notification-error {
  border-left-color: #ef4444;
}

.notification-warning {
  border-left-color: #f59e0b;
}

.notification-info {
  border-left-color: #3b82f6;
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-success .notification-icon {
  color: #10b981;
}

.notification-error .notification-icon {
  color: #ef4444;
}

.notification-warning .notification-icon {
  color: #f59e0b;
}

.notification-info .notification-icon {
  color: #3b82f6;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

/* Mobile app - hover effects disabled */
/* .notification-close:hover {
  color: #6b7280;
  background: #f3f4f6;
} */

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, currentColor, transparent);
  animation: progress linear;
}

.notification-success .notification-progress {
  color: #10b981;
}

.notification-error .notification-progress {
  color: #ef4444;
}

.notification-warning .notification-progress {
  color: #f59e0b;
}

.notification-info .notification-progress {
  color: #3b82f6;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification {
    margin-bottom: 8px;
  }
  
  .notification-content {
    padding: 12px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}
</style>
