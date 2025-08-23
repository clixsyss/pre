<template>
  <div class="home-page">

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth } from '../../boot/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Component name for ESLint
defineOptions({
  name: 'HomePage'
})

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
    }
  })
})




</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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

/* Responsive design */
@media (max-width: 768px) {
  .content {
    padding: 20px 15px;
  }
  
  .greeting h2 {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .news-item {
    padding: 15px;
  }
  
  .news-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
