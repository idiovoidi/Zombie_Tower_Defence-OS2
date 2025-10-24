import { Tower } from '../objects/Tower';
import { Zombie } from '../objects/Zombie';
import { ProjectileManager } from './ProjectileManager';
import { Graphics } from 'pixi.js';
import { SpatialGrid } from '../utils/SpatialGrid';
import { EffectCleanupManager } from '../utils/EffectCleanupManager';

export class TowerCombatManager {
  private towers: Tower[] = [];
  private zombies: Zombie[] = [];
  private projectileManager: ProjectileManager | null = null;
  private onDamageCallback:
    | ((damage: number, towerType: string, killed: boolean, overkill: number) => void)
    | null = null;
  private zombieGrid: SpatialGrid<Zombie>;

  constructor(worldWidth: number = 1024, worldHeight: number = 768) {
    // Create spatial grid with 128px cells (optimal for typical tower ranges of 150-300px)
    this.zombieGrid = new SpatialGrid<Zombie>(worldWidth, worldHeight, 128);
  }

  public setProjectileManager(projectileManager: ProjectileManager): void {
    this.projectileManager = projectileManager;
  }

  public setTowers(towers: Tower[]): void {
    this.towers = towers;
  }

  public setZombies(zombies: Zombie[]): void {
    this.zombies = zombies;

    // Rebuild spatial grid with new zombie list
    this.zombieGrid.clear();
    for (const zombie of zombies) {
      if (zombie.parent) {
        // Only add zombies that are active in the scene
        this.zombieGrid.insert(zombie);
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

    // Update zombie positions in spatial grid
    for (const zombie of this.zombies) {
      if (zombie.parent) {
        this.zombieGrid.update(zombie);
      }
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

  private shootAtTarget(tower: Tower, target: Zombie): void {
    tower.shoot();
    tower.showShootingEffect();

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
      const projectile = this.projectileManager.createProjectile(
        spawnPos.x,
        spawnPos.y,
        target.position.x,
        target.position.y,
        damage,
        speed,
        projectileType,
        target
      );
      projectile.setTowerType(tower.getType());
      if (this.onDamageCallback) {
        projectile.setOnDamageCallback(this.onDamageCallback);
      }
      return;
    }

    // Grenade tower shoots explosive projectile with arc trajectory
    if (projectileType === 'grenade') {
      const speed = 350; // Slower than bullets
      const projectile = this.projectileManager.createProjectile(
        spawnPos.x,
        spawnPos.y,
        target.position.x,
        target.position.y,
        damage,
        speed,
        projectileType,
        target
      );
      projectile.setTowerType(tower.getType());
      projectile.setUpgradeLevel(tower.getUpgradeLevel()); // Pass upgrade level for explosion scaling
      if (this.onDamageCallback) {
        projectile.setOnDamageCallback(this.onDamageCallback);
      }
      return;
    }

    // Sludge tower shoots toxic barrel with arc trajectory
    if (projectileType === 'sludge') {
      const speed = 300; // Similar to grenade but slightly slower
      const projectile = this.projectileManager.createProjectile(
        spawnPos.x,
        spawnPos.y,
        target.position.x,
        target.position.y,
        damage, // 0 damage - pure crowd control
        speed,
        projectileType,
        target
      );
      projectile.setTowerType(tower.getType());
      projectile.setUpgradeLevel(tower.getUpgradeLevel()); // Pass upgrade level for pool scaling
      if (this.onDamageCallback) {
        projectile.setOnDamageCallback(this.onDamageCallback);
      }
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

        const projectile = this.projectileManager.createProjectile(
          spawnPos.x,
          spawnPos.y,
          targetX,
          targetY,
          damagePerPellet,
          speed,
          projectileType,
          null // No specific target - pellets hit whatever they encounter
        );
        projectile.setTowerType(tower.getType());
        if (this.onDamageCallback) {
          projectile.setOnDamageCallback(this.onDamageCallback);
        }
      }
    } else {
      // Single projectile
      const projectile = this.projectileManager.createProjectile(
        spawnPos.x,
        spawnPos.y,
        target.position.x,
        target.position.y,
        damage,
        speed,
        projectileType,
        target
      );
      projectile.setTowerType(tower.getType());
      if (this.onDamageCallback) {
        projectile.setOnDamageCallback(this.onDamageCallback);
      }
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

    // Create visual lightning graphics
    const lightningGraphics = new Graphics();

    // Chain through multiple targets
    for (let jump = 0; jump < maxJumps && currentTarget; jump++) {
      // Apply damage modifier based on zombie type
      const modifier = currentTarget.getDamageModifier(tower.getType());
      const modifiedDamage = currentDamage * modifier;

      // Apply damage instantly
      const healthBefore = currentTarget.getHealth();
      currentTarget.takeDamage(modifiedDamage);
      const healthAfter = currentTarget.getHealth();
      const actualDamage = healthBefore - healthAfter;
      const killed = healthAfter <= 0;
      const overkill = killed ? Math.abs(healthAfter) : 0;

      // Track damage
      if (this.onDamageCallback) {
        this.onDamageCallback(actualDamage, tower.getType(), killed, overkill);
      }

      // Mark this zombie as hit
      hitZombies.add(currentTarget);

      // Add electric particle effect to zombie
      this.createElectricParticles(currentTarget, jump === 0);

      // Store chain info for visual
      chainTargets.push({
        from: { x: currentSource.x, y: currentSource.y },
        to: currentTarget,
        damage: modifiedDamage,
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

    // Draw all lightning arcs
    for (let i = 0; i < chainTargets.length; i++) {
      const chain = chainTargets[i];
      const isFirstArc = i === 0;
      this.drawLightningBolt(
        lightningGraphics,
        chain.from.x,
        chain.from.y,
        chain.to.position.x,
        chain.to.position.y,
        isFirstArc
      );
    }

    // Add to tower's parent container
    if (tower.parent) {
      tower.parent.addChild(lightningGraphics);
    }

    // Remove lightning after short duration (tracked to prevent memory leaks)
    EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        if (lightningGraphics.parent) {
          lightningGraphics.parent.removeChild(lightningGraphics);
        }
        lightningGraphics.destroy();
      }, 150)
    ); // Lightning lasts 150ms for chain effect
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

      const distance = Math.sqrt(
        Math.pow(x - zombie.position.x, 2) + Math.pow(y - zombie.position.y, 2)
      );

      if (distance <= maxRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestZombie = zombie;
      }
    }

    return nearestZombie;
  }

  /**
   * Draw a lightning bolt between two points
   */
  private drawLightningBolt(
    graphics: Graphics,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    isPrimary: boolean
  ): void {
    // Calculate segments for the arc
    const segments = 8;
    const points: { x: number; y: number }[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;

      // Add random offset perpendicular to the line (except for start and end)
      if (i > 0 && i < segments) {
        const perpX = -(endY - startY);
        const perpY = endX - startX;
        const length = Math.sqrt(perpX * perpX + perpY * perpY);
        const normalizedPerpX = perpX / length;
        const normalizedPerpY = perpY / length;

        const offset = (Math.random() - 0.5) * (isPrimary ? 20 : 15); // Smaller offset for chain arcs
        points.push({
          x: x + normalizedPerpX * offset,
          y: y + normalizedPerpY * offset,
        });
      } else {
        points.push({ x, y });
      }
    }

    // Draw main lightning bolt (bright cyan for primary, dimmer for chains)
    const mainColor = isPrimary ? 0x00ffff : 0x00ccff;
    const mainWidth = isPrimary ? 3 : 2;
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.stroke({ width: mainWidth, color: mainColor });

    // Draw glow effect (wider, semi-transparent)
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.stroke({ width: mainWidth * 2, color: mainColor, alpha: 0.5 });

    // Draw outer glow (even wider, more transparent)
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.stroke({ width: mainWidth * 3, color: 0xffffff, alpha: 0.3 });

    // Add bright flash at start and end points
    const flashSize = isPrimary ? 8 : 6;
    graphics.circle(startX, startY, flashSize).fill({ color: 0xffffff, alpha: 0.8 });
    graphics.circle(startX, startY, flashSize * 1.5).fill({ color: 0x00ffff, alpha: 0.5 });
    graphics.circle(endX, endY, flashSize).fill({ color: 0xffffff, alpha: 0.8 });
    graphics.circle(endX, endY, flashSize * 1.5).fill({ color: 0x00ffff, alpha: 0.5 });

    // Add branching arcs (smaller side bolts) - only for primary arc
    if (isPrimary) {
      for (let i = 2; i < points.length - 2; i += 2) {
        if (Math.random() > 0.5) {
          const branchLength = 15 + Math.random() * 20;
          const angle = Math.random() * Math.PI * 2;
          const branchEndX = points[i].x + Math.cos(angle) * branchLength;
          const branchEndY = points[i].y + Math.sin(angle) * branchLength;

          graphics.moveTo(points[i].x, points[i].y);
          graphics.lineTo(branchEndX, branchEndY);
          graphics.stroke({ width: 2, color: mainColor, alpha: 0.7 });
        }
      }
    }
  }

  private createFlameStream(
    tower: Tower,
    spawnPos: { x: number; y: number },
    target: Zombie,
    damage: number
  ): void {
    // Apply damage modifier based on zombie type
    const modifier = target.getDamageModifier(tower.getType());
    const modifiedDamage = damage * modifier;

    // Apply damage instantly
    const healthBefore = target.getHealth();
    target.takeDamage(modifiedDamage);
    const healthAfter = target.getHealth();
    const actualDamage = healthBefore - healthAfter;
    const killed = healthAfter <= 0;
    const overkill = killed ? Math.abs(healthAfter) : 0;

    // Track damage
    if (this.onDamageCallback) {
      this.onDamageCallback(actualDamage, tower.getType(), killed, overkill);
    }

    // Create visual flame stream effect
    const flameGraphics = new Graphics();

    const startX = spawnPos.x;
    const startY = spawnPos.y;
    const endX = target.position.x;
    const endY = target.position.y;

    // Calculate distance and angle
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const _angle = Math.atan2(dy, dx);

    // Create smooth cone-shaped flame stream
    const segments = 12;
    const maxWidth = 25; // Maximum width of flame cone

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const baseX = startX + dx * t;
      const baseY = startY + dy * t;

      // Cone width increases with distance
      const coneWidth = t * maxWidth;

      // Create multiple particles at this segment for density
      const particlesPerSegment = 3 + Math.floor(t * 4);

      for (let j = 0; j < particlesPerSegment; j++) {
        // Random position within cone width
        const perpX = -dy / distance;
        const perpY = dx / distance;
        const offset = (Math.random() - 0.5) * coneWidth;

        const x = baseX + perpX * offset;
        const y = baseY + perpY * offset;

        // Particle size increases then decreases
        const sizeProgress = Math.sin(t * Math.PI); // 0 to 1 to 0
        const size = 4 + sizeProgress * 8 + Math.random() * 3;

        // Smooth color gradient from white-hot to red
        let color: number;
        let alpha: number;

        if (t < 0.2) {
          // Hot core - white/bright yellow
          color = 0xffffff;
          alpha = 0.95;
        } else if (t < 0.4) {
          // Bright yellow
          color = 0xffff00;
          alpha = 0.9;
        } else if (t < 0.6) {
          // Orange
          color = 0xffa500;
          alpha = 0.85;
        } else if (t < 0.8) {
          // Dark orange
          color = 0xff8c00;
          alpha = 0.75;
        } else {
          // Red tips
          color = 0xff4500;
          alpha = 0.65;
        }

        // Draw flame particle with glow
        flameGraphics.circle(x, y, size * 1.8).fill({ color: 0xff6600, alpha: alpha * 0.25 });
        flameGraphics.circle(x, y, size * 1.3).fill({ color: 0xff8800, alpha: alpha * 0.4 });
        flameGraphics.circle(x, y, size).fill({ color, alpha });
      }
    }

    // Add wispy smoke at the end
    for (let i = 0; i < 8; i++) {
      const smokeT = 0.85 + i * 0.02;
      const smokeX = startX + dx * smokeT + (Math.random() - 0.5) * 30;
      const smokeY = startY + dy * smokeT + (Math.random() - 0.5) * 30;
      const smokeSize = 8 + Math.random() * 8;
      flameGraphics
        .circle(smokeX, smokeY, smokeSize)
        .fill({ color: 0x3a3a3a, alpha: 0.3 + Math.random() * 0.2 });
    }

    // Bright nozzle flash
    flameGraphics.circle(startX, startY, 8).fill({ color: 0xffffff, alpha: 0.95 });
    flameGraphics.circle(startX, startY, 12).fill({ color: 0xffff00, alpha: 0.6 });
    flameGraphics.circle(startX, startY, 16).fill({ color: 0xffa500, alpha: 0.3 });

    // Add to tower's parent container
    if (tower.parent) {
      tower.parent.addChild(flameGraphics);
    }

    // Remove flame after short duration (tracked to prevent memory leaks)
    EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        if (flameGraphics.parent) {
          flameGraphics.parent.removeChild(flameGraphics);
        }
        flameGraphics.destroy();
      }, 120)
    ); // Flame lasts 120ms
  }

  /**
   * Create electric particle effects on a zombie when hit by lightning
   */
  private createElectricParticles(zombie: Zombie, isPrimary: boolean): void {
    if (!zombie.parent) {
      return;
    }

    // Create particle container as a child of the zombie so it moves with it
    const particleContainer = new Graphics();
    zombie.addChild(particleContainer);

    // Number of particles based on whether it's primary or chain hit
    const particleCount = isPrimary ? 12 : 8;
    const particleSize = isPrimary ? 3 : 2;
    const spreadRadius = isPrimary ? 20 : 15;

    // Create electric sparks around the zombie (relative to zombie position)
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = Math.random() * spreadRadius;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      // Bright cyan spark
      particleContainer.circle(x, y, particleSize).fill({ color: 0x00ffff, alpha: 0.9 });

      // Glow around spark
      particleContainer.circle(x, y, particleSize * 2).fill({ color: 0xffffff, alpha: 0.5 });
    }

    // Electric ring around zombie (centered at 0,0 since it's a child)
    const ringRadius = isPrimary ? 18 : 14;
    particleContainer.circle(0, 0, ringRadius).stroke({ width: 2, color: 0x00ffff, alpha: 0.8 });
    particleContainer
      .circle(0, 0, ringRadius + 3)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.4 });

    // Electric arcs emanating from zombie center
    const arcCount = isPrimary ? 6 : 4;
    for (let i = 0; i < arcCount; i++) {
      const angle = (i / arcCount) * Math.PI * 2 + Math.random() * 0.5;
      const length = 10 + Math.random() * 15;
      const startX = Math.cos(angle) * 8;
      const startY = Math.sin(angle) * 8;
      const endX = startX + Math.cos(angle) * length;
      const endY = startY + Math.sin(angle) * length;

      // Jagged lightning arc
      const segments = 3;
      particleContainer.moveTo(startX, startY);
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const midX = startX + (endX - startX) * t;
        const midY = startY + (endY - startY) * t;
        const offset = (Math.random() - 0.5) * 8;
        const perpX = -(endY - startY);
        const perpY = endX - startX;
        const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
        const normalizedPerpX = perpX / perpLength;
        const normalizedPerpY = perpY / perpLength;

        particleContainer.lineTo(midX + normalizedPerpX * offset, midY + normalizedPerpY * offset);
      }
      particleContainer.stroke({ width: 1.5, color: 0x00ffff, alpha: 0.8 });
    }

    // Make zombie glow blue/cyan
    if (zombie['visual']) {
      const originalTint = zombie['visual'].tint;
      zombie['visual'].tint = 0x00ffff; // Cyan/electric blue tint

      // Fade back to original color
      let tintElapsed = 0;
      const tintDuration = isPrimary ? 300 : 200;
      const tintInterval = setInterval(() => {
        tintElapsed += 16;
        const progress = tintElapsed / tintDuration;

        if (progress >= 1 || !zombie['visual'] || zombie['visual'].destroyed) {
          clearInterval(tintInterval);
          if (zombie['visual'] && !zombie['visual'].destroyed) {
            zombie['visual'].tint = originalTint;
          }
        } else {
          // Interpolate from cyan back to original
          const r1 = 0x00;
          const g1 = 0xff;
          const b1 = 0xff;
          const r2 = (originalTint >> 16) & 0xff;
          const g2 = (originalTint >> 8) & 0xff;
          const b2 = originalTint & 0xff;

          const r = Math.floor(r1 + (r2 - r1) * progress);
          const g = Math.floor(g1 + (g2 - g1) * progress);
          const b = Math.floor(b1 + (b2 - b1) * progress);

          zombie['visual'].tint = (r << 16) | (g << 8) | b;
        }
      }, 16);
    }

    // Animate particles fading out (no scaling to prevent flying away)
    let elapsed = 0;
    const duration = isPrimary ? 250 : 180;
    const fadeInterval = EffectCleanupManager.registerInterval(
      setInterval(() => {
        elapsed += 16; // ~60fps
        const progress = elapsed / duration;

        if (progress >= 1) {
          EffectCleanupManager.clearInterval(fadeInterval);
          if (particleContainer.parent) {
            particleContainer.parent.removeChild(particleContainer);
          }
          particleContainer.destroy();
        } else {
          // Just fade out, no scaling
          particleContainer.alpha = 1 - progress;
        }
      }, 16)
    );
  }
}
