import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { HealthComponent } from '../components/HealthComponent';
import { GameConfig } from '../config/gameConfig';
import { WaveManager } from '../managers/WaveManager';
import { Container, Graphics } from 'pixi.js';

export class Zombie extends GameObject {
  private type: string;
  private speed: number = 0;
  private baseSpeed: number = 0; // Base speed before variation
  private reward: number = 0;
  private damage: number = 1; // Damage dealt to survivor camp
  private currentWaypointIndex: number = 0;
  private waypoints: { x: number; y: number }[] = [];
  private visual!: Graphics;
  private healthBar: Container | null = null;
  private healthBarBg!: Graphics;
  private healthBarFg!: Graphics;
  private healthComponent!: HealthComponent;
  private transformComponent!: TransformComponent;
  private swayTime: number = 0; // Time accumulator for sway animation
  private swayOffset: number = 0; // Random offset for varied sway timing
  private speedVariation: number = 1.0; // Random speed multiplier for variation

  constructor(type: string, x: number, y: number, wave: number) {
    super();
    this.type = type;
    this.currentWaypointIndex = 0;

    // Set the container position
    this.position.set(x, y);

    // Initialize components
    this.transformComponent = new TransformComponent(x, y);
    this.addComponent(this.transformComponent);

    // Initialize waypoints (simplified for now)
    this.waypoints = [
      { x, y },
      { x: x + 100, y: y },
    ]; // Placeholder

    // Random sway offset so zombies don't all sway in sync
    this.swayOffset = Math.random() * Math.PI * 2;

    // Initialize health component based on zombie type
    this.initializeHealth(wave);

    // Initialize visual representation
    this.initializeVisual();
  }

  private initializeHealth(wave: number): void {
    const waveManager = new WaveManager();
    const health = waveManager.calculateZombieHealth(this.type, wave);

    // Add health component
    this.healthComponent = new HealthComponent(health);
    this.addComponent(this.healthComponent);

    // Set base speed, reward, and damage based on type
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.baseSpeed = 50; // pixels per second
        this.reward = 10;
        this.damage = 1; // 1 survivor killed
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.baseSpeed = 100;
        this.reward = 15;
        this.damage = 1; // Fast but weak
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.baseSpeed = 25;
        this.reward = 50;
        this.damage = 5; // Massive damage
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.baseSpeed = 40;
        this.reward = 30;
        this.damage = 3; // Heavy damage
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.baseSpeed = 60;
        this.reward = 5;
        this.damage = 1; // Small but numerous
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.baseSpeed = 70;
        this.reward = 25;
        this.damage = 2; // Moderate damage
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.baseSpeed = 55;
        this.reward = 40;
        this.damage = 4; // High-tech threat
        break;
      default:
        this.baseSpeed = 50;
        this.reward = 10;
        this.damage = 1;
    }
    
    // Apply random speed variation (±15%) for more organic movement
    this.speedVariation = 0.85 + Math.random() * 0.3;
    this.speed = this.baseSpeed * this.speedVariation;
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
        this.visual.circle(0, 0, 15).fill(0x6b8e23);
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

