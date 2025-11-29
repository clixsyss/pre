<template>
  <div class="service-category-details">
    <!-- Page Header -->
    <PageHeader :title="getLocalizedTitle(category) || $t('loadingLabel')" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingServices') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadServices" class="retry-btn">{{ $t('retry') }}</button>
    </div>

    <!-- Services List -->
    <div v-else-if="services.length > 0" class="services-list">
      <h3 class="section-title">{{ $t('availableServices') }}</h3>
      <div
        v-for="service in services"
        :key="service.id"
        class="service-item"
        @click="openBookingDialog(service)"
      >
        <div class="service-info">
          <h4 class="service-name">{{ getLocalizedTitle(service) }}</h4>
          <p class="service-description">{{ getLocalizedDescription(service) }}</p>
          <div class="service-price">{{ $t('currency') }} {{ service.price }}</div>
        </div>
        <div class="service-arrow">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- No Services State -->
    <div v-else class="no-services">
      <div class="no-services-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.7 6.3C14.7 4.4 13.3 3 11.4 3C9.5 3 8.1 4.4 8.1 6.3C8.1 8.2 9.5 9.6 11.4 9.6C13.3 9.6 14.7 8.2 14.7 6.3Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M20 12C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 8V12L15 15"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h3>{{ $t('noServicesAvailable') }}</h3>
      <p>{{ $t('noServicesInCategory') }}</p>
    </div>

    <!-- Booking Dialog -->
    <div v-if="showBookingDialog" class="booking-dialog-overlay" @click="closeBookingDialog">
      <div class="booking-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">{{ $t('bookService') }}</h3>
          <button @click="closeBookingDialog" class="close-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <div class="dialog-content">
          <!-- Service Info Card -->
          <div class="service-info-card">
            <div class="service-header">
              <div class="service-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="service-details">
                <h4 class="service-name">{{ getLocalizedTitle(selectedService) }}</h4>
                <p class="service-description">{{ getLocalizedDescription(selectedService) }}</p>
              </div>
              <div class="service-price-badge">
                <span class="price-amount">{{ $t('currency') }} {{ selectedService?.price }}</span>
              </div>
            </div>
          </div>

          <!-- Booking Steps -->
          <div class="booking-steps">
            <!-- Step 1: Date Selection -->
            <div class="booking-step" :class="{ active: !selectedDate, completed: selectedDate }">
              <div class="step-indicator">
                <div class="step-number">1</div>
                <div class="step-line"></div>
              </div>
              <div class="step-content">
                <h4 class="step-title">{{ $t('selectDate') }}</h4>
                <p class="step-subtitle">{{ $t('choosePreferredDate') }}</p>
                <div class="dropdown-container">
                  <select
                    v-model="selectedDate"
                    @change="onDateChange"
                    class="modern-dropdown"
                    :disabled="loadingTimeSlots"
                  >
                    <option value="" disabled>{{ $t('chooseDate') }}</option>
                    <option
                      v-for="day in availableDays"
                      :key="day.fullDate"
                      :value="day.fullDate"
                      :disabled="!day.available"
                    >
                      {{ day.name }} - {{ day.date }}
                      {{ day.available ? `(${day.timeRange})` : `(${$t('unavailable')})` }}
                    </option>
                  </select>
                  <div class="dropdown-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Time Selection -->
            <div
              v-if="selectedDate"
              class="booking-step"
              :class="{ active: selectedDate && !selectedTime, completed: selectedTime }"
            >
              <div class="step-indicator">
                <div class="step-number">2</div>
                <div class="step-line"></div>
              </div>
              <div class="step-content">
                <h4 class="step-title">{{ $t('selectTime') }}</h4>
                <p class="step-subtitle">{{ $t('pickPreferredTimeSlot') }}</p>
                <div class="dropdown-container">
                  <select
                    v-model="selectedTime"
                    @change="onTimeChange"
                    class="modern-dropdown"
                    :disabled="loadingTimeSlots || availableTimeSlots.length === 0"
                  >
                    <option value="" disabled>{{ $t('chooseTime') }}</option>
                    <option
                      v-for="slot in availableTimeSlots"
                      :key="slot.time"
                      :value="slot.time"
                      :disabled="slot.isReserved"
                    >
                      {{ slot.time }} {{ slot.isReserved ? `(${$t('booked')})` : '' }}
                    </option>
                  </select>
                  <div class="dropdown-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Loading State -->
                <div v-if="loadingTimeSlots" class="loading-state">
                  <div class="loading-spinner"></div>
                  <p>{{ $t('loadingTimeSlots') }}</p>
                </div>

                <!-- No Time Slots -->
                <div v-else-if="availableTimeSlots.length === 0" class="no-slots-state">
                  <div class="no-slots-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </div>
                  <p>{{ $t('noTimeSlotsAvailable') }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Summary -->
          <div v-if="selectedDate && selectedTime" class="booking-summary">
            <div class="summary-header">
              <h4>{{ $t('bookingSummary') }}</h4>
            </div>
            <div class="summary-content">
              <div class="summary-item">
                <span class="summary-label">{{ $t('service') }}:</span>
                <span class="summary-value">{{ getLocalizedTitle(selectedService) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">{{ $t('date') }}:</span>
                <span class="summary-value">{{ formatSelectedDate(selectedDate) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">{{ $t('time') }}:</span>
                <span class="summary-value">{{ selectedTime }}</span>
              </div>
              <div class="summary-item total">
                <span class="summary-label">{{ $t('total') }}:</span>
                <span class="summary-value">{{ $t('currency') }} {{ selectedService?.price }}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="booking-actions">
            <button @click="closeBookingDialog" class="cancel-btn">{{ $t('cancel') }}</button>
            <button
              @click="confirmBooking"
              :disabled="!selectedDate || !selectedTime || isBookingInProgress"
              class="book-btn"
              :class="{ loading: isBookingInProgress }"
            >
              <span v-if="!isBookingInProgress" class="btn-content">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ $t('confirmBooking') }}
              </span>
              <span v-else class="btn-content">
                <div class="btn-spinner"></div>
                {{ $t('booking') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useModalState } from '../../composables/useModalState'
import { useFormKeyboard } from '../../composables/useFormKeyboard'
import { useServiceCategoriesStore } from '../../stores/serviceCategoriesStore'
import { useProjectStore } from '../../stores/projectStore'
import { useNotificationStore } from '../../stores/notifications'
import { useServiceBookingStore } from '../../stores/serviceBookingStore'
import serviceTimeSlotService from '../../services/serviceTimeSlotService'
import optimizedAuthService from '../../services/optimizedAuthService'
import PageHeader from '../../components/PageHeader.vue'

// Component name for ESLint
defineOptions({
  name: 'ServiceCategoryDetails',
})

// Setup keyboard handling for better mobile UX
useFormKeyboard({
  scrollToInput: true,
  hideOnBackdropClick: true,
  scrollOffset: 150
})

const route = useRoute()
const { locale } = useI18n()
const serviceCategoriesStore = useServiceCategoriesStore()
const projectStore = useProjectStore()
const notificationStore = useNotificationStore()
const serviceBookingStore = useServiceBookingStore()
const { openModal, closeModal } = useModalState()

// Helper function to get localized text
const getLocalizedTitle = (item) => {
  if (!item) return ''
  const isArabic = locale.value === 'ar-SA' || locale.value.startsWith('ar')
  
  if (isArabic) {
    // Check if arabicTitle exists and is valid
    if (item.arabicTitle) {
      // Clean up corrupted text
      const cleaned = item.arabicTitle
        .replace(/\s*arabic\s*$/i, '')
        .replace(/\s*ararbic\s*$/i, '')
        .trim()
      
      // Only use if it's actually Arabic text
      if (cleaned && /[\u0600-\u06FF]/.test(cleaned)) {
        return cleaned
      }
    }
    
    // Translate common service/category names if no valid Arabic title
    const englishTitle = (item.englishTitle || item.name || '').toLowerCase().trim()
    const translations = {
      'home maintenance': 'صيانة المنزل',
      'plumbing': 'السباكة',
      'electrical': 'الكهرباء',
      'electricity': 'الكهرباء',
      'electricity meter': 'عداد الكهرباء',
      'cleaning': 'التنظيف',
      'painting': 'الدهان',
      'carpentry': 'النجارة',
      'air conditioning': 'التكييف',
      'pest control': 'مكافحة الحشرات',
      'landscaping': 'تنسيق الحدائق',
      'handyman': 'خدمات عامة',
      'hvac': 'التدفئة والتهوية',
      'locksmith': 'الأقفال',
      'appliance repair': 'إصلاح الأجهزة'
    }
    
    if (translations[englishTitle]) {
      return translations[englishTitle]
    }
  }
  
  return item.englishTitle || item.name || ''
}

const getLocalizedDescription = (item) => {
  if (!item) return ''
  const isArabic = locale.value === 'ar-SA' || locale.value.startsWith('ar')
  
  if (isArabic) {
    if (item.arabicDescription) {
      const cleaned = item.arabicDescription
        .replace(/\s*arabic\s*$/i, '')
        .replace(/\s*ararbic\s*$/i, '')
        .trim()
      
      if (cleaned && /[\u0600-\u06FF]/.test(cleaned)) {
        return cleaned
      }
    }
    
    // Provide generic Arabic descriptions for common services if none exist
    const englishDesc = (item.englishDescription || item.description || '').toLowerCase().trim()
    const englishTitle = (item.englishTitle || item.name || '').toLowerCase().trim()
    
    // Generic descriptions based on service type
    if (englishTitle.includes('plumbing') || englishDesc.includes('plumbing')) {
      return 'خدمات السباكة والإصلاحات'
    }
    if (englishTitle.includes('electric') || englishDesc.includes('electric')) {
      return 'خدمات الكهرباء والصيانة'
    }
    if (englishTitle.includes('meter')) {
      return 'قراءة وصيانة العدادات'
    }
    if (englishTitle.includes('cleaning')) {
      return 'خدمات التنظيف والتعقيم'
    }
  }
  
  return item.englishDescription || item.description || ''
}

// State
const category = ref(null)
const services = ref([])
const loading = ref(false)
const error = ref(null)
const showBookingDialog = ref(false)
const selectedService = ref(null)
const selectedDate = ref(null)
const selectedTime = ref(null)
const availableDays = ref([])
const availableTimeSlots = ref([])
const loadingTimeSlots = ref(false)
const isBookingInProgress = ref(false)

// Computed
const categoryId = computed(() => route.params.id)

// Load category and services
onMounted(async () => {
  await loadCategory()
  await loadServices()
})

// Watch for modal state changes - iOS fix to hide navigation bars
watch(showBookingDialog, (isOpen) => {
  if (isOpen) {
    openModal()
  } else {
    closeModal()
  }
})

const loadCategory = async () => {
  if (projectStore.selectedProject?.id) {
    await serviceCategoriesStore.fetchCategories(projectStore.selectedProject.id)
    category.value = serviceCategoriesStore.getCategories.find((cat) => cat.id === categoryId.value)
  }
}

const loadServices = async () => {
  if (!projectStore.selectedProject?.id || !categoryId.value) return

  try {
    loading.value = true
    error.value = null

    const servicesData = await serviceCategoriesStore.getServicesByCategory(
      projectStore.selectedProject.id,
      categoryId.value,
    )
    services.value = servicesData
  } catch (err) {
    console.error('Error loading services:', err)
    error.value = err.message || 'Failed to load services'
  } finally {
    loading.value = false
  }
}

const openBookingDialog = (service) => {
  selectedService.value = service
  selectedDate.value = null
  selectedTime.value = null
  availableTimeSlots.value = []
  generateAvailableDays()
  showBookingDialog.value = true
}

const closeBookingDialog = () => {
  console.log('🚪 closeBookingDialog called')
  showBookingDialog.value = false
  selectedService.value = null
  selectedDate.value = null
  selectedTime.value = null
  availableDays.value = []
  availableTimeSlots.value = []
  isBookingInProgress.value = false

  // Ensure modal state is also closed
  closeModal()
}

const generateAvailableDays = () => {
  if (!category.value?.availability) return

  const days = []
  const today = new Date()
  const isArabic = locale.value === 'ar-SA' || locale.value.startsWith('ar')
  // Use en-US calendar with Arabic text (Gregorian calendar, not Hijri)
  const dateLocale = isArabic ? 'ar-EG' : 'en-US'

  // Generate next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const dayName = date.toLocaleDateString(dateLocale, { weekday: 'long', calendar: 'gregory' })
    const dayKey = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const availability = category.value.availability[dayKey]

    const dayInfo = {
      name: dayName,
      date: date.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric', calendar: 'gregory' }),
      fullDate: date.toISOString().split('T')[0],
      available: availability?.available || false,
      timeRange: availability?.available
        ? `${availability.startTime} - ${availability.endTime}`
        : null,
    }

    days.push(dayInfo)
  }

  availableDays.value = days
}

// Dropdown change handlers
const onDateChange = async (event) => {
  const date = event.target.value
  if (date) {
    selectedDate.value = date
    selectedTime.value = null // Reset time when date changes
    await loadTimeSlots(date)
  }
}

const onTimeChange = (event) => {
  const time = event.target.value
  if (time) {
    selectedTime.value = time
  }
}

// Format selected date for display
const formatSelectedDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const isArabic = locale.value === 'ar-SA' || locale.value.startsWith('ar')
  // Use Gregorian calendar with Arabic text, not Hijri
  const dateLocale = isArabic ? 'ar-EG' : 'en-US'
  
  return date.toLocaleDateString(dateLocale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'gregory'
  })
}

// Helper function to get day of week from date
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString)
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  return dayOfWeek
}

