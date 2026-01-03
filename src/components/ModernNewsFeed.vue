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
        <div v-if="showAll" class="news-count">{{ filteredNews.length }} {{ filteredNews.length === 1 ? $t('item') : $t('items') }}</div>
      </div>
      <button v-if="!showAll" @click="navigateToAllNews" class="view-all-btn">
        <span>{{ $t('viewAllNews') }}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>


    <!-- Filter Tabs -->
    <!-- <div v-if="showAll" class="filter-section">
      <div class="filter-tabs">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['filter-tab', { active: activeTab === tab.value }]">
          <span class="filter-icon" v-if="tab.iconSvg" v-html="tab.iconSvg"></span>
          <span class="filter-label">{{ tab.label }}</span>
          <span v-if="getTabCount(tab.value) > 0" class="filter-count">{{ getTabCount(tab.value) }}</span>
        </button>
      </div>
    </div> -->

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
        :class="{ 'featured': item.featured, 'urgent': item.priority === 'urgent' }"
        @click="openNewsDetail(item)">
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
              @click.stop="handleVideoClick(item)">
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
            <span class="news-category" :style="getCategoryStyle(item.category)">
              {{ getCategoryLabel(item.category) }}
            </span>
            <span class="news-time">{{ formatTime(item.createdAt) }}</span>
          </div>

          <h3 class="news-headline">{{ item.title }}</h3>
          <p class="news-excerpt">{{ item.excerpt || item.message }}</p>

          <div class="news-actions">
            <button class="read-more-btn" @click.stop="openNewsDetail(item)">
              {{ $t('readMore') }}
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
      <h3>{{ $t('noNewsYet') }}</h3>
      <p>{{ $t('checkBackLater') }}</p>
    </div>

    <!-- News Modal - Matching MyBookings Design -->
    <div v-if="showNewsModal && selectedNewsItem" class="modal-overlay" @click="closeNewsModal">
      <div class="modal-content" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <h2>{{ selectedNewsItem.title }}</h2>
          <button class="close-btn" @click="closeNewsModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Meta Information -->
          <div class="detail-section">
            <div class="news-meta-info">
              <span class="news-category-badge" :style="getCategoryStyle(selectedNewsItem.category)">
                {{ getCategoryLabel(selectedNewsItem.category) }}
              </span>
              <span class="news-time-badge">{{ formatTime(selectedNewsItem.createdAt) }}</span>
            </div>
          </div>

          <!-- Media Section -->
          <div v-if="selectedNewsItem.mediaUrl || selectedNewsItem.mediaType" class="detail-section media-section">
            <div v-if="selectedNewsItem.mediaType === 'video'" class="media-container">
              <video 
                :src="selectedNewsItem.mediaUrl" 
                :poster="selectedNewsItem.thumbnailUrl" 
                controls 
                class="news-video"
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
            <div v-else class="media-container">
              <img :src="selectedNewsItem.mediaUrl || defaultLogoUrl" :alt="selectedNewsItem.title" class="news-image" 
                @error="handleMediaError" loading="lazy" />
            </div>
          </div>

          <!-- Content Section -->
          <div class="detail-section">
            <h3>News Content</h3>
            <div class="news-content-text" v-html="selectedNewsItem.message || selectedNewsItem.content"></div>
          </div>

          <!-- External Link Section -->
          <div v-if="selectedNewsItem.linkUrl && selectedNewsItem.linkUrl.trim() !== ''" class="detail-section">
            <h3>Related Link</h3>
            <a :href="selectedNewsItem.linkUrl" target="_blank" rel="noopener noreferrer" class="external-link-card">
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
            </a>
          </div>

          <!-- Comments Section -->
          <div v-if="selectedNewsItem.interactionsEnabled" class="detail-section">
            <h3>Comments & Reactions</h3>
            <NewsComments :news-id="selectedNewsItem.id" :interactions-enabled="selectedNewsItem.interactionsEnabled" />
          </div>
          <div v-else class="detail-section">
            <div class="interactions-disabled">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p>Interactions are disabled for this news item</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="close-modal-btn" @click="closeNewsModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '../stores/projectStore'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'
