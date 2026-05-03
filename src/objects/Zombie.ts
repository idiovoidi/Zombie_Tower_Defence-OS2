import { Container, Graphics } from 'pixi.js';
import { HealthComponent } from '../components/HealthComponent';
import { TransformComponent } from '../components/TransformComponent';
import { GameConfig } from '../config/gameConfig';
import {
  type TowerType,
  type ZombieType,
  convertToTowerType,
  getDamageModifier,
} from '../config/zombieResistances';
import {
  ArmoredZombieRenderer,
  BasicZombieRenderer,
  FastZombieRenderer,
  MechanicalZombieRenderer,
  StealthZombieRenderer,
  SwarmZombieRenderer,
  TankZombieRenderer,
} from '../renderers/zombies';
import type { IZombieRenderer, ZombieRenderState } from '../renderers/zombies/ZombieRenderer';
import { ZombieStats } from '../utils/ZombieStats';
import { GameObject } from './GameObject';

export class Zombie extends GameObject {
  private type: string;
  private speed = 0;
  private baseSpeed = 0; // Base speed before variation
  private reward = 0;
  private damage = 1; // Damage dealt to survivor camp
  private currentWaypointIndex = 0;
  private waypoints: { x: number; y: number }[] = [];
  private healthBar: Container | null = null;
  private healthBarBg!: Graphics;
  private healthBarFg!: Graphics;
  private healthComponent!: HealthComponent;
  private transformComponent!: TransformComponent;
  private swayTime = 0; // Time accumulator for sway animation
  private swayOffset = 0; // Random offset for varied sway timing
  private speedVariation = 1.0; // Random speed multiplier for variation
  private isSlowed = false; // Track if zombie is currently slowed
  private currentSlowPercent = 0; // Current slow percentage applied
  private renderer: IZombieRenderer | null = null; // Modular renderer
  private lastDamageSource = 'unknown'; // Track tower type that dealt damage
  private isDying = false; // Track if death animation is in progress
  private deathAnimationComplete = false; // Track if animation finished

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

  public init(x: number, y: number, wave: number): void {
    this.position.set(x, y);
    this.transformComponent.setPosition(x, y);

    this.currentWaypointIndex = 0;
    this.isDying = false;
    this.deathAnimationComplete = false;
    this.isSlowed = false;
    this.currentSlowPercent = 0;
    this.visible = true;
    this.alpha = 1;
    this.scale.set(1);
    this.swayTime = 0;

    // Reset Health
    const health = ZombieStats.calculateZombieHealth(this.type, wave);
    if (this.healthComponent) {
      this.healthComponent.reset(health);
    }

    // Restore base speed
    this.speedVariation = 0.85 + Math.random() * 0.3;
    this.speed = this.baseSpeed * this.speedVariation;

    if (this.healthBar) {
      this.healthBar.visible = false;
    }

    // Reset renderer
    if (this.renderer) {
      this.renderer.reset?.();
    }
  }

