<template>
  <div class="searchable-unit-dropdown">
    <label v-if="label" class="unit-label">{{ label }}</label>
    
    <!-- Dropdown Trigger -->
    <div 
      class="unit-dropdown-trigger" 
      :class="{ 
        'disabled': disabled,
        'focused': isOpen,
        'has-value': selectedUnit 
      }"
      @click="toggleDropdown"
    >
      <div class="trigger-content">
        <svg v-if="!selectedUnit" class="unit-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-if="selectedUnit" class="selected-unit">{{ selectedUnit }}</span>
        <span v-else class="placeholder">{{ placeholder }}</span>
      </div>
      <svg class="dropdown-arrow" :class="{ 'rotated': isOpen }" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <!-- Dropdown Menu -->
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <!-- Search Bar -->
        <div class="search-container">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            ref="searchInput"
            v-model="searchTerm"
            type="text"
            class="search-input"
            :placeholder="searchPlaceholder"
            @keydown.esc="closeDropdown"
            @keydown.enter.prevent="selectFirstVisible"
          />
          <button
            v-if="searchTerm"
            class="clear-search"
            @click="clearSearch"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="dropdown-loading">
          <div class="loading-spinner"></div>
          <span>Loading units...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="allUnits.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p>No units available</p>
        </div>

        <!-- No Results -->
        <div v-else-if="filteredUnits.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>No units match "{{ searchTerm }}"</p>
          <small>Try searching with a different term</small>
        </div>

        <!-- Units List -->
        <div v-else class="units-list">
          <!-- Vacant Units Section -->
          <div v-if="vacantUnits.length > 0" class="units-section">
            <div class="section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#4CAF50" opacity="0.2"/>
                <path d="M9 12L11 14L15 10" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Available Units ({{ vacantUnits.length }})</span>
            </div>
            <div
              v-for="unit in vacantUnits"
              :key="unit.id"
              class="unit-item vacant"
              @click="selectUnit(unit)"
            >
              <div class="unit-info">
                <span class="unit-number">{{ unit.unitIdentifier }}</span>
                <span v-if="unit.buildingNum" class="unit-building">Building {{ unit.buildingNum }}</span>
              </div>
              <div class="unit-badge vacant-badge">Available</div>
            </div>
          </div>

          <!-- Occupied Units Section (shown only with search) -->
          <div v-if="occupiedUnits.length > 0 && searchTerm" class="units-section">
            <div class="section-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#FF9800" opacity="0.2"/>
                <path d="M12 8V12M12 16H12.01" stroke="#FF9800" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>Occupied Units ({{ occupiedUnits.length }})</span>
            </div>
            <div
              v-for="unit in occupiedUnits"
              :key="unit.id"
              class="unit-item occupied"
              @click="selectUnit(unit)"
            >
              <div class="unit-info">
                <span class="unit-number">{{ unit.unitIdentifier }}</span>
                <span v-if="unit.buildingNum" class="unit-building">Building {{ unit.buildingNum }}</span>
              </div>
              <div class="unit-badge occupied-badge">Occupied</div>
            </div>
          </div>

          <!-- Hint for occupied units -->
          <div v-if="occupiedUnits.length > 0 && !searchTerm && vacantUnits.length > 0" class="search-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>{{ occupiedUnits.length }} occupied unit{{ occupiedUnits.length !== 1 ? 's' : '' }} hidden. Search to view.</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../boot/firebase'