import { getStorage } from 'firebase/storage'
import { smartMirrorApp, detectPlatformFromUrl } from '../boot/smartMirrorFirebase'
const storage = getStorage(smartMirrorApp)
const { isNative } = detectPlatformFromUrl()
import NewsComments from './NewsComments.vue'
import { useModalState } from '../composables/useModalState'
import newsService from '../services/newsService'

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
const { openModal, closeModal } = useModalState()
const loading = ref(false)
const newsItems = ref([])
const activeTab = ref('all')
const defaultLogoUrl = ref('')
const showNewsModal = ref(false)
const selectedNewsItem = ref(null)
const videoLoadingStates = ref({})
const videoIntersectionObserver = ref(null)
const videoElements = ref(new Map())
const newsCategories = ref([])
const categoriesLoading = ref(false)
const isInitialMount = ref(true)

// const tabs = [
//   { 
//     label: 'All', 
//     value: 'all', 
//     icon: 'svg',
//     iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
//     </svg>`
//   },
//   { 
//     label: 'General', 
//     value: 'general', 
//     icon: 'svg',
//     iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
//       <path d="M19.4 15A1.65 1.65 0 0 0 21 13.4A1.65 1.65 0 0 0 19.4 12A1.65 1.65 0 0 0 18 13.4A1.65 1.65 0 0 0 19.4 15Z" stroke="currentColor" stroke-width="2"/>
//       <path d="M4.6 9A1.65 1.65 0 0 1 6 7.4A1.65 1.65 0 0 1 4.6 6A1.65 1.65 0 0 1 3 7.4A1.65 1.65 0 0 1 4.6 9Z" stroke="currentColor" stroke-width="2"/>
//     </svg>`
//   },
//   { 
//     label: 'Announcements', 
//     value: 'announcement', 
//     icon: 'svg',
//     iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path d="M18 8A6 6 0 0 0 6 8C6 7 6 5 6 3A2 2 0 0 1 8 1H16A2 2 0 0 1 18 3C18 5 18 7 18 8Z" stroke="currentColor" stroke-width="2"/>
//       <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
//     </svg>`
//   },
//   { 
//     label: 'Events', 
//     value: 'event', 
//     icon: 'svg',
//     iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
//       <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
//       <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
//       <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
//     </svg>`
//   },
//   { 
//     label: 'Updates', 
//     value: 'update', 
//     icon: 'svg',
//     iconSvg: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2"/>
//       <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2"/>
//     </svg>`
//   }
// ]

const filteredNews = computed(() => {
  let filtered = []
  if (activeTab.value === 'all') {
    filtered = newsItems.value
  } else {
    filtered = newsItems.value.filter(item => item.type === activeTab.value)
  }
  
  // For homepage (showAll = false), show latest 3 news items with featured priority
  if (!props.showAll) {
    // Sort by featured status first, then by date (createdAt → publishedAt → updatedAt)
    const coerceDate = (val) => {
      if (!val) return null
      if (val.toDate && typeof val.toDate === 'function') return val.toDate()
      if (typeof val === 'object' && typeof val.seconds === 'number') return new Date(val.seconds * 1000)
      const d = new Date(val)
      return isNaN(d.getTime()) ? null : d
    }

    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1

      const aDate = coerceDate(a.createdAt) || coerceDate(a.publishedAt) || coerceDate(a.updatedAt) || new Date(0)
      const bDate = coerceDate(b.createdAt) || coerceDate(b.publishedAt) || coerceDate(b.updatedAt) || new Date(0)
      return bDate - aDate
    })

    // Take only the latest 3
    return filtered.slice(0, 3)
  }
  
  // For All News listing, also sort by createdAt → publishedAt → updatedAt to ensure stable order
  const coerceDate = (val) => {
    if (!val) return null
    if (val.toDate && typeof val.toDate === 'function') return val.toDate()
    if (typeof val === 'object' && typeof val.seconds === 'number') return new Date(val.seconds * 1000)
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
  }
  return filtered.slice().sort((a, b) => {
    const aDate = coerceDate(a.createdAt) || coerceDate(a.publishedAt) || coerceDate(a.updatedAt) || new Date(0)
    const bDate = coerceDate(b.createdAt) || coerceDate(b.publishedAt) || coerceDate(b.updatedAt) || new Date(0)
    return bDate - aDate
  })
})

