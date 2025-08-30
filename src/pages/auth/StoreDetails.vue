<template>
  <div class="store-details-page">
    <!-- Store Header -->
    <div class="store-header">
      <div class="store-header-content">
        <div class="store-info">
          <div class="store-image">
            <img v-if="store?.image" :src="store.image" :alt="store?.name" />
            <div v-else class="store-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div class="store-details">
            <h1 class="store-name">{{ store?.name }}</h1>
            <p class="store-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ store?.location }}
            </p>
            <p class="store-delivery">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ store?.averageDeliveryTime }} delivery
            </p>
            
            <div class="store-rating">
              <div class="stars">
                <svg
                  v-for="star in 5"
                  :key="star"
                  :class="star <= (store?.rating || 0) ? 'star-filled' : 'star-empty'"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span class="rating-text">{{ store?.rating || 0 }}/5</span>
            </div>
          </div>
        </div>
        
        <div class="store-actions">
          <button class="view-cart-btn" @click="viewCart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            View Cart
            <span v-if="cartStore.itemCount > 0" class="cart-badge">{{ cartStore.itemCount }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Store Content -->
    <div class="store-content">
      <!-- Working Hours -->
      <div v-if="store?.workingHours" class="section-card">
        <h3 class="section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
          </svg>
          Working Hours
        </h3>
        <div class="working-hours-grid">
          <div
            v-for="(hours, day) in store.workingHours"
            :key="day"
            class="day-hours"
          >
            <span class="day">{{ day.charAt(0).toUpperCase() + day.slice(1) }}</span>
            <span class="hours">{{ hours || 'Closed' }}</span>
          </div>
        </div>
      </div>

      <!-- Products Section -->
      <div class="section-card">
        <div class="section-header">
          <h3 class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Products
          </h3>
          
          <!-- Search and Filters -->
          <div class="products-filters">
            <div class="search-input-wrapper">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
                <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <input
                v-model="searchTerm"
                type="text"
                placeholder="Search products..."
                class="search-input"
              />
            </div>
            
            <select v-model="categoryFilter" class="category-filter">
              <option value="all">All Categories</option>
              <option value="food">Food & Beverage</option>
              <option value="drinks">Drinks</option>
              <option value="desserts">Desserts</option>
              <option value="snacks">Snacks</option>
              <option value="meals">Meals</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading products...</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="empty-products">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>

        <div v-else class="products-grid">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
          >
            <div class="product-image">
              <img v-if="product.image" :src="product.image" :alt="product.name" />
              <div v-else class="product-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p v-if="product.description" class="product-description">
                {{ product.description }}
              </p>
              <div class="product-price">${{ product.price }}</div>
            </div>
            
            <div class="product-actions">
              <button
                class="add-to-cart-btn"
                @click="addToCart(product)"
                :disabled="addingToCart === product.id"
              >
                <svg v-if="addingToCart !== product.id" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-else class="spinner-small"></div>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add to Cart Success Toast -->
    <div v-if="showSuccessToast" class="success-toast">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>Added to cart successfully!</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'src/boot/firebase';
import { useProjectStore } from 'src/stores/projectStore';
import { useCartStore } from 'src/stores/cartStore';

// Component name for ESLint
defineOptions({
  name: 'StoreDetailsPage'
});

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();
const cartStore = useCartStore();

// Reactive data
const store = ref(null);
const products = ref([]);
const loading = ref(false);
const searchTerm = ref('');
const categoryFilter = ref('all');
const addingToCart = ref(null);
const showSuccessToast = ref(false);

// Computed properties
const filteredProducts = computed(() => {
  let filtered = products.value;

  // Search filter
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(search) ||
      (product.description && product.description.toLowerCase().includes(search))
    );
  }

  // Category filter
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(product => product.category === categoryFilter.value);
  }

  return filtered;
});

