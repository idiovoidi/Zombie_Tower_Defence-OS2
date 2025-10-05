import { Tower } from '../objects/Tower';
import { Zombie } from '../objects/Zombie';
import { TransformComponent } from '../components/TransformComponent';

export class TowerCombatManager {
  private towers: Tower[] = [];
  private zombies: Zombie[] = [];

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

      if (target && tower.canShoot(currentTime)) {
        this.shootAtTarget(tower, target);
      }
    }
  }

  private findTarget(tower: Tower): Zombie | null {
    const towerTransform = tower.getComponent<TransformComponent>('Transform');
    if (!towerTransform) return null;

    const towerPos = towerTransform.position;
    const range = tower.getRange();

    let closestZombie: Zombie | null = null;
    let closestDistance = Infinity;

    for (const zombie of this.zombies) {
      const zombieTransform = zombie.getComponent<TransformComponent>('Transform');
      if (!zombieTransform) continue;

      const zombiePos = zombieTransform.position;
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

    // Apply damage to target
    const damage = tower.getDamage();
    target.takeDamage(damage);
  }
}
