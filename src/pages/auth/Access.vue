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
            <!-- <div v-if="locationRestriction.active" class="location-restriction-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>
                Location Restriction: 
                <strong :style="{ color: '#AF1E23' }">Active</strong>
              </span>
            </div> -->
            <!-- <div v-else-if="!locationRestriction.loading" class="location-restriction-hint inactive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" />
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>
                Location Restriction: 
                <strong style="color: #10b981">Inactive</strong>
              </span>
            </div> -->

            <!-- Passes Grid -->
            <div v-if="currentProjectPasses.length > 0" class="passes-grid">
              <div v-for="pass in displayedPasses" :key="pass.id" class="pass-card-compact" :class="{ 'pass-used': pass.used, 'pass-expired': isPassExpired(pass) }">
                <!-- Hidden canvas for QR code generation (for legacy passes) -->
                <canvas :ref="(el) => setQRRef(el, pass.id)" class="qr-code-hidden"></canvas>
                
                <!-- Compact Pass Layout -->
                <div class="pass-compact-header">
                  <!-- Icon and Name -->
                  <div class="pass-icon-compact">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="pass-info-compact">
                    <h3 class="pass-name-compact">{{ pass.guestName || 'Guest' }}</h3>
                    <div class="pass-meta-compact">
                      <span class="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        {{ formatCreationDate(pass.createdAt) }}
                      </span>
                      <span class="meta-divider">•</span>
                      <span class="meta-item" :class="{ 'text-red': isPassExpiringSoon(pass) || isPassExpired(pass) }">
                        {{ getRemainingTime(pass) }}
                      </span>
                    </div>
                  </div>
                  <!-- Status Badge -->
                  <div class="pass-status-compact" :class="getPassStatusClass(pass)">
                    {{ getPassStatusText(pass) }}
                  </div>
                </div>

                <!-- Compact Actions -->
                <div class="pass-actions-compact">
                  <button 
                    class="pass-btn-compact pass-share-compact" 
                    @click="sharePass(pass)"
                    :disabled="pass.used || isPassExpired(pass)"
                  >
                    <template v-if="pass.used">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <polyline points="9 12 11 14 15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Used
                    </template>
                    <template v-else-if="isPassExpired(pass)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      Expired
                    </template>
                    <template v-else>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Share
                    </template>
                  </button>

                </div>
              </div>
            </div>

            <!-- Load More Button -->
            <div v-if="hasMorePasses" class="load-more-container">
              <button @click="loadMorePasses" class="load-more-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Load More ({{ currentProjectPasses.length - displayedPassesCount }} more)
              </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="currentProjectPasses.length === 0" class="empty-state">
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
                <p class="modal-subtitle-pro">{{ $t('generateQRCodeForGate') || 'Generate QR code for gate access' }}</p>
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
                <span>{{ $t('guestName') || 'Guest Name' }}</span>
                <span class="required-star">*</span>
              </label>
              <input
                v-model="newPass.guestName"
                type="text"
                class="form-input-pro"
                :placeholder="$t('enterGuestFullName') || 'Enter guest\'s full name'"
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
                <strong>{{ $t('locationVerificationRequired') || 'Location verification required.' }}</strong><br/>
                {{ $t('mustBeWithinProjectPremises') || 'You must be within the project premises. The app will request location access when you generate the pass.' }}
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
              :disabled="!newPass.guestName || isValidatingLocation || isGeneratingPass"
              @click="generatePass"
            >
              <div v-if="isValidatingLocation || isGeneratingPass" class="button-spinner"></div>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
                <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" stroke-width="2"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ isValidatingLocation ? ($t('checkingLocation') || 'Checking Location...') : ($t('generateAndShare') || 'Generate & Share') }}</span>
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
import { useI18n } from 'vue-i18n'
import { useBluetooth } from '../../composables/useBluetooth'
import { useFormKeyboard } from '../../composables/useFormKeyboard'
import { useModalState } from '../../composables/useModalState'
import QRCode from 'qrcode'
import PageHeader from '../../components/PageHeader.vue'
import sharingService from '../../services/whatsappService'
import { createGuestPass, markPassAsSent, checkUserEligibility, getGuestPassesForUnit, getUserStatus } from '../../api/guestPassAPI'
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

const { t, locale } = useI18n()
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
const isGeneratingPass = ref(false)
const displayedPassesCount = ref(5) // Show 5 passes initially

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

// Pass limits (per-unit, shared by all family members)
const passLimits = ref({
  monthlyLimit: 30,
  usedThisMonth: 0,
  remainingQuota: 30,
})

// Computed: Filter passes by current project
const currentProjectPasses = computed(() => {
  const projectId = projectStore.selectedProject?.id
  if (!projectId) return []
  
  // Filter passes to only show those for the current project
  return passes.value.filter(pass => pass.projectId === projectId)
})

// Computed: Displayed passes with pagination
const displayedPasses = computed(() => {
  return currentProjectPasses.value.slice(0, displayedPassesCount.value)
})

// Computed: Check if there are more passes to load
const hasMorePasses = computed(() => {
  return currentProjectPasses.value.length > displayedPassesCount.value
})

