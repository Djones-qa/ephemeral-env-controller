import { ResourceAllocation } from './state-machine';
import { logger } from '../config/logger';

const allocatedPorts = new Set<number>();
const PORT_RANGE_START = 4000;
const PORT_RANGE_END = 5000;

export interface ResourceRequest {
  tier: 'small' | 'medium' | 'large';
}

const TIER_CONFIGS: Record<string, Omit<ResourceAllocation, 'port' | 'networkId'>> = {
  small: { cpuMillis: 250, memoryMb: 256, storageMb: 512 },
  medium: { cpuMillis: 500, memoryMb: 512, storageMb: 1024 },
  large: { cpuMillis: 1000, memoryMb: 1024, storageMb: 2048 },
};

/**
 * Allocate resources for a new environment.
 */
export function allocateResources(request: ResourceRequest): ResourceAllocation {
  const tier = TIER_CONFIGS[request.tier];
  if (!tier) {
    throw new Error(`Unknown resource tier: ${request.tier}. Valid: small, medium, large`);
  }

  const port = findAvailablePort();
  allocatedPorts.add(port);

  const allocation: ResourceAllocation = {
    ...tier,
    port,
    networkId: `env-net-${port}`,
  };

  logger.info(`Allocated resources: ${request.tier} tier, port ${port}`);
  return allocation;
}

/**
 * Release resources when an environment is destroyed.
 */
export function releaseResources(allocation: ResourceAllocation): void {
  allocatedPorts.delete(allocation.port);
  logger.info(`Released resources: port ${allocation.port}`);
}

/**
 * Get the number of currently allocated ports (environments).
 */
export function getActiveCount(): number {
  return allocatedPorts.size;
}

/**
 * Check if capacity is available for a new environment.
 */
export function hasCapacity(maxEnvironments: number): boolean {
  return allocatedPorts.size < maxEnvironments;
}

/**
 * Calculate estimated hourly cost for a resource allocation.
 */
export function estimateCost(allocation: ResourceAllocation): number {
  const cpuCostPerHour = (allocation.cpuMillis / 1000) * 0.05;
  const memCostPerHour = (allocation.memoryMb / 1024) * 0.025;
  const storageCostPerHour = (allocation.storageMb / 1024) * 0.01;
  return Math.round((cpuCostPerHour + memCostPerHour + storageCostPerHour) * 1000) / 1000;
}

function findAvailablePort(): number {
  for (let port = PORT_RANGE_START; port <= PORT_RANGE_END; port++) {
    if (!allocatedPorts.has(port)) {
      return port;
    }
  }
  throw new Error('No available ports in range');
}
