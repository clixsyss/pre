# Guest Pass Testing Guide

## ✅ What Was Implemented

### 1. One-Time Use QR Codes ✅
- Each guest pass QR code contains a unique verification token
- QR codes can only be scanned and used **once**
- Second scan attempt will return "Already used" error

### 2. Verification Cloud Function ✅
- **Deployed**: `verifyGuestPass` function in Firebase Cloud Functions
- **Endpoint**: `https://us-central1-pre-group.cloudfunctions.net/verifyGuestPass`
- **Runtime**: Node.js 20
- **Security Features**:
  - Verification token validation (prevents forged QR codes)
  - Expiration time check
  - One-time use enforcement
  - Soft-delete check
  - Comprehensive logging

### 3. Integration Documentation ✅
- **File**: `GUEST_PASS_SCANNER_INTEGRATION.md`
- Complete technical guide for hardware scanner integration
- Includes code examples in JavaScript, Python, and cURL
- Response handling and error codes
- Best practices and security guidelines

---

## 🧪 Testing the System

### Test Scenario 1: Valid Pass (Should Work)

**Steps:**
1. Open the PRE Group mobile app
2. Go to **Access** → **Guest Passes**
3. Create a new guest pass:
   - Guest Name: "Test User"
   - Validation: 2 hours
4. Click Share to get the QR code
5. Use test script below to verify

**Expected Result**: ✅ Success, guest allowed

---

### Test Scenario 2: Already Used (Should Fail)

**Steps:**
1. Use the same QR code from Test 1
2. Scan it again

**Expected Result**: ❌ "This pass has already been used and cannot be used again"

---

### Test Scenario 3: Expired Pass (Should Fail)

**Steps:**
1. Create a new pass with 1-minute validity
2. Wait 2 minutes
3. Scan the QR code

**Expected Result**: ❌ "This pass has expired and is no longer valid"

---

### Test Scenario 4: Deleted Pass (Should Fail)

**Steps:**
1. Create a new pass
2. In the app, delete the pass (soft delete)
3. Try to scan it

**Expected Result**: ❌ "This pass has been deleted and is no longer valid"

---

## 🧪 Quick Test Script

Save this as `test-guest-pass.js`:

```javascript
const https = require('https');

// Parse QR code data from a guest pass
const qrCodeData = {
  passId: "GP-1762280038803-JVXWT", // Replace with actual pass ID
  projectId: "BiHENuiMdDrivwbPccNE",
  verificationToken: "GP-1762280038803-JVXWT-ZAFO7Z7188G" // Replace with actual token
};

// Call verification function
const data = JSON.stringify({
  data: {
    projectId: qrCodeData.projectId,
    passId: qrCodeData.passId,
    verificationToken: qrCodeData.verificationToken
  }
});

const options = {
  hostname: 'us-central1-pre-group.cloudfunctions.net',
  port: 443,
  path: '/verifyGuestPass',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== VERIFICATION RESULT ===');
    const result = JSON.parse(responseData);
    
    if (result.result && result.result.success) {
      console.log('✅ ACCESS GRANTED');
      console.log(`Guest: ${result.result.data.guestName}`);
      console.log(`Purpose: ${result.result.data.purpose}`);
      console.log(`Used At: ${result.result.data.usedAt}`);
    } else {
      console.log('❌ ACCESS DENIED');
      console.log(`Error: ${result.result.error}`);
      console.log(`Message: ${result.result.message}`);
    }
    console.log('===========================\n');
  });
});

req.on('error', (error) => {
  console.error('❌ ERROR:', error);
});

req.write(data);
req.end();
```

**Run it:**
```bash
node test-guest-pass.js
```

---

## 🔒 Security Checks Performed

When a QR code is scanned, the system automatically validates:

1. ✅ **Pass Exists** - Document exists in Firestore
2. ✅ **Not Soft-Deleted** - Pass wasn't deleted by creator
3. ✅ **Token Match** - Verification token matches (prevents forgery)
4. ✅ **Not Already Used** - Pass hasn't been scanned before
5. ✅ **Not Expired** - Current time is before `validUntil`

