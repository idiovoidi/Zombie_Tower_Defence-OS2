import type { Container } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';

export class TankZombieRenderer extends BaseZombieRenderer {
  protected readonly ANIMATOR_TYPE = 'TANK';
  protected readonly DAMAGE_FLASH_TINT = 0xff0000;
  protected readonly DAMAGE_PARTICLES = [
    { type: ParticleType.BLOOD_SPLATTER, count: 5, velocity: 45, lifetime: 800, size: 2.5 },
  ];
  protected readonly DEATH_PARTICLES = [
    { type: ParticleType.BLOOD_SPLATTER, count: 15, velocity: 70, lifetime: 1500, size: 3 },
  ];
  protected readonly DEATH_ANIM = {
    phase1Duration: 400,
    phase2Duration: 600,
    phase3Duration: 800,
    phase1MaxRotation: 0.2,
    phase1MaxScale: 0.15,
    phase3YDrift: 3,
  };

  private readonly PRIMARY_COLOR = 0x5a1a1a;
  private readonly DARK_RED = 0x3a0a0a;
  private readonly PALE_RED = 0x7a2a2a;
  private readonly BLOOD_RED = 0x8b0000;
  private readonly EYE_GLOW = 0xff0000;

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();
    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    ShadowEffect.apply(this.graphics, 0, 18, 12);

    const leftLegX = -4 + anim.leftLegOffset;
    const rightLegX = 2 + anim.rightLegOffset;
    this.graphics.rect(leftLegX, 12, 4, 7).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 12, 4, 7).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });
    this.graphics.rect(rightLegX, 12, 4, 7).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 12, 4, 7).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-7, torsoY, 14, 16, 2)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1.5, alpha: 0.6 });

    this.graphics.circle(-4, torsoY + 4, 3).fill({ color: this.PALE_RED, alpha: 0.4 });
    this.graphics.circle(4, torsoY + 4, 3).fill({ color: this.PALE_RED, alpha: 0.4 });
    for (let i = 0; i < 4; i++) {
      this.graphics
        .rect(-5, torsoY + 3 + i * 3, 10, 0.8)
        .fill({ color: this.DARK_RED, alpha: 0.7 });
    }

    this.drawArm(-7, torsoY + 3, anim.leftArmAngle, 0.7);
    this.drawArm(7, torsoY + 3, anim.rightArmAngle, 1.0);

    const headY = torsoY - 8;
    const headX = anim.headSway;
    this.graphics.circle(headX, headY, 6).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 6).stroke({ color: 0x000000, width: 1.5, alpha: 0.6 });
    this.graphics.rect(headX - 3, headY - 2, 6, 0.8).fill({ color: this.DARK_RED, alpha: 0.8 });
    this.graphics.rect(headX - 2, headY + 1, 4, 0.8).fill({ color: this.DARK_RED, alpha: 0.8 });

    GlowEffect.apply(this.graphics, headX - 2.5, headY - 1, 2, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2.5, headY - 1, 2, this.EYE_GLOW);
    this.graphics.circle(headX - 2.5, headY - 1, 1.2).fill({ color: 0x000000, alpha: 0.9 });
    this.graphics.circle(headX + 2.5, headY - 1, 1.2).fill({ color: 0x000000, alpha: 0.9 });
    this.graphics.circle(headX - 2.5, headY - 1, 0.8).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 2.5, headY - 1, 0.8).fill(this.EYE_GLOW);
    this.graphics.rect(headX - 2.5, headY + 2, 5, 1.5).fill({ color: 0x000000, alpha: 0.9 });

    this.drawWounds(healthPercent, torsoY, this.BLOOD_RED, 8, 12, 14, 1.5, 2, 0.8);
    this.applyHealthTint(healthPercent);

    this.particles.render(this.graphics);
    container.addChild(this.graphics);
  }

  private drawArm(x: number, y: number, angle: number, alpha: number): void {
    const armLength = 9;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: 0x000000, width: 4, alpha: alpha * 0.5 });
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: this.PRIMARY_COLOR, width: 3, alpha });
    this.graphics.circle(handX, handY, 2.5).fill({ color: this.PRIMARY_COLOR, alpha });
    this.graphics
      .circle(handX, handY, 2.5)
      .stroke({ color: 0x000000, width: 0.8, alpha: alpha * 0.5 });
  }

}
