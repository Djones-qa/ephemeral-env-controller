import { isExpired, extendTtl, getRemainingMinutes, getExpiredEnvironments } from '../../../src/lifecycle/ttl-manager';
import { Environment } from '../../../src/provisioner/state-machine';

const buildEnv = (expiresInMs: number, extensions = 0, state: Environment['state'] = 'ready'): Environment => ({
  id: 'env-1', name: 'test-env', state, branch: 'main',
  createdAt: new Date(Date.now() - 3600000),
  expiresAt: new Date(Date.now() + expiresInMs),
  lastActivityAt: new Date(), extensions,
  resources: { cpuMillis: 250, memoryMb: 256, storageMb: 512, port: 4001 }, metadata: {},
});

describe('TTL Manager', () => {
  it('should detect expired environments', () => {
    const env = buildEnv(-1000); // expired 1 second ago
    expect(isExpired(env)).toBe(true);
  });

  it('should detect active environments as not expired', () => {
    const env = buildEnv(3600000); // 1 hour remaining
    expect(isExpired(env)).toBe(false);
  });

  it('should extend TTL', () => {
    const env = buildEnv(1800000); // 30 min remaining
    const extended = extendTtl(env);
    expect(extended.expiresAt.getTime()).toBeGreaterThan(env.expiresAt.getTime());
    expect(extended.extensions).toBe(1);
  });

  it('should throw when max extensions reached', () => {
    const env = buildEnv(1800000, 3);
    expect(() => extendTtl(env)).toThrow('maximum extensions');
  });

  it('should calculate remaining minutes', () => {
    const env = buildEnv(3600000); // 1 hour
    const remaining = getRemainingMinutes(env);
    expect(remaining).toBeGreaterThanOrEqual(59);
    expect(remaining).toBeLessThanOrEqual(60);
  });

  it('should return 0 for expired environments', () => {
    const env = buildEnv(-1000);
    expect(getRemainingMinutes(env)).toBe(0);
  });

  it('should filter expired environments', () => {
    const envs = [
      buildEnv(-1000, 0, 'ready'),
      buildEnv(3600000, 0, 'ready'),
      buildEnv(-5000, 0, 'testing'),
      buildEnv(-1000, 0, 'destroyed'),
    ];
    const expired = getExpiredEnvironments(envs);
    expect(expired).toHaveLength(2); // ready + testing, not destroyed
  });
});
