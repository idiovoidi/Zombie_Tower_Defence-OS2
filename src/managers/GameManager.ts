import { type Application, Container } from 'pixi.js';
import { DebugConstants } from '../config/debugConstants';
import { DevConfig } from '../config/devConfig';
import { GameConfig } from '../config/gameConfig';
import { type CustomMapDocument, registerCustomMap } from '../customMaps';
import type { Tower } from '../objects/Tower';
import type { Zombie } from '../objects/Zombie';
import { EffectManager } from '../renderers/effects/EffectManager';
import type { SludgePoolEffect } from '../renderers/effects/SludgePoolEffect';
import { VisualMapRenderer } from '../renderers/VisualMapRenderer';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';
import { EventBus, GameEvents } from '../utils/EventBus';
import { type GameLogEntry, LogExporter } from '../utils/LogExporter';
import { OptimizationValidator } from '../utils/OptimizationValidator';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { ResourceCleanupManager } from '../utils/ResourceCleanupManager';
import { VisualEffects } from '../utils/VisualEffects';
import { AnalyticsState } from './AnalyticsState';
import { EconomyState } from './EconomyState';
import type { InputManager } from './InputManager';
import { LevelManager } from './LevelManager';
import { LevelState } from './LevelState';
import { MapManager } from './MapManager';
import { ProjectileManager } from './ProjectileManager';
import { SludgePoolManager } from './SludgePoolManager';
import { TowerCombatManager } from './TowerCombatManager';
import { TowerManager } from './TowerManager';
import { TowerPlacementManager } from './TowerPlacementManager';
import { WaveManager } from './WaveManager';
import { ZombieManager } from './ZombieManager';

/**
 * GameManager - Main game orchestrator
 *
 * REFACTORED: Now uses contextual state objects (LevelState, EconomyState, AnalyticsState)
 * to reduce coupling and improve maintainability. Also uses EventBus for decoupled
 * communication between managers.
 */
export class GameManager {
  private app: Application;
  private currentState: string;
  private lives: number;
  private wave: number;
  private score: number;

  // Contextual state objects - encapsulate related managers
  private levelState!: LevelState;
  private economyState!: EconomyState;
  private analyticsState!: AnalyticsState;

  // Level/Map management (not combat-specific, kept separate)
  private mapManager: MapManager;
  private levelManager: LevelManager;
  private visualMapRenderer: VisualMapRenderer | null = null;
  private effectManager: EffectManager;

  // Manager references - these are also accessible via levelState but kept for direct access
  private towerManager: TowerManager;
  private towerPlacementManager: TowerPlacementManager;
  private zombieManager: ZombieManager;
  private waveManager: WaveManager;
  private projectileManager: ProjectileManager;
  private towerCombatManager: TowerCombatManager;
  private sludgePoolManager: SludgePoolManager;

  // Game container
  private gameContainer: Container;

  // Callbacks
  private onMoneyGainCallback: ((amount: number) => void) | null = null;
  private onDamageFlashCallback: (() => void) | null = null;
  private onGameOverCallback: ((score: number) => void) | null = null;

  // Wave tracking
  private waveStartLives = 0;

  constructor(app: Application) {
    this.app = app;
    this.currentState = GameConfig.GAME_STATES.MAIN_MENU;

    // Apply debug constants if enabled
    this.lives = DebugConstants.ENABLED ? DebugConstants.STARTING_LIVES : GameConfig.STARTING_LIVES;
    this.wave = DebugConstants.ENABLED ? DebugConstants.START_AT_WAVE : 1;
    this.score = 0;

    if (DebugConstants.ENABLED) {
      // Debug mode active - constants applied above
    }

    // Create game container for all game objects
    this.gameContainer = new Container();
    this.gameContainer.sortableChildren = true;
    app.stage.addChild(this.gameContainer);

    // Initialize EffectManager first (needed by other managers)
    this.effectManager = new EffectManager(this.gameContainer);

    // Initialize map and level managers
    this.mapManager = new MapManager();
    this.levelManager = new LevelManager(this.mapManager);

    // Initialize combat managers (shared between GameManager and LevelState)
    this.towerManager = TowerManager.getInstance();
    this.waveManager = new WaveManager();
    this.zombieManager = new ZombieManager(this.gameContainer, this.waveManager, this.mapManager);
    this.projectileManager = new ProjectileManager(this.gameContainer);
    this.towerPlacementManager = new TowerPlacementManager(
      this.gameContainer,
      this.towerManager,
      this.mapManager,
      this.effectManager.getContainer()
    );
    this.towerCombatManager = new TowerCombatManager(1024, 768);
    this.sludgePoolManager = new SludgePoolManager();

    // Initialize contextual state objects with injected managers
    this.initializeStateObjects();

    // Set up event listeners
    this.setupEventListeners();

    // Set up tower placement callbacks
    this.setupTowerPlacementCallbacks();
  }

