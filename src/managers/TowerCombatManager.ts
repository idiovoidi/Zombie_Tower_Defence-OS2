import type { Tower } from '../objects/Tower';
import type { Zombie } from '../objects/Zombie';
import type { EffectManager } from '../renderers/effects/EffectManager';
import { OptimizationValidator } from '../utils/OptimizationValidator';
import { SpatialGrid } from '../utils/SpatialGrid';
import type { ProjectileManager } from './ProjectileManager';

export class TowerCombatManager {
  private towers: Tower[] = [];
  private zombies: Zombie[] = [];
  private projectileManager: ProjectileManager | null = null;
  private onDamageCallback:
    | ((damage: number, towerType: string, killed: boolean, overkill: number) => void)
    | null = null;
  private effectManager: EffectManager | null = null;
  private zombieGrid: SpatialGrid<Zombie & { [key: string]: unknown }>;

  /** Apply damage to a zombie, fire the damage callback, and return whether it was killed. */
  private applyDamageToZombie(zombie: Zombie, tower: Tower, damage: number): boolean {
    const modifier = zombie.getDamageModifier(tower.getType());
    const modifiedDamage = damage * modifier;
    const healthBefore = zombie.getHealth();
    zombie.takeDamage(modifiedDamage);
    const healthAfter = zombie.getHealth();
    const actualDamage = healthBefore - healthAfter;
    const killed = healthAfter <= 0;
    const overkill = killed ? Math.abs(healthAfter) : 0;
    if (this.onDamageCallback) {
      this.onDamageCallback(actualDamage, tower.getType(), killed, overkill);
    }
    return killed;
  }

  constructor(worldWidth: number = 1024, worldHeight: number = 768) {
    // Create spatial grid with 128px cells (optimal for typical tower ranges of 150-300px)
    this.zombieGrid = new SpatialGrid<Zombie & { [key: string]: unknown }>(
      worldWidth,
      worldHeight,
      128
    );
  }

  public setProjectileManager(projectileManager: ProjectileManager): void {
    this.projectileManager = projectileManager;
  }

  public setEffectManager(effectManager: EffectManager): void {
    this.effectManager = effectManager;
  }

  public setTowers(towers: Tower[]): void {
    this.towers = towers;
  }

  public setZombies(zombies: Zombie[]): void {
    this.zombies = zombies;

    // OPTIMIZATION: Only rebuild grid when zombie count changes significantly
    // This prevents expensive grid rebuilds every frame
    const currentSize = this.zombieGrid.size();
    const newSize = zombies.filter(z => z.parent).length;

    // Only rebuild if zombie count changed by more than 5 or grid is empty
    if (Math.abs(currentSize - newSize) > 5 || currentSize === 0) {
      this.zombieGrid.clear();
      for (const zombie of zombies) {
        if (zombie.parent) {
          // Type assertion: Zombie satisfies SpatialEntity requirements
          this.zombieGrid.insert(zombie as Zombie & { [key: string]: unknown });
        }
      }
    }

    // Also update projectile manager with zombie list for collision detection
    if (this.projectileManager) {
      this.projectileManager.setZombies(zombies);
    }
  }

  public setOnDamageCallback(
    callback: (damage: number, towerType: string, killed: boolean, overkill: number) => void
  ): void {
    this.onDamageCallback = callback;
  }

  public getTowers(): Tower[] {
    return this.towers;
  }

