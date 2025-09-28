<template>
  <div class="modern-news-feed">
    <!-- Header -->
    <div class="news-header">
      <div class="news-title-section">
        <div class="title-row">
          <button v-if="backButton" @click="handleGoBack" class="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div v-if="showAll" class="news-count">{{ filteredNews.length }} {{ filteredNews.length === 1 ? 'item' : 'items' }}</div>
      </div>
      <button v-if="!showAll" @click="navigateToAllNews" class="view-all-btn">
        <span>View All News</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>


    <!-- Filter Tabs -->
    <div v-if="showAll" class="filter-section">
      <div class="filter-tabs">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['filter-tab', { active: activeTab === tab.value }]">
          <span class="filter-icon" v-if="tab.iconSvg" v-html="tab.iconSvg"></span>
          <span class="filter-label">{{ tab.label }}</span>
          <span v-if="getTabCount(tab.value) > 0" class="filter-count">{{ getTabCount(tab.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div v-for="n in 3" :key="n" class="news-skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-meta"></div>
        </div>
      </div>
    </div>

    <!-- News Items -->
    <div v-else-if="filteredNews.length > 0" class="news-container">
      <div v-for="item in filteredNews" :key="item.id" class="news-card"
        :class="{ 'featured': item.featured, 'urgent': item.priority === 'urgent' }">
        <!-- Media Section -->
        <div class="news-media" v-if="item.mediaUrl || item.mediaType">
          <div v-if="item.mediaType === 'video'" class="video-container">
            <video 
              :ref="(el) => observeVideo(el, item.id)"
              :src="item.mediaUrl" 
              :poster="item.thumbnailUrl" 
              controls 
              class="news-video"
              preload="none"
              playsinline
              webkit-playsinline
              @loadstart="handleVideoLoadStart(item.id)"
              @loadeddata="handleVideoLoaded(item.id)"
              @error="handleVideoError(item.id)"
              @click="handleVideoClick(item)">
              Your browser does not support the video tag.
            </video>
            <div v-if="videoLoadingStates[item.id]" class="video-loading">
              <div class="loading-spinner"></div>
            </div>
            <div v-else class="play-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" fill="white" />
              </svg>
            </div>
          </div>
          <div v-else class="image-container">
            <img :src="item.mediaUrl || defaultLogoUrl" :alt="item.title" class="news-image" @error="handleMediaError"
              loading="lazy" />
            <div v-if="item.featured" class="featured-badge">Featured</div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="news-content">
          <div class="news-meta">
            <span class="news-category" :class="getCategoryClass(item.category)">
              {{ getCategoryLabel(item.category) }}
            </span>
            <span class="news-time">{{ formatTime(item.createdAt) }}</span>
          </div>

          <h3 class="news-headline">{{ item.title }}</h3>
          <p class="news-excerpt">{{ item.excerpt || item.message }}</p>

          <div class="news-actions">
            <button class="read-more-btn" @click="openNewsDetail(item)">
              Read More
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </div>
      <h3>No news yet</h3>
      <p>Check back later for updates from your community!</p>
    </div>

    <!-- Modern News Dialog -->
    <Transition name="dialog-slide">
      <div v-if="showNewsModal && selectedNewsItem" class="dialog-overlay" @click="closeNewsModal">
        <div class="dialog-container" @click.stop>
          <!-- Dialog Header -->
          <div class="dialog-header">
            <div class="dialog-meta">
              <span class="dialog-category" :class="getCategoryClass(selectedNewsItem.category)">
                {{ getCategoryLabel(selectedNewsItem.category) }}
              </span>
              <span class="dialog-time">{{ formatTime(selectedNewsItem.createdAt) }}</span>
            </div>
            <button @click="closeNewsModal" class="dialog-close-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Scrollable Dialog Content -->
          <div class="dialog-content-scrollable">
            <!-- Media Section -->
            <div v-if="selectedNewsItem.mediaUrl || selectedNewsItem.mediaType" class="dialog-media">
              <div v-if="selectedNewsItem.mediaType === 'video'" class="dialog-video-container">
                <video 
                  :src="selectedNewsItem.mediaUrl" 
                  :poster="selectedNewsItem.thumbnailUrl" 
                  controls 
                  class="dialog-video"
                  preload="metadata"
                  playsinline
                  webkit-playsinline
                  @loadstart="handleVideoLoadStart(selectedNewsItem.id)"
                  @loadeddata="handleVideoLoaded(selectedNewsItem.id)"
                  @error="handleVideoError(selectedNewsItem.id)">
                  Your browser does not support the video tag.
                </video>
                <div v-if="videoLoadingStates[selectedNewsItem.id]" class="video-loading">
                  <div class="loading-spinner"></div>
                </div>
              </div>
              <div v-else class="dialog-image-container">
                <img :src="selectedNewsItem.mediaUrl || defaultLogoUrl" :alt="selectedNewsItem.title" class="dialog-image" 
                  @error="handleMediaError" loading="lazy" />
              </div>
            </div>

            <!-- Text Content -->
            <div class="dialog-text">
              <h1 class="dialog-title">{{ selectedNewsItem.title }}</h1>
              <div class="dialog-message" v-html="selectedNewsItem.message || selectedNewsItem.content"></div>
            </div>


            <!-- External Link Section -->
            <div v-if="selectedNewsItem.linkUrl && selectedNewsItem.linkUrl.trim() !== ''" class="dialog-link-section">
              <a :href="selectedNewsItem.linkUrl" target="_blank" rel="noopener noreferrer" class="external-link">
                <div class="link-content">
                  <div class="link-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 11C13.5705 10.4259 13.0226 9.95085 12.3934 9.60705C11.7643 9.26325 11.0685 9.05886 10.3533 9.00766C9.63816 8.95645 8.92037 9.05972 8.24861 9.31028C7.57685 9.56084 6.96684 9.95302 6.46 10.46L3.46 13.46C2.54918 14.403 2.04518 15.666 2.05659 16.977C2.068 18.288 2.59394 19.5421 3.52098 20.4691C4.44802 21.3962 5.70209 21.922 7.01307 21.9334C8.32405 21.9448 9.58706 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="link-text">
                    <div class="link-title">{{ selectedNewsItem.linkTitle || 'Read More' }}</div>
                    <div class="link-url">{{ selectedNewsItem.linkUrl }}</div>
                  </div>
                  <div class="link-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </a>
            </div>

            <!-- Compact Comments Section -->
            <div class="dialog-comments-compact">
              <NewsComments :news-id="selectedNewsItem.id" />
            </div>
          </div>

          <!-- Dialog Actions -->
          <div class="dialog-actions">
            <button @click="closeNewsModal" class="dialog-action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Got it
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'
import { storage, isNative } from '../boot/firebase'
import NewsComments from './NewsComments.vue'

// Component name for ESLint
defineOptions({
  name: 'ModernNewsFeed',
  components: {
    NewsComments
  }
})

const props = defineProps({
  projectId: {
    type: String,
    required: true
  },
  showAll: {
    type: Boolean,
    default: false
  },
  backButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['newsCountUpdate', 'goBack'])

const router = useRouter()
const projectStore = useProjectStore()
const loading = ref(false)
const newsItems = ref([])
const activeTab = ref('all')
const defaultLogoUrl = ref('')
const showNewsModal = ref(false)
const selectedNewsItem = ref(null)
const videoLoadingStates = ref({})
const videoIntersectionObserver = ref(null)
const videoElements = ref(new Map())
const isInitialMount = ref(true)

const tabs = [
  { 
    label: 'All', 
    value: 'all', 
    icon: 'svg',
    iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  { 
    label: 'General', 
    value: 'general', 
    icon: 'svg',
    iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
      <path d="M19.4 15A1.65 1.65 0 0 0 21 13.4A1.65 1.65 0 0 0 19.4 12A1.65 1.65 0 0 0 18 13.4A1.65 1.65 0 0 0 19.4 15Z" stroke="currentColor" stroke-width="2"/>
      <path d="M4.6 9A1.65 1.65 0 0 1 6 7.4A1.65 1.65 0 0 1 4.6 6A1.65 1.65 0 0 1 3 7.4A1.65 1.65 0 0 1 4.6 9Z" stroke="currentColor" stroke-width="2"/>
    </svg>`
  },
  { 
    label: 'Announcements', 
    value: 'announcement', 
    icon: 'svg',
    iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8A6 6 0 0 0 6 8C6 7 6 5 6 3A2 2 0 0 1 8 1H16A2 2 0 0 1 18 3C18 5 18 7 18 8Z" stroke="currentColor" stroke-width="2"/>
      <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  { 
    label: 'Events', 
    value: 'event', 
    icon: 'svg',
    iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
    </svg>`
  },
  { 
    label: 'Updates', 
    value: 'update', 
    icon: 'svg',
    iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
      <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2"/>
    </svg>`
  }
]

const filteredNews = computed(() => {
  let filtered = []
  if (activeTab.value === 'all') {
    filtered = newsItems.value
  } else {
    filtered = newsItems.value.filter(item => item.type === activeTab.value)
  }
  // Show only the latest 3 news items unless showAll is true
  return props.showAll ? filtered : filtered.slice(0, 3)
})

const getTabCount = (tabValue) => {
  if (tabValue === 'all') {
    return newsItems.value.length
  }
  return newsItems.value.filter(item => item.type === tabValue).length
}

const getCategoryClass = (category) => {
  const classes = {
    general: 'category-general',
    announcement: 'category-announcement',
    event: 'category-event',
    update: 'category-update'
  }
  return classes[category] || 'category-default'
}

const getCategoryLabel = (category) => {
  const labels = {
    general: 'General',
    announcement: 'Announcement',
    event: 'Event',
    update: 'Update'
  }
  return labels[category] || 'News'
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'Just now'

  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Recently'
  }
}

const handleMediaError = (event) => {
  console.log('Media error, using default logo')
  if (defaultLogoUrl.value) {
    event.target.src = defaultLogoUrl.value
  } else {
    // Ultimate fallback - use a data URI for a simple placeholder
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCAzMEM2Mi4xNTM4IDMwIDcyIDM5Ljg0NjIgNzIgNTJDNzIgNjQuMTUzOCA2Mi4xNTM4IDc0IDUwIDc0QzM3Ljg0NjIgNzQgMjggNjQuMTUzOCAyOCA1MkMyOCAzOS44NDYyIDM3Ljg0NjIgMzAgNTAgMzBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
  }
}

const handleVideoLoadStart = (itemId) => {
  videoLoadingStates.value[itemId] = true
}

const handleVideoLoaded = (itemId) => {
  videoLoadingStates.value[itemId] = false
}

const handleVideoError = (itemId) => {
  videoLoadingStates.value[itemId] = false
  console.log('Video error for item:', itemId)
}

const handleVideoClick = (item) => {
  // Open video in dialog for better viewing
  openNewsDetail(item)
}

const openNewsDetail = (item) => {
  selectedNewsItem.value = item
  showNewsModal.value = true
  // Prevent background scrolling
  document.body.style.overflow = 'hidden'
}

const closeNewsModal = () => {
  showNewsModal.value = false
  selectedNewsItem.value = null
  // Restore background scrolling
  document.body.style.overflow = ''
}

const navigateToAllNews = () => {
  router.push('/news')
}

const handleGoBack = () => {
  emit('goBack')
}

// Watch for changes in filteredNews and emit count to parent when showAll is true
watch(filteredNews, (newValue) => {
  if (props.showAll) {
    emit('newsCountUpdate', newValue.length)
  }
}, { immediate: true })

// Watch for project store changes and refetch news
watch(() => projectStore.selectedProject?.id, async (newProjectId, oldProjectId) => {
  // Skip on initial mount (handled by onMounted)
  if (isInitialMount.value) {
    isInitialMount.value = false
    return
  }
  
  if (newProjectId && newProjectId !== oldProjectId) {
    console.log('🔄 Project changed via store, refetching news:', { from: oldProjectId, to: newProjectId })
    
    // Reset to loading state
    loading.value = true
    
    // Reset active tab to 'all' for fresh start
    activeTab.value = 'all'
    
    // Clear existing news items
    newsItems.value = []
    
    // Fetch new news
    await fetchNews()
  }
}, { immediate: false })

// Also watch the prop as a fallback
watch(() => props.projectId, async (newProjectId, oldProjectId) => {
  // Skip on initial mount (handled by onMounted)
  if (isInitialMount.value) {
    isInitialMount.value = false
    return
  }
  
  if (newProjectId && newProjectId !== oldProjectId) {
    console.log('🔄 Project changed via prop, refetching news:', { from: oldProjectId, to: newProjectId })
    
    // Reset to loading state
    loading.value = true
    
    // Reset active tab to 'all' for fresh start
    activeTab.value = 'all'
    
    // Clear existing news items
    newsItems.value = []
    
    // Fetch new news
    await fetchNews()
  }
}, { immediate: false })

const loadDefaultLogo = async () => {
  try {
    let storageInstance = storage
    
    // On native platforms, storage might be null, so we need to get it from the app
    if (!storageInstance && isNative) {
      console.log('📱 Native platform detected, getting storage instance from app')
      const { getStorage } = await import('firebase/storage')
      const { app } = await import('../boot/firebase')
      storageInstance = getStorage(app)
    }
    
    if (!storageInstance) {
      throw new Error('Firebase Storage not available')
    }
    
    const logoRef = storageRef(storageInstance, 'logo.png')
    defaultLogoUrl.value = await getDownloadURL(logoRef)
    console.log('✅ Default logo loaded from Firebase Storage:', defaultLogoUrl.value)
  } catch (error) {
    console.log('Default logo not found in Firebase Storage, using local fallback:', error.message)
    // Try multiple fallback paths
    defaultLogoUrl.value = '/default-logo.png' // Primary fallback
  }
}


const fetchNews = async () => {
  // Use project store as primary source, prop as fallback
  const projectId = projectStore.selectedProject?.id || props.projectId
  console.log('🔍 ModernNewsFeed.fetchNews called with projectId:', projectId)
  console.log('🔍 Project store selectedProject:', projectStore.selectedProject)
  console.log('🔍 Props projectId:', props.projectId)
  
  if (!projectId) {
    console.log('❌ ModernNewsFeed: No project ID available, skipping news fetch')
    return
  }

  console.log('🚀 ModernNewsFeed: Starting news fetch for project:', projectId)
  loading.value = true
  try {
    // Import news service dynamically to avoid circular imports
    const { default: newsService } = await import('../services/newsService.js')
    const news = await newsService.fetchNews(projectId, {
      publishedOnly: true,
      limit: 20,
      prioritizeFeatured: !props.showAll // Prioritize featured news on homepage only
    })

    // Transform news items to display format
    newsItems.value = news.map(item => ({
      id: item.id,
      title: item.title,
      message: item.content,
      excerpt: item.excerpt || item.content?.substring(0, 150) + '...',
      type: item.category,
      category: item.category,
      priority: 'normal',
      featured: item.featured || false,
      mediaUrl: item.mediaUrl || null,
      mediaType: item.mediaType || 'image',
      thumbnailUrl: item.thumbnailUrl || null,
      linkUrl: item.linkUrl || null,
      linkTitle: item.linkTitle || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
  } catch (error) {
    console.error('Error fetching news:', error)
    newsItems.value = []
  } finally {
    loading.value = false
  }
}

// Setup intersection observer for video lazy loading
const setupVideoLazyLoading = () => {
  if (videoIntersectionObserver.value) {
    videoIntersectionObserver.value.disconnect()
  }

  videoIntersectionObserver.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target
        
        // Only load video when it comes into view
        if (video.dataset.loaded !== 'true') {
          video.dataset.loaded = 'true'
          video.load() // Trigger video loading
        }
      }
    })
  }, {
    rootMargin: '50px 0px', // Start loading 50px before video comes into view
    threshold: 0.1
  })
}

const observeVideo = (videoElement, itemId) => {
  if (videoElement && videoIntersectionObserver.value) {
    videoElement.dataset.itemId = itemId
    videoElements.value.set(itemId, videoElement)
    videoIntersectionObserver.value.observe(videoElement)
  }
}

onMounted(async () => {
  console.log('🔍 ModernNewsFeed: onMounted called')
  console.log('🔍 Project store selectedProject on mount:', projectStore.selectedProject)
  console.log('🔍 Props projectId on mount:', props.projectId)
  
  await loadDefaultLogo()
  await fetchNews()
  setupVideoLazyLoading()
})

// Cleanup on unmount
onUnmounted(() => {
  if (videoIntersectionObserver.value) {
    videoIntersectionObserver.value.disconnect()
  }
  // Restore background scrolling in case component unmounts while modal is open
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modern-news-feed {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden; /* Prevent horizontal overflow */
}

.news-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.news-title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.news-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.2;
}

.news-count {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
}

.view-all-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.view-all-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.back-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-btn:hover {
  background: #e5e7eb;
  color: #374151;
  transform: scale(1.05);
}

.filter-section {
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
}

.filter-tab:hover {
  color: #374151;
  background: #e5e7eb;
  border-color: #d1d5db;
}

.filter-tab.active {
  background: #AF1E23;
  color: white;
  border-color: #AF1E23;
  box-shadow: 0 2px 4px rgba(255, 107, 53, 0.2);
}

.filter-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.filter-label {
  font-weight: 600;
}

.filter-count {
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
  padding: 1px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
  line-height: 1.2;
}

.filter-tab:not(.active) .filter-count {
  background: #d1d5db;
  color: #6b7280;
}

/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-skeleton {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
}

.skeleton-image {
  width: 120px;
  height: 80px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 20px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 70%;
}

.skeleton-text {
  height: 16px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 100%;
}

.skeleton-meta {
  height: 14px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  width: 40%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* News Container */
.news-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: #fafafa;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.news-card:hover {
  background: white;
  border-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.news-card.featured {
  background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
  border-color: #AF1E23;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.15);
}

.news-card.urgent {
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  border-color: #ef4444;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
}

/* Media Section */
.news-media {
  flex-shrink: 0;
  width: 200px;
  height: 120px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.news-image {
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.news-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  background: #231F20;
  /* Performance optimizations */
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.featured-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #AF1E23;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Content Section */
.news-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.news-category {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-general {
  background: #f3f4f6;
  color: #374151;
}

.category-announcement {
  background: #dbeafe;
  color: #1e40af;
}

.category-event {
  background: #dcfce7;
  color: #166534;
}

.category-update {
  background: #fef3c7;
  color: #d97706;
}

.category-default {
  background: #f3f4f6;
  color: #6b7280;
}

.news-time {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.news-headline {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.news-excerpt {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-link-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 12px 0;
  padding: 6px 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #3b82f6;
  font-weight: 500;
}

.news-link-indicator svg {
  flex-shrink: 0;
}

.news-actions {
  margin-top: auto;
  padding-top: 8px;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #AF1E23;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.read-more-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #9ca3af;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 0.95rem;
  margin: 0;
  color: #6b7280;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modern-news-feed {
    padding: 20px;
    border-radius: 16px;
  }

  .news-title {
    font-size: 1.125rem;
  }

  .news-count {
    font-size: 0.75rem;
  }

  .view-all-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }

  .filter-tab {
    padding: 6px 10px;
    font-size: 0.75rem;
  }

  .filter-icon {
    width: 12px;
    height: 12px;
  }

  .filter-count {
    font-size: 0.65rem;
    padding: 1px 4px;
  }

  .news-card {
    flex-direction: column;
    padding: 20px;
  }

  .news-media {
    width: 100%;
    height: 200px;
  }

  .news-skeleton {
    flex-direction: column;
  }

  .skeleton-image {
    width: 100%;
    height: 120px;
  }
}

/* Very narrow screens (like mobile simulation) */
@media (max-width: 480px) {
  .modern-news-feed {
    padding: 16px;
    margin: 0 -4px; /* Compensate for narrow viewport */
  }

  .news-card {
    padding: 16px;
    gap: 16px;
  }

  .news-title {
    font-size: 1.25rem;
  }

  .news-headline {
    font-size: 1.125rem;
  }

  .view-all-btn {
    padding: 6px 10px;
    font-size: 0.7rem;
  }

  .filter-tab {
    padding: 6px 8px;
    font-size: 0.7rem;
    gap: 4px;
  }

  .filter-icon {
    width: 10px;
    height: 10px;
  }

  .filter-label {
    font-size: 0.7rem;
  }

  .filter-count {
    font-size: 0.6rem;
    padding: 1px 3px;
    min-width: 14px;
  }
}

/* Modern Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 0;
  overflow: hidden; /* Prevent background scrolling */
}

.dialog-container {
  background: white;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 100%;
  width: 100%;
  max-height: 85vh;
  min-height: 50vh; /* Ensure minimum height */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: dialogSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dialogSlideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dialog Styles */
.dialog-header {
  padding: 20px 24px 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.dialog-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dialog-category {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dialog-time {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.dialog-close-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 12px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-close-btn:hover {
  background: #e2e8f0;
  color: #334155;
  transform: scale(1.05);
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.dialog-media {
  width: 100%;
  height: auto;
  min-height: 200px; /* Ensure minimum height for media */
  max-height: 300px; /* Limit maximum height */
  border-radius: 0;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0; /* Prevent shrinking when content is long */
}

.dialog-image-container,
.dialog-video-container {
  width: 100%;
  height: auto;
  min-height: 200px; /* Ensure minimum height */
  max-height: 300px; /* Limit maximum height */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  overflow: hidden;
  position: relative;
  padding: 10px;
  flex-shrink: 0; /* Prevent shrinking */
}

.dialog-image {
  width: 100%;
  height: auto;
  min-height: 200px; /* Ensure minimum height */
  max-height: 300px; /* Limit maximum height */
  object-fit: contain;
  border-radius: 0;
  background: #f8f9fa;
  flex-shrink: 0; /* Prevent shrinking */
}

.dialog-video {
  width: 100%;
  height: auto;
  min-height: 200px; /* Ensure minimum height */
  max-height: 300px; /* Limit maximum height */
  object-fit: cover;
  border-radius: 0;
  background: #231F20;
  flex-shrink: 0; /* Prevent shrinking */
  /* Performance optimizations */
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.dialog-text {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-comments {
  padding: 0 24px 24px 24px;
  border-top: 1px solid #e2e8f0;
  margin-top: 16px;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
}

/* Scrollable Dialog Content */
.dialog-content-scrollable {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Compact Comments Section */
.dialog-comments-compact {
  padding: 12px 16px 16px 16px;
  border-top: 1px solid #e2e8f0;
  margin-top: 12px;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.dialog-message {
  font-size: 1rem;
  line-height: 1.6;
  color: #475569;
  margin: 0;
}

/* External Link Section */
.dialog-link-section {
  margin: 16px 24px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.external-link {
  display: block;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.external-link:hover {
  transform: translateY(-1px);
}

.link-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.link-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: #AF1E23;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.link-text {
  flex: 1;
  min-width: 0;
}

.link-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  line-height: 1.4;
}

.link-url {
  font-size: 0.8rem;
  color: #64748b;
  word-break: break-all;
  line-height: 1.3;
}

.link-arrow {
  flex-shrink: 0;
  color: #64748b;
  transition: transform 0.2s ease;
}

.external-link:hover .link-arrow {
  transform: translate(2px, -2px);
}

.dialog-actions {
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}

.dialog-action-btn {
  width: 100%;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 16px;
  padding: 14px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.dialog-action-btn:hover {
  background: #AF1E23;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
}

.dialog-action-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

/* Dialog Transitions */
.dialog-slide-enter-active,
.dialog-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-slide-enter-from,
.dialog-slide-leave-to {
  opacity: 0;
}

.dialog-slide-enter-from .dialog-container,
.dialog-slide-leave-to .dialog-container {
  transform: translateY(100%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-category {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-time {
  font-size: 0.875rem;
  color: #9ca3af;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.modal-media {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image-container {
  width: 100%;
  max-width: 500px;
  max-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.modal-image {
  width: 100%;
  height: 100%;
  max-width: 500px;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
}

.modal-video-container {
  width: 100%;
  max-width: 500px;
  max-height: 300px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.modal-video {
  width: 100%;
  height: 100%;
  max-width: 500px;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
}

.modal-content-section {
  padding: 32px;
}

.modal-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.modal-content-text {
  font-size: 1.125rem;
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
  text-align: justify;
}

.modal-content-text h1,
.modal-content-text h2,
.modal-content-text h3,
.modal-content-text h4,
.modal-content-text h5,
.modal-content-text h6 {
  color: #1a1a1a;
  font-weight: 700;
  margin: 24px 0 16px 0;
}

.modal-content-text p {
  margin: 0 0 16px 0;
}

.modal-content-text ul,
.modal-content-text ol {
  margin: 16px 0;
  padding-left: 24px;
}

.modal-content-text li {
  margin: 8px 0;
}

.modal-footer {
  padding: 16px 32px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

.close-modal-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-modal-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive Modal */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-content {
    border-radius: 20px;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px 24px 16px;
  }
  
  .modal-media {
    max-height: 250px;
  }
  
  .modal-image-container,
  .modal-video-container {
    max-width: 100%;
    max-height: 250px;
  }
  
  .modal-image,
  .modal-video {
    max-width: 100%;
    max-height: 250px;
  }
  
  .modal-content-section {
    padding: 24px;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
  
  .modal-content-text {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 12px;
  }
  
  .modal-content {
    border-radius: 16px;
  }
  
  .modal-header {
    padding: 16px 20px 12px;
  }
  
  .modal-media {
    max-height: 200px;
  }
  
  .modal-image-container,
  .modal-video-container {
    max-width: 100%;
    max-height: 200px;
  }
  
  .modal-image,
  .modal-video {
    max-width: 100%;
    max-height: 200px;
  }
  
  .modal-content-section {
    padding: 20px;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .modal-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

/* Responsive Dialog */
@media (max-width: 768px) {
  .dialog-container {
    border-radius: 20px 20px 0 0;
    overflow-y: auto;
  }
  
  .dialog-header {
    padding: 18px 20px 14px 20px;
  }
  
  .dialog-text {
    padding: 20px;
    gap: 14px;
  }
  
  .dialog-comments {
    padding: 0 20px 20px 20px;
    background: #f8fafc;
    border-radius: 0 0 12px 12px;
  }
  
  .dialog-title {
    font-size: 1.375rem;
  }
  
  .dialog-message {
    font-size: 0.9rem;
  }
  
  .dialog-link-section {
    margin: 14px 20px;
    padding: 14px;
  }
  
  .link-content {
    gap: 10px;
  }
  
  .link-icon {
    width: 36px;
    height: 36px;
  }
  
  .link-title {
    font-size: 0.9rem;
  }
  
  .link-url {
    font-size: 0.75rem;
  }
  
  .dialog-actions {
    padding: 14px 20px 20px 20px;
  }
  
  .dialog-action-btn {
    padding: 12px 18px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .dialog-container {
    border-radius: 16px 16px 0 0;
    max-height: 95vh;
  }
  
  .dialog-header {
    padding: 16px 18px 12px 18px;
  }
  
  .dialog-text {
    padding: 18px;
    gap: 12px;
  }
  
  .dialog-comments {
    padding: 0 18px 18px 18px;
    background: #f8fafc;
    border-radius: 0 0 12px 12px;
  }
  
  .dialog-title {
    font-size: 1.25rem;
  }
  
  .dialog-message {
    font-size: 0.85rem;
  }
  
  .dialog-link-section {
    margin: 12px 18px;
    padding: 12px;
  }
  
  .link-content {
    gap: 8px;
  }
  
  .link-icon {
    width: 32px;
    height: 32px;
  }
  
  .link-title {
    font-size: 0.85rem;
  }
  
  .link-url {
    font-size: 0.7rem;
  }
  
  .dialog-actions {
    padding: 12px 18px 18px 18px;
  }
  
  .dialog-action-btn {
    padding: 12px 16px;
    font-size: 0.85rem;
  }
}

/* Desktop Dialog (larger screens) */
@media (min-width: 1024px) {
  .dialog-overlay {
    align-items: center;
    padding: 20px;
  }
  
  .dialog-container {
    border-radius: 24px;
    max-width: 600px;
    max-height: 80vh;
  }
  
  .dialog-media {
    max-height: 400px;
    border-radius: 16px;
    margin: 24px 24px 0 24px;
  }
  
  .dialog-image-container,
  .dialog-video-container {
    border-radius: 16px;
    height: auto;
    max-height: 400px;
    padding: 10px;
  }
  
  .dialog-image {
    border-radius: 16px;
    height: auto;
    max-height: 400px;
    object-fit: contain;
  }
  
  .dialog-video {
    border-radius: 16px;
    height: auto;
    max-height: 400px;
    object-fit: cover;
  }
  
  .dialog-text {
    padding: 24px;
  }
  
  .dialog-actions {
    padding: 16px 24px 24px 24px;
  }
}

</style>

