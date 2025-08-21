<template>
  <SplashScreen />
  <router-view />
  <NotificationPopup />
</template>

<script setup>
import SplashScreen from './components/SplashScreen.vue'
import NotificationPopup from './components/NotificationPopup.vue'
</script>
