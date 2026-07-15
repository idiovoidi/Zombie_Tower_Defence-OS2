import { Graphics } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';

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

  protected initParts(): void {
    // 1. Create parts
    this.shadowPart = new Graphics();
    ShadowEffect.apply(this.shadowPart, 0, 10, 5);

    this.leftLegPart = new Graphics();
    this.leftLegPart.rect(-1, 0, 2, 4).fill(this.PRIMARY_COLOR);
    this.leftLegPart.rect(-1, 0, 2, 4).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.rightLegPart = new Graphics();
    this.rightLegPart.rect(-1, 0, 2, 4).fill(this.PRIMARY_COLOR);
    this.rightLegPart.rect(-1, 0, 2, 4).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.torsoPart = new Graphics();
    this.torsoPart
      .roundRect(-3, -4.5, 6, 9, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 0.8, alpha: 0.6 });

    for (let i = 0; i < 2; i++) {
      this.torsoPart.rect(-2, -2.5 + i * 3, 4, 0.5).fill({ color: this.DARK_GREEN, alpha: 0.7 });
    }

    this.headPart = new Graphics();
    this.headPart.circle(0, 0, 3).fill(this.PRIMARY_COLOR);
    this.headPart.circle(0, 0, 3).stroke({ color: 0x000000, width: 0.8, alpha: 0.6 });
    this.headPart.circle(1, -0.5, 1).fill({ color: this.DARK_GREEN, alpha: 0.7 });

    GlowEffect.apply(this.headPart, -1.5, -0.5, 1.2, this.EYE_GLOW);
    GlowEffect.apply(this.headPart, 1.5, -0.5, 1.2, this.EYE_GLOW);
    this.headPart.circle(-1.5, -0.5, 0.7).fill({ color: 0x000000, alpha: 0.9 });
    this.headPart.circle(1.5, -0.5, 0.7).fill({ color: 0x000000, alpha: 0.9 });
    this.headPart.circle(-1.5, -0.5, 0.5).fill(this.EYE_GLOW);
    this.headPart.circle(1.5, -0.5, 0.5).fill(this.EYE_GLOW);
    this.headPart.rect(-1.2, 1, 2.4, 0.8).fill({ color: 0x000000, alpha: 0.9 });

    this.leftArmPart = new Graphics();
    this.leftArmPart.moveTo(0, 0).lineTo(0, 5).stroke({ color: 0x000000, width: 1.8, alpha: 0.3 });
    this.leftArmPart.moveTo(0, 0).lineTo(0, 5).stroke({ color: this.PRIMARY_COLOR, width: 1.5 });
    this.leftArmPart.circle(0, 5, 1).fill(this.PRIMARY_COLOR);

    this.rightArmPart = new Graphics();
    this.rightArmPart.moveTo(0, 0).lineTo(0, 5).stroke({ color: 0x000000, width: 1.8, alpha: 0.5 });
    this.rightArmPart.moveTo(0, 0).lineTo(0, 5).stroke({ color: this.PRIMARY_COLOR, width: 1.5 });
    this.rightArmPart.circle(0, 5, 1).fill(this.PRIMARY_COLOR);

    this.finishInitParts();
  }

  protected getAnimationOffsets() {
    return {
      leftLegX: -2,
      leftLegY: 7,
      rightLegX: 0.5,
      rightLegY: 7,
      torsoY: 4.5,
      leftArmX: -3,
      leftArmY: -2.5,
      rightArmX: 3,
      rightArmY: -2.5,
      headY: -8.5,
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
    this.drawWounds(this.woundsPart, healthPercent, 0, this.BLOOD_RED, 3, 5, 7, 0.5, 0.8, 0.8);
  }
}
