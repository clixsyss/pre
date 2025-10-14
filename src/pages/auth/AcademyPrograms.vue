<template>
  <div class="academy-programs-page">
    <PageHeader :title="$t('academyProgramsTitle')"
      :subtitle="projectName ? `${$t('joinAcademiesIn')} ${projectName}` : $t('chooseAcademyProgram')" />

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ $t('loadingPrograms') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchAcademies" class="retry-btn">{{ $t('tryAgain') }}</button>
    </div>

    <!-- No Project Selected -->
    <div v-else-if="!projectId" class="no-project-state">
      <div class="no-project-icon">🏗️</div>
      <h3>{{ $t('noProjectSelected') }}</h3>
      <p>{{ $t('selectProjectForAcademy') }}</p>
      <button @click="$router.push('/project-selection')" class="select-project-btn">
        {{ $t('switchProject') }}
      </button>
    </div>

    <!-- No Programs Available -->
    <div v-else-if="allPrograms.length === 0" class="no-programs-state">
      <div class="no-programs-icon">📚</div>
      <h3>{{ $t('noProgramsAvailable') }}</h3>
      <p>{{ $t('noProgramsMessage') }}</p>
      <p>{{ $t('contactAdminForPrograms') }}</p>
    </div>

    <!-- Programs Content -->
    <div v-else class="programs-content">
      <!-- Programs List -->
      <div class="programs-section">
        <h2 class="section-title">{{ $t('availablePrograms') }}</h2>
        <p class="section-subtitle">{{ allPrograms.length }} {{ allPrograms.length !== 1 ? $t('programsAvailable') :
          $t('programAvailable') }}</p>

        <div class="programs-list">
          <div v-for="programData in allPrograms"
            :key="`${programData.academyId}-${programData.program.id || programData.program.name}`" class="program-item"
            :class="{ 'expanded': expandedProgram === `${programData.academyId}-${programData.program.id || programData.program.name}` }">
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
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Program Details (Expandable) - SIMPLIFIED & MODERN -->
            <div
              v-if="expandedProgram === `${programData.academyId}-${programData.program.id || programData.program.name}`"
              class="program-details">
              <!-- Compact Info Grid -->
              <div class="details-pills-grid">
                <div v-if="programData.program.ageGroup" class="detail-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" />
                    <path d="M6 21V19C6 17.3431 7.34315 16 9 16H15C16.6569 16 18 17.3431 18 19V21" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" />
                  </svg>
                  <span>{{ programData.program.ageGroup }}</span>
                </div>

                <div
                  v-if="programData.program.duration && (programData.program.pricingType === 'per-month' || programData.program.pricingType === 'per-week' || programData.program.pricingType === 'per-term')"
                  class="detail-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  </svg>
                  <span>{{ programData.program.duration }} {{ getDurationUnit(programData.program.pricingType) }}</span>
                </div>

                <div v-if="programData.program.maxCapacity" class="detail-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  </svg>
                  <span>{{ programData.program.maxCapacity }} spots</span>
                </div>

                <div v-if="programData.academy.location" class="detail-pill location-pill">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z"
                      stroke="currentColor" stroke-width="2" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" />
                  </svg>
                  <span>{{ programData.academy.location }}</span>
                </div>
              </div>

              <!-- Schedule & Coaches in Compact Cards -->
              <div class="details-row">
                <div
                  v-if="programData.program.timeSlotsByDay && Object.keys(programData.program.timeSlotsByDay).length > 0"
                  class="schedule-card-compact">
                  <div class="compact-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" />
                      <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                    Schedule
                  </div>
                  <div class="compact-content">
                    <span v-for="[day, slots] in Object.entries(programData.program.timeSlotsByDay).slice(0, 2)"
                      :key="day" class="day-tag">
                      {{ day.substring(0, 3) }}: {{ slots[0]?.startTime }}
                    </span>
                    <span v-if="Object.keys(programData.program.timeSlotsByDay).length > 2" class="more-tag">
                      +{{ Object.keys(programData.program.timeSlotsByDay).length - 2 }}
                    </span>
                  </div>
                </div>

                <div v-if="programData.program.coaches && programData.program.coaches.length > 0"
                  class="coaches-card-compact">
                  <div class="compact-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M23 21V19C23 16.7909 21.2091 15 19 15M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                    Coaches
                  </div>
                  <div class="compact-content">
                    {{programData.program.coaches.slice(0, 2).map(c => typeof c === 'object' ? c.name : c).join(', ')
                    }}
                    <span v-if="programData.program.coaches.length > 2">...</span>
                  </div>
                </div>
              </div>

              <!-- Description (if exists) -->
              <div v-if="programData.program.description" class="description-card-compact">
                <p>{{ programData.program.description.length > 120 ? programData.program.description.substring(0, 120) +
                  '...' : programData.program.description }}</p>
              </div>

              <!-- Pricing and Registration -->
              <div class="program-action-footer">
                <div class="price-display">
                  <span class="price-amount">{{ programData.program.price }} EGP</span>
                  <span class="price-label">{{ getPricingTypeLabel(programData.program.pricingType) }}</span>
                </div>
                <button @click="registerForProgram(programData)" class="register-button-compact">
                  Register Now
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
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
import PageHeader from '../../components/PageHeader.vue';

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
  max-width: 800px;
  margin: 0 auto;
}

