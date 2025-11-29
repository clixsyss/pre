/**
 * DynamoDB Projects Service Usage Example
 * 
 * This file demonstrates how UI components can use the DynamoDBProjectsService
 * to fetch projects from DynamoDB.
 * 
 * DO NOT import this file in production code - it's just an example.
 */

import { getProjects, getProjectById } from '../services/dynamoDBProjectsService'

/**
 * Example 1: Fetch all projects
 * 
 * This is the most common use case - getting all available projects
 * to display in a dropdown, list, or selection component.
 */
export async function exampleFetchAllProjects() {
  try {
    console.log('Fetching all projects from DynamoDB...')
    
    // Call getProjects() - no parameters needed for all projects
    const projects = await getProjects()
    
    console.log(`✅ Retrieved ${projects.length} projects:`)
    projects.forEach(project => {
      console.log(`  - ${project.name} (ID: ${project.id})`)
    })
    
    return projects
  } catch (error) {
    console.error('❌ Error fetching projects:', error)
    throw error
  }
}

/**
 * Example 2: Fetch projects with a limit
 * 
 * Useful when you only need the first N projects (e.g., for pagination)
 */
export async function exampleFetchProjectsWithLimit() {
  try {
    console.log('Fetching first 10 projects...')
    
    const projects = await getProjects({ limit: 10 })
    
    console.log(`✅ Retrieved ${projects.length} projects (limited to 10)`)
    return projects
  } catch (error) {
    console.error('❌ Error fetching projects:', error)
    throw error
  }
}

/**
 * Example 3: Fetch a single project by ID
 * 
 * Useful when you know the specific project ID and need its details
 */
export async function exampleFetchProjectById() {
  try {
    const projectId = 'project-123' // Replace with actual project ID
    
    console.log(`Fetching project: ${projectId}`)
    
    const project = await getProjectById(projectId)
    
    if (project) {
      console.log('✅ Project found:', project)
      return project
    } else {
      console.log('⚠️ Project not found')
      return null
    }
  } catch (error) {
    console.error('❌ Error fetching project:', error)
    throw error
  }
}

/**
 * Example 4: Using in a Vue component (composition API)
 * 
 * This shows how you would use it in an actual Vue component
 */
export function exampleVueComponentUsage() {
  // This is pseudo-code showing the pattern - don't actually use this
  
  /*
  <script setup>
  import { ref, onMounted } from 'vue'
  import { getProjects } from '@/services/dynamoDBProjectsService'
  
  const projects = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const loadProjects = async () => {
    try {
      loading.value = true
      error.value = null
      
      const fetchedProjects = await getProjects()
      projects.value = fetchedProjects
    } catch (err) {
      error.value = err.message
      console.error('Failed to load projects:', err)
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    loadProjects()
  })
  </script>
  
  <template>
    <div v-if="loading">Loading projects...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else>
      <div v-for="project in projects" :key="project.id">
        {{ project.name }}
      </div>
    </div>
  </template>
  */
}

/**
 * Example 5: Using in a Pinia store
 * 
 * This shows how you would use it in a Pinia store
 */
export function examplePiniaStoreUsage() {
  // This is pseudo-code showing the pattern - don't actually use this
  
  /*
  import { defineStore } from 'pinia'
  import { ref } from 'vue'
  import { getProjects } from '@/services/dynamoDBProjectsService'
  
  export const useProjectsStore = defineStore('projects', () => {
    const projects = ref([])
    const loading = ref(false)
    
    const fetchProjects = async () => {
      loading.value = true
      try {
        projects.value = await getProjects()
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        loading.value = false
      }
    }
    
    return {
      projects,
      loading,
      fetchProjects
    }
  })
  */
}

