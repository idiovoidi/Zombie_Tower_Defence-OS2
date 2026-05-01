import { type Container, Graphics } from 'pixi.js';
import { EffectCleanupManager } from '../../utils/EffectCleanupManager';
import { ZombieAnimator } from './ZombieAnimator';
import { type ParticleType, ZombieParticleSystem } from './ZombieParticleSystem';
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

  async playDeathAnimation(): Promise<void> {
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

  destroy(): void {
    if (this.deathAnimationFrame !== null) {
      cancelAnimationFrame(this.deathAnimationFrame);
      this.deathAnimationFrame = null;
    }
    this.graphics.destroy();
    this.particles.destroy();
  }

  getGraphics(): Graphics {
    return this.graphics;
  }
}
