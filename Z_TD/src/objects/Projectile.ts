import { Graphics, Container } from 'pixi.js';
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
        // Orange flame particle
        this.visual.circle(0, 0, 4).fill({ color: 0xff4500, alpha: 0.8 });
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
    if (!this.isActive) return;

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
        this.visual.circle(0, 0, 8).fill({ color: 0xff4500, alpha: 0.6 });
        break;
      case 'tesla':
        this.visual.circle(0, 0, 10).fill({ color: 0x00bfff, alpha: 0.6 });
        break;
      default:
        this.visual.circle(0, 0, 5).fill({ color: 0xffff00, alpha: 0.6 });
    }

    // Fade out and destroy
    setTimeout(() => {
      this.destroy();
    }, 100);
  }

  public isDestroyed(): boolean {
    return !this.isActive;
  }

  public getDamage(): number {
    return this.damage;
  }
}
