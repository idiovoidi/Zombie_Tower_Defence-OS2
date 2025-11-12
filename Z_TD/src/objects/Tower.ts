import { Container, Graphics } from 'pixi.js';
import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { HealthComponent } from '../components/HealthComponent';
import { ITower } from './Tower.interface';
import { GameConfig } from '../config/gameConfig';
import { TowerRangeVisualizer } from '../utils/TowerRangeVisualizer';
import { TowerManager } from '../managers/TowerManager';
import { BarrelHeatGlow } from '../renderers/effects/BarrelHeatGlow';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';
import { ResourceCleanupManager } from '../utils/ResourceCleanupManager';
import type { TowerEffects } from '../types/tower-internal';
import type { ITowerRenderer } from '@/renderers/towers/ITowerRenderer';
import { TowerRendererFactory } from '@/renderers/towers/TowerRendererFactory';

export class Tower extends GameObject implements ITower, TowerEffects {
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
  private renderer: ITowerRenderer; // Renderer for visual representation
  private rangeVisualizer: TowerRangeVisualizer;
  private currentRotation: number = 0;
  private static readonly MAX_UPGRADE_LEVEL: number = 5; // Maximum upgrade level

  // Idle animation properties
  private idleTime: number = 0;
  private idleScanDirection: number = 1; // 1 for right, -1 for left
  private idleScanAngle: number = 0;
  private lastShootTime: number = 0;

  // Machine gun effects
  private barrelHeatGlow: BarrelHeatGlow | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private effectManager: any = null; // Reference to effect manager container (dynamically set)

  // Sniper effects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private laserSight: any = null; // LaserSight instance (dynamically imported)
  private currentTarget: { x: number; y: number } | null = null;

  // Dynamic effect properties (from TowerEffects interface)
  public selectionHighlight?: Graphics;
  public pulseInterval?: NodeJS.Timeout;

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

    // Assign renderer via factory
    this.renderer = TowerRendererFactory.create(type);

    // Initial render
    this.updateVisual();

    // Initialize tower stats
    this.initializeStats();

