import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { CognitoIdentityProviderClient, AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

const INPUT_FILE = process.env.AUTH_IMPORT_FILE ?? 'auth-users.json';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? 'sa-east-1';
const PROFILE = process.env.AWS_PROFILE ?? 'PRE';
const TEMP_PASSWORD = process.env.COGNITO_TEMP_PASSWORD;

if (!USER_POOL_ID) {
  console.error('Missing COGNITO_USER_POOL_ID environment variable.');
  process.exit(1);
}

process.env.AWS_SDK_LOAD_CONFIG = '1';

const client = new CognitoIdentityProviderClient({
  region: REGION,
  profile: PROFILE,
});

function generateTempPassword() {
  return crypto.randomBytes(12).toString('base64');
}

async function main() {
  const fileContents = await fs.readFile(INPUT_FILE, 'utf8');
  const payload = JSON.parse(fileContents);
  const users = payload.users ?? [];

  if (users.length === 0) {
    console.warn(`No users found in ${INPUT_FILE}`);
    return;
  }

  for (const user of users) {
    const attributes = [];

    if (user.email) {
      attributes.push({ Name: 'email', Value: user.email });
      attributes.push({ Name: 'email_verified', Value: String(user.emailVerified ?? false) });
    }

    if (user.phoneNumber) {
      attributes.push({ Name: 'phone_number', Value: user.phoneNumber });
    }

    if (user.displayName) {
      attributes.push({ Name: 'name', Value: user.displayName });
    }

    const command = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: user.uid,
      TemporaryPassword: TEMP_PASSWORD ?? generateTempPassword(),
      MessageAction: 'SUPPRESS',
      DesiredDeliveryMediums: [],
      UserAttributes: attributes,
    });

    try {
      await client.send(command);
      console.log(`✔ Created Cognito user ${user.uid}`);
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        console.warn(`User ${user.uid} already exists, skipping.`);
        continue;
      }
      throw error;
    }
  }

  console.log('Cognito user import complete. Remember to prompt users to reset their passwords.');
}

main().catch((error) => {
  console.error('Failed to import users into Cognito:', error);
  process.exit(1);
});

