<template>
  <div class="access-page">
    <div class="gate-passes-section">
      <div class="section-header">
        <h2>Gate Passes</h2>
      </div>
      
      <div class="generate-pass-btn">
        <button class="generate-btn">
          GENERATE PASS (0/10)
        </button>
      </div>
      
      <div class="no-passes-message">
        <h3>No Passes Found</h3>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component name for ESLint
defineOptions({
  name: 'AccessPage'
})
</script>

<style scoped>
.access-page {
  padding: 40px 20px;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.gate-passes-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.section-header h2 {
  background-color: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: inline-block;
}

.generate-pass-btn {
  width: 100%;
}

.generate-btn {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.2s ease;
}

.generate-btn:hover {
  background-color: #e55a2b;
}

.no-passes-message {
  margin-top: 60px;
}

.no-passes-message h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 480px) {
  .access-page {
    padding: 30px 15px;
  }
  
  .section-header h2 {
    font-size: 1rem;
    padding: 10px 20px;
  }
  
  .generate-btn {
    padding: 14px 28px;
    font-size: 0.9rem;
  }
  
  .no-passes-message h3 {
    font-size: 1.75rem;
  }
}
</style>
