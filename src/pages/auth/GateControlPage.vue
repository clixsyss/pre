<template>
  <div class="gate-control-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>{{ $t('gateControl') || 'Gate Control' }}</h1>
      <p>{{ $t('gateControlDesc') || 'Connect to your BLE gate device and control access' }}</p>
    </div>

    <!-- Main Card -->
    <div class="control-card">
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
      </div>

      <!-- BLE Not Supported Warning -->
      <div v-if="!isBLESupported && bleChecked" class="warning-banner">
        <q-icon name="warning" size="24px" />
        <div class="warning-text">
          <strong>{{ $t('bleNotSupported') || 'Bluetooth Not Supported' }}</strong>
          <p>
            {{
              $t('bleNotSupportedDesc') ||
              'Your device does not support Bluetooth Low Energy. Please use a compatible device or enable Bluetooth.'
            }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="button-group">
        <!-- Connect Button -->
        <q-btn
          v-if="!isConnected"
          unelevated
          rounded
          color="primary"
          size="lg"
          class="action-button"
          :loading="isConnecting"
          :disable="isConnecting || (bleChecked && !isBLESupported)"
          @click="handleConnect"
        >
          <q-icon name="bluetooth_searching" size="24px" left />
          {{ $t('connect') || 'Connect to Gate' }}
        </q-btn>

        <!-- Open Gate Button -->
        <q-btn
          v-if="isConnected"
          unelevated
          rounded
          color="positive"
          size="lg"
          class="action-button"
          :loading="isOpening"
          :disable="isOpening"
          @click="handleOpenGate"
        >
          <q-icon name="door_open" size="24px" left />
          {{ $t('openGate') || 'Open Gate' }}
        </q-btn>

        <!-- Disconnect Button -->
        <q-btn
          v-if="isConnected"
          flat
          rounded
          color="negative"
          size="md"
          class="secondary-button"
          @click="handleDisconnect"
        >
          <q-icon name="bluetooth_disabled" size="20px" left />
          {{ $t('disconnect') || 'Disconnect' }}
        </q-btn>
      </div>

      <!-- Status Message -->
      <div v-if="statusMessage" class="status-message" :class="statusMessageType">
        <q-icon :name="statusMessageType === 'success' ? 'check_circle' : 'error'" size="20px" />
        <span>{{ statusMessage }}</span>
      </div>

      <!-- Info Section -->
      <div class="info-section">
        <q-expansion-item
          icon="info"
          :label="$t('howToUse') || 'How to Use'"
          header-class="text-primary"
        >
          <q-card class="info-card">
            <q-card-section>
              <ol class="instructions-list">
                <li>{{ $t('instruction1') || 'Make sure Bluetooth is enabled on your device' }}</li>
                <li>
                  {{ $t('instruction2') || 'Tap "Connect to Gate" to scan for nearby BLE devices' }}
                </li>
                <li>{{ $t('instruction3') || 'Select your gate device from the list' }}</li>
                <li>
                  {{
                    $t('instruction4') ||
                    'Once connected, tap "Open Gate" to send the unlock command'
                  }}
                </li>
                <li>
                  {{ $t('instruction5') || 'Wait for confirmation that the gate has opened' }}
                </li>
              </ol>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>

      <!-- Technical Details (for debugging) -->
      <div v-if="showDebug" class="debug-section">
          <q-expansion-item icon="bug_report" :label="$t('debugInfo')" header-class="text-grey">
          <q-card class="debug-card">
            <q-card-section>
              <div class="debug-info">
                <p><strong>{{ $t('platform') }}:</strong> {{ platform }}</p>
                <p><strong>{{ $t('bleSupported') }}:</strong> {{ isBLESupported }}</p>
                <p><strong>{{ $t('connected') }}:</strong> {{ isConnected }}</p>
                <p><strong>{{ $t('device') }}:</strong> {{ deviceName || $t('none') }}</p>
                <p><strong>{{ $t('serviceUuid') }}:</strong> {{ SERVICE_UUID }}</p>
                <p><strong>{{ $t('characteristicUuid') }}:</strong> {{ CHARACTERISTIC_UUID }}</p>
                <p><strong>{{ $t('lastError') }}:</strong> {{ lastError || $t('none') }}</p>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useBluetooth } from '../../composables/useBluetooth'

// Component name for ESLint
defineOptions({
  name: 'GateControlPage',
})

// BLE Configuration
// These UUIDs should match your ESP32 BLE server configuration
const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0'
const CHARACTERISTIC_UUID = 'abcdefab-cdef-1234-5678-abcdefabcdef'
const GATE_PASSWORD = 'OPEN123' // The password/command to send to the gate

// Use the bluetooth composable
const {
  isConnected,
  isConnecting,
  isBLESupported,
  deviceName,
  lastError,
  checkBLESupport,
  connect,
  write,
  disconnect,
} = useBluetooth()

// Local state
const isOpening = ref(false)
const statusMessage = ref('')
const statusMessageType = ref('') // 'success' or 'error'
const bleChecked = ref(false)
const showDebug = ref(false) // Set to true to show debug info

