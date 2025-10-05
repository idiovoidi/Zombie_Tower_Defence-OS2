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
  private barrel: Graphics; // Separate barrel for rotation
  private rangeVisualizer: TowerRangeVisualizer;
  private currentRotation: number = 0;
  private static readonly MAX_UPGRADE_LEVEL: number = 5; // Maximum upgrade level

  constructor(type: string, x: number, y: number) {
    super();
    this.type = type;
    this.lastShotTime = 0;
    this.rangeVisualizer = TowerRangeVisualizer.getInstance();

    // Set the container position
    this.position.set(x, y);

    // Add transform component
    const transform = new TransformComponent(x, y);
    this.addComponent(transform);

    // Create visual representation
    this.visual = new Graphics();
    this.addChild(this.visual);

    // Create barrel as separate graphics for rotation
    this.barrel = new Graphics();
    this.addChild(this.barrel);

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
    // Store original barrel position for recoil animation
    const originalX = this.barrel.x;
    const originalY = this.barrel.y;

    // Create temporary muzzle flash on the barrel
    const flash = new Graphics();
    
    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        // Small rapid muzzle flash
        flash.circle(0, -26, 4).fill(0xffff00);
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        // Large bright flash at rifle tip
        flash.circle(0, -36, 5).fill(0xffff00);
        flash.circle(0, -36, 8).fill({ color: 0xffff00, alpha: 0.3 });
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        // Wide spread flash
        flash.circle(-2, -22, 5).fill(0xffff00);
        flash.circle(2, -22, 5).fill(0xffff00);
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        // Flame burst
        flash.circle(0, -26, 6).fill(0xff4500);
        flash.circle(0, -28, 4).fill(0xff6347);
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        // Electric burst
        flash.circle(0, -24, 6).fill(0x00ffff);
        flash.moveTo(-4, -24).lineTo(4, -24).stroke({ width: 2, color: 0xffffff });
        flash.moveTo(0, -28).lineTo(0, -20).stroke({ width: 2, color: 0xffffff });
        break;
      default:
        flash.circle(0, -26, 4).fill(0xffff00);
    }

    this.barrel.addChild(flash);

    // Apply recoil animation (little man recoils back)
    this.barrel.y = originalY + 2;

    // Reset after a short delay
    setTimeout(() => {
      this.barrel.removeChild(flash);
      flash.destroy();
      // Return to original position
      this.barrel.y = originalY;
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
    // Tower base (doesn't rotate)
    this.visual.rect(-15, -5, 30, 25).fill(0x8b7355); // Brown tower base
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Tower window
    this.visual.rect(-10, 0, 8, 8).fill(0x4a4a4a); // Dark window
    this.visual.rect(2, 0, 8, 8).fill(0x4a4a4a); // Dark window

    // Little man (rotates with barrel)
    this.barrel.clear();
    // Head
    this.barrel.circle(0, -18, 5).fill(0xffdbac); // Skin tone
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Body
    this.barrel.rect(-3, -13, 6, 8).fill(0x0000ff); // Blue uniform
    // Gun (machine gun)
    this.barrel.rect(-1, -25, 2, 12).fill(0x2f4f4f); // Gun body
    this.barrel.rect(-2, -26, 4, 2).fill(0x2f4f4f); // Gun barrel
  }

  // Sniper Tower Visual
  private createSniperVisual(): void {
    // Tall tower base (doesn't rotate)
    this.visual.rect(-12, -10, 24, 30).fill(0x696969); // Gray tower
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Tower top
    this.visual.moveTo(-12, -10).lineTo(0, -18).lineTo(12, -10).fill(0x4a4a4a);
    
    // Sniper window
    this.visual.rect(-6, -5, 12, 6).fill(0x2f4f4f);

    // Little man with sniper rifle (rotates)
    this.barrel.clear();
    // Head
    this.barrel.circle(0, -20, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Body
    this.barrel.rect(-3, -15, 6, 8).fill(0x2f4f4f); // Dark uniform
    // Sniper rifle (long and thin)
    this.barrel.rect(-1, -35, 2, 20).fill(0x1a1a1a); // Long rifle
    this.barrel.circle(0, -36, 2).fill(0x1a1a1a); // Scope
  }

  // Shotgun Tower Visual
  private createShotgunVisual(): void {
    // Bunker-style base (doesn't rotate)
    this.visual.roundRect(-18, -8, 36, 28, 8).fill(0x8b4513); // Brown bunker
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Sandbags
    this.visual.circle(-12, 15, 4).fill(0xa0826d);
    this.visual.circle(-4, 15, 4).fill(0xa0826d);
    this.visual.circle(4, 15, 4).fill(0xa0826d);
    this.visual.circle(12, 15, 4).fill(0xa0826d);
    
    // Firing slot
    this.visual.rect(-8, 0, 16, 6).fill(0x4a4a4a);

    // Little man with shotgun (rotates)
    this.barrel.clear();
    // Head
    this.barrel.circle(0, -16, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Body
    this.barrel.rect(-3, -11, 6, 8).fill(0x8b4513); // Brown uniform
    // Shotgun (double barrel)
    this.barrel.rect(-3, -22, 2, 11).fill(0xa0522d);
    this.barrel.rect(1, -22, 2, 11).fill(0xa0522d);
  }

  // Flame Tower Visual
  private createFlameVisual(): void {
    // Round tower base (doesn't rotate)
    this.visual.circle(0, 5, 18).fill(0xff4500); // Orange tower
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Tower top
    this.visual.circle(0, -10, 12).fill(0xff6347);
    
    // Heat vents
    this.visual.rect(-10, 0, 3, 8).fill(0x8b0000);
    this.visual.rect(7, 0, 3, 8).fill(0x8b0000);

    // Little man with flamethrower (rotates)
    this.barrel.clear();
    // Head with protective mask
    this.barrel.circle(0, -18, 5).fill(0xffdbac);
    this.barrel.circle(0, -18, 4).fill(0x4a4a4a); // Mask
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Body
    this.barrel.rect(-3, -13, 6, 8).fill(0xff4500); // Orange suit
    // Flamethrower
    this.barrel.rect(-2, -24, 4, 11).fill(0xff0000); // Fuel tank
    this.barrel.rect(-1, -26, 2, 8).fill(0x8b0000); // Nozzle
  }

  // Tesla Tower Visual
  private createTeslaVisual(): void {
    // High-tech tower base (doesn't rotate)
    this.visual.rect(-16, -5, 32, 25).fill(0x00ced1); // Turquoise tower
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Tech panels
    this.visual.rect(-12, 0, 8, 6).fill(0x7fffd4);
    this.visual.rect(4, 0, 8, 6).fill(0x7fffd4);
    
    // Energy indicators
    this.visual.circle(-8, 3, 2).fill(0x00ffff);
    this.visual.circle(8, 3, 2).fill(0x00ffff);

    // Little man with tesla gun (rotates)
    this.barrel.clear();
    // Head
    this.barrel.circle(0, -18, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Body with tech suit
    this.barrel.rect(-3, -13, 6, 8).fill(0x00ced1);
    // Tesla coil gun
    this.barrel.circle(0, -24, 4).fill(0x7fffd4); // Coil top
    this.barrel.rect(-2, -24, 4, 9).fill(0x00bfff); // Coil body
    // Electric arcs
    this.barrel.moveTo(-3, -22).lineTo(3, -20).stroke({ width: 1, color: 0xffffff });
    this.barrel.moveTo(3, -22).lineTo(-3, -20).stroke({ width: 1, color: 0xffffff });
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

  // Rotate tower to face target
  public rotateTowards(targetX: number, targetY: number): void {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const angle = Math.atan2(dy, dx) + Math.PI / 2; // Add 90 degrees since barrel points up

    this.currentRotation = angle;
    this.barrel.rotation = angle;
  }

  // Get projectile spawn position (at barrel tip)
  public getProjectileSpawnPosition(): { x: number; y: number } {
    let barrelLength = 35;

    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        barrelLength = 35;
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        barrelLength = 45;
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        barrelLength = 30;
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        barrelLength = 22;
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        barrelLength = 23;
        break;
    }

    // Calculate position at barrel tip based on rotation
    const angle = this.currentRotation - Math.PI / 2; // Subtract 90 degrees
    const spawnX = this.position.x + Math.cos(angle) * barrelLength;
    const spawnY = this.position.y + Math.sin(angle) * barrelLength;

    return { x: spawnX, y: spawnY };
  }

  // Get projectile type for this tower
  public getProjectileType(): string {
    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        return 'bullet';
      case GameConfig.TOWER_TYPES.SNIPER:
        return 'sniper';
      case GameConfig.TOWER_TYPES.SHOTGUN:
        return 'shotgun';
      case GameConfig.TOWER_TYPES.FLAME:
        return 'flame';
      case GameConfig.TOWER_TYPES.TESLA:
        return 'tesla';
      default:
        return 'bullet';
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
