import { Graphics, type Container as PixiContainer } from 'pixi.js';
import type { Zombie } from '@objects/Zombie';
import { EffectCleanupManager } from '@utils/EffectCleanupManager';
import { ResourceCleanupManager } from '@utils/ResourceCleanupManager';
import { ObjectPool } from '@utils/ObjectPool';
import { BulletTrail } from './BulletTrail';
import { ImpactFlash } from './ImpactFlash';
import { MuzzleFlashLight } from './MuzzleFlashLight';
import { ScopeGlint } from './ScopeGlint';
import { ShellCasing } from './ShellCasing';

/**
 * Configuration for effect limits
 */
export interface EffectLimits {
  maxShellCasings: number;
  maxMuzzleFlashes: number;
  maxBulletTrails: number;
  maxImpactFlashes: number;
  maxScopeGlints: number;
}

/**
 * Statistics for effect manager
 */
export interface EffectStats {
  currentCounts: {
    shellCasings: number;
    muzzleFlashes: number;
    bulletTrails: number;
    impactFlashes: number;
    scopeGlints: number;
    total: number;
  };
  limits: EffectLimits;
  poolStats: {
    shellCasings: {
      active: number;
      available: number;
      created: number;
      reused: number;
      reuseRate: number;
    };
    muzzleFlashes: {
      active: number;
      available: number;
      created: number;
      reused: number;
      reuseRate: number;
    };
    bulletTrails: {
      active: number;
      available: number;
      created: number;
      reused: number;
      reuseRate: number;
    };
    impactFlashes: {
      active: number;
      available: number;
      created: number;
      reused: number;
      reuseRate: number;
    };
    scopeGlints: {
      active: number;
      available: number;
      created: number;
      reused: number;
      reuseRate: number;
    };
  };
  warnings: string[];
}

/**
 * Effect Manager
 * Manages temporary visual effects like shell casings, muzzle flashes, and sniper effects
 */
export class EffectManager {
  private container: PixiContainer;
  private shellCasings: ShellCasing[] = [];
  private muzzleFlashes: MuzzleFlashLight[] = [];
  private bulletTrails: BulletTrail[] = [];
  private impactFlashes: ImpactFlash[] = [];
  private scopeGlints: ScopeGlint[] = [];

  // Configurable limits for each effect type
  private limits: EffectLimits = {
    maxShellCasings: 50,
    maxMuzzleFlashes: 30,
    maxBulletTrails: 20,
    maxImpactFlashes: 30,
    maxScopeGlints: 10,
  };

  // Object pools for effect reuse
  private poolingEnabled: boolean = true;
  private shellCasingPool: ObjectPool<ShellCasing>;
  private muzzleFlashPool: ObjectPool<MuzzleFlashLight>;
  private bulletTrailPool: ObjectPool<BulletTrail>;
  private impactFlashPool: ObjectPool<ImpactFlash>;
  private scopeGlintPool: ObjectPool<ScopeGlint>;

  constructor(container: PixiContainer) {
    this.container = container;

    // Initialize object pools
    this.shellCasingPool = new ObjectPool(
      () => new ShellCasing(0, 0, 0),
      obj => obj.reset(0, 0, 0),
      this.limits.maxShellCasings
    );

    this.muzzleFlashPool = new ObjectPool(
      () => new MuzzleFlashLight(0, 0, 30),
      obj => obj.reset(0, 0, 30),
      this.limits.maxMuzzleFlashes
    );

    this.bulletTrailPool = new ObjectPool(
      () => new BulletTrail(0, 0, 0, 0),
      obj => obj.reset(0, 0, 0, 0),
      this.limits.maxBulletTrails
    );

    this.impactFlashPool = new ObjectPool(
      () => new ImpactFlash(0, 0, false),
      obj => obj.reset(0, 0, false),
      this.limits.maxImpactFlashes
    );

    this.scopeGlintPool = new ObjectPool(
      () => new ScopeGlint(0, 0),
      obj => obj.reset(0, 0),
      this.limits.maxScopeGlints
    );
  }

