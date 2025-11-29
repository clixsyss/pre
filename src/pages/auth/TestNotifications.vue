<template>
  <div class="test-notifications-page">
    <h1>🔔 Test Notification Center</h1>
    <p class="subtitle">Create test notifications to verify the system works</p>
    
    <div class="buttons">
      <button @click="createInfoNotification" class="btn-info">
        📘 Create Info Notification
      </button>
      <button @click="createBookingNotificationTest" class="btn-booking">
        📅 Create Booking Notification
      </button>
      <button @click="createPaymentNotificationTest" class="btn-payment">
        💳 Create Payment Notification
      </button>
      <button @click="createViolationNotificationTest" class="btn-violation">
        ⚠️ Create Violation Notification
      </button>
      <button @click="createServiceNotificationTest" class="btn-service">
        🛠️ Create Service Notification
      </button>
      <button @click="createAnnouncementNotificationTest" class="btn-announcement">
        📢 Create Announcement
      </button>
      <button @click="createMultipleNotifications" class="btn-multiple">
        🎉 Create 5 Random Notifications
      </button>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>

    <div class="info-box">
      <h3>ℹ️ How to Test</h3>
      <ol>
        <li>Click any button above to create a test notification</li>
        <li>Look for the red badge on the bell icon in the header</li>
        <li>Click the bell icon to open the notification center</li>
        <li>Click on a notification to mark it as read</li>
        <li>Use "Mark all as read" to clear all unread notifications</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useProjectStore } from '../../stores/projectStore'
import optimizedAuthService from '../../services/optimizedAuthService'
import {
  createNotification,
  createBookingNotification,
  createPaymentNotification,
  createViolationNotification,
  createServiceNotification,
  createAnnouncementNotification,
  bulkCreateNotifications,
  NOTIFICATION_TYPES
} from '../../services/notificationCenterService'

// Component name for ESLint
defineOptions({
  name: 'TestNotifications'
})

const projectStore = useProjectStore()
const message = ref('')
const messageType = ref('success')

const showMessage = (msg, type = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const getUserAndProject = async () => {
  const user = await optimizedAuthService.getCurrentUser()
  const project = projectStore.selectedProject
  
  if (!user || !project) {
    showMessage('Please log in and select a project first', 'error')
    throw new Error('User or project not found')
  }
  
  return { userId: user.uid, projectId: project.id }
}

const createInfoNotification = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createNotification({
      userId,
      projectId,
      title: 'Information',
      message: 'This is a test info notification with some sample content to demonstrate the system.',
      type: NOTIFICATION_TYPES.INFO
    })
    showMessage('✅ Info notification created! Check the bell icon.')
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error')
  }
}

const createBookingNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createBookingNotification(
      userId,
      projectId,
      'Court Booking Confirmed',
      'Your tennis court booking for tomorrow at 3 PM has been confirmed.',
      '/my-bookings'
    )
    showMessage('✅ Booking notification created!')
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error')
  }
}

const createPaymentNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createPaymentNotification(
      userId,
      projectId,
      'Payment Received',
      'Your payment of $50 has been successfully processed. Thank you!',
      '/profile'
    )
    showMessage('✅ Payment notification created!')
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error')
  }
}

const createViolationNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createViolationNotification(
      userId,
      projectId,
      'New Parking Violation',
      'You have received a parking violation. Please review the details and respond within 7 days.',
      '/violations'
    )
    showMessage('✅ Violation notification created!')
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error')
  }
}

const createServiceNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createServiceNotification(
      userId,
      projectId,
      'Service Request Approved',
      'Your maintenance request has been approved and will be scheduled soon.',
      '/facilities'
    )
    showMessage('✅ Service notification created!')
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error')
  }
}

const createAnnouncementNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createAnnouncementNotification(
      userId,
      projectId,
      'Important Announcement',
      'Scheduled maintenance this Sunday from 2 AM to 4 AM. Services may be temporarily unavailable.',
      '/home'
    )
    showMessage('✅ Announcement notification created!')
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error')
  }
}

const createMultipleNotifications = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    
    const notifications = [
      {
        userId,
        projectId,
        title: 'System Update Available',
        message: 'A new version of the app is available with improved features.',
        type: NOTIFICATION_TYPES.ANNOUNCEMENT
      },
      {
        userId,
        projectId,
        title: 'Booking Reminder',
        message: 'Your court booking is tomorrow at 3 PM. See you there!',
        type: NOTIFICATION_TYPES.BOOKING,
        actionUrl: '/my-bookings'
      },
      {
        userId,
        projectId,
        title: 'Request Status Update',
        message: 'Your facility request has been reviewed and approved.',
        type: NOTIFICATION_TYPES.REQUEST,
        actionUrl: '/facilities'
      },
      {
        userId,
        projectId,
        title: 'Guest Pass Generated',
        message: 'Your guest pass has been generated successfully and is ready to use.',
        type: NOTIFICATION_TYPES.GATE,
        actionUrl: '/access'
      },
      {
        userId,
        projectId,
        title: 'Welcome to PRE Group!',
        message: 'Thank you for using our services. We\'re here to help!',
        type: NOTIFICATION_TYPES.SUCCESS
      }
    ]
    
    await bulkCreateNotifications(notifications)
    showMessage('✅ 5 notifications created! Check the bell icon.')
  } catch (error) {
    showMessage('❌ Error: ' + error.message, 'error')
  }
}
</script>

<style scoped>
.test-notifications-page {
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 100px;
}

h1 {
  color: #231F20;
  margin-bottom: 10px;
  text-align: center;
  font-size: 2rem;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 30px;
  font-size: 1rem;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

button {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

button:active {
  transform: scale(0.98);
}

.btn-info {
  background: #31ccec;
}

.btn-booking {
  background: #AF1E23;
}

.btn-payment {
  background: #21ba45;
}

.btn-violation {
  background: #c10015;
}

.btn-service {
  background: #31ccec;
}

.btn-announcement {
  background: #AF1E23;
}

.btn-multiple {
  background: #231F20;
  margin-top: 10px;
}

.message {
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background: rgba(33, 186, 69, 0.1);
  color: #21ba45;
  border: 2px solid #21ba45;
}

.message.error {
  background: rgba(193, 0, 21, 0.1);
  color: #c10015;
  border: 2px solid #c10015;
}

.info-box {
  background: #F6F6F6;
  border: 2px solid rgba(35, 31, 32, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.info-box h3 {
  margin: 0 0 15px 0;
  color: #231F20;
  font-size: 1.125rem;
}

.info-box ol {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
  line-height: 1.8;
}

.info-box li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .test-notifications-page {
    padding: 30px 16px 100px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  button {
    font-size: 0.9rem;
    padding: 14px 20px;
  }
}
</style>

