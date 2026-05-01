import { Container } from 'pixi.js';
import { ShellCasing } from './ShellCasing';
import { MuzzleFlashLight } from './MuzzleFlashLight';
import { BulletTrail } from './BulletTrail';
import { ImpactFlash } from './ImpactFlash';
import { ScopeGlint } from './ScopeGlint';
import { ObjectPool } from '@utils/ObjectPool';

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
  private container: Container;
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

  constructor(container: Container) {
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
