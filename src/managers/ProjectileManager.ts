import { Container } from 'pixi.js';
import { Projectile } from '../objects/Projectile';
import { Zombie } from '../objects/Zombie';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';

export class ProjectileManager {
  private projectiles: Projectile[] = [];
  private container: Container;
  private zombies: Zombie[] = [];
  private projectilesDirty: boolean = false; // Track when projectile array changes

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
    this.projectilesDirty = true; // Mark projectiles as changed
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
        this.projectilesDirty = true; // Mark projectiles as changed
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
    this.projectilesDirty = true; // Mark projectiles as changed
  }

  public getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  // Check if projectiles array has changed since last check
  public areProjectilesDirty(): boolean {
    return this.projectilesDirty;
  }

  // Reset dirty flag after consuming the change
  public clearProjectilesDirty(): void {
    this.projectilesDirty = false;
  }
}
