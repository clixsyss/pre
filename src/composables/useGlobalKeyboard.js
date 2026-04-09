import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'

/**
 * Global keyboard handling composable — singleton pattern.
 * State is module-level so all consumers share the same isKeyboardVisible ref.
 */

// --- Singleton state (shared across all consumers) ---
const isKeyboardVisible = ref(false)
const keyboardHeight = ref(0)

// Track whether the global listeners have been registered
let listenersInitialized = false
let listenerCount = 0

let keyboardWillShowListener = null
let keyboardWillHideListener = null

// --- Handlers ---
const handleKeyboardShow = (info) => {
  isKeyboardVisible.value = true
  keyboardHeight.value = info?.keyboardHeight || 0
  document.body.classList.add('keyboard-open')
}

const handleKeyboardHide = () => {
  isKeyboardVisible.value = false
  keyboardHeight.value = 0
  document.body.classList.remove('keyboard-open')
}

// DOM fallback: only trigger if Capacitor events didn't fire
const handleFocus = (event) => {
  const target = event.target
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    setTimeout(() => {
      if (!isKeyboardVisible.value) {
        handleKeyboardShow({ keyboardHeight: 300 })
      }
    }, 150)
  }
}

const handleBlur = (event) => {
  const target = event.target
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    setTimeout(() => {
      const active = document.activeElement
      const stillInInput =
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.isContentEditable
      if (!stillInInput && isKeyboardVisible.value) {
        handleKeyboardHide()
      }
    }, 150)
  }
}

const initListeners = async () => {
  if (listenersInitialized) return
  listenersInitialized = true

  if (Capacitor.isNativePlatform()) {
    try {
      keyboardWillShowListener = await Keyboard.addListener('keyboardWillShow', handleKeyboardShow)
      keyboardWillHideListener = await Keyboard.addListener('keyboardWillHide', handleKeyboardHide)
      await Keyboard.setResizeMode({ mode: 'native' })
      await Keyboard.setScroll({ isDisabled: false })
      await Keyboard.setStyle({ style: 'dark' })
    } catch (error) {
      console.log('Keyboard API setup failed:', error)
    }
  }

  // DOM fallback always registered (handles web/browser testing too)
  document.addEventListener('focusin', handleFocus, true)
  document.addEventListener('focusout', handleBlur, true)
}

const destroyListeners = async () => {
  listenersInitialized = false
  if (keyboardWillShowListener) {
    await keyboardWillShowListener.remove()
    keyboardWillShowListener = null
  }
  if (keyboardWillHideListener) {
    await keyboardWillHideListener.remove()
    keyboardWillHideListener = null
  }
  document.removeEventListener('focusin', handleFocus, true)
  document.removeEventListener('focusout', handleBlur, true)
  document.body.classList.remove('keyboard-open')
}

// --- Composable ---
export function useGlobalKeyboard() {
  onMounted(() => {
    listenerCount++
    if (listenerCount === 1) {
      initListeners()
    }
  })

  onBeforeUnmount(() => {
    listenerCount--
    if (listenerCount === 0) {
      destroyListeners()
    }
  })

  const hideKeyboard = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Keyboard.hide()
      }
    } catch (error) {
      console.log('Error hiding keyboard:', error)
    }
  }

  return {
    isKeyboardVisible,
    keyboardHeight,
    hideKeyboard
  }
}
