<template>
  <div class="face-verification-page">
    <FaceVerification
      :required="true"
      :submission-error="submissionError"
      @complete="handleVerificationComplete"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '../../stores/registration'
import { useNotificationStore } from '../../stores/notifications'
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

defineOptions({ name: 'FaceVerificationPage' })

const router = useRouter()
const registrationStore = useRegistrationStore()
const notificationStore = useNotificationStore()
const submissionError = ref(false)

async function handleVerificationComplete(data) {
  try {
    if (data.skipped) {
      notificationStore.showError(
        'Face verification is required to complete registration. Please complete it to continue.'
      )
      return
    }

    const img_b64 = data.img_b64
    if (!img_b64) {
      notificationStore.showError('Face image is required. Please capture or upload a photo.')
      return
    }

    const userId =
      registrationStore.firestoreUserId ||
      registrationStore.tempUserId ||
      registrationStore.personalData?.email ||
      ''
    const enrollId = allocateEnrollId()
    if (!enrollId) {
      notificationStore.showError("We couldn't register your photo right now. Please try again.")
      submissionError.value = true
      return
    }
    const userName = [
      registrationStore.userDetails?.firstName,
      registrationStore.userDetails?.lastName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || 'User'

    const { payload, error } = prepareEnrollment({ enrollId, userName, img_b64 })
    if (error) {
      notificationStore.showError(error)
      submissionError.value = true
      return
    }

    submissionError.value = false

    const targets = getEnrollmentTargets([])
    const enrollmentResults = []
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
        const mqttClusterId = target.brokerWsUrl ? new URL(target.brokerWsUrl).host : ''
        enrollmentResults.push({
          projectId: target.projectId,
          enrollId,
          deviceSn: target.deviceSn,
          mqttClusterId,
          enrolledAt: new Date().toISOString(),
        })
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
            flow: 'registration',
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
        url: '/register/face-verification',
      })
    }

    if (enrollmentResults.length === 0) {
      if (queuedCount > 0) {
        registrationStore.setFaceEnrollmentCompleted(true)
        registrationStore.setFaceEnrollmentResults([])
        notificationStore.showSuccess(enrollmentQueuedMessage())
        setTimeout(() => router.push('/register'), 800)
      } else {
        notificationStore.showError(enrollmentErrorMessage(lastErrorReason))
        submissionError.value = true
      }
      return
    }

    registrationStore.setFaceEnrollmentCompleted(true)
    registrationStore.setFaceEnrollmentResults(enrollmentResults)
    const successMsg =
      queuedCount > 0
        ? "Face verification completed! We'll send the rest when those devices are available."
        : 'Face verification completed and saved!'
    notificationStore.showSuccess(successMsg)
    setTimeout(() => router.push('/register'), 800)
  } catch (e) {
    console.error('[FaceVerificationPage] Enrollment failed:', e)
    notificationStore.showError('Something went wrong. Please try again.')
    submissionError.value = true
  }
}

function handleCancel() {
  router.push('/register/personal-details')
}
</script>

<style scoped>
.face-verification-page {
  width: 100%;
  padding: 20px;
}
</style>
