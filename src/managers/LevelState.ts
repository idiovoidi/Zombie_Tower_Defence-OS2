/**
 * LevelState - Contextual object that encapsulates all combat-related managers
 * 
 * This groups TowerManager, ZombieManager, WaveManager, TowerPlacementManager,
 * TowerCombatManager, ProjectileManager, and EffectManager to reduce the number
 * of direct dependencies in GameManager.
 */

import { type Container } from 'pixi.js';
import type { Tower } from '../objects/Tower';
import type { EffectManager } from '../renderers/effects/EffectManager';
import { EventBus, GameEvents, type EventSubscription } from '../utils/EventBus';
import type { MapManager } from './MapManager';
import { ProjectileManager } from './ProjectileManager';
import { TowerCombatManager } from './TowerCombatManager';
import { TowerManager } from './TowerManager';
import { TowerPlacementManager } from './TowerPlacementManager';
import { WaveManager } from './WaveManager';
import { ZombieManager } from './ZombieManager';

export interface LevelStateConfig {
  container: Container;
  mapManager: MapManager;
  worldWidth?: number;
  worldHeight?: number;
  // Manager dependencies (created externally and injected)
  towerManager: TowerManager;
  waveManager: WaveManager;
  zombieManager: ZombieManager;
  projectileManager: ProjectileManager;
  towerPlacementManager: TowerPlacementManager;
  towerCombatManager: TowerCombatManager;
  effectManager?: EffectManager | null;
}

export interface CleanupOptions {
  fullCleanup?: boolean;
  waveOnly?: boolean;
}

export class LevelState {
  // Managers
  private towerManager: TowerManager;
  private zombieManager: ZombieManager;
  private waveManager: WaveManager;
  private towerPlacementManager: TowerPlacementManager;
  private towerCombatManager: TowerCombatManager;
  private projectileManager: ProjectileManager;
  private effectManager: EffectManager | null = null;

  // Event subscriptions for cleanup
  private eventSubscriptions: EventSubscription[] = [];

  constructor(config: LevelStateConfig) {
    const {
      mapManager,
      worldWidth = 1024,
      worldHeight = 768,
      towerManager,
      waveManager,
      zombieManager,
      projectileManager,
      towerPlacementManager,
      towerCombatManager,
      effectManager = null,
    } = config;

    // Use injected manager instances (not creating new ones)
    this.towerManager = towerManager;
    this.waveManager = waveManager;
    this.zombieManager = zombieManager;
    this.projectileManager = projectileManager;
    this.towerPlacementManager = towerPlacementManager;
    this.towerCombatManager = towerCombatManager;
    this.effectManager = effectManager;

    // Wire up dependencies
    this.towerCombatManager.setProjectileManager(this.projectileManager);
    if (this.effectManager) {
      this.towerCombatManager.setEffectManager(this.effectManager);
    }

    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const eventBus = EventBus.getInstance();

    // Listen for wave start events
    this.eventSubscriptions.push(
      eventBus.on(GameEvents.WAVE_START, () => {
        this.zombieManager.startWave();
      })
    );

    // Listen for cleanup events
    this.eventSubscriptions.push(
      eventBus.on(GameEvents.CLEANUP_WAVE, () => {
        this.cleanupWave();
      })
    );

    this.eventSubscriptions.push(
      eventBus.on(GameEvents.CLEANUP_GAME, () => {
        this.cleanupGame();
      })
    );
  }

  /**
   * Set the EffectManager for visual effects
   * Called after construction if effect manager was not available at initialization
   */
  public setEffectManager(effectManager: EffectManager): void {
    this.effectManager = effectManager;
    this.towerCombatManager.setEffectManager(effectManager);
  }

  /**
   * Get the EffectManager
   */
  public getEffectManager(): EffectManager | null {
    return this.effectManager;
  }

  // Manager getters - these are used by GameManager to access specific managers
  public getTowerManager(): TowerManager {
    return this.towerManager;
  }

  public getZombieManager(): ZombieManager {
    return this.zombieManager;
  }

  public getWaveManager(): WaveManager {
    return this.waveManager;
  }

  public getTowerPlacementManager(): TowerPlacementManager {
    return this.towerPlacementManager;
  }

  public getTowerCombatManager(): TowerCombatManager {
    return this.towerCombatManager;
  }

  public getProjectileManager(): ProjectileManager {
    return this.projectileManager;
  }

  /**
   * Reset all wave-related state for a new game
   */
  public reset(): void {
    this.waveManager.reset();
  }

  /**
   * Start a new wave
   */
  public startWave(): void {
    this.zombieManager.startWave();
  }

