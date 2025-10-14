<template>
  <div class="access-page">

    <PageHeader :title="$t('gateAccess') || 'Gate Access'"
      :subtitle="$t('gateAccessDesc') || 'Control your gate and manage access passes'" />

    <!-- Tab Navigation -->
    <div class="tabs-container">
      <div class="tabs-nav">
        <button class="tab-btn" :class="{ active: activeTab === 'ble' }" @click="activeTab = 'ble'">
          <q-icon name="bluetooth" class="tab-icon" />
          <span class="tab-label">{{ $t('bleControl') || 'BLE Control' }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'passes' }" @click="activeTab = 'passes'">
          <q-icon name="qr_code" class="tab-icon" />
          <span class="tab-label">{{ $t('gatePasses') || 'Gate Passes' }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- BLE Gate Control Panel -->
      <div v-if="activeTab === 'ble'" class="ble-content">
        <div class="ble-control-section">
          <!-- Bluetooth Icon -->
          <div class="bluetooth-icon-container">
            <div class="bluetooth-icon" :class="{ connected: isConnected, connecting: isConnecting }">
              <q-icon name="bluetooth" size="48px" />
              <div v-if="isConnecting" class="pulse-ring"></div>
            </div>
          </div>

          <!-- Connection Status -->
          <div class="status-section">
            <div v-if="isConnected" class="status-indicator connected">
              <q-icon name="check_circle" size="20px" />
              <span>{{ $t('connected') || 'Connected' }}</span>
            </div>
            <div v-else-if="isConnecting" class="status-indicator connecting">
              <q-spinner-dots size="20px" color="primary" />
              <span>{{ $t('connecting') || 'Connecting...' }}</span>
            </div>
            <div v-else class="status-indicator disconnected">
              <q-icon name="cancel" size="20px" />
              <span>{{ $t('disconnected') || 'Disconnected' }}</span>
            </div>

            <!-- Device Name -->
            <div v-if="deviceName" class="device-name">
              <q-icon name="devices" size="16px" />
              <span>{{ deviceName }}</span>
            </div>

            <!-- Saved Device Hint -->
            <div v-if="lastConnectedDevice && !isConnected" class="saved-device-hint">
              <q-icon name="history" size="14px" />
              <span>{{ $t('lastDevice') || 'Last device' }}: {{ lastConnectedDevice.name }}</span>
            </div>
          </div>

          <!-- BLE Not Supported Warning -->
          <div v-if="!isBLESupported && bleChecked" class="warning-banner">
            <q-icon name="warning" size="24px" />
            <div class="warning-text">
              <strong>{{ $t('bleNotSupported') || 'Bluetooth Not Supported' }}</strong>
              <p>
                {{
                  $t('bleNotSupportedDesc') ||
                  'Your device or browser does not support Bluetooth Low Energy.'
                }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="button-group">
            <!-- Quick Open Button (Auto-connect and Open) -->
            <q-btn v-if="!isConnected && lastConnectedDevice" unelevated rounded color="positive" size="lg"
              class="action-button quick-action" :loading="autoConnecting || isOpening"
              :disable="autoConnecting || isOpening || (bleChecked && !isBLESupported)" @click="quickOpenGate">
              <q-icon name="flash_on" size="28px" left />
              {{ $t('quickOpen') || 'Quick Open Gate' }}
            </q-btn>

            <!-- Connect Button (First time or manual connection) -->
            <q-btn v-if="!isConnected && !lastConnectedDevice" unelevated rounded color="primary" size="lg"
              class="action-button" :loading="isConnecting" :disable="isConnecting || (bleChecked && !isBLESupported)"
              @click="handleConnect">
              <q-icon name="bluetooth_searching" size="24px" left />
              {{ $t('connect') || 'Connect to Gate' }}
            </q-btn>

            <!-- Open Gate Button (When already connected) -->
            <q-btn v-if="isConnected" unelevated rounded color="positive" size="lg" class="action-button"
              :loading="isOpening" :disable="isOpening" @click="handleOpenGate">
              <q-icon name="door_open" size="28px" left />
              {{ $t('openGate') || 'Open Gate' }}
            </q-btn>

            <!-- Secondary Actions Row -->
            <div v-if="isConnected || lastConnectedDevice" class="secondary-actions">
              <!-- Disconnect Button -->
              <q-btn v-if="isConnected" flat rounded color="negative" size="sm" class="secondary-button"
                @click="handleDisconnect">
                <q-icon name="bluetooth_disabled" size="18px" left />
                {{ $t('disconnect') || 'Disconnect' }}
              </q-btn>

              <!-- New Connection Button -->
              <q-btn v-if="lastConnectedDevice && !isConnected" flat rounded color="primary" size="sm"
                class="secondary-button" :loading="isConnecting" :disable="isConnecting" @click="handleConnect">
                <q-icon name="bluetooth_searching" size="18px" left />
                {{ $t('newConnection') || 'New Device' }}
              </q-btn>

              <!-- Forget Device Button -->
              <q-btn v-if="lastConnectedDevice && !isConnected" flat rounded color="grey" size="sm"
                class="secondary-button" @click="forgetDevice">
                <q-icon name="delete_outline" size="18px" left />
                {{ $t('forget') || 'Forget' }}
              </q-btn>
            </div>
          </div>

          <!-- Status Message -->
          <div v-if="statusMessage" class="status-message" :class="statusMessageType">
            <q-icon :name="statusMessageType === 'success' ? 'check_circle' : 'error'" size="20px" />
            <span>{{ statusMessage }}</span>
          </div>
        </div>
      </div>

      <!-- Gate Passes Panel -->
      <div v-if="activeTab === 'passes'" class="passes-content">
        <div class="passes-section">
          <!-- Generate Pass Button -->
          <div class="generate-section">
            <q-btn unelevated rounded color="primary" size="lg" class="generate-btn" :disable="passes.length >= 10"
              @click="showGenerateDialog = true">
              <q-icon name="add_circle" size="24px" left />
              {{ $t('generatePass') || 'Generate Pass' }} ({{ passes.length }}/10)
            </q-btn>
          </div>

          <!-- Passes List -->
          <div v-if="passes.length > 0" class="passes-list">
            <q-card v-for="pass in passes" :key="pass.id" class="pass-card">
              <q-card-section class="pass-content">
                <div class="pass-info">
                  <div class="pass-header">
                    <h3>{{ pass.guestName }}</h3>
                    <q-badge :color="pass.status === 'active' ? 'positive' : 'negative'" :label="pass.status" />
                  </div>
                  <div class="pass-details">
                    <div class="detail-row">
                      <q-icon name="event" size="16px" />
                      <span>{{ formatDate(pass.validUntil) }}</span>
                    </div>
                    <div class="detail-row">
                      <q-icon name="person" size="16px" />
                      <span>{{ pass.purpose }}</span>
                    </div>
                  </div>
                </div>
                <div class="pass-qr">
                  <canvas :ref="(el) => setQRRef(el, pass.id)" class="qr-canvas"></canvas>
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat color="primary" icon="share" @click="sharePass(pass)">
                  {{ $t('share') || 'Share' }}
                </q-btn>
                <q-btn flat color="negative" icon="delete" @click="deletePass(pass.id)">
                  {{ $t('delete') || 'Delete' }}
                </q-btn>
              </q-card-actions>
            </q-card>
          </div>

          <!-- No Passes Message -->
          <div v-else class="no-passes-message">
            <q-icon name="qr_code" size="64px" color="grey-5" />
            <h3>{{ $t('noPassesFound') || 'No Passes Found' }}</h3>
            <p>{{ $t('createFirstPass') || 'Create your first guest pass to get started' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Pass Dialog -->
    <q-dialog v-model="showGenerateDialog">
      <q-card class="generate-dialog">
        <q-card-section>
          <div class="text-h6">{{ $t('generateNewPass') || 'Generate New Pass' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="newPass.guestName" :label="$t('guestName') || 'Guest Name'" outlined class="q-mb-md" />
          <q-input v-model="newPass.purpose" :label="$t('purpose') || 'Purpose of Visit'" outlined class="q-mb-md" />
          <q-input v-model="newPass.validUntil" :label="$t('validUntil') || 'Valid Until'" outlined
            type="datetime-local" class="q-mb-md" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('cancel') || 'Cancel'" color="primary" v-close-popup />
          <q-btn unelevated :label="$t('generate') || 'Generate'" color="primary" @click="generatePass"
            :disable="!newPass.guestName || !newPass.validUntil" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Floating Quick Action Button (Shows on all tabs when device is saved) -->
    <q-page-sticky v-if="lastConnectedDevice && !isConnected && activeTab === 'ble'" position="bottom-right"
      :offset="[18, 18]">
      <q-btn fab icon="flash_on" color="positive" :loading="autoConnecting || isOpening"
        :disable="autoConnecting || isOpening" @click="quickOpenGate" class="fab-button">
        <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
          {{ $t('quickOpen') || 'Quick Open Gate' }}
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { useBluetooth } from '../../composables/useBluetooth'
import QRCode from 'qrcode'
import { Notify } from 'quasar'
import PageHeader from '../../components/PageHeader.vue'

// Component name for ESLint
defineOptions({
  name: 'AccessPage',
})

// Tab state
const activeTab = ref('ble')

// BLE Configuration
const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0'
const CHARACTERISTIC_UUID = 'abcdefab-cdef-1234-5678-abcdefabcdef'
const GATE_PASSWORD = 'OPEN123'

// Use the bluetooth composable
const {
  isConnected,
  isConnecting,
  isBLESupported,
  deviceName,
  checkBLESupport,
  connect,
  write,
  disconnect,
} = useBluetooth()

// BLE state
const isOpening = ref(false)
const statusMessage = ref('')
const statusMessageType = ref('') // 'success' or 'error'
const bleChecked = ref(false)
const autoConnecting = ref(false)
const lastConnectedDevice = ref(null)

// Passes state
const passes = ref([])
const showGenerateDialog = ref(false)
const newPass = ref({
  guestName: '',
  purpose: '',
  validUntil: '',
})

// QR refs storage
const qrRefs = new Map()

/**
 * BLE Functions
 */
const handleConnect = async () => {
  try {
    console.log('🔵 Starting BLE connection process...')
    statusMessage.value = ''

    const success = await connect(SERVICE_UUID)

    if (success) {
      console.log('✅ Successfully connected to gate device')

      // Save last connected device info
      lastConnectedDevice.value = {
        name: deviceName.value,
        serviceUUID: SERVICE_UUID,
        timestamp: Date.now(),
      }
      localStorage.setItem('lastGateDevice', JSON.stringify(lastConnectedDevice.value))

      statusMessage.value = 'Successfully connected to gate device'
      statusMessageType.value = 'success'

      setTimeout(() => {
        if (statusMessage.value === 'Successfully connected to gate device') {
          statusMessage.value = ''
        }
      }, 3000)
    } else {
      console.log('❌ Failed to connect to gate device')
      statusMessage.value = 'Failed to connect. Please try again.'
      statusMessageType.value = 'error'
    }
  } catch (error) {
    console.error('❌ Connection error:', error)
    statusMessage.value = error.message || 'Connection failed'
    statusMessageType.value = 'error'
  }
}

/**
 * Quick Open Gate - Connects and opens in one action
 * Uses saved device info for faster connection
 */
const quickOpenGate = async () => {
  try {
    autoConnecting.value = true
    statusMessage.value = 'Connecting to gate...'
    statusMessageType.value = 'info'

    // Connect to device
    const connected = await connect(SERVICE_UUID)

    if (!connected) {
      autoConnecting.value = false
      statusMessage.value = 'Failed to connect. Please try again.'
      statusMessageType.value = 'error'
      return
    }

    // Immediately send open command
    isOpening.value = true
    statusMessage.value = 'Opening gate...'

    const success = await write(SERVICE_UUID, CHARACTERISTIC_UUID, GATE_PASSWORD)

    if (success) {
      console.log('✅ Gate opened via quick action')
      statusMessage.value = 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'

      // Auto-disconnect after 3 seconds
      setTimeout(async () => {
        await disconnect()
        statusMessage.value = ''
      }, 3000)
    } else {
      statusMessage.value = 'Failed to open gate. Please try again.'
      statusMessageType.value = 'error'
    }
  } catch (error) {
    console.error('❌ Quick open error:', error)
    statusMessage.value = error.message || 'Quick open failed'
    statusMessageType.value = 'error'
  } finally {
    autoConnecting.value = false
    isOpening.value = false
  }
}

/**
 * Forget the last connected device
 */
const forgetDevice = () => {
  lastConnectedDevice.value = null
  localStorage.removeItem('lastGateDevice')

  Notify.create({
    type: 'info',
    message: 'Device forgotten. You can connect to a new device.',
    position: 'top',
    timeout: 2000,
  })
}

const handleDisconnect = async () => {
  console.log('🔌 Disconnecting from gate device...')
  statusMessage.value = ''
  await disconnect()
}

const handleOpenGate = async () => {
  try {
    isOpening.value = true
    statusMessage.value = ''

    console.log('🚪 Sending open gate command...')

    const success = await write(SERVICE_UUID, CHARACTERISTIC_UUID, GATE_PASSWORD)

    if (success) {
      console.log('✅ Gate command sent successfully')
      statusMessage.value = 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'

      setTimeout(() => {
        if (statusMessage.value.includes('Gate opened successfully')) {
          statusMessage.value = ''
        }
      }, 5000)
    } else {
      console.log('❌ Failed to send gate command')
      statusMessage.value = 'Failed to open gate. Please try again.'
      statusMessageType.value = 'error'
    }
  } catch (error) {
    console.error('❌ Error opening gate:', error)
    statusMessage.value = error.message || 'Failed to open gate'
    statusMessageType.value = 'error'
  } finally {
    isOpening.value = false
  }
}

/**
 * Pass Management Functions
 */
const setQRRef = (el, passId) => {
  if (el) {
    qrRefs.set(passId, el)
  }
}

const generatePass = async () => {
  try {
    const pass = {
      id: Date.now().toString(),
      guestName: newPass.value.guestName,
      purpose: newPass.value.purpose || 'Guest Visit',
      validUntil: new Date(newPass.value.validUntil).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      code: `GATE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    }

    passes.value.push(pass)

    // Save to localStorage
    localStorage.setItem('gatePasses', JSON.stringify(passes.value))

    // Reset form
    newPass.value = {
      guestName: '',
      purpose: '',
      validUntil: '',
    }

    showGenerateDialog.value = false

    // Generate QR code after dialog closes
    await nextTick()
    await generateQRCode(pass)

    Notify.create({
      type: 'positive',
      message: 'Pass generated successfully',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('Error generating pass:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to generate pass',
      position: 'top',
      timeout: 3000,
    })
  }
}

const generateQRCode = async (pass) => {
  try {
    const canvas = qrRefs.get(pass.id)
    if (!canvas) {
      console.warn('⚠️ Canvas not found for pass:', pass.id)
      return
    }

    const qrData = JSON.stringify({
      code: pass.code,
      guestName: pass.guestName,
      validUntil: pass.validUntil,
    })

    console.log('📱 Generating QR code for:', pass.guestName)

    await QRCode.toCanvas(canvas, qrData, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    console.log('✅ QR code generated successfully for:', pass.guestName)
  } catch (error) {
    console.error('❌ Error generating QR code for pass:', pass.id, error)
    // Don't throw - just log the error
  }
}

const deletePass = (passId) => {
  passes.value = passes.value.filter((p) => p.id !== passId)
  localStorage.setItem('gatePasses', JSON.stringify(passes.value))
  qrRefs.delete(passId)

  Notify.create({
    type: 'info',
    message: 'Pass deleted',
    position: 'top',
    timeout: 2000,
  })
}

const sharePass = async (pass) => {
  const canvas = qrRefs.get(pass.id)
  if (!canvas) {
    console.error('Canvas not found for pass:', pass.id)
    Notify.create({
      type: 'negative',
      message: 'QR code not ready. Please try again.',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  try {
    if (Capacitor.isNativePlatform()) {
      // For native platforms, use Capacitor Share API
      const dataUrl = canvas.toDataURL('image/png')

      try {
        await Share.share({
          title: `Gate Pass for ${pass.guestName}`,
          text: `Gate Pass Code: ${pass.code}\nValid until: ${formatDate(pass.validUntil)}`,
          url: dataUrl,
          dialogTitle: 'Share Gate Pass',
        })

        Notify.create({
          type: 'positive',
          message: 'Pass shared successfully',
          position: 'top',
          timeout: 2000,
        })
      } catch (shareError) {
        // If Share plugin fails, fallback to download
        console.warn('Share plugin failed, falling back to download:', shareError)
        downloadQRCode(canvas, pass.guestName)
      }
    } else {
      // For web, download the QR code
      downloadQRCode(canvas, pass.guestName)
    }
  } catch (error) {
    console.error('Error sharing pass:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to share pass. Please try again.',
      position: 'top',
      timeout: 3000,
    })
  }
}

const downloadQRCode = (canvas, guestName) => {
  try {
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `gate-pass-${guestName.replace(/\s+/g, '-')}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    Notify.create({
      type: 'positive',
      message: 'QR code downloaded',
      position: 'top',
      timeout: 2000,
    })
  } catch (error) {
    console.error('Error downloading QR code:', error)
    throw error
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Initialize
onMounted(async () => {
  console.log('🚀 AccessPage mounted')

  try {
    // Check BLE support
    await checkBLESupport()
    bleChecked.value = true
    console.log('✅ BLE support check completed')
  } catch (error) {
    console.error('❌ Error checking BLE support:', error)
    bleChecked.value = true
    // Continue anyway - BLE is optional
  }

  try {
    // Load last connected device for quick reconnection
    const savedDevice = localStorage.getItem('lastGateDevice')
    if (savedDevice) {
      lastConnectedDevice.value = JSON.parse(savedDevice)
      console.log('✅ Loaded last connected device:', lastConnectedDevice.value.name)
    }
  } catch (error) {
    console.error('❌ Error loading last device:', error)
    lastConnectedDevice.value = null
  }

  try {
    // Load saved passes
    const savedPasses = localStorage.getItem('gatePasses')
    if (savedPasses) {
      passes.value = JSON.parse(savedPasses)
      console.log(`✅ Loaded ${passes.value.length} saved passes`)

      // Generate QR codes for loaded passes
      await nextTick()
      for (const pass of passes.value) {
        try {
          await generateQRCode(pass)
        } catch (qrError) {
          console.error('❌ Error generating QR for pass:', pass.id, qrError)
          // Continue with other passes
        }
      }
    } else {
      console.log('ℹ️ No saved passes found')
    }
  } catch (error) {
    console.error('❌ Error loading passes:', error)
    // Reset passes on error
    passes.value = []
  }
})
</script>

<style scoped>
.access-page {
  min-height: 100vh;
  background: #fafafa;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Tabs Navigation */
.tabs-container {
  margin-bottom: 24px;
}

.tabs-nav {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #666;
}

.tab-btn.active {
  background: #AF1E23;
  color: white;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 14px;
}

/* Tab Content */
.tab-content {
  min-height: 300px;
}

.ble-content,
.passes-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* BLE Control Panel */
.ble-content {
  padding: 0;
}

.ble-control-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.bluetooth-icon-container {
  position: relative;
  margin-bottom: 8px;
}

.bluetooth-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  transition: all 0.3s ease;
  position: relative;
}

.bluetooth-icon.connected {
  background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%);
  color: #2e7d32;
}

.bluetooth-icon.connecting {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #1976d2;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    width: 100px;
    height: 100px;
    opacity: 1;
  }

  100% {
    width: 150px;
    height: 150px;
    opacity: 0;
  }
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
}

.status-indicator.connected {
  background: #c8e6c9;
  color: #2e7d32;
}

.status-indicator.connecting {
  background: #fff3e0;
  color: #e65100;
}

.status-indicator.disconnected {
  background: #ffcdd2;
  color: #c62828;
}

.device-name {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.saved-device-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1976d2;
  font-size: 0.85rem;
  padding: 6px 12px;
  background: #e3f2fd;
  border-radius: 8px;
  font-weight: 500;
}

.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #fff3e0;
  border: 2px solid #ffb74d;
  border-radius: 12px;
  width: 100%;
  color: #e65100;
}

.warning-text strong {
  display: block;
  margin-bottom: 4px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 400px;
}

.action-button {
  width: 100%;
  padding: 16px 32px;
  font-size: 1rem;
  font-weight: 600;
}

.action-button.quick-action {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
  position: relative;
  overflow: hidden;
}

.action-button.quick-action::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition:
    width 0.6s,
    height 0.6s;
}

.action-button.quick-action:active::before {
  width: 300px;
  height: 300px;
}

.secondary-actions {
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}

.secondary-button {
  padding: 8px 16px;
  font-size: 0.85rem;
}

.status-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  font-weight: 500;
  width: 100%;
  max-width: 400px;
}

.status-message.success {
  background: #c8e6c9;
  color: #2e7d32;
}

.status-message.error {
  background: #ffcdd2;
  color: #c62828;
}

.status-message.info {
  background: #e3f2fd;
  color: #1976d2;
}

/* Passes Panel */
.passes-content {
  padding: 0;
}

.passes-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.generate-section {
  display: flex;
  justify-content: center;
}

.generate-btn {
  width: 100%;
  max-width: 400px;
  padding: 16px 32px;
  font-size: 1rem;
  font-weight: 600;
}

.passes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.pass-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pass-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.pass-info {
  flex: 1;
}

.pass-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pass-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.pass-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.pass-qr {
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-canvas {
  border-radius: 8px;
  background: white;
  padding: 4px;
}

.no-passes-message {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.no-passes-message h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #666;
  margin: 16px 0 8px 0;
}

.no-passes-message p {
  color: #999;
  margin: 0;
}

.generate-dialog {
  min-width: 400px;
}

/* Floating Action Button */
.fab-button {
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.5);
  animation: pulse-fab 2s ease-in-out infinite;
}

@keyframes pulse-fab {

  0%,
  100% {
    box-shadow: 0 8px 24px rgba(76, 175, 80, 0.5);
  }

  50% {
    box-shadow: 0 12px 32px rgba(76, 175, 80, 0.7);
  }
}

/* Mobile app - hover effects disabled */
/* .fab-button:hover {
  transform: scale(1.05);
} */

/* Responsive Design */
@media (max-width: 768px) {

  .tab-btn {
    padding: 10px 12px;
  }

  .tab-icon {
    font-size: 14px;
  }

  .tab-label {
    font-size: 13px;
  }

  .ble-control-section {
    padding: 24px 16px;
  }

  .bluetooth-icon {
    width: 90px;
    height: 90px;
  }

  .passes-list {
    grid-template-columns: 1fr;
  }

  .generate-dialog {
    min-width: 90vw;
  }
}

@media (max-width: 480px) {
  .tab-btn {
    padding: 8px 10px;
    gap: 6px;
  }

  .tab-icon {
    font-size: 16px;
  }

  .tab-label {
    display: none;
  }
}
</style>
