<template>
  <SplashScreen />
  
  <!-- Loading state while router is resolving -->
  <div v-if="isRouterLoading" class="loading-container">
    <div class="loading-content">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600 text-lg">Loading...</p>
      <p class="text-gray-500 text-sm mt-2">Please wait while we verify your authentication</p>
    </div>
  </div>
  
  <!-- Show MainLayout only for authenticated pages -->
  <MainLayout v-else-if="isAuthenticatedPage">
    <router-view />
  </MainLayout>
  
  <!-- Show clean layout for authentication pages -->
  <div v-else class="auth-layout">
    <router-view />
  </div>
  
  <NotificationPopup />
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
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

onMounted(() => {
  // Hide router loading after a short delay
  setTimeout(() => {
    isRouterLoading.value = false
  }, 1000)
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
  '/profile'
]

// Check if current route should show main layout
const isAuthenticatedPage = computed(() => {
  // Check exact matches first
  if (authenticatedRoutes.includes(route.path)) {
    return true
  }
  
  // Check dynamic routes
  if (route.path.startsWith('/academy-details/')) {
    return true
  }
  
  if (route.path.startsWith('/academy-registration/')) {
    return true
  }
  
  if (route.path.startsWith('/store/')) {
    return true
  }
  
  return false
})
</script>

<style>
/* Clean layout for authentication pages */
.auth-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Loading container styles */
.loading-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.loading-content {
  text-align: center;
  padding: 2rem;
}

/* Spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
