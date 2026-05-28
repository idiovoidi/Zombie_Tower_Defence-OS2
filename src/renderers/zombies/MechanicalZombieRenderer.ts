import { Graphics, type Container } from 'pixi.js';
import { BaseZombieRenderer } from './BaseZombieRenderer';
import { GlowEffect, ShadowEffect } from './components/ZombieEffects';
import { ParticleType } from './ZombieParticleSystem';
import type { ZombieRenderState } from './ZombieRenderer';

export class MechanicalZombieRenderer extends BaseZombieRenderer {
  protected readonly ANIMATOR_TYPE = 'MECHANICAL';
  protected readonly DAMAGE_FLASH_TINT = 0x00ffff;
  protected readonly DAMAGE_PARTICLES = [
    { type: ParticleType.SPARKS, count: 5, velocity: 50, lifetime: 500, size: 1.5 },
    { type: ParticleType.SMOKE, count: 2, velocity: 25, lifetime: 600, size: 2 },
  ];
  protected readonly DEATH_PARTICLES = [
    { type: ParticleType.SPARKS, count: 12, velocity: 70, lifetime: 1000, size: 2 },
    { type: ParticleType.SMOKE, count: 8, velocity: 40, lifetime: 1200, size: 2.5 },
    { type: ParticleType.METAL_SHARDS, count: 6, velocity: 55, lifetime: 1000, size: 2 },
  ];
  protected readonly DEATH_ANIM = {
    phase1Duration: 300,
    phase2Duration: 500,
    phase3Duration: 700,
    phase1MaxRotation: 0.2,
    phase1MaxScale: 0,
    phase3YDrift: 4,
  };

  private readonly PRIMARY_COLOR = 0x3a4a5a;
  private readonly DARK_METAL = 0x2a3a4a;
  private readonly LIGHT_METAL = 0x5a6a7a;
  private sparkTimer = 0;
  private readonly RUST_COLOR = 0x8b4513;
  private readonly OIL_BLACK = 0x1a1a1a;
  private readonly EYE_GLOW = 0x00ffff;

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
    ShadowEffect.apply(this.shadowPart, 0, 16, 9);