  public update(deltaTime: number): void {
    const currentTime = performance.now();

    // OPTIMIZATION: Use batch update for spatial grid (much faster than individual updates)
    // Filter active zombies once instead of checking in loop
    const activeZombies = this.zombies.filter(z => z.parent);
    if (activeZombies.length > 0) {
      // Type assertion: Zombie satisfies SpatialEntity requirements
      this.zombieGrid.batchUpdate(activeZombies as (Zombie & { [key: string]: unknown })[]);
    }

    for (const tower of this.towers) {
      // Update tower
      tower.update(deltaTime);

      // Find target using spatial grid (O(k) instead of O(n))
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

    // Measure target finding performance if validation is enabled
    if (OptimizationValidator.isEnabled() && this.zombies.length > 0) {
      OptimizationValidator.measureTargetFinding(this.zombies, towerPos.x, towerPos.y, range, () =>
        this.zombieGrid.queryClosest(
          towerPos.x,
          towerPos.y,
          range,
          zombie => zombie.parent !== null
        )
      );
    }

    // Use spatial grid to query only nearby zombies (O(k) instead of O(n))
    // This reduces from checking ALL zombies to only zombies in nearby grid cells
    const closest = this.zombieGrid.queryClosest(
      towerPos.x,
      towerPos.y,
      range,
      zombie => zombie.parent !== null // Filter out destroyed zombies
    );

    return closest;
  }

  private createTargetedProjectile(
    tower: Tower,
    spawnPos: { x: number; y: number },
    targetPos: { x: number; y: number },
    damage: number,
    speed: number,
    projectileType: string,
    target: Zombie | null,
    includeUpgradeLevel: boolean = false
  ) {
    if (!this.projectileManager) {
      return null;
    }

    const projectile = this.projectileManager.createProjectile(
      spawnPos.x,
      spawnPos.y,
      targetPos.x,
      targetPos.y,
      damage,
      speed,
      projectileType,
      target
    );
    projectile.setTowerType(tower.getType());
    if (includeUpgradeLevel) {
      projectile.setUpgradeLevel(tower.getUpgradeLevel());
    }
    if (this.onDamageCallback) {
      projectile.setOnDamageCallback(this.onDamageCallback);
    }
    return projectile;
  }

  private shootAtTarget(tower: Tower, target: Zombie): void {
    tower.shoot();
    tower.showShootingEffect();

    // Enable laser sight for sniper towers (level 3+)
    if (tower.getType() === 'Sniper' && tower.getUpgradeLevel() >= 3) {
      tower.setTarget(target.position.x, target.position.y);
      tower.setLaserSightEnabled(true);
    }

    // Spawn sniper hit effects (bullet trail and impact flash)
    if (tower.getType() === 'Sniper') {
      tower.spawnSniperHitEffects(target.position.x, target.position.y, false);
    }

    if (!this.projectileManager) {
      return;
    }

    // Get projectile spawn position
    const spawnPos = tower.getProjectileSpawnPosition();

    // Create projectile
    const damage = tower.getDamage();
    const projectileType = tower.getProjectileType();

    // Tesla tower uses instant lightning arc instead of projectile
    if (projectileType === 'tesla') {
      this.createLightningArc(tower, spawnPos, target, damage);
      return;
    }

    // Flame tower shoots fireball projectile
    if (projectileType === 'flame') {
      const speed = 400;
      this.createTargetedProjectile(
        tower,
        spawnPos,
        target.position,
        damage,
        speed,
        projectileType,
        target
      );
      return;
    }

    // Grenade tower shoots explosive projectile with arc trajectory
    if (projectileType === 'grenade') {
      const speed = 350; // Slower than bullets
      this.createTargetedProjectile(
        tower,
        spawnPos,
        target.position,
        damage,
        speed,
        projectileType,
        target,
        true
      );
      return;
    }

    // Sludge tower shoots toxic barrel with arc trajectory
    if (projectileType === 'sludge') {
      const speed = 300; // Similar to grenade but slightly slower
      this.createTargetedProjectile(
        tower,
        spawnPos,
        target.position,
        damage, // 0 damage - pure crowd control
        speed,
        projectileType,
        target,
        true
      );
      return;
    }

    // Different projectile speeds based on tower type
    let speed = 500; // Default speed
    switch (projectileType) {
      case 'sniper':
        speed = 1000; // Fast
        break;
      case 'shotgun':
        speed = 400; // Slower
        break;
    }

    // For shotgun, create a cone of pellets towards the target
    if (projectileType === 'shotgun') {
      // Calculate angle towards target
      const baseAngle = Math.atan2(target.position.y - spawnPos.y, target.position.x - spawnPos.x);

      // Shotgun parameters
      const pelletCount = 7; // Number of pellets in the cone
      const coneSpread = 0.6; // Total cone spread in radians (~34 degrees)
      const shotgunRange = tower.getRange(); // Use tower's actual range
      const damagePerPellet = damage / pelletCount;

      for (let i = 0; i < pelletCount; i++) {
        // Spread pellets in a cone pattern
        const offset = (i - (pelletCount - 1) / 2) * (coneSpread / (pelletCount - 1));
        const adjustedAngle = baseAngle + offset;

        // Calculate target point at shotgun range
        const targetX = spawnPos.x + Math.cos(adjustedAngle) * shotgunRange;
        const targetY = spawnPos.y + Math.sin(adjustedAngle) * shotgunRange;

        this.createTargetedProjectile(
          tower,
          spawnPos,
          { x: targetX, y: targetY },
          damagePerPellet,
          speed,
          projectileType,
          null // No specific target - pellets hit whatever they encounter
        );
      }
    } else {
      // Single projectile
      this.createTargetedProjectile(
        tower,
        spawnPos,
        target.position,
        damage,
        speed,
        projectileType,
        target
      );
    }
  }

  private createLightningArc(
    tower: Tower,
    spawnPos: { x: number; y: number },
    target: Zombie,
    damage: number
  ): void {
    // Calculate number of chain jumps based on upgrade level
    // Level 1: 1 target, Level 2: 2 targets, Level 3: 3 targets, etc.
    const maxJumps = tower.getUpgradeLevel();
    const chainRange = 150; // Maximum distance for chain lightning to jump
    const damageReduction = 0.7; // Each jump does 70% of previous damage

    // Track hit zombies to avoid hitting the same zombie twice
    const hitZombies = new Set<Zombie>();
    const chainTargets: Array<{ from: { x: number; y: number }; to: Zombie; damage: number }> = [];

    // First target
    let currentDamage = damage;
    let currentSource = spawnPos;
    let currentTarget: Zombie | null = target;

    // Chain through multiple targets
    for (let jump = 0; jump < maxJumps && currentTarget; jump++) {
      this.applyDamageToZombie(currentTarget, tower, currentDamage);

      // Mark this zombie as hit
      hitZombies.add(currentTarget);

      // Add electric particle effect to zombie
      if (this.effectManager) {
        this.effectManager.spawnElectricParticles(currentTarget, jump === 0);
      }

      // Store chain info for visual
      chainTargets.push({
        from: { x: currentSource.x, y: currentSource.y },
        to: currentTarget,
        damage: currentDamage,
      });

      // Find next target for chain
      if (jump < maxJumps - 1) {
        const nextTarget = this.findNearestZombie(
          currentTarget.position.x,
          currentTarget.position.y,
          chainRange,
          hitZombies
        );

        if (nextTarget) {
          currentSource = { x: currentTarget.position.x, y: currentTarget.position.y };
          currentTarget = nextTarget;
          currentDamage *= damageReduction; // Reduce damage for next jump
        } else {
          break; // No more targets in range
        }
      }
    }

    // Spawn all lightning arcs via EffectManager
    if (this.effectManager) {
      for (let i = 0; i < chainTargets.length; i++) {
        const chain = chainTargets[i];
        const isFirstArc = i === 0;
        this.effectManager.spawnLightningArc(
          chain.from.x,
          chain.from.y,
          chain.to.position.x,
          chain.to.position.y,
          isFirstArc
        );
      }
    }
  }

  /**
   * Find the nearest zombie within range that hasn't been hit yet
   */
  private findNearestZombie(
    x: number,
    y: number,
    maxRange: number,
    excludeZombies: Set<Zombie>
  ): Zombie | null {
    let nearestZombie: Zombie | null = null;
    let nearestDistance = Infinity;

    for (const zombie of this.zombies) {
      // Skip if zombie is destroyed, already hit, or out of range
      if (!zombie.parent || excludeZombies.has(zombie)) {
        continue;
      }

      const distance = Math.sqrt((x - zombie.position.x) ** 2 + (y - zombie.position.y) ** 2);

      if (distance <= maxRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestZombie = zombie;
      }
    }

    return nearestZombie;
  }
}
