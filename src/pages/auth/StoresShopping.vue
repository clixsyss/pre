<template>
  <div class="stores-shopping-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Stores & Shopping</h1>
        <p class="subtitle">Discover local stores and track your orders</p>
      </div>
    </div>

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
    <div v-show="activeTab === 'stores'" class="tab-content active">

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
            @click="navigateToStore(store)"
          >
            <div class="store-image">
              <img v-if="store.image" :src="store.image" :alt="store.name" />
              <div v-else class="store-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div class="store-info">
              <h3 class="store-name">{{ store.name }}</h3>
              <p class="store-location">{{ store.location }}</p>
              
              <div class="store-meta">
                <div class="delivery-time">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ store.averageDeliveryTime }}
                </div>
                
                <div class="delivery-fee" v-if="store.deliveryFee">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  ${{ store.deliveryFee }} delivery
                </div>
                
                <div class="rating">
                  <div class="stars">
                    <svg
                      v-for="star in 5"
                      :key="star"
                      :class="['star', { 'filled': star <= (store.rating || 0) }]"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <span class="rating-text">{{ store.rating || 0 }}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Tab Content -->
    <div v-show="activeTab === 'orders'" class="tab-content active">
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
                <button class="view-details-btn">
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'src/boot/firebase';
import { useProjectStore } from 'src/stores/projectStore';

// Component name for ESLint
defineOptions({
  name: 'StoresShoppingPage'
});

const router = useRouter();
const projectStore = useProjectStore();
const auth = getAuth();

// Reactive data
const stores = ref([]);
const userOrders = ref([]);
const loading = ref(false);
const ordersLoading = ref(false);
const searchTerm = ref('');
const categoryFilter = ref('all');
const sortBy = ref('rating');
const activeTab = ref('stores');

// Computed properties
const filteredStores = computed(() => {
  let filtered = stores.value;

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

const ordersCount = computed(() => userOrders.value.length);

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
    const storesRef = collection(db, `projects/${projectStore.selectedProject.id}/stores`);
    console.log('Stores collection path:', `projects/${projectStore.selectedProject.id}/stores`);
    
    const querySnapshot = await getDocs(storesRef);
    console.log('Stores query result:', querySnapshot.docs.length, 'stores found');
    
    stores.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Stores loaded:', stores.value);
  } catch (error) {
    console.error('Error fetching stores:', error);
  } finally {
    loading.value = false;
  }
};

const fetchUserOrders = async () => {
  console.log('Fetching user orders...');
  console.log('Selected project:', projectStore.selectedProject);
  console.log('Current user:', auth.currentUser);
  
  if (!projectStore.selectedProject?.id) {
    console.log('No project selected, cannot fetch orders');
    return;
  }
  
  if (!auth.currentUser) {
    console.log('No user authenticated, cannot fetch orders');
    return;
  }
  
  try {
    ordersLoading.value = true;
    const ordersRef = collection(db, `projects/${projectStore.selectedProject.id}/orders`);
    console.log('Orders collection path:', `projects/${projectStore.selectedProject.id}/orders`);
    
    const ordersQuery = query(
      ordersRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    console.log('Orders query result:', querySnapshot.docs.length, 'orders found');
    
    userOrders.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('Orders loaded:', userOrders.value);
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

const viewOrderDetails = (order) => {
  // For now, we'll just log the order
  // This can be enhanced to show a modal or navigate to order details page
  console.log('Viewing order details:', order);
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

// Lifecycle
onMounted(() => {
  fetchStores();
  fetchUserOrders();
});

watch(() => projectStore.selectedProject, (newProject, oldProject) => {
  if (newProject && newProject.id !== oldProject?.id) {
    fetchStores();
    fetchUserOrders();
  }
}, { immediate: true });
</script>

<style scoped>
.stores-shopping-page {
  padding: 20px 16px;
  background: #fafafa;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 300;
  color: #333;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.tab-container {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-buttons {
  display: flex;
  gap: 12px;
  position: relative;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.tab-btn:hover {
  border-color: var(--q-secondary);
  background: #f0f0f0;
}

.tab-btn.active {
  border-color: var(--q-secondary);
  background: var(--q-secondary);
  color: white;
  font-weight: 600;
}

.tab-btn.active .tab-indicator {
  background: white;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: var(--q-secondary);
  transition: transform 0.3s ease;
  transform: translateX(0);
}

.tab-btn:first-child .tab-indicator {
  transform: translateX(0);
}

.tab-btn:last-child .tab-indicator {
  transform: translateX(100%);
}

.tab-btn.active:last-child .tab-indicator {
  transform: translateX(0);
}

.tab-btn.active:first-child .tab-indicator {
  transform: translateX(0);
}

.tab-content {
  display: none;
}

.tab-content.active {
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
  gap: 16px;
}

.store-card {
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.store-card:hover {
  transform: translateY(-2px);
  border-color: var(--q-secondary);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.12);
}

.store-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.store-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.store-location {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
}

.store-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.delivery-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 0.85rem;
}

.delivery-fee {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff6b35;
  font-size: 0.85rem;
  font-weight: 500;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
}

.star.filled {
  color: #ffd700;
}

.rating-text {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

/* Responsive Design */
@media (min-width: 768px) {
  .stores-shopping-page {
    padding: 32px 24px;
  }
  
  .stores-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-buttons {
  display: flex;
  gap: 12px;
  position: relative;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.tab-btn:hover {
  border-color: var(--q-secondary);
  background: #f0f0f0;
}

.tab-btn.active {
  border-color: var(--q-secondary);
  background: var(--q-secondary);
  color: white;
  font-weight: 600;
}

.tab-btn.active .tab-indicator {
  background: white;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: var(--q-secondary);
  transition: transform 0.3s ease;
  transform: translateX(0);
}

.orders-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff6b35;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid white;
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
</style>
