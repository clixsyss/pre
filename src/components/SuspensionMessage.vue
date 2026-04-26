<template>
  <div v-if="show && message" class="suspension-overlay" :dir="isArabic ? 'rtl' : 'ltr'">
    <div class="suspension-modal">

      <!-- ── Header ── -->
      <div class="suspension-header" :class="isPartial ? 'partial-header' : 'full-header'">
        <div class="suspension-icon" :class="isPartial ? 'partial-icon' : 'full-icon'">
          <!-- Partial: warning triangle -->
          <svg v-if="isPartial" width="34" height="34" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <!-- Full: shield-off -->
          <svg v-else width="34" height="34" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM4.929 4.929L19.07 19.07" />
          </svg>
        </div>

        <div class="header-badge" :class="isPartial ? 'partial-badge' : 'full-badge'">
          {{ isPartial ? $t('suspension.partialBadge') : $t('suspension.fullBadge') }}
        </div>

        <h2 class="suspension-title">
          {{ isArabic ? message.title_ar : message.title }}
        </h2>
        <p class="suspension-subtitle">
          {{ $t('suspension.accessRestricted') }}
        </p>
      </div>

      <!-- ── Body ── -->
      <div class="suspension-body">

        <!-- What happened -->
        <p class="suspension-intro">
          {{ isArabic ? message.body_ar : message.body }}
        </p>

        <!-- Reason card — always shown (reason is always required) -->
        <div class="reason-card">
          <div class="reason-icon">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="reason-content">
            <span class="reason-label">{{ $t('suspension.reason') }}</span>
            <p class="reason-text">{{ message.reason || $t('suspension.reasonNotProvided') }}</p>
          </div>
        </div>

        <!-- Blocked features (partial only) -->
        <div v-if="isPartial && message.blockedFeatureLabels && message.blockedFeatureLabels.length > 0" class="features-section">
          <p class="section-label">{{ $t('suspension.restrictedFeatures') }}</p>
          <div class="features-pills">
            <span v-for="feat in message.blockedFeatureLabels" :key="feat.id" class="feature-pill">
              {{ isArabic ? feat.ar : feat.en }}
            </span>
          </div>
          <p class="features-note">
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ $t('suspension.otherFeaturesOk') }}
          </p>
        </div>

        <!-- Meta cards row -->
        <div class="meta-cards">
          <!-- Duration type -->
          <div class="meta-card">
            <span class="meta-label">{{ $t('suspension.suspensionType') }}</span>
            <span class="meta-value">
              <template v-if="message.type === 'temporary'">
                {{ isPartial ? $t('suspension.partialTemporary') : $t('suspension.fullTemporary') }}
              </template>
              <template v-else>
                {{ isPartial ? $t('suspension.partialPermanent') : $t('suspension.fullPermanent') }}
              </template>
            </span>
          </div>

          <!-- End date (temporary only) -->
          <div v-if="message.type === 'temporary' && message.endDate" class="meta-card">
            <span class="meta-label">{{ $t('suspension.endsOn') }}</span>
            <span class="meta-value date-value">
              {{ isArabic ? message.endDateFormatted_ar : message.endDateFormatted }}
            </span>
          </div>
        </div>

        <!-- Still have access note -->
        <div class="access-note">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ $t('suspension.canAccessProfileGate') }}</span>
        </div>

      </div>

      <!-- ── Footer ── -->
      <div class="suspension-footer">
        <button @click="handleContactSupport" class="btn-support">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {{ $t('suspension.contactSupport') }}
        </button>
        <button @click="handleDismiss" class="btn-dismiss">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ $t('suspension.iUnderstand') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'SuspensionMessage',

  props: {
    show:    { type: Boolean, default: false },
    message: {
      type: Object,
      default: () => ({
        title: 'Account Suspended',
        title_ar: 'تم تعليق الحساب',
        body: 'Your account has been suspended.',
        body_ar: 'تم تعليق حسابك.',
        reason: '',
        reason_ar: '',
        type: 'temporary',
        level: 'full',
        blockedFeatures: [],
        blockedFeatureLabels: [],
        endDate: null,
        endDateFormatted: null,
        endDateFormatted_ar: null,
      }),
    },
  },

  emits: ['dismiss', 'contactSupport'],

  setup(props, { emit }) {
    const { locale } = useI18n()

    const isArabic = computed(() => locale.value === 'ar' || locale.value === 'ar-SA')
    const isPartial = computed(() => props.message?.level === 'partial')

    const handleDismiss        = () => emit('dismiss')
    const handleContactSupport = () => emit('contactSupport')

    return { isArabic, isPartial, handleDismiss, handleContactSupport }
  },
}
</script>

