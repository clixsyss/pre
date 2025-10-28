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
  let keyboardDidShowListener = null
  let keyboardDidHideListener = null
  let focusListener = null
  let blurListener = null

  /**
   * Handle keyboard showing
   */
  const handleKeyboardShow = (info) => {
    console.log('🔍 Keyboard will show:', info)
    isKeyboardVisible.value = true
    keyboardHeight.value = info.keyboardHeight || 0
    
    // Add class to body for global styling
    document.body.classList.add('keyboard-open')
    
    // Force a reflow to ensure CSS applies immediately
    document.body.offsetHeight
    
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
    
    // Force a reflow to ensure CSS applies immediately
    document.body.offsetHeight
    
    // Restore viewport settings
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    }
  }

  /**
   * Handle focus events (fallback for iOS)
   */
  const handleFocus = (event) => {
    const target = event.target
    // Check if the focused element is an input, textarea, or contenteditable
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      console.log('🔍 Input focused (fallback detection):', target.tagName)
      // Delay to ensure keyboard is actually showing
      setTimeout(() => {
        if (!isKeyboardVisible.value) {
          handleKeyboardShow({ keyboardHeight: 300 }) // Estimated height
        }
      }, 100)
    }
  }

  /**
   * Handle blur events (fallback for iOS)
   */
  const handleBlur = (event) => {
    const target = event.target
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      console.log('🔍 Input blurred (fallback detection):', target.tagName)
      // Delay to check if another input was focused
      setTimeout(() => {
        const activeElement = document.activeElement
        const isInputFocused = 
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable
        
        if (!isInputFocused && isKeyboardVisible.value) {
          handleKeyboardHide()
        }
      }, 100)
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
      // Listen for keyboard events (primary method)
      keyboardShowListener = await Keyboard.addListener('keyboardWillShow', handleKeyboardShow)
      keyboardHideListener = await Keyboard.addListener('keyboardWillHide', handleKeyboardHide)
      
      // Also listen to didShow/didHide events (backup for iOS)
      keyboardDidShowListener = await Keyboard.addListener('keyboardDidShow', handleKeyboardShow)
      keyboardDidHideListener = await Keyboard.addListener('keyboardDidHide', handleKeyboardHide)

      // Set keyboard configuration for consistent behavior
      await Keyboard.setResizeMode({ mode: 'native' })
      await Keyboard.setScroll({ isDisabled: false })
      await Keyboard.setStyle({ style: 'dark' })

      console.log('✅ Global keyboard listeners set up successfully')
    } catch (error) {
      console.log('❌ Keyboard API setup failed:', error)
    }
    
    // Add DOM event listeners as fallback (for cases where Capacitor events don't fire)
    focusListener = document.addEventListener('focusin', handleFocus, true)
    blurListener = document.addEventListener('focusout', handleBlur, true)
    console.log('✅ DOM focus/blur listeners added as fallback')
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
    if (keyboardDidShowListener) {
      await keyboardDidShowListener.remove()
      keyboardDidShowListener = null
    }
    if (keyboardDidHideListener) {
      await keyboardDidHideListener.remove()
      keyboardDidHideListener = null
    }
    
    // Remove DOM event listeners
    if (focusListener) {
      document.removeEventListener('focusin', handleFocus, true)
      focusListener = null
    }
    if (blurListener) {
      document.removeEventListener('focusout', handleBlur, true)
      blurListener = null
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
