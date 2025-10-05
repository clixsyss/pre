import firestoreService from './firestoreService'
import fastCollectionService from './fastCollectionService'
import cacheService from './cacheService'

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
      prioritizeFeatured = false,
      forceRefresh = false
    } = options

    try {
      console.log('🚀 NewsService: Getting news from fast collection service...')
      
      // If forceRefresh is true, bypass cache
      const newsItems = await fastCollectionService.getNews(projectId, options, !forceRefresh)
      
      let filteredNews = newsItems

      // Apply filters
      if (publishedOnly) {
        filteredNews = filteredNews.filter(news => news.isPublished)
      }

      if (category) {
        filteredNews = filteredNews.filter(news => news.category === category)
      }

      // If prioritizing featured news (for homepage), sort featured items first
      if (prioritizeFeatured) {
        filteredNews.sort((a, b) => {
          // Featured items first, then by creation date
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          
          // If both are featured or both are not featured, sort by date
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB - dateA
        })
      } else {
        // Sort by creation date (newest first)
        filteredNews.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
          return dateB - dateA
        })
      }

      // Apply limit if specified
      if (limit && filteredNews.length > limit) {
        filteredNews = filteredNews.slice(0, limit)
      }

      console.log('🚀 NewsService: Retrieved news items:', filteredNews.length)
      console.log('🚀 NewsService: Filtered news items:', filteredNews.length)
      
      // If we got 0 items and this wasn't a forced refresh, log a warning
      if (filteredNews.length === 0 && !forceRefresh) {
        console.warn('🚀 NewsService: No news items found. Consider checking Firebase database or using forceRefresh option.')
      }
      
      return filteredNews
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
        interactionsEnabled: newsData.interactionsEnabled !== false, // Default to true if undefined
        mediaUrl: newsData.mediaUrl || null,
        mediaType: newsData.mediaType || 'image',
        mediaFileName: newsData.mediaFileName || null,
        authorId: newsData.authorId,
        authorName: newsData.authorName,
        createdAt: firestoreService.serverTimestamp(),
        updatedAt: firestoreService.serverTimestamp(),
        publishedAt: newsData.isPublished ? firestoreService.serverTimestamp() : null
      }

      const docRef = await firestoreService.addDoc(`projects/${projectId}/news`, newsItem)
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
        updatedAt: firestoreService.serverTimestamp()
      }

      // If publishing for the first time, set publishedAt
      if (updates.isPublished && !updates.publishedAt) {
        updateData.publishedAt = firestoreService.serverTimestamp()
      }

      await firestoreService.updateDoc(`projects/${projectId}/news/${newsId}`, updateData)
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
      await firestoreService.deleteDoc(`projects/${projectId}/news/${newsId}`)
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
      const docSnap = await firestoreService.getDoc(`projects/${projectId}/news/${newsId}`)

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
        updatedAt: firestoreService.serverTimestamp()
      }

      if (isPublished) {
        updateData.publishedAt = firestoreService.serverTimestamp()
      }

      await firestoreService.updateDoc(`projects/${projectId}/news/${newsId}`, updateData)
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

  /**
   * Get reaction counts for news items
   * @param {string} projectId - The project ID
   * @param {Array} newsItems - Array of news items
   * @returns {Promise<Array>} News items with reaction counts
   */
  async getNewsWithReactionCounts(projectId, newsItems) {
    try {
      const newsWithCounts = await Promise.all(
        newsItems.map(async (newsItem) => {
          try {
                   // Get reactions for this news item (mock data for now)
                   const reactionsSnapshot = { docs: [] }
            
            const reactionCounts = {
              likeCount: 0,
              loveCount: 0,
              laughCount: 0,
              wowCount: 0,
              sadCount: 0,
              angryCount: 0,
              commentCount: 0
            }
            
            // Count reactions
            reactionsSnapshot.docs.forEach((doc) => {
              const reaction = doc.data()
              switch (reaction.emoji) {
                case 'like':
                case '👍':
                  reactionCounts.likeCount++
                  break
                case 'love':
                case '❤️':
                  reactionCounts.loveCount++
                  break
                case 'laugh':
                case '😂':
                  reactionCounts.laughCount++
                  break
                case 'wow':
                case '😮':
                  reactionCounts.wowCount++
                  break
                case 'sad':
                case '😢':
                  reactionCounts.sadCount++
                  break
                case 'angry':
                case '😡':
                  reactionCounts.angryCount++
                  break
              }
            })
            
                   // Get comment count (mock data for now)
                   try {
                     const commentsSnapshot = { docs: [] }
                     reactionCounts.commentCount = commentsSnapshot.docs.length
                   } catch (commentError) {
                     console.log('Error fetching comment count:', commentError)
                   }
            
            return {
              ...newsItem,
              ...reactionCounts
            }
          } catch (error) {
            console.log(`Error fetching reactions for news ${newsItem.id}:`, error)
            return newsItem
          }
        })
      )
      
      return newsWithCounts
    } catch (error) {
      console.error('Error getting news with reaction counts:', error)
      return newsItems
    }
  }

  /**
   * Clear news cache for a project
   * @param {string} projectId - The project ID
   */
  clearNewsCache(projectId) {
    console.log(`🗑️ NewsService: Clearing news cache for project ${projectId}`)
    fastCollectionService.clearProjectCache(projectId)
    
    // Also clear specific news cache entries
    cacheService.invalidatePattern(`projects/${projectId}/news`)
  }

  /**
   * Force refresh news data (bypass cache)
   * @param {string} projectId - The project ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of news items
   */
  async forceRefreshNews(projectId, options = {}) {
    console.log(`🔄 NewsService: Force refreshing news for project ${projectId}`)
    return this.fetchNews(projectId, { ...options, forceRefresh: true })
  }
}

export default new NewsService()
