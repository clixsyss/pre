<template>
  <UnifiedChat
    :chat-data="requestData"
    :messages="messages"
    :loading="loading"
    chat-type="request"
    :default-title="t('requestChat')"
    :error-title="t('requestNotFound')"
    :error-message="t('requestNotFoundMessage')"
    :closed-message="t('requestClosedMessage')"
    :closed-placeholder="t('requestClosed')"
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
import { useI18n } from 'vue-i18n';
import optimizedAuthService from '../services/optimizedAuthService';
import { useProjectStore } from '../stores/projectStore';
import UnifiedChat from './UnifiedChat.vue';
import firestoreService from '../services/firestoreService';
import fileUploadService from '../services/fileUploadService';

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
const { t } = useI18n();
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
        title: data.title || data.description || t('requestChat'),
        categoryName: data.categoryName || data.category || t('request'),
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
    
    // Try to load messages from subcollection (if table exists)
    // Note: Messages might be stored in the request submission document itself
    const messagesPath = `projects/${projectId.value}/requestSubmissions/${requestId.value}/messages`;
    const queryOptions = {
      orderBy: { field: 'createdAt', direction: 'asc' },
      timeoutMs: 10000
    };
    
    let result
    try {
      result = await firestoreService.getDocs(messagesPath, queryOptions);
    } catch (error) {
      // If messages table doesn't exist, try to get messages from the request submission document
      console.warn('⚠️ RequestChat: Messages subcollection not found, checking request document for messages field:', error.message);
      
      // Try to get messages from the request submission document itself
      const requestPath = `projects/${projectId.value}/requestSubmissions/${requestId.value}`;
      const requestSnap = await firestoreService.getDoc(requestPath);
      
      if (requestSnap.exists()) {
        const requestData = requestSnap.data();
        // If messages are stored as an array in the document
        if (Array.isArray(requestData.messages)) {
          result = {
            docs: requestData.messages.map((msg, index) => ({
              id: msg.id || `msg-${index}`,
              data: () => msg
            })),
            empty: requestData.messages.length === 0,
            size: requestData.messages.length
          };
        } else {
          // No messages found
          result = {
            docs: [],
            empty: true,
            size: 0
          };
        }
      } else {
        result = {
          docs: [],
          empty: true,
          size: 0
        };
      }
    }
    
    messages.value = result.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure timestamp field exists for UnifiedChat
        timestamp: data.createdAt
      };
    });
    
    console.log('✅ RequestChat: Initial messages loaded:', messages.value.length);
    
    // Set up real-time listener for instant message updates on iOS/Android
    console.log('🔍 RequestChat: Setting up real-time listener for messages collection');
    
    // Clean up any existing listener
    if (unsubscribe.value) {
      unsubscribe.value();
    }
    
    // Use subscribeToQuery for collection-level real-time updates
    try {
      unsubscribe.value = firestoreService.subscribeToQuery(
        messagesPath,
        {
          orderByField: 'createdAt',
          orderDirection: 'asc'
        },
        (snapshot) => {
          // Handle real-time updates
          const newMessages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.createdAt
            };
          });
          
          console.log('🔍 RequestChat: Real-time messages update received:', newMessages.length);
          messages.value = newMessages;
        },
        (error) => {
          console.error('❌ RequestChat: Real-time listener error:', error);
          console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            stack: error?.stack
          });
        }
      );
    } catch (err) {
      console.error('❌ RequestChat: Error setting up real-time listener:', err);
      console.error('Error details:', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack
      });
    }
    
    console.log('✅ RequestChat: Real-time listener setup successfully');
    
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

    // Create temporary message for instant display (optimistic UI like WhatsApp)
    const tempMessage = {
      id: `temp_${Date.now()}`,
      text: messageText,
      senderType: 'user',
      senderId: user.uid,
      senderName: user.displayName || 'User',
      timestamp: new Date(),
      createdAt: new Date(),
      isTemporary: true
    };

    // Add temporary message to local state INSTANTLY
    messages.value.push(tempMessage);
    console.log('⚡ RequestChat: Message displayed instantly (optimistic UI)');

    const messageData = {
      text: messageText,
      senderType: 'user',
      senderId: user.uid,
      senderName: user.displayName || 'User',
      createdAt: new Date()
    };

    const messagesPath = `projects/${projectId.value}/requestSubmissions/${requestId.value}/messages`;
    await firestoreService.addDoc(messagesPath, messageData);
    
    console.log('✅ RequestChat: Message sent to server, real-time listener will update');
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Remove temporary message on error
    const tempIndex = messages.value.findIndex(msg => msg.isTemporary && msg.text === messageText);
    if (tempIndex !== -1) {
      messages.value.splice(tempIndex, 1);
    }
    
    throw error;
  }
};

const handleImageUpload = async (file) => {
  try {
    console.log('🚀 RequestChat: Uploading image...', { fileName: file.name, size: file.size });
    
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!projectId.value || !requestId.value) {
      throw new Error('Missing projectId or requestId');
    }

    // Generate filename and path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `message_${timestamp}.${fileExtension}`;
    const storagePath = `projects/${projectId.value}/request-submissions/${requestId.value}/messages/`;
    
    // Upload image using fileUploadService (which handles iOS automatically)
    const imageUrl = await fileUploadService.uploadFile(file, storagePath, fileName);
    
    console.log('✅ RequestChat: Image uploaded successfully:', imageUrl);
    
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
    
    console.log('✅ RequestChat: Image message sent successfully');
  } catch (error) {
    console.error('❌ RequestChat: Error uploading image:', error);
    throw error;
  }
};

// const emit = defineEmits(['back', 'close']);

const goBack = () => {
  router.go(-1);
};

const onMessageSent = () => {
  console.log('Message sent successfully');
};

const onImageUploaded = () => {
  console.log('Image uploaded successfully');
};

// Cleanup on unmount
onUnmounted(() => {
  // Clean up real-time listener
  if (unsubscribe.value) {
    console.log('🧹 RequestChat: Cleaning up real-time listener');
    unsubscribe.value();
    unsubscribe.value = null;
  }
});
</script>

<style scoped>
/* No custom styles needed - using UnifiedChat component */
</style>
