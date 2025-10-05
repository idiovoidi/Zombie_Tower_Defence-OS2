import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { HealthComponent } from '../components/HealthComponent';
import { GameConfig } from '../config/gameConfig';
import { WaveManager } from '../managers/WaveManager';
import { PathfindingManager } from '../managers/PathfindingManager';
import { Graphics, Container } from 'pixi.js';
import { VisualEffects } from '../utils/VisualEffects';

export class Zombie extends GameObject {
  private type: string;
  private speed: number = 0;
  private reward: number = 0;
  private currentWaypointIndex: number = 0;
  private waypoints: { x: number; y: number }[] = [];
  private visual!: Graphics;
  private healthBar: Container | null = null;
  private healthBarBg!: Graphics;
  private healthBarFg!: Graphics;
  private healthComponent!: HealthComponent;
  private transformComponent!: TransformComponent;

  constructor(type: string, x: number, y: number, wave: number) {
    super();
    this.type = type;
    this.currentWaypointIndex = 0;

    // Initialize components
    this.transformComponent = new TransformComponent(x, y);
    this.addComponent(this.transformComponent);

    // Initialize waypoints (simplified for now)
    this.waypoints = [
      { x, y },
      { x: x + 100, y: y },
    ]; // Placeholder

    // Initialize health component based on zombie type
    this.initializeHealth(wave);

    // Initialize visual representation
    this.initializeVisual();
  }

