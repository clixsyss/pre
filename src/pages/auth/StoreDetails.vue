<template>
  <q-page class="store-details-page">
    <!-- Store Header -->
    <div class="store-header">
      <div class="store-header-content">
        <div class="store-info">
          <div class="store-image">
            <img v-if="store?.image" :src="store.image" :alt="store?.name" />
            <div v-else class="store-placeholder">
              <q-icon name="store" size="48px" color="grey-4" />
            </div>
          </div>
          
          <div class="store-details">
            <h1 class="store-name">{{ store?.name }}</h1>
            <p class="store-location">
              <q-icon name="place" size="16px" />
              {{ store?.location }}
            </p>
            <p class="store-delivery">
              <q-icon name="schedule" size="16px" />
              {{ store?.averageDeliveryTime }} delivery
            </p>
            
            <div class="store-rating">
              <div class="stars">
                <q-icon
                  v-for="star in 5"
                  :key="star"
                  :name="star <= (store?.rating || 0) ? 'star' : 'star_border'"
                  :class="star <= (store?.rating || 0) ? 'star-filled' : 'star-empty'"
                  size="20px"
                />
              </div>
              <span class="rating-text">{{ store?.rating || 0 }}/5</span>
            </div>
          </div>
        </div>
        
        <div class="store-actions">
          <q-btn
            color="primary"
            icon="shopping_cart"
            label="View Cart"
            @click="viewCart"
            :badge="cartStore.itemCount || undefined"
            badge-color="red"
          />
        </div>
      </div>
    </div>

    <!-- Store Content -->
    <div class="store-content">
      <!-- Working Hours -->
      <div v-if="store?.workingHours" class="section-card">
        <h3 class="section-title">
          <q-icon name="schedule" size="20px" />
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
            <q-icon name="inventory_2" size="20px" />
            Products
          </h3>
          
          <!-- Search and Filters -->
          <div class="products-filters">
            <q-input
              v-model="searchTerm"
              placeholder="Search products..."
              dense
              outlined
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
            
            <q-select
              v-model="categoryFilter"
              :options="categoryOptions"
              dense
              outlined
              class="category-filter"
              label="Category"
            />
          </div>
        </div>

        <!-- Products Grid -->
        <div v-if="loading" class="loading-state">
          <q-spinner size="40px" color="primary" />
          <p>Loading products...</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="empty-products">
          <q-icon name="inventory_2" size="64px" color="grey-4" />
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
                <q-icon name="inventory_2" size="32px" color="grey-4" />
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
              <q-btn
                color="primary"
                icon="add_shopping_cart"
                size="sm"
                @click="addToCart(product)"
                :loading="addingToCart === product.id"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add to Cart Success Toast -->
    <q-dialog v-model="showSuccessToast" position="bottom">
      <q-card class="success-toast">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="32px" color="positive" />
          <p class="toast-message">Added to cart successfully!</p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../boot/firebase';
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
const categoryOptions = computed(() => [
  { label: 'All Categories', value: 'all' },
  { label: 'Food & Beverage', value: 'food' },
  { label: 'Drinks', value: 'drinks' },
  { label: 'Desserts', value: 'desserts' },
  { label: 'Snacks', value: 'snacks' },
  { label: 'Meals', value: 'meals' },
  { label: 'Other', value: 'other' }
]);

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

.search-input {
  min-width: 250px;
}

.category-filter {
  min-width: 150px;
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

.success-toast {
  background: #4caf50;
  color: white;
  border-radius: 12px;
  padding: 16px 24px;
}

.toast-message {
  margin: 8px 0 0 0;
  font-weight: 500;
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
  
  .search-input,
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
