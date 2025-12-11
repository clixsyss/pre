<template>
  <div id="app-root">
    <!-- Guest Pass Page - Completely standalone, no app UI -->
    <router-view v-if="isGuestPassPage" />
    
    <!-- Regular App UI -->
    <template v-else>
    <SplashScreen />
    
    <!-- Network Status Banner - Shows when offline or slow connection -->
    <NetworkStatusBanner />
    
    <!-- Show MainLayout only for authenticated pages -->
    <MainLayout v-if="isAuthenticatedPage && !isRouterLoading" class="main-layout">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </MainLayout>
    
    <!-- Show clean layout for authentication pages -->
    <div v-else-if="!isRouterLoading" class="auth-layout">
      <router-view />
    </div>
    
    <NotificationPopup />
    
    <!-- Document Verification Modal - Shows when user is missing required documents (only on authenticated pages) -->
    <DocumentVerificationModal 
      v-if="showDocumentModal && isAuthenticatedPage && !isRouterLoading"
      :missing-documents="missingDocuments"
      @documents-uploaded="handleDocumentsUploaded"
    />
    </template>
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
import DocumentVerificationModal from './components/DocumentVerificationModal.vue'
import { useNetworkStatus } from './composables/useNetworkStatus'
import { useDocumentVerification } from './composables/useDocumentVerification'
import { useSplashStore } from './stores/splash'
import optimizedAuthService from './services/optimizedAuthService'

// Component name for ESLint
defineOptions({
  name: 'App'
})

const route = useRoute()
const isRouterLoading = ref(true)
const splashStore = useSplashStore()

// Safety timeout: Always show content after 3 seconds, even if initialization fails
setTimeout(() => {
  if (isRouterLoading.value) {
    console.warn('⚠️ App.vue: Safety timeout reached, forcing isRouterLoading to false')
    isRouterLoading.value = false
  }
}, 3000)

// Initialize network monitoring
const { initNetworkMonitoring, stopNetworkMonitoring } = useNetworkStatus()

// Initialize document verification
const { 
  showDocumentModal, 
  missingDocuments, 
  initializeDocumentVerification, 
  handleDocumentsUploaded,
  cleanup: cleanupDocumentVerification 
} = useDocumentVerification()

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
    
    // Show splash screen and set loading state
    splashStore.showSplash()
    splashStore.setLoading(true)
    splashStore.setLoadingMessage('Loading...')
    
    // Initialize network monitoring first
    console.log('🌐 App.vue: Initializing network monitoring...')
    await initNetworkMonitoring()
    console.log('✅ Network monitoring initialized')
    
    // Wait for Vue to be fully ready
    await nextTick()
    console.log('🚀 App.vue: Vue app mounted')
    
    // Services are already initialized via boot files
    // Just verify they're available
    console.log('🔍 App.vue: Verifying services availability...')
    
    try {
      const authCheck = optimizedAuthService ? 'available' : 'not available'
      console.log('🔍 optimizedAuthService:', authCheck)
    } catch (e) {
      console.warn('⚠️ Error checking auth service:', e)
    }
    
    console.log('🚀 App.vue: Services verification completed')
    
    // Wait for smooth initialization
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Show app content (always set to false, even if there were errors)
    console.log('🔍 App.vue: Setting isRouterLoading to false...')
    isRouterLoading.value = false
    
    // Wait for Vue to render the content
    await nextTick()
    
    // Wait additional time for the DOM to paint
    // This prevents white screen flash on iOS
    await new Promise(resolve => setTimeout(resolve, 800))
    
    console.log('🔍 App.vue: Checking if content is rendered...')
    const mainContent = document.querySelector('.main-layout, .auth-layout')
    if (mainContent) {
      console.log('✅ App.vue: Main content found in DOM')
    } else {
      console.warn('⚠️ App.vue: Main content not yet rendered, waiting...')
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Notify splash store that app is initialized
    // The splash will hide when both video AND app are ready
    console.log('🚀 App.vue: Notifying splash that app is initialized')
    splashStore.setAppInitialized()
    
    // Initialize document verification after app is ready
    console.log('🔍 App.vue: Initializing document verification...')
    initializeDocumentVerification()
    
  } catch (error) {
    console.error('❌ App.vue: Critical error during initialization:', error)
    console.error('❌ Error stack:', error.stack)
    
    // Always show app content, even on error
    isRouterLoading.value = false
    
    // Hide splash even if there's an error
    setTimeout(() => {
      console.log('🔍 App.vue: Force hiding splash due to critical error...')
      // Force both flags to hide splash immediately on error
      splashStore.setVideoCompleted()
      splashStore.setAppInitialized()
    }, 1000)
  }
})

// Cleanup network monitoring and document verification on unmount
onUnmounted(async () => {
  console.log('🛑 App.vue: Cleaning up...')
  await stopNetworkMonitoring()
  cleanupDocumentVerification()
})

// Define which routes should show the main layout (authenticated pages)
const authenticatedRoutes = [
  '/home',
  '/access', 
  '/services',
  '/requests',
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
// Check if current route is the guest pass page (standalone, no app UI)
const isGuestPassPage = computed(() => {
  return route.path.startsWith('/guest-pass/')
})

const isAuthenticatedPage = computed(() => {
  console.log('🔍 App.vue: Checking route:', { 
    currentPath: route.path, 
    isRouterLoading: isRouterLoading.value,
    isGuestPass: isGuestPassPage.value
  })
  
  // Guest pass page should never show app UI
  if (isGuestPassPage.value) {
    return false
  }
  
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
/* App root - prevent white background flash */
#app-root {
  min-height: 100vh;
  background-color: #000;
  transition: background-color 0.3s ease;
}

/* Clean layout for authentication pages */
.auth-layout {
  min-height: 100vh;
  background-color: #F6F6F6;
}

/* Main layout */
.main-layout {
  min-height: 100vh;
}

/* Override dark background for auth pages only after app loads */
body:has(.auth-layout) {
  background-color: #F6F6F6 !important;
}

/* Keep body black during app load to prevent white flash */
body {
  background-color: #000 !important;
  transition: background-color 0.3s ease;
}

/* Update body background after main layout is visible */
body:has(.main-layout) {
  background-color: #F6F6F6 !important;
}
</style>
