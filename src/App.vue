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
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import logger from 'src/utils/logger'

logger.log('🚀🚀🚀 JavaScript is executing! App.vue script setup started!')
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
    logger.warn('⚠️ App.vue: Safety timeout reached, forcing isRouterLoading to false')
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
  logger.error('❌ Global JavaScript error:', event.error)
  logger.error('❌ Error details:', {
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
  logger.error('❌ Unhandled promise rejection:', event.reason)
  // Prevent the rejection from crashing the app
  event.preventDefault()
})

// Catch any synchronous errors
try {
  logger.log('🚀 App.vue: Setting up error handlers')
} catch (error) {
  logger.error('❌ Error setting up error handlers:', error)
}

onMounted(async () => {
  try {
    logger.log('🚀 App.vue: Starting app initialization...')
    
    // Show splash screen and set loading state
    splashStore.showSplash()
    splashStore.setLoading(true)
    splashStore.setLoadingMessage('Loading...')
    
    // Initialize network monitoring first
    logger.log('🌐 App.vue: Initializing network monitoring...')
    await initNetworkMonitoring()
    logger.log('✅ Network monitoring initialized')
    
    // Wait for Vue to be fully ready
    await nextTick()
    logger.log('🚀 App.vue: Vue app mounted')
    
    // Services are already initialized via boot files
    // Just verify they're available
    logger.log('🔍 App.vue: Verifying services availability...')
    
    try {
      const authCheck = optimizedAuthService ? 'available' : 'not available'
      logger.log('🔍 optimizedAuthService:', authCheck)
    } catch (e) {
      logger.warn('⚠️ Error checking auth service:', e)
    }
    
    logger.log('🚀 App.vue: Services verification completed')
    
    // iOS-optimized: Detect platform for optimized delays
    const protocol = window.location.protocol
    const hasIOSBridge = window.webkit?.messageHandlers !== undefined
    const isIOS = protocol === 'capacitor:' || hasIOSBridge || 
                  (window.Capacitor && window.Capacitor.getPlatform() === 'ios')
    
    // iOS-optimized: Shorter delays since cache is fast
    const initDelay = isIOS ? 200 : 500
    const paintDelay = isIOS ? 300 : 800
    
    // Wait for smooth initialization (iOS-optimized)
    await new Promise(resolve => setTimeout(resolve, initDelay))
    
    // Show app content (always set to false, even if there were errors)
    logger.log('🔍 App.vue: Setting isRouterLoading to false...')
    isRouterLoading.value = false
    
    // Wait for Vue to render the content
    await nextTick()
    
    // Wait additional time for the DOM to paint
    // iOS-optimized: Shorter delay since cache makes everything faster
    await new Promise(resolve => setTimeout(resolve, paintDelay))
    
    logger.log('🔍 App.vue: Checking if content is rendered...')
    const mainContent = document.querySelector('.main-layout, .auth-layout')
    if (mainContent) {
      logger.log('✅ App.vue: Main content found in DOM')
    } else {
      logger.warn('⚠️ App.vue: Main content not yet rendered, waiting...')
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Notify splash store that app is initialized
    // The splash will hide when both video AND app are ready
    logger.log('🚀 App.vue: Notifying splash that app is initialized')
    splashStore.setAppInitialized()
    
    // Initialize document verification after app is ready
    logger.log('🔍 App.vue: Initializing document verification...')
    initializeDocumentVerification()
    
  } catch (error) {
    logger.error('❌ App.vue: Critical error during initialization:', error)
    logger.error('❌ Error stack:', error.stack)
    
    // Always show app content, even on error
    isRouterLoading.value = false
    
    // Hide splash even if there's an error
    setTimeout(() => {
      logger.log('🔍 App.vue: Force hiding splash due to critical error...')
      // Force both flags to hide splash immediately on error
      splashStore.setVideoCompleted()
      splashStore.setAppInitialized()
    }, 1000)
  }
})

// Cleanup network monitoring and document verification on unmount
onUnmounted(async () => {
  logger.log('🛑 App.vue: Cleaning up...')
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
  logger.log('🔍 App.vue: Checking route:', { 
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
    logger.log('🔍 App.vue: Exact match found, showing main layout')
    return true
  }
  
  // Check dynamic routes
  if (route.path.startsWith('/academy-details/')) {
    logger.log('🔍 App.vue: Academy details route, showing main layout')
    return true
  }
  
  if (route.path.startsWith('/academy-registration/')) {
    logger.log('🔍 App.vue: Academy registration route, showing main layout')
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
