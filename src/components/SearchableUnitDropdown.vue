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

        <!-- Empty State - Prompt to search -->
        <div v-else-if="allUnits.length === 0 && !searchTerm" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>Search by unit or building</p>
          <small>Try: "3", "101", "379", or "D1A"</small>
        </div>
        
        <!-- Empty State - Keep typing (removed - now support 1 character) -->

        <!-- No Results -->
        <div v-else-if="filteredUnits.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>No units found for "{{ searchTerm }}"</p>
          <small>Try unit number (3, 101) or building (379)</small>
        </div>

        <!-- Units List -->
        <div v-else class="units-list">
          <!-- All matching units (vacant + occupied); relevance-sorted -->
          <div v-if="allVisibleUnits.length > 0" class="units-section">
            <div
              v-for="unit in allVisibleUnits"
              :key="unit.id"
              :class="['unit-item', unit.isOccupied ? 'occupied' : 'vacant']"
              @click="selectUnit(unit)"
            >
              <div class="unit-info">
                <span class="unit-number">{{ unit.unitIdentifier }}</span>
                <span v-if="unit.buildingNum" class="unit-building">Building {{ unit.buildingNum }}</span>
                <span v-if="unit.floor" class="unit-floor">Floor {{ unit.floor }}</span>
              </div>
              <div :class="['unit-badge', unit.isOccupied ? 'occupied-badge' : 'vacant-badge']">
                {{ unit.isOccupied ? 'Has Residents' : 'Available' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { getUnitsByProject } from '../services/dynamoDBUnitsService'
import { projectsUnitsService } from '../services/dynamoDBTableServices'

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
    default: 'Search by unit number or building (e.g., D1A-1, D2A, or just D1A)...'
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

/** Normalize unit strings for matching user.projects[].unit to catalog rows */
function normalizeUnitKey(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '-')
}

// Occupied unit keys (users may store "90-12", "90 - 12", or same as unitIdentifier)
const occupiedUnitIdentifiers = computed(() => {
  if (!props.projectUsers || props.projectUsers.length === 0) return new Set()

  const occupied = new Set()
  props.projectUsers.forEach((user) => {
    if (user.projects && Array.isArray(user.projects)) {
      user.projects.forEach((p) => {
        if (p.projectId === props.projectId && p.unit) {
          occupied.add(normalizeUnitKey(p.unit))
        }
      })
    }
  })
  return occupied
})

function isUnitRowOccupied(unit, normalizedOccupied) {
  const id = unit.unitIdentifier
  const b = unit.buildingNum
  const u = unit.unitNum
  const candidates = []
  if (id != null && id !== '') candidates.push(normalizeUnitKey(id))
  if (b != null && b !== '' && u != null && u !== '') {
    candidates.push(normalizeUnitKey(`${b}-${u}`))
  }
  if (u != null && u !== '') candidates.push(normalizeUnitKey(u))
  if (b != null && b !== '') candidates.push(normalizeUnitKey(b))
  return candidates.some((k) => k && normalizedOccupied.has(k))
}

// Computed: Filtered units based on search
const filteredUnits = computed(() => {
  if (!searchTerm.value) {
    return allUnits.value
  }

  const term = searchTerm.value.toLowerCase()
  return allUnits.value.filter((unit) => {
    const identifier = unit.unitIdentifier?.toLowerCase() || ''
    const building = String(unit.buildingNum ?? '').toLowerCase()
    const unitNum = String(unit.unitNum ?? '').toLowerCase()
    const floor = String(unit.floor ?? '').toLowerCase()

    return (
      identifier.includes(term) ||
      building.includes(term) ||
      unitNum.includes(term) ||
      floor.includes(term)
    )
  })
})

const sortUnitsByRelevanceThenBuilding = (list) => {
  const term = searchTerm.value.trim().toLowerCase()
  return [...list].sort((a, b) => {
    if (term) {
      const ra = unitSearchMatchScore(a, term)
      const rb = unitSearchMatchScore(b, term)
      if (ra !== rb) return ra - rb
    }
    if (a.buildingNum !== b.buildingNum) {
      return String(a.buildingNum).localeCompare(String(b.buildingNum), undefined, { numeric: true, sensitivity: 'base' })
    }
    return String(a.unitNum).localeCompare(String(b.unitNum), undefined, { numeric: true, sensitivity: 'base' })
  })
}

// All matches: occupied and vacant together (occupied must stay visible for picking / awareness)
const allVisibleUnits = computed(() => {
  const occSet = occupiedUnitIdentifiers.value
  const tagged = filteredUnits.value.map((unit) => ({
    ...unit,
    isOccupied: isUnitRowOccupied(unit, occSet)
  }))
  return sortUnitsByRelevanceThenBuilding(tagged)
})

// Search units when user types in search box
watch(searchTerm, (newValue) => {
  if (newValue && newValue.length >= 1) {
    searchUnits(newValue)
  } else {
    allUnits.value = []
  }
})

// Clear units when project changes
watch(() => props.projectId, () => {
  allUnits.value = []
  searchTerm.value = ''
})

// Watch modelValue changes from parent
watch(() => props.modelValue, (newValue) => {
  selectedUnit.value = newValue
})

/** Lower score = better match. Deprioritizes middle-substring hits (e.g. "190" for query "90") vs exact "90". */
function unitSearchMatchScore(unit, termLower) {
  if (!termLower) return 99
  const u = String(unit.unitNum ?? '').toLowerCase()
  const b = String(unit.buildingNum ?? '').toLowerCase()
  const id = String(unit.unitIdentifier ?? '').toLowerCase()
  const floor = String(unit.floor ?? '').toLowerCase()

  if (u === termLower || b === termLower || id === termLower || floor === termLower) return 0

  const segments = id.split(/[-_/]/).filter(Boolean)
  if (segments.some((s) => s === termLower)) return 1

  if (u.startsWith(termLower) || b.startsWith(termLower) || id.startsWith(termLower) || floor.startsWith(termLower)) {
    return 2
  }
  if (u.endsWith(termLower) || b.endsWith(termLower) || id.endsWith(termLower)) return 3

  const midOnly = (s) =>
    s &&
    s.includes(termLower) &&
    s !== termLower &&
    !s.startsWith(termLower) &&
    !s.endsWith(termLower)

  if (midOnly(u) || midOnly(b)) return 6
  if (u.includes(termLower) || b.includes(termLower) || floor.includes(termLower)) return 4
  if (id.includes(termLower)) return 5
  return 99
}

// Search units from DynamoDB based on user input
let searchTimeout = null
const searchUnits = async (searchQuery) => {
  if (!props.projectId || !searchQuery || searchQuery.length < 1) {
    // Don't search if query is empty
    allUnits.value = []
    return
  }

  // Debounce search - wait 300ms after user stops typing
  clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      console.log(`🔍 [SearchableUnitDropdown] Searching units for project "${props.projectId}": "${searchQuery}"`)
      
      // Try both parentId and projectId keys
      let units = []
      
      try {
        // Try with parentId first (dynamoDBUnitsService)
        units = await getUnitsByProject(props.projectId, { pageSize: 500, maxPages: 200 })
        console.log(`✅ [SearchableUnitDropdown] Found ${units.length} units using parentId`)
      } catch (error) {
        console.warn(`⚠️ [SearchableUnitDropdown] Failed with parentId, trying projectId:`, error.message)
        // Try with projectId (projectsUnitsService)
        try {
          units = await projectsUnitsService.getUnitsByProject(props.projectId, { pageSize: 500, maxPages: 200 })
          console.log(`✅ [SearchableUnitDropdown] Found ${units.length} units using projectId`)
        } catch (altError) {
          console.error(`❌ [SearchableUnitDropdown] Both queries failed:`, altError.message)
          throw altError
        }
      }
      
      // Process units and create unitIdentifier (building "0" is valid — avoid falsy skip)
      const processedUnits = units.map((unit) => {
        const b = unit.buildingNum
        const u = unit.unitNum
        const hasBuilding = b !== undefined && b !== null && String(b).trim() !== ''
        const hasUnit = u !== undefined && u !== null && String(u).trim() !== ''
        const unitIdentifier =
          hasBuilding && hasUnit ? `${b}-${u}` : hasUnit ? String(u) : hasBuilding ? String(b) : unit.id || unit.unitId || ''
        return {
          id: unit.id || unit.unitId || '',
          ...unit,
          unitIdentifier
        }
      })
      
      // Filter by search query (client-side filtering)
      const searchLower = searchQuery.toLowerCase()
      
      const matched = processedUnits.filter((unit) => {
        const unitNum = String(unit.unitNum || '').toLowerCase()
        const buildingNum = String(unit.buildingNum || '').toLowerCase()
        const identifier = String(unit.unitIdentifier || '').toLowerCase()
        const floor = String(unit.floor || '').toLowerCase()

        return (
          unitNum.includes(searchLower) ||
          buildingNum.includes(searchLower) ||
          identifier.includes(searchLower) ||
          floor.includes(searchLower)
        )
      })

      matched.sort((a, b) => {
        const ra = unitSearchMatchScore(a, searchLower)
        const rb = unitSearchMatchScore(b, searchLower)
        if (ra !== rb) return ra - rb
        return String(a.unitIdentifier || '').localeCompare(String(b.unitIdentifier || ''), undefined, {
          numeric: true,
          sensitivity: 'base'
        })
      })

      // After full-table pagination, keep full match list (UI scroll); optional hard cap for extreme projects
      allUnits.value = matched.length > 3000 ? matched.slice(0, 3000) : matched
      
      console.log(`✅ [SearchableUnitDropdown] Found ${allUnits.value.length} matching units after filtering`)
    } catch (error) {
      console.error('[SearchableUnitDropdown] ❌ Error searching units:', error)
      allUnits.value = []
    } finally {
      loading.value = false
    }
  }, 300) // 300ms debounce
}

// No longer need fetchUnits - using search-as-you-type instead

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
  const list = allVisibleUnits.value
  if (list.length > 0) selectUnit(list[0])
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

.unit-building,
.unit-floor {
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

