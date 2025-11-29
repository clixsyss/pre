import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false
  }),

  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + (item.quantity || 0), 0);
    },
    
    subtotal: (state) => {
      return state.items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
    },
    
    deliveryFee: (state) => {
      // Get delivery fee from the first item's store (assuming all items are from same store)
      if (state.items.length > 0 && state.items[0].storeDeliveryFee) {
        return state.items[0].storeDeliveryFee;
      }
      // Fallback to default delivery fee - calculate subtotal manually here
      const subtotal = state.items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
      return subtotal > 50 ? 0 : 5.99;
    },
    
    total: (state) => {
      const subtotal = state.items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);
      let deliveryFee = 0;
      
      if (state.items.length > 0 && state.items[0].storeDeliveryFee) {
        deliveryFee = state.items[0].storeDeliveryFee;
      } else {
        deliveryFee = subtotal > 50 ? 0 : 5.99;
      }
      
      return subtotal + deliveryFee;
    }
  },

  actions: {
    addItem(product, storeId, storeName, storeDeliveryFee = 0) {
      const existingItem = this.items.find(item => 
        item.id === product.id && item.storeId === storeId
      );
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({
          ...product,
          quantity: 1,
          storeId,
          storeName,
          storeDeliveryFee
        });
      }
      
      // Persist to localStorage
      this.persistCart();
    },

    removeItem(productId) {
      const index = this.items.findIndex(item => item.id === productId);
      if (index > -1) {
        this.items.splice(index, 1);
        this.persistCart();
      }
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId);
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId);
        } else {
          item.quantity = quantity;
          this.persistCart();
        }
      }
    },

    clearCart() {
      this.items = [];
      this.persistCart();
    },

    persistCart() {
      localStorage.setItem('shopping-cart', JSON.stringify(this.items));
    },

    loadCart() {
      try {
        const savedCart = localStorage.getItem('shopping-cart');
        if (savedCart) {
          this.items = JSON.parse(savedCart);
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        this.items = [];
      }
    }
  }
});
