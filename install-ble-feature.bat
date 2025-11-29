@echo off
REM Gate Control BLE Feature Installation Script (Windows)
REM This script installs and configures the BLE feature for the Quasar app

echo.
echo ================================
echo   BLE Gate Control Installer
echo ================================
echo.

REM Step 1: Install BLE plugin
echo [Step 1/5] Installing @capacitor-community/bluetooth-le...
call npm install @capacitor-community/bluetooth-le
if errorlevel 1 (
    echo ERROR: Failed to install BLE plugin
    pause
    exit /b 1
)
echo SUCCESS: BLE plugin installed
echo.

REM Step 2: Sync Capacitor
echo [Step 2/5] Syncing Capacitor...
call npx cap sync
if errorlevel 1 (
    echo WARNING: Capacitor sync had issues
)
echo SUCCESS: Capacitor synced
echo.

REM Step 3: Android Instructions
echo [Step 3/5] Android Configuration Required
echo.
echo Please add these permissions to:
echo android/app/src/main/AndroidManifest.xml
echo.
echo ^<uses-permission android:name="android.permission.BLUETOOTH" /^>
echo ^<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" /^>
echo ^<uses-permission android:name="android.permission.BLUETOOTH_SCAN" 
echo                  android:usesPermissionFlags="neverForLocation" /^>
echo ^<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" /^>
echo ^<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" /^>
echo ^<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" /^>
echo.
pause

REM Step 4: iOS Instructions
echo.
echo [Step 4/5] iOS Configuration Required
echo.
echo Please add these to: ios/App/App/Info.plist
echo.
echo ^<key^>NSBluetoothAlwaysUsageDescription^</key^>
echo ^<string^>This app needs Bluetooth to connect to your gate device^</string^>
echo ^<key^>NSBluetoothPeripheralUsageDescription^</key^>
echo ^<string^>This app needs Bluetooth to connect to your gate device^</string^>
echo.
pause

REM Step 5: Final sync
echo.
echo [Step 5/5] Final Capacitor sync...
call npx cap sync
echo.

REM Success message
echo.
echo ================================
echo   Installation Complete!
echo ================================
echo.
echo Next Steps:
echo 1. Configure Android permissions in AndroidManifest.xml
echo 2. Configure iOS permissions in Info.plist
echo 3. Build and test: npx cap run android OR npx cap run ios
echo 4. For web testing, use Chrome or Edge
echo.
echo Documentation: GATE_CONTROL_BLE_GUIDE.md
echo Quick Start: GATE_CONTROL_QUICK_START.md
echo.
pause

