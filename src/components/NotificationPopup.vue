<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'notification-popup',
          `notification-${notification.type}`,
          { 'notification-visible': notification.visible }
        ]"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <q-icon
              :name="getIcon(notification.type)"
              :color="getIconColor(notification.type)"
              size="20px"
            />
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <button
            class="notification-close"
            @click.stop="removeNotification(notification.id)"
          >
            <q-icon name="close" size="16px" />
          </button>
        </div>
        <div class="notification-progress">
          <div
            class="notification-progress-bar"
            :style="{ animationDuration: '5s' }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '../stores/notifications'

// Component name for ESLint
defineOptions({ name: 'NotificationPopup' })

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)

const removeNotification = (id) => {
  notificationStore.removeNotification(id)
}

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'info'
  }
}

const getIconColor = (type) => {
  switch (type) {
    case 'success':
      return 'positive'
    case 'error':
      return 'negative'
    case 'warning':
      return 'warning'
    case 'info':
      return 'primary'
    default:
      return 'primary'
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification-popup {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 12px;
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  cursor: pointer;
  overflow: hidden;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.notification-popup:hover {
  transform: translateX(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.notification-success {
  border-left-color: #21ba45;
}

.notification-error {
  border-left-color: #c10015;
}

.notification-warning {
  border-left-color: #f2c037;
}

.notification-info {
  border-left-color: #1976d2;
}

.notification-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.notification-icon {
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.notification-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background-color: #f5f5f5;
  color: #666;
}

.notification-progress {
  height: 3px;
  background-color: #f0f0f0;
}

.notification-progress-bar {
  height: 100%;
  background-color: #ddd;
  animation: progress-shrink 5s linear forwards;
}

@keyframes progress-shrink {
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

/* Responsive design */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification-popup {
    min-width: auto;
    max-width: none;
  }
}
</style>
