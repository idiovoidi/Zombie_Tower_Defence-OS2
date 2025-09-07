import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { GameConfig } from '../config/gameConfig';
import { TowerManager } from '../managers/TowerManager';

export class Tower extends GameObject {
  private type: string;
  private damage: number;
  private range: number;
  private fireRate: number; // shots per second
  private lastShotTime: number;
  private upgradeLevel: number;
  
  constructor(type: string, x: number, y: number) {
    super();
    this.type = type;
    this.upgradeLevel = 1;
    this.lastShotTime = 0;
    
    // Add transform component
    const transform = new TransformComponent(x, y);
    this.addComponent(transform);
    
    // Initialize tower stats
    this.initializeStats();
  }
  
  private initializeStats(): void {
    const towerManager = new TowerManager();
    const stats = towerManager.getTowerStats(this.type);
    
    if (stats) {
      this.damage = stats.damage;
      this.range = stats.range;
      this.fireRate = stats.fireRate;
    } else {
      // Default values if stats not found
      this.damage = 10;
      this.range = 100;
      this.fireRate = 1;
    }
  }
  
  public update(deltaTime: number): void {
    super.update(deltaTime);
    // Tower-specific update logic would go here
  }
  
  // Check if tower can shoot (based on fire rate)
  public canShoot(currentTime: number): boolean {
    const timeSinceLastShot = currentTime - this.lastShotTime;
    const timeBetweenShots = 1000 / this.fireRate; // Convert fire rate to milliseconds
    return timeSinceLastShot >= timeBetweenShots;
  }
  
  // Shoot at a target
  public shoot(): void {
    this.lastShotTime = performance.now();
    // Shooting logic would be implemented here
  }
  
  // Upgrade the tower
  public upgrade(): void {
    this.upgradeLevel++;
    // Recalculate stats based on upgrade level
    const towerManager = new TowerManager();
    this.damage = towerManager.calculateTowerDamage(this.type, this.upgradeLevel);
    this.range = towerManager.calculateTowerRange(this.type, this.upgradeLevel);
  }
  
  // Getters
  public getType(): string {
    return this.type;
  }
  
  public getDamage(): number {
    return this.damage;
  }
  
  public getRange(): number {
    return this.range;
  }
  
  public getFireRate(): number {
    return this.fireRate;
  }
  
  public getUpgradeLevel(): number {
    return this.upgradeLevel;
  }
}