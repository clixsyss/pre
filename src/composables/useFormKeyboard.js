/**
 * useFormKeyboard Composable
 *
 * Provides scroll-to-input behavior for forms when the keyboard opens.
 * Relies on useGlobalKeyboard for the shared keyboard state — does NOT
 * register its own Capacitor keyboard listeners (avoids double-firing).
 *
 * Usage:
 * ```js
 * import { useFormKeyboard } from 'src/composables/useFormKeyboard'
 *
 * const { isKeyboardVisible, keyboardHeight } = useFormKeyboard({
 *   scrollToInput: true,
 *   hideOnBackdropClick: true
 * })
 * ```
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'
import { useGlobalKeyboard } from './useGlobalKeyboard'

export function useFormKeyboard(options = {}) {
  const {
    scrollToInput = true,
    hideOnBackdropClick = true,
    scrollOffset = 100
  } = options

  // Re-export the global keyboard state so callers don't need a separate import
  const { isKeyboardVisible, keyboardHeight, hideKeyboard } = useGlobalKeyboard()

  const activeInput = ref(null)

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
   * Handle input focus — track which element is active and scroll to it
   */
  const handleFocus = (event) => {
    const target = event.target
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT'
    ) {
      activeInput.value = target
      // Delay to allow keyboard animation to start
      setTimeout(() => {
        if (scrollToInput) {
          scrollToInputElement(target)
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
    const isInputElement =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.closest('input, textarea, select')

    if (!isInputElement) {
      try {
        if (Capacitor.isNativePlatform()) {
          await Keyboard.hide()
        }
      } catch {
        // Keyboard API might not be available
      }
    }
  }

  onMounted(() => {
    focusListener = handleFocus
    document.addEventListener('focusin', focusListener)

    if (hideOnBackdropClick) {
      clickListener = handleBackdropClick
      document.addEventListener('click', clickListener, true)
    }
  })

  onUnmounted(() => {
    if (focusListener) {
      document.removeEventListener('focusin', focusListener)
    }
    if (clickListener) {
      document.removeEventListener('click', clickListener, true)
    }
    activeInput.value = null
  })

  return {
    isKeyboardVisible,
    keyboardHeight,
    activeInput,
    hideKeyboard,
    scrollToInputElement
  }
}
