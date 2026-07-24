import type { Container } from 'pixi.js';
import { Projectile } from '../objects/Projectile';
import type { Zombie } from '../objects/Zombie';
import type { ZombieSpatialQuery } from '../types/zombieSpatialQuery';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';
import { ObjectPool } from '../utils/ObjectPool';

export class ProjectileManager {
  private projectiles: Projectile[] = [];
  private container: Container;
  private zombies: Zombie[] = [];
  private spatialQuery: ZombieSpatialQuery | null = null;
  private projectilesDirty = false; // Track when projectile array changes
  private projectilePool: ObjectPool<Projectile>;

  constructor(container: Container) {
    this.container = container;
    this.projectilePool = new ObjectPool<Projectile>(
      () => new Projectile(),
      p => {
        p.visible = false;
        if (p.parent) p.parent.removeChild(p);
      },
      500 // maxSize
    );
  }

  public setZombies(zombies: Zombie[]): void {
    this.zombies = zombies;
  }

  public setSpatialQuery(query: ZombieSpatialQuery | null): void {
    this.spatialQuery = query;
  }

  public createProjectile(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number,
    speed: number,
    projectileType = 'bullet',
    target: Zombie | null = null
  ): Projectile {
    const projectile = this.projectilePool.acquire();
    projectile.init(x, y, targetX, targetY, damage, speed, projectileType, target);
    projectile.visible = true;
    projectile.setZombies(this.zombies);
    projectile.setSpatialQuery(this.spatialQuery);
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
        this.projectilePool.release(projectile);
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
      this.projectilePool.release(projectile);
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
