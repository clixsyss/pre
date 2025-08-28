<template>
  <SplashScreen />
  
  <!-- Show MainLayout only for authenticated pages -->
  <MainLayout v-if="isAuthenticatedPage">
    <router-view />
  </MainLayout>
  
  <!-- Show clean layout for authentication pages -->
  <div v-else class="auth-layout">
    <router-view />
  </div>
  
  <NotificationPopup />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SplashScreen from './components/SplashScreen.vue'
import NotificationPopup from './components/NotificationPopup.vue'
import MainLayout from './layouts/MainLayout.vue'

// Component name for ESLint
defineOptions({
  name: 'App'
})

const route = useRoute()

// Define which routes should show the main layout (authenticated pages)
const authenticatedRoutes = [
  '/home',
  '/access', 
  '/services',
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
  
  return false
})
</script>

<style>
/* Clean layout for authentication pages */
.auth-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}
</style>