// Function to load more passes
const loadMorePasses = () => {
  displayedPassesCount.value += 5
}

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

      statusMessage.value = t('successfullyConnected') || 'Successfully connected to gate device'
      statusMessageType.value = 'success'

      setTimeout(() => {
        if (statusMessage.value === (t('successfullyConnected') || 'Successfully connected to gate device')) {
          statusMessage.value = ''
        }
      }, 3000)
    } else {
      statusMessage.value = t('failedToConnect') || 'Failed to connect. Please try again.'
      statusMessageType.value = 'error'
    }
  } catch (error) {
    console.error('❌ Connection error:', error)
    statusMessage.value = error.message || t('connectionFailed') || 'Connection failed'
    statusMessageType.value = 'error'
  }
}

const quickOpenGate = async () => {
  try {
    autoConnecting.value = true
    statusMessage.value = t('connectingToGate') || 'Connecting to gate...'
    statusMessageType.value = 'info'

    const connected = await connect(SERVICE_UUID)

    if (!connected) {
      autoConnecting.value = false
      statusMessage.value = t('failedToConnect') || 'Failed to connect. Please try again.'
      statusMessageType.value = 'error'
      return
    }

    isOpening.value = true
    statusMessage.value = t('openingGate') || 'Opening gate...'

    const success = await write(SERVICE_UUID, CHARACTERISTIC_UUID, GATE_PASSWORD)

    if (success) {
      statusMessage.value = t('gateOpenedSuccessfully') || 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'

      setTimeout(async () => {
        await disconnect()
        statusMessage.value = ''
      }, 3000)
    } else {
      statusMessage.value = t('failedToOpenGate') || 'Failed to open gate. Please try again.'
      statusMessageType.value = 'error'
    }
  } catch (error) {
    console.error('❌ Quick open error:', error)
    statusMessage.value = error.message || t('quickOpenFailed') || 'Quick open failed'
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
      statusMessage.value = t('gateOpenedSuccessfully') || 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'

      setTimeout(() => {
        if (statusMessage.value.includes(t('gateOpenedSuccessfully') || 'Gate opened successfully')) {
          statusMessage.value = ''
        }
      }, 5000)
    } else {
      statusMessage.value = t('failedToOpenGate') || 'Failed to open gate. Please try again.'
      statusMessageType.value = 'error'
    }
  } catch (error) {
    console.error('❌ Error opening gate:', error)
    statusMessage.value = error.message || t('failedToOpenGate') || 'Failed to open gate'
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
 * NEW Per-Unit Limit Hierarchy:
 * 1. Check if project-wide blocking is enabled (blockAllUsers) → block everyone
 * 2. Fetch global limit from guestPassSettings/{projectId} (set by admin in dashboard)
 * 3. Check if unit is blocked in projects/{projectId}/unitGuestPassSettings/{unit}.blocked
 * 4. Check if unit has custom limit in projects/{projectId}/unitGuestPassSettings/{unit}.monthlyLimit
 * 5. Use per-unit custom limit if exists, otherwise use global limit
 * 6. Fallback to 30 if both fail
 * 
 * All family members in the same unit share ONE limit!
 * Example: Unit A has 20 passes/month (shared by all family), Unit B has 50, Unit C is blocked
 * 
 * NOTE: This function is no longer used. Replaced by loadPassesFromAWS()
 */
// eslint-disable-next-line no-unused-vars
const loadPassesFromFirebase = async () => {
  try {
    const user = await optimizedAuthService.getCurrentUser()
    const projectId = projectStore.selectedProject?.id
    
    if (!user || !projectId) {
      console.log('👤 No user or project, skipping pass load')
      passes.value = []
      passLimits.value = {
        monthlyLimit: 30,
        usedThisMonth: 0,
        remainingQuota: 30,
      }
      return
    }

    console.log('📥 Loading passes from Firebase for project:', projectId)
    console.log('👤 User ID:', user.uid)

    // Get user's unit from project data
    const cachedUserData = await firestoreService.getDoc(`users/${user.uid}`)
    const userData = cachedUserData.data ? cachedUserData.data() : cachedUserData
    const projectInfo = userData?.projects?.find(p => p.projectId === projectId)
    const userUnit = projectInfo?.unit || userData?.unit || ''
    
    console.log('🏠 User unit:', userUnit)
    
    // Check for global settings first
    let globalMonthlyLimit = 30
    let globalBlockAllUsers = false
    let globalBlockFamilyMembers = false
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
      globalBlockFamilyMembers = globalSettingsDoc?.blockFamilyMembers || false
    } catch (settingsError) {
      console.warn('⚠️ Could not fetch global settings, using defaults:', settingsError)
    }
    
    // Check user role for family member blocking
    const userRole = projectInfo?.role || userData?.role || ''
    console.log('👥 User role in project:', userRole)
    const isFamilyMember = userRole === 'family'
    const isFamilyBlocked = globalBlockFamilyMembers && isFamilyMember
    
    // Get per-UNIT settings (NEW structure)
    let unitSettings = {}
    let unitBlocked = false
    if (userUnit) {
      try {
        const unitSettingsResult = await firestoreService.getDoc(`projects/${projectId}/unitGuestPassSettings/${userUnit}`)
        unitSettings = unitSettingsResult.data ? unitSettingsResult.data() : unitSettingsResult
        console.log('🏠 Per-unit settings for unit', userUnit + ':', unitSettings)
        unitBlocked = unitSettings?.blocked || false
      } catch {
        console.log('ℹ️ No per-unit settings found for unit', userUnit)
      }
    }
    
    // Use per-unit limit if set, otherwise use global limit
    let monthlyLimit = globalMonthlyLimit
    if (unitSettings?.monthlyLimit !== undefined && unitSettings?.monthlyLimit !== null) {
      // Handle both string and number values for per-unit limit
      monthlyLimit = typeof unitSettings.monthlyLimit === 'string'
        ? parseInt(unitSettings.monthlyLimit, 10)
        : unitSettings.monthlyLimit
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 GUEST PASS LIMIT CALCULATION (PER-UNIT)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🏢 Project ID:', projectId)
    console.log('🏠 Unit:', userUnit)
    console.log('👥 User Role:', userRole)
    console.log('📋 Per-unit settings:', unitSettings)
    console.log('🌐 Global limit for this project:', globalMonthlyLimit)
    console.log('🎯 Per-unit custom limit:', unitSettings?.monthlyLimit || 'NOT SET (will use global)')
    console.log('📊 Final monthly limit:', monthlyLimit)
    console.log('💡 Limit source:', unitSettings?.monthlyLimit !== undefined && unitSettings?.monthlyLimit !== null ? '🎯 CUSTOM LIMIT FOR THIS UNIT ONLY' : '🌐 GLOBAL DEFAULT FOR THIS PROJECT')
    console.log('🔒 Global block all users:', globalBlockAllUsers)
    console.log('🔒 Global block family members:', globalBlockFamilyMembers)
    console.log('🔒 Is family member:', isFamilyMember)
    console.log('🔒 Family blocked:', isFamilyBlocked)
    console.log('🔒 Unit blocked:', unitBlocked)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Update user blocking status based on global, role-based, and per-unit settings
    userBlockingStatus.value = {
      isBlocked: unitBlocked || globalBlockAllUsers || isFamilyBlocked,
      blockingDetails: globalBlockAllUsers 
        ? { reason: 'Guest pass generation has been temporarily disabled by administration', global: true }
        : isFamilyBlocked
        ? { reason: 'Guest pass generation is currently disabled for family members. Only property owners can generate passes.', roleBlocked: true }
        : (unitBlocked ? { reason: 'Guest pass generation is blocked for your unit', unit: userUnit } : null),
      loading: false,
    }

    // Query ALL passes for this UNIT in this project (or user if no unit)
    console.log('⏳ Loading ALL guest passes for unit:', userUnit || 'NO UNIT (using userId)')
    const allPassesResult = await firestoreService.getDocs(
      `projects/${projectId}/guestPasses`,
      {
        filters: userUnit ? [
          { field: 'unit', operator: '==', value: userUnit }
        ] : [
          { field: 'userId', operator: '==', value: user.uid }
        ],
        orderBy: [
          { field: 'createdAt', direction: 'desc' }
        ]
      }
    )
    
    const allPasses = (allPassesResult?.docs || [])
    console.log('✅ Total passes found:', allPasses.length)
    
    // Log first pass to see structure
    if (allPasses.length > 0) {
      const firstDoc = allPasses[0]
      const firstData = typeof firstDoc.data === 'function' ? firstDoc.data() : firstDoc
      console.log('📋 First pass RAW structure:', {
        id: firstDoc.id,
        hasDataMethod: typeof firstDoc.data === 'function',
        allFields: Object.keys(firstDoc)
      })
      console.log('📋 First pass EXTRACTED data:', {
        id: firstDoc.id,
        guestName: firstData.guestName,
        unit: firstData.unit,
        createdAt: firstData.createdAt,
        purpose: firstData.purpose,
        deleted: firstData.deleted
      })
    }
    
    // Filter out soft-deleted passes
    const activePasses = allPasses.filter((docSnapshot) => {
      const docData = typeof docSnapshot.data === 'function' ? docSnapshot.data() : docSnapshot
      return !docData.deleted // Exclude passes with deleted: true
    })
    
    console.log('✅ Active passes (not deleted):', activePasses.length, 'out of', allPasses.length)
    
    // Count passes created this month (excluding deleted)
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const passesThisMonth = activePasses.filter(docSnapshot => {
      const docData = typeof docSnapshot.data === 'function' ? docSnapshot.data() : docSnapshot
      if (!docData.createdAt) return false
      
      let createdDate
      if (docData.createdAt?.seconds) {
        createdDate = new Date(docData.createdAt.seconds * 1000)
      } else {
        createdDate = new Date(docData.createdAt)
      }
      
      return createdDate >= firstDayOfMonth
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
    
    // Map ACTIVE passes for display (excluding soft-deleted)
    // Note: docs from firestoreService already have their data as direct properties
    passes.value = activePasses.map(docSnapshot => {
      // Extract data from Firestore document - handle both formats
      const docData = typeof docSnapshot.data === 'function' ? docSnapshot.data() : docSnapshot
      const docId = docSnapshot.id || docData.id
      
      console.log('📄 Mapping pass:', { docId, guestName: docData.guestName, hasData: !!docData })
      
      // Convert Firestore Timestamps to ISO strings for proper date handling
      const convertTimestamp = (timestamp) => {
        if (!timestamp) return null
        // If it's a Firestore Timestamp object
        if (timestamp && typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toISOString()
        }
        // If it's already a Date object
        if (timestamp instanceof Date) {
          return timestamp.toISOString()
        }
        // If it's already a string or number, return as is
        return timestamp
      }
      
      return {
        id: docId,
        projectId: projectId,
        userName: docData.userName || 'Unknown User',
        guestName: docData.guestName || 'Unknown Guest',
        purpose: docData.purpose || 'Guest Visit',
        validUntil: convertTimestamp(docData.validUntil),
        status: 'active',
        createdAt: convertTimestamp(docData.createdAt),
        code: docId,
        firebaseRef: docId,
        qrCodeUrl: docData.qrCodeUrl || null,
        used: docData.used || false,
        usedAt: convertTimestamp(docData.usedAt),
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
  }
}

/**
 * Load guest passes from AWS DynamoDB (replaces Firebase)
 * Loads passes for the current user's unit, sorted by newest first
 */
const loadPassesFromAWS = async () => {
  try {
    const user = await optimizedAuthService.getCurrentUser()
    const projectId = projectStore.selectedProject?.id
    
    if (!user || !projectId) {
      console.log('👤 No user or project, skipping pass load')
      passes.value = []
      passLimits.value = {
        monthlyLimit: 30,
        usedThisMonth: 0,
        remainingQuota: 30,
      }
      return
    }

    // Get user ID (Cognito sub)
    const userId = user.attributes?.sub || user.cognitoAttributes?.sub || user.userSub || user.uid
    console.log('📥 Loading passes from AWS for project:', projectId)
    console.log('👤 User ID:', userId)

    // Get user status (includes unit info and limits)
    const userStatus = await getUserStatus(userId, projectId)
    const userUnit = userStatus.data?.unit || ''
    
    console.log('🏠 User unit:', userUnit)
    console.log('📊 User status:', userStatus.data)

    // Update blocking status
    userBlockingStatus.value = {
      isBlocked: userStatus.data?.blocked || false,
      blockingDetails: userStatus.data?.blocked 
        ? { reason: 'Guest pass generation is currently disabled' }
        : null,
      loading: false,
    }

    // Update limits
    passLimits.value = {
      monthlyLimit: userStatus.data?.monthlyLimit || 30,
      usedThisMonth: userStatus.data?.usedThisMonth || 0,
      remainingQuota: userStatus.data?.remainingQuota || 30,
    }

    console.log('✅ Pass limits set:', passLimits.value)

    // Load passes for this unit (or user if no unit)
    // This function already sorts by newest first
    const loadedPasses = await getGuestPassesForUnit(projectId, userId, userUnit || null)
    
    console.log(`✅ Loaded ${loadedPasses.length} passes from AWS (sorted newest first)`)

    // Map passes to the format expected by the component
    passes.value = loadedPasses.map(pass => ({
      id: pass.id,
      projectId: pass.projectId,
      userName: pass.userName,
      guestName: pass.guestName,
      purpose: pass.purpose,
      validUntil: pass.validUntil,
      status: 'active',
      createdAt: pass.createdAt,
      code: pass.id,
      firebaseRef: pass.id, // Keep for compatibility
      qrCodeUrl: pass.qrCodeUrl,
      used: pass.used || false,
      usedAt: pass.usedAt,
    }))

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
    console.error('❌ Error loading passes from AWS:', error)
    passes.value = []
    passLimits.value = {
      monthlyLimit: 30,
      usedThisMonth: 0,
      remainingQuota: 30,
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
    
    const projectId = projectStore.selectedProject?.id
    const locationCheckService = (await import('../../services/locationCheckService')).default
    
    // Pass current project ID to check ONLY this project
    const status = await locationCheckService.getLocationRestrictionStatus(projectId)
    
    locationRestriction.value = {
      active: status.active,
      projectCount: status.projectCount,
      projects: status.projects,
      loading: false,
    }
    
    console.log('📍 Location restriction status for current project:', locationRestriction.value)
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
  displayedPassesCount.value = 5 // Reset to show 5 passes initially
  // Load passes (this also calculates limits) and check blocking status
  await Promise.all([
    loadPassesFromAWS(),
    checkUserBlockingStatus(),
    checkLocationRestrictionStatus()
  ])
}

const generatePass = async () => {
  if (isGeneratingPass.value) return // Prevent double-clicks
  
  try {
    isGeneratingPass.value = true
    
    // Check if user is authenticated first
    const user = await optimizedAuthService.getCurrentUser()
    if (!user) {
      notificationStore.showError('You must be logged in to generate a pass.')
      isGeneratingPass.value = false
      return
    }

    // Check blocking status
    if (userBlockingStatus.value.isBlocked) {
      notificationStore.showWarning(
        'You are currently blocked from generating passes. Please contact support for assistance.',
      )
      isGeneratingPass.value = false
      return
    }

    // Check if user has reached their limit
    if (currentMonthPassCount.value >= passLimits.value.monthlyLimit) {
      notificationStore.showWarning(
        `You have reached your monthly limit of ${passLimits.value.monthlyLimit} passes.`,
      )
      isGeneratingPass.value = false
      return
    }

    if (!newPass.value.guestName || newPass.value.guestName.trim().length < 2) {
      notificationStore.showError('Guest name must be at least 2 characters long')
      isGeneratingPass.value = false
      return
    }

    const sanitizedGuestName = newPass.value.guestName.trim().substring(0, 100)
    const sanitizedPurpose = (newPass.value.purpose || 'Guest Visit').trim().substring(0, 200)

    // Get the actual project ID from the project store
    const projectId = projectStore.selectedProject?.id
    if (!projectId) {
      notificationStore.showError('No project selected. Please select a project first.')
      isGeneratingPass.value = false
      return
    }

    // Double-check eligibility via API before creating pass
    console.log('🔍 Checking eligibility via API before generating pass...')
    
    // Get Cognito sub (user ID)
    const userId = user.attributes?.sub || 
                   user.cognitoAttributes?.sub || 
                   user.userSub || 
                   user.uid
    
    if (!userId) {
      notificationStore.showError('Unable to get user ID. Please log out and log back in.')
      isGeneratingPass.value = false
      return
    }
    
    const eligibilityResult = await checkUserEligibility(projectId, userId)
    
    if (!eligibilityResult.success || !eligibilityResult.data?.canGenerate) {
      console.error('❌ User not eligible:', eligibilityResult)
      notificationStore.showWarning(
        eligibilityResult.message || 'You are not eligible to generate passes at this time.'
      )
      
      // Refresh limits from server
      await loadPassesFromAWS()
      isGeneratingPass.value = false
      return
    }
    
    console.log('✅ Eligibility check passed:', eligibilityResult.data)

    // Check location restriction before creating pass
    console.log('🔍 Validating location for guest pass generation...')
    isValidatingLocation.value = true
    
    try {
      const locationCheckService = (await import('../../services/locationCheckService')).default
      // Pass current project ID so it only checks location if THIS project has restrictions
      const locationValidation = await locationCheckService.validateGuestPassLocation(projectId)
      
      if (!locationValidation.allowed) {
        console.error('❌ Location validation failed:', locationValidation)
        
        let errorMessage = locationValidation.message || 'Location check failed'
        
        // Add distance info if available
        if (locationValidation.nearestProject) {
          const locationService = (await import('../../services/locationService')).default
          const distanceText = locationService.formatDistance(locationValidation.nearestProject.distance)
          errorMessage += `\n\nNearest project: ${locationValidation.nearestProject.project.name} (${distanceText} away)`
        }
        
        // Add permission guidance for permission errors (platform-specific)
        if (locationValidation.reason === 'location_unavailable') {
          const isIOS = window.location.protocol === 'capacitor:' || window.webkit?.messageHandlers !== undefined
          if (isIOS) {
            errorMessage += '\n\nTo enable location:\nSettings → PRE Group → Location → While Using the App'
          } else {
            errorMessage += '\n\nTo enable location:\nSettings → Apps → PRE Group → Permissions → Location'
          }
        }
        
        isValidatingLocation.value = false
        isGeneratingPass.value = false
        notificationStore.showWarning(errorMessage)
        return
      }
      
      console.log('✅ Location validation passed:', locationValidation.message)
      isValidatingLocation.value = false
    } catch (error) {
      isValidatingLocation.value = false
      console.error('⚠️ Location validation error:', error)
      console.log('⚠️ Continuing anyway - location check will be enforced after permissions are granted')
      // Don't return - allow pass generation to continue
      // This is temporary until permissions boot file is deployed
    }

    // Get user name from Cognito attributes
    const userName = user.attributes?.name || 
                     user.attributes?.fullName || 
                     user.cognitoAttributes?.name ||
                     user.cognitoAttributes?.fullName ||
                     user.displayName || 
                     user.email || 
                     'Unknown User'
    
    // userId is already declared above (line 1543), reuse it
    const result = await createGuestPass(
      projectId,
      userId,
      userName,
      sanitizedGuestName,
      sanitizedPurpose,
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
      validUntil: result.data.validUntil,
      status: 'active',
      createdAt: result.data.createdAt || new Date().toISOString(),
      code: result.passId,
      firebaseRef: result.passRef,
      qrCodeUrl: result.qrCodeUrl,
      used: false,
      usedAt: null,
    }
    
    console.log('✅ Pass object created:', { id: pass.id, projectId: pass.projectId })

    // Add pass to beginning for immediate UI feedback
    passes.value.unshift(pass)
    
    // Reset displayed count to show the new pass (ensure at least 5 are shown)
    displayedPassesCount.value = Math.max(5, Math.min(displayedPassesCount.value, passes.value.length))

    // Update limits locally for immediate feedback
    passLimits.value.usedThisMonth = (passLimits.value.usedThisMonth || 0) + 1
    passLimits.value.remainingQuota = Math.max(0, passLimits.value.monthlyLimit - passLimits.value.usedThisMonth)

    console.log('✅ Pass added, new count:', passLimits.value)

    newPass.value = {
      guestName: '',
      purpose: '',
    }

    showGenerateDialog.value = false

    // Generate QR code for in-app display (async, non-blocking)
    await nextTick()
    setTimeout(async () => {
      await generateQRCode(pass)
    }, 100)

    // Share pass link immediately via native share dialog
    try {
      console.log('🔗 Sharing guest pass link...')
      const result = await sharingService.sharePassWithLink(pass)

        if (result.success) {
          notificationStore.showSuccess(result.message || 'Pass shared successfully!')
        
        // Mark pass as sent
      if (pass.firebaseRef) {
        const projectId = projectStore.selectedProject?.id
        if (projectId) {
          await markPassAsSent(pass.firebaseRef, projectId)
        }
        }
      } else if (result.message !== 'Share cancelled') {
        throw new Error(result.message || 'Sharing failed')
      }
    } catch (shareError) {
      console.warn('⚠️ Sharing failed:', shareError?.message || JSON.stringify(shareError) || shareError)
      
      // Don't show error if user cancelled
      if (shareError.message && !shareError.message.includes('cancelled')) {
      notificationStore.showWarning(
          `Pass generated successfully. You can share it manually from the list below.`,
      )
    }
    }
    
    isGeneratingPass.value = false
  } catch (error) {
    console.error('Error generating pass:', error?.message || JSON.stringify(error) || error)
    notificationStore.showError(error.message || 'Failed to generate pass')
    isGeneratingPass.value = false
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
  // Determine if Arabic mode
  const isArabic = locale.value === 'ar-SA' || locale.value.startsWith('ar')
  const dateLocale = isArabic ? 'ar-EG' : 'en-GB'
  
  // Set font properties with Arabic support
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'

  // Draw title "Gate Pass" - larger and bolder
  ctx.font = 'bold 32px Arial, sans-serif'
  const titleText = isArabic ? 'تصريح الدخول' : 'Gate Pass'
  ctx.fillText(titleText, canvasWidth / 2, 40)

  // Draw subtitle "One Time Pass" - smaller
  ctx.font = '16px Arial, sans-serif'
  const subtitleText = isArabic ? 'تصريح لمرة واحدة' : 'One Time Pass'
  ctx.fillText(subtitleText, canvasWidth / 2, 65)

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

  ctx.fillStyle = '#000000'

  if (isArabic) {
    // RTL layout for Arabic - Right side: Unit and Visitor info
    ctx.textAlign = 'right'
    
    // Unit info
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillText('الوحدة', canvasWidth - infoBarPadding, infoBarY + 25)
    ctx.font = '13px Arial, sans-serif'
    const unitInfo = getUserUnitInfo()
    ctx.fillText(unitInfo, canvasWidth - infoBarPadding, infoBarY + 42)
    
    // Visitor info
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillText('الزائر', canvasWidth - infoBarPadding, infoBarY + 62)
    ctx.font = '13px Arial, sans-serif'
    ctx.fillText(pass.guestName, canvasWidth - infoBarPadding, infoBarY + 79)
    
    // Left side: Date and Inviter info
    ctx.textAlign = 'left'
    
    // Date info
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillText('التاريخ', infoBarPadding, infoBarY + 25)
    ctx.font = '13px Arial, sans-serif'
    const validDate = new Date(pass.validUntil).toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      calendar: 'gregory'
    })
    ctx.fillText(validDate, infoBarPadding, infoBarY + 42)
    
    // Inviter info
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillText('المُضيف', infoBarPadding, infoBarY + 62)
    ctx.font = '13px Arial, sans-serif'
    const inviterName = pass.userName || 'مستخدم غير معروف'
    ctx.fillText(inviterName, infoBarPadding, infoBarY + 79)
  } else {
    // LTR layout for English - Left side: Unit and Visitor info
    ctx.textAlign = 'left'
    
    // Unit info
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillText('Unit', infoBarPadding, infoBarY + 25)
    ctx.font = '13px Arial, sans-serif'
    const unitInfo = getUserUnitInfo()
    ctx.fillText(unitInfo, infoBarPadding, infoBarY + 42)
    
    // Visitor info
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillText('Visitor', infoBarPadding, infoBarY + 62)
    ctx.font = '13px Arial, sans-serif'
    ctx.fillText(pass.guestName, infoBarPadding, infoBarY + 79)
    
    // Right side: Date and Inviter info
    ctx.textAlign = 'right'
    
    // Date info
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillText('Date', canvasWidth - infoBarPadding, infoBarY + 25)
    ctx.font = '13px Arial, sans-serif'
    const validDate = new Date(pass.validUntil).toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    ctx.fillText(validDate, canvasWidth - infoBarPadding, infoBarY + 42)
    
    // Inviter info
    ctx.font = 'bold 13px Arial, sans-serif'
    ctx.fillText('Inviter', canvasWidth - infoBarPadding, infoBarY + 62)
    ctx.font = '13px Arial, sans-serif'
    const inviterName = pass.userName || 'Unknown User'
    ctx.fillText(inviterName, canvasWidth - infoBarPadding, infoBarY + 79)
  }
}

// eslint-disable-next-line no-unused-vars
const deletePass = async (passId) => {
  try {
    const projectId = projectStore.selectedProject?.id
    if (!projectId) {
      notificationStore.showError('No project selected')
      return
    }

    // Soft delete in Firestore by adding 'deleted' field
    await firestoreService.updateDoc(
      `projects/${projectId}/guestPasses/${passId}`,
      {
        deleted: true,
        deletedAt: new Date().toISOString(),
      }
    )

    // Remove from UI only (soft delete means it still counts toward limit)
  passes.value = passes.value.filter((p) => p.id !== passId)
  qrRefs.delete(passId)
  
    // DON'T decrease the count - soft deleted passes still count toward monthly limit
    
    notificationStore.showSuccess('Pass deleted successfully')
  } catch (error) {
    console.error('Error deleting pass:', error)
    notificationStore.showError('Failed to delete pass')
  }
}

const sharePass = async (pass) => {
  try {
    console.log('🔗 Sharing guest pass:', pass.id)
    
    const result = await sharingService.sharePassWithLink(pass)

    if (result.success) {
      notificationStore.showSuccess(result.message || 'Pass shared successfully!')
      
      // Mark pass as sent if it has a Firebase reference
      if (pass.firebaseRef) {
        const projectId = projectStore.selectedProject?.id
        if (projectId) {
          await markPassAsSent(pass.firebaseRef, projectId)
        }
      }
    } else if (result.message !== 'Share cancelled') {
      throw new Error(result.message || 'Sharing failed')
    }
  } catch (error) {
    console.error('❌ Error sharing pass:', error)
    
    // Don't show error if user cancelled
    if (error.message && !error.message.includes('cancelled')) {
      notificationStore.showError('Failed to share pass. Please try again.')
    }
  }
}

const formatCreationDate = (dateString) => {
  if (!dateString) return 'Unknown date'
  
  try {
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString)
      return 'Invalid date'
    }
    
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  } catch (error) {
    console.error('Error formatting creation date:', error, dateString)
    return 'Invalid date'
  }
}

const isPassExpired = (pass) => {
  if (!pass || !pass.validUntil) return false
  
  try {
  const now = new Date()
  const expiryDate = new Date(pass.validUntil)
    
    // Check if date is valid
    if (isNaN(expiryDate.getTime())) {
      console.error('Invalid expiry date:', pass.validUntil)
      return false
    }
    
  return now > expiryDate
  } catch (error) {
    console.error('Error checking expiration:', error)
    return false
  }
}

const isPassExpiringSoon = (pass) => {
  if (!pass || !pass.validUntil || isPassExpired(pass)) return false
  
  try {
  const now = new Date()
  const expiryDate = new Date(pass.validUntil)
    
    // Check if date is valid
    if (isNaN(expiryDate.getTime())) {
      return false
    }
    
  const remainingMs = expiryDate - now
  const remainingMins = Math.floor(remainingMs / 60000)
  return remainingMins < 30 && remainingMins > 0
  } catch (error) {
    console.error('Error checking if expiring soon:', error)
    return false
  }
}

const getRemainingTime = (pass) => {
  if (!pass) return 'Unknown'
  if (pass.used) return 'Used'
  if (!pass.validUntil) return 'No expiry'
  
  try {
  const now = new Date()
  const expiryDate = new Date(pass.validUntil)
    
    // Check if date is valid
    if (isNaN(expiryDate.getTime())) {
      console.error('Invalid validUntil date:', pass.validUntil)
      return 'Invalid date'
    }
    
  const remainingMs = expiryDate - now
  
  if (remainingMs < 0) return 'Expired'
  
  const remainingMins = Math.floor(remainingMs / 60000)
  const remainingHours = Math.floor(remainingMs / 3600000)
  const remainingDays = Math.floor(remainingMs / 86400000)
  
  if (remainingDays > 0) return `${remainingDays}d ${remainingHours % 24}h left`
  if (remainingHours > 0) return `${remainingHours}h ${remainingMins % 60}m left`
  if (remainingMins > 0) return `${remainingMins}m left`
  return 'Expiring soon'
  } catch (error) {
    console.error('Error calculating remaining time:', error)
    return 'Unknown'
  }
}

const getPassStatusClass = (pass) => {
  if (pass.used) return 'status-used'
  if (isPassExpired(pass)) return 'status-expired'
  if (isPassExpiringSoon(pass)) return 'status-expiring'
  return 'status-active'
}

const getPassStatusText = (pass) => {
  if (pass.used) return 'Used'
  if (isPassExpired(pass)) return 'Expired'
  if (isPassExpiringSoon(pass)) return 'Expiring Soon'
  return 'Active'
}

// Watch for user changes
watch(
  () => auth.currentUser?.uid,
  async (newUserId, oldUserId) => {
    if (newUserId !== oldUserId) {
      passes.value = []
      qrRefs.clear()
      displayedPassesCount.value = 5 // Reset pagination

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

// Watch for project changes to reset pagination
watch(
  () => projectStore.selectedProject?.id,
  () => {
    displayedPassesCount.value = 5 // Reset to 5 when switching projects
  }
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
      loadPassesFromAWS(), // This also sets passLimits
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
  color: rgba(0, 0, 0, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.tab-button.active {
  color: white;
}

.tab-icon {
  transition: transform 0.3s ease;
  color: rgba(0, 0, 0, 0.6);
}

.tab-button.active .tab-icon {
  transform: scale(1.1);
  color: white;
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
  gap: 10px;
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

/* Load More Button */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 16px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.load-more-btn:hover {
  background: #f9fafb;
  border-color: #AF1E23;
  color: #AF1E23;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.15);
}

.load-more-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.load-more-btn svg {
  transition: transform 0.2s ease;
}

.load-more-btn:hover svg {
  transform: translateY(2px);
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

/* Compact Pass Card Design */
.pass-card-compact {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  animation: fadeIn 0.3s ease;
  border: 1px solid #e5e7eb;
}

.pass-card-compact.pass-used {
  opacity: 0.65;
  background: #fafafa;
}

.pass-card-compact.pass-expired {
  opacity: 0.65;
  background: #fef2f2;
  border-color: #fecaca;
}

.pass-card-compact:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Compact Header */
.pass-compact-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.pass-icon-compact {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #AF1E23 0%, #d42028 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.pass-info-compact {
  flex: 1;
  min-width: 0;
}

.pass-name-compact {
  margin: 0 0 4px 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.pass-meta-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-item svg {
  flex-shrink: 0;
}

.meta-item.text-red {
  color: #dc2626;
  font-weight: 600;
}

.meta-divider {
  color: #d1d5db;
}

.pass-status-compact {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.pass-status-compact.status-active {
  background: #d1fae5;
  color: #065f46;
}

.pass-status-compact.status-expiring {
  background: #fef3c7;
  color: #92400e;
}

.pass-status-compact.status-expired {
  background: #fee2e2;
  color: #991b1b;
}

.pass-status-compact.status-used {
  background: #f3f4f6;
  color: #4b5563;
}

/* Compact Actions */
.pass-actions-compact {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.pass-btn-compact {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pass-share-compact {
  background: #AF1E23;
  color: white;
}

.pass-share-compact:active:not(:disabled) {
  transform: scale(0.97);
  background: #8A1820;
}

.pass-share-compact:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.pass-delete-compact {
  flex: 0 0 auto;
  width: 40px;
  padding: 0;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.pass-delete-compact:active {
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
  line-height: normal;
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

/* RTL Support for Arabic */
[dir="rtl"] .access-page {
  direction: rtl;
}

[dir="rtl"] .tabs-container {
  direction: ltr;
}

[dir="rtl"] .tabs-wrapper {
  direction: ltr;
  flex-direction: row;
}

[dir="rtl"] .tab-button {
  flex-direction: row-reverse;
  direction: rtl;
}

[dir="rtl"] .tab-icon {
  transform: scaleX(1) !important;
}

[dir="rtl"] .tab-button.active .tab-icon {
  transform: scale(1.1) !important;
}

[dir="rtl"] .tab-label {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .modal-header-content {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-close-pro {
  margin-right: auto;
  margin-left: 0;
}

[dir="rtl"] .form-label-pro {
  flex-direction: row-reverse;
  text-align: right;
}

[dir="rtl"] .required-star {
  margin-left: 0;
  margin-right: auto;
}

[dir="rtl"] .form-input-pro {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .info-box-pro {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .info-box-pro svg {
  margin-left: 12px;
  margin-right: 0;
}

[dir="rtl"] .modal-footer-pro {
  flex-direction: row-reverse;
}

[dir="rtl"] .modal-btn-generate {
  flex-direction: row-reverse;
}

[dir="rtl"] .pass-compact-header {
  flex-direction: row-reverse;
}

[dir="rtl"] .pass-info-compact {
  text-align: right;
}

[dir="rtl"] .pass-meta-compact {
  direction: rtl;
}

[dir="rtl"] .pass-actions-compact {
  flex-direction: row-reverse;
}

[dir="rtl"] .ble-panel {
  direction: rtl;
}

[dir="rtl"] .status-card {
  text-align: center;
}

[dir="rtl"] .control-buttons {
  direction: rtl;
}

[dir="rtl"] .action-button {
  flex-direction: row-reverse;
}

[dir="rtl"] .status-message {
  direction: rtl;
  text-align: right;
  flex-direction: row-reverse;
}

[dir="rtl"] .warning-banner {
  direction: rtl;
  text-align: right;
  flex-direction: row-reverse;
}

[dir="rtl"] .warning-content {
  text-align: right;
}
</style>