  /**
   * Start the next wave
   */
  public nextWave(): void {
    this.waveManager.nextWave();
    this.zombieManager.startWave();
  }

  /**
   * Check if the current wave is complete
   */
  public isWaveComplete(): boolean {
    return this.zombieManager.isWaveComplete();
  }

  /**
   * Update all combat-related managers
   * @param deltaTime - Time since last frame
   * @param isPlaying - Whether the game is currently playing
   */
  public update(deltaTime: number, isPlaying: boolean): void {
    // Update effect manager (always runs for visual effects)
    if (this.effectManager) {
      this.effectManager.update(deltaTime);
    }

    if (isPlaying) {
      // Update zombie manager
      this.zombieManager.update(deltaTime);

      // Sync arrays if dirty
      this.syncEntityArrays();

      // Update tower combat
      this.towerCombatManager.update(deltaTime);
    }

    // Update projectiles (runs in all states to clean up)
    this.projectileManager.update(deltaTime);
  }

  /**
   * Sync tower and zombie arrays with combat manager if dirty
   */
  private syncEntityArrays(): void {
    const towersDirty = this.towerPlacementManager.areTowersDirty();
    const zombiesDirty = this.zombieManager.areZombiesDirty();

    if (towersDirty) {
      const towers = this.towerPlacementManager.getPlacedTowers();
      this.towerCombatManager.setTowers(towers);
      this.towerPlacementManager.clearTowersDirty();
    }

    if (zombiesDirty) {
      const zombies = this.zombieManager.getZombies();
      this.towerCombatManager.setZombies(zombies);
      this.projectileManager.setZombies(zombies);
      this.zombieManager.clearZombiesDirty();
    }
  }

  /**
   * Force sync entity arrays regardless of dirty state
   */
  public forceSyncEntityArrays(): void {
    const towers = this.towerPlacementManager.getPlacedTowers();
    const zombies = this.zombieManager.getZombies();
    this.towerCombatManager.setTowers(towers);
    this.towerCombatManager.setZombies(zombies);
    this.projectileManager.setZombies(zombies);
    this.towerPlacementManager.clearTowersDirty();
    this.zombieManager.clearZombiesDirty();
  }

  /**
   * Get current wave number
   */
  public getCurrentWave(): number {
    return this.waveManager.getCurrentWave();
  }

  /**
   * Get zombie groups for current wave
   */
  public getCurrentWaveZombies() {
    return this.waveManager.getCurrentWaveZombies();
  }

  /**
   * Calculate zombie count for wave scaling
   */
  public calculateZombieCount(baseCount: number, wave: number): number {
    return this.waveManager.calculateZombieCount(baseCount, wave);
  }

  /**
   * Place a tower at the specified location
   */
  public placeTower(x: number, y: number, type: string): Tower | null {
    this.towerPlacementManager.startPlacement(type);
    return this.towerPlacementManager.placeTower(x, y);
  }

  /**
   * Get all active zombies
   */
  public getZombies() {
    return this.zombieManager.getZombies();
  }

  /**
   * Get all placed towers
   */
  public getPlacedTowers(): Tower[] {
    return this.towerPlacementManager.getPlacedTowers();
  }

  /**
   * Get blood particle system for tracking
   */
  public getBloodParticleSystem() {
    return this.zombieManager.getBloodParticleSystem();
  }

  /**
   * Get corpse manager for tracking
   */
  public getCorpseManager() {
    return this.zombieManager.getCorpseManager();
  }

  /**
   * Cleanup wave-specific resources
   */
  public cleanupWave(): void {
    this.projectileManager.clear();
    // Effects are cleaned up automatically or via ResourceCleanupManager
  }

  /**
   * Cleanup all game resources
   */
  public cleanupGame(): void {
    this.cleanupWave();
    // Additional cleanup for game-level resources
    // Towers are preserved between waves, cleaned up separately
  }

  /**
   * Get effect counts for performance monitoring
   */
  public getEffectCounts(): { casings: number; flashes: number; trails: number; impacts: number; glints: number } {
    if (this.effectManager) {
      return this.effectManager.getEffectCounts();
    }
    return { casings: 0, flashes: 0, trails: 0, impacts: 0, glints: 0 };
  }

  /**
   * Dispose of all resources and event listeners
   */
  public dispose(): void {
    // Unsubscribe from all events
    this.eventSubscriptions.forEach(sub => sub.unsubscribe());
    this.eventSubscriptions = [];

    // Cleanup game resources
    this.cleanupGame();
  }
}
