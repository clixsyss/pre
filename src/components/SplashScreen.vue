<template>
  <Transition name="splash-fade">
    <div class="splash-screen" v-if="splashStore.show">
      <!-- Clean Background -->
      <div class="background"></div>
      
      <!-- Cool Floating Elements -->
      <div class="floaters">
        <!-- Geometric Shapes -->
        <div class="floater floater-1"></div>
        <div class="floater floater-2"></div>
        <div class="floater floater-3"></div>
        <div class="floater floater-4"></div>
        <div class="floater floater-5"></div>
        <div class="floater floater-6"></div>
        
        <!-- Particles -->
        <div class="particle particle-1"></div>
        <div class="particle particle-2"></div>
        <div class="particle particle-3"></div>
        <div class="particle particle-4"></div>
        <div class="particle particle-5"></div>
        <div class="particle particle-6"></div>
        <div class="particle particle-7"></div>
        <div class="particle particle-8"></div>
        
        <!-- Glowing Orbs -->
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      
      <!-- Main Content -->
      <div class="content">
        <!-- Logo -->
        <div class="logo-container">
          <img 
            src="../assets/logo02.png" 
            alt="PRE GROUP Logo" 
            class="logo" 
            @error="handleLogoError"
            @load="handleLogoLoad"
          />
        </div>
        
        <!-- App Name -->
        <!-- <div class="app-name">
          <h1>PRE GROUP</h1>
        </div> -->
        
        <!-- Loading -->
        <div class="loading" v-if="splashStore.loading">
          <div class="loading-spinner"></div>
          <p class="loading-text" v-if="splashStore.loadingMessage">
            {{ splashStore.loadingMessage }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSplashStore } from '../stores/splash'

const splashStore = useSplashStore()

const handleLogoError = (event) => {
  console.warn('Logo failed to load, trying fallback')
  // Try fallback logo
  event.target.src = '../assets/logo.png'
  event.target.onerror = () => {
    console.warn('Fallback logo also failed, using text fallback')
    // If both logos fail, we'll show the text title instead
    event.target.style.display = 'none'
  }
}

const handleLogoLoad = () => {
  console.log('Logo loaded successfully')
}

onMounted(() => {
  // Show splash screen with loading during app initialization
  splashStore.setLoading(true)
  splashStore.setLoadingMessage('Initializing...')
  
  // Listen for app ready event
  const handleAppReady = () => {
    // Update loading message
    splashStore.setLoadingMessage('Almost ready...')
    
    // Keep splash visible a bit longer to ensure smooth transition
    setTimeout(() => {
      splashStore.setLoading(false)
      splashStore.setLoadingMessage('')
      
      // Hide splash after a short delay
      setTimeout(() => {
        splashStore.hideSplash()
      }, 500)
    }, 800)
  }
  
  // Listen for app ready event from main app
  window.addEventListener('appReady', handleAppReady)
  
  // Fallback timeout to prevent infinite loading
  setTimeout(() => {
    if (splashStore.show) {
      console.warn('Splash screen timeout, forcing hide')
      handleAppReady()
    }
  }, 8000) // 8 second fallback
  
  // Cleanup
  return () => {
    window.removeEventListener('appReady', handleAppReady)
  }
})
</script>

<style scoped>
/* Main Container */
.splash-screen {
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Clean Background */
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000;
  z-index: 1;
}

/* Cool Floating Elements */
.floaters {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

/* Geometric Floaters */
.floater {
  position: absolute;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 50%;
  animation: float 8s ease-in-out infinite;
}

.floater-1 {
  width: 80px;
  height: 80px;
  top: 15%;
  left: 10%;
  background: linear-gradient(45deg, rgba(175, 30, 35, 0.2), rgba(255, 255, 255, 0.1));
  animation-delay: 0s;
  border-radius: 20px;
}

.floater-2 {
  width: 60px;
  height: 60px;
  top: 70%;
  right: 15%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.15), rgba(175, 30, 35, 0.1));
  animation-delay: 2s;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.floater-3 {
  width: 100px;
  height: 100px;
  top: 40%;
  left: 5%;
  background: linear-gradient(45deg, rgba(175, 30, 35, 0.1), rgba(255, 255, 255, 0.05));
  animation-delay: 4s;
  border-radius: 30px;
}

.floater-4 {
  width: 50px;
  height: 50px;
  top: 20%;
  right: 25%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(175, 30, 35, 0.15));
  animation-delay: 1s;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.floater-5 {
  width: 70px;
  height: 70px;
  bottom: 25%;
  left: 20%;
  background: linear-gradient(45deg, rgba(175, 30, 35, 0.15), rgba(255, 255, 255, 0.1));
  animation-delay: 3s;
  border-radius: 15px;
}

