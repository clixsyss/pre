<template>
  <div class="access-page">
    <PageHeader
      :title="$t('gateAccess') || 'Gate Access'"
      :subtitle="$t('gateAccessDesc') || 'Control your gate and manage access passes'"
    />

    <!-- Modern Tab Navigation -->
    <div class="tabs-container">
      <div class="tabs-wrapper">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'ble' }" 
          @click="activeTab = 'ble'"
        >
          <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L16 6L12 10L12 14L16 18L12 22L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 6L12 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 18L12 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="tab-label">{{ $t('bleControl') || 'BLE Control' }}</span>
        </button>
        
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'passes' }" 
          @click="switchToPassesTab"
        >
          <svg class="tab-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <!-- QR Code outer border -->
            <rect x="2" y="2" width="20" height="20" stroke="currentColor" stroke-width="2" rx="1"/>
            <!-- Top-left finder pattern -->
            <rect x="4" y="4" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
            <rect x="5.5" y="5.5" width="3" height="3" fill="currentColor"/>
            <!-- Top-right finder pattern -->
            <rect x="14" y="4" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
            <rect x="15.5" y="5.5" width="3" height="3" fill="currentColor"/>
            <!-- Bottom-left finder pattern -->
            <rect x="4" y="14" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
            <rect x="5.5" y="15.5" width="3" height="3" fill="currentColor"/>
            <!-- Data dots -->
            <circle cx="13" cy="13" r="1" fill="currentColor"/>
            <circle cx="16" cy="13" r="1" fill="currentColor"/>
            <circle cx="19" cy="13" r="1" fill="currentColor"/>
            <circle cx="13" cy="16" r="1" fill="currentColor"/>
            <circle cx="13" cy="19" r="1" fill="currentColor"/>
            <circle cx="16" cy="16" r="1" fill="currentColor"/>
            <circle cx="19" cy="16" r="1" fill="currentColor"/>
            <circle cx="16" cy="19" r="1" fill="currentColor"/>
            <circle cx="19" cy="19" r="1" fill="currentColor"/>
          </svg>
          <span class="tab-label">{{ $t('gatePasses') || 'Gate Passes' }}</span>
        </button>
        
        <div class="tab-indicator" :class="`tab-${activeTab}`"></div>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- BLE Gate Control -->
      <transition name="fade" mode="out-in">
        <div v-if="activeTab === 'ble'" key="ble" class="content-panel">
          <div class="ble-panel">
            <!-- Bluetooth Status Card -->
            <div class="status-card">
              <div class="bluetooth-icon-wrapper">
                <div class="bluetooth-icon" :class="{ connected: isConnected, connecting: isConnecting }">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L16 6L12 10L12 14L16 18L12 22L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 6L12 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 18L12 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div v-if="isConnecting" class="pulse-ring"></div>
                </div>
              </div>

              <!-- Connection Status -->
              <div class="status-info">
                <div v-if="isConnected" class="status-badge connected">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ $t('connected') || 'Connected' }}</span>
                </div>
                <div v-else-if="isConnecting" class="status-badge connecting">
                  <div class="spinner"></div>
                  <span>{{ $t('connecting') || 'Connecting...' }}</span>
                </div>
                <div v-else class="status-badge disconnected">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ $t('disconnected') || 'Disconnected' }}</span>
                </div>

                <div v-if="deviceName" class="device-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="18" x2="12" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>{{ deviceName }}</span>
                </div>

                <div v-if="lastConnectedDevice && !isConnected" class="last-device">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>{{ $t('lastDevice') || 'Last device' }}: {{ lastConnectedDevice.name }}</span>
                </div>
              </div>

              <!-- BLE Not Supported Warning -->
              <div v-if="!isBLESupported && bleChecked" class="warning-banner">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="12" y1="17" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div class="warning-content">
                  <strong>{{ $t('bleNotSupported') || 'Bluetooth Not Supported' }}</strong>
                  <p>{{ $t('bleNotSupportedDesc') || 'Your device or browser does not support Bluetooth Low Energy.' }}</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="actions-container">
              <!-- Quick Open (Auto-connect and open) -->
              <button
                v-if="!isConnected && lastConnectedDevice"
                class="action-button primary-action quick-open"
                :class="{ loading: autoConnecting || isOpening }"
                :disabled="autoConnecting || isOpening || (bleChecked && !isBLESupported)"
                @click="quickOpenGate"
              >
                <svg v-if="!autoConnecting && !isOpening" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-else class="spinner"></div>
                <span>{{ $t('quickOpen') || 'Quick Open Gate' }}</span>
              </button>

              <!-- Connect Button -->
              <button
                v-if="!isConnected && !lastConnectedDevice"
                class="action-button primary-action"
                :class="{ loading: isConnecting }"
                :disabled="isConnecting || (bleChecked && !isBLESupported)"
                @click="handleConnect"
              >
                <svg v-if="!isConnecting" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <div v-else class="spinner"></div>
                <span>{{ $t('connect') || 'Connect to Gate' }}</span>
              </button>

              <!-- Open Gate Button -->
              <button
                v-if="isConnected"
                class="action-button primary-action success"
                :class="{ loading: isOpening }"
                :disabled="isOpening"
                @click="handleOpenGate"
              >
                <svg v-if="!isOpening" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M10 19H3V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M3 11H10M18 11H21M18 15V21M18 15L15 18M18 15L21 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-else class="spinner"></div>
                <span>{{ $t('openGate') || 'Open Gate' }}</span>
              </button>

              <!-- Secondary Actions -->
              <div v-if="isConnected || lastConnectedDevice" class="secondary-actions">
                <button
                  v-if="isConnected"
                  class="secondary-button danger"
                  @click="handleDisconnect"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L16 6L12 10L12 14L16 18L12 22L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="3" y1="3" x2="9" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <line x1="15" y1="15" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span>{{ $t('disconnect') || 'Disconnect' }}</span>
                </button>

                <button
                  v-if="lastConnectedDevice && !isConnected"
                  class="secondary-button"
                  :class="{ loading: isConnecting }"
                  :disabled="isConnecting"
                  @click="handleConnect"
                >
                  <svg v-if="!isConnecting" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <div v-else class="spinner small"></div>
                  <span>{{ $t('newConnection') || 'New Device' }}</span>
                </button>

                <button
                  v-if="lastConnectedDevice && !isConnected"
                  class="secondary-button"
                  @click="forgetDevice"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ $t('forget') || 'Forget' }}</span>
                </button>
              </div>
            </div>

            <!-- Status Message -->
            <transition name="slide-up">
              <div v-if="statusMessage" class="status-message" :class="statusMessageType">
                <svg v-if="statusMessageType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="statusMessageType === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>{{ statusMessage }}</span>
              </div>
            </transition>
          </div>
        </div>

        <!-- Gate Passes -->
        <div v-else-if="activeTab === 'passes'" key="passes" class="content-panel">
          <!-- Blocking Warning -->
          <div v-if="userBlockingStatus.isBlocked && !userBlockingStatus.loading" class="blocking-alert">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="17" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <div class="alert-content">
              <strong>Access Restricted</strong>
              <p>You are currently blocked from generating passes. Please contact support for assistance.</p>
            </div>
          </div>

          <div class="passes-panel">
            <!-- Generate Pass Button -->
            <button
              class="generate-pass-button"
              :disabled="passes.length >= passLimits.monthlyLimit || userBlockingStatus.isBlocked"
              @click="showGenerateDialog = true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>{{ $t('generatePass') || 'Generate Pass' }} ({{ passes.length }}/{{ passLimits.monthlyLimit }})</span>
            </button>
            
            <div v-if="userBlockingStatus.isBlocked" class="blocked-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ $t('generationBlocked') || 'Pass generation is currently disabled' }}</span>
            </div>

            <!-- Passes Grid -->
            <div v-if="passes.length > 0" class="passes-grid">
              <div v-for="pass in passes" :key="pass.id" class="pass-card">
                <div class="pass-header">
                  <div class="pass-info-section">
                    <h3 class="pass-name">{{ pass.guestName }}</h3>
                    <span class="pass-status" :class="pass.status">{{ pass.status }}</span>
                  </div>
                  
                  <div class="pass-qr-container">
                    <canvas :ref="(el) => setQRRef(el, pass.id)" class="qr-code"></canvas>
                  </div>
                </div>

                <div class="pass-details">
                  <div class="pass-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>{{ formatDate(pass.validUntil) }}</span>
                  </div>
                  <div class="pass-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>{{ pass.purpose }}</span>
                  </div>
                </div>

                <div class="pass-actions">
                  <button class="pass-action-button" @click="sharePass(pass)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>{{ $t('share') || 'Share' }}</span>
                  </button>
                  
                  <button v-if="pass.phoneNumber" class="pass-action-button whatsapp" @click="sendPassViaWhatsApp(pass)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>{{ $t('whatsapp') || 'WhatsApp' }}</span>
                  </button>
                  
                  <button class="pass-action-button danger" @click="deletePass(pass.id)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span>{{ $t('delete') || 'Delete' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" stroke="currentColor" stroke-width="1.5" rx="1"/>
                <rect x="13" y="3" width="8" height="8" stroke="currentColor" stroke-width="1.5" rx="1"/>
                <rect x="3" y="13" width="8" height="8" stroke="currentColor" stroke-width="1.5" rx="1"/>
                <rect x="13" y="13" width="8" height="8" stroke="currentColor" stroke-width="1.5" rx="1"/>
              </svg>
              <h3>{{ $t('noPassesFound') || 'No Passes Found' }}</h3>
              <p>{{ $t('createFirstPass') || 'Create your first guest pass to get started' }}</p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Generate Pass Modal -->
    <transition name="modal">
      <div v-if="showGenerateDialog" class="modal-overlay" @click="showGenerateDialog = false">
        <div class="modal-container" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header">
            <h2>{{ $t('generateNewPass') || 'Generate New Pass' }}</h2>
            <button class="modal-close" @click="showGenerateDialog = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <p class="modal-description">Fill in the guest details to generate a QR code access pass</p>
            
            <div class="form-fields">
              <input
                v-model="newPass.guestName"
                type="text"
                class="form-input"
                :placeholder="$t('guestName') || 'Guest Name *'"
                required
              />

              <input
                v-model="newPass.purpose"
                type="text"
                class="form-input"
                :placeholder="$t('purpose') || 'Purpose of Visit (optional)'"
              />

              <div class="datetime-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input
                  v-model="newPass.validUntil"
                  type="datetime-local"
                  class="form-input with-icon"
                  required
                />
              </div>

              <div class="whatsapp-section">
                <div class="whatsapp-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: #25d366;">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span>Send via WhatsApp</span>
                </div>
                <input
                  v-model="newPass.phoneNumber"
                  type="tel"
                  class="form-input whatsapp-input"
                  :placeholder="$t('phoneNumber') || 'Phone Number (optional)'"
                />
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button class="modal-button secondary" @click="showGenerateDialog = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              {{ $t('cancel') || 'Cancel' }}
            </button>
            <button
              class="modal-button primary"
              :disabled="!newPass.guestName || !newPass.validUntil"
              @click="generatePass"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"/>
                <rect x="5" y="5" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                <rect x="13" y="5" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                <rect x="5" y="13" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              {{ $t('generate') || 'Generate Pass' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Floating Quick Action -->
    <transition name="fab">
      <button
        v-if="lastConnectedDevice && !isConnected && activeTab === 'ble'"
        class="fab-button"
        :class="{ loading: autoConnecting || isOpening }"
        :disabled="autoConnecting || isOpening"
        @click="quickOpenGate"
      >
        <svg v-if="!autoConnecting && !isOpening" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div v-else class="spinner"></div>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { useBluetooth } from '../../composables/useBluetooth'
import { useFormKeyboard } from '../../composables/useFormKeyboard'
import QRCode from 'qrcode'
import PageHeader from '../../components/PageHeader.vue'
import whatsappService from '../../services/whatsappService'
import { checkUserEligibility, createGuestPass, markPassAsSent } from '../../api/guestPassAPI'
import { auth } from '../../boot/firebase'
import { useNotificationStore } from '../../stores/notifications'

defineOptions({
  name: 'AccessPage',
})

// Setup keyboard handling
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true
})

