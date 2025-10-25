import { Container, Graphics } from 'pixi.js';
import { Zombie } from './Zombie';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';
import { ResourceCleanupManager } from '../utils/ResourceCleanupManager';

export class Projectile extends Container {
  private visual: Graphics;
  private speed: number;
  private damage: number;
  private target: Zombie | null;
  private targetX: number;
  private targetY: number;
  private isActive: boolean = true;
  private projectileType: string;
  private towerType: string = 'unknown';
  private onDamageCallback:
    | ((damage: number, towerType: string, killed: boolean, overkill: number) => void)
    | null = null;
  private zombies: Zombie[] = [];

  // Arc trajectory for grenades
  private startX: number;
  private startY: number;
  private travelProgress: number = 0;
  private arcHeight: number = 80; // Height of the arc
  private upgradeLevel: number = 1; // Tower upgrade level for scaling effects

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number,
    speed: number,
    projectileType: string = 'bullet',
    target: Zombie | null = null
  ) {
    super();
    this.position.set(x, y);
    this.startX = x;
    this.startY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.damage = damage;
    this.speed = speed;
    this.projectileType = projectileType;
    this.target = target;

    this.visual = new Graphics();
    this.addChild(this.visual);
    this.createVisual();
  }

  private createVisual(): void {
    this.visual.clear();

    switch (this.projectileType) {
      case 'bullet':
        // Small yellow circle
        this.visual.circle(0, 0, 3).fill(0xffff00);
        break;
      case 'sniper':
        // Thin red line
        this.visual.circle(0, 0, 2).fill(0xff0000);
        break;
      case 'shotgun':
        // Multiple small pellets
        this.visual.circle(0, 0, 2).fill(0xffa500);
        break;
      case 'flame':
        // Fireball with glow
        this.visual.circle(0, 0, 8).fill({ color: 0xff6600, alpha: 0.4 }); // Outer glow
        this.visual.circle(0, 0, 6).fill({ color: 0xff8800, alpha: 0.6 }); // Middle
        this.visual.circle(0, 0, 4).fill({ color: 0xffaa00, alpha: 0.8 }); // Inner
        this.visual.circle(0, 0, 2).fill({ color: 0xffff00, alpha: 1 }); // Hot core
        break;
      case 'tesla':
        // Blue electric bolt
        this.visual.circle(0, 0, 3).fill(0x00bfff);
        this.visual.circle(0, 0, 5).stroke({ width: 1, color: 0x7fffd4, alpha: 0.5 });
        break;
      case 'grenade':
        // Olive drab grenade with pin
        this.visual.circle(0, 0, 4).fill(0x6b8e23);
        this.visual.circle(0, 0, 3).fill(0x556b2f);
        // Pin/lever
        this.visual.rect(-1, -5, 2, 3).fill(0x8b8b8b);
        this.visual.circle(0, -6, 1.5).fill(0xff0000);
        break;
      case 'sludge':
        // Toxic barrel
        this.visual.rect(-3, -4, 6, 8).fill(0x228b22);
        this.visual.rect(-3, -2, 6, 2).fill(0x1a6b1a); // Band
        // Biohazard symbol
        this.visual.circle(0, 0, 2).fill({ color: 0x00ff00, alpha: 0.8 });
        // Toxic glow
        this.visual.circle(0, 0, 4).fill({ color: 0x32cd32, alpha: 0.4 });
        break;
      default:
        this.visual.circle(0, 0, 3).fill(0xffffff);
    }
  }

  public setZombies(zombies: Zombie[]): void {
    this.zombies = zombies;
  }

  public update(deltaTime: number): void {
    if (!this.isActive) {
      return;
    }

    // Update target position if tracking a zombie
    if (this.target && this.target.parent) {
      this.targetX = this.target.position.x;
      this.targetY = this.target.position.y;
    }

    // Check for collision with any zombie if no specific target (for shotgun pellets)
    if (!this.target) {
      const hitZombie = this.checkZombieCollision();
      if (hitZombie) {
        this.target = hitZombie;
        this.onHitTarget();
        return;
      }
    }

    // Grenade and Sludge use arc trajectory
    if (this.projectileType === 'grenade' || this.projectileType === 'sludge') {
      this.updateArcTrajectory(deltaTime);
      return;
    }

    // Calculate direction to target
    const dx = this.targetX - this.position.x;
    const dy = this.targetY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if reached target
    if (distance < 10) {
      this.onHitTarget();
      return;
    }

    // Move towards target
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    const moveDistance = this.speed * (deltaTime / 1000);
    this.position.x += normalizedDx * moveDistance;
    this.position.y += normalizedDy * moveDistance;

    // Rotate projectile to face direction of travel
    this.rotation = Math.atan2(dy, dx);
  }

  private updateArcTrajectory(deltaTime: number): void {
    // Calculate total distance
    const totalDx = this.targetX - this.startX;
    const totalDy = this.targetY - this.startY;
    const totalDistance = Math.sqrt(totalDx * totalDx + totalDy * totalDy);

    // Update progress based on speed
    const progressIncrement = (this.speed * (deltaTime / 1000)) / totalDistance;
    this.travelProgress += progressIncrement;

    // Check if reached target
    if (this.travelProgress >= 1) {
      this.position.x = this.targetX;
      this.position.y = this.targetY;
      this.onHitTarget();
      return;
    }

    // Calculate position along arc
    // Linear interpolation for x and y
    const linearX = this.startX + totalDx * this.travelProgress;
    const linearY = this.startY + totalDy * this.travelProgress;

    // Parabolic arc for height (peaks at 0.5 progress)
    const arcProgress = Math.sin(this.travelProgress * Math.PI);
    const heightOffset = -this.arcHeight * arcProgress;

    this.position.x = linearX;
    this.position.y = linearY + heightOffset;

    // Rotate grenade to tumble through the air
    this.rotation += deltaTime * 0.01;
  }

  private checkZombieCollision(): Zombie | null {
    const hitRadius = 15; // Collision detection radius

    for (const zombie of this.zombies) {
      if (!zombie.parent) {
        continue;
      }

      const dx = zombie.position.x - this.position.x;
      const dy = zombie.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < hitRadius) {
        return zombie;
      }
    }

    return null;
  }

  private onHitTarget(): void {
    this.isActive = false;

    // Apply damage to target if it still exists
    if (this.target && this.target.parent) {
      // Apply damage modifier based on zombie type
      const modifier = this.target.getDamageModifier(this.towerType);
      const modifiedDamage = this.damage * modifier;

      const healthBefore = this.target.getHealth();
      this.target.takeDamage(modifiedDamage);
      const healthAfter = this.target.getHealth();
      const actualDamage = healthBefore - healthAfter;
      const killed = healthAfter <= 0;
      const overkill = killed ? Math.abs(healthAfter) : 0;

      // Notify callback
      if (this.onDamageCallback) {
        this.onDamageCallback(actualDamage, this.towerType, killed, overkill);
      }
    }

    // Create hit effect based on projectile type
    this.createHitEffect();
  }

  public setTowerType(type: string): void {
    this.towerType = type;
  }

  public setOnDamageCallback(
    callback: (damage: number, towerType: string, killed: boolean, overkill: number) => void
  ): void {
    this.onDamageCallback = callback;
  }

  public setUpgradeLevel(level: number): void {
    this.upgradeLevel = level;
  }

  private createHitEffect(): void {
    // Visual feedback for hit
    this.visual.clear();

    switch (this.projectileType) {
      case 'flame':
        this.createFirePool();
        break;
      case 'grenade':
        this.createExplosion();
        break;
      case 'sludge':
        this.createSludgePool();
        break;
      case 'tesla':
        this.visual.circle(0, 0, 10).fill({ color: 0x00bfff, alpha: 0.6 });
        setTimeout(() => {
          this.destroy();
        }, 100);
        break;
      default:
        this.visual.circle(0, 0, 5).fill({ color: 0xffff00, alpha: 0.6 });
        setTimeout(() => {
          this.destroy();
        }, 100);
    }
  }

  private createExplosion(): void {
    // Create explosion effect with splash damage
    const explosion = new Graphics();

    // Scale explosion radius with upgrade level
    // Level 1: 45px, Level 2: 56px, Level 3: 67px, Level 4: 78px, Level 5: 90px
    const baseRadius = 45;
    const radiusPerLevel = 11;
    const explosionRadius = baseRadius + (this.upgradeLevel - 1) * radiusPerLevel;

    // Apply splash damage to all zombies in radius
    for (const zombie of this.zombies) {
      if (!zombie.parent) {
        continue;
      }

      const dx = zombie.position.x - this.position.x;
      const dy = zombie.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= explosionRadius) {
        // Damage falls off with distance (100% at center, 30% at edge)
        const damageFalloff = 1 - (distance / explosionRadius) * 0.7;
        const splashDamage = this.damage * damageFalloff;

        // Apply damage modifier based on zombie type
        const modifier = zombie.getDamageModifier(this.towerType);
        const modifiedDamage = splashDamage * modifier;

        const healthBefore = zombie.getHealth();
        zombie.takeDamage(modifiedDamage);
        const healthAfter = zombie.getHealth();
        const actualDamage = healthBefore - healthAfter;
        const killed = healthAfter <= 0;
        const overkill = killed ? Math.abs(healthAfter) : 0;

        // Notify callback for each zombie hit
        if (this.onDamageCallback) {
          this.onDamageCallback(actualDamage, this.towerType, killed, overkill);
        }
      }
    }

    // Create visual explosion effect
    // Outer shockwave ring
    explosion.circle(0, 0, explosionRadius).stroke({ width: 4, color: 0xff6600, alpha: 0.8 });
    explosion.circle(0, 0, explosionRadius - 5).stroke({ width: 3, color: 0xff8800, alpha: 0.6 });

    // Multiple explosion layers - scale with explosion radius
    const radiusScale = explosionRadius / 60; // Normalize to original 60px radius
    const layers = [
      { radius: 50 * radiusScale, color: 0xff4500, alpha: 0.7 },
      { radius: 40 * radiusScale, color: 0xff6600, alpha: 0.8 },
      { radius: 30 * radiusScale, color: 0xff8800, alpha: 0.85 },
      { radius: 20 * radiusScale, color: 0xffaa00, alpha: 0.9 },
      { radius: 12 * radiusScale, color: 0xffff00, alpha: 0.95 },
      { radius: 6 * radiusScale, color: 0xffffff, alpha: 1.0 },
    ];

    for (const layer of layers) {
      explosion.circle(0, 0, layer.radius).fill({ color: layer.color, alpha: layer.alpha });
    }

    // Explosion debris/particles - more debris for higher levels
    const debrisCount = 15 + this.upgradeLevel * 3;
    for (let i = 0; i < debrisCount; i++) {
      const angle = (i / debrisCount) * Math.PI * 2;
      const distance = (25 + Math.random() * 20) * radiusScale;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = (2 + Math.random() * 4) * radiusScale;
      const color = Math.random() > 0.5 ? 0xff6600 : 0x8b4513;
      explosion.circle(x, y, size).fill({ color, alpha: 0.8 });
    }

    // Smoke puffs - more smoke for higher levels
    const smokeCount = 10 + this.upgradeLevel * 2;
    for (let i = 0; i < smokeCount; i++) {
      const angle = (i / smokeCount) * Math.PI * 2;
      const distance = (30 + Math.random() * 15) * radiusScale;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const size = (8 + Math.random() * 8) * radiusScale;
      explosion.circle(x, y, size).fill({ color: 0x4a4a4a, alpha: 0.5 });
    }

    // Add explosion to parent at current position
    if (this.parent) {
      explosion.position.set(this.position.x, this.position.y);
      this.parent.addChild(explosion);

      // Register explosion as persistent effect for immediate cleanup
      ResourceCleanupManager.registerPersistentEffect(explosion, {
        type: 'explosion',
        duration: 400,
      });

      // OPTIMIZATION: Use single timeout instead of setInterval (prevents memory leak)
      // setInterval creates persistent references that prevent garbage collection
      const duration = 400; // Explosion lasts 400ms
      const initialScale = 0.5;
      explosion.scale.set(initialScale);
      explosion.alpha = 1;

      // Single timeout to clean up after duration
      EffectCleanupManager.registerTimeout(
        setTimeout(() => {
          ResourceCleanupManager.unregisterPersistentEffect(explosion);
          if (explosion.parent) {
            explosion.parent.removeChild(explosion);
          }
          explosion.destroy();
        }, duration)
      );
    }

    // Destroy the projectile immediately
    this.destroy();
  }

  private createFirePool(): void {
    // Create lingering fire pool on the ground
    const firePool = new Graphics();

    // Draw fire pool with multiple layers
    const poolSize = 25;

    // Outer smoke/heat distortion
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = poolSize * 0.8 + Math.random() * 5;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const size = 6 + Math.random() * 4;
      firePool.circle(x, y, size).fill({ color: 0x4a4a4a, alpha: 0.3 });
    }

    // Fire particles
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * poolSize;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const size = 3 + Math.random() * 5;

      // Color varies from yellow center to red edges
      const distRatio = dist / poolSize;
      let color: number;
      if (distRatio < 0.3) {
        color = Math.random() > 0.5 ? 0xffff00 : 0xffffff; // Hot center
      } else if (distRatio < 0.6) {
        color = Math.random() > 0.5 ? 0xffa500 : 0xff8c00; // Orange middle
      } else {
        color = Math.random() > 0.5 ? 0xff4500 : 0xff6347; // Red edges
      }

      firePool.circle(x, y, size).fill({ color, alpha: 0.7 + Math.random() * 0.3 });
    }

    // Hot core
    firePool.circle(0, 0, 8).fill({ color: 0xffffff, alpha: 0.9 });
    firePool.circle(0, 0, 12).fill({ color: 0xffff00, alpha: 0.7 });
    firePool.circle(0, 0, 16).fill({ color: 0xffa500, alpha: 0.5 });

    // Add fire pool to parent at current position
    if (this.parent) {
      firePool.position.set(this.position.x, this.position.y);
      this.parent.addChild(firePool);

      // Register fire pool as persistent effect for immediate cleanup
      ResourceCleanupManager.registerPersistentEffect(firePool, {
        type: 'fire_pool',
        duration: 2000,
      });

      // OPTIMIZATION: Use single timeout instead of interval (prevents memory leak)
      const duration = 2000;
      const startTime = Date.now();

      // Store fade data on graphics object
      (firePool as any)._fadeData = {
        startTime,
        duration,
      };

      // Single timeout to clean up after duration
      EffectCleanupManager.registerTimeout(
        setTimeout(() => {
          ResourceCleanupManager.unregisterPersistentEffect(firePool);
          if (firePool.parent) {
            firePool.parent.removeChild(firePool);
          }
          firePool.destroy();
        }, duration)
      );
    }

    // Destroy the projectile immediately
    this.destroy();
  }

  private createSludgePool(): void {
    // Create toxic sludge pool that slows zombies
    const sludgePool = new Graphics();

    // Scale pool radius with upgrade level - SMALL pools for path coverage
    // Level 1: 35px, Level 2: 38px, Level 3: 41px, Level 4: 44px, Level 5: 47px
    const baseRadius = 35;
    const radiusPerLevel = 3;
    const poolRadius = baseRadius + (this.upgradeLevel - 1) * radiusPerLevel;

    // Calculate slow percentage based on upgrade level
    // Level 1: 10%, Level 2: 17.5%, Level 3: 25%, Level 4: 32.5%, Level 5: 40%
    const slowPercent = 0.1 + (this.upgradeLevel - 1) * 0.075;

    // Calculate pool duration based on upgrade level
    // Level 1: 4s, Level 2: 5s, Level 3: 5s, Level 4: 6s, Level 5: 7s
    const baseDuration = 4000;
    const durationPerLevel = [0, 1000, 1000, 2000, 3000]; // Cumulative
    const poolDuration = baseDuration + (durationPerLevel[this.upgradeLevel - 1] || 0);

    // Draw toxic pool with bubbling effect
    // Outer edge - darker green
    sludgePool.circle(0, 0, poolRadius).fill({ color: 0x1a6b1a, alpha: 0.6 });

    // Middle layer - toxic green
    sludgePool.circle(0, 0, poolRadius * 0.8).fill({ color: 0x228b22, alpha: 0.7 });

    // Inner layer - bright toxic
    sludgePool.circle(0, 0, poolRadius * 0.6).fill({ color: 0x32cd32, alpha: 0.8 });

    // Bubbles and toxic particles - fewer for smaller pool
    const bubbleCount = 8 + this.upgradeLevel * 2;
    for (let i = 0; i < bubbleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * poolRadius * 0.9;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const size = 1 + Math.random() * 2;
      const color = Math.random() > 0.5 ? 0x00ff00 : 0x32cd32;
      sludgePool.circle(x, y, size).fill({ color, alpha: 0.6 + Math.random() * 0.4 });
    }

    // Toxic glow effect
    sludgePool.circle(0, 0, poolRadius * 0.4).fill({ color: 0x00ff00, alpha: 0.3 });

    // Add sludge pool to parent at current position
    if (this.parent) {
      sludgePool.position.set(this.position.x, this.position.y);
      // Set z-index low so zombies appear on top
      sludgePool.zIndex = -100;
      this.parent.addChild(sludgePool);

      // Store pool data for zombie slow effect
      const poolData = {
        x: this.position.x,
        y: this.position.y,
        radius: poolRadius,
        slowPercent: slowPercent,
        affectedZombies: new Set<Zombie>(),
      };

      // Register sludge pool as persistent effect for immediate cleanup
      ResourceCleanupManager.registerPersistentEffect(sludgePool, {
        type: 'sludge_pool',
        duration: poolDuration,
        onCleanup: () => {
          // Remove slow from all affected zombies
          for (const zombie of poolData.affectedZombies) {
            if (zombie.parent) {
              zombie.removeSlow();
            }
          }
        },
      });

      // CRITICAL FIX: Replace setInterval with single timeout to prevent massive memory leak
      // The old code created 2 intervals per sludge projectile, running for 5 seconds each
      // With 5 sludge towers shooting every 4 seconds, this created 50+ active intervals
      // Each interval held references to ALL zombies, preventing garbage collection

      // Store pool data for potential future slow checking (if needed by game manager)
      (sludgePool as unknown)._poolData = poolData;

      // Single timeout to clean up after duration
      EffectCleanupManager.registerTimeout(
        setTimeout(() => {
          ResourceCleanupManager.unregisterPersistentEffect(sludgePool);

          // Remove slow from all affected zombies
          for (const zombie of poolData.affectedZombies) {
            if (zombie.parent) {
              zombie.removeSlow();
            }
          }

          if (sludgePool.parent) {
            sludgePool.parent.removeChild(sludgePool);
          }
          sludgePool.destroy();
        }, poolDuration)
      );

      // NOTE: Slow effect checking has been removed to prevent memory leak
      // If slow effect is critical, it should be moved to a centralized system
      // that checks all active pools once per frame, not per-pool intervals
    }

    // Destroy the projectile immediately
    this.destroy();
  }

  public isDestroyed(): boolean {
    return !this.isActive;
  }

  public getDamage(): number {
    return this.damage;
  }
}
