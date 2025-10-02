<template>
  <div class="shopping-cart-page">
    <PageHeader title="Shopping Cart" subtitle="Review your items and place your order" />

    <!-- Cart Items -->
    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <div class="empty-cart-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>Your cart is empty</h2>
      <p>Add some products from our stores to get started</p>
      <button class="browse-stores-btn" @click="browseStores">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Browse Stores
      </button>
    </div>

    <div v-else class="cart-content">
      <!-- Cart Items List -->
      <div class="cart-items">
        <div class="cart-items-header">
          <h2>Cart Items ({{ totalItems }})</h2>
        </div>
        
        <div class="cart-items-list">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-item"
          >
            <div class="item-main">
              <div class="item-image">
                <img v-if="item.image" :src="item.image" :alt="item.name" />
                <div v-else class="item-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7L10 17L5 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div class="item-details">
                <h3 class="item-name">{{ item.name }}</h3>
                <div class="item-meta">
                  <span class="item-store">{{ item.storeName }}</span>
                  <span class="item-price">EGP {{ item.price }}</span>
                </div>
                <p class="item-description">{{ item.description }}</p>
              </div>
            </div>
            
            <div class="item-actions">
              <div class="quantity-controls">
                <button 
                  class="quantity-btn"
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                
                <span class="quantity">{{ item.quantity }}</span>
                
                <button 
                  class="quantity-btn"
                  @click="increaseQuantity(item)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div class="item-total">
                <span class="total-amount">EGP {{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
              
              <button class="remove-btn" @click="removeItem(item)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <div class="summary-header">
          <h2>Order Summary</h2>
        </div>
        
        <div class="summary-content">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>EGP{{ subtotal.toFixed(2) }}</span>
          </div>
          
          <div class="summary-row">
            <span>Delivery Fee</span>
            <span>EGP{{ deliveryFee.toFixed(2) }}</span>
          </div>
          
          <div v-if="cartStore.items.length > 0 && cartStore.items[0].storeDeliveryFee" class="summary-note">
            <small>Store delivery fee</small>
          </div>
          
          <div class="summary-row total">
            <span>Total</span>
            <span>EGP{{ total.toFixed(2) }}</span>
          </div>
        </div>
        
        <button 
          class="place-order-btn"
          @click="placeOrder"
          :disabled="placingOrder"
        >
          <svg v-if="!placingOrder" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="placingOrder">Placing Order...</span>
          <span v-else>Place Order</span>
        </button>
      </div>
    </div>

    <!-- Order Confirmation Modal -->
    <div v-if="showOrderConfirmation" class="modal-overlay" @click="closeOrderConfirmation">
      <div class="modal-content" @click.stop>
        <div class="modal-body">
          <!-- Success Header -->
          <div class="success-header">
            <div class="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3>Order Confirmed!</h3>
            <p class="order-number">#{{ orderNumber }}</p>
            <div class="order-status-badge">
              <span class="status-dot"></span>
              <span>Pending</span>
            </div>
          </div>
          
          <!-- Order Summary Card -->
          <div class="order-summary-card">
            <div class="summary-header">
              <h4>Order Summary</h4>
              <div class="order-meta">
                <span class="order-time">{{ orderTime }}</span>
                <span class="order-items-count">{{ orderItemCount }} items</span>
              </div>
            </div>
            
            <!-- Order Items -->
            <div class="order-items-section">
              <div 
                v-for="item in orderItems" 
                :key="item.id" 
                class="order-item-card"
              >
                <div class="item-main">
                  <div class="item-details">
                    <h5 class="item-name">{{ item.name }}</h5>
                    <p class="item-store">{{ item.storeName }}</p>
                  </div>
                  <div class="item-quantity-badge">
                    {{ item.quantity }}
                  </div>
                </div>
                <div class="item-price">EGP {{ (item.price * item.quantity).toFixed(2) }}</div>
              </div>
            </div>
            
            <!-- Order Totals -->
            <div class="order-totals-section">
              <div class="total-row">
                <span>Subtotal</span>
                <span>EGP{{ orderSubtotal.toFixed(2) }}</span>
              </div>
              <div class="total-row">
                <span>Delivery Fee</span>
                <span>EGP{{ orderDeliveryFee.toFixed(2) }}</span>
              </div>
              <div class="total-row total-amount">
                <span>Total</span>
                <span>EGP{{ orderTotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Delivery Info Card -->
          <div class="delivery-info-card">
            <div class="delivery-header">
              <div class="delivery-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 3h5v5M21 3l-7 7M8 21l-5-5v-5h5l5 5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h4>Delivery Information</h4>
            </div>
            <div class="delivery-details">
              <div class="delivery-time">
                <span class="delivery-label">Estimated Delivery</span>
                <span class="delivery-value">{{ estimatedDelivery }}</span>
              </div>
              <p class="delivery-message">We'll notify you when your order is ready for pickup or delivery.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="continue-shopping-btn" @click="continueShopping">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div v-if="showRatingModal" class="rating-modal-overlay" @click="skipRating">
      <div class="rating-modal-content" @click.stop>
        <!-- Header with Store Info -->
        <div class="rating-header">
          <div class="store-info-card">
            <div class="store-avatar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="store-details">
              <h3>{{ storesToRate[currentStoreIndex]?.name }}</h3>
              <p>How was your experience?</p>
            </div>
          </div>
          
          <!-- Progress Indicator -->
          <div class="progress-indicator">
            <span class="progress-text">{{ currentStoreIndex + 1 }} of {{ storesToRate.length }}</span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${((currentStoreIndex + 1) / storesToRate.length) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Rating Section -->
        <div class="rating-section">
          <!-- Star Rating -->
          <div class="star-rating-container">
            <div class="stars-wrapper">
              <button
                v-for="star in 5"
                :key="star"
                class="star-button"
                :class="{ 
                  'filled': star <= currentRating,
                  'hover': star <= (hoverRating || currentRating)
                }"
                @click="currentRating = star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
            </div>
            
            <!-- Rating Text -->
            <div class="rating-feedback">
              <h4 class="rating-title">{{ getRatingText(currentRating) }}</h4>
              <p class="rating-subtitle">{{ getRatingDescription(currentRating) }}</p>
            </div>
          </div>
          
          <!-- Comment Section -->
          <div class="comment-container">
            <label for="rating-comment" class="comment-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Share your experience (optional)
            </label>
            <textarea
              id="rating-comment"
              v-model="ratingComment"
              placeholder="What made your experience great? Any suggestions for improvement?"
              class="comment-textarea"
              rows="3"
              maxlength="200"
            ></textarea>
            <div class="character-count">{{ ratingComment.length }}/200</div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="rating-actions">
          <button class="skip-button" @click="skipRating">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 14l-7-7m0 0l-7 7m7-7v18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Skip
          </button>
          <button 
            class="submit-button" 
            @click="submitRating"
            :disabled="currentRating === 0"
            :class="{ 'disabled': currentRating === 0 }"
          >
            <span>{{ currentStoreIndex === storesToRate.length - 1 ? 'Finish Rating' : 'Rate Next Store' }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import firestoreService from 'src/services/firestoreService';
import optimizedAuthService from 'src/services/optimizedAuthService';
import { useProjectStore } from 'src/stores/projectStore';
import { useCartStore } from 'src/stores/cartStore';
import { useNotificationStore } from 'src/stores/notifications';
import PageHeader from 'src/components/PageHeader.vue';

// Component name for ESLint
defineOptions({
  name: 'ShoppingCartPage'
});

const router = useRouter();
const projectStore = useProjectStore();
const notificationStore = useNotificationStore();
const cartStore = useCartStore();

// Reactive data
const placingOrder = ref(false);
const showOrderConfirmation = ref(false);
const showRatingModal = ref(false);
const orderNumber = ref('');
const estimatedDelivery = ref('');
const orderTime = ref('');
const orderItems = ref([]);
const orderSubtotal = ref(0);
const orderDeliveryFee = ref(0);
const orderTotal = ref(0);
const orderItemCount = ref(0);
const storesToRate = ref([]);
const currentStoreIndex = ref(0);
const currentRating = ref(0);
const hoverRating = ref(0);
const ratingComment = ref('');

// Computed properties
const subtotal = computed(() => {
  try {
    return cartStore?.subtotal || 0;
  } catch (error) {
    console.error('Error computing subtotal:', error);
    return 0;
  }
});

const deliveryFee = computed(() => {
  try {
    return cartStore?.deliveryFee || 0;
  } catch (error) {
    console.error('Error computing delivery fee:', error);
    return 0;
  }
});

const total = computed(() => {
  try {
    return cartStore?.total || 0;
  } catch (error) {
    console.error('Error computing total:', error);
    return 0;
  }
});

const totalItems = computed(() => {
  try {
    return cartStore?.itemCount || 0;
  } catch (error) {
    console.error('Error computing total items:', error);
    return 0;
  }
});

// Methods
const increaseQuantity = (item) => {
  cartStore.updateQuantity(item.id, item.quantity + 1);
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1);
  }
};

const removeItem = (item) => {
  cartStore.removeItem(item.id);
};

const placeOrder = async () => {
  const user = await optimizedAuthService.getCurrentUser();
  if (!projectStore.selectedProject?.id || !user) {
    console.error('Missing project or user information');
    return;
  }

  console.log('🔍 Starting order placement process...');
  console.log('🔍 User:', user.uid);
  console.log('🔍 Project:', projectStore.selectedProject.id);
  console.log('🔍 Cart items:', cartStore.items.length);

  // Validate that all stores are active
  if (cartStore.items.length > 0) {
    const storeIds = [...new Set(cartStore.items.map(item => item.storeId))];
    console.log('🔍 Validating store status for stores:', storeIds);
    
    for (const storeId of storeIds) {
      try {
        const storeDocPath = `projects/${projectStore.selectedProject.id}/stores/${storeId}`;
        const storeDoc = await firestoreService.getDoc(storeDocPath);
        
        if (storeDoc.exists) {
          const storeData = storeDoc.data();
          console.log('🔍 Store status check:', { storeId, status: storeData.status, name: storeData.name });
          
          if (storeData.status && storeData.status !== 'active') {
            notificationStore.showError(`Cannot place order: ${storeData.name} is currently inactive and not accepting orders.`);
            return;
          }
        } else {
          console.error('❌ Store not found:', storeId);
          notificationStore.showError('Store not found. Please try again.');
          return;
        }
      } catch (error) {
        console.error('❌ Error checking store status:', error);
        notificationStore.showError('Error validating store status. Please try again.');
        return;
      }
    }
  }

  try {
    placingOrder.value = true;
    console.log('🔍 Order validation passed, creating order...');
    
    // Generate order number
    orderNumber.value = 'ORD-' + Date.now().toString().slice(-6);
    
    // Calculate estimated delivery
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
    estimatedDelivery.value = deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    orderTime.value = now.toLocaleString();
    
    // Store order data for confirmation modal before clearing cart
    orderItems.value = [...cartStore.items];
    orderSubtotal.value = subtotal.value;
    orderDeliveryFee.value = deliveryFee.value;
    orderTotal.value = total.value;
    orderItemCount.value = totalItems.value;
    
    // Create order in Firestore
    const orderData = {
      orderNumber: orderNumber.value,
      userId: user.uid,
      userEmail: user.email,
      projectId: projectStore.selectedProject.id,
      items: cartStore.items.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        storeId: item.storeId,
        storeName: item.storeName
      })),
      subtotal: subtotal.value,
      deliveryFee: deliveryFee.value,
      total: total.value,
      status: 'pending',
      createdAt: new Date(), // Use regular Date instead of serverTimestamp for consistency
      estimatedDelivery: estimatedDelivery.value
    };

    console.log('🔍 Order data prepared:', orderData);
    
    const collectionPath = `projects/${projectStore.selectedProject.id}/orders`;
    const result = await firestoreService.addDoc(collectionPath, orderData);
    
    console.log('✅ Order created successfully:', result);
    
    // Store the order data for rating before clearing cart
    const orderStores = [...new Set(cartStore.items.map(item => ({
      id: item.storeId,
      name: item.storeName
    })))];
    
    // Clear cart
    cartStore.clearCart();
    
    // Store the order stores for rating
    storesToRate.value = orderStores;
    
    // Show confirmation
    showOrderConfirmation.value = true;
    
    notificationStore.showSuccess('Order placed successfully!');
    
  } catch (error) {
    console.error('❌ Error placing order:', error);
    notificationStore.showError('Failed to place order. Please try again.');
  } finally {
    placingOrder.value = false;
  }
};

