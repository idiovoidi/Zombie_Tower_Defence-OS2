import { Graphics } from 'pixi.js';

/**
 * Laser Sight Effect
 * Red dot laser showing target line for sniper
 */
export class LaserSight extends Graphics {
  private startX: number;
  private startY: number;
  private endX: number;
  private endY: number;
  private pulseTime: number = 0;

  constructor(startX: number, startY: number, endX: number, endY: number) {
    super();

    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.createLaserEffect();
  }

  private createLaserEffect(): void {
    // Thin red laser line
    this.moveTo(this.startX, this.startY)
      .lineTo(this.endX, this.endY)
      .stroke({ width: 1, color: 0xff0000, alpha: 0.6 });

    // Brighter dots along the line for effect
    const distance = Math.sqrt(
      Math.pow(this.endX - this.startX, 2) + Math.pow(this.endY - this.startY, 2)
    );
    const steps = Math.floor(distance / 20);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = this.startX + (this.endX - this.startX) * t;
      const y = this.startY + (this.endY - this.startY) * t;
      this.circle(x, y, 0.5).fill({ color: 0xff0000, alpha: 0.4 });
    }

    // Red dot at target
    this.circle(this.endX, this.endY, 3).fill({ color: 0xff0000, alpha: 0.7 });
    this.circle(this.endX, this.endY, 5).fill({ color: 0xff0000, alpha: 0.3 });
  }

  /**
   * Update laser sight position
   */
  public updatePosition(startX: number, startY: number, endX: number, endY: number): void {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;

    this.clear();
    this.createLaserEffect();
  }

  /**
   * Update with subtle pulse effect
   */
  public update(deltaTime: number): void {
    this.pulseTime += deltaTime;

    // Subtle pulse on the laser
    const pulse = Math.sin(this.pulseTime * 0.005) * 0.1 + 0.9;
    this.alpha = pulse;
  }
}
