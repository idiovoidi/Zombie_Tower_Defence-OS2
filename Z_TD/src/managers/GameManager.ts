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
import { Tower } from '../objects/Tower';
import { DevConfig } from '../config/devConfig';
import { DebugConstants } from '../config/debugConstants';
import { type GameLogEntry, LogExporter } from '../utils/LogExporter';
import { StatTracker } from '../utils/StatTracker';

export class GameManager {
  private app: Application;
  private currentState: string;
  private money: number;
  private lives: number;
  private wave: number;
  private score: number;
  private resources: {
    wood: number;
    metal: number;
    energy: number;
  };
  private towerManager: TowerManager;
  private towerPlacementManager: TowerPlacementManager;
  private waveManager: WaveManager;
  private zombieManager: ZombieManager;
  private mapManager: MapManager;
  private levelManager: LevelManager;
  private visualMapRenderer: VisualMapRenderer;
  private resourceManager: ResourceManager;
  private upgradeSystem: UpgradeSystem;
  private towerCombatManager: TowerCombatManager;
  private projectileManager: ProjectileManager;
  private aiPlayerManager: AIPlayerManager;
  private balanceTrackingManager: BalanceTrackingManager;
  private statTracker: StatTracker;
  private gameContainer: Container;
  private onMoneyGainCallback: ((amount: number) => void) | null = null;
  private waveStartLives: number = 0;

  constructor(app: Application) {
    this.app = app;
    this.currentState = GameConfig.GAME_STATES.MAIN_MENU;

    // Apply debug constants if enabled
    this.money = DebugConstants.ENABLED ? DebugConstants.STARTING_MONEY : GameConfig.STARTING_MONEY;
    this.lives = DebugConstants.ENABLED ? DebugConstants.STARTING_LIVES : GameConfig.STARTING_LIVES;
    this.wave = DebugConstants.ENABLED ? DebugConstants.START_AT_WAVE : 1;
    this.score = 0;
    this.resources = {
      wood: DebugConstants.ENABLED ? DebugConstants.STARTING_WOOD : 0,
      metal: DebugConstants.ENABLED ? DebugConstants.STARTING_METAL : 0,
      energy: DebugConstants.ENABLED ? DebugConstants.STARTING_ENERGY : 100,
    };

    if (DebugConstants.ENABLED) {
      console.log('🔧 Debug Mode Enabled');
      console.log(`💰 Starting Money: ${this.money}`);
      console.log(`❤️ Starting Lives: ${this.lives}`);
      console.log(`🌊 Starting Wave: ${this.wave}`);
    }

    // Create game container for all game objects
    this.gameContainer = new Container();
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
    this.visualMapRenderer = new VisualMapRenderer(app, this.mapManager);
    this.resourceManager = new ResourceManager();
    this.upgradeSystem = new UpgradeSystem(this.resourceManager);
    this.projectileManager = new ProjectileManager(this.gameContainer);
    this.towerCombatManager = new TowerCombatManager();
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

    // Set up resource generation
    this.setupResourceGeneration();
  }

  // Set up passive resource generation
  private setupResourceGeneration(): void {
    // In a real implementation, this would set up a timer or system
    // that periodically generates resources
    console.log('Setting up resource generation...');
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
    console.log('Game started');
  }

  // Start the game with a specific level
  public startGameWithLevel(levelId: string): void {
    if (this.levelManager.loadLevel(levelId)) {
      const level = this.levelManager.getCurrentLevel();
      if (level) {
        // Generate new session ID for this game
        LogExporter.newSession();

        // Reset and enable balance tracking for new game
        this.balanceTrackingManager.reset();
        this.balanceTrackingManager.enable();

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
        this.visualMapRenderer.renderMap(level.map);
        console.log('Map rendered');

        this.currentState = GameConfig.GAME_STATES.PLAYING;

        // Start stat tracking
        const aiEnabled = this.aiPlayerManager.isEnabled();
        this.statTracker.startTracking(aiEnabled);

        // Spawn starter tower to showcase mechanics
        this.spawnStarterTower();

        // Spawn test towers for debugging (if enabled)
        if ((DevConfig as any).TESTING?.SPAWN_TEST_TOWERS) {
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

  public spendMoney(amount: number): boolean {
    if (this.money >= amount) {
      this.money -= amount;
      return true;
    }
    return false;
  }

  // Resource management
  public addResources(wood: number, metal: number, energy: number): void {
    this.resources.wood += wood;
    this.resources.metal += metal;
    this.resources.energy += energy;

    // Clamp energy between 0 and 100
    this.resources.energy = Math.max(0, Math.min(100, this.resources.energy));
  }

  public spendResources(wood: number, metal: number, energy: number): boolean {
    if (
      this.resources.wood >= wood &&
      this.resources.metal >= metal &&
      this.resources.energy >= energy
    ) {
      this.resources.wood -= wood;
      this.resources.metal -= metal;
      this.resources.energy -= energy;
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
    if (this.lives <= 0) {
      this.lives = 0;
      this.gameOver();
    }
  }

  // Get resource amounts
  public getResources(): { wood: number; metal: number; energy: number } {
    return { ...this.resources };
  }

  public loseLife(amount: number = 1): void {
    this.lives -= amount;
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

  public getMapRenderer(): VisualMapRenderer {
    return this.visualMapRenderer;
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
    // Update AI player (needs to run in all states to detect wave complete)
    this.aiPlayerManager.update(deltaTime);

    // Update stat tracker
    this.statTracker.update(deltaTime);

    // Update balance tracking manager
    this.balanceTrackingManager.update(deltaTime);

    if (this.currentState === GameConfig.GAME_STATES.PLAYING) {
      // Update zombie manager
      this.zombieManager.update(deltaTime);

      // Update tower combat
      const towers = this.towerPlacementManager.getPlacedTowers();
      const zombies = this.zombieManager.getZombies();
      this.towerCombatManager.setTowers(towers);
      this.towerCombatManager.setZombies(zombies);
      this.towerCombatManager.update(deltaTime);

      // Check if wave is complete
      if (this.zombieManager.isWaveComplete()) {
        this.onWaveComplete();
      }

      // Check for dead zombies and zombies that reached the end
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
