<template>
  <div class="signin-page" @click="handlePageClick">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12H5M12 19L5 12L12 5"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 class="page-title">{{ $t('signInButton') }}</h1>
      <div class="placeholder"></div>
    </div>


    <!-- Device Key Error Modal -->
    <DeviceKeyErrorModal
      v-if="showDeviceKeyErrorModal"
      :message="deviceKeyErrorMessage"
      @close="handleDeviceKeyModalClose"
    />

    <!-- Content -->
    <div class="content">
      <div class="welcome-section">
        <h2 class="welcome-title">{{ $t('welcomeBack') }}</h2>
      </div>

      <form @submit.prevent="handleSignIn" class="signin-form" @click.stop>
        <div class="form-group">
          <label for="email" class="form-label">{{ $t('email') }}</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="form-input"
            :placeholder="$t('enterYourEmail')"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">{{ $t('passwordField') }}</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :placeholder="$t('enterYourPassword')"
              required
            />
            <button type="button" @click="togglePassword" class="password-toggle">
              <svg
                v-if="showPassword"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 12C2 12 6 4 12 4C18 4 22 12 22 12C22 12 18 20 12 20C6 20 2 12 2 12Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 2L22 22"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="formData.rememberMe" class="checkbox" />
            <span class="checkmark"></span>
            {{ $t('rememberMe') }}
          </label>
          <button type="button" @click="forgotPassword" class="forgot-link">
            {{ $t('forgotPassword') }}
          </button>
        </div>

        <button type="submit" class="signin-btn" :disabled="loading">
          <span v-if="loading">{{ $t('signingIn') }}</span>
          <span v-else>{{ $t('signInButton') }}</span>
        </button>
      </form>

      <div class="divider">
        <span>{{ $t('orDivider') }}</span>
      </div>