  private initializeHealth(wave: number): void {
    const waveManager = new WaveManager();
    const health = waveManager.calculateZombieHealth(this.type, wave);
    const damage = waveManager.calculateZombieDamage(this.type, wave);

    // Add health component
    this.healthComponent = new HealthComponent(health);
    this.addComponent(this.healthComponent);

    // Set speed based on type
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.speed = 50; // pixels per second
        this.reward = 10;
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.speed = 100;
        this.reward = 15;
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.speed = 25;
        this.reward = 50;
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.speed = 40;
        this.reward = 30;
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.speed = 60;
        this.reward = 5;
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.speed = 70;
        this.reward = 25;
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.speed = 55;
        this.reward = 40;
        break;
      default:
        this.speed = 50;
        this.reward = 10;
    }
  }

  // Update visual representation based on zombie type
  private initializeVisual(): void {
    this.visual = new Graphics();
    this.addChild(this.visual);

    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.createBasicZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.createFastZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.createTankZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.createArmoredZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.createSwarmZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.createStealthZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.createMechanicalZombieVisual();
        break;
      default:
        // Default visual if type not recognized
        this.visual.circle(0, 0, 15).fill(0x00ff00);
        this.visual.stroke({ width: 2, color: 0x000000 });
    }

    // Create health bar
    this.healthBarBg = new Graphics();
    this.healthBarBg.rect(-15, -25, 30, 5).fill(0xff0000);

    this.healthBarFg = new Graphics();
    this.healthBarFg.rect(-15, -25, 30, 5).fill(0x00ff00);

    this.healthBar = new Container();
    this.healthBar.addChild(this.healthBarBg);
    this.healthBar.addChild(this.healthBarFg);
    this.healthBar.visible = false; // Hide by default
    this.addChild(this.healthBar);
  }

  // Basic Zombie Visual
  private createBasicZombieVisual(): void {
    this.visual.circle(0, 0, 10).fill(0x008000); // Green
    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Fast Zombie Visual
  private createFastZombieVisual(): void {
    this.visual.ellipse(0, 0, 9, 12.5).fill(0x9acd32); // Yellow-green
    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Tank Zombie Visual
  private createTankZombieVisual(): void {
    this.visual.roundRect(-15, -15, 30, 30, 5).fill(0x006400); // Dark green
    this.visual.stroke({ width: 2, color: 0x000000 });
  }

  // Armored Zombie Visual
  private createArmoredZombieVisual(): void {
    // Circle body
    this.visual.circle(0, 0, 11).fill(0x556b2f); // Gray-green

    // Armor plate
    this.visual.rect(-12.5, -7.5, 25, 15).fill(0x808080); // Gray armor
    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Swarm Zombie Visual
  private createSwarmZombieVisual(): void {
    this.visual.circle(0, 0, 6).fill(0x90ee90); // Light green
    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Stealth Zombie Visual
  private createStealthZombieVisual(): void {
    this.visual.circle(0, 0, 10).fill({ color: 0x2f4f4f, alpha: 0.5 }); // Dark gray with transparency
    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Mechanical Zombie Visual
  private createMechanicalZombieVisual(): void {
    // Gear-like shape (simplified as a circle with lines)
    this.visual.circle(0, 0, 12.5).fill(0x808080); // Metallic gray
    this.visual.stroke({ width: 1, color: 0x000000 });

    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = Math.cos(angle) * 12.5;
      const y1 = Math.sin(angle) * 12.5;
      const x2 = Math.cos(angle) * 16;
      const y2 = Math.sin(angle) * 16;
      this.visual.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 2, color: 0x000000 });
    }
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);

    // Update health bar
    const healthComponent = this.getComponent<HealthComponent>('Health');
    if (healthComponent && this.healthBar) {
      const healthPercentage = healthComponent.getHealthPercentage();
      this.healthBarFg.width = 30 * (healthPercentage / 100);

      // Show health bar when damaged
      if (healthPercentage < 100) {
        this.healthBar.visible = true;
      }
    }

    // Move towards next waypoint
    this.moveTowardsWaypoint(deltaTime);
  }

  private moveTowardsWaypoint(deltaTime: number): void {
    if (this.currentWaypointIndex >= this.waypoints.length) return;

    const transform = this.getComponent<TransformComponent>('Transform');
    if (!transform) return;

    const target = this.waypoints[this.currentWaypointIndex];
    const currentPosition = transform.position;

    // Calculate direction vector
    const dx = target.x - currentPosition.x;
    const dy = target.y - currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If we've reached the waypoint, move to the next one
    if (distance < 5) {
      this.currentWaypointIndex++;
      return;
    }

    // Normalize direction and apply speed
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    // Update velocity
    transform.setVelocity(normalizedDx * this.speed, normalizedDy * this.speed);
  }

  // Show damage indicator when taking damage
  public takeDamage(damage: number): number {
    // Apply damage to health component
    const actualDamage = this.healthComponent.takeDamage(damage);

    // Visual feedback for damage
    if (this.visual) {
      // Store original color values
      const originalFill = (this.visual as any).fillColor || 0xff0000;
      const originalAlpha = (this.visual as any).alpha || 1;

      // Flash red to indicate damage
      // Note: This is a simplified approach - in a real implementation,
      // you would use proper PIXI methods to change the visual properties
      this.visual.tint = 0xff0000;

      // Reset color after a short delay
      setTimeout(() => {
        if (this.visual) {
          this.visual.tint = 0xffffff; // Reset to default
        }
      }, 100);
    }

    // Check if zombie is dead
    if (!this.healthComponent.isAlive()) {
      this.onDeath();
    }

    return actualDamage;
  }

  // Method to show damage effect (for testing)
  public showDamageEffect(damage: number): void {
    // In a real implementation, this would show a visual effect
    // For now, it's just a placeholder for testing
    console.log(`Zombie took ${damage} damage`);
  }

  // Method to show death effect (for testing)
  public showDeathEffect(): void {
    // In a real implementation, this would show a visual effect
    // For now, it's just a placeholder for testing
    console.log('Zombie died');
  }

  // Method called when zombie dies
  private onDeath(): void {
    // Handle zombie death
    console.log('Zombie died');
  }

  // Check if zombie has reached the end
  public hasReachedEnd(): boolean {
    return this.currentWaypointIndex >= this.waypoints.length;
  }

  // Getters
  public getType(): string {
    return this.type;
  }

  public getReward(): number {
    return this.reward;
  }

  public getSpeed(): number {
    return this.speed;
  }
}
