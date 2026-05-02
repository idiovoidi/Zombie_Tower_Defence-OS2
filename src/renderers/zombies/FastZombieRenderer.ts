import type { Container } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';

export class FastZombieRenderer extends BaseZombieRenderer {
  protected readonly ANIMATOR_TYPE = 'FAST';
  protected readonly DAMAGE_FLASH_TINT = 0xff6600;
  protected readonly DAMAGE_PARTICLES = [
    { type: ParticleType.BLOOD_SPLATTER, count: 3, velocity: 50, lifetime: 600, size: 2 },
  ];
  protected readonly DEATH_PARTICLES = [
    { type: ParticleType.BLOOD_SPLATTER, count: 8, velocity: 70, lifetime: 1000, size: 2.5 },
  ];
  protected readonly DEATH_ANIM = {
    phase1Duration: 300,
    phase2Duration: 500,
    phase3Duration: 700,
    phase1MaxRotation: 0.3,
    phase1MaxScale: 0.2,
    phase3YDrift: 5,
  };

  private readonly PRIMARY_COLOR = 0x8b4513;
  private readonly DARK_ORANGE = 0x5a2a0a;
  private readonly BLOOD_RED = 0x8b0000;
  private readonly EYE_GLOW = 0xff6600;

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();
    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    ShadowEffect.apply(this.graphics, 0, 15, 7);

    const leftLegX = -2.5 + anim.leftLegOffset;
    const rightLegX = 0.5 + anim.rightLegOffset;
    this.graphics.rect(leftLegX, 10, 2.5, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 2.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });
    this.graphics.rect(rightLegX, 10, 2.5, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 2.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-4, torsoY, 8, 11, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    for (let i = 0; i < 3; i++) {
      this.graphics
        .rect(-2.5, torsoY + 2 + i * 3, 5, 0.5)
        .fill({ color: this.DARK_ORANGE, alpha: 0.7 });
    }

    this.drawArm(-4, torsoY + 2, anim.leftArmAngle, 0.7);
    this.drawArm(4, torsoY + 2, anim.rightArmAngle, 1.0);

    const headY = torsoY - 6;
    const headX = anim.headSway;
    this.graphics.circle(headX, headY, 4).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 4).stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    GlowEffect.apply(this.graphics, headX - 1.8, headY - 0.5, 1.8, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 1.8, headY - 0.5, 1.8, this.EYE_GLOW);
    this.graphics.circle(headX - 1.8, headY - 0.5, 1).fill({ color: 0x000000, alpha: 0.9 });
    this.graphics.circle(headX + 1.8, headY - 0.5, 1).fill({ color: 0x000000, alpha: 0.9 });
    this.graphics.circle(headX - 1.8, headY - 0.5, 0.7).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 1.8, headY - 0.5, 0.7).fill(this.EYE_GLOW);
    this.graphics.rect(headX - 1.8, headY + 1.5, 3.6, 1).fill({ color: 0x000000, alpha: 0.9 });

    this.drawWounds(healthPercent, torsoY, this.BLOOD_RED, 5, 6, 8, 1, 1.5, 0.8);
    this.applyHealthTint(healthPercent);

    this.particles.render(this.graphics);
    container.addChild(this.graphics);
  }

  private drawArm(x: number, y: number, angle: number, alpha: number): void {
    const armLength = 8;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: 0x000000, width: 2.5, alpha: alpha * 0.5 });
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: this.PRIMARY_COLOR, width: 1.8, alpha });
    this.graphics.circle(handX, handY, 1.5).fill({ color: this.PRIMARY_COLOR, alpha });
    this.graphics
      .circle(handX, handY, 1.5)
      .stroke({ color: 0x000000, width: 0.5, alpha: alpha * 0.5 });
  }

}
