<template>
  <div class="modal-header">
    <div class="modal-title-row">
      <div v-if="$slots.icon" class="modal-icon">
        <slot name="icon" />
      </div>
      <div class="modal-title-text">
        <h3>{{ title }}</h3>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="modal-right">
      <slot name="right" />
      <button v-if="showClose" @click="$emit('close')" class="close-btn" aria-label="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const { title, subtitle, showClose } = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  showClose: { type: Boolean, default: true }
})

defineEmits(['close'])
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.modal-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #AF1E23;
  background: #fff5f2;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.15);
  flex-shrink: 0;
}

.modal-title-text h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

.modal-title-text p {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.modal-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Mobile app - hover effects disabled */
/* .close-btn:hover {
  background: #e2e8f0;
  color: #334155;
} */
</style>


