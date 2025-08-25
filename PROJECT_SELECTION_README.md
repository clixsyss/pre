# Project Selection System - PRE Group App

## Overview

The PRE Group app implements a project-based access control system where authenticated users must select a project before accessing the application. Each project provides different services and user experiences, making project selection a crucial step in the user journey.

## How It Works

### 1. **Project Assignment During Registration**
- Users select their projects during the registration process
- Projects are assigned based on their property location and role
- Project IDs are stored in the user's `property.projects` array

### 2. **Project Selection After Authentication**
- When an authenticated user opens the app, they must choose a project
- Users can only access projects they were assigned during registration
- Project selection is persisted in localStorage for convenience

### 3. **Project-Based User Experience**
- Each project has different services and features
- User interface adapts based on the selected project
- Project context is maintained throughout the user session

## Implementation Details

### **Project Store (`projectStore.js`)**

The project store manages all project-related state and operations:

```javascript
// Key methods:
- fetchUserProjects(userId)     // Fetches projects assigned to user
- fetchProjectsByIds(projectIds) // Fetches specific projects by IDs
- selectProject(project)        // Sets the currently selected project
- loadSelectedProject()         // Loads previously selected project
- hasSelectedProject            // Computed property for project selection status
```

### **Project Selection Page (`ProjectSelection.vue`)**

A dedicated page for users to choose their project:

- **Auto-selection**: If user has only one project, it's automatically selected
- **Multiple projects**: Users can choose from their available projects
- **Project switching**: Users can change projects at any time
- **Persistent selection**: Selected project is saved in localStorage

### **Router Protection**

The router automatically redirects users to project selection if needed:

```javascript
// Navigation guard checks:
1. User authentication status
2. Profile completion
3. Project selection status

// If no project selected → redirect to /project-selection
// If project selected → allow access to protected routes
```

### **Main Layout Integration**

The main layout displays the current project in the header:

- **Current project display**: Shows selected project name
- **Project switching**: Quick access to change projects
- **Visual feedback**: Clear indication of active project

## User Flow

### **New User Registration**
```
1. User completes registration with project assignments
2. User signs in to the app
3. System fetches user's assigned projects
4. User selects a project (or auto-selected if only one)
5. User accesses the app with project context
```

### **Existing User Sign-in**
```
1. User signs in with Google authentication
2. System validates profile completion
3. System checks project selection status
4. If no project selected → redirect to project selection
5. If project selected → proceed to home page
```

### **Project Switching**
```
1. User clicks project change button in header
2. User is taken to project selection page
3. User selects different project
4. User returns to app with new project context
5. All services and features update accordingly
```

## Database Schema

### **User Document Structure**
```javascript
{
  // ... other user fields
  property: {
    compound: "palm_hills",
    unit: "A1",
    role: "owner",
    projects: ["project_id_1", "project_id_2"] // Array of project IDs
  }
}
```

### **Project Document Structure**
```javascript
{
  id: "project_id_1",
  name: "Palm Hills Compound",
  description: "Luxury residential compound",
  location: "6th of October City",
  type: "residential",
  status: "active",
  services: ["access", "maintenance", "security"],
  // ... other project-specific fields
}
```

## Key Features

### **Automatic Project Detection**
- System automatically fetches user's assigned projects
- No manual project configuration required
- Projects are based on registration data

### **Seamless Project Switching**
- Users can change projects without re-authentication
- Project context is immediately updated
- All related data and services refresh automatically

### **Project Persistence**
- Selected project is remembered across sessions
- Users don't need to re-select project on each login
- Project selection survives app restarts

### **Access Control**
- Users can only access their assigned projects
- Router guards prevent unauthorized project access
- Project selection is enforced for all protected routes

## Error Handling

### **No Projects Available**
- Clear message when user has no assigned projects
- Guidance to contact administrator
- Support contact information provided

### **Project Loading Failures**
- Graceful error handling for network issues
- Retry mechanisms for failed requests
- User-friendly error messages

### **Invalid Project Selection**
- Validation of project selection
- Fallback to project selection page
- Clear feedback on selection requirements

## Future Enhancements

### **Project-Specific Features**
- Custom services per project
- Project-specific UI themes
- Project-based notifications

### **Advanced Project Management**
- Project switching without page reload
- Multiple project sessions
- Project comparison features

### **Administrative Tools**
- Project assignment management
- User access control
- Project analytics and reporting

## Testing Scenarios

### **Project Selection Flow**
1. User with multiple projects
2. User with single project (auto-selection)
3. User with no projects
4. Project switching functionality

### **Access Control**
1. Unauthorized project access attempts
2. Project selection persistence
3. Router protection enforcement

### **Error Handling**
1. Network failures during project loading
2. Invalid project data
3. Missing project assignments

## Troubleshooting

### **Common Issues**

#### **User Can't See Projects**
- Check user's `property.projects` array in Firestore
- Verify project documents exist and are accessible
- Check Firestore security rules

#### **Project Selection Not Persisting**
- Verify localStorage is working
- Check project store state management
- Ensure project selection is properly saved

#### **Router Redirects to Project Selection**
- Check if project is properly selected
- Verify localStorage has `selectedProjectId`
- Check project store state

### **Debug Steps**
1. Check browser console for errors
2. Verify Firestore data structure
3. Check project store state
4. Validate localStorage contents
5. Test project selection flow step by step

## Conclusion

The project selection system provides a robust foundation for multi-project access control in the PRE Group app. It ensures users can only access their assigned projects while providing a seamless experience for project switching and context management.

The system is designed to be:
- **Secure**: Users can only access assigned projects
- **User-friendly**: Clear project selection and switching
- **Persistent**: Project selection survives sessions
- **Scalable**: Easy to add new projects and services
- **Maintainable**: Clean separation of concerns and clear data flow