// Props
const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select a unit...'
  },
  searchPlaceholder: {
    type: String,
    default: 'Search units (e.g., D1A-1, D2A)...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  projectUsers: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// State
const isOpen = ref(false)
const searchTerm = ref('')
const allUnits = ref([])
const loading = ref(false)
const searchInput = ref(null)
const selectedUnit = ref(props.modelValue)

// Computed: Occupied unit identifiers
const occupiedUnitIdentifiers = computed(() => {
  if (!props.projectUsers || props.projectUsers.length === 0) return new Set()
  
  const occupied = new Set()
  props.projectUsers.forEach(user => {
    if (user.projects && Array.isArray(user.projects)) {
      user.projects.forEach(p => {
        if (p.projectId === props.projectId && p.unit) {
          occupied.add(p.unit)
        }
      })
    }
  })
  return occupied
})

// Computed: Filtered units based on search
const filteredUnits = computed(() => {
  if (!searchTerm.value) {
    return allUnits.value
  }

  const term = searchTerm.value.toLowerCase()
  return allUnits.value.filter(unit => {
    const identifier = unit.unitIdentifier?.toLowerCase() || ''
    const building = String(unit.buildingNum || '').toLowerCase()
    const unitNum = String(unit.unitNum || '').toLowerCase()
    
    return identifier.includes(term) || 
           building.includes(term) || 
           unitNum.includes(term)
  })
})

// Computed: Vacant units (not occupied, visible by default)
const vacantUnits = computed(() => {
  return filteredUnits.value.filter(unit => 
    !occupiedUnitIdentifiers.value.has(unit.unitIdentifier)
  ).sort((a, b) => {
    // Sort by building then unit number
    if (a.buildingNum !== b.buildingNum) {
      return String(a.buildingNum).localeCompare(String(b.buildingNum))
    }
    return String(a.unitNum).localeCompare(String(b.unitNum))
  })
})

// Computed: Occupied units (only shown when searching)
const occupiedUnits = computed(() => {
  return filteredUnits.value.filter(unit => 
    occupiedUnitIdentifiers.value.has(unit.unitIdentifier)
  ).sort((a, b) => {
    if (a.buildingNum !== b.buildingNum) {
      return String(a.buildingNum).localeCompare(String(b.buildingNum))
    }
    return String(a.unitNum).localeCompare(String(b.unitNum))
  })
})

// Fetch units when project changes
watch(() => props.projectId, async (newProjectId) => {
  if (newProjectId) {
    await fetchUnits(newProjectId)
  } else {
    allUnits.value = []
  }
}, { immediate: true })

// Watch modelValue changes from parent
watch(() => props.modelValue, (newValue) => {
  selectedUnit.value = newValue
})

// Fetch units from Firestore
const fetchUnits = async (projectId) => {
  if (!projectId) {
    allUnits.value = []
    return
  }

  loading.value = true
  try {
    console.log('[SearchableUnitDropdown] Fetching units for project:', projectId)
    
    // Detect platform
    const { Capacitor } = await import('@capacitor/core')
    
    if (Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform()) {
      // Use Capacitor Firebase plugin for iOS
      console.log('📊 [SearchableUnitDropdown] Fetching units with limit (iOS)...')
      const { FirebaseFirestore } = await import('@capacitor-firebase/firestore')
      
      // OPTIMIZATION: Limit units to 500 for better performance
      // Note: Capacitor Firebase may not support all query constraints
      // If limit doesn't work, it will fetch all (needs testing)
      const result = await FirebaseFirestore.getDocuments({
        reference: `projects/${projectId}/units`,
        queryConstraints: [
          {
            type: 'orderBy',
            fieldPath: 'unitNum',
            directionStr: 'asc'
          },
          {
            type: 'limit',
            limit: 500
          }
        ]
      })
      
      allUnits.value = result.snapshots?.map(snapshot => ({
        id: snapshot.id,
        ...snapshot.data,
        unitIdentifier: snapshot.data.buildingNum && snapshot.data.unitNum 
          ? `${snapshot.data.buildingNum}-${snapshot.data.unitNum}`
          : snapshot.data.unitNum || snapshot.id
      })) || []
      
      console.log(`✅ [SearchableUnitDropdown] Fetched ${allUnits.value.length} units (limited) via Capacitor`)
    } else {
      // Use Web SDK for web/Android
      console.log('📊 [SearchableUnitDropdown] Fetching units with limit...')
      const { limit, orderBy, query: fsQuery } = await import('firebase/firestore')
      
      // OPTIMIZATION: Limit units to 500 for better performance
      const unitsQuery = fsQuery(
        collection(db, `projects/${projectId}/units`),
        orderBy('unitNum', 'asc'),
        limit(500)
      )
      
      const unitsSnapshot = await getDocs(unitsQuery)
      allUnits.value = unitsSnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          unitIdentifier: data.buildingNum && data.unitNum 
            ? `${data.buildingNum}-${data.unitNum}`
            : data.unitNum || doc.id
        }
      })
      
      console.log(`✅ [SearchableUnitDropdown] Fetched ${allUnits.value.length} units (limited) via Web SDK`)
    }
  } catch (error) {
    console.error('[SearchableUnitDropdown] Error fetching units:', error)
    allUnits.value = []
  } finally {
    loading.value = false
  }
}

