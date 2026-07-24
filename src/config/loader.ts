import * as dotenv from 'dotenv';
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: { url: string };
  redis: { url: string };
  auth: { apiKey: string };
  ttl: { defaultHours: number; maxHours: number; cleanupIntervalMs: number };
  limits: { maxEnvironments: number };
  github: { token?: string; webhookSecret?: string };
}

export function loadAppConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '3003', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    database: { url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ephemeral_envs' },
    redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
    auth: { apiKey: process.env.API_KEY || '' },
    ttl: {
      defaultHours: parseInt(process.env.DEFAULT_TTL_HOURS || '4', 10),
      maxHours: parseInt(process.env.MAX_TTL_HOURS || '24', 10),
      cleanupIntervalMs: parseInt(process.env.CLEANUP_INTERVAL_MS || '60000', 10),
    },
    limits: { maxEnvironments: parseInt(process.env.MAX_ENVIRONMENTS || '10', 10) },
    github: { token: process.env.GITHUB_TOKEN, webhookSecret: process.env.GITHUB_WEBHOOK_SECRET },
  };
}
