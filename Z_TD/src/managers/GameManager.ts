import { Application, Container } from 'pixi.js';
import { GameConfig } from '../config/gameConfig';
import { TowerManager } from './TowerManager';
import { TowerPlacementManager } from './TowerPlacementManager';
import { WaveManager } from './WaveManager';
import { ZombieManager } from './ZombieManager';
import { MapManager } from './MapManager';
import { LevelManager } from './LevelManager';
import { VisualMapRenderer } from '../renderers/VisualMapRenderer';
import { ResourceManager } from './ResourceManager';
import { UpgradeSystem } from './UpgradeSystem';
import { TowerCombatManager } from './TowerCombatManager';
import { ProjectileManager } from './ProjectileManager';
import { AIPlayerManager } from './AIPlayerManager';
import { BalanceTrackingManager } from './BalanceTrackingManager';
import { InputManager } from './InputManager';
import { Tower } from '../objects/Tower';
import { DevConfig } from '../config/devConfig';
import { DebugConstants } from '../config/debugConstants';
import { type GameLogEntry, LogExporter } from '../utils/LogExporter';
import { StatTracker } from '../utils/StatTracker';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';
import { EffectManager } from '../effects/EffectManager';

export class GameManager {
  private app: Application;
  private currentState: string;
  private money: number;
  private lives: number;
  private wave: number;
  private score: number;
  private towerManager: TowerManager;
  private towerPlacementManager: TowerPlacementManager;
  private waveManager: WaveManager;
  private zombieManager: ZombieManager;
  private mapManager: MapManager;
  private levelManager: LevelManager;
  private visualMapRenderer: VisualMapRenderer | null = null;
  private resourceManager: ResourceManager;
  private upgradeSystem: UpgradeSystem;
  private towerCombatManager: TowerCombatManager;
  private projectileManager: ProjectileManager;
  private effectManager: EffectManager; // CRITICAL: Manages shell casings, muzzle flashes, etc.
  private aiPlayerManager: AIPlayerManager;
  private balanceTrackingManager: BalanceTrackingManager;
  private statTracker: StatTracker;
  private gameContainer: Container;
  private inputManager: InputManager | null = null;
  private onMoneyGainCallback: ((amount: number) => void) | null = null;
  private onDamageFlashCallback: (() => void) | null = null;
  private waveStartLives: number = 0;

  constructor(app: Application) {
    this.app = app;
    this.currentState = GameConfig.GAME_STATES.MAIN_MENU;

    // Apply debug constants if enabled
    this.money = DebugConstants.ENABLED ? DebugConstants.STARTING_MONEY : GameConfig.STARTING_MONEY;
    this.lives = DebugConstants.ENABLED ? DebugConstants.STARTING_LIVES : GameConfig.STARTING_LIVES;
    this.wave = DebugConstants.ENABLED ? DebugConstants.START_AT_WAVE : 1;
    this.score = 0;

    if (DebugConstants.ENABLED) {
      console.log('🔧 Debug Mode Enabled');
      console.log(`💰 Starting Money: ${this.money}`);
      console.log(`❤️ Starting Lives: ${this.lives}`);
      console.log(`🌊 Starting Wave: ${this.wave}`);
    }

    // Create game container for all game objects
    this.gameContainer = new Container();
    this.gameContainer.sortableChildren = true; // Enable z-index sorting
    app.stage.addChild(this.gameContainer);
    console.log('Game container created and added to stage');

    // Initialize managers
    this.towerManager = new TowerManager();
    this.waveManager = new WaveManager();
    this.mapManager = new MapManager();
    this.zombieManager = new ZombieManager(this.gameContainer, this.waveManager, this.mapManager);
    this.towerPlacementManager = new TowerPlacementManager(
      this.gameContainer,
      this.towerManager,
      this.mapManager
    );
    this.levelManager = new LevelManager(this.mapManager);
    // VisualMapRenderer will be initialized after InputManager is set
    this.resourceManager = new ResourceManager();
    this.upgradeSystem = new UpgradeSystem(this.resourceManager);
    this.projectileManager = new ProjectileManager(this.gameContainer);
    // CRITICAL: Initialize EffectManager for shell casings, muzzle flashes, etc.
    this.effectManager = new EffectManager(this.gameContainer);
    console.log('EffectManager initialized');
    // Initialize TowerCombatManager with world dimensions for spatial partitioning
    const worldWidth = 1024; // Play area width (excluding UI)
    const worldHeight = 768; // Full height
    this.towerCombatManager = new TowerCombatManager(worldWidth, worldHeight);
    this.towerCombatManager.setProjectileManager(this.projectileManager);
    this.statTracker = new StatTracker(this);
    this.aiPlayerManager = new AIPlayerManager(this);
    this.balanceTrackingManager = new BalanceTrackingManager(this);

    // Set up combat damage tracking
    this.towerCombatManager.setOnDamageCallback((damage, towerType, killed, overkill) => {
      this.statTracker.trackDamage(damage, towerType, killed, overkill);

      // Track damage for balance analysis if enabled
      if (this.balanceTrackingManager.isEnabled()) {
        this.balanceTrackingManager.trackDamage(towerType, damage, killed, overkill);
      }
    });

    // Set up tower placement callbacks
    this.setupTowerPlacementCallbacks();
  }

