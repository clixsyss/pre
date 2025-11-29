/**
 * Centralized App Data Composable (Mobile App)
 * 
 * Provides cached access to users, projects, and other app data
 * Use this instead of fetching data directly in components
 */

import { ref, computed, watch } from 'vue'
import { getAllUsers } from '../services/dynamoDBUsersService'
import { getUnitsByProject } from '../services/dynamoDBUnitsService'

// ============= GLOBAL CACHE ============= (Extended for cost optimization)
const CACHE_DURATION = {
  users: 24 * 60 * 60 * 1000, // 24 hours
  projects: 7 * 24 * 60 * 60 * 1000, // 7 days (projects rarely change)
  units: 7 * 24 * 60 * 60 * 1000 // 7 days (units rarely change)
}

// Shared cache across all component instances
const globalCache = {
  users: {
    data: ref([]),
    lastFetched: ref(null),
    loading: ref(false),
    error: ref(null)
  },
  projects: {
    data: ref([]),
    lastFetched: ref(null),
    loading: ref(false),
    error: ref(null)
  },
  units: {
    data: ref(new Map()), // Map of projectId -> units[]
    lastFetched: ref(new Map()),
    loading: ref(false),
    error: ref(null)
  }
}

/**
 * Check if cache needs refresh
 */
function needsRefresh(lastFetched, duration) {
  if (!lastFetched) return true
  return Date.now() - lastFetched > duration
}

/**
 * Use cached users data
 */
export function useUsersData(options = {}) {
  const { projectId = null, autoFetch = true } = options

  const fetchUsers = async (forceRefresh = false) => {
    const cache = globalCache.users

    // Check if refresh needed
    if (!forceRefresh && !needsRefresh(cache.lastFetched.value, CACHE_DURATION.users)) {
      console.log('✅ useAppData: Using cached users', cache.data.value.length)
      return cache.data.value
    }

    // Already loading?
    if (cache.loading.value) {
      console.log('⏳ useAppData: Users already loading, waiting...')
      return new Promise((resolve) => {
        const unwatch = watch(cache.loading, (loading) => {
          if (!loading) {
            unwatch()
            resolve(cache.data.value)
          }
        })
      })
    }

    try {
      cache.loading.value = true
      cache.error.value = null
      console.log('📊 useAppData: Fetching users from DynamoDB...')

      // Fetch users from DynamoDB
      const users = await getAllUsers({ limit: 1000 })

      cache.data.value = users
      cache.lastFetched.value = Date.now()
      console.log(`✅ useAppData: Fetched ${users.length} users (cached)`)

      return users
    } catch (error) {
      console.error('❌ useAppData: Error fetching users:', error)
      cache.error.value = error.message
      throw error
    } finally {
      cache.loading.value = false
    }
  }

  // Auto-fetch if needed
  if (autoFetch && globalCache.users.data.value.length === 0 && !globalCache.users.loading.value) {
    fetchUsers()
  }

  // Filter by project if specified
  const filteredUsers = computed(() => {
    if (!projectId) return globalCache.users.data.value

    return globalCache.users.data.value.filter(user =>
      user.projects?.some(p => p.projectId === projectId)
    )
  })

  return {
    users: filteredUsers,
    allUsers: globalCache.users.data,
    loading: globalCache.users.loading,
    error: globalCache.users.error,
    refresh: () => fetchUsers(true),
    fetchUsers
  }
}

/**
 * Use cached projects data
 */
