<template>
  <div class="stores-shopping-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Stores & Shopping</h1>
        <p class="subtitle">Discover local stores and order products</p>
      </div>
    </div>

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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import { useProjectStore } from 'src/stores/projectStore';

// Component name for ESLint
defineOptions({
  name: 'StoresShoppingPage'
});

const router = useRouter();
const projectStore = useProjectStore();

// Reactive data
const stores = ref([]);
const loading = ref(false);
const searchTerm = ref('');
const categoryFilter = ref('all');
const sortBy = ref('rating');

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

// Methods
const fetchStores = async () => {
  if (!projectStore.selectedProject?.id) return;
  
  try {
    loading.value = true;
    const storesRef = collection(db, `projects/${projectStore.selectedProject.id}/stores`);
    const querySnapshot = await getDocs(storesRef);
    
    stores.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching stores:', error);
  } finally {
    loading.value = false;
  }
};

const navigateToStore = (store) => {
  router.push(`/store/${store.id}`);
};

// Lifecycle
onMounted(() => {
  fetchStores();
});
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
  justify-content: space-between;
  align-items: center;
}

.delivery-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 0.85rem;
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
</style>