const notificationStore = useNotificationStore()

// Tab state
const activeTab = ref('ble')

// BLE Configuration
const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0'
const CHARACTERISTIC_UUID = 'abcdefab-cdef-1234-5678-abcdefabcdef'
const GATE_PASSWORD = 'OPEN123'

// Use bluetooth composable
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
const statusMessageType = ref('')
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
  phoneNumber: '',
})

// User blocking state
const userBlockingStatus = ref({
  isBlocked: false,
  blockingDetails: null,
  loading: true,
})

// Pass limits
const passLimits = ref({
  monthlyLimit: 10,
  usedThisMonth: 0,
  remainingQuota: 10,
})

// QR refs
const qrRefs = new Map()

/**
 * BLE Functions
 */
const handleConnect = async () => {
  try {
    console.log('🔵 Starting BLE connection...')
    statusMessage.value = ''

    const success = await connect(SERVICE_UUID)

    if (success) {
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
      statusMessage.value = 'Failed to connect. Please try again.'
      statusMessageType.value = 'error'
    }
  } catch (error) {
    console.error('❌ Connection error:', error)
    statusMessage.value = error.message || 'Connection failed'
    statusMessageType.value = 'error'
  }
}

const quickOpenGate = async () => {
  try {
    autoConnecting.value = true
    statusMessage.value = 'Connecting to gate...'
    statusMessageType.value = 'info'

    const connected = await connect(SERVICE_UUID)

    if (!connected) {
      autoConnecting.value = false
      statusMessage.value = 'Failed to connect. Please try again.'
      statusMessageType.value = 'error'
      return
    }

    isOpening.value = true
    statusMessage.value = 'Opening gate...'

    const success = await write(SERVICE_UUID, CHARACTERISTIC_UUID, GATE_PASSWORD)

    if (success) {
      statusMessage.value = 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'

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

const forgetDevice = () => {
  lastConnectedDevice.value = null
  localStorage.removeItem('lastGateDevice')
  
  notificationStore.showInfo('Device forgotten. You can connect to a new device.')
}

const handleDisconnect = async () => {
  statusMessage.value = ''
  await disconnect()
}

const handleOpenGate = async () => {
  try {
    isOpening.value = true
    statusMessage.value = ''

    const success = await write(SERVICE_UUID, CHARACTERISTIC_UUID, GATE_PASSWORD)

    if (success) {
      statusMessage.value = 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'

      setTimeout(() => {
        if (statusMessage.value.includes('Gate opened successfully')) {
          statusMessage.value = ''
        }
      }, 5000)
    } else {
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
 * User Blocking Functions
 */
const checkUserBlockingStatus = async () => {
  try {
    userBlockingStatus.value.loading = true

    if (!auth.currentUser) {
      userBlockingStatus.value = {
        isBlocked: false,
        blockingDetails: null,
        loading: false,
      }
      return
    }

    const result = await checkUserEligibility('project123', auth.currentUser.uid)

    if (result.success && result.data.canGenerate) {
      userBlockingStatus.value = {
        isBlocked: false,
        blockingDetails: null,
        loading: false,
      }

      passLimits.value = {
        monthlyLimit: result.data.monthlyLimit || 10,
        usedThisMonth: result.data.usedThisMonth || 0,
        remainingQuota: result.data.remainingQuota || result.data.monthlyLimit - result.data.usedThisMonth || 10,
      }
    } else {
      userBlockingStatus.value = {
        isBlocked: true,
        blockingDetails: result.data.blockingDetails || {
          reason: result.message,
          blockedBy: 'admin',
          blockedUntil: null,
        },
        loading: false,
      }

      if (result.data.monthlyLimit !== undefined) {
        passLimits.value = {
          monthlyLimit: result.data.monthlyLimit || 10,
          usedThisMonth: result.data.usedThisMonth || 0,
          remainingQuota: result.data.remainingQuota || result.data.monthlyLimit - result.data.usedThisMonth || 10,
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking user eligibility:', error)
    userBlockingStatus.value = {
      isBlocked: false,
      blockingDetails: null,
      loading: false,
      error: error.message,
    }
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

const switchToPassesTab = async () => {
  activeTab.value = 'passes'
  await checkUserBlockingStatus()
}

const generatePass = async () => {
  try {
    await checkUserBlockingStatus()

    if (userBlockingStatus.value.isBlocked) {
      notificationStore.showWarning('You are currently blocked from generating passes. Please contact support for assistance.')
      return
    }

    if (passes.value.length >= passLimits.value.monthlyLimit) {
      notificationStore.showWarning(`You have reached your monthly limit of ${passLimits.value.monthlyLimit} passes.`)
      return
    }

    if (!newPass.value.guestName || newPass.value.guestName.trim().length < 2) {
      notificationStore.showError('Guest name must be at least 2 characters long')
      return
    }

    if (!newPass.value.validUntil) {
      notificationStore.showError('Valid until date is required')
      return
    }

    if (newPass.value.phoneNumber && newPass.value.phoneNumber.trim()) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(newPass.value.phoneNumber.replace(/\s/g, ''))) {
        notificationStore.showError('Please enter a valid phone number')
        return
      }
    }

    const sanitizedGuestName = newPass.value.guestName.trim().substring(0, 100)
    const sanitizedPurpose = (newPass.value.purpose || 'Guest Visit').trim().substring(0, 200)
    const sanitizedPhoneNumber = newPass.value.phoneNumber ? newPass.value.phoneNumber.trim().substring(0, 20) : null

    const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown User'
    const result = await createGuestPass(
      'project123',
      auth.currentUser.uid,
      userName,
      sanitizedGuestName,
      sanitizedPurpose,
      newPass.value.validUntil,
      sanitizedPhoneNumber,
    )

    if (!result.success) {
      throw new Error(result.message || 'Failed to create guest pass')
    }

    const pass = {
      id: result.passId,
      guestName: sanitizedGuestName,
      purpose: sanitizedPurpose,
      validUntil: new Date(newPass.value.validUntil).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      code: result.passId,
      phoneNumber: sanitizedPhoneNumber,
      firebaseRef: result.passRef,
    }

    passes.value.push(pass)

    passLimits.value.usedThisMonth = (passLimits.value.usedThisMonth || 0) + 1
    passLimits.value.remainingQuota = passLimits.value.monthlyLimit - passLimits.value.usedThisMonth

    if (auth.currentUser?.uid) {
      const userPassesKey = `gatePasses_${auth.currentUser.uid}`
      localStorage.setItem(userPassesKey, JSON.stringify(passes.value))
    }

    newPass.value = {
      guestName: '',
      purpose: '',
      validUntil: '',
      phoneNumber: '',
    }

    showGenerateDialog.value = false

    await nextTick()
    await generateQRCode(pass)

    if (pass.phoneNumber && pass.phoneNumber.trim()) {
      try {
        const canvas = qrRefs.get(pass.id)
        if (canvas) {
          const qrCodeDataUrl = canvas.toDataURL('image/png')
          const result = await whatsappService.sendGatePassWithImage(pass, pass.phoneNumber, qrCodeDataUrl)

          if (result.success) {
            notificationStore.showSuccess(result.message || 'Pass generated and sent via WhatsApp!')
          } else {
            throw new Error(result.message || 'WhatsApp sending failed')
          }
        } else {
          const result = await whatsappService.sendGatePassViaWhatsApp(pass, pass.phoneNumber)
          if (result.success) {
            notificationStore.showSuccess('Pass generated and sent via WhatsApp!')
          } else {
            throw new Error('WhatsApp sending failed')
          }
        }

        if (pass.firebaseRef) {
          await markPassAsSent(pass.firebaseRef)
        }
      } catch (whatsappError) {
        console.warn('⚠️ WhatsApp sending failed:', whatsappError)
        notificationStore.showWarning(`Pass generated successfully. ${whatsappError.message || 'WhatsApp sending failed - please share manually.'}`)
      }
    } else {
      notificationStore.showSuccess('Pass generated successfully')
    }
  } catch (error) {
    console.error('Error generating pass:', error)
    notificationStore.showError(error.message || 'Failed to generate pass')
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

    await QRCode.toCanvas(canvas, qrData, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  } catch (error) {
    console.error('❌ Error generating QR code:', error)
  }
}

const deletePass = (passId) => {
  passes.value = passes.value.filter((p) => p.id !== passId)
  if (auth.currentUser?.uid) {
    const userPassesKey = `gatePasses_${auth.currentUser.uid}`
    localStorage.setItem(userPassesKey, JSON.stringify(passes.value))
  }
  qrRefs.delete(passId)
  notificationStore.showInfo('Pass deleted')
}

const sharePass = async (pass) => {
  const canvas = qrRefs.get(pass.id)
  if (!canvas) {
    notificationStore.showError('QR code not ready. Please try again.')
    return
  }

  try {
    if (Capacitor.isNativePlatform()) {
      const dataUrl = canvas.toDataURL('image/png')
      try {
        await Share.share({
          title: `Gate Pass for ${pass.guestName}`,
          text: `Gate Pass Code: ${pass.code}\nValid until: ${formatDate(pass.validUntil)}`,
          url: dataUrl,
          dialogTitle: 'Share Gate Pass',
        })
        notificationStore.showSuccess('Pass shared successfully')
      } catch {
        // Share failed, fallback to download
        downloadQRCode(canvas, pass.guestName)
      }
    } else {
      downloadQRCode(canvas, pass.guestName)
    }
  } catch (error) {
    console.error('Error sharing pass:', error)
    notificationStore.showError('Failed to share pass. Please try again.')
  }
}

const sendPassViaWhatsApp = async (pass) => {
  try {
    if (!pass.phoneNumber || !pass.phoneNumber.trim()) {
      notificationStore.showWarning('Phone number is required to send via WhatsApp')
      return
    }

    await whatsappService.sendGatePassViaWhatsApp(pass, pass.phoneNumber)
    notificationStore.showSuccess('Pass sent via WhatsApp!')
  } catch (error) {
    console.error('Error sending pass via WhatsApp:', error)
    notificationStore.showError('Failed to send via WhatsApp. Please try again.')
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
    notificationStore.showSuccess('QR code downloaded')
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

// Watch for user changes
watch(
  () => auth.currentUser?.uid,
  (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      passes.value = []
      qrRefs.clear()
    }
  },
)

// Initialize
onMounted(async () => {
  try {
    await checkBLESupport()
    bleChecked.value = true
  } catch (error) {
    console.error('❌ Error checking BLE support:', error)
    bleChecked.value = true
  }

  try {
    await checkUserBlockingStatus()
  } catch (error) {
    console.error('❌ Error checking user blocking status:', error)
  }

  try {
    const savedDevice = localStorage.getItem('lastGateDevice')
    if (savedDevice) {
      lastConnectedDevice.value = JSON.parse(savedDevice)
    }
  } catch (error) {
    console.error('❌ Error loading last device:', error)
    lastConnectedDevice.value = null
  }

  try {
    if (auth.currentUser?.uid) {
      const userPassesKey = `gatePasses_${auth.currentUser.uid}`
      const savedPasses = localStorage.getItem(userPassesKey)
      if (savedPasses) {
        passes.value = JSON.parse(savedPasses)
      } else {
        passes.value = []
      }
    } else {
      passes.value = []
    }

    if (passes.value.length > 0) {
      await nextTick()
      for (const pass of passes.value) {
        try {
          await generateQRCode(pass)
        } catch (qrError) {
          console.error('❌ Error generating QR for pass:', pass.id, qrError)
        }
      }
    }
  } catch (error) {
    console.error('❌ Error loading passes:', error)
    passes.value = []
  }
})
</script>

<style scoped>
/* Page Layout */
.access-page {
  min-height: calc(100vh - 200px);
  background: #fafafa;
  padding-bottom: 100px;
}

/* Modern Tabs */
.tabs-container {
  margin-bottom: 24px;
}

.tabs-wrapper {
  position: relative;
  display: flex;
  background: white;
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  color: #666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.tab-button.active {
  color: white;
}

.tab-icon {
  transition: transform 0.3s ease;
}

.tab-button.active .tab-icon {
  transform: scale(1.1);
}

.tab-indicator {
  position: absolute;
  top: 6px;
  left: 6px;
  width: calc(50% - 6px);
  height: calc(100% - 12px);
  background: linear-gradient(135deg, #AF1E23 0%, #8b161a 100%);
  border-radius: 12px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
  z-index: 1;
}

.tab-indicator.tab-passes {
  transform: translateX(calc(100% + 6px));
}

.tab-label {
  font-size: 0.9rem;
}

/* Content Panel */
.content-panel {
  animation: fadeSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* BLE Panel */
.ble-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card {
  background: white;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.bluetooth-icon-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.bluetooth-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.bluetooth-icon.connected {
  background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%);
  color: #2e7d32;
  animation: successPulse 0.6s ease-out;
}

.bluetooth-icon.connecting {
  animation: connectingPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes connectingPulse {
  0%, 100% {
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
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #1976d2;
  animation: pulseRing 2s ease-out infinite;
}

@keyframes pulseRing {
  0% {
    width: 100px;
    height: 100px;
    opacity: 1;
  }
  100% {
    width: 160px;
    height: 160px;
    opacity: 0;
  }
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  animation: fadeIn 0.3s ease;
}

.status-badge.connected {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  color: #2e7d32;
}

.status-badge.connecting {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.status-badge.disconnected {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  color: #c62828;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: #f5f5f5;
  border-radius: 10px;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
}

.last-device {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #e3f2fd;
  border-radius: 10px;
  color: #1976d2;
  font-size: 0.85rem;
  font-weight: 500;
}

.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 2px solid #ffb74d;
  border-radius: 14px;
  color: #e65100;
  width: 100%;
}

.warning-content strong {
  display: block;
  margin-bottom: 6px;
  font-size: 1rem;
}

.warning-content p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Actions */
.actions-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 32px;
  border: none;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
  color: #AF1E23;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-button.primary-action {
  background: linear-gradient(135deg, #AF1E23 0%, #8b161a 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(175, 30, 35, 0.3);
}

.action-button.primary-action.quick-open {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  animation: pulseGlow 2s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
  50% {
    box-shadow: 0 8px 28px rgba(76, 175, 80, 0.6);
  }
}

.action-button.primary-action.success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.action-button:not(:disabled):active {
  transform: translateY(2px);
}

.secondary-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.secondary-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button.danger {
  border-color: #ffcdd2;
  color: #c62828;
}

.secondary-button:not(:disabled):active {
  transform: scale(0.95);
}

/* Status Message */
.status-message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 600;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-message.success {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%);
  color: #2e7d32;
}

.status-message.error {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  color: #c62828;
}

.status-message.info {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
}

/* Passes Panel */
.passes-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.blocking-alert {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.3);
  animation: slideDown 0.4s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-content strong {
  display: block;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.alert-content p {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.95;
}

.generate-pass-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 32px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #AF1E23 0%, #8b161a 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(175, 30, 35, 0.3);
}

.generate-pass-button:not(:disabled):active {
  transform: translateY(2px);
}

.generate-pass-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.blocked-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #ffebee;
  color: #c62828;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Passes Grid */
.passes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.pass-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.4s ease;
}

.pass-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.pass-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f5f5f5;
}

.pass-info-section {
  flex: 1;
}

.pass-name {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.pass-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pass-status.active {
  background: #c8e6c9;
  color: #2e7d32;
}

.pass-qr-container {
  flex-shrink: 0;
}

.qr-code {
  border-radius: 10px;
  background: white;
  padding: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pass-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.pass-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
}

.pass-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pass-action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.pass-action-button:active {
  transform: scale(0.95);
}

.pass-action-button.whatsapp {
  border-color: #25d366;
  color: #25d366;
}

.pass-action-button.danger {
  border-color: #ffcdd2;
  color: #c62828;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.empty-state svg {
  color: #ccc;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #666;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #999;
  margin: 0;
  font-size: 0.95rem;
}

/* Modal - Matching EditProfileDialog Style */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 0;
  box-sizing: border-box;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 96%;
  max-height: 72vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 10px;
  padding: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.modal-close:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.modal-description {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-family: inherit;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.datetime-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  pointer-events: none;
  z-index: 1;
}

.form-input.with-icon {
  padding-left: 46px;
}

.whatsapp-section {
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 14px;
  padding: 16px;
  margin-top: 8px;
}

.whatsapp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #166534;
  font-weight: 600;
  font-size: 0.95rem;
}

.whatsapp-input {
  border-color: #86efac;
  background: white;
}

.whatsapp-input:focus {
  border-color: #25d366;
  box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.modal-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.modal-button.secondary {
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
}

.modal-button.secondary:active {
  background: #e2e8f0;
}

.modal-button.primary {
  background: #AF1E23;
  color: white;
}

.modal-button.primary:active {
  background: #8b161a;
}

.modal-button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-button:not(:disabled):active {
  transform: scale(0.98);
}

/* FAB Button */
.fab-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  animation: fabPulse 2s ease-in-out infinite;
}

@keyframes fabPulse {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(76, 175, 80, 0.5);
  }
  50% {
    box-shadow: 0 12px 32px rgba(76, 175, 80, 0.7);
  }
}

.fab-button:not(:disabled):active {
  transform: scale(0.9);
}

.fab-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

.fab-enter-active,
.fab-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-enter-from,
.fab-leave-to {
  opacity: 0;
  transform: scale(0) rotate(45deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .tab-label {
    font-size: 0.85rem;
  }

  .status-card {
    padding: 24px 16px;
  }

  .bluetooth-icon {
    width: 90px;
    height: 90px;
  }

  .passes-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    margin: 0 10px;
    max-width: 95%;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-header h2 {
    font-size: 1.1rem;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 16px 20px;
  }
  
  .modal-button {
    width: 100%;
  }

  .fab-button {
    bottom: 90px;
    right: 16px;
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .tab-button {
    padding: 12px 10px;
    gap: 6px;
  }

  .tab-label {
    display: none;
  }

  .tab-icon {
    width: 24px;
    height: 24px;
  }

  .pass-actions {
    flex-direction: column;
  }

  .pass-action-button {
    width: 100%;
  }
}
</style>
