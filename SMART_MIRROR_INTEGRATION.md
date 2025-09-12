# Smart Mirror Integration for PRE App

This document describes the integration of Smart Mirror automation features into the PRE app, allowing users to control their smart home devices directly from the PRE application.

## Overview

The integration adds Smart Mirror device control capabilities to the PRE app while maintaining complete separation between the PRE database and Smart Mirror database. Users can connect their Smart Mirror account and control lights, climate devices, and smart plugs without affecting the existing PRE functionality.

## Architecture

### Dual Database Setup

The integration uses two separate Firebase projects:

1. **PRE Database** (`pre-group`): Existing PRE app database (unchanged)
2. **Smart Mirror Database** (`clixsys-4d367`): Smart Mirror device management database

### Key Components

#### 1. Firebase Configuration
- **File**: `src/boot/smartMirrorFirebase.js`
- **Purpose**: Separate Firebase app instance for Smart Mirror database
- **Features**: 
  - Independent authentication
  - Separate Firestore instance
  - No conflicts with PRE database

#### 2. Smart Mirror Service
- **File**: `src/services/smartMirrorService.js`
- **Purpose**: Core service for Smart Mirror operations
- **Features**:
  - Authentication (login/logout)
  - Device fetching and management
  - Real-time device state updates
  - Device control operations

#### 3. Smart Mirror Store
- **File**: `src/stores/smartMirrorStore.js`
- **Purpose**: Pinia store for Smart Mirror state management
- **Features**:
  - Connection status management
  - Device state management
  - Real-time synchronization
  - Device control actions

#### 4. Smart Mirror Connection Component
- **File**: `src/components/SmartMirrorConnection.vue`
- **Purpose**: Profile page integration component
- **Features**:
  - One-time login flow
  - Connection status display
  - Device summary
  - Disconnect functionality

#### 5. Smart Devices Page
- **File**: `src/pages/auth/SmartDevices.vue`
- **Purpose**: Main device control interface
- **Features**:
  - Room-based device organization
  - Device type categorization (lights, climate, plugs)
  - Real-time device control
  - Responsive UI design

## Features

### Authentication
- **One-time login**: Users connect their Smart Mirror account once in the profile page
- **Persistent connection**: Connection state is maintained across app sessions
- **Secure authentication**: Uses Firebase Auth with email/password
- **User approval check**: Verifies user account is approved before allowing access

### Device Management
- **Real-time sync**: Device states sync in real-time with Smart Mirror database
- **Room organization**: Devices are organized by rooms for better UX
- **Device categorization**: 
  - Lights (with brightness control)
  - Climate devices (thermostats with temperature and mode control)
  - Smart plugs (on/off control)

### Device Control
- **Light Control**:
  - Toggle on/off
  - Brightness adjustment (0-100%)
  - Real-time state updates

- **Climate Control**:
  - Toggle on/off
  - Temperature adjustment (16-30°C)
  - Mode selection (Heat, Cool, Auto, Fan)

- **Smart Plug Control**:
  - Toggle on/off
  - Real-time state updates

### User Interface
- **Profile Integration**: Smart Mirror connection section in user profile
- **Dedicated Device Page**: Full-featured device control interface
- **Responsive Design**: Works on mobile and desktop
- **Real-time Updates**: UI updates immediately when device states change

## Usage

### For Users

1. **Connect Smart Mirror Account**:
   - Go to Profile page
   - Find "Smart Mirror Integration" section
   - Click "Connect Smart Mirror"
   - Enter Smart Mirror email and password
   - Click "Connect"

2. **Control Devices**:
   - Click "Control Devices" button in profile
   - Select room (if multiple rooms available)
   - Use controls for each device type:
     - Toggle switches for on/off
     - Sliders for brightness/temperature
     - Dropdowns for mode selection

3. **Disconnect**:
   - Go to Profile page
   - Click "Disconnect" in Smart Mirror section
   - Confirm disconnection

### For Developers

#### Adding New Device Types

1. **Update Smart Mirror Service**:
   ```javascript
   // Add new device control method
   async controlNewDeviceType(roomId, deviceId, state) {
     // Implementation
   }
   ```

2. **Update Smart Mirror Store**:
   ```javascript
   // Add new computed property
   const newDeviceType = computed(() => 
     devices.value.filter(device => device.type === 'newType')
   )
   ```

3. **Update Smart Devices Page**:
   ```vue
   <!-- Add new device section -->
   <div v-if="newDeviceType.length > 0" class="devices-section">
     <!-- Device controls -->
   </div>
   ```

