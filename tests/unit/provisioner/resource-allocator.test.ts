import { allocateResources, releaseResources, getActiveCount, hasCapacity, estimateCost } from '../../../src/provisioner/resource-allocator';

describe('Resource Allocator', () => {
  afterEach(() => {
    // Tests individually clean up their allocations
  });

  it('should allocate small tier resources', () => {
    const alloc = allocateResources({ tier: 'small' });
    expect(alloc.cpuMillis).toBe(250);
    expect(alloc.memoryMb).toBe(256);
    expect(alloc.storageMb).toBe(512);
    expect(alloc.port).toBeGreaterThanOrEqual(4000);
    releaseResources(alloc);
  });

  it('should allocate medium tier resources', () => {
    const alloc = allocateResources({ tier: 'medium' });
    expect(alloc.cpuMillis).toBe(500);
    expect(alloc.memoryMb).toBe(512);
    releaseResources(alloc);
  });

  it('should allocate large tier resources', () => {
    const alloc = allocateResources({ tier: 'large' });
    expect(alloc.cpuMillis).toBe(1000);
    expect(alloc.memoryMb).toBe(1024);
    expect(alloc.storageMb).toBe(2048);
    releaseResources(alloc);
  });

  it('should assign unique ports', () => {
    const a1 = allocateResources({ tier: 'small' });
    const a2 = allocateResources({ tier: 'small' });
    expect(a1.port).not.toBe(a2.port);
    releaseResources(a1);
    releaseResources(a2);
  });

  it('should release ports for reuse', () => {
    const a1 = allocateResources({ tier: 'small' });
    const port = a1.port;
    releaseResources(a1);
    const a2 = allocateResources({ tier: 'small' });
    expect(a2.port).toBe(port);
    releaseResources(a2);
  });

  it('should track active count', () => {
    const initial = getActiveCount();
    const a1 = allocateResources({ tier: 'small' });
    expect(getActiveCount()).toBe(initial + 1);
    releaseResources(a1);
    expect(getActiveCount()).toBe(initial);
  });

  it('should check capacity', () => {
    expect(hasCapacity(10)).toBe(true);
    expect(hasCapacity(0)).toBe(false);
  });

  it('should throw on unknown tier', () => {
    expect(() => allocateResources({ tier: 'xl' as 'small' })).toThrow('Unknown resource tier');
  });

  it('should estimate cost correctly', () => {
    const cost = estimateCost({ cpuMillis: 1000, memoryMb: 1024, storageMb: 1024, port: 4000 });
    expect(cost).toBeGreaterThan(0);
    expect(typeof cost).toBe('number');
  });
});
