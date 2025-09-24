<template>
  <div class="support-chat-page">
    <SupportChat :support-chat-id="supportChatId" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SupportChat from '../../components/SupportChat.vue'
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '../../boot/firebase'
import { getAuth } from 'firebase/auth'

// Component name for ESLint
defineOptions({
  name: 'SupportChatPage'
})

const supportChatId = ref(null)

// Create or get existing support chat
const initializeSupportChat = async () => {
  const auth = getAuth()
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    console.error('User not authenticated')
    return
  }
  
  try {
    // Check if user already has an active support chat
    const supportChatsRef = collection(db, 'supportChats')
    const q = query(
      supportChatsRef,
      where('userId', '==', currentUser.uid),
      where('status', 'in', ['open', 'in-progress']),
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      // Use existing active chat
      supportChatId.value = snapshot.docs[0].id
    } else {
      // Create new support chat
      const newChatData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        userEmail: currentUser.email,
        title: 'Support Chat',
        category: 'general',
        status: 'open',
        priority: 'medium',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp()
      }
      
      const docRef = await addDoc(supportChatsRef, newChatData)
      supportChatId.value = docRef.id
    }
  } catch (error) {
    console.error('Error initializing support chat:', error)
  }
}

onMounted(() => {
  initializeSupportChat()
})
</script>

<style scoped>
.support-chat-page {
  height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

@media (max-width: 768px) {
  .support-chat-page {
    padding: 10px;
  }
}
</style>
