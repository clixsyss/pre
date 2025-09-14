<template>
  <div class="store-details-page">
    <!-- Minimal Header -->
    <div class="store-header">
      <div class="header-content">
        <!-- Back Button -->
        <button class="back-button" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back
        </button>
        
        <div class="store-main-content">
          <div class="store-basic-info">
            <div class="store-image">
              <img v-if="store?.image" :src="store.image" :alt="store?.name" />
              <div v-else class="store-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div class="store-info">
              <div class="store-name-container">
                <h1 class="store-name">{{ store?.name }}</h1>
                <div 
                  v-if="store?.status && store.status !== 'active'"
                  class="store-status-badge"
                  :class="store.status"
                >
                  {{ store.status === 'inactive' ? 'CLOSED' : 'MAINTENANCE' }}
                </div>
              </div>
              <div class="store-meta">
                <span class="location">{{ store?.location }}</span>
                <span class="delivery">{{ store?.averageDeliveryTime }} delivery</span>
                <span v-if="store?.deliveryFee" class="delivery-fee">${{ store.deliveryFee }} delivery fee</span>
              </div>
              
              <!-- Store Rating -->
              <div v-if="store?.rating" class="store-rating">
                <div class="rating-stars">
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
                <span class="rating-value">{{ (store.rating || 0).toFixed(1) }}</span>
                <span class="rating-count">
                  {{ (store.reviewCount || 0) === 0 ? 'No reviews yet' : `(${store.reviewCount} reviews)` }}
                </span>
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
          :data-product-id="product.id"
          class="product-card"
        >
          <!-- Product Image with Category Badge -->
          <div class="product-image-container">
            <div class="product-image">
              <img 
                v-if="product.image" 
                :src="product.image" 
                :alt="product.name"
                @load="handleImageLoad"
                @error="handleImageError"
                class="product-img"
              />
              <div 
                class="product-placeholder"
                :class="{ 'show': shouldShowPlaceholder(product) }"
                v-show="shouldShowPlaceholder(product)"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            
            <!-- Category Badge -->
            <div class="category-badge" v-if="product.category">
              <span>{{ product.category.toUpperCase() }}</span>
            </div>
            
            <!-- Quick Actions -->
            <div class="product-actions">
              <button class="action-btn" @click.stop="toggleProductFavorite(product)" :class="{ active: isProductFavorite(product.id) }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Product Content -->
          <div class="product-content">
            <div class="product-header">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-rating" v-if="product.rating">
                <div class="stars">
                  <svg
                    v-for="star in 5"
                    :key="star"
                    :class="['star', { 'filled': star <= (product.rating || 0) }]"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span class="rating-text">{{ (product.rating || 0).toFixed(1) }}</span>
              </div>
            </div>
            
            <p v-if="product.description" class="product-description">{{ product.description }}</p>
            
            <div class="product-footer">
              <div class="price-section">
                <span class="product-price">${{ product.price }}</span>
                <span v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">${{ product.originalPrice }}</span>
              </div>
              
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
    <div v-if="showSuccessToast" class="toast success">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Added to cart</span>
    </div>

    <!-- Error Toast -->
    <div v-if="showErrorToast" class="toast error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>This store is currently inactive and not accepting orders</span>
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
const showErrorToast = ref(false);
const favoriteProducts = ref(new Set());
const imageLoadError = ref({});

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

// Helper function to check if we should show placeholder
const shouldShowPlaceholder = (product) => {
  return !product.image || imageLoadError.value[product.id];
};

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
      const storeData = storeDoc.data();
      
      // Fetch ratings for this store
      try {
        const ratingsRef = collection(db, `projects/${projectStore.selectedProject.id}/ratings`);
        const ratingsQuery = query(ratingsRef, where('storeId', '==', storeDoc.id));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        
        const ratings = ratingsSnapshot.docs.map(ratingDoc => ratingDoc.data().rating);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;
        
        store.value = {
          id: storeDoc.id,
          ...storeData,
          rating: parseFloat(averageRating.toFixed(1)),
          reviewCount: ratings.length
        };
      } catch (ratingError) {
        console.error('Error fetching ratings for store:', storeDoc.id, ratingError);
        store.value = {
          id: storeDoc.id,
          ...storeData,
          rating: 0,
          reviewCount: 0
        };
      }
      
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
    
    // Debug: Log product data to see what we're getting
    console.log('Fetched products:', products.value);
    products.value.forEach(product => {
      console.log(`Product: ${product.name}, Image: ${product.image}`);
    });
  } catch (error) {
    console.error('Error fetching store products:', error);
  }
};

