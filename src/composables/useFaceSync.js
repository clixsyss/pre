/**
 * Composable for the face image sync flow (S3 + FaceSyncQueue + MQTT).
 * Use this when you want to register a face for sync to devices; does NOT
 * replace the existing face enrollment flow (aiface/setuserinfo).
 */

import { ref } from 'vue'
import {
  registerFaceImage,
  faceRegisteredSuccessMessage,
  faceSavedOfflineMessage,
  faceSyncErrorMessage,
} from '../services/faceSyncService'

export function useFaceSync() {
  const loading = ref(false)
  const errorMessage = ref(null)

  /**
   * Register a face image: S3 upload → user faces → try MQTT → enqueue only on failure.
   * @param {Object} opts - { userId, file, projectId? }
   * @returns {Promise<{ success: boolean, userMessage: string, faceId?: string, imageUrl?: string, queueIds?: string[] }>}
   */
  async function registerFace(opts) {
    loading.value = true
    errorMessage.value = null
    try {
      const result = await registerFaceImage(opts)
      loading.value = false
      return {
        success: true,
        userMessage: result.userMessage ?? faceRegisteredSuccessMessage(),
        faceId: result.faceId,
        imageUrl: result.imageUrl,
        queueIds: result.queueIds ?? [],
      }
    } catch (err) {
      loading.value = false
      const message = err?.message && !err.message.includes('credentials') && !err.message.includes('S3')
        ? err.message
        : faceSyncErrorMessage()
      errorMessage.value = message
      return {
        success: false,
        userMessage: message,
      }
    }
  }

  return {
    loading,
    errorMessage,
    registerFace,
    messages: {
      success: faceRegisteredSuccessMessage,
      offline: faceSavedOfflineMessage,
      error: faceSyncErrorMessage,
    },
  }
}
