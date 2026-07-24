import { identifyCleanupTargets, getNextCleanupTime } from '../../../src/lifecycle/cleanup-scheduler';
import { Environment } from '../../../src/provisioner/state-machine';

const buildEnv = (id: string, state: Environment['state'], expiresInMs: number): Environment => ({
  id, name: `env-${id}`, state, branch: 'main',
  createdAt: new Date(Date.now() - 3600000),
  expiresAt: new Date(Date.now() + expiresInMs),
  lastActivityAt: new Date(), extensions: 0,
  resources: { cpuMillis: 250, memoryMb: 256, storageMb: 512, port: 4001 }, metadata: {},
});

describe('Cleanup Scheduler', () => {
  it('should identify expired active environments', () => {
    const envs = [
      buildEnv('e1', 'ready', -1000),
      buildEnv('e2', 'ready', 3600000),
      buildEnv('e3', 'testing', -5000),
    ];
    const result = identifyCleanupTargets(envs);
    expect(result.expired).toContain('e1');
    expect(result.expired).toContain('e3');
    expect(result.expired).not.toContain('e2');
  });

  it('should skip destroyed environments', () => {
    const envs = [
      buildEnv('e1', 'destroyed', -1000),
      buildEnv('e2', 'teardown', -1000),
    ];
    const result = identifyCleanupTargets(envs);
    expect(result.expired).toHaveLength(0);
  });

  it('should report checked count correctly', () => {
    const envs = [
      buildEnv('e1', 'ready', 3600000),
      buildEnv('e2', 'testing', 3600000),
      buildEnv('e3', 'destroyed', -1000),
    ];
    const result = identifyCleanupTargets(envs);
    expect(result.checked).toBe(2); // excludes destroyed
  });

  it('should calculate next cleanup time', () => {
    const next = getNextCleanupTime(60000);
    expect(next.getTime()).toBeGreaterThan(Date.now());
    expect(next.getTime()).toBeLessThanOrEqual(Date.now() + 61000);
  });
});
