<template>
  <div>
    <SplashScreen />
    
    <!-- Network Status Banner - Shows when offline or slow connection -->
    <NetworkStatusBanner />
    
    <!-- Show MainLayout only for authenticated pages -->
    <MainLayout v-if="isAuthenticatedPage && !isRouterLoading">
      <router-view />
    </MainLayout>
    
    <!-- Show clean layout for authentication pages -->
    <div v-else-if="!isRouterLoading" class="auth-layout">
      <router-view />
    </div>
    
    <NotificationPopup />
  </div>
</template>

<script setup>
console.log('🚀🚀🚀 JavaScript is executing! App.vue script setup started!')

import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import SplashScreen from './components/SplashScreen.vue'
import NotificationPopup from './components/NotificationPopup.vue'
import NetworkStatusBanner from './components/NetworkStatusBanner.vue'
import MainLayout from './layouts/MainLayout.vue'
import { useNetworkStatus } from './composables/useNetworkStatus'

// Component name for ESLint
defineOptions({
  name: 'App'
})

const route = useRoute()
const isRouterLoading = ref(true)

// Initialize network monitoring
const { initNetworkMonitoring, stopNetworkMonitoring } = useNetworkStatus()

// Global error handler - enhanced
window.addEventListener('error', (event) => {
  console.error('❌ Global JavaScript error:', event.error)
  console.error('❌ Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
  // Prevent the error from crashing the app
  event.preventDefault()
  return true
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason)
  // Prevent the rejection from crashing the app
  event.preventDefault()
})

// Catch any synchronous errors
try {
  console.log('🚀 App.vue: Setting up error handlers')
} catch (error) {
  console.error('❌ Error setting up error handlers:', error)
}

onMounted(async () => {
  try {
    console.log('🚀 App.vue: Starting app initialization...')
    
    // Initialize network monitoring first
    console.log('🌐 App.vue: Initializing network monitoring...')
    await initNetworkMonitoring()
    console.log('✅ Network monitoring initialized')
    
    // Wait for Vue to be fully ready
    await nextTick()
    console.log('🚀 App.vue: Vue app mounted')
    
    // Simple initialization with error handling
    console.log('🔍 App.vue: Checking services availability...')
    
    // Check services with error handling
    let authServiceAvailable = false
    let firestoreServiceAvailable = false
    
    try {
      authServiceAvailable = !!window.optimizedAuthService
      console.log('🔍 optimizedAuthService available:', authServiceAvailable)
    } catch (e) {
      console.warn('⚠️ Error checking auth service:', e)
    }
    
    try {
      firestoreServiceAvailable = !!window.firestoreService
      console.log('🔍 firestoreService available:', firestoreServiceAvailable)
    } catch (e) {
      console.warn('⚠️ Error checking firestore service:', e)
    }
    
    // Initialize services one by one with error handling
    if (authServiceAvailable) {
      try {
        console.log('🔍 App.vue: Initializing auth service...')
        await window.optimizedAuthService.initialize()
        console.log('✅ Auth service initialized')
      } catch (error) {
        console.error('❌ Auth service initialization failed:', error)
      }
    }
    
    if (firestoreServiceAvailable) {
      try {
        console.log('🔍 App.vue: Initializing firestore service...')
        await window.firestoreService.initialize()
        console.log('✅ Firestore service initialized')
      } catch (error) {
        console.error('❌ Firestore service initialization failed:', error)
      }
    }
    
    console.log('🚀 App.vue: Services initialization completed')
    
    // Wait a bit more to ensure everything is properly initialized
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Hide splash screen and show app content
    console.log('🔍 App.vue: Setting isRouterLoading to false...')
    isRouterLoading.value = false
    
    // Emit app ready event for splash screen
    window.dispatchEvent(new CustomEvent('appReady'))
    console.log('🚀 App.vue: App ready, splash hidden')
    
  } catch (error) {
    console.error('❌ App.vue: Critical error during initialization:', error)
    console.error('❌ Error stack:', error.stack)
    
    // Hide splash even if there's an error, but with a delay
    setTimeout(() => {
      console.log('🔍 App.vue: Force hiding splash due to critical error...')
      isRouterLoading.value = false
      window.dispatchEvent(new CustomEvent('appReady'))
    }, 1000)
  }
})

// Cleanup network monitoring on unmount
onUnmounted(async () => {
  console.log('🛑 App.vue: Cleaning up...')
  await stopNetworkMonitoring()
})

// Define which routes should show the main layout (authenticated pages)
const authenticatedRoutes = [
  '/home',
  '/access', 
  '/services',
  '/stores-shopping',
  '/shopping-cart',
  '/court-booking',
  '/academy-booking',
  '/academy-programs',
  '/academy-details',
  '/academy-registration',
  '/my-bookings',
  '/calendar',
  '/analytics',
  '/profile',
  '/smart-devices',
  '/news',
  '/complaints',
  '/complaints/:id',
  '/facilities',
  '/service-booking-chat/:id',
  '/violations',
  '/violation-chat/:id',
  '/support',
  '/support-chat',
  '/support-chat/:id',
  '/request-category',
  '/request-chat/:id',
  '/request-category/:id'
]

// Check if current route should show main layout
const isAuthenticatedPage = computed(() => {
  console.log('🔍 App.vue: Checking route:', { 
    currentPath: route.path, 
    isRouterLoading: isRouterLoading.value 
  })
  
  // Check exact matches first
  if (authenticatedRoutes.includes(route.path)) {
    console.log('🔍 App.vue: Exact match found, showing main layout')
    return true
  }
  
  // Check dynamic routes
  if (route.path.startsWith('/academy-details/')) {
    console.log('🔍 App.vue: Academy details route, showing main layout')
    return true
  }
  
  if (route.path.startsWith('/academy-registration/')) {
    console.log('🔍 App.vue: Academy registration route, showing main layout')
    return true
  }
  
  if (route.path.startsWith('/store/')) {
    return true
  }

  if (route.path.startsWith('/complaints/')) {
    return true
  }
  
  if (route.path.startsWith('/service-category/')) {
    return true
  }
  
  if (route.path.startsWith('/service-booking-chat/')) {
    return true
  }

  if (route.path.startsWith('/violations/')) {
    return true
  }
  
  if (route.path.startsWith('/violation-chat/')) {
    return true
  }

  if (route.path.startsWith('/support/')) {
    return true
  }

  if (route.path.startsWith('/support-chat/')) {
    return true
  }

  if (route.path.startsWith('/request-chat/')) {
    return true
  }

  if (route.path.startsWith('/request-category/')) {
    return true
  }
  
  return false
})
</script>

<style>
/* Clean layout for authentication pages */
.auth-layout {
  min-height: 100vh;
  background-color: #F6F6F6;
}

/* Override dark background for auth pages only after app loads */
body:has(.auth-layout) {
  background-color: #F6F6F6 !important;
}
</style>
