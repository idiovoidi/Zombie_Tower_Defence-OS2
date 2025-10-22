import { Container, Graphics } from 'pixi.js';
import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { HealthComponent } from '../components/HealthComponent';
import { ITower } from './Tower.interface';
import { GameConfig } from '../config/gameConfig';
import { TowerRangeVisualizer } from '../utils/TowerRangeVisualizer';
import { TowerManager } from '../managers/TowerManager';
import { BarrelHeatGlow } from '../effects/BarrelHeatGlow';

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

  // Idle animation properties
  private idleTime: number = 0;
  private idleScanDirection: number = 1; // 1 for right, -1 for left
  private idleScanAngle: number = 0;
  private lastShootTime: number = 0;

  // Machine gun effects
  private barrelHeatGlow: BarrelHeatGlow | null = null;
  private effectManager: Container | null = null; // Reference to effect manager container

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
    }
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
    // Create temporary muzzle flash on the barrel
    const flash = new Graphics();

    switch (this.type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN: {
        // Gun starts at -10, extends down by gunLength (8 + upgradeLevel)
        // Gun tip is at -10 + gunLength = -2 to +3 depending on upgrade
        const mgGunLength = 8 + this.upgradeLevel;
        const mgGunTip = -10 + mgGunLength;

        // Enhanced muzzle flash - more realistic and subtle
        // Bright white core
        flash.circle(0, mgGunTip, 3).fill({ color: 0xffffff, alpha: 0.9 });
        // Yellow-orange glow
        flash.circle(0, mgGunTip, 5).fill({ color: 0xffcc00, alpha: 0.6 });
        // Outer orange fade
        flash.circle(0, mgGunTip, 7).fill({ color: 0xff9933, alpha: 0.3 });

        // Spawn shell casing effect
        this.spawnShellCasing();

        // Spawn muzzle flash light effect
        this.spawnMuzzleFlashLight(mgGunTip);
        break;
      }
      case GameConfig.TOWER_TYPES.SNIPER: {
        // Rifle starts at -12, extends down by rifleLength (12 + upgradeLevel * 2)
        // Rifle tip is at -12 + rifleLength = 0 to +10 depending on upgrade
        const sniperRifleLength = 12 + this.upgradeLevel * 2;
        const sniperRifleTip = -12 + sniperRifleLength;
        flash.circle(0, sniperRifleTip, 5).fill(0xffff00);
        flash.circle(0, sniperRifleTip, 8).fill({ color: 0xffff00, alpha: 0.3 });
        break;
      }
      case GameConfig.TOWER_TYPES.SHOTGUN: {
        // Shotgun starts at -8, extends down by 8
        // Shotgun tip is at -8 + 8 = 0
        const shotgunTip = -8 + 8;
        flash.circle(-2, shotgunTip, 5).fill(0xffff00);
        flash.circle(2, shotgunTip, 5).fill(0xffff00);
        break;
      }
      case GameConfig.TOWER_TYPES.FLAME: {
        // Flamethrower starts at -10, extends down by 6
        // Nozzle tip is at -10 + 6 = -4
        const flameTip = -10 + 6;
        // Hot core (white/yellow)
        flash.circle(0, flameTip, 4).fill({ color: 0xffffff, alpha: 0.9 });
        flash.circle(0, flameTip, 6).fill({ color: 0xffff00, alpha: 0.8 });
        // Orange middle layer
        flash.circle(0, flameTip + 2, 8).fill({ color: 0xffa500, alpha: 0.7 });
        // Red outer layer
        flash.circle(0, flameTip + 4, 10).fill({ color: 0xff4500, alpha: 0.6 });
        // Flame particles bursting out
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const dist = 8 + Math.random() * 4;
          const particleX = Math.cos(angle) * dist;
          const particleY = flameTip + Math.sin(angle) * dist;
          const particleSize = 2 + Math.random() * 3;
          const particleColor = Math.random() > 0.5 ? 0xff6347 : 0xff8c00;
          flash
            .circle(particleX, particleY, particleSize)
            .fill({ color: particleColor, alpha: 0.8 });
        }
        // Smoke puff
        flash.circle(0, flameTip + 8, 6).fill({ color: 0x4a4a4a, alpha: 0.4 });
        break;
      }
      case GameConfig.TOWER_TYPES.TESLA: {
        // Tesla gun starts at -10, extends down by 7
        // Gun tip is at -10 + 7 = -3
        const teslaTip = -10 + 7;
        // Electric discharge effect (bright cyan core)
        flash.circle(0, teslaTip, 8).fill({ color: 0x00ffff, alpha: 0.9 });
        flash.circle(0, teslaTip, 5).fill({ color: 0xffffff, alpha: 0.8 });
        // Outer glow
        flash.circle(0, teslaTip, 12).fill({ color: 0x00ffff, alpha: 0.4 });
        // Electric sparks radiating outward
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const sparkLength = 6 + Math.random() * 4;
          const endX = Math.cos(angle) * sparkLength;
          const endY = teslaTip + Math.sin(angle) * sparkLength;
          flash
            .moveTo(0, teslaTip)
            .lineTo(endX, endY)
            .stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
        }
        break;
      }
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
    const baseSize = 15 + this.upgradeLevel * 2;

    if (this.upgradeLevel <= 2) {
      // Level 1-2: Wooden barricade with sandbags
      this.visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x8b7355); // Wood base
      this.visual.stroke({ width: 2, color: 0x654321 });
      // Wood planks
      for (let i = -baseSize; i < baseSize; i += 6) {
        this.visual.moveTo(i, -5).lineTo(i, 20).stroke({ width: 1, color: 0x654321, alpha: 0.3 });
      }
      // Sandbags
      this.visual.roundRect(-12, 12, 10, 6, 2).fill(0x8b7355);
      this.visual.roundRect(2, 12, 10, 6, 2).fill(0x8b7355);
    } else if (this.upgradeLevel <= 4) {
      // Level 3-4: Reinforced position with metal plates
      this.visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x5a5a5a); // Metal base
      this.visual.stroke({ width: 2, color: 0x3a3a3a });
      // Metal panels
      this.visual.rect(-baseSize + 2, -3, baseSize - 4, 10).fill(0x4a4a4a);
      this.visual.rect(4, -3, baseSize - 4, 10).fill(0x4a4a4a);
      // Rivets
      for (let x = -baseSize + 5; x < baseSize; x += 8) {
        this.visual.circle(x, 0, 1.5).fill(0x6a6a6a);
        this.visual.circle(x, 15, 1.5).fill(0x6a6a6a);
      }
    } else {
      // Level 5: Military fortification
      this.visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x4a4a4a); // Dark metal
      this.visual.stroke({ width: 3, color: 0x2a2a2a });
      // Armored plates
      this.visual.rect(-baseSize + 2, -3, baseSize - 4, 10).fill(0x3a3a3a);
      this.visual.rect(4, -3, baseSize - 4, 10).fill(0x3a3a3a);
      // Caution stripes
      this.visual.rect(-baseSize, -5, 4, 25).fill({ color: 0xffcc00, alpha: 0.5 });
      this.visual.rect(baseSize - 4, -5, 4, 25).fill({ color: 0xffcc00, alpha: 0.5 });
      // Heavy rivets
      for (let x = -baseSize + 5; x < baseSize; x += 6) {
        this.visual.circle(x, 0, 2).fill(0x6a6a6a);
        this.visual.circle(x, 15, 2).fill(0x6a6a6a);
      }
    }

    this.addUpgradeStars();

    // Little man (rotates with barrel)
    this.barrel.clear();
    // Body - gear improves with upgrades
    let bodyColor = 0x654321; // Brown civilian
    if (this.upgradeLevel >= 3) {
      bodyColor = 0x4a4a4a;
    } // Gray tactical
    if (this.upgradeLevel >= 5) {
      bodyColor = 0x2a2a2a;
    } // Black military
    this.barrel.rect(-3, -13, 6, 8).fill(bodyColor);
    // Arms
    this.barrel.rect(-4, -11, 2, 4).fill(0xffdbac);
    this.barrel.rect(2, -11, 2, 4).fill(0xffdbac);
    // Gun - gets bigger with upgrades
    const gunLength = 8 + this.upgradeLevel;
    this.barrel.rect(-1, -10, 2, gunLength).fill(0x2f4f4f);
    this.barrel.rect(-2, -11, 4, 2).fill(0x2f4f4f);
    // Head
    this.barrel.circle(0, -18, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Headgear improves with level
    if (this.upgradeLevel <= 2) {
      // Bandana
      this.barrel.rect(-5, -21, 10, 2).fill(0x8b0000);
    } else if (this.upgradeLevel <= 4) {
      // Cap
      this.barrel.rect(-5, -21, 10, 3).fill(0x4a4a4a);
      this.barrel.rect(-3, -23, 6, 2).fill(0x4a4a4a);
    } else {
      // Military helmet
      this.barrel.circle(0, -20, 5).fill(0x2a2a2a);
      this.barrel.rect(-4, -21, 8, 2).fill(0x1a1a1a);
    }
  }

  // Sniper Tower Visual
  private createSniperVisual(): void {
    const towerHeight = 30 + this.upgradeLevel * 3;

    if (this.upgradeLevel <= 2) {
      // Level 1-2: Wooden platform/treehouse style
      this.visual.rect(-12, -10, 24, towerHeight).fill(0x8b7355); // Wood
      this.visual.stroke({ width: 2, color: 0x654321 });
      // Wood planks
      for (let y = -10; y < towerHeight - 10; y += 5) {
        this.visual.moveTo(-12, y).lineTo(12, y).stroke({ width: 1, color: 0x654321, alpha: 0.3 });
      }
      // Wooden roof
      this.visual.moveTo(-12, -10).lineTo(0, -18).lineTo(12, -10).fill(0x654321);
      // Window
      this.visual.rect(-6, -5, 12, 6).fill(0x4a4a4a);
    } else if (this.upgradeLevel <= 4) {
      // Level 3-4: Reinforced watchtower
      this.visual.rect(-12, -10, 24, towerHeight).fill(0x5a5a5a); // Metal frame
      this.visual.stroke({ width: 2, color: 0x3a3a3a });
      // Cross braces
      this.visual
        .moveTo(-10, 0)
        .lineTo(10, towerHeight - 15)
        .stroke({ width: 2, color: 0x4a4a4a });
      this.visual
        .moveTo(10, 0)
        .lineTo(-10, towerHeight - 15)
        .stroke({ width: 2, color: 0x4a4a4a });
      // Metal roof
      this.visual.moveTo(-12, -10).lineTo(0, -18).lineTo(12, -10).fill(0x4a4a4a);
      // Firing slit
      this.visual.rect(-8, -5, 16, 4).fill(0x2a2a2a);
    } else {
      // Level 5: Military observation tower
      this.visual.rect(-12, -10, 24, towerHeight).fill(0x4a4a4a); // Dark metal
      this.visual.stroke({ width: 3, color: 0x2a2a2a });
      // Armored panels
      this.visual.rect(-10, -8, 20, 10).fill(0x3a3a3a);
      this.visual.rect(-10, 8, 20, 10).fill(0x3a3a3a);
      // Rivets
      for (let y = -5; y < towerHeight - 10; y += 8) {
        this.visual.circle(-10, y, 1.5).fill(0x6a6a6a);
        this.visual.circle(10, y, 1.5).fill(0x6a6a6a);
      }
      // Armored roof
      this.visual.moveTo(-12, -10).lineTo(0, -18).lineTo(12, -10).fill(0x2a2a2a);
      // Reinforced slit
      this.visual.rect(-8, -5, 16, 4).fill(0x1a1a1a);
      this.visual.stroke({ width: 2, color: 0xffcc00 });
    }

    this.addUpgradeStars();

    // Little man with sniper rifle (rotates)
    this.barrel.clear();
    // Body - camo improves
    let bodyColor = 0x654321; // Brown
    if (this.upgradeLevel >= 3) {
      bodyColor = 0x3a4a2a;
    } // Camo green
    if (this.upgradeLevel >= 5) {
      bodyColor = 0x1a1a1a;
    } // Black ops
    this.barrel.rect(-3, -15, 6, 8).fill(bodyColor);
    // Arms
    this.barrel.rect(-4, -13, 2, 4).fill(0xffdbac);
    this.barrel.rect(2, -13, 2, 4).fill(0xffdbac);
    // Sniper rifle - gets longer
    const rifleLength = 12 + this.upgradeLevel * 2;
    this.barrel.rect(-1, -12, 2, rifleLength).fill(0x1a1a1a);
    this.barrel.circle(0, -13, 2 + this.upgradeLevel * 0.5).fill(0x1a1a1a); // Scope
    // Head
    this.barrel.circle(0, -20, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Headgear
    if (this.upgradeLevel <= 2) {
      // Boonie hat
      this.barrel.circle(0, -23, 6).fill(0x654321);
      this.barrel.rect(-6, -21, 12, 1).fill(0x654321);
    } else if (this.upgradeLevel <= 4) {
      // Tactical cap with sunglasses
      this.barrel.rect(-5, -22, 10, 3).fill(0x3a4a2a);
      this.barrel.rect(-4, -20, 8, 2).fill(0x1a1a1a); // Sunglasses
    } else {
      // Full tactical helmet with visor
      this.barrel.circle(0, -20, 5).fill(0x1a1a1a);
      this.barrel.rect(-4, -20, 8, 2).fill(0x4a4a4a); // Visor
    }
  }

  // Shotgun Tower Visual
  private createShotgunVisual(): void {
    const bunkerWidth = 36 + this.upgradeLevel * 4;

    if (this.upgradeLevel <= 2) {
      // Level 1-2: Sandbag wall
      this.visual.roundRect(-bunkerWidth / 2, -8, bunkerWidth, 28, 8).fill(0x8b7355); // Sandbags
      this.visual.stroke({ width: 2, color: 0x654321 });
      // Sandbag texture
      for (let x = -bunkerWidth / 2 + 5; x < bunkerWidth / 2; x += 8) {
        this.visual.roundRect(x, -5, 7, 10, 2).fill({ color: 0x654321, alpha: 0.3 });
        this.visual.roundRect(x, 5, 7, 10, 2).fill({ color: 0x654321, alpha: 0.3 });
      }
      // Firing gap
      this.visual.rect(-8, 0, 16, 6).fill(0x4a4a4a);
    } else if (this.upgradeLevel <= 4) {
      // Level 3-4: Reinforced bunker with metal
      this.visual.roundRect(-bunkerWidth / 2, -8, bunkerWidth, 28, 8).fill(0x5a5a5a); // Metal
      this.visual.stroke({ width: 2, color: 0x3a3a3a });
      // Metal panels
      this.visual.rect(-bunkerWidth / 2 + 4, -5, bunkerWidth / 2 - 12, 10).fill(0x4a4a4a);
      this.visual.rect(8, -5, bunkerWidth / 2 - 12, 10).fill(0x4a4a4a);
      // Sandbags on top
      for (let i = 0; i < 4; i++) {
        const x = -bunkerWidth / 2 + 10 + (i * (bunkerWidth - 20)) / 3;
        this.visual.roundRect(x, -10, 8, 6, 2).fill(0x8b7355);
      }
      // Firing slit
      this.visual.rect(-10, 0, 20, 5).fill(0x2a2a2a);
    } else {
      // Level 5: Heavy fortified bunker
      this.visual.roundRect(-bunkerWidth / 2, -8, bunkerWidth, 28, 8).fill(0x4a4a4a); // Dark metal
      this.visual.stroke({ width: 3, color: 0x2a2a2a });
      // Armored plates
      this.visual.rect(-bunkerWidth / 2 + 4, -5, bunkerWidth / 2 - 12, 12).fill(0x3a3a3a);
      this.visual.rect(8, -5, bunkerWidth / 2 - 12, 12).fill(0x3a3a3a);
      // Caution stripes
      this.visual.rect(-bunkerWidth / 2, -8, 6, 28).fill({ color: 0xffcc00, alpha: 0.4 });
      this.visual.rect(bunkerWidth / 2 - 6, -8, 6, 28).fill({ color: 0xffcc00, alpha: 0.4 });
      // Heavy rivets
      for (let x = -bunkerWidth / 2 + 8; x < bunkerWidth / 2; x += 8) {
        this.visual.circle(x, -5, 2).fill(0x6a6a6a);
        this.visual.circle(x, 15, 2).fill(0x6a6a6a);
      }
      // Reinforced firing port
      this.visual.rect(-10, 0, 20, 5).fill(0x1a1a1a);
      this.visual.stroke({ width: 2, color: 0xffcc00 });
    }

    this.addUpgradeStars();

    // Little man with shotgun (rotates)
    this.barrel.clear();
    // Body - armor improves
    let bodyColor = 0x654321; // Brown
    if (this.upgradeLevel >= 3) {
      bodyColor = 0x4a4a4a;
    } // Gray armor
    if (this.upgradeLevel >= 5) {
      bodyColor = 0x2a2a2a;
    } // Heavy armor
    this.barrel.rect(-3, -11, 6, 8).fill(bodyColor);
    // Arms
    this.barrel.rect(-4, -9, 2, 4).fill(0xffdbac);
    this.barrel.rect(2, -9, 2, 4).fill(0xffdbac);
    // Shotgun - gets wider
    const barrelWidth = 2 + this.upgradeLevel * 0.3;
    this.barrel.rect(-3, -8, barrelWidth, 8).fill(0xa0522d);
    this.barrel.rect(1, -8, barrelWidth, 8).fill(0xa0522d);
    // Head
    this.barrel.circle(0, -16, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Headgear
    if (this.upgradeLevel <= 2) {
      // Basic cap
      this.barrel.rect(-5, -19, 10, 3).fill(0x654321);
    } else if (this.upgradeLevel <= 4) {
      // Tactical helmet
      this.barrel.rect(-5, -19, 10, 3).fill(0x4a4a4a);
      this.barrel.circle(0, -18, 4).fill(0x4a4a4a);
    } else {
      // Full combat helmet with visor
      this.barrel.circle(0, -18, 5).fill(0x2a2a2a);
      this.barrel.rect(-2, -19, 4, 1).fill(0x8b8b8b);
    }
  }

  // Flame Tower Visual
  private createFlameVisual(): void {
    const towerSize = 18 + this.upgradeLevel * 2;

    if (this.upgradeLevel <= 2) {
      // Level 1-2: Makeshift barrel platform
      this.visual.circle(0, 5, towerSize).fill(0x8b4513); // Wood platform
      this.visual.stroke({ width: 2, color: 0x654321 });
      // Oil barrels
      this.visual.rect(-8, -5, 6, 12).fill(0x4a4a4a);
      this.visual.rect(2, -5, 6, 12).fill(0x4a4a4a);
      // Barrel bands
      this.visual.rect(-8, -2, 6, 2).fill(0x5a5a5a);
      this.visual.rect(2, -2, 6, 2).fill(0x5a5a5a);
      // Warning paint
      this.visual.circle(-5, 0, 3).fill({ color: 0xff4500, alpha: 0.7 });
      this.visual.circle(5, 0, 3).fill({ color: 0xff4500, alpha: 0.7 });
    } else if (this.upgradeLevel <= 4) {
      // Level 3-4: Reinforced fuel station
      this.visual.circle(0, 5, towerSize).fill(0x5a5a5a); // Metal platform
      this.visual.stroke({ width: 2, color: 0x3a3a3a });
      // Fuel tanks
      this.visual.circle(0, 0, 10).fill(0xff4500);
      this.visual.stroke({ width: 2, color: 0x8b0000 });
      // Heat vents
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * (towerSize - 5);
        const y = 5 + Math.sin(angle) * (towerSize - 5);
        this.visual.rect(x - 1.5, y, 3, 6).fill(0x8b0000);
      }
      // Caution stripes
      for (let i = 0; i < 8; i += 2) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * towerSize;
        const y = 5 + Math.sin(angle) * towerSize;
        this.visual.circle(x, y, 3).fill(0xffcc00);
      }
    } else {
      // Level 5: Military incinerator unit
      this.visual.circle(0, 5, towerSize).fill(0x4a4a4a); // Dark metal
      this.visual.stroke({ width: 3, color: 0x2a2a2a });
      // Armored fuel core
      this.visual.circle(0, 0, 12).fill(0xff4500);
      this.visual.stroke({ width: 3, color: 0x8b0000 });
      // Advanced vents
      const ventCount = 6;
      for (let i = 0; i < ventCount; i++) {
        const angle = (i / ventCount) * Math.PI * 2;
        const x = Math.cos(angle) * (towerSize - 5);
        const y = 5 + Math.sin(angle) * (towerSize - 5);
        this.visual.rect(x - 2, y, 4, 8).fill(0x8b0000);
        this.visual.stroke({ width: 1, color: 0xff4500 });
      }
      // Caution markings
      this.visual.circle(0, -10, 8).fill({ color: 0xffcc00, alpha: 0.5 });
      this.visual.circle(0, -10, 6).fill({ color: 0xff0000, alpha: 0.5 });
    }

    this.addUpgradeStars();

    // Little man with flamethrower (rotates)
    this.barrel.clear();
    // Body - protective gear improves
    let suitColor = 0x654321; // Brown clothes
    if (this.upgradeLevel >= 3) {
      suitColor = 0xff4500;
    } // Fire suit
    if (this.upgradeLevel >= 5) {
      suitColor = 0xff6347;
    } // Advanced suit
    this.barrel.rect(-3, -13, 6, 8).fill(suitColor);
    // Arms
    const armColor = this.upgradeLevel >= 3 ? 0xff4500 : 0xffdbac;
    this.barrel.rect(-4, -11, 2, 4).fill(armColor);
    this.barrel.rect(2, -11, 2, 4).fill(armColor);
    // Flamethrower - gets bigger
    const tankSize = 3 + this.upgradeLevel * 0.5;
    this.barrel.rect(-tankSize / 2, -10, tankSize, 8).fill(0xff0000);
    this.barrel.rect(-1, -11, 2, 6).fill(0x8b0000);
    // Head
    this.barrel.circle(0, -18, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Protective gear
    if (this.upgradeLevel <= 2) {
      // Bandana/goggles
      this.barrel.rect(-4, -19, 8, 2).fill(0x1a1a1a);
    } else if (this.upgradeLevel <= 4) {
      // Gas mask
      this.barrel.circle(0, -18, 4).fill(0x4a4a4a);
      this.barrel.circle(-2, -19, 1.5).fill(0x1a1a1a);
      this.barrel.circle(2, -19, 1.5).fill(0x1a1a1a);
      this.barrel.circle(0, -15, 2).fill(0x2a2a2a);
    } else {
      // Full hazmat helmet
      this.barrel.circle(0, -18, 5).fill(0xff4500);
      this.barrel.rect(-3, -19, 6, 3).fill({ color: 0x1a1a1a, alpha: 0.5 }); // Visor
    }
  }

  // Tesla Tower Visual
  private createTeslaVisual(): void {
    const towerWidth = 32 + this.upgradeLevel * 3;

    if (this.upgradeLevel <= 2) {
      // Level 1-2: Scavenged tech setup
      this.visual.rect(-towerWidth / 2, -5, towerWidth, 25).fill(0x5a5a5a); // Metal base
      this.visual.stroke({ width: 2, color: 0x3a3a3a });
      // Exposed wiring
      this.visual
        .moveTo(-towerWidth / 2 + 5, 0)
        .lineTo(towerWidth / 2 - 5, 0)
        .stroke({ width: 2, color: 0x00ced1 });
      this.visual
        .moveTo(-towerWidth / 2 + 5, 10)
        .lineTo(towerWidth / 2 - 5, 10)
        .stroke({ width: 2, color: 0x00ced1 });
      // Makeshift panels
      this.visual.rect(-12, 2, 8, 6).fill(0x4a4a4a);
      this.visual.rect(4, 2, 8, 6).fill(0x4a4a4a);
      // Basic indicators
      this.visual.circle(-8, 5, 2).fill(0x00ffff);
      this.visual.circle(8, 5, 2).fill(0x00ffff);
    } else if (this.upgradeLevel <= 4) {
      // Level 3-4: Improved tech station
      this.visual.rect(-towerWidth / 2, -5, towerWidth, 25).fill(0x00ced1); // Cyan base
      this.visual.stroke({ width: 2, color: 0x008b8b });
      // Tech panels
      this.visual.rect(-14, 0, 10, 8).fill(0x7fffd4);
      this.visual.rect(4, 0, 10, 8).fill(0x7fffd4);
      // Energy conduits
      for (let x = -towerWidth / 2 + 5; x < towerWidth / 2; x += 8) {
        this.visual.rect(x, -3, 2, 23).fill({ color: 0x00ffff, alpha: 0.3 });
      }
      // Multiple indicators
      for (let i = 0; i < 4; i++) {
        const x = -towerWidth / 2 + 10 + (i * (towerWidth - 20)) / 3;
        this.visual.circle(x, 3, 2).fill(0x00ffff);
      }
    } else {
      // Level 5: Advanced energy weapon platform
      this.visual.rect(-towerWidth / 2, -5, towerWidth, 25).fill(0x00ced1); // Cyan
      this.visual.stroke({ width: 3, color: 0x008b8b });
      // Armored tech panels
      this.visual.rect(-14, -2, 10, 10).fill(0x7fffd4);
      this.visual.rect(4, -2, 10, 10).fill(0x7fffd4);
      // Energy grid
      for (let x = -towerWidth / 2 + 4; x < towerWidth / 2; x += 6) {
        this.visual.rect(x, -4, 2, 24).fill({ color: 0x00ffff, alpha: 0.4 });
      }
      // Advanced indicators
      const indicatorCount = 6;
      for (let i = 0; i < indicatorCount; i++) {
        const x = -towerWidth / 2 + 8 + (i * (towerWidth - 16)) / (indicatorCount - 1);
        this.visual.circle(x, 3, 2.5).fill(0x00ffff);
        this.visual.circle(x, 3, 1.5).fill(0xffffff);
      }
      // Caution markings
      this.visual.rect(-towerWidth / 2, -5, 4, 25).fill({ color: 0xffcc00, alpha: 0.3 });
      this.visual.rect(towerWidth / 2 - 4, -5, 4, 25).fill({ color: 0xffcc00, alpha: 0.3 });
    }

    this.addUpgradeStars();

    // Little man with tesla gun (rotates)
    this.barrel.clear();
    // Body - tech suit improves
    let suitColor = 0x4a4a4a; // Gray
    if (this.upgradeLevel >= 3) {
      suitColor = 0x00ced1;
    } // Cyan suit
    if (this.upgradeLevel >= 5) {
      suitColor = 0x00ffff;
    } // Glowing suit
    this.barrel.rect(-3, -13, 6, 8).fill(suitColor);
    // Arms
    const armColor = this.upgradeLevel >= 3 ? 0x00ced1 : 0xffdbac;
    this.barrel.rect(-4, -11, 2, 4).fill(armColor);
    this.barrel.rect(2, -11, 2, 4).fill(armColor);
    // Tesla coil gun - gets bigger
    const coilSize = 3 + this.upgradeLevel * 0.5;
    this.barrel.circle(0, -10, coilSize).fill(0x7fffd4);
    this.barrel.rect(-2, -10, 4, 7).fill(0x00bfff);
    // Electric arcs
    for (let i = 0; i < Math.min(this.upgradeLevel, 3); i++) {
      const offset = i * 2;
      this.barrel
        .moveTo(-2, -8 + offset)
        .lineTo(2, -6 + offset)
        .stroke({ width: 1, color: 0xffffff });
    }
    // Head
    this.barrel.circle(0, -18, 5).fill(0xffdbac);
    this.barrel.stroke({ width: 1, color: 0x000000 });
    // Tech gear
    if (this.upgradeLevel <= 2) {
      // Basic goggles
      this.barrel.rect(-4, -19, 8, 2).fill(0x4a4a4a);
    } else if (this.upgradeLevel <= 4) {
      // Tech visor
      this.barrel.rect(-4, -19, 8, 3).fill(0x00ffff);
      this.barrel.rect(-4, -19, 8, 3).fill({ color: 0x00ffff, alpha: 0.5 });
    } else {
      // Full tech helmet
      this.barrel.circle(0, -18, 5).fill(0x00ced1);
      this.barrel.rect(-4, -19, 8, 3).fill({ color: 0x00ffff, alpha: 0.7 });
      this.barrel.rect(-5, -21, 2, 4).fill(0x00ced1);
      this.barrel.rect(3, -21, 2, 4).fill(0x00ced1);
    }
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
    if (this.upgradeLevel <= 1) {
      return;
    }

    const starCount = Math.min(this.upgradeLevel - 1, 5);
    const starSize = 3;
    const spacing = 8;
    const startX = (-(starCount - 1) * spacing) / 2;

    for (let i = 0; i < starCount; i++) {
      const x = startX + i * spacing;
      const y = -30;

      // Draw a simple star
      this.visual
        .moveTo(x, y - starSize)
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
      const highlight = (this as unknown).selectionHighlight;
      if (highlight && !highlight.destroyed && highlight.parent) {
        this.removeChild(highlight);
        highlight.destroy();
      }
      delete (this as unknown).selectionHighlight;
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

    // Import and spawn shell casing
    import('../effects/ShellCasing')
      .then(({ ShellCasing }) => {
        if (!this.effectManager) {
          return;
        }
        const casing = new ShellCasing(ejectX, ejectY, ejectAngle);
        this.effectManager.addChild(casing);

        // Store reference for cleanup
        if (!(this as any).shellCasings) {
          (this as any).shellCasings = [];
        }
        (this as any).shellCasings.push(casing);
      })
      .catch(() => {
        // Silently fail if import fails
      });
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

    // Import and spawn muzzle flash light
    import('../effects/MuzzleFlashLight')
      .then(({ MuzzleFlashLight }) => {
        if (!this.effectManager) {
          return;
        }
        const flash = new MuzzleFlashLight(tipX, tipY, 30);
        this.effectManager.addChild(flash);

        // Store reference for cleanup
        if (!(this as any).muzzleFlashes) {
          (this as any).muzzleFlashes = [];
        }
        (this as any).muzzleFlashes.push(flash);
      })
      .catch(() => {
        // Silently fail if import fails
      });
  }

  /**
   * Clean up effects when tower is destroyed
   */
  public override destroy(): void {
    // Clean up barrel heat glow
    if (this.barrelHeatGlow) {
      this.barrelHeatGlow.destroy();
      this.barrelHeatGlow = null;
    }

    // Clean up shell casings
    if ((this as any).shellCasings) {
      for (const casing of (this as any).shellCasings) {
        if (casing && !casing.destroyed && casing.parent) {
          casing.parent.removeChild(casing);
          casing.destroy();
        }
      }
      delete (this as any).shellCasings;
    }

    // Clean up muzzle flashes
    if ((this as any).muzzleFlashes) {
      for (const flash of (this as any).muzzleFlashes) {
        if (flash && !flash.destroyed && flash.parent) {
          flash.parent.removeChild(flash);
          flash.destroy();
        }
      }
      delete (this as unknown).muzzleFlashes;
    }

    super.destroy();
  }
}
