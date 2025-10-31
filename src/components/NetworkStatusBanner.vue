<template>
  <transition name="slide-down">
    <div v-if="!isOnline || isSlowConnection" class="network-status-banner" :class="bannerClass">
      <q-icon :name="bannerIcon" size="20px" class="banner-icon" />
      <div class="banner-content">
        <div class="banner-title">{{ bannerTitle }}</div>
        <div class="banner-message">{{ bannerMessage }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useNetworkStatus } from '../composables/useNetworkStatus'
import { useI18n } from 'vue-i18n'

// Component name for ESLint
defineOptions({
  name: 'NetworkStatusBanner'
})

const { isOnline, isSlowConnection } = useNetworkStatus()
const { t } = useI18n()

const bannerClass = computed(() => {
  if (!isOnline.value) return 'banner-offline'
  if (isSlowConnection.value) return 'banner-slow'
  return ''
})

const bannerIcon = computed(() => {
  if (!isOnline.value) return 'wifi_off'
  if (isSlowConnection.value) return 'signal_wifi_statusbar_connected_no_internet_4'
  return 'wifi'
})

const bannerTitle = computed(() => {
  if (!isOnline.value) return t('noInternetConnection')
  if (isSlowConnection.value) return t('weakConnection')
  return t('connected')
})

const bannerMessage = computed(() => {
  if (!isOnline.value) return t('pleaseCheckConnection')
  if (isSlowConnection.value) return t('someFeaturesSlowUnavailable')
  return ''
})
</script>

<style scoped>
.network-status-banner {
  position: fixed;
  top: 40px;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.banner-offline {
  background-color: #c10015;
}

.banner-slow {
  background-color: #f2c037;
  color: #333;
}

.banner-icon {
  margin-inline-end: 12px;
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.banner-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.banner-message {
  font-size: 12px;
  opacity: 0.9;
}

/* RTL Support */
[dir="rtl"] .network-status-banner {
  text-align: right;
}

/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>