  // Basic Zombie Visual - Rotting flesh appearance
  private createBasicZombieVisual(): void {
    // Body (sickly green-gray)
    this.visual.circle(0, 0, 10).fill(0x6b8e23);

    // Darker patches (rotting flesh)
    this.visual.circle(-3, -2, 3).fill(0x556b2f);
    this.visual.circle(4, 1, 2).fill(0x4a5f1f);

    // Eyes (glowing red)
    this.visual.circle(-3, -3, 1.5).fill(0xff0000);
    this.visual.circle(3, -3, 1.5).fill(0xff0000);

    // Mouth (dark)
    this.visual.rect(-4, 3, 8, 2).fill(0x000000);

    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Fast Zombie Visual - Leaner, more aggressive
  private createFastZombieVisual(): void {
    // Elongated body
    this.visual.ellipse(0, 0, 8, 12).fill(0x7a9b3a);

    // Torn flesh patches
    this.visual.circle(-2, -4, 2).fill(0x5a7b2a);
    this.visual.circle(3, 2, 2).fill(0x4a6b1a);

    // Aggressive red eyes
    this.visual.circle(-2, -5, 2).fill(0xff4444);
    this.visual.circle(2, -5, 2).fill(0xff4444);

    // Snarling mouth
    this.visual.moveTo(-3, 4).lineTo(0, 6).lineTo(3, 4).stroke({ width: 2, color: 0x000000 });

    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Tank Zombie Visual - Massive and bloated
  private createTankZombieVisual(): void {
    // Large bloated body
    this.visual.roundRect(-15, -15, 30, 30, 5).fill(0x556b2f);

    // Bloated patches
    this.visual.circle(-5, -5, 6).fill(0x4a5f25);
    this.visual.circle(6, 4, 5).fill(0x3f5420);

    // Small beady eyes
    this.visual.circle(-6, -8, 2).fill(0xff0000);
    this.visual.circle(6, -8, 2).fill(0xff0000);

    // Stitches/scars
    for (let i = 0; i < 3; i++) {
      this.visual
        .moveTo(-10, -5 + i * 5)
        .lineTo(10, -5 + i * 5)
        .stroke({ width: 1, color: 0x000000 });
    }

    this.visual.stroke({ width: 2, color: 0x000000 });
  }

  // Armored Zombie Visual - Plated and protected
  private createArmoredZombieVisual(): void {
    // Body
    this.visual.circle(0, 0, 11).fill(0x6b7b5f);

    // Armor plates
    this.visual.rect(-10, -6, 20, 4).fill(0x696969);
    this.visual.rect(-10, 2, 20, 4).fill(0x696969);

    // Helmet
    this.visual.rect(-8, -12, 16, 6).fill(0x808080);

    // Eye slits
    this.visual.rect(-6, -10, 4, 2).fill(0xff0000);
    this.visual.rect(2, -10, 4, 2).fill(0xff0000);

    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Swarm Zombie Visual - Small and numerous
  private createSwarmZombieVisual(): void {
    // Small body
    this.visual.circle(0, 0, 6).fill(0x8fbc8f);

    // Decay spots
    this.visual.circle(-2, -1, 2).fill(0x6f9c6f);
    this.visual.circle(2, 1, 1.5).fill(0x5f8c5f);

    // Tiny red eyes
    this.visual.circle(-2, -2, 1).fill(0xff0000);
    this.visual.circle(2, -2, 1).fill(0xff0000);

    this.visual.stroke({ width: 1, color: 0x000000 });
  }

  // Stealth Zombie Visual - Shadowy and translucent
  private createStealthZombieVisual(): void {
    // Semi-transparent body
    this.visual.circle(0, 0, 10).fill({ color: 0x2f4f4f, alpha: 0.6 });

    // Darker core
    this.visual.circle(0, 0, 6).fill({ color: 0x1f3f3f, alpha: 0.7 });

    // Glowing eyes
    this.visual.circle(-3, -3, 2).fill({ color: 0x00ff00, alpha: 0.8 });
    this.visual.circle(3, -3, 2).fill({ color: 0x00ff00, alpha: 0.8 });

    this.visual.stroke({ width: 1, color: 0x000000, alpha: 0.5 });
  }

  // Mechanical Zombie Visual - Robotic and industrial
  private createMechanicalZombieVisual(): void {
    // Metal body
    this.visual.circle(0, 0, 12).fill(0x708090);

    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = Math.cos(angle) * 12;
      const y1 = Math.sin(angle) * 12;
      const x2 = Math.cos(angle) * 15;
      const y2 = Math.sin(angle) * 15;
      this.visual.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 2, color: 0x000000 });
    }

    // Central core
    this.visual.circle(0, 0, 6).fill(0x505050);

    // Glowing mechanical eyes
    this.visual.circle(-4, -4, 2).fill(0xffff00);
    this.visual.circle(4, -4, 2).fill(0xffff00);

    // Bolts
    this.visual.circle(-6, 0, 1.5).fill(0x303030);
    this.visual.circle(6, 0, 1.5).fill(0x303030);

    this.visual.stroke({ width: 1, color: 0x000000 });
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

    const target = this.waypoints[this.currentWaypointIndex];

    // Calculate direction vector
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If we've reached the waypoint, move to the next one
    if (distance < 5) {
      this.currentWaypointIndex++;
      return;
    }

    // Normalize direction and apply speed
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    // Calculate movement for this frame (speed is in pixels per second)
    const moveX = normalizedDx * this.speed * (deltaTime / 1000);
    const moveY = normalizedDy * this.speed * (deltaTime / 1000);

    // Add shambling sway effect - perpendicular to movement direction
    this.swayTime += deltaTime / 1000;
    const swayFrequency = 1.5 + Math.random() * 0.5; // Varied sway speed (1.5-2.0 cycles/sec)
    const swayAmplitude = this.getSwayAmplitude(); // How far they sway (pixels)
    
    // Multiple sine waves for more organic, unpredictable movement
    const primarySway = Math.sin(this.swayTime * swayFrequency * Math.PI * 2 + this.swayOffset);
    const secondarySway = Math.sin(this.swayTime * swayFrequency * 1.7 * Math.PI * 2 + this.swayOffset * 0.7) * 0.3;
    const swayValue = primarySway + secondarySway;
    
    // Calculate perpendicular direction for sway (rotate 90 degrees)
    const perpX = -normalizedDy;
    const perpY = normalizedDx;
    
    // Apply sway offset perpendicular to movement direction
    const swayX = perpX * swayValue * swayAmplitude;
    const swayY = perpY * swayValue * swayAmplitude;

    // Update container position with movement and sway
    this.position.x += moveX + swayX * (deltaTime / 1000);
    this.position.y += moveY + swayY * (deltaTime / 1000);

    // Update transform component to stay in sync
    this.transformComponent.setPosition(this.position.x, this.position.y);
  }

  // Get sway amplitude based on zombie type (increased for more shambling)
  private getSwayAmplitude(): number {
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        return 18; // Heavy shamble
      case GameConfig.ZOMBIE_TYPES.FAST:
        return 10; // Quick, darting movement
      case GameConfig.ZOMBIE_TYPES.TANK:
        return 25; // Massive lumbering sway
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        return 14; // Heavy armored shamble
      case GameConfig.ZOMBIE_TYPES.SWARM:
        return 22; // Very erratic, chaotic movement
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        return 12; // Weaving, unpredictable
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        return 8; // Slight mechanical drift
      default:
        return 18;
    }
  }

  // Show damage indicator when taking damage
  public takeDamage(damage: number): number {
    // Apply damage to health component
    const actualDamage = this.healthComponent.takeDamage(damage);

    // Visual feedback for damage
    if (this.visual) {
      // Flash red to indicate damage
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
    // Trigger death effects
    this.onDeath();
  }

  // Method called when zombie dies
  private onDeath(): void {
    // Emit death event with position and type for blood/corpse systems
    this.emit('zombieDeath', {
      x: this.position.x,
      y: this.position.y,
      type: this.type,
      size: this.getVisualSize(),
    });
  }

  // Get visual size for corpse creation
  private getVisualSize(): number {
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.TANK:
        return 15;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        return 11;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        return 6;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        return 12;
      default:
        return 10;
    }
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

  public getDamage(): number {
    return this.damage;
  }
}
