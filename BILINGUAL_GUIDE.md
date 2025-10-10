# Bilingual Support Guide (English + Arabic)

This guide explains how to use the bilingual features in the PRE Group application.

## Table of Contents
1. [Overview](#overview)
2. [Using Translations in Components](#using-translations-in-components)
3. [Working with Bilingual Firestore Data](#working-with-bilingual-firestore-data)
4. [Language Switching](#language-switching)
5. [RTL Support](#rtl-support)
6. [Adding New Translations](#adding-new-translations)
7. [Best Practices](#best-practices)

---

## Overview

The PRE Group application supports English and Arabic with:
- **Automatic RTL layout** for Arabic
- **Bilingual Firestore data** with `{ en: '...', ar: '...' }` structure
- **Language switcher** in the header
- **Persistent language preference** saved in localStorage
- **Comprehensive translations** for all UI elements

---

## Using Translations in Components

### Basic Usage in Templates

Use `$t()` function to display translated text:

```vue
<template>
  <h1>{{ $t('welcomeBack') }}</h1>
  <p>{{ $t('communityHappening') }}</p>
  <button>{{ $t('submit') }}</button>
</template>
```

### Using Translations in Script (Composition API)

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// Use t() function
console.log(t('welcomeBack'))

// Get current locale
console.log(locale.value) // 'en-US' or 'ar-SA'
</script>
```

### Using Translations in Script (Options API)

```vue
<script>
export default {
  methods: {
    showWelcome() {
      console.log(this.$t('welcomeBack'))
    }
  }
}
</script>
```

---

## Working with Bilingual Firestore Data

### Data Structure

Firestore documents use this bilingual structure:

```json
{
  "name": {
    "en": "Swimming Pool",
    "ar": "حمام السباحة"
  },
  "description": {
    "en": "Olympic size swimming pool",
    "ar": "حمام سباحة أولمبي الحجم"
  },
  "price": 100,
  "status": "available"
}
```

### Displaying Bilingual Data in Components

**Option 1: Using Helper Function (Recommended)**

```vue
<script setup>
import { useI18n } from 'vue-i18n'
import { getLocalizedText } from '../utils/i18nHelpers'

const { locale } = useI18n()

const service = {
  name: { en: 'Swimming Pool', ar: 'حمام السباحة' },
  description: { en: 'Olympic size', ar: 'حجم أولمبي' }
}
</script>

<template>
  <h2>{{ getLocalizedText(service.name, locale) }}</h2>
  <p>{{ getLocalizedText(service.description, locale) }}</p>
</template>
```

**Option 2: Computed Properties**

```vue
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const service = {
  name: { en: 'Swimming Pool', ar: 'حمام السباحة' }
}

const serviceName = computed(() => {
  const lang = locale.value.split('-')[0] // 'en' or 'ar'
  return service.name[lang] || service.name.en
})
</script>

<template>
  <h2>{{ serviceName }}</h2>
</template>
```

**Option 3: Direct Access (Simple)**

```vue
<template>
  <h2>{{ service.name[$i18n.locale.split('-')[0]] }}</h2>
</template>
```

### Helper Functions

The app provides several helper functions in `/src/utils/i18nHelpers.js`:

```javascript
import {
  getLocalizedText,
  createBilingualField,
  isBilingualField,
  autoLocalizeDocument,
  sortByBilingualField,
  searchBilingualDocuments
} from '@/utils/i18nHelpers'

// Get text in current locale
const text = getLocalizedText(field, locale, fallback)

// Create bilingual field
const field = createBilingualField('English text', 'النص العربي')

// Check if field is bilingual
if (isBilingualField(field)) {
  // Handle bilingual field
}

// Auto-localize all bilingual fields in a document
const localized = autoLocalizeDocument(document, locale)

// Sort array by bilingual field
const sorted = sortByBilingualField(documents, 'name', locale, 'asc')

// Search in bilingual documents
const results = searchBilingualDocuments(documents, 'search term', ['name', 'description'], locale)
```

---

## Language Switching

### Using the Language Switcher Component

The `LanguageSwitcher` component is already added to the header:

```vue
<template>
  <LanguageSwitcher />
</template>

<script setup>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
</script>
```

### Programmatic Language Switch

```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()

function switchToArabic() {
  instance.appContext.config.globalProperties.$switchLanguage('ar-SA')
}

function switchToEnglish() {
  instance.appContext.config.globalProperties.$switchLanguage('en-US')
}
</script>
```

### Getting Current Language

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

console.log(locale.value) // 'en-US' or 'ar-SA'

const isArabic = computed(() => locale.value === 'ar-SA')
const isEnglish = computed(() => locale.value === 'en-US')
</script>
```

---

## RTL Support

### Automatic RTL

RTL is automatically applied when Arabic is selected:
- HTML `dir` attribute is set to `rtl`
- Quasar language pack is switched to Arabic
- CSS styles are automatically adjusted

### RTL-Specific Styles

Add RTL-specific styles in your component:

```vue
<style scoped>
.my-component {
  margin-left: 20px;
}

[dir="rtl"] .my-component {
  margin-left: 0;
  margin-right: 20px;
}
</style>
```

### Flipping Icons for RTL

For directional icons (arrows, etc.), add the `flip-rtl` class:

```vue
<template>
  <q-icon name="arrow_forward" class="flip-rtl" />
</template>
```

This will automatically flip the icon in RTL mode.

---

## Adding New Translations

### 1. Add to English Translations

Edit `/src/i18n/en-US/index.js`:

```javascript
export default {
  // ... existing translations
  newFeature: 'My New Feature',
  newFeatureDescription: 'This is a description',
}
```

### 2. Add to Arabic Translations

Edit `/src/i18n/ar-SA/index.js`:

```javascript
export default {
  // ... existing translations
  newFeature: 'ميزتي الجديدة',
  newFeatureDescription: 'هذا هو الوصف',
}
```

### 3. Use in Component

```vue
<template>
  <h1>{{ $t('newFeature') }}</h1>
  <p>{{ $t('newFeatureDescription') }}</p>
</template>
```

---

## Best Practices

### 1. Always Use Translation Keys for Static Text

❌ **Bad:**
```vue
<h1>Welcome back!</h1>
```

✅ **Good:**
```vue
<h1>{{ $t('welcomeBack') }}</h1>
```

### 2. Use Helper Functions for Firestore Data

❌ **Bad:**
```vue
<h2>{{ service.name.en }}</h2>
```

✅ **Good:**
```vue
<h2>{{ getLocalizedText(service.name, locale) }}</h2>
```

### 3. Handle Missing Translations Gracefully

```javascript
const text = getLocalizedText(field, locale, 'Default Text')
```

### 4. Keep Translation Keys Organized

Use meaningful, hierarchical keys:

```javascript
// Good
{
  booking: {
    title: 'My Bookings',
    upcoming: 'Upcoming',
    past: 'Past',
    details: {
      date: 'Booking Date',
      time: 'Booking Time'
    }
  }
}
```

### 5. Test Both Languages

Always test your components in both English and Arabic to ensure:
- Text displays correctly
- Layout works in both LTR and RTL
- No text overflow or wrapping issues
- Icons are correctly positioned

### 6. Use Computed Properties for Complex Logic

When dealing with bilingual data in multiple places, create a computed property:

```vue
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLocalizedText } from '@/utils/i18nHelpers'

const { locale } = useI18n()

const categories = ref([])

const localizedCategories = computed(() => {
  return categories.value.map(cat => ({
    ...cat,
    name: getLocalizedText(cat.name, locale.value),
    description: getLocalizedText(cat.description, locale.value)
  }))
})
</script>
```

### 7. Handle Edge Cases

```javascript
// Old data might still be strings, not objects
const name = typeof category.name === 'string' 
  ? category.name 
  : getLocalizedText(category.name, locale)
```

---

## Migration

If you have existing data in English only, use the migration script:

```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre
export GOOGLE_TRANSLATE_API_KEY="your-key"
node scripts/migrate-to-bilingual.js
```

See `/scripts/MIGRATION_README.md` for detailed instructions.

---

## Troubleshooting

### Issue: Language doesn't switch
- Check browser console for errors
- Verify localStorage has `app-language` key
- Clear cache and reload

### Issue: RTL not applying
- Check HTML `dir` attribute in DevTools
- Verify Quasar language pack is loaded
- Check CSS for conflicting styles

### Issue: Translations not showing
- Verify translation key exists in both language files
- Check for typos in key names
- Use browser DevTools to inspect the actual value

### Issue: Firestore data not localized
- Verify data structure has `{ en: '...', ar: '...' }`
- Check if `getLocalizedText` is imported correctly
- Use migration script if data is in old format

---

## Example: Complete Component with Bilingual Support

```vue
<template>
  <div class="service-card">
    <h2>{{ localizedName }}</h2>
    <p>{{ localizedDescription }}</p>
    <span class="price">{{ service.price }} {{ $t('currency') }}</span>
    <q-btn :label="$t('bookNow')" @click="bookService" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getLocalizedText } from '@/utils/i18nHelpers'

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const { locale } = useI18n()

const localizedName = computed(() => 
  getLocalizedText(props.service.name, locale.value, 'Unnamed Service')
)

const localizedDescription = computed(() => 
  getLocalizedText(props.service.description, locale.value, '')
)

function bookService() {
  // Booking logic
}
</script>

<style scoped>
.service-card {
  padding: 20px;
  border-radius: 8px;
}

[dir="rtl"] .service-card {
  text-align: right;
}
</style>
```

---

## Support

For questions or issues:
1. Check this guide
2. Review `/src/utils/i18nHelpers.js` for available utilities
3. Check `/scripts/MIGRATION_README.md` for migration help
4. Contact the development team