  // Initialize the game
  public init(): void {
    console.log('Initializing game...');
    // Initialize game systems here
  }

  // Set up tower placement callbacks
  private setupTowerPlacementCallbacks(): void {
    this.towerPlacementManager.setTowerPlacedCallback((tower: Tower) => {
      const cost = this.towerManager.getTowerCost(tower.getType());
      if (this.spendMoney(cost)) {
        console.log(`Tower placed: ${tower.getType()} for $${cost}`);

        // Track tower placement for balance analysis
        if (this.balanceTrackingManager.isEnabled()) {
          this.balanceTrackingManager.trackTowerPlaced(tower.getType(), cost);
        }
      } else {
        console.warn(`Failed to deduct money for tower: ${tower.getType()}`);
      }
    });
  }

  // Start the game
  public startGame(): void {
    this.currentState = GameConfig.GAME_STATES.PLAYING;
    this.zombieManager.startWave();

    // Mark arrays as dirty to ensure initial population
    if (this.towerPlacementManager.getPlacedTowers().length > 0) {
      this.towerCombatManager.setTowers(this.towerPlacementManager.getPlacedTowers());
    }
    if (this.zombieManager.getZombies().length > 0) {
      this.towerCombatManager.setZombies(this.zombieManager.getZombies());
    }

    console.log('Game started');
  }

  // Start the game with a specific level
  public startGameWithLevel(levelId: string): void {
    if (this.levelManager.loadLevel(levelId)) {
      const level = this.levelManager.getCurrentLevel();
      if (level) {
        // CRITICAL: Clear all game objects from previous game to prevent memory leaks
        console.log('🧹 Cleaning up previous game state...');
        this.clearGameState();

        // Clear any orphaned effect intervals from previous game
        EffectCleanupManager.clearAll();

        // Generate new session ID for this game
        LogExporter.newSession();

        // Reset and enable balance tracking for new game
        this.balanceTrackingManager.reset();
        this.balanceTrackingManager.enable();

        // Reset wave counter
        this.wave = DebugConstants.ENABLED ? DebugConstants.START_AT_WAVE : 1;
        this.waveManager.reset();

        // Set level-specific game parameters (unless debug mode overrides)
        if (DebugConstants.ENABLED) {
          // Keep debug values
          console.log('🔧 Using debug starting values instead of level defaults');
        } else {
          // Use level defaults
          this.money = level.startingMoney;
          this.lives = level.startingLives;
        }
        // Apply resource modifiers
        // ... other level-specific initialization ...

        // Render the map for this level
        console.log(`Rendering map: ${level.map}`);
        if (this.visualMapRenderer) {
          this.visualMapRenderer.renderMap(level.map);
          console.log('Map rendered');
        } else {
          console.error('VisualMapRenderer not initialized');
        }

        this.currentState = GameConfig.GAME_STATES.PLAYING;

        // Start stat tracking
        const aiEnabled = this.aiPlayerManager.isEnabled();
        this.statTracker.startTracking(aiEnabled);

        // Spawn starter tower to showcase mechanics
        this.spawnStarterTower();

        // Spawn test towers for debugging (if enabled)
        if ((DevConfig as unknown).TESTING?.SPAWN_TEST_TOWERS) {
          this.spawnTestTowers();
        }

        // Track lives at wave start for balance analysis
        this.waveStartLives = this.lives;

        // Start spawning zombies
        this.zombieManager.startWave();

        // Track first wave start
        this.statTracker.trackWaveStart();

        // Track first wave start for balance analysis
        if (this.balanceTrackingManager.isEnabled()) {
          this.balanceTrackingManager.trackWaveStart();
        }

        console.log(`Game started with level: ${level.name}`);
      }
    } else {
      console.error(`Failed to load level: ${levelId}`);
    }
  }

