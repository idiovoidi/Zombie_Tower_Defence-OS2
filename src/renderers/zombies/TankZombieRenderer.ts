import { Graphics } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';

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

  protected initParts(): void {
    // 1. Create parts
    this.shadowPart = new Graphics();
    ShadowEffect.apply(this.shadowPart, 0, 18, 12);

    this.leftLegPart = new Graphics();
    this.leftLegPart.rect(-2, 0, 4, 7).fill(this.PRIMARY_COLOR);
    this.leftLegPart.rect(-2, 0, 4, 7).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.rightLegPart = new Graphics();
    this.rightLegPart.rect(-2, 0, 4, 7).fill(this.PRIMARY_COLOR);
    this.rightLegPart.rect(-2, 0, 4, 7).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.torsoPart = new Graphics();
    this.torsoPart
      .roundRect(-7, -8, 14, 16, 2)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1.5, alpha: 0.6 });

    this.torsoPart.circle(-4, 4 - 8, 3).fill({ color: this.PALE_RED, alpha: 0.4 });
    this.torsoPart.circle(4, 4 - 8, 3).fill({ color: this.PALE_RED, alpha: 0.4 });
    for (let i = 0; i < 4; i++) {
      this.torsoPart.rect(-5, -5 + i * 3, 10, 0.8).fill({ color: this.DARK_RED, alpha: 0.7 });
    }

    this.headPart = new Graphics();
    this.headPart.circle(0, 0, 6).fill(this.PRIMARY_COLOR);
    this.headPart.circle(0, 0, 6).stroke({ color: 0x000000, width: 1.5, alpha: 0.6 });
    this.headPart.rect(-3, -2, 6, 0.8).fill({ color: this.DARK_RED, alpha: 0.8 });
    this.headPart.rect(-2, 1, 4, 0.8).fill({ color: this.DARK_RED, alpha: 0.8 });

    GlowEffect.apply(this.headPart, -2.5, -1, 2, this.EYE_GLOW);
    GlowEffect.apply(this.headPart, 2.5, -1, 2, this.EYE_GLOW);
    this.headPart.circle(-2.5, -1, 1.2).fill({ color: 0x000000, alpha: 0.9 });
    this.headPart.circle(2.5, -1, 1.2).fill({ color: 0x000000, alpha: 0.9 });
    this.headPart.circle(-2.5, -1, 0.8).fill(this.EYE_GLOW);
    this.headPart.circle(2.5, -1, 0.8).fill(this.EYE_GLOW);
    this.headPart.rect(-2.5, 2, 5, 1.5).fill({ color: 0x000000, alpha: 0.9 });

    this.leftArmPart = new Graphics();
    this.leftArmPart.moveTo(0, 0).lineTo(0, 9).stroke({ color: 0x000000, width: 4, alpha: 0.3 });
    this.leftArmPart.moveTo(0, 0).lineTo(0, 9).stroke({ color: this.PRIMARY_COLOR, width: 3 });
    this.leftArmPart.circle(0, 9, 2.5).fill(this.PRIMARY_COLOR);

    this.rightArmPart = new Graphics();
    this.rightArmPart.moveTo(0, 0).lineTo(0, 9).stroke({ color: 0x000000, width: 4, alpha: 0.5 });
    this.rightArmPart.moveTo(0, 0).lineTo(0, 9).stroke({ color: this.PRIMARY_COLOR, width: 3 });
    this.rightArmPart.circle(0, 9, 2.5).fill(this.PRIMARY_COLOR);

    this.finishInitParts();
  }

  protected getAnimationOffsets() {
    return {
      leftLegX: -4,
      leftLegY: 12,
      rightLegX: 2,
      rightLegY: 12,
      torsoY: 8,
      leftArmX: -7,
      leftArmY: -5,
      rightArmX: 7,
      rightArmY: -5,
      headY: -16,
    };
  }

  protected updateWounds(
    healthPercent: number,
    _anim: {
      leftLegOffset: number;
      rightLegOffset: number;
      bodyBob: number;
      leftArmAngle: number;
      rightArmAngle: number;
      headSway: number;
    }
  ): void {
    this.drawWounds(this.woundsPart, healthPercent, 0, this.BLOOD_RED, 8, 12, 14, 1.5, 2, 0.8);
  }
}