const loadTimeSlots = async (date) => {
  if (!selectedService.value || !projectStore.selectedProject?.id || !category.value?.id) return

  try {
    loadingTimeSlots.value = true
    const slots = await serviceTimeSlotService.getAvailableTimeSlots(
      projectStore.selectedProject.id,
      selectedService.value.id,
      category.value.id,
      date,
    )
    availableTimeSlots.value = slots
  } catch (error) {
    console.error('Error loading time slots:', error)
    availableTimeSlots.value = []
  } finally {
    loadingTimeSlots.value = false
  }
}

const confirmBooking = async () => {
  console.log('🔍 Book Service button clicked!', {
    selectedDate: selectedDate.value,
    selectedTime: selectedTime.value,
    selectedService: selectedService.value,
    projectId: projectStore.selectedProject?.id,
  })

  // Prevent double-clicking
  if (isBookingInProgress.value) {
    console.log('⏳ Booking already in progress, ignoring click')
    return
  }

  if (
    !selectedDate.value ||
    !selectedTime.value ||
    !selectedService.value ||
    !projectStore.selectedProject?.id
  ) {
    console.log('❌ Missing required data for booking')
    notificationStore.showError('Please select both date and time')
    return
  }

  isBookingInProgress.value = true

  try {
    console.log('✅ Creating booking...')
    // Prepare booking data
    const bookingData = {
      serviceId: selectedService.value.id,
      categoryId: categoryId.value,
      serviceName: selectedService.value.englishTitle,
      categoryName: category.value?.englishTitle || 'Service Category',
      servicePrice: selectedService.value.price,
      selectedDate: selectedDate.value,
      selectedTime: selectedTime.value,
      notes: '',
      // Include category-level time slot configuration
      categoryTimeSlotInterval: category.value?.timeSlotInterval || 30,
      categoryStartTime:
        category.value?.availability?.[getDayOfWeek(selectedDate.value)]?.startTime || '09:00',
      categoryEndTime:
        category.value?.availability?.[getDayOfWeek(selectedDate.value)]?.endTime || '17:00',
    }

    // Create the booking
    const bookingId = await serviceBookingStore.createBooking(
      projectStore.selectedProject.id,
      bookingData,
    )

    console.log('✅ Service booking created successfully:', { bookingId, bookingData })

    // Show success notification
    notificationStore.showSuccess(`${selectedService.value?.englishTitle} booked successfully!`)

    // Close dialog immediately
    closeBookingDialog()
    
    // Refresh service bookings in the background (don't await to prevent blocking)
    optimizedAuthService.getCurrentUser()
      .then((user) => {
        if (user) {
          return serviceBookingStore.fetchUserBookings(projectStore.selectedProject.id, user.uid, true)
        }
      })
      .catch((err) => {
        console.error('Error refreshing bookings:', err)
      })
  } catch (error) {
    console.error('❌ Error creating service booking:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      error: error,
    })
    notificationStore.showError(error.message || 'Failed to book service. Please try again.')
  } finally {
    isBookingInProgress.value = false
  }
}
</script>

