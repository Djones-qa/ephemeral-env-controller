import { Environment } from '../provisioner/state-machine';
import { loadAppConfig } from '../config/loader';
import { logger } from '../config/logger';
import { EXTEND_INCREMENT_HOURS, MAX_EXTENSIONS } from '../config/defaults';

/**
 * Check if an environment has expired based on its TTL.
 */
export function isExpired(env: Environment): boolean {
  return new Date() > env.expiresAt;
}

/**
 * Extend the TTL of an environment.
 */
export function extendTtl(env: Environment): Environment {
  const config = loadAppConfig();

  if (env.extensions >= MAX_EXTENSIONS) {
    throw new Error(`Cannot extend: maximum extensions (${MAX_EXTENSIONS}) reached for ${env.id}`);
  }

  const newExpiry = new Date(env.expiresAt.getTime() + EXTEND_INCREMENT_HOURS * 60 * 60 * 1000);
  const maxExpiry = new Date(env.createdAt.getTime() + config.ttl.maxHours * 60 * 60 * 1000);

  const finalExpiry = newExpiry > maxExpiry ? maxExpiry : newExpiry;

  logger.info(`Extended TTL for ${env.id}: expires at ${finalExpiry.toISOString()} (extension ${env.extensions + 1}/${MAX_EXTENSIONS})`);

  return {
    ...env,
    expiresAt: finalExpiry,
    extensions: env.extensions + 1,
    lastActivityAt: new Date(),
  };
}

/**
 * Calculate remaining time in minutes.
 */
export function getRemainingMinutes(env: Environment): number {
  const remaining = env.expiresAt.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 60000));
}

/**
 * Get environments that have expired and need teardown.
 */
export function getExpiredEnvironments(environments: Environment[]): Environment[] {
  return environments.filter((env) => isExpired(env) && env.state !== 'destroyed' && env.state !== 'teardown');
}
