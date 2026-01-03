import firestoreService from './firestoreService';
import fastCollectionService from './fastCollectionService';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { getStorage } from 'firebase/storage'
import { smartMirrorApp } from '../boot/smartMirrorFirebase'
const storage = getStorage(smartMirrorApp)

// Get all ads for a project (optimized)
export const getAds = async (projectId) => {
  try {
    console.log('🚀 AdsService: Getting ads for project:', projectId);
    const ads = await fastCollectionService.getAds(projectId);
    console.log('🚀 AdsService: Retrieved ads:', ads.length);
    return ads;
  } catch (error) {
    console.error('Error fetching ads:', error);
    throw error;
  }
};

// Get active ads for a project (for display) - optimized
export const getActiveAds = async (projectId) => {
  try {
    console.log('🚀 AdsService: Getting active ads for project:', projectId);
    const ads = await fastCollectionService.getAds(projectId);
    const activeAds = ads.filter(ad => ad.isActive).sort((a, b) => a.order - b.order);
    console.log('🚀 AdsService: Retrieved active ads:', activeAds.length);
    return activeAds;
  } catch (error) {
    console.error('Error fetching active ads:', error);
    throw error;
  }
};

// Create a new ad
export const createAd = async (projectId, adData) => {
  try {
    const adDoc = await firestoreService.addDoc(`projects/${projectId}/ads`, {
      ...adData,
      createdAt: firestoreService.serverTimestamp(),
      updatedAt: firestoreService.serverTimestamp()
    });
    
    return adDoc.id;
  } catch (error) {
    console.error('Error creating ad:', error);
    throw error;
  }
};

// Update an existing ad
export const updateAd = async (projectId, adId, updates) => {
  try {
    await firestoreService.updateDoc(`projects/${projectId}/ads/${adId}`, {
      ...updates,
      updatedAt: firestoreService.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    throw error;
  }
};

// Delete an ad
export const deleteAd = async (projectId, adId) => {
  try {
    // First get the ad to check if it has an image
    const adDoc = await firestoreService.getDoc(`projects/${projectId}/ads/${adId}`);
    
    if (adDoc.exists()) {
      const adData = adDoc.data();
      
      // Delete the image from storage if it exists
      if (adData.imageUrl) {
        try {
          const imageRef = ref(storage, adData.imageUrl);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.error('Error deleting image from storage:', storageError);
          // Continue with ad deletion even if image deletion fails
        }
      }
      
      // Delete the ad document
      await firestoreService.deleteDoc(`projects/${projectId}/ads/${adId}`);
    }
  } catch (error) {
    console.error('Error deleting ad:', error);
    throw error;
  }
};

// Upload ad image
export const uploadAdImage = async (projectId, file) => {
  try {
    const timestamp = Date.now();
    const fileName = `ads/ad_${timestamp}_${file.name}`;
    const storageRef = ref(storage, `projects/${projectId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: `projects/${projectId}/${fileName}`
    };
  } catch (error) {
    console.error('Error uploading ad image:', error);
    throw error;
  }
};

// Delete ad image from storage
export const deleteAdImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting ad image:', error);
    throw error;
  }
};

// Toggle ad active status
export const toggleAdStatus = async (projectId, adId, isActive) => {
  try {
    await firestoreService.updateDoc(`projects/${projectId}/ads/${adId}`, {
      isActive,
      updatedAt: firestoreService.serverTimestamp()
    });
  } catch (error) {
    console.error('Error toggling ad status:', error);
    throw error;
  }
};

// Update ad order
export const updateAdOrder = async (projectId, adId, newOrder) => {
  try {
    await firestoreService.updateDoc(`projects/${projectId}/ads/${adId}`, {
      order: newOrder,
      updatedAt: firestoreService.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating ad order:', error);
    throw error;
  }
};
