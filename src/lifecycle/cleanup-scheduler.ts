import { Environment } from '../provisioner/state-machine';
import { isExpired } from './ttl-manager';
import { logger } from '../config/logger';

export interface CleanupResult {
  checked: number;
  expired: string[];
  destroyed: string[];
  errors: Array<{ envId: string; error: string }>;
}

/**
 * Run a cleanup pass: identify expired environments and mark for teardown.
 */
export function identifyCleanupTargets(environments: Environment[]): CleanupResult {
  const activeEnvs = environments.filter(
    (e) => !['destroyed', 'teardown', 'failed'].includes(e.state),
  );

  const expired: string[] = [];
  const errors: Array<{ envId: string; error: string }> = [];

  for (const env of activeEnvs) {
    try {
      if (isExpired(env)) {
        expired.push(env.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ envId: env.id, error: message });
    }
  }

  if (expired.length > 0) {
    logger.info(`Cleanup scheduler: ${expired.length} environments expired out of ${activeEnvs.length} active`);
  }

  return {
    checked: activeEnvs.length,
    expired,
    destroyed: [],
    errors,
  };
}

/**
 * Calculate next cleanup run time.
 */
export function getNextCleanupTime(intervalMs: number): Date {
  return new Date(Date.now() + intervalMs);
}