  /**
   * Get the container for adding external effects
   */
  public getContainer(): Container {
    return this.container;
  }

  /**
   * Set maximum counts for each effect type
   * @param limits Configuration object with limits for each effect type
   */
  public setLimits(limits: Partial<EffectLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  /**
   * Enable or disable object pooling
   * @param enabled Whether pooling should be enabled
   */
  public enablePooling(enabled: boolean): void {
    this.poolingEnabled = enabled;
  }

  /**
   * Spawn a shell casing
   */
  public spawnShellCasing(x: number, y: number, ejectAngle: number = 0): void {
    // Remove oldest if at limit
    if (this.shellCasings.length >= this.limits.maxShellCasings) {
      const oldest = this.shellCasings.shift();
      if (oldest) {
        this.container.removeChild(oldest);
        if (this.poolingEnabled) {
          this.shellCasingPool.release(oldest);
        } else {
          oldest.destroy();
        }
      }
    }

    // Acquire from pool or create new
    const casing = this.poolingEnabled
      ? this.shellCasingPool.acquire()
      : new ShellCasing(x, y, ejectAngle);

    // Reset position and properties if from pool
    if (this.poolingEnabled) {
      casing.reset(x, y, ejectAngle);
    }

    this.shellCasings.push(casing);
    this.container.addChild(casing);
  }

  /**
   * Spawn a muzzle flash light effect
   */
  public spawnMuzzleFlashLight(x: number, y: number, radius: number = 30): void {
    // Remove oldest if at limit
    if (this.muzzleFlashes.length >= this.limits.maxMuzzleFlashes) {
      const oldest = this.muzzleFlashes.shift();
      if (oldest) {
        this.container.removeChild(oldest);
        if (this.poolingEnabled) {
          this.muzzleFlashPool.release(oldest);
        } else {
          oldest.destroy();
        }
      }
    }

    // Acquire from pool or create new
    const flash = this.poolingEnabled
      ? this.muzzleFlashPool.acquire()
      : new MuzzleFlashLight(x, y, radius);

    // Reset position and properties if from pool
    if (this.poolingEnabled) {
      flash.reset(x, y, radius);
    }

    this.muzzleFlashes.push(flash);
    this.container.addChild(flash);

    // Add reflection to nearby shell casings
    this.addReflectionToNearbyCasings(x, y, radius);
  }

  /**
   * Add light reflection to shell casings near the flash
   */
  private addReflectionToNearbyCasings(x: number, y: number, radius: number): void {
    for (const casing of this.shellCasings) {
      const dx = casing.x - x;
      const dy = casing.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < radius) {
        casing.addReflection();
      }
    }
  }

  /**
   * Spawn a bullet trail (Sniper)
   */
  public spawnBulletTrail(startX: number, startY: number, endX: number, endY: number): void {
    // Remove oldest if at limit
    if (this.bulletTrails.length >= this.limits.maxBulletTrails) {
      const oldest = this.bulletTrails.shift();
      if (oldest) {
        this.container.removeChild(oldest);
        if (this.poolingEnabled) {
          this.bulletTrailPool.release(oldest);
        } else {
          oldest.destroy();
        }
      }
    }

    // Acquire from pool or create new
    const trail = this.poolingEnabled
      ? this.bulletTrailPool.acquire()
      : new BulletTrail(startX, startY, endX, endY);

    // Reset position and properties if from pool
    if (this.poolingEnabled) {
      trail.reset(startX, startY, endX, endY);
    }

    this.bulletTrails.push(trail);
    this.container.addChild(trail);
  }

