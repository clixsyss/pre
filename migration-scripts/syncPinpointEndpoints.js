import fs from 'node:fs/promises';
import { PinpointClient, UpdateEndpointsBatchCommand } from '@aws-sdk/client-pinpoint';

const TOKENS_FILE = process.env.FCM_TOKENS_FILE ?? 'fcm-tokens.json';
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID;
const REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'us-east-1';
const PROFILE = process.env.AWS_PROFILE ?? 'PRE';

if (!PINPOINT_APP_ID) {
  console.error('Missing PINPOINT_APP_ID environment variable.');
  process.exit(1);
}

process.env.AWS_SDK_LOAD_CONFIG = '1';

const client = new PinpointClient({
  region: REGION,
  profile: PROFILE,
});

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const fileContents = await fs.readFile(TOKENS_FILE, 'utf8');
  const tokens = JSON.parse(fileContents);

  if (!Array.isArray(tokens) || tokens.length === 0) {
    console.warn(`No tokens found in ${TOKENS_FILE}`);
    return;
  }

  const batches = chunk(tokens, 100);

  for (const batch of batches) {
    const endpointsRequest = {
      ApplicationId: PINPOINT_APP_ID,
      EndpointBatchRequest: {
        Item: batch.map((entry) => {
          const { token, userId, platform = 'GCM', attributes = {} } = entry;

          if (!token) {
            throw new Error('Encountered token entry without a token property.');
          }

          return {
            Address: token,
            ChannelType: 'GCM',
            Id: `${userId ?? token}`,
            User: userId
              ? {
                  UserId: String(userId),
                  UserAttributes: attributes,
                }
              : undefined,
            Attributes: attributes,
            OptOut: 'NONE',
          };
        }),
      },
    };

    await client.send(new UpdateEndpointsBatchCommand(endpointsRequest));
    console.log(`✔ Synced batch of ${batch.length} endpoints`);
  }

  console.log('Pinpoint endpoint sync complete.');
}

main().catch((error) => {
  console.error('Failed to sync Pinpoint endpoints:', error);
  process.exit(1);
});

