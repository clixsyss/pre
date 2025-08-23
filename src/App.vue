<template>
  <SplashScreen />
  <MainLayout>
    <router-view />
  </MainLayout>
  <NotificationPopup />
</template>

<script setup>
import SplashScreen from './components/SplashScreen.vue'
import NotificationPopup from './components/NotificationPopup.vue'
import MainLayout from './layouts/MainLayout.vue'
</script>
