<template>
  <div v-if="isOpen && warning" class="modal-overlay" @click.self="dismiss">
    <div class="modal-card">
      <!-- Animated background rings -->
      <div class="bg-rings" aria-hidden="true">
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
        <div class="ring ring-3"></div>
      </div>

      <!-- Icon -->
      <div class="icon-wrap">
        <div class="icon-inner">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" />
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" />
          </svg>
        </div>
        <div class="icon-glow"></div>
      </div>

      <!-- Heading -->
      <div class="modal-heading">
        <p class="heading-label">New Warning</p>
        <h2 class="heading-title">{{ warning.title }}</h2>
      </div>

      <!-- Image -->
      <img
        v-if="warning.image"
        :src="warning.image"
        :alt="warning.title"
        class="modal-image"
      />

      <!-- Description -->
      <p class="modal-description">{{ warning.description }}</p>

      <!-- Date pill -->
      <div class="date-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor"
            stroke-width="1.5" />
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="1.5" />
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="1.5" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <span v-if="warning.endDate">
          {{ formatDate(warning.startDate) }} → {{ formatDate(warning.endDate) }}
        </span>
        <span v-else>{{ formatDate(warning.startDate) }}</span>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button class="btn-primary" @click="viewWarnings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor"
              stroke-width="2" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
          </svg>
          View My Warnings
        </button>
        <button class="btn-secondary" @click="dismiss">Dismiss</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineOptions({ name: 'WarningModal' })

defineProps({
  warning: { type: Object, default: null },
  isOpen: { type: Boolean, required: true },
})

const emit = defineEmits(['close'])
const router = useRouter()

const viewWarnings = () => {
  emit('close')
  router.push('/warnings')
}

const dismiss = () => emit('close')

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(6px);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-card {
  background: white;
  border-radius: 24px;
  padding: 32px 24px 28px;
  max-width: 400px;
  width: 100%;
  position: relative;
  overflow: hidden;
  text-align: center;
  box-shadow: 0 24px 48px rgba(0,0,0,0.2);
  animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Decorative rings */
.bg-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  pointer-events: none;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(217, 119, 6, 0.12);
  border-radius: 50%;
  animation: expandRing 3s ease-in-out infinite;
}

.ring-1 { width: 100px; height: 100px; }
.ring-2 { width: 150px; height: 150px; animation-delay: 1s; }
.ring-3 { width: 200px; height: 200px; animation-delay: 2s; }

@keyframes expandRing {
  0% { transform: translate(-50%,-50%) scale(0.9); opacity: 0.4; }
  50% { transform: translate(-50%,-50%) scale(1.1); opacity: 0.1; }
  100% { transform: translate(-50%,-50%) scale(1.3); opacity: 0; }
}

/* Icon */
.icon-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.icon-inner {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto;
  box-shadow: 0 6px 20px rgba(217, 119, 6, 0.3);
  animation: iconBounce 0.6s ease-out;
}

@keyframes iconBounce {
  0% { transform: scale(0); }
  55% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* Heading */
.modal-heading {
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.heading-label {
  margin: 0 0 6px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #dc2626;
}

.heading-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
}

/* Image */
.modal-image {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

/* Description */
.modal-description {
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.55;
  position: relative;
  z-index: 1;
}

/* Date pill */
.date-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fef3c7;
  color: #dc2626;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

/* Actions */
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 15px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(217,119,6,0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 14px;
  padding: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 480px) {
  .modal-card {
    padding: 28px 20px 24px;
    border-radius: 20px;
  }

  .icon-inner {
    width: 68px;
    height: 68px;
  }
}
</style>
