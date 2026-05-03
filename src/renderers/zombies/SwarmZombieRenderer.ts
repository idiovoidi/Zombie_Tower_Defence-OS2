import type { Container } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';

export class SwarmZombieRenderer extends BaseZombieRenderer {
  protected readonly ANIMATOR_TYPE = 'SWARM';
  protected readonly DAMAGE_FLASH_TINT = 0xffff00;
  protected readonly DAMAGE_PARTICLES = [
    { type: ParticleType.BLOOD_SPLATTER, count: 2, velocity: 30, lifetime: 500, size: 1.5 },
  ];
  protected readonly DEATH_PARTICLES = [
    { type: ParticleType.BLOOD_SPLATTER, count: 4, velocity: 40, lifetime: 700, size: 1.5 },
  ];
  protected readonly DEATH_ANIM = {
    phase1Duration: 200,
    phase2Duration: 400,
    phase3Duration: 400,
    phase1MaxRotation: 0.4,
    phase1MaxScale: 0.15,
    phase3YDrift: 3,
  };

  private readonly PRIMARY_COLOR = 0x6a7a2a;
  private readonly DARK_GREEN = 0x4a5a1a;
  private readonly BLOOD_RED = 0x8b0000;
  private readonly EYE_GLOW = 0xffff00;

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();
    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    ShadowEffect.apply(this.graphics, 0, 10, 5);

    const leftLegX = -2 + anim.leftLegOffset;
    const rightLegX = 0.5 + anim.rightLegOffset;
    this.graphics.rect(leftLegX, 7, 2, 4).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 7, 2, 4).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });
    this.graphics.rect(rightLegX, 7, 2, 4).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 7, 2, 4).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-3, torsoY, 6, 9, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 0.8, alpha: 0.6 });

    for (let i = 0; i < 2; i++) {
      this.graphics
        .rect(-2, torsoY + 2 + i * 3, 4, 0.5)
        .fill({ color: this.DARK_GREEN, alpha: 0.7 });
    }

    this.drawArm(-3, torsoY + 2, anim.leftArmAngle, 0.7, this.PRIMARY_COLOR, 5, {
      lineWidth: 1.5,
      outlineWidth: 1.8,
      handRadius: 1,
    });
    this.drawArm(3, torsoY + 2, anim.rightArmAngle, 1.0, this.PRIMARY_COLOR, 5, {
      lineWidth: 1.5,
      outlineWidth: 1.8,
      handRadius: 1,
    });

    const headY = torsoY - 4;
    const headX = anim.headSway;
    this.graphics.circle(headX, headY, 3).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 3).stroke({ color: 0x000000, width: 0.8, alpha: 0.6 });
    this.graphics.circle(headX + 1, headY - 0.5, 1).fill({ color: this.DARK_GREEN, alpha: 0.7 });

    GlowEffect.apply(this.graphics, headX - 1.5, headY - 0.5, 1.2, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 1.5, headY - 0.5, 1.2, this.EYE_GLOW);
    this.graphics.circle(headX - 1.5, headY - 0.5, 0.7).fill({ color: 0x000000, alpha: 0.9 });
    this.graphics.circle(headX + 1.5, headY - 0.5, 0.7).fill({ color: 0x000000, alpha: 0.9 });
    this.graphics.circle(headX - 1.5, headY - 0.5, 0.5).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 1.5, headY - 0.5, 0.5).fill(this.EYE_GLOW);
    this.graphics.rect(headX - 1.2, headY + 1, 2.4, 0.8).fill({ color: 0x000000, alpha: 0.9 });

    this.drawWounds(healthPercent, torsoY, this.BLOOD_RED, 3, 5, 7, 0.5, 0.8, 0.8);
    this.applyHealthTint(healthPercent);

    this.particles.render(this.graphics);
    container.addChild(this.graphics);
  }
}
