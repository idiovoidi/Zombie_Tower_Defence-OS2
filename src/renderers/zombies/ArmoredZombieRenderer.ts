import type { Container } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';

export class ArmoredZombieRenderer extends BaseZombieRenderer {
  protected readonly ANIMATOR_TYPE = 'ARMORED';
  protected readonly DAMAGE_FLASH_TINT = 0xffffff;
  protected readonly DAMAGE_PARTICLES = [
    { type: ParticleType.SPARKS, count: 4, velocity: 45, lifetime: 500, size: 1.5 },
  ];
  protected readonly DEATH_PARTICLES = [
    { type: ParticleType.METAL_SHARDS, count: 6, velocity: 55, lifetime: 1000, size: 2 },
    { type: ParticleType.BLOOD_SPLATTER, count: 5, velocity: 50, lifetime: 900, size: 2.5 },
  ];
  protected readonly DEATH_ANIM = {
    phase1Duration: 300,
    phase2Duration: 500,
    phase3Duration: 700,
    phase1MaxRotation: 0.3,
    phase1MaxScale: 0.2,
    phase3YDrift: 5,
  };

  private readonly PRIMARY_COLOR = 0x4a4a4a;
  private readonly DARK_GRAY = 0x2a2a2a;
  private readonly LIGHT_GRAY = 0x6a6a6a;
  private readonly ZOMBIE_GREEN = 0x2d5016;
  private readonly RUST_COLOR = 0x8b4513;
  private readonly BLOOD_RED = 0x8b0000;
  private readonly EYE_GLOW = 0xff6600;

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();
    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    ShadowEffect.apply(this.graphics, 0, 15, 9);

    const leftLegX = -3 + anim.leftLegOffset;
    const rightLegX = 1 + anim.rightLegOffset;
    this.graphics.rect(leftLegX + 0.5, 11, 2, 1.5).fill({ color: this.ZOMBIE_GREEN, alpha: 0.8 });
    this.graphics.rect(rightLegX + 0.5, 11, 2, 1.5).fill({ color: this.ZOMBIE_GREEN, alpha: 0.8 });
    this.graphics.rect(leftLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });
    this.graphics.rect(rightLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-5, torsoY, 10, 12, 1)
      .fill(this.ZOMBIE_GREEN)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });
    this.graphics.rect(-5, torsoY + 2, 10, 3).fill({ color: this.LIGHT_GRAY, alpha: 0.6 });
    this.graphics.rect(-5, torsoY + 2, 10, 3).stroke({ color: this.DARK_GRAY, width: 0.5 });
    this.graphics.rect(-5, torsoY + 7, 10, 3).fill({ color: this.LIGHT_GRAY, alpha: 0.6 });
    this.graphics.rect(-5, torsoY + 7, 10, 3).stroke({ color: this.DARK_GRAY, width: 0.5 });
    this.graphics.rect(-4, torsoY + 5.5, 8, 1).fill({ color: this.ZOMBIE_GREEN, alpha: 0.9 });
    this.drawRivet(-4, torsoY + 3);
    this.drawRivet(4, torsoY + 3);
    this.drawRivet(-4, torsoY + 8);
    this.drawRivet(4, torsoY + 8);

    if (healthPercent < 0.7) {
      this.drawRust(healthPercent, torsoY);
    }

    this.drawArm(-5, torsoY + 2, anim.leftArmAngle, 0.7, this.PRIMARY_COLOR, 7, {
      lineWidth: 2.5,
      midJointColor: this.ZOMBIE_GREEN,
      midJointRadius: 1.2,
      jointColor: this.PRIMARY_COLOR,
      jointRadius: 1.8,
      innerJointColor: this.DARK_GRAY,
      innerJointRadius: 1,
    });
    this.drawArm(5, torsoY + 2, anim.rightArmAngle, 1.0, this.PRIMARY_COLOR, 7, {
      lineWidth: 2.5,
      midJointColor: this.ZOMBIE_GREEN,
      midJointRadius: 1.2,
      jointColor: this.PRIMARY_COLOR,
      jointRadius: 1.8,
      innerJointColor: this.DARK_GRAY,
      innerJointRadius: 1,
    });

    const headY = torsoY - 6;
    const headX = anim.headSway;
    this.graphics.circle(headX, headY, 4).fill(this.ZOMBIE_GREEN);
    this.graphics.rect(headX - 4.5, headY - 4, 9, 8).fill(this.PRIMARY_COLOR);
    this.graphics
      .rect(headX - 4.5, headY - 4, 9, 8)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });
    this.graphics.rect(headX - 4.5, headY - 4, 9, 1.5).fill({ color: this.LIGHT_GRAY, alpha: 0.7 });
    this.graphics
      .rect(headX - 3, headY + 2.5, 6, 1.5)
      .fill({ color: this.ZOMBIE_GREEN, alpha: 0.9 });
    this.graphics.rect(headX - 3.5, headY - 1, 7, 1.5).fill({ color: 0x000000, alpha: 0.9 });

    GlowEffect.apply(this.graphics, headX - 2, headY - 0.5, 1.5, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2, headY - 0.5, 1.5, this.EYE_GLOW);
    this.graphics.circle(headX - 2, headY - 0.5, 0.6).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 2, headY - 0.5, 0.6).fill(this.EYE_GLOW);

    if (healthPercent < 0.5) {
      this.graphics.circle(headX - 2, headY + 1, 1).fill({ color: this.DARK_GRAY, alpha: 0.8 });
      this.graphics.circle(headX + 1.5, headY - 2, 0.8).fill({ color: this.DARK_GRAY, alpha: 0.8 });
    }

    this.drawWounds(healthPercent, torsoY, this.BLOOD_RED);
    this.applyHealthTint(healthPercent);

    this.particles.render(this.graphics);
    container.addChild(this.graphics);
  }

  // Also emit blood on damage if armor is breached
  override showDamageEffect(damageType: string, amount: number): void {
    super.showDamageEffect(damageType, amount);
    if (Math.random() < 0.3) {
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 2,
        velocity: 35,
        lifetime: 600,
        size: 2,
      });
    }
  }

  private drawRivet(x: number, y: number): void {
    this.graphics.circle(x, y, 0.8).fill(this.DARK_GRAY);
    this.graphics.circle(x, y, 0.4).fill(this.LIGHT_GRAY);
  }

  private drawRust(healthPercent: number, torsoY: number): void {
    const rustCount = Math.floor((1 - healthPercent) * 4);
    for (let i = 0; i < rustCount; i++) {
      const x = (Math.random() - 0.5) * 8;
      const y = torsoY + (Math.random() - 0.5) * 10;
      this.graphics
        .circle(x, y, 0.8 + Math.random() * 1.2)
        .fill({ color: this.RUST_COLOR, alpha: 0.7 });
    }
  }
}
