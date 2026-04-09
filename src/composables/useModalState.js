import { ref } from 'vue'

// Global modal state
const isAnyModalOpen = ref(false)
const modalCount = ref(0)

export function useModalState() {
  const syncBodyState = () => {
    if (modalCount.value > 0) {
      isAnyModalOpen.value = true
      document.body.classList.add('modal-open')
      return
    }
    isAnyModalOpen.value = false
    document.body.classList.remove('modal-open')
  }

  const openModal = () => {
    modalCount.value++
    syncBodyState()
  }

  const closeModal = () => {
    modalCount.value = Math.max(0, modalCount.value - 1)
    syncBodyState()
  }

  const resetModalState = () => {
    modalCount.value = 0
    syncBodyState()
  }

  return {
    isAnyModalOpen,
    modalCount,
    openModal,
    closeModal,
    resetModalState
  }
}
