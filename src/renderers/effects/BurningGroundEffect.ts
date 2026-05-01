import { Graphics } from 'pixi.js';

interface FlameParticle {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  color: number;
  alpha: number;
  flickerOffset: number;
  flickerSpeed: number;
}

/**
 * Burning Ground Effect
 * Animated fire pool with flickering flames that rise and fade
 */
export class BurningGroundEffect extends Graphics {
  private lifetime: number = 0;
  private maxLifetime: number = 2000; // 2 seconds
  private flames: FlameParticle[] = [];
  private smokeParticles: { x: number; y: number; size: number; alpha: number }[] = [];
  private poolRadius: number = 25;
  private upgradeLevel: number = 1;

  constructor(x: number, y: number, upgradeLevel: number = 1) {
    super();

    this.upgradeLevel = upgradeLevel;
    this.poolRadius = 25 + (upgradeLevel - 1) * 3;

    this.position.set(x, y);
    this.createFirePool();
  }

  private createFirePool(): void {
    // Create flame particles
    const flameCount = 12 + this.upgradeLevel * 2;
    for (let i = 0; i < flameCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.poolRadius * 0.8;

      this.flames.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 4 + Math.random() * 6,
        baseSize: 4 + Math.random() * 6,
        color: this.getFlameColor(Math.random()),
        alpha: 0.6 + Math.random() * 0.4,
        flickerOffset: Math.random() * Math.PI * 2,
        flickerSpeed: 0.1 + Math.random() * 0.1,
      });
    }

    // Create smoke particles
    const smokeCount = 6 + this.upgradeLevel;
    for (let i = 0; i < smokeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.poolRadius;
      this.smokeParticles.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 10 - Math.random() * 10,
        size: 6 + Math.random() * 8,
        alpha: 0.2 + Math.random() * 0.3,
      });
    }
  }

  private getFlameColor(randomValue: number): number {
    // Return colors from yellow (hot) to red (cool)
    if (randomValue < 0.25) return 0xffff00; // Yellow
    if (randomValue < 0.5) return 0xffaa00;  // Orange-yellow
    if (randomValue < 0.75) return 0xff8800; // Orange
    return 0xff4500; // Red-orange
  }

  /**
   * Update burning ground effect (animate flames)
   * @returns true if still alive, false if should be removed
   */
  public update(deltaTime: number): boolean {
    this.lifetime += deltaTime;

    if (this.lifetime >= this.maxLifetime) {
      return false;
    }

    const progress = this.lifetime / this.maxLifetime;
    const fadeMultiplier = 1 - progress;

    // Clear and redraw
    this.clear();

    // Draw smoke (rises and dissipates)
    for (const smoke of this.smokeParticles) {
      smoke.y -= deltaTime * 0.02; // Rise up
      smoke.alpha -= deltaTime * 0.0002; // Dissipate

      if (smoke.alpha > 0) {
        const smokeAlpha = smoke.alpha * fadeMultiplier;
        this.circle(smoke.x, smoke.y, smoke.size).fill({
          color: 0x4a4a4a,
          alpha: smokeAlpha * 0.5,
        });
      }
    }

    // Draw flames (flicker and pulse)
    for (const flame of this.flames) {
      // Flicker effect
      const flicker = Math.sin(this.lifetime * flame.flickerSpeed + flame.flickerOffset);
      const sizePulse = 1 + flicker * 0.3;

      // Flames rise slightly
      flame.y -= deltaTime * 0.01 * (0.5 + Math.random() * 0.5);

      // Calculate size with pulse
      const currentSize = flame.baseSize * sizePulse * (0.8 + Math.random() * 0.4);

      // Alpha fades over lifetime and flickers
      const flickerAlpha = 0.7 + flicker * 0.3;
      const currentAlpha = flame.alpha * flickerAlpha * fadeMultiplier;

      // Draw flame with glow layers
      const x = flame.x + Math.sin(this.lifetime * 0.005 + flame.flickerOffset) * 2;
      const y = flame.y;

      // Outer glow
      this.circle(x, y, currentSize * 1.5).fill({
        color: 0xff6600,
        alpha: currentAlpha * 0.3,
      });

      // Middle glow
      this.circle(x, y, currentSize).fill({
        color: 0xff8800,
        alpha: currentAlpha * 0.6,
      });

      // Core flame
      this.circle(x, y, currentSize * 0.6).fill({
        color: flame.color,
        alpha: currentAlpha,
      });
    }

    // Draw hot core at center
    const corePulse = 1 + Math.sin(this.lifetime * 0.01) * 0.2;
    const coreAlpha = (0.8 + Math.sin(this.lifetime * 0.015) * 0.2) * fadeMultiplier;

    this.circle(0, 0, 10 * corePulse).fill({
      color: 0xff4500,
      alpha: coreAlpha * 0.5,
    });
    this.circle(0, 0, 6 * corePulse).fill({
      color: 0xff8800,
      alpha: coreAlpha * 0.7,
    });
    this.circle(0, 0, 3 * corePulse).fill({
      color: 0xffff00,
      alpha: coreAlpha,
    });

    return true;
  }

  /**
   * Reset the burning ground effect for reuse in object pool
   */
  public reset(x: number, y: number, upgradeLevel: number = 1): void {
    this.position.set(x, y);
    this.lifetime = 0;
    this.alpha = 1;
    this.upgradeLevel = upgradeLevel;
    this.poolRadius = 25 + (upgradeLevel - 1) * 3;

    // Clear and recreate
    this.clear();
    this.flames = [];
    this.smokeParticles = [];
    this.createFirePool();
  }
}
