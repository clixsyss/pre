# Firestore Database Integration for User Registration

This document explains how user registration data is saved to Firestore database throughout the registration process.

## Overview

The registration system now automatically saves all user data to Firestore at each step of the registration process, ensuring data persistence and real-time synchronization.

## Data Flow

### 1. Initial Registration (Personal Tab)
- **Trigger**: User submits email in personal tab
- **Data Saved**: 
  - Email address
  - Email verification status (false)
  - Registration status (pending)
  - Registration step (personal)
  - Creation timestamp
  - Firebase Auth UID

### 2. Email Verification
- **Trigger**: User verifies email via link
- **Data Updated**:
  - Email verification status (true)
  - Registration step (email_verified)
  - Update timestamp

### 3. Property Details
- **Trigger**: User submits property information
- **Data Updated**:
  - Project name
  - Unit number
  - User role (owner/family member)
  - Registration step (property)
  - Update timestamp

### 4. Personal Details Completion
- **Trigger**: User completes final personal details
- **Data Updated**:
  - First name
  - Last name
  - Mobile number
  - Date of birth
  - Gender
  - National ID
  - Registration status (completed)
  - Registration step (complete)
  - Profile completion flag (true)
  - Full name (computed)
  - Update timestamp

## Firestore Document Structure

```javascript
{
  // Personal Information
  email: "user@example.com",
  emailVerified: true,
  
  // Property Information
  project: "Project Name",
  unit: "Unit Number",
  role: "owner", // or "family"
  
  // User Details
  firstName: "John",
  lastName: "Doe",
  mobile: "+1234567890",
  dateOfBirth: "1990-01-01",
  gender: "male",
  nationalId: "123456789",
  fullName: "John Doe",
  
  // Metadata
  registrationStatus: "completed", // pending, completed, verified
  registrationStep: "complete", // personal, email_verified, property, complete
  isProfileComplete: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Firebase Auth Info
  authUid: "firebase-user-uid",
  lastLoginAt: Timestamp
}
```

## Security Rules

The Firestore security rules ensure:
- Users can only access their own data
- Data is protected during registration process
- Admins can access all user data for management
- Default deny-all policy for security

## Error Handling

The system includes comprehensive error handling:
- Firestore permission errors are caught and logged
- Registration continues even if Firestore updates fail
- User-friendly error messages for different failure scenarios
- Graceful degradation when database operations fail

## Implementation Details

### Functions Added

1. **`saveUserDataToFirestore(userId, userData)`**
   - Creates initial user document
   - Called after successful user creation

2. **`updateUserDataInFirestore(userId, updateData)`**
   - Updates existing user document
   - Uses merge option to preserve existing data

3. **`updateEmailVerificationInFirestore(userId)`**
   - Updates email verification status
   - Called when email is verified

4. **`updateUserDetailsInFirestore(userId, userDetails)`**
   - Updates final user details
   - Marks registration as complete

### Error Codes Handled

- `firestore/permission-denied`: Database access denied
- `firestore/unavailable`: Service temporarily unavailable
- `firestore/deadline-exceeded`: Operation timeout
- General Firestore errors with fallback handling

## Testing

To test the Firestore integration:

1. **Enable Firestore in Firebase Console**
2. **Deploy security rules**: `firebase deploy --only firestore:rules`
3. **Complete registration flow** and verify data appears in Firestore
4. **Check console logs** for successful operations
5. **Verify security rules** by testing unauthorized access

## Monitoring

The system logs all Firestore operations:
- Successful saves and updates
- Error details with error codes
- User ID and operation type
- Timestamps for debugging

## Future Enhancements

- **Real-time listeners** for live data updates
- **Offline support** with local caching
- **Data validation** at Firestore level
- **Audit logging** for compliance
- **Backup and recovery** procedures

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check Firestore security rules
   - Verify user authentication status
   - Ensure proper user ID matching

2. **Data Not Saving**
   - Check browser console for errors
   - Verify Firebase configuration
   - Check network connectivity

3. **Missing Fields**
   - Verify data structure in code
   - Check for null/undefined values
   - Ensure all required fields are populated

### Debug Steps

1. Enable detailed logging in browser console
2. Check Firestore console for document creation
3. Verify security rules are properly deployed
4. Test with different user accounts
5. Check Firebase project settings

## Security Considerations

- All user data is encrypted in transit
- Access is restricted to authenticated users only
- Users can only access their own data
- Admin access is controlled and audited
- Regular security rule reviews recommended