  private initializeHealth(wave: number): void {
    const health = ZombieStats.calculateZombieHealth(this.type, wave);

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

  // Initialize modular renderer based on zombie type
  private initializeVisual(): void {
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.renderer = new BasicZombieRenderer();
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.renderer = new FastZombieRenderer();
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.renderer = new TankZombieRenderer();
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.renderer = new ArmoredZombieRenderer();
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.renderer = new SwarmZombieRenderer();
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.renderer = new StealthZombieRenderer();
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.renderer = new MechanicalZombieRenderer();
        break;
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

  public update(deltaTime: number): void {
    super.update(deltaTime);

    // If dying, only update renderer (for death animation), skip movement/AI
    if (this.isDying) {
      if (this.renderer) {
        this.renderer.update(deltaTime, this.getRenderState());
        // Continue rendering even while dying
        this.renderer.render(this, this.getRenderState());
      }
      return;
    }

    // Update new renderer if using it
    if (this.renderer) {
      const state = this.getRenderState();
      this.renderer.update(deltaTime, state);
      this.renderer.render(this, state);
    }

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

  private getRenderState(): ZombieRenderState {
    const target = this.waypoints[this.currentWaypointIndex] || this.waypoints[0];
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      position: { x: this.position.x, y: this.position.y },
      health: this.healthComponent.getHealth(),
      maxHealth: this.healthComponent.getMaxHealth(),
      speed: this.speed,
      direction: distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 },
      isMoving: this.currentWaypointIndex < this.waypoints.length,
      isDamaged: false,
      statusEffects: [],
    };
  }

  private moveTowardsWaypoint(deltaTime: number): void {
    if (this.currentWaypointIndex >= this.waypoints.length) {
      return;
    }

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

    // OPTIMIZATION: Simplified sway calculation (single sine wave instead of two)
    // This reduces Math.sin() calls from 2 to 1 per zombie per frame
    this.swayTime += deltaTime / 1000;
    const swayFrequency = 0.8; // Reduced from 1.5 for gentler movement
    const swayAmplitude = this.getSwayAmplitude();

    // Single sine wave for sway with random offset for desynchronization
    const swayValue = Math.sin(this.swayTime * swayFrequency * Math.PI * 2 + this.swayOffset);

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

  // Get sway amplitude based on zombie type (reduced for subtler movement)
  private getSwayAmplitude(): number {
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        return 8; // Subtle shamble
      case GameConfig.ZOMBIE_TYPES.FAST:
        return 5; // Quick, darting movement
      case GameConfig.ZOMBIE_TYPES.TANK:
        return 12; // Lumbering sway
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        return 7; // Heavy armored shamble
      case GameConfig.ZOMBIE_TYPES.SWARM:
        return 10; // Erratic movement
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        return 6; // Weaving, unpredictable
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        return 4; // Slight mechanical drift
      default:
        return 8;
    }
  }

  // Show damage indicator when taking damage
  public getHealth(): number {
    return this.healthComponent.getHealth();
  }

  public takeDamage(damage: number, towerType?: string): number {
    // Track damage source for death animation selection
    if (towerType && damage > 0) {
      this.lastDamageSource = towerType;
    }

    // Apply damage to health component
    const actualDamage = this.healthComponent.takeDamage(damage);

    // Visual feedback for damage via renderer
    if (this.renderer) {
      this.renderer.showDamageEffect(towerType || 'unknown', actualDamage);
    }

    // Check if zombie is dead
    if (!this.healthComponent.isAlive()) {
      this.onDeath();
    }

    return actualDamage;
  }

  // Method to show damage effect (for testing)
  public showDamageEffect(_damage: number): void {
    // Visual damage effects are handled by the renderer
    // This method is kept for potential future enhancements
  }

  // Method to show death effect (for testing)
  public showDeathEffect(): void {
    // Trigger death effects
    this.onDeath();
  }

  // Method called when zombie dies
  private async onDeath(): Promise<void> {
    // Prevent multiple death triggers
    if (this.isDying) return;
    this.isDying = true;

    // Emit death event IMMEDIATELY for blood/corpse systems
    // This ensures corpse appears at death location before animation moves the zombie
    this.emit('zombieDeath', {
      x: this.position.x,
      y: this.position.y,
      type: this.type,
      size: this.getVisualSize(),
      killerType: this.lastDamageSource,
    });

    // Play death animation if using new renderer
    if (this.renderer) {
      await this.renderer.playDeathAnimation(this.lastDamageSource);
    }

    // Mark animation complete so ZombieManager can remove this zombie
    this.deathAnimationComplete = true;
  }

  /**
   * Check if zombie is currently in death animation
   */
  public isDeathAnimationComplete(): boolean {
    return this.deathAnimationComplete;
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

  /**
   * Get the renderer's graphics for visual effects
   */
  public getRendererGraphics(): Graphics | null {
    // Access graphics property from BaseZombieRenderer
    return (this.renderer as unknown as { graphics?: Graphics })?.graphics || null;
  }

  public getReward(): number {
    return this.reward;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public applySlow(slowPercent: number): void {
    // Only apply if not already slowed, or if new slow is stronger
    if (!this.isSlowed || slowPercent > this.currentSlowPercent) {
      // Remove old slow if exists
      if (this.isSlowed) {
        this.removeSlow();
      }
      // Apply new slow based on base speed
      this.isSlowed = true;
      this.currentSlowPercent = slowPercent;
      this.speed = this.baseSpeed * this.speedVariation * (1 - slowPercent);
    }
  }

  public removeSlow(): void {
    if (this.isSlowed) {
      this.isSlowed = false;
      this.currentSlowPercent = 0;
      // Restore speed to base speed with variation
      this.speed = this.baseSpeed * this.speedVariation;
    }
  }

  public isCurrentlySlowed(): boolean {
    return this.isSlowed;
  }

  public getDamage(): number {
    return this.damage;
  }

  /**
   * Get damage modifier for this zombie type against a specific tower type
   * @param towerType - The type of tower dealing damage (can be string or TowerType)
   * @returns Damage multiplier (e.g., 1.5 = 150% damage, 0.75 = 75% damage)
   */
  public getDamageModifier(towerType: TowerType | string): number {
    const convertedTowerType =
      typeof towerType === 'string' ? convertToTowerType(towerType) : towerType;
    return getDamageModifier(this.type.toUpperCase() as ZombieType, convertedTowerType);
  }

  /**
   * Override destroy to clean up timers and prevent memory leaks
   */
  public override destroy(): void {
    // Destroy renderer if it exists
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    // Call parent destroy to clean up components and PixiJS objects
    super.destroy();
  }

  /**
   * Check if zombie is currently dying (animation in progress)
   */
  public getIsDying(): boolean {
    return this.isDying;
  }
}
