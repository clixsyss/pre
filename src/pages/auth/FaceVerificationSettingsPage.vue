<template>
  <div class="face-verification-settings-page">
    <FaceVerification
      :auto-start="true"
      :required="false"
      :submission-error="submissionError"
      @complete="handleVerificationComplete"
      @cancel="handleCancel"
      @skip="handleSkip"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notifications'
import { useProjectStore } from '../../stores/projectStore'
import FaceVerification from '../../components/FaceVerification.vue'
import {
  prepareEnrollment,
  allocateEnrollId,
  getEnrollmentTargets,
  enrollViaMqtt,
  enrollmentErrorMessage,
  enrollmentQueuedMessage,
  isQueueableError,
  enqueueEnrollmentItem,
  notifyFaceEnrollmentRejected,
} from '../../services/faceEnrollmentService'
import { getUserById, getUserByAuthUid, updateUser } from '../../services/dynamoDBUsersService'
import optimizedAuthService from '../../services/optimizedAuthService'

defineOptions({ name: 'FaceVerificationSettingsPage' })

const router = useRouter()
const notificationStore = useNotificationStore()
const projectStore = useProjectStore()
const submissionError = ref(false)

const userProjects = computed(() => projectStore.userProjects || [])

async function handleVerificationComplete(data) {
  try {
    if (data.skipped) {
      notificationStore.showInfo('Face verification skipped. You can complete it later from profile settings.')
      router.back()
      return
    }

    const img_b64 = data.img_b64
    if (!img_b64) {
      notificationStore.showError('Face image is required. Please capture or upload a photo.')
      submissionError.value = true
      return
    }

    const currentUser = await optimizedAuthService.getCurrentUser()
    if (!currentUser) {
      notificationStore.showError('You must be logged in to save Face ID. Please log in again.')
      router.push('/sign-in')
      return
    }

    const cognitoSub =
      currentUser?.attributes?.sub ||
      currentUser?.cognitoAttributes?.sub ||
      currentUser?.userSub ||
      currentUser?.uid
    if (!cognitoSub) {
      notificationStore.showError('User ID not found. Please try again.')
      submissionError.value = true
      return
    }

    let userData = await getUserByAuthUid(cognitoSub)
    if (!userData) userData = await getUserById(cognitoSub)
    if (!userData?.id) {
      notificationStore.showError('User data not found. Please try again.')
      submissionError.value = true
      return
    }

    const userId = userData.id
    const enrollId = allocateEnrollId()
    if (!enrollId) {
      notificationStore.showError("We couldn't register your photo right now. Please try again.")
      submissionError.value = true
      return
    }
    const userName =
      userData.fullName ||
      [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim() ||
      'User'

    const { payload, error } = prepareEnrollment({ enrollId, userName, img_b64 })
    if (error) {
      notificationStore.showError(error)
      submissionError.value = true
      return
    }

    submissionError.value = false

    const targets = getEnrollmentTargets(userProjects.value)
    const existingDocs = userData?.documents || {}
    let faceEnrollments = { ...(existingDocs.faceEnrollments || {}) }
    let atLeastOneSuccess = false
    let lastErrorReason = null
    let queuedCount = 0
    let hadReplyFailed = false

    for (const target of targets) {
      const { success, error: errReason } = await enrollViaMqtt({
        brokerWsUrl: target.brokerWsUrl,
        deviceSn: target.deviceSn,
        payload,
        enrollId,
      })
      if (success) {
        atLeastOneSuccess = true
        const mqttClusterId = target.brokerWsUrl ? new URL(target.brokerWsUrl).host : ''
        faceEnrollments[target.projectId] = {
          enrollId,
          deviceSn: target.deviceSn,
          mqttClusterId,
          enrolledAt: new Date().toISOString(),
        }
      } else {
        if (isQueueableError(errReason)) {
          enqueueEnrollmentItem({
            enrollId,
            userName,
            record: img_b64,
            projectId: target.projectId,
            deviceSn: target.deviceSn,
            brokerWsUrl: target.brokerWsUrl,
            userId,
            flow: 'profile',
          })
          queuedCount += 1
        } else {
          lastErrorReason = errReason || lastErrorReason
          if (errReason === 'reply_failed') hadReplyFailed = true
        }
      }
    }

    if (hadReplyFailed) {
      notifyFaceEnrollmentRejected({
        userId,
        projectId: targets[0]?.projectId || 'default',
        url: '/profile/face-verification',
      })
    }

    if (!atLeastOneSuccess) {
      if (queuedCount > 0) {
        notificationStore.showSuccess(enrollmentQueuedMessage())
        setTimeout(() => router.back(), 800)
      } else {
        notificationStore.showError(enrollmentErrorMessage(lastErrorReason))
        submissionError.value = true
      }
      return
    }

    const updatedDocuments = {
      ...existingDocs,
      faceEnrollments,
      faceEnrolledAt: new Date().toISOString(),
    }
    await updateUser(userId, { documents: updatedDocuments })

    const successMsg =
      queuedCount > 0
        ? "Face ID saved successfully! We'll send the rest when those devices are available."
        : 'Face ID saved successfully!'
    notificationStore.showSuccess(successMsg)
    if (typeof window !== 'undefined') {
      if (window.__profileCache) window.__profileCache = null
      try {
        sessionStorage.removeItem('profilePage_cache')
      } catch {
        /* ignore */
      }
    }
    setTimeout(() => router.back(), 800)
  } catch (e) {
    console.error('[FaceVerificationSettingsPage] Enrollment failed:', e)
    notificationStore.showError('Something went wrong. Please try again.')
    submissionError.value = true
  }
}

function handleCancel() {
  router.back()
}

function handleSkip() {
  notificationStore.showInfo('Face verification skipped. You can complete it later from profile settings.')
  router.back()
}
</script>

<style scoped>
.face-verification-settings-page {
  width: 100%;
}
</style>
