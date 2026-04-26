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
            <!-- Bluetooth Status Card (JDAR-style layout) -->
            <div
              class="status-card"
              :class="[
                { 'status-card--active': isSessionActive },
                gatePhase === 'error' ? 'status-card--error' : '',
              ]"
              @click="!isSessionActive && startGateSession()"
            >
              <div class="bluetooth-icon-wrapper">
                <div
                  class="bluetooth-icon"
                  :class="{
                    connected: gatePhase === 'confirmed',
                    connecting: gatePhase === 'broadcasting' || gatePhase === 'scanning',
                  }"
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
                  <div
                    v-if="gatePhase === 'broadcasting' || gatePhase === 'scanning'"
                    class="pulse-ring"
                  ></div>
                </div>
              </div>

              <!-- Connection Status -->
              <div class="status-info">
                <div v-if="gatePhase === 'confirmed'" class="status-badge connected">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>Gate opened</span>
                </div>
                <div v-else-if="gatePhase === 'broadcasting'" class="status-badge connecting">
                  <div class="spinner"></div>
                  <span>Searching for nearby gates...</span>
                </div>
                <div v-else-if="gatePhase === 'scanning'" class="status-badge connecting">
                  <div class="spinner"></div>
                  <span>Connecting to the gate...</span>
                </div>
                <div
                  v-else-if="gatePhase === 'error'"
                  class="status-badge disconnected status-badge--error"
                >
                  <svg
                    class="status-badge__icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                    <line
                      x1="12"
                      y1="8"
                      x2="12"
                      y2="13"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <circle cx="12" cy="16" r="1.4" fill="currentColor" />
                  </svg>
                  <div class="status-badge__text">
                    <span class="status-badge__title">
                      {{
                        statusMessage === 'No suitable gate detected nearby'
                          ? 'No suitable gate detected'
                          : 'Connection issue'
                      }}
                    </span>
                    <span class="status-badge__subtitle" v-if="bleErrorDetail === 'off'">
                      Bluetooth is off - enable it in Settings to open the gate.
                    </span>
                    <span
                      class="status-badge__subtitle"
                      v-else-if="bleErrorDetail === 'unauthorized'"
                    >
                      Bluetooth permission denied - enable it in Settings.
                    </span>
                    <span class="status-badge__subtitle" v-else>
                      {{ statusMessage || 'Something went wrong while connecting to the gate.' }}
                    </span>
                  </div>
                </div>
                <div v-else class="status-badge disconnected">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <span>Ready</span>
                </div>
              </div>
            </div>
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
              <strong>{{
                userBlockingStatus.blockingDetails?.global
                  ? 'Temporarily Disabled'
                  : 'Access Restricted'
              }}</strong>
              <p>
                {{
                  userBlockingStatus.blockingDetails?.reason ||
                  'You are currently blocked from generating passes. Please contact support for assistance.'
                }}
              </p>
            </div>
          </div>

          <div class="passes-panel">
            <!-- Generate Pass Button -->
            <button
              class="generate-pass-button"
              :disabled="isGeneratePassDisabled || userBlockingStatus.isBlocked"
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
              <span>{{ $t('generatePass') || 'Generate Pass' }}</span>
              <span
                v-if="passLimits.dailyLimit !== null && passLimits.dailyLimit !== undefined"
                class="generate-pass-counter"
              >
                {{ `${passLimits.usedToday || 0}/${passLimits.dailyLimit}` }}
              </span>
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
              <div
                v-for="pass in displayedPasses"
                :key="pass.id"
                class="pass-card-compact"
                :class="{ 'pass-used': pass.used, 'pass-expired': isPassExpired(pass) }"
              >
                <!-- Hidden canvas for QR code generation (for legacy passes) -->
                <canvas :ref="(el) => setQRRef(el, pass.id)" class="qr-code-hidden"></canvas>

                <!-- Compact Pass Layout -->
                <div class="pass-compact-header">
                  <!-- Icon and Name -->
                  <div class="pass-icon-compact">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <div class="pass-info-compact">
                    <h3 class="pass-name-compact">{{ pass.guestName || 'Guest' }}</h3>
                    <div class="pass-meta-compact">
                      <span class="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                          <path
                            d="M12 6v6l4 2"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                          />
                        </svg>
                        {{ formatCreationDate(pass.createdAt) }}
                      </span>
                      <span class="meta-divider">•</span>
                      <span
                        class="meta-item"
                        :class="{ 'text-red': isPassExpiringSoon(pass) || isPassExpired(pass) }"
                      >
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
                    :disabled="pass.used || isPassExpired(pass) || sharingPassId === pass.id"
                  >
                    <template v-if="pass.used">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                        <polyline
                          points="9 12 11 14 15 10"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Used
                    </template>
                    <template v-else-if="isPassExpired(pass)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                        <line
                          x1="12"
                          y1="8"
                          x2="12"
                          y2="12"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                        <line
                          x1="12"
                          y1="16"
                          x2="12.01"
                          y2="16"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </svg>
                      Expired
                    </template>
                    <template v-else>
                      <span v-if="sharingPassId === pass.id">Sharing...</span>
                      <template v-else>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2" />
                          <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                          <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2" />
                          <line
                            x1="8.59"
                            y1="13.51"
                            x2="15.42"
                            y2="17.49"
                            stroke="currentColor"
                            stroke-width="2"
                          />
                          <line
                            x1="15.41"
                            y1="6.51"
                            x2="8.59"
                            y2="10.49"
                            stroke="currentColor"
                            stroke-width="2"
                          />
                        </svg>
                        {{ $t('shareQrImage') || 'Share QR Image' }}
                      </template>
                    </template>
                  </button>
                </div>
              </div>
            </div>

            <!-- Load More Button -->
            <div v-if="hasMorePasses" class="load-more-container">
              <button @click="loadMorePasses" class="load-more-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12l7 7 7-7"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Load More ({{ currentProjectPasses.length - displayedPassesCount }} more)
              </button>
            </div>

            <!-- Loading State -->
            <div v-else-if="isLoadingPasses" class="empty-state">
              <q-spinner-dots color="primary" size="48px" />
              <p style="margin-top:12px;opacity:0.6">Loading passes...</p>
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
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showGenerateDialog"
          class="modal-overlay"
          @click.self="showGenerateDialog = false"
        >
          <div class="modal-container-pro" @click.stop>
            <!-- Modal Header -->
            <div class="modal-header-pro">
              <div class="modal-header-content">
                <div class="modal-icon">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      stroke="currentColor"
                      stroke-width="2"
                      rx="2"
                    />
                    <rect
                      x="5"
                      y="5"
                      width="6"
                      height="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <rect
                      x="13"
                      y="5"
                      width="6"
                      height="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <rect
                      x="5"
                      y="13"
                      width="6"
                      height="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                  </svg>
                </div>
                <div>
                  <h2 class="modal-title-pro">{{ $t('generateNewPass') || 'New Guest Pass' }}</h2>
                  <p class="modal-subtitle-pro">
                    {{ $t('generateQRCodeForGate') || 'Generate QR code for gate access' }}
                  </p>
                </div>
              </div>
              <button class="modal-close-pro" @click="showGenerateDialog = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body-pro">
              <div class="form-group-pro">
                <label class="form-label-pro">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
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
              <div
                v-if="locationRestriction.active"
                class="info-box-pro"
                style="
                  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                  border-color: #fecaca;
                "
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
                </svg>
                <p style="color: #7f1d1d">
                  <strong>{{
                    $t('locationVerificationRequired') || 'Location verification required.'
                  }}</strong
                  ><br />
                  {{
                    $t('mustBeWithinProjectPremises') ||
                    'You must be within the project premises. The app will request location access when you generate the pass.'
                  }}
                </p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer-pro">
              <button
                class="modal-btn-cancel"
                @click="showGenerateDialog = false"
                :disabled="isValidatingLocation"
              >
                {{ $t('cancel') || 'Cancel' }}
              </button>
              <button
                class="modal-btn-generate"
                :disabled="!newPass.guestName || isValidatingLocation || isGeneratingPass"
                @click="generatePass"
              >
                <div v-if="isValidatingLocation || isGeneratingPass" class="button-spinner"></div>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2" />
                  <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2" />
                  <line
                    x1="8.59"
                    y1="13.51"
                    x2="15.42"
                    y2="17.49"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <line
                    x1="15.41"
                    y1="6.51"
                    x2="8.59"
                    y2="10.49"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                <span>{{
                  isValidatingLocation
                    ? $t('checkingLocation') || 'Checking Location...'
                    : $t('generateAndShare') || 'Generate & Share'
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Generated Pass Preview Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div
          v-if="showGeneratedPassPreview && generatedPassPreview"
          class="modal-overlay"
          @click.self="closeGeneratedPassPreview"
        >
          <div class="modal-container-pro preview-modal-container" @click.stop>
            <div class="modal-header-pro">
              <div class="modal-header-content">
                <div class="modal-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      stroke="currentColor"
                      stroke-width="2"
                      rx="2"
                    />
                    <rect
                      x="5"
                      y="5"
                      width="6"
                      height="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <rect
                      x="13"
                      y="5"
                      width="6"
                      height="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                    <rect
                      x="5"
                      y="13"
                      width="6"
                      height="6"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />
                  </svg>
                </div>
                <div>
                  <h2 class="modal-title-pro">Pass Created</h2>
                  <p class="modal-subtitle-pro">Preview and share guest QR image</p>
                </div>
              </div>
              <button class="modal-close-pro" @click="closeGeneratedPassPreview">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line
                    x1="18"
                    y1="6"
                    x2="6"
                    y2="18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
            <div class="modal-body-pro preview-modal-body">
              <img
                v-if="generatedPassPreviewImage"
                :src="generatedPassPreviewImage"
                alt="Guest pass QR preview"
                class="generated-pass-preview-image"
              />
              <div v-else class="preview-image-fallback">Preview unavailable</div>
            </div>
            <div class="modal-footer-pro">
              <button class="modal-btn-cancel" @click="closeGeneratedPassPreview">Close</button>
              <button
                class="modal-btn-generate"
                @click="shareGeneratedPass"
                :disabled="isSharingGeneratedPass"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2" />
                  <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2" />
                  <line
                    x1="8.59"
                    y1="13.51"
                    x2="15.42"
                    y2="17.49"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <line
                    x1="15.41"
                    y1="6.51"
                    x2="8.59"
                    y2="10.49"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                </svg>
                <span>{{
                  isSharingGeneratedPass
                    ? $t('sharing') || 'Sharing...'
                    : $t('shareQrImage') || 'Share QR Image'
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Floating Quick Action -->
    <transition name="fab">
      <button
        v-if="false && lastConnectedDevice && !isConnected && activeTab === 'ble'"
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useBluetooth } from '../../composables/useBluetooth'
import { useFormKeyboard } from '../../composables/useFormKeyboard'
import { useModalState } from '../../composables/useModalState'
import QRCode from 'qrcode'
import appLogo from '../../assets/logo.png'
import PageHeader from '../../components/PageHeader.vue'
import sharingService from '../../services/whatsappService'
import { createGuestPass, markPassAsSent, checkUserEligibility, getGuestPassesForUnit, getUserStatus } from '../../api/guestPassAPI'
import { smartMirrorAuth as auth, smartMirrorDb as db } from '../../boot/smartMirrorFirebase'
import firestoreService from '../../services/firestoreService'
import optimizedAuthService from '../../services/optimizedAuthService'
import { useNotificationStore } from '../../stores/notifications'
import { useProjectStore } from '../../stores/projectStore'
import {
  getGateByKey,
  getGateSystemForProject,
} from '../../constants/gateConfig'
import { logResidentEntry } from '../../services/gateEntryLogService'

defineOptions({
  name: 'AccessPage',
})

// Setup keyboard handling
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
})

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()
const projectStore = useProjectStore()
const { openModal, closeModal } = useModalState()

// Tab state
const activeTab = ref('ble')

// Use bluetooth composable
const {
  isConnected,
  deviceName,
  checkBLESupport,
  connect,
  scanAndConnectNearest,
  read,
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
const gatePhase = ref('ready')
const bleErrorDetail = ref('')
const activeGateKey = ref('main')

let phaseTimer = null
let resetTimer = null

const ACCESS_GRANTED = 'ACCESS_GRANTED'
const ACCESS_DENIED = 'ACCESS_DENIED'

const clearGateTimers = () => {
  if (phaseTimer) {
    clearTimeout(phaseTimer)
    phaseTimer = null
  }
  if (resetTimer) {
    clearTimeout(resetTimer)
    resetTimer = null
  }
}

const isSessionActive = computed(() => {
  return gatePhase.value === 'broadcasting' || gatePhase.value === 'scanning'
})

const currentProjectId = computed(() => projectStore.selectedProject?.id || null)
const currentGateSystem = computed(() => getGateSystemForProject(currentProjectId.value))
const activeGate = computed(() => getGateByKey(currentProjectId.value, activeGateKey.value))
const currentServiceUUID = computed(() => currentGateSystem.value.serviceUUID)
const currentCharacteristicUUID = computed(() => currentGateSystem.value.characteristicUUID)
const currentGatePassword = computed(() => currentGateSystem.value.password)
const currentGateBleName = computed(() => activeGate.value?.bleName || null)
const currentGateDeviceNames = computed(() => currentGateSystem.value.deviceNames || [])
const currentGateScanDurationMs = computed(() => currentGateSystem.value.scanDurationMs || 3000)
const currentGateVeryCloseRssiMin = computed(() => currentGateSystem.value.veryCloseRssiMin ?? -55)

// Passes state
const passes = ref([])
const isLoadingPasses = ref(false)
const showGenerateDialog = ref(false)
const showGeneratedPassPreview = ref(false)
const generatedPassPreview = ref(null)
const generatedPassPreviewImage = ref('')
const isValidatingLocation = ref(false)
const isGeneratingPass = ref(false)
const sharingPassId = ref(null)
const isSharingGeneratedPass = ref(false)
const currentUserDisplayName = ref('')
const displayedPassesCount = ref(5) // Show 5 passes initially

// Watch for modal state to hide bottom navigation
watch(showGenerateDialog, (isOpen) => {
  if (isOpen) {
    openModal()
  } else {
    closeModal()
  }
})

watch(showGeneratedPassPreview, (isOpen) => {
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
  monthlyLimit: null,
  usedThisMonth: 0,
  remainingQuota: null,
  dailyLimit: null,
  usedToday: 0,
  dailyRemainingQuota: null,
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

const isGeneratePassDisabled = computed(() => {
  const hasMonthlyLimit = passLimits.value.monthlyLimit !== null && passLimits.value.monthlyLimit !== undefined
  const monthlyReached = hasMonthlyLimit && (passLimits.value.usedThisMonth || 0) >= passLimits.value.monthlyLimit
  const hasDailyLimit = passLimits.value.dailyLimit !== null && passLimits.value.dailyLimit !== undefined
  const dailyReached = hasDailyLimit && (passLimits.value.usedToday || 0) >= passLimits.value.dailyLimit
  return monthlyReached || dailyReached
})

// User unit information
const userUnitInfo = ref('')

// QR refs
const qrRefs = new Map()
const qrImageCache = new Map()
let logoImagePromise = null

const buildPassRenderKey = (pass) => {
  const payload = {
    id: pass?.id || pass?.code || '',
    code: pass?.code || pass?.id || '',
    projectId: pass?.projectId || projectStore.selectedProject?.id || '',
    verificationToken: pass?.verificationToken || '',
    cardId: pass?.cardId || '',
    guestName: pass?.guestName || '',
    validUntil: pass?.validUntil || '',
    createdAt: pass?.createdAt || '',
    unit: pass?.unit || '',
    purpose: pass?.purpose || '',
    owner: pass?.userName || pass?.ownerName || pass?.inviterName || '',
  }
  return JSON.stringify(payload)
}

const getCachedPassImage = (pass) => {
  const renderKey = buildPassRenderKey(pass)
  const fromMap = qrImageCache.get(renderKey)
  if (fromMap) return fromMap

  const inline = typeof pass?.qrImageDataUrl === 'string' ? pass.qrImageDataUrl.trim() : ''
  if (inline.startsWith('data:image/')) {
    qrImageCache.set(renderKey, inline)
    return inline
  }
  return ''
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const getDisplayNameFromEmail = (email) => {
  const value = String(email || '').trim()
  if (!value || !value.includes('@')) return ''
  const localPart = value.split('@')[0] || ''
  if (!localPart) return ''
  return localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

const getNativePlatform = () => {
  try {
    return window.Capacitor?.getPlatform?.() || ''
  } catch {
    return ''
  }
}

const isAndroidNativeApp = () => {
  if (getNativePlatform() === 'android') return true
  return /android/i.test(navigator?.userAgent || '')
}

const getUserIdentifierCandidates = (user) => {
  const candidates = [
    user?.attributes?.sub,
    user?.cognitoAttributes?.sub,
    user?.userSub,
    user?.uid,
    user?.id,
    user?.username,
    user?.attributes?.email,
    user?.cognitoAttributes?.email,
    user?.email,
  ]

  return [...new Set(candidates.map((v) => String(v || '').trim()).filter(Boolean))]
}

const isUserNotFoundError = (errorLike) => {
  const text = String(errorLike?.message || errorLike?.error || '').toLowerCase()
  return text.includes('user not found')
}

const isUserNotFoundResult = (result) => {
  const reason = String(result?.data?.reason || '').toLowerCase()
  const message = String(result?.message || '').toLowerCase()
  return reason === 'user_not_found' || message.includes('user not found')
}

const getPrimaryUserIdentifier = (user) => {
  const candidates = getUserIdentifierCandidates(user)
  return candidates[0] || ''
}

const normalizePassIdentifier = (value) => String(value || '').trim().toLowerCase()

const buildCurrentUserIdentifierSet = (user, resolvedUserId = '') => {
  const set = new Set()
  for (const candidate of getUserIdentifierCandidates(user)) {
    const normalized = normalizePassIdentifier(candidate)
    if (normalized) set.add(normalized)
  }
  const resolved = normalizePassIdentifier(resolvedUserId)
  if (resolved) set.add(resolved)
  return set
}

const doesPassBelongToCurrentUser = (passData, currentUserIdentifierSet) => {
  if (!(currentUserIdentifierSet instanceof Set) || currentUserIdentifierSet.size === 0) return false
  const passIdentifiers = [
    passData?.userId,
    passData?.uid,
    passData?.authUid,
    passData?.createdBy,
    passData?.createdByUserId,
    passData?.ownerId,
  ]
    .map(normalizePassIdentifier)
    .filter(Boolean)

  return passIdentifiers.some((identifier) => currentUserIdentifierSet.has(identifier))
}

const getUserStatusWithAndroidFallback = async (user, projectId) => {
  const ids = getUserIdentifierCandidates(user)
  if (ids.length === 0) {
    throw new Error('Unable to get user ID. Please log out and log back in.')
  }

  const androidOnlyFallback = isAndroidNativeApp()
  let lastError = null

  for (let i = 0; i < ids.length; i += 1) {
    const candidateId = ids[i]
    try {
      const status = await getUserStatus(candidateId, projectId)
      return {
        status,
        resolvedUserId: status?.data?.userId || candidateId,
      }
    } catch (error) {
      lastError = error
      const canRetry = androidOnlyFallback && isUserNotFoundError(error) && i < ids.length - 1
      if (!canRetry) {
        throw error
      }
      console.warn('⚠️ Android fallback: getUserStatus retrying with alternate identifier')
    }
  }

  throw lastError || new Error('User status lookup failed')
}

const checkEligibilityWithAndroidFallback = async (projectId, user) => {
  const ids = getUserIdentifierCandidates(user)
  if (ids.length === 0) {
    throw new Error('Unable to get user ID. Please log out and log back in.')
  }

  const androidOnlyFallback = isAndroidNativeApp()
  let lastResult = null

  for (let i = 0; i < ids.length; i += 1) {
    const candidateId = ids[i]
    const result = await checkUserEligibility(projectId, candidateId)
    lastResult = result

    if (result?.success && result?.data?.canGenerate) {
      return {
        result,
        resolvedUserId: result?.data?.user?.id || candidateId,
      }
    }

    const canRetry = androidOnlyFallback && isUserNotFoundResult(result) && i < ids.length - 1
    if (!canRetry) {
      return {
        result,
        resolvedUserId: candidateId,
      }
    }

    console.warn('⚠️ Android fallback: checkUserEligibility retrying with alternate identifier')
  }

  return {
    result: lastResult,
    resolvedUserId: ids[0],
  }
}

const isLikelyEmail = (value) => {
  const text = String(value || '').trim()
  return Boolean(text) && text.includes('@')
}

const cleanCandidateName = (value) => {
  const text = String(value || '').trim()
  if (!text) return ''
  if (isLikelyEmail(text)) return ''
  const lower = text.toLowerCase()
  if (lower === 'unknown' || lower === 'unknown user' || lower === 'n/a') return ''
  return text
}

const resolveUserDisplayName = (userLike) => {
  if (!userLike) return ''
  const attributes = userLike.attributes || userLike.cognitoAttributes || {}
  const candidates = [
    attributes.name,
    attributes.fullName,
    attributes.displayName,
    [attributes.given_name, attributes.family_name].filter(Boolean).join(' '),
    userLike.fullName,
    userLike.displayName,
    [userLike.firstName, userLike.lastName].filter(Boolean).join(' '),
    userLike.name,
    userLike.username,
    attributes.preferred_username,
  ]
  return candidates.map(cleanCandidateName).find(Boolean) || ''
}

const normalizeOwnerName = (ownerValue) => {
  const raw = String(ownerValue || '').trim()
  if (!raw || raw.toLowerCase() === 'unknown user') {
    return cleanCandidateName(currentUserDisplayName.value) || 'User'
  }
  if (isLikelyEmail(raw)) {
    return cleanCandidateName(currentUserDisplayName.value) || 'User'
  }
  return raw
}

const hydrateCurrentUserDisplayName = async (user, userId) => {
  const fromAuth = resolveUserDisplayName(user)
  if (fromAuth) {
    currentUserDisplayName.value = fromAuth
    return
  }

  if (!userId) return
  try {
    const userDoc = await firestoreService.getDoc(`users/${userId}`, { useCache: false })
    const exists = typeof userDoc?.exists === 'function' ? userDoc.exists() : userDoc?.exists !== false
    if (!exists) return
    const data = typeof userDoc.data === 'function' ? userDoc.data() : (userDoc.data || userDoc)
    const fromProfile = resolveUserDisplayName(data)
    if (fromProfile) {
      currentUserDisplayName.value = fromProfile
    }
  } catch (e) {
    console.warn('⚠️ Could not hydrate user display name from profile:', e)
  }
}

/**
 * BLE Functions
 */
const handleConnect = async (gateKey = activeGateKey.value) => {
  try {
    console.log('🔵 Starting BLE connection...')
    statusMessage.value = ''
    bleErrorDetail.value = ''
    activeGateKey.value = gateKey
    if (gatePhase.value !== 'broadcasting') {
      gatePhase.value = currentGateSystem.value.fastMode ? 'scanning' : 'broadcasting'
    }

    const success = currentGateSystem.value.fastMode
      ? (await scanAndConnectNearest(currentServiceUUID.value, {
          deviceNames: currentGateDeviceNames.value,
          timeoutMs: currentGateScanDurationMs.value,
          minRssi: currentGateVeryCloseRssiMin.value,
          scanMode: 2,
        })).success
      : await connect(currentServiceUUID.value, {
          name: currentGateBleName.value,
          scanMode: undefined,
        })

    if (success) {
      lastConnectedDevice.value = {
        name: 'gate',
        serviceUUID: currentServiceUUID.value,
        gateKey: activeGateKey.value,
        timestamp: Date.now(),
      }
      localStorage.setItem('lastGateDevice', JSON.stringify(lastConnectedDevice.value))

      statusMessage.value = currentGateSystem.value.fastMode
        ? 'Gate opened'
        : t('successfullyConnected') || 'Successfully connected to gate device'
      statusMessageType.value = 'success'
      gatePhase.value = 'confirmed'

      setTimeout(() => {
        if (
          statusMessage.value === (t('successfullyConnected') || 'Successfully connected to gate device') ||
          statusMessage.value === 'Gate opened'
        ) {
          statusMessage.value = ''
        }
        if (gatePhase.value === 'confirmed') {
          gatePhase.value = 'ready'
        }
      }, 1800)
      return true
    } else {
      statusMessage.value = currentGateSystem.value.fastMode
        ? 'No suitable gate detected nearby'
        : t('failedToConnect') || 'Failed to connect. Please try again.'
      statusMessageType.value = 'error'
      gatePhase.value = 'error'
      return false
    }
  } catch (error) {
    console.error('❌ Connection error:', error)
    statusMessage.value = error.message || t('connectionFailed') || 'Connection failed'
    statusMessageType.value = 'error'
    const msg = String(error?.message || '').toLowerCase()
    if (msg.includes('off') || msg.includes('disabled')) bleErrorDetail.value = 'off'
    if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('denied')) bleErrorDetail.value = 'unauthorized'
    gatePhase.value = 'error'
    return false
  }
}

const sendOpenCommand = async () => {
  const writeSuccess = await write(
    currentServiceUUID.value,
    currentCharacteristicUUID.value,
    currentGatePassword.value
  )

  if (!writeSuccess) {
    return { ok: false, response: '' }
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 250)
  })

  const response = (await read(
    currentServiceUUID.value,
    currentCharacteristicUUID.value
  )).trim()

  return {
    ok: response === ACCESS_GRANTED || response === 'OK',
    response,
  }
}

const startGateSession = async (gateKey = activeGateKey.value) => {
  if (isSessionActive.value) return
  clearGateTimers()
  bleErrorDetail.value = ''
  statusMessage.value = ''
  statusMessageType.value = ''
  activeGateKey.value = gateKey
  gatePhase.value = 'broadcasting'
  phaseTimer = setTimeout(() => {
    if (gatePhase.value === 'broadcasting') {
      gatePhase.value = 'scanning'
    }
  }, 900)

  if (isConnected.value) {
    await handleOpenGate()
    return
  }
  if (lastConnectedDevice.value && lastConnectedDevice.value.gateKey === activeGateKey.value) {
    await quickOpenGate(activeGateKey.value)
    return
  }
  const connected = await handleConnect(activeGateKey.value)
  if (connected && currentGateSystem.value.fastMode) {
    await handleOpenGate()
  }
}

const handleShakeOpen = () => {
  if (!isSessionActive.value) {
    void startGateSession()
  }
}

const logBleGateEntry = () => {
  return logResidentEntry({
    projectId: projectStore.selectedProject?.id,
    projectName: projectStore.selectedProject?.name,
    unit: projectStore.selectedProject?.userUnit || projectStore.selectedUnit || userUnitInfo.value,
    userRole: projectStore.selectedProject?.userRole || 'owner',
    entryType: 'resident_ble',
    gateName:
      deviceName.value ||
      activeGate.value?.bleName ||
      activeGate.value?.name ||
      currentGateDeviceNames.value[0] ||
      '',
    gateKey: activeGateKey.value,
  })
}

const quickOpenGate = async (gateKey = activeGateKey.value) => {
  try {
    autoConnecting.value = true
    activeGateKey.value = gateKey
    statusMessage.value = currentGateSystem.value.fastMode
      ? 'Searching for nearby gates...'
      : t('connectingToGate') || 'Connecting to gate...'
    statusMessageType.value = 'info'
    gatePhase.value = 'broadcasting'

    phaseTimer = setTimeout(() => {
      if (gatePhase.value === 'broadcasting') {
        gatePhase.value = 'scanning'
      }
    }, 900)

    const connected = currentGateSystem.value.fastMode
      ? (await scanAndConnectNearest(currentServiceUUID.value, {
          deviceNames: currentGateDeviceNames.value,
          timeoutMs: currentGateScanDurationMs.value,
          minRssi: currentGateVeryCloseRssiMin.value,
          scanMode: 2,
        })).success
      : await connect(currentServiceUUID.value, {
          name: currentGateBleName.value,
        })

    if (!connected) {
      autoConnecting.value = false
      statusMessage.value = currentGateSystem.value.fastMode
        ? 'No suitable gate detected nearby'
        : t('failedToConnect') || 'Failed to connect. Please try again.'
      statusMessageType.value = 'error'
      gatePhase.value = 'no_confirmation'
      resetTimer = setTimeout(() => {
        gatePhase.value = 'ready'
        statusMessage.value = ''
      }, 4000)
      return
    }

    isOpening.value = true
    statusMessage.value = 'Opening gate...'

    const { ok, response } = await sendOpenCommand()

    if (ok) {
      statusMessage.value = t('gateOpenedSuccessfully') || 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'
      gatePhase.value = 'confirmed'
      await logBleGateEntry()

      setTimeout(async () => {
        await disconnect()
        statusMessage.value = ''
        gatePhase.value = 'ready'
      }, 3000)
    } else {
      statusMessage.value = response === ACCESS_DENIED
        ? 'Access denied'
        : t('failedToOpenGate') || 'Failed to open gate. Please try again.'
      statusMessageType.value = 'error'
      gatePhase.value = 'error'
    }
  } catch (error) {
    console.error('❌ Quick open error:', error)
    statusMessage.value = error.message || t('quickOpenFailed') || 'Quick open failed'
    statusMessageType.value = 'error'
    const msg = String(error?.message || '').toLowerCase()
    if (msg.includes('off') || msg.includes('disabled')) bleErrorDetail.value = 'off'
    if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('denied')) bleErrorDetail.value = 'unauthorized'
    gatePhase.value = 'error'
  } finally {
    autoConnecting.value = false
    isOpening.value = false
  }
}

const handleOpenGate = async () => {
  try {
    isOpening.value = true
    statusMessage.value = ''
    gatePhase.value = 'scanning'

    const { ok, response } = await sendOpenCommand()

    if (ok) {
      statusMessage.value = t('gateOpenedSuccessfully') || 'Gate opened successfully! 🎉'
      statusMessageType.value = 'success'
      gatePhase.value = 'confirmed'
      await logBleGateEntry()

      setTimeout(() => {
        if (statusMessage.value.includes(t('gateOpenedSuccessfully') || 'Gate opened successfully')) {
          statusMessage.value = ''
        }
        gatePhase.value = 'ready'
      }, 5000)
    } else {
      statusMessage.value = response === ACCESS_DENIED
        ? 'Access denied'
        : t('failedToOpenGate') || 'Failed to open gate. Please try again.'
      statusMessageType.value = 'error'
      gatePhase.value = 'error'
    }
  } catch (error) {
    console.error('❌ Error opening gate:', error)
    statusMessage.value = error.message || t('failedToOpenGate') || 'Failed to open gate'
    statusMessageType.value = 'error'
    const msg = String(error?.message || '').toLowerCase()
    if (msg.includes('off') || msg.includes('disabled')) bleErrorDetail.value = 'off'
    if (msg.includes('permission') || msg.includes('unauthorized') || msg.includes('denied')) bleErrorDetail.value = 'unauthorized'
    gatePhase.value = 'error'
  } finally {
    isOpening.value = false
  }
}

onUnmounted(() => {
  clearGateTimers()
  window.removeEventListener('pre-shake-open-gate', handleShakeOpen)
})

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
        monthlyLimit: null,
        usedThisMonth: 0,
        remainingQuota: null,
        dailyLimit: null,
        usedToday: 0,
        dailyRemainingQuota: null,
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
      dailyLimit: null,
      usedToday: 0,
      dailyRemainingQuota: null,
    }

    console.log('✅ Pass limits set:', passLimits.value)

    const currentUserIdentifierSet = buildCurrentUserIdentifierSet(user)
    const userOwnedActivePasses = activePasses.filter((docSnapshot) => {
      const docData = typeof docSnapshot.data === 'function' ? docSnapshot.data() : docSnapshot
      return doesPassBelongToCurrentUser(docData, currentUserIdentifierSet)
    })
    console.log(
      `👤 User-owned passes: ${userOwnedActivePasses.length}/${activePasses.length} (showing current account only)`,
    )

    // Map ACTIVE passes for display (excluding soft-deleted and excluding other family/unit users)
    // Note: docs from firestoreService already have their data as direct properties
    passes.value = userOwnedActivePasses.map(docSnapshot => {
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
        unit: docData.unit || '',
        guestName: docData.guestName || 'Unknown Guest',
        purpose: docData.purpose || 'Guest Visit',
        validUntil: convertTimestamp(docData.validUntil),
        status: 'active',
        createdAt: convertTimestamp(docData.createdAt),
        code: docId,
        firebaseRef: docId,
        qrCodeUrl: docData.qrCodeUrl || null,
        cardId: docData.cardId || null,
        verificationToken: docData.verificationToken || null,
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
  isLoadingPasses.value = true
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
        dailyLimit: null,
        usedToday: 0,
        dailyRemainingQuota: null,
      }
      isLoadingPasses.value = false
      return
    }

    // Get user ID (Cognito sub)
    const primaryUserId = getPrimaryUserIdentifier(user)
    await hydrateCurrentUserDisplayName(user, primaryUserId)
    if (!currentUserDisplayName.value) {
      currentUserDisplayName.value = 'User'
    }
    console.log('📥 Loading passes from AWS for project:', projectId)
    console.log('👤 User ID:', primaryUserId)

    // Get user status (includes unit info and limits)
    const { status: userStatus, resolvedUserId } = await getUserStatusWithAndroidFallback(user, projectId)
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
      monthlyLimit: userStatus.data?.monthlyLimit ?? null,
      usedThisMonth: userStatus.data?.usedThisMonth || 0,
      remainingQuota: userStatus.data?.remainingQuota ?? null,
      dailyLimit: userStatus.data?.dailyLimit ?? null,
      usedToday: userStatus.data?.usedToday || 0,
      dailyRemainingQuota: userStatus.data?.dailyRemainingQuota ?? null,
    }

    console.log('✅ Pass limits set:', passLimits.value)

    // Load passes for this unit (or user if no unit)
    // This function already sorts by newest first
    const loadedPasses = await getGuestPassesForUnit(projectId, resolvedUserId, userUnit || null)
    const currentUserIdentifierSet = buildCurrentUserIdentifierSet(user, resolvedUserId)
    const userOwnedPasses = loadedPasses.filter((pass) =>
      doesPassBelongToCurrentUser(pass, currentUserIdentifierSet),
    )

    console.log(
      `✅ Loaded ${loadedPasses.length} passes from AWS, user-owned: ${userOwnedPasses.length} (showing current account only)`,
    )

    // Map passes to the format expected by the component
    passes.value = userOwnedPasses.map(pass => ({
      id: pass.id,
      projectId: pass.projectId,
      userName: normalizeOwnerName(pass.userName),
      unit: pass.unit || '',
      guestName: pass.guestName,
      purpose: pass.purpose,
      validUntil: pass.validUntil,
      status: 'active',
      createdAt: pass.createdAt,
      code: pass.id,
      firebaseRef: pass.id,
      qrCodeUrl: pass.qrCodeUrl,
      cardId: pass.cardId || null,
      verificationToken: pass.verificationToken || null,
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
    isLoadingPasses.value = false
  } catch (error) {
    console.error('❌ Error loading passes from AWS:', error)
    passes.value = []
    passLimits.value = {
      monthlyLimit: null,
      usedThisMonth: 0,
      remainingQuota: null,
      dailyLimit: null,
      usedToday: 0,
      dailyRemainingQuota: null,
    }
    isLoadingPasses.value = false
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

    // Check if user has reached their monthly limit
    if (
      passLimits.value.monthlyLimit !== null &&
      passLimits.value.monthlyLimit !== undefined &&
      currentMonthPassCount.value >= passLimits.value.monthlyLimit
    ) {
      notificationStore.showWarning(
        `You have reached your monthly limit of ${passLimits.value.monthlyLimit} passes.`,
      )
      isGeneratingPass.value = false
      return
    }
    // Check daily limit when configured
    if (
      passLimits.value.dailyLimit !== null &&
      passLimits.value.dailyLimit !== undefined &&
      (passLimits.value.usedToday || 0) >= passLimits.value.dailyLimit
    ) {
      notificationStore.showWarning(
        `You have reached your daily limit of ${passLimits.value.dailyLimit} passes.`,
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
    const userId = getPrimaryUserIdentifier(user)

    if (!userId) {
      notificationStore.showError('Unable to get user ID. Please log out and log back in.')
      isGeneratingPass.value = false
      return
    }

    const { result: eligibilityResult, resolvedUserId } = await checkEligibilityWithAndroidFallback(projectId, user)

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

    // Get user name from Cognito/profile attributes with robust fallback
    const canonicalUserId = eligibilityResult?.data?.user?.id || resolvedUserId || userId
    await hydrateCurrentUserDisplayName(user, canonicalUserId)
    const userName = currentUserDisplayName.value || 'User'
    currentUserDisplayName.value = userName

    // userId is already declared above (line 1543), reuse it
    const result = await createGuestPass(
      projectId,
      canonicalUserId,
      userName,
      sanitizedGuestName,
      sanitizedPurpose,
    )

    if (!result.success) {
      throw new Error(result.message || 'Failed to create guest pass')
    }

    const pass = {
      id: result.passId,
      projectId: projectId,
      userName: userName,
      unit: result.data.unit || getUserUnitInfo() || '',
      guestName: sanitizedGuestName,
      purpose: sanitizedPurpose,
      validUntil: result.data.validUntil,
      status: 'active',
      createdAt: result.data.createdAt || new Date().toISOString(),
      code: result.passId,
      firebaseRef: result.passRef,
      qrCodeUrl: result.qrCodeUrl,
      cardId: result.data.cardId || null,
      verificationToken: result.data.verificationToken || null,
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
    if (passLimits.value.dailyLimit !== null && passLimits.value.dailyLimit !== undefined) {
      passLimits.value.usedToday = (passLimits.value.usedToday || 0) + 1
      passLimits.value.dailyRemainingQuota = Math.max(0, passLimits.value.dailyLimit - passLimits.value.usedToday)
    }

    console.log('✅ Pass added, new count:', passLimits.value)

    newPass.value = {
      guestName: '',
      purpose: '',
    }

    showGenerateDialog.value = false

    // Show preview immediately using the inline data URL (no network wait)
    generatedPassPreview.value = pass
    generatedPassPreviewImage.value = pass.qrImageDataUrl || pass.qrCodeUrl || ''
    showGeneratedPassPreview.value = true
    notificationStore.showSuccess('Pass generated successfully!')
    isGeneratingPass.value = false

    // Generate the styled gate-pass card in the background and swap in when ready
    nextTick().then(() =>
      generateQRCode(pass).then((composedPassImage) => {
        if (composedPassImage) {
          passes.value = passes.value.map((p) =>
            p.id === pass.id ? { ...p, qrImageDataUrl: composedPassImage } : p
          )
          if (generatedPassPreview.value?.id === pass.id) {
            generatedPassPreviewImage.value = composedPassImage
          }
        }
      }).catch(() => {/* silent — plain QR is already visible */})
    )
  } catch (error) {
    console.error('Error generating pass:', error?.message || JSON.stringify(error) || error)
    notificationStore.showError(error.message || 'Failed to generate pass')
    isGeneratingPass.value = false
  }
}

const generateQRCode = async (pass, options = {}) => {
  try {
    const { force = false } = options
    if (!force) {
      const cached = getCachedPassImage(pass)
      if (cached) {
        return cached
      }
    }

    // Use in-DOM canvas when available; otherwise create an offscreen canvas
    const canvas = qrRefs.get(pass.id) || document.createElement('canvas')

    // Render at higher resolution for crisp sharing quality
    const baseCanvasWidth = 420
    const baseCanvasHeight = 800
    const qualityScale = isAndroidNativeApp() ? 2 : 3
    const canvasWidth = baseCanvasWidth * qualityScale
    const canvasHeight = baseCanvasHeight * qualityScale
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(qualityScale, qualityScale)

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // QR code data MUST be unique per pass (avoid repeating the same QR).
    const qrData = JSON.stringify({
      type: 'guest_pass',
      version: 1,
      passId: pass.id || pass.code,
      projectId: pass.projectId || projectStore.selectedProject?.id || null,
      verificationToken: pass.verificationToken || null,
      cardId: pass.cardId || null,
      guestName: pass.guestName,
      validUntil: pass.validUntil,
      createdAt: pass.createdAt,
    })

    console.log('🎯 Generating QR code for pass:', pass.id)

    try {
      if (!logoImagePromise) {
        logoImagePromise = loadImage(appLogo).catch(() => null)
      }
      const logoImg = await logoImagePromise

      // Method 1: Try using QRCode.toCanvas directly (more reliable)
      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, qrData, {
        width: 280 * qualityScale,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      console.log('✅ QR code generated with toCanvas, drawing gate pass...')

      // Draw the complete gate pass design
      drawGatePass(ctx, qrCanvas, pass, baseCanvasWidth, baseCanvasHeight, logoImg)
      console.log('✅ Gate pass drawn successfully')
      const rendered = canvas.toDataURL('image/png')
      const renderKey = buildPassRenderKey(pass)
      qrImageCache.set(renderKey, rendered)
      pass.qrImageDataUrl = rendered
      return rendered
    } catch (toCanvasError) {
      console.warn('⚠️ toCanvas failed, trying dataURL method:', toCanvasError)

      // Method 2: Fallback to dataURL method
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 280 * qualityScale,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      console.log('✅ QR code generated with dataURL, creating image...')

      // Create image from QR code data URL
      const img = await new Promise((resolve, reject) => {
        const qrImage = new Image()
        qrImage.onload = () => resolve(qrImage)
        qrImage.onerror = (error) => reject(error)
        qrImage.src = qrCodeDataUrl
      })
      drawGatePass(ctx, img, pass, baseCanvasWidth, baseCanvasHeight, null)
      console.log('✅ Gate pass drawn successfully')
      const rendered = canvas.toDataURL('image/png')
      const renderKey = buildPassRenderKey(pass)
      qrImageCache.set(renderKey, rendered)
      pass.qrImageDataUrl = rendered
      return rendered
    }
  } catch (error) {
    console.error('❌ Error generating QR code:', error)
    return null
  }
}

const drawGatePass = (ctx, qrImg, pass, canvasWidth, canvasHeight, logoImg = null) => {
  // Determine if Arabic mode
  const isArabic = locale.value === 'ar-SA' || locale.value.startsWith('ar')
  const dateLocale = isArabic ? 'ar-EG' : 'en-GB'

  const safeDateParts = (value) => {
    if (!value) return { date: 'N/A', time: 'N/A' }
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return { date: 'N/A', time: 'N/A' }
    const date = parsed.toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const time = parsed.toLocaleTimeString(dateLocale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !isArabic,
    })
    return { date, time }
  }

  const createdAtParts = safeDateParts(pass.createdAt)
  const validUntilParts = safeDateParts(pass.validUntil)
  const unitText = pass.unit || userUnitInfo.value || 'N/A'
  const isGenericName = (name) => {
    const v = String(name || '').trim().toLowerCase()
    return !v || v === 'unknown user' || v === 'unknown' || v === 'n/a'
  }
  const rawOwnerText = pass.userName || pass.ownerName || pass.inviterName || ''
  const ownerText = isGenericName(rawOwnerText)
    ? (currentUserDisplayName.value || 'N/A')
    : (isLikelyEmail(rawOwnerText)
      ? (currentUserDisplayName.value || getDisplayNameFromEmail(rawOwnerText) || 'N/A')
      : rawOwnerText)
  const guestText = pass.guestName || (isArabic ? 'ضيف' : 'Guest')
  const purposeText = pass.purpose || (isArabic ? 'زيارة' : 'Visit')
  const projectNameText = projectStore.selectedProject?.name || pass.projectName || 'PRE Group'
  const passCodeText = pass.code || pass.id || 'N/A'

  const drawWrappedText = (text, x, y, maxWidth, lineHeight, maxLines = 2) => {
    const value = String(text || 'N/A')
    const words = value.split(/\s+/).filter(Boolean)
    if (words.length === 0) {
      ctx.fillText('N/A', x, y)
      return
    }
    const lines = []
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width <= maxWidth || !current) {
        current = test
      } else {
        lines.push(current)
        current = word
      }
    }
    if (current) lines.push(current)

    const visibleLines = lines.slice(0, maxLines)
    if (lines.length > maxLines && visibleLines.length > 0) {
      let lastLine = visibleLines[visibleLines.length - 1]
      while (ctx.measureText(`${lastLine}…`).width > maxWidth && lastLine.length > 1) {
        lastLine = lastLine.slice(0, -1)
      }
      visibleLines[visibleLines.length - 1] = `${lastLine}…`
    }

    visibleLines.forEach((line, index) => {
      ctx.fillText(line, x, y + (index * lineHeight))
    })
  }

  const fitTextWithEllipsis = (text, maxWidth) => {
    const value = String(text || 'N/A')
    if (ctx.measureText(value).width <= maxWidth) return value
    let trimmed = value
    while (ctx.measureText(`${trimmed}…`).width > maxWidth && trimmed.length > 1) {
      trimmed = trimmed.slice(0, -1)
    }
    return `${trimmed}…`
  }

  // Branded gradient background (like web guest-pass page)
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
  gradient.addColorStop(0, '#AF1E23')
  gradient.addColorStop(1, '#231F20')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Glass card layer
  const cardX = 12
  const cardY = 12
  const cardWidth = canvasWidth - 24
  const cardHeight = canvasHeight - 24
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.fillRect(cardX, cardY, cardWidth, cardHeight)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(cardX, cardY, cardWidth, cardHeight)

  ctx.textAlign = 'center'
  const centerX = canvasWidth / 2

  if (logoImg) {
    const logoWidth = 110
    const logoHeight = 54
    ctx.drawImage(logoImg, centerX - logoWidth / 2, cardY + 12, logoWidth, logoHeight)
  } else {
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 20px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
    ctx.fillText('PRE', centerX, cardY + 52)
  }

  // Highlight current selected project under the logo
  const projectPillY = cardY + 82
  const maxProjectWidth = cardWidth - 60
  ctx.font = '700 13px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
  let displayProject = String(projectNameText)
  while (ctx.measureText(displayProject).width > maxProjectWidth && displayProject.length > 1) {
    displayProject = `${displayProject.slice(0, -2)}…`
  }
  const projectTextWidth = ctx.measureText(displayProject).width
  const projectPillWidth = Math.min(maxProjectWidth + 24, projectTextWidth + 28)
  const projectPillX = centerX - projectPillWidth / 2
  const projectPillHeight = 24
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)'
  ctx.fillRect(projectPillX, projectPillY, projectPillWidth, projectPillHeight)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.lineWidth = 1
  ctx.strokeRect(projectPillX, projectPillY, projectPillWidth, projectPillHeight)
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 13px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(displayProject, centerX, projectPillY + 16)

  // Add static gate context beside project info as requested.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = '600 13px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
  let displayProjectGate = String('Gate 2')
  while (ctx.measureText(displayProjectGate).width > maxProjectWidth && displayProjectGate.length > 1) {
    displayProjectGate = `${displayProjectGate.slice(0, -2)}…`
  }
  ctx.fillText(displayProjectGate, centerX, projectPillY + 40)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '700 24px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
  ctx.fillText(isArabic ? 'تصريح دخول' : 'Gate Pass', centerX, cardY + 156)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = '800 16px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
  ctx.fillText('Gate 2', centerX, cardY + 182)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
  ctx.font = '500 11px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
  ctx.fillText(
    isArabic ? `تم الإنشاء: ${createdAtParts.date}` : `Generated: ${createdAtParts.date}`,
    centerX,
    cardY + 206
  )
  ctx.fillText(
    isArabic ? `الوقت: ${createdAtParts.time}` : `Time: ${createdAtParts.time}`,
    centerX,
    cardY + 222
  )

  const qrSize = 300
  const qrX = centerX - qrSize / 2
  const qrY = cardY + 248
  const qrFramePadding = 14
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(qrX - qrFramePadding, qrY - qrFramePadding, qrSize + (qrFramePadding * 2), qrSize + (qrFramePadding * 2))
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(qrX - qrFramePadding, qrY - qrFramePadding, qrSize + (qrFramePadding * 2), qrSize + (qrFramePadding * 2))
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  // Details block
  const detailsY = qrY + qrSize + 38
  const leftX = cardX + 22
  const rightX = centerX + 10
  const fieldColumnWidth = (cardWidth / 2) - 30
  const rowGap = 70

  const drawField = (label, value, x, y, options = {}) => {
    const { secondLine = null, wrap = false, mono = false } = options
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
    ctx.font = '500 11px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
    ctx.fillText(label, x, y)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = mono
      ? '700 13px "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
      : '700 15px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
    const displayValue = String(value || 'N/A')
    if (wrap) {
      drawWrappedText(displayValue, x, y + 21, fieldColumnWidth, 16, 2)
    } else {
      ctx.fillText(fitTextWithEllipsis(displayValue, fieldColumnWidth), x, y + 21)
    }
    if (secondLine) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)'
      ctx.font = '600 13px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
      const second = String(secondLine)
      ctx.fillText(fitTextWithEllipsis(second, fieldColumnWidth), x, y + 38)
    }
  }

  if (isArabic) {
    drawField('الزائر', guestText, leftX, detailsY, { wrap: true })
    drawField('المضيف', ownerText, rightX, detailsY, { wrap: true })
    drawField('الوحدة', unitText, leftX, detailsY + rowGap)
    drawField('صالح حتى', validUntilParts.date, rightX, detailsY + rowGap, { secondLine: validUntilParts.time })
    drawField('الغرض', purposeText, leftX, detailsY + rowGap * 2, { wrap: true })
    drawField('رقم التصريح', passCodeText, rightX, detailsY + rowGap * 2, { mono: true })
  } else {
    drawField('Visitor', guestText, leftX, detailsY, { wrap: true })
    drawField('Owner', ownerText, rightX, detailsY, { wrap: true })
    drawField('Unit', unitText, leftX, detailsY + rowGap)
    drawField('Valid Until', validUntilParts.date, rightX, detailsY + rowGap, { secondLine: validUntilParts.time })
    drawField('Purpose', purposeText, leftX, detailsY + rowGap * 2, { wrap: true })
    drawField('Pass Code', passCodeText, rightX, detailsY + rowGap * 2, { mono: true })
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.70)'
  ctx.font = '500 11px "Inter", -apple-system, "Segoe UI", Arial, sans-serif'
  ctx.fillText('PRE Group', centerX, cardY + cardHeight - 16)
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
  if (!pass?.id) return false
  if (sharingPassId.value === pass.id) return false

  try {
    sharingPassId.value = pass.id
    console.log('🖼️ Sharing guest pass image:', pass.id)
    const renderedImage = getCachedPassImage(pass) || await generateQRCode(pass)

    const result = await sharingService.sharePassWithImage({
      ...pass,
      projectName: projectStore.selectedProject?.name || pass.projectName || '',
      qrImageDataUrl: renderedImage || pass.qrImageDataUrl || pass.qrCodeUrl || '',
    })

    if (result.success) {
      notificationStore.showSuccess(result.message || 'Pass shared successfully!')

      // Mark pass as sent if it has a Firebase reference
      if (pass.firebaseRef) {
        const projectId = projectStore.selectedProject?.id
        if (projectId) {
          await markPassAsSent(pass.firebaseRef, projectId)
        }
      }
      return true
    } else if (result.message !== 'Share cancelled') {
      throw new Error(result.message || 'Sharing failed')
    }
    return false
  } catch (error) {
    const errorText = String(error?.message || error?.errorMessage || '').toLowerCase()
    const isCancelled =
      errorText.includes('cancel') ||
      errorText.includes('aborted') ||
      errorText.includes('share canceled') ||
      errorText.includes('share cancelled')

    if (isCancelled) {
      console.log('ℹ️ Share canceled by user')
      return false
    }

    console.error('❌ Error sharing pass:', error)
    notificationStore.showError('Failed to share pass. Please try again.')
    return false
  } finally {
    if (sharingPassId.value === pass.id) {
      sharingPassId.value = null
    }
  }
}

