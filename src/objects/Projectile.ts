import { Container, Graphics } from 'pixi.js';
import { SludgePoolEffect } from '../renderers/effects/SludgePoolEffect';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';
import { EventBus, GameEvents } from '../utils/EventBus';
import { ResourceCleanupManager } from '../utils/ResourceCleanupManager';
import type { Zombie } from './Zombie';

export class Projectile extends Container {
  private visual: Graphics;
  private speed: number;
  private damage: number;
  private target: Zombie | null;
  private targetX: number;
  private targetY: number;
  private isActive = true;
  private projectileType: string;
  private towerType = 'unknown';
  private onDamageCallback:
    | ((damage: number, towerType: string, killed: boolean, overkill: number) => void)
    | null = null;
  private zombies: Zombie[] = [];

  // Arc trajectory for grenades
  private startX: number;
  private startY: number;
  private travelProgress = 0;
  private arcHeight = 80; // Height of the arc
  private upgradeLevel = 1; // Tower upgrade level for scaling effects
  private isHitEffectActive = false;
  private knockbackForce = 0; // Knockback force in pixels (0 = no knockback)

  constructor(
    x = 0,
    y = 0,
    targetX = 0,
    targetY = 0,
    damage = 0,
    speed = 0,
    projectileType = 'bullet',
    target: Zombie | null = null
  ) {
    super();
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

    this.init(x, y, targetX, targetY, damage, speed, projectileType, target);
  }

  public init(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number,
    speed: number,
    projectileType = 'bullet',
    target: Zombie | null = null
  ): void {
    this.position.set(x, y);
    this.startX = x;
    this.startY = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.damage = damage;
    this.speed = speed;
    this.projectileType = projectileType;
    this.target = target;
    this.isActive = true;
    this.isHitEffectActive = false;
    this.travelProgress = 0;
    this.rotation = 0;
    this.visual.alpha = 1;
    this.visual.scale.set(1);
    this.knockbackForce = 0; // Reset knockback
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
    if (this.target?.parent) {
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
    return this.findZombieInRadius(15); // 15px collision detection radius
  }

  private onHitTarget(): void {
    this.isActive = false;

    // Apply damage to target if it still exists in the scene
    if (this.target?.parent) {
      this.applyDamageToZombie(this.target, this.damage);
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

  /**
   * Set the knockback force for this projectile
   * @param force - Knockback distance in pixels (0 = no knockback)
   */
  public setKnockbackForce(force: number): void {
    this.knockbackForce = force;
  }

  /**
   * Get the current knockback force
   */
  public getKnockbackForce(): number {
    return this.knockbackForce;
  }

  /**
   * Get all active zombies within the specified radius.
   * @param radius - Search radius in pixels
   * @returns Array of zombies within radius with their distances
   */
  private getZombiesInRadius(radius: number): Array<{ zombie: Zombie; distance: number }> {
    const result: Array<{ zombie: Zombie; distance: number }> = [];
    for (const zombie of this.zombies) {
      if (!zombie.parent) {
        continue;
      }

      const dx = zombie.position.x - this.position.x;
      const dy = zombie.position.y - this.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        result.push({ zombie, distance });
      }
    }
    return result;
  }

  /**
   * Find first zombie within the specified radius of this projectile.
   * @param radius - Search radius in pixels
   * @returns First zombie found within radius, or null if none found
   */
  private findZombieInRadius(radius: number): Zombie | null {
    const zombiesInRadius = this.getZombiesInRadius(radius);
    return zombiesInRadius.length > 0 ? zombiesInRadius[0].zombie : null;
  }

  /**
   * Apply damage to a zombie and emit tracking events.
   * @param zombie - Target zombie
   * @param damageAmount - Base damage to apply
   * @param damageMultiplier - Optional multiplier (e.g., for splash damage falloff)
   */
  private applyDamageToZombie(zombie: Zombie, damageAmount: number, damageMultiplier = 1): void {
    // Guard against zombies that have been removed from the scene
    if (!zombie.parent) {
      return;
    }

    // Apply damage modifier based on zombie type
    const modifier = zombie.getDamageModifier(this.towerType);
    const modifiedDamage = damageAmount * damageMultiplier * modifier;

    const healthBefore = zombie.getHealth();

    // Apply knockback if this projectile has knockback force and zombie isn't dying
    if (this.knockbackForce > 0 && !zombie.getIsDying()) {
      zombie.applyKnockback(this.knockbackForce, this.position.x, this.position.y);
    }

    zombie.takeDamage(modifiedDamage, this.towerType);
    const healthAfter = zombie.getHealth();
    const actualDamage = healthBefore - healthAfter;
    const killed = healthAfter <= 0;
    const overkill = killed ? Math.abs(healthAfter) : 0;

    // Emit DAMAGE_DEALT event for tracking and analytics
    EventBus.getInstance().emit(GameEvents.DAMAGE_DEALT, {
      damage: actualDamage,
      towerType: this.towerType,
      killed,
      overkill,
      zombieX: zombie.position.x,
      zombieY: zombie.position.y,
      zombieId: (zombie as { id?: string }).id || 'unknown',
    });

    // Legacy callback support (deprecated, for backward compatibility)
    if (this.onDamageCallback) {
      this.onDamageCallback(actualDamage, this.towerType, killed, overkill);
    }
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
        this.isActive = false;
        this.isHitEffectActive = true;
        EffectCleanupManager.registerTimeout(
          setTimeout(() => {
            this.isHitEffectActive = false;
          }, 100)
        );
        break;
      default:
        this.visual.circle(0, 0, 5).fill({ color: 0xffff00, alpha: 0.6 });
        this.isActive = false;
        this.isHitEffectActive = true;
        EffectCleanupManager.registerTimeout(
          setTimeout(() => {
            this.isHitEffectActive = false;
          }, 100)
        );
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
    const zombiesInRadius = this.getZombiesInRadius(explosionRadius);
    for (const { zombie, distance } of zombiesInRadius) {
      // Damage falls off with distance (100% at center, 30% at edge)
      const damageFalloff = 1 - (distance / explosionRadius) * 0.7;
      this.applyDamageToZombie(zombie, this.damage, damageFalloff);
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

    // Deactivate the projectile immediately
    this.isActive = false;
  }

  private createFirePool(): void {
    // Emit event to spawn animated burning ground effect
    EventBus.getInstance().emit(GameEvents.FLAME_GROUND_HIT, {
      x: this.position.x,
      y: this.position.y,
      upgradeLevel: this.upgradeLevel,
    });

    // Deactivate the projectile immediately
    this.isActive = false;
  }

  private createSludgePool(): void {
    if (!this.parent) return;

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

    // Create the animated sludge pool effect
    const sludgePool = new SludgePoolEffect(
      this.position.x,
      this.position.y,
      poolRadius,
      this.upgradeLevel,
      poolDuration,
      slowPercent
    );

    this.parent.addChild(sludgePool);

    // Store pool data reference for external systems
    (sludgePool as unknown as Record<string, unknown>)['_poolData'] = sludgePool.getPoolData();

    // Deactivate the projectile immediately
    this.isActive = false;
  }

  public isDestroyed(): boolean {
    return !this.isActive && !this.isHitEffectActive;
  }

  public getDamage(): number {
    return this.damage;
  }
}
