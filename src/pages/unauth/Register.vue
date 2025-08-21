<template>
  <div class="register-page">
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
      <button 
        @click="activeTab = 'personal'" 
        :class="['tab-btn', { active: activeTab === 'personal' }]"
      >
        Personal
      </button>
      <button 
        @click="activeTab = 'property'" 
        :class="['tab-btn', { active: activeTab === 'property' }]"
      >
        Property
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Personal Tab -->
      <div v-if="activeTab === 'personal'" class="tab-panel">
        <div class="icon-section">
          <div class="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <form @submit.prevent="handlePersonalSubmit" class="form">
          <div class="form-group">
            <label for="email" class="form-label">E-mail</label>
            <input
              id="email"
              v-model="personalForm.email"
              type="email"
              class="form-input"
              placeholder="Example@gmail.com"
              required
            />
          </div>

          <button type="submit" class="proceed-btn" :disabled="loading">
            <span v-if="loading">Processing...</span>
            <span v-else>Proceed</span>
          </button>
        </form>
      </div>

      <!-- Property Tab -->
      <div v-if="activeTab === 'property'" class="tab-panel">
        <div class="icon-section">
          <div class="icon-wrapper">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <form @submit.prevent="handlePropertySubmit" class="form">
          <div class="form-group">
            <label for="project" class="form-label">Project</label>
            <select id="project" v-model="propertyForm.project" class="form-input" required>
              <option value="" disabled>Project Name</option>
              <option value="project1">Project 1</option>
              <option value="project2">Project 2</option>
              <option value="project3">Project 3</option>
            </select>
          </div>

          <div class="form-group">
            <label for="unit" class="form-label">Unit</label>
            <select id="unit" v-model="propertyForm.unit" class="form-input" required>
              <option value="" disabled>Management</option>
              <option value="unit1">Unit 1</option>
              <option value="unit2">Unit 2</option>
              <option value="unit3">Unit 3</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Role</label>
            <div class="role-buttons">
              <button 
                type="button"
                @click="propertyForm.role = 'owner'"
                :class="['role-btn', { active: propertyForm.role === 'owner' }]"
              >
                Owner
              </button>
              <button 
                type="button"
                @click="propertyForm.role = 'family'"
                :class="['role-btn', { active: propertyForm.role === 'family' }]"
              >
                Family Member
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="goBack" class="back-action-btn">
              Back
            </button>
            <button type="submit" class="verify-btn" :disabled="loading">
              <span v-if="loading">Verifying...</span>
              <span v-else>Verify</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('personal')
const loading = ref(false)

const personalForm = reactive({
  email: ''
})

const propertyForm = reactive({
  project: '',
  unit: '',
  role: ''
})

const goBack = () => {
  router.go(-1)
}

const handlePersonalSubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    // TODO: Implement email verification logic
    console.log('Personal form submitted:', personalForm)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Move to next step or show verification
    router.push('/register/verify-email')
  } catch (error) {
    console.error('Personal submit error:', error)
    alert('Failed to proceed: ' + error.message)
  } finally {
    loading.value = false
  }
}

const handlePropertySubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    // TODO: Implement property verification logic
    console.log('Property form submitted:', propertyForm)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Move to next step
    router.push('/register/personal-details')
  } catch (error) {
    console.error('Property submit error:', error)
    alert('Failed to verify: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
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

.tab-content {
  padding: 40px 20px;
  max-width: 400px;
  margin: 0 auto;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
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

.form {
  width: 100%;
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

select.form-input {
  cursor: pointer;
}

.role-buttons {
  display: flex;
  gap: 15px;
}

.role-btn {
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #666;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-btn.active {
  border-color: #ff6b35;
  background-color: #ff6b35;
  color: white;
}

.role-btn:hover:not(.active) {
  border-color: #ff6b35;
  color: #ff6b35;
}

.proceed-btn,
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

.proceed-btn:hover:not(:disabled),
.verify-btn:hover:not(:disabled) {
  background-color: #e55a2b;
}

.proceed-btn:disabled,
.verify-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 15px;
}

.back-action-btn {
  flex: 1;
  background-color: white;
  color: #666;
  border: 2px solid #e1e5e9;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-action-btn:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.verify-btn {
  flex: 2;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 480px) {
  .tab-content {
    padding: 30px 15px;
  }
  
  .form-input {
    padding: 14px;
  }
  
  .role-buttons {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .verify-btn {
    flex: 1;
  }
}
</style>
