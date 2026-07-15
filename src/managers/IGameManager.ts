import type { StatTracker } from '../utils/StatTracker';
import type { BalanceTrackingManager } from './BalanceTrackingManager';

export type {
  BalanceTrackingReporter,
  IAIActionProvider,
  IBalanceTrackingProvider,
  IGameStateProvider,
  ITowerStateProvider,
  IWaveStateProvider,
  IZombieStateProvider,
} from '../types/gameProviders';

/**
 * IStatTrackerProvider - Stat tracker access interface
 *
 * Provides access to the StatTracker for AI and analytics systems.
 */
export interface IStatTrackerProvider {
  getStatTracker(): StatTracker;
}

/**
 * IGameManager - Deprecated monolithic interface
 *
 * @deprecated Use granular interfaces from `../types/gameProviders` instead.
 * This will be removed in a future refactor.
 */
export interface IGameManager {
  /** @deprecated Use IWaveStateProvider and inject WaveManager directly */
  getWaveManager(): unknown;
  /** @deprecated Use ITowerStateProvider and inject TowerPlacementManager directly */
  getTowerPlacementManager(): unknown;
  /** @deprecated Use IZombieStateProvider and inject ZombieManager directly */
  getZombieManager(): unknown;
  /** @deprecated Use IBalanceTrackingProvider */
  getBalanceTrackingManager(): BalanceTrackingManager;
  /** @deprecated Use IStatTrackerProvider */
  getStatTracker(): StatTracker;
  getMoney(): number;
  getLives(): number;
  getWave(): number;
  getCurrentState(): string;
}
