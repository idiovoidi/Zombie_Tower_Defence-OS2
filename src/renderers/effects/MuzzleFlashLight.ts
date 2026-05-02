import { LifetimeEffect } from './LifetimeEffect';

/**
 * Muzzle Flash Light Effect
 * Creates an illumination effect around the muzzle flash
 */
export class MuzzleFlashLight extends LifetimeEffect {
  private radius: number;

  constructor(x: number, y: number, radius: number = 30) {
    super(100); // Very brief flash

    this.radius = radius;
    this.position.set(x, y);

    // Create radial gradient effect using multiple circles
    this.createLightEffect();
  }

  private createLightEffect(): void {
    // Subtle radial glow - much more subtle than before
    // Bright center (very small)
    this.circle(0, 0, this.radius * 0.2).fill({ color: 0xffffff, alpha: 0.4 });

    // Medium glow (warm yellow)
    this.circle(0, 0, this.radius * 0.5).fill({ color: 0xffcc66, alpha: 0.2 });

    // Outer glow (very faint orange)
    this.circle(0, 0, this.radius).fill({ color: 0xff9933, alpha: 0.1 });
  }

  /**
   * Override onUpdate for custom fade and scale behavior
   */
  protected onUpdate(lifetime: number, maxLifetime: number): void {
    // Rapid fade out
    const fadeProgress = lifetime / maxLifetime;
    this.alpha = 1 - fadeProgress;

    // Slight expansion
    this.scale.set(1 + fadeProgress * 0.2);
  }

  /**
   * Reset the muzzle flash for reuse in object pool
   */
  public reset(x: number, y: number, radius: number = 30): void {
    super.reset();
    this.position.set(x, y);
    this.radius = radius;
    this.createLightEffect();
  }
}
