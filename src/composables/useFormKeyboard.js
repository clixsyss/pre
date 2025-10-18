/**
 * useFormKeyboard Composable
 * 
 * Provides comprehensive keyboard handling for forms in mobile apps.
 * Ensures forms are scrollable when keyboard is open and inputs are visible.
 * 
 * Features:
 * - Auto-scroll to focused input when keyboard appears
 * - Enable keyboard scrolling via Capacitor Keyboard API
 * - Handle keyboard show/hide events
 * - Adjust page padding to accommodate keyboard
 * - Hide keyboard on backdrop click (optional)
 * - Proper cleanup on component unmount
 * 
 * Usage:
 * ```js
 * import { useFormKeyboard } from 'src/composables/useFormKeyboard'
 * 
 * // In your component setup:
 * const { isKeyboardVisible, keyboardHeight } = useFormKeyboard({
 *   scrollToInput: true,  // Auto-scroll to focused input
 *   hideOnBackdropClick: true  // Hide keyboard when clicking outside inputs
 * })
 * ```
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'

export function useFormKeyboard(options = {}) {
  const {
    scrollToInput = true,
    hideOnBackdropClick = true,
    scrollOffset = 100
  } = options

  // State
  const isKeyboardVisible = ref(false)
  const keyboardHeight = ref(0)
  const activeInput = ref(null)

  // Cleanup functions
  let keyboardShowListener = null
  let keyboardHideListener = null
  let focusListener = null
  let clickListener = null

  /**
   * Scroll to input element to ensure it's visible above keyboard
   */
  const scrollToInputElement = (element) => {
    if (!element || !scrollToInput) return

    setTimeout(() => {
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      const middle = absoluteElementTop - (window.innerHeight / 2) + scrollOffset

      window.scrollTo({
        top: middle,
        behavior: 'smooth'
      })
    }, 100)
  }

  /**
   * Handle keyboard showing
   */
  const handleKeyboardShow = (info) => {
    console.log('Keyboard will show:', info)
    isKeyboardVisible.value = true
    keyboardHeight.value = info.keyboardHeight || 0

    // Add padding to body to push content up
    document.body.style.paddingBottom = `${info.keyboardHeight}px`

    // Scroll to active input if enabled
    if (activeInput.value && scrollToInput) {
      scrollToInputElement(activeInput.value)
    }
  }

  /**
   * Handle keyboard hiding
   */
  const handleKeyboardHide = () => {
    console.log('Keyboard will hide')
    isKeyboardVisible.value = false
    keyboardHeight.value = 0
    activeInput.value = null

    // Remove padding from body
    document.body.style.paddingBottom = '0px'
  }

  /**
   * Handle input focus
   */
  const handleFocus = (event) => {
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.tagName === 'SELECT') {
      activeInput.value = event.target
      
      // Small delay to allow keyboard to appear
      setTimeout(() => {
        if (scrollToInput) {
          scrollToInputElement(event.target)
        }
      }, 300)
    }
  }

  /**
   * Handle backdrop click to hide keyboard
   */
  const handleBackdropClick = async (event) => {
    if (!hideOnBackdropClick || !isKeyboardVisible.value) return

    const target = event.target
    const isInputElement = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.tagName === 'SELECT' ||
                          target.closest('input, textarea, select')

    if (!isInputElement) {
      try {
        await Keyboard.hide()
      } catch (error) {
        // Keyboard API might not be available
        console.log('Keyboard.hide() not available:', error)
      }
    }
  }

  /**
   * Setup keyboard listeners
   */
  const setupKeyboardListeners = async () => {
    // Only setup on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Not a native platform, skipping keyboard setup')
      return
    }

    try {
      // Listen for keyboard events
      keyboardShowListener = await Keyboard.addListener('keyboardWillShow', handleKeyboardShow)
      keyboardHideListener = await Keyboard.addListener('keyboardWillHide', handleKeyboardHide)

      // Set resize mode to native - this pushes content up when keyboard appears
      await Keyboard.setResizeMode({ mode: 'native' })

      // Enable keyboard scrolling - CRITICAL for scrollability
      await Keyboard.setScroll({ isDisabled: false })

      // Set keyboard style
      await Keyboard.setStyle({ style: 'dark' })

      console.log('✅ Keyboard listeners set up successfully (native mode)')
    } catch (error) {
      console.log('Keyboard API setup failed (might not be available):', error)
    }
  }

  /**
   * Setup focus and click listeners for input handling
   */
  const setupInputListeners = () => {
    // Listen for focus events
    focusListener = handleFocus
    document.addEventListener('focusin', focusListener)

    // Listen for clicks to hide keyboard
    if (hideOnBackdropClick) {
      clickListener = handleBackdropClick
      document.addEventListener('click', clickListener, true)
    }
  }

  /**
   * Cleanup all listeners
   */
  const cleanup = async () => {
    // Remove Capacitor keyboard listeners
    if (keyboardShowListener) {
      await keyboardShowListener.remove()
    }
    if (keyboardHideListener) {
      await keyboardHideListener.remove()
    }

    // Remove DOM listeners
    if (focusListener) {
      document.removeEventListener('focusin', focusListener)
    }
    if (clickListener) {
      document.removeEventListener('click', clickListener, true)
    }
  }

  /**
   * Force hide keyboard
   */
  const hideKeyboard = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Keyboard.hide()
      }
    } catch (error) {
      console.log('Failed to hide keyboard:', error)
    }
  }

  /**
   * Force show keyboard (focus on input)
   */
  const showKeyboard = (inputElement) => {
    if (inputElement) {
      inputElement.focus()
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    setupKeyboardListeners()
    setupInputListeners()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    isKeyboardVisible,
    keyboardHeight,
    activeInput,
    
    // Methods
    hideKeyboard,
    showKeyboard,
    scrollToInputElement
  }
}

