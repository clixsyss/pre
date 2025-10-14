#!/bin/bash

# Push Notification Installation Script for PRE Group
# This script automates the installation and setup of push notifications

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PRE Group - Push Notification Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if running from correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the 'pre' directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1/5: Installing dependencies..."
echo ""
npm install @capacitor/push-notifications
echo ""
echo "✅ Dependencies installed"
echo ""

# Step 2: Sync Capacitor
echo "🔄 Step 2/5: Syncing Capacitor..."
echo ""
npx cap sync
echo ""
echo "✅ Capacitor synced"
echo ""

# Step 3: Deploy Firestore Rules
echo "🔐 Step 3/5: Deploying Firestore rules..."
echo ""
firebase deploy --only firestore:rules
echo ""
echo "✅ Firestore rules deployed"
echo ""

# Step 4: Deploy Cloud Functions
echo "☁️  Step 4/5: Deploying Cloud Functions..."
echo ""
firebase deploy --only functions
echo ""
echo "✅ Cloud Functions deployed"
echo ""

# Step 5: Build web app
echo "🏗️  Step 5/5: Building web app..."
echo ""
npm run build
echo ""
echo "✅ Web app built"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Installation Complete! ✅"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Manual steps required:"
echo ""
echo "1. Get VAPID Key from Firebase Console:"
echo "   → https://console.firebase.google.com/project/pre-group/settings/cloudmessaging"
echo "   → Generate key pair under 'Web Push certificates'"
echo "   → Copy the key and update src/services/fcmService.js line 37"
echo ""
echo "2. Update quasar.config.js:"
echo "   → Add 'fcm' to the boot array"
echo ""
echo "3. iOS Setup (for iOS builds):"
echo "   → Upload APNs key to Firebase Console"
echo "   → Open ios/App/App.xcworkspace in Xcode"
echo "   → Add Push Notifications capability"
echo "   → Add Background Modes capability"
echo ""
echo "4. Dashboard Setup:"
echo "   → Add NotificationManager route in pre-dashboard/src/App.js"
echo ""
echo "📖 Read the full guide: PUSH_NOTIFICATION_IMPLEMENTATION_GUIDE.md"
echo "⚡ Quick start: PUSH_NOTIFICATION_QUICK_START.md"
echo ""
echo "🚀 Test your setup:"
echo "   npm run dev"
echo ""

