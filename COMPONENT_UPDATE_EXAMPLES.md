# Component Update Examples for Bilingual Support

This document shows practical examples of updating existing components to support bilingual data.

---

## Example 1: Services List Component

### Before (English Only)

```vue
<template>
  <div v-for="service in services" :key="service.id" class="service-card">
    <h3>{{ service.name }}</h3>
    <p>{{ service.description }}</p>
    <span>{{ service.price }} SAR</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import serviceCategoriesService from '@/services/serviceCategoriesService'

const services = ref([])

onMounted(async () => {
  services.value = await serviceCategoriesService.getServicesByCategory(projectId, categoryId)
})
</script>
```

### After (Bilingual)

```vue
<template>
  <div v-for="service in services" :key="service.id" class="service-card">
    <h3>{{ getLocalizedText(service.name, locale) }}</h3>
    <p>{{ getLocalizedText(service.description, locale) }}</p>
    <span>{{ service.price }} {{ $t('currency') }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import serviceCategoriesService from '@/services/serviceCategoriesService'
import { getLocalizedText } from '@/utils/i18nHelpers'

const { locale } = useI18n()
const services = ref([])

onMounted(async () => {
  services.value = await serviceCategoriesService.getServicesByCategory(projectId, categoryId)
  // Data will have structure: { name: { en: '...', ar: '...' }, ... }
})
</script>
```

---

## Example 2: Static UI Text

### Before

```vue
<template>
  <div class="header">
    <h1>Welcome back!</h1>
    <p>Here's what's happening in your community</p>
    <button>Book Now</button>
  </div>
</template>
```

### After

```vue
<template>
  <div class="header">
    <h1>{{ $t('welcomeBack') }}</h1>
    <p>{{ $t('communityHappening') }}</p>
    <button>{{ $t('bookNow') }}</button>
  </div>
</template>
```

---

## Example 3: Service Category with Search

### Before

```vue
<template>
  <div>
    <input v-model="searchTerm" placeholder="Search services..." />
    
    <div v-for="category in filteredCategories" :key="category.id">
      <h3>{{ category.name }}</h3>
      <p>{{ category.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchTerm = ref('')
const categories = ref([
  { id: 1, name: 'Beauty', description: 'Beauty services' },
  { id: 2, name: 'Cleaning', description: 'Cleaning services' }
])

const filteredCategories = computed(() => {
  return categories.value.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})
</script>
```

### After (Bilingual)

```vue
<template>
  <div>
    <input v-model="searchTerm" :placeholder="$t('search')" />
    
    <div v-for="category in filteredCategories" :key="category.id">
      <h3>{{ getLocalizedText(category.name, locale) }}</h3>
      <p>{{ getLocalizedText(category.description, locale) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLocalizedText, searchBilingualDocuments } from '@/utils/i18nHelpers'

const { locale } = useI18n()
const searchTerm = ref('')
const categories = ref([
  { 
    id: 1, 
    name: { en: 'Beauty', ar: 'تجميل' },
    description: { en: 'Beauty services', ar: 'خدمات التجميل' }
  },
  { 
    id: 2, 
    name: { en: 'Cleaning', ar: 'تنظيف' },
    description: { en: 'Cleaning services', ar: 'خدمات التنظيف' }
  }
])

const filteredCategories = computed(() => {
  // Use bilingual search helper - searches in current language
  return searchBilingualDocuments(
    categories.value,
    searchTerm.value,
    ['name', 'description'],
    locale.value
  )
})
</script>
```

---

## Example 4: Dashboard Form (React)

### Before

```jsx
function AddServiceForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveToFirestore(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Service Name"
      />
      
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        placeholder="Description"
      />
      
      <input
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({...formData, price: e.target.value})}
        placeholder="Price"
      />
      
      <button type="submit">Save</button>
    </form>
  );
}
```

### After (Bilingual)