    // Initialize machine gun effects if this is a machine gun tower
    if (this.type === GameConfig.TOWER_TYPES.MACHINE_GUN) {
      this.barrelHeatGlow = new BarrelHeatGlow(this.barrel);
    }
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
      case GameConfig.TOWER_TYPES.GRENADE:
        towerHealth = 95;
        break;
    }

    const healthComponent = new HealthComponent(towerHealth);
    this.addComponent(healthComponent);
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);

    // Update idle animation
    this.updateIdleAnimation(deltaTime);

    // Update barrel heat glow for machine gun
    if (this.barrelHeatGlow) {
      this.barrelHeatGlow.update(deltaTime);
    }

    // Update laser sight for sniper (level 3+)
    if (this.laserSight && this.currentTarget) {
      this.laserSight.update(deltaTime);
    }
  }

  private updateIdleAnimation(deltaTime: number): void {
    this.idleTime += deltaTime;

    // Check if tower has been idle for more than 2 seconds
    const timeSinceLastShot = performance.now() - this.lastShootTime;
    const isIdle = timeSinceLastShot > 2000;

    if (!isIdle) {
      // Reset idle animation when shooting
      this.idleScanAngle = 0;
      return;
    }

    // Different idle animations based on tower type
    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        this.idleAnimationMachineGun(deltaTime);
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        this.idleAnimationSniper(deltaTime);
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        this.idleAnimationShotgun(deltaTime);
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        this.idleAnimationFlame(deltaTime);
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        this.idleAnimationTesla(deltaTime);
        break;
      case GameConfig.TOWER_TYPES.GRENADE:
        this.idleAnimationGrenade(deltaTime);
        break;
      case GameConfig.TOWER_TYPES.SLUDGE:
        this.idleAnimationSludge(deltaTime);
        break;
    }
  }

  // Grenade: Subtle loading animation
  private idleAnimationGrenade(_deltaTime: number): void {
    // Subtle bob up and down
    const bobSpeed = 0.002;
    const bobAmount = 0.3;

    const bobOffset = Math.sin(this.idleTime * bobSpeed) * bobAmount;
    this.barrel.y = bobOffset;
  }

  // Machine Gun: Scans left and right slowly
  private idleAnimationMachineGun(deltaTime: number): void {
    const scanSpeed = 0.0005; // Slow scanning
    const maxScanAngle = 0.3; // About 17 degrees each way

    this.idleScanAngle += scanSpeed * deltaTime * this.idleScanDirection;

    // Reverse direction at limits
    if (this.idleScanAngle > maxScanAngle) {
      this.idleScanDirection = -1;
    } else if (this.idleScanAngle < -maxScanAngle) {
      this.idleScanDirection = 1;
    }

    // Apply scan rotation to barrel
    this.barrel.rotation = this.currentRotation + this.idleScanAngle;
  }

  // Sniper: Subtle breathing motion (up and down)
  private idleAnimationSniper(_deltaTime: number): void {
    const breathSpeed = 0.002;
    const breathAmount = 0.5; // pixels

    const breathOffset = Math.sin(this.idleTime * breathSpeed) * breathAmount;
    this.barrel.y = breathOffset;
  }

  // Shotgun: Occasional pump/check animation
  private idleAnimationShotgun(_deltaTime: number): void {
    // Every 5 seconds, do a quick check animation
    const checkInterval = 5000;
    const checkDuration = 300;

    const timeMod = this.idleTime % checkInterval;

    if (timeMod < checkDuration) {
      // Quick tilt animation
      const progress = timeMod / checkDuration;
      const tiltAmount = Math.sin(progress * Math.PI) * 0.1;
      this.barrel.rotation = this.currentRotation + tiltAmount;
    } else {
      this.barrel.rotation = this.currentRotation;
    }
  }

  // Flame: Subtle flickering/pilot light effect
  private idleAnimationFlame(_deltaTime: number): void {
    // Small random movements to simulate pilot light
    const flickerAmount = 0.3;

    const flicker = (Math.random() - 0.5) * flickerAmount;
    this.barrel.x = flicker;
    this.barrel.y = flicker * 0.5;
  }

  // Tesla: Capacitor charging glow (handled in visual, but add subtle rotation)
  private idleAnimationTesla(deltaTime: number): void {
    // Slow rotation back and forth
    const rotateSpeed = 0.0003;
    const maxRotation = 0.2;

    this.idleScanAngle += rotateSpeed * deltaTime * this.idleScanDirection;

    if (this.idleScanAngle > maxRotation) {
      this.idleScanDirection = -1;
    } else if (this.idleScanAngle < -maxRotation) {
      this.idleScanDirection = 1;
    }

    this.barrel.rotation = this.currentRotation + this.idleScanAngle;
  }

  // Sludge: Bubbling/dripping animation
  private idleAnimationSludge(_deltaTime: number): void {
    // Subtle drip animation
    const dripSpeed = 0.003;
    const dripAmount = 0.5;

    const dripOffset = Math.sin(this.idleTime * dripSpeed) * dripAmount;
    this.barrel.y = dripOffset;

    // Add slight wobble to simulate liquid sloshing
    const wobbleAmount = 0.05;
    const wobble = Math.sin(this.idleTime * dripSpeed * 1.5) * wobbleAmount;
    this.barrel.rotation = this.currentRotation + wobble;
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
    this.lastShootTime = performance.now(); // Track for idle animation

    // Reset idle animation state
    this.idleScanAngle = 0;
    this.barrel.x = 0;
    this.barrel.y = 0;

    // Add heat to machine gun barrel
    if (this.barrelHeatGlow) {
      this.barrelHeatGlow.addHeat();
    }

    // Shooting logic is handled by showShootingEffect()
  }

  // Show shooting visual effects
  public showShootingEffect(): void {
    this.renderer.renderShootingEffect(this.barrel, this.type, this.upgradeLevel);
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
    this.fireRate = towerManager.calculateTowerFireRate(this.type, this.upgradeLevel);

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

      // Register as persistent effect for immediate cleanup
      ResourceCleanupManager.registerPersistentEffect(damageFlash, {
        type: 'tower_damage_flash',
        duration: 100,
      });

      // Remove flash after a short delay (tracked to prevent memory leaks)
      const timeout = EffectCleanupManager.registerTimeout(
        setTimeout(() => {
          EffectCleanupManager.clearTimeout(timeout);
          ResourceCleanupManager.unregisterPersistentEffect(damageFlash);
          if (damageFlash && !damageFlash.destroyed) {
            this.removeChild(damageFlash);
            damageFlash.destroy();
          }
        }, 100)
      );

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
    this.renderer.render(this.visual, this.barrel, this.type, this.upgradeLevel);
  }

  // Rotate tower to face target
  public rotateTowards(targetX: number, targetY: number): void {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    // Guns now point down (positive Y), so subtract 90 degrees instead of adding
    const angle = Math.atan2(dy, dx) - Math.PI / 2;

    this.currentRotation = angle;
    this.barrel.rotation = angle;

    // Reset idle animation offsets when actively targeting
    this.idleScanAngle = 0;
    this.barrel.x = 0;
    this.barrel.y = 0;
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
      case GameConfig.TOWER_TYPES.GRENADE:
        return 'grenade';
      case GameConfig.TOWER_TYPES.SLUDGE:
        return 'sludge';
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
    this.selectionHighlight = highlight;

    // Pulsing animation effect
    let scale = 1;
    let growing = true;
    const pulse = () => {
      // Check if highlight still exists before animating
      if (!highlight || highlight.destroyed) {
        if (this.pulseInterval) {
          clearInterval(this.pulseInterval);
          delete this.pulseInterval;
        }
        return;
      }

      if (growing) {
        scale += 0.05;
        if (scale >= 1.2) {
          growing = false;
        }
      } else {
        scale -= 0.05;
        if (scale <= 1) {
          growing = true;
        }
      }
      highlight.scale.set(scale);
    };

    // Store interval ID to clear later (tracked to prevent memory leaks)
    this.pulseInterval = EffectCleanupManager.registerInterval(setInterval(pulse, 50));
  }

  // Hide selection visual effects
  public hideSelectionEffect(): void {
    // Clear pulse animation first (tracked to prevent memory leaks)
    if (this.pulseInterval) {
      EffectCleanupManager.clearInterval(this.pulseInterval);
      delete this.pulseInterval;
    }

    // Remove highlight if it exists
    if (this.selectionHighlight) {
      const highlight = this.selectionHighlight;
      if (highlight && !highlight.destroyed && highlight.parent) {
        this.removeChild(highlight);
        highlight.destroy();
      }
      delete this.selectionHighlight;
    }
  }

  /**
   * Set the effect manager container for spawning effects
   */
  public setEffectManager(container: Container): void {
    this.effectManager = container;
  }

  /**
   * Spawn a shell casing effect (Machine Gun)
   */
  private spawnShellCasing(): void {
    if (!this.effectManager) {
      return;
    }

    // Calculate ejection position (right side of gun)
    const ejectX = this.x + Math.cos(this.barrel.rotation + Math.PI / 2) * 5;
    const ejectY = this.y + Math.sin(this.barrel.rotation + Math.PI / 2) * 5;

    // Calculate ejection angle (perpendicular to barrel, slightly upward)
    const ejectAngle = this.barrel.rotation + Math.PI / 2 - 0.3;

    // Spawn shell casing through EffectManager
    this.effectManager.spawnShellCasing(ejectX, ejectY, ejectAngle);
  }

  /**
   * Spawn a muzzle flash light effect (Machine Gun)
   */
  private spawnMuzzleFlashLight(gunTipOffset: number): void {
    if (!this.effectManager) {
      return;
    }

    // Calculate world position of gun tip
    const tipX = this.x + Math.cos(this.barrel.rotation) * gunTipOffset;
    const tipY = this.y + Math.sin(this.barrel.rotation) * gunTipOffset;

    // Spawn muzzle flash through EffectManager
    this.effectManager.spawnMuzzleFlashLight(tipX, tipY, 30);
  }

  /**
   * Spawn a scope glint effect (Sniper)
   */
  private spawnScopeGlint(): void {
    if (!this.effectManager) {
      return;
    }

    const scopeX = this.x;
    const scopeY = this.y - 15;

    // Spawn scope glint through EffectManager
    this.effectManager.spawnScopeGlint(scopeX, scopeY);
  }

  /**
   * Spawn bullet trail and impact flash (Sniper)
   */
  public spawnSniperHitEffects(
    targetX: number,
    targetY: number,
    isHeadshot: boolean = false
  ): void {
    if (!this.effectManager) {
      return;
    }

    const rifleLength = 12 + this.upgradeLevel * 2;
    const rifleTip = -12 + rifleLength;
    const startX = this.x + Math.cos(this.barrel.rotation) * rifleTip;
    const startY = this.y + Math.sin(this.barrel.rotation) * rifleTip;

    // Spawn bullet trail and impact flash through EffectManager
    this.effectManager.spawnBulletTrail(startX, startY, targetX, targetY);
    this.effectManager.spawnImpactFlash(targetX, targetY, isHeadshot);
  }

  /**
   * Enable/disable laser sight (Sniper, level 3+)
   */
  public setLaserSightEnabled(enabled: boolean): void {
    if (this.type !== GameConfig.TOWER_TYPES.SNIPER || this.upgradeLevel < 3) {
      return;
    }

    if (enabled && !this.laserSight && this.currentTarget) {
      import('../renderers/effects/LaserSight')
        .then(({ LaserSight }) => {
          if (!this.effectManager || !this.currentTarget) {
            return;
          }

          const rifleLength = 12 + this.upgradeLevel * 2;
          const rifleTip = -12 + rifleLength;
          const startX = this.x + Math.cos(this.barrel.rotation) * rifleTip;
          const startY = this.y + Math.sin(this.barrel.rotation) * rifleTip;

          this.laserSight = new LaserSight(
            startX,
            startY,
            this.currentTarget.x,
            this.currentTarget.y
          );
          this.effectManager.addChild(this.laserSight);
        })
        .catch(() => {
          // Silently fail
        });
    } else if (!enabled && this.laserSight) {
      if (this.effectManager && this.laserSight.parent) {
        this.effectManager.removeChild(this.laserSight);
      }
      this.laserSight.destroy();
      this.laserSight = null;
    }
  }

  /**
   * Update target for laser sight
   */
  public setTarget(targetX: number, targetY: number): void {
    this.currentTarget = { x: targetX, y: targetY };

    if (this.laserSight && this.type === GameConfig.TOWER_TYPES.SNIPER) {
      const rifleLength = 12 + this.upgradeLevel * 2;
      const rifleTip = -12 + rifleLength;
      const startX = this.x + Math.cos(this.barrel.rotation) * rifleTip;
      const startY = this.y + Math.sin(this.barrel.rotation) * rifleTip;

      this.laserSight.updatePosition(startX, startY, targetX, targetY);
    }
  }

  /**
   * Clean up effects when tower is destroyed
   */
  public override destroy(): void {
    // CRITICAL: Clear pulse interval to prevent memory leak
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      delete this.pulseInterval;
    }

    // Clean up barrel heat glow
    if (this.barrelHeatGlow) {
      this.barrelHeatGlow.destroy();
      this.barrelHeatGlow = null;
    }

    // Clean up laser sight
    if (this.laserSight) {
      if (this.laserSight.parent) {
        this.laserSight.parent.removeChild(this.laserSight);
      }
      this.laserSight.destroy();
      this.laserSight = null;
    }

    // Clean up renderer
    try {
      this.renderer.destroy();
    } catch (error) {
      console.error('Error destroying tower renderer:', error);
    }

    // Note: Shell casings and muzzle flashes are managed by EffectManager
    // and will be cleaned up automatically

    // Call parent destroy which will destroy visual and barrel Graphics
    super.destroy();
  }
}
