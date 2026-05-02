import { Graphics } from 'pixi.js';

/**
 * Base class for lifetime-based visual effects.
 * Handles common patterns like lifetime tracking, fade out, and object pooling.
 */
export abstract class LifetimeEffect extends Graphics {
  protected lifetime: number = 0;
  protected maxLifetime: number;

  constructor(maxLifetime: number = 100) {
    super();
    this.maxLifetime = maxLifetime;
  }

  /**
   * Update the effect (fade out, scale, etc).
   * @param deltaTime - Time since last frame in ms
   * @returns true if still alive, false if should be removed
   */
  public update(deltaTime: number): boolean {
    this.lifetime += deltaTime;

    if (this.lifetime >= this.maxLifetime) {
      return false;
    }

    this.onUpdate(this.lifetime, this.maxLifetime);
    return true;
  }

  /**
   * Called during update to apply effect-specific animations.
   * Override this instead of update() for custom behavior.
   * @param lifetime - Current lifetime
   * @param maxLifetime - Maximum lifetime
   */
  protected onUpdate(lifetime: number, maxLifetime: number): void {
    // Default: simple fade out
    const progress = lifetime / maxLifetime;
    this.alpha = 1 - progress;
  }

  /**
   * Reset the effect for reuse in object pool.
   * Override and call super.reset() for custom reset logic.
   */
  public reset(...args: unknown[]): void {
    this.lifetime = 0;
    this.alpha = 1;
    this.scale.set(1);
    this.clear();
  }

  /**
   * Get the current progress from 0 to 1
   */
  protected getProgress(): number {
    return Math.min(this.lifetime / this.maxLifetime, 1);
  }

  /**
   * Get remaining progress from 1 to 0
   */
  protected getFadeProgress(): number {
    return 1 - this.getProgress();
  }
}
