import type { Tower } from '../objects/Tower';
import type { Zombie } from '../objects/Zombie';
import type { StatTracker } from '../utils/StatTracker';

/**
 * Core game state interface — money, lives, wave, and game status.
 */
export interface IGameStateProvider {
  getMoney(): number;
  getLives(): number;
  getWave(): number;
  getCurrentState(): string;
}

/**
 * Wave management interface for analytics and tracking systems.
 */
export interface IWaveStateProvider {
  getCurrentWave(): number;
}

/**
 * Tower state interface for systems tracking tower count and composition.
 */
export interface ITowerStateProvider {
  getPlacedTowers(): Tower[];
}

/**
 * Zombie state interface for analytics systems tracking combat statistics.
 */
export interface IZombieStateProvider {
  getZombies(): Zombie[];
}

/**
 * Minimal balance-tracking surface used by StatTracker without importing BalanceTrackingManager.
 */
export interface BalanceTrackingReporter {
  isEnabled(): boolean;
  generateReportData(): unknown;
}

/**
 * Balance tracking access interface for analytics systems.
 */
export interface IBalanceTrackingProvider {
  getBalanceTrackingManager(): BalanceTrackingReporter;
}

/**
 * Stat tracker access interface for analytics and AI systems.
 */
export interface IStatTrackerProvider {
  getStatTracker(): StatTracker;
}

/**
 * AI action interface — placing towers and starting waves.
 */
export interface IAIActionProvider {
  getTowerPlacementManager(): {
    startPlacement(type: string): void;
    placeTower(x: number, y: number): unknown;
    cancelPlacement(): void;
    isInPlacementMode(): boolean;
  };
  startNextWave(): void;
}
