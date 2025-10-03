<template>
  <UnifiedChat
    :chat-data="requestData"
    :messages="messages"
    :loading="loading"
    chat-type="request"
    default-title="Request Chat"
    error-title="Request Not Found"
    error-message="The request you're looking for doesn't exist or has been deleted."
    closed-message="This request has been closed. You can view the conversation but cannot send new messages."
    closed-placeholder="This request is closed"
    :on-send-message="handleSendMessage"
    :on-image-upload="handleImageUpload"
    @back="goBack"
    @message-sent="onMessageSent"
    @image-uploaded="onImageUploaded"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import optimizedAuthService from '../services/optimizedAuthService';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../boot/firebase';
import { useProjectStore } from '../stores/projectStore';
import UnifiedChat from './UnifiedChat.vue';
import firestoreService from '../services/firestoreService';

const props = defineProps({
  requestId: {
    type: String,
    required: false
  },
  projectId: {
    type: String,
    required: false
  }
});

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

// Get requestId and projectId from props or route
const requestId = computed(() => props.requestId || route.params.id);
const projectId = computed(() => props.projectId || projectStore.selectedProject?.id);

// Reactive state
const messages = ref([]);
const loading = ref(false);
const requestData = ref(null);
const unsubscribe = ref(null);

// Load messages when component mounts
onMounted(async () => {
  await loadRequestData();
  await loadMessages();
});

const loadRequestData = async () => {
  try {
    loading.value = true;
    
    if (!projectId.value || !requestId.value) {
      console.error('Missing projectId or requestId', { projectId: projectId.value, requestId: requestId.value });
      requestData.value = null;
      loading.value = false;
      return;
    }
    
    // Load request data from Firestore using firestoreService
    const requestPath = `projects/${projectId.value}/requestSubmissions/${requestId.value}`;
    const requestSnap = await firestoreService.getDoc(requestPath);
    
    if (requestSnap.exists()) {
      const data = requestSnap.data();
      requestData.value = {
        id: requestSnap.id,
        title: data.title || data.description || 'Request Chat',
        categoryName: data.categoryName || data.category || 'Request',
        status: data.status || 'pending',
        ...data
      };
    } else {
      console.error('Request not found in Firestore');
      requestData.value = null;
    }
  } catch (error) {
    console.error('Error loading request data:', error);
    requestData.value = null;
  } finally {
    loading.value = false;
  }
};

const loadMessages = async () => {
  try {
    if (!projectId.value || !requestId.value) {
      console.error('Missing projectId or requestId for messages', { projectId: projectId.value, requestId: requestId.value });
      return;
    }
    
    // Load messages using firestoreService
    const messagesPath = `projects/${projectId.value}/requestSubmissions/${requestId.value}/messages`;
    const queryOptions = {
      orderBy: { field: 'createdAt', direction: 'asc' },
      timeoutMs: 10000
    };
    
    const result = await firestoreService.getDocs(messagesPath, queryOptions);
    
    messages.value = result.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure timestamp field exists for UnifiedChat
        timestamp: data.createdAt
      };
    });
    
    // Set up polling for real-time updates (since firestoreService doesn't support onSnapshot)
    if (unsubscribe.value) {
      unsubscribe.value();
    }
    
    unsubscribe.value = setInterval(async () => {
      try {
        const newResult = await firestoreService.getDocs(messagesPath, queryOptions);
        const newMessages = newResult.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.createdAt
          };
        });
        
        // Only update if messages have changed
        if (JSON.stringify(newMessages) !== JSON.stringify(messages.value)) {
          messages.value = newMessages;
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 5000); // Poll every 5 seconds
    
  } catch (error) {
    console.error('Error loading messages:', error);
  }
};

// Message handling functions
const handleSendMessage = async (messageText) => {
  try {
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!projectId.value || !requestId.value) {
      throw new Error('Missing projectId or requestId');
    }

    const messageData = {
      text: messageText,
      senderType: 'user',
      senderId: user.uid,
      senderName: user.displayName || 'User',
      createdAt: new Date()
    };

    const messagesPath = `projects/${projectId.value}/requestSubmissions/${requestId.value}/messages`;
    await firestoreService.addDoc(messagesPath, messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

const handleImageUpload = async (file) => {
  try {
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!projectId.value || !requestId.value) {
      throw new Error('Missing projectId or requestId');
    }

    // Upload image to Firebase Storage
    const timestamp = Date.now();
    const fileName = `message_${timestamp}_${file.name}`;
    const storagePath = `projects/${projectId.value}/request-submissions/${requestId.value}/messages/${fileName}`;
    const fileRef = storageRef(storage, storagePath);
    
    const snapshot = await uploadBytes(fileRef, file);
    const imageUrl = await getDownloadURL(snapshot.ref);
    
    // Send message with image using firestoreService
    const messageData = {
      text: 'Image message',
      imageUrl: imageUrl,
      senderType: 'user',
      senderId: user.uid,
      senderName: user.displayName || 'User',
      createdAt: new Date()
    };

    const messagesPath = `projects/${projectId.value}/requestSubmissions/${requestId.value}/messages`;
    await firestoreService.addDoc(messagesPath, messageData);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const emit = defineEmits(['back', 'close']);

const goBack = () => {
  // If used as a modal component (has props), emit close event
  if (props.requestId && props.projectId) {
    emit('close');
  } else {
    // If used as a route component, navigate back to requests page
    router.push('/requests');
  }
};

const onMessageSent = () => {
  console.log('Message sent successfully');
};

const onImageUploaded = () => {
  console.log('Image uploaded successfully');
};

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});
</script>

<style scoped>
/* No custom styles needed - using UnifiedChat component */
</style>
