import { Graphics, Container, ContainerChild } from 'pixi.js';
import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { HealthComponent } from '../components/HealthComponent';
import { ITower } from './Tower.interface';
import { GameConfig } from '../config/gameConfig';
import { TowerRangeVisualizer } from '../utils/TowerRangeVisualizer';
import { TowerManager } from '../managers/TowerManager';

export class Tower extends GameObject implements ITower {
  private type: string;
  private damage: number = 0;
  private range: number = 0;
  private fireRate: number = 0; // shots per second
  private lastShotTime: number = 0;
  private upgradeLevel: number = 1;
  private maxUpgradeLevel: number = 5;
  private upgradeCost: number = 100;
  private visual: Graphics;
  private rangeVisualizer: TowerRangeVisualizer;
  private static readonly MAX_UPGRADE_LEVEL: number = 5; // Maximum upgrade level

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
    this.addChild(this.visual);
    this.updateVisual();

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

  // Show shooting visual effects
  public showShootingEffect(): void {
    // Store original position for recoil animation
    const originalX = this.visual.x;
    const originalY = this.visual.y;

    // Muzzle flash effect based on tower type
    this.visual.clear();

    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        this.createMachineGunVisual();
        // Add muzzle flash
        this.visual.circle(0, -15, 8).fill(0xffff00); // Yellow flash
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        this.createSniperVisual();
        // Add muzzle flash at barrel tip
        this.visual.circle(0, -35, 6).fill(0xffff00); // Yellow flash
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        this.createShotgunVisual();
        // Add muzzle flash
        this.visual.circle(0, 0, 12).fill(0xffff00); // Yellow flash
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        this.createFlameVisual();
        // Add flame effect
        this.visual.circle(0, 0, 12).fill(0xff4500); // Orange flame
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        this.createTeslaVisual();
        // Add electrical effect
        this.visual.circle(0, 0, 15).fill(0x00bfff); // Light blue electricity
        break;
      default:
        // Default visual if type not recognized
        this.visual.circle(0, 0, 20).fill(0x0000ff);
        this.visual.stroke({ width: 2, color: 0xffffff });
        this.visual.circle(0, -15, 8).fill(0xffff00); // Yellow flash
    }

    // Apply recoil animation (short backward movement)
    this.visual.x = originalX - 2;
    this.visual.y = originalY - 2;

