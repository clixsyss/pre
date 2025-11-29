import { ref } from 'vue'

// Global modal state
const isAnyModalOpen = ref(false)
const modalCount = ref(0)

export function useModalState() {
  const openModal = () => {
    modalCount.value++
    isAnyModalOpen.value = true
    // Add class to body for iOS navigation bar hiding
    document.body.classList.add('modal-open')
  }

  const closeModal = () => {
    modalCount.value = Math.max(0, modalCount.value - 1)
    if (modalCount.value === 0) {
      isAnyModalOpen.value = false
      // Remove class from body
      document.body.classList.remove('modal-open')
    }
  }

  return {
    isAnyModalOpen,
    modalCount,
    openModal,
    closeModal
  }
}

