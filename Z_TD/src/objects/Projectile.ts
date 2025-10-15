import { Container, Graphics } from 'pixi.js';
import { Zombie } from './Zombie';

export class Projectile extends Container {
  private visual: Graphics;
  private speed: number;
  private damage: number;
  private target: Zombie | null;
  private targetX: number;
  private targetY: number;
  private isActive: boolean = true;
  private projectileType: string;

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number,
    speed: number,
    projectileType: string = 'bullet',
    target: Zombie | null = null
  ) {
    super();
    this.position.set(x, y);
    this.targetX = targetX;
    this.targetY = targetY;
    this.damage = damage;
    this.speed = speed;
    this.projectileType = projectileType;
    this.target = target;

    this.visual = new Graphics();
    this.addChild(this.visual);
    this.createVisual();
  }

  private createVisual(): void {
    this.visual.clear();

    switch (this.projectileType) {
      case 'bullet':
        // Small yellow circle
        this.visual.circle(0, 0, 3).fill(0xffff00);
        break;
      case 'sniper':
        // Thin red line
        this.visual.circle(0, 0, 2).fill(0xff0000);
        break;
      case 'shotgun':
        // Multiple small pellets
        this.visual.circle(0, 0, 2).fill(0xffa500);
        break;
      case 'flame':
        // Fireball with glow
        this.visual.circle(0, 0, 8).fill({ color: 0xff6600, alpha: 0.4 }); // Outer glow
        this.visual.circle(0, 0, 6).fill({ color: 0xff8800, alpha: 0.6 }); // Middle
        this.visual.circle(0, 0, 4).fill({ color: 0xffaa00, alpha: 0.8 }); // Inner
        this.visual.circle(0, 0, 2).fill({ color: 0xffff00, alpha: 1 }); // Hot core
        break;
      case 'tesla':
        // Blue electric bolt
        this.visual.circle(0, 0, 3).fill(0x00bfff);
        this.visual.circle(0, 0, 5).stroke({ width: 1, color: 0x7fffd4, alpha: 0.5 });
        break;
      default:
        this.visual.circle(0, 0, 3).fill(0xffffff);
    }
  }

  public update(deltaTime: number): void {
    if (!this.isActive) {
      return;
    }

    // Update target position if tracking a zombie
    if (this.target && this.target.parent) {
      this.targetX = this.target.position.x;
      this.targetY = this.target.position.y;
    }

    // Calculate direction to target
    const dx = this.targetX - this.position.x;
    const dy = this.targetY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if reached target
    if (distance < 10) {
      this.onHitTarget();
      return;
    }

    // Move towards target
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    const moveDistance = this.speed * (deltaTime / 1000);
    this.position.x += normalizedDx * moveDistance;
    this.position.y += normalizedDy * moveDistance;

    // Rotate projectile to face direction of travel
    this.rotation = Math.atan2(dy, dx);
  }

  private onHitTarget(): void {
    this.isActive = false;

    // Apply damage to target if it still exists
    if (this.target && this.target.parent) {
      this.target.takeDamage(this.damage);
    }

    // Create hit effect based on projectile type
    this.createHitEffect();
  }

  private createHitEffect(): void {
    // Visual feedback for hit
    this.visual.clear();

    switch (this.projectileType) {
      case 'flame':
        this.createFirePool();
        break;
      case 'tesla':
        this.visual.circle(0, 0, 10).fill({ color: 0x00bfff, alpha: 0.6 });
        setTimeout(() => {
          this.destroy();
        }, 100);
        break;
      default:
        this.visual.circle(0, 0, 5).fill({ color: 0xffff00, alpha: 0.6 });
        setTimeout(() => {
          this.destroy();
        }, 100);
    }
  }

  private createFirePool(): void {
    // Create lingering fire pool on the ground
    const firePool = new Graphics();

    // Draw fire pool with multiple layers
    const poolSize = 25;

    // Outer smoke/heat distortion
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = poolSize * 0.8 + Math.random() * 5;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const size = 6 + Math.random() * 4;
      firePool.circle(x, y, size).fill({ color: 0x4a4a4a, alpha: 0.3 });
    }

    // Fire particles
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * poolSize;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const size = 3 + Math.random() * 5;

      // Color varies from yellow center to red edges
      const distRatio = dist / poolSize;
      let color: number;
      if (distRatio < 0.3) {
        color = Math.random() > 0.5 ? 0xffff00 : 0xffffff; // Hot center
      } else if (distRatio < 0.6) {
        color = Math.random() > 0.5 ? 0xffa500 : 0xff8c00; // Orange middle
      } else {
        color = Math.random() > 0.5 ? 0xff4500 : 0xff6347; // Red edges
      }

      firePool.circle(x, y, size).fill({ color, alpha: 0.7 + Math.random() * 0.3 });
    }

    // Hot core
    firePool.circle(0, 0, 8).fill({ color: 0xffffff, alpha: 0.9 });
    firePool.circle(0, 0, 12).fill({ color: 0xffff00, alpha: 0.7 });
    firePool.circle(0, 0, 16).fill({ color: 0xffa500, alpha: 0.5 });

    // Add fire pool to parent at current position
    if (this.parent) {
      firePool.position.set(this.position.x, this.position.y);
      this.parent.addChild(firePool);

      // Animate fire pool fading out
      let elapsed = 0;
      const duration = 2000; // Fire lasts 2 seconds
      const fadeInterval = setInterval(() => {
        elapsed += 50;
        const progress = elapsed / duration;

        if (progress >= 1) {
          clearInterval(fadeInterval);
          if (firePool.parent) {
            firePool.parent.removeChild(firePool);
          }
          firePool.destroy();
        } else {
          // Fade out
          firePool.alpha = 1 - progress;
        }
      }, 50);
    }

    // Destroy the projectile immediately
    this.destroy();
  }

  public isDestroyed(): boolean {
    return !this.isActive;
  }

  public getDamage(): number {
    return this.damage;
  }
}