  /**
   * Clear all game state to prevent memory leaks when starting a new game
   * CRITICAL: This must be called before starting a new game or restarting
   */
  private clearGameState(): void {
    // Clear all zombies (destroys zombie objects, blood particles, corpses)
    this.zombieManager.clear();
    console.log('  ✓ Zombies cleared');

    // Clear all towers (destroys tower objects and their effects)
    this.towerPlacementManager.clear();
    console.log('  ✓ Towers cleared');

    // Clear all projectiles (destroys projectile objects and their effects)
    this.projectileManager.clear();
    console.log('  ✓ Projectiles cleared');

    // CRITICAL: Clear all visual effects (shell casings, muzzle flashes, bullet trails, etc.)
    this.effectManager.clear();
    console.log('  ✓ Visual effects cleared');

    // Clear tower combat manager state
    this.towerCombatManager.setTowers([]);
    this.towerCombatManager.setZombies([]);
    console.log('  ✓ Combat manager cleared');

    console.log('🧹 Game state cleanup complete');
  }

  /**
   * Clean up wave-specific objects between waves to prevent memory accumulation
   * CRITICAL: This must be called after each wave completes
   */
  private cleanupWaveObjects(): void {
    // Clear all remaining projectiles (explosions, fire pools, sludge pools, etc.)
    this.projectileManager.clear();
    console.log('  ✓ Projectiles cleared');

    // CRITICAL: Clear all visual effects (shell casings, muzzle flashes, bullet trails, etc.)
    this.effectManager.clear();
    console.log('  ✓ Visual effects cleared (casings, flashes, trails)');

    // Clear all effect intervals/timeouts (laser particles, etc.)
    EffectCleanupManager.clearAll();
    console.log('  ✓ Effect timers cleared');

    // Clear blood particles from zombie manager
    const bloodSystem = this.zombieManager.getBloodParticleSystem();
    bloodSystem.clear();
    console.log('  ✓ Blood particles cleared');

    // Note: Corpses will fade naturally over time (managed by CorpseManager)
    // This keeps some visual persistence while preventing memory buildup
    console.log('  ✓ Old corpses will fade naturally');

    console.log('🧹 Wave cleanup complete');
  }

  // Spawn starter tower for new players
  private spawnStarterTower(): void {
    console.log('Spawning starter gunner near graveyard entrance...');
    // Place one machine gun tower near the entrance to showcase mechanics
    const starterTower = { x: 280, y: 440, type: GameConfig.TOWER_TYPES.MACHINE_GUN };

    console.log(`Placing starter gunner at (${starterTower.x}, ${starterTower.y})`);
    // Start placement mode with the tower type
    this.towerPlacementManager.startPlacement(starterTower.type);
    // Place the tower
    const tower = this.towerPlacementManager.placeTower(starterTower.x, starterTower.y);
    if (tower) {
      console.log(`✓ Starter gunner placed successfully`);
    } else {
      console.warn(`✗ Failed to place starter gunner`);
    }

    const placedTowers = this.towerPlacementManager.getPlacedTowers();
    console.log(`Total towers placed: ${placedTowers.length}`);
  }

