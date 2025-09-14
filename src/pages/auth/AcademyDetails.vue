<template>
  <div class="academy-details-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-text">
          <h1>{{ academy?.name || 'Academy Details' }}</h1>
          <p>{{ academy?.type || 'Sports Academy' }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading academy details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button @click="fetchAcademyDetails" class="retry-button">Try Again</button>
    </div>

    <!-- Content -->
    <div v-else-if="academy" class="content">
      <!-- Academy Overview -->
      <div class="academy-overview">
        <div class="overview-header">
          <div class="academy-info">
            <h2 class="academy-name">{{ academy.name }}</h2>
            <p class="academy-type">{{ academy.type || 'Sports Academy' }}</p>
            <div class="academy-rating" v-if="academy.rating">
              <div class="stars">
                <span 
                  v-for="i in 5" 
                  :key="i" 
                  :class="['star', i <= academy.rating ? 'filled' : 'empty']"
                >
                  ★
                </span>
              </div>
              <span class="rating-text">{{ academy.rating }}/5</span>
            </div>
          </div>
        </div>

        <div class="academy-details-grid">
          <div class="detail-item" v-if="academy.location">
            <div class="detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17L12 23L3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="#666" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="#666" stroke-width="2"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Location</span>
              <span class="detail-value">{{ academy.location }}</span>
            </div>
          </div>

          <div class="detail-item" v-if="academy.establishedYear">
            <div class="detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="#666" stroke-width="2"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Established</span>
              <span class="detail-value">{{ academy.establishedYear }}</span>
            </div>
          </div>

          <div class="detail-item" v-if="academy.capacity">
            <div class="detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#666" stroke-width="2"/>
                <circle cx="9" cy="7" r="4" stroke="#666" stroke-width="2"/>
                <path d="M23 21V19C23 17.9391 22.5786 16.9217 21.8284 16.1716C21.0783 15.4214 20.0609 15 19 15H16" stroke="#666" stroke-width="2"/>
                <path d="M16 11C18.2091 11 20 9.20914 20 7C20 4.79086 18.2091 3 16 3C13.7909 3 12 4.79086 12 7C12 9.20914 13.7909 11 16 11Z" stroke="#666" stroke-width="2"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Capacity</span>
              <span class="detail-value">{{ academy.capacity }} students</span>
            </div>
          </div>

          <div class="detail-item" v-if="academy.operatingHours">
            <div class="detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#666" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="#666" stroke-width="2"/>
              </svg>
            </div>
            <div class="detail-content">
              <span class="detail-label">Operating Hours</span>
              <span class="detail-value">{{ academy.operatingHours }}</span>
            </div>
          </div>
        </div>

        <div class="academy-description" v-if="academy.description">
          <h3>About</h3>
          <p>{{ academy.description }}</p>
        </div>

        <div class="academy-facilities" v-if="academy.facilities && academy.facilities.length > 0">
          <h3>Facilities</h3>
          <div class="facilities-tags">
            <span 
              v-for="facility in academy.facilities" 
              :key="facility" 
              class="facility-tag"
            >
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

        <!-- Programs List -->
        <div v-else class="programs-list">
          <div 
            v-for="program in academy.programs" 
            :key="program.id || program.name" 
            class="program-card"
            @click="viewProgram(program)"
          >
            <div class="program-header">
              <div class="program-info">
                <h3 class="program-name">{{ program.name }}</h3>
                <span class="program-category">{{ program.category || 'Sports' }}</span>
              </div>
              <div class="program-price" v-if="program.price">
                <span class="price-amount">${{ program.price }}</span>
                <span class="price-period">{{ getPricingTypeLabel(program.pricingType) }}</span>
              </div>
            </div>

            <div class="program-details">
              <div class="detail-row">
                <div class="detail-item" v-if="program.ageGroup">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="#666" stroke-width="2"/>
                    <circle cx="12" cy="7" r="4" stroke="#666" stroke-width="2"/>
                  </svg>
                  <span>{{ program.ageGroup }}</span>
                </div>
                
                <div class="detail-item" v-if="program.duration && (program.pricingType === 'per-month' || program.pricingType === 'per-week' || program.pricingType === 'per-term')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#666" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="#666" stroke-width="2"/>
                  </svg>
                  <span>{{ program.duration }} {{ getDurationUnit(program.pricingType) }}</span>
                </div>

                <div class="detail-item" v-if="program.maxCapacity">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#666" stroke-width="2"/>
                    <circle cx="9" cy="7" r="4" stroke="#666" stroke-width="2"/>
                  </svg>
                  <span>{{ program.maxCapacity }} students</span>
                </div>
              </div>

              <div class="program-description" v-if="program.description">
                <p>{{ program.description }}</p>
              </div>

              <div class="program-schedule" v-if="program.timeSlotsByDay && Object.keys(program.timeSlotsByDay).length > 0">
                <h4>Schedule</h4>
                <div class="schedule-grid">
                  <div 
                    v-for="[day, slots] in Object.entries(program.timeSlotsByDay)" 
                    :key="day" 
                    class="day-schedule"
                  >
                    <span class="day-name">{{ day }}</span>
                    <div class="time-slots">
                      <span 
                        v-for="slot in slots" 
                        :key="`${day}-${slot.startTime}`" 
                        class="time-slot"
                      >
                        {{ slot.startTime }} - {{ slot.endTime }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="program-coaches" v-if="program.coaches && program.coaches.length > 0">
                <h4>Coaches</h4>
                <div class="coaches-tags">
                  <span 
                    v-for="coach in program.coaches" 
                    :key="coach.name || coach" 
                    class="coach-tag"
                  >
                    {{ typeof coach === 'object' ? coach.name : coach }}
                  </span>
                </div>
              </div>
            </div>

            <div class="program-actions">
              <button 
                @click.stop="registerForProgram(program)"
                class="register-button"
              >
                Register Now
              </button>
            </div>
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
const goBack = () => {
  router.go(-1);
};

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

const viewProgram = (program) => {
  // Navigate to program details page
  router.push(`/program-details/${academyId.value}/${program.id || program.name}`);
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

.back-button:hover {
  background: #e9ecef;
}

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

.retry-button:hover {
  background: #AF1E23;
}

.content {
  padding: 20px;
}

.academy-overview {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.overview-header {
  margin-bottom: 24px;
}

.academy-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.academy-type {
  color: #666;
  font-size: 1rem;
  margin: 0 0 16px 0;
  text-transform: capitalize;
}

.academy-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 16px;
}

.star.filled {
  color: #ffd700;
}

.star.empty {
  color: #e1e5e9;
}

.rating-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.academy-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.academy-description,
.academy-facilities {
  margin-bottom: 24px;
}

.academy-description h3,
.academy-facilities h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.academy-description p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.facilities-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.facility-tag {
  background: #f8f9fa;
  color: #666;
  font-size: 0.8rem;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 500;
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

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.program-card {
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.program-card:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.program-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.program-category {
  background: #f8f9fa;
  color: #666;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.program-price {
  text-align: right;
}

.price-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #AF1E23;
}

.price-period {
  font-size: 0.9rem;
  color: #666;
}

.program-details {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

.program-description {
  margin-bottom: 16px;
}

.program-description p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.program-schedule,
.program-coaches {
  margin-bottom: 16px;
}

.program-schedule h4,
.program-coaches h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.schedule-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-schedule {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-name {
  font-weight: 600;
  color: #333;
  min-width: 80px;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-slot {
  background: #f8f9fa;
  color: #666;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 8px;
}

.coaches-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.coach-tag {
  background: #e3f2fd;
  color: #1976d2;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.program-actions {
  display: flex;
  justify-content: flex-end;
}

.register-button {
  background: #AF1E23;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.register-button:hover {
  background: #AF1E23;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
  }
  
  .header-text h1 {
    font-size: 1.25rem;
  }
  
  .content {
    padding: 16px;
  }
  
  .academy-overview,
  .programs-section {
    padding: 20px;
  }
  
  .academy-name {
    font-size: 1.5rem;
  }
  
  .academy-details-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .program-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .program-price {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .academy-overview,
  .programs-section {
    padding: 16px;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .day-schedule {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
