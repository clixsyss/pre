import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

/**
 * Swipe Navigation Composable
 * Provides touch gesture detection for navigating between main app tabs
 * Supports left/right swipe gestures with customizable sensitivity
 */
export function useSwipeNavigation() {
  const router = useRouter()
  const route = useRoute()
  
  // Touch state
  const touchStart = ref({ x: 0, y: 0, time: 0 })
  const touchEnd = ref({ x: 0, y: 0, time: 0 })
  const isSwipeActive = ref(false)
  const swipeProgress = ref(0) // 0 to 1, for visual feedback
  
  // Swipe configuration
  const config = {
    minDistance: 50, // Minimum swipe distance in pixels
    maxTime: 400, // Maximum swipe time in milliseconds
    minVelocity: 0.2, // Minimum swipe velocity (distance/time)
    verticalThreshold: 60, // Maximum vertical movement to still count as horizontal swipe
    deadZones: [], // Areas where swipe should be disabled
  }
  
  // Define the main navigation tabs in order
  const mainTabs = [
    { path: '/home', name: 'Home' },
    { path: '/services', name: 'Services' },
    { path: '/facilities', name: 'Facilities' },
    { path: '/profile', name: 'Profile' }
  ]
  
  /**
   * Get current tab index
   */
  const getCurrentTabIndex = () => {
    const currentPath = route.path
    return mainTabs.findIndex(tab => {
      if (tab.path === currentPath) return true
      
      // Handle sub-routes that should be considered part of main tabs
      switch (tab.path) {
        case '/services':
          return currentPath.startsWith('/service-category') || 
                 currentPath === '/my-bookings' || 
                 currentPath === '/calendar' ||
                 currentPath === '/analytics' ||
                 currentPath === '/news' ||
                 currentPath === '/smart-devices'
        
        case '/facilities':
          return currentPath === '/court-booking' ||
                 currentPath === '/academy-programs' ||
                 currentPath === '/academy-details' ||
                 currentPath === '/academy-registration' ||
                 currentPath === '/academy-booking' ||
                 currentPath === '/stores-shopping' ||
                 currentPath.startsWith('/store') ||
                 currentPath === '/shopping-cart'
        
        case '/complaints':
          return currentPath.startsWith('/complaints/')
        
        default:
          return false
      }
    })
  }
  
  /**
   * Navigate to tab by index
   */
  const navigateToTab = (index) => {
    if (index >= 0 && index < mainTabs.length) {
      const targetTab = mainTabs[index]
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10) // Short vibration
      }
      
      router.push(targetTab.path)
    }
  }
  
  /**
   * Navigate to next tab (swipe left)
   */
  const navigateNext = () => {
    const currentIndex = getCurrentTabIndex()
    if (currentIndex !== -1 && currentIndex < mainTabs.length - 1) {
      navigateToTab(currentIndex + 1)
      return true
    }
    return false
  }
  
  /**
   * Navigate to previous tab (swipe right)
   */
  const navigatePrevious = () => {
    const currentIndex = getCurrentTabIndex()
    if (currentIndex !== -1 && currentIndex > 0) {
      navigateToTab(currentIndex - 1)
      return true
    }
    return false
  }
  
  /**
   * Check if point is in a dead zone
   */
  const isInDeadZone = (x, y) => {
    return config.deadZones.some(zone => {
      return x >= zone.x && x <= zone.x + zone.width &&
             y >= zone.y && y <= zone.y + zone.height
    })
  }
  
  /**
   * Handle touch start
   */
  const handleTouchStart = (event) => {
    const touch = event.touches[0]
    const x = touch.clientX
    const y = touch.clientY
    
    // Check if touch started in a dead zone
    if (isInDeadZone(x, y)) {
      return
    }
    
    touchStart.value = {
      x,
      y,
      time: Date.now()
    }
    
    isSwipeActive.value = true
    swipeProgress.value = 0
  }
  
  /**
   * Handle touch move (for visual feedback)
   */
  const handleTouchMove = (event) => {
    if (!isSwipeActive.value) return
    
    const touch = event.touches[0]
    const currentX = touch.clientX
    const currentY = touch.clientY
    
    const deltaX = currentX - touchStart.value.x
    const deltaY = Math.abs(currentY - touchStart.value.y)
    
    // Check if this is still a horizontal swipe
    if (deltaY > config.verticalThreshold) {
      isSwipeActive.value = false
      swipeProgress.value = 0
      return
    }
    
    // Calculate swipe progress for visual feedback
    const progress = Math.min(Math.abs(deltaX) / config.minDistance, 1)
    swipeProgress.value = progress
    
    // Prevent default scrolling if this looks like a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault()
      }
    }
  }
  
  /**
   * Handle touch end
   */
  const handleTouchEnd = (event) => {
    if (!isSwipeActive.value) return
    
    const touch = event.changedTouches[0]
    touchEnd.value = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    
    const deltaX = touchEnd.value.x - touchStart.value.x
    const deltaY = Math.abs(touchEnd.value.y - touchStart.value.y)
    const deltaTime = touchEnd.value.time - touchStart.value.time
    const distance = Math.abs(deltaX)
    const velocity = distance / deltaTime
    
    // Reset swipe state
    isSwipeActive.value = false
    swipeProgress.value = 0
    
    // Check if this qualifies as a swipe
    const isValidSwipe = 
      distance >= config.minDistance &&
      deltaTime <= config.maxTime &&
      velocity >= config.minVelocity &&
      deltaY <= config.verticalThreshold
    
    if (isValidSwipe) {
      if (deltaX > 0) {
        // Swipe right - go to previous tab
        const success = navigatePrevious()
        if (!success) {
          // Add bounce feedback if at boundary
          if (navigator.vibrate) {
            navigator.vibrate([30, 10, 30]) // Double vibration for boundary
          }
        }
      } else {
        // Swipe left - go to next tab
        const success = navigateNext()
        if (!success) {
          // Add bounce feedback if at boundary
          if (navigator.vibrate) {
            navigator.vibrate([30, 10, 30]) // Double vibration for boundary
          }
        }
      }
    }
  }
  
  /**
   * Add dead zone (area where swipe should be disabled)
   */
  const addDeadZone = (x, y, width, height) => {
    config.deadZones.push({ x, y, width, height })
  }
  
  /**
   * Clear all dead zones
   */
  const clearDeadZones = () => {
    config.deadZones = []
  }
  
  // Mouse event handlers for desktop testing
  let isMouseDown = false
  
  const handleMouseDown = (event) => {
    isMouseDown = true
    // Convert mouse event to touch-like event
    const fakeTouch = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }]
    }
    handleTouchStart(fakeTouch)
  }
  
  const handleMouseMove = (event) => {
    if (!isMouseDown) return
    const fakeTouch = {
      touches: [{ clientX: event.clientX, clientY: event.clientY }],
      preventDefault: () => event.preventDefault()
    }
    handleTouchMove(fakeTouch)
  }
  
  const handleMouseUp = (event) => {
    if (!isMouseDown) return
    isMouseDown = false
    const fakeTouch = {
      changedTouches: [{ clientX: event.clientX, clientY: event.clientY }]
    }
    handleTouchEnd(fakeTouch)
  }

  /**
   * Setup touch event listeners
   */
  const setupEventListeners = () => {
    // Touch events for mobile
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    // Mouse events for desktop testing
    document.addEventListener('mousedown', handleMouseDown, { passive: false })
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp, { passive: true })
  }
  
  /**
   * Remove touch event listeners
   */
  const removeEventListeners = () => {
    // Remove touch events
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    
    // Remove mouse events
    document.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  // Setup and cleanup
  onMounted(() => {
    setupEventListeners()
  })
  
  onUnmounted(() => {
    removeEventListeners()
  })
  
  return {
    // State
    isSwipeActive,
    swipeProgress,
    
    // Methods
    navigateNext,
    navigatePrevious,
    navigateToTab,
    getCurrentTabIndex,
    addDeadZone,
    clearDeadZones,
    
    // Configuration
    config,
    mainTabs
  }
}
