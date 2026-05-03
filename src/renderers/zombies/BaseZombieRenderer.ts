import { type Container, Graphics } from 'pixi.js';
import { EffectCleanupManager } from '../../utils/EffectCleanupManager';
import {
  calculateDeathImpulses,
  createRagdollConfig,
  getDeathBloodConfig,
  getDetachableBones,
} from './RagdollConfig';
import { RagdollSkeleton } from './RagdollSkeleton';
import { ZombieAnimator } from './ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from './ZombieParticleSystem';
import type { IZombieRenderer, ZombieRenderState } from './ZombieRenderer';

export interface DeathAnimConfig {
  phase1Duration: number; // ms
  phase2Duration: number; // ms
  phase3Duration: number; // ms
  phase1MaxRotation: number;
  phase1MaxScale: number;
  phase3YDrift: number;
}

export interface DamageEffectConfig {
  flashTint: number;
  particles: Array<{
    type: ParticleType;
    count: number;
    velocity: number;
    lifetime: number;
    size: number;
  }>;
}

export interface DeathParticleConfig {
  particles: Array<{
    type: ParticleType;
    count: number;
    velocity: number;
    lifetime: number;
    size: number;
  }>;
}

/**
 * Abstract base for all zombie renderers.
 * Provides shared constructor, destroy, update, showDamageEffect, playDeathAnimation, getGraphics.
 * Subclasses implement render() and supply config via protected readonly properties.
 *
 * Death animations now use a procedural ragdoll skeleton system with directional
 * impulses based on the killing tower type and impact direction.
 */
export abstract class BaseZombieRenderer implements IZombieRenderer {
  protected graphics: Graphics;
  protected animator: ZombieAnimator;
  protected particles: ZombieParticleSystem;
  protected deathAnimationFrame: number | null = null;

  // Burning effect properties
  protected isBurning = false;
  protected burnParticleTimer = 0;

  // Ragdoll death state
  private ragdoll: RagdollSkeleton | null = null;
  private isInRagdollDeath = false;
  private ragdollGraphics: Graphics | null = null;
  private ragdollAlpha = 1;

  // Track last known zombie type for ragdoll config
  private zombieTypeName = 'Basic';

  /** Animator type string passed to ZombieAnimator */
  protected abstract readonly ANIMATOR_TYPE: string;

  /** Tint color flashed on damage */
  protected abstract readonly DAMAGE_FLASH_TINT: number;

  /** Particles emitted on damage */
  protected abstract readonly DAMAGE_PARTICLES: DamageEffectConfig['particles'];

  /** Particles emitted at death */
  protected abstract readonly DEATH_PARTICLES: DeathParticleConfig['particles'];

  /** Timing/motion config for the 3-phase death animation */
  protected abstract readonly DEATH_ANIM: DeathAnimConfig;

  constructor() {
    this.graphics = new Graphics();
    // ZombieAnimator is constructed after subclass sets ANIMATOR_TYPE
    // We defer via a post-construction init pattern using a getter
    this.animator = new ZombieAnimator(this.getAnimatorType());
    this.particles = new ZombieParticleSystem();
  }

  /** Override if ANIMATOR_TYPE isn't available at super() call time */
  protected getAnimatorType(): string {
    return this.ANIMATOR_TYPE;
  }

  /**
   * Set the zombie type name for ragdoll configuration.
   * Called by subclasses or externally to configure death physics.
   */
  public setZombieType(typeName: string): void {
    this.zombieTypeName = typeName;
  }

  abstract render(container: Container, state: ZombieRenderState): void;

  update(deltaTime: number, state: ZombieRenderState): void {
    // Pass health info to animator for damage-reactive animations
    this.animator.update(deltaTime, {
      isMoving: state.isMoving,
      health: state.health,
      maxHealth: state.maxHealth,
    });
    this.particles.update(deltaTime);
    this.updateBurningEffect(deltaTime);

    // Update ragdoll if active
    if (this.isInRagdollDeath && this.ragdoll) {
      this.ragdoll.update(deltaTime);

      // Render ragdoll onto its dedicated graphics
      if (this.ragdollGraphics && !this.ragdollGraphics.destroyed) {
        this.ragdollGraphics.clear();

        // Fade alpha as ragdoll settles
        if (this.ragdoll.isSettled()) {
          this.ragdollAlpha = Math.max(0, this.ragdollAlpha - deltaTime / 2000);
        }

        this.ragdoll.render(this.ragdollGraphics, this.ragdollAlpha);
        this.particles.render(this.ragdollGraphics);
      }
    }
  }