// Toggle dropdown
const toggleDropdown = () => {
  if (props.disabled) return
  
  isOpen.value = !isOpen.value
  
  if (isOpen.value) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

// Close dropdown
const closeDropdown = () => {
  isOpen.value = false
  searchTerm.value = ''
}

// Clear search
const clearSearch = () => {
  searchTerm.value = ''
  searchInput.value?.focus()
}

// Select unit
const selectUnit = (unit) => {
  selectedUnit.value = unit.unitIdentifier
  emit('update:modelValue', unit.unitIdentifier)
  closeDropdown()
}

// Select first visible unit (on Enter)
const selectFirstVisible = () => {
  if (vacantUnits.value.length > 0) {
    selectUnit(vacantUnits.value[0])
  } else if (occupiedUnits.value.length > 0) {
    selectUnit(occupiedUnits.value[0])
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.searchable-unit-dropdown')
  if (!dropdown) {
    closeDropdown()
  }
}

// Add/remove click outside listener
watch(isOpen, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
.searchable-unit-dropdown {
  position: relative;
  width: 100%;
}

.unit-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

/* Dropdown Trigger */
.unit-dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 52px;
}

.unit-dropdown-trigger:hover:not(.disabled) {
  border-color: #AF1E23;
}

.unit-dropdown-trigger.focused {
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.unit-dropdown-trigger.disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.unit-icon {
  color: #666;
  flex-shrink: 0;
}

.selected-unit {
  font-weight: 600;
  color: #231F20;
  font-size: 1rem;
}

.placeholder {
  color: #999;
  font-size: 1rem;
}

.dropdown-arrow {
  color: #666;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow: hidden;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* Search Container */
.search-container {
  position: relative;
  padding: 12px;
  border-bottom: 2px solid #f5f5f5;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(175, 30, 35, 0.1);
}

.clear-search {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search:hover {
  background-color: #f5f5f5;
  color: #AF1E23;
}

/* Loading State */
.dropdown-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 15px;
  color: #666;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e1e5e9;
  border-top-color: #AF1E23;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  text-align: center;
}

.empty-state svg {
  color: #ccc;
  margin-bottom: 15px;
}

.empty-state p {
  margin: 0 0 5px 0;
  font-weight: 600;
  font-size: 1rem;
  color: #666;
}

.empty-state small {
  color: #999;
  font-size: 0.85rem;
}

/* Units List */
.units-list {
  overflow-y: auto;
  flex: 1;
}

.units-section {
  padding: 12px;
}

.units-section + .units-section {
  border-top: 2px solid #f5f5f5;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Unit Item */
.unit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.unit-item:hover {
  background-color: #f8f9fa;
}

.unit-item.vacant:hover {
  background-color: rgba(76, 175, 80, 0.05);
  border-left: 3px solid #4CAF50;
  padding-left: 9px;
}

.unit-item.occupied:hover {
  background-color: rgba(255, 152, 0, 0.05);
  border-left: 3px solid #FF9800;
  padding-left: 9px;
}

.unit-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.unit-number {
  font-weight: 600;
  color: #231F20;
  font-size: 1rem;
}

.unit-building {
  font-size: 0.85rem;
  color: #666;
}

/* Unit Badges */
.unit-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.vacant-badge {
  background-color: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
}

.occupied-badge {
  background-color: rgba(255, 152, 0, 0.15);
  color: #FF9800;
}

/* Search Hint */
.search-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin: 8px 12px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
  font-size: 0.85rem;
}

.search-hint svg {
  color: #856404;
  flex-shrink: 0;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 480px) {
  .dropdown-menu {
    max-height: 300px;
  }
  
  .unit-item {
    padding: 12px 10px;
  }
  
  .search-input {
    font-size: 16px; /* Prevents iOS zoom */
  }
}
</style>

