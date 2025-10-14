<template>
  <div class="academy-details-page">

    <PageHeader :title="$t('academyDetails')" :subtitle="$t('sportsAcademy')" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingAcademyDetails') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>{{ $t('somethingWentWrong') }}</h3>
      <p>{{ error }}</p>
      <button @click="fetchAcademyDetails" class="retry-button">{{ $t('tryAgain') }}</button>
    </div>

    <!-- Content -->
    <div v-else-if="academy" class="content">
      <!-- Academy Overview - SIMPLIFIED -->
      <div class="academy-overview">
        <!-- Academy Hero -->
        <div class="academy-hero">
          <div v-if="academy.imageUrl" class="academy-image-modern">
            <img :src="academy.imageUrl" :alt="academy.name" />
          </div>
          <div class="academy-hero-content">
            <div class="hero-badge">{{ academy.type || 'Sports Academy' }}</div>
            <h2>{{ academy.name }}</h2>
            <div v-if="academy.rating" class="rating-compact">
              ⭐ {{ academy.rating }}/5
            </div>
          </div>
        </div>

        <!-- Quick Info Pills -->
        <div class="academy-pills">
          <div v-if="academy.location" class="info-pill-modern location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ academy.location }}
          </div>
          <div v-if="academy.capacity" class="info-pill-modern">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ academy.capacity }} students
          </div>
          <div v-if="academy.operatingHours" class="info-pill-modern">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ academy.operatingHours }}
          </div>
          <div v-if="academy.establishedYear" class="info-pill-modern">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Est. {{ academy.establishedYear }}
          </div>
        </div>

        <!-- Description & Facilities Combined -->
        <div v-if="academy.description" class="academy-about">
          <p>{{ academy.description }}</p>
        </div>

        <div v-if="academy.facilities && academy.facilities.length > 0" class="facilities-modern">
          <div class="facilities-header">✨ Facilities</div>
          <div class="facilities-chips">
            <span v-for="facility in academy.facilities" :key="facility" class="facility-chip">
              {{ facility }}
            </span>
          </div>
        </div>
      </div>

      <!-- Programs Section -->
      <div class="programs-section">
        <div class="section-header">
          <h2>Available Programs</h2>
          <p>{{ academy.programs?.length || 0 }} program{{ academy.programs?.length !== 1 ? 's' : '' }} available</p>
        </div>

        <!-- No Programs State -->
        <div v-if="!academy.programs || academy.programs.length === 0" class="no-programs">
          <div class="no-programs-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>No Programs Available</h3>
          <p>This academy doesn't have any programs available at the moment.</p>
        </div>

        <!-- Programs List - SIMPLIFIED -->
        <div v-else class="programs-list">
          <div 
            v-for="program in academy.programs" 
            :key="program.id || program.name" 
            class="program-card-modern"
          >
            <div class="program-card-header">
              <div>
                <h3>{{ program.name }}</h3>
                <span class="category-badge">{{ program.category || 'Sports' }}</span>
              </div>
              <div class="price-tag">
                <div class="price">{{ program.price }} EGP</div>
                <div class="price-period">{{ getPricingTypeLabel(program.pricingType) }}</div>
              </div>
            </div>

            <!-- Quick Details Pills -->
            <div class="program-pills">
              <span v-if="program.ageGroup" class="program-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M6 21V19C6 17.3431 7.34315 16 9 16H15C16.6569 16 18 17.3431 18 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ program.ageGroup }}
              </span>
              <span v-if="program.duration" class="program-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ program.duration }} {{ getDurationUnit(program.pricingType) }}
              </span>
              <span v-if="program.maxCapacity" class="program-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                {{ program.maxCapacity }} spots
              </span>
            </div>

            <!-- One-liner schedule if exists -->
            <div v-if="program.timeSlotsByDay && Object.keys(program.timeSlotsByDay).length > 0" class="schedule-oneliner">
              📅 {{ Object.keys(program.timeSlotsByDay).length }} day{{ Object.keys(program.timeSlotsByDay).length !== 1 ? 's' : '' }}/week
            </div>

            <!-- Register Button -->
            <button 
              @click.stop="registerForProgram(program)"
              class="register-btn-modern"
            >
              Register Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useProjectStore } from 'src/stores/projectStore';
import PageHeader from 'src/components/PageHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'AcademyDetailsPage'
});

const router = useRouter();
const route = useRoute();
const academiesStore = useAcademiesStore();
const projectStore = useProjectStore();

// Reactive state
const loading = ref(false);
const error = ref(null);
const academy = ref(null);

// Computed properties
const currentProject = computed(() => projectStore.selectedProject);
const academyId = computed(() => route.params.id);