```jsx
import { useTranslation } from 'react-i18next';
import BilingualInput from '../components/BilingualInput';
import { prepareBilingualData } from '../utils/i18nHelpers';

function AddServiceForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    price: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert form data to Firestore bilingual format
    const firestoreData = prepareBilingualData(formData, ['name', 'description']);
    // Result: { name: { en: '...', ar: '...' }, description: { en: '...', ar: '...' }, price: 100 }
    
    await saveToFirestore(firestoreData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BilingualInput
        label={t('services.serviceName')}
        valueEn={formData.name_en}
        valueAr={formData.name_ar}
        onChangeEn={(e) => setFormData({...formData, name_en: e.target.value})}
        onChangeAr={(e) => setFormData({...formData, name_ar: e.target.value})}
        required
      />
      
      <BilingualInput
        label={t('services.description')}
        valueEn={formData.description_en}
        valueAr={formData.description_ar}
        onChangeEn={(e) => setFormData({...formData, description_en: e.target.value})}
        onChangeAr={(e) => setFormData({...formData, description_ar: e.target.value})}
        multiline
        rows={4}
      />
      
      <div>
        <label>{t('services.price')}</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          placeholder={t('services.price')}
        />
      </div>
      
      <button type="submit">{t('common.save')}</button>
    </form>
  );
}
```

---

## Example 5: Editing Existing Data (React)

### Scenario: Edit Service Form

```jsx
import { useEffect } from 'react';
import BilingualInput from '../components/BilingualInput';
import { extractFormData, prepareBilingualData } from '../utils/i18nHelpers';

function EditServiceForm({ serviceId }) {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    price: ''
  });
  
  // Load existing service data
  useEffect(() => {
    const loadService = async () => {
      const firestoreData = await getServiceFromFirestore(serviceId);
      // firestoreData = { name: { en: 'Pool', ar: 'حوض' }, price: 100 }
      
      // Convert to form format
      const formValues = extractFormData(firestoreData, ['name', 'description']);
      // Result: { name_en: 'Pool', name_ar: 'حوض', price: 100 }
      
      setFormData(formValues);
    };
    
    loadService();
  }, [serviceId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert back to Firestore format
    const firestoreData = prepareBilingualData(formData, ['name', 'description']);
    
    await updateServiceInFirestore(serviceId, firestoreData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <BilingualInput
        label="Service Name"
        valueEn={formData.name_en}
        valueAr={formData.name_ar}
        onChangeEn={(e) => setFormData({...formData, name_en: e.target.value})}
        onChangeAr={(e) => setFormData({...formData, name_ar: e.target.value})}
        required
      />
      
      <button type="submit">Update</button>
    </form>
  );
}
```

---

## Example 6: Displaying Data in Dashboard (React)

```jsx
import BilingualDisplay from '../components/BilingualDisplay';
import { useTranslation } from 'react-i18next';

function ServicesList() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  
  return (
    <div>
      <h1>{t('services.title')}</h1>
      
      <table>
        <thead>
          <tr>
            <th>{t('services.serviceName')}</th>
            <th>{t('services.description')}</th>
            <th>{t('services.price')}</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.id}>
              <td>
                <BilingualDisplay data={service.name} />
              </td>
              <td>
                <BilingualDisplay data={service.description} />
              </td>
              <td>{service.price} SAR</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Example 7: Backward Compatibility

Handle both old (string) and new (bilingual) data formats:

```vue
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLocalizedText } from '@/utils/i18nHelpers'

const { locale } = useI18n()

const props = defineProps({
  service: Object
})

// This works with both formats:
// Old: { name: 'Swimming Pool' }
// New: { name: { en: 'Swimming Pool', ar: 'حمام السباحة' } }
const serviceName = computed(() => {
  return getLocalizedText(props.service.name, locale.value, 'Unnamed Service')
})
</script>

<template>
  <h2>{{ serviceName }}</h2>
</template>
```

The `getLocalizedText()` helper automatically handles:
- ✅ Bilingual objects: `{ en: '...', ar: '...' }`
- ✅ String values: `"Swimming Pool"`
- ✅ Null/undefined values: returns fallback
- ✅ Language preference: extracts text in current language

---

## Example 8: Dynamic Content with Sorting

```vue
<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { sortByBilingualField } from '@/utils/i18nHelpers'

const { locale } = useI18n()
const categories = ref([])
const sortOrder = ref('asc')

const sortedCategories = computed(() => {
  return sortByBilingualField(
    categories.value,
    'name',
    locale.value,
    sortOrder.value
  )
})
</script>

<template>
  <div>
    <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">
      {{ $t('sort') }}
    </button>
    
    <div v-for="category in sortedCategories" :key="category.id">
      {{ getLocalizedText(category.name, locale) }}
    </div>
  </div>
