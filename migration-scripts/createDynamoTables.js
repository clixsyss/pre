import fs from 'node:fs/promises';
import path from 'node:path';
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  DeleteTableCommand,
  waitUntilTableExists,
  waitUntilTableNotExists,
} from '@aws-sdk/client-dynamodb';

const EXPORT_DIR = process.env.FIRESTORE_EXPORT_DIR ?? path.resolve('firestore-export');
const REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1';
const PROFILE = process.env.AWS_PROFILE ?? 'PRE';

process.env.AWS_SDK_LOAD_CONFIG = '1';

const client = new DynamoDBClient({
  region: REGION,
  profile: PROFILE,
});

function expectedDefinitionFor(tableName) {
  if (tableName.includes('__')) {
    return {
      AttributeDefinitions: [
        { AttributeName: 'parentId', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'parentId', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' },
      ],
    };
  }

  return {
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
  };
}

function schemasMatch(currentTable, expected) {
  const currentKey = currentTable.KeySchema ?? [];
  if (currentKey.length !== expected.KeySchema.length) {
    return false;
  }

  for (let i = 0; i < currentKey.length; i += 1) {
    if (
      currentKey[i].AttributeName !== expected.KeySchema[i].AttributeName ||
      currentKey[i].KeyType !== expected.KeySchema[i].KeyType
    ) {
      return false;
    }
  }

  const currentAttrs = (currentTable.AttributeDefinitions ?? []).map(
    ({ AttributeName, AttributeType }) => `${AttributeName}:${AttributeType}`,
  );
  const expectedAttrs = expected.AttributeDefinitions.map(
    ({ AttributeName, AttributeType }) => `${AttributeName}:${AttributeType}`,
  );

  currentAttrs.sort();
  expectedAttrs.sort();

  if (currentAttrs.length !== expectedAttrs.length) {
    return false;
  }

  for (let i = 0; i < currentAttrs.length; i += 1) {
    if (currentAttrs[i] !== expectedAttrs[i]) {
      return false;
    }
  }

  return true;
}

async function ensureTable(tableName) {
  const expectedDefinition = expectedDefinitionFor(tableName);

  try {
    const describe = await client.send(new DescribeTableCommand({ TableName: tableName }));
    if (schemasMatch(describe.Table, expectedDefinition)) {
      console.log(`✔ DynamoDB table ${tableName} already exists.`);
      return;
    }

    console.log(`⚠️ Recreating DynamoDB table ${tableName} to match expected key schema.`);
    await client.send(new DeleteTableCommand({ TableName: tableName }));
    await waitUntilTableNotExists({ client, maxWaitTime: 60 }, { TableName: tableName });
  } catch (error) {
    if (error.name !== 'ResourceNotFoundException') {
      throw error;
    }
  }

  console.log(`Creating DynamoDB table ${tableName}`);
  const command = new CreateTableCommand({
    TableName: tableName,
    AttributeDefinitions: expectedDefinition.AttributeDefinitions,
    KeySchema: expectedDefinition.KeySchema,
    BillingMode: 'PAY_PER_REQUEST',
  });

  await client.send(command);
  await waitUntilTableExists({ client, maxWaitTime: 60 }, { TableName: tableName });
  console.log(`✔ Created table ${tableName}`);
}

function collectSubcollectionTables(documents, parentTable, tables) {
  for (const doc of documents) {
    if (!doc.subcollections) {
      continue;
    }

    for (const [subName, payload] of Object.entries(doc.subcollections)) {
      if (!payload || !Array.isArray(payload.documents)) {
        continue;
      }

      const subTableName = `${parentTable}__${subName}`;
      tables.add(subTableName);
      collectSubcollectionTables(payload.documents, subTableName, tables);
    }
  }
}

async function main() {
  const entries = await fs.readdir(EXPORT_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.warn(`No JSON export files found in ${EXPORT_DIR}. Run exportFirestore.js first.`);
    return;
  }

  const tablesToEnsure = new Set();

  for (const file of jsonFiles) {
    const tableName = path.basename(file.name, '.json');
    tablesToEnsure.add(tableName);

    const filePath = path.join(EXPORT_DIR, file.name);
    try {
      const payload = JSON.parse(await fs.readFile(filePath, 'utf8'));
      if (payload?.documents?.length) {
        collectSubcollectionTables(payload.documents, tableName, tablesToEnsure);
      }
    } catch (error) {
      console.error(`Failed to analyze ${filePath}:`, error);
    }
  }

  for (const tableName of tablesToEnsure) {
    await ensureTable(tableName);
  }
}

main().catch((error) => {
  console.error('Failed to create DynamoDB tables:', error);
  process.exit(1);
});

