import { EnvState, VALID_TRANSITIONS } from '../config/defaults';
import { logger } from '../config/logger';

export interface Environment {
  id: string;
  name: string;
  state: EnvState;
  branch: string;
  prNumber?: number;
  commitSha?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  extensions: number;
  resources: ResourceAllocation;
  url?: string;
  metadata: Record<string, unknown>;
}

export interface ResourceAllocation {
  cpuMillis: number;
  memoryMb: number;
  storageMb: number;
  port: number;
  networkId?: string;
}

/**
 * Transition an environment to a new state, enforcing valid transitions.
 */
export function transitionState(env: Environment, newState: EnvState): Environment {
  const validNext = VALID_TRANSITIONS[env.state];

  if (!validNext || !validNext.includes(newState)) {
    throw new Error(
      `Invalid state transition: ${env.state} → ${newState}. Valid: ${validNext?.join(', ') || 'none'}`,
    );
  }

  logger.info(`Environment ${env.id}: ${env.state} → ${newState}`);

  return {
    ...env,
    state: newState,
    lastActivityAt: new Date(),
  };
}

/**
 * Check if a transition is valid without performing it.
 */
export function canTransition(currentState: EnvState, targetState: EnvState): boolean {
  const valid = VALID_TRANSITIONS[currentState];
  return valid ? valid.includes(targetState) : false;
}

/**
 * Get all valid next states for a given state.
 */
export function getValidTransitions(state: EnvState): EnvState[] {
  return VALID_TRANSITIONS[state] || [];
}

/**
 * Check if an environment is in a terminal state.
 */
export function isTerminal(state: EnvState): boolean {
  return state === 'destroyed';
}

/**
 * Check if an environment is in an active (non-terminal) state.
 */
export function isActive(state: EnvState): boolean {
  return !['destroyed', 'failed'].includes(state);
}
