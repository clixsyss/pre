# Services Conditional Display Implementation

## Summary
Modified the Services page to conditionally display services (Courts, Academies, Stores, and Smart Home) based on whether they have data or are connected in the current project.

## Changes Made

### File Modified
`src/pages/auth/Services.vue`

### Imports Added
- `useSportsStore` - for checking if courts exist
- `useAcademiesStore` - for checking if academies exist
- `useSmartMirrorStore` - for checking smart home connection status
- `firestoreService` - for fetching stores data

### New State Variables
- `stores` - Array to hold stores data for the project
- `loadingStores` - Boolean flag for stores loading state

### Computed Properties Added

1. **`hasCourts`**
   - Checks if there are any courts in the project
   - Uses `sportsStore.courtsBySport` to count total courts
   - Returns `true` if courts count > 0

2. **`hasAcademies`**
   - Checks if there are any academies in the project
   - Uses `academiesStore.academyOptions.length`
   - Returns `true` if academies exist

3. **`hasStores`**
   - Checks if there are any stores in the project
   - Uses local `stores` ref array length
   - Returns `true` if stores exist

4. **`isSmartHomeConnected`**
   - Checks if smart home is connected for the current project
   - Uses `smartMirrorStore.isProjectConnected(projectId)`
   - Returns `true` if connected

### New Functions

1. **`loadServiceData()`**
   - Loads all service-related data when component mounts or project changes
   - Fetches:
     - Courts data via `sportsStore.fetchSports()`
     - Academies data via `academiesStore.fetchAcademies()`
     - Stores data via `loadStores()`

2. **`loadStores()`**
   - Fetches stores from Firestore for the current project
   - Path: `projects/{projectId}/stores`
   - Handles errors gracefully by setting stores to empty array

### Template Changes

Added `v-if` directives to conditionally render service cards:

1. **Smart Devices Card**
   - `v-if="isSmartHomeConnected"`
   - Only shows if smart home is connected via profile page

2. **Court Booking Card**
   - `v-if="hasCourts"`
   - Only shows if courts exist in the project

3. **Academy Programs Card**
   - `v-if="hasAcademies"`
   - Only shows if academies exist in the project

4. **Stores & Shopping Card**
   - `v-if="hasStores"`
   - Only shows if stores exist in the project

### Component Lifecycle

**onMounted:**
- Calls `loadServiceCategories()`
- Calls `loadBookings()`
- Calls `loadServiceData()` (new)

**watch (projectId):**
- Calls `loadBookings()`
- Calls `loadServiceData()` (new)

## How It Works

1. When the Services page loads or when the project changes, the component fetches data for all services
2. Computed properties evaluate whether each service has data
3. Template uses `v-if` directives to conditionally render service cards
4. If a service has no data or is not connected, its card won't be displayed

## Benefits

- **Cleaner UI**: Users only see services that are actually available in their project
- **Better UX**: No confusion about unavailable services
- **Dynamic**: Automatically updates when service data changes
- **Performance**: Only renders cards that will be shown

## Testing

To test the implementation:

1. **Project with no courts**: Courts card should not appear
2. **Project with no academies**: Academy card should not appear
3. **Project with no stores**: Stores card should not appear
4. **Smart home not connected**: Smart Devices card should not appear
5. **All services available**: All cards should appear

## Bug Fixes Applied

### Issue: Service Categories Not Showing
**Problem**: Service categories from the database weren't appearing even when they existed.

**Root Causes**:
1. When project changed, `loadServiceCategories()` wasn't being called in the watch function
2. Empty state was showing while data was still loading
3. Loading state wasn't accounting for all async operations

**Fixes Applied**:
1. Added `loadServiceCategories()` to the project change watcher
2. Added `loadingStores` to the loading state condition to prevent premature empty state
3. Enhanced empty state condition to ensure all loading is complete before showing
4. Added debug logging to `hasAnyServices` computed to help track service availability

**Template Loading Logic** (now fixed):
```
if (serviceCategoriesStore.isLoading || loadingStores)
  → Show loading spinner
else if (serviceCategoriesStore.getError)
  → Show error message
else if (!serviceCategoriesStore.isLoading && !loadingStores && !hasAnyServices)
  → Show empty state
else
  → Show services grid with all available services
```

## Notes

- Service categories (dynamic services) are shown when they exist in the database
- The conditional rendering also applies to the static service cards (Courts, Academies, Stores, Smart Home)
- Smart home connection is checked per project, so different projects can have different connection statuses
- Debug console logs show which services are available to help troubleshoot issues
- Empty state only appears after all data loading is complete