#### Extending Device Controls

1. **Add Control Method**:
   ```javascript
   // In smartMirrorService.js
   async setNewProperty(roomId, deviceId, value) {
     const deviceRef = doc(smartMirrorDb, 'users', this.currentUser.uid, 'rooms', roomId, 'devices', deviceId)
     await updateDoc(deviceRef, { newProperty: value })
     this.updateLocalDeviceState(roomId, deviceId, { newProperty: value })
   }
   ```

2. **Add Store Action**:
   ```javascript
   // In smartMirrorStore.js
   const setNewProperty = async (roomId, deviceId, value) => {
     const result = await smartMirrorService.setNewProperty(roomId, deviceId, value)
     // Handle result
   }
   ```

## Database Structure

### Smart Mirror Database Structure
```
users/{userId}/
  ├── rooms/{roomId}/
  │   ├── name: string
  │   ├── devices/{deviceId}/
  │   │   ├── name: string
  │   │   ├── type: string (light, thermostat, plug, etc.)
  │   │   ├── state: boolean
  │   │   ├── brightness: number (for lights)
  │   │   ├── temperature: number (for climate)
  │   │   └── mode: string (for climate)
```

### PRE Database Structure
- **Unchanged**: All existing PRE database structure remains intact
- **No conflicts**: Smart Mirror integration doesn't modify PRE database

## Security

### Authentication Security
- **Separate Firebase projects**: Complete isolation between PRE and Smart Mirror
- **User approval check**: Only approved Smart Mirror users can connect
- **Secure credentials**: Email/password authentication through Firebase Auth

### Data Security
- **Read-only access**: PRE app only reads device states, doesn't modify device configurations
- **Real-time sync**: Uses Firebase real-time listeners for secure data updates
- **User isolation**: Each user only accesses their own devices

## Error Handling

### Connection Errors
- **Invalid credentials**: Clear error messages for login failures
- **Network issues**: Graceful handling of connection timeouts
- **User not approved**: Specific error for unapproved accounts

### Device Control Errors
- **Device not found**: Error handling for missing devices
- **Control failures**: Retry mechanisms for failed device updates
- **Real-time sync errors**: Fallback to manual refresh

## Performance

### Optimization Features
- **Real-time listeners**: Efficient Firebase real-time updates
- **Local state management**: Immediate UI updates with server sync
- **Debounced updates**: Prevents excessive API calls
- **Lazy loading**: Components load only when needed

### Memory Management
- **Listener cleanup**: Proper cleanup of Firebase listeners
- **State reset**: Complete state reset on disconnect
- **Component unmounting**: Proper cleanup on component destruction

## Testing

### Manual Testing Checklist
- [ ] Smart Mirror account connection
- [ ] Device fetching and display
- [ ] Real-time state updates
- [ ] Device control operations
- [ ] Error handling scenarios
- [ ] Disconnect functionality
- [ ] Responsive design on mobile/desktop

### Test Scenarios
1. **Happy Path**: Connect account → View devices → Control devices → Disconnect
2. **Error Scenarios**: Invalid credentials, network issues, device not found
3. **Edge Cases**: No devices, multiple rooms, device state conflicts

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Check Smart Mirror credentials
   - Verify user account is approved
   - Check network connectivity

2. **Devices Not Loading**:
   - Verify Smart Mirror account has devices
   - Check Firebase permissions
   - Refresh the page

3. **Device Control Not Working**:
   - Check device is online
   - Verify device permissions
   - Try refreshing device list

### Debug Information
- Check browser console for error messages
- Verify Firebase connection status
- Check device state in Smart Mirror database

## Future Enhancements

### Potential Features
- **Device Groups**: Control multiple devices simultaneously
- **Scenes**: Predefined device state combinations
- **Scheduling**: Time-based device control
- **Voice Control**: Integration with voice assistants
- **Notifications**: Device status change notifications

### Technical Improvements
- **Offline Support**: Cache device states for offline use
- **Batch Operations**: Control multiple devices in single request
- **Device Discovery**: Automatic device detection
- **Advanced Controls**: More sophisticated device parameters

## Conclusion

The Smart Mirror integration successfully adds smart home device control capabilities to the PRE app while maintaining complete separation from the existing PRE database. The implementation provides a seamless user experience with real-time device control and robust error handling.

The modular architecture allows for easy extension and maintenance, while the dual database approach ensures no conflicts with existing PRE functionality.
