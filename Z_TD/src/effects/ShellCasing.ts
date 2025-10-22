import { Graphics } from 'pixi.js';

/**
 * Shell Casing Effect
 * Represents a brass shell casing ejected from a gun
 */
export class ShellCasing extends Graphics {
  private velocity: { x: number; y: number };
  private rotationSpeed: number;
  private lifetime: number = 0;
  private maxLifetime: number = 2000; // 2 seconds
  private gravity: number = 0.0002;
  private bounced: boolean = false;

  constructor(x: number, y: number, ejectAngle: number = 0) {
    super();

    // Create brass casing visual
    this.rect(-1, -2, 2, 4).fill(0xffd700); // Gold/brass color
    this.stroke({ width: 0.5, color: 0xb8860b }); // Darker brass outline

    // Set initial position
    this.position.set(x, y);

    // Calculate ejection velocity based on angle
    const speed = 0.15 + Math.random() * 0.1;
    this.velocity = {
      x: Math.cos(ejectAngle) * speed + (Math.random() - 0.5) * 0.05,
      y: Math.sin(ejectAngle) * speed - 0.1, // Slight upward bias
    };

    // Random rotation speed
    this.rotationSpeed = (Math.random() - 0.5) * 0.01;
    this.rotation = Math.random() * Math.PI * 2;
  }

  /**
   * Update shell casing physics
   * @returns true if still alive, false if should be removed
   */
  public update(deltaTime: number): boolean {
    this.lifetime += deltaTime;

    // Remove if lifetime exceeded
    if (this.lifetime >= this.maxLifetime) {
      return false;
    }

    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;

    // Update position
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;

    // Update rotation
    this.rotation += this.rotationSpeed * deltaTime;

    // Simple ground bounce (assuming ground at y > 0)
    if (this.y > 0 && !this.bounced) {
      this.velocity.y *= -0.3; // Bounce with energy loss
      this.velocity.x *= 0.7; // Friction
      this.rotationSpeed *= 0.5;
      this.bounced = true;
    }

    // Fade out in last 500ms
    if (this.lifetime > this.maxLifetime - 500) {
      const fadeProgress = (this.lifetime - (this.maxLifetime - 500)) / 500;
      this.alpha = 1 - fadeProgress;
    }

    return true;
  }

  /**
   * Add light reflection effect (for when near muzzle flash)
   */
  public addReflection(): void {
    // Add bright highlight
    const highlight = new Graphics();
    highlight.circle(0, -1, 1).fill({ color: 0xffffff, alpha: 0.8 });
    this.addChild(highlight);

    // Remove highlight after brief moment
    setTimeout(() => {
      if (!this.destroyed && highlight.parent) {
        this.removeChild(highlight);
        highlight.destroy();
      }
    }, 100);
  }
}
