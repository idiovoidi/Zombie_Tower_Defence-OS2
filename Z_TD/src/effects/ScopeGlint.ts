import { Graphics } from 'pixi.js';

/**
 * Scope Glint Effect
 * Subtle lens flare when sniper is aiming
 */
export class ScopeGlint extends Graphics {
  private lifetime: number = 0;
  private maxLifetime: number = 300; // Brief glint
  private pulseSpeed: number = 0.01;

  constructor(x: number, y: number) {
    super();

    this.position.set(x, y);
    this.createGlintEffect();
  }

  private createGlintEffect(): void {
    // Small bright white sparkle
    this.circle(0, 0, 2).fill({ color: 0xffffff, alpha: 0.9 });

    // Subtle outer glow
    this.circle(0, 0, 4).fill({ color: 0xffffff, alpha: 0.3 });

    // Cross-shaped lens flare
    this.rect(-6, -0.5, 12, 1).fill({ color: 0xffffff, alpha: 0.5 });
    this.rect(-0.5, -6, 1, 12).fill({ color: 0xffffff, alpha: 0.5 });
  }

  /**
   * Update glint effect with subtle pulse
   * @returns true if still alive, false if should be removed
   */
  public update(deltaTime: number): boolean {
    this.lifetime += deltaTime;

    if (this.lifetime >= this.maxLifetime) {
      return false;
    }

    // Subtle pulse effect
    const pulse = Math.sin(this.lifetime * this.pulseSpeed) * 0.2 + 0.8;
    this.alpha = pulse;

    // Fade out in last 100ms
    if (this.lifetime > this.maxLifetime - 100) {
      const fadeProgress = (this.lifetime - (this.maxLifetime - 100)) / 100;
      this.alpha *= 1 - fadeProgress;
    }

    return true;
  }
}
