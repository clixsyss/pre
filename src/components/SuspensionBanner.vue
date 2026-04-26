<template>
  <div v-if="message" class="suspension-banner" :class="isPartial ? 'banner-partial' : 'banner-full'" :dir="isArabic ? 'rtl' : 'ltr'">

    <!-- Icon + badge row -->
    <div class="banner-header">
      <div class="banner-icon" :class="isPartial ? 'icon-partial' : 'icon-full'">
        <!-- Partial: warning triangle -->
        <svg v-if="isPartial" width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <!-- Full: shield-off -->
        <svg v-else width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM4.929 4.929L19.07 19.07" />
        </svg>
      </div>

      <div class="banner-title-block">
        <span class="banner-badge" :class="isPartial ? 'badge-partial' : 'badge-full'">
          {{ isPartial ? $t('suspension.partialBadge') : $t('suspension.fullBadge') }}
        </span>
        <h3 class="banner-title">
          {{ isArabic ? message.title_ar : message.title }}
        </h3>
      </div>
    </div>

    <!-- Reason -->
    <div class="banner-reason">
      <span class="reason-label">{{ $t('suspension.reason') }}</span>
      <p class="reason-text">{{ message.reason || $t('suspension.reasonNotProvided') }}</p>
    </div>

    <!-- Blocked features (partial only) -->
    <div v-if="isPartial && message.blockedFeatureLabels && message.blockedFeatureLabels.length > 0" class="banner-features">
      <p class="features-label">{{ $t('suspension.restrictedFeatures') }}</p>
      <div class="features-pills">
        <span v-for="feat in message.blockedFeatureLabels" :key="feat.id" class="feature-pill">
          {{ isArabic ? feat.ar : feat.en }}
        </span>
      </div>
    </div>

    <!-- End date (temporary) -->
    <div v-if="message.type === 'temporary' && message.endDate" class="banner-meta">
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>{{ $t('suspension.endsOn') }}: <strong>{{ isArabic ? message.endDateFormatted_ar : message.endDateFormatted }}</strong></span>
    </div>

  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  name: 'SuspensionBanner',

  props: {
    message: { type: Object, default: null },
  },

  setup(props) {
    const { locale } = useI18n()

    const isArabic = computed(() => locale.value === 'ar' || locale.value === 'ar-SA')
    const isPartial = computed(() => props.message?.level === 'partial')

    return { isArabic, isPartial }
  },
}
</script>

<style scoped>
.suspension-banner {
  border-radius: 18px;
  padding: 18px 18px 14px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideDown 0.3s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.banner-full    { background: #fef2f2; border: 1.5px solid #fecaca; }
.banner-partial { background: #fffbeb; border: 1.5px solid #fde68a; }

/* Header row */
.banner-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
[dir="rtl"] .banner-header { flex-direction: row-reverse; }

.banner-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.icon-full    { background: linear-gradient(135deg, #f87171, #dc2626); }
.icon-partial { background: linear-gradient(135deg, #fcd34d, #d97706); }

.banner-title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banner-badge {
  display: inline-block;
  border-radius: 20px;
  padding: 2px 9px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  align-self: flex-start;
}
.badge-full    { background: #fee2e2; color: #991b1b; }
.badge-partial { background: #fef3c7; color: #92400e; }

.banner-title {
  font-size: 15px;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}
.banner-full    .banner-title { color: #b91c1c; }
.banner-partial .banner-title { color: #b45309; }

/* Reason */
.banner-reason {
  background: rgba(255,255,255,0.7);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.reason-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #dc2626;
}

.reason-text {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.5;
}

/* Features */
.banner-features { display: flex; flex-direction: column; gap: 6px; }

.features-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6b7280;
  margin: 0;
}

.features-pills { display: flex; flex-wrap: wrap; gap: 6px; }

.feature-pill {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
}

/* Meta row (end date) */
.banner-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}
[dir="rtl"] .banner-meta { flex-direction: row-reverse; }
.banner-meta strong { color: #dc2626; font-weight: 700; }
</style>
