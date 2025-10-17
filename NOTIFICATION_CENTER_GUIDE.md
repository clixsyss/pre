# Notification Center Guide

## Overview

The PRE app now includes a comprehensive in-app notification system that displays notifications from the past 30 days. Users can view all their notifications, mark them as read, and navigate to related content.

## Features

✅ **Professional UI**: Sleek, modern design matching your app's black and red color scheme  
✅ **Real-time Updates**: Notifications update in real-time using Firestore listeners  
✅ **Unread Badge**: Shows the count of unread notifications on the bell icon  
✅ **Mark as Read**: Click on any notification to mark it as read  
✅ **Mark All as Read**: Bulk action to mark all notifications as read at once  
✅ **Action Navigation**: Notifications can include URLs to navigate to related content  
✅ **30-Day History**: Automatically shows notifications from the past month  
✅ **Mobile Optimized**: Fully responsive design for iOS and Android  
✅ **Icon Types**: Different icons and colors for different notification types  

## Architecture

### Components

1. **NotificationCenter.vue** - The main notification modal component
2. **notificationCenter.js** - Pinia store for state management
3. **notificationCenterService.js** - Service for creating notifications

### Firestore Structure

```
Notifications (collection)
├── {notificationId} (document)
    ├── userId: string (required)
    ├── projectId: string (required)
    ├── title: string (required)
    ├── message: string (required)
    ├── type: string (required) - one of the NOTIFICATION_TYPES
    ├── actionUrl: string (optional) - URL to navigate to
    ├── metadata: object (optional) - additional data
    ├── read: boolean (default: false)
    ├── readAt: timestamp (null until read)
    └── createdAt: timestamp (auto-generated)
```

## Usage

### Creating Notifications

#### Method 1: Using Helper Functions

```javascript
import {
  createBookingNotification,
  createPaymentNotification,
  createViolationNotification,
  createServiceNotification,
  createRequestNotification,
  createAnnouncementNotification,
  createGateNotification
} from '@/services/notificationCenterService'

// Example: Create a booking notification
await createBookingNotification(
  userId,
  projectId,
  'Booking Confirmed',
  'Your court booking for tomorrow at 3 PM has been confirmed.',
  '/my-bookings' // Optional action URL
)

// Example: Create a payment notification
await createPaymentNotification(
  userId,
  projectId,
  'Payment Received',
  'Your payment of $50 has been successfully processed.',
  '/profile'
)

// Example: Create a violation notification
await createViolationNotification(
  userId,
  projectId,
  'New Violation',
  'You have received a new parking violation. Please review the details.',
  '/violations'
)
```

#### Method 2: Using the Generic createNotification Function

```javascript
import { createNotification, NOTIFICATION_TYPES } from '@/services/notificationCenterService'

await createNotification({
  userId: 'user123',
  projectId: 'project456',
  title: 'Welcome!',
  message: 'Welcome to PRE Group. We\'re glad to have you here.',
  type: NOTIFICATION_TYPES.ANNOUNCEMENT,
  actionUrl: '/home', // Optional
  metadata: { // Optional
    category: 'welcome',
    priority: 'high'
  }
})
```

### Available Notification Types

```javascript
NOTIFICATION_TYPES = {
  INFO: 'info',           // Blue - General information
  SUCCESS: 'success',     // Green - Success messages
  WARNING: 'warning',     // Yellow - Warning messages
  ERROR: 'error',         // Red - Error messages
  ANNOUNCEMENT: 'announcement', // Red - Announcements
  BOOKING: 'booking',     // Red - Booking related
  PAYMENT: 'payment',     // Green - Payment related
  VIOLATION: 'violation', // Red - Violations
  SERVICE: 'service',     // Blue - Service requests
  REQUEST: 'request',     // Yellow - General requests
  COMPLAINT: 'complaint', // Red - Complaints
  GATE: 'gate',          // Red - Gate access
  DEFAULT: 'default'      // Gray - Default
}
```

### Bulk Creating Notifications

Send notifications to multiple users at once:

```javascript
import { bulkCreateNotifications } from '@/services/notificationCenterService'

const notifications = [
  {
    userId: 'user1',
    projectId: 'project1',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday 2 AM.',
    type: 'announcement'
  },
  {
    userId: 'user2',
    projectId: 'project1',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday 2 AM.',
    type: 'announcement'
  }
]

await bulkCreateNotifications(notifications)
```

## Integration Examples

### Example 1: Booking Confirmation

```javascript
// In your booking service
async function confirmBooking(bookingData) {
  // ... booking logic ...
  
  // Send notification to user
  await createBookingNotification(
    bookingData.userId,
    bookingData.projectId,
    'Booking Confirmed',
    `Your ${bookingData.courtName} booking on ${bookingData.date} at ${bookingData.time} has been confirmed.`,
    '/my-bookings'
  )
}
```

### Example 2: Payment Processing

```javascript
// In your payment service
async function processPayment(paymentData) {
  // ... payment logic ...
  
  // Send notification to user
  await createPaymentNotification(
    paymentData.userId,
    paymentData.projectId,
    'Payment Received',
    `Your payment of $${paymentData.amount} has been successfully processed.`,
    '/profile'
  )
}
```

