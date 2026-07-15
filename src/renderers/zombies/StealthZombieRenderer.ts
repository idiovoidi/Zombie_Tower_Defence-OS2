import { Graphics } from 'pixi.js';
import { GlowEffect } from './components/ZombieEffects';
import { playParticleDeathAnimation } from './CustomDeathAnimation';
import { createHumanoidLegs, createHumanoidShadow } from './HumanoidPartBuilder';
import { HumanoidZombieRenderer } from './HumanoidZombieRenderer';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';

export class StealthZombieRenderer extends HumanoidZombieRenderer {
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

  protected initParts(): void {
    this.shadowPart = createHumanoidShadow();
    const legs = createHumanoidLegs(this.PRIMARY_COLOR, 0.4);
    this.leftLegPart = legs.leftLeg;
    this.rightLegPart = legs.rightLeg;

    this.torsoPart = new Graphics();
    this.torsoPart
      .roundRect(-5, -6, 10, 12, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.4 });

    this.torsoPart.circle(-3, 3 - 6, 2).fill({ color: this.DARK_PURPLE, alpha: 0.5 });
    this.torsoPart.circle(3, 6 - 6, 2.5).fill({ color: this.DARK_PURPLE, alpha: 0.5 });

    for (let i = 0; i < 3; i++) {
      this.torsoPart.rect(-3, -3 + i * 3, 6, 0.5).fill({ color: this.BONE_WHITE, alpha: 0.2 });
    }

    this.headPart = new Graphics();
    this.headPart.circle(0, 0, 6).fill({ color: this.PALE_PURPLE, alpha: 0.15 });
    this.headPart.circle(0, 0, 4.5).fill(this.PRIMARY_COLOR);
    this.headPart.circle(0, 0, 4.5).stroke({ color: 0x000000, width: 1, alpha: 0.4 });
    this.headPart.circle(-1.5, 0.5, 1.5).fill({ color: this.DARK_PURPLE, alpha: 0.6 });

    GlowEffect.apply(this.headPart, -2, -0.5, 2, this.EYE_GLOW);
    GlowEffect.apply(this.headPart, 2, -0.5, 2, this.EYE_GLOW);
    this.headPart.circle(-2, -0.5, 1.2).fill({ color: 0x000000, alpha: 0.8 });
    this.headPart.circle(2, -0.5, 1.2).fill({ color: 0x000000, alpha: 0.8 });
    this.headPart.circle(-2, -0.5, 0.8).fill(this.EYE_GLOW);
    this.headPart.circle(2, -0.5, 0.8).fill(this.EYE_GLOW);
    this.headPart.rect(-1.5, 1.5, 3, 1).fill({ color: 0x000000, alpha: 0.6 });

    this.leftArmPart = new Graphics();
    this.leftArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: this.PRIMARY_COLOR, width: 2 });
    this.leftArmPart.circle(0, 7, 1.5).fill(this.PRIMARY_COLOR);

    this.rightArmPart = new Graphics();
    this.rightArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: this.PRIMARY_COLOR, width: 2 });
    this.rightArmPart.circle(0, 7, 1.5).fill(this.PRIMARY_COLOR);

    this.finishInitParts();
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
    this.updateBloodWounds(healthPercent, this.BLOOD_RED, { maxWounds: 4, alpha: 0.5 });
  }

  protected override applyCustomEffects(
    _healthPercent: number,
    _anim: {
      leftLegOffset: number;
      rightLegOffset: number;
      bodyBob: number;
      leftArmAngle: number;
      rightArmAngle: number;
      headSway: number;
    }
  ): void {
    const baseAlpha = 0.5 + Math.sin(this.fadePhase) * 0.1;
    this.shadowPart.alpha = baseAlpha * 0.3;
    this.leftArmPart.alpha = 0.7 * baseAlpha;
    this.rightArmPart.alpha = 1.0 * baseAlpha;
    this.container.alpha = baseAlpha;
  }

  override update(deltaTime: number, state: ZombieRenderState): void {
    super.update(deltaTime, state);
    this.fadePhase += deltaTime * 0.002;
  }

  override async playDeathAnimation(_killerType?: string): Promise<void> {
    return playParticleDeathAnimation({
      container: this.container,
      particles: this.particles,
      deathParticles: this.DEATH_PARTICLES,
      durationMs: 1200,
      setFrameId: id => {
        this.deathAnimationFrame = id;
      },
      onUpdate: elapsed => {
        if (elapsed < 300) {
          const t = elapsed / 300;
          this.container.alpha = 0.6 - t * 0.2;
          this.container.rotation = t * 0.2;
        } else if (elapsed < 800) {
          const t = (elapsed - 300) / 500;
          this.container.alpha = 0.4 - t * 0.4;
          this.container.scale.set(1 + t * 0.3);
        } else {
          const t = (elapsed - 800) / 400;
          this.container.alpha = (1 - t) * 0.05;
        }
      },
    });
  }
}
