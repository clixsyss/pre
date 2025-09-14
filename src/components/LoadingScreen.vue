<template>
  <Transition name="loading-fade">
    <div class="loading-screen" v-if="show">
      <!-- Pure Black Background -->
      <div class="black-background"></div>
      
      <!-- Animated Background Elements -->
      <div class="animated-bg">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
        <div class="floating-circle circle-4"></div>
      </div>
      
      <!-- Logo Content -->
      <div class="logo-container">
        <div class="logo-wrapper">
          <img src="../assets/logo.png" alt="PRE Logo" class="logo" />
          <div class="logo-glow"></div>
        </div>
        <div class="tagline">Relive.</div>
        <div class="loading-indicator">
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="loading-text" v-if="message">{{ message }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9998;
  overflow: hidden;
}

.black-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #231F20;
  z-index: 1;
}

.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 60px;
  height: 60px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.circle-4 {
  width: 40px;
  height: 40px;
  top: 40%;
  right: 30%;
  animation-delay: 1s;
}

.logo-container {
  text-align: center;
  animation: fadeInUp 1.2s ease-out;
  z-index: 3;
  position: relative;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
}

.logo {
  max-width: 200px;
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(255, 255, 255, 0.1));
  animation: logoPulse 2s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 3s ease-in-out infinite;
  z-index: 1;
}

.tagline {
  color: #F6F6F6;
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 2px;
  opacity: 0.9;
  margin-bottom: 40px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  animation: taglineFade 1.5s ease-out 0.5s both;
}

.loading-indicator {
  margin-top: 30px;
  animation: loadingFade 1s ease-out 1s both;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(45deg, #F6F6F6, #F6F6F6);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: loadingBounce 1.6s ease-in-out infinite both;
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

.loading-text {
  color: #F6F6F6;
  font-size: 14px;
  font-weight: 300;
  opacity: 0.8;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes taglineFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 0.9;
    transform: translateY(0);
  }
}

@keyframes loadingFade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingBounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.6;
  }
}

/* Transition effects */
.loading-fade-enter-active {
  transition: opacity 0.8s ease-out;
}

.loading-fade-leave-active {
  transition: opacity 0.6s ease-in;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .logo {
    max-width: 150px;
  }
  
  .tagline {
    font-size: 16px;
    letter-spacing: 1.5px;
  }
  
  .floating-circle {
    opacity: 0.2;
  }
}

@media (max-width: 480px) {
  .logo {
    max-width: 120px;
  }
  
  .tagline {
    font-size: 14px;
    letter-spacing: 1px;
  }
  
  .dot {
    width: 10px;
    height: 10px;
  }
  
  .loading-dots {
    gap: 8px;
  }
  
  .loading-text {
    font-size: 12px;
  }
}

@media (max-width: 320px) {
  .logo {
    max-width: 100px;
  }
  
  .tagline {
    font-size: 12px;
  }
}
</style>
