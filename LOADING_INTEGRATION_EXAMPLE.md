# Loading Screen Integration Example

## Example: Adding Loading to SmartDevices Page

Here's how to integrate the beautiful loading screen into an existing page:

### 1. Import the LoadingScreen Component

```vue
<!-- In SmartDevices.vue -->
<template>
  <div class="smart-devices-page">
    <!-- Your existing content -->
    
    <!-- Add loading screen -->
    <LoadingScreen 
      :show="isLoading" 
      :message="loadingMessage" 
    />
  </div>
</template>

<script setup>
import LoadingScreen from '../components/LoadingScreen.vue'
import { ref } from 'vue'
import { showLoadingWithMessage } from '../utils/splashUtils'

const isLoading = ref(false)
const loadingMessage = ref('')

// Your existing code...
</script>
```

### 2. Use in Async Operations

```javascript
// Example: Loading devices
const loadDevices = async () => {
  isLoading.value = true
  loadingMessage.value = 'Loading your devices...'
  
  try {
    await smartMirrorStore.loadDevices()
    // Additional processing...
  } catch (error) {
    console.error('Error loading devices:', error)
  } finally {
    setTimeout(() => {
      isLoading.value = false
      loadingMessage.value = ''
    }, 1000)
  }
}

// Example: Using utility function
const connectToDevices = async () => {
  await showLoadingWithMessage('Connecting to devices...', 3000)
  // Your connection logic here
}
```

### 3. Quick Integration Pattern

For any page that needs loading states:

```vue
<template>
  <div class="page">
    <!-- Your content -->
    <LoadingScreen :show="isLoading" :message="loadingMessage" />
  </div>
</template>

<script setup>
import LoadingScreen from '../components/LoadingScreen.vue'
import { ref } from 'vue'

const isLoading = ref(false)
const loadingMessage = ref('')

// Use in any async operation
const performAsyncAction = async () => {
  isLoading.value = true
  loadingMessage.value = 'Processing...'
  
  try {
    await yourAsyncFunction()
  } finally {
    setTimeout(() => {
      isLoading.value = false
      loadingMessage.value = ''
    }, 1000)
  }
}
</script>
```

This provides a consistent, beautiful loading experience across your entire PRE app! 🎉
