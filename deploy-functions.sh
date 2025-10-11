#!/bin/bash

# Deploy Firebase Cloud Functions for PRE Group Migration
# This script installs dependencies and deploys the migrateOldUser function

set -e  # Exit on error

echo "🚀 PRE Group - Firebase Functions Deployment"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Check if functions directory exists
if [ ! -d "functions" ]; then
    echo "❌ Error: functions directory not found."
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing function dependencies..."
cd functions
if [ ! -f "package.json" ]; then
    echo "❌ Error: functions/package.json not found."
    exit 1
fi

npm install
echo "✅ Dependencies installed successfully"
echo ""

# Step 2: Return to project root
cd ..

# Step 3: Check Firebase CLI
echo "🔍 Step 2: Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it:"
    echo "   npm install -g firebase-tools"
    exit 1
fi
echo "✅ Firebase CLI found"
echo ""

# Step 4: Check Firebase login
echo "🔐 Step 3: Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo "⚠️  Not logged in to Firebase. Logging in..."
    firebase login
fi
echo "✅ Firebase authentication successful"
echo ""

# Step 5: Display current project
echo "📋 Current Firebase project:"
firebase use
echo ""

# Step 6: Ask for confirmation
read -p "🤔 Do you want to deploy functions to this project? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Step 7: Deploy functions
echo ""
echo "🚀 Step 4: Deploying Cloud Functions..."
firebase deploy --only functions

# Step 8: Success message
echo ""
echo "=============================================="
echo "✅ Deployment Complete!"
echo "=============================================="
echo ""
echo "📝 Next steps:"
echo "  1. Test the migration flow with a test user"
echo "  2. Monitor function logs: firebase functions:log"
echo "  3. Check Firebase Console for function status"
echo ""
echo "📚 For detailed documentation, see USER_MIGRATION_README.md"
echo ""