  /**
   * Spawn an impact flash (Sniper)
   */
  public spawnImpactFlash(x: number, y: number, isHeadshot: boolean = false): void {
    // Remove oldest if at limit
    if (this.impactFlashes.length >= this.limits.maxImpactFlashes) {
      const oldest = this.impactFlashes.shift();
      if (oldest) {
        this.container.removeChild(oldest);
        if (this.poolingEnabled) {
          this.impactFlashPool.release(oldest);
        } else {
          oldest.destroy();
        }
      }
    }

    // Acquire from pool or create new
    const flash = this.poolingEnabled
      ? this.impactFlashPool.acquire()
      : new ImpactFlash(x, y, isHeadshot);

    // Reset position and properties if from pool
    if (this.poolingEnabled) {
      flash.reset(x, y, isHeadshot);
    }

    this.impactFlashes.push(flash);
    this.container.addChild(flash);
  }

  /**
   * Spawn a scope glint (Sniper)
   */
  public spawnScopeGlint(x: number, y: number): void {
    // Remove oldest if at limit
    if (this.scopeGlints.length >= this.limits.maxScopeGlints) {
      const oldest = this.scopeGlints.shift();
      if (oldest) {
        this.container.removeChild(oldest);
        if (this.poolingEnabled) {
          this.scopeGlintPool.release(oldest);
        } else {
          oldest.destroy();
        }
      }
    }

    // Acquire from pool or create new
    const glint = this.poolingEnabled ? this.scopeGlintPool.acquire() : new ScopeGlint(x, y);

    // Reset position and properties if from pool
    if (this.poolingEnabled) {
      glint.reset(x, y);
    }

    this.scopeGlints.push(glint);
    this.container.addChild(glint);
  }

