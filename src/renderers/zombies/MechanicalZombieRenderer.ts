import type { Container } from 'pixi.js';
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
  private readonly RUST_COLOR = 0x8b4513;
  private readonly OIL_BLACK = 0x1a1a1a;
  private readonly EYE_GLOW = 0x00ffff;
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Used in update() method
  private sparkTimer: number = 0;

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();
    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    ShadowEffect.apply(this.graphics, 0, 16, 9);

    const leftLegX = -3.5 + anim.leftLegOffset;
    const rightLegX = 1.5 + anim.rightLegOffset;
    this.graphics.rect(leftLegX, 10, 3.5, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 3.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });
    this.graphics.rect(rightLegX, 10, 3.5, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 3.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });
    this.graphics.circle(leftLegX + 1.75, 13, 1.2).fill(this.DARK_METAL);
    this.graphics.circle(leftLegX + 1.75, 13, 0.6).fill(this.LIGHT_METAL);
    this.graphics.circle(rightLegX + 1.75, 13, 1.2).fill(this.DARK_METAL);
    this.graphics.circle(rightLegX + 1.75, 13, 0.6).fill(this.LIGHT_METAL);

    const torsoY = anim.bodyBob;
    this.graphics
      .rect(-6, torsoY, 12, 13)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });
    this.graphics.rect(-5, torsoY + 2, 10, 8).fill({ color: this.LIGHT_METAL, alpha: 0.5 });
    this.graphics.rect(-5, torsoY + 2, 10, 8).stroke({ color: this.DARK_METAL, width: 0.5 });
    this.graphics.rect(-4, torsoY + 5, 8, 0.5).fill(this.DARK_METAL);
    this.graphics.rect(-0.5, torsoY + 3, 1, 6).fill(this.DARK_METAL);
    this.drawBolt(-5, torsoY + 3);
    this.drawBolt(5, torsoY + 3);
    this.drawBolt(-5, torsoY + 9);
    this.drawBolt(5, torsoY + 9);
    this.graphics.circle(0, torsoY + 6, 2).fill({ color: this.EYE_GLOW, alpha: 0.4 });
    this.graphics.circle(0, torsoY + 6, 1.2).fill({ color: this.EYE_GLOW, alpha: 0.7 });

    if (healthPercent < 0.7) {
      this.drawDamage(healthPercent, torsoY);
    }

    this.drawArm(-6, torsoY + 3, anim.leftArmAngle, 0.7);
    this.drawArm(6, torsoY + 3, anim.rightArmAngle, 1.0);

    const headY = torsoY - 7;
    const headX = anim.headSway;
    this.graphics.rect(headX - 5, headY - 4, 10, 9).fill(this.PRIMARY_COLOR);
    this.graphics
      .rect(headX - 5, headY - 4, 10, 9)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });
    this.graphics.rect(headX - 4, headY - 3, 8, 7).fill({ color: this.LIGHT_METAL, alpha: 0.4 });
    this.graphics.rect(headX - 0.5, headY - 6, 1, 2).fill(this.DARK_METAL);
    this.graphics.circle(headX, headY - 6, 1).fill({ color: this.EYE_GLOW, alpha: 0.8 });
    this.graphics.rect(headX - 4, headY - 1, 8, 2).fill({ color: 0x000000, alpha: 0.9 });

    GlowEffect.apply(this.graphics, headX - 2.5, headY, 1.8, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2.5, headY, 1.8, this.EYE_GLOW);
    this.graphics.rect(headX - 3, headY - 0.5, 1.5, 1).fill(this.EYE_GLOW);
    this.graphics.rect(headX + 1.5, headY - 0.5, 1.5, 1).fill(this.EYE_GLOW);
    this.graphics.rect(headX - 2, headY + 2, 4, 1.5).fill({ color: this.DARK_METAL, alpha: 0.8 });
    for (let i = 0; i < 4; i++) {
      this.graphics
        .rect(headX - 1.5 + i, headY + 2.2, 0.5, 1)
        .fill({ color: 0x000000, alpha: 0.6 });
    }

    this.applyHealthTint(healthPercent);

    this.particles.render(this.graphics);
    container.addChild(this.graphics);
  }

  override update(deltaTime: number, state: ZombieRenderState): void {
    super.update(deltaTime, state);
    this.sparkTimer += deltaTime;
  }

  // Mechanical has a flicker phase — fully override
  // Note: killerType parameter accepted for compatibility but mechanical always uses flicker
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
        if (this.graphics.destroyed) {
          resolve();
          return;
        }
        const elapsed = Date.now() - startTime;
        if (elapsed < 300) {
          const t = elapsed / 300;
          this.graphics.rotation = t * 0.2;
          this.graphics.alpha = t % 0.2 < 0.1 ? 0.5 : 1.0;
        } else if (elapsed < 800) {
          const t = (elapsed - 300) / 500;
          this.graphics.rotation = 0.2 + t * (Math.PI / 2 - 0.2);
          this.graphics.scale.y = 1 - t * 0.7;
          this.graphics.alpha = 1 - t * 0.4;
        } else if (elapsed < 1500) {
          const t = (elapsed - 800) / 700;
          this.graphics.alpha = 0.6 - t * 0.6;
          this.graphics.y += t * 4;
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

  private drawArm(x: number, y: number, angle: number, alpha: number): void {
    const armLength = 8;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;
    const elbowX = x + Math.cos(angle) * (armLength * 0.5);
    const elbowY = y + Math.sin(angle) * (armLength * 0.5);
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: 0x000000, width: 2.8, alpha: alpha * 0.5 });
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({ color: this.PRIMARY_COLOR, width: 2.5, alpha });
    this.graphics.circle(elbowX, elbowY, 1.5).fill({ color: this.DARK_METAL, alpha });
    this.graphics.circle(elbowX, elbowY, 0.8).fill({ color: this.LIGHT_METAL, alpha });
    this.graphics.circle(handX, handY, 2).fill({ color: this.PRIMARY_COLOR, alpha });
    this.graphics
      .circle(handX, handY, 2)
      .stroke({ color: 0x000000, width: 0.5, alpha: alpha * 0.5 });
    this.graphics.circle(handX, handY, 1).fill({ color: this.DARK_METAL, alpha });
  }

  private drawBolt(x: number, y: number): void {
    this.graphics.circle(x, y, 1).fill(this.DARK_METAL);
    this.graphics.circle(x, y, 0.5).fill(this.LIGHT_METAL);
    this.graphics.rect(x - 0.6, y - 0.1, 1.2, 0.2).fill(0x000000);
    this.graphics.rect(x - 0.1, y - 0.6, 0.2, 1.2).fill(0x000000);
  }

  private drawDamage(healthPercent: number, torsoY: number): void {
    const rustCount = Math.floor((1 - healthPercent) * 5);
    for (let i = 0; i < rustCount; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = torsoY + (Math.random() - 0.5) * 11;
      this.graphics
        .circle(x, y, 0.8 + Math.random() * 1.5)
        .fill({ color: this.RUST_COLOR, alpha: 0.7 });
    }
    const oilCount = Math.floor((1 - healthPercent) * 3);
    for (let i = 0; i < oilCount; i++) {
      const x = (Math.random() - 0.5) * 9;
      const y = torsoY + (Math.random() - 0.5) * 10;
      this.graphics
        .circle(x, y, 1 + Math.random() * 1.8)
        .fill({ color: this.OIL_BLACK, alpha: 0.6 });
    }
    if (healthPercent < 0.3) {
      this.graphics
        .moveTo(-4, torsoY + 4)
        .lineTo(-2, torsoY + 6)
        .lineTo(-3, torsoY + 8)
        .stroke({ color: 0xff6600, width: 0.8, alpha: 0.8 });
    }
  }
}