  private initializeStateObjects(): void {
    // Initialize LevelState with injected manager instances (no duplicates)
    this.levelState = new LevelState({
      container: this.gameContainer,
      mapManager: this.mapManager,
      worldWidth: 1024,
      worldHeight: 768,
      towerManager: this.towerManager,
      waveManager: this.waveManager,
      zombieManager: this.zombieManager,
      projectileManager: this.projectileManager,
      towerPlacementManager: this.towerPlacementManager,
      towerCombatManager: this.towerCombatManager,
      effectManager: this.effectManager,
    });

    // EconomyState is the single money owner
    const startingMoney = DebugConstants.ENABLED
      ? DebugConstants.STARTING_MONEY
      : GameConfig.STARTING_MONEY;
    this.economyState = new EconomyState({ startingMoney });

    // Initialize AnalyticsState
    this.analyticsState = new AnalyticsState({ gameManager: this });
  }

  private setupEventListeners(): void {
    // Listen for damage events and forward to analytics
    EventBus.getInstance().on<{
      damage: number;
      towerType: string;
      killed: boolean;
      overkill: number;
    }>(GameEvents.DAMAGE_DEALT, data => {
      if (data?.killed && data.overkill > 100) {
        // Trigger small screen shake for spectacular gib explosions
        const intensity = Math.min(8, data.overkill / 50);
        VisualEffects.triggerScreenShake(this.gameContainer, intensity, 150);
      }
    });

    // Listen for sludge pool creation events
    EventBus.getInstance().on<{ pool: SludgePoolEffect }>(GameEvents.SLUDGE_POOL_CREATED, data => {
      if (data?.pool) {
        this.sludgePoolManager.addPool(data.pool);
      }
    });
  }

  private setupTowerPlacementCallbacks(): void {
    this.towerPlacementManager.setTowerPlacedCallback((tower: Tower) => {
      const cost = this.towerManager.getTowerCost(tower.getType());
      if (this.spendMoney(cost)) {
        // Emit event for tower placement - AnalyticsState listens and handles tracking
        EventBus.getInstance().emit(GameEvents.TOWER_PLACED, {
          type: tower.getType(),
          cost: cost,
        });
      } else {
        // Insufficient funds - tower placement cancelled
      }
    });
  }

  public init(): void {
    // Initialization complete - GameManager ready
  }

  public startGame(): void {
    this.currentState = GameConfig.GAME_STATES.PLAYING;
    this.zombieManager.startWave();

    // Mark arrays as dirty to ensure initial population
    if (this.towerPlacementManager.getPlacedTowers().length > 0) {
      this.towerCombatManager.setTowers(this.towerPlacementManager.getPlacedTowers());
    }
    if (this.zombieManager.getZombies().length > 0) {
      const zombies = this.zombieManager.getZombies();
      this.towerCombatManager.setZombies(zombies);
      this.effectManager.setZombies(zombies); // For fire pool damage
    }

    PerformanceMonitor.recordWaveMemory(this.wave);
  }

  public startGameWithLevel(levelId: string): void {
    this.prepareWaveOverridesForLevel(levelId);

    if (!this.levelManager.loadLevel(levelId)) {
      return;
    }

    const level = this.levelManager.getCurrentLevel();
    if (!level) {
      return;
    }

    this.clearGameState();
    EffectCleanupManager.clearAll();
    LogExporter.newSession();

    this.analyticsState.getBalanceTrackingManager().reset();
    this.analyticsState.getBalanceTrackingManager().enable();

    this.wave = DebugConstants.ENABLED ? DebugConstants.START_AT_WAVE : 1;
    this.score = 0;
    this.waveManager.reset();

    if (!DebugConstants.ENABLED) {
      this.economyState.reset(level.startingMoney);
      this.lives = level.startingLives;
    }
    this.visualMapRenderer?.renderMap(level.map);

    this.currentState = GameConfig.GAME_STATES.PLAYING;

    const aiEnabled = this.analyticsState.getAIPlayerManager().isEnabled();
    this.analyticsState.getStatTracker().startTracking(aiEnabled);

    this.spawnStarterTower();

    if (DevConfig.TESTING?.SPAWN_TEST_TOWERS) {
      this.spawnTestTowers();
    }

    this.waveStartLives = this.lives;
    // Own startWave; WAVE_START is notification-only for analytics
    this.zombieManager.startWave();
    EventBus.getInstance().emit(GameEvents.WAVE_START, { wave: this.wave });
  }