const closeGeneratedPassPreview = () => {
  showGeneratedPassPreview.value = false
}

const shareGeneratedPass = async () => {
  if (!generatedPassPreview.value || isSharingGeneratedPass.value) return
  isSharingGeneratedPass.value = true
  const passToShare = {
    ...generatedPassPreview.value,
    projectName: projectStore.selectedProject?.name || generatedPassPreview.value.projectName || '',
    qrImageDataUrl: generatedPassPreviewImage.value || generatedPassPreview.value.qrCodeUrl || '',
  }
  try {
    const didShare = await sharePass(passToShare)
    if (didShare) {
      closeGeneratedPassPreview()
    }
  } finally {
    isSharingGeneratedPass.value = false
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
    activeGateKey.value = getGateSystemForProject(currentProjectId.value).gates[0]?.key || 'main'
    lastConnectedDevice.value = null
  }
)

// Initialize
onMounted(async () => {
  // Pre-load logo so it's ready when the first QR card is generated
  if (!logoImagePromise) {
    logoImagePromise = loadImage(appLogo).catch(() => null)
  }

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

  // Auto-start gate session when arriving from shake gesture
  if (route.query.fromShake === '1') {
    handleShakeOpen()
    // Clean query to avoid re-triggering on next mount/back navigation.
    void router.replace({ path: route.path, query: { ...route.query, fromShake: undefined } })
  }

  // Listen for in-place shake-open events while on Access.
  window.addEventListener('pre-shake-open-gate', handleShakeOpen)
})
</script>

