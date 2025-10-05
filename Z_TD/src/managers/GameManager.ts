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
import { Tower } from '../objects/Tower';
import { DevConfig } from '../config/devConfig';

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
  private gameContainer: Container;

  constructor(app: Application) {
    this.app = app;
    this.currentState = GameConfig.GAME_STATES.MAIN_MENU;
    this.money = GameConfig.STARTING_MONEY;
    this.lives = GameConfig.STARTING_LIVES;
    this.wave = 1;
    this.score = 0;
    this.resources = {
      wood: 0,
      metal: 0,
      energy: 100,
    };

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
      this.spendMoney(cost);
      console.log(`Tower placed: ${tower.getType()} for $${cost}`);
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
        // Set level-specific game parameters
        this.money = level.startingMoney;
        this.lives = level.startingLives;
        // Apply resource modifiers
        // ... other level-specific initialization ...

        // Render the map for this level
        console.log(`Rendering map: ${level.map}`);
        this.visualMapRenderer.renderMap(level.map);
        console.log('Map rendered');

        this.currentState = GameConfig.GAME_STATES.PLAYING;
        
        // Spawn test towers for debugging (if enabled)
        if ((DevConfig as any).TESTING?.SPAWN_TEST_TOWERS) {
          this.spawnTestTowers();
        }
        
        // Start spawning zombies
        this.zombieManager.startWave();
        
        console.log(`Game started with level: ${level.name}`);
      }
    } else {
      console.error(`Failed to load level: ${levelId}`);
    }
  }

  // Spawn test towers for debugging
  private spawnTestTowers(): void {
    console.log('Spawning test towers...');
    const testTowers = [
      { x: 300, y: 300, type: GameConfig.TOWER_TYPES.MACHINE_GUN },
      { x: 500, y: 300, type: GameConfig.TOWER_TYPES.SNIPER },
      { x: 700, y: 300, type: GameConfig.TOWER_TYPES.SHOTGUN },
    ];

    testTowers.forEach((config, index) => {
      console.log(`Attempting to place test tower ${index + 1}: ${config.type} at (${config.x}, ${config.y})`);
      // Start placement mode with the tower type
      this.towerPlacementManager.startPlacement(config.type);
      // Place the tower
      const tower = this.towerPlacementManager.placeTower(config.x, config.y);
      if (tower) {
        console.log(`✓ Test tower ${index + 1} (${config.type}) placed successfully`);
      } else {
        console.warn(`✗ Failed to place test tower ${index + 1} (${config.type})`);
      }
    });
    
    const placedTowers = this.towerPlacementManager.getPlacedTowers();
    console.log(`Total towers placed: ${placedTowers.length}`);
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
  }

  // Victory
  public victory(): void {
    this.currentState = GameConfig.GAME_STATES.VICTORY;
    console.log('Victory!');
  }

  // Get current state
  public getCurrentState(): string {
    return this.currentState;
  }

  // Manage resources
  public addMoney(amount: number): void {
    this.money += amount;
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

  // Get resource amounts
  public getResources(): { wood: number; metal: number; energy: number } {
    return { ...this.resources };
  }

  public loseLife(): void {
    this.lives--;
    if (this.lives <= 0) {
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

  // Update game state
  public update(deltaTime: number): void {
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

      // Check for zombies that reached the end
      for (const zombie of zombies) {
        if (zombie.hasReachedEnd()) {
          this.loseLife();
          // Remove zombie after it reaches the end
          const index = zombies.indexOf(zombie);
          if (index > -1) {
            (this.zombieManager as any).removeZombie(index);
          }
        }
      }
    }
  }

  // Handle wave completion
  private onWaveComplete(): void {
    console.log(`Wave ${this.wave} complete!`);
    this.currentState = GameConfig.GAME_STATES.WAVE_COMPLETE;
    
    // Award bonus money for completing wave
    this.addMoney(50 + this.wave * 10);
  }

  // Start next wave
  public startNextWave(): void {
    this.wave++;
    this.waveManager.nextWave();
    this.zombieManager.startWave();
    this.currentState = GameConfig.GAME_STATES.PLAYING;
    console.log(`Starting wave ${this.wave}`);
  }
}