    // Reset after a short delay
    setTimeout(() => {
      this.updateVisual();
      // Return to original position
      this.visual.x = originalX;
      this.visual.y = originalY;
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

  // Machine Gun Tower Visual
  private createMachineGunVisual(): void {
    this.visual.circle(0, 0, 20).fill(0x0000ff); // Blue
    this.visual.stroke({ width: 2, color: 0x000000 });

    // Barrel
    this.visual.moveTo(0, -20).lineTo(0, -35).stroke({ width: 3, color: 0x4169e1 });
  }

  // Sniper Tower Visual
  private createSniperVisual(): void {
    this.visual.ellipse(0, 0, 15, 25).fill(0x2f4f4f); // Dark slate gray
    this.visual.stroke({ width: 2, color: 0x000000 });

    // Long barrel
    this.visual.moveTo(0, -25).lineTo(0, -45).stroke({ width: 2, color: 0x696969 });
  }

  // Shotgun Tower Visual
  private createShotgunVisual(): void {
    this.visual.roundRect(-18, -18, 36, 36, 8).fill(0x8b4513); // Saddle brown
    this.visual.stroke({ width: 2, color: 0x000000 });

    // Double barrels
    this.visual.moveTo(-5, -18).lineTo(-5, -30).stroke({ width: 2, color: 0xa0522d });
    this.visual.moveTo(5, -18).lineTo(5, -30).stroke({ width: 2, color: 0xa0522d });
  }

  // Flame Tower Visual
  private createFlameVisual(): void {
    this.visual.circle(0, 0, 20).fill(0xff4500); // Orange red
    this.visual.stroke({ width: 2, color: 0x000000 });

    // Flame vents
    this.visual.circle(-10, -10, 5).fill(0xff0000); // Red
    this.visual.circle(10, -10, 5).fill(0xff0000);
    this.visual.circle(-10, 10, 5).fill(0xff0000);
    this.visual.circle(10, 10, 5).fill(0xff0000);
  }

  // Tesla Tower Visual
  private createTeslaVisual(): void {
    this.visual.circle(0, 0, 20).fill(0x00ced1); // Dark turquoise
    this.visual.stroke({ width: 2, color: 0x000000 });

    // Electrical orb
    this.visual.circle(0, 0, 10).fill(0x7fffd4); // Aquamarine

    // Lightning bolts
    this.visual.moveTo(-5, -5).lineTo(5, 5).stroke({ width: 1, color: 0xffffff });
    this.visual.moveTo(5, -5).lineTo(-5, 5).stroke({ width: 1, color: 0xffffff });
  }

  /**
   * Get the tower type
   * @returns The tower type
   */
  public getType(): string {
    return this.type;
  }

  /**
   * Get the current upgrade level
   * @returns The current upgrade level
   */
  public getUpgradeLevel(): number {
    return this.upgradeLevel;
  }

  /**
   * Get the maximum upgrade level
   * @returns The maximum upgrade level
   */
  public getMaxUpgradeLevel(): number {
    return this.maxUpgradeLevel;
  }

  /**
   * Get the base upgrade cost
   * @returns The base upgrade cost
   */
  public getUpgradeCost(): number {
    return this.upgradeCost;
  }

  /**
   * Check if the tower can be upgraded
   * @returns True if the tower can be upgraded, false otherwise
   */
  public canUpgrade(): boolean {
    return this.upgradeLevel < this.maxUpgradeLevel;
  }

  /**
   * Upgrade the tower
   */
  public upgrade(): void {
    if (this.canUpgrade()) {
      this.upgradeLevel++;
      this.applyUpgradeEffects();
    }
  }

  /**
   * Apply effects of an upgrade
   */
  private applyUpgradeEffects(): void {
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
        this.updateVisual();
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

  // Update visual based on tower type
  public updateVisual(): void {
    this.visual.clear();

    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        this.createMachineGunVisual();
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        this.createSniperVisual();
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        this.createShotgunVisual();
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        this.createFlameVisual();
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        this.createTeslaVisual();
        break;
      default:
        this.visual.circle(0, 0, 20).fill(0x0000ff);
        this.visual.stroke({ width: 2, color: 0xffffff });
    }
  }

  // Getters
  public getDamage(): number {
    return this.damage;
  }

  public getRange(): number {
    return this.range;
  }

  public getFireRate(): number {
    return this.fireRate;
  }

  // Show selection visual effects
  public showSelectionEffect(): void {
    // Create a highlight effect around the tower
    const highlight = new Graphics();
    highlight.circle(0, 0, 25).fill({ color: 0xffff00, alpha: 0.3 }); // Yellow highlight with transparency
    highlight.stroke({ width: 2, color: 0xffff00 });

    // Add highlight as a child but behind the main visual
    this.addChildAt(highlight, 0);

    // Store reference to remove later
    (this as any).selectionHighlight = highlight;

    // Pulsing animation effect
    let scale = 1;
    let growing = true;
    const pulse = () => {
      if (growing) {
        scale += 0.05;
        if (scale >= 1.2) growing = false;
      } else {
        scale -= 0.05;
        if (scale <= 1) growing = true;
      }
      highlight.scale.set(scale);
    };

    // Store interval ID to clear later
    (this as any).pulseInterval = setInterval(pulse, 50);
  }

  // Hide selection visual effects
  public hideSelectionEffect(): void {
    // Remove highlight if it exists
    if ((this as any).selectionHighlight) {
      this.removeChild((this as any).selectionHighlight);
      (this as any).selectionHighlight.destroy();
      delete (this as any).selectionHighlight;
    }

    // Clear pulse animation if it exists
    if ((this as any).pulseInterval) {
      clearInterval((this as any).pulseInterval);
      delete (this as any).pulseInterval;
    }
  }
}
