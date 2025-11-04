<template>
  <div class="guest-pass-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading Guest Pass...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#AF1E23" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="#AF1E23" stroke-width="2"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="#AF1E23" stroke-width="2"/>
      </svg>
      <h2>Pass Not Found</h2>
      <p>{{ error }}</p>
    </div>

    <!-- Success State - Show Pass -->
    <div v-else-if="pass" class="pass-container">
      <!-- Header -->
      <div class="pass-header">
        <img src="/default-logo.png" alt="PRE Group" class="logo" />
        <h1>PRE Group</h1>
        <p>Guest Pass</p>
      </div>

      <!-- Guest Info -->
      <div class="guest-info">
        <h2>{{ pass.guestName }}</h2>
        <p class="purpose">{{ pass.purpose || 'Guest Visit' }}</p>
      </div>

      <!-- QR Code -->
      <div class="qr-container">
        <img 
          v-if="pass.qrCodeUrl" 
          :src="pass.qrCodeUrl" 
          alt="Guest Pass QR Code"
          class="qr-image"
        />
        <canvas v-else ref="qrCanvas" class="qr-canvas"></canvas>
      </div>

      <!-- Pass Details -->
      <div class="pass-details">
        <div class="detail-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2"/>
          </svg>
          <div>
            <span class="label">Valid Until</span>
            <span class="value">{{ formatDateTime(pass.validUntil) }}</span>
          </div>
        </div>

        <div class="detail-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <div>
            <span class="label">Created</span>
            <span class="value">{{ formatDateTime(pass.createdAt) }}</span>
          </div>
        </div>

        <div class="detail-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/>
          </svg>
          <div>
            <span class="label">Invited by</span>
            <span class="value">{{ pass.userName }}</span>
          </div>
        </div>
      </div>

      <!-- Status Badge -->
      <div class="status-badge" :class="passStatus">
        <span v-if="isExpired">❌ Expired</span>
        <span v-else-if="pass.used">✅ Used</span>
        <span v-else-if="remainingTime">⏰ {{ remainingTime }}</span>
        <span v-else>✅ Active</span>
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <h3>Instructions</h3>
        <p>Please present this QR code at the main gate for entry. The security team will scan it for verification.</p>
        <p class="note">This pass is valid until {{ formatDateTime(pass.validUntil) }}</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>PRE Group Management System</p>
        <p class="small">This is an automated guest pass</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'
import firestoreService from '../../services/firestoreService'

defineOptions({
  name: 'GuestPassView'
})

const route = useRoute()
const loading = ref(true)
const error = ref(null)
const pass = ref(null)
const qrCanvas = ref(null)

// Get pass ID from route params
const passId = computed(() => route.params.passId)
const projectId = computed(() => route.params.projectId)

// Check if pass is expired
const isExpired = computed(() => {
  if (!pass.value?.validUntil) return false
  
  let expiryDate
  const dateValue = pass.value.validUntil
  
  // Handle Firestore Timestamp
  if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
    expiryDate = new Date(dateValue.seconds * 1000)
  } else {
    expiryDate = new Date(dateValue)
  }
  
  return new Date() > expiryDate
})

// Get remaining time
const remainingTime = computed(() => {
  if (!pass.value?.validUntil || isExpired.value || pass.value.used) return null
  
  const now = new Date()
  const dateValue = pass.value.validUntil
  
  let expiryDate
  // Handle Firestore Timestamp
  if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
    expiryDate = new Date(dateValue.seconds * 1000)
  } else {
    expiryDate = new Date(dateValue)
  }
  
  const remainingMs = expiryDate - now
  
  const hours = Math.floor(remainingMs / 3600000)
  const minutes = Math.floor((remainingMs % 3600000) / 60000)
  
  if (hours > 0) return `${hours}h ${minutes}m left`
  if (minutes > 0) return `${minutes}m left`
  return 'Expiring soon'
})

// Pass status class
const passStatus = computed(() => {
  if (isExpired.value) return 'expired'
  if (pass.value?.used) return 'used'
  return 'active'
})