// Platform info
const platform = computed(() => {
  return Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web'
})

/**
 * Step 1: Connect to the BLE gate device
 * Scans for nearby BLE devices and connects to the one selected by the user
 */
const handleConnect = async () => {
  try {
    console.log('🔵 Starting BLE connection process...')
    statusMessage.value = ''

    // Connect to device with the specified service UUID
    const success = await connect(SERVICE_UUID)

    if (success) {
      console.log('✅ Successfully connected to gate device')
      statusMessage.value = 'Successfully connected to gate device'
      statusMessageType.value = 'success'

      // Clear success message after 3 seconds
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
 * Step 2: Disconnect from the BLE gate device
 * Safely disconnects from the current device
 */
const handleDisconnect = async () => {
  console.log('🔌 Disconnecting from gate device...')
  statusMessage.value = ''
  await disconnect()
}

/**
 * Step 3: Send "Open Gate" command to the ESP32
 * Writes the password/command to the BLE characteristic
 */
const handleOpenGate = async () => {
  try {
    isOpening.value = true
    statusMessage.value = ''

    console.log('🚪 Sending open gate command...')
    console.log('📝 Command:', GATE_PASSWORD)

    // Write the password to the characteristic
    const success = await write(SERVICE_UUID, CHARACTERISTIC_UUID, GATE_PASSWORD)

    if (success) {
      console.log('✅ Gate command sent successfully')
      statusMessage.value = 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'

      // Clear success message after 5 seconds
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

// Check BLE support on component mount
onMounted(async () => {
  console.log('🚀 GateControlPage mounted')
  console.log('📱 Platform:', platform.value)

  // Check if BLE is supported on this device/browser
  await checkBLESupport()
  bleChecked.value = true

  if (!isBLESupported.value) {
    console.warn('⚠️ BLE is not supported on this device/browser')
    statusMessage.value = 'Bluetooth is not available on this device'
    statusMessageType.value = 'error'
  } else {
    console.log('✅ BLE is supported')
  }
})
</script>

<style scoped>
.gate-control-page {
  min-height: 100vh;
  background: #fafafa;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-header p {
  color: #666;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

/* Main Control Card */
.control-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Bluetooth Icon */
.bluetooth-icon-container {
  position: relative;
  margin-bottom: 8px;
}

.bluetooth-icon {
  width: 120px;
  height: 120px;
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
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
}

.bluetooth-icon.connecting {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #1976d2;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    width: 120px;
    height: 120px;
    opacity: 1;
  }
  100% {
    width: 180px;
    height: 180px;
    opacity: 0;
  }
}

/* Status Section */
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
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
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

/* Warning Banner */
.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #fff3e0;
  border: 2px solid #ffb74d;
  border-radius: 12px;
  width: 100%;
  margin: 8px 0;
  color: #e65100;
}

.warning-text {
  flex: 1;
}

.warning-text strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 4px;
}

.warning-text p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  font-weight: normal;
}

/* Button Group */
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
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.02em;
}

.secondary-button {
  width: 100%;
  padding: 12px 24px;
  font-size: 1rem;
  text-transform: none;
}

/* Status Message */
.status-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
  text-align: left;
  animation: slideIn 0.3s ease-out;
}

.status-message.success {
  background: #c8e6c9;
  color: #2e7d32;
  border: 2px solid #81c784;
}

.status-message.error {
  background: #ffcdd2;
  color: #c62828;
  border: 2px solid #e57373;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Info Section */
.info-section {
  width: 100%;
  max-width: 500px;
  margin-top: 16px;
}

.info-card {
  background: #f5f5f5;
  box-shadow: none;
}

.instructions-list {
  margin: 0;
  padding-left: 20px;
  color: #555;
  line-height: 1.8;
}

.instructions-list li {
  margin-bottom: 12px;
}

/* Debug Section */
.debug-section {
  width: 100%;
  max-width: 500px;
  margin-top: 8px;
}

.debug-card {
  background: #fafafa;
  box-shadow: none;
}

.debug-info {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #666;
}

.debug-info p {
  margin: 8px 0;
  word-break: break-all;
}

/* Responsive Design */
@media (max-width: 768px) {
  .gate-control-page {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }

  .control-card {
    padding: 32px 24px;
  }

  .bluetooth-icon {
    width: 100px;
    height: 100px;
  }

  .bluetooth-icon :deep(.q-icon) {
    font-size: 40px;
  }

  .action-button {
    padding: 14px 24px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.9rem;
  }

  .control-card {
    padding: 24px 20px;
  }

  .bluetooth-icon {
    width: 90px;
    height: 90px;
  }

  .bluetooth-icon :deep(.q-icon) {
    font-size: 36px;
  }

  .status-indicator {
    font-size: 0.9rem;
    padding: 10px 16px;
  }

  .action-button {
    padding: 12px 20px;
    font-size: 0.95rem;
  }

  .warning-banner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
