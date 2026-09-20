// =============================================================================
// Configuration — backend/src/config/index.ts
// =============================================================================
// Loads application configuration from environment variables.
// In AWS ECS, secrets are injected as environment variables from Secrets Manager.
// =============================================================================

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  db: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  cors: {
    origin: string;
  };
  aws: {
    region: string;
    secretArn: string | null;
  };
}

/**
 * Fetch database credentials from AWS Secrets Manager.
 * Used when running in ECS with secrets injected via ARN.
 */
async function fetchSecretFromAWS(secretArn: string, region: string): Promise<Record<string, string>> {
  const client = new SecretsManagerClient({ region });
  const command = new GetSecretValueCommand({ SecretId: secretArn });
  const response = await client.send(command);

  if (!response.SecretString) {
    throw new Error('Secret string is empty');
  }

  return JSON.parse(response.SecretString);
}

/**
 * Load configuration from environment variables, optionally fetching
 * database credentials from AWS Secrets Manager.
 */
export async function loadConfig(): Promise<AppConfig> {
  const secretArn = process.env.DB_SECRET_ARN || null;
  const region = process.env.AWS_REGION || 'eu-west-3';

  let dbHost = process.env.DB_HOST || 'localhost';
  let dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  let dbName = process.env.DB_NAME || 'appdb';
  let dbUsername = process.env.DB_USERNAME || 'appadmin';
  let dbPassword = process.env.DB_PASSWORD || '';

  // If a Secrets Manager ARN is provided, fetch credentials from AWS
  if (secretArn && process.env.NODE_ENV === 'production') {
    try {
      console.log('Fetching database credentials from AWS Secrets Manager...');
      const secret = await fetchSecretFromAWS(secretArn, region);
      dbHost = secret.host || dbHost;
      dbPort = parseInt(secret.port || String(dbPort), 10);
      dbName = secret.dbname || dbName;
      dbUsername = secret.username || dbUsername;
      dbPassword = secret.password || dbPassword;
      console.log('Database credentials loaded from Secrets Manager');
    } catch (error) {
      console.error('Failed to fetch secret from AWS Secrets Manager:', error);
      throw error;
    }
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
      host: dbHost,
      port: dbPort,
      name: dbName,
      username: dbUsername,
      password: dbPassword,
      ssl: process.env.NODE_ENV === 'production',
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
    aws: {
      region,
      secretArn,
    },
  };
}