const addToCart = async (product) => {
  if (!store.value) return;
  
  // Check if store is active (default to active if status is not set)
  if (store.value.status && store.value.status !== 'active') {
    // Show error message for inactive stores
    showErrorToast.value = true;
    setTimeout(() => {
      showErrorToast.value = false;
    }, 3000);
    return;
  }
  
  try {
    addingToCart.value = product.id;
    
    // Add to cart store
    cartStore.addItem(product, store.value.id, store.value.name, store.value.deliveryFee || 0);
    
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

const goBack = () => {
  router.back();
};

// Product favorite methods
const toggleProductFavorite = (product) => {
  if (favoriteProducts.value.has(product.id)) {
    favoriteProducts.value.delete(product.id);
  } else {
    favoriteProducts.value.add(product.id);
  }
  // Save to localStorage
  localStorage.setItem('favoriteProducts', JSON.stringify(Array.from(favoriteProducts.value)));
};

const isProductFavorite = (productId) => {
  return favoriteProducts.value.has(productId);
};

// Load favorites from localStorage on mount
const loadProductFavorites = () => {
  const saved = localStorage.getItem('favoriteProducts');
  if (saved) {
    try {
      favoriteProducts.value = new Set(JSON.parse(saved));
    } catch (error) {
      console.error('Error loading product favorites:', error);
    }
  }
};

// Image handling methods
const handleImageLoad = (event) => {
  console.log('Image loaded successfully:', event.target.src);
  event.target.style.display = 'block';
};

const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src);
  const productId = event.target.closest('.product-card')?.getAttribute('data-product-id') || 
                   event.target.alt || 'unknown';
  imageLoadError.value[productId] = true;
  event.target.style.display = 'none';
};

// Lifecycle
onMounted(() => {
  loadProductFavorites();
  fetchStore();
});
</script>

<style scoped>
.store-details-page {
  background: #f8f9fa;
  min-height: 100vh;
}

.store-header {
  background: white;
  padding: 24px 20px;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.back-button:hover {
  background: #f8f9fa;
  border-color: #d1d5db;
  color: #374151;
  transform: translateX(-2px);
}

.store-main-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  width: 100%;
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
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: all 0.3s ease;
}

.store-image:hover img {
  transform: scale(1.05);
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

.store-info {
  flex: 1;
}

.store-name-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.store-name {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.5px;
}

.store-status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.store-status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.store-status-badge.maintenance {
  background: #fef3c7;
  color: #d97706;
}

.store-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.rating-stars {
  display: flex;
  gap: 2px;
}

.rating-stars .star {
  color: #d1d5db;
  transition: color 0.2s;
}

.rating-stars .star.filled {
  color: #fbbf24;
}

.rating-value {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.rating-count {
  font-size: 0.8rem;
  color: #6b7280;
}

.store-meta {
  display: flex;
  gap: 12px;
  color: #6b7280;
  font-size: 1rem;
}

.location,
.delivery,
.delivery-fee {
  display: flex;
  align-items: center;
  gap: 4px;
}

.delivery-fee {
  color: #AF1E23;
  font-weight: 500;
}

.cart-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #231F20;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.cart-button:hover {
  background-color: #1a1a1a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #AF1E23;
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
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background-color: white;
  transition: all 0.2s ease;
}

.search-container:focus-within {
  border-color: #AF1E23;
  box-shadow: 0 0 0 3px rgba(243, 124, 78, 0.1);
}

.search-input {
  width: 100%;
  padding: 0;
  border: none;
  font-size: 1rem;
  color: #111827;
  background-color: transparent;
  outline: none;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-icon {
  color: #9ca3af;
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
  color: #6b7280;
  margin: 16px 0 0 0;
  font-size: 1rem;
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #AF1E23;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state svg {
  color: #9ca3af;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #6b7280;
  margin: 16px 0 0 0;
  font-size: 1.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #AF1E23;
}

.product-image-container {
  position: relative;
  height: auto;
  min-height: 200px;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
  position: relative;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-img {
  transform: scale(1.08);
  filter: brightness(1.05);
}

.product-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: none;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  position: absolute;
  top: 0;
  left: 0;
}

.product-placeholder.show {
  display: flex;
}

.product-placeholder svg {
  opacity: 0.6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.category-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  background: rgba(243, 124, 78, 0.9);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
}

.product-actions {
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

.product-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
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

.rating-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 600;
}

.product-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #AF1E23;
}

.original-price {
  font-size: 0.9rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #231F20;
  color: white;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.add-btn:hover {
  background-color: #1a1a1a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.add-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  color: white;
  transform: none;
  box-shadow: none;
}

.mini-spinner {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

.toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  opacity: 0.95;
  animation: toast-slide-up 0.3s ease-out;
  max-width: 90vw;
  text-align: center;
}

.toast.success {
  background-color: #21ba45;
  color: white;
  box-shadow: 0 8px 25px rgba(33, 186, 69, 0.3);
}

.toast.error {
  background-color: #e53e3e;
  color: white;
  box-shadow: 0 8px 25px rgba(229, 62, 62, 0.3);
}

@keyframes toast-slide-up {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 0.95;
    transform: translate(-50%, 0);
  }
}

.toast svg {
  width: 20px;
  height: 20px;
}

.toast span {
  font-weight: 600;
  font-size: 1rem;
}

/* Image Quality Improvements */
.product-image img,
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
@media (max-width: 768px) {
  .header-content {
    gap: 16px;
  }
  
  .store-main-content {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
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
  
  .back-button {
    align-self: flex-start;
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
