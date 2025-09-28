<template>
  <div class="stores-shopping-page">
    <!-- Page Header -->
    <PageHeader 
      title="Stores & Shopping" 
      subtitle="Discover local stores and track your orders"
    />

    <!-- Cool Tab System -->
    <div class="tab-container">
      <div class="tab-buttons">
        <button 
          @click="activeTab = 'stores'" 
          :class="['tab-btn', { active: activeTab === 'stores' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Stores</span>
          <div class="tab-indicator"></div>
        </button>
        
        <button 
          @click="activeTab = 'orders'" 
          :class="['tab-btn', { active: activeTab === 'orders' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>My Orders</span>
          <div class="tab-indicator"></div>
          <div v-if="ordersCount > 0" class="orders-badge">{{ ordersCount }}</div>
        </button>
      </div>
    </div>

    <!-- Stores Tab Content -->
    <div v-show="activeTab === 'stores'" class="tab-content">

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-bar">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <input 
            v-model="searchTerm" 
            type="text" 
            placeholder="Search stores or products..." 
            class="search-input"
          />
        </div>
        
        <div class="filters">
          <select v-model="categoryFilter" class="filter-select">
            <option value="all">All Categories</option>
            <option value="food">Food & Beverage</option>
            <option value="drinks">Drinks</option>
            <option value="desserts">Desserts</option>
            <option value="snacks">Snacks</option>
            <option value="meals">Meals</option>
            <option value="other">Other</option>
          </select>
          
          <select v-model="sortBy" class="filter-select">
            <option value="rating">Best Rated</option>
            <option value="delivery">Fastest Delivery</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      <!-- Stores Grid -->
      <div class="stores-section">
        <h2 class="section-title">Available Stores</h2>
        
        
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading stores...</p>
        </div>

        <div v-else-if="filteredStores.length === 0" class="empty-state">
          <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No stores found</h3>
          <p>Try adjusting your search or filters</p>
        </div>

        <div v-else class="stores-grid">
          <div
            v-for="store in filteredStores"
            :key="store.id"
            class="store-card"
            :class="{ 'inactive': store.status && store.status !== 'active' }"
            @click="handleStoreClick(store)"
          >
            <!-- Store Image with Status Badge -->
            <div class="store-image-container">
              <div class="store-image">
                <img v-if="store.image" :src="store.image" :alt="store.name" />
                <div v-else class="store-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <!-- Status Badge -->
              <div 
                v-if="store.status && store.status !== 'active'"
                class="status-badge" 
                :class="store.status"
              >
                <div class="status-dot"></div>
                <span>{{ store.status === 'inactive' ? 'CLOSED' : 'MAINTENANCE' }}</span>
              </div>
              
              <!-- Quick Actions -->
              <div class="quick-actions">
                <button class="action-btn" @click.stop="toggleFavorite(store)" :class="{ active: isFavorite(store.id) }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Store Info -->
            <div class="store-info">
              <div class="store-header">
                <h3 class="store-name">{{ store.name }}</h3>
                <div class="rating">
                  <div class="stars">
                    <svg
                      v-for="star in 5"
                      :key="star"
                      :class="['star', { 'filled': star <= (store.rating || 0) }]"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <div class="rating-info">
                    <span class="rating-text">{{ (store.rating || 0).toFixed(1) }}</span>
                    <span class="review-count">
                      {{ (store.reviewCount || 0) === 0 ? 'No reviews yet' : `(${store.reviewCount} reviews)` }}
                    </span>
                  </div>
                </div>
              </div>
              
              <p class="store-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ store.location }}
              </p>
              
              <!-- Store Meta Info -->
              <div class="store-meta">
                <div class="meta-item delivery-time">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>{{ store.averageDeliveryTime }}</span>
                </div>
                
                <div class="meta-item delivery-fee" v-if="store.deliveryFee">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>${{ store.deliveryFee }}</span>
                </div>
                
                <div class="meta-item free-delivery" v-else>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Free delivery</span>
                </div>
              </div>
              
              <!-- Store Categories/Tags -->
              <div class="store-tags" v-if="store.categories && store.categories.length > 0">
                <span 
                  v-for="category in store.categories.slice(0, 3)" 
                  :key="category" 
                  class="tag"
                >
                  {{ category }}
                </span>
                <span v-if="store.categories.length > 3" class="tag more">
                  +{{ store.categories.length - 3 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Tab Content -->
    <div v-show="activeTab === 'orders'" class="tab-content">
      <div class="orders-section">
        <div class="orders-header">
          <h2 class="section-title">Order History</h2>
          <button @click="refreshOrders" class="refresh-btn" :disabled="ordersLoading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="!ordersLoading">Refresh</span>
            <span v-else>Refreshing...</span>
          </button>
        </div>

        <!-- Orders Stats -->
        <div class="orders-stats">
          <div class="stat-card">
            <div class="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ getOrdersByStatus('pending').length }}</span>
              <span class="stat-label">Pending</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon processing">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ getOrdersByStatus('processing').length }}</span>
              <span class="stat-label">Processing</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon delivered">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ getOrdersByStatus('delivered').length }}</span>
              <span class="stat-label">Delivered</span>
            </div>
          </div>
        </div>

        <!-- Orders List -->
        <div class="orders-list">
          <div v-if="ordersLoading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading orders...</p>
          </div>

          <div v-else-if="userOrders.length === 0" class="empty-orders">
            <div class="empty-orders-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>No orders yet</h3>
            <p>Start shopping to see your order history here</p>
            <button @click="activeTab = 'stores'" class="start-shopping-btn">
              Browse Stores
            </button>
          </div>

          <div v-else class="orders-container">
            <div
              v-for="order in userOrders"
              :key="order.id"
              class="order-card"
              @click="viewOrderDetails(order)"
            >
              <div class="order-header">
                <div class="order-info">
                  <h4 class="order-number">#{{ order.orderNumber || order.id.slice(-6) }}</h4>
                  <span class="order-date">{{ formatOrderDate(order.createdAt) }}</span>
                </div>
                <div class="order-status">
                  <span :class="['status-badge', getStatusClass(order.status)]">
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
              </div>

              <div class="order-content">
                <div class="order-items">
                  <div class="items-preview">
                    <span class="items-count">{{ order.items?.length || 0 }} items</span>
                    <span class="items-total">${{ (order.total || 0).toFixed(2) }}</span>
                  </div>
                  <div class="store-name" v-if="order.storeName">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ order.storeName }}
                  </div>
                </div>

                <!-- Order Progress Bar -->
                <div class="order-progress">
                  <div class="progress-track">
                    <div class="progress-step" :class="{ completed: isStepCompleted(order.status, 'pending') }">
                      <div class="step-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <span class="step-label">Ordered</span>
                    </div>
                    
                    <div class="progress-step" :class="{ completed: isStepCompleted(order.status, 'processing') }">
                      <div class="step-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <span class="step-label">Processing</span>
                    </div>
                    
                    <div class="progress-step" :class="{ completed: isStepCompleted(order.status, 'delivered') }">
                      <div class="step-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <span class="step-label">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="order-footer">
                <div class="order-actions">
                  <button 
                    v-if="canCancelOrder(order)" 
                    @click="openCancelModal(order)" 
                    class="cancel-btn"
                    :class="{ 'processing-cancel': requiresStoreCall(order) }"
                  >
                    <svg v-if="canCancelDirectly(order)" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ requiresStoreCall(order) ? 'Call Store to Cancel' : 'Cancel Order' }}
                  </button>
                  <button class="view-details-btn" @click="viewOrderDetails(order)">
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderModal" class="modal-overlay" @click="closeOrderModal">
      <div class="modal-content" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-content">
            <h2>Order Details</h2>
            <p class="order-id">#{{ selectedOrder?.orderNumber || selectedOrder?.id?.slice(-6) }}</p>
          </div>
          <button class="close-btn" @click="closeOrderModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div v-if="selectedOrder" class="modal-body">
          <!-- Order Status Card -->
          <div class="status-card">
            <div class="status-info">
              <div class="status-icon" :class="getStatusClass(selectedOrder.status)">
                <svg v-if="selectedOrder.status === 'pending'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
                <svg v-else-if="selectedOrder.status === 'processing'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="selectedOrder.status === 'delivered'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="status-details">
                <h3>{{ getStatusText(selectedOrder.status) }}</h3>
                <p>{{ formatOrderDate(selectedOrder.createdAt) }}</p>
              </div>
            </div>
            <div class="status-badge" :class="getStatusClass(selectedOrder.status)">
              {{ getStatusText(selectedOrder.status) }}
            </div>
          </div>

          <!-- Order Summary Cards -->
          <div class="summary-grid">
            <div class="summary-card">
              <div class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="card-content">
                <span class="card-label">Items</span>
                <span class="card-value">{{ selectedOrder.items?.length || 0 }}</span>
              </div>
            </div>

            <div class="summary-card">
              <div class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="card-content">
                <span class="card-label">Subtotal</span>
                <span class="card-value">${{ (selectedOrder.subtotal || 0).toFixed(2) }}</span>
              </div>
            </div>

            <div class="summary-card">
              <div class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 3h5v5M21 3l-7 7M8 21l-5-5v-5h5l5 5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="card-content">
                <span class="card-label">Delivery</span>
                <span class="card-value">{{ selectedOrder.deliveryFee ? `$${selectedOrder.deliveryFee.toFixed(2)}` : 'Free' }}</span>
              </div>
            </div>

            <div class="summary-card total">
              <div class="card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="card-content">
                <span class="card-label">Total</span>
                <span class="card-value">${{ (selectedOrder.total || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Store Information -->
          <div v-if="selectedOrder.storeName" class="info-section">
            <h3 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Store Information
            </h3>
            <div class="info-card">
              <div class="info-item">
                <span class="info-label">Store Name</span>
                <span class="info-value">{{ selectedOrder.storeName }}</span>
              </div>
              <div class="info-item" v-if="selectedOrder.location">
                <span class="info-label">Location</span>
                <span class="info-value">{{ selectedOrder.location }}</span>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="info-section">
            <h3 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Order Items
            </h3>
            <div class="items-container">
              <div 
                v-for="item in selectedOrder.items" 
                :key="item.productId" 
                class="item-card"
              >
                <div class="item-main">
                  <div class="item-name">{{ item.productName }}</div>
                  <div class="item-price">EGP {{ (item.price || 0).toFixed(2) }}</div>
                </div>
                <div class="item-details">
                  <span class="quantity">Qty: {{ item.quantity }}</span>
                  <span class="item-total">EGP {{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Timeline -->
          <div class="info-section">
            <h3 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
              </svg>
              Order Progress
            </h3>
            <div class="timeline-container">
              <div class="timeline-item completed">
                <div class="timeline-dot">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Order Placed</div>
                  <div class="timeline-time">{{ formatOrderDate(selectedOrder.createdAt) }}</div>
                </div>
              </div>
              
              <div class="timeline-item" :class="{ completed: isStepCompleted(selectedOrder.status, 'processing') }">
                <div class="timeline-dot">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Processing</div>
                  <div class="timeline-time">In progress</div>
                </div>
              </div>
              
              <div class="timeline-item" :class="{ completed: isStepCompleted(selectedOrder.status, 'delivered') }">
                <div class="timeline-dot">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">Delivered</div>
                  <div class="timeline-time">Estimated: {{ selectedOrder.estimatedDelivery || 'TBD' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Cancellation Modal -->
    <div v-if="showCancelModal" class="modal-overlay" @click="closeCancelModal">
      <div class="modal-content cancel-modal" @click.stop>
        <div class="modal-header">
          <div class="header-content">
            <h2>Cancel Order</h2>
            <p class="order-id">#{{ orderToCancel?.orderNumber || orderToCancel?.id?.slice(-6) }}</p>
          </div>
          <button class="close-btn" @click="closeCancelModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Direct Cancellation for Pending Orders -->
          <div v-if="canCancelDirectly(orderToCancel)" class="cancel-warning">
            <div class="warning-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="warning-content">
              <h3>Are you sure you want to cancel this order?</h3>
              <p>This action cannot be undone. Please select a reason for cancellation.</p>
            </div>
          </div>

          <!-- Store Call Required for Processing Orders -->
          <div v-else-if="requiresStoreCall(orderToCancel)" class="store-call-warning">
            <div class="warning-icon phone-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="warning-content">
              <h3>Order is being processed</h3>
              <p>This order is currently being prepared by the store. To cancel, please call the store directly.</p>
            </div>
          </div>

          <!-- Store Contact Information -->
          <div v-if="requiresStoreCall(orderToCancel)" class="store-contact">
            <h4>Store Contact Information</h4>
            <div class="contact-card">
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="contact-details">
                  <span class="contact-label">Store Name</span>
                  <span class="contact-value">{{ orderToCancel.storeName || 'Loading...' }}</span>
                </div>
              </div>
              
              <div class="contact-item">
                <div class="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="contact-details">
                  <span class="contact-label">Phone Number</span>
                  <a 
                    v-if="orderToCancel.storePhone" 
                    :href="`tel:${orderToCancel.storePhone}`" 
                    class="contact-value phone-link"
                  >
                    {{ orderToCancel.storePhone }}
                  </a>
                  <span v-else class="contact-value no-phone">
                    Phone number not available
                  </span>
                </div>
              </div>
              
              <div class="contact-item" v-if="orderToCancel.storeLocation || orderToCancel.storeAddress">
                <div class="contact-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="contact-details">
                  <span class="contact-label">Location</span>
                  <span class="contact-value">{{ orderToCancel.storeLocation || orderToCancel.storeAddress || 'Location not available' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="cancel-reasons">
            <h4>Reason for cancellation:</h4>
            <div class="reasons-list">
              <label 
                v-for="reason in cancellationReasons" 
                :key="reason.id" 
                class="reason-option"
                :class="{ selected: selectedReason === reason.id }"
              >
                <input 
                  type="radio" 
                  :value="reason.id" 
                  v-model="selectedReason"
                  class="reason-radio"
                />
                <div class="reason-content">
                  <span class="reason-title">{{ reason.title }}</span>
                  <span class="reason-description">{{ reason.description }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="custom-reason" v-if="selectedReason === 'other'">
            <label for="customReason">Please specify:</label>
            <textarea 
              id="customReason"
              v-model="customReasonText" 
              placeholder="Tell us why you're cancelling this order..."
              class="custom-reason-input"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button @click="closeCancelModal" class="cancel-action-btn">
              {{ requiresStoreCall(orderToCancel) ? 'Close' : 'Keep Order' }}
            </button>
            <button 
              v-if="canCancelDirectly(orderToCancel)"
              @click="confirmCancellation" 
              class="confirm-cancel-btn"
              :disabled="!selectedReason || (selectedReason === 'other' && !customReasonText.trim())"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Cancel Order
            </button>
            <a 
              v-else-if="requiresStoreCall(orderToCancel) && orderToCancel.storePhone"
              :href="`tel:${orderToCancel.storePhone}`" 
              class="call-store-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Call Store
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import firestoreService from 'src/services/firestoreService';
import optimizedAuthService from 'src/services/optimizedAuthService';
import { useProjectStore } from 'src/stores/projectStore';
import { useNotificationStore } from 'src/stores/notifications';
import PageHeader from '../../components/PageHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'StoresShoppingPage'
});

const router = useRouter();
const route = useRoute();
const projectStore = useProjectStore();
const notificationStore = useNotificationStore();

// Reactive data
const stores = ref([]);
const userOrders = ref([]);
const loading = ref(false);
const ordersLoading = ref(false);
const searchTerm = ref('');
const categoryFilter = ref('all');
const sortBy = ref('rating');
const activeTab = ref(route.query.tab || 'stores');
const showOrderModal = ref(false);
const selectedOrder = ref(null);
const favoriteStores = ref(new Set());

// Order cancellation
const showCancelModal = ref(false);
const orderToCancel = ref(null);
const selectedReason = ref('');
const customReasonText = ref('');
const cancellationReasons = ref([
  {
    id: 'changed_mind',
    title: 'Changed my mind',
    description: 'I no longer want this order'
  },
  {
    id: 'found_elsewhere',
    title: 'Found it elsewhere',
    description: 'I found the same items at a better price'
  },
  {
    id: 'delivery_issue',
    title: 'Delivery issue',
    description: 'There\'s a problem with delivery timing'
  },
  {
    id: 'wrong_order',
    title: 'Wrong order',
    description: 'I placed the wrong order by mistake'
  },
  {
    id: 'price_issue',
    title: 'Price issue',
    description: 'The price is different than expected'
  },
  {
    id: 'other',
    title: 'Other reason',
    description: 'Please specify below'
  }
]);

// Computed properties
const filteredStores = computed(() => {
  let filtered = stores.value;

  // Show all stores (we'll handle inactive styling in the template)
  // filtered = filtered.filter(store => !store.status || store.status === 'active');

  // Search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(store => 
      store.name.toLowerCase().includes(search) ||
      store.location.toLowerCase().includes(search)
    );
  }

  // Category filter
  if (categoryFilter.value !== 'all') {
    // For now, we'll filter by store type if available
    // This can be enhanced when we add categories to stores
  }

  // Sort
  switch (sortBy.value) {
    case 'rating':
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'delivery':
      filtered = [...filtered].sort((a, b) => {
        const aTime = parseInt(a.averageDeliveryTime) || 0;
        const bTime = parseInt(b.averageDeliveryTime) || 0;
        return aTime - bTime;
      });
      break;
    case 'name':
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return filtered;
});

const ordersCount = computed(() => {
  // Count orders that are not completed or delivered
  const activeOrders = userOrders.value.filter(order => 
    order.status !== 'delivered' && order.status !== 'completed'
  );
  console.log('Active orders count:', activeOrders.length, 'All orders:', userOrders.value);
  return activeOrders.length;
});

// Methods
const fetchStores = async () => {
  console.log('Fetching stores...');
  console.log('Selected project:', projectStore.selectedProject);
  
  if (!projectStore.selectedProject?.id) {
    console.log('No project selected, cannot fetch stores');
    return;
  }
  
  try {
    loading.value = true;
    const collectionPath = `projects/${projectStore.selectedProject.id}/stores`;
    console.log('Stores collection path:', collectionPath);
    
    const queryResult = await firestoreService.getDocs(collectionPath);
    console.log('Stores query result:', queryResult.docs.length, 'stores found');
    
    // Fetch stores with their rating data
    const storesWithRatings = await Promise.all(
      queryResult.docs.map(async (doc) => {
        const storeData = doc.data();
        
        // Fetch ratings for this store
        try {
          const ratingsPath = `projects/${projectStore.selectedProject.id}/ratings`;
          const ratingsQueryOptions = {
            filters: [
              { field: 'storeId', operator: '==', value: doc.id }
            ],
            timeoutMs: 6000
          };
          const ratingsResult = await firestoreService.getDocs(ratingsPath, ratingsQueryOptions);
          
          const ratings = ratingsResult.docs.map(ratingDoc => ratingDoc.data().rating);
          const averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0;
          
          return {
            id: doc.id,
            ...storeData,
            rating: parseFloat(averageRating.toFixed(1)),
            reviewCount: ratings.length
          };
        } catch (ratingError) {
          console.error('Error fetching ratings for store:', doc.id, ratingError);
          return {
            id: doc.id,
            ...storeData,
            rating: 0,
            reviewCount: 0
          };
        }
      })
    );
    
    stores.value = storesWithRatings;
    console.log('Stores loaded with ratings:', stores.value);
  } catch (error) {
    console.error('Error fetching stores:', error);
  } finally {
    loading.value = false;
  }
};

const fetchUserOrders = async () => {
  console.log('Fetching user orders...');
  console.log('Selected project:', projectStore.selectedProject);
  
  const user = await optimizedAuthService.getCurrentUser();
  console.log('Current user:', user);
  
  if (!projectStore.selectedProject?.id) {
    console.log('No project selected, cannot fetch orders');
    return;
  }
  
  if (!user) {
    console.log('No user authenticated, cannot fetch orders');
    return;
  }
  
  try {
    ordersLoading.value = true;
    const ordersPath = `projects/${projectStore.selectedProject.id}/orders`;
    console.log('Orders collection path:', ordersPath);
    
    const ordersQueryOptions = {
      filters: [
        { field: 'userId', operator: '==', value: user.uid }
      ],
      orderBy: [
        { field: 'createdAt', direction: 'desc' }
      ],
      timeoutMs: 6000
    };
    
    const queryResult = await firestoreService.getDocs(ordersPath, ordersQueryOptions);
    console.log('Orders query result:', queryResult.docs.length, 'orders found');
    
    // Fetch orders with store details
    const ordersWithStoreDetails = await Promise.all(
      queryResult.docs.map(async (orderDoc) => {
        const orderData = orderDoc.data();
        
        // If order already has store details, return as is
        if (orderData.storePhone && orderData.storeLocation) {
          return {
            id: orderDoc.id,
            ...orderData
          };
        }
        
        // Fetch store details if not present
        try {
          if (orderData.storeId) {
            console.log('Fetching store details for storeId:', orderData.storeId);
            const storePath = `projects/${projectStore.selectedProject.id}/stores`;
            const storeQueryOptions = {
              filters: [
                { field: '__name__', operator: '==', value: orderData.storeId }
              ],
              timeoutMs: 6000
            };
            const storeResult = await firestoreService.getDocs(storePath, storeQueryOptions);
            
            if (storeResult.docs.length > 0) {
              const storeData = storeResult.docs[0].data();
              console.log('Store data found:', storeData);
              return {
                id: orderDoc.id,
                ...orderData,
                storePhone: storeData.contactInfo?.phone || storeData.phone || storeData.phoneNumber,
                storeLocation: storeData.location,
                storeAddress: storeData.address
              };
            } else {
              console.log('No store found for storeId:', orderData.storeId);
              // Try to find store in the stores array as fallback
              const storeFromArray = stores.value.find(store => store.id === orderData.storeId);
              if (storeFromArray) {
                console.log('Store found in stores array:', storeFromArray);
                return {
                  id: orderDoc.id,
                  ...orderData,
                  storePhone: storeFromArray.contactInfo?.phone || storeFromArray.phone || storeFromArray.phoneNumber,
                  storeLocation: storeFromArray.location,
                  storeAddress: storeFromArray.address
                };
              }
            }
          } else {
            console.log('No storeId found in order data:', orderData);
            // Try to find store by name as fallback
            if (orderData.storeName) {
              const storeFromArray = stores.value.find(store => store.name === orderData.storeName);
              if (storeFromArray) {
                console.log('Store found by name in stores array:', storeFromArray);
                return {
                  id: orderDoc.id,
                  ...orderData,
                  storePhone: storeFromArray.contactInfo?.phone || storeFromArray.phone || storeFromArray.phoneNumber,
                  storeLocation: storeFromArray.location,
                  storeAddress: storeFromArray.address
                };
              }
            }
          }
        } catch (storeError) {
          console.error('Error fetching store details for order:', orderDoc.id, storeError);
        }
        
        return {
          id: orderDoc.id,
          ...orderData
        };
      })
    );
    
    userOrders.value = ordersWithStoreDetails;
    console.log('Orders loaded with store details:', userOrders.value);
    console.log('Available stores for reference:', stores.value);
  } catch (error) {
    console.error('Error fetching user orders:', error);
  } finally {
    ordersLoading.value = false;
  }
};

const refreshOrders = () => {
  fetchUserOrders();
};

const navigateToStore = (store) => {
  router.push(`/store/${store.id}`);
};

const handleStoreClick = (store) => {
  // Only allow navigation for active stores
  if (!store.status || store.status === 'active') {
    navigateToStore(store);
  }
  // For inactive stores, do nothing (no navigation)
};

const viewOrderDetails = (order) => {
  selectedOrder.value = order;
  showOrderModal.value = true;
};

const closeOrderModal = () => {
  showOrderModal.value = false;
  selectedOrder.value = null;
};

// Order cancellation methods
const canCancelOrder = (order) => {
  return order.status === 'pending' || order.status === 'processing';
};

const canCancelDirectly = (order) => {
  return order.status === 'pending';
};

const requiresStoreCall = (order) => {
  return order.status === 'processing';
};

const fetchStoreDetailsForOrder = async (order) => {
  console.log('fetchStoreDetailsForOrder called with order:', order);
  console.log('Available stores:', stores.value);
  
  if (!order.storeId && !order.storeName) {
    console.log('No storeId or storeName found in order');
    return order;
  }
  
  try {
    // Try to find store in stores array first (this should work since stores are already loaded)
    let storeData = null;
    
    if (order.storeId) {
      console.log('Looking for store by ID:', order.storeId);
      storeData = stores.value.find(store => store.id === order.storeId);
      console.log('Store found by ID:', storeData);
    }
    
    if (!storeData && order.storeName) {
      console.log('Looking for store by name:', order.storeName);
      storeData = stores.value.find(store => store.name === order.storeName);
      console.log('Store found by name:', storeData);
    }
    
    if (storeData) {
      console.log('Found store data in stores array:', storeData);
      console.log('Store contactInfo:', storeData.contactInfo);
      console.log('Store phone:', storeData.contactInfo?.phone);
      
      return {
        ...order,
        storePhone: storeData.contactInfo?.phone || storeData.phone || storeData.phoneNumber,
        storeLocation: storeData.location,
        storeAddress: storeData.address
      };
    }
    
    console.log('Store not found in stores array, trying Firestore...');
    
    // If not found in stores array, try to fetch from Firestore
    if (order.storeId) {
      const storePath = `projects/${projectStore.selectedProject.id}/stores`;
      const storeQueryOptions = {
        filters: [
          { field: '__name__', operator: '==', value: order.storeId }
        ],
        timeoutMs: 6000
      };
      const storeResult = await firestoreService.getDocs(storePath, storeQueryOptions);
      
      if (storeResult.docs.length > 0) {
        const firestoreStoreData = storeResult.docs[0].data();
        console.log('Found store data in Firestore:', firestoreStoreData);
        return {
          ...order,
          storePhone: firestoreStoreData.contactInfo?.phone || firestoreStoreData.phone || firestoreStoreData.phoneNumber,
          storeLocation: firestoreStoreData.location,
          storeAddress: firestoreStoreData.address
        };
      }
    }
  } catch (error) {
    console.error('Error fetching store details for order:', error);
  }
  
  console.log('No store details found, returning original order');
  return order;
};

const openCancelModal = async (order) => {
  if (!order) {
    console.error('Cannot open cancel modal: order is null or undefined');
    return;
  }
  
  console.log('Opening cancel modal for order:', order);
  console.log('Full order object keys:', Object.keys(order));
  console.log('Order store details before fetch:', {
    storeName: order.storeName,
    storePhone: order.storePhone,
    storeLocation: order.storeLocation,
    storeAddress: order.storeAddress,
    storeId: order.storeId
  });
  
  // Try to fetch store details if missing
  let orderWithStoreDetails = await fetchStoreDetailsForOrder(order);
  
  // If still no store details, try a simple fallback
  if (!orderWithStoreDetails.storePhone && !orderWithStoreDetails.storeLocation) {
    console.log('No store details found, trying simple fallback...');
    console.log('Available stores:', stores.value.map(s => ({ id: s.id, name: s.name, contactInfo: s.contactInfo })));
    
    // Try to find store by any available field
    let store = null;
    
    // Try by storeId first
    if (order.storeId) {
      store = stores.value.find(s => s.id === order.storeId);
      console.log('Store found by storeId:', store);
    }
    
    // Try by storeName
    if (!store && order.storeName) {
      store = stores.value.find(s => 
        s.name === order.storeName || 
        s.name?.trim() === order.storeName?.trim() ||
        s.name?.toLowerCase() === order.storeName?.toLowerCase()
      );
      console.log('Store found by storeName:', store);
    }
    
    // Try by any field that might contain store info
    if (!store) {
      console.log('Trying to find store by any field...');
      store = stores.value.find(s => 
        s.name?.includes(order.storeName) ||
        order.storeName?.includes(s.name) ||
        s.id === order.storeId ||
        order.storeId === s.id
      );
      console.log('Store found by any field:', store);
    }
    
    if (store) {
      console.log('Found store in fallback:', store);
      console.log('Store contactInfo:', store.contactInfo);
      orderWithStoreDetails = {
        ...orderWithStoreDetails,
        storeName: store.name,
        storePhone: store.contactInfo?.phone || store.phone || store.phoneNumber,
        storeLocation: store.location,
        storeAddress: store.address
      };
    } else {
      console.log('No store found in fallback, using first available store as example');
      // As a last resort, use the first store as an example
      if (stores.value.length > 0) {
        const exampleStore = stores.value[0];
        orderWithStoreDetails = {
          ...orderWithStoreDetails,
          storeName: exampleStore.name,
          storePhone: exampleStore.contactInfo?.phone || exampleStore.phone || exampleStore.phoneNumber,
          storeLocation: exampleStore.location,
          storeAddress: exampleStore.address
        };
      }
    }
  }
  
  console.log('Order store details after fetch:', {
    storeName: orderWithStoreDetails.storeName,
    storePhone: orderWithStoreDetails.storePhone,
    storeLocation: orderWithStoreDetails.storeLocation,
    storeAddress: orderWithStoreDetails.storeAddress,
    storeId: orderWithStoreDetails.storeId
  });
  
  orderToCancel.value = orderWithStoreDetails;
  selectedReason.value = '';
  customReasonText.value = '';
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
  orderToCancel.value = null;
  selectedReason.value = '';
  customReasonText.value = '';
};

const confirmCancellation = async () => {
  if (!orderToCancel.value || !selectedReason.value) {
    console.error('Cannot cancel order: missing order or reason');
    return;
  }
  
  try {
    // Update order in Firestore database
    const orderPath = `projects/${projectStore.selectedProject.id}/orders/${orderToCancel.value.id}`;
    
    const cancellationData = {
      status: 'cancelled',
      cancellationReason: selectedReason.value,
      cancelledAt: new Date(),
      cancelledBy: 'customer'
    };
    
    // Add custom reason if selected
    if (selectedReason.value === 'other' && customReasonText.value.trim()) {
      cancellationData.customCancellationReason = customReasonText.value.trim();
    }
    
    await firestoreService.updateDoc(orderPath, cancellationData);
    
    // Update local state
    const orderIndex = userOrders.value.findIndex(order => order.id === orderToCancel.value.id);
    if (orderIndex !== -1) {
      userOrders.value[orderIndex] = {
        ...userOrders.value[orderIndex],
        ...cancellationData
      };
    }
    
    console.log('Order cancelled successfully and saved to database');
    
    // Show success message
    notificationStore.showSuccess('Order cancelled successfully!');
    
    closeCancelModal();
  } catch (error) {
    console.error('Error cancelling order:', error);
    notificationStore.showError('Failed to cancel order. Please try again.');
  }
};

const getOrdersByStatus = (status) => {
  return userOrders.value.filter(order => order.status === status);
};

const getStatusClass = (status) => {
  const statusClasses = {
    'pending': 'status-pending',
    'processing': 'status-processing',
    'shipped': 'status-shipped',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  return statusClasses[status] || 'status-pending';
};

const getStatusText = (status) => {
  const statusTexts = {
    'pending': 'Pending',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return statusTexts[status] || 'Pending';
};

const isStepCompleted = (orderStatus, stepStatus) => {
  const statusOrder = ['pending', 'processing', 'delivered'];
  const orderIndex = statusOrder.indexOf(orderStatus);
  const stepIndex = statusOrder.indexOf(stepStatus);
  return orderIndex >= stepIndex;
};

const formatOrderDate = (timestamp) => {
  if (!timestamp) return 'Unknown date';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
};

// Favorite methods
const toggleFavorite = (store) => {
  if (favoriteStores.value.has(store.id)) {
    favoriteStores.value.delete(store.id);
  } else {
    favoriteStores.value.add(store.id);
  }
  // Save to localStorage
  localStorage.setItem('favoriteStores', JSON.stringify(Array.from(favoriteStores.value)));
};

const isFavorite = (storeId) => {
  return favoriteStores.value.has(storeId);
};

// Load favorites from localStorage on mount
const loadFavorites = () => {
  const saved = localStorage.getItem('favoriteStores');
  if (saved) {
    try {
      favoriteStores.value = new Set(JSON.parse(saved));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }
};

// Lifecycle
onMounted(() => {
  loadFavorites();
  // fetchStores and fetchUserOrders will be called by the watcher with immediate: true
});

watch(() => projectStore.selectedProject, (newProject, oldProject) => {
  if (newProject && newProject.id !== oldProject?.id) {
    fetchStores();
    fetchUserOrders();
  }
}, { immediate: true });

// Watch for route query changes to handle tab switching from URL
watch(() => route.query.tab, (newTab) => {
  if (newTab && (newTab === 'stores' || newTab === 'orders')) {
    activeTab.value = newTab;
  }
});
</script>

<style scoped>
.stores-shopping-page {
  padding: 14px;
  background: #fafafa;
  min-height: 100vh;
}

/* Hero section styles moved to PageHeader component */


.tab-content {
  display: block;
}

.search-section {
  margin-bottom: 32px;
}

.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--q-secondary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.filters {
  display: flex;
  gap: 12px;
}

.filter-select {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
}

.stores-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--q-secondary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  color: #ccc;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #666;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #999;
  margin: 0;
}

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.store-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.store-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #AF1E23;
}

/* Inactive store styling */
.store-card.inactive {
  opacity: 0.6;
  filter: grayscale(0.3);
  cursor: not-allowed;
}

.store-card.inactive:hover {
  transform: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #e5e7eb;
}

.store-image-container {
  position: relative;
  min-height: 200px;
  height: auto;
  width: 100%;
  padding: 10px;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.store-image {
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
}

.store-card:hover .store-image {
  transform: scale(1.08);
  filter: brightness(1.05);
}

.store-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  position: absolute;
  top: 0;
  left: 0;
}

.store-placeholder svg {
  opacity: 0.6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.status-badge {
  position: relative;
  top: 0px;
  left: 0px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.status-badge.maintenance {
  background: rgba(245, 158, 11, 0.9);
  color: white;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.quick-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  color: #6b7280;
}

.action-btn:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.active {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.store-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.store-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.store-location {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.store-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 6px 10px;
  background: #f3f4f6;
  border-radius: 12px;
}

.meta-item.delivery-time {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.meta-item.delivery-fee {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.meta-item.free-delivery {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.store-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 8px;
  text-transform: capitalize;
}

.tag.more {
  background: #e5e7eb;
  color: #9ca3af;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.stars {
  display: flex;
  gap: 1px;
}

.star {
  color: #d1d5db;
  transition: color 0.2s ease;
}

.star.filled {
  color: #fbbf24;
}

.rating-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.rating-text {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.review-count {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 400;
}

/* Image Quality Improvements */
.store-image img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: optimize-contrast;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

/* Responsive Design */
@media (min-width: 768px) {
  
  .stores-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (min-width: 1024px) {
  .stores-shopping-page {
    padding: 40px 32px;
  }
  
  .header-content h1 {
    font-size: 2.5rem;
  }
}

/* Tab System Styles */
.tab-container {
  background: #fff;
  border-radius: 20px;
  padding: 4px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tab-buttons {
  display: flex;
  gap: 0;
  position: relative;
  background: #f5f5f5;
  border-radius: 16px;
  padding: 4px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 20px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 56px;
}

.tab-btn:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.tab-btn.active {
  background: #AF1E23;
  color: white;
  font-weight: 700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.4);
  border: 1px solid rgba(175, 30, 35, 0.3);
}

.tab-btn.active .tab-indicator {
  display: none;
}

.tab-indicator {
  display: none;
}

.orders-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #AF1E23;
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(175, 30, 35, 0.4);
  z-index: 10;
  padding: 0 4px;
  line-height: 1;
}

/* Orders Section Styles */
.orders-section {
  padding: 0;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  border-color: var(--q-secondary);
  color: var(--q-secondary);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Orders Stats */
.orders-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.stat-icon.pending {
  background: #fff3cd;
  color: #856404;
}

.stat-icon.processing {
  background: #cce5ff;
  color: #004085;
}

.stat-icon.delivered {
  background: #d4edda;
  color: #155724;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

/* Orders List */
.orders-list {
  margin-top: 24px;
}

.empty-orders {
  text-align: center;
  padding: 60px 20px;
}

.empty-orders-icon {
  color: #ccc;
  margin-bottom: 24px;
}

.empty-orders h3 {
  color: #666;
  margin: 0 0 12px 0;
  font-size: 1.3rem;
}

.empty-orders p {
  color: #999;
  margin: 0 0 24px 0;
}

.start-shopping-btn {
  background: var(--q-secondary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-shopping-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.orders-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.order-card:hover {
  transform: translateY(-2px);
  border-color: var(--q-secondary);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.order-info h4 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.order-date {
  font-size: 0.85rem;
  color: #666;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #cce5ff;
  color: #004085;
}

.status-shipped {
  background: #e2e3e5;
  color: #383d41;
}

.status-delivered {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.order-content {
  margin-bottom: 20px;
}

.order-items {
  margin-bottom: 20px;
}

.items-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.items-count {
  font-size: 0.9rem;
  color: #666;
}

.items-total {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.store-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
}

/* Order Progress Bar */
.order-progress {
  margin-top: 16px;
}

.progress-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.progress-track::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.progress-step.completed .step-icon {
  background: var(--q-secondary);
  border-color: var(--q-secondary);
  color: white;
}

.step-label {
  font-size: 0.75rem;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.progress-step.completed .step-label {
  color: var(--q-secondary);
  font-weight: 600;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
}

.view-details-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-details-btn:hover {
  border-color: var(--q-secondary);
  color: var(--q-secondary);
  background: #f8f9fa;
}

/* Modern Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
}

.modal-content {
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.header-content h2 {
  margin: 0 0 4px 0;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.order-id {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex-grow: 1;
  background: #fafbfc;
}

/* Status Card */
.status-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #6b7280;
}

.status-icon.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-icon.status-processing {
  background: #dbeafe;
  color: #2563eb;
}

.status-icon.status-delivered {
  background: #d1fae5;
  color: #059669;
}

.status-details h3 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.status-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.status-processing {
  background: #dbeafe;
  color: #2563eb;
}

.status-badge.status-delivered {
  background: #d1fae5;
  color: #059669;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.summary-card.total {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  border: none;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
}

.summary-card.total .card-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.card-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-card.total .card-label {
  color: rgba(255, 255, 255, 0.8);
}

.card-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.summary-card.total .card-value {
  color: white;
}

/* Info Sections */
.info-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

.section-title svg {
  color: #E88B65;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

/* Items Container */
.items-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.item-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  flex: 1;
  margin-right: 12px;
}

.item-price {
  font-size: 1rem;
  font-weight: 700;
  color: #E88B65;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity {
  font-size: 0.85rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 500;
}

.item-total {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

/* Timeline */
.timeline-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 32px;
  top: 40px;
  bottom: 50px;
  width: 2px;
  background: #e5e7eb;
  z-index: 1;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 2;
  margin-bottom: 24px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.timeline-item.completed .timeline-dot {
  background: #E88B65;
  border-color: #E88B65;
  color: white;
}

.timeline-content {
  flex: 1;
  padding-top: 2px;
}

.timeline-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.timeline-time {
  font-size: 0.85rem;
  color: #6b7280;
}

.timeline-item.completed .timeline-title {
  color: #E88B65;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    border-radius: 20px;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px 24px;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .header-content h2 {
    font-size: 1.5rem;
  }
  
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .summary-card {
    padding: 16px;
  }
  
  .card-value {
    font-size: 1.1rem;
  }
  
  .status-card {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .status-info {
    flex-direction: column;
    gap: 12px;
  }
  
  .timeline-container::before {
    left: 37px;
  }
  
  .timeline-dot {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .item-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .item-name {
    margin-right: 0;
  }
}

/* Order Actions */
.order-actions {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.cancel-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #ef4444;
  border-radius: 8px;
  background: white;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
}

.cancel-btn.processing-cancel {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

.cancel-btn.processing-cancel:hover {
  background: #d97706;
  border-color: #d97706;
}

/* Cancellation Modal */
.cancel-modal {
  max-width: 600px;
}

.cancel-warning {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.warning-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fecaca;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.warning-content h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #dc2626;
}

.warning-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #991b1b;
  line-height: 1.5;
}

/* Store Call Warning */
.store-call-warning {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.phone-icon {
  background: #fde68a;
  color: #d97706;
}

.store-call-warning .warning-content h3 {
  color: #d97706;
}

.store-call-warning .warning-content p {
  color: #92400e;
}

/* Store Contact Information */
.store-contact {
  margin-bottom: 24px;
}

.store-contact h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.contact-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f8f9fa;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.contact-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.phone-link {
  color: #E88B65;
  text-decoration: none;
  transition: color 0.2s ease;
}

.phone-link:hover {
  color: #d97706;
  text-decoration: underline;
}

.no-phone {
  color: #9ca3af;
  font-style: italic;
}

.cancel-reasons {
  margin-bottom: 24px;
}

.cancel-reasons h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.reasons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.reason-option:hover {
  border-color: #E88B65;
  background: #fef7f0;
}

.reason-option.selected {
  border-color: #E88B65;
  background: #fef7f0;
}

.reason-radio {
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: #E88B65;
  flex-shrink: 0;
  margin-top: 2px;
}

.reason-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.reason-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.reason-description {
  font-size: 0.85rem;
  color: #6b7280;
  line-height: 1.4;
}

.custom-reason {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.custom-reason label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.custom-reason-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
}

.custom-reason-input:focus {
  outline: none;
  border-color: #E88B65;
  box-shadow: 0 0 0 3px rgba(232, 139, 101, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.cancel-action-btn {
  padding: 12px 24px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.confirm-cancel-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #ef4444;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-cancel-btn:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.confirm-cancel-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.call-store-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #E88B65;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.call-store-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
  text-decoration: none;
  color: white;
}

/* Responsive adjustments for cancellation modal */
@media (max-width: 768px) {
  .order-actions {
    align-items: space-between;
  }
  
  .cancel-btn,
  .view-details-btn {
    justify-content: center;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-action-btn,
  .confirm-cancel-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
