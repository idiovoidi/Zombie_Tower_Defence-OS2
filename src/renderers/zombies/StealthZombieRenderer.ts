import type { Container } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';

export class StealthZombieRenderer extends BaseZombieRenderer {
  protected readonly ANIMATOR_TYPE = 'STEALTH';
  protected readonly DAMAGE_FLASH_TINT = 0xaa88ff;
  protected readonly DAMAGE_PARTICLES = [
    { type: ParticleType.SMOKE, count: 3, velocity: 35, lifetime: 600, size: 2 },
    { type: ParticleType.BLOOD_SPLATTER, count: 2, velocity: 30, lifetime: 500, size: 1.5 },
  ];
  protected readonly DEATH_PARTICLES = [
    { type: ParticleType.SMOKE, count: 8, velocity: 50, lifetime: 1000, size: 2.5 },
    { type: ParticleType.BLOOD_SPLATTER, count: 3, velocity: 40, lifetime: 800, size: 2 },
  ];
  // Not used — playDeathAnimation is fully overridden below
  protected readonly DEATH_ANIM = {
    phase1Duration: 300,
    phase2Duration: 500,
    phase3Duration: 400,
    phase1MaxRotation: 0.2,
    phase1MaxScale: 0,
    phase3YDrift: 0,
  };

  private fadePhase = 0;

  private readonly PRIMARY_COLOR = 0x3a2a4a;
  private readonly DARK_PURPLE = 0x2a1a3a;
  private readonly PALE_PURPLE = 0x4a3a5a;
  private readonly BLOOD_RED = 0x8b0000;
  private readonly BONE_WHITE = 0xcccccc;
  private readonly EYE_GLOW = 0x9966ff;

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();
    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;
    const baseAlpha = 0.5 + Math.sin(this.fadePhase) * 0.1;

    ShadowEffect.apply(this.graphics, 0, 15, 8);
    this.graphics.alpha = baseAlpha * 0.3;

    const leftLegX = -3 + anim.leftLegOffset;
    const rightLegX = 1 + anim.rightLegOffset;
    this.graphics.rect(leftLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.4 });
    this.graphics.rect(rightLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.4 });

    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-5, torsoY, 10, 12, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.4 });
    this.graphics.circle(-3, torsoY + 3, 2).fill({ color: this.DARK_PURPLE, alpha: 0.5 });
    this.graphics.circle(3, torsoY + 6, 2.5).fill({ color: this.DARK_PURPLE, alpha: 0.5 });
    for (let i = 0; i < 3; i++) {
      this.graphics
        .rect(-3, torsoY + 3 + i * 3, 6, 0.5)
        .fill({ color: this.BONE_WHITE, alpha: 0.2 });
    }

    this.drawArm(-5, torsoY + 2, anim.leftArmAngle, 0.7 * baseAlpha, this.PRIMARY_COLOR, 7, {
      outlineAlpha: 0.7 * baseAlpha * 0.3,
    });
    this.drawArm(5, torsoY + 2, anim.rightArmAngle, 1.0 * baseAlpha, this.PRIMARY_COLOR, 7, {
      outlineAlpha: 1.0 * baseAlpha * 0.3,
    });

    const headY = torsoY - 6;
    const headX = anim.headSway;
    this.graphics.circle(headX, headY, 6).fill({ color: this.PALE_PURPLE, alpha: 0.15 });
    this.graphics.circle(headX, headY, 4.5).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 4.5).stroke({ color: 0x000000, width: 1, alpha: 0.4 });
    this.graphics
      .circle(headX - 1.5, headY + 0.5, 1.5)
      .fill({ color: this.DARK_PURPLE, alpha: 0.6 });

    GlowEffect.apply(this.graphics, headX - 2, headY - 0.5, 2, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2, headY - 0.5, 2, this.EYE_GLOW);
    this.graphics.circle(headX - 2, headY - 0.5, 1.2).fill({ color: 0x000000, alpha: 0.8 });
    this.graphics.circle(headX + 2, headY - 0.5, 1.2).fill({ color: 0x000000, alpha: 0.8 });
    this.graphics.circle(headX - 2, headY - 0.5, 0.8).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 2, headY - 0.5, 0.8).fill(this.EYE_GLOW);
    this.graphics.rect(headX - 1.5, headY + 1.5, 3, 1).fill({ color: 0x000000, alpha: 0.6 });

    this.drawWounds(healthPercent, torsoY, this.BLOOD_RED, 4, 7, 9, 1, 1.5, 0.5 * baseAlpha);

    this.graphics.alpha = baseAlpha;
    this.applyHealthTint(healthPercent);

    this.particles.render(this.graphics);
    container.addChild(this.graphics);
  }

  override update(deltaTime: number, state: ZombieRenderState): void {
    super.update(deltaTime, state);
    this.fadePhase += deltaTime * 0.002;
  }

  // Stealth has a unique dissipate death — fully override
  // Note: killerType parameter accepted for compatibility but stealth always uses dissipate
  override async playDeathAnimation(_killerType?: string): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      for (const p of this.DEATH_PARTICLES) {
        this.particles.emit(p.type, 0, 0, {
          count: p.count,
          velocity: p.velocity,
          lifetime: p.lifetime,
          size: p.size,
        });
      }
      const animate = () => {
        if (this.graphics.destroyed) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;
        if (elapsed < 300) {
          const t = elapsed / 300;
          this.graphics.alpha = 0.6 - t * 0.2;
          this.graphics.rotation = t * 0.2;
        } else if (elapsed < 800) {
          const t = (elapsed - 300) / 500;
          this.graphics.alpha = 0.4 - t * 0.4;
          this.graphics.scale.set(1 + t * 0.3);
        } else if (elapsed < 1200) {
          const t = (elapsed - 800) / 400;
          this.graphics.alpha = (1 - t) * 0.05;
        } else {
          this.deathAnimationFrame = null;
          resolve();
          return;
        }
        this.deathAnimationFrame = requestAnimationFrame(animate);
      };
      animate();
    });
  }
}