<style scoped>
/* Page Layout */
.access-page {
  min-height: calc(100vh - 200px);
  background: #fafafa;
  padding-bottom: 100px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
  background: linear-gradient(135deg, #af1e23 0%, #d42028 100%);
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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  cursor: pointer;
}

.status-card--active {
  transform: translateY(-1px);
}

.status-card--error {
  border-width: 2px;
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

.status-badge--error {
  align-items: flex-start;
}

.status-badge__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.status-badge__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 2px;
}

.status-badge__title {
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.2;
}

.status-badge__subtitle {
  font-size: 0.76rem;
  line-height: 1.25;
  opacity: 0.95;
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
  color: #af1e23;
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
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #af1e23 0%, #d42028 100%);
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

.generate-pass-counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
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
  border-color: #af1e23;
  color: #af1e23;
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
  background: linear-gradient(135deg, #af1e23 0%, #d42028 100%);
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
  color: #f6f6f6;
  flex-shrink: 0;
}

.pass-guest-name {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: #f6f6f6;
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
  color: #af1e23;
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
  background: #af1e23;
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
  background: #8a1820;
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
  background: linear-gradient(135deg, #af1e23 0%, #d42028 100%);
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
  background: #af1e23;
  color: white;
}

.pass-share-compact:active:not(:disabled) {
  transform: scale(0.97);
  background: #8a1820;
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
  inset: 0;
  width: 100vw;
  height: 100dvh;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(20px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom));
  margin: 0;
  box-sizing: border-box;
  overscroll-behavior: contain;
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

.preview-modal-container {
  max-width: 420px;
}

.preview-modal-body {
  padding-top: 20px;
}

.generated-pass-preview-image {
  width: 100%;
  max-height: 420px;
  object-fit: contain;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.preview-image-fallback {
  padding: 20px;
  text-align: center;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  color: #6b7280;
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
  background: linear-gradient(135deg, #af1e23 0%, #d42028 100%);
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
  color: #af1e23;
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
  border-color: #af1e23;
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
  background: #af1e23;
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
  background: #8a1820;
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
[dir='rtl'] .access-page {
  direction: rtl;
}

[dir='rtl'] .tabs-container {
  direction: ltr;
}

[dir='rtl'] .tabs-wrapper {
  direction: ltr;
  flex-direction: row;
}

[dir='rtl'] .tab-button {
  flex-direction: row-reverse;
  direction: rtl;
}

[dir='rtl'] .tab-icon {
  transform: scaleX(1) !important;
}

[dir='rtl'] .tab-button.active .tab-icon {
  transform: scale(1.1) !important;
}

[dir='rtl'] .tab-label {
  direction: rtl;
  text-align: right;
}

[dir='rtl'] .modal-header-content {
  flex-direction: row-reverse;
}

[dir='rtl'] .modal-close-pro {
  margin-right: auto;
  margin-left: 0;
}

[dir='rtl'] .form-label-pro {
  flex-direction: row-reverse;
  text-align: right;
}

[dir='rtl'] .required-star {
  margin-left: 0;
  margin-right: auto;
}

[dir='rtl'] .form-input-pro {
  text-align: right;
  direction: rtl;
}

[dir='rtl'] .info-box-pro {
  text-align: right;
  direction: rtl;
}

[dir='rtl'] .info-box-pro svg {
  margin-left: 12px;
  margin-right: 0;
}

[dir='rtl'] .modal-footer-pro {
  flex-direction: column-reverse;
}

[dir='rtl'] .modal-btn-generate {
  flex-direction: row-reverse;
}

[dir='rtl'] .pass-compact-header {
  flex-direction: row-reverse;
}

[dir='rtl'] .pass-info-compact {
  text-align: right;
}

[dir='rtl'] .pass-meta-compact {
  direction: rtl;
}

[dir='rtl'] .pass-actions-compact {
  flex-direction: row-reverse;
}

[dir='rtl'] .ble-panel {
  direction: rtl;
}

[dir='rtl'] .status-card {
  text-align: center;
}

[dir='rtl'] .control-buttons {
  direction: rtl;
}

[dir='rtl'] .action-button {
  flex-direction: row-reverse;
}

[dir='rtl'] .status-message {
  direction: rtl;
  text-align: right;
  flex-direction: row-reverse;
}

[dir='rtl'] .warning-banner {
  direction: rtl;
  text-align: right;
  flex-direction: row-reverse;
}

[dir='rtl'] .warning-content {
  text-align: right;
}
</style>
