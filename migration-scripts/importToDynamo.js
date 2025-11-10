import fs from 'node:fs/promises';
import path from 'node:path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const EXPORT_DIR = process.env.FIRESTORE_EXPORT_DIR ?? path.resolve('firestore-export');
const REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1';
const PROFILE = process.env.AWS_PROFILE ?? 'PRE';

process.env.AWS_SDK_LOAD_CONFIG = '1';

const client = new DynamoDBClient({
  region: REGION,
  profile: PROFILE,
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const args = process.argv.slice(2);
let onlyCollections = null;
const skipCollections = new Set();

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--only' && args[i + 1]) {
    onlyCollections = new Set(
      args[i + 1]
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
    );
    i += 1;
  } else if (arg === '--skip' && args[i + 1]) {
    args[i + 1]
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => skipCollections.add(entry));
    i += 1;
  }
}

const stagedSubcollectionItems = new Map();
const stagedUniqueKeys = new Set();

function stageSubcollections(docEntry, parentTable, parentKey) {
  if (!docEntry.subcollections) {
    return;
  }

  for (const [subName, payload] of Object.entries(docEntry.subcollections)) {
    if (!payload || !Array.isArray(payload.documents)) {
      continue;
    }

    const tableName = `${parentTable}__${subName}`;
    if (!stagedSubcollectionItems.has(tableName)) {
      stagedSubcollectionItems.set(tableName, []);
    }

    for (const subDoc of payload.documents) {
      const compositeParentId = parentKey;
      const item = {
        id: subDoc.id,
        parentId: compositeParentId,
        ...subDoc.data,
      };

      const uniqueKey = `${tableName}|${item.parentId}|${item.id}`;
      if (!stagedUniqueKeys.has(uniqueKey)) {
        stagedUniqueKeys.add(uniqueKey);
        stagedSubcollectionItems.get(tableName).push({
          tableName,
          item,
          document: subDoc,
        });
      }

      stageSubcollections(subDoc, tableName, `${compositeParentId}#${subDoc.id}`);
    }
  }
}

function flattenItem(docEntry, parentTable) {
  const item = {
    id: docEntry.id,
    ...docEntry.data,
  };

  stageSubcollections(docEntry, parentTable, docEntry.id);
  return item;
}

async function batchWrite(tableName, items) {
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map((item) => ({
            PutRequest: { Item: item },
          })),
        },
      }),
    );
  }
}

async function main() {
  const entries = await fs.readdir(EXPORT_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.warn(`No JSON export files found in ${EXPORT_DIR}. Run exportFirestore.js first.`);
    return;
  }

  for (const file of jsonFiles) {
    const tableName = path.basename(file.name, '.json');
    if (onlyCollections && !onlyCollections.has(tableName)) {
      continue;
    }
    if (skipCollections.has(tableName)) {
      continue;
    }

    const filePath = path.join(EXPORT_DIR, file.name);
    console.log(`→ Importing ${file.name} into ${tableName}`);

    const payload = JSON.parse(await fs.readFile(filePath, 'utf8'));
    stagedSubcollectionItems.clear();
    stagedUniqueKeys.clear();

    const rootSeen = new Set();
    const items = [];
    for (const doc of payload.documents) {
      const key = `${tableName}|${doc.id}`;
      if (rootSeen.has(key)) {
        continue;
      }
      rootSeen.add(key);
      items.push(flattenItem(doc, tableName));
    }

    if (items.length === 0) {
      console.log(`   (No documents to import)`);
      continue;
    }

    await batchWrite(tableName, items);
    console.log(`✔ Imported ${items.length} items into ${tableName}`);

    for (const [subTableName, stagedItems] of stagedSubcollectionItems.entries()) {
      const mappedItems = stagedItems.map(({ item }) => item);
      if (mappedItems.length === 0) {
        continue;
      }

      await batchWrite(subTableName, mappedItems);
      console.log(`   ↳ Imported ${mappedItems.length} items into ${subTableName}`);
    }
  }
}

main().catch((error) => {
  console.error('Failed to import data into DynamoDB:', error);
  process.exit(1);
});

