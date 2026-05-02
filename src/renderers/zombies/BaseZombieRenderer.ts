import { type Container, Graphics } from 'pixi.js';
import { EffectCleanupManager } from '../../utils/EffectCleanupManager';
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
 */
export abstract class BaseZombieRenderer implements IZombieRenderer {
  protected graphics: Graphics;
  protected animator: ZombieAnimator;
  protected particles: ZombieParticleSystem;
  protected deathAnimationFrame: number | null = null;

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

  abstract render(container: Container, state: ZombieRenderState): void;

  update(deltaTime: number, state: ZombieRenderState): void {
    this.animator.update(deltaTime, state);
    this.particles.update(deltaTime);
  }

  showDamageEffect(_damageType: string, _amount: number): void {
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
    for (const p of this.DAMAGE_PARTICLES) {
      this.particles.emit(p.type, 0, 0, {
        count: p.count,
        velocity: p.velocity,
        lifetime: p.lifetime,
        size: p.size,
      });
    }
  }

  async playDeathAnimation(killerType?: string): Promise<void> {
    // Route to tower-specific animation variant
    switch (killerType) {
      case 'Flame':
        return this.playBurnDeathAnimation();
      case 'Grenade':
      case 'Tesla':
        return this.playExplosiveDeathAnimation();
      case 'Shotgun':
        return this.playKnockbackDeathAnimation();
      case 'Sniper':
        return this.playPrecisionDeathAnimation();
      case 'MachineGun':
      case 'Sludge':
      default:
        return this.playDefaultDeathAnimation();
    }
  }

  private async playDefaultDeathAnimation(): Promise<void> {
    return new Promise(resolve => {
      const cfg = this.DEATH_ANIM;
      const p1End = cfg.phase1Duration;
      const p2End = p1End + cfg.phase2Duration;
      const p3End = p2End + cfg.phase3Duration;
      const startTime = Date.now();

      const animate = () => {
        if (this.graphics.destroyed) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;

        if (elapsed < p1End) {
          const t = elapsed / p1End;
          this.graphics.rotation = t * cfg.phase1MaxRotation;
          this.graphics.scale.set(1 + t * cfg.phase1MaxScale);
        } else if (elapsed < p2End) {
          const t = (elapsed - p1End) / cfg.phase2Duration;
          this.graphics.rotation =
            cfg.phase1MaxRotation + t * (Math.PI / 2 - cfg.phase1MaxRotation);
          this.graphics.scale.y = 1 + cfg.phase1MaxScale - t * (0.9 + cfg.phase1MaxScale);
          this.graphics.alpha = 1 - t * 0.5;
        } else if (elapsed < p3End) {
          const t = (elapsed - p2End) / cfg.phase3Duration;
          this.graphics.alpha = 0.5 - t * 0.5;
          this.graphics.y += t * cfg.phase3YDrift;
        } else {
          this.deathAnimationFrame = null;
          resolve();
          return;
        }
        this.deathAnimationFrame = requestAnimationFrame(animate);
      };

      for (const p of this.DEATH_PARTICLES) {
        this.particles.emit(p.type, 0, 0, {
          count: p.count,
          velocity: p.velocity,
          lifetime: p.lifetime,
          size: p.size,
        });
      }
      animate();
    });
  }

  private async playBurnDeathAnimation(): Promise<void> {
    // Flame tower: Burning collapse with orange tint and smoke
    return new Promise(resolve => {
      const duration = 1200;
      const startTime = Date.now();
      const originalTint = this.graphics.tint;

      // Apply orange burn tint
      this.graphics.tint = 0xff6600;

      const animate = () => {
        if (this.graphics.destroyed) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Collapse to ground
        this.graphics.rotation = t * Math.PI / 2;
        this.graphics.scale.y = 1 - t * 0.4;
        this.graphics.scale.x = 1 + t * 0.1;

        // Darken as it burns
        const burnProgress = Math.min(t * 1.5, 1);
        const r = Math.floor(255 * (1 - burnProgress * 0.8));
        const g = Math.floor(102 * (1 - burnProgress * 0.6));
        const b = Math.floor(0 * (1 - burnProgress));
        this.graphics.tint = (r << 16) | (g << 8) | b;

        // Fade out at end
        if (t > 0.7) {
          this.graphics.alpha = 1 - (t - 0.7) / 0.3 * 0.5;
        }

        if (t >= 1) {
          this.deathAnimationFrame = null;
          resolve();
          return;
        }
        this.deathAnimationFrame = requestAnimationFrame(animate);
      };

      // Emit smoke particles
      this.particles.emit(ParticleType.SMOKE, 0, -10, {
        count: 8,
        velocity: 30,
        lifetime: 1000,
        size: 6,
      });

      animate();
    });
  }