  /**
   * Debug helper: load a map layout by name and restart play.
   * Prefers the campaign/custom level that owns the map when one exists.
   */
  public startGameWithMap(mapName: string): boolean {
    const levelId = this.levelManager.findLevelIdByMap(mapName);
    if (levelId) {
      this.levelManager.unlockLevel(levelId);
      this.startGameWithLevel(levelId);
      return true;
    }

    if (!this.mapManager.loadMap(mapName)) {
      return false;
    }

    this.prepareWaveOverridesForLevel('');
    this.clearGameState();
    EffectCleanupManager.clearAll();
    LogExporter.newSession();

    this.analyticsState.getBalanceTrackingManager().reset();
    this.analyticsState.getBalanceTrackingManager().enable();

    this.wave = DebugConstants.ENABLED ? DebugConstants.START_AT_WAVE : 1;
    this.score = 0;
    this.waveManager.reset();

    this.visualMapRenderer?.renderMap(mapName);

    this.currentState = GameConfig.GAME_STATES.PLAYING;

    const aiEnabled = this.analyticsState.getAIPlayerManager().isEnabled();
    this.analyticsState.getStatTracker().startTracking(aiEnabled);

    this.spawnStarterTower();

    if (DevConfig.TESTING?.SPAWN_TEST_TOWERS) {
      this.spawnTestTowers();
    }

    this.waveStartLives = this.lives;
    // Own startWave; WAVE_START is notification-only for analytics
    this.zombieManager.startWave();
    EventBus.getInstance().emit(GameEvents.WAVE_START, { wave: this.wave });
    return true;
  }

  private prepareWaveOverridesForLevel(levelId: string): void {
    if (!levelId.startsWith('custom_')) {
      this.waveManager.clearWaveOverrides();
    }
  }

  /**
   * Register a custom map document into managers and start playing it.
   */
  public startCustomMap(doc: CustomMapDocument): void {
    const { levelId } = registerCustomMap(doc, {
      mapManager: this.mapManager,
      levelManager: this.levelManager,
      waveManager: this.waveManager,
    });
    this.startGameWithLevel(levelId);
  }

  private clearGameState(): void {
    ResourceCleanupManager.cleanupGameResources({
      zombieManager: this.zombieManager,
      towerPlacementManager: this.towerPlacementManager,
      projectileManager: this.projectileManager,
      effectManager: this.effectManager,
      towerCombatManager: this.levelState.getTowerCombatManager(),
      waveManager: this.waveManager,
    });
  }

  private cleanupWaveObjects(): void {
    ResourceCleanupManager.cleanupWaveResources({
      zombieManager: this.zombieManager,
      projectileManager: this.projectileManager,
      effectManager: this.effectManager,
    });

    // Clear sludge pools and goo effects
    this.sludgePoolManager.clear();

    // Emit cleanup event
    EventBus.getInstance().emit(GameEvents.CLEANUP_WAVE);
  }

  private spawnStarterTower(): void {
    const starterTower = { x: 280, y: 440, type: GameConfig.TOWER_TYPES.MACHINE_GUN };
    this.towerPlacementManager.startPlacement(starterTower.type);
    const tower = this.towerPlacementManager.placeTower(starterTower.x, starterTower.y);
    if (tower) {
      // Starter tower placed successfully
    } else {
      // Failed to place starter tower - position may be invalid
    }

    const _placedTowers = this.towerPlacementManager.getPlacedTowers();
  }

  private spawnTestTowers(): void {
    const testTowers = [
      { x: 300, y: 300, type: GameConfig.TOWER_TYPES.SNIPER },
      { x: 500, y: 300, type: GameConfig.TOWER_TYPES.SHOTGUN },
    ];

    testTowers.forEach((config, _index) => {
      this.towerPlacementManager.startPlacement(config.type);
      const tower = this.towerPlacementManager.placeTower(config.x, config.y);
      if (tower) {
        // Test tower placed successfully
      } else {
        // Failed to place test tower
      }
    });
  }