**ALL checks must pass** for entry to be granted.

---

## 📊 What's in the QR Code?

Each QR code contains a JSON string:

```json
{
  "passId": "GP-1762280038803-JVXWT",
  "projectId": "BiHENuiMdDrivwbPccNE",
  "guestName": "John Doe",
  "validUntil": "2024-11-05T22:30:00.000Z",
  "createdAt": "2024-11-05T20:30:00.000Z",
  "verificationToken": "GP-1762280038803-JVXWT-XYZ123ABC"
}
```

The `verificationToken` is the **secret** that proves the QR code is genuine.

---

## 🔍 Monitoring & Logs

### View Logs
```bash
cd /Users/hady/Documents/Work/ClixSys/Projects/MobileApps/PRE/pre
firebase functions:log --only verifyGuestPass
```

### What's Logged
- ✅ Successful verifications (guest name, timestamp)
- ❌ Failed attempts (reason: expired, used, invalid token)
- 🔍 All verification attempts with pass IDs

---

## 🚨 Common Issues & Solutions

### Issue 1: "Pass not found"
**Cause**: Pass ID doesn't exist or was hard-deleted
**Solution**: Generate a new pass

### Issue 2: "Invalid token"
**Cause**: QR code was tampered with or manually created
**Solution**: Only accept QR codes generated by the app

### Issue 3: "Already used"
**Cause**: Pass was already scanned once (working as intended!)
**Solution**: Generate a new pass for re-entry

### Issue 4: Network Error
**Cause**: Scanner has no internet connection
**Solution**: 
- Ensure stable internet connection
- Verification requires real-time database access
- Consider backup internet connection for gate

---

## 📱 Creating Test Passes

### Via Mobile App:
1. Open PRE Group app
2. Navigate to **Access** tab
3. Tap **Guest Pass**
4. Fill in:
   - Guest Name
   - Purpose (optional)
   - Phone (optional)
   - Validation Time (hours)
5. Tap **Generate Pass**
6. Share QR code

### Test Pass Validations:
- **Short test**: 1 hour (for expiration testing)
- **Standard**: 2-4 hours
- **Long visit**: 8-12 hours

---

## 🎯 Next Steps

### For Hardware Integration:
1. Review `GUEST_PASS_SCANNER_INTEGRATION.md`
2. Choose integration method (REST API, Firebase SDK, etc.)
3. Implement QR scanner + verification call
4. Test with passes from app
5. Deploy to production scanners

### For Production:
1. ✅ Test all scenarios above
2. ✅ Verify one-time use works
3. ✅ Test expiration enforcement
4. ✅ Check soft-delete handling
5. Set up monitoring/alerts for failed scans
6. Train security staff on error messages

---

## 🆘 Support

**Technical Issues:**
- Developer: Hady Korshem
- Email: itshadyy@gmail.com

**Firebase Console:**
- https://console.firebase.google.com/project/pre-group
- Functions: https://console.firebase.google.com/project/pre-group/functions
- Firestore: https://console.firebase.google.com/project/pre-group/firestore

**Files:**
- Integration Guide: `GUEST_PASS_SCANNER_INTEGRATION.md`
- Cloud Function: `functions/index.js` (line 1268-1469)
- Mobile App: `src/api/guestPassAPI.js`

---

## ✅ Verification Checklist

Before going live:

- [ ] Tested valid pass (should work)
- [ ] Tested duplicate scan (should fail)
- [ ] Tested expired pass (should fail)
- [ ] Tested deleted pass (should fail)
- [ ] Verified logs are being recorded
- [ ] Hardware scanners can reach Firebase
- [ ] Security staff trained on error messages
- [ ] Backup plan for network outages
- [ ] Contact information available for support

---

*Last Updated: November 5, 2024*
*Version: 1.0.0*

