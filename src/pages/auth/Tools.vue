<template>
  <div class="services-page">
    <div class="page-header">
      <h1>Services</h1>
      <p>PRE Group services and utilities</p>
    </div>

    <div class="services-content">
      <!-- Empty content for now -->
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3A1 1 0 0 0 14 7H9.5L8.5 8L9.5 9H14A1 1 0 0 0 14.7 9.7L18.3 13.3A1 1 0 0 0 19.7 11.7L16.1 8.1L14.7 6.3Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9.3 17.7A1 1 0 0 0 10 17H14.5L15.5 16L14.5 15H10A1 1 0 0 0 9.3 14.3L5.7 10.7A1 1 0 0 0 4.3 12.3L7.9 15.9L9.3 17.7Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Services Coming Soon</h3>
        <p>This section is under development. Check back later for available services.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component name for ESLint
defineOptions({
  name: 'ServicesPage'
})
</script>

<style scoped>
.services-page {
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

.services-content {
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
  .services-page {
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