  public pauseGame(): void {
    if (this.currentState === GameConfig.GAME_STATES.PLAYING) {
      this.currentState = GameConfig.GAME_STATES.PAUSED;
      EventBus.getInstance().emit(GameEvents.GAME_PAUSE);
    }
  }

  public resumeGame(): void {
    if (this.currentState === GameConfig.GAME_STATES.PAUSED) {
      this.currentState = GameConfig.GAME_STATES.PLAYING;
      EventBus.getInstance().emit(GameEvents.GAME_RESUME);
    }
  }

  public gameOver(): void {
    if (this.currentState === GameConfig.GAME_STATES.GAME_OVER) {
      return;
    }

    this.currentState = GameConfig.GAME_STATES.GAME_OVER;

    const finalScore = this.wave * 1000 + this.getMoney();
    this.score = finalScore;

    // Emit game over event
    EventBus.getInstance().emit(GameEvents.GAME_OVER, { score: finalScore });

    if (this.analyticsState.isBalanceTrackingEnabled()) {
      this.analyticsState.getBalanceTrackingManager().performEndGameAnalysis();
    }

    if (!this.analyticsState.getAIPlayerManager().isEnabled()) {
      this.exportManualGameLog();
    }

    if (this.onGameOverCallback) {
      this.onGameOverCallback(this.score);
    } else {
      // No game over callback registered
    }

    setTimeout(() => {
      this.clearGameState();
    }, 100);
  }

  private async exportManualGameLog(): Promise<void> {
    const { PerformanceMonitor } = await import('../utils/PerformanceMonitor');

    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: LogExporter.getSessionId(),
      isAIRun: false,
      duration: 0,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      gameData: {
        highestWave: this.wave,
        finalMoney: this.getMoney(),
        finalLives: this.lives,
        startLives: DebugConstants.ENABLED
          ? DebugConstants.STARTING_LIVES
          : GameConfig.STARTING_LIVES,
        survivalRate: Number.parseFloat(
          (
            (this.lives /
              (DebugConstants.ENABLED
                ? DebugConstants.STARTING_LIVES
                : GameConfig.STARTING_LIVES)) *
            100
          ).toFixed(1)
        ),
        livesLost:
          (DebugConstants.ENABLED ? DebugConstants.STARTING_LIVES : GameConfig.STARTING_LIVES) -
          this.lives,
      },
      performanceStats: {
        waveMemorySnapshots: PerformanceMonitor.getWaveMemorySnapshots(),
        memoryGrowthRate: PerformanceMonitor.getMemoryGrowthRate(),
        averageFrameTime: PerformanceMonitor.getMetrics().frameTime || 0,
        peakFrameTime: PerformanceMonitor.getMetrics().frameTime || 0,
        averageFPS:
          PerformanceMonitor.getMetrics().frameTime > 0
            ? Math.round(1000 / PerformanceMonitor.getMetrics().frameTime)
            : 60,
        lowestFPS:
          PerformanceMonitor.getMetrics().frameTime > 0
            ? Math.round(1000 / PerformanceMonitor.getMetrics().frameTime)
            : 60,
      },
    } as GameLogEntry;

    let balanceData: Record<string, unknown> | undefined;
    if (this.analyticsState.isBalanceTrackingEnabled()) {
      balanceData = this.analyticsState.getBalanceTrackingManager().generateReportData() as Record<
        string,
        unknown
      >;
    }