const closeOrderConfirmation = () => {
  showOrderConfirmation.value = false;
};

const continueShopping = () => {
  showOrderConfirmation.value = false;
  // Start rating process
  startRatingProcess();
};

const startRatingProcess = () => {
  // Use the stored order stores (already set during order placement)
  console.log('Starting rating process for stores:', storesToRate.value);
  currentStoreIndex.value = 0;
  currentRating.value = 0;
  ratingComment.value = '';
  
  if (storesToRate.value.length > 0) {
    console.log('Showing rating modal');
    showRatingModal.value = true;
  } else {
    console.log('No stores to rate, navigating to stores');
    router.push('/stores-shopping');
  }
};

const getRatingText = (rating) => {
  const texts = {
    0: 'Select a rating',
    1: 'Poor',
    2: 'Fair', 
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };
  return texts[rating] || 'Select a rating';
};

const getRatingDescription = (rating) => {
  const descriptions = {
    0: 'Tap a star to rate your experience',
    1: 'We\'re sorry to hear that. We\'ll work to improve!',
    2: 'Thanks for the feedback. We\'re always improving!',
    3: 'Glad you had a good experience!',
    4: 'Wonderful! We\'re thrilled you enjoyed it!',
    5: 'Amazing! Thank you for the perfect rating!'
  };
  return descriptions[rating] || 'Tap a star to rate your experience';
};

