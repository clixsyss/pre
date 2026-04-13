<template>
  <Transition name="banner-slide">
    <div
      v-if="show"
      class="warning-banner"
      @click="handleClick"
      role="alert"
    >
      <!-- Animated left accent -->
      <div class="banner-accent"></div>

      <div class="banner-content">
        <!-- Icon -->
        <div class="banner-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
              stroke-linejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2.2"
              stroke-linecap="round" />
          </svg>
        </div>

        <!-- Text -->
        <div class="banner-text">
          <p class="banner-title">
            {{ count === 1 ? 'Active Warning' : `${count} Active Warnings` }}
          </p>
          <p class="banner-subtitle">Tap to review</p>
        </div>

        <!-- Count badge -->
        <div class="banner-badge">{{ count }}</div>

        <!-- Arrow -->
        <svg class="banner-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineOptions({ name: 'WarningBanner' })

defineProps({
  count: { type: Number, required: true },
  show: { type: Boolean, required: true },
})

const emit = defineEmits(['click'])

const handleClick = () => emit('click')
</script>

<style scoped>
.warning-banner {
  position: relative;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1.5px solid #fbbf24;
  border-radius: 14px;
  margin-bottom: 24px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
}

.banner-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #d97706;
  animation: pulse-accent 2s ease-in-out infinite;
}

@keyframes pulse-accent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.banner-content {
  display: flex;
  align-items: center;
  padding: 14px 16px 14px 20px;
  gap: 12px;
}

.banner-icon {
  width: 40px;
  height: 40px;
  background: #d97706;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #92400e;
}

.banner-subtitle {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: #b45309;
}

.banner-badge {
  background: #d97706;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.banner-arrow {
  color: #b45309;
  flex-shrink: 0;
}

/* Transition */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.3s ease;
}

.banner-slide-enter-from,
.banner-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.banner-slide-enter-to,
.banner-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 80px;
}
</style>