  // Spawn test towers for debugging
  private spawnTestTowers(): void {
    console.log('Spawning test towers...');
    const testTowers = [
      { x: 300, y: 300, type: GameConfig.TOWER_TYPES.SNIPER },
      { x: 500, y: 300, type: GameConfig.TOWER_TYPES.SHOTGUN },
    ];

    testTowers.forEach((config, index) => {
      console.log(
        `Attempting to place test tower ${index + 1}: ${config.type} at (${config.x}, ${config.y})`
      );
      this.towerPlacementManager.startPlacement(config.type);
      const tower = this.towerPlacementManager.placeTower(config.x, config.y);
      if (tower) {
        console.log(`✓ Test tower ${index + 1} (${config.type}) placed successfully`);
      } else {
        console.warn(`✗ Failed to place test tower ${index + 1} (${config.type})`);
      }
    });
  }

  // Pause the game
  public pauseGame(): void {
    if (this.currentState === GameConfig.GAME_STATES.PLAYING) {
      this.currentState = GameConfig.GAME_STATES.PAUSED;
      console.log('Game paused');
    }
  }

  // Resume the game
  public resumeGame(): void {
    if (this.currentState === GameConfig.GAME_STATES.PAUSED) {
      this.currentState = GameConfig.GAME_STATES.PLAYING;
      console.log('Game resumed');
    }
  }

  // Game over
  public gameOver(): void {
    this.currentState = GameConfig.GAME_STATES.GAME_OVER;
    console.log('Game over');

    // Perform end-game balance analysis
    if (this.balanceTrackingManager.isEnabled()) {
      this.balanceTrackingManager.performEndGameAnalysis();
    }

    // Export log if not AI run (AI exports its own logs)
    if (!this.aiPlayerManager.isEnabled()) {
      this.exportManualGameLog();
    }

    // Clear game state to free memory (player can restart from menu)
    console.log('🧹 Cleaning up game state after game over...');
    this.clearGameState();
  }

  // Export game log for manual play
  private exportManualGameLog(): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: LogExporter.getSessionId(),
      isAIRun: false,
      duration: 0, // Could track this if needed
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      gameData: {
        highestWave: this.wave,
        finalMoney: this.money,
        finalLives: this.lives,
        startLives: DebugConstants.ENABLED
          ? DebugConstants.STARTING_LIVES
          : GameConfig.STARTING_LIVES,
        survivalRate: parseFloat(
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
    } as GameLogEntry;

    // Get balance data from BalanceTrackingManager if enabled
    let balanceData: Record<string, unknown> | undefined;
    if (this.balanceTrackingManager.isEnabled()) {
      balanceData = this.balanceTrackingManager.generateReportData() as Record<string, unknown>;
      console.log('📊 Including balance analysis in report');
    }

    LogExporter.exportLog(logEntry, balanceData);
    console.log('📊 Manual game log exported');
  }

  // Victory
  public victory(): void {
    this.currentState = GameConfig.GAME_STATES.VICTORY;
    console.log('Victory!');

    // Perform end-game balance analysis
    if (this.balanceTrackingManager.isEnabled()) {
      this.balanceTrackingManager.performEndGameAnalysis();
    }

    // Clear game state to free memory (player can restart from menu)
    console.log('🧹 Cleaning up game state after victory...');
    this.clearGameState();
  }

  // Get current state
  public getCurrentState(): string {
    return this.currentState;
  }

  // Manage resources
  public addMoney(amount: number): void {
    this.money += amount;

    // Trigger money gain animation if callback is set
    if (this.onMoneyGainCallback) {
      this.onMoneyGainCallback(amount);
    }
  }

  // Set callback for money gain animations
  public setMoneyGainCallback(callback: (amount: number) => void): void {
    this.onMoneyGainCallback = callback;
  }