const submitRating = async () => {
  if (currentRating.value === 0) return;
  
  try {
    const user = await optimizedAuthService.getCurrentUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    
    const store = storesToRate.value[currentStoreIndex.value];
    
    // Add rating to Firestore
    const ratingData = {
      storeId: store.id,
      storeName: store.name,
      userId: user.uid,
      userEmail: user.email,
      rating: currentRating.value,
      comment: ratingComment.value,
      orderNumber: orderNumber.value,
      createdAt: new Date() // Use regular Date instead of serverTimestamp
    };
    
    const collectionPath = `projects/${projectStore.selectedProject.id}/ratings`;
    await firestoreService.addDoc(collectionPath, ratingData);
    
    // Update store's average rating
    await updateStoreRating(store.id);
    
    // Move to next store or finish
    if (currentStoreIndex.value < storesToRate.value.length - 1) {
      currentStoreIndex.value++;
      currentRating.value = 0;
      ratingComment.value = '';
    } else {
      // All stores rated, go to stores page
      showRatingModal.value = false;
      router.push('/stores-shopping');
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
    notificationStore.showError('Error submitting rating. Please try again.');
  }
};

const skipRating = () => {
  showRatingModal.value = false;
  router.push('/stores-shopping');
};

const updateStoreRating = async (storeId) => {
  try {
    // Get current store data
    const storeDocPath = `projects/${projectStore.selectedProject.id}/stores/${storeId}`;
    const storeDoc = await firestoreService.getDoc(storeDocPath);
    
    if (storeDoc.exists) {
      // Get all ratings for this store
      const ratingsPath = `projects/${projectStore.selectedProject.id}/ratings`;
      const ratingsQueryOptions = {
        filters: [
          { field: 'storeId', operator: '==', value: storeId }
        ],
        timeoutMs: 6000
      };
      const ratingsResult = await firestoreService.getDocs(ratingsPath, ratingsQueryOptions);
      
      const ratings = ratingsResult.docs.map(doc => {
        const ratingData = doc.data();
        return ratingData.rating;
      });
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      // Update store with new average rating
      const updateData = {
        rating: parseFloat(averageRating.toFixed(1)),
        reviewCount: ratings.length,
        updatedAt: new Date() // Use regular Date instead of serverTimestamp
      };
      
      await firestoreService.updateDoc(storeDocPath, updateData);
    }
  } catch (error) {
    console.error('Error updating store rating:', error);
  }
};

const browseStores = () => {
  router.push('/stores-shopping');
};

// Lifecycle
onMounted(() => {
  try {
    console.log('ShoppingCart component mounted');
    console.log('Cart store before loading:', cartStore);
    
    // Check if cart store is properly initialized
    if (!cartStore) {
      console.error('Cart store is not initialized!');
      return;
    }
    
    // Load cart from localStorage
    cartStore.loadCart();
    console.log('Cart loaded successfully');
    console.log('Cart store after loading:', cartStore);
    console.log('Cart items after loading:', cartStore.items);
    console.log('Cart itemCount after loading:', cartStore.itemCount);
    
  } catch (error) {
    console.error('Error loading cart:', error);
    // Initialize empty cart if there's an error
    if (cartStore) {
      cartStore.items = [];
    }
  }
});
</script>

<style scoped>
.shopping-cart-page {
  padding: 20px 16px;
  background: #fafafa;
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: #F6F6F6;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(175, 30, 35, 0.2);
}

.hero-content {
  width: 100%;
}

.hero-header {
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateX(-2px);
}

.hero-text {
  flex-direction: column;
  gap: 4px;
}

.hero-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  margin-top: 4px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;
}

