# Testing Notification Center

## Quick Start Testing

### Option 1: Using Browser Console (Recommended for Quick Testing)

1. **Open the app in a web browser**
2. **Open browser console** (F12 or Right-click → Inspect → Console)
3. **Run one of these test commands**:

```javascript
// Get current user and project info (run this first)
const user = await $vm0.$auth.getCurrentUser()
const project = $vm0.$projectStore.selectedProject
console.log('User ID:', user.uid)
console.log('Project ID:', project.id)

// Test 1: Create a simple info notification
await $vm0.$createNotification({
  userId: user.uid,
  projectId: project.id,
  title: 'Welcome!',
  message: 'Welcome to the notification center. This is a test notification.',
  type: 'info'
})

// Test 2: Create a booking notification with action
await $vm0.$createNotification({
  userId: user.uid,
  projectId: project.id,
  title: 'Booking Confirmed',
  message: 'Your court booking for tomorrow at 3 PM has been confirmed.',
  type: 'booking',
  actionUrl: '/my-bookings'
})

// Test 3: Create a payment notification
await $vm0.$createNotification({
  userId: user.uid,
  projectId: project.id,
  title: 'Payment Received',
  message: 'Your payment of $50 has been successfully processed. Thank you!',
  type: 'payment',
  actionUrl: '/profile'
})

// Test 4: Create a violation notification
await $vm0.$createNotification({
  userId: user.uid,
  projectId: project.id,
  title: 'Parking Violation',
  message: 'You have received a parking violation. Please review the details and respond.',
  type: 'violation',
  actionUrl: '/violations'
})

// Test 5: Create multiple notifications at once
const notifications = [
  {
    userId: user.uid,
    projectId: project.id,
    title: 'Announcement',
    message: 'Scheduled maintenance this Sunday from 2 AM to 4 AM.',
    type: 'announcement'
  },
  {
    userId: user.uid,
    projectId: project.id,
    title: 'Service Request Update',
    message: 'Your maintenance request has been approved and scheduled.',
    type: 'service',
    actionUrl: '/facilities'
  },
  {
    userId: user.uid,
    projectId: project.id,
    title: 'Gate Access',
    message: 'Your guest pass has been generated successfully.',
    type: 'gate',
    actionUrl: '/access'
  }
]

// Import the service first
const { bulkCreateNotifications } = await import('./src/services/notificationCenterService.js')
await bulkCreateNotifications(notifications)
```

### Option 2: Create a Test Page

Create a temporary test page at `src/pages/auth/TestNotifications.vue`:

```vue
<template>
  <div class="test-notifications-page">
    <h1>Test Notification Center</h1>
    
    <div class="buttons">
      <button @click="createInfoNotification">Create Info</button>
      <button @click="createBookingNotification">Create Booking</button>
      <button @click="createPaymentNotification">Create Payment</button>
      <button @click="createViolationNotification">Create Violation</button>
      <button @click="createServiceNotification">Create Service</button>
      <button @click="createMultipleNotifications">Create 5 Random</button>
      <button @click="clearAllNotifications" class="danger">Clear All (Dev Only)</button>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
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
  bulkCreateNotifications,
  NOTIFICATION_TYPES
} from '../../services/notificationCenterService'

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
      message: 'This is a test info notification with some sample content.',
      type: NOTIFICATION_TYPES.INFO
    })
    showMessage('Info notification created!')
  } catch (error) {
    showMessage('Error: ' + error.message, 'error')
  }
}

const createBookingNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createBookingNotification(
      userId,
      projectId,
      'Booking Confirmed',
      'Your court booking for tomorrow at 3 PM has been confirmed.',
      '/my-bookings'
    )
    showMessage('Booking notification created!')
  } catch (error) {
    showMessage('Error: ' + error.message, 'error')
  }
}

const createPaymentNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createPaymentNotification(
      userId,
      projectId,
      'Payment Received',
      'Your payment of $50 has been successfully processed.',
      '/profile'
    )
    showMessage('Payment notification created!')
  } catch (error) {
    showMessage('Error: ' + error.message, 'error')
  }
}

const createViolationNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createViolationNotification(
      userId,
      projectId,
      'New Violation',
      'You have received a parking violation. Please review and respond.',
      '/violations'
    )
    showMessage('Violation notification created!')
  } catch (error) {
    showMessage('Error: ' + error.message, 'error')
  }
}

const createServiceNotificationTest = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    await createServiceNotification(
      userId,
      projectId,
      'Service Request Update',
      'Your maintenance request has been approved and scheduled.',
      '/facilities'
    )
    showMessage('Service notification created!')
  } catch (error) {
    showMessage('Error: ' + error.message, 'error')
  }
}

const createMultipleNotifications = async () => {
  try {
    const { userId, projectId } = await getUserAndProject()
    
    const notifications = [
      {
        userId,
        projectId,
        title: 'System Update',
        message: 'The app has been updated with new features.',
        type: NOTIFICATION_TYPES.ANNOUNCEMENT
      },
      {
        userId,
        projectId,
        title: 'Booking Reminder',
        message: 'Your court booking is tomorrow at 3 PM.',
        type: NOTIFICATION_TYPES.BOOKING,
        actionUrl: '/my-bookings'
      },
      {
        userId,
        projectId,
        title: 'Request Approved',
        message: 'Your facility request has been approved.',
        type: NOTIFICATION_TYPES.REQUEST,
        actionUrl: '/facilities'
      },
      {
        userId,
        projectId,
        title: 'Gate Pass Ready',
        message: 'Your guest pass has been generated successfully.',
        type: NOTIFICATION_TYPES.GATE,
        actionUrl: '/access'
      },
      {
        userId,
        projectId,
        title: 'Welcome Message',
        message: 'Thank you for using PRE Group services!',
        type: NOTIFICATION_TYPES.SUCCESS
      }
    ]
    
    await bulkCreateNotifications(notifications)
    showMessage('5 notifications created!')
  } catch (error) {
    showMessage('Error: ' + error.message, 'error')
  }
}

const clearAllNotifications = async () => {
  showMessage('Clear functionality not implemented (Firebase Admin SDK required)', 'error')
}
</script>

<style scoped>
.test-notifications-page {
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: #231F20;
  margin-bottom: 30px;
  text-align: center;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
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
}

button:hover {
  background: #8a1519;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

button:active {
  transform: translateY(0);
}

button.danger {
  background: #c10015;
}

button.danger:hover {
  background: #a00012;
}

.message {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
}

.message.success {
  background: rgba(33, 186, 69, 0.1);
  color: #21ba45;
  border: 1px solid #21ba45;
}

.message.error {
  background: rgba(193, 0, 21, 0.1);
  color: #c10015;
  border: 1px solid #c10015;
}
</style>
```

