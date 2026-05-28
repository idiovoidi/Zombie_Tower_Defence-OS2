import { Container, Graphics } from 'pixi.js';
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
 * Provides shared constructor, destroy, update, showDamageEffect, playDeathAnimation, getContainer.
 * Subclasses implement render() and supply config via protected readonly properties.
 *
 * Now uses a retained-mode skeletal system compliant with PixiJS v8.
 */
export abstract class BaseZombieRenderer implements IZombieRenderer {
  protected container: Container;
  protected animator: ZombieAnimator;
  protected particles: ZombieParticleSystem;
  protected deathAnimationFrame: number | null = null;
  protected isInitialized = false;

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

  // Common skeletal parts (shared across all zombie renderers)
  protected shadowPart!: Graphics;
  protected leftLegPart!: Graphics;
  protected rightLegPart!: Graphics;
  protected torsoPart!: Graphics;
  protected headPart!: Graphics;
  protected leftArmPart!: Graphics;
  protected rightArmPart!: Graphics;
  protected woundsPart!: Graphics;
  protected lastHealthPercent = 1.0;

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
    this.container = new Container();
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

  /**
   * Subclasses implement this to create their static graphics parts.
   */
  protected abstract initParts(): void;

  /**
   * Add skeletal parts to container in correct z-order.
   * This is shared across all zombie renderers.
   */
  protected addPartsToContainer(): void {
    this.container.addChild(this.shadowPart);
    this.container.addChild(this.leftLegPart);
    this.container.addChild(this.rightLegPart);
    this.container.addChild(this.leftArmPart);
    this.container.addChild(this.torsoPart);
    this.container.addChild(this.woundsPart);
    this.container.addChild(this.rightArmPart);
    this.container.addChild(this.headPart);
    this.container.addChild(this.particles.getGraphics());
  }

  /**
   * Apply common render logic for skeletal parts.
   * This is shared across all zombie renderers with customizable offsets.
   */
  protected applySkeletalAnimation(
    anim: {
      leftLegOffset: number;
      rightLegOffset: number;
      bodyBob: number;
      leftArmAngle: number;
      rightArmAngle: number;
      headSway: number;
    },
    offsets: {
      leftLegX: number;
      leftLegY: number;
      rightLegX: number;
      rightLegY: number;
      torsoY: number;
      leftArmX: number;
      leftArmY: number;
      rightArmX: number;
      rightArmY: number;
      headY: number;
    }
  ): void {
    this.leftLegPart.position.set(offsets.leftLegX + anim.leftLegOffset, offsets.leftLegY);
    this.rightLegPart.position.set(offsets.rightLegX + anim.rightLegOffset, offsets.rightLegY);

    const torsoY = anim.bodyBob + offsets.torsoY;
    this.torsoPart.position.set(0, torsoY);
    this.woundsPart.position.set(0, torsoY);

    this.leftArmPart.position.set(offsets.leftArmX, torsoY + offsets.leftArmY);
    this.leftArmPart.rotation = anim.leftArmAngle - Math.PI / 2;
    this.leftArmPart.alpha = 0.7;

    this.rightArmPart.position.set(offsets.rightArmX, torsoY + offsets.rightArmY);
    this.rightArmPart.rotation = anim.rightArmAngle - Math.PI / 2;
    this.rightArmPart.alpha = 1.0;

    this.headPart.position.set(anim.headSway, torsoY + offsets.headY);
  }

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
        this.particles.render(); // Note: ZombieParticleSystem now clears its own graphics
      }
    }
  }

  showDamageEffect(damageType: string, _amount: number): void {
    const originalTint = this.container.tint;
    this.container.tint = this.DAMAGE_FLASH_TINT;
    const timeout = EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        EffectCleanupManager.clearTimeout(timeout);
        if (!this.container.destroyed) {
          this.container.tint = originalTint;
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
  async playDeathAnimation(killerType?: string, impactAngle?: number): Promise<void> {
    const angle = impactAngle ?? Math.random() * Math.PI * 2;
    const killer = killerType ?? 'unknown';

    // Create ragdoll skeleton from zombie type config
    const config = createRagdollConfig(this.zombieTypeName, 18);
    this.ragdoll = new RagdollSkeleton(config);

    // Initialize from current position (center of container)
    this.ragdoll.initializeFromPose(0, 0, 0);

    // Calculate and apply death impulses
    const impulses = calculateDeathImpulses(killer, angle, this.zombieTypeName);
    this.ragdoll.applyImpulses(impulses);

    // Detach bones for extreme deaths
    const detachable = getDetachableBones(killer);
    for (const boneName of detachable) {
      this.ragdoll.detachBone(boneName);
    }

    // Add blood emission points
    const bloodConfig = getDeathBloodConfig(killer);
    for (const bp of bloodConfig) {
      this.ragdoll.addBloodEmitPoint(bp.boneName, bp.boneT, bp.rate, bp.duration);
    }

    // Wire ragdoll blood emission to particle system
    this.ragdoll.onBloodEmit = (x, y, vx, vy) => {
      this.particles.emitWithVelocity(ParticleType.BLOOD_TRAIL, x, y, vx, vy, {
        lifetime: 600,
        size: 2,
      });
    };

    // Create ragdoll graphics
    this.ragdollGraphics = new Graphics();
    this.isInRagdollDeath = true;
    this.ragdollAlpha = 1;

    // Hide original zombie container
    this.container.alpha = 0;

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
      this.particles.emit(ParticleType.BLOOD_MIST, 0, 0, {
        count: 8,
        velocity: 40,
        lifetime: 1200,
        size: 6,
      });
    }

    // Gore chunks for heavy kills
    if (killer === 'Grenade' || killer === 'Shotgun' || killer === 'Tesla') {
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
    // Reset container transform and visibility
    this.container.alpha = 1;
    this.container.tint = 0xffffff;
    this.container.position.set(0, 0);
    this.container.rotation = 0;
    this.container.scale.set(1, 1);
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
    this.container.destroy({ children: true });
    this.particles.destroy();

    if (this.ragdollGraphics && !this.ragdollGraphics.destroyed) {
      this.ragdollGraphics.destroy();
    }
  }

  getGraphics(): Container {
    return this.container;
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
    this.container.tint = 0xff6600;

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
    if (!this.container.destroyed && this.container.alpha > 0.5) {
      this.container.tint = 0xffffff;
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
   * Now takes a target Graphics object.
   */
  protected drawWounds(
    graphics: Graphics,
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
    graphics.clear();
    const woundCount = Math.floor((1 - healthPercent) * maxWounds);
    for (let i = 0; i < woundCount; i++) {
      const x = (Math.random() - 0.5) * spreadX;
      const y = torsoY + (Math.random() - 0.5) * spreadY;
      graphics.circle(x, y, baseSize + Math.random() * sizeVar).fill({ color: woundColor, alpha });
    }
  }

  /**
   * Apply standard grey tint based on health percentage.
   */
  protected applyHealthTint(healthPercent: number): void {
    if (healthPercent < 0.25) {
      this.container.tint = 0x888888;
    } else if (healthPercent < 0.5) {
      this.container.tint = 0xaaaaaa;
    } else if (healthPercent < 0.75) {
      this.container.tint = 0xcccccc;
    } else {
      this.container.tint = 0xffffff;
    }
  }
}
