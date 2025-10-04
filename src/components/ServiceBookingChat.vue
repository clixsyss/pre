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
import fileUploadService from '../services/fileUploadService';
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
  const messageList = booking.value?.messages || [];
  console.log('🔍 ServiceBookingChat: Messages computed', {
    messageCount: messageList.length,
    messages: messageList
  });
  return messageList;
});

// Load booking data
onMounted(async () => {
  console.log('🔍 ServiceBookingChat: Component mounted', {
    bookingId: bookingId,
    projectId: projectStore.selectedProject?.id
  });
  
  await loadBooking();
  await setupRealtimeListener();
});

// Cleanup listener on unmount
onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});

const loadBooking = async () => {
  console.log('🔍 ServiceBookingChat: loadBooking called', {
    projectId: projectStore.selectedProject?.id,
    bookingId: bookingId
  });

  if (!projectStore.selectedProject?.id || !bookingId) {
    console.log('❌ ServiceBookingChat: Missing project ID or booking ID', {
      projectId: projectStore.selectedProject?.id,
      bookingId: bookingId
    });
    loading.value = false;
    return;
  }

  try {
    console.log('🔍 ServiceBookingChat: Loading booking with ID:', bookingId);
    const bookingData = await serviceBookingService.getServiceBooking(
      projectStore.selectedProject.id, 
      bookingId
    );
    console.log('🔍 ServiceBookingChat: Booking data loaded successfully:', bookingData);
    booking.value = bookingData;
  } catch (error) {
    console.error('❌ ServiceBookingChat: Error loading booking:', error);
    console.error('❌ ServiceBookingChat: Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    booking.value = null;
  } finally {
    loading.value = false;
  }
};

const setupRealtimeListener = async () => {
  if (!projectStore.selectedProject?.id || !bookingId) {
    console.log('❌ ServiceBookingChat: Cannot setup real-time listener - missing project ID or booking ID');
    return;
  }

  try {
    console.log('🔍 ServiceBookingChat: Setting up real-time listener...');
    const unsubscribeFn = await serviceBookingService.onServiceBookingChange(
      projectStore.selectedProject.id,
      bookingId,
      (updatedBooking) => {
        console.log('🔍 ServiceBookingChat: Realtime booking update received:', {
          bookingId: updatedBooking?.id,
          messageCount: updatedBooking?.messages?.length || 0,
          lastMessage: updatedBooking?.messages?.[updatedBooking.messages.length - 1]
        });
        
        if (updatedBooking) {
          // Merge real-time data with existing temporary messages
          const currentMessages = booking.value?.messages || [];
          const tempMessages = currentMessages.filter(msg => msg.isTemporary);
          
          // Update with real data
          booking.value = updatedBooking;
          
          // Add back any temporary messages that should still be visible
          if (tempMessages.length > 0) {
            console.log('🔍 ServiceBookingChat: Preserving temporary messages after real-time update');
            tempMessages.forEach(tempMsg => {
              // Only add back if there's no real message with the same text
              const hasRealMessage = updatedBooking.messages.some(msg => 
                !msg.isTemporary && 
                msg.text === tempMsg.text && 
                msg.senderType === 'user'
              );
              
              if (!hasRealMessage) {
                booking.value.messages.push(tempMsg);
              }
            });
          }
          
          console.log('✅ ServiceBookingChat: Booking updated with real-time data');
        } else {
          console.log('⚠️ ServiceBookingChat: Received null booking update');
        }
      }
    );
    unsubscribe.value = unsubscribeFn;
    console.log('✅ ServiceBookingChat: Real-time listener setup successfully');
  } catch (error) {
    console.error('❌ ServiceBookingChat: Error setting up real-time listener:', error);
    unsubscribe.value = null;
  }
};

// Message handling functions
const handleSendMessage = async (messageText) => {
  console.log('🔍 ServiceBookingChat: handleSendMessage called', {
    messageText: messageText,
    bookingId: bookingId,
    projectId: projectStore.selectedProject.id,
    booking: booking.value
  });

  if (!booking.value) {
    console.error('❌ ServiceBookingChat: No booking available for sending message');
    return;
  }

  // Create a temporary message to show immediately
  const tempMessage = {
    id: `temp_${Date.now()}`,
    text: messageText,
    senderType: 'user',
    senderId: 'current_user',
    senderName: 'You',
    timestamp: new Date(),
    messageType: 'chat',
    isTemporary: true
  };

  // Add the temporary message to the local state immediately
  if (!booking.value.messages) {
    booking.value.messages = [];
  }
  booking.value.messages.push(tempMessage);
  console.log('🔍 ServiceBookingChat: Added temporary message to local state');

  try {
    console.log('🔍 ServiceBookingChat: Sending message to server...');
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: messageText,
        senderType: 'user'
      }
    );
    console.log('✅ ServiceBookingChat: Message sent successfully to server');
    
    // Keep the temporary message visible until we get a real update
    console.log('🔍 ServiceBookingChat: Keeping temporary message visible');
    
    // Set a flag to track if we've received a real-time update
    let realTimeUpdateReceived = false;
    
    // Listen for real-time updates to replace temporary message
    const checkForRealMessage = () => {
      if (realTimeUpdateReceived) return;
      
      // Check if the temporary message is still there
      const tempIndex = booking.value.messages.findIndex(msg => msg.id === tempMessage.id);
      if (tempIndex !== -1) {
        // Check if there's a real message with the same text
        const realMessage = booking.value.messages.find(msg => 
          !msg.isTemporary && 
          msg.text === messageText && 
          msg.senderType === 'user' &&
          msg.timestamp > tempMessage.timestamp
        );
        
        if (realMessage) {
          console.log('🔍 ServiceBookingChat: Found real message, removing temporary message');
          booking.value.messages.splice(tempIndex, 1);
          realTimeUpdateReceived = true;
        }
      }
    };
    
    // Check for real message every 500ms for up to 5 seconds
    const checkInterval = setInterval(checkForRealMessage, 500);
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!realTimeUpdateReceived) {
        console.log('🔍 ServiceBookingChat: No real-time update received, keeping temporary message');
      }
    }, 5000);
  } catch (error) {
    console.error('❌ ServiceBookingChat: Error sending message:', error);
    
    // Remove the temporary message on error
    const tempIndex = booking.value.messages.findIndex(msg => msg.id === tempMessage.id);
    if (tempIndex !== -1) {
      booking.value.messages.splice(tempIndex, 1);
      console.log('🔍 ServiceBookingChat: Removed temporary message due to error');
    }
    
    throw error;
  }
};

