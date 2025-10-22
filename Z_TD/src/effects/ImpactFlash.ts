import { Graphics } from 'pixi.js';

/**
 * Impact Flash Effect
 * Bright yellow flash with radial burst when bullet hits target
 */
export class ImpactFlash extends Graphics {
  private lifetime: number = 0;
  private maxLifetime: number = 200; // Brief but visible
  private burstParticles: Graphics[] = [];

  constructor(x: number, y: number, isHeadshot: boolean = false) {
    super();

    this.position.set(x, y);
    this.createImpactEffect(isHeadshot);
  }

  private createImpactEffect(isHeadshot: boolean): void {
    // Central flash - brighter for headshots
    const coreAlpha = isHeadshot ? 1.0 : 0.8;
    const coreColor = isHeadshot ? 0xffffff : 0xffff00;

    this.circle(0, 0, 4).fill({ color: coreColor, alpha: coreAlpha });
    this.circle(0, 0, 7).fill({ color: 0xffff00, alpha: 0.6 });
    this.circle(0, 0, 10).fill({ color: 0xff9900, alpha: 0.3 });

    // Radial burst particles
    const particleCount = isHeadshot ? 12 : 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 8 + Math.random() * 4;
      const particleX = Math.cos(angle) * distance;
      const particleY = Math.sin(angle) * distance;

      const particle = new Graphics();
      particle.circle(0, 0, 2).fill({ color: 0xffff00, alpha: 0.8 });
      particle.position.set(particleX, particleY);

      this.addChild(particle);
      this.burstParticles.push(particle);
    }

    // Cross-shaped flash for headshots
    if (isHeadshot) {
      this.rect(-12, -1, 24, 2).fill({ color: 0xffffff, alpha: 0.7 });
      this.rect(-1, -12, 2, 24).fill({ color: 0xffffff, alpha: 0.7 });
    }
  }

  /**
   * Update impact flash (expand and fade)
   * @returns true if still alive, false if should be removed
   */
  public update(deltaTime: number): boolean {
    this.lifetime += deltaTime;

    if (this.lifetime >= this.maxLifetime) {
      return false;
    }

    const progress = this.lifetime / this.maxLifetime;

    // Expand
    this.scale.set(1 + progress * 0.5);

    // Fade out
    this.alpha = 1 - progress;

    // Expand burst particles outward
    for (const particle of this.burstParticles) {
      const currentX = particle.x;
      const currentY = particle.y;
      const angle = Math.atan2(currentY, currentX);
      const expansion = progress * 8;

      particle.x = currentX + Math.cos(angle) * expansion * (deltaTime / 16);
      particle.y = currentY + Math.sin(angle) * expansion * (deltaTime / 16);
    }

    return true;
  }

  /**
   * Clean up particles
   */
  public override destroy(): void {
    for (const particle of this.burstParticles) {
      if (particle && !particle.destroyed) {
        particle.destroy();
      }
    }
    this.burstParticles = [];
    super.destroy();
  }
}
