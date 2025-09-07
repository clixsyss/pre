<template>
  <Transition name="splash-fade">
    <div class="splash-screen" v-if="splashStore.show">
      
      <!-- Dark Overlay -->
      <div class="overlay"></div>
      
      <!-- Logo Content -->
      <div class="logo-container">
        <img src="../assets/logo.png" alt="PRE Logo" class="logo" />
        <div class="tagline">Relive.</div>
        <div class="loading-indicator" v-if="splashStore.loading">
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSplashStore } from '../stores/splash'

const splashStore = useSplashStore()

onMounted(() => {
  // Only show splash screen for first visit or if explicitly needed
  const hasSeenSplash = localStorage.getItem('hasSeenSplash')
  
  if (!hasSeenSplash) {
    // First time user - show splash screen
    splashStore.setLoading(true)
    
    // Hide splash screen after 2 seconds
    setTimeout(() => {
      splashStore.setLoading(false)
      setTimeout(() => {
        splashStore.hideSplash()
        localStorage.setItem('hasSeenSplash', 'true')
      }, 500)
    }, 2000)
  } else {
    // Returning user - hide splash immediately
    splashStore.hideSplash()
  }
})
</script>

<style scoped>
.splash-screen {
  background-color: #222;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(34, 34, 34, 0.95) 0%,
    rgba(34, 34, 34, 0.8) 30%,
    rgba(34, 34, 34, 0.6) 60%,
    rgba(34, 34, 34, 0.4) 100%
  );
  z-index: -1;
}

.logo-container {
  text-align: center;
  animation: fadeInUp 1s ease-out;
  z-index: 1;
}

.logo {
  max-width: 200px;
  height: auto;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.tagline {
  color: white;
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-indicator {
  margin-top: 20px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  animation: loadingBounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingBounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Transition effects */
.splash-fade-enter-active,
.splash-fade-leave-active {
  transition: opacity 0.5s ease-out;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .logo {
    max-width: 150px;
  }
  
  .tagline {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .logo {
    max-width: 120px;
  }
  
  .tagline {
    font-size: 14px;
  }
}
</style>