    LogExporter.exportLog(logEntry, balanceData);
  }

  public victory(): void {
    this.currentState = GameConfig.GAME_STATES.VICTORY;

    EventBus.getInstance().emit(GameEvents.GAME_VICTORY);

    if (this.analyticsState.isBalanceTrackingEnabled()) {
      this.analyticsState.getBalanceTrackingManager().performEndGameAnalysis();
    }
    this.clearGameState();
  }

  public getCurrentState(): string {
    return this.currentState;
  }

  public addMoney(amount: number): void {
    this.economyState.addMoney(amount);
    if (this.onMoneyGainCallback) {
      this.onMoneyGainCallback(amount);
    }
  }

  public setMoneyGainCallback(callback: (amount: number) => void): void {
    this.onMoneyGainCallback = callback;
  }

  public setDamageFlashCallback(callback: () => void): void {
    this.onDamageFlashCallback = callback;
  }

  public setGameOverCallback(callback: (score: number) => void): void {
    this.onGameOverCallback = callback;
  }

  public spendMoney(amount: number): boolean {
    return this.economyState.spendMoney(amount);
  }

  public addLives(amount: number): void {
    this.lives += amount;
    EventBus.getInstance().emit(GameEvents.LIVES_CHANGED, { lives: this.lives });
  }

  public loseLife(amount = 1): void {
    if (DebugConstants.ENABLED && DebugConstants.DISABLE_GAME_OVER) {
      return;
    }

    this.lives -= amount;
    if (this.onDamageFlashCallback) {
      this.onDamageFlashCallback();
    }
    // Trigger screen shake scaling with damage
    VisualEffects.triggerScreenShake(this.gameContainer, Math.min(15, amount * 4), 250);

    // Emit life lost event
    EventBus.getInstance().emit(GameEvents.LIFE_LOST, { amount, lives: this.lives });
    EventBus.getInstance().emit(GameEvents.LIVES_CHANGED, { lives: this.lives });
    if (this.lives <= 0) {
      this.lives = 0;
      this.gameOver();
    }
  }

  public nextWave(): void {
    this.wave++;
    this.currentState = GameConfig.GAME_STATES.WAVE_COMPLETE;
  }

  public addScore(points: number): void {
    this.score += points;
  }

  public getScore(): number {
    return this.score;
  }

  public getMoney(): number {
    return this.economyState.getMoney();
  }

  public getLives(): number {
    return this.lives;
  }

  public getWave(): number {
    return this.wave;
  }

  public getCurrentWave(): number {
    return this.waveManager.getCurrentWave();
  }

  // Manager getters - delegate to contextual state objects
  public getTowerManager(): TowerManager {
    return this.towerManager;
  }

  public getWaveManager(): WaveManager {
    return this.waveManager;
  }

  public getMapManager(): MapManager {
    return this.mapManager;
  }

  public getLevelManager(): LevelManager {
    return this.levelManager;
  }

  public getAvailableLevels() {
    return this.levelManager.getAvailableLevels();
  }

  public getCurrentLevel() {
    return this.levelManager.getCurrentLevel();
  }

  public getResourceManager() {
    return this.economyState.getResourceManager();
  }

  public getUpgradeSystem() {
    return this.economyState.getUpgradeManager();
  }

  public getZombieManager(): ZombieManager {
    return this.zombieManager;
  }

  public getBloodParticleStats() {
    return this.zombieManager.getBloodParticleSystem().getStats();
  }

  public getTowerPlacementManager(): TowerPlacementManager {
    return this.towerPlacementManager;
  }

  public getMapRenderer(): VisualMapRenderer | null {
    return this.visualMapRenderer;
  }

  public setInputManager(inputManager: InputManager): void {
    if (!this.visualMapRenderer) {
      this.visualMapRenderer = new VisualMapRenderer(this.app, this.mapManager, inputManager);
    }
  }

  public getAIPlayerManager() {
    return this.analyticsState.getAIPlayerManager();
  }

  public getStatTracker() {
    return this.analyticsState.getStatTracker();
  }

  public getBalanceTrackingManager() {
    return this.analyticsState.getBalanceTrackingManager();
  }

  public getBalanceIssues() {
    return this.analyticsState.getBalanceTrackingManager().getBalanceIssues();
  }

  public getTowerCombatManager(): TowerCombatManager {
    return this.towerCombatManager;
  }

  // Interface implementations for granular state providers
  public getPlacedTowers(): Tower[] {
    return this.towerPlacementManager.getPlacedTowers();
  }

  public getZombies(): Zombie[] {
    return this.zombieManager.getZombies();
  }

  public enableBalanceTracking(): void {
    this.analyticsState.enableBalanceTracking();
  }

  public disableBalanceTracking(): void {
    this.analyticsState.disableBalanceTracking();
  }

  public isBalanceTrackingEnabled(): boolean {
    return this.analyticsState.isBalanceTrackingEnabled();
  }

  // Contextual state getters (new API)
  public getLevelState(): LevelState {
    return this.levelState;
  }

  public getEconomyState(): EconomyState {
    return this.economyState;
  }

  public getAnalyticsState(): AnalyticsState {
    return this.analyticsState;
  }

  public update(deltaTime: number): void {
    PerformanceMonitor.startFrame();
    OptimizationValidator.trackFrame();

    // Update visual map renderer
    PerformanceMonitor.startMeasure('visualMapRenderer');
    if (this.visualMapRenderer) {
      this.visualMapRenderer.updateFog(deltaTime);
    }
    PerformanceMonitor.endMeasure('visualMapRenderer');

    // Update analytics state (includes AI, stat tracker, balance tracking)
    PerformanceMonitor.startMeasure('analyticsState');
    this.analyticsState.update(deltaTime);
    PerformanceMonitor.endMeasure('analyticsState');

    // Combat tick owned by LevelState (effects, zombies, sync, towers, projectiles)
    const isPlaying = this.currentState === GameConfig.GAME_STATES.PLAYING;
    PerformanceMonitor.startMeasure('levelState');
    this.levelState.update(deltaTime, isPlaying);
    PerformanceMonitor.endMeasure('levelState');

    // Update sludge pool manager
    PerformanceMonitor.startMeasure('sludgePoolManager');
    this.sludgePoolManager.update(this.towerCombatManager);
    PerformanceMonitor.endMeasure('sludgePoolManager');

    if (isPlaying) {
      // Check wave completion
      if (this.zombieManager.isWaveComplete()) {
        this.onWaveComplete();
      }

      // Process zombie rewards and end-of-path damage
      const zombies = this.zombieManager.getZombies();
      for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];

        const healthComponent = zombie.getComponent('Health') as unknown as {
          isAlive: () => boolean;
        };
        if (healthComponent && !healthComponent.isAlive()) {
          const reward = zombie.getReward();
          this.addMoney(reward);
          this.addScore(10);

          // Emit zombie killed event - AnalyticsState listens and handles detailed tracking
          EventBus.getInstance().emit(GameEvents.ZOMBIE_KILLED, {
            reward,
            type: zombie.getType(),
          });
          continue;
        }

        if (zombie.hasReachedEnd()) {
          const damage = zombie.getDamage();
          this.loseLife(damage);
          this.zombieManager.removeZombie(i);
        }
      }
    }

    // Track entity counts
    if (isPlaying) {
      PerformanceMonitor.trackEntityCount('zombies', this.zombieManager.getZombies().length);
      PerformanceMonitor.trackEntityCount(
        'towers',
        this.towerPlacementManager.getPlacedTowers().length
      );
      PerformanceMonitor.trackEntityCount(
        'projectiles',
        this.projectileManager.getProjectiles().length
      );

      const effectCounts = this.effectManager.getEffectCounts();
      PerformanceMonitor.trackEntityCount(
        'effects',
        effectCounts.casings +
          effectCounts.flashes +
          effectCounts.trails +
          effectCounts.impacts +
          effectCounts.glints
      );

      const particleStats = this.zombieManager.getBloodParticleSystem().getStats();
      PerformanceMonitor.trackEntityCount('particles', particleStats.activeParticles);

      const corpseManager = this.zombieManager.getCorpseManager();
      PerformanceMonitor.trackEntityCount('corpses', corpseManager.getCorpseCount());

      const resourceState = ResourceCleanupManager.getState();
      PerformanceMonitor.trackEntityCount('persistentEffects', resourceState.persistentEffects);

      PerformanceMonitor.checkEntityThresholds();
      PerformanceMonitor.trackMemoryUsage();
    }

    PerformanceMonitor.endFrame();
  }

  private onWaveComplete(): void {
    this.currentState = GameConfig.GAME_STATES.WAVE_COMPLETE;
    this.cleanupWaveObjects();

    // Calculate wave stats for event
    const zombieGroups = this.waveManager.getCurrentWaveZombies();
    let totalZombiesSpawned = 0;
    for (const group of zombieGroups) {
      const adjustedCount = this.waveManager.calculateZombieCount(
        group.count,
        this.waveManager.getCurrentWave()
      );
      totalZombiesSpawned += adjustedCount;
    }
    const livesLostThisWave = this.waveStartLives - this.lives;

    const bonus = 50 + this.wave * 10;
    this.addMoney(bonus);

    // Emit wave complete event - AnalyticsState listens and handles tracking
    EventBus.getInstance().emit(GameEvents.WAVE_COMPLETE, {
      wave: this.wave,
      zombiesSpawned: totalZombiesSpawned,
      livesLost: livesLostThisWave,
    });
  }

  public startNextWave(): void {
    this.wave++;
    this.waveManager.nextWave();
    ResourceCleanupManager.cleanupWaveResources({
      projectileManager: this.projectileManager,
      effectManager: this.effectManager,
    });

    this.zombieManager.startWave();
    this.currentState = GameConfig.GAME_STATES.PLAYING;

    this.waveStartLives = this.lives;
    PerformanceMonitor.recordWaveMemory(this.wave);

    // WAVE_START is notification-only — startWave already owned above
    EventBus.getInstance().emit(GameEvents.WAVE_START, { wave: this.wave });
  }
}