Then add this route to `src/router/routes.js`:

```javascript
{
  path: '/test-notifications',
  component: () => import('pages/auth/TestNotifications.vue'),
  meta: { requiresAuth: true }
}
```

Navigate to `/test-notifications` in your app to test!

### Option 3: Firebase Console

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Create a document in `Notifications` collection:

```json
{
  "userId": "YOUR_USER_ID",
  "projectId": "YOUR_PROJECT_ID", 
  "title": "Test Notification",
  "message": "This is a test notification created from Firebase Console.",
  "type": "info",
  "actionUrl": "/home",
  "read": false,
  "readAt": null,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

Replace `YOUR_USER_ID` and `YOUR_PROJECT_ID` with actual values from your auth and project data.

## What to Test

### ✅ Basic Functionality
- [ ] Notification bell appears in header
- [ ] Badge shows correct unread count
- [ ] Modal opens when bell is clicked
- [ ] Notifications appear in the list
- [ ] Real-time updates (create notification, see it appear immediately)

### ✅ Mark as Read
- [ ] Click notification to mark as read
- [ ] Badge count decreases
- [ ] Red indicator line disappears
- [ ] Notification stays in list but marked as read

### ✅ Mark All as Read
- [ ] "Mark all as read" button appears when there are unread notifications
- [ ] All notifications marked as read at once
- [ ] Badge disappears or shows 0

### ✅ Navigation
- [ ] Clicking notification with actionUrl navigates correctly
- [ ] Modal closes after navigation

### ✅ Empty State
- [ ] Shows empty state when no notifications
- [ ] Shows friendly message and icon

### ✅ Loading State
- [ ] Shows loading spinner while fetching

### ✅ Responsive Design
- [ ] Works on mobile screen sizes
- [ ] Bell icon properly sized on different screens
- [ ] Modal is full-screen on very small devices

### ✅ Icon Types
- [ ] Different notification types show correct icons
- [ ] Icons have appropriate colors

## Expected Behavior

1. **Create Notification** → Badge appears/increments immediately (real-time)
2. **Open Modal** → See all notifications from past 30 days
3. **Click Notification** → Marked as read, badge decrements, navigation occurs
4. **Mark All as Read** → All notifications marked, badge disappears
5. **Close Modal** → Can reopen and see same notifications (persistent)

## Common Issues

### Badge Not Showing
- Check userId in notification matches logged-in user
- Check projectId matches selected project
- Check console for Firestore errors

### Notifications Not Appearing
- Verify Firestore indexes are deployed
- Check Firestore rules allow read access
- Verify notification is less than 30 days old

### Real-time Not Working
- Check Firestore listener is subscribed
- Verify network connection
- Check console for errors

## Next Steps

After testing manually:
1. Deploy to a real device (iOS/Android)
2. Test with multiple users
3. Test with many notifications (100+)
4. Test network offline/online scenarios
5. Integrate with existing features (bookings, payments, etc.)

