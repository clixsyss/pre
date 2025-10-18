import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'

/**
 * Global keyboard handling composable
 * Provides unified keyboard behavior across the entire app
 */
export function useGlobalKeyboard() {
  const isKeyboardVisible = ref(false)
  const keyboardHeight = ref(0)
  
  let keyboardShowListener = null
  let keyboardHideListener = null

  /**
   * Handle keyboard showing
   */
  const handleKeyboardShow = (info) => {
    console.log('🔍 Keyboard will show:', info)
    isKeyboardVisible.value = true
    keyboardHeight.value = info.keyboardHeight || 0
    
    // Add class to body for global styling
    document.body.classList.add('keyboard-open')
    
    // Adjust viewport to prevent scrolling issues
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    }
  }

  /**
   * Handle keyboard hiding
   */
  const handleKeyboardHide = () => {
    console.log('🔍 Keyboard will hide')
    isKeyboardVisible.value = false
    keyboardHeight.value = 0
    
    // Remove class from body
    document.body.classList.remove('keyboard-open')
    
    // Restore viewport settings
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    }
  }

  /**
   * Setup keyboard listeners
   */
  const setupKeyboardListeners = async () => {
    // Only setup on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('🔍 Not a native platform, skipping keyboard setup')
      return
    }

    try {
      // Listen for keyboard events
      keyboardShowListener = await Keyboard.addListener('keyboardWillShow', handleKeyboardShow)
      keyboardHideListener = await Keyboard.addListener('keyboardWillHide', handleKeyboardHide)

      // Set keyboard configuration for consistent behavior
      await Keyboard.setResizeMode({ mode: 'native' })
      await Keyboard.setScroll({ isDisabled: false })
      await Keyboard.setStyle({ style: 'dark' })

      console.log('✅ Global keyboard listeners set up successfully')
    } catch (error) {
      console.log('❌ Keyboard API setup failed:', error)
    }
  }

  /**
   * Cleanup keyboard listeners
   */
  const cleanupKeyboardListeners = async () => {
    if (keyboardShowListener) {
      await keyboardShowListener.remove()
      keyboardShowListener = null
    }
    if (keyboardHideListener) {
      await keyboardHideListener.remove()
      keyboardHideListener = null
    }
    
    // Clean up body class
    document.body.classList.remove('keyboard-open')
  }

  /**
   * Force hide keyboard
   */
  const hideKeyboard = async () => {
    try {
      await Keyboard.hide()
    } catch (error) {
      console.log('❌ Error hiding keyboard:', error)
    }
  }

  // Setup on mount
  onMounted(() => {
    setupKeyboardListeners()
  })

  // Cleanup on unmount
  onBeforeUnmount(() => {
    cleanupKeyboardListeners()
  })

  return {
    isKeyboardVisible,
    keyboardHeight,
    hideKeyboard
  }
}
