import { Container } from 'pixi.js';
import { ShellCasing } from './ShellCasing';
import { MuzzleFlashLight } from './MuzzleFlashLight';
import { BulletTrail } from './BulletTrail';
import { ImpactFlash } from './ImpactFlash';
import { ScopeGlint } from './ScopeGlint';

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
  private maxShellCasings: number = 50; // Limit for performance
  private maxBulletTrails: number = 20; // Limit for performance

  constructor(container: Container) {
    this.container = container;
  }

  /**
   * Spawn a shell casing
   */
  public spawnShellCasing(x: number, y: number, ejectAngle: number = 0): void {
    // Remove oldest if at limit
    if (this.shellCasings.length >= this.maxShellCasings) {
      const oldest = this.shellCasings.shift();
      if (oldest) {
        this.container.removeChild(oldest);
        oldest.destroy();
      }
    }

    const casing = new ShellCasing(x, y, ejectAngle);
    this.shellCasings.push(casing);
    this.container.addChild(casing);
  }

  /**
   * Spawn a muzzle flash light effect
   */
  public spawnMuzzleFlashLight(x: number, y: number, radius: number = 30): void {
    const flash = new MuzzleFlashLight(x, y, radius);
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
    if (this.bulletTrails.length >= this.maxBulletTrails) {
      const oldest = this.bulletTrails.shift();
      if (oldest) {
        this.container.removeChild(oldest);
        oldest.destroy();
      }
    }

    const trail = new BulletTrail(startX, startY, endX, endY);
    this.bulletTrails.push(trail);
    this.container.addChild(trail);
  }

  /**
   * Spawn an impact flash (Sniper)
   */
  public spawnImpactFlash(x: number, y: number, isHeadshot: boolean = false): void {
    const flash = new ImpactFlash(x, y, isHeadshot);
    this.impactFlashes.push(flash);
    this.container.addChild(flash);
  }

  /**
   * Spawn a scope glint (Sniper)
   */
  public spawnScopeGlint(x: number, y: number): void {
    const glint = new ScopeGlint(x, y);
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
        casing.destroy();
        this.shellCasings.splice(i, 1);
      }
    }

    // Update muzzle flashes
    for (let i = this.muzzleFlashes.length - 1; i >= 0; i--) {
      const flash = this.muzzleFlashes[i];
      const isAlive = flash.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(flash);
        flash.destroy();
        this.muzzleFlashes.splice(i, 1);
      }
    }

    // Update bullet trails
    for (let i = this.bulletTrails.length - 1; i >= 0; i--) {
      const trail = this.bulletTrails[i];
      const isAlive = trail.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(trail);
        trail.destroy();
        this.bulletTrails.splice(i, 1);
      }
    }

    // Update impact flashes
    for (let i = this.impactFlashes.length - 1; i >= 0; i--) {
      const flash = this.impactFlashes[i];
      const isAlive = flash.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(flash);
        flash.destroy();
        this.impactFlashes.splice(i, 1);
      }
    }

    // Update scope glints
    for (let i = this.scopeGlints.length - 1; i >= 0; i--) {
      const glint = this.scopeGlints[i];
      const isAlive = glint.update(deltaTime);

      if (!isAlive) {
        this.container.removeChild(glint);
        glint.destroy();
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
      casing.destroy();
    }
    this.shellCasings = [];

    // Clear muzzle flashes
    for (const flash of this.muzzleFlashes) {
      this.container.removeChild(flash);
      flash.destroy();
    }
    this.muzzleFlashes = [];

    // Clear bullet trails
    for (const trail of this.bulletTrails) {
      this.container.removeChild(trail);
      trail.destroy();
    }
    this.bulletTrails = [];

    // Clear impact flashes
    for (const flash of this.impactFlashes) {
      this.container.removeChild(flash);
      flash.destroy();
    }
    this.impactFlashes = [];

    // Clear scope glints
    for (const glint of this.scopeGlints) {
      this.container.removeChild(glint);
      glint.destroy();
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
   * Clean up
   */
  public destroy(): void {
    this.clear();
  }
}