// const getTabCount = (tabValue) => {
//   if (tabValue === 'all') {
//     return newsItems.value.length
//   }
//   return newsItems.value.filter(item => item.type === tabValue).length
// }

const fetchNewsCategories = async () => {
  if (!props.projectId && !projectStore.selectedProject?.id) return;
  
  const projectId = props.projectId || projectStore.selectedProject?.id;
  
  try {
    categoriesLoading.value = true;
    console.log('📡 Fetching news categories...');
    
    const categories = await newsService.fetchNewsCategories(projectId);
    newsCategories.value = categories;
    
    console.log('✅ News categories fetched:', categories.length);
  } catch (err) {
    console.error('❌ Error fetching news categories:', err);
    newsCategories.value = [];
  } finally {
    categoriesLoading.value = false;
  }
}

const getCategoryStyle = (catId) => {
  const category = newsCategories.value.find(c => c.id === catId);
  if (!category) return {};
  
  const color = category.color || '#6B7280';
  return {
    backgroundColor: `${color}20`,
    color: color,
    borderColor: `${color}80`,
    border: `1.5px solid`
  };
}

const getCategoryLabel = (catId) => {
  const category = newsCategories.value.find(c => c.id === catId);
  return category ? `${category.icon} ${category.name}` : 'News';
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'Recently'

  try {
    // Normalize input to a valid Date for all environments (including iOS Safari)
    const normalizeToDate = (ts) => {
      if (!ts) return null
      // Firestore Timestamp instance
      if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate()
      // Firestore-like object { seconds, nanoseconds }
      if (typeof ts === 'object' && typeof ts.seconds === 'number') return new Date(ts.seconds * 1000)
      // Date instance
      if (ts instanceof Date) return ts
      // Milliseconds since epoch
      if (typeof ts === 'number') return new Date(ts)
      // String parsing with iOS-safe normalization
      if (typeof ts === 'string') {
        // Try native parse first
        const firstPass = new Date(ts)
        if (!isNaN(firstPass.getTime())) return firstPass

        // Attempt to normalize formats like: "October 5, 2025 at 11:59:46 AM UTC+3"
        let s = ts
        s = s.replace(' at ', ' ')
        s = s.replace('UTC+', '+').replace('UTC-', '-')
        // If timezone has no colon (e.g. +3), make it +03:00
        s = s.replace(/([+-])(\d{1,2})(?!:)/, (m, sign, hh) => `${sign}${hh.padStart(2, '0')}:00`)
        const secondPass = new Date(s)
        if (!isNaN(secondPass.getTime())) return secondPass
        return null
      }
      return null
    }

    const date = normalizeToDate(timestamp)
    if (!date || isNaN(date.getTime())) return 'Recently'

    const now = new Date()
    let diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    // Clamp obvious future dates (clock skew or tz issues) to treat as past
    if (diffInSeconds < 0) diffInSeconds = Math.abs(diffInSeconds)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800)
      return `${weeks}w ago`
    }

    const nowYear = now.getFullYear()
    const nowMonth = now.getMonth()
    const dateYear = date.getFullYear()
    const dateMonth = date.getMonth()
    const monthDiff = (nowYear - dateYear) * 12 + (nowMonth - dateMonth)

    if (monthDiff === 1) return '1 month ago'
    if (monthDiff < 12) return `${monthDiff} months ago`
    if (monthDiff < 24) return '1 year ago'
    const years = Math.floor(monthDiff / 12)
    return years === 1 ? '1 year ago' : `${years} years ago`
  } catch (error) {
    console.warn('Error formatting date:', error, 'Timestamp:', timestamp)
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
  console.log('📰 openNewsDetail called with item:', item?.title)
  console.log('📰 Item data:', item)
  
  selectedNewsItem.value = item
  showNewsModal.value = true
  
  // Use the modal state composable to properly manage navbar visibility
  openModal()
  
  console.log('📰 Modal state updated:', { 
    showNewsModal: showNewsModal.value, 
    hasItem: !!selectedNewsItem.value,
    itemTitle: selectedNewsItem.value?.title 
  })
}

