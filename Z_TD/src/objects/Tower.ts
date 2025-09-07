import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { HealthComponent } from '../components/HealthComponent';
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
    
    // Add health component for tower durability (from design document)
    // Different tower types could have different health values
    let towerHealth = 100;
    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        towerHealth = 120;
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        towerHealth = 80;
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        towerHealth = 100;
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        towerHealth = 90;
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        towerHealth = 110;
        break;
    }
    
    const healthComponent = new HealthComponent(towerHealth);
    this.addComponent(healthComponent);
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
    
    // When upgrading, also increase health
    const healthComponent = this.getComponent<HealthComponent>('Health');
    if (healthComponent) {
      // Increase max health by 20% per upgrade level
      const newMaxHealth = Math.floor(100 * Math.pow(1.2, this.upgradeLevel));
      // Heal to full when upgraded
      healthComponent['maxHealth'] = newMaxHealth; // Note: In a real implementation, we'd add a setter for maxHealth
      healthComponent.heal(newMaxHealth); // This will set current health to max
    }
  }
  
  // Apply damage to the tower
  public takeDamage(damage: number): number {
    const healthComponent = this.getComponent<HealthComponent>('Health');
    if (healthComponent) {
      const actualDamage = healthComponent.takeDamage(damage);
      
      // Visual feedback for damage
      this.visual.clear();
      this.visual.circle(0, 0, 20).fill(0xff0000);
      this.visual.stroke({ width: 2, color: 0xffffff });
      
      // Reset color after a short delay
      setTimeout(() => {
        this.visual.clear();
        this.visual.circle(0, 0, 20).fill(0x0000ff);
        this.visual.stroke({ width: 2, color: 0xffffff });
      }, 100);
      
      return actualDamage;
    }
    return 0;
  }
  
  // Check if tower is still alive
  public isAlive(): boolean {
    const healthComponent = this.getComponent<HealthComponent>('Health');
    return healthComponent ? healthComponent.isAlive() : false;
  }
  
  // Get current health
  public getHealth(): number {
    const healthComponent = this.getComponent<HealthComponent>('Health');
    return healthComponent ? healthComponent.getHealth() : 0;
  }
  
  // Get maximum health
  public getMaxHealth(): number {
    const healthComponent = this.getComponent<HealthComponent>('Health');
    return healthComponent ? healthComponent.getMaxHealth() : 0;
  }
  
  // Get health percentage
  public getHealthPercentage(): number {
    const healthComponent = this.getComponent<HealthComponent>('Health');
    return healthComponent ? healthComponent.getHealthPercentage() : 0;
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