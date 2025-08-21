<template>
  <div class="personal-details-page">
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

      <form @submit.prevent="handleSubmit" class="personal-form">
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

        <div class="form-row">
          <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              class="form-input"
              placeholder="First Name"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              class="form-input"
              placeholder="Last Name"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="mobile" class="form-label">Mobile Number</label>
          <input
            id="mobile"
            v-model="formData.mobile"
            type="tel"
            class="form-input"
            placeholder="Mobile Number"
            required
          />
        </div>

        <div class="form-group">
          <label for="dateOfBirth" class="form-label">Date of Birth</label>
          <div class="date-input-wrapper">
            <input
              id="dateOfBirth"
              v-model="formData.dateOfBirth"
              type="date"
              class="form-input"
              required
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="calendar-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Gender</label>
          <div class="gender-buttons">
            <button 
              type="button"
              @click="formData.gender = 'male'"
              :class="['gender-btn', { active: formData.gender === 'male' }]"
            >
              Male
            </button>
            <button 
              type="button"
              @click="formData.gender = 'female'"
              :class="['gender-btn', { active: formData.gender === 'female' }]"
            >
              Female
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="nationalId" class="form-label">National ID</label>
          <input
            id="nationalId"
            v-model="formData.nationalId"
            type="text"
            class="form-input"
            placeholder="National ID"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="frontId" class="form-label">Front National ID Picture</label>
            <div class="file-upload">
              <input
                id="frontId"
                type="file"
                accept="image/*"
                @change="handleFrontIdUpload"
                class="file-input"
              />
              <label for="frontId" class="file-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ frontIdFile ? frontIdFile.name : 'Upload Front ID' }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="backId" class="form-label">Back National ID Picture</label>
            <div class="file-upload">
              <input
                id="backId"
                type="file"
                accept="image/*"
                @change="handleBackIdUpload"
                class="file-input"
              />
              <label for="backId" class="file-label">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ backIdFile ? backIdFile.name : 'Upload Back ID' }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Password"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="password-toggle"
            >
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 12 6 4 12 4C18 4 22 12 22 12C22 12 18 20 12 20C6 20 2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" class="continue-btn" :disabled="loading">
          <span v-if="loading">Creating Account...</span>
          <span v-else>Continue</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../boot/firebase'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const showPassword = ref(false)
const frontIdFile = ref(null)
const backIdFile = ref(null)

const formData = reactive({
  email: '',
  firstName: '',
  lastName: '',
  mobile: '',
  dateOfBirth: '',
  gender: 'male',
  nationalId: '',
  password: ''
})

onMounted(() => {
  // Get email from route params or localStorage
  const email = route.params.email || localStorage.getItem('registrationEmail') || 'Example@gmail.com'
  formData.email = email
})

const goBack = () => {
  router.go(-1)
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleFrontIdUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    frontIdFile.value = file
  }
}

const handleBackIdUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    backIdFile.value = file
  }
}

const handleSubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    // Create user account with Firebase
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      formData.email, 
      formData.password
    )
    
    // TODO: Save additional user data to Firestore
    console.log('User created successfully:', userCredential.user)
    console.log('Form data:', formData)
    
    // TODO: Upload ID images to Firebase Storage
    
    // Redirect to home page after successful registration
    router.push('/home')
  } catch (error) {
    console.error('Registration error:', error)
    alert('Registration failed: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.personal-details-page {
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
  max-width: 500px;
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

.personal-form {
  width: 100%;
}

.form-group {
  margin-bottom: 25px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
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

.date-input-wrapper {
  position: relative;
}

.calendar-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
}

.gender-buttons {
  display: flex;
  gap: 15px;
}

.gender-btn {
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

.gender-btn.active {
  border-color: #ff6b35;
  background-color: #ff6b35;
  color: white;
}

.gender-btn:hover:not(.active) {
  border-color: #ff6b35;
  color: #ff6b35;
}

.file-upload {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border: 2px dashed #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-label:hover {
  border-color: #ff6b35;
  color: #ff6b35;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
}

.continue-btn {
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

.continue-btn:hover:not(:disabled) {
  background-color: #e55a2b;
}

.continue-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 30px 15px;
  }
  
  .form-input {
    padding: 14px;
  }
  
  .gender-buttons {
    flex-direction: column;
  }
}
</style>