const closeNewsModal = () => {
  showNewsModal.value = false
  selectedNewsItem.value = null
  
  // Use the modal state composable to properly restore navbar visibility
  closeModal()
  
  // Use nextTick to ensure modal state is updated before restoring any manual styles
  nextTick(() => {
    // Remove any manual style overrides to let CSS take control
    const header = document.querySelector('.app-header')
    const bottomNav = document.querySelector('.bottom-navigation')
    const qHeader = document.querySelector('.q-header')
    const qFooter = document.querySelector('.q-footer')
    const qDrawer = document.querySelector('.q-drawer')
    
    if (header) header.style.display = ''
    if (bottomNav) bottomNav.style.display = ''
    if (qHeader) qHeader.style.display = ''
    if (qFooter) qFooter.style.display = ''
    if (qDrawer) qDrawer.style.display = ''
  })
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
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Logo loading timeout')), 5000) // 5 second timeout
    })
    
    const logoLoadPromise = (async () => {
      let storageInstance = storage
      
      // On native platforms, storage might be null, so we need to get it from the app
      if (!storageInstance && isNative) {
        console.log('📱 Native platform detected, getting storage instance from app')
        const { getStorage } = await import('firebase/storage')
        const { smartMirrorApp } = await import('../boot/smartMirrorFirebase')
        storageInstance = getStorage(smartMirrorApp)
      }
      
      if (!storageInstance) {
        throw new Error('Firebase Storage not available')
      }
      
      const logoRef = storageRef(storageInstance, 'logo.png')
      return await getDownloadURL(logoRef)
    })()
    
    const logoUrl = await Promise.race([logoLoadPromise, timeoutPromise])
    defaultLogoUrl.value = logoUrl
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
    console.log('📦 ModernNewsFeed: Importing news service...')
    // Import news service dynamically to avoid circular imports
    const { default: newsService } = await import('../services/newsService.js')
    console.log('✅ ModernNewsFeed: News service imported successfully')
    
    console.log('🚀 ModernNewsFeed: Calling newsService.fetchNews...')
    const news = await newsService.fetchNews(projectId, {
      publishedOnly: true,
      limit: 20,
      prioritizeFeatured: !props.showAll // Prioritize featured news on homepage only
    })
    console.log('✅ ModernNewsFeed: News service returned:', news?.length || 0, 'items')

    // Transform news items to display format
    newsItems.value = news.map(item => {
      // Prefer createdAt, then publishedAt, then updatedAt for display; no fallback to now
      const displayCreatedAt = item.createdAt || item.publishedAt || item.updatedAt || null
      
      return {
        id: item.id,
        title: item.title,
        message: item.content,
        excerpt: item.excerpt || item.content?.substring(0, 150) + '...',
        type: item.category,
        category: item.category,
        priority: 'normal',
        featured: item.featured || false,
        interactionsEnabled: item.interactionsEnabled !== false, // Default to true if undefined
        mediaUrl: item.mediaUrl || null,
        mediaType: item.mediaType || 'image',
        thumbnailUrl: item.thumbnailUrl || null,
        linkUrl: item.linkUrl || null,
        linkTitle: item.linkTitle || null,
        createdAt: displayCreatedAt,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt
      }
    })
  } catch (error) {
    console.error('❌ ModernNewsFeed: Error fetching news:', error)
    console.error('❌ ModernNewsFeed: Error details:', {
      message: error.message,
      stack: error.stack,
      projectId: projectId
    })
    newsItems.value = []
  } finally {
    loading.value = false
    console.log('🏁 ModernNewsFeed: News fetch completed, loading set to false')
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
  
  // Load logo in background without blocking news fetch
  loadDefaultLogo().catch(error => {
    console.log('Logo loading failed, continuing with news fetch:', error.message)
  })
  
  // Fetch categories first
  await fetchNewsCategories()
  
  // Fetch news immediately
  await fetchNews()
  setupVideoLazyLoading()
})

