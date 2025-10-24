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
            <path
              d="M12 2L16 6L12 10L12 14L16 18L12 22L12 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 6L12 10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 18L12 14"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
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
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              stroke="currentColor"
              stroke-width="2"
              rx="1"
            />
            <!-- Top-left finder pattern -->
            <rect x="4" y="4" width="6" height="6" stroke="currentColor" stroke-width="1.5" />
            <rect x="5.5" y="5.5" width="3" height="3" fill="currentColor" />
            <!-- Top-right finder pattern -->
            <rect x="14" y="4" width="6" height="6" stroke="currentColor" stroke-width="1.5" />
            <rect x="15.5" y="5.5" width="3" height="3" fill="currentColor" />
            <!-- Bottom-left finder pattern -->
            <rect x="4" y="14" width="6" height="6" stroke="currentColor" stroke-width="1.5" />
            <rect x="5.5" y="15.5" width="3" height="3" fill="currentColor" />
            <!-- Data dots -->
            <circle cx="13" cy="13" r="1" fill="currentColor" />
            <circle cx="16" cy="13" r="1" fill="currentColor" />
            <circle cx="19" cy="13" r="1" fill="currentColor" />
            <circle cx="13" cy="16" r="1" fill="currentColor" />
            <circle cx="13" cy="19" r="1" fill="currentColor" />
            <circle cx="16" cy="16" r="1" fill="currentColor" />
            <circle cx="19" cy="16" r="1" fill="currentColor" />
            <circle cx="16" cy="19" r="1" fill="currentColor" />
            <circle cx="19" cy="19" r="1" fill="currentColor" />
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
                <div
                  class="bluetooth-icon"
                  :class="{ connected: isConnected, connecting: isConnecting }"
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L16 6L12 10L12 14L16 18L12 22L12 2Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8 6L12 10"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M8 18L12 14"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <div v-if="isConnecting" class="pulse-ring"></div>
                </div>
              </div>

              <!-- Connection Status -->
              <div class="status-info">
                <div v-if="isConnected" class="status-badge connected">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ $t('connected') || 'Connected' }}</span>
                </div>
                <div v-else-if="isConnecting" class="status-badge connecting">
                  <div class="spinner"></div>
                  <span>{{ $t('connecting') || 'Connecting...' }}</span>
                </div>
                <div v-else class="status-badge disconnected">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <span>{{ $t('disconnected') || 'Disconnected' }}</span>
                </div>

                <div v-if="deviceName" class="device-info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="5"
                      y="2"
                      width="14"
                      height="20"
                      rx="2"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <line
                      x1="12"
                      y1="18"
                      x2="12"
                      y2="18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span>{{ deviceName }}</span>
                </div>

                <div v-if="lastConnectedDevice && !isConnected" class="last-device">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                    <polyline
                      points="12 6 12 12 16 14"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span
                    >{{ $t('lastDevice') || 'Last device' }}: {{ lastConnectedDevice.name }}</span
                  >
                </div>
              </div>

              <!-- BLE Not Supported Warning -->
              <div v-if="!isBLESupported && bleChecked" class="warning-banner">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <line
                    x1="12"
                    y1="9"
                    x2="12"
                    y2="13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <line
                    x1="12"
                    y1="17"
                    x2="12"
                    y2="17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="warning-content">
                  <strong>{{ $t('bleNotSupported') || 'Bluetooth Not Supported' }}</strong>
                  <p>
                    {{
                      $t('bleNotSupportedDesc') ||
                      'Your device or browser does not support Bluetooth Low Energy.'
                    }}
                  </p>
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
                <svg
                  v-if="!autoConnecting && !isOpening"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <polygon
                    points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
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
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M12 1v6m0 6v6m9-9h-6m-6 0H3"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
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
                  <path
                    d="M10 19H3V5C3 3.9 3.9 3 5 3H19C20.1 3 21 3.9 21 5V9"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M3 11H10M18 11H21M18 15V21M18 15L15 18M18 15L21 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
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
                    <path
                      d="M12 2L16 6L12 10L12 14L16 18L12 22L12 2Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <line
                      x1="3"
                      y1="3"
                      x2="9"
                      y2="9"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <line
                      x1="15"
                      y1="15"
                      x2="21"
                      y2="21"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
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
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                    <path
                      d="M12 1v6m0 6v6m9-9h-6m-6 0H3"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
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
                    <polyline
                      points="3 6 5 6 21 6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ $t('forget') || 'Forget' }}</span>
                </button>
              </div>
            </div>

            <!-- Status Message -->
            <transition name="slide-up">
              <div v-if="statusMessage" class="status-message" :class="statusMessageType">
                <svg
                  v-if="statusMessageType === 'success'"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg
                  v-else-if="statusMessageType === 'error'"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
                </svg>
                <span>{{ statusMessage }}</span>
              </div>
            </transition>
          </div>
        </div>

        <!-- Gate Passes -->
        <div v-else-if="activeTab === 'passes'" key="passes" class="content-panel">
          <!-- Blocking Warning -->
          <div
            v-if="userBlockingStatus.isBlocked && !userBlockingStatus.loading"
            class="blocking-alert"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="12"
                y1="17"
                x2="12"
                y2="17"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <div class="alert-content">
              <strong>{{ userBlockingStatus.blockingDetails?.global ? 'Temporarily Disabled' : 'Access Restricted' }}</strong>
              <p>
                {{ userBlockingStatus.blockingDetails?.reason || 'You are currently blocked from generating passes. Please contact support for assistance.' }}
              </p>
            </div>
          </div>

          <div class="passes-panel">
            <!-- Generate Pass Button -->
            <button
              class="generate-pass-button"
              :disabled="currentMonthPassCount >= passLimits.monthlyLimit || userBlockingStatus.isBlocked"
              @click="showGenerateDialog = true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <line
                  x1="8"
                  y1="12"
                  x2="16"
                  y2="12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span
                >{{ $t('generatePass') || 'Generate Pass' }} ({{ currentMonthPassCount }}/{{
                  passLimits.monthlyLimit
                }})</span
              >
            </button>

            <div v-if="userBlockingStatus.isBlocked" class="blocked-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <line
                  x1="4.93"
                  y1="4.93"
                  x2="19.07"
                  y2="19.07"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <span>{{ $t('generationBlocked') || 'Pass generation is currently disabled' }}</span>
            </div>

            <!-- Location Restriction Indicator -->
            <div v-if="locationRestriction.active" class="location-restriction-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>
                Location Restriction: 
                <strong :style="{ color: '#AF1E23' }">Active</strong>
              </span>
            </div>
            <div v-else-if="!locationRestriction.loading" class="location-restriction-hint inactive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>
                Location Restriction: 
                <strong style="color: #10b981">Inactive</strong>
              </span>
            </div>

            <!-- Passes Grid -->
            <div v-if="currentProjectPasses.length > 0" class="passes-grid">
              <div v-for="pass in currentProjectPasses" :key="pass.id" class="pass-card">
                <!-- Hidden canvas for QR code generation -->
                <canvas :ref="(el) => setQRRef(el, pass.id)" class="qr-code-hidden"></canvas>
                
                <!-- Professional Pass Card Design -->
                <div class="pass-card-header">
                  <div class="pass-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <h3 class="pass-guest-name">{{ pass.guestName }}</h3>
                </div>

                <div class="pass-card-body">
                  <div class="pass-info-row">
                    <div class="pass-info-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2" />
                      </svg>
                      <span>Valid Until</span>
                    </div>
                    <span class="pass-info-value">{{ formatDate(pass.validUntil) }}</span>
                  </div>
                </div>

                <div class="pass-card-footer">
                  <button class="pass-share-button" @click="sharePass(pass)">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2" />
                      <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                      <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2" />
                    </svg>
                    <span>{{ $t('share') || 'Share Guest Pass' }}</span>
                  </button>

                  <button class="pass-delete-button" @click="deletePass(pass.id)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  stroke-width="1.5"
                  rx="1"
                />
                <rect
                  x="13"
                  y="3"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  stroke-width="1.5"
                  rx="1"
                />
                <rect
                  x="3"
                  y="13"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  stroke-width="1.5"
                  rx="1"
                />
                <rect
                  x="13"
                  y="13"
                  width="8"
                  height="8"
                  stroke="currentColor"
                  stroke-width="1.5"
                  rx="1"
                />
              </svg>
              <h3>{{ $t('noPassesFound') || 'No Passes Found' }}</h3>
              <p>{{ $t('createFirstPass') || 'Create your first guest pass to get started' }}</p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Generate Pass Modal - Professional Design -->
    <transition name="modal">
      <div v-if="showGenerateDialog" class="modal-overlay" @click="showGenerateDialog = false">
        <div class="modal-container-pro" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header-pro">
            <div class="modal-header-content">
              <div class="modal-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"/>
                  <rect x="5" y="5" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                  <rect x="13" y="5" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                  <rect x="5" y="13" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <h2 class="modal-title-pro">{{ $t('generateNewPass') || 'New Guest Pass' }}</h2>
                <p class="modal-subtitle-pro">Generate QR code for gate access</p>
              </div>
            </div>
            <button class="modal-close-pro" @click="showGenerateDialog = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body-pro">
            <div class="form-group-pro">
              <label class="form-label-pro">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Guest Name</span>
                <span class="required-star">*</span>
              </label>
              <input
                v-model="newPass.guestName"
                type="text"
                class="form-input-pro"
                placeholder="Enter guest's full name"
                required
              />
            </div>

            <div class="form-group-pro">
              <label class="form-label-pro">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>Valid Until</span>
                <span class="required-star">*</span>
              </label>
              <input
                v-model="newPass.validUntil"
                type="datetime-local"
                class="form-input-pro"
                required
              />
            </div>
            <!-- Location Permission Info -->
            <div v-if="locationRestriction.active" class="info-box-pro" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #fecaca;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p style="color: #7f1d1d;">
                <strong>Location verification required.</strong><br/>
                You must be within the project premises. The app will request location access when you generate the pass.
              </p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer-pro">
            <button class="modal-btn-cancel" @click="showGenerateDialog = false" :disabled="isValidatingLocation">
              {{ $t('cancel') || 'Cancel' }}
            </button>
            <button
              class="modal-btn-generate"
              :disabled="!newPass.guestName || !newPass.validUntil || isValidatingLocation"
              @click="generatePass"
            >
              <div v-if="isValidatingLocation" class="button-spinner"></div>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
                <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ isValidatingLocation ? 'Checking Location...' : ($t('generate') || 'Generate & Share') }}</span>
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
        <svg
          v-if="!autoConnecting && !isOpening"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <polygon
            points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div v-else class="spinner"></div>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useBluetooth } from '../../composables/useBluetooth'
