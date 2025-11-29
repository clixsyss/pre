<template>
  <div class="services-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">{{ $t('servicesTitle') }}</h1>
          <p class="hero-subtitle">{{ $t('servicesSubtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-container">
      <div class="tabs-nav">
        <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id">
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Services Tab -->
      <div v-if="activeTab === 'services'" class="services-content">
        <!-- Loading State -->
        <div v-if="serviceCategoriesStore.isLoading || loadingStores" class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ $t('loadingServices') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="serviceCategoriesStore.getError" class="error-container">
          <p>{{ serviceCategoriesStore.getError }}</p>
          <button @click="loadServiceCategories" class="retry-btn">{{ $t('retry') }}</button>
        </div>

        <!-- Empty State - No Services Available -->
        <div v-else-if="!serviceCategoriesStore.isLoading && !loadingStores && !hasAnyServices" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11L12 14L22 4" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>{{ $t('noServicesAvailable') }}</h3>
          <p>{{ $t('noServicesAvailableMessage') }}</p>
        </div>

        <!-- Services Grid -->
        <div v-else class="services-grid">
          <!-- Dynamic Service Categories -->
          <div v-for="category in serviceCategoriesStore.getCategories" :key="category.id" class="service-card"
            @click="navigateToCategory(category)">
            <div class="service-icon">
              <img v-if="category.imageUrl" :src="category.imageUrl" :alt="category.englishTitle"
                class="service-image" />
              <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                class="default-icon">
                <path
                  d="M14.7 6.3C14.7 4.4 13.3 3 11.4 3C9.5 3 8.1 4.4 8.1 6.3C8.1 8.2 9.5 9.6 11.4 9.6C13.3 9.6 14.7 8.2 14.7 6.3Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M20 12C20 16.4 16.4 20 12 20C7.6 20 4 16.4 4 12C4 7.6 7.6 4 12 4C16.4 4 20 7.6 20 12Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="service-content">
              <h3 class="service-name">{{ getCategoryTitle(category) }}</h3>
            </div>
            <div class="service-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- Static Services -->
          <!-- Smart Devices -->
          <div v-if="isSmartHomeConnected" class="service-card" @click="navigateToSmartDevices">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21C9 21.5523 9.44772 22 10 22H14C14.5523 22 15 21.5523 15 21V20H9V21Z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 2V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="service-content">
              <h3 class="service-name">{{ $t('smartDevicesTitle') }}</h3>
              <p class="service-description">{{ $t('smartDevicesDesc') }}</p>
            </div>
            <div class="service-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- Court Booking -->
          <div v-if="hasCourts" class="facility-card" @click="navigateToCourtBooking">
            <div class="facility-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="facility-content">
              <h3 class="facility-name">{{ $t('courtBookingTitle') }}</h3>
              <p class="facility-description">{{ $t('courtBookingDesc') }}</p>
            </div>
            <div class="facility-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- Academy Programs -->
          <div v-if="hasAcademyPrograms" class="facility-card" @click="navigateToAcademyPrograms">
            <div class="facility-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M12 11V15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M9 13H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="facility-content">
              <h3 class="facility-name">{{ $t('academyProgramsTitle') }}</h3>
              <p class="facility-description">{{ $t('academyProgramsDesc') }}</p>
            </div>
            <div class="facility-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- Stores & Shopping -->
          <div v-if="hasStores" class="facility-card" @click="navigateToStores">
            <div class="facility-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="facility-content">
              <h3 class="facility-name">{{ $t('shoppingTitle') }}</h3>
              <p class="facility-description">{{ $t('shoppingDesc') }}</p>
            </div>
            <div class="facility-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <!-- Calendar  -->
          <!-- <div class="service-card" @click="navigateToCalendar">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M8 14H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 18H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="service-content">
          <h3 class="service-name">Calendar</h3>
          <p class="service-description">View your schedule and upcoming events</p>
        </div>
        <div class="service-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
       </div> -->

          <!-- My Bookings -->
          <!-- <div class="service-card" @click="navigateToMyBookings">
            <div class="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" stroke-width="2" />
              </svg>
            </div>
            <div class="service-content">
              <h3 class="service-name">My Bookings</h3>
              <p class="service-description">Manage your reservations and appointments</p>
            </div>
            <div class="service-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
          </div> -->

          <!-- Equipment Rental -->
          <!-- <div class="service-card coming-soon">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Equipment Rental</span>
        <span class="coming-soon-badge">Coming Soon</span>
      </div> -->

          <!-- Event Planning -->
          <!-- <div class="service-card coming-soon">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M8 14H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 18H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Event Planning</span>
        <span class="coming-soon-badge">Coming Soon</span>
      </div> -->

          <!-- Membership Plans -->
          <!-- <div class="service-card coming-soon">
        <div class="service-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 13H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="service-name">Membership Plans</span>
        <span class="coming-soon-badge">Coming Soon</span>
      </div> -->
        </div>
      </div>

      <!-- Open Bookings Tab -->
      <div v-else-if="activeTab === 'open'" class="bookings-content">
        <div v-if="loadingBookings" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading open bookings...</p>
        </div>
        <div v-else-if="openBookings.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ccc" stroke-width="2" />
              <path d="M12 8V12L15 15" stroke="#ccc" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <h3>{{ $t('noOpenBookings') }}</h3>
          <p>{{ $t('noOpenBookingsMessage') }}</p>
        </div>
        <div v-else class="bookings-list">
          <div v-for="booking in openBookings" :key="booking.id" class="booking-card"
            @click="openBookingModal(booking)">
            <div class="booking-header">
              <h3 class="booking-title">{{ booking.serviceName }}</h3>
              <div class="header-right">
                <span :class="['booking-status', booking.status]">{{ formatStatus(booking.status) }}</span>
                <div v-if="getUnreadCount(booking) > 0" class="unread-badge">
                  {{ getUnreadCount(booking) }}
                </div>
              </div>
            </div>
            <div class="booking-details">
              <p class="booking-category">{{ booking.categoryName }}</p>
              <p class="booking-date">{{ formatDate(booking.selectedDate) }}</p>
              <p class="booking-price">EGP {{ booking.servicePrice }}</p>
            </div>
            <div class="booking-footer">
              <span class="last-message">
                {{ getLastMessagePreview(booking) }}
              </span>
              <span class="booking-time">{{ formatTime(booking.lastMessageAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Closed Bookings Tab -->
      <div v-else-if="activeTab === 'closed'" class="bookings-content">
        <div v-if="loadingBookings" class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ $t('loadingClosedBookings') }}</p>
        </div>
        <div v-else-if="closedBookings.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#ccc" stroke-width="2" />
              <path d="M9 12L11 14L15 10" stroke="#ccc" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
          <h3>{{ $t('noClosedBookings') }}</h3>
          <p>{{ $t('noClosedBookingsMessage') }}</p>
        </div>
        <div v-else class="bookings-list">
          <div v-for="booking in closedBookings" :key="booking.id" class="booking-card"
            @click="openBookingModal(booking)">
            <div class="booking-header">
              <h3 class="booking-title">{{ booking.serviceName }}</h3>
              <div class="header-right">
                <span :class="['booking-status', booking.status]">{{ formatStatus(booking.status) }}</span>
                <div v-if="getUnreadCount(booking) > 0" class="unread-badge">
                  {{ getUnreadCount(booking) }}
                </div>
              </div>
            </div>
            <div class="booking-details">
              <p class="booking-category">{{ booking.categoryName }}</p>
              <p class="booking-date">{{ formatDate(booking.selectedDate) }}</p>
              <p class="booking-price">EGP {{ booking.servicePrice }}</p>
            </div>
            <div class="booking-footer">
              <span class="last-message">
                {{ getLastMessagePreview(booking) }}
              </span>
              <span class="booking-time">{{ formatTime(booking.lastMessageAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Booking Modal -->
    <ServiceBookingModal :isOpen="showBookingModal" :booking="selectedBooking" @close="closeBookingModal"
      @openChat="openBookingChat" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import optimizedAuthService from 'src/services/optimizedAuthService';
import { useServiceCategoriesStore } from '../../stores/serviceCategoriesStore';
import { useProjectStore } from '../../stores/projectStore';
import { useSportsStore } from '../../stores/sportsStore';
import { useAcademiesStore } from '../../stores/academyStore';
import { useSmartMirrorStore } from '../../stores/smartMirrorStore';
import serviceBookingService from '../../services/serviceBookingService';
import firestoreService from '../../services/firestoreService';
import ServiceBookingModal from '../../components/ServiceBookingModal.vue';

// Component name for ESLint
defineOptions({
  name: 'ServicesPage'
});

const router = useRouter();
const { t, locale } = useI18n();
const serviceCategoriesStore = useServiceCategoriesStore();
const projectStore = useProjectStore();
const sportsStore = useSportsStore();
const academiesStore = useAcademiesStore();
const smartMirrorStore = useSmartMirrorStore();

// Helper function to get localized category title
const getCategoryTitle = (category) => {
  if (!category) return '';
  
  const isArabic = locale.value === 'ar-SA' || locale.value.startsWith('ar');
  
  // If Arabic mode
  if (isArabic) {
    // Check if arabicTitle exists and is valid
    if (category.arabicTitle) {
      // Clean up corrupted text like "Home maintenance arabic" or "صيانة المنزل arabic"
      const cleaned = category.arabicTitle
        .replace(/\s*arabic\s*$/i, '')
        .replace(/\s*ararbic\s*$/i, '')
        .trim();
      
      // Only use if it's actually Arabic text (contains Arabic characters)
      if (cleaned && /[\u0600-\u06FF]/.test(cleaned)) {
        return cleaned;
      }
    }
    
    // Translate common service names to Arabic if no valid arabicTitle
    const englishTitle = (category.englishTitle || category.name || '').toLowerCase();
    const translations = {
      'home maintenance': 'صيانة المنزل',
      'plumbing': 'السباكة',
      'electrical': 'الكهرباء',
      'cleaning': 'التنظيف',
      'painting': 'الدهان',
      'carpentry': 'النجارة',
      'air conditioning': 'التكييف',
      'pest control': 'مكافحة الحشرات',
      'landscaping': 'تنسيق الحدائق',
      'handyman': 'خدمات عامة'
    };
    
    if (translations[englishTitle]) {
      return translations[englishTitle];
    }
  }
  
  // For English mode or if no translation available, use English title
  if (category.englishTitle) {
    return category.englishTitle;
  }
  
  // Fallback to any name field
  return category.name || '';
};

// Reactive state
const activeTab = ref('services');
const loadingBookings = ref(false);
const openBookings = ref([]);
const closedBookings = ref([]);
const showBookingModal = ref(false);
const selectedBooking = ref(null);
const stores = ref([]);
const loadingStores = ref(false);

// Computed properties to check if services exist
const hasCourts = computed(() => {
  // Check if there are any courts in the sports store
  const courtsCount = Object.values(sportsStore.courtsBySport).reduce((total, courts) => total + courts.length, 0);
  return courtsCount > 0;
});

// Check if there are any academy programs (academies with at least one program)
const hasAcademyPrograms = computed(() => {
  if (!academiesStore.academyOptions || academiesStore.academyOptions.length === 0) {
    return false;
  }
  
  // Check if any academy has at least one program
  const hasPrograms = academiesStore.academyOptions.some(academy => 
    academy.programs && Array.isArray(academy.programs) && academy.programs.length > 0
  );
  
  console.log('Services: Academy programs check:', {
    academiesCount: academiesStore.academyOptions.length,
    hasPrograms,
    academiesWithPrograms: academiesStore.academyOptions.filter(a => a.programs && a.programs.length > 0).length
  });
  
  return hasPrograms;
});

const hasStores = computed(() => {
  return stores.value.length > 0;
});

const isSmartHomeConnected = computed(() => {
  if (!projectStore.selectedProject?.id) return false;
  return smartMirrorStore.isProjectConnected(projectStore.selectedProject.id);
});

// Check if there are any services at all
const hasAnyServices = computed(() => {
  const hasDynamicCategories = serviceCategoriesStore.getCategories.length > 0;
  const hasAny = hasDynamicCategories || hasCourts.value || hasAcademyPrograms.value || hasStores.value || isSmartHomeConnected.value;
  
  // Debug logging
  console.log('Services availability check:', {
    dynamicCategories: serviceCategoriesStore.getCategories.length,
    hasCourts: hasCourts.value,
    hasAcademyPrograms: hasAcademyPrograms.value,
    hasStores: hasStores.value,
    isSmartHomeConnected: isSmartHomeConnected.value,
    hasAnyServices: hasAny
  });
  
  return hasAny;
});

// Computed properties
const tabs = computed(() => [
  {
    id: 'services',
    label: t('services'),
    icon: ''
  },
  {
    id: 'open',
    label: t('open'),
    icon: '',
    count: openBookings.value.length
  },
  {
    id: 'closed',
    label: t('closed'),
    icon: '',
    count: closedBookings.value.length
  }
]);

// Load service categories and bookings on component mount
onMounted(async () => {
  if (projectStore.selectedProject?.id) {
    await loadServiceCategories();
    await loadBookings();
    await loadServiceData();
  }
});

// Watch for project changes
watch(() => projectStore.selectedProject?.id, async (newProjectId) => {
  if (newProjectId) {
    await loadServiceCategories();
    await loadBookings();
    await loadServiceData();
  }
});

const loadServiceCategories = async () => {
  if (projectStore.selectedProject?.id) {
    await serviceCategoriesStore.fetchCategories(projectStore.selectedProject.id);
  }
};

const loadServiceData = async () => {
  if (!projectStore.selectedProject?.id) return;
  
  try {
    // Load courts data
    await sportsStore.fetchSports(projectStore.selectedProject.id);
    
    // Load academies data
    await academiesStore.fetchAcademies(projectStore.selectedProject.id);
    
    // Load stores data
    await loadStores();
  } catch (error) {
    console.error('Error loading service data:', error);
  }
};

const loadStores = async () => {
  if (!projectStore.selectedProject?.id) return;
  
  try {
    loadingStores.value = true;
    
    // Use DynamoDB service first
    try {
      const { getStoresByProject } = await import('src/services/dynamoDBStoresService')
      const storesData = await getStoresByProject(projectStore.selectedProject.id, { limit: 100 })
      console.log('✅ Services: Retrieved stores from DynamoDB:', storesData.length)
      stores.value = storesData
    } catch (dynamoError) {
      console.warn('⚠️ DynamoDB fetch failed, falling back to Firestore:', dynamoError)
      
      // Fallback to Firestore
      const collectionPath = `projects/${projectStore.selectedProject.id}/stores`;
      const queryResult = await firestoreService.getDocs(collectionPath, { timeoutMs: 6000 });
      stores.value = queryResult.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  } catch (error) {
    console.error('Error loading stores:', error);
    stores.value = [];
  } finally {
    loadingStores.value = false;
  }
};

const navigateToCategory = (category) => {
  // Navigate to category details page
  router.push(`/service-category/${category.id}`);
};


const navigateToCourtBooking = () => {
  router.push('/court-booking');
};

const navigateToAcademyPrograms = () => {
  router.push('/academy-programs');
};

const navigateToStores = () => {
  router.push('/stores-shopping');
};


// const navigateToMyBookings = () => {
//   router.push('/my-bookings');
// };

// const navigateToCalendar = () => {
//   router.push('/calendar');
// };

const navigateToSmartDevices = () => {
  router.push('/smart-devices');
};

// Load bookings function
const loadBookings = async () => {
  if (!projectStore.selectedProject?.id) return;

  try {
    loadingBookings.value = true;

    // Get current user
    const user = await optimizedAuthService.getCurrentUser();

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Load open bookings (pending and in-progress)
    // Load closed bookings (completed and cancelled)
    const [openResults, processingResults, completedResults, cancelledResults] = await Promise.all([
      serviceBookingService.getServiceBookingsByStatus(projectStore.selectedProject.id, user.uid, 'open'),
      serviceBookingService.getServiceBookingsByStatus(projectStore.selectedProject.id, user.uid, 'processing'),
      serviceBookingService.getServiceBookingsByStatus(projectStore.selectedProject.id, user.uid, 'completed'),
      serviceBookingService.getServiceBookingsByStatus(projectStore.selectedProject.id, user.uid, 'cancelled')
    ]);

    // Open tab: show pending (open) and in-progress (processing) bookings
    openBookings.value = [...openResults, ...processingResults].sort((a, b) => {
      const aTime = a.lastMessageAt?.seconds || a.lastMessageAt || 0;
      const bTime = b.lastMessageAt?.seconds || b.lastMessageAt || 0;
      return bTime - aTime;
    });
    
    // Closed tab: show completed and cancelled bookings
    closedBookings.value = [...completedResults, ...cancelledResults].sort((a, b) => {
      const aTime = a.lastMessageAt?.seconds || a.lastMessageAt || 0;
      const bTime = b.lastMessageAt?.seconds || b.lastMessageAt || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
  } finally {
    loadingBookings.value = false;
  }
};

// Open booking modal
const openBookingModal = (booking) => {
  console.log('🔍 Services: openBookingModal called', {
    bookingId: booking?.id,
    booking: booking
  });

  selectedBooking.value = booking;
  showBookingModal.value = true;

  console.log('🔍 Services: Modal state updated', {
    showBookingModal: showBookingModal.value,
    selectedBooking: selectedBooking.value
  });
};

// Close booking modal
const closeBookingModal = () => {
  showBookingModal.value = false;
  selectedBooking.value = null;
};

// Open booking chat (called from modal)
const openBookingChat = (booking) => {
  router.push(`/service-booking-chat/${booking.id}`);
};

// Format status for display
const formatStatus = (status) => {
  const statusMap = {
    'open': 'Pending',
    'processing': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'closed': 'Closed'
  };
  return statusMap[status] || status;
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';

  // Handle both ISO date strings and formatted date strings
  let date;
  if (dateString.includes('-')) {
    // ISO format (2025-01-15)
    date = new Date(dateString + 'T00:00:00');
  } else {
    // Already formatted or other format
    date = new Date(dateString);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return dateString; // Return original if can't parse
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return '';

  let date;
  if (timestamp.seconds) {
    // Firestore timestamp
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get unread message count
const getUnreadCount = (booking) => {
  if (!booking.messages || booking.messages.length === 0) {
    return 0;
  }

  // Get the last message ID that the user has read
  const lastReadId = localStorage.getItem(`lastReadMessage_${booking.id}`);

  if (!lastReadId) {
    // If no last read message, count all admin/system messages
    return booking.messages.filter(msg =>
      msg.senderType === 'admin' || msg.senderType === 'system'
    ).length;
  }

  // Count messages after the last read message
  const lastReadIndex = booking.messages.findIndex(msg => msg.id === lastReadId);
  if (lastReadIndex === -1) {
    return booking.messages.filter(msg =>
      msg.senderType === 'admin' || msg.senderType === 'system'
    ).length;
  }

  const unreadMessages = booking.messages.slice(lastReadIndex + 1);
  return unreadMessages.filter(msg =>
    msg.senderType === 'admin' || msg.senderType === 'system'
  ).length;
};

// Get last message preview
const getLastMessagePreview = (booking) => {
  if (!booking.messages || booking.messages.length === 0) {
    return 'No messages yet';
  }

  const lastMessage = booking.messages[booking.messages.length - 1];

  if (lastMessage.messageType === 'status_update') {
    return 'Status updated';
  } else if (lastMessage.messageType === 'details_update') {
    return 'Details updated';
  } else {
    const preview = lastMessage.text || 'New message';
    return preview.length > 40 ? preview.substring(0, 40) + '...' : preview;
  }
};
</script>

<style scoped>
.services-page {
  background: #fafafa;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: #F6F6F6;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(175, 30, 35, 0.2);
}

.hero-content {
  width: 100%;
}

.hero-text {
  flex-direction: column;
  gap: 4px;
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 4px;
}

.services-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* RTL Support */
[dir="rtl"] .services-grid {
  direction: rtl;
}

.service-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

[dir="rtl"] .service-card {
  text-align: right;
}

/* Mobile app - hover effects disabled */
/* .service-card:hover {
  transform: translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.12);
} */

.service-card.coming-soon {
  opacity: 0.6;
  cursor: default;
}

.service-icon {
  color: #AF1E23;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-content {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.service-description {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.service-arrow {
  color: #ccc;
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
/* .service-card:hover .service-arrow {
  color: #AF1E23;
  transform: translateX(4px);
} */

.coming-soon-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #f0f0f0;
  color: #999;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 400;
}

/* Tablet and Desktop */
@media (min-width: 768px) {

  .hero-section {
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .services-grid {
    max-width: 800px;
    gap: 20px;
  }

  .service-card {
    padding: 32px;
  }

  .service-name {
    font-size: 1.375rem;
  }

  .service-description {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 2.25rem;
  }

  .services-grid {
    max-width: 1000px;
    gap: 24px;
  }

  .service-card {
    padding: 40px;
  }

  .service-name {
    font-size: 1.5rem;
  }

  .service-description {
    font-size: 1.125rem;
  }
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
  border-top: 4px solid #AF1E23;
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
  background: #AF1E23;
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

/* Service Image Styles */
.service-image {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 8px;
}

.default-icon {
  color: #6b7280;
}

/* Tabs Styles */
.tabs-container {
  margin-bottom: 20px;
}

.tabs-nav {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

[dir="rtl"] .tabs-nav {
  direction: rtl;
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

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.tab-btn:not(.active) .tab-count {
  background: #e5e7eb;
  color: #666;
}

/* Tab Content */
.tab-content {
  min-height: 300px;
}

.services-content,
.bookings-content {
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

/* Bookings List */
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

[dir="rtl"] .bookings-list {
  direction: rtl;
}

.booking-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

[dir="rtl"] .booking-card {
  text-align: right;
}

/* Mobile app - hover effects disabled */
/* .booking-card:hover {
  transform: translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.12);
} */

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.booking-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
}

.booking-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.booking-status.open {
  background: #fef3c7;
  color: #92400e;
}

.booking-status.processing {
  background: #dbeafe;
  color: #1e40af;
}

.booking-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.booking-status.cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.booking-status.closed {
  background: #e5e7eb;
  color: #374151;
}

.booking-details {
  margin-bottom: 16px;
}

.booking-details p {
  margin: 4px 0;
  font-size: 0.875rem;
}

.booking-category {
  color: #666;
}

.booking-date {
  color: #AF1E23;
  font-weight: 500;
}

.booking-price {
  color: #333;
  font-weight: 600;
  font-size: 1rem;
}

.booking-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.last-message {
  color: #666;
  font-size: 0.875rem;
  flex: 1;
  margin-right: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[dir="rtl"] .last-message {
  margin-right: 0;
  margin-left: 12px;
}

.booking-time {
  color: #999;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* Unread Message Badge */
.unread-badge {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}


.facilities-page {
  background: #fafafa;
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: #F6F6F6;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(175, 30, 35, 0.2);
}

.hero-content {
  width: 100%;
}

.hero-text {
  flex-direction: column;
  gap: 4px;
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 4px;
}

.facilities-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

[dir="rtl"] .facilities-grid {
  direction: rtl;
}

.facility-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

[dir="rtl"] .facility-card {
  text-align: right;
}

/* Mobile app - hover effects disabled */
/* .facility-card:hover {
  transform: translateY(-2px);
  border-color: #AF1E23;
  box-shadow: 0 8px 24px rgba(175, 30, 35, 0.12);
} */

.facility-icon {
  color: #AF1E23;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.facility-content {
  flex: 1;
  min-width: 0;
}

.facility-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.facility-description {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.facility-arrow {
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

[dir="rtl"] .facility-arrow {
  transform: scaleX(-1);
}

/* Mobile app - hover effects disabled */
/* .facility-card:hover .facility-arrow {
  color: #AF1E23;
  transform: translateX(4px);
} */

/* Tablet and Desktop */
@media (min-width: 768px) {

  .hero-section {
    margin-bottom: 24px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .facilities-grid {
    max-width: 800px;
    gap: 20px;
  }

  .facility-card {
    padding: 32px;
  }

  .facility-name {
    font-size: 1.375rem;
  }

  .facility-description {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {

  .hero-title {
    font-size: 2.25rem;
  }

  .facilities-grid {
    max-width: 1000px;
    gap: 24px;
  }

  .facility-card {
    padding: 40px;
  }

  .facility-name {
    font-size: 1.5rem;
  }

  .facility-description {
    font-size: 1.125rem;
  }
}
</style>
