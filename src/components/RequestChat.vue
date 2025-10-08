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

    // Upload image to Firebase Storage with iOS compatibility
    const timestamp = Date.now();
    const fileName = `message_${timestamp}_${file.name}`;
    const storagePath = `projects/${projectId.value}/request-submissions/${requestId.value}/messages/`;
    
    // Check if iOS native platform
    const { Capacitor } = await import('@capacitor/core')
    const isIOS = Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()
    
    let imageUrl
    
    if (isIOS) {
      console.log('📱 iOS detected, using Storage REST API for request chat...')
      
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Convert to base64
      let binary = ''
      const len = uint8Array.byteLength
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i])
      }
      const base64 = btoa(binary)
      
      // Upload using Storage REST API
      const { Http } = await import('@capacitor-community/http')
      const fullPath = `${storagePath}${fileName}`
      const bucket = 'pre-group.firebasestorage.app'
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(fullPath)}`
      
      const uploadResponse = await Http.request({
        url: uploadUrl,
        method: 'POST',
        headers: {
          'Content-Type': file.type
        },
        data: base64,
        connectTimeout: 60000,
        readTimeout: 60000
      })
      
      if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fullPath)}?alt=media`
        console.log('📱 iOS: ✅ Image uploaded successfully')
      } else {
        throw new Error(`Upload failed with status ${uploadResponse.status}`)
      }
    } else {
      // Use Web SDK for web and other platforms
      console.log('🌐 Using Firebase Web SDK for request chat upload...')
      const fileRef = storageRef(storage, storagePath + fileName)
      const snapshot = await uploadBytes(fileRef, file)
      imageUrl = await getDownloadURL(snapshot.ref)
    }
    
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
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});
</script>

<style scoped>
/* No custom styles needed - using UnifiedChat component */
</style>