  // Set callback for damage flash effect
  public setDamageFlashCallback(callback: () => void): void {
    this.onDamageFlashCallback = callback;
  }

  public spendMoney(amount: number): boolean {
    if (this.money >= amount) {
      this.money -= amount;
      return true;
    }
    return false;
  }

  // Lives management
  public addLives(amount: number): void {
    this.lives += amount;
  }

  public removeLives(amount: number): void {
    this.lives -= amount;

    // Trigger damage flash effect
    if (this.onDamageFlashCallback) {
      this.onDamageFlashCallback();
    }

    if (this.lives <= 0) {
      this.lives = 0;
      this.gameOver();
    }
  }

  public loseLife(amount: number = 1): void {
    this.lives -= amount;

    // Trigger damage flash effect
    if (this.onDamageFlashCallback) {
      this.onDamageFlashCallback();
    }

    if (this.lives <= 0) {
      this.lives = 0;
      this.gameOver();
    }
  }

  // Wave management
  public nextWave(): void {
    this.wave++;
    this.currentState = GameConfig.GAME_STATES.WAVE_COMPLETE;
  }

  // Scoring system
  public addScore(points: number): void {
    this.score += points;
  }

  public getScore(): number {
    return this.score;
  }

  // Getters
  public getMoney(): number {
    return this.money;
  }

  public getLives(): number {
    return this.lives;
  }

  public getWave(): number {
    return this.wave;
  }

  public getState(): string {
    return this.currentState;
  }

  // Get managers
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

  // Get resource and upgrade systems
  public getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  public getUpgradeSystem(): UpgradeSystem {
    return this.upgradeSystem;
  }

  public getZombieManager(): ZombieManager {
    return this.zombieManager;
  }

  public getTowerPlacementManager(): TowerPlacementManager {
    return this.towerPlacementManager;
  }

  public getMapRenderer(): VisualMapRenderer | null {
    return this.visualMapRenderer;
  }

  public setInputManager(inputManager: InputManager): void {
    this.inputManager = inputManager;
    // Initialize VisualMapRenderer now that we have InputManager
    if (!this.visualMapRenderer) {
      this.visualMapRenderer = new VisualMapRenderer(this.app, this.mapManager, inputManager);
    }
  }

  public getAIPlayerManager(): AIPlayerManager {
    return this.aiPlayerManager;
  }

  public getStatTracker(): StatTracker {
    return this.statTracker;
  }

  public getBalanceTrackingManager(): BalanceTrackingManager {
    return this.balanceTrackingManager;
  }

  public getTowerCombatManager(): TowerCombatManager {
    return this.towerCombatManager;
  }

  // Enable/disable balance tracking
  public enableBalanceTracking(): void {
    this.balanceTrackingManager.enable();
  }

  public disableBalanceTracking(): void {
    this.balanceTrackingManager.disable();
  }

  public isBalanceTrackingEnabled(): boolean {
    return this.balanceTrackingManager.isEnabled();
  }

