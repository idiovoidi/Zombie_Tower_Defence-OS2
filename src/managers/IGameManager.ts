/**
 * IGameManager - Interface for GameManager to break circular dependencies
 *
 * This interface exposes only the methods needed by other managers,
 * allowing them to depend on the interface rather than the concrete class.
 *
 * NOTE: We use 'unknown' return types for managers to avoid circular imports.
 * Callers should cast to the appropriate type when needed.
 */
export interface IGameManager {
  // Core game state
  getMoney(): number;
  getLives(): number;
  getWave(): number;
  getCurrentState(): string;

  // Manager accessors - return unknown to avoid circular imports
  getWaveManager(): unknown;
  getTowerPlacementManager(): unknown;
  getZombieManager(): unknown;
  getBalanceTrackingManager(): unknown;
  getStatTracker(): unknown;
}
