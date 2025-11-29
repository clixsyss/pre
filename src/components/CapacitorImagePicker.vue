<template>
  <div class="capacitor-image-picker">
    <q-btn
      :loading="uploading"
      :disable="uploading"
      color="primary"
      icon="camera_alt"
      @click="pickImage"
      class="full-width"
    >
      {{ uploading ? 'Uploading...' : 'Pick Image' }}
    </q-btn>
    
    <div v-if="uploadedImageUrl" class="q-mt-md">
      <q-img
        :src="uploadedImageUrl"
        style="max-width: 200px; max-height: 200px"
        class="rounded-borders"
      />
      <div class="q-mt-sm text-caption">
        Uploaded: {{ uploadedImageUrl }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../boot/firebase';

// Component name for ESLint
defineOptions({
  name: 'CapacitorImagePicker'
});

// Props
const props = defineProps({
  storagePath: {
    type: String,
    required: true
  },
  onImageUploaded: {
    type: Function,
    default: () => {}
  }
});

// Emits
const emit = defineEmits(['image-uploaded', 'upload-error']);

// Reactive state
const uploading = ref(false);
const uploadedImageUrl = ref('');

// Generate unique filename with timestamp and correct extension
const generateFileName = (mimeType) => {
  const timestamp = Date.now();
  const extension = mimeType.includes('png') ? 'png' : 'jpg';
  return `image_${timestamp}.${extension}`;
};


// Convert base64 to Blob
const base64ToBlob = (base64Data, mimeType) => {
  try {
    // Remove data URL prefix if present
    const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    
    // Convert base64 to binary
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch (error) {
    console.error('❌ Error converting base64 to blob:', error);
    throw new Error('Failed to convert image data');
  }
};

// Upload image to Firebase Storage
const uploadToFirebase = async (blob, fileName, mimeType) => {
  try {
    console.log('📱 Uploading to Firebase Storage:', { fileName, mimeType, size: blob.size });
    
    // Create storage reference
    const fullPath = `${props.storagePath}${fileName}`;
    const fileRef = storageRef(storage, fullPath);
    
    console.log('📱 Storage reference created:', fullPath);
    
    // Upload blob to Firebase Storage
    const snapshot = await uploadBytes(fileRef, blob);
    console.log('📱 Upload completed, getting download URL...');
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('📱 Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading to Firebase:', error);
    throw new Error('Failed to upload image to storage');
  }
};

// Main image picking and upload function
const pickImage = async () => {
  if (uploading.value) return;
  
  try {
    uploading.value = true;
    uploadedImageUrl.value = '';
    
    console.log('📱 Starting image picker...');
    
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      throw new Error('This component only works on native platforms');
    }
    
    // Take/select photo using Capacitor Camera
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl, // Use DataUrl for better iOS compatibility
      source: CameraSource.Prompt // Let user choose camera or photo library
    });
    
    console.log('📱 Image selected:', image);
    
    if (!image.dataUrl) {
      throw new Error('No image selected');
    }
    
    // Extract base64 data from dataUrl
    const base64Data = image.dataUrl.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    console.log('📱 Base64 data extracted, length:', base64Data.length);
    
    // Generate filename
    const mimeType = image.format ? `image/${image.format}` : 'image/jpeg';
    const fileName = generateFileName(mimeType);
    
    console.log('📱 Generated filename:', fileName);
    
    // Convert base64 to Blob
    const blob = base64ToBlob(base64Data, mimeType);
    console.log('📱 Blob created:', { size: blob.size, type: blob.type });
    
    // Upload to Firebase Storage
    const downloadURL = await uploadToFirebase(blob, fileName, mimeType);
    
    // Update state
    uploadedImageUrl.value = downloadURL;
    
    // Emit events
    emit('image-uploaded', {
      url: downloadURL,
      fileName: fileName,
      mimeType: mimeType,
      size: blob.size
    });
    
    // Call parent callback if provided
    if (props.onImageUploaded) {
      props.onImageUploaded({
        url: downloadURL,
        fileName: fileName,
        mimeType: mimeType,
        size: blob.size
      });
    }
    
    console.log('✅ Image upload completed successfully');
    
  } catch (error) {
    console.error('❌ Image picker error:', error);
    
    // Emit error event
    emit('upload-error', error);
    
    // Show user-friendly error message
    const errorMessage = error.message || 'Failed to pick and upload image';
    console.error('❌ User error:', errorMessage);
    
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.capacitor-image-picker {
  width: 100%;
}

.rounded-borders {
  border-radius: 8px;
}
</style>