.empty-cart-icon {
  color: #ccc;
  margin-bottom: 24px;
}

.empty-cart h2 {
  color: #666;
  margin: 0 0 16px 0;
  font-size: 1.5rem;
}

.empty-cart p {
  color: #999;
  margin: 0 0 32px 0;
}

.browse-stores-btn {
  background: var(--q-secondary);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.browse-stores-btn:hover {
  background: #c6c6c6;
  color: #231F20;
  transform: translateY(-2px);
}

.cart-content {
  display: grid;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.cart-items {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.cart-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.cart-items-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 20px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-store {
  color: #666;
  font-size: 0.9rem;
}

.item-price {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--q-secondary);
}

.item-description {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: flex-end;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
}

.quantity-btn {
  background: white;
  border: 1px solid #e0e0e0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--q-secondary);
  color: white;
  border-color: var(--q-secondary);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  font-weight: 600;
  color: #333;
  min-width: 20px;
  text-align: center;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  margin-top: 16px;
}

.total-label {
  font-size: 0.9rem;
  color: #666;
}

.total-amount {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--q-secondary);
}

.remove-btn {
  background: #ff4757;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #ff3742;
  transform: scale(1.05);
}

.order-summary {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.summary-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  border-top: 2px solid #e0e0e0;
  margin-top: 16px;
  padding-top: 20px;
}

.summary-note {
  text-align: center;
  margin: -8px 0 16px 0;
}

.summary-note small {
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
}

.place-order-btn {
  width: 100%;
  background: var(--q-secondary);
  color: white;
  border: none;
  padding: 18px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.place-order-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-2px);
}

