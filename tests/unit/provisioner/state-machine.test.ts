import { transitionState, canTransition, getValidTransitions, isTerminal, isActive, Environment } from '../../../src/provisioner/state-machine';

const buildEnv = (state: Environment['state'] = 'pending'): Environment => ({
  id: 'env-1', name: 'test-env', state, branch: 'feature/x', createdAt: new Date(),
  expiresAt: new Date(Date.now() + 4 * 3600000), lastActivityAt: new Date(), extensions: 0,
  resources: { cpuMillis: 250, memoryMb: 256, storageMb: 512, port: 4001 }, metadata: {},
});

describe('State Machine', () => {
  it('should transition pending → provisioning', () => {
    const env = buildEnv('pending');
    const next = transitionState(env, 'provisioning');
    expect(next.state).toBe('provisioning');
  });

  it('should transition provisioning → seeding', () => {
    const next = transitionState(buildEnv('provisioning'), 'seeding');
    expect(next.state).toBe('seeding');
  });

  it('should transition seeding → ready', () => {
    const next = transitionState(buildEnv('seeding'), 'ready');
    expect(next.state).toBe('ready');
  });

  it('should transition ready → testing', () => {
    const next = transitionState(buildEnv('ready'), 'testing');
    expect(next.state).toBe('testing');
  });

  it('should transition ready → teardown', () => {
    const next = transitionState(buildEnv('ready'), 'teardown');
    expect(next.state).toBe('teardown');
  });

  it('should transition teardown → destroyed', () => {
    const next = transitionState(buildEnv('teardown'), 'destroyed');
    expect(next.state).toBe('destroyed');
  });

  it('should throw on invalid transition', () => {
    const env = buildEnv('pending');
    expect(() => transitionState(env, 'ready')).toThrow('Invalid state transition');
  });

  it('should throw on transition from destroyed', () => {
    const env = buildEnv('destroyed');
    expect(() => transitionState(env, 'pending')).toThrow('Invalid state transition');
  });

  it('should allow any state to fail', () => {
    expect(canTransition('provisioning', 'failed')).toBe(true);
    expect(canTransition('seeding', 'failed')).toBe(true);
    expect(canTransition('testing', 'failed')).toBe(true);
  });

  it('should report valid transitions', () => {
    expect(getValidTransitions('ready')).toContain('testing');
    expect(getValidTransitions('ready')).toContain('teardown');
    expect(getValidTransitions('ready')).not.toContain('pending');
  });

  it('should identify terminal states', () => {
    expect(isTerminal('destroyed')).toBe(true);
    expect(isTerminal('ready')).toBe(false);
  });

  it('should identify active states', () => {
    expect(isActive('ready')).toBe(true);
    expect(isActive('provisioning')).toBe(true);
    expect(isActive('destroyed')).toBe(false);
    expect(isActive('failed')).toBe(false);
  });

  it('should update lastActivityAt on transition', () => {
    const env = buildEnv('pending');
    const before = env.lastActivityAt;
    const next = transitionState(env, 'provisioning');
    expect(next.lastActivityAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
