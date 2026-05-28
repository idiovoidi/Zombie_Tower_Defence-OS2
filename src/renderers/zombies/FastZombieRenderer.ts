import { Graphics } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';

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

  protected initParts(): void {
    // 1. Create parts
    this.shadowPart = new Graphics();
    ShadowEffect.apply(this.shadowPart, 0, 15, 7);

    this.leftLegPart = new Graphics();
    this.leftLegPart.rect(-1.25, 0, 2.5, 6).fill(this.PRIMARY_COLOR);
    this.leftLegPart.rect(-1.25, 0, 2.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.rightLegPart = new Graphics();
    this.rightLegPart.rect(-1.25, 0, 2.5, 6).fill(this.PRIMARY_COLOR);
    this.rightLegPart.rect(-1.25, 0, 2.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.torsoPart = new Graphics();
    this.torsoPart
      .roundRect(-4, -5.5, 8, 11, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    for (let i = 0; i < 3; i++) {
      this.torsoPart.rect(-2.5, -3.5 + i * 3, 5, 0.5).fill({ color: this.DARK_ORANGE, alpha: 0.7 });
    }

    this.headPart = new Graphics();
    this.headPart.circle(0, 0, 4).fill(this.PRIMARY_COLOR);
    this.headPart.circle(0, 0, 4).stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    GlowEffect.apply(this.headPart, -1.8, -0.5, 1.8, this.EYE_GLOW);
    GlowEffect.apply(this.headPart, 1.8, -0.5, 1.8, this.EYE_GLOW);
    this.headPart.circle(-1.8, -0.5, 1).fill({ color: 0x000000, alpha: 0.9 });
    this.headPart.circle(1.8, -0.5, 1).fill({ color: 0x000000, alpha: 0.9 });
    this.headPart.circle(-1.8, -0.5, 0.7).fill(this.EYE_GLOW);
    this.headPart.circle(1.8, -0.5, 0.7).fill(this.EYE_GLOW);
    this.headPart.rect(-1.8, 1.5, 3.6, 1).fill({ color: 0x000000, alpha: 0.9 });

    this.leftArmPart = new Graphics();
    this.leftArmPart.moveTo(0, 0).lineTo(0, 8).stroke({ color: 0x000000, width: 2.3, alpha: 0.3 });
    this.leftArmPart.moveTo(0, 0).lineTo(0, 8).stroke({ color: this.PRIMARY_COLOR, width: 1.8 });
    this.leftArmPart.circle(0, 8, 1.5).fill(this.PRIMARY_COLOR);
    this.leftArmPart.circle(0, 8, 1.5).stroke({ color: 0x000000, width: 0.5, alpha: 0.15 });

    this.rightArmPart = new Graphics();
    this.rightArmPart.moveTo(0, 0).lineTo(0, 8).stroke({ color: 0x000000, width: 2.3, alpha: 0.5 });
    this.rightArmPart.moveTo(0, 0).lineTo(0, 8).stroke({ color: this.PRIMARY_COLOR, width: 1.8 });
    this.rightArmPart.circle(0, 8, 1.5).fill(this.PRIMARY_COLOR);
    this.rightArmPart.circle(0, 8, 1.5).stroke({ color: 0x000000, width: 0.5, alpha: 0.5 });

    this.woundsPart = new Graphics();

    // 2. Add to container in correct z-order
    this.addPartsToContainer();

    this.isInitialized = true;
  }

  protected getAnimationOffsets() {
    return {
      leftLegX: -2.5,
      leftLegY: 10,
      rightLegX: 0.5,
      rightLegY: 10,
      torsoY: 5.5,
      leftArmX: -4,
      leftArmY: -3.5,
      rightArmX: 4,
      rightArmY: -3.5,
      headY: -11.5,
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
    this.drawWounds(this.woundsPart, healthPercent, 0, this.BLOOD_RED, 5, 6, 8, 1, 1.5, 0.8);
  }
}
