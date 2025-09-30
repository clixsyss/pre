<template>
  <SplashScreen />
  
  <!-- Show MainLayout only for authenticated pages -->
  <MainLayout v-if="isAuthenticatedPage && !isRouterLoading">
    <router-view />
  </MainLayout>
  
  <!-- Show clean layout for authentication pages -->
  <div v-else-if="!isRouterLoading" class="auth-layout">
    <router-view />
  </div>
  
  <NotificationPopup />
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import SplashScreen from './components/SplashScreen.vue'
import NotificationPopup from './components/NotificationPopup.vue'
import MainLayout from './layouts/MainLayout.vue'

// Component name for ESLint
defineOptions({
  name: 'App'
})

const route = useRoute()
const isRouterLoading = ref(true)

onMounted(async () => {
  try {
    console.log('🚀 App.vue: Starting app initialization...')
    
    // Wait for Vue to be fully ready
    await nextTick()
    console.log('🚀 App.vue: Vue app mounted')
    
    // Initialize Firebase services in parallel
    const initPromises = []
    
    // Initialize auth service
    if (window.optimizedAuthService) {
      initPromises.push(window.optimizedAuthService.initialize())
    }
    
    // Initialize Firestore service
    if (window.firestoreService) {
      initPromises.push(window.firestoreService.initialize())
    }
    
    // Wait for all initializations to complete
    await Promise.allSettled(initPromises)
    
    console.log('🚀 App.vue: Services initialized')
    
    // Hide splash screen and show app content
    isRouterLoading.value = false
    
    // Emit app ready event for splash screen
    window.dispatchEvent(new CustomEvent('appReady'))
    console.log('🚀 App.vue: App ready, splash hidden')
    
  } catch (error) {
    console.error('❌ App.vue: Error during initialization:', error)
    // Hide splash even if there's an error
    isRouterLoading.value = false
    window.dispatchEvent(new CustomEvent('appReady'))
  }
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
  '/support-chat/:id'
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
  
  return false
})
</script>

<style>
/* Clean layout for authentication pages */
.auth-layout {
  min-height: 100vh;
  background-color: #F6F6F6;
}
</style>
