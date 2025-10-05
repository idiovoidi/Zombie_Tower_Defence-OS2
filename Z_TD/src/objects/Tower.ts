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
    // Shooting logic is handled by showShootingEffect()
  }

  // Show shooting visual effects
  public showShootingEffect(): void {
    // Create temporary muzzle flash on the barrel
    const flash = new Graphics();
    
    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        // Gun starts at -10, extends down by gunLength (8 + upgradeLevel)
        // Gun tip is at -10 + gunLength = -2 to +3 depending on upgrade
        const mgGunLength = 8 + this.upgradeLevel;
        const mgGunTip = -10 + mgGunLength;
        flash.circle(0, mgGunTip, 4).fill(0xffff00);
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        // Rifle starts at -12, extends down by rifleLength (12 + upgradeLevel * 2)
        // Rifle tip is at -12 + rifleLength = 0 to +10 depending on upgrade
        const sniperRifleLength = 12 + this.upgradeLevel * 2;
        const sniperRifleTip = -12 + sniperRifleLength;
        flash.circle(0, sniperRifleTip, 5).fill(0xffff00);
        flash.circle(0, sniperRifleTip, 8).fill({ color: 0xffff00, alpha: 0.3 });
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        // Shotgun starts at -8, extends down by 8
        // Shotgun tip is at -8 + 8 = 0
        const shotgunTip = -8 + 8;
        flash.circle(-2, shotgunTip, 5).fill(0xffff00);
        flash.circle(2, shotgunTip, 5).fill(0xffff00);
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        // Flamethrower starts at -10, extends down by 6
        // Nozzle tip is at -10 + 6 = -4
        const flameTip = -10 + 6;
        flash.circle(0, flameTip, 6).fill(0xff4500);
        flash.circle(0, flameTip + 2, 4).fill(0xff6347);
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        // Tesla gun starts at -10, extends down by 7
        // Gun tip is at -10 + 7 = -3
        const teslaTip = -10 + 7;
        flash.circle(0, teslaTip, 6).fill(0x00ffff);
        flash.moveTo(-4, teslaTip).lineTo(4, teslaTip).stroke({ width: 2, color: 0xffffff });
        flash.moveTo(0, teslaTip - 4).lineTo(0, teslaTip + 4).stroke({ width: 2, color: 0xffffff });
        break;
      default:
        flash.circle(0, 0, 4).fill(0xffff00);
    }

    this.barrel.addChild(flash);

    // Apply recoil animation (little man recoils back slightly)
    const originalY = this.barrel.y;
    this.barrel.y = 2;

    // Reset after a short delay
    setTimeout(() => {
      if (this.barrel && !this.barrel.destroyed) {
        this.barrel.removeChild(flash);
        flash.destroy();
        // Return to original position
        this.barrel.y = originalY;
      }
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
    // Tower base (doesn't rotate) - gets larger with upgrades
    const baseSize = 15 + this.upgradeLevel * 2;
    this.visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x8b7355); // Brown tower base
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Tower window
    this.visual.rect(-10, 0, 8, 8).fill(0x4a4a4a); // Dark window
    this.visual.rect(2, 0, 8, 8).fill(0x4a4a4a); // Dark window

    // Upgrade stars
    this.addUpgradeStars();

    // Little man (rotates with barrel)
    this.barrel.clear();
    // Body - armor gets better with upgrades
    const bodyColor = this.upgradeLevel >= 3 ? 0x4169e1 : 0x0000ff;
    this.barrel.rect(-3, -13, 6, 8).fill(bodyColor); // Blue uniform
    // Arms holding gun
    this.barrel.rect(-4, -11, 2, 4).fill(0xffdbac); // Left arm
    this.barrel.rect(2, -11, 2, 4).fill(0xffdbac); // Right arm
    // Gun (machine gun) - held in front
    const gunLength = 8 + this.upgradeLevel;
    this.barrel.rect(-1, -10, 2, gunLength).fill(0x2f4f4f); // Gun body
    this.barrel.rect(-2, -11, 4, 2).fill(0x2f4f4f); // Gun barrel
    // Head
    this.barrel.circle(0, -18, 5).fill(0xffdbac); // Skin tone
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Military cap
    this.barrel.rect(-5, -21, 10, 3).fill(0x0000ff);
    this.barrel.rect(-3, -23, 6, 2).fill(0x0000ff); // Cap top
  }

  // Sniper Tower Visual
  private createSniperVisual(): void {
    // Tall tower base (doesn't rotate) - gets taller with upgrades
    const towerHeight = 30 + this.upgradeLevel * 3;
    this.visual.rect(-12, -10, 24, towerHeight).fill(0x696969); // Gray tower
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Tower top
    this.visual.moveTo(-12, -10).lineTo(0, -18).lineTo(12, -10).fill(0x4a4a4a);
    
    // Sniper window
    this.visual.rect(-6, -5, 12, 6).fill(0x2f4f4f);

    // Upgrade stars
    this.addUpgradeStars();

    // Little man with sniper rifle (rotates)
    this.barrel.clear();
    // Body - better camo with upgrades
    const bodyColor = this.upgradeLevel >= 3 ? 0x1a1a1a : 0x2f4f4f;
    this.barrel.rect(-3, -15, 6, 8).fill(bodyColor); // Dark uniform
    // Arms holding rifle
    this.barrel.rect(-4, -13, 2, 4).fill(0xffdbac); // Left arm
    this.barrel.rect(2, -13, 2, 4).fill(0xffdbac); // Right arm
    // Sniper rifle (long and thin) - held in front
    const rifleLength = 12 + this.upgradeLevel * 2;
    this.barrel.rect(-1, -12, 2, rifleLength).fill(0x1a1a1a); // Long rifle
    this.barrel.circle(0, -13, 2 + this.upgradeLevel * 0.5).fill(0x1a1a1a); // Scope
    // Head
    this.barrel.circle(0, -20, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Tactical sunglasses
    this.barrel.rect(-4, -20, 8, 2).fill(0x1a1a1a);
    // Boonie hat
    this.barrel.circle(0, -23, 6).fill(0x2f4f4f);
    this.barrel.rect(-6, -21, 12, 1).fill(0x2f4f4f); // Hat brim
  }

  // Shotgun Tower Visual
  private createShotgunVisual(): void {
    // Bunker-style base (doesn't rotate) - gets wider with upgrades
    const bunkerWidth = 36 + this.upgradeLevel * 4;
    this.visual.roundRect(-bunkerWidth / 2, -8, bunkerWidth, 28, 8).fill(0x8b4513); // Brown bunker
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // More sandbags with upgrades
    const sandbagCount = 4 + this.upgradeLevel;
    for (let i = 0; i < sandbagCount; i++) {
      const x = -bunkerWidth / 2 + 8 + (i * (bunkerWidth - 16) / (sandbagCount - 1));
      this.visual.circle(x, 15, 4).fill(0xa0826d);
    }
    
    // Firing slot
    this.visual.rect(-8, 0, 16, 6).fill(0x4a4a4a);

    // Upgrade stars
    this.addUpgradeStars();

    // Little man with shotgun (rotates)
    this.barrel.clear();
    // Body
    this.barrel.rect(-3, -11, 6, 8).fill(0x8b4513); // Brown uniform
    // Arms holding shotgun
    this.barrel.rect(-4, -9, 2, 4).fill(0xffdbac); // Left arm
    this.barrel.rect(2, -9, 2, 4).fill(0xffdbac); // Right arm
    // Shotgun (double barrel) - held in front
    const barrelWidth = 2 + this.upgradeLevel * 0.3;
    this.barrel.rect(-3, -8, barrelWidth, 8).fill(0xa0522d);
    this.barrel.rect(1, -8, barrelWidth, 8).fill(0xa0522d);
    // Head
    this.barrel.circle(0, -16, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Helmet (always present, gets better with upgrades)
    if (this.upgradeLevel >= 3) {
      this.barrel.circle(0, -18, 5).fill(0x4a4a4a); // Full helmet
      this.barrel.rect(-2, -19, 4, 1).fill(0x8b8b8b); // Visor
    } else {
      this.barrel.rect(-5, -19, 10, 3).fill(0x4a4a4a); // Basic helmet
    }
  }

  // Flame Tower Visual
  private createFlameVisual(): void {
    // Round tower base (doesn't rotate) - gets bigger with upgrades
    const towerSize = 18 + this.upgradeLevel * 2;
    this.visual.circle(0, 5, towerSize).fill(0xff4500); // Orange tower
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Tower top
    this.visual.circle(0, -10, 12 + this.upgradeLevel).fill(0xff6347);
    
    // More heat vents with upgrades
    const ventCount = 2 + Math.floor(this.upgradeLevel / 2);
    for (let i = 0; i < ventCount; i++) {
      const angle = (i / ventCount) * Math.PI * 2;
      const x = Math.cos(angle) * (towerSize - 5);
      const y = Math.sin(angle) * (towerSize - 5);
      this.visual.rect(x - 1.5, y, 3, 8).fill(0x8b0000);
    }

    // Upgrade stars
    this.addUpgradeStars();

    // Little man with flamethrower (rotates)
    this.barrel.clear();
    // Body - better suit with upgrades
    const suitColor = this.upgradeLevel >= 3 ? 0xff6347 : 0xff4500;
    this.barrel.rect(-3, -13, 6, 8).fill(suitColor); // Orange suit
    // Arms holding flamethrower
    this.barrel.rect(-4, -11, 2, 4).fill(0xff4500); // Left arm (suited)
    this.barrel.rect(2, -11, 2, 4).fill(0xff4500); // Right arm (suited)
    // Flamethrower - held in front
    const tankSize = 3 + this.upgradeLevel * 0.5;
    this.barrel.rect(-tankSize / 2, -10, tankSize, 8).fill(0xff0000); // Fuel tank
    this.barrel.rect(-1, -11, 2, 6).fill(0x8b0000); // Nozzle
    // Head with protective mask
    this.barrel.circle(0, -18, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Full face gas mask
    this.barrel.circle(0, -18, 4).fill(0x4a4a4a); // Mask
    this.barrel.circle(-2, -19, 1.5).fill(0x1a1a1a); // Left eye lens
    this.barrel.circle(2, -19, 1.5).fill(0x1a1a1a); // Right eye lens
    this.barrel.circle(0, -15, 2).fill(0x2a2a2a); // Filter
  }

  // Tesla Tower Visual
  private createTeslaVisual(): void {
    // High-tech tower base (doesn't rotate) - gets more advanced with upgrades
    const towerWidth = 32 + this.upgradeLevel * 3;
    this.visual.rect(-towerWidth / 2, -5, towerWidth, 25).fill(0x00ced1); // Turquoise tower
    this.visual.stroke({ width: 2, color: 0x000000 });
    
    // Tech panels
    this.visual.rect(-12, 0, 8, 6).fill(0x7fffd4);
    this.visual.rect(4, 0, 8, 6).fill(0x7fffd4);
    
    // More energy indicators with upgrades
    const indicatorCount = 2 + this.upgradeLevel;
    for (let i = 0; i < indicatorCount; i++) {
      const x = -towerWidth / 2 + 8 + (i * (towerWidth - 16) / (indicatorCount - 1));
      this.visual.circle(x, 3, 2).fill(0x00ffff);
    }

    // Upgrade stars
    this.addUpgradeStars();

    // Little man with tesla gun (rotates)
    this.barrel.clear();
    // Body with tech suit - glows more with upgrades
    const suitColor = this.upgradeLevel >= 3 ? 0x00ffff : 0x00ced1;
    this.barrel.rect(-3, -13, 6, 8).fill(suitColor);
    // Arms holding tesla gun
    this.barrel.rect(-4, -11, 2, 4).fill(0x00ced1); // Left arm
    this.barrel.rect(2, -11, 2, 4).fill(0x00ced1); // Right arm
    // Tesla coil gun - held in front
    const coilSize = 3 + this.upgradeLevel * 0.5;
    this.barrel.circle(0, -10, coilSize).fill(0x7fffd4); // Coil top
    this.barrel.rect(-2, -10, 4, 7).fill(0x00bfff); // Coil body
    // Electric arcs on gun
    for (let i = 0; i < Math.min(this.upgradeLevel, 2); i++) {
      const offset = i * 2;
      this.barrel.moveTo(-2, -8 + offset).lineTo(2, -6 + offset).stroke({ width: 1, color: 0xffffff });
    }
    // Head
    this.barrel.circle(0, -18, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Futuristic visor/goggles
    this.barrel.rect(-4, -19, 8, 3).fill(0x00ffff);
    this.barrel.rect(-4, -19, 8, 3).fill({ color: 0x00ffff, alpha: 0.5 });
    // Tech headset
    this.barrel.rect(-5, -21, 2, 4).fill(0x00ced1); // Left earpiece
    this.barrel.rect(3, -21, 2, 4).fill(0x00ced1); // Right earpiece
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

    // Update visual to show upgrade
    this.updateVisual();
  }

  // Apply damage to the tower
  public takeDamage(damage: number): number {
    const healthComponent = this.getComponent<HealthComponent>('Health');
    if (healthComponent) {
      const actualDamage = healthComponent.takeDamage(damage);

      // Visual feedback for damage - flash the tower red
      const damageFlash = new Graphics();
      damageFlash.circle(0, 0, 30).fill({ color: 0xff0000, alpha: 0.5 });
      this.addChild(damageFlash);

      // Remove flash after a short delay
      setTimeout(() => {
        if (damageFlash && !damageFlash.destroyed) {
          this.removeChild(damageFlash);
          damageFlash.destroy();
        }
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

  // Add upgrade stars to show upgrade level
  private addUpgradeStars(): void {
    if (this.upgradeLevel <= 1) return;

    const starCount = Math.min(this.upgradeLevel - 1, 5);
    const starSize = 3;
    const spacing = 8;
    const startX = -(starCount - 1) * spacing / 2;

    for (let i = 0; i < starCount; i++) {
      const x = startX + i * spacing;
      const y = -30;
      
      // Draw a simple star
      this.visual.moveTo(x, y - starSize)
        .lineTo(x + starSize * 0.3, y - starSize * 0.3)
        .lineTo(x + starSize, y)
        .lineTo(x + starSize * 0.3, y + starSize * 0.3)
        .lineTo(x, y + starSize)
        .lineTo(x - starSize * 0.3, y + starSize * 0.3)
        .lineTo(x - starSize, y)
        .lineTo(x - starSize * 0.3, y - starSize * 0.3)
        .lineTo(x, y - starSize)
        .fill(0xffd700); // Gold stars
    }
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
    // Guns now point down (positive Y), so subtract 90 degrees instead of adding
    const angle = Math.atan2(dy, dx) - Math.PI / 2;

    this.currentRotation = angle;
    this.barrel.rotation = angle;
  }

  // Get projectile spawn position (at barrel tip)
  public getProjectileSpawnPosition(): { x: number; y: number } {
    let barrelLength = 20;

    // Calculate barrel length based on gun position (guns are now held in front)
    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        barrelLength = 18 + this.upgradeLevel; // Gun tip at -10 - gunLength
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        barrelLength = 24 + this.upgradeLevel * 2; // Rifle tip at -12 - rifleLength
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        barrelLength = 16; // Shotgun tip at -8 - 8
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        barrelLength = 16; // Flamethrower nozzle at -10 - 6
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        barrelLength = 17; // Tesla gun at -10 - 7
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
    // Clean up any existing selection effect first
    this.hideSelectionEffect();

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
      // Check if highlight still exists before animating
      if (!highlight || highlight.destroyed) {
        if ((this as any).pulseInterval) {
          clearInterval((this as any).pulseInterval);
          delete (this as any).pulseInterval;
        }
        return;
      }

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
    // Clear pulse animation first
    if ((this as any).pulseInterval) {
      clearInterval((this as any).pulseInterval);
      delete (this as any).pulseInterval;
    }

    // Remove highlight if it exists
    if ((this as any).selectionHighlight) {
      const highlight = (this as any).selectionHighlight;
      if (highlight && !highlight.destroyed && highlight.parent) {
        this.removeChild(highlight);
        highlight.destroy();
      }
      delete (this as any).selectionHighlight;
    }
  }
}
