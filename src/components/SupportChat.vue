<template>
  <UnifiedChat
    :chat-data="supportChat"
    :messages="messages"
    :loading="supportStore.loading"
    chat-type="support"
    default-title="Support Chat"
    error-title="Support Chat Not Found"
    error-message="The support chat you're looking for doesn't exist or has been deleted."
    closed-message="This support chat has been closed. You can view the conversation but cannot send new messages."
    closed-placeholder="This support chat is closed"
    :on-send-message="handleSendMessage"
    :on-image-upload="handleImageUpload"
    @back="goBack"
    @message-sent="onMessageSent"
    @image-uploaded="onImageUploaded"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSupportStore } from '../stores/supportStore';
import { useNotificationStore } from '../stores/notifications';
import UnifiedChat from './UnifiedChat.vue';
import fileUploadService from '../services/fileUploadService';
import optimizedAuthService from '../services/optimizedAuthService';

const router = useRouter();
const route = useRoute();
const supportStore = useSupportStore();
const notificationStore = useNotificationStore();

// Get support chat ID from route params
const supportChatId = computed(() => route.params.id);

// Reactive data
const supportChat = computed(() => supportStore.currentSupportChat);

// Computed properties
const messages = computed(() => {
  return supportChat.value?.messages || [];
});

// Lifecycle
onMounted(async () => {
  if (supportChatId.value) {
    try {
      // Load support chat data (real-time listeners are temporarily disabled)
      await supportStore.fetchSupportChat(supportChatId.value);
      console.log('✅ Support chat loaded successfully');
    } catch (error) {
      console.error('Error loading support chat:', error);
      notificationStore.addNotification({
        type: 'error',
        message: 'Failed to load support chat.'
      });
    }
  }
});

// Message handling functions
const handleSendMessage = async (messageText) => {
  if (!supportChat.value) return;

  try {
    await supportStore.addMessage(supportChatId.value, {
      text: messageText,
      type: 'text'
    });

    // Refresh the chat to get the updated messages since real-time listeners are disabled
    await supportStore.fetchSupportChat(supportChatId.value);
  } catch (error) {
    console.error('Error sending message:', error);
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to send message. Please try again.'
    });
    throw error;
  }
};

const handleImageUpload = async (file) => {
  try {
    console.log('🚀 SupportChat: Uploading image...', { fileName: file.name, size: file.size });
    
    // Get authenticated user
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate filename and path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `support_${timestamp}.${fileExtension}`;
    const folderPath = `support/${supportChatId.value}/`;
    
    // Upload image using fileUploadService (which handles iOS automatically)
    const imageUrl = await fileUploadService.uploadFile(file, folderPath, fileName);
    
    console.log('✅ SupportChat: Image uploaded successfully:', imageUrl);
    
    // Send message with image URL
    await supportStore.addMessage(supportChatId.value, {
      text: '',
      type: 'image',
      imageUrl: imageUrl
    });

    // Refresh the chat to get the updated messages since real-time listeners are disabled
    await supportStore.fetchSupportChat(supportChatId.value);
    
    console.log('✅ SupportChat: Image message sent successfully');
  } catch (error) {
    console.error('❌ SupportChat: Error uploading image:', error);
    notificationStore.addNotification({
      type: 'error',
      message: 'Failed to upload image. Please try again.'
    });
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