  /**
   * Spawn a lightning arc (Tesla tower)
   */
  public spawnLightningArc(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    isPrimary: boolean = true
  ): void {
    const lightningGraphics = new Graphics();
    this.drawLightningBolt(lightningGraphics, startX, startY, endX, endY, isPrimary);
    this.container.addChild(lightningGraphics);

    // Register lightning as persistent effect for immediate cleanup
    ResourceCleanupManager.registerPersistentEffect(lightningGraphics, {
      type: 'tesla_lightning',
      duration: 150,
    });

    // Remove lightning after short duration (tracked to prevent memory leaks)
    const timeout = EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        EffectCleanupManager.clearTimeout(timeout);
        ResourceCleanupManager.unregisterPersistentEffect(lightningGraphics);
        if (lightningGraphics.parent) {
          lightningGraphics.parent.removeChild(lightningGraphics);
        }
        lightningGraphics.destroy();
      }, 150)
    );
  }

  /**
   * Draw a lightning bolt between two points
   */
  private drawLightningBolt(
    graphics: Graphics,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    isPrimary: boolean
  ): void {
    // Calculate segments for the arc
    const segments = 8;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;

      // Add random offset perpendicular to the line (except for start and end)
      if (i > 0 && i < segments) {
        const perpX = -(endY - startY);
        const perpY = endX - startX;
        const length = Math.sqrt(perpX * perpX + perpY * perpY);
        const normalizedPerpX = perpX / length;
        const normalizedPerpY = perpY / length;

        const offset = (Math.random() - 0.5) * (isPrimary ? 20 : 15); // Smaller offset for chain arcs
        points.push({
          x: x + normalizedPerpX * offset,
          y: y + normalizedPerpY * offset,
        });
      } else {
        points.push({ x, y });
      }
    }

    // Draw main lightning bolt (bright cyan for primary, dimmer for chains)
    const mainColor = isPrimary ? 0x00ffff : 0x00ccff;
    const mainWidth = isPrimary ? 3 : 2;
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.stroke({ width: mainWidth, color: mainColor });

    // Draw glow effect (wider, semi-transparent)
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.stroke({ width: mainWidth * 2, color: mainColor, alpha: 0.5 });

    // Draw outer glow (even wider, more transparent)
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.stroke({ width: mainWidth * 3, color: 0xffffff, alpha: 0.3 });

    // Add bright flash at start and end points
    const flashSize = isPrimary ? 8 : 6;
    graphics.circle(startX, startY, flashSize).fill({ color: 0xffffff, alpha: 0.8 });
    graphics.circle(startX, startY, flashSize * 1.5).fill({ color: 0x00ffff, alpha: 0.5 });
    graphics.circle(endX, endY, flashSize).fill({ color: 0xffffff, alpha: 0.8 });
    graphics.circle(endX, endY, flashSize * 1.5).fill({ color: 0x00ffff, alpha: 0.5 });

    // Add branching arcs (smaller side bolts) - only for primary arc
    if (isPrimary) {
      for (let i = 2; i < points.length - 2; i += 2) {
        if (Math.random() > 0.5) {
          const branchLength = 15 + Math.random() * 20;
          const angle = Math.random() * Math.PI * 2;
          const branchEndX = points[i].x + Math.cos(angle) * branchLength;
          const branchEndY = points[i].y + Math.sin(angle) * branchLength;

          graphics.moveTo(points[i].x, points[i].y);
          graphics.lineTo(branchEndX, branchEndY);
          graphics.stroke({ width: 2, color: mainColor, alpha: 0.7 });
        }
      }
    }
  }

  /**
   * Spawn a flame stream (Flame tower)
   */
  public spawnFlameStream(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): void {
    const flameGraphics = new Graphics();
    this.container.addChild(flameGraphics);

    // Calculate distance and angle
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Create smooth cone-shaped flame stream
    const segments = 12;
    const maxWidth = 25; // Maximum width of flame cone

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const baseX = startX + dx * t;
      const baseY = startY + dy * t;

      // Cone width increases with distance
      const coneWidth = t * maxWidth;

      // Create multiple particles at this segment for density
      const particlesPerSegment = 3 + Math.floor(t * 4);

      for (let j = 0; j < particlesPerSegment; j++) {
        // Random position within cone width
        const perpX = -dy / distance;
        const perpY = dx / distance;
        const offset = (Math.random() - 0.5) * coneWidth;

        const x = baseX + perpX * offset;
        const y = baseY + perpY * offset;

        // Particle size increases then decreases
        const sizeProgress = Math.sin(t * Math.PI); // 0 to 1 to 0
        const size = 4 + sizeProgress * 8 + Math.random() * 3;

        // Smooth color gradient from white-hot to red
        let color: number;
        let alpha: number;

        if (t < 0.2) {
          color = 0xffffff;
          alpha = 0.95;
        } else if (t < 0.4) {
          color = 0xffff00;
          alpha = 0.9;
        } else if (t < 0.6) {
          color = 0xffa500;
          alpha = 0.85;
        } else if (t < 0.8) {
          color = 0xff8c00;
          alpha = 0.75;
        } else {
          color = 0xff4500;
          alpha = 0.65;
        }

        flameGraphics.circle(x, y, size * 1.8).fill({ color: 0xff6600, alpha: alpha * 0.25 });
        flameGraphics.circle(x, y, size * 1.3).fill({ color: 0xff8800, alpha: alpha * 0.4 });
        flameGraphics.circle(x, y, size).fill({ color, alpha });
      }
    }

    // Add wispy smoke at the end
    for (let i = 0; i < 8; i++) {
      const smokeT = 0.85 + i * 0.02;
      const smokeX = startX + dx * smokeT + (Math.random() - 0.5) * 30;
      const smokeY = startY + dy * smokeT + (Math.random() - 0.5) * 30;
      const smokeSize = 8 + Math.random() * 8;
      flameGraphics
        .circle(smokeX, smokeY, smokeSize)
        .fill({ color: 0x3a3a3a, alpha: 0.3 + Math.random() * 0.2 });
    }

    // Bright nozzle flash
    flameGraphics.circle(startX, startY, 8).fill({ color: 0xffffff, alpha: 0.95 });
    flameGraphics.circle(startX, startY, 12).fill({ color: 0xffff00, alpha: 0.6 });
    flameGraphics.circle(startX, startY, 16).fill({ color: 0xffa500, alpha: 0.3 });

    ResourceCleanupManager.registerPersistentEffect(flameGraphics, {
      type: 'flame_stream',
      duration: 120,
    });

    const timeout = EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        EffectCleanupManager.clearTimeout(timeout);
        ResourceCleanupManager.unregisterPersistentEffect(flameGraphics);
        if (flameGraphics.parent) {
          flameGraphics.parent.removeChild(flameGraphics);
        }
        flameGraphics.destroy();
      }, 120)
    );
  }

  /**
   * Spawn electric particle effects on a zombie
   */
  public spawnElectricParticles(zombie: Zombie, isPrimary: boolean): void {
    if (!zombie.parent) {
      return;
    }

    const particleContainer = new Graphics();
    zombie.addChild(particleContainer);

    ResourceCleanupManager.registerPersistentEffect(particleContainer, {
      type: 'tesla_particles',
      duration: isPrimary ? 250 : 180,
    });

    const particleCount = isPrimary ? 12 : 8;
    const particleSize = isPrimary ? 3 : 2;
    const spreadRadius = isPrimary ? 20 : 15;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = Math.random() * spreadRadius;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particleContainer.circle(x, y, particleSize).fill({ color: 0x00ffff, alpha: 0.9 });
      particleContainer.circle(x, y, particleSize * 2).fill({ color: 0xffffff, alpha: 0.5 });
    }

    const ringRadius = isPrimary ? 18 : 14;
    particleContainer.circle(0, 0, ringRadius).stroke({ width: 2, color: 0x00ffff, alpha: 0.8 });
    particleContainer
      .circle(0, 0, ringRadius + 3)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.4 });

    const arcCount = isPrimary ? 6 : 4;
    for (let i = 0; i < arcCount; i++) {
      const angle = (i / arcCount) * Math.PI * 2 + Math.random() * 0.5;
      const length = 10 + Math.random() * 15;
      const startX = Math.cos(angle) * 8;
      const startY = Math.sin(angle) * 8;
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;

      const segments = 3;
      particleContainer.moveTo(startX, startY);
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const midX = startX + (endX - startX) * t;
        const midY = startY + (endY - startY) * t;
        const offset = (Math.random() - 0.5) * 8;
        const perpX = -(endY - startY);
        const perpY = endX - startX;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        const normalizedPerpX = perpX / perpLength;
        const normalizedPerpY = perpY / perpLength;

        particleContainer.lineTo(midX + normalizedPerpX * offset, midY + normalizedPerpY * offset);
      }
      particleContainer.stroke({ width: 1.5, color: 0x00ffff, alpha: 0.8 });
    }

    // Tint zombie
    if (zombie['visual']) {
      const visual = zombie['visual'] as Graphics;
      const originalTint = visual.tint;
      visual.tint = 0x00ffff;

      const tintDuration = isPrimary ? 300 : 200;
      EffectCleanupManager.registerTimeout(
        setTimeout(() => {
          if (visual && !visual.destroyed) {
            visual.tint = originalTint;
          }
        }, tintDuration)
      );
    }

    const duration = isPrimary ? 250 : 180;
    EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        ResourceCleanupManager.unregisterPersistentEffect(particleContainer);
        if (particleContainer.parent) {
          particleContainer.parent.removeChild(particleContainer);
        }
        particleContainer.destroy();
      }, duration)
    );
  }

  /**
   * Spawn a damage flash on a target container
   */
  public spawnDamageFlash(target: PixiContainer, radius: number = 30): void {
    const damageFlash = new Graphics();
    damageFlash.circle(0, 0, radius).fill({ color: 0xff0000, alpha: 0.5 });
    target.addChild(damageFlash);

    ResourceCleanupManager.registerPersistentEffect(damageFlash, {
      type: 'damage_flash',
      duration: 100,
    });

    const timeout = EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        EffectCleanupManager.clearTimeout(timeout);
        ResourceCleanupManager.unregisterPersistentEffect(damageFlash);
        if (damageFlash && !damageFlash.destroyed) {
          if (damageFlash.parent) {
            damageFlash.parent.removeChild(damageFlash);
          }
          damageFlash.destroy();
        }
      }, 100)
    );
  }

  /**
   * Update all effects
   */
  public update(deltaTime: number): void {
    // Update shell casings
    for (let i = this.shellCasings.length - 1; i >= 0; i--) {
      const casing = this.shellCasings[i];
      const isAlive = casing.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(casing);
        if (this.poolingEnabled) {
          this.shellCasingPool.release(casing);
        } else {
          casing.destroy();
        }
        this.shellCasings.splice(i, 1);
      }
    }

    // Update muzzle flashes
    for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
      const flash = this.muzzleFlashes[i];
      const isAlive = flash.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(flash);
        if (this.poolingEnabled) {
          this.muzzleFlashPool.release(flash);
        } else {
          flash.destroy();
        }
        this.muzzleFlashes.splice(i, 1);
      }
    }

    // Update bullet trails
    for (let i = this.bulletTrails.length - 1; i >= 0; i--) {
      const trail = this.bulletTrails[i];
      const isAlive = trail.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(trail);
        if (this.poolingEnabled) {
          this.bulletTrailPool.release(trail);
        } else {
          trail.destroy();
        }
        this.bulletTrails.splice(i, 1);
      }
    }

    // Update impact flashes
    for (let i = this.impactFlashes.length - 1; i >= 0; i--) {
      const flash = this.impactFlashes[i];
      const isAlive = flash.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(flash);
        if (this.poolingEnabled) {
          this.impactFlashPool.release(flash);
        } else {
          flash.destroy();
        }
        this.impactFlashes.splice(i, 1);
      }
    }

    // Update scope glints
    for (let i = this.scopeGlints.length - 1; i >= 0; i--) {
      const glint = this.scopeGlints[i];
      const isAlive = glint.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(glint);
        if (this.poolingEnabled) {
          this.scopeGlintPool.release(glint);
        } else {
          glint.destroy();
        }
        this.scopeGlints.splice(i, 1);
      }
    }
  }

  /**
   * Clear all effects
   */
  public clear(): void {
    // Clear shell casings
    for (const casing of this.shellCasings) {
      this.container.removeChild(casing);
      if (this.poolingEnabled) {
        this.shellCasingPool.release(casing);
      } else {
        casing.destroy();
      }
    }
    this.shellCasings = [];

    // Clear muzzle flashes
    for (const flash of this.muzzleFlashes) {
      this.container.removeChild(flash);
      if (this.poolingEnabled) {
        this.muzzleFlashPool.release(flash);
      } else {
        flash.destroy();
      }
    }
    this.muzzleFlashes = [];

    // Clear bullet trails
    for (const trail of this.bulletTrails) {
      this.container.removeChild(trail);
      if (this.poolingEnabled) {
        this.bulletTrailPool.release(trail);
      } else {
        trail.destroy();
      }
    }
    this.bulletTrails = [];

    // Clear impact flashes
    for (const flash of this.impactFlashes) {
      this.container.removeChild(flash);
      if (this.poolingEnabled) {
        this.impactFlashPool.release(flash);
      } else {
        flash.destroy();
      }
    }
    this.impactFlashes = [];

    // Clear scope glints
    for (const glint of this.scopeGlints) {
      this.container.removeChild(glint);
      if (this.poolingEnabled) {
        this.scopeGlintPool.release(glint);
      } else {
        glint.destroy();
      }
    }
    this.scopeGlints = [];
  }

  /**
   * Get current effect counts (for debugging)
   */
  public getEffectCounts(): {
    casings: number;
    flashes: number;
    trails: number;
    impacts: number;
    glints: number;
  } {
    return {
      casings: this.shellCasings.length,
      flashes: this.muzzleFlashes.length,
      trails: this.bulletTrails.length,
      impacts: this.impactFlashes.length,
      glints: this.scopeGlints.length,
    };
  }

  /**
   * Get comprehensive effect statistics including pool usage
   * @returns Statistics about current effect counts, limits, and pool reuse rates
   */
  public getStats(): EffectStats {
    const warnings: string[] = [];

    // Get current counts
    const currentCounts = {
      shellCasings: this.shellCasings.length,
      muzzleFlashes: this.muzzleFlashes.length,
      bulletTrails: this.bulletTrails.length,
      impactFlashes: this.impactFlashes.length,
      scopeGlints: this.scopeGlints.length,
      total:
        this.shellCasings.length +
        this.muzzleFlashes.length +
        this.bulletTrails.length +
        this.impactFlashes.length +
        this.scopeGlints.length,
    };

    // Check for high effect counts and generate warnings
    if (currentCounts.shellCasings > this.limits.maxShellCasings * 0.8) {
      warnings.push(
        `High shell casing count: ${currentCounts.shellCasings}/${this.limits.maxShellCasings}`
      );
    }
    if (currentCounts.muzzleFlashes > this.limits.maxMuzzleFlashes * 0.8) {
      warnings.push(
        `High muzzle flash count: ${currentCounts.muzzleFlashes}/${this.limits.maxMuzzleFlashes}`
      );
    }
    if (currentCounts.bulletTrails > this.limits.maxBulletTrails * 0.8) {
      warnings.push(
        `High bullet trail count: ${currentCounts.bulletTrails}/${this.limits.maxBulletTrails}`
      );
    }
    if (currentCounts.impactFlashes > this.limits.maxImpactFlashes * 0.8) {
      warnings.push(
        `High impact flash count: ${currentCounts.impactFlashes}/${this.limits.maxImpactFlashes}`
      );
    }
    if (currentCounts.scopeGlints > this.limits.maxScopeGlints * 0.8) {
      warnings.push(
        `High scope glint count: ${currentCounts.scopeGlints}/${this.limits.maxScopeGlints}`
      );
    }
    if (currentCounts.total > 100) {
      warnings.push(`High total effect count: ${currentCounts.total}`);
    }

    // Get pool statistics
    const shellCasingPoolStats = this.shellCasingPool.getStats();
    const muzzleFlashPoolStats = this.muzzleFlashPool.getStats();
    const bulletTrailPoolStats = this.bulletTrailPool.getStats();
    const impactFlashPoolStats = this.impactFlashPool.getStats();
    const scopeGlintPoolStats = this.scopeGlintPool.getStats();

    // Calculate reuse rates
    const calculateReuseRate = (stats: { created: number; reused: number }): number => {
      const total = stats.created + stats.reused;
      return total > 0 ? (stats.reused / total) * 100 : 0;
    };

    return {
      currentCounts,
      limits: this.limits,
      poolStats: {
        shellCasings: {
          ...shellCasingPoolStats,
          reuseRate: calculateReuseRate(shellCasingPoolStats),
        },
        muzzleFlashes: {
          ...muzzleFlashPoolStats,
          reuseRate: calculateReuseRate(muzzleFlashPoolStats),
        },
        bulletTrails: {
          ...bulletTrailPoolStats,
          reuseRate: calculateReuseRate(bulletTrailPoolStats),
        },
        impactFlashes: {
          ...impactFlashPoolStats,
          reuseRate: calculateReuseRate(impactFlashPoolStats),
        },
        scopeGlints: {
          ...scopeGlintPoolStats,
          reuseRate: calculateReuseRate(scopeGlintPoolStats),
        },
      },
      warnings,
    };
  }

  /**
   * Log warnings if effect counts are high
   * Should be called periodically (e.g., once per second) to avoid spam
   */
  public checkAndLogWarnings(): void {
    const stats = this.getStats();

    if (stats.warnings.length > 0) {
      console.warn('⚠️ EffectManager warnings:');
      for (const warning of stats.warnings) {
        console.warn(`  - ${warning}`);
      }
    }
  }

  /**
   * Clean up
   */
  public destroy(): void {
    this.clear();

    // Clear pools
    if (this.poolingEnabled) {
      this.shellCasingPool.clear();
      this.muzzleFlashPool.clear();
      this.bulletTrailPool.clear();
      this.impactFlashPool.clear();
      this.scopeGlintPool.clear();
    }
  }
}
