# PRE App - Enhanced Splash Screen & Loading System

## Overview

The PRE app now features a beautiful, animated splash screen with a pure black background and the PRE logo prominently displayed. This system provides consistent loading experiences throughout the entire application.

## Features

### ✨ **Pure Black Background**
- Clean, professional black background (#000000)
- Perfect contrast for the PRE logo and white text

### 🎨 **Beautiful Animations**
- **Logo Pulse**: Subtle scaling animation on the logo
- **Glow Effect**: Radial glow around the logo that pulses
- **Floating Elements**: Subtle animated circles in the background
- **Smooth Transitions**: Fade-in/out effects for all elements
- **Loading Dots**: Animated bouncing dots during loading states

### 📱 **Responsive Design**
- Optimized for all screen sizes (320px to 4K+)
- Adaptive logo sizing and spacing
- Mobile-first approach with progressive enhancement

### 🔄 **Consistent Loading Experience**
- Same design language across all loading states
- Customizable loading messages
- Smooth transitions between states

## Components

### 1. SplashScreen.vue
Main splash screen component used for app initialization.

**Features:**
- Pure black background
- Animated PRE logo with glow effect
- "Relive." tagline
- Loading dots animation
- Custom loading messages
- Responsive design

### 2. LoadingScreen.vue
Reusable loading component for other parts of the app.

**Features:**
- Same visual design as splash screen
- Customizable loading messages
- Smaller logo size for inline use
- Flexible show/hide props

### 3. Enhanced Splash Store
Updated Pinia store with new functionality.

**New Methods:**
- `setLoadingMessage(message)` - Set custom loading text
- `showLoadingWithMessage(message, duration)` - Show loading with message
- `loadingMessage` - Reactive loading message state

## Usage Examples

### Basic Splash Screen (App Initialization)
```javascript
// In App.vue - automatically handled
import { useSplashStore } from './stores/splash'

const splashStore = useSplashStore()

onMounted(async () => {
  splashStore.showSplash()
  splashStore.setLoading(true)
  
  // Your app initialization logic
  await initializeApp()
  
  splashStore.setLoading(false)
  setTimeout(() => {
    splashStore.hideSplash()
  }, 500)
})
```

### Loading with Custom Message
```javascript
import { showLoadingWithMessage } from '../utils/splashUtils'

// Show loading with custom message
showLoadingWithMessage('Loading your data...', 3000)

// Or using the store directly
const splashStore = useSplashStore()
splashStore.showLoadingWithMessage('Processing request...', 2000)
```

### Loading During Async Operations
```javascript
import { showSplashWhileExecuting } from '../utils/splashUtils'

// Show loading while executing async function
await showSplashWhileExecuting(
  async () => {
    // Your async operation
    await fetchUserData()
    await loadProjectSettings()
  },
  2000, // Minimum duration
  'Loading your projects...' // Custom message
)
```

### Using LoadingScreen Component
```vue
<template>
  <div>
    <!-- Your content -->
    <LoadingScreen 
      :show="isLoading" 
      message="Saving your changes..." 
    />
  </div>
</template>

<script setup>
import LoadingScreen from '../components/LoadingScreen.vue'
import { ref } from 'vue'

const isLoading = ref(false)

const saveData = async () => {
  isLoading.value = true
  try {
    await saveToDatabase()
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 2000)
  }
}
</script>
```

## Integration Points

### 1. App Initialization
- **File**: `App.vue`
- **Purpose**: Show splash screen during app startup
- **Duration**: 2-3 seconds with loading animation

### 2. Authentication Flow
- **Files**: `SignIn.vue`, `Register.vue`, `VerifyEmail.vue`
- **Purpose**: Show loading during auth operations
- **Messages**: "Signing you in...", "Creating account...", "Verifying email..."

### 3. Project Operations
- **Files**: `ProjectSelection.vue`, `Home.vue`
- **Purpose**: Show loading during project switching
- **Messages**: "Loading project data...", "Switching projects..."

### 4. Smart Mirror Operations
- **Files**: `SmartDevices.vue`, `SmartMirrorConnection.vue`
- **Purpose**: Show loading during device operations
- **Messages**: "Connecting to devices...", "Loading device settings..."

### 5. Data Fetching
- **Files**: Various pages with API calls
- **Purpose**: Show loading during data operations
- **Messages**: "Loading data...", "Saving changes...", "Processing..."

## Customization

### Logo Size
```css
/* In SplashScreen.vue or LoadingScreen.vue */
.logo {
  max-width: 250px; /* Adjust as needed */
  height: auto;
}
```

### Animation Duration
```css
/* Adjust animation speeds */
@keyframes logoPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
/* Change 2s to desired duration */
animation: logoPulse 2s ease-in-out infinite;
```

### Loading Message Styling
```css
.loading-text {
  color: white;
  font-size: 14px;
  font-weight: 300;
  opacity: 0.8;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
```

## Best Practices

### 1. **Consistent Messaging**
- Use clear, user-friendly loading messages
- Keep messages concise (under 30 characters)
- Use present continuous tense ("Loading...", "Saving...")

### 2. **Appropriate Duration**
- Minimum 1 second for any loading state
- Maximum 5 seconds for user-initiated actions
- Use progress indicators for longer operations

### 3. **Error Handling**
- Always hide loading states in error scenarios
- Provide fallback messages for failed operations
- Use try/catch with finally blocks

### 4. **Performance**
- Loading screens don't block the main thread
- Animations use CSS transforms for smooth performance
- Images are optimized and cached

## Troubleshooting

### Splash Screen Not Showing
1. Check if `splashStore.show` is `true`
2. Verify the component is imported in `App.vue`
3. Check browser console for errors

### Loading Message Not Displaying
1. Ensure `splashStore.loadingMessage` is set
2. Check if `splashStore.loading` is `true`
3. Verify the message is not empty

### Animation Issues
1. Check CSS animations are supported
2. Verify no conflicting styles
3. Test on different devices/browsers

## Future Enhancements

### Planned Features
- [ ] Progress bars for long operations
- [ ] Custom logo animations
- [ ] Theme variations (dark/light)
- [ ] Sound effects (optional)
- [ ] Gesture-based interactions

### Performance Optimizations
- [ ] Lazy loading of animation assets
- [ ] Reduced motion for accessibility
- [ ] GPU acceleration for animations
- [ ] Preloading of critical assets

---

## Quick Reference

### Store Methods
```javascript
const splashStore = useSplashStore()

// Basic controls
splashStore.showSplash()
splashStore.hideSplash()
splashStore.setLoading(true/false)

// Message controls
splashStore.setLoadingMessage('Custom message')
splashStore.showLoadingWithMessage('Message', 3000)

// State
splashStore.show          // boolean
splashStore.loading       // boolean
splashStore.loadingMessage // string
```

### Utility Functions
```javascript
import { 
  showSplash, 
  hideSplash, 
  setLoading,
  showSplashWhileExecuting,
  showLoadingWithMessage 
} from '../utils/splashUtils'

// Quick usage
showLoadingWithMessage('Processing...', 2000)
await showSplashWhileExecuting(myAsyncFunction, 1000, 'Loading data...')
```

This enhanced splash screen system provides a professional, consistent, and beautiful loading experience throughout the PRE app! 🚀
