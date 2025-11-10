import fs from 'node:fs/promises';
import path from 'node:path';
import admin from 'firebase-admin';
import { Timestamp, GeoPoint, DocumentReference } from 'firebase-admin/firestore';

const EXPORT_DIR = process.env.FIRESTORE_EXPORT_DIR ?? path.resolve('firestore-export');
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
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`,
});

const db = admin.firestore();

await fs.mkdir(EXPORT_DIR, { recursive: true });

console.log(`Exporting Firestore data for project ${projectId} into ${EXPORT_DIR}`);

function serializeValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof GeoPoint) {
    return { latitude: value.latitude, longitude: value.longitude };
  }

  if (value instanceof DocumentReference) {
    return value.path;
  }

  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, subValue]) => [key, serializeValue(subValue)]),
    );
  }

  return value;
}

async function exportCollection(collectionRef, parentPath = []) {
  const snapshot = await collectionRef.get();
  const documents = [];

  for (const doc of snapshot.docs) {
    const data = serializeValue(doc.data());
    const docEntry = {
      id: doc.id,
      path: doc.ref.path,
      data,
      subcollections: {},
    };

    const subcollections = await doc.ref.listCollections();
    for (const sub of subcollections) {
      docEntry.subcollections[sub.id] = await exportCollection(sub, [...parentPath, doc.id, sub.id]);
    }

    documents.push(docEntry);
  }

  return {
    collectionId: collectionRef.id,
    parent: parentPath.join('/'),
    documents,
  };
}

const rootCollections = await db.listCollections();

for (const collection of rootCollections) {
  console.log(`→ Exporting collection ${collection.id}`);
  const exportPayload = await exportCollection(collection);
  const outPath = path.join(EXPORT_DIR, `${collection.id}.json`);
  await fs.writeFile(outPath, JSON.stringify(exportPayload, null, 2));
}

console.log('Firestore export complete.');