// Cleanup on unmount
onUnmounted(() => {
  if (videoIntersectionObserver.value) {
    videoIntersectionObserver.value.disconnect()
  }
  
  // Restore body styles in case component unmounts while modal is open
  document.body.style.overflow = ''
  
  // Restore app header and navigation visibility
  const header = document.querySelector('.app-header')
  const bottomNav = document.querySelector('.bottom-navigation')
  const qHeader = document.querySelector('.q-header')
  const qFooter = document.querySelector('.q-footer')
  const qDrawer = document.querySelector('.q-drawer')
  
  if (header) header.style.display = ''
  if (bottomNav) bottomNav.style.display = ''
  if (qHeader) qHeader.style.display = ''
  if (qFooter) qFooter.style.display = ''
  if (qDrawer) qDrawer.style.display = ''
})
</script>

<style scoped>
/* ===== BASE STYLES ===== */
.modern-news-feed {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  width: 100%;
  box-sizing: border-box;
}

/* ===== HEADER ===== */
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

.back-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
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
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== LOADING SKELETON ===== */
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
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ===== NEWS CARDS ===== */
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
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.news-card:active {
  transform: scale(0.98);
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.news-media {
  flex-shrink: 0;
  width: 200px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.image-container,
.video-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-image,
.news-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.play-overlay,
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
  box-shadow: 0 2px 8px rgba(175, 30, 35, 0.3);
}

/* ===== EMPTY STATE ===== */
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

/* ===== NEWS MODAL - Matching MyBookings Design ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999999;
  padding: 20px;
  /* iOS Safari fixes */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 20px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #231F20;
  margin: 0;
  line-height: 1.3;
}

.close-btn {
  background: #f5f5f5;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  padding-bottom: 12px;
  /* iOS smooth scrolling */
  -webkit-overflow-scrolling: touch;
}

.detail-section {
  margin-bottom: 28px;
}

.detail-section:last-child {
  margin-bottom: 12px;
}

.detail-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #231F20;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

/* News Meta Info */
.news-meta-info {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.news-category-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.news-time-badge {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

/* Media Section */
.media-section {
  margin-bottom: 24px;
}

.media-container {
  width: 100%;
  max-height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.news-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  display: block;
}

.news-video {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  background: #231F20;
  display: block;
}

.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Content Text */
.news-content-text {
  color: #475569;
  font-size: 1rem;
  line-height: 1.7;
}

/* External Link Card */
.external-link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.external-link-card:active {
  background: #f1f5f9;
  transform: scale(0.98);
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
}

/* Interactions Disabled */
.interactions-disabled {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  text-align: center;
}

.interactions-disabled svg {
  color: #94a3b8;
  opacity: 0.7;
}

.interactions-disabled p {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  position: sticky;
  bottom: 0;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.close-modal-btn {
  flex: 1;
  background: #AF1E23;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto;
  touch-action: manipulation;
}

.close-modal-btn:active {
  background: #8f1820;
  transform: scale(0.98);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .modern-news-feed {
    padding: 20px;
    border-radius: 16px;
  }

  .news-card {
    flex-direction: column;
    padding: 20px;
  }

  .news-media {
    width: 100%;
    height: 150px;
  }

  .modal-content {
    max-height: calc(100vh - 80px);
  }
}

@media (max-width: 480px) {
  .modern-news-feed {
    padding: 16px;
  }

  .news-card {
    padding: 16px;
    gap: 16px;
  }

  .modal-overlay {
    padding: 12px;
  }
  
  .modal-content {
    max-height: calc(100vh - 80px);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
}
</style>
