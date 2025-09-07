import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { GameConfig } from '../config/gameConfig';
import { TowerManager } from '../managers/TowerManager';
import { Graphics, Container } from 'pixi.js';
import { TowerRangeVisualizer } from '../utils/TowerRangeVisualizer';

export class Tower extends GameObject {
  private type: string;
  private damage: number = 0;
  private range: number = 0;
  private fireRate: number = 0; // shots per second
  private lastShotTime: number = 0;
  private upgradeLevel: number = 1;
  private visual: Graphics;
  private rangeVisualizer: TowerRangeVisualizer;
  
  constructor(type: string, x: number, y: number) {
    super();
    this.type = type;
    this.lastShotTime = 0;
    this.rangeVisualizer = TowerRangeVisualizer.getInstance();
    
    // Add transform component
    const transform = new TransformComponent(x, y);
    this.addComponent(transform);
    
    // Create visual representation
    this.visual = new Graphics();
    this.visual.circle(0, 0, 20).fill(0x0000ff);
    this.visual.stroke({ width: 2, color: 0xffffff });
    this.addChild(this.visual);
    
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
    
    // Show visual effect for shooting
    this.visual.clear();
    this.visual.circle(0, 0, 20).fill(0xff0000);
    this.visual.stroke({ width: 2, color: 0xffffff });
    
    // Reset color after a short delay
    setTimeout(() => {
      this.visual.clear();
      this.visual.circle(0, 0, 20).fill(0x0000ff);
      this.visual.stroke({ width: 2, color: 0xffffff });
    }, 100);
  }
  
  // Show tower range visualization
  public showRange(container: Container): void {
    const transform = this.getComponent<TransformComponent>('Transform');
    if (transform) {
      const pos = transform.position;
      this.rangeVisualizer.showRange(container, pos.x, pos.y, this.range);
    }
  }
  
  // Hide tower range visualization
  public hideRange(): void {
    this.rangeVisualizer.hideRange();
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