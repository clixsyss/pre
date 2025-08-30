<template>
  <div class="store-details-page">
    <!-- Minimal Header -->
    <div class="store-header">
      <div class="header-content">
        <div class="store-basic-info">
          <div class="store-image">
            <img v-if="store?.image" :src="store.image" :alt="store?.name" />
            <div v-else class="store-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div class="store-info">
            <h1 class="store-name">{{ store?.name }}</h1>
            <div class="store-meta">
              <span class="location">{{ store?.location }}</span>
              <span class="delivery">{{ store?.averageDeliveryTime }} delivery</span>
            </div>
          </div>
        </div>
        
        <button class="cart-button" @click="viewCart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="cartStore.itemCount > 0" class="cart-count">{{ cartStore.itemCount }}</span>
        </button>
      </div>
    </div>

    <!-- Simple Search -->
    <div class="search-section">
      <div class="search-container">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </div>

    <!-- Products Grid -->
    <div class="products-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p>No products found</p>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div class="product-content">
            <h3 class="product-name">{{ product.name }}</h3>
            <p v-if="product.description" class="product-description">{{ product.description }}</p>
            <div class="product-footer">
              <span class="product-price">${{ product.price }}</span>
              <button
                class="add-btn"
                @click="addToCart(product)"
                :disabled="addingToCart === product.id"
              >
                <svg v-if="addingToCart !== product.id" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div v-else class="mini-spinner"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="toast">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Added to cart</span>
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

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.store-basic-info {
  display: flex;
  gap: 20px;
  align-items: center;
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

.store-info {
  flex: 1;
}

.store-name {
  font-size: 2rem;
  font-weight: 300;
  color: #333;
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}

.store-meta {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 1rem;
}

.location,
.delivery {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cart-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #1976d2;
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

.cart-button:hover {
  background-color: #1565c0;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f44336;
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

.search-section {
  background: white;
  padding: 20px 20px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background-color: #f8f9fa;
}

.search-input {
  width: 100%;
  padding: 0;
  border: none;
  font-size: 1rem;
  color: #333;
  background-color: transparent;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.search-icon {
  color: #999;
}

.products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p,
.empty-state p {
  color: #666;
  margin: 16px 0 0 0;
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state svg {
  color: #666;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #666;
  margin: 16px 0 0 0;
  font-size: 1.5rem;
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
  border-color: #1976d2;
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

.product-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.product-price {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1976d2;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #1976d2;
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.add-btn:hover {
  background-color: #1565c0;
}

.add-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  color: #666;
}

.mini-spinner {
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

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4caf50;
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

.toast svg {
  width: 20px;
  height: 20px;
}

.toast span {
  font-weight: 500;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .store-basic-info {
    flex-direction: column;
    text-align: center;
  }
  
  .store-image {
    align-self: center;
  }
  
  .cart-button {
    width: 100%;
    justify-content: center;
  }

  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
    padding: 10px;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1024px) {
  .store-header {
    padding: 32px 24px;
  }
  
  .products-container {
    padding: 40px 24px;
  }
  
  .store-name {
    font-size: 2.5rem;
  }
}
</style>
