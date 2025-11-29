# SearchableUnitDropdown Component

A beautiful, searchable dropdown for unit selection with automatic occupancy detection.

## Quick Start

```vue
<template>
  <SearchableUnitDropdown
    v-model="selectedUnit"
    :project-id="currentProjectId"
    :project-users="users"
    label="Select Unit"
    placeholder="Choose a unit..."
  />
</template>

<script setup>
import { ref } from 'vue'
import SearchableUnitDropdown from '@/components/SearchableUnitDropdown.vue'

const selectedUnit = ref('')
const currentProjectId = ref('abc123')
const users = ref([])
</script>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `projectId` | String | ✅ Yes | - | Firestore project ID |
| `modelValue` | String | No | `''` | v-model binding |
| `projectUsers` | Array | No | `[]` | Users for occupancy detection |
| `label` | String | No | `''` | Label above dropdown |
| `placeholder` | String | No | `'Select a unit...'` | Trigger placeholder |
| `searchPlaceholder` | String | No | `'Search units...'` | Search input placeholder |
| `disabled` | Boolean | No | `false` | Disable dropdown |

## Features

- ✅ Shows vacant units first
- 🔍 Real-time search
- 📱 Cross-platform (iOS, Android, Web)
- 🎨 PRE brand styling
- ⚡ Instant filtering

## Data Requirements

### Units Format
```javascript
projects/{projectId}/units/{unitId}
{
  buildingNum: "D1A",
  unitNum: "1"
}
```

### Users Format
```javascript
{
  projects: [
    {
      projectId: "abc",
      unit: "D1A-1",
      role: "owner"
    }
  ]
}
```

## Examples

### Basic Usage
```vue
<SearchableUnitDropdown
  v-model="form.unit"
  :project-id="form.projectId"
/>
```

### With Occupancy Detection
```vue
<SearchableUnitDropdown
  v-model="form.unit"
  :project-id="form.projectId"
  :project-users="allUsers"
/>
```

### Disabled State
```vue
<SearchableUnitDropdown
  v-model="form.unit"
  :project-id="form.projectId"
  :disabled="!form.projectId"
/>
```

## Events

### @update:modelValue
Emitted when unit is selected.

```vue
<SearchableUnitDropdown
  v-model="selectedUnit"
  @update:modelValue="handleUnitChange"
/>
```

## Styling

Uses PRE brand colors:
- Primary: #AF1E23
- Dark: #231F20
- Available: #4CAF50
- Occupied: #FF9800

## Browser Support

- ✅ Safari (iOS 12+)
- ✅ Chrome (Android 8+)
- ✅ Chrome Desktop
- ✅ Firefox
- ✅ Edge

## See Also

- `SEARCHABLE_UNIT_DROPDOWN_GUIDE.md` - Full documentation
- `UNIT_DROPDOWN_IMPLEMENTATION_SUMMARY.md` - Implementation details

