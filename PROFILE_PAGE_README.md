# Profile Page - PRE Group App

## Overview

The Profile page is a comprehensive user profile management interface that displays all user information collected during registration and provides a logout functionality.

## Features

### 🔐 **User Authentication Display**
- Shows complete user profile information
- Displays registration status and progress
- Shows email verification status
- Displays account creation and update timestamps

### 📱 **Personal Information Section**
- First Name and Last Name
- Mobile Number
- Date of Birth
- Gender
- National ID

### 🏠 **Property Information Section**
- Project Name
- Unit Number
- User Role (Owner/Family Member)

### 📊 **Account Information Section**
- Email verification status
- Registration completion status
- Profile completion status
- Account creation date
- Last update timestamp

### 🚪 **Logout Functionality**
- Secure logout with confirmation modal
- Redirects to registration page after logout
- Clears authentication state

## Navigation

### From Home Page
- **Header Profile Button**: Click the profile icon in the top-right corner
- **Bottom Navigation**: Tap the profile icon in the bottom navigation bar

### Direct Access
- Navigate directly to `/profile` (requires authentication)

## User Interface

### Profile Header
- **Avatar**: Displays user initials in a gradient circle
- **Name**: Shows full name or fallback to "User"
- **Email**: Displays registered email address
- **Status Badge**: Shows registration status (Pending/Completed/Verified)

### Information Sections
- **Personal Information**: User's personal details
- **Property Information**: Property and role details
- **Account Information**: Account status and metadata

### Status Indicators
- **Email Verification**: Green for verified, red for unverified
- **Profile Completion**: Green for complete, red for incomplete
- **Registration Status**: Color-coded badges for different states

## Technical Implementation

### Data Source
- Fetches user data from Firestore database
- Uses Firebase Authentication for user verification
- Integrates with existing registration store

### Error Handling
- Graceful fallbacks for missing data
- Loading states during data fetch
- Error messages with retry functionality

### Security
- Requires authentication to access
- User can only view their own profile
- Secure logout process

## Future Enhancements

### Planned Features
- **Edit Profile**: Modify personal information
- **Profile Picture**: Upload and manage profile images
- **Password Change**: Secure password management
- **Two-Factor Authentication**: Enhanced security
- **Notification Preferences**: Customize app notifications

### UI Improvements
- **Dark Mode**: Theme switching capability
- **Profile Customization**: Custom themes and layouts
- **Export Data**: Download profile information
- **Privacy Settings**: Control data visibility

## Usage Instructions

### Viewing Profile
1. Navigate to the Profile page from Home
2. View all sections of your profile
3. Check your registration status and completion

### Logging Out
1. Click the "Logout" button in the header
2. Confirm logout in the modal dialog
3. You'll be redirected to the registration page

### Troubleshooting
- **Profile Not Loading**: Check internet connection and try again
- **Missing Information**: Complete your registration if data is incomplete
- **Logout Issues**: Ensure you're properly authenticated

## Integration Points

### With Registration System
- Displays data collected during registration
- Shows progress through registration steps
- Integrates with email verification flow

### With Authentication System
- Uses Firebase Auth for user management
- Integrates with Firestore for data persistence
- Maintains session state across the app

### With Navigation System
- Accessible from Home page
- Protected by authentication guards
- Integrates with bottom navigation

## Development Notes

### Component Structure
- **Profile.vue**: Main profile page component
- **Firestore Integration**: Uses utility functions for data operations
- **Notification System**: Integrates with app-wide notification store

### Styling
- **Responsive Design**: Works on all screen sizes
- **Modern UI**: Clean, professional appearance
- **Accessibility**: Proper contrast and readable fonts

### Performance
- **Lazy Loading**: Data fetched on component mount
- **Efficient Rendering**: Conditional rendering for different states
- **Error Boundaries**: Graceful error handling

## Testing

### Manual Testing
1. Complete registration process
2. Navigate to profile page
3. Verify all information displays correctly
4. Test logout functionality
5. Check responsive design on different devices

### Automated Testing
- Unit tests for utility functions
- Component testing for UI elements
- Integration tests for data flow
- E2E tests for complete user journey

## Support

For issues or questions about the Profile page:
- Check browser console for error messages
- Verify Firebase configuration
- Ensure proper authentication state
- Contact development team for technical support