</template>
```

---

## Example 9: Validation in Dashboard Forms

```jsx
import { validateBilingual } from '../utils/i18nHelpers';

function ServiceForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
  });
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate name
    if (!formData.name_en || !formData.name_ar) {
      newErrors.name = t('bilingual.bothLanguagesRequired');
    }
    
    // Validate description
    if (!formData.description_en || !formData.description_ar) {
      newErrors.description = t('bilingual.bothLanguagesRequired');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Form is valid, submit
    const firestoreData = prepareBilingualData(formData, ['name', 'description']);
    saveToFirestore(firestoreData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <BilingualInput
        label="Service Name"
        valueEn={formData.name_en}
        valueAr={formData.name_ar}
        onChangeEn={(e) => setFormData({...formData, name_en: e.target.value})}
        onChangeAr={(e) => setFormData({...formData, name_ar: e.target.value})}
        error={errors.name}
        required
      />
      
      <button type="submit">{t('common.submit')}</button>
    </form>
  );
}
```

---

## Example 10: Navigation with i18n

### Before

```vue
<template>
  <nav class="bottom-navigation">
    <router-link to="/home">
      <span>Home</span>
    </router-link>
    <router-link to="/services">
      <span>Services</span>
    </router-link>
    <router-link to="/profile">
      <span>Profile</span>
    </router-link>
  </nav>
</template>
```

### After

```vue
<template>
  <nav class="bottom-navigation">
    <router-link to="/home">
      <span>{{ $t('home') }}</span>
    </router-link>
    <router-link to="/services">
      <span>{{ $t('services') }}</span>
    </router-link>
    <router-link to="/profile">
      <span>{{ $t('profile') }}</span>
    </router-link>
  </nav>
</template>
```

---

## Quick Reference

### In Vue Components (PRE App)

```vue
<script setup>
import { useI18n } from 'vue-i18n'
import { getLocalizedText } from '@/utils/i18nHelpers'

const { t, locale } = useI18n()

// Use t() for static translations
const title = t('services.title')

// Use getLocalizedText() for Firestore bilingual data
const name = getLocalizedText(service.name, locale.value)
</script>

<template>
  <!-- Static text -->
  <h1>{{ $t('welcomeBack') }}</h1>
  
  <!-- Firestore bilingual data -->
  <h2>{{ getLocalizedText(service.name, locale) }}</h2>
</template>
```

### In React Components (Dashboard)

```jsx
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from './utils/i18nHelpers';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  // Use t() for static translations
  const title = t('services.title');
  
  // Use getLocalizedText() for Firestore bilingual data
  const name = getLocalizedText(service.name, i18n.language);
  
  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <h2>{getLocalizedText(service.name, i18n.language)}</h2>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: List with Localized Names

```vue
<div v-for="item in items" :key="item.id">
  {{ getLocalizedText(item.name, locale) }}
</div>
```

### Pattern 2: Computed Localized Value

```vue
<script setup>
const localizedName = computed(() => 
  getLocalizedText(props.service.name, locale.value, 'Unnamed')
)
</script>

<template>
  <h2>{{ localizedName }}</h2>
</template>
```

### Pattern 3: Conditional Display Based on Language

```vue
<script setup>
const { locale } = useI18n()
const isArabic = computed(() => locale.value === 'ar-SA')
</script>

<template>
  <div :class="{ 'text-right': isArabic }">
    {{ $t('welcome') }}
  </div>
</template>
```

---

## Migration Checklist for Existing Components

When updating a component for bilingual support:

1. ✅ Import `useI18n` from 'vue-i18n'
2. ✅ Import helper functions from `@/utils/i18nHelpers`
3. ✅ Replace hardcoded text with `$t()` or `t()`
4. ✅ Wrap Firestore data access with `getLocalizedText()`
5. ✅ Add translation keys to `/src/i18n/en-US/index.js` and `/src/i18n/ar-SA/index.js`
6. ✅ Test in both English and Arabic
7. ✅ Verify RTL layout works correctly

---

## Need Help?

- 📖 See `/pre/BILINGUAL_GUIDE.md` for comprehensive Vue/Quasar guide
- 📖 See `/pre-dashboard/BILINGUAL_GUIDE.md` for React guide
- 🔧 Check `/src/utils/i18nHelpers.js` for all available helper functions
- 🚀 Review `/BILINGUAL_SETUP.md` for setup instructions

