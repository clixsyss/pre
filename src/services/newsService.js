import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../boot/firebase'

class NewsService {
  /**
   * Fetch news items for a specific project
   * @param {string} projectId - The project ID
   * @param {Object} options - Query options
   * @param {boolean} options.publishedOnly - Only fetch published news
   * @param {string} options.category - Filter by category
   * @param {number} options.limit - Limit the number of results
   * @param {boolean} options.prioritizeFeatured - Prioritize featured news (for homepage)
   * @returns {Promise<Array>} Array of news items
   */
  async fetchNews(projectId, options = {}) {
    console.log('🔍 NewsService.fetchNews called with:', { projectId, options })
    
    const {
      publishedOnly = true,
      category = null,
      limit = null,
      prioritizeFeatured = false
    } = options

    try {
      const collectionPath = `projects/${projectId}/news`
      console.log('📂 Collection path:', collectionPath)
      
      let q = query(
        collection(db, collectionPath)
      )

      if (publishedOnly) {
        q = query(q, where('isPublished', '==', true))
      }

      if (category) {
        q = query(q, where('category', '==', category))
      }

      // Order by creation date (newest first)
      try {
        q = query(q, orderBy('createdAt', 'desc'))
      } catch (orderByError) {
        console.log('⚠️ OrderBy failed, trying without it:', orderByError)
        // Continue without orderBy
      }

      console.log('🔄 Executing Firestore query...')
      const querySnapshot = await getDocs(q)
      console.log('📊 Query snapshot size:', querySnapshot.size)
      
      const newsItems = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log('📄 Processing document:', doc.id, data)
        newsItems.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          publishedAt: data.publishedAt
        })
      })

      console.log('✅ Final news items array:', newsItems)

      // If prioritizing featured news (for homepage), sort featured items first
      if (prioritizeFeatured) {
        newsItems.sort((a, b) => {
          // Featured items first, then by creation date
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          
          // If both are featured or both are not featured, sort by date
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB - dateA
        })
      }

      // Apply limit if specified
      if (limit && newsItems.length > limit) {
        return newsItems.slice(0, limit)
      }

      return newsItems
    } catch (error) {
      console.error('❌ Error fetching news:', error)
      throw new Error('Failed to fetch news items')
    }
  }

  /**
   * Create a new news item
   * @param {string} projectId - The project ID
   * @param {Object} newsData - News item data
   * @returns {Promise<string>} News item ID
   */
  async createNews(projectId, newsData) {
    try {
      const newsItem = {
        title: newsData.title,
        content: newsData.content,
        excerpt: newsData.excerpt || newsData.content.substring(0, 150) + '...',
        category: newsData.category || 'general',
        featured: newsData.featured || false,
        isPublished: newsData.isPublished || false,
        mediaUrl: newsData.mediaUrl || null,
        mediaType: newsData.mediaType || 'image',
        mediaFileName: newsData.mediaFileName || null,
        authorId: newsData.authorId,
        authorName: newsData.authorName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: newsData.isPublished ? serverTimestamp() : null
      }

      const docRef = await addDoc(collection(db, `projects/${projectId}/news`), newsItem)
      console.log('✅ News item created with ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('❌ Error creating news item:', error)
      throw new Error('Failed to create news item')
    }
  }

  /**
   * Update a news item
   * @param {string} projectId - The project ID
   * @param {string} newsId - The news item ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<void>}
   */
  async updateNews(projectId, newsId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      // If publishing for the first time, set publishedAt
      if (updates.isPublished && !updates.publishedAt) {
        updateData.publishedAt = serverTimestamp()
      }

      await updateDoc(doc(db, `projects/${projectId}/news`, newsId), updateData)
      console.log('✅ News item updated:', newsId)
    } catch (error) {
      console.error('❌ Error updating news item:', error)
      throw new Error('Failed to update news item')
    }
  }

  /**
   * Delete a news item
   * @param {string} projectId - The project ID
   * @param {string} newsId - The news item ID
   * @returns {Promise<void>}
   */
  async deleteNews(projectId, newsId) {
    try {
      await deleteDoc(doc(db, `projects/${projectId}/news`, newsId))
      console.log('✅ News item deleted:', newsId)
    } catch (error) {
      console.error('❌ Error deleting news item:', error)
      throw new Error('Failed to delete news item')
    }
  }

  /**
   * Get a single news item by ID
   * @param {string} projectId - The project ID
   * @param {string} newsId - The news item ID
   * @returns {Promise<Object>} News item object
   */
  async getNewsItem(projectId, newsId) {
    try {
      const docRef = doc(db, `projects/${projectId}/news`, newsId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          publishedAt: data.publishedAt
        }
      } else {
        throw new Error('News item not found')
      }
    } catch (error) {
      console.error('Error getting news item:', error)
      throw new Error('Failed to get news item')
    }
  }

  /**
   * Toggle news item visibility (publish/unpublish)
   * @param {string} projectId - The project ID
   * @param {string} newsId - The news item ID
   * @param {boolean} isPublished - Published status
   * @returns {Promise<void>}
   */
  async toggleVisibility(projectId, newsId, isPublished) {
    try {
      const updateData = {
        isPublished,
        updatedAt: serverTimestamp()
      }

      if (isPublished) {
        updateData.publishedAt = serverTimestamp()
      }

      await updateDoc(doc(db, `projects/${projectId}/news`, newsId), updateData)
      console.log('✅ News visibility toggled:', newsId, isPublished)
    } catch (error) {
      console.error('❌ Error toggling news visibility:', error)
      throw new Error('Failed to toggle news visibility')
    }
  }

  /**
   * Get news statistics for a project
   * @param {string} projectId - The project ID
   * @returns {Promise<Object>} Statistics object
   */
  async getNewsStats(projectId) {
    try {
      const allNews = await this.fetchNews(projectId, { publishedOnly: false })
      
      const stats = {
        total: allNews.length,
        published: allNews.filter(n => n.isPublished).length,
        draft: allNews.filter(n => !n.isPublished).length,
        featured: allNews.filter(n => n.featured && n.isPublished).length,
        byCategory: {
          general: allNews.filter(n => n.category === 'general' && n.isPublished).length,
          announcement: allNews.filter(n => n.category === 'announcement' && n.isPublished).length,
          event: allNews.filter(n => n.category === 'event' && n.isPublished).length,
          update: allNews.filter(n => n.category === 'update' && n.isPublished).length
        }
      }

      return stats
    } catch (error) {
      console.error('Error getting news stats:', error)
      throw new Error('Failed to get news statistics')
    }
  }

  /**
   * Format news date for display
   * @param {Object} date - Firestore timestamp or Date object
   * @returns {string} Formatted date string
   */
  formatNewsDate(date) {
    if (!date) return 'Unknown date'
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date)
      const now = new Date()
      const diffInHours = (now - dateObj) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        return 'Just now'
      } else if (diffInHours < 24) {
        const hours = Math.floor(diffInHours)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`
      } else if (diffInHours < 48) {
        return 'Yesterday'
      } else {
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    } catch {
      return 'Invalid date'
    }
  }

  /**
   * Get category label
   * @param {string} category - News category
   * @returns {string} Human-readable label
   */
  getCategoryLabel(category) {
    const labels = {
      general: 'General',
      announcement: 'Announcement',
      event: 'Event',
      update: 'Update'
    }
    return labels[category] || category
  }

  /**
   * Truncate news content
   * @param {string} content - The content to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated content
   */
  truncateContent(content, maxLength = 150) {
    if (!content) return ''
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
  }
}

export default new NewsService()