### Example 3: New Violation

```javascript
// In your violation service
async function createViolation(violationData) {
  // ... create violation ...
  
  // Send notification to user
  await createViolationNotification(
    violationData.userId,
    violationData.projectId,
    'New Violation',
    `You have received a violation: ${violationData.reason}`,
    `/violation-chat/${violationData.id}`
  )
}
```

### Example 4: Service Request Update

```javascript
// In your service request handler
async function updateRequestStatus(requestId, status) {
  // ... update request ...
  
  const request = await getRequest(requestId)
  
  await createServiceNotification(
    request.userId,
    request.projectId,
    'Request Status Updated',
    `Your ${request.categoryName} request status is now: ${status}`,
    `/request-chat/${requestId}`
  )
}
```

### Example 5: Admin Announcement

```javascript
// Send announcement to all users in a project
async function sendProjectAnnouncement(projectId, title, message) {
  // Get all users in project
  const users = await getProjectUsers(projectId)
  
  // Create notifications for all users
  const notifications = users.map(user => ({
    userId: user.id,
    projectId: projectId,
    title: title,
    message: message,
    type: 'announcement',
    actionUrl: '/home'
  }))
  
  await bulkCreateNotifications(notifications)
}
```

## Firebase Setup

### 1. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

### 2. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Testing

### Manual Testing

1. **Create a Test Notification**:
```javascript
// In browser console or a test page
import { createNotification, NOTIFICATION_TYPES } from '@/services/notificationCenterService'

await createNotification({
  userId: 'YOUR_USER_ID',
  projectId: 'YOUR_PROJECT_ID',
  title: 'Test Notification',
  message: 'This is a test notification to verify the system works.',
  type: NOTIFICATION_TYPES.INFO
})
```

2. **Check the Notification Bell**:
   - Look for the red badge showing unread count
   - Click the bell icon to open the notification center
   - Verify the notification appears

3. **Test Mark as Read**:
   - Click on the notification
   - Badge count should decrease
   - Notification should lose the red indicator line

4. **Test Mark All as Read**:
   - Create multiple test notifications
   - Click "Mark all as read" button
   - All notifications should be marked as read

### Firestore Console Testing

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Find the `Notifications` collection
4. Manually create a test document:
```json
{
  "userId": "YOUR_USER_ID",
  "projectId": "YOUR_PROJECT_ID",
  "title": "Test Title",
  "message": "Test message",
  "type": "info",
  "actionUrl": "/home",
  "read": false,
  "readAt": null,
  "createdAt": "2024-01-15T10:00:00Z"
}
```
5. Check if it appears in the app immediately (real-time)

## Best Practices

### 1. Keep Messages Concise
```javascript
// ✅ Good
message: 'Your booking for Court 1 is confirmed.'

// ❌ Too long
message: 'Your booking request for Court 1 on January 15, 2024 at 3:00 PM has been successfully confirmed and you will receive an email confirmation shortly...'
```

### 2. Use Appropriate Types
```javascript
// ✅ Good - Using specific type
type: NOTIFICATION_TYPES.BOOKING

// ❌ Bad - Using generic type for specific action
type: NOTIFICATION_TYPES.INFO
```

### 3. Include Action URLs When Relevant
```javascript
// ✅ Good - User can navigate to booking details
actionUrl: `/my-bookings/${bookingId}`

// ❌ Missing opportunity - User might want to see details
actionUrl: null
```

### 4. Add Useful Metadata
```javascript
// ✅ Good - Metadata for filtering/analytics
metadata: {
  bookingId: 'booking123',
  courtId: 'court5',
  category: 'sports'
}
```

### 5. Error Handling
```javascript
try {
  await createNotification({...})
} catch (error) {
  console.error('Failed to create notification:', error)
  // Don't let notification failures break your main flow
  // Notifications are supplementary, not critical
}
```

## Troubleshooting

### Notifications Not Appearing

1. **Check User Authentication**:
   - Ensure user is logged in
   - Verify userId matches authenticated user

2. **Check Project Selection**:
   - Ensure project is selected
   - Verify projectId in notifications matches selected project

3. **Check Firestore Rules**:
   - Verify rules allow read access
   - Check console for permission errors

4. **Check Indexes**:
   - Deploy indexes: `firebase deploy --only firestore:indexes`
   - Wait a few minutes for indexes to build

### Badge Not Updating

1. **Check Real-time Listener**:
   - Verify subscription is active
   - Check console for errors

2. **Check Notification Data**:
   - Ensure `read` field is boolean
   - Verify `userId` and `projectId` match current user/project

### Performance Issues

1. **Too Many Notifications**:
   - System automatically limits to 30 days
   - Consider archiving older notifications

2. **Slow Loading**:
   - Check Firestore indexes are deployed
   - Verify network connection

## Future Enhancements

- [ ] Push notifications integration
- [ ] Notification categories/filters
- [ ] Notification preferences
- [ ] Archive notifications
- [ ] Search notifications
- [ ] Export notification history

## Support

For issues or questions, contact the development team or refer to the main README.md.

