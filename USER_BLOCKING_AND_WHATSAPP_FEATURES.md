# User Blocking and WhatsApp Integration Features

## 🎯 Overview

This document describes the new user blocking and WhatsApp integration features added to the PRE Group mobile app's gate access system.

## ✅ Features Implemented

### 1. User Blocking System

#### **Blocking Functionality**
- **Purpose**: Allow admins to block users from generating new gate passes
- **Scope**: Users can still use existing passes and access the gate directly
- **Types**: 
  - Permanent blocking
  - Temporary blocking (with expiration date)

#### **User Experience**
- **Orange Warning Bar**: Prominent orange banner appears when user is blocked
- **Disabled Generate Button**: Pass generation button is disabled for blocked users
- **Clear Messaging**: Explains why generation is blocked and when it will end (if temporary)

#### **Admin Controls**
- Block/unblock users via Firebase admin dashboard
- Set blocking reasons
- Set temporary blocking periods
- Automatic unblocking when temporary periods expire

### 2. WhatsApp Integration

#### **WhatsApp Sending**
- **Phone Number Field**: Added to gate pass generation form
- **Automatic Sending**: Passes are sent via WhatsApp when phone number is provided
- **Manual Sending**: Existing passes can be resent via WhatsApp
- **Cross-Platform**: Works on both native apps and web

#### **Message Format**
```
🚪 Gate Pass for [Guest Name]

📋 Pass Details:
• Guest: [Name]
• Purpose: [Purpose]
• Valid Until: [Date/Time]
• Pass Code: [Code]

📱 Instructions:
1. Show this message at the gate
2. The QR code will be sent separately
3. Present valid ID when requested

⚠️ Important:
• This pass is valid only for the specified time
• Do not share this pass with others
• Contact the property management if you have issues

---
Sent via PRE Group Mobile App
```

## 🔧 Technical Implementation

### Files Added/Modified

#### **New Services**
- `src/services/userBlockingService.js` - Handles user blocking logic
- `src/services/whatsappService.js` - Handles WhatsApp integration

#### **Modified Files**
- `src/pages/auth/Access.vue` - Updated with blocking UI and WhatsApp features
- `admin-user-blocking.js` - Admin utility script for blocking management

### Database Schema

#### **User Document Fields Added**
```javascript
{
  // Existing fields...
  
  // Blocking fields
  blockedFromGatePasses: boolean,
  blockedFromGatePassesAt: timestamp,
  blockedFromGatePassesBy: string, // Admin UID
  blockedFromGatePassesReason: string,
  blockedFromGatePassesUntil: timestamp, // For temporary blocking
  
  // Unblocking fields
  unblockedFromGatePassesAt: timestamp,
  unblockedFromGatePassesBy: string, // Admin UID
  unblockedFromGatePassesReason: string
}
```

#### **Gate Pass Document Fields Added**
```javascript
{
  // Existing fields...
  
  // WhatsApp integration
  phoneNumber: string // Optional phone number for WhatsApp sending
}
```

## 🎨 UI Components

### **Blocking Warning Bar**
- **Color**: Orange gradient background
- **Icon**: Warning icon
- **Animation**: Slide down animation
- **Content**: Title and detailed message about blocking

### **Generate Button States**
- **Normal**: Blue, enabled
- **Disabled**: Grayed out when user is blocked
- **Hint**: Red hint text below button when disabled

### **WhatsApp Integration**
- **Phone Field**: Added to generation dialog
- **WhatsApp Button**: Green button on pass cards (only if phone number exists)
- **Notifications**: Success/error messages for WhatsApp sending

## 🚀 Usage Instructions

### **For Users**

#### **Generating Passes**
1. Go to Gate Access → Gate Passes tab
2. Click "Generate Pass"
3. Fill in guest details
4. **Optional**: Enter phone number for WhatsApp sending
5. Click "Generate"

#### **Sending via WhatsApp**
- **During Generation**: Enter phone number in the form
- **For Existing Passes**: Click the green WhatsApp button on the pass card

### **For Admins**

#### **Using the Admin Script**
```bash
node admin-user-blocking.js
```

#### **Blocking a User**
1. Run the admin script
2. Sign in with admin credentials
3. Choose "Block user from gate passes"
4. Enter user email/ID
5. Enter blocking reason
6. Set expiration date (optional)

#### **Unblocking a User**
1. Run the admin script
2. Sign in with admin credentials
3. Choose "Unblock user from gate passes"
4. Enter user email/ID
5. Enter unblocking reason

#### **Checking User Status**
1. Run the admin script
2. Sign in with admin credentials
3. Choose "Check user blocking status"
4. Enter user email/ID

## 🔒 Security Considerations

### **User Blocking**
- Only admins can block/unblock users
- Blocking reasons are logged
- Temporary blocks automatically expire
- Users can still access existing passes

### **WhatsApp Integration**
- Phone numbers are stored locally
- WhatsApp URLs are generated client-side
- No sensitive data sent to external services
- Graceful fallback if WhatsApp is unavailable

## 🧪 Testing

### **Blocking Features**
1. **Test Blocking**: Use admin script to block a test user
2. **Test UI**: Verify orange bar appears and generate button is disabled
3. **Test Unblocking**: Unblock user and verify UI returns to normal
4. **Test Temporary Blocking**: Set expiration date and verify auto-unblocking

### **WhatsApp Features**
1. **Test Generation**: Generate pass with phone number
2. **Test Sending**: Verify WhatsApp opens with correct message
3. **Test Manual Sending**: Use WhatsApp button on existing passes
4. **Test Error Handling**: Test with invalid phone numbers

## 📱 Platform Support

### **Mobile Apps (iOS/Android)**
- ✅ User blocking UI
- ✅ WhatsApp integration
- ✅ Native sharing
- ✅ QR code generation

### **Web App**
- ✅ User blocking UI
- ✅ WhatsApp Web integration
- ✅ Download QR codes
- ✅ Responsive design

## 🔄 Future Enhancements

### **Potential Improvements**
- **Admin Dashboard UI**: Web interface for blocking management
- **Bulk Operations**: Block/unblock multiple users
- **Advanced Scheduling**: Recurring blocking periods
- **WhatsApp API**: Direct API integration for better reliability
- **SMS Fallback**: Send via SMS if WhatsApp fails
- **Analytics**: Track blocking patterns and WhatsApp usage

## 🐛 Troubleshooting

### **Common Issues**

#### **Blocking Not Working**
- Check if user document exists in Firebase
- Verify admin permissions
- Check console for error messages

#### **WhatsApp Not Opening**
- Check if phone number is valid
- Verify WhatsApp is installed (mobile)
- Check browser popup settings (web)

#### **UI Not Updating**
- Refresh the page
- Check if user is properly authenticated
- Verify Firebase connection

### **Debug Steps**
1. Check browser console for errors
2. Verify Firebase rules allow the operations
3. Test with a known working user account
4. Check network connectivity

## 📞 Support

For technical support or questions about these features:
1. Check the console logs for error messages
2. Verify Firebase configuration
3. Test with different user accounts
4. Contact the development team with specific error details

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