<style scoped>
/* ── Overlay ── */
.suspension-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ── Modal card ── */
.suspension-modal {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.04);
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.88) translateY(-16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

/* ── Header ── */
.suspension-header {
  padding: 32px 28px 24px;
  text-align: center;
  border-radius: 24px 24px 0 0;
}
.full-header    { background: linear-gradient(160deg, #fef2f2 0%, #fee2e2 100%); border-bottom: 1px solid #fecaca; }
.partial-header { background: linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%); border-bottom: 1px solid #fde68a; }

[dir="rtl"] .suspension-header { text-align: center; }

.suspension-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-bottom: 16px;
  color: #fff;
  animation: iconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}
@keyframes iconPop {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}
.full-icon    { background: linear-gradient(135deg, #f87171, #dc2626); box-shadow: 0 8px 20px rgba(220,38,38,0.35); }
.partial-icon { background: linear-gradient(135deg, #fcd34d, #d97706); box-shadow: 0 8px 20px rgba(217,119,6,0.35); }

.header-badge {
  display: inline-block;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 10px;
}
.full-badge    { background: #fee2e2; color: #991b1b; }
.partial-badge { background: #fef3c7; color: #92400e; }

.suspension-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 6px;
  line-height: 1.2;
}
.full-header    .suspension-title { color: #b91c1c; }
.partial-header .suspension-title { color: #b45309; }

.suspension-subtitle {
  font-size: 13px;
  font-weight: 500;
  margin: 0;
  opacity: 0.75;
}
.full-header    .suspension-subtitle { color: #991b1b; }
.partial-header .suspension-subtitle { color: #92400e; }

/* ── Body ── */
.suspension-body {
  padding: 24px 24px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suspension-intro {
  font-size: 14px;
  color: #374151;
  line-height: 1.65;
  margin: 0;
  text-align: center;
}

/* Reason card */
.reason-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 14px;
  padding: 16px;
}
[dir="rtl"] .reason-card { flex-direction: row-reverse; text-align: right; }

.reason-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: #fee2e2;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
}

.reason-content { flex: 1; }

.reason-label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #dc2626;
  margin-bottom: 4px;
}

.reason-text {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  line-height: 1.55;
  margin: 0;
}

/* Features */
.features-section { display: flex; flex-direction: column; gap: 10px; }

.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
}

.features-pills { display: flex; flex-wrap: wrap; gap: 8px; }

.feature-pill {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  border-radius: 20px;
  padding: 5px 13px;
  font-size: 12px;
  font-weight: 700;
}

.features-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #059669;
  font-weight: 600;
  margin: 0;
}
[dir="rtl"] .features-note { flex-direction: row-reverse; }

/* Meta cards */
.meta-cards {
  display: flex;
  gap: 10px;
}

.meta-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 13px 14px;
}

.meta-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
}

.meta-value {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
}
.date-value { color: #dc2626; }

/* Access note */
.access-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 14px;
  color: #166534;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}
.access-note svg { flex-shrink: 0; margin-top: 1px; }
[dir="rtl"] .access-note { flex-direction: row-reverse; text-align: right; }

/* ── Footer ── */
.suspension-footer {
  padding: 16px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-support, .btn-dismiss {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 14px;
  padding: 15px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: opacity 0.15s;
}
.btn-support:active, .btn-dismiss:active { opacity: 0.8; }

.btn-support {
  background: linear-gradient(135deg, #16a34a, #15803d);
  color: #fff;
  box-shadow: 0 4px 14px rgba(22,163,74,0.3);
}

.btn-dismiss {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: #fff;
  box-shadow: 0 4px 14px rgba(220,38,38,0.28);
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .suspension-modal { border-radius: 20px; }
  .suspension-header { padding: 26px 22px 20px; }
  .suspension-body { padding: 20px 20px 8px; }
  .suspension-footer { padding: 14px 20px 22px; }
  .suspension-title { font-size: 20px; }
  .meta-cards { flex-direction: column; }
}
</style>
