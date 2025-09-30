<template>
  <div class="support-page">
    <PageHeader title="Support" subtitle="Get help with any questions or issues" />

    <!-- Content -->
    <div class="content">
      <!-- Support Hero -->
      <div class="support-hero">
        <div class="support-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#AF1E23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>How can we help you?</h2>
        <p>Our support team is here to assist you with any questions or issues.</p>
      </div>

      <!-- Instant Start Chat Button -->
      <div class="action-section">
        <button @click="startNewChat" class="start-chat-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Start a New Chat
        </button>
      </div>

      <!-- Recent Chats -->
      <div class="recent-chats-section">
        <h3>Recent Support Chats</h3>
        <div v-if="loadingChats" class="loading-state">
          <div class="spinner"></div>
          <p>Loading recent chats...</p>
        </div>
        <div v-else-if="errorChats" class="error-state">
          <p>Error loading chats: {{ errorChats }}</p>
        </div>
        <div v-else-if="supportChats.length === 0" class="no-chats-state">
          <p>No recent support chats. Start a new one!</p>
        </div>
        <div v-else class="chats-list">
          <div v-for="chat in supportChats" :key="chat.id" @click="viewChat(chat.id)" class="chat-card">
            <div class="chat-info">
              <span class="chat-title">{{ chat.title || 'Support Chat' }}</span>
              <span :class="['chat-status', chat.status]">{{ chat.status }}</span>
            </div>
            <span class="chat-date">{{ formatDate(chat.lastMessageAt) }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSupportStore } from '../../stores/supportStore'
import PageHeader from '../../components/PageHeader.vue'

defineOptions({
  name: 'AuthSupportPage'
})

const router = useRouter()
const supportStore = useSupportStore()

// Computed properties
const supportChats = computed(() => supportStore.userSupportChats)
const loadingChats = computed(() => supportStore.loading)
const errorChats = computed(() => supportStore.error)


const startNewChat = async () => {
  try {
    const newChat = await supportStore.createSupportChat({
      title: `Support Chat - ${new Date().toLocaleString()}`,
      category: 'general'
    })
    router.push(`/support-chat/${newChat.id}`)
  } catch (error) {
    console.error('Error starting new chat:', error)
  }
}

const viewChat = (chatId) => {
  router.push(`/support-chat/${chatId}`)
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString()
}

onMounted(async () => {
  try {
    // Fetch support chats using getDocs instead of real-time listener
    await supportStore.fetchSupportChats()
    
    // Note: Real-time listeners are temporarily disabled to prevent app hanging
    // Support chats will be refreshed when user navigates back to this page
    console.log('✅ Support chats fetched successfully')
  } catch (error) {
    console.error('Error setting up support chats:', error)
  }
})
</script>

<style scoped>
.support-page {
  min-height: 100vh;
  background-color: #f8f9fa;
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

.action-section {
  text-align: center;
  margin-bottom: 40px;
}

.start-chat-btn {
  background-color: #AF1E23;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(175, 30, 35, 0.3);
}

.start-chat-btn:hover {
  background-color: #8a181c;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(175, 30, 35, 0.4);
}

.start-chat-btn svg {
  width: 22px;
  height: 22px;
}

.recent-chats-section {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.recent-chats-section h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 25px;
  text-align: center;
}

.loading-state, .error-state, .no-chats-state {
  text-align: center;
  padding: 30px 0;
  color: #666;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.chats-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background-color: #fefefe;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #AF1E23;
}

.chat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chat-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.chat-status {
  font-size: 0.85rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 20px;
  color: white;
  text-transform: capitalize;
}

.chat-status.open {
  background-color: #AF1E23;
}

.chat-status.in-progress {
  background-color: #f39c12;
}

.chat-status.resolved {
  background-color: #27ae60;
}

.chat-status.closed {
  background-color: #7f8c8d;
}

.chat-date {
  font-size: 0.85rem;
  color: #999;
}


/* Responsive design */
@media (max-width: 600px) {
  .content {
    padding: 20px 15px;
  }

  .support-hero h2 {
    font-size: 1.7rem;
  }

  .start-chat-btn {
    width: 100%;
    font-size: 1rem;
    padding: 12px 20px;
  }

  .recent-chats-section {
    padding: 20px;
  }

  .recent-chats-section h3 {
    font-size: 1.2rem;
  }

  .chat-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .chat-date {
    align-self: flex-end;
  }
}
</style>