.floater-6 {
  width: 40px;
  height: 40px;
  top: 60%;
  right: 40%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(175, 30, 35, 0.1));
  animation-delay: 5s;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

/* Particles */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particleFloat 6s ease-in-out infinite;
}

.particle-1 {
  top: 25%;
  left: 20%;
  animation-delay: 0s;
  background: rgba(175, 30, 35, 0.8);
}

.particle-2 {
  top: 45%;
  right: 30%;
  animation-delay: 1s;
  background: rgba(255, 255, 255, 0.7);
}

.particle-3 {
  bottom: 35%;
  left: 15%;
  animation-delay: 2s;
  background: rgba(175, 30, 35, 0.6);
}

.particle-4 {
  top: 65%;
  right: 20%;
  animation-delay: 3s;
  background: rgba(255, 255, 255, 0.5);
}

.particle-5 {
  top: 30%;
  right: 10%;
  animation-delay: 4s;
  background: rgba(175, 30, 35, 0.7);
}

.particle-6 {
  bottom: 50%;
  right: 50%;
  animation-delay: 5s;
  background: rgba(255, 255, 255, 0.6);
}

.particle-7 {
  top: 80%;
  left: 30%;
  animation-delay: 1.5s;
  background: rgba(175, 30, 35, 0.5);
}

.particle-8 {
  top: 10%;
  left: 60%;
  animation-delay: 3.5s;
  background: rgba(255, 255, 255, 0.8);
}

/* Glowing Orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: orbFloat 10s ease-in-out infinite;
}

.orb-1 {
  width: 120px;
  height: 120px;
  top: 10%;
  right: 10%;
  background: radial-gradient(circle, rgba(175, 30, 35, 0.1) 0%, transparent 70%);
  animation-delay: 0s;
}

.orb-2 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 10%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  animation-delay: 3s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 5%;
  background: radial-gradient(circle, rgba(175, 30, 35, 0.08) 0%, transparent 70%);
  animation-delay: 6s;
}

/* Content */
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 10;
  position: relative;
  animation: fadeIn 0.8s ease-out;
}

/* Logo Container */
.logo-container {
  margin-bottom: 30px;
  animation: logoFadeIn 1s ease-out 0.3s both;
}

.logo {
  max-width: 200px;
  height: auto;
  display: block;
  animation: logoFloat 3s ease-in-out infinite;
}

/* App Name */
.app-name {
  margin-bottom: 40px;
  animation: nameFadeIn 1s ease-out 0.6s both;
}

.app-name h1 {
  font-size: 2.5rem;
  font-weight: 300;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: loadingFadeIn 1s ease-out 0.9s both;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 300;
  opacity: 0.8;
  margin: 0;
  letter-spacing: 0.1em;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes nameFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Floating Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-30px) rotate(270deg);
    opacity: 0.9;
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-15px) translateX(10px);
    opacity: 1;
  }
  50% {
    transform: translateY(-25px) translateX(-5px);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-10px) translateX(15px);
    opacity: 0.9;
  }
}

@keyframes orbFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.3;
  }
  33% {
    transform: translateY(-30px) scale(1.1);
    opacity: 0.6;
  }
  66% {
    transform: translateY(-15px) scale(0.9);
    opacity: 0.4;
  }
}

/* Transition Effects */
.splash-fade-enter-active {
  transition: opacity 0.6s ease-out;
}

.splash-fade-leave-active {
  transition: opacity 0.4s ease-in;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .logo {
    max-width: 160px;
  }
  
  .app-name h1 {
    font-size: 2rem;
  }
  
  /* Reduce floater sizes on mobile */
  .floater {
    transform: scale(0.8);
  }
  
  .orb {
    transform: scale(0.7);
  }
  
  .particle {
    transform: scale(0.8);
  }
}

@media (max-width: 480px) {
  .logo {
    max-width: 140px;
  }
  
  .app-name h1 {
    font-size: 1.5rem;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
  }
  
  .loading-text {
    font-size: 0.8rem;
  }
  
  /* Further reduce floater sizes on small mobile */
  .floater {
    transform: scale(0.6);
  }
  
  .orb {
    transform: scale(0.5);
  }
  
  .particle {
    transform: scale(0.6);
  }
}

@media (max-width: 320px) {
  .logo {
    max-width: 120px;
  }
  
  .app-name h1 {
    font-size: 1.25rem;
  }
  
  /* Minimal floaters on very small screens */
  .floater {
    transform: scale(0.4);
    opacity: 0.5;
  }
  
  .orb {
    transform: scale(0.3);
    opacity: 0.4;
  }
  
  .particle {
    transform: scale(0.4);
    opacity: 0.6;
  }
}
</style>
