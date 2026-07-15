import { Container, Graphics } from 'pixi.js';
import { HealthComponent } from '../components/HealthComponent';
import { TransformComponent } from '../components/TransformComponent';
import { GameConfig } from '../config/gameConfig';
import {
  convertToTowerType,
  getDamageModifier,
  type TowerType,
  type ZombieType,
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
import type { BaseZombieRenderer } from '../renderers/zombies/BaseZombieRenderer';
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
  private lastDamageSourcePosition: { x: number; y: number } | null = null; // Position of last damage source
  private isDying = false; // Track if death animation is in progress
  private deathAnimationComplete = false; // Track if animation finished

  // Knockback properties
  private knockbackDistance = 0; // Remaining knockback distance to travel
  private knockbackDirection = { x: 0, y: 0 }; // Direction of knockback
  private knockbackSpeed = 200; // Pixels per second for knockback movement
  private isBeingKnockedBack = false; // Track if currently in knockback state

  // Burn/fire properties
  private fireExposureTime = 0; // Time spent in fire (ms) - resets when leaving fire
  private isBurning = false; // Whether zombie is currently ignited
  private burnDurationRemaining = 0; // Remaining burn time (ms)
  private burnDamagePerSecond = 25; // Base burn damage per second (75 total over 3s)
  private wasInFireLastFrame = false; // Track fire exposure for reset logic

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
    this.lastDamageSourcePosition = null;
    this.isSlowed = false;
    this.currentSlowPercent = 0;
    this.isBeingKnockedBack = false;
    this.knockbackDistance = 0;
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

    // Reset burn state
    this.fireExposureTime = 0;
    this.isBurning = false;
    this.burnDurationRemaining = 0;
    this.wasInFireLastFrame = false;
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

    // Set zombie type name for ragdoll configuration
    if (this.renderer) {
      (this.renderer as BaseZombieRenderer).setZombieType(this.type);
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

  public override update(deltaTime: number): void {
    super.update(deltaTime);

    // If dying, only update renderer (for death animation), skip movement/AI
    if (this.isDying) {
      if (this.renderer) {
        this.renderer.update(deltaTime, this.getRenderState());
        // Continue rendering even while dying
        this.renderer.render(this, this.getRenderState());

        // Add ragdoll graphics to the zombie container if active
        const baseRenderer = this.renderer as BaseZombieRenderer;
        if (baseRenderer.isRagdolling?.()) {
          const ragdollGfx = baseRenderer.getRagdollGraphics?.();
          if (ragdollGfx && !ragdollGfx.parent) {
            this.addChild(ragdollGfx);
          }
        }
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

    // Update burn state (apply damage if burning)
    this.updateBurn(deltaTime);

    // Reset fire exposure tracking if not in fire this frame
    // (This will be set to true by the fire pool system if zombie is in fire)
    if (!this.wasInFireLastFrame && !this.isBurning) {
      this.fireExposureTime = 0;
    }
    this.wasInFireLastFrame = false;
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

    // Handle knockback movement first (takes priority over normal movement)
    if (this.isBeingKnockedBack && this.knockbackDistance > 0) {
      this.updateKnockback(deltaTime);
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

  /**
   * Apply knockback to the zombie, pushing it back along the path
   * @param force - The knockback force (distance in pixels)
   * @param sourceX - X position of the knockback source (for direction)
   * @param sourceY - Y position of the knockback source (for direction)
   * @returns True if knockback was applied, false if zombie resists knockback
   */
  public applyKnockback(force: number, sourceX: number, sourceY: number): boolean {
    // Calculate knockback resistance based on zombie type
    const resistance = this.getKnockbackResistance();
    const actualForce = force * (1 - resistance);

    // If resistance completely nullifies knockback, don't apply
    if (actualForce <= 0) {
      return false;
    }

    // Calculate knockback direction (away from source, along path)
    const dx = this.position.x - sourceX;
    const dy = this.position.y - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return false;
    }

    // Normalize direction
    this.knockbackDirection.x = dx / distance;
    this.knockbackDirection.y = dy / distance;
    this.knockbackDistance = actualForce;
    this.isBeingKnockedBack = true;

    return true;
  }

  /**
   * Get knockback resistance based on zombie type
   * Tank and Armored zombies resist knockback, small zombies are vulnerable
   */
  private getKnockbackResistance(): number {
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.TANK:
        return 0.9; // 90% resistant (hard to knock back)
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        return 0.7; // 70% resistant
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        return 0.6; // 60% resistant
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        return 0.3; // 30% resistant
      case GameConfig.ZOMBIE_TYPES.FAST:
        return 0.2; // 20% resistant
      case GameConfig.ZOMBIE_TYPES.SWARM:
        return 0.1; // 10% resistant (very vulnerable)
      default:
        return 0.3; // 30% resistant (early game vulnerable to knockback)
    }
  }

  /**
   * Update knockback movement
   */
  private updateKnockback(deltaTime: number): void {
    const moveDistance = this.knockbackSpeed * (deltaTime / 1000);
    const actualMove = Math.min(moveDistance, this.knockbackDistance);

    // Apply knockback movement
    this.position.x += this.knockbackDirection.x * actualMove;
    this.position.y += this.knockbackDirection.y * actualMove;

    // Update remaining knockback distance
    this.knockbackDistance -= actualMove;

    // End knockback when distance is depleted
    if (this.knockbackDistance <= 0) {
      this.isBeingKnockedBack = false;
      this.knockbackDistance = 0;
    }

    // Update transform component
    this.transformComponent.setPosition(this.position.x, this.position.y);
  }

  /**
   * Check if zombie is currently being knocked back
   */
  public getIsBeingKnockedBack(): boolean {
    return this.isBeingKnockedBack;
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

  public takeDamage(
    damage: number,
    towerType?: string,
    sourceX?: number,
    sourceY?: number
  ): number {
    // Track damage source for death animation selection
    if (towerType && damage > 0) {
      this.lastDamageSource = towerType;
    }

    // Track source position for directional death effects
    if (sourceX !== undefined && sourceY !== undefined) {
      this.lastDamageSourcePosition = { x: sourceX, y: sourceY };
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

    const impactAngle = this.lastDamageSourcePosition
      ? Math.atan2(
          this.position.y - this.lastDamageSourcePosition.y,
          this.position.x - this.lastDamageSourcePosition.x
        )
      : Math.random() * Math.PI * 2;

    // Emit death event IMMEDIATELY for blood/corpse systems
    // This ensures corpse appears at death location before animation moves the zombie
    this.emit('zombieDeath', {
      x: this.position.x,
      y: this.position.y,
      type: this.type,
      size: this.getVisualSize(),
      killerType: this.lastDamageSource,
      impactAngle,
    });

    // Play death animation if using new renderer
    if (this.renderer) {
      await this.renderer.playDeathAnimation(this.lastDamageSource, impactAngle);
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

  /**
   * Update fire exposure - called when zombie is standing in fire
   * After 1 second of continuous exposure, zombie gets ignited
   */
  public updateFireExposure(deltaTime: number): void {
    this.wasInFireLastFrame = true;

    // If already burning, don't accumulate more exposure time
    // Instead, extend burn duration slightly (refresh the fire)
    if (this.isBurning) {
      // Refresh burn duration up to max (add 0.5s per frame in fire, cap at 3s)
      const maxBurnDuration = 3000; // 3 seconds
      this.burnDurationRemaining = Math.min(
        this.burnDurationRemaining + deltaTime * 0.5,
        maxBurnDuration
      );
      return;
    }

    // Accumulate fire exposure time
    this.fireExposureTime += deltaTime;

    // Ignite after 1 second of continuous fire exposure
    const igniteTime = 1000; // 1 second
    if (this.fireExposureTime >= igniteTime) {
      this.applyIgnition();
    }
  }

  /**
   * Apply ignition - set zombie on fire for 3 seconds
   */
  private applyIgnition(): void {
    if (this.isBurning || this.isDying) {
      return;
    }

    this.isBurning = true;
    this.burnDurationRemaining = 3000; // 3 seconds of burn damage

    // Visual feedback via renderer
    if (this.renderer) {
      this.renderer.showBurningEffect?.();
    }
  }

  /**
   * Update burn state - apply damage and manage burn duration
   */
  private updateBurn(deltaTime: number): void {
    if (!this.isBurning || this.isDying) {
      return;
    }

    // Calculate damage for this frame
    const damageThisFrame = (this.burnDamagePerSecond * deltaTime) / 1000;
    this.takeDamage(damageThisFrame, 'Flame');

    // Reduce burn duration
    this.burnDurationRemaining -= deltaTime;

    // Stop burning when duration expires
    if (this.burnDurationRemaining <= 0) {
      this.isBurning = false;
      this.burnDurationRemaining = 0;

      // Stop visual effect via renderer
      if (this.renderer) {
        this.renderer.stopBurningEffect?.();
      }
    }
  }

  /**
   * Check if zombie is currently burning
   */
  public getIsBurning(): boolean {
    return this.isBurning;
  }

  /**
   * Get remaining burn duration (for visual effects)
   */
  public getBurnDurationRemaining(): number {
    return this.burnDurationRemaining;
  }

  /**
   * Get fire exposure progress (0 to 1, where 1 = ignited)
   */
  public getFireExposureProgress(): number {
    if (this.isBurning) {
      return 1;
    }
    return Math.min(this.fireExposureTime / 1000, 1);
  }
}