import { useFormKeyboard } from '../../composables/useFormKeyboard'
import { useModalState } from '../../composables/useModalState'
import QRCode from 'qrcode'
import PageHeader from '../../components/PageHeader.vue'
import sharingService from '../../services/whatsappService'
import { createGuestPass, markPassAsSent, checkUserEligibility } from '../../api/guestPassAPI'
import { auth, db } from '../../boot/firebase'
import firestoreService from '../../services/firestoreService'
import optimizedAuthService from '../../services/optimizedAuthService'
import { useNotificationStore } from '../../stores/notifications'
import { useProjectStore } from '../../stores/projectStore'

defineOptions({
  name: 'AccessPage',
})

// Setup keyboard handling
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
})

const notificationStore = useNotificationStore()
const projectStore = useProjectStore()
const { openModal, closeModal } = useModalState()

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
const isValidatingLocation = ref(false)

// Watch for modal state to hide bottom navigation
watch(showGenerateDialog, (isOpen) => {
  if (isOpen) {
    openModal()
  } else {
    closeModal()
  }
})

const newPass = ref({
  guestName: '',
  purpose: '',
  validUntil: '',
})

// User blocking state
const userBlockingStatus = ref({
  isBlocked: false,
  blockingDetails: null,
  loading: true,
})

// Location restriction state
const locationRestriction = ref({
  active: false,
  projectCount: 0,
  projects: [],
  loading: false,
})

