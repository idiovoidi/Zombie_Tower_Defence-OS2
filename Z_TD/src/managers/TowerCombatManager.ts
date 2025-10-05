import { Tower } from '../objects/Tower';
import { Zombie } from '../objects/Zombie';
import { TransformComponent } from '../components/TransformComponent';
import { ProjectileManager } from './ProjectileManager';
import { Container } from 'pixi.js';

export class TowerCombatManager {
  private towers: Tower[] = [];
  private zombies: Zombie[] = [];
  private projectileManager: ProjectileManager | null = null;

  public setProjectileManager(projectileManager: ProjectileManager): void {
    this.projectileManager = projectileManager;
  }

  public setTowers(towers: Tower[]): void {
    this.towers = towers;
  }

  public setZombies(zombies: Zombie[]): void {
    this.zombies = zombies;
  }

  public update(deltaTime: number): void {
    const currentTime = performance.now();

    for (const tower of this.towers) {
      // Update tower
      tower.update(deltaTime);

      // Find target
      const target = this.findTarget(tower);

      if (target) {
        // Rotate tower to face target
        tower.rotateTowards(target.position.x, target.position.y);

        // Shoot if ready
        if (tower.canShoot(currentTime)) {
          this.shootAtTarget(tower, target);
        }
      }
    }

    // Update projectiles
    if (this.projectileManager) {
      this.projectileManager.update(deltaTime);
    }
  }

  private findTarget(tower: Tower): Zombie | null {
    const towerPos = tower.position;
    const range = tower.getRange();

    let closestZombie: Zombie | null = null;
    let closestDistance = Infinity;

    for (const zombie of this.zombies) {
      if (!zombie.parent) continue; // Skip destroyed zombies

      const zombiePos = zombie.position;
      const distance = Math.sqrt(
        Math.pow(towerPos.x - zombiePos.x, 2) + Math.pow(towerPos.y - zombiePos.y, 2)
      );

      if (distance <= range && distance < closestDistance) {
        closestDistance = distance;
        closestZombie = zombie;
      }
    }

    return closestZombie;
  }

  private shootAtTarget(tower: Tower, target: Zombie): void {
    tower.shoot();
    tower.showShootingEffect();

    if (!this.projectileManager) return;

    // Get projectile spawn position
    const spawnPos = tower.getProjectileSpawnPosition();

    // Create projectile
    const damage = tower.getDamage();
    const projectileType = tower.getProjectileType();

    // Different projectile speeds based on tower type
    let speed = 500; // Default speed
    switch (projectileType) {
      case 'sniper':
        speed = 1000; // Fast
        break;
      case 'shotgun':
        speed = 400; // Slower
        break;
      case 'flame':
        speed = 300; // Slow
        break;
      case 'tesla':
        speed = 800; // Fast
        break;
    }

    // For shotgun, create multiple projectiles
    if (projectileType === 'shotgun') {
      const spreadAngles = [-0.2, 0, 0.2]; // 3 pellets with spread
      for (const angleOffset of spreadAngles) {
        const angle = Math.atan2(target.position.y - spawnPos.y, target.position.x - spawnPos.x);
        const adjustedAngle = angle + angleOffset;
        const targetX = spawnPos.x + Math.cos(adjustedAngle) * 1000;
        const targetY = spawnPos.y + Math.sin(adjustedAngle) * 1000;

        this.projectileManager.createProjectile(
          spawnPos.x,
          spawnPos.y,
          targetX,
          targetY,
          damage / 3, // Split damage among pellets
          speed,
          projectileType,
          target
        );
      }
    } else {
      // Single projectile
      this.projectileManager.createProjectile(
        spawnPos.x,
        spawnPos.y,
        target.position.x,
        target.position.y,
        damage,
        speed,
        projectileType,
        target
      );
    }
  }
}
