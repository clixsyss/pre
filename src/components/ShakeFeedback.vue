<template>
  <Transition name="shake-feedback">
    <div v-if="isVisible" class="shake-feedback-overlay">
      <div class="shake-feedback-content">
        <div class="shake-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 9L4 4M20 4L15 9M9 15L4 20M20 20L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <p class="shake-text">Opening Gate Access</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

const show = () => {
  isVisible.value = true
  setTimeout(() => {
    isVisible.value = false
  }, 800)
}

defineExpose({
  show
})
</script>

<style scoped>
.shake-feedback-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999999;
  pointer-events: none;
}

.shake-feedback-content {
  background: rgba(35, 31, 32, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 2px rgba(175, 30, 35, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: shakePulse 0.8s ease-out;
}

.shake-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F6F6F6;
  box-shadow: 
    0 8px 24px rgba(175, 30, 35, 0.4),
    0 0 0 4px rgba(175, 30, 35, 0.2);
  animation: shakeRotate 0.6s ease-in-out;
}

.shake-text {
  color: #F6F6F6;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Animations */
@keyframes shakePulse {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shakeRotate {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  75% {
    transform: rotate(15deg);
  }
}

/* Transition */
.shake-feedback-enter-active {
  animation: shakeFeedbackIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.shake-feedback-leave-active {
  animation: shakeFeedbackOut 0.3s ease;
}

@keyframes shakeFeedbackIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes shakeFeedbackOut {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .shake-feedback-content {
    padding: 24px 32px;
  }
  
  .shake-icon {
    width: 64px;
    height: 64px;
  }
  
  .shake-icon svg {
    width: 48px;
    height: 48px;
  }
  
  .shake-text {
    font-size: 1rem;
  }
}
</style>

