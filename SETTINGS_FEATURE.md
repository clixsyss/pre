# Settings Feature Documentation

## Overview
The settings feature has been added to the ProfilePage, allowing users to customize their app experience with language and theme options.

## Features

### 1. Language Selection
- **English (en-US)**: Default language with LTR layout
- **Arabic (ar-SA)**: RTL language support with proper text direction

### 2. Theme Selection
- **Light Mode**: Clean, bright interface (default)
- **Dark Mode**: Dark interface for better night usage

## Implementation Details

### Files Added/Modified

#### New Files:
- `src/stores/settingsStore.js` - Pinia store for settings management
- `src/boot/settingsStore.js` - Boot file to initialize settings store
- `src/i18n/ar-SA/index.js` - Arabic language translations
- `SETTINGS_FEATURE.md` - This documentation file

#### Modified Files:
- `src/pages/auth/ProfilePage.vue` - Added settings accordion section
- `src/i18n/en-US/index.js` - Enhanced with settings translations
- `src/i18n/index.js` - Added Arabic language support
- `src/boot/i18n.js` - Enhanced with dynamic locale switching
- `quasar.config.js` - Added settings store to boot files
- `src/css/app.scss` - Added global theme support

### Store Usage

The settings store provides the following functionality:

```javascript
import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

// Get current settings
const currentLanguage = settingsStore.currentLanguage
const currentTheme = settingsStore.currentTheme
const isRTL = settingsStore.isRTL

// Change settings
settingsStore.setLanguage('ar-SA') // Switch to Arabic
settingsStore.setTheme('dark')     // Switch to dark mode
settingsStore.toggleLanguage()     // Toggle between languages
settingsStore.toggleTheme()        // Toggle between themes
```

### Persistence
- Settings are automatically saved to localStorage
- Settings are restored on app startup
- Changes are applied immediately across the app

### RTL Support
- Arabic language automatically enables RTL layout
- Document direction is set based on language selection
- CSS includes RTL-specific styles for proper layout

### Theme Support
- CSS custom properties for consistent theming
- Smooth transitions between theme changes
- Dark mode styles for all components

## Usage Instructions

1. Navigate to the Profile page
2. Scroll down to find the "Settings" accordion section
3. Click on the settings section to expand it
4. Choose your preferred language (English/Arabic)
5. Choose your preferred theme (Light/Dark)
6. Settings are automatically saved and applied

## Technical Notes

- The settings store uses Pinia for state management
- Language switching updates the Vue i18n locale
- Theme switching adds/removes CSS classes on the document element
- RTL support is handled through the `dir` attribute on the document
- All settings persist across browser sessions

## Future Enhancements

Potential future additions to the settings feature:
- More language options
- Additional theme variants
- Font size preferences
- Notification preferences
- Privacy settings
