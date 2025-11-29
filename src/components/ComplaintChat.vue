<template>
  <UnifiedChat
    :chat-id="complaintId"
    chat-type="complaint"
    :title="complaint?.title"
    :status="complaint?.status"
    :category="getCategoryName(complaint?.category)"
    :messages="complaint?.messages || []"
    :loading="complaintStore.loading"
    :is-closed="isComplaintClosed"
    closed-message="This complaint has been resolved. You can view the conversation but cannot send new messages."
    error-title="Complaint Not Found"
    error-message="The complaint you're looking for doesn't exist or has been deleted."
    @send-message="handleSendMessage"
    @upload-image="handleImageUpload"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useComplaintStore } from '../stores/complaintStore';
import { useNotificationStore } from '../stores/notifications';
import optimizedAuthService from '../services/optimizedAuthService';
import UnifiedChat from './UnifiedChat.vue';

const route = useRoute();
const complaintStore = useComplaintStore();
const notificationStore = useNotificationStore();

// Get complaint ID from route params
const complaintId = computed(() => route.params.id);

// Computed properties
const complaint = computed(() => complaintStore.currentComplaint);
const isComplaintClosed = computed(() => 
  complaint.value?.status === 'Resolved' || complaint.value?.status === 'Closed'
);

// Methods
const getCategoryName = (categoryId) => {
  const category = complaintStore.complaintCategories.find(c => c.id === categoryId);
  return category ? `${category.icon || '📋'} ${category.name}` : categoryId || 'General';
};

const handleSendMessage = async (messageText) => {
  if (!messageText.trim() || complaintStore.loading || isComplaintClosed.value) return;

  try {
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      notificationStore.showError('You must be logged in to send messages.');
      return;
    }

    await complaintStore.addMessage(complaintId.value, {
      senderType: 'user',
      senderId: user.uid,
      text: messageText
    });

    console.log('✅ ComplaintChat: Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    notificationStore.showError('Failed to send message. Please try again.');
    throw error; // Re-throw to let UnifiedChat handle optimistic rollback
  }
};

const handleImageUpload = async (file) => {
  if (!file) return;

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    notificationStore.showError('Image size must be less than 5MB');
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    notificationStore.showError('Please select an image or video file');
    return;
  }

  try {
    // Upload image
    const imageData = await complaintStore.uploadImage(file, complaintId.value);
    
    // Send message with image
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      notificationStore.showError('You must be logged in to send messages.');
      return;
    }

    await complaintStore.addMessage(complaintId.value, {
      senderType: 'user',
      senderId: user.uid,
      text: 'Image message',
      imageUrl: imageData.url,
      imageFileName: imageData.fileName
    });

    console.log('✅ ComplaintChat: Image message sent successfully');
  } catch (error) {
    console.error('Error uploading image:', error);
    notificationStore.showError('Failed to upload image. Please try again.');
    throw error;
  }
};

// Lifecycle
let unsubscribe = null;

onMounted(async () => {
  try {
    console.log('🚀 ComplaintChat: Component mounted, fetching complaint...');
    
    // Fetch complaint categories
    await complaintStore.fetchComplaintCategories();
    
    // Fetch complaint data
    await complaintStore.fetchComplaint(complaintId.value);
    
    // Subscribe to real-time updates
    unsubscribe = await complaintStore.subscribeToComplaint(complaintId.value);
    
    console.log('✅ ComplaintChat: Complaint loaded and subscribed to real-time updates');
  } catch (error) {
    console.error('Error loading complaint:', error);
    notificationStore.showError('Failed to load complaint. Please try again.');
  }
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
  complaintStore.clearCurrentComplaint();
});
</script>

<style scoped>
/* Component uses UnifiedChat styles */
</style>
