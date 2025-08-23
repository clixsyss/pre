# Authentication Flow - PRE Group App

## Overview

The PRE Group app implements a controlled authentication system that ensures all users complete a specific registration process before accessing the application. This document outlines the authentication flow, restrictions, and implementation details.

## Authentication Restrictions

### 🚫 **Google Sign-Up Disabled**
- **New users cannot create accounts using Google authentication**
- **Reason**: PRE Group requires specific user details and verification that cannot be obtained through Google OAuth
- **Implementation**: Google sign-in attempts for new users are rejected with appropriate error messages

### ✅ **Google Sign-In for Existing Users Only**
- **Existing users can sign in using Google authentication**
- **Prerequisite**: User must have completed the full registration process
- **Profile Completion Check**: System validates that all required profile fields are complete

### 🔒 **Profile Completion Enforcement**
- **Users cannot access protected routes without complete profiles**
- **Automatic Redirects**: Incomplete profiles are automatically redirected to appropriate completion steps
- **Route Guards**: Navigation guards prevent access to protected areas

## Registration Flow

### **Step 1: Personal Information**
- User enters email address
- System creates temporary Firebase account
- Verification email is sent
- **No Google sign-up option available**

### **Step 2: Email Verification**
- User clicks verification link in email
- Email verification status is updated in Firestore
- User can proceed to next step

### **Step 3: Property Information**
- User selects compound from predefined list
- User selects unit from compound-specific options
- User chooses role (Owner or Family Member)

### **Step 4: Personal Details**
- User completes personal information form
- Required fields: First Name, Last Name, Mobile, DOB, Gender, National ID
- User sets password for account
- Profile is marked as complete

## Google Sign-In Flow

### **For New Users**
```
1. User attempts Google sign-in
2. System immediately validates user eligibility
3. If no user document exists:
   - User is automatically signed out from Firebase
   - Rejection record is created for tracking
   - Error message: "User account does not exist. Please use our custom registration process."
   - No orphaned Firebase accounts are created
```

### **For Existing Users with Incomplete Profiles**
```
1. User attempts Google sign-in
2. System validates profile completion
3. If profile is incomplete:
   - User data is loaded into registration store
   - User is redirected to appropriate completion step
   - Message: "Please complete your profile information before proceeding"
```

### **For Existing Users with Complete Profiles**
```
1. User attempts Google sign-in
2. System validates profile completion
3. If profile is complete:
   - Last login timestamp is updated
   - User is redirected to home page
   - Success message: "Welcome back!"
```

## Profile Validation

### **Required Fields**
The system checks for the following required fields:

#### **Personal Information**
- `firstName` - User's first name
- `lastName` - User's last name
- `mobile` - Mobile phone number
- `dateOfBirth` - Date of birth
- `nationalId` - National identification number

#### **Property Information**
- `compound` - Selected compound
- `unit` - Selected unit number
- `role` - User role (owner/family)

#### **System Information**
- `email` - Email address
- `emailVerified` - Email verification status

### **Validation Logic**
```javascript
const isComplete = hasPersonalDetails && hasPropertyDetails && hasSystemDetails
```

## Route Protection

### **Protected Routes**
- `/home` - Main application
- `/profile` - User profile page

### **Route Guard Behavior**
```
1. User attempts to access protected route
2. System checks authentication status
3. If authenticated, system validates profile completion
4. If profile incomplete, user is redirected to appropriate completion step
5. If profile complete, access is granted
```

### **Redirection Logic**
```javascript
switch (nextStep) {
  case 'email_verification':
    redirect('/register/verify-email')
  case 'property_details':
    redirect('/register')
  case 'personal_details':
    redirect('/register/personal-details')
  default:
    redirect('/register')
}
```

## Implementation Details

### **Rejection Tracking System**
The system includes a comprehensive rejection tracking mechanism to monitor attempted Google sign-ups:

#### **Rejection Records**
- **Collection**: `rejectedSignUps` in Firestore
- **Purpose**: Track and analyze attempted unauthorized sign-ups
- **Data Captured**:
  - Email address
  - Timestamp of attempt
  - Reason for rejection
  - User agent information
  - Cleanup status

#### **Cleanup Process**
- **Immediate Sign-out**: Users are automatically signed out if ineligible
- **Rejection Logging**: All attempts are logged for security analysis
- **No Orphaned Accounts**: Firebase authentication is cleaned up immediately

### **Key Files Modified**

