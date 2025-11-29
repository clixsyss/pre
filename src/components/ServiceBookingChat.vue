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
import UnifiedChat from './UnifiedChat.vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

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
    fileName: file?.name || 'unknown',
    fileSize: file?.size || 0,
    fileType: file?.type || 'unknown',
    bookingId: bookingId,
    projectId: projectStore.selectedProject.id
  });

  if (!booking.value) {
    console.error('❌ ServiceBookingChat: No booking available for image upload');
    return;
  }

  // Check if we're on native platform (iOS/Android) and use Capacitor Camera API
  const isNative = Capacitor.isNativePlatform(); 
  const platform = Capacitor.getPlatform();
  
  if (isNative && (platform === 'ios' || platform === 'android') && !file) {
    // Only use Capacitor Camera API if no file is provided (direct camera call)
    console.log(`📱 ${platform} detected, using Capacitor Camera API...`);
    return await handleImageUploadWithCapacitor();
  } else {
    // Use the provided file (from file input or web)
    console.log('🌐 Using provided file for upload...');
    return await handleImageUploadWithFile(file);
  }
};

// Image compression function
const compressImage = (blob, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1200px width)
      const maxWidth = 1200;
      const maxHeight = 1200;
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        } else {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(blob);
  });
};


// Capacitor-based image upload for iOS
const handleImageUploadWithCapacitor = async () => {
  try {
    console.log(`📱 Starting Capacitor image picker...`);
    
    // Take/select photo using Capacitor Camera
    const photo = await Camera.getPhoto({
      quality: 60, // Reduced quality for faster upload
      allowEditing: false,
      resultType: CameraResultType.Uri, // Use Uri for iOS compatibility
      source: CameraSource.Prompt // Let user choose camera or photo library
    });
    
    console.log(`📱 Image selected:`, photo);
    
    if (!photo.webPath) {
      throw new Error('No image webPath found');
    }
    
    // Fetch the image file as a Blob (crucial for iOS)
    console.log(`📱 Fetching image as blob from:`, photo.webPath);
    const response = await fetch(photo.webPath);
    let blob = await response.blob();
    console.log(`📱 Original blob:`, { size: blob.size, type: blob.type });
    
    // Compress image if it's too large (> 1MB)
    if (blob.size > 1024 * 1024) {
      console.log(`📱 Compressing large image...`);
      blob = await compressImage(blob, 0.7); // 70% quality
      console.log(`📱 Compressed blob:`, { size: blob.size, type: blob.type });
    }
    
    // Create temporary message
    const tempMessage = {
      id: `temp_image_${Date.now()}`,
      text: `📎 Uploading image...`,
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
    console.log(`📱 Added temporary upload message to local state`);

    // Ensure user is authenticated before uploading
    console.log(`📱 Ensuring user authentication before upload...`);
    const { getAuth, signInAnonymously } = await import('firebase/auth');
    const auth = getAuth();
    
    // Check if user is authenticated
    let currentUser = auth.currentUser;
    console.log(`📱 Current auth state:`, { 
      hasUser: !!currentUser, 
      userId: currentUser?.uid,
      isAnonymous: currentUser?.isAnonymous 
    });
    
    if (!currentUser) {
      console.log(`📱 No authenticated user, signing in anonymously...`);
      try {
        const userCredential = await signInAnonymously(auth);
        currentUser = userCredential.user;
        console.log(`📱 Anonymous sign-in successful:`, { 
          uid: currentUser.uid,
          isAnonymous: currentUser.isAnonymous 
        });
      } catch (authError) {
        console.error('📱 Anonymous sign-in failed:', {
          code: authError.code,
          message: authError.message,
          stack: authError.stack
        });
        throw new Error(`Authentication failed: ${authError.message}`);
      }
    } else {
      console.log(`📱 User already authenticated:`, { 
        uid: currentUser.uid,
        isAnonymous: currentUser.isAnonymous 
      });
    }

    // Upload using Firebase Storage REST API for iOS
    const fileName = `image_${Date.now()}.jpg`;
    const fullPath = `projects/${projectStore.selectedProject.id}/serviceBookings/${bookingId}/images/${fileName}`;
    
    console.log(`📱 Starting REST API upload with Blob...`, {
      fullPath,
      blobSize: blob.size,
      blobType: blob.type,
      userId: currentUser.uid,
      isAnonymous: currentUser.isAnonymous
    });
    
    try {
      // Convert blob to ArrayBuffer for REST API
      const arrayBuffer = await blob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Convert to base64
      let binary = ''
      const len = uint8Array.byteLength
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i])
      }
      const base64 = btoa(binary)
      
      console.log(`📱 Converted blob to base64, size:`, base64.length)
      
      // Upload using Storage REST API via Capacitor HTTP
      const { Http } = await import('@capacitor-community/http')
      const bucket = 'pre-group.firebasestorage.app'
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(fullPath)}`
      
      console.log(`📱 Uploading to:`, uploadUrl)
      
      const uploadResponse = await Http.request({
        url: uploadUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'image/jpeg'
        },
        data: base64,
        connectTimeout: 60000,
        readTimeout: 60000
      })
      
      console.log(`📱 Upload response status:`, uploadResponse.status)
      
      if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`)
      }
      
      // Get download URL
      const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fullPath)}?alt=media`
      
      console.log(`📱 Upload successful! URL:`, downloadURL);
      
      // Remove the temporary upload message
      const tempIndex = booking.value.messages.findIndex(msg => msg.id === tempMessage.id);
      if (tempIndex !== -1) {
        booking.value.messages.splice(tempIndex, 1);
        console.log(`📱 Removed temporary upload message`);
      }
      
      // Send the image message to the chat
      await serviceBookingService.addMessage(
        projectStore.selectedProject.id,
        bookingId,
        {
          text: `📎 ${fileName}`,
          senderType: 'user',
          imageUrl: downloadURL
        }
      );
      
      console.log('✅ Image message sent successfully');
      
    } catch (uploadError) {
      console.error('📱 Upload failed with detailed error:', {
        code: uploadError.code,
        message: uploadError.message,
        serverResponse: uploadError.serverResponse,
        stack: uploadError.stack
      });
      
      // Remove temporary message on error
      const tempIndex = booking.value.messages.findIndex(msg => msg.isTemporary && msg.isUploading);
      if (tempIndex !== -1) {
        booking.value.messages.splice(tempIndex, 1);
      }
      
      // Send error message with detailed error info
      await serviceBookingService.addMessage(
        projectStore.selectedProject.id,
        bookingId,
        {
          text: `❌ Upload failed: ${uploadError.message} (Code: ${uploadError.code || 'unknown'})`,
          senderType: 'user'
        }
      );
      
      throw uploadError;
    }
    
  } catch (error) {
    console.error('❌ Capacitor image upload error:', error);
    
    // Remove temporary message if it exists
    const tempMessages = booking.value.messages?.filter(msg => msg.isTemporary && msg.isUploading) || [];
    tempMessages.forEach(msg => {
      const index = booking.value.messages.findIndex(m => m.id === msg.id);
      if (index !== -1) {
        booking.value.messages.splice(index, 1);
      }
    });
    
    // Check if it's an authentication error and try to refresh
    if (error.message.includes('Authentication') || error.message.includes('auth') || error.message.includes('timeout')) {
      console.log(`📱 Authentication error detected, attempting to refresh auth...`);
      try {
        // Try to refresh the authentication
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          console.log(`📱 Refreshing authentication token...`);
          await currentUser.getIdToken(true); // Force refresh
          console.log(`📱 Authentication refreshed, retrying upload...`);
          
          // Retry the upload once
          return await handleImageUploadWithCapacitor();
        }
      } catch (refreshError) {
        console.error('📱 Failed to refresh authentication:', refreshError);
      }
    }
    
    // Send error message
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: '❌ Failed to upload image. Please try again.',
        senderType: 'user'
      }
    );
    
    throw error;
  }
};

// File-based image upload for web platforms
const handleImageUploadWithFile = async (file) => {
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

  // Compress image if it's too large (> 1MB)
  let fileToUpload = file;
  if (file.size > 1024 * 1024) {
    console.log('🌐 Compressing large image...');
    const compressedBlob = await compressImage(file, 0.7);
    fileToUpload = new File([compressedBlob], file.name, { type: 'image/jpeg' });
    console.log('🌐 Compressed file:', { 
      originalSize: file.size, 
      compressedSize: fileToUpload.size 
    });
  }

  try {
    console.log('🔍 ServiceBookingChat: Starting image upload...');
    
    // Ensure user is authenticated before uploading
    console.log('🌐 Ensuring user authentication before upload...');
    const { getAuth, signInAnonymously } = await import('firebase/auth');
    const auth = getAuth();
    
    // Check if user is authenticated
    let currentUser = auth.currentUser;
    console.log(`🌐 Current auth state:`, { 
      hasUser: !!currentUser, 
      userId: currentUser?.uid,
      isAnonymous: currentUser?.isAnonymous 
    });
    
    if (!currentUser) {
      console.log('🌐 No authenticated user, signing in anonymously...');
      try {
        const userCredential = await signInAnonymously(auth);
        currentUser = userCredential.user;
        console.log(`🌐 Anonymous sign-in successful:`, { 
          uid: currentUser.uid,
          isAnonymous: currentUser.isAnonymous 
        });
      } catch (authError) {
        console.error('🌐 Anonymous sign-in failed:', {
          code: authError.code,
          message: authError.message,
          stack: authError.stack
        });
        throw new Error(`Authentication failed: ${authError.message}`);
      }
    } else {
      console.log(`🌐 User already authenticated:`, { 
        uid: currentUser.uid,
        isAnonymous: currentUser.isAnonymous 
      });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `image_${timestamp}.${fileExtension}`;
    
    console.log('🌐 Uploading file:', {
      fileName: fileName,
      fileSize: fileToUpload.size,
      fileType: fileToUpload.type,
      userId: currentUser.uid
    });
    
    const fullPath = `projects/${projectStore.selectedProject.id}/serviceBookings/${bookingId}/images/${fileName}`;
    
    // Check if iOS and use REST API
    const isNative = Capacitor.isNativePlatform(); const platform = Capacitor.getPlatform()
    let imageUrl
    
    if (isNative && (platform === 'ios' || platform === 'android')) {
      console.log(`📱 ${platform} detected, using Storage REST API for service booking chat...`)
      
      // Convert file to ArrayBuffer
      const arrayBuffer = await fileToUpload.arrayBuffer()
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
      const bucket = 'pre-group.firebasestorage.app'
      const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(fullPath)}`
      
      const uploadResponse = await Http.request({
        url: uploadUrl,
        method: 'POST',
        headers: {
          'Content-Type': fileToUpload.type
        },
        data: base64,
        connectTimeout: 60000,
        readTimeout: 60000
      })
      
      if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
        imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(fullPath)}?alt=media`
        console.log(`📱 ${platform}: ✅ Image uploaded successfully`)
      } else {
        throw new Error(`Upload failed with status ${uploadResponse.status}`)
      }
    } else {
      // Use Web SDK for web and other platforms
      console.log('🌐 Using Firebase Web SDK for upload...')
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../boot/firebase');
      
      const fileRef = storageRef(storage, fullPath);
      const snapshot = await uploadBytes(fileRef, fileToUpload);
      imageUrl = await getDownloadURL(snapshot.ref);
    }
    
    console.log('✅ ServiceBookingChat: Image uploaded successfully:', imageUrl);
    
    // Remove the temporary upload message
    const tempIndex = booking.value.messages.findIndex(msg => msg.id === tempMessage.id);
    if (tempIndex !== -1) {
      booking.value.messages.splice(tempIndex, 1);
      console.log('🔍 ServiceBookingChat: Removed temporary upload message');
    }
    
    // Send the image message to the chat
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: `📎 ${file.name}`,
        senderType: 'user',
        imageUrl: imageUrl
      }
    );
    
    console.log('✅ ServiceBookingChat: Image message sent successfully');
  } catch (error) {
    console.error('❌ ServiceBookingChat: Error uploading image:', error);
    
    // Remove the temporary upload message on error
    const tempIndex = booking.value.messages.findIndex(msg => msg.id === tempMessage.id);
    if (tempIndex !== -1) {
      booking.value.messages.splice(tempIndex, 1);
      console.log('🔍 ServiceBookingChat: Removed temporary upload message due to error');
    }
    
    // Send an error message
    await serviceBookingService.addMessage(
      projectStore.selectedProject.id,
      bookingId,
      {
        text: '❌ Failed to upload image. Please try again.',
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

