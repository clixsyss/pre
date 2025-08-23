# Registration Flow - PRE Group App

## Overview

The registration process has been updated to follow a clear, sequential flow that matches the design requirements. Users must complete each step in order before proceeding to the next.

## Registration Flow

### 🔄 **Step 1: Personal Information**
- **Purpose**: Collect user's email address
- **Actions**:
  - User enters email address
  - System validates email format
  - Creates temporary Firebase account
  - Sends verification email
- **Navigation**: User is redirected to email verification page
- **Data Saved**: Email address to registration store and Firestore

### 🏠 **Step 2: Property Information**
- **Purpose**: Collect property and role details
- **Prerequisites**: Email must be verified
- **Actions**:
  - User selects compound from dropdown
  - User selects unit from dropdown (enabled after compound selection)
  - User chooses role (Owner or Family Member)
- **Navigation**: User can go back to personal step or continue to personal details
- **Data Saved**: Compound, unit, and role to registration store and Firestore

### 👤 **Step 3: Personal Details**
- **Purpose**: Complete user profile information
- **Prerequisites**: Property details must be completed
- **Actions**:
  - User enters first name, last name, mobile, DOB, gender, national ID
  - User sets password and confirms it
  - System updates Firebase user profile
- **Navigation**: User is redirected to home page upon completion
- **Data Saved**: Complete user profile to Firestore

## User Interface Changes

### **Progress Indicator**
- **Visual Design**: Two-step progress indicator with icons and labels
- **Active State**: Current step highlighted in orange (#ff6b35)
- **Completed State**: Previous steps shown in green (#4CAF50)
- **Inactive State**: Future steps shown in light gray (#e1e5e9)

### **Step Navigation**
- **Sequential Flow**: Users cannot skip steps or access future steps prematurely
- **Back Navigation**: Users can go back to previous steps
- **Progress Tracking**: Clear visual indication of current progress

### **Form Validation**
- **Required Fields**: All fields must be completed before proceeding
- **Dependent Fields**: Unit selection is disabled until compound is selected
- **Real-time Validation**: Form buttons are disabled until requirements are met

## Data Structure

### **Personal Data**
```javascript
{
  email: "user@example.com"
}
```

### **Property Data**
```javascript
{
  compound: "palm_hills", // Selected compound
  unit: "A1",             // Selected unit
  role: "owner"           // "owner" or "family"
}
```

### **User Details**
```javascript
{
  firstName: "John",
  lastName: "Doe",
  mobile: "+1234567890",
  dateOfBirth: "1990-01-01",
  gender: "male",
  nationalId: "123456789",
  password: "securepassword"
}
```

## Compound and Unit Options

### **Available Compounds**
- Palm Hills Compound
- Beverly Hills Compound
- Garden City Compound
- Sunset Valley Compound
- Oasis Gardens Compound

### **Available Units**
- A1, A2, A3
- B1, B2, B3
- C1, C2, C3

### **User Roles**
- **Owner**: Primary property owner
- **Family Member**: Family member living in the property

## Technical Implementation

### **State Management**
- **Current Step**: Tracks which step user is currently on
- **Form Data**: Stores user input across steps
- **Validation**: Ensures required fields are completed
- **Navigation**: Controls step-to-step movement

### **Firestore Integration**
- **Data Persistence**: Saves data at each step
- **User Documents**: Creates and updates user records
- **Progress Tracking**: Stores registration completion status
- **Real-time Updates**: Reflects changes immediately

### **Authentication Flow**
- **Temporary Account**: Created during personal step
- **Email Verification**: Required before property step
- **Profile Completion**: Final step updates user profile
- **Session Management**: Maintains user state throughout process

## User Experience

### **Clear Progress Indication**
- Users always know where they are in the process
- Visual feedback for completed and current steps
- Intuitive navigation between steps

### **Form Validation**
- Immediate feedback on required fields
- Clear error messages for validation failures
- Disabled states for dependent fields

### **Data Persistence**
- User data is saved at each step
- No data loss if user navigates away
- Seamless continuation from any point

## Future Enhancements

### **Additional Steps**
- **Document Upload**: ID verification documents
- **Terms & Conditions**: Legal agreement acceptance
- **Payment Setup**: Registration fee processing

### **Enhanced Validation**
- **Real-time Email Check**: Verify email availability
- **Phone Verification**: SMS verification for mobile
- **Address Validation**: Verify property details

### **User Experience**
- **Progress Persistence**: Remember user's place in flow
- **Offline Support**: Work without internet connection
- **Multi-language**: Support for different languages

## Testing Scenarios

### **Happy Path**
1. User completes personal step
2. User verifies email
3. User completes property step
4. User completes personal details
5. User reaches home page

### **Edge Cases**
- **Email Already Exists**: Proper error handling
- **Invalid Email Format**: Validation feedback
- **Incomplete Forms**: Disabled continue buttons
- **Network Issues**: Graceful error handling

### **Navigation Testing**
- **Back Button**: Returns to previous step
- **Direct URL Access**: Proper step enforcement
- **Browser Refresh**: Maintains user progress
- **Session Expiry**: Proper redirect handling

## Troubleshooting

### **Common Issues**
- **Step Not Progressing**: Check form validation
- **Data Not Saving**: Verify Firestore connection
- **Email Not Sending**: Check Firebase configuration
- **Navigation Errors**: Verify route protection

### **Debug Steps**
1. Check browser console for errors
2. Verify Firebase configuration
3. Check Firestore security rules
4. Validate user authentication state

## Security Considerations

- **Route Protection**: Steps require proper authentication
- **Data Validation**: Server-side validation of all inputs
- **User Isolation**: Users can only access their own data
- **Session Management**: Secure authentication handling