export function useProjectsData(options = {}) {
  const { autoFetch = true } = options

  const fetchProjects = async (forceRefresh = false) => {
    const cache = globalCache.projects

    // Check if refresh needed
    if (!forceRefresh && !needsRefresh(cache.lastFetched.value, CACHE_DURATION.projects)) {
      console.log('✅ useAppData: Using cached projects', cache.data.value.length)
      return cache.data.value
    }

    // Already loading?
    if (cache.loading.value) {
      console.log('⏳ useAppData: Projects already loading, waiting...')
      return new Promise((resolve) => {
        const unwatch = watch(cache.loading, (loading) => {
          if (!loading) {
            unwatch()
            resolve(cache.data.value)
          }
        })
      })
    }

    try {
      cache.loading.value = true
      cache.error.value = null
      console.log('📊 useAppData: Fetching projects from DynamoDB...')

      // Use DynamoDB only
      const { fetchProjects } = await import('../services/dynamoDBProjectsService')
      const projects = await fetchProjects({ limit: 50 })
      console.log('✅ useAppData: Fetched projects from DynamoDB')

      cache.data.value = projects
      cache.lastFetched.value = Date.now()
      console.log(`✅ useAppData: Fetched ${projects.length} projects (cached)`)

      return projects
    } catch (error) {
      console.error('❌ useAppData: Error fetching projects:', error)
      cache.error.value = error.message
      throw error
    } finally {
      cache.loading.value = false
    }
  }

  // Auto-fetch if needed
  if (autoFetch && globalCache.projects.data.value.length === 0 && !globalCache.projects.loading.value) {
    fetchProjects()
  }

  return {
    projects: globalCache.projects.data,
    loading: globalCache.projects.loading,
    error: globalCache.projects.error,
    refresh: () => fetchProjects(true),
    fetchProjects
  }
}

/**
 * Use cached units for a project
 */
export function useUnitsData(projectId, options = {}) {
  const { autoFetch = true } = options

  const fetchUnits = async (forceRefresh = false) => {
    if (!projectId) return []

    const cache = globalCache.units
    const lastFetched = cache.lastFetched.value.get(projectId)

    // Check if refresh needed
    if (!forceRefresh && !needsRefresh(lastFetched, CACHE_DURATION.units)) {
      const cachedUnits = cache.data.value.get(projectId) || []
      console.log(`✅ useAppData: Using cached units for ${projectId}`, cachedUnits.length)
      return cachedUnits
    }

    try {
      cache.loading.value = true
      cache.error.value = null
      console.log(`📊 useAppData: Fetching units for project ${projectId} from DynamoDB...`)

      // Fetch units from DynamoDB
      const units = await getUnitsByProject(projectId, { limit: 500 })

      // Update cache for this project
      cache.data.value.set(projectId, units)
      cache.lastFetched.value.set(projectId, Date.now())
      console.log(`✅ useAppData: Fetched ${units.length} units for ${projectId} (cached)`)

      return units
    } catch (error) {
      console.error('❌ useAppData: Error fetching units:', error)
      cache.error.value = error.message
      throw error
    } finally {
      cache.loading.value = false
    }
  }

  // Auto-fetch if needed
  if (autoFetch && projectId && !globalCache.units.data.value.has(projectId) && !globalCache.units.loading.value) {
    fetchUnits()
  }

  const units = computed(() => globalCache.units.data.value.get(projectId) || [])

  return {
    units,
    loading: globalCache.units.loading,
    error: globalCache.units.error,
    refresh: () => fetchUnits(true),
    fetchUnits
  }
}

/**
 * Initialize all app data at once
 */
export async function initializeAppData() {
  console.log('🚀 useAppData: Initializing app data...')
  
  try {
    // Fetch critical data in parallel
    await Promise.all([
      useProjectsData().fetchProjects(),
      // Users loaded on-demand per project
    ])

    console.log('✅ useAppData: Initialization complete')
  } catch (error) {
    console.error('❌ useAppData: Initialization failed:', error)
    throw error
  }
}

/**
 * Clear all cached data
 */
export function clearAllCache() {
  console.log('🗑️ useAppData: Clearing all cache...')
  
  globalCache.users.data.value = []
  globalCache.users.lastFetched.value = null
  
  globalCache.projects.data.value = []
  globalCache.projects.lastFetched.value = null
  
  globalCache.units.data.value.clear()
  globalCache.units.lastFetched.value.clear()
}

/**
 * Refresh all cached data
 */
export async function refreshAllData() {
  console.log('🔄 useAppData: Refreshing all data...')
  
  await Promise.all([
    useProjectsData().fetchProjects(true),
    useUsersData().fetchUsers(true)
  ])
  
  console.log('✅ useAppData: All data refreshed')
}

export default {
  useUsersData,
  useProjectsData,
  useUnitsData,
  initializeAppData,
  clearAllCache,
  refreshAllData
}

