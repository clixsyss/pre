<template>
  <div class="page-header">
    <div class="header-content">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="header-text">
          <h1 class="header-title">{{ title }}</h1>
          <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div v-if="$slots.actions" class="header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    }
  },
  setup() {
    const router = useRouter()

    const goBack = () => {
      router.go(-1)
    }

    return {
      goBack
    }
  }
}
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #AF1E23 0%, #AF1E23 100%);
  color: #F6F6F6;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.2);
}

/* RTL Support */
[dir="rtl"] .page-header {
  direction: rtl;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

[dir="rtl"] .header-left {
  flex-direction: row-reverse;
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F6F6F6;
  flex-shrink: 0;
}

[dir="rtl"] .back-button svg {
  transform: scaleX(-1);
}

/* Mobile app - hover effects disabled */
/* .back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
} */

.back-button:active {
  transform: translateX(-1px);
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

[dir="rtl"] .header-text {
  text-align: right;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 20px;
    border-radius: 16px;
  }

  .header-title {
    font-size: 1.75rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }

  .back-button {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 16px;
    border-radius: 12px;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.85rem;
  }

  .header-left {
    gap: 12px;
  }

  .back-button {
    padding: 8px;
  }
}
</style>
