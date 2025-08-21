<template>
  <div class="support-page">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="page-title">Support</h1>
      <div class="placeholder"></div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="support-hero">
        <div class="support-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#ff6b35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>Need Help?</h2>
        <p>We're here to help you with any questions or issues you might have.</p>
      </div>

      <div class="support-options">
        <div class="support-card">
          <div class="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Email Support</h3>
          <p>Send us an email and we'll get back to you within 24 hours.</p>
          <a href="mailto:support@pre-group.com" class="support-link">support@pre-group.com</a>
        </div>

        <div class="support-card">
          <div class="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2136 21.3521 21.4019C21.1469 21.5902 20.9046 21.7335 20.6408 21.8227C20.377 21.9119 20.0975 21.9452 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3146 6.72533 15.2661 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.09494 3.90347 2.12787 3.62476 2.21649 3.36188C2.30512 3.09899 2.44756 2.85734 2.63491 2.65262C2.82226 2.4479 3.05009 2.28449 3.30401 2.17269C3.55793 2.0609 3.83249 2.00314 4.10999 2.003H7.10999C7.59519 1.99522 8.06574 2.16708 8.43373 2.48353C8.80171 2.79999 9.042 3.23944 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97351 7.27675 9.89382 7.64918C9.81413 8.02161 9.62884 8.36233 9.35999 8.63L8.08999 9.9C9.51419 12.3826 11.6174 14.4858 14.1 15.91L15.37 14.64C15.6377 14.3712 15.9784 14.1859 16.3508 14.1062C16.7233 14.0265 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5765C21.8437 15.9498 22.0125 16.4258 22 16.92Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Phone Support</h3>
          <p>Call us directly for immediate assistance.</p>
          <a href="tel:+1234567890" class="support-link">+1 (234) 567-890</a>
        </div>

        <div class="support-card">
          <div class="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>FAQ</h3>
          <p>Find answers to commonly asked questions.</p>
          <button @click="showFAQ = true" class="support-link">View FAQ</button>
        </div>
      </div>

      <div class="contact-form">
        <h3>Send us a Message</h3>
        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label for="name" class="form-label">Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-input"
              placeholder="Your name"
              required
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              placeholder="Your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="subject" class="form-label">Subject</label>
            <select id="subject" v-model="formData.subject" class="form-input" required>
              <option value="" disabled>Select a subject</option>
              <option value="general">General Inquiry</option>
              <option value="technical">Technical Support</option>
              <option value="billing">Billing Question</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="message" class="form-label">Message</label>
            <textarea
              id="message"
              v-model="formData.message"
              class="form-input"
              rows="5"
              placeholder="Describe your issue or question"
              required
            ></textarea>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading">Sending...</span>
            <span v-else>Send Message</span>
          </button>
        </form>
      </div>
    </div>

    <!-- FAQ Modal -->
    <div v-if="showFAQ" class="faq-modal" @click="showFAQ = false">
      <div class="faq-content" @click.stop>
        <div class="faq-header">
          <h3>Frequently Asked Questions</h3>
          <button @click="showFAQ = false" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="faq-list">
          <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
            <button @click="toggleFAQ(index)" class="faq-question">
              {{ faq.question }}
              <svg :class="['faq-arrow', { rotated: faq.open }]" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div v-if="faq.open" class="faq-answer">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notifications'

// Component name for ESLint
defineOptions({
  name: 'SupportPage'
})

const router = useRouter()
const notificationStore = useNotificationStore()
const loading = ref(false)
const showFAQ = ref(false)

const formData = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const faqs = ref([
  {
    question: 'How do I create an account?',
    answer: 'You can create an account by clicking the "Register" button on the onboarding screen and following the registration process.',
    open: false
  },
  {
    question: 'What if I forgot my password?',
    answer: 'You can reset your password by clicking "Forgot Password?" on the sign-in page.',
    open: false
  },
  {
    question: 'How do I contact support?',
    answer: 'You can contact support through email, phone, or by filling out the contact form on this page.',
    open: false
  },
  {
    question: 'What services does PRE Group provide?',
    answer: 'PRE Group provides property management solutions including community management, emergency notifications, and general news updates.',
    open: false
  }
])

const goBack = () => {
  router.go(-1)
}

const toggleFAQ = (index) => {
  faqs.value[index].open = !faqs.value[index].open
}

const handleSubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    notificationStore.showSuccess('Message sent successfully! We\'ll get back to you soon.')
    
    // Reset form
    Object.keys(formData).forEach(key => {
      formData[key] = ''
    })
  } catch (error) {
    console.error('Submit error:', error)
    notificationStore.showError('Failed to send message: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.support-page {
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

.content {
  padding: 40px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.support-hero {
  text-align: center;
  margin-bottom: 50px;
}

.support-icon {
  margin-bottom: 20px;
}

.support-hero h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
}

.support-hero p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.support-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.support-card {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.support-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  width: 60px;
  height: 60px;
  background-color: rgba(255, 107, 53, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #ff6b35;
}

.support-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.support-card p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.5;
}

.support-link {
  color: #ff6b35;
  text-decoration: none;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.support-link:hover {
  text-decoration: underline;
}

.contact-form {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.contact-form h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
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
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #ff6b35;
}

select.form-input {
  cursor: pointer;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
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

.submit-btn:hover:not(:disabled) {
  background-color: #e55a2b;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* FAQ Modal */
.faq-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.faq-content {
  background-color: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 30px;
  border-bottom: 1px solid #e1e5e9;
}

.faq-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.faq-list {
  padding: 0 30px 30px;
}

.faq-item {
  border-bottom: 1px solid #f0f0f0;
}

.faq-question {
  width: 100%;
  background: none;
  border: none;
  padding: 20px 0;
  text-align: left;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: color 0.3s ease;
}

.faq-question:hover {
  color: #ff6b35;
}

.faq-arrow {
  transition: transform 0.3s ease;
}

.faq-arrow.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 0 20px 0;
  color: #666;
  line-height: 1.6;
}

/* Responsive design */
@media (max-width: 768px) {
  .support-options {
    grid-template-columns: 1fr;
  }
  
  .content {
    padding: 30px 15px;
  }
  
  .contact-form {
    padding: 30px 20px;
  }
  
  .faq-content {
    width: 95%;
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .support-hero h2 {
    font-size: 1.7rem;
  }
  
  .support-card {
    padding: 25px 20px;
  }
  
  .contact-form {
    padding: 25px 15px;
  }
}
</style>
