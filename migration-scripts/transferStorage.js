import path from 'node:path';
import admin from 'firebase-admin';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime';

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
const projectId = process.env.FIREBASE_PROJECT_ID;
const firebaseBucketName =
  process.env.FIREBASE_STORAGE_BUCKET ?? (projectId ? `${projectId}.appspot.com` : undefined);
const targetBucket = process.env.AMPLIFY_S3_BUCKET;
const REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1';
const PROFILE = process.env.AWS_PROFILE ?? 'PRE';

if (!serviceAccountPath) {
  console.error('Missing Firebase service account path. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

if (!projectId) {
  console.error('Missing FIREBASE_PROJECT_ID environment variable.');
  process.exit(1);
}

if (!targetBucket) {
  console.error('Missing AMPLIFY_S3_BUCKET environment variable.');
  process.exit(1);
}

process.env.AWS_SDK_LOAD_CONFIG = '1';

const rawCreds = JSON.parse(await (await import('node:fs/promises')).readFile(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(rawCreds),
  projectId,
  storageBucket: firebaseBucketName,
});

const storage = admin.storage().bucket(firebaseBucketName);
const s3 = new S3Client({
  region: REGION,
  profile: PROFILE,
});

console.log(`Transferring Firebase Storage objects from ${firebaseBucketName} to ${targetBucket}`);

async function uploadFile(file) {
  const destinationKey = file.name;

  const [metadata] = await file.getMetadata();
  const contentType =
    mime.getType(path.basename(file.name)) ?? metadata?.contentType ?? 'application/octet-stream';

  const [fileBuffer] = await file.download();

  const putParams = {
    Bucket: targetBucket,
    Key: destinationKey,
    Body: fileBuffer,
    ContentType: contentType,
    ContentLength: fileBuffer.length,
  };

  const objectAcl = process.env.S3_OBJECT_ACL;
  if (objectAcl) {
    putParams.ACL = objectAcl;
  }

  await s3.send(new PutObjectCommand(putParams));

  console.log(`✔ Uploaded ${destinationKey}`);
}

async function main() {
  let pageToken;
  do {
    const [files, nextQuery] = await storage.getFiles({
      maxResults: 100,
      pageToken,
    });

    for (const file of files) {
      await uploadFile(file);
    }

    pageToken = nextQuery?.pageToken;
  } while (pageToken);

  console.log('Firebase Storage transfer complete.');
}

main().catch((error) => {
  console.error('Failed to transfer storage objects:', error);
  process.exit(1);
});

