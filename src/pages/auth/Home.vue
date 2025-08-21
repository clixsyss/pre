<template>
  <div class="home-page">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="qr-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H7V7H3V3Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 3H21V7H17V3Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 17H7V21H3V17Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 17H21V21H17V17Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 3V7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 3V7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 17V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 17V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 7H7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 17H7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 7H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 17H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="user-info">
          <div class="user-name">{{ user?.displayName || 'User Name' }}</div>
          <div class="project-name">{{ projectName }}</div>
          <div class="test-badge">TEST</div>
        </div>
      </div>
      <button class="home-btn">Home</button>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        <h2>Hello {{ user?.displayName?.split(' ')[0] || 'User' }}.</h2>
        <p>Project: {{ projectName }}</p>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button 
          @click="activeTab = 'all'" 
          :class="['tab-btn', { active: activeTab === 'all' }]"
        >
          ALL
        </button>
        <button 
          @click="activeTab = 'emergency'" 
          :class="['tab-btn', { active: activeTab === 'emergency' }]"
        >
          Emergency
        </button>
      </div>

      <!-- News Feed -->
      <div class="news-feed">
        <div v-for="item in filteredNews" :key="item.id" class="news-item">
          <div class="news-icon">
            <span class="pre-logo">P RE</span>
          </div>
          <div class="news-content">
            <div class="news-timestamp">{{ item.timestamp }}</div>
            <div class="news-text">{{ item.text }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <button class="nav-btn active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="nav-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="nav-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="nav-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 20V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../boot/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

const router = useRouter()
const user = ref(null)
const activeTab = ref('all')
const projectName = ref('Test Unit')

// Sample news data
const newsItems = ref([
  {
    id: 1,
    type: 'community',
    text: 'Welcome to PRE Group! We\'re excited to have you as part of our community.',
    timestamp: '40 Minutes ago'
  },
  {
    id: 2,
    type: 'general',
    text: 'New community guidelines have been updated. Please review the latest policies.',
    timestamp: '2 Hours ago'
  },
  {
    id: 3,
    type: 'emergency',
    text: 'Emergency maintenance scheduled for tomorrow. Please be prepared for temporary service interruption.',
    timestamp: '1 Day ago'
  }
])

const filteredNews = computed(() => {
  if (activeTab.value === 'emergency') {
    return newsItems.value.filter(item => item.type === 'emergency')
  }
  return newsItems.value
})

onMounted(() => {
  // Listen for auth state changes
  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      user.value = currentUser
    } else {
      // Redirect to onboarding if not authenticated
      router.push('/onboarding')
    }
  })
})

const handleSignOut = async () => {
  try {
    await signOut(auth)
    router.push('/onboarding')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #222222;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.qr-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  font-size: 1rem;
}

.project-name {
  font-size: 0.9rem;
  opacity: 0.8;
}

.test-badge {
  background-color: #ff6b35;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  align-self: flex-start;
}

.home-btn {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.home-btn:hover {
  background-color: #e55a2b;
}

.content {
  flex: 1;
  padding: 30px 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.greeting {
  margin-bottom: 30px;
}

.greeting h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.greeting p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.tabs {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.tab-btn.active {
  background-color: #ff6b35;
  color: white;
}

.news-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.news-icon {
  width: 50px;
  height: 50px;
  background-color: #ff6b35;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pre-logo {
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
}

.news-content {
  flex: 1;
}

.news-timestamp {
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.news-text {
  color: #333;
  font-size: 0.95rem;
  line-height: 1.4;
}

.bottom-nav {
  display: flex;
  background-color: #222222;
  padding: 15px 20px;
  gap: 20px;
}

.nav-btn {
  flex: 1;
  background: none;
  border: none;
  color: #666;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn.active {
  color: #ff6b35;
  background-color: rgba(255, 107, 53, 0.1);
}

.nav-btn:hover:not(.active) {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }
  
  .header {
    padding: 15px;
  }
  
  .user-info {
    font-size: 0.9rem;
  }
  
  .greeting h2 {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: 10px;
  }
  
  .qr-icon {
    width: 35px;
    height: 35px;
  }
  
  .home-btn {
    padding: 8px 16px;
    font-size: 0.8rem;
  }
  
  .news-item {
    padding: 15px;
  }
  
  .news-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
