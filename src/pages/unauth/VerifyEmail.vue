<template>
  <div class="verify-email-page">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">Registration</h1>
      <div class="placeholder"></div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab-btn active">Personal</button>
      <button class="tab-btn">Property</button>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="icon-section">
        <div class="icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <form @submit.prevent="handleVerification" class="verification-form">
        <div class="form-group">
          <label for="email" class="form-label">E-mail</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            placeholder="Example@gmail.com"
            readonly
          />
        </div>

        <div class="form-group">
          <label for="verificationCode" class="form-label">Verification Code</label>
          <input
            id="verificationCode"
            v-model="formData.verificationCode"
            type="text"
            class="form-input"
            placeholder="Enter verification code"
            maxlength="6"
            required
          />
        </div>

        <button type="submit" class="verify-btn" :disabled="loading">
          <span v-if="loading">Verifying...</span>
          <span v-else>Verify</span>
        </button>
      </form>

      <div class="resend-section">
        <button 
          @click="resendCode" 
          class="resend-btn" 
          :disabled="resendCountdown > 0"
        >
          <span v-if="resendCountdown > 0">
            Resend Verification E-mail ({{ formatTime(resendCountdown) }})
          </span>
          <span v-else>
            Resend Verification E-mail
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const resendCountdown = ref(0)
let countdownTimer = null

const formData = reactive({
  email: '',
  verificationCode: ''
})

onMounted(() => {
  // Get email from route params or localStorage
  const email = route.params.email || localStorage.getItem('registrationEmail') || 'Example@gmail.com'
  formData.email = email
  
  // Start countdown for resend
  startResendCountdown()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})

const startResendCountdown = () => {
  resendCountdown.value = 60 // 60 seconds
  countdownTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      clearInterval(countdownTimer)
    }
  }, 1000)
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const goBack = () => {
  router.go(-1)
}

const handleVerification = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    // TODO: Implement verification logic
    console.log('Verification submitted:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Move to next step
    router.push('/register/personal-details')
  } catch (error) {
    console.error('Verification error:', error)
    alert('Verification failed: ' + error.message)
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  if (resendCountdown.value > 0) return
  
  try {
    // TODO: Implement resend logic
    console.log('Resending verification code to:', formData.email)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Restart countdown
    startResendCountdown()
    
    alert('Verification code resent successfully!')
  } catch (error) {
    console.error('Resend error:', error)
    alert('Failed to resend code: ' + error.message)
  }
}
</script>

<style scoped>
.verify-email-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #222222;
  color: white;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.placeholder {
  width: 40px;
}

.tabs {
  display: flex;
  background-color: white;
  border-bottom: 1px solid #e1e5e9;
}

.tab-btn {
  flex: 1;
  padding: 20px;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn.active {
  color: #ff6b35;
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #ff6b35;
}

.content {
  padding: 40px 20px;
  max-width: 400px;
  margin: 0 auto;
}

.icon-section {
  text-align: center;
  margin-bottom: 40px;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
}

.verification-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
}

.form-input[readonly] {
  background-color: #f8f9fa;
  color: #666;
  cursor: not-allowed;
}

.verify-btn {
  width: 100%;
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.verify-btn:hover:not(:disabled) {
  background-color: #e55a2b;
}

.verify-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.resend-section {
  text-align: center;
}

.resend-btn {
  background: none;
  border: none;
  color: #ff6b35;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  color: #e55a2b;
}

.resend-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  text-decoration: none;
}

/* Responsive design */
@media (max-width: 480px) {
  .content {
    padding: 30px 15px;
  }
  
  .form-input {
    padding: 14px;
  }
}
</style>
