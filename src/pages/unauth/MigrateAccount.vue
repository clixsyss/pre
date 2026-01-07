<template>
  <div class="migrate-page" @click="handlePageClick">
    <!-- Header -->
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="white" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <h1 class="page-title">Account Migration</h1>
      <div class="placeholder"></div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="welcome-section">
        <p class="welcome-subtitle">Please set a new password to secure your account</p>
      </div>

      <form @submit.prevent="handleMigration" class="migrate-form" @click.stop>
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input id="email" v-model="formData.email" type="email" class="form-input" placeholder="Your email address"
            disabled />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">New Password</label>
          <div class="password-input-wrapper">
            <input id="password" v-model="formData.password" :type="showPassword ? 'text' : 'password'"
              class="form-input" placeholder="Enter new password" required minlength="8" autofocus />
            <button type="button" @click="togglePassword" class="password-toggle">
              <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 12 6 4 12 4C18 4 22 12 22 12C22 12 18 20 12 20C6 20 2 12 2 12Z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <div class="password-requirements">
            <small class="requirements-title">Password requirements:</small>
            <ul class="requirements-list">
              <li :class="{ valid: hasMinLength }">
                <span v-if="hasMinLength">✓</span>
                <span v-else>•</span>
                At least 8 characters long
              </li>
              <li :class="{ valid: hasUpperCase }">
                <span v-if="hasUpperCase">✓</span>
                <span v-else>•</span>
                Contains at least one uppercase letter
              </li>
              <li :class="{ valid: hasLowerCase }">
                <span v-if="hasLowerCase">✓</span>
                <span v-else>•</span>
                Contains at least one lowercase letter
              </li>
              <li :class="{ valid: hasNumber }">
                <span v-if="hasNumber">✓</span>
                <span v-else>•</span>
                Contains at least one number
              </li>
              <li :class="{ valid: hasSpecialChar }">
                <span v-if="hasSpecialChar">✓</span>
                <span v-else>•</span>
                Contains at least one special character
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm New Password</label>
          <div class="password-input-wrapper">
            <input id="confirmPassword" v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'" class="form-input" placeholder="Confirm new password"
              required minlength="8" />
            <button type="button" @click="toggleConfirmPassword" class="password-toggle">
              <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 12 6 4 12 4C18 4 22 12 22 12C22 12 18 20 12 20C6 20 2 12 2 12Z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Password validation feedback -->
        <div v-if="formData.password && formData.confirmPassword" class="validation-feedback">
          <div v-if="formData.password !== formData.confirmPassword" class="error-feedback">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            Passwords do not match
          </div>
          <div v-else class="success-feedback">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            Passwords match
          </div>
        </div>

        <button type="submit" class="migrate-btn" :disabled="loading || !canSubmit">
          <span v-if="loading">Migrating Account...</span>
          <span v-else>Complete Migration</span>
        </button>
      </form>

      <!-- Migration Notice -->
      <div class="migration-notice">
        <div class="notice-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12 8V12" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12 16H12.01" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <p class="notice-text">
          We're upgrading our security system. Please create a new password to continue using your account.
        </p>
      </div>

      <div class="help-section">
        <p class="help-text">Need help? <a href="#" class="help-link">Contact Support</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Keyboard } from '@capacitor/keyboard'
import { Capacitor } from '@capacitor/core'
import { useNotificationStore } from '../../stores/notifications'
import { useRegistrationStore } from '../../stores/registration'
import optimizedAuthService from '../../services/optimizedAuthService'

defineOptions({ name: 'MigrateAccountPage' })

const router = useRouter()
const notificationStore = useNotificationStore()
const registrationStore = useRegistrationStore()

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

onMounted(() => {
  const challenge = registrationStore.migrationChallenge
  const email = challenge.email || registrationStore.personalData.email

  // Check if we have either a cognitoUser (NEW_PASSWORD_REQUIRED) or userData (MIGRATION_REQUIRED)
  if ((!challenge.cognitoUser && challenge.type !== 'MIGRATION_REQUIRED') || !email) {
    notificationStore.showError('No pending migration found. Please try signing in again.')
    router.push('/signin')
    return
  }

  formData.email = email
})

const goBack = () => {
  router.push('/signin')
}

const handlePageClick = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Keyboard.hide()
    } catch {
      // Keyboard API may not be available; ignore
    }
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Password validation computed properties
const hasMinLength = computed(() => formData.password.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(formData.password))
const hasLowerCase = computed(() => /[a-z]/.test(formData.password))
const hasNumber = computed(() => /[0-9]/.test(formData.password))
const hasSpecialChar = computed(() => /[^A-Za-z0-9]/.test(formData.password))

const isPasswordValid = computed(() => {
  const pwd = formData.password
  return pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[^A-Za-z0-9]/.test(pwd)
})

const canSubmit = computed(() =>
  formData.email &&
  formData.password &&
  formData.confirmPassword &&
  formData.password === formData.confirmPassword &&
  isPasswordValid.value &&
  !loading.value,
)