// Pass limits
const passLimits = ref({
  monthlyLimit: 10,
  usedThisMonth: 0,
  remainingQuota: 10,
})

// Computed: Filter passes by current project
const currentProjectPasses = computed(() => {
  const projectId = projectStore.selectedProject?.id
  if (!projectId) return []
  
  // Filter passes to only show those for the current project
  return passes.value.filter(pass => pass.projectId === projectId)
})

// Computed: Current month pass count for display
const currentMonthPassCount = computed(() => {
  return passLimits.value.usedThisMonth || 0
})

// User unit information
const userUnitInfo = ref('')

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
 * User Unit Information Functions
 */
const fetchUserUnitInfo = async () => {
  try {
    if (!auth.currentUser) {
      userUnitInfo.value = 'No Unit Assigned'
      return
    }

    // Try to get unit info from user profile or Firebase
    const userDoc = await db.collection('users').doc(auth.currentUser.uid).get()

    if (userDoc.exists) {
      const userData = userDoc.data()
      // Check for unit information in various possible fields
      const unit =
        userData.unit ||
        userData.unitNumber ||
        userData.apartment ||
        userData.address ||
        userData.building

      if (unit) {
        userUnitInfo.value = unit
      } else {
        userUnitInfo.value = 'No Unit Assigned'
      }
    } else {
      userUnitInfo.value = 'No Unit Assigned'
    }
  } catch (error) {
    console.error('❌ Error fetching user unit info:', error)
    userUnitInfo.value = 'No Unit Assigned'
  }
}

const getUserUnitInfo = () => {
  return userUnitInfo.value || 'No Unit Assigned'
}

/**
 * Load passes from Firebase AND calculate limits
 * 
 * NEW Per-Project Limit Hierarchy:
 * 1. Fetch global limit from guestPassSettings/{projectId} (set by admin in dashboard)
 * 2. Check if user has custom limit in projects/{projectId}/userGuestPassSettings/{userId}.monthlyLimit
 * 3. Use per-project user limit if exists, otherwise use global limit
 * 4. Fallback to 10 if both fail
 * 
 * This allows the same user to have different limits per project!
 * Example: User has 10 in Project A, 100 in Project B, blocked in Project C
 */
