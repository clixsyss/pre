# Guest Pass QR Code Scanner Integration Guide

## Overview
This document provides complete technical details for integrating hardware QR code scanners with the PRE Group Guest Pass system. The system enforces **one-time use** guest passes with expiration times and verification tokens.

---

## Table of Contents
1. [QR Code Structure](#qr-code-structure)
2. [Verification API](#verification-api)
3. [Verification Flow](#verification-flow)
4. [Security Checks](#security-checks)
5. [Response Handling](#response-handling)
6. [Error Codes](#error-codes)
7. [Testing](#testing)
8. [Best Practices](#best-practices)

---

## QR Code Structure

### Data Format
Each guest pass QR code contains a **JSON string** with the following structure:

```json
{
  "passId": "GP-1730123456789-ABC12",
  "projectId": "BiHENuiMdDrivwbPccNE",
  "guestName": "John Doe",
  "validUntil": "2024-11-05T22:30:00.000Z",
  "createdAt": "2024-11-05T20:30:00.000Z",
  "verificationToken": "GP-1730123456789-ABC12-XYZ9876ABCDE"
}
```

### Field Descriptions
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `passId` | String | Unique pass identifier | `GP-1730123456789-ABC12` |
| `projectId` | String | Project/property ID | `BiHENuiMdDrivwbPccNE` |
| `guestName` | String | Guest's full name | `John Doe` |
| `validUntil` | ISO 8601 | Pass expiration time | `2024-11-05T22:30:00.000Z` |
| `createdAt` | ISO 8601 | Pass creation time | `2024-11-05T20:30:00.000Z` |
| `verificationToken` | String | **Secret token for verification** | `GP-1730123456789-ABC12-XYZ9876ABCDE` |

---

## Verification API

### Endpoint: Verify and Use Pass

**Purpose:** Validates a guest pass and marks it as used (one-time use enforcement).

#### HTTP Request
```http
POST https://us-central1-pre-group.cloudfunctions.net/verifyGuestPass
Content-Type: application/json
```

#### Request Body
```json
{
  "projectId": "BiHENuiMdDrivwbPccNE",
  "passId": "GP-1730123456789-ABC12",
  "verificationToken": "GP-1730123456789-ABC12-XYZ9876ABCDE"
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Pass verified and marked as used",
  "data": {
    "passId": "GP-1730123456789-ABC12",
    "guestName": "John Doe",
    "purpose": "Guest Visit",
    "usedAt": "2024-11-05T21:15:30.000Z"
  }
}
```

#### Error Responses

**Pass Not Found (404)**
```json
{
  "success": false,
  "error": "Pass not found",
  "message": "This guest pass does not exist"
}
```

**Invalid Token (403)**
```json
{
  "success": false,
  "error": "Invalid token",
  "message": "Invalid verification token"
}
```

**Already Used (409)**
```json
{
  "success": false,
  "error": "Already used",
  "message": "This pass has already been used",
  "data": {
    "usedAt": "2024-11-05T21:00:00.000Z"
  }
}
```

**Expired (410)**
```json
{
  "success": false,
  "error": "Expired",
  "message": "This pass has expired"
}
```

---

## Verification Flow

### Step-by-Step Process

```
┌──────────────────┐
│ 1. Scan QR Code  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 2. Parse JSON    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 3. Extract Data  │
│  - passId        │
│  - projectId     │
│  - verificationToken │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 4. Call API      │
│    POST /verify  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 5. Check Response│
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│SUCCESS │ │ ERROR  │
│ ✅     │ │  ❌    │
│Allow   │ │ Deny   │
│Entry   │ │ Entry  │
└────────┘ └────────┘
```

---

## Security Checks

### Automatic Checks Performed by API

The verification API automatically validates:

1. ✅ **Pass Exists**: Pass ID is valid and exists in database
2. ✅ **Token Match**: Verification token matches stored token
3. ✅ **Not Used**: Pass hasn't been used before (one-time use)
4. ✅ **Not Expired**: Current time is before `validUntil`
5. ✅ **Soft Delete**: Pass hasn't been soft-deleted by creator

### Client-Side Pre-checks (Optional)

Before calling the API, you can perform these checks locally:

```javascript
// Example pseudo-code
const qrData = JSON.parse(scanResult);

// Check 1: Has required fields
if (!qrData.passId || !qrData.projectId || !qrData.verificationToken) {
  return error("Invalid QR code format");
}

// Check 2: Not expired (local check, API will verify again)
const validUntil = new Date(qrData.validUntil);
const now = new Date();
if (now > validUntil) {
  return error("Pass expired");
}

// Check 3: Call verification API
const result = await verifyPass(qrData);
```

---

## Response Handling

### Display Messages

#### ✅ Success - Allow Entry
```
┌─────────────────────────────┐
│     ✅ ACCESS GRANTED       │
├─────────────────────────────┤
│  Guest: John Doe            │
│  Purpose: Guest Visit       │
│  Time: 9:15 PM              │
│                             │
│  🟢 ALLOW ENTRY             │
└─────────────────────────────┘
```

#### ❌ Already Used
```
┌─────────────────────────────┐
│   ❌ ACCESS DENIED          │
├─────────────────────────────┤
│  ERROR: Pass Already Used   │
│                             │
│  Used at: 9:00 PM           │
│  This pass can only be      │
│  used once                  │
│                             │
│  🔴 DENY ENTRY              │
└─────────────────────────────┘
```

#### ⏰ Expired
```
┌─────────────────────────────┐
│   ❌ ACCESS DENIED          │
├─────────────────────────────┤
│  ERROR: Pass Expired        │
│                             │
│  This guest pass has        │
│  expired and is no longer   │
│  valid                      │
│                             │
│  🔴 DENY ENTRY              │
└─────────────────────────────┘
```

#### 🚫 Invalid Token
```
┌─────────────────────────────┐
│   ❌ ACCESS DENIED          │
├─────────────────────────────┤
│  ERROR: Invalid Pass        │
│                             │
│  This QR code is not valid  │
│  or has been tampered with  │
│                             │
│  🔴 DENY ENTRY              │
└─────────────────────────────┘
```

---

## Error Codes

| HTTP Status | Error Code | Meaning | Action |
|-------------|------------|---------|--------|
| 200 | `success: true` | Pass verified and marked as used | **ALLOW ENTRY** ✅ |
| 404 | `Pass not found` | Pass doesn't exist | **DENY ENTRY** ❌ |
| 403 | `Invalid token` | Token mismatch (tampered QR) | **DENY ENTRY** ❌ |
| 409 | `Already used` | Pass already scanned | **DENY ENTRY** ❌ |
| 410 | `Expired` | Pass expired | **DENY ENTRY** ❌ |
| 500 | `Verification failed` | Server error | **DENY ENTRY** ❌ (try again) |

---

## Testing

### Test QR Codes

You can generate test passes through the mobile app:

1. Open PRE Group mobile app
2. Go to **Access** → **Guest Passes**
3. Create a new guest pass
4. Share the QR code
5. Test scanning with your hardware

### Test Scenarios

#### ✅ Valid Pass (Should Allow Entry)
1. Create a new pass with future expiration
2. Scan QR code
3. **Expected**: Success response, entry allowed
4. Try scanning again
5. **Expected**: "Already used" error, entry denied

#### ❌ Expired Pass (Should Deny Entry)
1. Create a pass with 1-minute validity
2. Wait 2 minutes
3. Scan QR code
4. **Expected**: "Expired" error, entry denied

#### ❌ Invalid QR Code (Should Deny Entry)
1. Create any text QR code
2. Scan it
3. **Expected**: JSON parse error or "Pass not found"

---

## Best Practices

### 1. Network Connection
- Ensure scanner has **stable internet connection**
- API verification requires real-time database access
- Cache recent scans locally to prevent duplicate network calls

### 2. Scan Confirmation
```
✅ DO: Show clear visual/audio feedback
   - Success: Green light + beep
   - Failure: Red light + error sound

❌ DON'T: Allow entry without API confirmation
```

### 3. Error Logging
Log all scan attempts with:
- Timestamp
- Pass ID
- Result (success/failure)
- Error message (if failed)
- Security guard ID (if applicable)

### 4. Offline Handling
```javascript
try {
  const result = await verifyPass(qrData);
  return result;
} catch (networkError) {
  // Network error - cannot verify
  // DENY entry and alert supervisor
  return {
    success: false,
    error: "Network error",
    message: "Cannot verify pass - network unavailable"
  };
}
```

### 5. Security
- ✅ **ALWAYS** call the verification API
- ✅ **NEVER** trust local expiration checks alone
- ✅ **NEVER** allow manual bypass without supervisor approval
- ✅ **LOG** all access attempts (successful and failed)

---

## Integration Examples

### Example 1: JavaScript/Node.js Scanner
```javascript
const axios = require('axios');

async function verifyGuestPass(qrCodeData) {
  try {
    // Parse QR code
    const data = JSON.parse(qrCodeData);
    
    // Call verification API
    const response = await axios.post(
      'https://us-central1-pre-group.cloudfunctions.net/verifyGuestPass',
      {
        projectId: data.projectId,
        passId: data.passId,
        verificationToken: data.verificationToken
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5 second timeout
      }
    );
    
    if (response.data.success) {
      console.log('✅ ACCESS GRANTED');
      console.log(`Guest: ${response.data.data.guestName}`);
      return { allowed: true, data: response.data };
    } else {
      console.log('❌ ACCESS DENIED');
      console.log(`Reason: ${response.data.message}`);
      return { allowed: false, error: response.data };
    }
    
  } catch (error) {
    console.error('❌ VERIFICATION ERROR:', error.message);
    return { allowed: false, error: error.message };
  }
}

// Usage
const scannedCode = '{"passId":"GP-123","projectId":"ABC",...}';
const result = await verifyGuestPass(scannedCode);

if (result.allowed) {
  // Open gate, allow entry
} else {
  // Deny entry, show error
}
```

### Example 2: Python Scanner
```python
import requests
import json
from datetime import datetime

def verify_guest_pass(qr_code_data):
    """Verify a guest pass QR code"""
    
    try:
        # Parse QR code
        data = json.loads(qr_code_data)
        
        # Call verification API
        response = requests.post(
            'https://us-central1-pre-group.cloudfunctions.net/verifyGuestPass',
            json={
                'projectId': data['projectId'],
                'passId': data['passId'],
                'verificationToken': data['verificationToken']
            },
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        result = response.json()
        
        if result.get('success'):
            print('✅ ACCESS GRANTED')
            print(f"Guest: {result['data']['guestName']}")
            print(f"Time: {datetime.now()}")
            return {'allowed': True, 'data': result}
        else:
            print('❌ ACCESS DENIED')
            print(f"Reason: {result.get('message')}")
            return {'allowed': False, 'error': result}
            
    except Exception as e:
        print(f'❌ ERROR: {str(e)}')
        return {'allowed': False, 'error': str(e)}

# Usage
scanned_code = '{"passId":"GP-123",...}'
result = verify_guest_pass(scanned_code)

if result['allowed']:
    # Open gate
    pass
else:
    # Deny entry
    pass
```

### Example 3: cURL Command Line
```bash
# Extract data from QR code (manual example)
PROJECT_ID="BiHENuiMdDrivwbPccNE"
PASS_ID="GP-1730123456789-ABC12"
TOKEN="GP-1730123456789-ABC12-XYZ9876ABCDE"

# Verify pass
curl -X POST https://us-central1-pre-group.cloudfunctions.net/verifyGuestPass \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"passId\": \"$PASS_ID\",
    \"verificationToken\": \"$TOKEN\"
  }"
```

---

## Firestore Direct Access (Alternative)

If you have **Firebase Admin SDK** access, you can verify passes directly:

### Prerequisites
- Firebase Admin SDK credentials
- Service account key

### Direct Verification Code
```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: 'https://pre-group.firebaseio.com'
});

const db = admin.firestore();

async function verifyPassDirect(projectId, passId, verificationToken) {
  const passRef = db.doc(`projects/${projectId}/guestPasses/${passId}`);
  const passDoc = await passRef.get();
  
  if (!passDoc.exists) {
    return { success: false, error: 'Pass not found' };
  }
  
  const passData = passDoc.data();
  
  // Check token
  if (passData.verificationToken !== verificationToken) {
    return { success: false, error: 'Invalid token' };
  }
  
  // Check if used
  if (passData.used) {
    return { success: false, error: 'Already used' };
  }
  
  // Check expiration
  const now = new Date();
  const validUntil = passData.validUntil.toDate();
  if (now > validUntil) {
    return { success: false, error: 'Expired' };
  }
  
  // Mark as used
  await passRef.update({
    used: true,
    usedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return {
    success: true,
    data: {
      passId,
      guestName: passData.guestName,
      purpose: passData.purpose
    }
  };
}
```

---

## Support & Contact

For technical integration support:
- **Email**: itshadyy@gmail.com
- **Developer**: Hady Korshem

For production issues:
- Check Firebase Console: https://console.firebase.google.com/project/pre-group
- View Firestore data: `projects/{projectId}/guestPasses/{passId}`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-11-05 | Initial documentation |

---

## License & Security Notice

⚠️ **CONFIDENTIAL**: This document contains sensitive security information. Do not share publicly.

- Guest pass verification tokens are **secret** and must not be logged or exposed
- All verification must go through the official API or Firebase Admin SDK
- Never implement client-side-only verification
- Always use HTTPS for API calls

---

*Last Updated: November 2024*
*Document Version: 1.0.0*

