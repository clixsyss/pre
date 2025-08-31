<template>
  <div class="shopping-cart-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1>Shopping Cart</h1>
        <p class="subtitle">Review your items and place your order</p>
      </div>
    </div>
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
                  <span class="item-price">${{ item.price }}</span>
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
                <span class="total-label">Total</span>
                <span class="total-amount">${{ (item.price * item.quantity).toFixed(2) }}</span>
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
            <span>${{ subtotal.toFixed(2) }}</span>
          </div>
          
          <div class="summary-row">
            <span>Delivery Fee</span>
            <span>${{ deliveryFee.toFixed(2) }}</span>
          </div>
          
          <div v-if="cartStore.items.length > 0 && cartStore.items[0].storeDeliveryFee" class="summary-note">
            <small>Store delivery fee</small>
          </div>
          
          <div class="summary-row total">
            <span>Total</span>
            <span>${{ total.toFixed(2) }}</span>
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
        <div class="modal-header">
          <h2>Order Confirmed!</h2>
          <button class="close-btn" @click="closeOrderConfirmation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          
          <h3>Thank you for your order!</h3>
          <p>Order #{{ orderNumber }}</p>
          <p>We'll notify you when your order is ready for pickup or delivery.</p>
          
          <div class="order-details">
            <h4>Order Details</h4>
            <div class="detail-row">
              <span>Total Items:</span>
              <span>{{ totalItems }}</span>
            </div>
            <div class="detail-row">
              <span>Total Amount:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
            <div class="detail-row">
              <span>Estimated Delivery:</span>
              <span>{{ estimatedDelivery }}</span>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'src/boot/firebase';
import { useProjectStore } from 'src/stores/projectStore';
import { useCartStore } from 'src/stores/cartStore';

// Component name for ESLint
defineOptions({
  name: 'ShoppingCartPage'
});

const router = useRouter();
const projectStore = useProjectStore();
const auth = getAuth();
const cartStore = useCartStore();

// Reactive data
const placingOrder = ref(false);
const showOrderConfirmation = ref(false);
const orderNumber = ref('');
const estimatedDelivery = ref('');

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
  if (!projectStore.selectedProject?.id || !auth.currentUser) {
    console.error('Missing project or user information');
    return;
  }

  try {
    placingOrder.value = true;
    
    // Generate order number
    orderNumber.value = 'ORD-' + Date.now().toString().slice(-6);
    
    // Calculate estimated delivery
    const now = new Date();
    const deliveryTime = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
    estimatedDelivery.value = deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create order in Firestore
    const orderData = {
      orderNumber: orderNumber.value,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
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
      createdAt: serverTimestamp(),
      estimatedDelivery: estimatedDelivery.value
    };

    await addDoc(collection(db, `projects/${projectStore.selectedProject.id}/orders`), orderData);
    
    // Clear cart
    cartStore.clearCart();
    
    // Show confirmation
    showOrderConfirmation.value = true;
    
  } catch (error) {
    console.error('Error placing order:', error);
    // You can add error handling here
  } finally {
    placingOrder.value = false;
  }
};

const closeOrderConfirmation = () => {
  showOrderConfirmation.value = false;
};

const continueShopping = () => {
  showOrderConfirmation.value = false;
  router.push('/stores-shopping');
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

.header-icon {
  margin-bottom: 16px;
}

.header-icon svg {
  color: var(--q-secondary);
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
  background: #0056b3;
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
  max-height: 90vh;
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
  padding: 24px;
  text-align: center;
}

.success-icon {
  color: #28a745;
  margin-bottom: 24px;
}

.modal-body h3 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 1.3rem;
}

.modal-body p {
  color: #666;
  margin: 0 0 12px 0;
}

.order-details {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
  text-align: left;
}

.order-details h4 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 1.1rem;
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
  background: #0056b3;
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
@media (prefers-color-scheme: dark) {
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
}
</style>