.place-order-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #999;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.modal-body {
  padding: 0;
  background: #fafbfc;
}

/* Success Header */
.success-header {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  position: relative;
}

.success-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.success-icon {
  color: white;
  margin-bottom: 16px;
  opacity: 0.9;
}

.success-header h3 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.order-number {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  font-family: 'Monaco', 'Menlo', monospace;
}

.order-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #fbbf24;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Order Summary Card */
.order-summary-card {
  background: white;
  margin: 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.summary-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.summary-header h4 {
  color: #111827;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.order-time {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.order-items-count {
  font-size: 0.85rem;
  color: #AF1E23;
  font-weight: 600;
  background: #fef7f0;
  padding: 4px 8px;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span:first-child {
  color: #666;
  font-weight: 500;
}

.detail-row span:last-child {
  color: #333;
  font-weight: 600;
}

/* Order Items Section */
.order-items-section {
  padding: 0 24px 20px;
}

.order-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.order-item-card:last-child {
  border-bottom: none;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.item-store {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.item-quantity-badge {
  background: #AF1E23;
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  min-width: 32px;
  text-align: center;
}

.item-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

/* Order Totals Section */
.order-totals-section {
  padding: 20px 24px;
  background: #f8f9fa;
  border-top: 1px solid #f1f5f9;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.95rem;
  color: #6b7280;
}

.total-row:not(.total-amount) {
  border-bottom: 1px solid #e5e7eb;
}

.total-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111827;
  border-top: 2px solid #e5e7eb;
  margin-top: 12px;
  padding-top: 16px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Delivery Info Card */
.delivery-info-card {
  background: white;
  margin: 0 24px 24px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.delivery-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 12px;
}

.delivery-icon {
  width: 40px;
  height: 40px;
  background: #fef7f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #AF1E23;
}

.delivery-header h4 {
  color: #111827;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.delivery-details {
  padding: 20px 24px;
}

.delivery-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.delivery-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.delivery-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #AF1E23;
  background: #fef7f0;
  padding: 6px 12px;
  border-radius: 8px;
}

.delivery-message {
  color: #6b7280;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

.modal-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
}

.continue-shopping-btn {
  width: 100%;
  background: var(--q-secondary);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-shopping-btn:hover {
  background: #c6c6c6;
  color: #231F20;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .shopping-cart-page {
    padding: 12px;
  }
  
  .page-header {
    padding: 20px 16px;
    margin-bottom: 20px;
  }
  
  .header-content h1 {
    font-size: 1.6rem;
  }
  
  .cart-content {
    gap: 16px;
  }
  
  .cart-items,
  .order-summary {
    padding: 16px;
    border-radius: 12px;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px 0;
  }
  
  .item-main {
    gap: 12px;
  }
  
  .item-image {
    width: 60px;
    height: 60px;
  }
  
  .item-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    min-width: auto;
    gap: 12px;
  }
  
  .quantity-controls {
    gap: 8px;
    padding: 6px 10px;
  }
  
  .quantity-btn {
    width: 24px;
    height: 24px;
  }
  
  .item-total {
    text-align: center;
    align-items: center;
  }
  
  .remove-btn {
    width: 28px;
    height: 28px;
  }
  
  .summary-row {
    font-size: 0.95rem;
    padding: 10px 0;
  }
  
  .place-order-btn {
    padding: 16px;
    font-size: 1rem;
  }
  
  /* Modal responsive adjustments */
  .success-header {
    padding: 24px 20px;
  }
  
  .success-header h3 {
    font-size: 1.3rem;
  }
  
  .order-summary-card,
  .delivery-info-card {
    margin: 16px;
    border-radius: 16px;
  }
  
  .summary-header,
  .delivery-header {
    padding: 16px 20px 12px;
  }
  
  .order-items-section,
  .delivery-details {
    padding: 0 20px 16px;
  }
  
  .order-totals-section {
    padding: 16px 20px;
  }
  
  .order-item-card {
    padding: 12px 0;
  }
  
  .item-main {
    gap: 8px;
  }
  
  .item-name {
    font-size: 0.9rem;
  }
  
  .item-store {
    font-size: 0.8rem;
  }
  
  .item-quantity-badge {
    padding: 4px 8px;
    font-size: 0.75rem;
    min-width: 28px;
  }
  
  .item-price {
    font-size: 1rem;
  }
  
  .total-amount {
    font-size: 1.1rem;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .shopping-cart-page {
    padding: 8px;
  }
  
  .page-header {
    padding: 16px 12px;
  }
  
  .header-content h1 {
    font-size: 1.4rem;
  }
  
  .cart-items,
  .order-summary {
    padding: 12px;
  }
  
  .cart-items-header h2 {
    font-size: 1.3rem;
  }
  
  .item-name {
    font-size: 1rem;
  }
  
  .item-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .item-store {
    font-size: 0.8rem;
    padding: 3px 6px;
  }
  
  .item-price {
    font-size: 1rem;
  }
  
  .item-description {
    font-size: 0.8rem;
  }
  
  .quantity-controls {
    padding: 4px 8px;
  }
  
  .quantity-btn {
    width: 22px;
    height: 22px;
  }
  
  .quantity {
    font-size: 0.85rem;
    min-width: 18px;
  }
  
  .total-label {
    font-size: 0.75rem;
  }
  
  .total-amount {
    font-size: 1rem;
  }
  
  .summary-header h2 {
    font-size: 1.3rem;
  }
  
  .summary-row {
    font-size: 0.9rem;
  }
  
  .summary-row.total {
    font-size: 1.1rem;
  }
  
  .place-order-btn {
    padding: 14px;
    font-size: 0.95rem;
  }
}

/* Enhanced Mobile Interactions */
@media (hover: none) and (pointer: coarse) {
  .quantity-btn,
  .remove-btn,
  .place-order-btn,
  .browse-stores-btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .quantity-btn {
    min-width: 32px;
  }
  
  .cart-item {
    padding: 20px 0;
  }
  
  .item-actions {
    gap: 20px;
  }
}

/* Dark mode support for better accessibility */
/* @media (prefers-color-scheme: dark) {
  .shopping-cart-page {
    background: #1a1a1a;
  }
  
  .page-header,
  .cart-items,
  .order-summary,
  .empty-cart {
    background: #2d2d2d;
    color: #ffffff;
  }
  
  .header-content h1,
  .cart-items-header h2,
  .summary-header h2,
  .item-name,
  .total-amount {
    color: #ffffff;
  }
  
  .subtitle,
  .item-store,
  .item-description,
  .total-label {
    color: #cccccc;
  }
  
  .item-price {
    color: var(--q-secondary);
  }
  
  .cart-item {
    border-bottom-color: #404040;
  }
  
  .summary-row.total {
    border-top-color: #404040;
  }
} */

/* Rating Modal Styles */
.rating-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.rating-modal-content {
  background: white;
  border-radius: 24px;
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.rating-header {
  padding: 24px 24px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.store-info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.store-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(243, 124, 78, 0.3);
}

.store-details h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.store-details p {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 60px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #AF1E23 0%, #AF1E23 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Rating Section */
.rating-section {
  padding: 24px;
}

.star-rating-container {
  text-align: center;
  margin-bottom: 32px;
}

.stars-wrapper {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.star-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #d1d5db;
  position: relative;
}

.star-button:hover {
  transform: scale(1.1);
  background: rgba(251, 191, 36, 0.1);
}

.star-button.filled {
  color: #fbbf24;
  transform: scale(1.05);
}

.star-button.hover {
  color: #fbbf24;
  transform: scale(1.1);
}

.rating-feedback {
  text-align: center;
}

.rating-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  transition: all 0.3s ease;
}

.rating-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

/* Comment Section */
.comment-container {
  text-align: left;
}

.comment-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.comment-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.comment-textarea:focus {
  outline: none;
  border-color: #AF1E23;
  background: white;
  box-shadow: 0 0 0 4px rgba(243, 124, 78, 0.1);
}

.comment-textarea::placeholder {
  color: #9ca3af;
}

.character-count {
  text-align: right;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
}

/* Action Buttons */
.rating-actions {
  padding: 20px 24px 24px;
  display: flex;
  gap: 12px;
  border-top: 1px solid #f1f5f9;
}

.skip-button {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.skip-button:hover {
  border-color: #d1d5db;
  color: #374151;
  background: #f9fafb;
}

.submit-button {
  flex: 2;
  padding: 14px 24px;
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(243, 124, 78, 0.3);
}

.submit-button:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(243, 124, 78, 0.4);
}

.submit-button.disabled {
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.submit-button.disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .rating-modal-content {
    margin: 10px;
    border-radius: 20px;
  }
  
  .rating-header {
    padding: 20px 20px 16px;
  }
  
  .rating-section {
    padding: 20px;
  }
  
  .rating-actions {
    padding: 16px 20px 20px;
  }
  
  .stars-wrapper {
    gap: 4px;
  }
  
  .star-button {
    padding: 6px;
  }
  
  .star-button svg {
    width: 32px;
    height: 32px;
  }
}
</style>