  showDamageEffect(damageType: string, _amount: number): void {
    const originalTint = this.graphics.tint;
    this.graphics.tint = this.DAMAGE_FLASH_TINT;
    const timeout = EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        EffectCleanupManager.clearTimeout(timeout);
        if (!this.graphics.destroyed) {
          this.graphics.tint = originalTint;
        }
      }, 100)
    );

    // Emit directional damage particles if we have a damage direction
    const direction =
      damageType !== 'unknown'
        ? { angle: Math.random() * Math.PI * 2, spread: Math.PI * 1.5 }
        : undefined;

    for (const p of this.DAMAGE_PARTICLES) {
      this.particles.emit(
        p.type,
        0,
        0,
        {
          count: p.count,
          velocity: p.velocity,
          lifetime: p.lifetime,
          size: p.size,
        },
        direction
      );
    }
  }

  /**
   * Play death animation using procedural ragdoll physics.
   *
   * @param killerType - The tower type that killed this zombie
   * @param impactAngle - Direction from damage source to zombie (radians)
   */
  async playDeathAnimation(
    killerType?: string,
    impactAngle?: number
  ): Promise<void> {
    const angle = impactAngle ?? Math.random() * Math.PI * 2;
    const killer = killerType ?? 'unknown';

    // Create ragdoll skeleton from zombie type config
    const config = createRagdollConfig(this.zombieTypeName, 18);
    this.ragdoll = new RagdollSkeleton(config);

    // Initialize from current position (center of graphics)
    this.ragdoll.initializeFromPose(0, 0, 0);

    // Calculate and apply death impulses
    const impulses = calculateDeathImpulses(
      killer,
      angle,
      this.zombieTypeName
    );
    this.ragdoll.applyImpulses(impulses);

    // Detach bones for extreme deaths
    const detachable = getDetachableBones(killer);
    for (const boneName of detachable) {
      this.ragdoll.detachBone(boneName);
    }

    // Add blood emission points
    const bloodConfig = getDeathBloodConfig(killer);
    for (const bp of bloodConfig) {
      this.ragdoll.addBloodEmitPoint(
        bp.boneName,
        bp.boneT,
        bp.rate,
        bp.duration
      );
    }

    // Wire ragdoll blood emission to particle system
    this.ragdoll.onBloodEmit = (x, y, vx, vy) => {
      this.particles.emitWithVelocity(
        ParticleType.BLOOD_TRAIL,
        x,
        y,
        vx,
        vy,
        { lifetime: 600, size: 2 }
      );
    };

    // Create ragdoll graphics
    this.ragdollGraphics = new Graphics();
    this.isInRagdollDeath = true;
    this.ragdollAlpha = 1;

    // Hide original zombie graphics
    this.graphics.alpha = 0;

    // Emit initial death particles in impact direction
    for (const p of this.DEATH_PARTICLES) {
      this.particles.emit(
        p.type,
        0,
        0,
        {
          count: Math.floor(p.count * 1.5),
          velocity: p.velocity * 1.2,
          lifetime: p.lifetime,
          size: p.size,
        },
        { angle, spread: 1.2 }
      );
    }

    // Blood mist for explosive deaths
    if (killer === 'Grenade' || killer === 'Tesla') {
      this.particles.emit(
        ParticleType.BLOOD_MIST,
        0,
        0,
        { count: 8, velocity: 40, lifetime: 1200, size: 6 }
      );
    }

    // Gore chunks for heavy kills
    if (
      killer === 'Grenade' ||
      killer === 'Shotgun' ||
      killer === 'Tesla'
    ) {
      this.particles.emit(
        ParticleType.GORE_CHUNK,
        0,
        0,
        {
          count: killer === 'Grenade' ? 6 : 3,
          velocity: killer === 'Grenade' ? 120 : 80,
          lifetime: 1500,
          size: 4,
        },
        { angle, spread: killer === 'Grenade' ? 3.0 : 1.5 }
      );
    }

    // Wait for ragdoll to settle
    return new Promise(resolve => {
      const checkDone = () => {
        if (!this.ragdoll || this.ragdoll.isSettled()) {
          // Give a brief fade-out period after settlement
          setTimeout(() => {
            this.isInRagdollDeath = false;
            if (this.ragdollGraphics && !this.ragdollGraphics.destroyed) {
              this.ragdollGraphics.destroy();
              this.ragdollGraphics = null;
            }
            this.ragdoll = null;
            resolve();
          }, 300);
        } else {
          this.deathAnimationFrame = requestAnimationFrame(checkDone);
        }
      };
      this.deathAnimationFrame = requestAnimationFrame(checkDone);
    });
  }

  /**
   * Get the ragdoll graphics for rendering by the zombie container.
   */
  public getRagdollGraphics(): Graphics | null {
    return this.ragdollGraphics;
  }

  /**
   * Check if currently in ragdoll death mode.
   */
  public isRagdolling(): boolean {
    return this.isInRagdollDeath;
  }

  reset(): void {
    // Cancel any ongoing death animation
    if (this.deathAnimationFrame !== null) {
      cancelAnimationFrame(this.deathAnimationFrame);
      this.deathAnimationFrame = null;
    }
    // Reset graphics transform and visibility
    this.graphics.alpha = 1;
    this.graphics.tint = 0xffffff;
    this.graphics.position.set(0, 0);
    this.graphics.rotation = 0;
    this.graphics.scale.set(1, 1);
    // Clear any particles
    this.particles.clear?.();
    // Stop burning effect
    this.stopBurningEffect();

    // Clean up ragdoll state
    this.isInRagdollDeath = false;
    this.ragdoll = null;
    this.ragdollAlpha = 1;
    if (this.ragdollGraphics && !this.ragdollGraphics.destroyed) {
      this.ragdollGraphics.destroy();
      this.ragdollGraphics = null;
    }
  }

  destroy(): void {
    if (this.deathAnimationFrame !== null) {
      cancelAnimationFrame(this.deathAnimationFrame);
      this.deathAnimationFrame = null;
    }
    this.graphics.destroy({ children: true });
    this.particles.destroy();

    if (this.ragdollGraphics && !this.ragdollGraphics.destroyed) {
      this.ragdollGraphics.destroy();
    }
  }

  getGraphics(): Graphics {
    return this.graphics;
  }

  /**
   * Show burning effect - emit fire particles from zombie
   */
  showBurningEffect(): void {
    if (this.isBurning) {
      return;
    }
    this.isBurning = true;
    this.burnParticleTimer = 0;

    // Apply orange tint to indicate burning
    this.graphics.tint = 0xff6600;

    // Emit initial burst of fire particles
    this.particles.emit(ParticleType.FIRE, 0, -5, {
      count: 8,
      velocity: 40,
      lifetime: 800,
      size: 5,
    });

    // Emit smoke
    this.particles.emit(ParticleType.SMOKE, 0, -10, {
      count: 4,
      velocity: 25,
      lifetime: 1200,
      size: 6,
    });
  }

  /**
   * Stop burning effect
   */
  stopBurningEffect(): void {
    if (!this.isBurning) {
      return;
    }
    this.isBurning = false;
    this.burnParticleTimer = 0;

    // Reset tint if not already dead
    if (!this.graphics.destroyed && this.graphics.alpha > 0.5) {
      this.graphics.tint = 0xffffff;
    }
  }

  /**
   * Update burning effect - emit continuous fire particles
   */
  updateBurningEffect(deltaTime: number): void {
    if (!this.isBurning) {
      return;
    }

    // Emit fire particles periodically while burning
    this.burnParticleTimer += deltaTime;
    if (this.burnParticleTimer >= 200) {
      // Every 200ms
      this.burnParticleTimer = 0;

      // Random position around the zombie body
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = -5 - Math.random() * 10;

      this.particles.emit(ParticleType.FIRE, offsetX, offsetY, {
        count: 2,
        velocity: 30,
        lifetime: 600,
        size: 4,
      });
    }
  }

  /**
   * Draw wound circles on the zombie body based on health percentage.
   * @param healthPercent - Current health / max health
   * @param torsoY - Y position of torso center for wound placement
   * @param woundColor - Color for wounds (usually blood red)
   * @param maxWounds - Maximum number of wounds at 0 health (default 4)
   * @param spreadX - Horizontal spread of wounds (default 7)
   * @param spreadY - Vertical spread of wounds (default 9)
   * @param baseSize - Base wound size (default 1)
   * @param sizeVar - Size variance (default 1.2)
   * @param alpha - Alpha for wounds (default 0.7)
   */
  protected drawWounds(
    healthPercent: number,
    torsoY: number,
    woundColor: number,
    maxWounds = 4,
    spreadX = 7,
    spreadY = 9,
    baseSize = 1,
    sizeVar = 1.2,
    alpha = 0.7
  ): void {
    const woundCount = Math.floor((1 - healthPercent) * maxWounds);
    for (let i = 0; i < woundCount; i++) {
      const x = (Math.random() - 0.5) * spreadX;
      const y = torsoY + (Math.random() - 0.5) * spreadY;
      this.graphics
        .circle(x, y, baseSize + Math.random() * sizeVar)
        .fill({ color: woundColor, alpha });
    }
  }

  /**
   * Apply standard grey tint based on health percentage.
   * Tints get darker as health decreases (75%, 50%, 25% thresholds).
   * @param healthPercent - Current health / max health
   */
  protected applyHealthTint(healthPercent: number): void {
    if (healthPercent < 0.25) {
      this.graphics.tint = 0x888888;
    } else if (healthPercent < 0.5) {
      this.graphics.tint = 0xaaaaaa;
    } else if (healthPercent < 0.75) {
      this.graphics.tint = 0xcccccc;
    } else {
      this.graphics.tint = 0xffffff;
    }
  }

  /**
   * Draw a zombie arm with configurable parameters.
   * @param x - Arm start X
   * @param y - Arm start Y
   * @param angle - Arm angle
   * @param alpha - Opacity
   * @param armColor - Arm color
   * @param armLength - Arm length (default 7)
   * @param options - Additional styling options
   */
  protected drawArm(
    x: number,
    y: number,
    angle: number,
    alpha: number,
    armColor: number,
    armLength = 7,
    options: {
      outlineColor?: number;
      lineWidth?: number;
      outlineWidth?: number;
      handRadius?: number;
      jointColor?: number;
      jointRadius?: number;
      innerJointColor?: number;
      innerJointRadius?: number;
      secondaryColor?: number;
      midJointColor?: number;
      midJointRadius?: number;
      midInnerJointColor?: number;
      midInnerJointRadius?: number;
      outlineAlpha?: number;
    } = {}
  ): void {
    const {
      outlineColor = 0x000000,
      lineWidth = 2,
      outlineWidth = 2.5,
      handRadius = 1.5,
      jointColor,
      jointRadius,
      innerJointColor,
      innerJointRadius,
      secondaryColor,
      midJointColor,
      midJointRadius,
      midInnerJointColor,
      midInnerJointRadius,
      outlineAlpha = alpha * 0.5,
    } = options;

    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Optional secondary arm line (for thicker arms like Tank)
    if (secondaryColor !== undefined) {
      this.graphics
        .moveTo(x, y)
        .lineTo(handX, handY)
        .stroke({ color: secondaryColor, width: outlineWidth, alpha });
    }

    // Draw main arm outline
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: outlineColor, width: outlineWidth, alpha: outlineAlpha });

    // Draw main arm line
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: armColor, width: lineWidth, alpha });

    // Joint at midpoint (for mechanical/armored zombies)
    if (midJointColor !== undefined && midJointRadius !== undefined) {
      const midX = x + Math.cos(angle) * (armLength * 0.5);
      const midY = y + Math.sin(angle) * (armLength * 0.5);
      this.graphics.circle(midX, midY, midJointRadius).fill({ color: midJointColor, alpha });
      if (midInnerJointColor !== undefined && midInnerJointRadius !== undefined) {
        this.graphics
          .circle(midX, midY, midInnerJointRadius)
          .fill({ color: midInnerJointColor, alpha });
      }
    }

    // Outer joint circle (for segmented arms)
    if (jointColor !== undefined && jointRadius !== undefined) {
      this.graphics.circle(handX, handY, jointRadius).fill({ color: jointColor, alpha });
    }

    // Main hand
    this.graphics.circle(handX, handY, handRadius).fill({ color: armColor, alpha });

    // Inner joint circle
    if (innerJointColor !== undefined && innerJointRadius !== undefined) {
      this.graphics.circle(handX, handY, innerJointRadius).fill({ color: innerJointColor, alpha });
    }

    // Hand outline
    this.graphics
      .circle(handX, handY, handRadius)
      .stroke({ color: outlineColor, width: 0.5, alpha: outlineAlpha });
  }
}