const handleImageUpload = async (file) => {
  console.log('🔍 ServiceBookingChat: handleImageUpload called', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    bookingId: bookingId,
    projectId: projectStore.selectedProject.id
  });

  if (!booking.value) {
    console.error('❌ ServiceBookingChat: No booking available for image upload');
    return;
  }

  // Create a temporary message to show immediately
  const tempMessage = {
    id: `temp_image_${Date.now()}`,
    text: `📎 Uploading ${file.name}...`,
    senderType: 'user',
    senderId: 'current_user',
    senderName: 'You',
    timestamp: new Date(),
    messageType: 'chat',
    isTemporary: true,
    isUploading: true
  };

  // Add the temporary message to the local state immediately
  if (!booking.value.messages) {
    booking.value.messages = [];
  }
  booking.value.messages.push(tempMessage);
  console.log('🔍 ServiceBookingChat: Added temporary upload message to local state');

  try {
    console.log('🔍 ServiceBookingChat: Starting image upload...');
    
    // iOS-specific file handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    console.log('🔍 ServiceBookingChat: Platform detection:', { isIOS, userAgent: navigator.userAgent });
    
    let fileToUpload = file;
    
    if (isIOS) {
      console.log('🔍 ServiceBookingChat: iOS detected, processing file for iOS compatibility...');
      
      try {
        // For iOS, try multiple approaches to ensure file compatibility
        let processedFile = file;
        
        // Method 1: Try to create a new File object
        if (typeof File !== 'undefined' && Object.prototype.isPrototypeOf.call(File.prototype, file)) {
          try {
            const newFile = new File([file], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: file.lastModified || Date.now()
            });
            processedFile = newFile;
            console.log('🔍 ServiceBookingChat: Method 1 - Created new File object for iOS');
          } catch (error) {
            console.log('🔍 ServiceBookingChat: Method 1 failed, trying Method 2:', error.message);
          }
        }
        
        // Method 2: If File constructor fails, try to create a Blob and convert
        if (processedFile === file) {
          try {
            const reader = new FileReader();
            const blob = await new Promise((resolve, reject) => {
              reader.onload = () => {
                const arrayBuffer = reader.result;
                const blob = new Blob([arrayBuffer], { type: file.type || 'image/jpeg' });
                resolve(blob);
              };
              reader.onerror = reject;
              reader.readAsArrayBuffer(file);
            });
            
            // Create a new File from the blob
            const newFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: file.lastModified || Date.now()
            });
            processedFile = newFile;
            console.log('🔍 ServiceBookingChat: Method 2 - Created File from Blob for iOS');
          } catch (error) {
            console.log('🔍 ServiceBookingChat: Method 2 failed, using original file:', error.message);
          }
        }
        
        // Method 3: If all else fails, try to ensure the file has proper properties
        if (processedFile === file) {
          // Ensure the file has required properties
          if (!file.type) {
            Object.defineProperty(file, 'type', {
              value: 'image/jpeg',
              writable: false
            });
          }
          if (!file.lastModified) {
            Object.defineProperty(file, 'lastModified', {
              value: Date.now(),
              writable: false
            });
          }
          processedFile = file;
          console.log('🔍 ServiceBookingChat: Method 3 - Enhanced original file properties for iOS');
        }
        
        fileToUpload = processedFile;
        
        console.log('🔍 ServiceBookingChat: iOS file processing completed:', {
          name: fileToUpload.name,
          size: fileToUpload.size,
          type: fileToUpload.type,
          lastModified: fileToUpload.lastModified,
          constructor: fileToUpload.constructor.name,
          isFile: fileToUpload instanceof File,
          isBlob: fileToUpload instanceof Blob,
          hasArrayBuffer: typeof fileToUpload.arrayBuffer === 'function',
          hasStream: typeof fileToUpload.stream === 'function'
        });
        
      } catch (iosError) {
        console.error('❌ ServiceBookingChat: All iOS file processing methods failed:', iosError);
        console.log('🔍 ServiceBookingChat: Using original file as fallback');
        fileToUpload = file;
      }
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = fileToUpload.name.split('.').pop() || 'jpg';
    const fileName = `image_${timestamp}.${fileExtension}`;
    
    console.log('🔍 ServiceBookingChat: Uploading file:', {
      fileName: fileName,
      fileSize: fileToUpload.size,
      fileType: fileToUpload.type,
      isIOS: isIOS
    });
    
    // Add timeout for iOS uploads to prevent infinite loading
    const uploadTimeout = isIOS ? 30000 : 15000; // 30 seconds for iOS, 15 for others
    console.log('🔍 ServiceBookingChat: Setting upload timeout:', uploadTimeout + 'ms');
    
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Upload timeout after ${uploadTimeout}ms`));
      }, uploadTimeout);
    });
    
    // Upload image to Firebase Storage with timeout
    const storagePath = `projects/${projectStore.selectedProject.id}/serviceBookings/${bookingId}/images/`;
    
    console.log('🔍 ServiceBookingChat: Starting upload with details:', {
      storagePath: storagePath,
      fileName: fileName,
      fileSize: fileToUpload.size,
      fileType: fileToUpload.type,
      isIOS: isIOS,
      timeout: uploadTimeout,
      fileConstructor: fileToUpload.constructor.name,
      fileIsFile: fileToUpload instanceof File,
      fileIsBlob: fileToUpload instanceof Blob
    });
    
    let uploadPromise;
    try {
      console.log('🔍 ServiceBookingChat: Creating upload promise...');
      uploadPromise = fileUploadService.uploadFile(fileToUpload, storagePath, fileName);
      console.log('🔍 ServiceBookingChat: Upload promise created successfully');
    } catch (syncError) {
      console.error('❌ ServiceBookingChat: Synchronous error creating upload promise:', syncError);
      throw syncError;
    }
    
    console.log('🔍 ServiceBookingChat: Upload promise created, racing against timeout...');
    
    // Add detailed error handling to the upload promise
    const uploadPromiseWithErrorHandling = uploadPromise.catch(error => {
      console.error('❌ ServiceBookingChat: Upload promise rejected with error:', error);
      console.error('❌ ServiceBookingChat: Error type:', typeof error);
      console.error('❌ ServiceBookingChat: Error constructor:', error?.constructor?.name);
      console.error('❌ ServiceBookingChat: Error message:', error?.message);
      console.error('❌ ServiceBookingChat: Error stack:', error?.stack);
      console.error('❌ ServiceBookingChat: Full error object:', JSON.stringify(error, null, 2));
      throw error; // Re-throw to maintain the promise chain
    });
    
    const imageUrl = await Promise.race([uploadPromiseWithErrorHandling, timeoutPromise]);
    
    console.log('✅ ServiceBookingChat: Image uploaded successfully:', imageUrl);
    
    // Remove the temporary upload message
    const tempIndex = booking.value.messages.findIndex(msg => msg.id === tempMessage.id);
    if (tempIndex !== -1) {
      booking.value.messages.splice(tempIndex, 1);
      console.log('🔍 ServiceBookingChat: Removed temporary upload message');
    }
    
    // Send the image message with the actual image URL
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: `📎 ${file.name}`,
        imageUrl: imageUrl,
        senderType: 'user'
      }
    );
    
    console.log('✅ ServiceBookingChat: Image message sent successfully');
  } catch (error) {
    console.error('❌ ServiceBookingChat: Error uploading image:', error);
    console.error('❌ ServiceBookingChat: Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      isIOS: isIOS,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    // Remove the temporary upload message on error
    const tempIndex = booking.value.messages.findIndex(msg => msg.id === tempMessage.id);
    if (tempIndex !== -1) {
      booking.value.messages.splice(tempIndex, 1);
      console.log('🔍 ServiceBookingChat: Removed temporary upload message due to error');
    }
    
    // iOS fallback: Try base64 upload first, then text message
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      console.log('🔍 ServiceBookingChat: iOS upload failed, trying base64 fallback...');
      
      try {
        // Try to convert image to base64 and upload as text
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        console.log('🔍 ServiceBookingChat: Image converted to base64, length:', base64.length);
        
        // For large images, truncate the base64 for display but keep it functional
        const displayBase64 = base64.length > 1000 ? base64.substring(0, 1000) + '...' : base64;
        
        // Send as base64 message
        await serviceBookingService.addMessage(
          projectStore.selectedProject.id,
          bookingId,
          {
            text: `📎 ${file.name} (Base64 - ${(base64.length / 1024).toFixed(1)}KB)\n${displayBase64}`,
            senderType: 'user'
          }
        );
        
        console.log('✅ ServiceBookingChat: Base64 fallback message sent successfully');
        return; // Exit successfully
      } catch (base64Error) {
        console.error('❌ ServiceBookingChat: Base64 fallback failed:', base64Error);
        
        // Final fallback: Send image info as text message
        try {
          await serviceBookingService.addMessage(
            projectStore.selectedProject.id,
            bookingId,
            {
              text: `📎 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) - Image upload failed on iOS, but file info recorded`,
              senderType: 'user'
            }
          );
          
          console.log('✅ ServiceBookingChat: Text fallback message sent successfully');
          return; // Exit successfully
        } catch (textError) {
          console.error('❌ ServiceBookingChat: All iOS fallbacks failed:', textError);
        }
      }
    }
    
    // Send an error message
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: `❌ Failed to upload ${file.name}: ${error.message}`,
        senderType: 'user'
      }
    );
    
    throw error;
  }
};

// const handleAdminSend = async (messageText) => {
//   if (!booking.value) return;

//   try {
//     await serviceBookingService.addMessage(
//       projectStore.selectedProject.id,
//       bookingId,
//       {
//         text: messageText,
//         senderType: 'admin'
//       }
//     );
//   } catch (error) {
//     console.error('Error sending admin message:', error);
//     throw error;
//   }
// };

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