const loadPassesFromFirebase = async () => {
  try {
    const user = await optimizedAuthService.getCurrentUser()
    const projectId = projectStore.selectedProject?.id
    
    if (!user || !projectId) {
      console.log('👤 No user or project, skipping pass load')
      passes.value = []
      passLimits.value = {
        monthlyLimit: 10,
        usedThisMonth: 0,
        remainingQuota: 10,
      }
      return
    }

    console.log('📥 Loading passes from Firebase for project:', projectId)
    console.log('👤 User ID:', user.uid)

    // Get per-project user settings
    let userProjectSettings = {}
    try {
      const settingsResult = await firestoreService.getDoc(`projects/${projectId}/userGuestPassSettings/${user.uid}`)
      userProjectSettings = settingsResult.data ? settingsResult.data() : settingsResult
      console.log('📋 Per-project user settings:', userProjectSettings)
    } catch {
      console.log('ℹ️ No per-project settings found, will use defaults')
    }
    
    // Check for global settings
    let globalMonthlyLimit = 10
    let globalBlockAllUsers = false
    let globalSettingsDoc = null
    
    try {
      const globalSettingsResult = await firestoreService.getDoc(`guestPassSettings/${projectId}`)
      globalSettingsDoc = globalSettingsResult.data ? globalSettingsResult.data() : globalSettingsResult
      
      if (globalSettingsDoc?.monthlyLimit) {
        // Handle both string and number values
        globalMonthlyLimit = typeof globalSettingsDoc.monthlyLimit === 'string' 
          ? parseInt(globalSettingsDoc.monthlyLimit, 10) 
          : globalSettingsDoc.monthlyLimit
        console.log('🌐 Global monthly limit from settings:', globalMonthlyLimit, '(type:', typeof globalSettingsDoc.monthlyLimit, ')')
      }
      globalBlockAllUsers = globalSettingsDoc?.blockAllUsers || false
    } catch (settingsError) {
      console.warn('⚠️ Could not fetch global settings, using defaults:', settingsError)
    }
    
    // Use per-project user limit if set, otherwise use global limit
    let monthlyLimit = globalMonthlyLimit
    if (userProjectSettings.monthlyLimit !== undefined && userProjectSettings.monthlyLimit !== null) {
      // Handle both string and number values for per-project user limit
      monthlyLimit = typeof userProjectSettings.monthlyLimit === 'string'
        ? parseInt(userProjectSettings.monthlyLimit, 10)
        : userProjectSettings.monthlyLimit
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 GUEST PASS LIMIT CALCULATION (PER-PROJECT)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🏢 Project ID:', projectId)
    console.log('📋 Per-project user settings:', userProjectSettings)
    console.log('🌐 Global limit for this project:', globalMonthlyLimit)
    console.log('🎯 Per-project user limit:', userProjectSettings.monthlyLimit || 'NOT SET (will use global)')
    console.log('📊 Final monthly limit:', monthlyLimit)
    console.log('💡 Limit source:', userProjectSettings.monthlyLimit !== undefined && userProjectSettings.monthlyLimit !== null ? '🎯 CUSTOM LIMIT FOR THIS PROJECT ONLY' : '🌐 GLOBAL DEFAULT FOR THIS PROJECT')
    console.log('🔒 Global block all users:', globalBlockAllUsers)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Update user blocking status based on global and per-project settings
    const isBlockedInProject = userProjectSettings.blocked || false
    userBlockingStatus.value = {
      isBlocked: isBlockedInProject || globalBlockAllUsers,
      blockingDetails: globalBlockAllUsers 
        ? { reason: 'Guest pass generation has been temporarily disabled by administration', global: true }
        : (isBlockedInProject ? { reason: 'You are blocked from generating guest passes in this project', individual: true, projectSpecific: true } : null),
      loading: false,
    }

    // Query ALL passes for this user in this project
    console.log('⏳ Loading ALL guest passes...')
    const allPassesResult = await firestoreService.getDocs(
      `projects/${projectId}/guestPasses`,
      {
        filters: [
          { field: 'userId', operator: '==', value: user.uid }
        ],
        orderBy: [
          { field: 'createdAt', direction: 'desc' }
        ]
      }
    )
    
    const allPasses = (allPassesResult?.docs || [])
    console.log('✅ Total passes found:', allPasses.length)
    
    // Count passes created this month
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const passesThisMonth = allPasses.filter(doc => {
      const createdAt = doc.createdAt
      if (!createdAt) return false
      
      const passDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
      return passDate >= firstDayOfMonth
    })
    
    const usedThisMonth = passesThisMonth.length
    
    console.log(`📊 Passes this month: ${usedThisMonth}/${monthlyLimit}`)
    console.log(`📅 Month start: ${firstDayOfMonth}`)
    
    // Update limits
    passLimits.value = {
      monthlyLimit: monthlyLimit,
      usedThisMonth: usedThisMonth,
      remainingQuota: Math.max(0, monthlyLimit - usedThisMonth),
    }
    
    console.log('✅ Pass limits set:', passLimits.value)
    
    // Map passes for display
    passes.value = allPasses.map(doc => {
      return {
        id: doc.id,
        projectId: projectId,
        userName: doc.userName || 'Unknown User',
        guestName: doc.guestName,
        purpose: doc.purpose || 'Guest Visit',
        validUntil: doc.validUntil,
        status: 'active',
        createdAt: doc.createdAt,
        code: doc.id,
        firebaseRef: doc.id,
      }
    })

    console.log(`✅ Loaded ${passes.value.length} total passes (${usedThisMonth} this month)`)

    // Generate QR codes for all passes
    if (passes.value.length > 0) {
      await nextTick()
      setTimeout(async () => {
        for (const pass of passes.value) {
          try {
            await generateQRCode(pass)
          } catch (qrError) {
            console.error('❌ Error generating QR for pass:', pass.id, qrError)
          }
        }
      }, 200)
    }
  } catch (error) {
    console.error('❌ Error loading passes from Firebase:', error)
    console.error('❌ Error code:', error?.code)
    console.error('❌ Error message:', error?.message)
    passes.value = []
    passLimits.value = {
      monthlyLimit: 10,
      usedThisMonth: 0,
      remainingQuota: 10,
    }
  }
}

/**
 * Check if user is blocked from generating passes
 */
const checkUserBlockingStatus = async () => {
  try {
    userBlockingStatus.value.loading = true

    const user = await optimizedAuthService.getCurrentUser()
    const projectId = projectStore.selectedProject?.id
    
    if (!user || !projectId) {
      userBlockingStatus.value = {
        isBlocked: false,
        blockingDetails: null,
        loading: false,
      }
      return
    }

    // Get per-project user settings
    let userProjectSettings = {}
    try {
      const settingsResult = await firestoreService.getDoc(`projects/${projectId}/userGuestPassSettings/${user.uid}`)
      userProjectSettings = settingsResult.data ? settingsResult.data() : settingsResult
    } catch {
      console.log('ℹ️ No per-project settings found for blocking check')
    }
    
    // Check global settings for block all users
    const globalSettingsResult = await firestoreService.getDoc(`guestPassSettings/${projectId}`)
    const globalSettingsDoc = globalSettingsResult.data ? globalSettingsResult.data() : globalSettingsResult
    const globalBlockAllUsers = globalSettingsDoc?.blockAllUsers || false
    
    const isBlockedInProject = userProjectSettings.blocked || false
    
    console.log('🔍 Per-project user settings:', userProjectSettings)
    console.log('🔒 Global block all users:', globalBlockAllUsers)
    console.log('🚫 Blocked in this project:', isBlockedInProject)

    // Check if user is blocked globally or in this specific project
    if (globalBlockAllUsers) {
      userBlockingStatus.value = {
        isBlocked: true,
        blockingDetails: {
          reason: 'Guest pass generation has been temporarily disabled by administration',
          blockedBy: 'system',
          global: true,
        },
        loading: false,
      }
      console.log('🚫 All users blocked from generating passes (global setting)')
    } else if (isBlockedInProject) {
      userBlockingStatus.value = {
        isBlocked: true,
        blockingDetails: {
          reason: userProjectSettings.blockedReason || 'You are blocked from generating guest passes in this project',
          blockedBy: userProjectSettings.blockedBy || 'admin',
          blockedAt: userProjectSettings.blockedAt || null,
          individual: true,
          projectSpecific: true,
        },
        loading: false,
      }
      console.log('⛔ User is blocked from generating passes in this project')
    } else {
      userBlockingStatus.value = {
        isBlocked: false,
        blockingDetails: null,
        loading: false,
      }
      console.log('✅ User is NOT blocked in this project')
    }
  } catch (error) {
    console.error('❌ Error checking user blocking status:', error)
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

const checkLocationRestrictionStatus = async () => {
  try {
    locationRestriction.value.loading = true
    
    const locationCheckService = (await import('../../services/locationCheckService')).default
    const status = await locationCheckService.getLocationRestrictionStatus()
    
    locationRestriction.value = {
      active: status.active,
      projectCount: status.projectCount,
      projects: status.projects,
      loading: false,
    }
    
    console.log('📍 Location restriction status:', locationRestriction.value)
  } catch (error) {
    console.error('Error checking location restriction status:', error)
    locationRestriction.value = {
      active: false,
      projectCount: 0,
      projects: [],
      loading: false,
    }
  }
}

const switchToPassesTab = async () => {
  activeTab.value = 'passes'
  // Load passes (this also calculates limits) and check blocking status
  await Promise.all([
    loadPassesFromFirebase(),
    checkUserBlockingStatus(),
    checkLocationRestrictionStatus()
  ])
}

const generatePass = async () => {
  try {
    // Check if user is authenticated first
    const user = await optimizedAuthService.getCurrentUser()
    if (!user) {
      notificationStore.showError('You must be logged in to generate a pass.')
      return
    }

    // Check blocking status
    if (userBlockingStatus.value.isBlocked) {
      notificationStore.showWarning(
        'You are currently blocked from generating passes. Please contact support for assistance.',
      )
      return
    }

    // Check if user has reached their limit
    if (currentMonthPassCount.value >= passLimits.value.monthlyLimit) {
      notificationStore.showWarning(
        `You have reached your monthly limit of ${passLimits.value.monthlyLimit} passes.`,
      )
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

    const sanitizedGuestName = newPass.value.guestName.trim().substring(0, 100)
    const sanitizedPurpose = (newPass.value.purpose || 'Guest Visit').trim().substring(0, 200)

    // Get the actual project ID from the project store
    const projectId = projectStore.selectedProject?.id
    if (!projectId) {
      notificationStore.showError('No project selected. Please select a project first.')
      return
    }

    // Double-check eligibility via API before creating pass
    console.log('🔍 Checking eligibility via API before generating pass...')
    const eligibilityResult = await checkUserEligibility(projectId, user.uid)
    
    if (!eligibilityResult.success || !eligibilityResult.data?.canGenerate) {
      console.error('❌ User not eligible:', eligibilityResult)
      notificationStore.showWarning(
        eligibilityResult.message || 'You are not eligible to generate passes at this time.'
      )
      
      // Refresh limits from server
      await loadPassesFromFirebase()
      return
    }
    
    console.log('✅ Eligibility check passed:', eligibilityResult.data)

    // Check location restriction before creating pass
    console.log('🔍 Validating location for guest pass generation...')
    isValidatingLocation.value = true
    
    try {
      const locationCheckService = (await import('../../services/locationCheckService')).default
      const locationValidation = await locationCheckService.validateGuestPassLocation()
      
      if (!locationValidation.allowed) {
        console.error('❌ Location validation failed:', locationValidation)
        
        let errorMessage = locationValidation.message || 'Location check failed'
        
        // Add distance info if available
        if (locationValidation.nearestProject) {
          const locationService = (await import('../../services/locationService')).default
          const distanceText = locationService.formatDistance(locationValidation.nearestProject.distance)
          errorMessage += `\n\nNearest project: ${locationValidation.nearestProject.project.name} (${distanceText} away)`
        }
        
        // Add permission guidance for permission errors
        if (locationValidation.reason === 'location_unavailable') {
          errorMessage += '\n\nTo enable location:\niOS: Settings → PRE Group → Location → While Using the App\nAndroid: Settings → Apps → PRE Group → Permissions → Location'
        }
        
        isValidatingLocation.value = false
        notificationStore.showWarning(errorMessage)
        return
      }
      
      console.log('✅ Location validation passed:', locationValidation.message)
      isValidatingLocation.value = false
    } catch (error) {
      isValidatingLocation.value = false
      notificationStore.showError('Failed to validate location. Please try again.')
      console.error('Location validation error:', error)
      return
    }

    const userName = user.displayName || user.email || 'Unknown User'
    const result = await createGuestPass(
      projectId,
      user.uid,
      userName,
      sanitizedGuestName,
      sanitizedPurpose,
      newPass.value.validUntil,
    )

    if (!result.success) {
      throw new Error(result.message || 'Failed to create guest pass')
    }

    const pass = {
      id: result.passId,
      projectId: projectId, // Add project ID to the pass
      userName: userName, // Add user name for QR code
      guestName: sanitizedGuestName,
      purpose: sanitizedPurpose,
      validUntil: new Date(newPass.value.validUntil).toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      code: result.passId,
      firebaseRef: result.passRef,
    }

    // Add pass to beginning for immediate UI feedback
    passes.value.unshift(pass)

    // Update limits locally for immediate feedback
    passLimits.value.usedThisMonth = (passLimits.value.usedThisMonth || 0) + 1
    passLimits.value.remainingQuota = Math.max(0, passLimits.value.monthlyLimit - passLimits.value.usedThisMonth)

    console.log('✅ Pass added, new count:', passLimits.value)

    newPass.value = {
      guestName: '',
      purpose: '',
      validUntil: '',
    }

    showGenerateDialog.value = false

    await nextTick()
    // Add a small delay to ensure canvas is properly mounted
    setTimeout(async () => {
      await generateQRCode(pass)
    }, 100)

    // Share pass with QR code using native share
    try {
      const canvas = qrRefs.get(pass.id)
      if (canvas) {
        const qrCodeDataUrl = canvas.toDataURL('image/png')
        const result = await sharingService.sharePassWithImage(pass, qrCodeDataUrl)

        if (result.success) {
          notificationStore.showSuccess(result.message || 'Pass shared successfully!')
        } else {
          throw new Error(result.message || 'Sharing failed')
        }
      } else {
        const result = await sharingService.sharePassText(pass)
        if (result.success) {
          notificationStore.showSuccess('Pass shared successfully!')
        } else {
          throw new Error('Sharing failed')
        }
      }

      if (pass.firebaseRef) {
        const projectId = projectStore.selectedProject?.id
        if (projectId) {
          await markPassAsSent(pass.firebaseRef, projectId)
        }
      }
    } catch (shareError) {
      console.warn('⚠️ Sharing failed:', shareError?.message || JSON.stringify(shareError) || shareError)
      notificationStore.showWarning(
        `Pass generated successfully. ${shareError.message || 'Sharing failed - please share manually.'}`,
      )
    }
  } catch (error) {
    console.error('Error generating pass:', error?.message || JSON.stringify(error) || error)
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

    // Set canvas size to match the gate pass design
    const canvasWidth = 400
    const canvasHeight = 450
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const ctx = canvas.getContext('2d')

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Generate QR code data
    const qrData = JSON.stringify({
      code: pass.code,
      guestName: pass.guestName,
      validUntil: pass.validUntil,
    })

    console.log('🎯 Generating QR code for pass:', pass.id)

    try {
      // Method 1: Try using QRCode.toCanvas directly (more reliable)
      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, qrData, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      console.log('✅ QR code generated with toCanvas, drawing gate pass...')

      // Draw the complete gate pass design
      drawGatePass(ctx, qrCanvas, pass, canvasWidth)
      console.log('✅ Gate pass drawn successfully')
    } catch (toCanvasError) {
      console.warn('⚠️ toCanvas failed, trying dataURL method:', toCanvasError)

      // Method 2: Fallback to dataURL method
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      console.log('✅ QR code generated with dataURL, creating image...')

      // Create image from QR code data URL
      const img = new Image()
      img.onload = () => {
        console.log('✅ Image loaded, drawing gate pass...')
        try {
          // Draw the complete gate pass design
          drawGatePass(ctx, img, pass, canvasWidth)
          console.log('✅ Gate pass drawn successfully')
        } catch (drawError) {
          console.error('❌ Error drawing gate pass:', drawError)
        }
      }
      img.onerror = (error) => {
        console.error('❌ Error loading QR code image:', error)
      }
      img.src = qrCodeDataUrl
    }
  } catch (error) {
    console.error('❌ Error generating QR code:', error)
  }
}

const drawGatePass = (ctx, qrImg, pass, canvasWidth) => {
  // Set font properties
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'

  // Draw title "Gate Pass" - larger and bolder
  ctx.font = 'bold 32px Arial, sans-serif'
  ctx.fillText('Gate Pass', canvasWidth / 2, 40)

  // Draw subtitle "One Time Pass" - smaller
  ctx.font = '16px Arial, sans-serif'
  ctx.fillText('One Time Pass', canvasWidth / 2, 65)

  // Draw QR code in center - much larger
  const qrSize = 280
  const qrX = (canvasWidth - qrSize) / 2
  const qrY = 85
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  // Draw information bar at bottom - closer to bottom
  const infoBarY = qrY + qrSize + 10
  const infoBarHeight = 80
  const infoBarPadding = 25

  // Draw grey background for info bar - lighter grey
  ctx.fillStyle = '#F8F8F8'
  ctx.fillRect(0, infoBarY, canvasWidth, infoBarHeight)

  // Draw border for info bar - subtle
  ctx.strokeStyle = '#DDDDDD'
  ctx.lineWidth = 1
  ctx.strokeRect(0, infoBarY, canvasWidth, infoBarHeight)

  // Left side - Unit and Visitor info
  ctx.textAlign = 'left'
  ctx.fillStyle = '#000000'

  // Unit info
  ctx.font = 'bold 13px Arial, sans-serif'
  ctx.fillText('Unit', infoBarPadding, infoBarY + 25)
  ctx.font = '13px Arial, sans-serif'
  const unitInfo = getUserUnitInfo() // Get unit info from user account
  ctx.fillText(unitInfo, infoBarPadding, infoBarY + 42)

  // Visitor info
  ctx.font = 'bold 13px Arial, sans-serif'
  ctx.fillText('Visitor', infoBarPadding, infoBarY + 62)
  ctx.font = '13px Arial, sans-serif'
  ctx.fillText(pass.guestName, infoBarPadding, infoBarY + 79)

  // Right side - Date and Inviter info
  ctx.textAlign = 'right'

  // Date info
  ctx.font = 'bold 13px Arial, sans-serif'
  ctx.fillText('Date', canvasWidth - infoBarPadding, infoBarY + 25)
  ctx.font = '13px Arial, sans-serif'
  const validDate = new Date(pass.validUntil).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  ctx.fillText(validDate, canvasWidth - infoBarPadding, infoBarY + 42)

  // Inviter info
  ctx.font = 'bold 13px Arial, sans-serif'
  ctx.fillText('Inviter', canvasWidth - infoBarPadding, infoBarY + 62)
  ctx.font = '13px Arial, sans-serif'
  // Get inviter name from pass data or fallback
  const inviterName = pass.userName || 'Unknown User'
  ctx.fillText(inviterName, canvasWidth - infoBarPadding, infoBarY + 79)
}

const deletePass = (passId) => {
  passes.value = passes.value.filter((p) => p.id !== passId)
  qrRefs.delete(passId)
  
  // Update the count since we deleted a pass
  passLimits.value.usedThisMonth = Math.max(0, (passLimits.value.usedThisMonth || 0) - 1)
  passLimits.value.remainingQuota = Math.max(0, passLimits.value.monthlyLimit - passLimits.value.usedThisMonth)
  
  notificationStore.showInfo('Pass deleted')
}

const sharePass = async (pass) => {
  const canvas = qrRefs.get(pass.id)
  if (!canvas) {
    notificationStore.showError('QR code not ready. Please try again.')
    return
  }

  try {
    const qrCodeDataUrl = canvas.toDataURL('image/png')
    const result = await sharingService.sharePassWithImage(pass, qrCodeDataUrl)

    if (result.success) {
      notificationStore.showSuccess(result.message || 'Pass shared successfully!')
      
      // Mark pass as sent if it has a Firebase reference
      if (pass.firebaseRef) {
        const projectId = projectStore.selectedProject?.id
        if (projectId) {
          await markPassAsSent(pass.firebaseRef, projectId)
        }
      }
    } else {
      throw new Error(result.message || 'Sharing failed')
    }
  } catch (error) {
    console.error('Error sharing pass:', error)
    // Fallback to download if sharing fails
    if (!Capacitor.isNativePlatform()) {
      const canvas = qrRefs.get(pass.id)
      if (canvas) {
        downloadQRCode(canvas, pass.guestName)
      }
    } else {
      notificationStore.showError('Failed to share pass. Please try again.')
    }
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
  async (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      passes.value = []
      qrRefs.clear()

      // Fetch unit info for new user
      if (newUserId) {
        try {
          await fetchUserUnitInfo()
        } catch (error) {
          console.error('❌ Error fetching user unit info on user change:', error)
        }
      }
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
    await fetchUserUnitInfo()
  } catch (error) {
    console.error('❌ Error fetching user unit info:', error)
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

  // Load passes and check blocking status  
  try {
    await Promise.all([
      loadPassesFromFirebase(), // This also sets passLimits
      checkUserBlockingStatus()
    ])
  } catch (error) {
    console.error('❌ Error loading passes or checking status:', error)
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Ensure proper box sizing */
.access-page * {
  box-sizing: border-box;
}

/* Reset some default styles */
.access-page button {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.access-page input {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
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
  background: linear-gradient(135deg, #af1e23 0%, #8b161a 100%);
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
  background: transparent;
  border-radius: 0;
  padding: 0;
  margin: 0;
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
  background: transparent;
  padding: 0;
  margin: 0;
}

/* Actions Container */
.actions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

/* Action Buttons */
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-button.primary-action {
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(175, 30, 35, 0.3);
}

.action-button.primary-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.4);
}

.action-button.primary-action:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(175, 30, 35, 0.3);
}

.action-button.success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.action-button.success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
}

.action-button:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

.action-button.loading {
  cursor: not-allowed;
}

/* Quick Open Button */
.quick-open {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.3);
}

.quick-open:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 152, 0, 0.4);
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
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Status Info */
.status-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

/* Status Badge */
.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.connected {
  background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%);
  color: #2e7d32;
}

.status-badge.connecting {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%);
  color: #f57c00;
}

.status-badge.disconnected {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
}

/* Device Info */
.device-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #666;
}

.device-info svg {
  color: #AF1E23;
}

/* Last Device */
.last-device {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #1976d2;
}

.last-device svg {
  color: #1976d2;
}

/* Warning Banner */
.warning-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #fff3cd;
  border: 2px solid #ffeaa7;
  border-radius: 16px;
  color: #856404;
  margin-top: 20px;
}