const handleMigration = async () => {
  if (loading.value) return

  if (!formData.password) {
    notificationStore.showError('Please enter a password')
    return
  }
  
  if (!isPasswordValid.value) {
    notificationStore.showError('Password does not meet requirements. Please check the requirements below.')
    return
  }

  if (formData.password !== formData.confirmPassword) {
    notificationStore.showError('Passwords do not match')
    return
  }

  const challenge = registrationStore.migrationChallenge
  const migrationType = challenge.type || (challenge.cognitoUser ? 'NEW_PASSWORD_REQUIRED' : 'MIGRATION_REQUIRED')
  
  if (migrationType === 'NEW_PASSWORD_REQUIRED' && !challenge.cognitoUser) {
    notificationStore.showError('Migration session has expired. Please sign in again.')
    router.push('/signin')
    return
  }

  loading.value = true

  try {
    console.log('[MigrateAccount] Completing migration for:', formData.email)
    console.log('[MigrateAccount] Migration type:', migrationType)

    if (migrationType === 'NEW_PASSWORD_REQUIRED') {
      // Existing flow: User exists in Cognito but needs to set password
    await optimizedAuthService.completeNewPassword(challenge.cognitoUser, formData.password)
    } else if (migrationType === 'MIGRATION_REQUIRED') {
      // Migration flow: Instantly confirm user without email verification
      console.log('[MigrateAccount] Starting instant confirmation for migrated user...')
      
      // Use the migration service to instantly confirm and sign in the user
      const { instantlyConfirmMigratedUser } = await import('src/services/migrationService')
      const migrationResult = await instantlyConfirmMigratedUser(
        formData.email.trim(),
        formData.password
      )
      
      // Always update DynamoDB with cognitoUserId if we have it
      const cognitoUserId = migrationResult.cognitoUserId
      if (registrationStore.firestoreUserId && cognitoUserId) {
        console.log('[MigrateAccount] Updating DynamoDB user with authUid...')
        const { updateUser } = await import('src/services/dynamoDBUsersService')
        await updateUser(registrationStore.firestoreUserId, {
          authUid: cognitoUserId,
          emailVerified: migrationResult.confirmed || false
        })
        console.log('[MigrateAccount] ✅ DynamoDB user updated with authUid:', cognitoUserId)
      }

      // Check if migration was successful
      if (!migrationResult.success) {
        // Migration failed - show error and redirect
        let errorMessage = migrationResult.message || 'Failed to migrate account. Please try again or contact support.'
        console.error('[MigrateAccount] Migration failed:', migrationResult)
        notificationStore.showError(errorMessage)
        
        setTimeout(() => {
          router.push({
            path: '/signin',
            query: {
              message: 'Migration failed. Please try again or contact support.',
              email: formData.email.trim()
            }
          })
        }, 2000)
        
        return
      }
      
      // Success! User is confirmed (but not signed in - they'll sign in manually)
      console.log('[MigrateAccount] ✅ User migrated and confirmed successfully')
      console.log('[MigrateAccount] User will sign in manually with their new password')
      
      // Update DynamoDB was already done above
    } else {
      throw new Error('Unknown migration type')
    }

    // Clear migration challenge before redirecting
    registrationStore.clearMigrationChallenge()
    registrationStore.setPersonalData({ email: '' })

    // Show success message and redirect to sign-in - user will sign in manually
    notificationStore.showSuccess('Account migrated successfully! Please sign in with your new password.')

    // Always redirect to sign-in - user will sign in manually
    setTimeout(() => {
      router.push({
        path: '/signin',
        query: {
          message: 'Account migration completed! Please sign in with your new password.',
          email: formData.email.trim()
        }
      })
    }, 1500)
  } catch (error) {
    console.error('[MigrateAccount] ❌ Migration error:', error)
    console.error('[MigrateAccount] Error details:', {
      code: error.code,
      message: error.message,
      name: error.name,
    })

    let errorMessage = 'Migration failed. Please try again.'

    if (error.code === 'InvalidPasswordException') {
      errorMessage =
        'Password does not meet complexity requirements. Please choose a stronger password.'
    } else if (error.code === 'NotAuthorizedException') {
      errorMessage = 'The migration session has expired. Please try signing in again.'
    } else if (error.code === 'UsernameExistsException' || error.message?.includes('already exists')) {
      errorMessage = 'An account with this email already exists. Please try signing in instead.'
    } else if (error.message === 'USER_NOT_CONFIRMED' || error.code === 'UserNotConfirmedException' || error.code === 'auth/email-not-verified') {
      errorMessage = 'Your account has been created successfully, but it needs to be confirmed by an administrator before you can sign in. Please contact support to confirm your account, or wait for an administrator to approve it.'
    } else if (error.message) {
      errorMessage = error.message
    }

    notificationStore.showError(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.migrate-page {
  min-height: 100vh;
  background-color: #f8f9fa;
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
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
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

.migration-notice {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.notice-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-text {
  color: #1565c0;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.migrate-form {
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
}

.form-input:focus {
  outline: none;
  border-color: #af1e23;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
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

.password-requirements {
  margin-top: 10px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
}

.requirements-title {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 6px;
  transition: color 0.2s;
}

.requirements-list li:last-child {
  margin-bottom: 0;
}

.requirements-list li.valid {
  color: #388e3c;
  font-weight: 500;
}

.requirements-list li span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  font-weight: bold;
}

.validation-feedback {
  margin-bottom: 20px;
}

.error-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d32f2f;
  font-size: 0.9rem;
  font-weight: 500;
}

.error-feedback svg {
  stroke: #d32f2f;
  flex-shrink: 0;
}

.success-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #388e3c;
  font-size: 0.9rem;
  font-weight: 500;
}

.success-feedback svg {
  stroke: #388e3c;
  flex-shrink: 0;
}

.migrate-btn {
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

.migrate-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.help-section {
  text-align: center;
  margin-top: 20px;
}

.help-text {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.help-link {
  color: #af1e23;
  text-decoration: none;
  font-weight: 600;
}

/* Mobile app - hover effects disabled */
/* .help-link:hover {
  text-decoration: underline;
} */

/* Responsive design */
@media (max-width: 480px) {
  .content {
    padding: 30px 15px;
  }

  .welcome-title {
    font-size: 1.6rem;
  }

  .form-input {
    padding: 14px;
  }
}
</style>