#### **Register.vue**
- Added registration notice explaining custom registration requirement
- Removed Google sign-up functionality
- Enhanced user experience with clear messaging

#### **SignIn.vue**
- Modified Google sign-in logic to check profile completion
- Added profile completion validation
- Implemented automatic redirection for incomplete profiles
- Added visual indicators for Google sign-in restrictions

#### **Router (index.js)**
- Enhanced navigation guards with profile completion checks
- Automatic redirection for incomplete profiles
- Comprehensive route protection

#### **Profile Validation (profileValidation.js)**
- New utility functions for profile validation
- Step-by-step completion checking
- User-friendly error messages

#### **User Validation (userValidation.js)**
- Pre-authentication user existence checking
- Google sign-in eligibility validation
- Email validation utilities

#### **Google Auth Helper (googleAuthHelper.js)**
- Centralized Google authentication logic
- Automatic cleanup of rejected sign-ins
- Comprehensive error handling

### **Database Schema**
```javascript
{
  // Personal Information
  email: "user@example.com",
  emailVerified: true,
  firstName: "John",
  lastName: "Doe",
  mobile: "+1234567890",
  dateOfBirth: "1990-01-01",
  gender: "male",
  nationalId: "123456789",
  
  // Property Information
  compound: "palm_hills",
  unit: "A1",
  role: "owner",
  
  // Metadata
  registrationStatus: "completed",
  registrationStep: "complete",
  isProfileComplete: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Firebase Auth Info
  authUid: "firebase-user-uid",
  lastLoginAt: Timestamp
}
```

## User Experience

### **Clear Messaging**
- **Registration Notice**: Explains why custom registration is required
- **Google Sign-in Notice**: Clarifies that Google sign-in is for existing users only
- **Profile Completion Messages**: Specific feedback on what needs to be completed

### **Seamless Flow**
- **Automatic Redirects**: Users are automatically taken to the right completion step
- **Progress Persistence**: User data is preserved across steps
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### **Visual Indicators**
- **Progress Bars**: Clear indication of registration progress
- **Status Badges**: Visual feedback on completion status
- **Form Validation**: Real-time feedback on required fields

## Security Considerations

### **Data Validation**
- All user inputs are validated before processing
- Required fields are enforced at multiple levels
- Profile completion is verified before granting access

### **Authentication Flow**
- Google sign-in is restricted to existing users only
- Profile completion is enforced for all authenticated users
- Route guards prevent unauthorized access

### **Error Handling**
- Comprehensive error handling for all authentication scenarios
- User-friendly error messages without exposing system details
- Graceful fallbacks for edge cases

## Testing Scenarios

### **New User Registration**
1. User attempts Google sign-up → Rejected with clear message
2. User completes custom registration → Success
3. User attempts to access protected routes → Allowed

### **Existing User Sign-in**
1. User with complete profile signs in with Google → Success
2. User with incomplete profile signs in with Google → Redirected to completion
3. User completes missing details → Access granted

### **Route Protection**
1. Incomplete profile user tries to access `/home` → Redirected to completion
2. Complete profile user accesses protected routes → Access granted
3. Unauthenticated user tries protected route → Redirected to onboarding

## Troubleshooting

### **Common Issues**

#### **Google Sign-in Fails for New Users**
- **Cause**: New users cannot use Google sign-in
- **Solution**: Direct users to custom registration process

#### **Profile Completion Loop**
- **Cause**: Missing required fields in database
- **Solution**: Check Firestore data integrity and required fields

#### **Route Guard Errors**
- **Cause**: Database connection issues or validation errors
- **Solution**: Check Firebase configuration and network connectivity

### **Debug Steps**
1. Check browser console for error messages
2. Verify Firebase configuration
3. Check Firestore security rules
4. Validate user document structure
5. Test authentication flow step by step

## Future Enhancements

### **Planned Features**
- **Enhanced Validation**: Real-time field validation
- **Progress Tracking**: Visual progress indicators
- **Offline Support**: Work without internet connection
- **Multi-language**: Support for different languages

### **Security Improvements**
- **Two-Factor Authentication**: Enhanced security
- **Biometric Authentication**: Mobile device integration
- **Session Management**: Advanced session controls
- **Audit Logging**: Comprehensive access logging

## Conclusion

The PRE Group authentication system provides a secure, controlled user registration and access system that ensures all users complete the required profile information before accessing the application. The system balances security requirements with user experience, providing clear guidance and seamless flow for users while maintaining strict access controls.
