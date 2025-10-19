<template>
  <UnifiedChat
    :chat-data="violation"
    :messages="messages"
    :loading="loading"
    chat-type="violation"
    default-title="Violation Chat"
    error-title="Violation Not Found"
    error-message="The violation you're looking for doesn't exist or has been deleted."
    closed-message="This violation has been closed. You can view the conversation but cannot send new messages."
    closed-placeholder="This violation is closed"
    :on-send-message="handleSendMessage"
    :on-image-upload="handleImageUpload"
    @back="goBack"
    @message-sent="onMessageSent"
    @image-uploaded="onImageUploaded"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import { getFine, addMessage, onFineChange, uploadFineImage, markMessagesAsRead as markViolationMessagesAsRead } from '../services/finesService';
import optimizedAuthService from '../services/optimizedAuthService';
import UnifiedChat from './UnifiedChat.vue';

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

// Get violation ID from route params
const violationId = computed(() => route.params.id);

// Reactive data
const loading = ref(false);
const violation = ref(null);
const unsubscribe = ref(null);

// Computed properties
const messages = computed(() => {
  return violation.value?.messages || [];
});

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true;
    // Fetch violation data
    const violationData = await getFine(projectStore.selectedProject.id, violationId.value);
    violation.value = violationData;
    
    // Mark messages as read
    const user = await optimizedAuthService.getCurrentUser();
    if (user) {
      await markViolationMessagesAsRead(projectStore.selectedProject.id, violationId.value, user.uid);
    }
    
    // Subscribe to real-time updates
    unsubscribe.value = onFineChange(projectStore.selectedProject.id, violationId.value, async (updatedViolation) => {
      if (updatedViolation) {
        violation.value = updatedViolation;
        // Mark new messages as read
        const user = await optimizedAuthService.getCurrentUser();
        if (user) {
          markViolationMessagesAsRead(projectStore.selectedProject.id, violationId.value, user.uid);
        }
      }
    });
  } catch (error) {
    console.error('Error loading violation:', error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});

// Message handling functions
const handleSendMessage = async (messageText) => {
  if (!violation.value) return;

  // Create temporary message for instant display (optimistic UI like WhatsApp)
  const tempMessage = {
    id: `temp_${Date.now()}`,
    text: messageText,
    senderType: 'user',
    senderId: '',
    timestamp: new Date(),
    isTemporary: true
  };

  try {
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      throw new Error('You must be logged in to send messages.');
    }

    // Update tempMessage with user ID
    tempMessage.senderId = user.uid;

    // Add temporary message to local state INSTANTLY
    if (!violation.value.messages) {
      violation.value.messages = [];
    }
    violation.value.messages.push(tempMessage);
    console.log('⚡ ViolationChat: Message displayed instantly (optimistic UI)');

    await addMessage(projectStore.selectedProject.id, violationId.value, {
      senderType: 'user',
      senderId: user.uid,
      text: messageText
    });
    
    console.log('✅ ViolationChat: Message sent to server, real-time listener will update');
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Remove temporary message on error
    const tempIndex = violation.value.messages?.findIndex(msg => msg.id === tempMessage.id);
    if (tempIndex !== -1) {
      violation.value.messages.splice(tempIndex, 1);
    }
    
    throw error;
  }
};

const handleImageUpload = async (file) => {
  try {
    // Upload image to Firebase Storage
    const imageUrl = await uploadFineImage(projectStore.selectedProject.id, violationId.value, file);
    
    // Add message with image
    await addMessage(projectStore.selectedProject.id, violationId.value, {
      senderType: 'user',
      senderId: (await optimizedAuthService.getCurrentUser()).uid,
      text: '',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const goBack = () => {
  router.go(-1);
};

const onMessageSent = () => {
  console.log('Message sent successfully');
};

const onImageUploaded = () => {
  console.log('Image uploaded successfully');
};
</script>

<style scoped>
/* No custom styles needed - using UnifiedChat component */
</style>