    this.leftLegPart = new Graphics();
    this.leftLegPart.rect(-1.75, 0, 3.5, 6).fill(this.PRIMARY_COLOR);
    this.leftLegPart.rect(-1.75, 0, 3.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });
    this.leftLegPart.circle(0, 3, 1.2).fill(this.DARK_METAL);
    this.leftLegPart.circle(0, 3, 0.6).fill(this.LIGHT_METAL);

    this.rightLegPart = new Graphics();
    this.rightLegPart.rect(-1.75, 0, 3.5, 6).fill(this.PRIMARY_COLOR);
    this.rightLegPart.rect(-1.75, 0, 3.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });
    this.rightLegPart.circle(0, 3, 1.2).fill(this.DARK_METAL);
    this.rightLegPart.circle(0, 3, 0.6).fill(this.LIGHT_METAL);

    this.torsoPart = new Graphics();
    this.torsoPart
      .rect(-6, -6.5, 12, 13)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    this.torsoPart.rect(-5, -4.5, 10, 8).fill({ color: this.LIGHT_METAL, alpha: 0.5 });
    this.torsoPart.rect(-5, -4.5, 10, 8).stroke({ color: this.DARK_METAL, width: 0.5 });
    this.torsoPart.rect(-4, -1.5, 8, 0.5).fill(this.DARK_METAL);
    this.torsoPart.rect(-0.5, -3.5, 1, 6).fill(this.DARK_METAL);

    this.drawBolt(this.torsoPart, -5, -3.5);
    this.drawBolt(this.torsoPart, 5, -3.5);
    this.drawBolt(this.torsoPart, -5, 2.5);
    this.drawBolt(this.torsoPart, 5, 2.5);

    this.torsoPart.circle(0, -0.5, 2).fill({ color: this.EYE_GLOW, alpha: 0.4 });
    this.torsoPart.circle(0, -0.5, 1.2).fill({ color: this.EYE_GLOW, alpha: 0.7 });

    this.headPart = new Graphics();
    this.headPart.rect(-5, -4, 10, 9).fill(this.PRIMARY_COLOR);
    this.headPart.rect(-5, -4, 10, 9).stroke({ color: 0x000000, width: 1, alpha: 0.6 });
    this.headPart.rect(-4, -3, 8, 7).fill({ color: this.LIGHT_METAL, alpha: 0.4 });
    this.headPart.rect(-0.5, -6, 1, 2).fill(this.DARK_METAL);
    this.headPart.circle(0, -6, 1).fill({ color: this.EYE_GLOW, alpha: 0.8 });
    this.headPart.rect(-4, -1, 8, 2).fill({ color: 0x000000, alpha: 0.9 });

    GlowEffect.apply(this.headPart, -2.5, 0, 1.8, this.EYE_GLOW);
    GlowEffect.apply(this.headPart, 2.5, 0, 1.8, this.EYE_GLOW);
    this.headPart.rect(-3, -0.5, 1.5, 1).fill(this.EYE_GLOW);
    this.headPart.rect(1.5, -0.5, 1.5, 1).fill(this.EYE_GLOW);
    this.headPart.rect(-2, 2, 4, 1.5).fill({ color: this.DARK_METAL, alpha: 0.8 });
    for (let i = 0; i < 4; i++) {
      this.headPart
        .rect(-1.5 + i, 2.2, 0.5, 1)
        .fill({ color: 0x000000, alpha: 0.6 });
    }

    this.leftArmPart = new Graphics();
    this.leftArmPart.moveTo(0, 0).lineTo(0, 8).stroke({ color: 0x000000, width: 2.8, alpha: 0.3 });
    this.leftArmPart.moveTo(0, 0).lineTo(0, 8).stroke({ color: this.PRIMARY_COLOR, width: 2.5 });
    this.leftArmPart.circle(0, 4, 1.5).fill(this.DARK_METAL);
    this.leftArmPart.circle(0, 4, 0.8).fill(this.LIGHT_METAL);
    this.leftArmPart.circle(0, 8, 2).fill(this.PRIMARY_COLOR);
    this.leftArmPart.circle(0, 8, 1).fill(this.DARK_METAL);

    this.rightArmPart = new Graphics();
    this.rightArmPart.moveTo(0, 0).lineTo(0, 8).stroke({ color: 0x000000, width: 2.8, alpha: 0.5 });
    this.rightArmPart.moveTo(0, 0).lineTo(0, 8).stroke({ color: this.PRIMARY_COLOR, width: 2.5 });
    this.rightArmPart.circle(0, 4, 1.5).fill(this.DARK_METAL);
    this.rightArmPart.circle(0, 4, 0.8).fill(this.LIGHT_METAL);
    this.rightArmPart.circle(0, 8, 2).fill(this.PRIMARY_COLOR);
    this.rightArmPart.circle(0, 8, 1).fill(this.DARK_METAL);

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
    this.leftLegPart.position.set(-3.5 + anim.leftLegOffset, 10);
    this.rightLegPart.position.set(1.5 + anim.rightLegOffset, 10);

    const torsoY = anim.bodyBob + 6.5;
    this.torsoPart.position.set(0, torsoY);
    this.woundsPart.position.set(0, torsoY);

    this.leftArmPart.position.set(-6, torsoY - 3.5);
    this.leftArmPart.rotation = anim.leftArmAngle - Math.PI / 2;
    this.leftArmPart.alpha = 0.7;

    this.rightArmPart.position.set(6, torsoY - 3.5);
    this.rightArmPart.rotation = anim.rightArmAngle - Math.PI / 2;
    this.rightArmPart.alpha = 1.0;

    this.headPart.position.set(anim.headSway, torsoY - 13.5);

    // Update damage if health changed significantly
    if (Math.abs(this.lastHealthPercent - healthPercent) > 0.05) {
      this.woundsPart.clear();
      if (healthPercent < 0.7) {
        this.drawDamage(this.woundsPart, healthPercent, 0);
      }
      this.lastHealthPercent = healthPercent;
    }

    this.applyHealthTint(healthPercent);
    this.particles.render();

    if (this.container.parent !== container) {
      container.addChild(this.container);
    }
  }

  override update(deltaTime: number, state: ZombieRenderState): void {
    super.update(deltaTime, state);
    this.sparkTimer += deltaTime;
  }

  // Mechanical has a flicker phase — fully override
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
          this.container.rotation = t * 0.2;
          this.container.alpha = t % 0.2 < 0.1 ? 0.5 : 1.0;
        } else if (elapsed < 800) {
          const t = (elapsed - 300) / 500;
          this.container.rotation = 0.2 + t * (Math.PI / 2 - 0.2);
          this.container.scale.y = 1 - t * 0.7;
          this.container.alpha = 1 - t * 0.4;
        } else if (elapsed < 1500) {
          const t = (elapsed - 800) / 700;
          this.container.alpha = 0.6 - t * 0.6;
          this.container.y += t * 4;
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

  private drawBolt(graphics: Graphics, x: number, y: number): void {
    graphics.circle(x, y, 1).fill(this.DARK_METAL);
    graphics.circle(x, y, 0.5).fill(this.LIGHT_METAL);
    graphics.rect(x - 0.6, y - 0.1, 1.2, 0.2).fill(0x000000);
    graphics.rect(x - 0.1, y - 0.6, 0.2, 1.2).fill(0x000000);
  }

  private drawDamage(graphics: Graphics, healthPercent: number, torsoY: number): void {
    const rustCount = Math.floor((1 - healthPercent) * 5);
    for (let i = 0; i < rustCount; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = torsoY + (Math.random() - 0.5) * 11;
      graphics
        .circle(x, y, 0.8 + Math.random() * 1.5)
        .fill({ color: this.RUST_COLOR, alpha: 0.7 });
    }
    const oilCount = Math.floor((1 - healthPercent) * 3);
    for (let i = 0; i < oilCount; i++) {
      const x = (Math.random() - 0.5) * 9;
      const y = torsoY + (Math.random() - 0.5) * 10;
      graphics
        .circle(x, y, 1 + Math.random() * 1.8)
        .fill({ color: this.OIL_BLACK, alpha: 0.6 });
    }
    if (healthPercent < 0.3) {
      graphics
        .moveTo(-4, torsoY + 4)
        .lineTo(-2, torsoY + 6)
        .lineTo(-3, torsoY + 8)
        .stroke({ color: 0xff6600, width: 0.8, alpha: 0.8 });
    }
  }
}
}
