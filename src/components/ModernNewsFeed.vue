<template>
  <div class="modern-news-feed">
    <!-- Header -->
    <div class="news-header">
      <h2 class="news-title">Latest News</h2>
      <div class="filter-tabs">
        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
          :class="['filter-tab', { active: activeTab === tab.value }]">
          {{ tab.label }}
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
            <video :src="item.mediaUrl" :poster="item.thumbnailUrl" controls class="news-video"
              @error="handleMediaError">
              Your browser does not support the video tag.
            </video>
            <div class="play-overlay">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import { useProjectStore } from '../stores/projectStore'
import { getDownloadURL, ref as storageRef } from 'firebase/storage'
import { storage } from '../boot/firebase'

// Component name for ESLint
defineOptions({
  name: 'ModernNewsFeed'
})

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

// const projectStore = useProjectStore()
const loading = ref(false)
const newsItems = ref([])
const activeTab = ref('all')
const defaultLogoUrl = ref('')

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'General', value: 'general' },
  { label: 'Announcements', value: 'announcement' },
  { label: 'Events', value: 'event' },
  { label: 'Updates', value: 'update' }
]

const filteredNews = computed(() => {
  if (activeTab.value === 'all') {
    return newsItems.value
  }
  return newsItems.value.filter(item => item.type === activeTab.value)
})

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
  event.target.src = defaultLogoUrl.value
}

const openNewsDetail = (item) => {
  // For now, just log. You can implement a modal or navigation here
  console.log('Opening news detail:', item)
}

const loadDefaultLogo = async () => {
  try {
    const logoRef = storageRef(storage, 'logo.png')
    defaultLogoUrl.value = await getDownloadURL(logoRef)
  } catch {
    console.log('Default logo not found, will use placeholder')
    defaultLogoUrl.value = '/default-logo.png' // Fallback
  }
}

const fetchNews = async () => {
  if (!props.projectId) return

  loading.value = true
  try {
    // Import news service dynamically to avoid circular imports
    const { default: newsService } = await import('../services/newsService.js')
    const news = await newsService.fetchNews(props.projectId, {
      publishedOnly: true,
      limit: 20
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

onMounted(async () => {
  await loadDefaultLogo()
  await fetchNews()
})
</script>

<style scoped>
.modern-news-feed {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.news-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.02em;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 12px;
}

.filter-tab {
  background: none;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  color: #374151;
  background: rgba(255, 255, 255, 0.5);
}

.filter-tab.active {
  background: #ff6b35;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
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
}

.news-card:hover {
  background: white;
  border-color: #e0e0e0;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.news-card.featured {
  background: linear-gradient(135deg, #fff5f2 0%, #ffffff 100%);
  border-color: #ff6b35;
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

.featured-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff6b35;
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
  background: #ff6b35;
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
  background: #e55a2b;
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

  .news-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-tabs {
    width: 100%;
    justify-content: space-between;
  }

  .filter-tab {
    flex: 1;
    text-align: center;
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

@media (max-width: 480px) {
  .modern-news-feed {
    padding: 16px;
  }

  .news-card {
    padding: 16px;
  }

  .news-title {
    font-size: 1.25rem;
  }

  .news-headline {
    font-size: 1.125rem;
  }
}
</style>
