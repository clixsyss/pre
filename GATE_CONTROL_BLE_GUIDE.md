# Gate Control BLE Feature - Complete Guide

## Overview

This feature enables users to connect to a Bluetooth Low Energy (BLE) gate device using their mobile device or web browser, authenticate with a password, and send an "open gate" command to an ESP32-based controller.

## 📦 Installation

### 1. Install Required Dependencies

For **Capacitor (Native Apps)**:

```bash
npm install @capacitor-community/bluetooth-le
```

For **Web (Browser)**:
No additional packages required - uses native Web Bluetooth API

### 2. Configure Capacitor (For Native Apps Only)

#### Android Configuration

Add Bluetooth permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <!-- Add these permissions inside the <manifest> tag -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
                     android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- For Android 12+ (API 31+) -->
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
                     android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE"
                     android:maxSdkVersion="30" />
</manifest>
```

Update `android/variables.gradle` if needed:

```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 33
    targetSdkVersion = 33
}
```

#### iOS Configuration

Add Bluetooth usage description to `ios/App/App/Info.plist`:

```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app needs Bluetooth to connect to your gate device</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>This app needs Bluetooth to connect to your gate device</string>
```

### 3. Sync Capacitor

After installation, sync the native projects:

```bash
npx cap sync
```

## 🎯 Features Implemented

### Files Created

1. **`src/composables/useBluetooth.js`**
   - Reusable BLE composable for connecting to BLE devices
   - Supports both Capacitor (native) and Web Bluetooth API
   - Handles connection, writing data, and disconnection
   - Provides reactive state management

2. **`src/pages/auth/GateControlPage.vue`**
   - Complete UI for gate control
   - Bluetooth connection status indicator
   - Connect/Disconnect buttons
   - Open Gate button (sends "OPEN123" command)
   - Error handling and user feedback
   - Responsive design for all screen sizes

3. **Route Configuration**
   - Added route: `/gate-control`
   - Requires authentication
   - Accessible from navigation

## 🔧 Configuration

### BLE Settings (In GateControlPage.vue)

```javascript
// These UUIDs must match your ESP32 BLE server configuration
const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0'
const CHARACTERISTIC_UUID = 'abcdefab-cdef-1234-5678-abcdefabcdef'
const GATE_PASSWORD = 'OPEN123' // The password/command to send
```

### Customization Options

1. **Change BLE UUIDs**: Update `SERVICE_UUID` and `CHARACTERISTIC_UUID` in `GateControlPage.vue` to match your ESP32 device

2. **Change Password**: Update `GATE_PASSWORD` constant

3. **Add Multiple Devices**: The composable is reusable - you can create similar pages for door locks, garage doors, etc.

## 📱 Usage

### For End Users

1. **Navigate to Gate Control**
   - Open the app
   - Navigate to `/gate-control` or use navigation menu

2. **Connect to Gate Device**
   - Ensure Bluetooth is enabled on your device
   - Tap "Connect to Gate" button
   - Select your gate device from the list
   - Wait for connection confirmation

3. **Open Gate**
   - Once connected, tap "Open Gate" button
   - Wait for success confirmation
   - Gate should open automatically

4. **Disconnect**
   - Tap "Disconnect" when finished
   - Or simply close the app

### Browser Support (Web Bluetooth API)

Web Bluetooth API is supported on:

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Opera
- ✅ Samsung Internet
- ❌ Firefox (not supported)
- ❌ Safari (not supported)

For unsupported browsers, users will see a warning message.

## 🔌 ESP32 Configuration

Your ESP32 device must be configured with matching BLE settings. Here's a basic Arduino sketch example:

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// Must match the UUIDs in the Vue app
#define SERVICE_UUID        "12345678-1234-5678-1234-56789abcdef0"
#define CHARACTERISTIC_UUID "abcdefab-cdef-1234-5678-abcdefabcdef"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("Device connected");
    }

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("Device disconnected");
      // Restart advertising
      BLEDevice::startAdvertising();
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();

      if (value.length() > 0) {
        Serial.print("Received: ");
        Serial.println(value.c_str());

        // Check if password matches
        if (value == "OPEN123") {
          Serial.println("✅ Password correct! Opening gate...");
          // Add your gate opening logic here
          digitalWrite(RELAY_PIN, HIGH); // Example: activate relay
          delay(3000); // Keep gate open for 3 seconds
          digitalWrite(RELAY_PIN, LOW);
        } else {
          Serial.println("❌ Invalid password");
        }
      }
    }
};

void setup() {
  Serial.begin(115200);

  // Initialize BLE
  BLEDevice::init("PRE Gate Controller");

  // Create BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_WRITE
                    );

  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->setValue("Ready");

  // Start service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("BLE Gate Controller ready!");
}

void loop() {
  // Your loop code here
  delay(100);
}
```

## 🧪 Testing

### Testing on Web Browser

