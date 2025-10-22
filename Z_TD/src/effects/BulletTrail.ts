import { Graphics } from 'pixi.js';

/**
 * Bullet Trail Effect
 * Visible tracer line from sniper barrel to target
 */
export class BulletTrail extends Graphics {
  private lifetime: number = 0;
  private maxLifetime: number = 150; // Very brief trail
  private startX: number;
  private startY: number;
  private endX: number;
  private endY: number;

  constructor(startX: number, startY: number, endX: number, endY: number) {
    super();

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
   * Update bullet trail (fade out)
   * @returns true if still alive, false if should be removed
   */
  public update(deltaTime: number): boolean {
    this.lifetime += deltaTime;

    if (this.lifetime >= this.maxLifetime) {
      return false;
    }

    // Rapid fade out
    const fadeProgress = this.lifetime / this.maxLifetime;
    this.alpha = 1 - fadeProgress;

    return true;
  }
}