// Methods
const fetchStore = async () => {
  if (!projectStore.selectedProject?.id || !route.params.storeId) return;
  
  try {
    loading.value = true;
    const storeRef = collection(db, `projects/${projectStore.selectedProject.id}/stores`);
    const storeQuery = query(storeRef, where('__name__', '==', route.params.storeId));
    const storeSnapshot = await getDocs(storeQuery);
    
    if (!storeSnapshot.empty) {
      const storeDoc = storeSnapshot.docs[0];
      store.value = {
        id: storeDoc.id,
        ...storeDoc.data()
      };
      
      // Fetch products for this store
      await fetchStoreProducts(storeDoc.id);
    } else {
      // Store not found, redirect to stores list
      router.push('/stores-shopping');
    }
  } catch (error) {
    console.error('Error fetching store:', error);
  } finally {
    loading.value = false;
  }
};

const fetchStoreProducts = async (storeId) => {
  if (!projectStore.selectedProject?.id) return;
  
  try {
    const productsRef = collection(db, `projects/${projectStore.selectedProject.id}/stores/${storeId}/products`);
    const productsSnapshot = await getDocs(productsRef);
    
    products.value = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching store products:', error);
  }
};

const addToCart = async (product) => {
  if (!store.value) return;
  
  try {
    addingToCart.value = product.id;
    
    // Add to cart store
    cartStore.addItem(product, store.value.id, store.value.name);
    
    // Show success toast
    showSuccessToast.value = true;
    
    // Auto-hide toast after 2 seconds
    setTimeout(() => {
      showSuccessToast.value = false;
    }, 2000);
    
  } catch (error) {
    console.error('Error adding to cart:', error);
  } finally {
    addingToCart.value = null;
  }
};

const viewCart = () => {
  router.push('/shopping-cart');
};

// Lifecycle
onMounted(() => {
  fetchStore();
});
</script>

<style scoped>
:root {
  --q-primary: #1976d2;
  --q-primary-dark: #1565c0;
  --q-red: #f44336;
  --q-green: #4caf50;
}

.store-details-page {
  background: #fafafa;
  min-height: 100vh;
}

.store-header {
  background: white;
  padding: 24px 20px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.store-header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.store-info {
  display: flex;
  gap: 20px;
  flex: 1;
}

.store-image {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
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
}

.store-details {
  flex: 1;
}

.store-name {
  font-size: 2rem;
  font-weight: 300;
  color: #333;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}

.store-location,
.store-delivery {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 1rem;
  margin: 0 0 8px 0;
}

.store-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star-filled {
  color: #ffd700;
}

.star-empty {
  color: #ddd;
}

.rating-text {
  font-weight: 600;
  color: #333;
}

.store-actions {
  flex-shrink: 0;
}

.view-cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--q-primary);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.view-cart-btn:hover {
  background-color: var(--q-primary-dark);
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--q-red);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  border: 2px solid white;
}

.store-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

.section-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
}

.working-hours-grid {
  display: grid;
  gap: 12px;
}

.day-hours {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.day-hours:last-child {
  border-bottom: none;
}

.day {
  font-weight: 500;
  color: #333;
}

.hours {
  color: #666;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.products-filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  color: #333;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: var(--q-primary);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.category-filter {
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  color: #333;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.category-filter:focus {
  border-color: var(--q-primary);
  outline: none;
}

.loading-state,
.empty-products {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p,
.empty-products p {
  color: #666;
  margin: 16px 0 0 0;
}

.empty-products h3 {
  color: #666;
  margin: 16px 0 0 0;
  font-size: 1.5rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--q-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.product-card:hover {
  border-color: var(--q-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--q-primary);
  margin-bottom: 16px;
}

.product-actions {
  display: flex;
  justify-content: center;
}

.add-to-cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--q-primary);
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.add-to-cart-btn:hover {
  background-color: var(--q-primary-dark);
}

.add-to-cart-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  color: #666;
}

.spinner-small {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--q-green);
  color: white;
  padding: 15px 25px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0.9;
}

.success-toast svg {
  width: 24px;
  height: 24px;
}

.success-toast span {
  font-weight: 500;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .store-header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .store-info {
    flex-direction: column;
    text-align: center;
  }
  
  .store-image {
    align-self: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .products-filters {
    flex-direction: column;
  }
  
  .search-input-wrapper,
  .category-filter {
    min-width: auto;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .store-header {
    padding: 32px 24px;
  }
  
  .store-content {
    padding: 40px 24px;
  }
  
  .store-name {
    font-size: 2.5rem;
  }
}
</style>
