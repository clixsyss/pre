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
const pollInterval = ref(null);
const TERMINAL_REQUEST_STATUSES = new Set(['closed', 'completed', 'resolved', 'rejected', 'cancelled']);

const normalizeStatus = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

const isRequestClosed = () => TERMINAL_REQUEST_STATUSES.has(normalizeStatus(requestData.value?.status));

const redirectIfClosed = (statusValue) => {
  if (!TERMINAL_REQUEST_STATUSES.has(normalizeStatus(statusValue))) return false;
  alert('This request is closed/completed/cancelled and chat can no longer be started.');
  router.replace('/requests');
  return true;
};

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
      if (redirectIfClosed(data.status)) return;
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
      
      // Messages are stored as an array in the request submission document (DynamoDB compatible)
      const requestPath = `projects/${projectId.value}/requestSubmissions/${requestId.value}`;
      const requestSnap = await firestoreService.getDoc(requestPath);
      
      let result;
      if (requestSnap.exists()) {
        const requestData = requestSnap.data();
        // Messages are stored as an array in the document
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
    
    // Set up polling for real-time updates (DynamoDB doesn't support subcollection listeners)
    // Poll every 2 seconds to get new messages
    console.log('🔍 RequestChat: Setting up polling for message updates (DynamoDB)');
    
    // Clean up any existing interval
    if (pollInterval.value) {
      clearInterval(pollInterval.value);
    }
    
    // Poll for new messages every 2 seconds
    pollInterval.value = setInterval(async () => {
      try {
        const requestSnap = await firestoreService.getDoc(requestPath, { useCache: false });
        if (requestSnap.exists()) {
          const latestRequestData = requestSnap.data();
          const nextStatus = latestRequestData.status || 'pending';
          if (requestData.value && requestData.value.status !== nextStatus) {
            requestData.value = {
              ...requestData.value,
              status: nextStatus
            };
          }
          if (Array.isArray(latestRequestData.messages)) {
            const newMessages = latestRequestData.messages.map((msg, index) => ({
              id: msg.id || `msg-${index}`,
              ...msg,
              timestamp: msg.createdAt || msg.timestamp
            }));
            // Only update if messages changed
            if (JSON.stringify(newMessages) !== JSON.stringify(messages.value)) {
              messages.value = newMessages;
              console.log('🔍 RequestChat: Messages updated via polling:', newMessages.length);
            }
          }
        }
      } catch (err) {
        console.error('❌ RequestChat: Error polling messages:', err);
      }
    }, 2000);
    
    console.log('✅ RequestChat: Polling setup successfully');
    
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

    if (isRequestClosed()) {
      throw new Error('This request is closed and cannot receive new messages.');
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

    // Messages are stored as array in request submission document (not subcollection)
    // Use requestSubmissionService.addMessage which handles this correctly
    const { default: requestSubmissionService } = await import('../services/requestSubmissionService');
    await requestSubmissionService.addMessage(projectId.value, requestId.value, messageData);
    
    console.log('✅ RequestChat: Message sent to server, polling will update');
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

    if (isRequestClosed()) {
      throw new Error('This request is closed and cannot receive new messages.');
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
  // Clean up polling interval
  if (pollInterval.value) {
    console.log('🧹 RequestChat: Cleaning up polling interval');
    clearInterval(pollInterval.value);
    pollInterval.value = null;
  }
});
</script>

<style scoped>
/* No custom styles needed - using UnifiedChat component */
</style>