1. Open Chrome or Edge browser
2. Navigate to `http://localhost:9000/gate-control` (or your dev server URL)
3. Must use HTTPS in production (Web Bluetooth requires secure context)
4. Click "Connect to Gate"
5. Browser will show native device selector

### Testing on Android

1. Build and install the app: `npx cap run android`
2. Grant Bluetooth permissions when prompted
3. Navigate to Gate Control page
4. Test connection and commands

### Testing on iOS

1. Build and install the app: `npx cap run ios`
2. Grant Bluetooth permissions when prompted
3. Navigate to Gate Control page
4. Test connection and commands

## 🚀 Adding to Navigation

To add the Gate Control page to your app's navigation menu:

### Option 1: Add to Home Page Quick Actions

Edit `src/pages/auth/Home.vue` and add:

```vue
<button class="action-card" @click="navigateToGateControl">
  <div class="action-icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  </div>
  <div class="action-content">
    <h3>Gate Control</h3>
  </div>
</button>
```

And add the navigation method:

```javascript
const navigateToGateControl = () => {
  router.push('/gate-control')
}
```

### Option 2: Add to Main Layout Menu

Edit your main layout file and add a menu item that navigates to `/gate-control`.

## 🔐 Security Considerations

1. **Password Storage**: The password is currently hardcoded. For production:
   - Store passwords securely in Firestore per user
   - Implement password rotation
   - Add encryption for sensitive commands

2. **BLE Security**:
   - Consider implementing BLE pairing/bonding
   - Add encryption to BLE characteristics
   - Implement timeout for connections

3. **Authorization**:
   - Verify user permissions before allowing gate control
   - Log all gate access attempts
   - Add admin controls for gate management

## 🎨 UI Customization

The UI uses Quasar components and custom CSS. To customize:

### Change Colors

In `GateControlPage.vue`, modify the CSS variables:

```css
.bluetooth-icon.connected {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR 100%);
}
```

### Add Custom Icons

Replace Quasar icons with custom SVGs or Material Icons:

```vue
<q-icon name="your-icon-name" size="48px" />
```

## 🐛 Troubleshooting

### Issue: "Bluetooth Not Supported"

**Solution**:

- For web: Use Chrome or Edge browser
- For native: Ensure Bluetooth permissions are granted
- Check device has BLE capability

### Issue: Cannot find device

**Solution**:

- Ensure ESP32 is powered on and advertising
- Check UUIDs match between app and ESP32
- Move closer to device (BLE range is limited)
- Restart Bluetooth on phone

### Issue: Connection drops frequently

**Solution**:

- Check ESP32 power supply
- Reduce distance between devices
- Check for BLE interference
- Implement reconnection logic

### Issue: Command not received by ESP32

**Solution**:

- Verify characteristic UUID is correct
- Check ESP32 Serial Monitor for errors
- Ensure characteristic has WRITE property
- Verify password format matches

## 📚 API Reference

### useBluetooth Composable

```javascript
const {
  isConnected, // Boolean - connection status
  isConnecting, // Boolean - connecting in progress
  isScanning, // Boolean - scanning for devices
  isBLESupported, // Boolean - BLE support status
  deviceName, // String - connected device name
  lastError, // String - last error message
  checkBLESupport, // Function - check if BLE is supported
  connect, // Function(serviceUUID) - connect to device
  write, // Function(serviceUUID, charUUID, data) - write data
  disconnect, // Function() - disconnect from device
} = useBluetooth()
```

### Example: Creating a Door Lock Page

```vue
<script setup>
import { useBluetooth } from '../../composables/useBluetooth'

const DOOR_SERVICE_UUID = 'your-door-service-uuid'
const DOOR_CHAR_UUID = 'your-door-characteristic-uuid'
const UNLOCK_PASSWORD = 'UNLOCK456'

const { isConnected, connect, write } = useBluetooth()

const unlockDoor = async () => {
  if (!isConnected.value) {
    await connect(DOOR_SERVICE_UUID)
  }
  await write(DOOR_SERVICE_UUID, DOOR_CHAR_UUID, UNLOCK_PASSWORD)
}
</script>
```

## 🔄 Future Enhancements

Potential features to add:

1. **Multiple Device Management**
   - Save favorite devices
   - Quick connect to last used device
   - Device nicknames

2. **Scheduled Access**
   - Set timer for automatic gate closing
   - Schedule recurring access times
   - Guest access with temporary codes

3. **Access Logs**
   - Track who opened the gate and when
   - Export access history
   - Real-time notifications

4. **Advanced Controls**
   - Partial gate opening
   - Stop/pause commands
   - Status monitoring (open/closed sensors)

5. **Multi-user Support**
   - Share access with family members
   - Temporary guest access
   - Permission levels

## 📞 Support

For issues or questions:

- Check the troubleshooting section above
- Review ESP32 Serial Monitor logs
- Check browser console for errors
- Verify BLE permissions are granted

## 📄 License

This feature is part of the PRE Group application.

---

**Last Updated**: October 2025
**Version**: 1.0.0
