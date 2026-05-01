/**
 * IGameStateProvider - Core game state interface
 *
 * Provides access to basic game state: money, lives, wave, and game status.
 * Used by managers that only need to read game state without accessing sub-managers.
 */
export interface IGameStateProvider {
  getMoney(): number;
  getLives(): number;
  getWave(): number;
  getCurrentState(): string;
}

/**
 * IWaveStateProvider - Wave management interface
 *
 * Provides access to wave-specific state. Used by analytics and tracking systems
 * that need to know the current wave number.
 */
export interface IWaveStateProvider {
  getCurrentWave(): number;
}

/**
 * ITowerStateProvider - Tower state interface
 *
 * Provides access to placed towers. Used by systems that need to track
 * tower count and composition.
 */
import type { Tower } from '../objects/Tower';
export interface ITowerStateProvider {
  getPlacedTowers(): Tower[];
}

/**
 * IZombieStateProvider - Zombie state interface
 *
 * Provides access to active zombies. Used by analytics systems that track
 * zombie counts and combat statistics.
 */
import type { Zombie } from '../objects/Zombie';
export interface IZombieStateProvider {
  getZombies(): Zombie[];
}

/**
 * IStatTrackerProvider - Stat tracker access interface
 *
 * Provides access to the StatTracker for AI and analytics systems.
 */
import type { StatTracker } from '../utils/StatTracker';
export interface IStatTrackerProvider {
  getStatTracker(): StatTracker;
}

/**
 * IBalanceTrackingProvider - Balance tracking access interface
 *
 * Provides access to the BalanceTrackingManager for analytics systems.
 */
import type { BalanceTrackingManager } from './BalanceTrackingManager';
export interface IBalanceTrackingProvider {
  getBalanceTrackingManager(): BalanceTrackingManager;
}

/**
 * IGameManager - Deprecated monolithic interface
 *
 * @deprecated Use granular interfaces (IGameStateProvider, IWaveStateProvider, etc.)
 * instead of this interface. This will be removed in a future refactor.
 */
export interface IGameManager extends IGameStateProvider {
  /** @deprecated Use IWaveStateProvider and inject WaveManager directly */
  getWaveManager(): unknown;
  /** @deprecated Use ITowerStateProvider and inject TowerPlacementManager directly */
  getTowerPlacementManager(): unknown;
  /** @deprecated Use IZombieStateProvider and inject ZombieManager directly */
  getZombieManager(): unknown;
  /** @deprecated Use IBalanceTrackingProvider */
  getBalanceTrackingManager(): unknown;
  /** @deprecated Use IStatTrackerProvider */
  getStatTracker(): unknown;
}
