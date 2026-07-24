export const DEFAULT_PORT = 3003;
export const DEFAULT_TTL_HOURS = 4;
export const MAX_TTL_HOURS = 24;
export const MAX_ENVIRONMENTS = 10;
export const EXTEND_INCREMENT_HOURS = 2;
export const MAX_EXTENSIONS = 3;
export const IDLE_TIMEOUT_HOURS = 1;

export const ENV_STATES = ['pending', 'provisioning', 'seeding', 'ready', 'testing', 'teardown', 'destroyed', 'failed', 'expired'] as const;
export type EnvState = (typeof ENV_STATES)[number];

export const VALID_TRANSITIONS: Record<string, EnvState[]> = {
  pending: ['provisioning', 'failed'],
  provisioning: ['seeding', 'failed'],
  seeding: ['ready', 'failed'],
  ready: ['testing', 'teardown', 'expired'],
  testing: ['ready', 'teardown', 'failed'],
  teardown: ['destroyed', 'failed'],
  expired: ['teardown'],
  destroyed: [],
  failed: ['teardown', 'pending'],
};
