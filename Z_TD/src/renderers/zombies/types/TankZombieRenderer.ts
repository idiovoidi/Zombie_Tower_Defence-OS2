import { Container, Graphics } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from '../ZombieParticleSystem';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';

export class TankZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;

  // Dark red color scheme for tank zombie
  private readonly PRIMARY_COLOR = 0x5a1a1a; // Dark blood red
  private readonly DARK_RED = 0x3a0a0a; // Very dark red for shadows
  private readonly PALE_RED = 0x7a2a2a; // Slightly lighter red
  private readonly BLOOD_RED = 0x8b0000;
  private readonly BONE_WHITE = 0xcccccc;
  private readonly EYE_GLOW = 0xff0000; // Bright red glow

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('TANK');
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();

    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    // Larger shadow for massive size
    ShadowEffect.apply(this.graphics, 0, 18, 12);

    // Legs (thick and sturdy)
    const leftLegX = -4 + anim.leftLegOffset;
    const rightLegX = 2 + anim.rightLegOffset;

    // Thick legs
    this.graphics.rect(leftLegX, 12, 4, 7).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 12, 4, 7).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.graphics.rect(rightLegX, 12, 4, 7).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 12, 4, 7).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    // Massive torso
    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-7, torsoY, 14, 16, 2)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1.5, alpha: 0.6 });

    // Bulging muscles/mass
    this.graphics.circle(-4, torsoY + 4, 3).fill({
      color: this.PALE_RED,
      alpha: 0.4,
    });
    this.graphics.circle(4, torsoY + 4, 3).fill({
      color: this.PALE_RED,
      alpha: 0.4,
    });

    // Thick muscle lines
    for (let i = 0; i < 4; i++) {
      this.graphics.rect(-5, torsoY + 3 + i * 3, 10, 0.8).fill({
        color: this.DARK_RED,
        alpha: 0.7,
      });
    }

    // Arms (back arm first) - thick and powerful
    this.drawArm(-7, torsoY + 3, anim.leftArmAngle, 0.7);
    this.drawArm(7, torsoY + 3, anim.rightArmAngle, 1.0);

    // Large head
    const headY = torsoY - 8;
    const headX = anim.headSway;

    // Big head
    this.graphics.circle(headX, headY, 6).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 6).stroke({ color: 0x000000, width: 1.5, alpha: 0.6 });

    // Scars/damage on head
    this.graphics.rect(headX - 3, headY - 2, 6, 0.8).fill({
      color: this.DARK_RED,
      alpha: 0.8,
    });
    this.graphics.rect(headX - 2, headY + 1, 4, 0.8).fill({
      color: this.DARK_RED,
      alpha: 0.8,
    });

    // Eyes with intense red glow
    GlowEffect.apply(this.graphics, headX - 2.5, headY - 1, 2, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2.5, headY - 1, 2, this.EYE_GLOW);

    // Eye sockets (smaller, beady eyes)
    this.graphics.circle(headX - 2.5, headY - 1, 1.2).fill({
      color: 0x000000,
      alpha: 0.9,
    });
    this.graphics.circle(headX + 2.5, headY - 1, 1.2).fill({
      color: 0x000000,
      alpha: 0.9,
    });

    // Eye pupils (intense red)
    this.graphics.circle(headX - 2.5, headY - 1, 0.8).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 2.5, headY - 1, 0.8).fill(this.EYE_GLOW);

    // Large gaping mouth
    this.graphics.rect(headX - 2.5, headY + 2, 5, 1.5).fill({
      color: 0x000000,
      alpha: 0.9,
    });

    // Wounds based on health
    this.drawWounds(healthPercent, torsoY);

    // Tint based on health
    if (healthPercent < 0.75) {
      this.graphics.tint = 0xcccccc;
    }
    if (healthPercent < 0.5) {
      this.graphics.tint = 0xaaaaaa;
    }
    if (healthPercent < 0.25) {
      this.graphics.tint = 0x888888;
    }

    // Particles
    this.particles.render(this.graphics);

    container.addChild(this.graphics);
  }

  update(deltaTime: number, state: ZombieRenderState): void {
    this.animator.update(deltaTime, state);
    this.particles.update(deltaTime);
  }

  private drawArm(x: number, y: number, angle: number, alpha: number): void {
    // Thick, powerful arms
    const armLength = 9;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Arm outline (thicker)
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({
        color: 0x000000,
        width: 4,
        alpha: alpha * 0.5,
      });

    // Thick arm line
    this.graphics.moveTo(x, y).lineTo(handX, handY).stroke({
      color: this.PRIMARY_COLOR,
      width: 3,
      alpha,
    });

    // Large hand
    this.graphics.circle(handX, handY, 2.5).fill({
      color: this.PRIMARY_COLOR,
      alpha,
    });
    this.graphics.circle(handX, handY, 2.5).stroke({
      color: 0x000000,
      width: 0.8,
      alpha: alpha * 0.5,
    });
  }

  private drawWounds(healthPercent: number, torsoY: number): void {
    // More wounds due to high health pool
    const woundCount = Math.floor((1 - healthPercent) * 8);

    for (let i = 0; i < woundCount; i++) {
      const x = (Math.random() - 0.5) * 12;
      const y = torsoY + (Math.random() - 0.5) * 14;
      const size = 1.5 + Math.random() * 2;

      this.graphics.circle(x, y, size).fill({
        color: this.BLOOD_RED,
        alpha: 0.8,
      });
    }
  }

  showDamageEffect(_damageType: string, _amount: number): void {
    // Flash red
    const originalTint = this.graphics.tint;
    this.graphics.tint = 0xff0000;
    setTimeout(() => {
      this.graphics.tint = originalTint;
    }, 100);

    // Emit more blood particles (tank has more blood)
    this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
      count: 5,
      velocity: 45,
      lifetime: 800,
      size: 2.5,
    });
  }

  async playDeathAnimation(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed < 400) {
          // Phase 1: Impact (longer for massive size)
          const t = elapsed / 400;
          this.graphics.rotation = t * 0.2;
          this.graphics.scale.set(1 + t * 0.15);
        } else if (elapsed < 1000) {
          // Phase 2: Collapse (slower, heavier)
          const t = (elapsed - 400) / 600;
          this.graphics.rotation = 0.2 + t * (Math.PI / 2 - 0.2);
          this.graphics.scale.y = 1.15 - t * 0.85;
          this.graphics.alpha = 1 - t * 0.4;
        } else if (elapsed < 1800) {
          // Phase 3: Fade out
          const t = (elapsed - 1000) / 800;
          this.graphics.alpha = 0.6 - t * 0.6;
          this.graphics.y += t * 3;
        } else {
          resolve();
          return;
        }

        requestAnimationFrame(animate);
      };

      // Massive death burst
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 15,
        velocity: 70,
        lifetime: 1500,
        size: 3,
      });

      animate();
    });
  }

  destroy(): void {
    this.graphics.destroy();
    this.particles.destroy();
  }

  getGraphics(): Graphics {
    return this.graphics;
  }
}