// Methods
const fetchAcademyDetails = async () => {
  if (!currentProject.value?.id || !academyId.value) {
    error.value = 'Missing project or academy information';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Fetch academies if not already loaded
    if (!academiesStore.academyOptions || academiesStore.academyOptions.length === 0) {
      await academiesStore.fetchAcademies(currentProject.value.id);
    }

    // Find the specific academy
    const foundAcademy = academiesStore.academyOptions.find(a => a.id === academyId.value);
    if (foundAcademy) {
      academy.value = foundAcademy;
    } else {
      error.value = 'Academy not found';
    }
  } catch (err) {
    console.error('Error fetching academy details:', err);
    error.value = 'Failed to load academy details. Please try again.';
  } finally {
    loading.value = false;
  }
};

const registerForProgram = (program) => {
  // Navigate to program registration page
  router.push(`/program-registration/${academyId.value}/${program.id || program.name}`);
};

const getPricingTypeLabel = (pricingType) => {
  const labels = {
    'per-session': '/session',
    'per-week': '/week',
    'per-month': '/month',
    'per-term': '/term',
    'one-time': 'one-time'
  };
  return labels[pricingType] || '/month';
};

const getDurationUnit = (pricingType) => {
  const units = {
    'per-week': 'weeks',
    'per-month': 'months',
    'per-term': 'terms'
  };
  return units[pricingType] || 'months';
};

// Lifecycle
onMounted(() => {
  if (currentProject.value?.id && academyId.value) {
    fetchAcademyDetails();
  } else {
    error.value = 'Missing project or academy information. Please select a project first.';
  }
});
</script>

<style scoped>
.academy-details-page {
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .back-button:hover {
  background: #e9ecef;
} */

.header-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.header-text p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
  text-transform: capitalize;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  margin-bottom: 16px;
}

.error-container h3 {
  color: #333;
  margin: 0 0 8px 0;
}

.error-container p {
  color: #666;
  margin: 0 0 20px 0;
}

.retry-button {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .retry-button:hover {
  background: #AF1E23;
} */

.content {
  padding: 20px;
}

/* Modern Academy Overview */
.academy-overview {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.academy-hero {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.academy-image-modern {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.academy-image-modern img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.academy-hero-content {
  flex: 1;
}

.academy-hero-content .hero-badge {
  display: inline-block;
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.academy-hero-content h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.rating-compact {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f59e0b;
}

.academy-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.info-pill-modern {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.info-pill-modern svg {
  flex-shrink: 0;
  stroke: #64748b;
}

.info-pill-modern.location {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  color: #78350f;
  font-weight: 600;
}

.info-pill-modern.location svg {
  stroke: #78350f;
}

.academy-about {
  background: #fafafa;
  border-left: 3px solid #AF1E23;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 16px;
}

.academy-about p {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #475569;
  margin: 0;
}

.facilities-modern {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 14px;
}

.facilities-header {
  font-size: 0.8rem;
  font-weight: 700;
  color: #166534;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.facilities-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.facility-chip {
  background: white;
  color: #166534;
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 500;
  border: 1px solid #86efac;
}

.programs-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.section-header p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.no-programs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.no-programs-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-programs h3 {
  color: #333;
  margin: 0 0 8px 0;
}

.no-programs p {
  color: #666;
  margin: 0;
}

/* Modern Program Cards */
.programs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.program-card-modern {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Mobile app - hover effects disabled */
/* .program-card-modern:hover {
  border-color: #AF1E23;
  box-shadow: 0 6px 20px rgba(175, 30, 35, 0.15);
  transform: translateY(-2px);
} */

.program-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.program-card-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.category-badge {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.price-tag {
  text-align: right;
  flex-shrink: 0;
}

.price-tag .price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #AF1E23;
  line-height: 1.2;
}

.price-tag .price-period {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.program-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.program-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.program-pill svg {
  flex-shrink: 0;
  stroke: #64748b;
}

.schedule-oneliner {
  font-size: 0.85rem;
  color: #166534;
  background: #f0fdf4;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
}

.register-btn-modern {
  width: 100%;
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

/* Mobile app - hover effects disabled */
/* .register-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.4);
} */

.register-btn-modern svg {
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .content {
    padding: 16px;
  }
  
  .academy-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .academy-image-modern {
    width: 100%;
    height: 160px;
  }
  
  .academy-pills {
    grid-template-columns: 1fr;
  }
  
  .programs-list {
    grid-template-columns: 1fr;
  }
  
  .program-card-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .price-tag {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .academy-overview,
  .programs-section {
    padding: 16px;
  }
  
  .program-card-modern {
    padding: 16px;
  }
}
</style>
