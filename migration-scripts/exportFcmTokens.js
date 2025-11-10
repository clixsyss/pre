import fs from 'node:fs/promises';
import admin from 'firebase-admin';

const OUTPUT_FILE = process.env.FCM_TOKENS_FILE ?? 'fcm-tokens.json';
const TOKENS_COLLECTION = process.env.FCM_TOKENS_COLLECTION ?? 'fcmTokens';
const USER_FIELD = process.env.FCM_TOKEN_USER_FIELD ?? 'userId';
const TOKEN_FIELD = process.env.FCM_TOKEN_FIELD ?? 'token';

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

const db = admin.firestore();

async function main() {
  const snapshot = await db.collection(TOKENS_COLLECTION).get();
  const tokens = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const tokenValue = data[TOKEN_FIELD];
    if (!tokenValue) {
      return;
    }

    tokens.push({
      id: doc.id,
      token: tokenValue,
      userId: data[USER_FIELD],
      attributes: data.attributes ?? {},
      raw: data,
    });
  });

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(tokens, null, 2));
  console.log(`✔ Exported ${tokens.length} FCM tokens to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error('Failed to export FCM tokens:', error);
  process.exit(1);
});

