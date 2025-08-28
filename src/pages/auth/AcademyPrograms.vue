<template>
  <div class="academy-programs-page">
    <div class="page-header">
      <div class="header-content">
        <button class="back-button" @click="$router.go(-1)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h1>Academy Programs</h1>
      </div>
      <p class="header-subtitle">{{ projectName ? `Join academies in ${projectName}` : 'Choose your academy and program' }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading available programs...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchAcademies" class="retry-btn">Try Again</button>
    </div>

    <!-- No Project Selected -->
    <div v-else-if="!projectId" class="no-project-state">
      <div class="no-project-icon">🏗️</div>
      <h3>No Project Selected</h3>
      <p>Please select a project to view academy programs.</p>
      <button @click="$router.push('/project-selection')" class="select-project-btn">
        Select Project
      </button>
    </div>

    <!-- No Programs Available -->
    <div v-else-if="allPrograms.length === 0" class="no-programs-state">
      <div class="no-programs-icon">📚</div>
      <h3>No Programs Available</h3>
      <p>There are no academy programs available in this project yet.</p>
      <p>Please contact the project administrator to set up academies and programs.</p>
    </div>

    <!-- Programs Content -->
    <div v-else class="programs-content">
      <!-- Programs List -->
      <div class="programs-section">
        <h2 class="section-title">Available Programs</h2>
        <p class="section-subtitle">{{ allPrograms.length }} program{{ allPrograms.length !== 1 ? 's' : '' }} available</p>
        
        <div class="programs-list">
          <div 
            v-for="programData in allPrograms" 
            :key="`${programData.academyId}-${programData.program.id || programData.program.name}`" 
            class="program-item"
            :class="{ 'expanded': expandedProgram === `${programData.academyId}-${programData.program.id || programData.program.name}` }"
          >
            <!-- Program Header (Always Visible) -->
            <div class="program-header" @click="toggleProgram(programData)">
              <div class="program-basic-info">
                <h3 class="program-name">{{ programData.program.name }}</h3>
                <span class="program-sport">{{ programData.program.category || 'Sports' }}</span>
              </div>
              <div class="program-academy">
                <span class="academy-name">{{ programData.academy.name }}</span>
                <div class="expand-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Program Details (Expandable) -->
            <div v-if="expandedProgram === `${programData.academyId}-${programData.program.id || programData.program.name}`" class="program-details">
              <!-- Academy Info -->
              <div class="academy-info">
                <div class="academy-header">
                  <h4>{{ programData.academy.name }}</h4>
                  <span class="academy-type">{{ programData.academy.type || 'Sports Academy' }}</span>
                  <div class="academy-rating" v-if="programData.academy.rating">
                    <div class="stars">
                      <span 
                        v-for="i in 5" 
                        :key="i" 
                        :class="['star', i <= programData.academy.rating ? 'filled' : 'empty']"
                      >
                        ★
                      </span>
                    </div>
                    <span class="rating-text">{{ programData.academy.rating }}/5</span>
                  </div>
                </div>
                <p class="academy-location" v-if="programData.academy.location">{{ programData.academy.location }}</p>
              </div>

              <!-- Program Information -->
              <div class="program-info">
                <div class="info-grid">
                  <div class="info-item" v-if="programData.program.ageGroup">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21" stroke="#666" stroke-width="2"/>
                      <circle cx="12" cy="7" r="4" stroke="#666" stroke-width="2"/>
                    </svg>
                    <span class="info-label">Age Group:</span>
                    <span class="info-value">{{ programData.program.ageGroup }}</span>
                  </div>
                  
                  <div class="info-item" v-if="programData.program.duration">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#666" stroke-width="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="#666" stroke-width="2"/>
                    </svg>
                    <span class="info-label">Duration:</span>
                    <span class="info-value">{{ programData.program.duration }} months</span>
                  </div>

                  <div class="info-item" v-if="programData.program.maxCapacity">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#666" stroke-width="2"/>
                      <circle cx="9" cy="7" r="4" stroke="#666" stroke-width="2"/>
                    </svg>
                    <span class="info-label">Capacity:</span>
                    <span class="info-value">{{ programData.program.maxCapacity }} students</span>
                  </div>
                </div>

                <div class="program-description" v-if="programData.program.description">
                  <h5>Description</h5>
                  <p>{{ programData.program.description }}</p>
                </div>

                <!-- Program Schedule -->
                <div class="program-schedule" v-if="programData.program.timeSlotsByDay && Object.keys(programData.program.timeSlotsByDay).length > 0">
                  <h5>Schedule</h5>
                  <div class="schedule-grid">
                    <div 
                      v-for="[day, slots] in Object.entries(programData.program.timeSlotsByDay)" 
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

                <!-- Coaches -->
                <div class="program-coaches" v-if="programData.program.coaches && programData.program.coaches.length > 0">
                  <h5>Coaches</h5>
                  <div class="coaches-list">
                    <div 
                      v-for="coach in programData.program.coaches" 
                      :key="coach.name || coach" 
                      class="coach-item"
                    >
                      <span class="coach-name">{{ typeof coach === 'object' ? coach.name : coach }}</span>
                      <span v-if="typeof coach === 'object' && coach.specialty" class="coach-specialty">
                        - {{ coach.specialty }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Pricing and Registration -->
                <div class="program-pricing">
                  <div class="pricing-info">
                    <span class="monthly-price" v-if="programData.program.price">${{ programData.program.price }}/month</span>
                    <span class="total-price" v-if="programData.program.price && programData.program.duration">
                      Total: ${{ programData.program.price * programData.program.duration }}
                    </span>
                  </div>
                  <button 
                    @click="registerForProgram(programData)"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAcademiesStore } from 'src/stores/academyStore';
import { useProjectStore } from 'src/stores/projectStore';

// Component name for ESLint
defineOptions({
  name: 'AcademyProgramsPage'
});

const router = useRouter();
const academiesStore = useAcademiesStore();
const projectStore = useProjectStore();

// Reactive state
const loading = ref(false);
const error = ref(null);
const expandedProgram = ref(null);

// Computed properties
const academies = computed(() => academiesStore.academyOptions);
const currentProject = computed(() => projectStore.selectedProject);
const projectId = computed(() => currentProject.value?.id);
const projectName = computed(() => currentProject.value?.name);

// Flatten all programs with their academy info
const allPrograms = computed(() => {
  if (!academies.value || academies.value.length === 0) return [];
  
  const programs = [];
  academies.value.forEach(academy => {
    if (academy.programs && academy.programs.length > 0) {
      academy.programs.forEach(program => {
        programs.push({
          academy,
          academyId: academy.id,
          program
        });
      });
    }
  });
  
  return programs;
});

// Methods
const fetchAcademies = async () => {
  if (!projectId.value) {
    error.value = 'No project selected';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await academiesStore.fetchAcademies(projectId.value);
  } catch (err) {
    console.error('Error fetching academies:', err);
    error.value = 'Failed to load academies. Please try again.';
  } finally {
    loading.value = false;
  }
};

const toggleProgram = (programData) => {
  const programKey = `${programData.academyId}-${programData.program.id || programData.program.name}`;
  
  if (expandedProgram.value === programKey) {
    expandedProgram.value = null; // Collapse
  } else {
    expandedProgram.value = programKey; // Expand this one
  }
};

const registerForProgram = (programData) => {
  // Navigate to program registration page
  router.push(`/academy-registration/${programData.academyId}/${programData.program.id || programData.program.name}`);
};

// Lifecycle
onMounted(() => {
  if (projectId.value) {
    fetchAcademies();
  } else {
    error.value = 'No project selected. Please select a project first.';
  }
});

// Watch for project changes
watch(currentProject, (newProject) => {
  if (newProject?.id) {
    fetchAcademies();
  }
});
</script>

<style scoped>
.academy-programs-page {
  padding: 20px 0;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.back-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: #f5f5f5;
  color: #333;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.header-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.programs-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.programs-section {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 24px 0;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.program-item {
  background: #f8f9fa;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.program-item:hover {
  border-color: #ff6b35;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.program-item.expanded {
  border-color: #ff6b35;
  background: #fff5f2;
}

.program-header {
  padding: 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.program-header:hover {
  background: rgba(255, 107, 53, 0.05);
}

.program-basic-info {
  flex: 1;
}

.program-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.program-sport {
  background: #e3f2fd;
  color: #1976d2;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-block;
}

.program-academy {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.academy-name {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.program-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.program-details {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #e9ecef;
  background: white;
  margin: 0 20px;
  border-radius: 0 0 12px 12px;
}

.academy-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.academy-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.academy-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.academy-type {
  background: #e8f5e8;
  color: #2e7d32;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.academy-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  font-size: 12px;
}

.star.filled {
  color: #ffd700;
}

.star.empty {
  color: #e1e5e9;
}

.rating-text {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}

.academy-location {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.program-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.info-value {
  font-size: 0.9rem;
  color: #333;
  font-weight: 600;
}

.program-description h5,
.program-schedule h5,
.program-coaches h5 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.program-description p {
  color: #666;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
}

.schedule-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-schedule {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.day-name {
  font-weight: 600;
  color: #333;
  min-width: 80px;
  font-size: 0.9rem;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.time-slot {
  background: #e8f5e8;
  color: #2e7d32;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.coaches-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coach-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.coach-name {
  font-weight: 500;
  color: #333;
}

.coach-specialty {
  color: #666;
  font-size: 0.9rem;
}

.program-pricing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 8px;
}

.pricing-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.monthly-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: #ff6b35;
}

.total-price {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.register-button {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
}

.register-button:hover {
  background: #e55a2b;
}

/* Loading and Error States */
.loading-state,
.error-state,
.no-project-state,
.no-programs-state {
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
  border-top: 3px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.no-project-icon,
.no-programs-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.error-state h3,
.no-project-state h3,
.no-programs-state h3 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 1.25rem;
}

.error-state p,
.no-project-state p,
.no-programs-state p {
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.retry-btn,
.select-project-btn {
  background: #ff6b35;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.retry-btn:hover,
.select-project-btn:hover {
  background: #e55a2b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .academy-programs-page {
    padding: 16px 0;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .programs-section {
    padding: 20px;
  }
  
  .program-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .program-academy {
    align-items: flex-start;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .program-pricing {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .pricing-info {
    align-items: center;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .programs-section {
    padding: 16px;
  }
  
  .program-header {
    padding: 16px;
  }
  
  .program-details {
    padding: 0 16px 16px 16px;
    margin: 0 16px;
  }
  
  .day-schedule {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
