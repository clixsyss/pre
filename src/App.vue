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
  '/my-bookings',
  '/calendar',
  '/analytics',
  '/profile'
]

// Check if current route should show main layout
const isAuthenticatedPage = computed(() => {
  return authenticatedRoutes.includes(route.path)
})
</script>

<style>
/* Clean layout for authentication pages */
.auth-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}
</style>
