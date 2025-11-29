import fs from 'node:fs/promises';
import admin from 'firebase-admin';

const OUTPUT_FILE = process.env.AUTH_EXPORT_FILE ?? 'auth-users.json';
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!serviceAccountPath) {
  console.error('Missing Firebase service account path. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

if (!projectId) {
  console.error('Missing FIREBASE_PROJECT_ID environment variable.');
  process.exit(1);
}

const rawCreds = JSON.parse(await fs.readFile(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(rawCreds),
  projectId,
});

const auth = admin.auth();

async function exportUsers() {
  const allUsers = [];
  let nextPageToken;

  do {
    const result = await auth.listUsers(1000, nextPageToken);
    const users = result.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      photoURL: user.photoURL,
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
      providerData: user.providerData,
      customClaims: user.customClaims,
    }));

    allUsers.push(...users);
    nextPageToken = result.pageToken;
    console.log(`Fetched ${allUsers.length} users so far...`);
  } while (nextPageToken);

  await fs.writeFile(OUTPUT_FILE, JSON.stringify({ users: allUsers }, null, 2));
  console.log(`✔ Exported ${allUsers.length} users to ${OUTPUT_FILE}`);
}

exportUsers().catch((error) => {
  console.error('Failed to export Firebase Auth users:', error);
  process.exit(1);
});

