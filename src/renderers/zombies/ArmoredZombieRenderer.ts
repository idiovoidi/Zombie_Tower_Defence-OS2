import { Graphics } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';

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

  protected initParts(): void {
    // 1. Create parts
    this.shadowPart = new Graphics();
    ShadowEffect.apply(this.shadowPart, 0, 15, 9);

    this.leftLegPart = new Graphics();
    this.leftLegPart.rect(-1, 1, 2, 1.5).fill({ color: this.ZOMBIE_GREEN, alpha: 0.8 });
    this.leftLegPart.rect(-1.5, 0, 3, 6).fill(this.PRIMARY_COLOR);
    this.leftLegPart.rect(-1.5, 0, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.rightLegPart = new Graphics();
    this.rightLegPart.rect(-1, 1, 2, 1.5).fill({ color: this.ZOMBIE_GREEN, alpha: 0.8 });
    this.rightLegPart.rect(-1.5, 0, 3, 6).fill(this.PRIMARY_COLOR);
    this.rightLegPart.rect(-1.5, 0, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.torsoPart = new Graphics();
    this.torsoPart
      .roundRect(-5, -6, 10, 12, 1)
      .fill(this.ZOMBIE_GREEN)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    this.torsoPart.rect(-5, -4, 10, 3).fill({ color: this.LIGHT_GRAY, alpha: 0.6 });
    this.torsoPart.rect(-5, -4, 10, 3).stroke({ color: this.DARK_GRAY, width: 0.5 });
    this.torsoPart.rect(-5, 1, 10, 3).fill({ color: this.LIGHT_GRAY, alpha: 0.6 });
    this.torsoPart.rect(-5, 1, 10, 3).stroke({ color: this.DARK_GRAY, width: 0.5 });
    this.torsoPart.rect(-4, -0.5, 8, 1).fill({ color: this.ZOMBIE_GREEN, alpha: 0.9 });
    this.drawRivet(this.torsoPart, -4, -3);
    this.drawRivet(this.torsoPart, 4, -3);
    this.drawRivet(this.torsoPart, -4, 2);
    this.drawRivet(this.torsoPart, 4, 2);

    this.headPart = new Graphics();
    this.headPart.circle(0, 0, 4).fill(this.ZOMBIE_GREEN);
    this.headPart.rect(-4.5, -4, 9, 8).fill(this.PRIMARY_COLOR);
    this.headPart.rect(-4.5, -4, 9, 8).stroke({ color: 0x000000, width: 1, alpha: 0.6 });
    this.headPart.rect(-4.5, -4, 9, 1.5).fill({ color: this.LIGHT_GRAY, alpha: 0.7 });
    this.headPart.rect(-3, 2.5, 6, 1.5).fill({ color: this.ZOMBIE_GREEN, alpha: 0.9 });
    this.headPart.rect(-3.5, -1, 7, 1.5).fill({ color: 0x000000, alpha: 0.9 });

    GlowEffect.apply(this.headPart, -2, -0.5, 1.5, this.EYE_GLOW);
    GlowEffect.apply(this.headPart, 2, -0.5, 1.5, this.EYE_GLOW);
    this.headPart.circle(-2, -0.5, 0.6).fill(this.EYE_GLOW);
    this.headPart.circle(2, -0.5, 0.6).fill(this.EYE_GLOW);

    this.leftArmPart = new Graphics();
    this.leftArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: 0x000000, width: 3, alpha: 0.3 });
    this.leftArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: this.PRIMARY_COLOR, width: 2.5 });
    this.leftArmPart.circle(0, 3.5, 1.2).fill(this.ZOMBIE_GREEN);
    this.leftArmPart.circle(0, 7, 1.8).fill(this.PRIMARY_COLOR);
    this.leftArmPart.circle(0, 7, 1).fill(this.DARK_GRAY);

    this.rightArmPart = new Graphics();
    this.rightArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: 0x000000, width: 3, alpha: 0.5 });
    this.rightArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: this.PRIMARY_COLOR, width: 2.5 });
    this.rightArmPart.circle(0, 3.5, 1.2).fill(this.ZOMBIE_GREEN);
    this.rightArmPart.circle(0, 7, 1.8).fill(this.PRIMARY_COLOR);
    this.rightArmPart.circle(0, 7, 1).fill(this.DARK_GRAY);

    this.woundsPart = new Graphics();

    // 2. Add to container in correct z-order
    this.addPartsToContainer();

    this.isInitialized = true;
  }

  protected getAnimationOffsets() {
    return {
      leftLegX: -3,
      leftLegY: 10,
      rightLegX: 1,
      rightLegY: 10,
      torsoY: 6,
      leftArmX: -5,
      leftArmY: -4,
      rightArmX: 5,
      rightArmY: -4,
      headY: -12,
    };
  }

  protected updateWounds(
    healthPercent: number,
    anim: {
      leftLegOffset: number;
      rightLegOffset: number;
      bodyBob: number;
      leftArmAngle: number;
      rightArmAngle: number;
      headSway: number;
    }
  ): void {
    this.woundsPart.clear();
    this.drawWounds(this.woundsPart, healthPercent, 0, this.BLOOD_RED);
    if (healthPercent < 0.7) {
      this.drawRust(this.woundsPart, healthPercent, 0);
    }
    if (healthPercent < 0.5) {
      this.woundsPart.circle(anim.headSway - 2, -13, 1).fill({ color: this.DARK_GRAY, alpha: 0.8 });
      this.woundsPart
        .circle(anim.headSway + 1.5, -16, 0.8)
        .fill({ color: this.DARK_GRAY, alpha: 0.8 });
    }
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

  private drawRivet(graphics: Graphics, x: number, y: number): void {
    graphics.circle(x, y, 0.8).fill(this.DARK_GRAY);
    graphics.circle(x, y, 0.4).fill(this.LIGHT_GRAY);
  }

  private drawRust(graphics: Graphics, healthPercent: number, torsoY: number): void {
    const rustCount = Math.floor((1 - healthPercent) * 4);
    for (let i = 0; i < rustCount; i++) {
      const x = (Math.random() - 0.5) * 8;
      const y = torsoY + (Math.random() - 0.5) * 10;
      graphics.circle(x, y, 0.8 + Math.random() * 1.2).fill({ color: this.RUST_COLOR, alpha: 0.7 });
    }
  }
}
