/**
 * usePullToRefresh Composable
 * 
 * Provides smooth pull-to-refresh functionality for mobile pages.
 * Works on both iOS and Android with native feel.
 * 
 * Features:
 * - Touch-based pull detection
 * - Smooth animations
 * - Haptic feedback (if available)
 * - Customizable refresh threshold
 * - Auto-reset after refresh
 * 
 * Usage:
 * ```js
 * import { usePullToRefresh } from 'src/composables/usePullToRefresh'
 * 
 * const { isRefreshing, pullDistance, setupPullToRefresh } = usePullToRefresh({
 *   onRefresh: async () => {
 *     await loadData()
 *   },
 *   threshold: 80
 * })
 * 
 * onMounted(() => {
 *   setupPullToRefresh()
 * })
 * ```
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

export function usePullToRefresh(options = {}) {
  const {
    onRefresh,
    threshold = 80,
    maxPullDistance = 150,
    resistance = 2.5
  } = options

  // State
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const isPulling = ref(false)

  // Touch tracking
  let startY = 0
  let currentY = 0
  let scrollableElement = null

  /**
   * Check if element is scrolled to top
   */
  const isAtTop = () => {
    if (!scrollableElement) {
      scrollableElement = document.querySelector('.main-content') || window
    }
    
    if (scrollableElement === window) {
      return window.scrollY === 0 || window.pageYOffset === 0
    }
    
    return scrollableElement.scrollTop === 0
  }

  /**
   * Handle touch start
   */
  const handleTouchStart = (e) => {
    if (isRefreshing.value) return
    
    if (isAtTop()) {
      startY = e.touches[0].clientY
      isPulling.value = false
    }
  }

  /**
   * Handle touch move
   */
  const handleTouchMove = (e) => {
    if (isRefreshing.value || !isAtTop()) {
      pullDistance.value = 0
      isPulling.value = false
      return
    }

    currentY = e.touches[0].clientY
    const distance = currentY - startY

    if (distance > 0) {
      isPulling.value = true
      
      // Apply resistance for more natural feel
      const resistedDistance = Math.min(
        distance / resistance,
        maxPullDistance
      )
      
      pullDistance.value = resistedDistance

      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault()
      }

      // Haptic feedback when reaching threshold
      if (resistedDistance >= threshold && resistedDistance < threshold + 5) {
        triggerHaptic('light')
      }
    }
  }

  /**
   * Handle touch end
   */
  const handleTouchEnd = async () => {
    if (!isPulling.value) return

    if (pullDistance.value >= threshold) {
      // Trigger refresh
      isRefreshing.value = true
      triggerHaptic('medium')
      
      try {
        if (onRefresh) {
          await onRefresh()
        }
      } catch (error) {
        console.error('Error during refresh:', error)
      } finally {
        // Reset state with delay for smooth animation
        setTimeout(() => {
          isRefreshing.value = false
          pullDistance.value = 0
          isPulling.value = false
        }, 300)
      }
    } else {
      // Not enough distance, reset
      pullDistance.value = 0
      isPulling.value = false
    }
  }

  /**
   * Trigger haptic feedback
   */
  const triggerHaptic = async (style = 'light') => {
    if (!Capacitor.isNativePlatform()) return

    try {
      const impactStyle = style === 'light' 
        ? ImpactStyle.Light 
        : style === 'medium' 
        ? ImpactStyle.Medium 
        : ImpactStyle.Heavy

      await Haptics.impact({ style: impactStyle })
    } catch (error) {
      // Haptics might not be available, ignore
    }
  }

  /**
   * Setup pull-to-refresh listeners
   */
  const setupPullToRefresh = (element = null) => {
    const target = element || document.body

    target.addEventListener('touchstart', handleTouchStart, { passive: true })
    target.addEventListener('touchmove', handleTouchMove, { passive: false })
    target.addEventListener('touchend', handleTouchEnd, { passive: true })

    console.log('✅ Pull-to-refresh enabled')
  }

  /**
   * Cleanup listeners
   */
  const cleanup = (element = null) => {
    const target = element || document.body

    target.removeEventListener('touchstart', handleTouchStart)
    target.removeEventListener('touchmove', handleTouchMove)
    target.removeEventListener('touchend', handleTouchEnd)
  }

  /**
   * Manual refresh trigger
   */
  const triggerRefresh = async () => {
    if (isRefreshing.value) return

    isRefreshing.value = true
    pullDistance.value = threshold

    try {
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('Error during manual refresh:', error)
    } finally {
      setTimeout(() => {
        isRefreshing.value = false
        pullDistance.value = 0
      }, 300)
    }
  }

  // Auto cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    isRefreshing,
    pullDistance,
    isPulling,
    
    // Methods
    setupPullToRefresh,
    cleanup,
    triggerRefresh,
    
    // Computed helpers
    isThresholdReached: () => pullDistance.value >= threshold
  }
}