.warning-banner svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-content strong {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.warning-content p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
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
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes connectingPulse {
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
  color: #af1e23;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.action-button.primary-action {
  background: linear-gradient(135deg, #af1e23 0%, #8b161a 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(175, 30, 35, 0.3);
}

.action-button.primary-action.quick-open {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  animation: pulseGlow 2s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%,
  100% {
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
  background: transparent;
  padding: 0;
  margin: 0;
}

/* Generate Pass Button */
.generate-pass-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(175, 30, 35, 0.3);
  margin-bottom: 20px;
}

.generate-pass-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.4);
}

.generate-pass-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(175, 30, 35, 0.3);
}

.generate-pass-button:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}

/* Passes Grid */
.passes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* Blocking Alert */
.blocking-alert {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 16px;
  color: #dc2626;
  margin-bottom: 20px;
}

.blocking-alert svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content strong {
  display: block;
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.alert-content p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Blocked Hint */
.blocked-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 12px;
  color: #92400e;
  font-size: 0.9rem;
  margin-top: 12px;
}

.blocked-hint svg {
  flex-shrink: 0;
}

/* Location Restriction Hint */
.location-restriction-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #7f1d1d;
  font-size: 0.9rem;
  margin-top: 8px;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.1);
  animation: fadeIn 0.3s ease;
}

