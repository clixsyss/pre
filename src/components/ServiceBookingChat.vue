<template>
  <UnifiedChat
    :chat-data="booking"
    :messages="messages"
    :loading="loading"
    chat-type="service"
    default-title="Service Booking Chat"
    error-title="Booking Not Found"
    error-message="The service booking you're looking for doesn't exist or has been removed."
    closed-message="This service booking has been closed. You can view the conversation but cannot send new messages."
    closed-placeholder="This service booking is closed"
    :on-send-message="handleSendMessage"
    :on-image-upload="handleImageUpload"
    :allow-admin-send="true"
    :on-admin-send="handleAdminSend"
    @back="goBack"
    @message-sent="onMessageSent"
    @image-uploaded="onImageUploaded"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectStore } from '../stores/projectStore';
import serviceBookingService from '../services/serviceBookingService';
import UnifiedChat from './UnifiedChat.vue';

// Component name for ESLint
defineOptions({
  name: 'ServiceBookingChat'
});

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();

// Reactive state
const booking = ref(null);
const loading = ref(true);
const unsubscribe = ref(null);

// Get booking ID from route
const bookingId = route.params.id;

// Computed properties
const messages = computed(() => {
  return booking.value?.messages || [];
});

// Load booking data
onMounted(async () => {
  await loadBooking();
  setupRealtimeListener();
});

// Cleanup listener on unmount
onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});

const loadBooking = async () => {
  if (!projectStore.selectedProject?.id || !bookingId) {
    loading.value = false;
    return;
  }

  try {
    console.log('🔍 Loading booking with ID:', bookingId);
    const bookingData = await serviceBookingService.getServiceBooking(
      projectStore.selectedProject.id, 
      bookingId
    );
    console.log('🔍 Booking data loaded:', bookingData);
    booking.value = bookingData;
  } catch (error) {
    console.error('Error loading booking:', error);
    booking.value = null;
  } finally {
    loading.value = false;
  }
};

const setupRealtimeListener = () => {
  if (!projectStore.selectedProject?.id || !bookingId) return;

  unsubscribe.value = serviceBookingService.onServiceBookingChange(
    projectStore.selectedProject.id,
    bookingId,
    (updatedBooking) => {
      console.log('🔍 Realtime booking update:', updatedBooking);
      booking.value = updatedBooking;
    }
  );
};

// Message handling functions
const handleSendMessage = async (messageText) => {
  if (!booking.value) return;

  try {
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: messageText,
        senderType: 'user'
      }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

const handleImageUpload = async (file) => {
  try {
    // For now, we'll send a text message indicating image upload
    // You can implement actual image upload to Firebase Storage later
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: `📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        senderType: 'user'
      }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

const handleAdminSend = async (messageText) => {
  if (!booking.value) return;

  try {
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: messageText,
        senderType: 'admin'
      }
    );
  } catch (error) {
    console.error('Error sending admin message:', error);
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