<style scoped>
.service-category-details {
  padding: 0;
  background: #fafafa;
  min-height: 100%;
}

/* RTL Support */
[dir="rtl"] .service-category-details {
  direction: rtl;
}

/* Category Info */
.category-info {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 0 16px 24px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 20px;
}

.category-image {
  flex-shrink: 0;
}

.category-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
}

.default-image {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.category-details {
  flex: 1;
}

.category-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.category-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Loading and Error States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #af1e23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  margin: 20px 0;
}

.retry-btn {
  background: #af1e23;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
}

/* Mobile app - hover effects disabled */
/* .retry-btn:hover {
  background: #8B1A1E;
} */

/* Services List */
.services-list {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

[dir="rtl"] .services-list {
  text-align: right;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
}

[dir="rtl"] .service-item {
  text-align: right;
}

.service-item:last-child {
  border-bottom: none;
}

/* Mobile app - hover effects disabled */
/* .service-item:hover {
  background: #f9fafb;
  margin: 0 -16px;
  padding: 16px;
  border-radius: 8px;
} */

.service-info {
  flex: 1;
}

.service-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.service-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.service-price {
  font-size: 1rem;
  font-weight: 600;
  color: #af1e23;
}

.service-arrow {
  color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

[dir="rtl"] .service-arrow {
  transform: scaleX(-1);
}

/* Mobile app - hover effects disabled */
/* .service-item:hover .service-arrow {
  color: #AF1E23;
  transform: translateX(4px);
} */

/* No Services State */
.no-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  margin: 0 16px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.no-services-icon {
  color: #d1d5db;
  margin-bottom: 20px;
}

.no-services h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.no-services p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Booking Dialog */
.booking-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  padding: 20px;
  /* iOS Safari fixes */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.booking-dialog {
  background: white;
  border-radius: 16px;
  width: 98%;
  max-height: 75vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  position: relative;
  z-index: 10;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

[dir="rtl"] .dialog-header {
  flex-direction: row-reverse;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .close-btn:hover {
  background: #f3f4f6;
  color: #374151;
} */

.dialog-content {
  padding: 20px;
  pointer-events: auto;
  position: relative;
}

[dir="rtl"] .dialog-content {
  text-align: right;
}

.dialog-content .service-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.dialog-content .service-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.dialog-content .service-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.dialog-content .service-price {
  font-size: 1rem;
  font-weight: 600;
  color: #af1e23;
}

.availability-section {
  margin-bottom: 24px;
}

.availability-section .section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

/* Service Info Card */
.service-info-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.service-info-card:hover {
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15);
}

.service-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

[dir="rtl"] .service-header {
  flex-direction: row-reverse;
  text-align: right;
}

.service-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.service-details {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.service-description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.service-price-badge {
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.125rem;
  box-shadow: 0 4px 8px rgba(175, 30, 35, 0.3);
}

/* Booking Steps */
.booking-steps {
  margin-bottom: 32px;
}

[dir="rtl"] .booking-steps {
  direction: rtl;
}

.booking-step {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

[dir="rtl"] .booking-step {
  flex-direction: row-reverse;
}

.booking-step.active {
  opacity: 1;
}

.booking-step.completed {
  opacity: 1;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.booking-step.active .step-number {
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
  transform: scale(1.1);
}

.booking-step.completed .step-number {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.booking-step.completed .step-number::after {
  content: '✓';
  font-size: 1.2rem;
}

.step-line {
  width: 2px;
  height: 60px;
  background: #e2e8f0;
  margin-top: 8px;
  transition: all 0.3s ease;
}

.booking-step.completed .step-line {
  background: linear-gradient(180deg, #10b981 0%, #e2e8f0 100%);
}

.step-content {
  flex: 1;
  padding-top: 8px;
}

[dir="rtl"] .step-content {
  text-align: right;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.step-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 16px 0;
}

/* Modern Dropdown */
.dropdown-container {
  position: relative;
  margin-bottom: 16px;
}

.modern-dropdown {
  width: 100%;
  padding: 16px 48px 16px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

[dir="rtl"] .modern-dropdown {
  padding: 16px 16px 16px 48px;
  text-align: right;
}

.modern-dropdown:focus {
  outline: none;
  border-color: #af1e23;
  box-shadow:
    0 0 0 3px rgba(175, 30, 35, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.modern-dropdown:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.modern-dropdown option {
  padding: 12px 16px;
  font-size: 0.875rem;
}

.modern-dropdown option:disabled {
  color: #94a3b8;
  background: #f8fafc;
}

.dropdown-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  transition: all 0.3s ease;
}

[dir="rtl"] .dropdown-icon {
  right: auto;
  left: 16px;
}

.dropdown-container:focus-within .dropdown-icon {
  color: #af1e23;
  transform: translateY(-50%) rotate(180deg);
}

/* Loading and No Slots States */
.loading-state,
.no-slots-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-top: 16px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #af1e23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.no-slots-icon {
  color: #94a3b8;
  margin-bottom: 12px;
}

.loading-state p,
.no-slots-state p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Booking Summary */
.booking-summary {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

[dir="rtl"] .booking-summary {
  text-align: right;
}

.booking-summary:hover {
  box-shadow: 0 8px 25px -5px rgba(11, 78, 110, 0.15);
}

.summary-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 16px 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #bae6fd;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.total {
  font-weight: 700;
  font-size: 1.125rem;
  color: #0c4a6e;
  padding-top: 12px;
  border-top: 2px solid #bae6fd;
  border-bottom: none;
}

.summary-label {
  font-size: 0.875rem;
  color: #0369a1;
  font-weight: 500;
}

.summary-value {
  font-size: 0.875rem;
  color: #0c4a6e;
  font-weight: 600;
}

/* Time Slots Section */
.time-slots-section {
  margin-bottom: 24px;
}

.loading-time-slots {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.loading-time-slots .spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #af1e23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.no-time-slots {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

/* Booking Actions */
.booking-actions {
  display: flex;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  pointer-events: auto;
  position: relative;
  z-index: 10;
}

[dir="rtl"] .booking-actions {
  flex-direction: row-reverse;
}

.cancel-btn {
  flex: 1;
  background: #f8fafc;
  color: #64748b;
  border: 2px solid #e2e8f0;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
}

.cancel-btn:active {
  transform: scale(0.98);
  background: #f1f5f9;
}

.book-btn {
  flex: 2;
  background: linear-gradient(135deg, #af1e23 0%, #dc2626 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

.book-btn:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.4);
}

.book-btn:not(:disabled):hover {
  box-shadow: 0 6px 20px rgba(175, 30, 35, 0.4);
}

.book-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.book-btn.loading {
  pointer-events: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Mobile Touch Optimizations */
.service-item {
  -webkit-tap-highlight-color: rgba(175, 30, 35, 0.1);
  touch-action: manipulation;
}

.service-item:active {
  background: #f8fafc;
}

.modern-dropdown {
  -webkit-tap-highlight-color: rgba(175, 30, 35, 0.1);
  touch-action: manipulation;
}

/* Enhanced Mobile Experience */
@media (max-width: 768px) {
  .booking-dialog {
    width: 95%;
    max-height: 85vh;
    margin: 10px;
  }

  .service-info-card {
    padding: 20px;
    margin-bottom: 24px;
  }

  .booking-steps {
    margin-bottom: 24px;
  }

  .booking-step {
    gap: 16px;
    margin-bottom: 24px;
  }

  .step-number {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .step-line {
    height: 50px;
  }

  .booking-actions {
    flex-direction: column;
    gap: 12px;
  }

  .cancel-btn,
  .book-btn {
    flex: none;
    width: 100%;
  }
}

/* Responsive Design */
@media (min-width: 768px) {
  .service-category-details {
    padding: 32px 24px;
  }

  .category-info {
    padding: 32px;
  }

  .category-img,
  .default-image {
    width: 100px;
    height: 100px;
  }

  .category-title {
    font-size: 1.75rem;
  }

  .services-list {
    padding: 32px;
  }
}

@media (max-width: 480px) {
  .booking-dialog-overlay {
    padding: 5px;
  }

  .dialog-content {
    padding: 16px;
  }

  .service-info-card {
    padding: 16px;
  }

  .booking-summary {
    padding: 16px;
  }
}
</style>
