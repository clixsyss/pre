<template>
  <Transition name="splash-fade">
    <div class="splash-screen" v-if="splashStore.show">
      <!-- Video plays fully, then freezes on its last frame until the app is ready -->
      <video
        ref="splashVideo"
        class="splash-video"
        :src="splashVideoSrc"
        :poster="logoImg"
        autoplay
        muted
        playsinline
        preload="auto"
        @ended="onVideoEnded"
        @loadeddata="onVideoLoaded"
        @canplay="onVideoCanPlay"
        @error="onVideoError"
      >
        Your browser does not support the video tag.
      </video>

      <!-- Fallback overlay: only shown when video fails to load/play -->
      <div class="video-overlay" :class="{ 'overlay-visible': showFallback }">
        <div class="loading-content">
          <div class="logo-container">
            <img
              :src="logoImg"
              alt="PRE GROUP Logo"
              class="logo"
              @error="handleLogoError"
            />
          </div>
          <div class="loading">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useSplashStore } from '../stores/splash'
import { Capacitor } from '@capacitor/core'
import { SplashScreen as CapSplash } from '@capacitor/splash-screen'
import logoImg from '../assets/logo.png'

const splashVideoSrc = '/splash.mp4'

const splashStore = useSplashStore()
const splashVideo = ref(null)
// Only shown when video fails entirely — not during normal playback
const showFallback = ref(false)

const handleLogoError = (event) => {
  if (event?.target) event.target.style.display = 'none'
}

const attemptPlay = () => {
  const video = splashVideo.value
  if (!video) return
  const p = video.play()
  if (p?.catch) p.catch(() => {})
}

const onVideoLoaded = () => attemptPlay()
const onVideoCanPlay = () => { if (splashVideo.value?.paused) attemptPlay() }

const onVideoError = () => {
  // Video can't load at all — show logo+spinner fallback and signal ready immediately
  showFallback.value = true
  splashStore.setVideoCompleted()
}

const onVideoEnded = () => {
  // Freeze on the last frame — keep the video visible until the app is ready
  const video = splashVideo.value
  if (video) {
    video.currentTime = video.duration - 0.04
    video.pause()
  }
  // Signal that video is done; splash hides only when app is also initialized
  splashStore.setVideoCompleted()
}

onMounted(async () => {
  // Replace native Capacitor splash with our video splash
  if (Capacitor.isNativePlatform()) {
    setTimeout(async () => {
      try { await CapSplash.hide() } catch { /* non-fatal */ }
    }, 80)
  }

  await nextTick()
  attemptPlay()

  // Fallback: if video never started within 1.5s, treat it as complete
  setTimeout(() => {
    if (splashStore.videoCompleted) return
    const video = splashVideo.value
    if (!video || (video.paused && video.currentTime === 0)) {
      showFallback.value = true
      splashStore.setVideoCompleted()
    }
  }, 1500)

  // Safety net: force complete after 5s regardless
  setTimeout(() => {
    if (splashStore.show) {
      splashStore.setVideoCompleted()
      splashStore.setAppInitialized()
      splashStore.hideSplash()
    }
  }, 5000)
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
  background: #000; /* Black background to prevent white flash */
}

/* Video Background */
.splash-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  background: #000; /* Black background while video loads */
}

/* Fallback overlay — covers screen when video fails to load/play */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #231f20;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-out;
}

.video-overlay.overlay-visible {
  opacity: 1;
  pointer-events: auto;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 30px;
}

.logo-container .logo {
  max-width: 180px;
  height: auto;
  display: block;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 300;
  opacity: 0.7;
  margin: 0;
  letter-spacing: 0.1em;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Splash fade-out transition — smooth dissolve into the app */
.splash-fade-enter-active {
  transition: opacity 0.3s ease-out;
}

.splash-fade-leave-active {
  transition: opacity 0.4s ease-in;
}

.splash-fade-enter-from,
.splash-fade-leave-to {
  opacity: 0;
}

.splash-screen {
  will-change: opacity;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
</style>
