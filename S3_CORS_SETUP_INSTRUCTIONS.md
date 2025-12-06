# S3 CORS Configuration Instructions

## Important: CORS vs Native Apps

**CORS (Cross-Origin Resource Sharing) only applies to web browsers.** 

- ✅ **Web browsers** (Chrome, Safari, Firefox, etc.) → **CORS is required**
- ✅ **iOS/Android native apps** → **CORS is NOT needed** (they make direct HTTP requests)

The code has been updated to:
1. Detect the platform (web vs native)
2. Handle credentials appropriately for each platform
3. Work seamlessly on all platforms

## Step 1: Configure CORS for Web Browsers

Even though native apps don't need CORS, you still need to configure it for web browsers.

### Steps:

1. **Go to AWS Console** → **S3**
2. **Open bucket**: `pre-app-user-images`
3. **Go to Permissions tab**
4. **Scroll to "Cross-origin resource sharing (CORS)"**
5. **Click "Edit"**
6. **Paste the JSON from `S3_CORS_CONFIGURATION.json`**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:9000",
      "http://localhost:9001",
      "http://localhost:8080",
      "http://localhost:*",
      "https://*.amazonaws.com",
      "https://*.cloudfront.net",
      "*"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

7. **Click "Save changes"**
8. **Wait 1-2 minutes** for changes to propagate

## Step 2: Verify Platform Detection

The code now automatically detects the platform:

- **Web**: Uses CORS-aware requests (needs CORS config)
- **iOS/Android**: Uses direct HTTP requests (no CORS needed)

### Platform Detection Logic:

```javascript
const isNative = Capacitor.isNativePlatform()
const isBrowser = typeof window !== 'undefined' && !isNative
```

## Step 3: Credentials for All Platforms

### For Web Browsers:
- Uses environment variables (`VITE_AWS_ACCESS_KEY_ID`, `VITE_AWS_SECRET_ACCESS_KEY`)
- Or Cognito Identity Pool (if configured and user is authenticated)

### For iOS/Android Native Apps:
- Uses environment variables (same as web)
- Or Cognito Identity Pool (if configured and user is authenticated)
- **No CORS restrictions** - direct S3 API calls

## Step 4: Testing

### Test on Web:
1. Open `http://localhost:9001`
2. Try uploading a profile picture
3. Check browser console for CORS errors (should be gone after CORS config)

### Test on iOS/Android:
1. Build the app: `npm run build` then `npx cap sync`
2. Open in Xcode (iOS) or Android Studio (Android)
3. Run on device/simulator
4. Try uploading a profile picture
5. **No CORS errors** (because native apps don't have CORS)

## Important Notes

1. **CORS is only for web browsers** - Native apps bypass CORS entirely
2. **Environment variables work on all platforms** - Make sure `.env` file has:
   ```
   VITE_AWS_ACCESS_KEY_ID=your_access_key
   VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
   VITE_AWS_REGION=us-east-1
   ```
3. **Production domains**: Update `AllowedOrigins` in CORS config to include your production web domain (e.g., `https://yourdomain.com`)
4. **Security**: For production, consider using Cognito Identity Pool instead of hardcoded credentials

## Troubleshooting

### Web Browser CORS Errors:
- ✅ Make sure CORS is configured in S3 bucket
- ✅ Wait 1-2 minutes after saving CORS config
- ✅ Check that your origin is in `AllowedOrigins`
- ✅ Clear browser cache and try again

### Native App Issues:
- ✅ Check that environment variables are set
- ✅ Verify AWS credentials are correct
- ✅ Check network connectivity on device
- ✅ Look for credential errors in device logs (not CORS errors)

### Both Platforms:
- ✅ Verify `.env` file exists and has correct values
- ✅ Restart dev server after changing `.env`
- ✅ Check AWS credentials have S3 write permissions
- ✅ Verify bucket name: `pre-app-user-images`
- ✅ Verify region: `us-east-1`
