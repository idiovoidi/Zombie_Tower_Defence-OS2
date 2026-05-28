import { Graphics, type Container } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';

export class BasicZombieRenderer extends BaseZombieRenderer {
  protected readonly ANIMATOR_TYPE = 'BASIC';
  protected readonly DAMAGE_FLASH_TINT = 0xff0000;
  protected readonly DAMAGE_PARTICLES = [
    { type: ParticleType.BLOOD_SPLATTER, count: 3, velocity: 40, lifetime: 600, size: 2 },
  ];
  protected readonly DEATH_PARTICLES = [
    { type: ParticleType.BLOOD_SPLATTER, count: 8, velocity: 60, lifetime: 1000, size: 2.5 },
  ];
  protected readonly DEATH_ANIM = {
    phase1Duration: 300,
    phase2Duration: 500,
    phase3Duration: 700,
    phase1MaxRotation: 0.3,
    phase1MaxScale: 0.2,
    phase3YDrift: 5,
  };

  private readonly PRIMARY_COLOR = 0x2d5016;
  private readonly DARK_GREEN = 0x1a3010;
  private readonly BLOOD_RED = 0x8b0000;
  private readonly EYE_GLOW = 0xff0000;

  // Skeletal parts
  private shadowPart!: Graphics;
  private leftLegPart!: Graphics;
  private rightLegPart!: Graphics;
  private torsoPart!: Graphics;
  private headPart!: Graphics;
  private leftArmPart!: Graphics;
  private rightArmPart!: Graphics;
  private woundsPart!: Graphics;

  private lastHealthPercent = 1.0;

  protected initParts(): void {
    // 1. Create parts
    this.shadowPart = new Graphics();
    ShadowEffect.apply(this.shadowPart, 0, 15, 8);

    this.leftLegPart = new Graphics();
    this.leftLegPart.rect(-1.5, 0, 3, 6).fill(this.PRIMARY_COLOR);
    this.leftLegPart.rect(-1.5, 0, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.rightLegPart = new Graphics();
    this.rightLegPart.rect(-1.5, 0, 3, 6).fill(this.PRIMARY_COLOR);
    this.rightLegPart.rect(-1.5, 0, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.torsoPart = new Graphics();
    this.torsoPart
      .roundRect(-5, -6, 10, 12, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    for (let i = 0; i < 3; i++) {
      this.torsoPart
        .rect(-3, -3 + i * 3, 6, 0.5)
        .fill({ color: this.DARK_GREEN, alpha: 0.8 });
    }

    this.headPart = new Graphics();
    this.headPart.circle(0, 0, 4.5).fill(this.PRIMARY_COLOR);
    this.headPart.circle(0, 0, 4.5).stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    GlowEffect.apply(this.headPart, -2, -0.5, 1.5, this.EYE_GLOW);
    GlowEffect.apply(this.headPart, 2, -0.5, 1.5, this.EYE_GLOW);
    this.headPart.circle(-2, -0.5, 1).fill({ color: 0x000000, alpha: 0.9 });
    this.headPart.circle(2, -0.5, 1).fill({ color: 0x000000, alpha: 0.9 });
    this.headPart.circle(-2, -0.5, 0.6).fill(this.EYE_GLOW);
    this.headPart.circle(2, -0.5, 0.6).fill(this.EYE_GLOW);
    this.headPart.rect(-1.5, 1.5, 3, 1).fill({ color: 0x000000, alpha: 0.9 });

    this.leftArmPart = new Graphics();
    this.leftArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: 0x000000, width: 2.5, alpha: 0.3 });
    this.leftArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: this.PRIMARY_COLOR, width: 2 });
    this.leftArmPart.circle(0, 7, 1.5).fill(this.PRIMARY_COLOR);
    this.leftArmPart.circle(0, 7, 1.5).stroke({ color: 0x000000, width: 0.5, alpha: 0.15 });

    this.rightArmPart = new Graphics();
    this.rightArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: 0x000000, width: 2.5, alpha: 0.5 });
    this.rightArmPart.moveTo(0, 0).lineTo(0, 7).stroke({ color: this.PRIMARY_COLOR, width: 2 });
    this.rightArmPart.circle(0, 7, 1.5).fill(this.PRIMARY_COLOR);
    this.rightArmPart.circle(0, 7, 1.5).stroke({ color: 0x000000, width: 0.5, alpha: 0.5 });

    this.woundsPart = new Graphics();

    // 2. Add to container in correct z-order
    this.container.addChild(this.shadowPart);
    this.container.addChild(this.leftLegPart);
    this.container.addChild(this.rightLegPart);
    this.container.addChild(this.leftArmPart);
    this.container.addChild(this.torsoPart);
    this.container.addChild(this.woundsPart);
    this.container.addChild(this.rightArmPart);
    this.container.addChild(this.headPart);
    this.container.addChild(this.particles.getGraphics());

    this.isInitialized = true;
  }

  render(container: Container, state: ZombieRenderState): void {
    if (!this.isInitialized) {
      this.initParts();
    }

    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    // Apply animations
    this.leftLegPart.position.set(-3 + anim.leftLegOffset, 10);
    this.rightLegPart.position.set(1 + anim.rightLegOffset, 10);

    const torsoY = anim.bodyBob + 6; // +6 because torsoPart origin is center
    this.torsoPart.position.set(0, torsoY);
    this.woundsPart.position.set(0, torsoY);

    this.leftArmPart.position.set(-5, torsoY - 4);
    this.leftArmPart.rotation = anim.leftArmAngle - Math.PI / 2;
    this.leftArmPart.alpha = 0.7;

    this.rightArmPart.position.set(5, torsoY - 4);
    this.rightArmPart.rotation = anim.rightArmAngle - Math.PI / 2;
    this.rightArmPart.alpha = 1.0;

    this.headPart.position.set(anim.headSway, torsoY - 12);

    // Update wounds if health changed significantly
    if (Math.abs(this.lastHealthPercent - healthPercent) > 0.05) {
      this.drawWounds(this.woundsPart, healthPercent, 0, this.BLOOD_RED, 5, 7, 9, 1, 1.5, 0.8);
      this.lastHealthPercent = healthPercent;
    }

    this.applyHealthTint(healthPercent);
    this.particles.render();

    if (this.container.parent !== container) {
      container.addChild(this.container);
    }
  }
}
