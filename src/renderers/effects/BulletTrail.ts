import { LifetimeEffect } from './LifetimeEffect';

/**
 * Bullet Trail Effect
 * Visible tracer line from sniper barrel to target
 */
export class BulletTrail extends LifetimeEffect {
  private startX: number;
  private startY: number;
  private endX: number;
  private endY: number;

  constructor(startX: number, startY: number, endX: number, endY: number) {
    super(150); // Very brief trail

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.createTrailEffect();
  }

  private createTrailEffect(): void {
    // Bright yellow-white tracer line
    this.moveTo(this.startX, this.startY)
      .lineTo(this.endX, this.endY)
      .stroke({ width: 2, color: 0xffff99, alpha: 0.9 });

    // Thicker outer glow
    this.moveTo(this.startX, this.startY)
      .lineTo(this.endX, this.endY)
      .stroke({ width: 4, color: 0xffff00, alpha: 0.4 });

    // Very faint outer trail
    this.moveTo(this.startX, this.startY)
      .lineTo(this.endX, this.endY)
      .stroke({ width: 6, color: 0xff9900, alpha: 0.2 });
  }

  /**
   * Override onUpdate for custom fade behavior
   */
  protected override onUpdate(lifetime: number, maxLifetime: number): void {
    // Rapid fade out
    const fadeProgress = lifetime / maxLifetime;
    this.alpha = 1 - fadeProgress;
  }

  /**
   * Reset the bullet trail for reuse in object pool
   */
  public override reset(startX: number, startY: number, endX: number, endY: number): void {
    super.reset();
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.createTrailEffect();
  }
}
