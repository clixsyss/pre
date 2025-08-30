import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isOpen: false
  }),

  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    subtotal: (state) => {
      return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    deliveryFee: (state) => {
      return state.subtotal > 50 ? 0 : 5.99;
    },
    
    total: (state) => {
      return state.subtotal + state.deliveryFee;
    }
  },

  actions: {
    addItem(product, storeId, storeName) {
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
          storeName
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
