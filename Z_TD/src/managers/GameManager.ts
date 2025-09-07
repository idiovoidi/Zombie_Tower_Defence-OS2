import { Application } from 'pixi.js';
import { GameConfig } from '../config/gameConfig';
import { TowerManager } from './TowerManager';
import { WaveManager } from './WaveManager';
import { MapManager } from './MapManager';
import { LevelManager } from './LevelManager';
import { VisualMapRenderer } from '../renderers/VisualMapRenderer';
import { ResourceManager } from './ResourceManager';
import { UpgradeSystem } from './UpgradeSystem';

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
  private waveManager: WaveManager;
  private mapManager: MapManager;
  private levelManager: LevelManager;
  private visualMapRenderer: VisualMapRenderer;
  private resourceManager: ResourceManager;
  private upgradeSystem: UpgradeSystem;
  
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
      energy: 100
    };
    
    // Initialize managers
    this.towerManager = new TowerManager();
    this.waveManager = new WaveManager();
    this.mapManager = new MapManager();
    this.levelManager = new LevelManager(this.mapManager);
    this.visualMapRenderer = new VisualMapRenderer(app, this.mapManager);
    this.resourceManager = new ResourceManager();
    this.upgradeSystem = new UpgradeSystem(this.resourceManager);
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
  
  // Start the game
  public startGame(): void {
    this.currentState = GameConfig.GAME_STATES.PLAYING;
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
        this.visualMapRenderer.renderMap(level.map);
        
        this.currentState = GameConfig.GAME_STATES.PLAYING;
        console.log(`Game started with level: ${level.name}`);
      }
    } else {
      console.error(`Failed to load level: ${levelId}`);
    }
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
    if (this.resources.wood >= wood && 
        this.resources.metal >= metal && 
        this.resources.energy >= energy) {
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
}