.location-restriction-hint.inactive {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #bbf7d0;
  color: #14532d;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.location-restriction-hint svg {
  flex-shrink: 0;
}


/* Guest Pass Card - Professional Design */
.pass-card {
  background: white;
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.4s ease;
  border: 1px solid rgba(175, 30, 35, 0.1);
}

.pass-card:active {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(175, 30, 35, 0.15);
}

/* Hidden QR Code Canvas (only used for sharing) */
.qr-code-hidden {
  display: none;
  width: 400px;
  height: 450px;
}

/* Pass Card Header */
.pass-card-header {
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.pass-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F6F6F6;
  flex-shrink: 0;
}

.pass-guest-name {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: #F6F6F6;
  letter-spacing: -0.01em;
  flex: 1;
}

/* Pass Card Body */
.pass-card-body {
  padding: 20px;
  background: #fafafa;
}

.pass-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.pass-info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
}

.pass-info-label svg {
  color: #AF1E23;
}

.pass-info-value {
  color: #333;
  font-size: 0.9375rem;
  font-weight: 600;
}

/* Pass Card Footer */
.pass-card-footer {
  padding: 16px 20px;
  background: white;
  display: flex;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

.pass-share-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.2);
}

.pass-share-button:active {
  transform: scale(0.98);
  background: #8A1820;
}