/* Page header styles moved to PageHeader component */

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

/* Mobile app - hover effects disabled */
/* .program-item:hover {
  border-color: #AF1E23;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
} */

.program-item.expanded {
  border-color: #AF1E23;
  background: #fff5f2;
}

.program-header {
  padding: 20px;
  cursor: pointer;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

/* Mobile app - hover effects disabled */
/* .program-header:hover {
  background: rgba(255, 107, 53, 0.05);
} */

.program-basic-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
}

.program-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.2;
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

/* Modern Compact Program Details */
.program-details {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  margin: 0 12px 12px 12px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.details-pills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.detail-pill {
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

.detail-pill svg {
  flex-shrink: 0;
  stroke: #64748b;
  width: 16px;
  height: 16px;
}

.location-pill {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  color: #78350f;
  font-weight: 600;
}

.location-pill svg {
  stroke: #78350f;
}

.details-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.schedule-card-compact,
.coaches-card-compact {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 12px;
  padding: 12px;
}

.coaches-card-compact {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.compact-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #166534;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.coaches-card-compact .compact-header {
  color: #1e40af;
}

.compact-header svg {
  stroke: #16a34a;
}

.coaches-card-compact .compact-header svg {
  stroke: #3b82f6;
}

.compact-content {
  font-size: 0.85rem;
  color: #166534;
  font-weight: 500;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.coaches-card-compact .compact-content {
  color: #1e40af;
}

.day-tag {
  background: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #86efac;
}

.more-tag {
  background: #dcfce7;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #166534;
}

.description-card-compact {
  background: #fafafa;
  border-left: 3px solid #AF1E23;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.description-card-compact p {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #64748b;
  margin: 0;
}

.program-action-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 2px dashed #e2e8f0;
}

.price-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: #AF1E23;
  line-height: 1;
}

.price-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.register-button-compact {
  background: linear-gradient(135deg, #AF1E23 0%, #d32f2f 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.3);
}

/* Mobile app - hover effects disabled */
/* .register-button-compact:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(175, 30, 35, 0.4);
} */

.register-button-compact svg {
  flex-shrink: 0;
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
  border-top: 3px solid #AF1E23;
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
/* .retry-btn:hover,
.select-project-btn:hover {
  background: #AF1E23;
} */

/* Responsive Design */
@media (max-width: 768px) {
  .academy-programs-page {
    padding: 16px 0;
  }

  /* Page header responsive styles moved to PageHeader component */

  .programs-section {
    padding: 20px;
  }

  .program-header {
    align-items: flex-start;
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
    padding: 16px;
    margin: 16px;
  }

  .day-schedule {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