  private async playExplosiveDeathAnimation(): Promise<void> {
    // Grenade/Tesla: Violent ragdoll with debris
    return new Promise(resolve => {
      const duration = 800;
      const startTime = Date.now();

      // Random explosive direction
      const throwX = (Math.random() - 0.5) * 60;
      const throwY = -30 - Math.random() * 20;
      const rotationDir = Math.random() > 0.5 ? 1 : -1;

      const animate = () => {
        if (this.graphics.destroyed) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Arc trajectory
        const arcHeight = Math.sin(t * Math.PI) * throwY;
        this.graphics.x = throwX * t;
        this.graphics.y = arcHeight * (1 - t * 0.5);

        // Rapid rotation
        this.graphics.rotation = t * Math.PI * 2 * rotationDir;

        // Scale stretch during explosion
        if (t < 0.3) {
          const stretch = 1 + (0.3 - t) * 2;
          this.graphics.scale.set(1 / stretch, stretch);
        } else {
          this.graphics.scale.set(1, 1);
        }

        // Quick fade
        if (t > 0.6) {
          this.graphics.alpha = 1 - (t - 0.6) / 0.4;
        }

        if (t >= 1) {
          this.deathAnimationFrame = null;
          resolve();
          return;
        }
        this.deathAnimationFrame = requestAnimationFrame(animate);
      };

      // Emit debris particles
      this.particles.emit(ParticleType.BONE_FRAGMENTS, 0, 0, {
        count: 12,
        velocity: 80,
        lifetime: 600,
        size: 4,
      });

      animate();
    });
  }

  private async playKnockbackDeathAnimation(): Promise<void> {
    // Shotgun: Violent knockback throw
    return new Promise(resolve => {
      const duration = 900;
      const startTime = Date.now();

      // Strong horizontal throw
      const knockbackX = -50 - Math.random() * 30; // Always thrown backward
      const knockbackY = -20;

      const animate = () => {
        if (this.graphics.destroyed) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);

        // Sharp initial impulse, then deceleration
        const impulse = Math.pow(1 - t, 0.5);
        this.graphics.x = knockbackX * (1 - impulse);
        this.graphics.y = knockbackY * Math.sin(t * Math.PI) * impulse;

        // Rotation from impact
        this.graphics.rotation = -t * Math.PI / 3;

        // Scale compression on impact
        if (t < 0.2) {
          const compression = 1 - t * 0.3;
          this.graphics.scale.set(1 / compression, compression);
        } else {
          this.graphics.scale.set(1, 1);
        }

        // Blood spray fade
        if (t > 0.5) {
          this.graphics.alpha = 1 - (t - 0.5) / 0.5;
        }

        if (t >= 1) {
          this.deathAnimationFrame = null;
          resolve();
          return;
        }
        this.deathAnimationFrame = requestAnimationFrame(animate);
      };

      // Emit blood spray particles
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 15,
        velocity: 60,
        lifetime: 500,
        size: 5,
      });

      animate();
    });
  }

  private async playPrecisionDeathAnimation(): Promise<void> {
    // Sniper: Clean headshot with delayed body collapse
    return new Promise(resolve => {
      const headshotDuration = 200;
      const collapseDuration = 800;
      const startTime = Date.now();

      // Flash effect for headshot
      this.graphics.tint = 0xffffff;
      setTimeout(() => {
        if (!this.graphics.destroyed) {
          this.graphics.tint = 0xffffff;
        }
      }, 50);

      const animate = () => {
        if (this.graphics.destroyed) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;

        if (elapsed < headshotDuration) {
          // Headshot flash - minimal movement
          const t = elapsed / headshotDuration;
          this.graphics.scale.y = 1 - t * 0.1; // Slight head drop
        } else if (elapsed < headshotDuration + collapseDuration) {
          // Delayed body collapse
          const t = (elapsed - headshotDuration) / collapseDuration;
          this.graphics.rotation = t * Math.PI / 2;
          this.graphics.scale.y = 0.9 - t * 0.3;
          this.graphics.alpha = 1 - t * 0.3;
        } else {
          this.deathAnimationFrame = null;
          resolve();
          return;
        }

        this.deathAnimationFrame = requestAnimationFrame(animate);
      };

      // Minimal blood - clean kill
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, -15, {
        count: 5,
        velocity: 30,
        lifetime: 400,
        size: 3,
      });

      animate();
    });
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
  }

  destroy(): void {
    if (this.deathAnimationFrame !== null) {
      cancelAnimationFrame(this.deathAnimationFrame);
      this.deathAnimationFrame = null;
    }
    this.graphics.destroy({ children: true });
    this.particles.destroy();
  }

  getGraphics(): Graphics {
    return this.graphics;
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
   * Draw a simple arm for zombie.
   * @param x - Arm start X
   * @param y - Arm start Y
   * @param angle - Arm angle
   * @param alpha - Opacity
   * @param armColor - Arm color
   * @param armLength - Arm length (default 7)
   * @param outlineColor - Outline color (default black)
   */
  protected drawSimpleArm(
    x: number,
    y: number,
    angle: number,
    alpha: number,
    armColor: number,
    armLength = 7,
    outlineColor = 0x000000
  ): void {
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Draw arm line
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: armColor, width: 2, alpha });

    // Hand
    this.graphics.circle(handX, handY, 1.5).fill({ color: armColor, alpha });

    // Outline
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: outlineColor, width: 2.5, alpha: alpha * 0.3 });
    this.graphics
      .circle(handX, handY, 1.5)
      .stroke({ color: outlineColor, width: 0.5, alpha: alpha * 0.3 });
  }
}