  // Update game state
  public update(deltaTime: number): void {
    // Update animated fog effects
    if (this.visualMapRenderer) {
      this.visualMapRenderer.updateFog(deltaTime);
    }

    // Update AI player (needs to run in all states to detect wave complete)
    this.aiPlayerManager.update(deltaTime);

    // Update stat tracker
    this.statTracker.update(deltaTime);

    // Update balance tracking manager
    this.balanceTrackingManager.update(deltaTime);

    // CRITICAL: Update effect manager (shell casings, muzzle flashes, etc.)
    this.effectManager.update(deltaTime);

    if (this.currentState === GameConfig.GAME_STATES.PLAYING) {
      // Update zombie manager
      this.zombieManager.update(deltaTime);

      // Update tower combat - only update arrays when they change (dirty flag optimization)
      if (this.towerPlacementManager.areTowersDirty()) {
        const towers = this.towerPlacementManager.getPlacedTowers();
        this.towerCombatManager.setTowers(towers);
        this.towerPlacementManager.clearTowersDirty();
      }

      if (this.zombieManager.areZombiesDirty()) {
        const zombies = this.zombieManager.getZombies();
        this.towerCombatManager.setZombies(zombies);
        this.zombieManager.clearZombiesDirty();
      }

      this.towerCombatManager.update(deltaTime);

      // Check if wave is complete
      if (this.zombieManager.isWaveComplete()) {
        this.onWaveComplete();
      }

      // Check for dead zombies and zombies that reached the end
      // Cache reference to avoid repeated getter calls
      const zombies = this.zombieManager.getZombies();
      for (let i = zombies.length - 1; i >= 0; i--) {
        const zombie = zombies[i];

        // Check if zombie is dead
        const healthComponent = zombie.getComponent('Health') as unknown as {
          isAlive: () => boolean;
        };
        if (healthComponent && !healthComponent.isAlive()) {
          // Award money for killing zombie
          const reward = zombie.getReward();
          this.addMoney(reward);

          // Track money earned from zombie kill
          if (this.balanceTrackingManager.isEnabled()) {
            this.balanceTrackingManager.trackEconomy('EARN', reward);
          }

          console.log(`💰 Zombie killed! +$${reward}`);
          continue; // ZombieManager will remove it
        }

        // Check if zombie reached the end
        if (zombie.hasReachedEnd()) {
          // Lose lives based on zombie damage
          const damage = zombie.getDamage();
          this.loseLife(damage);
          console.log(`💀 ${zombie.getType()} zombie reached camp! -${damage} survivors`);

          // Remove zombie after it reaches the end
          this.zombieManager.removeZombie(i);
        }
      }
    }
  }

  // Handle wave completion
  private onWaveComplete(): void {
    console.log(`Wave ${this.wave} complete!`);
    this.currentState = GameConfig.GAME_STATES.WAVE_COMPLETE;

    // CRITICAL: Clean up wave-specific objects to prevent memory leaks
    console.log('🧹 Cleaning up wave objects...');
    this.cleanupWaveObjects();

    // Track wave completion
    this.statTracker.trackWaveComplete();

    // Track wave completion for balance analysis
    if (this.balanceTrackingManager.isEnabled()) {
      // Calculate zombies killed (all zombies from the wave)
      const zombieGroups = this.waveManager.getCurrentWaveZombies();
      let totalZombiesSpawned = 0;
      for (const group of zombieGroups) {
        const adjustedCount = this.waveManager.calculateZombieCount(
          group.count,
          this.waveManager.getCurrentWave()
        );
        totalZombiesSpawned += adjustedCount;
      }

      // Calculate lives lost this wave
      const livesLostThisWave = this.waveStartLives - this.lives;

      this.balanceTrackingManager.trackWaveComplete(totalZombiesSpawned, livesLostThisWave);
    }

    // Award bonus money for completing wave
    const bonus = 50 + this.wave * 10;
    this.addMoney(bonus);
    this.statTracker.trackMoneyEarned(bonus);

    // Track wave completion bonus for balance analysis
    if (this.balanceTrackingManager.isEnabled()) {
      this.balanceTrackingManager.trackEconomy('EARN', bonus);
    }
  }

  // Start next wave
  public startNextWave(): void {
    this.wave++;
    this.waveManager.nextWave();

    // CRITICAL: Ensure cleanup happened before starting new wave
    // This is a safety check in case cleanup wasn't called in onWaveComplete
    console.log('🧹 Pre-wave cleanup check...');
    this.projectileManager.clear();
    this.effectManager.clear();
    EffectCleanupManager.clearAll();
    console.log('  ✓ Pre-wave cleanup complete');

    this.zombieManager.startWave();
    this.currentState = GameConfig.GAME_STATES.PLAYING;

    // Track lives at wave start for balance analysis
    this.waveStartLives = this.lives;

    // Track wave start
    this.statTracker.trackWaveStart();

    // Track wave start for balance analysis
    if (this.balanceTrackingManager.isEnabled()) {
      this.balanceTrackingManager.trackWaveStart();
    }

    console.log(`Starting wave ${this.wave}`);
  }
}
