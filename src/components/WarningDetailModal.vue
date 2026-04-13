<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header" :class="headerClass">
        <div class="modal-header-content">
          <div class="warning-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" />
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" />
            </svg>
          </div>
          <div>
            <p class="modal-label">Warning</p>
            <h2 class="modal-title">{{ warning.title }}</h2>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Status Badge -->
        <div class="status-row">
          <span class="status-badge" :class="statusClass(warning.status)">
            <span class="status-dot"></span>
            {{ formatStatus(warning.status) }}
          </span>
          <span class="issued-date">Issued {{ formatDate(warning.createdAt) }}</span>
        </div>

        <!-- Image -->
        <div v-if="warning.image" class="image-section">
          <img
            :src="warning.image"
            :alt="warning.title"
            class="warning-img"
            @click="showFullImage = true"
          />
          <p class="tap-hint">Tap image to expand</p>
        </div>

        <!-- Title (Arabic) -->
        <div v-if="warning.title_ar" class="field-group" dir="rtl">
          <p class="field-label">العنوان</p>
          <p class="field-value rtl-text">{{ warning.title_ar }}</p>
        </div>

        <!-- Description (English) -->
        <div class="field-group">
          <p class="field-label">Description</p>
          <p class="field-value">{{ warning.description }}</p>
        </div>

        <!-- Description (Arabic) -->
        <div v-if="warning.description_ar" class="field-group" dir="rtl">
          <p class="field-label">الوصف</p>
          <p class="field-value rtl-text">{{ warning.description_ar }}</p>
        </div>

        <!-- Date / Date Range -->
        <div class="field-group">
          <p class="field-label">Warning Period</p>
          <div class="date-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
        </div>

        <!-- Converted Fine Notice -->
        <div v-if="warning.status === 'converted'" class="converted-notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <p>This warning has been converted to a fine. Please check your Fines & Violations.</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-close" @click="$emit('close')">Close</button>
      </div>
    </div>

    <!-- Full-Image Lightbox -->
    <div v-if="showFullImage" class="lightbox" @click="showFullImage = false">
      <img :src="warning.image" class="lightbox-img" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineOptions({ name: 'WarningDetailModal' })

const props = defineProps({
  warning: { type: Object, required: true },
  isOpen: { type: Boolean, required: true },
})
defineEmits(['close'])

const showFullImage = ref(false)

const headerClass = computed(() => ({
  'header-active': props.warning?.status === 'active',
  'header-resolved': props.warning?.status === 'resolved',
  'header-converted': props.warning?.status === 'converted',
}))

const statusClass = (status) => ({
  active: 'badge-active',
  resolved: 'badge-resolved',
  converted: 'badge-converted',
}[status] || 'badge-active')

const formatStatus = (status) => ({
  active: 'Active',
  resolved: 'Resolved',
  converted: 'Converted to Fine',
}[status] || status)

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
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 99999;
  padding: 0;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-container {
  background: white;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 20px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.header-active { border-bottom-color: #fef3c7; }
.header-resolved { border-bottom-color: #d1fae5; }
.header-converted { border-bottom-color: #dbeafe; }

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.warning-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #fef3c7;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-label {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
}

.modal-title {
  margin: 4px 0 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  flex-shrink: 0;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.badge-active { background: #fef3c7; color: #d97706; }
.badge-resolved { background: #d1fae5; color: #059669; }
.badge-converted { background: #dbeafe; color: #2563eb; }

.issued-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.image-section {
  text-align: center;
}

.warning-img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 14px;
  cursor: pointer;
}

.tap-hint {
  margin: 6px 0 0;
  font-size: 0.7rem;
  color: #9ca3af;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
}

.field-value {
  margin: 0;
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.5;
}

.rtl-text { text-align: right; }

.date-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #374151;
}

.converted-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #eff6ff;
  border-radius: 12px;
  padding: 14px;
  color: #1d4ed8;
}

.converted-notice p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
}

.btn-close {
  width: 100%;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
}

.lightbox-img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 12px;
  object-fit: contain;
}
</style>
