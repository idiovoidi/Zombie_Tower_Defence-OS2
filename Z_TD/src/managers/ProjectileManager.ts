import { Container } from 'pixi.js';
import { Projectile } from '../objects/Projectile';
import { Zombie } from '../objects/Zombie';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';

export class ProjectileManager {
  private projectiles: Projectile[] = [];
  private container: Container;
  private zombies: Zombie[] = [];

  constructor(container: Container) {
    this.container = container;
  }

  public setZombies(zombies: Zombie[]): void {
    this.zombies = zombies;
  }

  public createProjectile(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number,
    speed: number,
    projectileType: string = 'bullet',
    target: Zombie | null = null
  ): Projectile {
    const projectile = new Projectile(
      x,
      y,
      targetX,
      targetY,
      damage,
      speed,
      projectileType,
      target
    );
    projectile.setZombies(this.zombies); // Pass zombie list for collision detection
    this.projectiles.push(projectile);
    this.container.addChild(projectile);
    return projectile;
  }

  public update(deltaTime: number): void {
    // Update all projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime);

      // Remove destroyed projectiles
      if (projectile.isDestroyed() || !projectile.parent) {
        this.container.removeChild(projectile);
        projectile.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  public clear(): void {
    // Clear all projectile effect intervals (explosions, fire pools, sludge pools)
    EffectCleanupManager.clearAll();

    for (const projectile of this.projectiles) {
      this.container.removeChild(projectile);
      projectile.destroy();
    }
    this.projectiles = [];
  }

  public getProjectiles(): Projectile[] {
    return this.projectiles;
  }
}
