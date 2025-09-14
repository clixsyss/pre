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
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import SplashScreen from './components/SplashScreen.vue'
import NotificationPopup from './components/NotificationPopup.vue'
import MainLayout from './layouts/MainLayout.vue'
import { useSplashStore } from './stores/splash'

// Component name for ESLint
defineOptions({
  name: 'App'
})

const route = useRoute()
const isRouterLoading = ref(true)
const splashStore = useSplashStore()

onMounted(async () => {
  // Show splash screen with loading
  splashStore.showSplash()
  splashStore.setLoading(true)
  
  // Simulate app initialization
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Hide loading indicator
  splashStore.setLoading(false)
  
  // Hide splash screen after a short delay
  setTimeout(() => {
    splashStore.hideSplash()
    isRouterLoading.value = false
  }, 500)
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
  '/smart-devices'
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
  background-color: #F6F6F6;
}
</style>