<!-- 
      <div class="google-signin-section">
        <button @click="signInWithGoogle" class="social-btn google-btn">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </div> -->

      <div class="signup-prompt">
        <span>{{ $t('dontHaveAccount') }}</span>
        <button @click="goToSignUp" class="signup-link">{{ $t('signUp') }}</button>
      </div>

      <div class="device-key-reset-link">
        <button @click="openDeviceKeyResetModal" class="reset-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('newDeviceRequestReset') }}
        </button>
      </div>
    </div>

    <!-- Device Key Reset Request Modal -->
    <div v-if="showDeviceKeyResetModal" class="modal-overlay" @click="closeDeviceKeyResetModal">
      <div class="modal-content device-key-reset-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('deviceKeyResetRequest') }}</h3>
          <button @click="closeDeviceKeyResetModal" class="close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-description">
            {{ $t('deviceKeyResetDesc') }}
          </p>

          <form @submit.prevent="handleDeviceKeyResetSubmit">
            <div class="form-group">
              <label class="form-label">{{ $t('email') }} *</label>
              <input
                v-model="deviceKeyResetForm.email"
                type="email"
                class="form-input"
                :placeholder="$t('enterRegisteredEmail')"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('nationalId') }} *</label>
              <input
                v-model="deviceKeyResetForm.nationalId"
                type="text"
                class="form-input"
                :placeholder="$t('enterNationalId')"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('phoneNumber') }} *</label>
              <input
                v-model="deviceKeyResetForm.mobile"
                type="tel"
                class="form-input"
                :placeholder="$t('enterMobileNumber')"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('yourProject') }} *</label>
              <select
                v-model="deviceKeyResetForm.projectId"
                class="form-input"
                required
                @change="onResetProjectChange"
                :disabled="loadingProjects"
              >
                <option value="" v-if="loadingProjects">{{ $t('loading') }}</option>
                <option value="" v-else-if="availableProjects.length === 0">{{ $t('noProjectsAvailable') }}</option>
                <option value="" v-else>{{ $t('selectProjectForReset') }}</option>
                <option v-for="project in availableProjects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
              <span v-if="loadingProjects" class="loading-text">⏳ {{ $t('loading') }}...</span>
              <span v-else-if="availableProjects.length === 0" class="error-text">⚠️ {{ $t('noActiveProjectsFound') }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">{{ $t('reasonForReset') }}</label>
              <textarea
                v-model="deviceKeyResetForm.reason"
                class="form-textarea"
                :placeholder="$t('reasonPlaceholder')"
                rows="4"
                maxlength="500"
                required
              ></textarea>
              <div class="char-count">{{ deviceKeyResetForm.reason.length }}/500</div>
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeDeviceKeyResetModal" class="cancel-btn" :disabled="submittingDeviceKeyReset">
                {{ $t('cancel') }}
              </button>
              <button type="submit" class="submit-btn" :disabled="submittingDeviceKeyReset">
                <span v-if="submittingDeviceKeyReset">{{ $t('submitting') }}</span>
                <span v-else>{{ $t('submitRequest') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import optimizedAuthService from '../../services/optimizedAuthService'
import firestoreService from '../../services/firestoreService'
import { smartMirrorService } from '../../services/smartMirrorService'
import { useNotificationStore } from '../../stores/notifications'
import { useRegistrationStore } from '../../stores/registration'
// import { validateProfileCompletion, getNextProfileStep } from '../../utils/profileValidation'
// import { attemptGoogleSignIn } from '../../utils/googleAuthHelper'
import { useFormKeyboard } from '../../composables/useFormKeyboard'
import DeviceKeyErrorModal from '../../components/DeviceKeyErrorModal.vue'

// Component name for ESLint
defineOptions({
  name: 'SignInPage',
})

// Setup keyboard handling for better mobile UX
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
  scrollOffset: 150
})

const router = useRouter()
const notificationStore = useNotificationStore()
const loading = ref(false)
const showPassword = ref(false)
const showDeviceKeyErrorModal = ref(false)
const deviceKeyErrorMessage = ref('')

// Device key reset modal state
const showDeviceKeyResetModal = ref(false)
const submittingDeviceKeyReset = ref(false)
const loadingProjects = ref(false)
const availableProjects = ref([])
const deviceKeyResetForm = reactive({
  email: '',
  nationalId: '',
  mobile: '',
  projectId: '',
  reason: ''
})

// Global keyboard handling is now managed by MainLayout

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

// Load available projects for device key reset
const loadAvailableProjects = async () => {
  if (loadingProjects.value) {
    console.log('⏳ Already loading projects, skipping...')
    return
  }
  
  try {
    loadingProjects.value = true
    console.log('🔄 Loading available projects for device key reset...')
    
    // Use Firebase Web SDK (works on all platforms including iOS)
    console.log('[SignIn] Using Firebase Web SDK...')
    const { collection, getDocs } = await import('firebase/firestore')
    const { db } = await import('../../boot/firebase')
    
    const projectsRef = collection(db, 'projects')
    const snapshot = await getDocs(projectsRef)
    const fetchedProjects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    console.log('[SignIn] ✅ Fetched', fetchedProjects.length, 'projects via Web SDK')
    
    // Sort projects by name (don't filter by status - show all projects like Register page)
    availableProjects.value = fetchedProjects
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    
    console.log('✅ Loaded', availableProjects.value.length, 'projects:', availableProjects.value.map(p => p.name))
  } catch (error) {
    console.error('❌ Error loading projects:', error)
    console.error('[SignIn] Error details:', error?.message, error?.code)
    notificationStore.showError('Failed to load projects. Please try again.')
    availableProjects.value = []
  } finally {
    loadingProjects.value = false
  }
}

// Open device key reset modal and ensure projects are loaded
const openDeviceKeyResetModal = async () => {
  console.log('🔑 Opening device key reset modal...')
  showDeviceKeyResetModal.value = true
  
  // Always reload projects to ensure fresh data
  console.log('📋 Reloading projects list...')
  await loadAvailableProjects()
}

onMounted(() => {
  // Check if we should show the device key error modal
  checkAndShowDeviceKeyError()
  
  // Load projects for device key reset modal
  loadAvailableProjects()
})

// Also check when component is activated (for keep-alive scenarios)
onActivated(() => {
  console.log('[SignIn] Component activated, checking for device key error...')
  checkAndShowDeviceKeyError()
})

const goBack = () => {
  router.go(-1)
}

const handlePageClick = async () => {
  // Keyboard is now automatically hidden by composable when clicking outside inputs
  // No need for manual handling
}

// Helper function to check and show device key error modal from localStorage
const checkAndShowDeviceKeyError = () => {
  const savedDeviceKeyError = localStorage.getItem('showDeviceKeyError')
  console.log('[SignIn] 🔍 checkAndShowDeviceKeyError called, savedDeviceKeyError:', savedDeviceKeyError)
  console.log('[SignIn] 🔍 Current modal state BEFORE:', {
    showDeviceKeyErrorModal: showDeviceKeyErrorModal.value,
    deviceKeyErrorMessage: deviceKeyErrorMessage.value
  })
  
  if (savedDeviceKeyError) {
    console.log('[SignIn] 🔴 Found device key error in localStorage:', savedDeviceKeyError)
    localStorage.removeItem('showDeviceKeyError')
    deviceKeyErrorMessage.value = savedDeviceKeyError
    showDeviceKeyErrorModal.value = true
    
    // Use nextTick to ensure Vue has updated the DOM
    nextTick(() => {
      console.log('[SignIn] 🔴 Device key error modal displayed (after nextTick)')
      console.log('[SignIn] 🔴 Modal state AFTER:', {
        showDeviceKeyErrorModal: showDeviceKeyErrorModal.value,
        deviceKeyErrorMessage: deviceKeyErrorMessage.value,
        messageLength: deviceKeyErrorMessage.value?.length
      })
    })
  } else {
    console.log('[SignIn] ℹ️ No device key error found in localStorage')
  }
}

const handleDeviceKeyModalClose = () => {
  showDeviceKeyErrorModal.value = false
  deviceKeyErrorMessage.value = ''
  console.log('[SignIn] 🔍 Device key modal closed by user')
  // Note: User is already signed out automatically
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Check if user needs migration (exists in Firestore with oldId but not in Firebase Auth)
// Uses firestoreService for direct access (more reliable on iOS)
const checkForMigration = async (email) => {
  try {
    console.log('🔍 Checking for migration need for email:', email)
    console.log('📞 Using direct Firestore check via firestoreService')
    
    const normalizedEmail = email.toLowerCase().trim()
    
    // Use firestoreService to get user by email
    // This works better on iOS than Cloud Functions or direct Web SDK queries
    console.log('🔍 Querying Firestore for user...')
    const startTime = Date.now()
    
    // Try to get user document - we'll check multiple potential document IDs
    // since we don't know the exact document ID
    try {
      // Option 1: Try getting all users and filtering (if collection is small)
      console.log('🔍 Attempting to fetch users collection...')
      const result = await firestoreService.getDocs('users', {
        filters: [{ field: 'email', operator: '==', value: normalizedEmail }],
        timeoutMs: 8000
      })
      
      const duration = Date.now() - startTime
      console.log(`✅ Firestore query completed in ${duration}ms, found ${result.size} user(s)`)
      
      if (result && !result.empty && result.docs.length > 0) {
        const userDoc = result.docs[0]
        const userData = userDoc.data()
        
        console.log('📋 Found user:', userDoc.id)
        console.log('📋 User has oldId:', !!userData.oldId)
        console.log('📋 User migrated status:', userData.migrated)
        
              // Check if user has oldId and is NOT migrated
              if (userData.oldId && userData.migrated !== true) {
                console.log('✅ User needs migration!')
                console.log('📋 Storing user ID for migration:', userDoc.id)
                return { needsMigration: true, userId: userDoc.id, userData }
              } else if (userData.oldId && userData.migrated === true) {
                console.log('ℹ️ User has oldId but already migrated')
                return { needsMigration: false }
              } else {
                console.log('ℹ️ User has no oldId, no migration needed')
                return { needsMigration: false }
              }
      }
      
      console.log('❌ No user found with that email')
      return { needsMigration: false }
      
    } catch (firestoreError) {
      console.error('❌ Firestore query error:', firestoreError)
      console.error('❌ Error details:', {
        message: firestoreError?.message,
        code: firestoreError?.code
      })
      
      // Return false on error to avoid blocking sign in
      return { needsMigration: false }
    }
  } catch (error) {
    console.error('❌ Error in checkForMigration:', error)
    return { needsMigration: false }
  }
}


const handleSignIn = async () => {
  if (loading.value) return

  loading.value = true

  try {
    console.log('[SignIn] Starting sign in...')

    // Use optimized auth service (works on all platforms)
    console.log('[SignIn] Starting authentication...')
    
    const signInResult = await optimizedAuthService.signInWithEmailAndPassword(
      formData.email.trim(),
      formData.password,
    )

    if (signInResult.challenge === 'NEW_PASSWORD_REQUIRED') {
      console.log('[SignIn] ⚠️ User must complete password migration.')
      const registrationStore = useRegistrationStore()
      registrationStore.setPersonalData({ email: formData.email.trim() })
      registrationStore.setMigrationChallenge({
        type: signInResult.challenge,
        user: signInResult.user,
        email: formData.email.trim(),
      })
      registrationStore.setFirestoreUserId(signInResult.user?.username ?? null)

      notificationStore.showInfo('Please set a new password to complete your account migration.')
      loading.value = false
      router.push('/migrate-account')
      return
    }

    const user = signInResult.user
    const userId = user?.username || user?.attributes?.sub
    console.log('[SignIn] ✅ Authentication successful:', userId)
    console.log('[SignIn] 🔍 SIGN-IN RESULT USER OBJECT:', JSON.stringify(user, null, 2))
    console.log('[SignIn] 🔍 User attributes:', user?.attributes)
    console.log('[SignIn] 🔍 User cognitoAttributes:', user?.cognitoAttributes)

    const registrationStore = useRegistrationStore()
    registrationStore.setFirestoreUserId(userId ?? null)
    registrationStore.clearMigrationChallenge()

    // Check device key BEFORE proceeding
    console.log('[SignIn] 🔐 Checking device key...')
    const deviceKeyService = (await import('../../services/deviceKeyService')).default
    const deviceCheck = await deviceKeyService.handleLoginDeviceCheck(userId)
    
    if (!deviceCheck.allowed) {
      console.log('[SignIn] ❌ Device key check failed:', deviceCheck.message)
      
      // Save error message to localStorage to persist across navigation
      localStorage.setItem('showDeviceKeyError', deviceCheck.message)
      console.log('[SignIn] 💾 Saved device key error to localStorage')
      
      // Sign out the user
      console.log('[SignIn] 🚪 Signing out user with device key error...')
      loading.value = false
      try {
        await optimizedAuthService.signOut()
        console.log('[SignIn] ✅ User signed out after device key error')
        
        // Wait a moment for the auth state to fully clear
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check and show the modal immediately (in case we stayed on /signin)
        console.log('[SignIn] 🔍 Checking for device key error to display modal...')
        checkAndShowDeviceKeyError()
      } catch (err) {
        console.error('[SignIn] ❌ Error during device key signout:', err)
      }
      
      return
    }
    
    console.log('[SignIn] ✅ Device key check passed:', deviceCheck.action)
    if (deviceCheck.action === 'registered') {
      notificationStore.showSuccess('Device registered successfully!')
    } else if (deviceCheck.action === 'reset_approved') {
      notificationStore.showSuccess('Device reset approved! Welcome to your new device.')
    }

    // Sync PRE user with Smart Mirror service for user isolation
    console.log('[SignIn] 🔐 Syncing PRE user with Smart Mirror service:', userId)
    smartMirrorService.setPreUserId(userId)

    // Get user email from sign-in result
    const userEmail = user?.attributes?.email || user?.cognitoAttributes?.email || formData.email.trim()
    
    console.log('[SignIn] ========== STARTING VERIFICATION CHECKS ==========')
    console.log('[SignIn] User email:', userEmail)
    
    // If user successfully signed into Cognito, they MUST have a confirmed email
    // Cognito won't let unconfirmed users sign in
    // So if we can't read the email_verified attribute, assume it's verified
    let emailVerified = false
    
    try {
      // Check ALL possible locations for email verification
      const emailVerifiedSources = {
        cognitoAttributes_emailVerified: user?.cognitoAttributes?.emailVerified,
        attributes_email_verified: user?.attributes?.email_verified,
        attributes_emailVerified: user?.attributes?.emailVerified,
      }
      console.log('[SignIn] Email verification sources:', emailVerifiedSources)
      
      // Check Cognito email confirmation status
      if (user?.cognitoAttributes?.emailVerified === true || user?.cognitoAttributes?.emailVerified === 'true') {
        emailVerified = true
        console.log('[SignIn] ✅ Email verified from cognitoAttributes.emailVerified')
      } else if (user?.attributes?.email_verified === 'true' || user?.attributes?.email_verified === true) {
        emailVerified = true
        console.log('[SignIn] ✅ Email verified from attributes.email_verified')
      } else if (user?.attributes?.emailVerified === 'true' || user?.attributes?.emailVerified === true) {
        emailVerified = true
        console.log('[SignIn] ✅ Email verified from attributes.emailVerified')
      } else {
        // If we can't find the attribute but user signed in successfully,
        // Cognito must have verified them (Cognito requires verification for sign-in)
        console.log('[SignIn] ⚠️ Could not find email_verified attribute, but user signed in successfully')
        console.log('[SignIn] ⚠️ Assuming verified since Cognito requires verification for sign-in')
        emailVerified = true  // Assume verified if sign-in succeeded
      }
    } catch (emailCheckError) {
      console.error('[SignIn] ❌ Error checking email verification:', emailCheckError)
      // If check fails, assume verified (sign-in already succeeded)
      emailVerified = true
      console.log('[SignIn] ⚠️ Defaulting to verified due to check error')
    }
    
    console.log('[SignIn] Final emailVerified result:', emailVerified)

    // Check DynamoDB for user and approval status
    let dynamoUser = null
    let approvalCheckPassed = false
    
    try {
      const { getUserByEmail } = await import('src/services/dynamoDBUsersService')
      console.log('[SignIn] 🔍 Checking DynamoDB for email:', userEmail)
      
      dynamoUser = await getUserByEmail(userEmail)
      
      if (dynamoUser) {
        console.log('[SignIn] ✅ User found in DynamoDB:')
        console.log('[SignIn]   - ID:', dynamoUser.id)
        console.log('[SignIn]   - Email:', dynamoUser.email)
        console.log('[SignIn]   - Approval Status:', dynamoUser.approvalStatus)
        console.log('[SignIn]   - Approval Status Type:', typeof dynamoUser.approvalStatus)
        
        // Check approval status - handle case sensitivity
        const approvalStatus = String(dynamoUser.approvalStatus || '').trim().toLowerCase()
        approvalCheckPassed = approvalStatus === 'approved'
        
        console.log('[SignIn] Approval status check:')
        console.log('[SignIn]   - Raw:', dynamoUser.approvalStatus)
        console.log('[SignIn]   - Normalized:', approvalStatus)
        console.log('[SignIn]   - Is approved?:', approvalCheckPassed)
        
        if (!approvalCheckPassed) {
          console.log('[SignIn] ❌ Approval status is NOT approved')
          await optimizedAuthService.signOut()
          notificationStore.showError(
            `Your account is pending approval. Current status: ${dynamoUser.approvalStatus || 'unknown'}. Please wait for admin approval.`
          )
          loading.value = false
          return
        }
        
        console.log('[SignIn] ✅ Approval status is approved')
      } else {
        console.log('[SignIn] ❌ User NOT found in DynamoDB')
        await optimizedAuthService.signOut()
        notificationStore.showError(
          'Your account is not registered. Please contact support.'
        )
        loading.value = false
        return
      }
    } catch (dynamoError) {
      console.error('[SignIn] ❌ Error checking DynamoDB:', dynamoError)
      console.error('[SignIn] Error message:', dynamoError?.message)
      console.error('[SignIn] Error stack:', dynamoError?.stack)
      
      // On DynamoDB error, sign out and show error
      await optimizedAuthService.signOut()
      notificationStore.showError(
        `Error verifying your account: ${dynamoError?.message || 'Unknown error'}. Please try again later.`
      )
      loading.value = false
      return
    }

    // Both checks passed - proceed to home
    console.log('[SignIn] ========== ALL CHECKS PASSED ==========')
    console.log('[SignIn] Email verified:', emailVerified)
    console.log('[SignIn] Approval status approved:', approvalCheckPassed)
    
    // Load user projects and profile immediately after successful sign-in
    console.log('[SignIn] 🚀 Loading user projects and profile...')
    
    try {
      // Get DynamoDB user ID from the user we already fetched
      const dynamoDbUserId = dynamoUser.id
      console.log('[SignIn] Using DynamoDB user ID for projects:', dynamoDbUserId)
      
      // Load projects using the project store
      const { useProjectStore } = await import('../../stores/projectStore')
      const projectStore = useProjectStore()
      
      // Load user projects
      console.log('[SignIn] Fetching user projects...')
      await projectStore.fetchUserProjects(dynamoDbUserId)
      console.log('[SignIn] ✅ Projects loaded:', projectStore.userProjects.length)
      
      // Auto-select first project if available and none selected
      if (projectStore.userProjects.length > 0 && !projectStore.hasSelectedProject) {
        console.log('[SignIn] Auto-selecting first project')
        projectStore.selectProject(projectStore.userProjects[0])
      }
      
      // Preload profile data in background (non-blocking)
      // This ensures profile data is ready when user visits profile page
      ;(async () => {
        try {
          const { getUserByEmail } = await import('src/services/dynamoDBUsersService')
          const profileData = await getUserByEmail(userEmail)
          if (profileData) {
            // Store in global cache for ProfilePage
            window.__profileCache = {
              data: profileData,
              userId: userId,
              timestamp: Date.now()
            }
            console.log('[SignIn] ✅ Profile data preloaded')
          }
        } catch (profileError) {
          console.warn('[SignIn] ⚠️ Profile preload failed (non-critical):', profileError)
        }
      })()
      
    } catch (loadError) {
      console.error('[SignIn] ❌ Error loading projects/profile:', loadError)
      // Continue anyway - projects can load on home page
    }
    
    console.log('[SignIn] Proceeding to home...')
    
    // FCM will be handled by the boot file after auth state change
    console.log('[SignIn] ✅ FCM will be initialized by boot file')

    // Wait a bit to ensure auth state is fully established
    await new Promise((resolve) => setTimeout(resolve, 500))

    // User is confirmed and approved, proceed to home
    loading.value = false
    router.push('/home')
  } catch (error) {
    console.error('[SignIn] ❌ Sign in error:', error)
    console.error('[SignIn] Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    })
    
    const errorCode = error.code || error.name

    // Check if user needs migration (legacy Firebase account)
    if (errorCode === 'UserNotFoundException' || errorCode === 'NotAuthorizedException') {
      console.log('[SignIn] 🔍 Auth error detected, checking for migration...', errorCode)
      const migrationCheck = await checkForMigration(formData.email)
      
      if (migrationCheck.needsMigration) {
        console.log('[SignIn] ✅ User needs migration, redirecting to migration page')
        // Store email AND user ID in registration store for migration page
        const registrationStore = useRegistrationStore()
        registrationStore.setPersonalData({ email: formData.email })
        registrationStore.setFirestoreUserId(migrationCheck.userId)
        
        console.log('[SignIn] 📋 Stored user ID for migration:', migrationCheck.userId)
        
        notificationStore.showInfo('Please set a new password to complete your account migration.')
        router.push('/migrate-account')
        return
      }
      
      // If migration check fails, continue to show appropriate error
      console.log('[SignIn] ℹ️ User does not need migration, showing error')
    }
    
    // Provide user-friendly error messages
    // Handle both Cognito error codes and normalized Firebase-like codes
    let errorMessage = 'Sign in failed. Please try again.'

    if (error.message?.includes('timeout')) {
      errorMessage = 'Connection timeout. Please check your internet connection and try again.'
    } else if (errorCode === 'InvalidParameterException' || errorCode === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.'
    } else if (errorCode === 'UserDisabledException' || errorCode === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.'
    } else if (errorCode === 'UserNotFoundException' || errorCode === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.'
    } else if (errorCode === 'UserNotConfirmedException' || errorCode === 'auth/email-not-verified') {
      errorMessage = 'This account has not been confirmed yet. Please check your email for the verification link.'
    } else if (errorCode === 'NotAuthorizedException' || errorCode === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password. Please check your credentials and try again.'
    } else if (errorCode === 'NetworkError' || errorCode === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.'
    } else if (errorCode === 'TooManyRequestsException' || errorCode === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    notificationStore.showError(errorMessage)
  } finally {
    loading.value = false
  }
}

// const signInWithGoogle = async () => {
//   if (loading.value) return

//   loading.value = true

//   try {
//     // Attempt Google sign-in with validation
//     const signInResult = await attemptGoogleSignIn()

//     if (!signInResult.success) {
//       // Sign-in was rejected
//       notificationStore.showError(signInResult.reason)
//       return
//     }

//     // Sync PRE user with Smart Mirror service for user isolation
//     const googleUserId = signInResult.user?.uid
//     if (googleUserId) {
//       console.log('[SignIn] 🔐 Syncing Google user with Smart Mirror service:', googleUserId)
//       smartMirrorService.setPreUserId(googleUserId)
//     }

//     // User is eligible for Google sign-in
//     // Check if profile is complete
//     const userData = signInResult.userData
//     const profileValidation = validateProfileCompletion(userData)

//     if (!profileValidation.isComplete) {
//       // Profile incomplete - redirect to appropriate completion step
//       const nextStep = getNextProfileStep(userData)
//       notificationStore.showWarning(
//         `Please complete your profile information before proceeding. Missing: ${profileValidation.message}`,
//       )

//       // Store user data in registration store for completion
//       const registrationStore = useRegistrationStore()
//       registrationStore.setPersonalData({ email: userData.email })
//       registrationStore.setPropertyData({
//         compound: userData.compound || '',
//         unit: userData.unit || '',
//         role: userData.role || '',
//         projects: userData.projects || [], // Include projects data
//       })
//       registrationStore.setUserDetails({
//         firstName: userData.firstName || '',
//         lastName: userData.lastName || '',
//         mobile: userData.mobile || '',
//         dateOfBirth: userData.dateOfBirth || '',
//         gender: userData.gender || 'male',
//         nationalId: userData.nationalId || '',
//       })
//       registrationStore.setTempUserId(userData.uid)
//       registrationStore.setEmailVerified(userData.emailVerified || false)

//       // Redirect to appropriate completion step
//       switch (nextStep) {
//         case 'email_verification':
//           router.push('/register/verify-email')
//           break
//         case 'property_details':
//           router.push('/register')
//           break
//         case 'personal_details':
//           router.push('/register/personal-details')
//           break
//         default:
//           router.push('/register')
//       }
//       return
//     }

//     // Check user approval status
//     const status = await checkUserApprovalStatus(userData.uid)
//     console.log('🚀 Google sign-in approval check result:', status)

//     if (status.approvalStatus === 'pending') {
//       console.log('⏳ User is pending approval (Google), showing modal then signing out')
//       console.log('[SignIn-Google] Setting showPendingModal to true...')
//       // Show pending approval modal FIRST (before sign out)
//       showPendingModal.value = true
//       console.log('[SignIn-Google] showPendingModal value:', showPendingModal.value)
//       // Stop loading immediately so UI can update
//       loading.value = false
//       console.log('[SignIn-Google] Loading set to false')
//       // Wait for the modal to render
//       console.log('[SignIn-Google] Waiting for modal to render...')
//       await new Promise((resolve) => setTimeout(resolve, 500))
//       console.log('[SignIn-Google] Modal should be visible now, signing out user...')
//       // Then sign out the user
//       await optimizedAuthService.signOut()
//       console.log('✅ Pending user signed out (Google sign-in), modal should still be visible')
//       return
//     } else if (status.approvalStatus === 'rejected') {
//       console.log('❌ User is rejected (Google), showing error then signing out')
//       // Show error message FIRST
//       notificationStore.showError(
//         'Your account has been rejected. Please contact support for more information.',
//       )
//       // Wait a tiny bit for the message to render
//       await new Promise((resolve) => setTimeout(resolve, 100))
//       // Then sign out the user
//       await optimizedAuthService.signOut()
//       console.log('✅ Rejected user signed out (Google sign-in)')
//       return
//     }

//     // User is approved - update last login and proceed
//     await firestoreService.setDoc(
//       `users/${userData.uid}`,
//       {
//         lastLogin: new Date(),
//         updatedAt: new Date(),
//       },
//       { merge: true },
//     )

//     notificationStore.showSuccess('Welcome back!')
//     router.push('/home')
//   } catch (error) {
//     console.error('Google sign in error:', error)
//     notificationStore.showError('Google sign in failed. Please try again.')
//   } finally {
//     loading.value = false
//   }
// }

const forgotPassword = () => {
  // TODO: Implement forgot password
  console.log('Forgot password clicked')
}

const goToSignUp = () => {
  router.push('/register')
}

// Device key reset modal handlers
const closeDeviceKeyResetModal = () => {
  showDeviceKeyResetModal.value = false
  // Reset form
  deviceKeyResetForm.email = ''
  deviceKeyResetForm.nationalId = ''
  deviceKeyResetForm.mobile = ''
  deviceKeyResetForm.projectId = ''
  deviceKeyResetForm.reason = ''
}

const onResetProjectChange = () => {
  console.log('📋 Project selected for reset:', deviceKeyResetForm.projectId)
}

const handleDeviceKeyResetSubmit = async () => {
  if (submittingDeviceKeyReset.value) return
  
  submittingDeviceKeyReset.value = true
  
  try {
    console.log('🔑 Submitting device key reset request...')
    
    // Normalize input
    const normalizedEmail = deviceKeyResetForm.email.toLowerCase().trim()
    const normalizedNationalId = deviceKeyResetForm.nationalId.trim()
    const normalizedMobile = deviceKeyResetForm.mobile.trim()
    
    // Validate user exists with matching details
    console.log('🔍 Validating user details...')
    const usersResult = await firestoreService.getDocs('users', {
      filters: [{ field: 'email', operator: '==', value: normalizedEmail }],
      timeoutMs: 10000
    })
    
    if (!usersResult || usersResult.empty || usersResult.docs.length === 0) {
      notificationStore.showError(
        '❌ No account found with this email. Please check your email and try again.'
      )
      submittingDeviceKeyReset.value = false
      return
    }
    
    const userDoc = usersResult.docs[0]
    const userData = userDoc.data()
    const userId = userDoc.id
    
    console.log('✅ User found:', userId)
    
    // Validate national ID
    if (userData.nationalId !== normalizedNationalId) {
      notificationStore.showError(
        '❌ National ID does not match our records. Please check and try again.'
      )
      submittingDeviceKeyReset.value = false
      return
    }
    
    // Validate mobile number
    if (userData.mobile !== normalizedMobile) {
      notificationStore.showError(
        '❌ Mobile number does not match our records. Please check and try again.'
      )
      submittingDeviceKeyReset.value = false
      return
    }
    
    // Validate user is part of the selected project
    const userProjects = userData.projects || []
    const isInProject = userProjects.some(p => p.projectId === deviceKeyResetForm.projectId)
    
    if (!isInProject) {
      notificationStore.showError(
        '❌ You are not registered in the selected project. Please select the correct project.'
      )
      submittingDeviceKeyReset.value = false
      return
    }
    
    console.log('✅ All validations passed')
    
    // Use direct Firebase SDK for better reliability
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')
    const { signInAnonymously, signOut } = await import('firebase/auth')
    const { db, auth } = await import('../../boot/firebase')
    
    // iOS native apps require authentication to write to Firestore, even with "allow create: if true"
    // Sign in anonymously first to get write permissions
    console.log('🔐 Signing in anonymously to enable Firestore write...')
    try {
      await signInAnonymously(auth)
      console.log('✅ Anonymous sign-in successful')
    } catch (authError) {
      console.log('⚠️ Anonymous sign-in failed (might already be signed in):', authError.code)
      // Continue anyway - user might already be signed in
    }
    
    // Note: We skip checking for existing pending requests because:
    // 1. User is not authenticated with their real account (they're locked out)
    // 2. The admin dashboard will handle any duplicate requests
    console.log('ℹ️ Skipping duplicate check (user not authenticated on SignIn page)')
    
    const requestsRef = collection(db, 'projects', deviceKeyResetForm.projectId, 'deviceKeyResetRequests')
    
    // Create the reset request
    console.log('📝 Creating device key reset request...')
    const requestData = {
      userId: userId,
      userEmail: normalizedEmail,
      userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      userUnit: userProjects.find(p => p.projectId === deviceKeyResetForm.projectId)?.unit || '',
      nationalId: normalizedNationalId,
      mobile: normalizedMobile,
      projectId: deviceKeyResetForm.projectId,
      reason: deviceKeyResetForm.reason.trim(),
      status: 'pending',
      requestedAt: new Date(),
      resolvedAt: null,
      resolvedBy: null,
      adminNotes: ''
    }
    
    // Use Firebase Web SDK (works on all platforms including iOS)
    console.log('[SignIn] Creating device key reset request via Firebase Web SDK...')
    await addDoc(requestsRef, {
      ...requestData,
      requestedAt: serverTimestamp()
    })
    
    console.log('✅ Device key reset request submitted successfully via Web SDK')
    
    // Sign out the anonymous user immediately after submission
    try {
      await signOut(auth)
      console.log('✅ Signed out anonymous user')
    } catch (signOutError) {
      console.log('⚠️ Error signing out anonymous user:', signOutError.code)
    }
    
    notificationStore.showSuccess(
      '✅ Your device key reset request has been submitted successfully! Our admin will review it shortly. You will be notified once approved.'
    )
    
    closeDeviceKeyResetModal()
    
  } catch (error) {
    console.error('❌ Error submitting device key reset request:', error)
    
    let errorMessage = '❌ Failed to submit request. Please try again.'
    
    if (error.message?.includes('timeout')) {
      errorMessage = '❌ Request timed out. Please check your internet connection and try again.'
    } else if (error.message?.includes('permission')) {
      errorMessage = '❌ Permission denied. Please contact support.'
    }
    
    notificationStore.showError(errorMessage)
  } finally {
    submittingDeviceKeyReset.value = false
  }
}
</script>

<style scoped>
.signin-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  /* Enable scrolling for keyboard visibility */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #222222;
  color: white;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.page-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  line-height: 1;
}

.placeholder {
  width: 40px;
}

.content {
  padding: 40px 20px;
  max-width: 400px;
  margin: 0 auto;
  /* Add extra bottom padding for keyboard */
  padding-bottom: 100px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.welcome-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.new-user-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #e8f5e9; /* Light green background */
  border: 1px solid #a5d6a7; /* Green border */
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  color: #2e7d32; /* Dark green text */
  font-size: 0.9rem;
  font-weight: 500;
}

.new-user-message svg {
  flex-shrink: 0;
}

.signin-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  /* iOS keyboard improvements */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.form-input:focus {
  outline: none;
  border-color: #af1e23;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
}

/* Move eye icon to left for RTL languages */
[dir="rtl"] .password-toggle {
  right: auto;
  left: 15px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
}

.checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox:checked + .checkmark {
  background-color: #af1e23;
  border-color: #af1e23;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.forgot-link {
  background: none;
  border: none;
  color: #af1e23;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
}

.signin-btn {
  width: 100%;
  background-color: #af1e23;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.signin-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  margin: 30px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e1e5e9;
}

.divider span {
  background-color: #f8f9fa;
  padding: 0 20px;
  color: #666;
  font-size: 0.9rem;
}

.google-signin-section {
  margin-bottom: 30px;
}

.google-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 15px;
  color: #666;
  font-size: 0.85rem;
}

.google-notice svg {
  flex-shrink: 0;
}

.social-signin {
  margin-bottom: 30px;
}

.social-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  color: #333;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.signup-prompt {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.signup-link {
  background: none;
  border: none;
  color: #af1e23;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 5px;
}

.device-key-reset-link {
  text-align: center;
  margin-top: 20px;
}

.reset-link {
  background: none;
  border: none;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.reset-link:hover {
  background-color: #f0f0f0;
  color: #af1e23;
}

.reset-link svg {
  color: #af1e23;
  flex-shrink: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 9999999;
  animation: fadeIn 0.3s ease-out;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 0;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  margin: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
}

.close-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #af1e23;
}

.modal-body {
  padding: 24px;
}

.modal-description {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 24px;
  line-height: 1.5;
}

.form-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
  resize: vertical;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.form-textarea:focus {
  outline: none;
  border-color: #af1e23;
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}

.loading-text {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-top: 8px;
  font-style: italic;
}

.error-text {
  display: block;
  font-size: 0.8rem;
  color: #af1e23;
  margin-top: 8px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
  border-color: #ccc;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #af1e23 0%, #8b161a 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Responsive design */
@media (max-width: 480px) {
  .content {
    padding: 30px 15px;
  }

  .welcome-title {
    font-size: 1.6rem;
    margin: 0;
  }

  .form-input {
    padding: 14px;
  }

  .modal-content {
    width: 95%;
  }

  .modal-header {
    padding: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }
}
</style>
