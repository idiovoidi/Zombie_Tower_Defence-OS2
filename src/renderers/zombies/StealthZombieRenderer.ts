import { Graphics, type Container } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';

export class StealthZombieRenderer extends BaseZombieRenderer {
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
  // Not used — playDeathAnimation is fully overridden below
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
    this.leftLegPart.rect(-1.5, 0, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.4 });

    this.rightLegPart = new Graphics();
    this.rightLegPart.rect(-1.5, 0, 3, 6).fill(this.PRIMARY_COLOR);
    this.rightLegPart.rect(-1.5, 0, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.4 });

    this.torsoPart = new Graphics();
    this.torsoPart
      .roundRect(-5, -6, 10, 12, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.4 });

    this.torsoPart.circle(-3, 3 - 6, 2).fill({ color: this.DARK_PURPLE, alpha: 0.5 });
    this.torsoPart.circle(3, 6 - 6, 2.5).fill({ color: this.DARK_PURPLE, alpha: 0.5 });

    for (let i = 0; i < 3; i++) {
      this.torsoPart
        .rect(-3, -3 + i * 3, 6, 0.5)
        .fill({ color: this.BONE_WHITE, alpha: 0.2 });
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
    const baseAlpha = 0.5 + Math.sin(this.fadePhase) * 0.1;

    this.shadowPart.alpha = baseAlpha * 0.3;

    // Apply animations
    this.leftLegPart.position.set(-3 + anim.leftLegOffset, 10);
    this.rightLegPart.position.set(1 + anim.rightLegOffset, 10);

    const torsoY = anim.bodyBob + 6;
    this.torsoPart.position.set(0, torsoY);
    this.woundsPart.position.set(0, torsoY);

    this.leftArmPart.position.set(-5, torsoY - 4);
    this.leftArmPart.rotation = anim.leftArmAngle - Math.PI / 2;
    this.leftArmPart.alpha = 0.7 * baseAlpha;
    // Outline alpha adjustment via tint or direct draw in v8
    // For simplicity, we just use alpha here

    this.rightArmPart.position.set(5, torsoY - 4);
    this.rightArmPart.rotation = anim.rightArmAngle - Math.PI / 2;
    this.rightArmPart.alpha = 1.0 * baseAlpha;

    this.headPart.position.set(anim.headSway, torsoY - 12);

    // Update wounds if health changed significantly
    if (Math.abs(this.lastHealthPercent - healthPercent) > 0.05) {
      this.drawWounds(this.woundsPart, healthPercent, 0, this.BLOOD_RED, 4, 7, 9, 1, 1.5, 0.5);
      this.lastHealthPercent = healthPercent;
    }

    this.container.alpha = baseAlpha;
    this.applyHealthTint(healthPercent);
    this.particles.render();

    if (this.container.parent !== container) {
      container.addChild(this.container);
    }
  }

  override update(deltaTime: number, state: ZombieRenderState): void {
    super.update(deltaTime, state);
    this.fadePhase += deltaTime * 0.002;
  }

  // Stealth has a unique dissipate death — fully override
  override async playDeathAnimation(_killerType?: string): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      for (const p of this.DEATH_PARTICLES) {
        this.particles.emit(p.type, 0, 0, {
          count: p.count,
          velocity: p.velocity,
          lifetime: p.lifetime,
          size: p.size,
        });
      }
      const animate = () => {
        if (this.container.destroyed) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;
        if (elapsed < 300) {
          const t = elapsed / 300;
          this.container.alpha = 0.6 - t * 0.2;
          this.container.rotation = t * 0.2;
        } else if (elapsed < 800) {
          const t = (elapsed - 300) / 500;
          this.container.alpha = 0.4 - t * 0.4;
          this.container.scale.set(1 + t * 0.3);
        } else if (elapsed < 1200) {
          const t = (elapsed - 800) / 400;
          this.container.alpha = (1 - t) * 0.05;
        } else {
          this.deathAnimationFrame = null;
          resolve();
          return;
        }
        this.deathAnimationFrame = requestAnimationFrame(animate);
      };
      animate();
    });
  }
}