// Format date/time for display
const formatDateTime = (dateValue) => {
  if (!dateValue) return 'Invalid date'
  
  let date
  
  // Handle Firestore Timestamp objects
  if (dateValue && typeof dateValue === 'object' && 'seconds' in dateValue) {
    date = new Date(dateValue.seconds * 1000)
  } 
  // Handle ISO strings or Date objects
  else {
    date = new Date(dateValue)
  }
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateValue)
    return 'Invalid date'
  }
  
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Load guest pass from Firestore
const loadGuestPass = async () => {
  try {
    loading.value = true
    error.value = null

    if (!passId.value || !projectId.value) {
      throw new Error('Invalid pass link. Please check the URL.')
    }

    console.log('📥 Loading guest pass:', passId.value, 'for project:', projectId.value)

    // Fetch pass from Firestore
    const passDoc = await firestoreService.getDoc(`projects/${projectId.value}/guestPasses/${passId.value}`)
    
    if (!passDoc.exists()) {
      throw new Error('Guest pass not found. It may have been deleted or the link is invalid.')
    }

    const passData = passDoc.data()
    
    console.log('🔍 Raw Firestore data:', {
      validUntil: passData.validUntil,
      validUntilType: typeof passData.validUntil,
      validUntilKeys: passData.validUntil ? Object.keys(passData.validUntil) : null,
      createdAt: passData.createdAt,
      createdAtType: typeof passData.createdAt
    })
    
    pass.value = {
      id: passId.value,
      projectId: projectId.value,
      guestName: passData.guestName,
      purpose: passData.purpose || 'Guest Visit',
      userName: passData.userName,
      validUntil: passData.validUntil,
      createdAt: passData.createdAt,
      used: passData.used || false,
      usedAt: passData.usedAt || null,
      qrCodeUrl: passData.qrCodeUrl || null,
    }

    console.log('✅ Guest pass loaded:', pass.value)

    // If no QR code URL, generate QR code on canvas
    if (!pass.value.qrCodeUrl && qrCanvas.value) {
      await generateQRCode()
    }

  } catch (err) {
    console.error('❌ Error loading guest pass:', err)
    error.value = err.message || 'Failed to load guest pass'
  } finally {
    loading.value = false
  }
}

// Generate QR code on canvas
const generateQRCode = async () => {
  try {
    const qrData = JSON.stringify({
      passId: pass.value.id,
      projectId: pass.value.projectId,
      guestName: pass.value.guestName,
      validUntil: pass.value.validUntil,
    })

    await QRCode.toCanvas(qrCanvas.value, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#231F20',
        light: '#FFFFFF',
      },
    })

    console.log('✅ QR code generated on canvas')
  } catch (err) {
    console.error('❌ Error generating QR code:', err)
  }
}

onMounted(() => {
  loadGuestPass()
})
</script>

<style scoped>
.guest-pass-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #AF1E23 0%, #231F20 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading-container,
.error-container {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
}

.loading-container .spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container svg {
  margin: 0 auto 20px;
}

.error-container h2 {
  color: #AF1E23;
  margin: 0 0 10px;
  font-size: 24px;
}

.error-container p {
  color: #666;
  margin: 0;
}

.pass-container {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 480px;
  width: 100%;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pass-header {
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  padding: 40px 30px;
  text-align: center;
  color: white;
}

.pass-header .logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  padding: 10px;
  margin: 0 auto 20px;
  display: block;
}

.pass-header h1 {
  margin: 0 0 5px;
  font-size: 28px;
  font-weight: 700;
}

.pass-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.guest-info {
  padding: 30px;
  text-align: center;
  border-bottom: 2px dashed #e0e0e0;
}

.guest-info h2 {
  margin: 0 0 10px;
  font-size: 32px;
  font-weight: 700;
  color: #231F20;
}

.guest-info .purpose {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.qr-container {
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.qr-image,
.qr-canvas {
  max-width: 300px;
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: white;
  padding: 15px;
}

.pass-details {
  padding: 30px;
  border-top: 2px dashed #e0e0e0;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row svg {
  flex-shrink: 0;
  color: #AF1E23;
  margin-top: 2px;
}

.detail-row > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-row .label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.detail-row .value {
  font-size: 16px;
  color: #231F20;
  font-weight: 500;
}

.status-badge {
  margin: 0 30px 20px;
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.expired {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.used {
  background: #e0e7ff;
  color: #3730a3;
}

.instructions {
  padding: 30px;
  background: #f9fafb;
  border-top: 2px dashed #e0e0e0;
}

.instructions h3 {
  margin: 0 0 15px;
  font-size: 18px;
  color: #231F20;
  font-weight: 700;
}

.instructions p {
  margin: 0 0 15px;
  color: #666;
  line-height: 1.6;
}

.instructions p:last-child {
  margin: 0;
}

.instructions .note {
  font-size: 14px;
  font-style: italic;
  color: #999;
}

.footer {
  padding: 30px;
  text-align: center;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
}

.footer p {
  margin: 0 0 5px;
  color: #666;
  font-size: 14px;
}

.footer p:last-child {
  margin: 0;
}

.footer .small {
  font-size: 12px;
  color: #999;
}

/* Responsive */
@media (max-width: 640px) {
  .pass-header h1 {
    font-size: 24px;
  }

  .guest-info h2 {
    font-size: 28px;
  }

  .qr-container {
    padding: 30px 20px;
  }

  .qr-image,
  .qr-canvas {
    max-width: 250px;
  }
}
</style>