.pass-delete-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff5f5;
  color: #dc2626;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.pass-delete-button:active {
  transform: scale(0.95);
  background: #fee2e2;
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

/* Professional Generate Pass Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 0;
  box-sizing: border-box;
}

.modal-container-pro {
  background: white;
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease-out;
  max-height: 85vh;
  overflow-y: scroll !important;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header-pro {
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  color: white;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.modal-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.modal-title-pro {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
  letter-spacing: -0.01em;
}

.modal-subtitle-pro {
  font-size: 0.875rem;
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

.modal-close-pro {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 12px;
  padding: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.modal-close-pro:active {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(0.95);
}

.modal-body-pro {
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group-pro {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label-pro {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 0.9375rem;
  font-weight: 600;
}

.form-label-pro svg {
  color: #AF1E23;
  flex-shrink: 0;
}

.required-star {
  color: #ef4444;
  font-weight: 700;
  margin-left: auto;
}

.form-input-pro {
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fafafa;
  color: #333;
}

.form-input-pro:focus {
  outline: none;
  border-color: #AF1E23;
  background: white;
  box-shadow: 0 0 0 4px rgba(175, 30, 35, 0.1);
}

.form-input-pro::placeholder {
  color: #999;
}

.info-box-pro {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 12px;
  color: #0369a1;
}

.info-box-pro svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.info-box-pro p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.modal-footer-pro {
  padding: 20px 24px;
  background: #fafafa;
  display: flex;
  gap: 12px;
  border-top: 1px solid #e8e8e8;
}

.modal-btn-cancel {
  flex: 1;
  padding: 14px 20px;
  background: white;
  color: #666;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn-cancel:active {
  transform: scale(0.98);
  background: #f5f5f5;
}

.modal-btn-generate {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

.modal-btn-generate:active {
  transform: scale(0.98);
  background: #8A1820;
}

.modal-btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.modal-btn-generate:disabled:active {
  transform: none;
}

.button-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Old Modal Styles (Legacy - can be removed later) */

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
  background: linear-gradient(135deg, #af1e23 0%, #af1e23 100%);
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
  border-color: #af1e23;
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
  background: #af1e23;
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
  0%,
  100% {
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
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
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

  .modal-container-pro {
    max-width: 95%;
    border-radius: 20px;
  }

  .modal-header-pro {
    padding: 20px 16px;
  }

  .modal-icon {
    width: 48px;
    height: 48px;
  }

  .modal-title-pro {
    font-size: 1.25rem;
  }

  .modal-subtitle-pro {
    font-size: 0.8125rem;
  }

  .modal-body-pro {
    padding: 20px 16px;
    gap: 20px;
  }

  .modal-footer-pro {
    padding: 16px;
    flex-direction: column;
  }

  .modal-btn-cancel,
  .modal-btn-generate {
    width: 100%;
    flex: none;
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

  .pass-card-header {
    padding: 20px 16px;
  }

  .pass-guest-name {
    font-size: 1.125rem;
  }

  .pass-icon {
    width: 40px;
    height: 40px;
  }

  .pass-card-body {
    padding: 16px;
  }

  .pass-card-footer {
    padding: 12px 16px;
  }

  .pass-share-button {
    padding: 12px 16px;
    font-size: 0.875rem;
  }
}
</style>
