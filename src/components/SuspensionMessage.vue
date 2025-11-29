<template>
  <div v-if="show" class="suspension-overlay">
    <div class="suspension-modal">
      <div class="suspension-header">
        <div class="suspension-icon">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 class="suspension-title">{{ message.title }}</h2>
        <p class="suspension-subtitle">{{ $t('accountAccessRestricted') }}</p>
      </div>

      <div class="suspension-content">
        <div class="suspension-message-box">
          <p class="suspension-text">{{ message.message }}</p>
        </div>

        <div v-if="message.type === 'temporary' && message.endDate" class="suspension-details">
          <div class="detail-card">
            <div class="detail-content">
              <span class="detail-label">{{ $t('suspensionType') }}</span>
              <span class="detail-value">{{ $t('temporary') }}</span>
            </div>
          </div>
          <div class="detail-card">
            <div class="detail-content">
              <span class="detail-label">{{ $t('endsOn') }}</span>
              <span class="detail-value">{{ formatEndDate(message.endDate) }}</span>
            </div>
          </div>
          <div class="detail-card">
            <div class="info-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="info-text">{{ $t('canAccessProfileGate') }}</p>
          </div>
        </div>

        <div v-else-if="message.type === 'permanent'" class="suspension-details">
          <div class="detail-card">
            <div class="detail-content">
              <span class="detail-label">{{ $t('suspensionType') }}</span>
              <span class="detail-value">{{ $t('permanent') }}</span>
            </div>
          </div>
          <div class="detail-card">
            <div class="info-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="info-text">{{ $t('canAccessProfileGate') }}</p>
          </div>
        </div>
      </div>

      <div class="suspension-footer">
        <div class="button-group">
          <button @click="handleContactSupport" class="support-button">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {{ $t('contactSupport') }}
          </button>
          <button @click="handleDismiss" class="dismiss-button">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ $t('iUnderstand') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// No Vue imports needed for this component

export default {
  name: 'SuspensionMessage',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: Object,
      default: () => ({
        title: 'Account Suspended',
        message: 'Your account has been suspended.',
        type: 'temporary',
        endDate: null
      })
    }
  },
  emits: ['dismiss', 'contactSupport'],
  setup(props, { emit }) {
    const handleDismiss = () => {
      emit('dismiss')
    }

    const handleContactSupport = () => {
      emit('contactSupport')
    }

    const formatEndDate = (endDate) => {
      if (!endDate) return 'N/A'

      const date = endDate.toDate ? endDate.toDate() : new Date(endDate)
      return date.toLocaleString()
    }

    return {
      handleDismiss,
      handleContactSupport,
      formatEndDate
    }
  }
}
</script>

<style scoped>
.suspension-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.suspension-modal {
  background: white;
  border-radius: 20px;
  box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid #fecaca;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.suspension-header {
  padding: 32px 32px 24px;
  text-align: center;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 20px 20px 0 0;
  border-bottom: 1px solid #fecaca;
}

.suspension-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fca5a5 0%, #ef4444 100%);
  border-radius: 50%;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.suspension-title {
  font-size: 24px;
  font-weight: 800;
  color: #dc2626;
  margin: 0 0 8px;
  letter-spacing: -0.025em;
}

.suspension-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: #991b1b;
  margin: 0;
  opacity: 0.8;
}

.suspension-content {
  padding: 32px;
}

.suspension-message-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.suspension-text {
  font-size: 14px;
  line-height: 1.7;
  color: #7f1d1d;
  margin: 0;
  white-space: pre-line;
  font-weight: 500;
}

.suspension-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.detail-card {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .detail-card:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
} */

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #fee2e2;
  border-radius: 10px;
  color: #dc2626;
  margin-right: 16px;
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #dcfce7;
  border-radius: 8px;
  color: #16a34a;
  margin-right: 12px;
  flex-shrink: 0;
}

.info-text {
  font-size: 14px;
  font-weight: 500;
  color: #166534;
  margin: 0;
  line-height: 1.5;
}

.suspension-footer {
  padding: 24px 32px 32px;
  background: #fafafa;
  border-radius: 0 0 20px 20px;
  border-top: 1px solid #f3f4f6;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.support-button {
  flex: 1;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
  letter-spacing: 0.025em;
}

/* Mobile app - hover effects disabled */
/* .support-button:hover {
  background: linear-gradient(135deg, #15803d 0%, #166534 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
} */

.support-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
}

.dismiss-button {
  flex: 1;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  letter-spacing: 0.025em;
}

/* Mobile app - hover effects disabled */
/* .dismiss-button:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
} */

.dismiss-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.dismiss-button svg,
.support-button svg {
  width: 20px;
  height: 20px;
}

/* Responsive design */
@media (max-width: 480px) {
  .suspension-modal {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }

  .suspension-header {
    padding: 24px 24px 20px;
  }

  .suspension-content {
    padding: 24px;
  }

  .suspension-footer {
    padding: 20px 24px 24px;
  }
}
</style>
