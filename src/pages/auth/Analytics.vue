<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1>{{ $t('analyticsTitle') }}</h1>
      <p>{{ $t('preGroupAnalytics') }}</p>
    </div>

    <div class="analytics-content">
      <!-- Empty content for now -->
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20V10" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 20V4" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 20V16" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>{{ $t('analyticsComingSoon') }}</h3>
        <p>{{ $t('analyticsUnderDevelopment') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component name for ESLint
defineOptions({
  name: 'AnalyticsPage'
})
</script>

<style scoped>
.analytics-page {
  padding: 20px 0;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.page-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.analytics-content {
  max-width: 600px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px 0;
}

.empty-state p {
  color: #999;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .analytics-page {
    padding: 16px 0;
  }
  
  .page-header h1 {
    font-size: 1.75rem;
  }
  
  .empty-state {
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .empty-state h3 {
    font-size: 1.25rem;
  }
}
</style>
