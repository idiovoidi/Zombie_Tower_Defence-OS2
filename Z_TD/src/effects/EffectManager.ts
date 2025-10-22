import { Container } from 'pixi.js';
import { ShellCasing } from './ShellCasing';
import { MuzzleFlashLight } from './MuzzleFlashLight';

/**
 * Effect Manager
 * Manages temporary visual effects like shell casings and muzzle flashes
 */
export class EffectManager {
  private container: Container;
  private shellCasings: ShellCasing[] = [];
  private muzzleFlashes: MuzzleFlashLight[] = [];
  private maxShellCasings: number = 50; // Limit for performance

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
  }

  /**
   * Get current effect counts (for debugging)
   */
  public getEffectCounts(): { casings: number; flashes: number } {
    return {
      casings: this.shellCasings.length,
      flashes: this.muzzleFlashes.length,
    };
  }

  /**
   * Clean up
   */
  public destroy(): void {
    this.clear();
  }
}
