import { Tower } from '../objects/Tower';
import { Zombie } from '../objects/Zombie';
import { TransformComponent } from '../components/TransformComponent';
import { ProjectileManager } from './ProjectileManager';
import { Container, Graphics } from 'pixi.js';

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

    // Tesla tower uses instant lightning arc instead of projectile
    if (projectileType === 'tesla') {
      this.createLightningArc(tower, spawnPos, target, damage);
      return;
    }

    // Flame tower shoots fireball projectile
    if (projectileType === 'flame') {
      const speed = 400;
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

  private createLightningArc(
    tower: Tower,
    spawnPos: { x: number; y: number },
    target: Zombie,
    damage: number
  ): void {
    // Apply damage instantly
    target.takeDamage(damage);

    // Create visual lightning arc effect
    const lightningGraphics = new Graphics();

    // Draw arcing lightning bolt
    const startX = spawnPos.x;
    const startY = spawnPos.y;
    const endX = target.position.x;
    const endY = target.position.y;

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

        const offset = (Math.random() - 0.5) * 20; // Random offset
        points.push({
          x: x + normalizedPerpX * offset,
          y: y + normalizedPerpY * offset,
        });
      } else {
        points.push({ x, y });
      }
    }

    // Draw main lightning bolt (bright cyan)
    lightningGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      lightningGraphics.lineTo(points[i].x, points[i].y);
    }
    lightningGraphics.stroke({ width: 3, color: 0x00ffff });

    // Draw glow effect (wider, semi-transparent)
    lightningGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      lightningGraphics.lineTo(points[i].x, points[i].y);
    }
    lightningGraphics.stroke({ width: 6, color: 0x00ffff, alpha: 0.5 });

    // Draw outer glow (even wider, more transparent)
    lightningGraphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      lightningGraphics.lineTo(points[i].x, points[i].y);
    }
    lightningGraphics.stroke({ width: 10, color: 0xffffff, alpha: 0.3 });

    // Add branching arcs (smaller side bolts)
    for (let i = 2; i < points.length - 2; i += 2) {
      if (Math.random() > 0.5) {
        const branchLength = 15 + Math.random() * 20;
        const angle = Math.random() * Math.PI * 2;
        const branchEndX = points[i].x + Math.cos(angle) * branchLength;
        const branchEndY = points[i].y + Math.sin(angle) * branchLength;

        lightningGraphics.moveTo(points[i].x, points[i].y);
        lightningGraphics.lineTo(branchEndX, branchEndY);
        lightningGraphics.stroke({ width: 2, color: 0x00ffff, alpha: 0.7 });
      }
    }

    // Add to tower's parent container
    if (tower.parent) {
      tower.parent.addChild(lightningGraphics);
    }

    // Remove lightning after short duration
    setTimeout(() => {
      if (lightningGraphics.parent) {
        lightningGraphics.parent.removeChild(lightningGraphics);
      }
      lightningGraphics.destroy();
    }, 100); // Lightning lasts 100ms
  }

  private createFlameStream(
    tower: Tower,
    spawnPos: { x: number; y: number },
    target: Zombie,
    damage: number
  ): void {
    // Apply damage instantly
    target.takeDamage(damage);

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
    const angle = Math.atan2(dy, dx);

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

    // Remove flame after short duration
    setTimeout(() => {
      if (flameGraphics.parent) {
        flameGraphics.parent.removeChild(flameGraphics);
      }
      flameGraphics.destroy();
    }, 120); // Flame lasts 120ms
  }
}
