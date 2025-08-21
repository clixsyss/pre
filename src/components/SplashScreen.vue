<template>
  <Transition name="splash-fade">
    <div class="splash-screen" v-if="splashStore.show">
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
  // Simulate app initialization
  splashStore.setLoading(true)
  
  // Hide splash screen after 3 seconds
  setTimeout(() => {
    splashStore.setLoading(false)
    setTimeout(() => {
      splashStore.hideSplash()
    }, 500)
  }, 3000)
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #222222;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.logo-container {
  text-align: center;
  animation: fadeInUp 1s ease-out;
}

.logo {
  max-width: 200px;
  height: auto;
  margin-bottom: 20px;
}

.tagline {
  color: white;
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 30px;
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
  background-color: white;
  border-radius: 50%;
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
