import { Container, Graphics } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from '../ZombieParticleSystem';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';
import { EffectCleanupManager } from '../../../utils/EffectCleanupManager';

export class SwarmZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;

  // Yellow-green sickly color scheme for swarm zombie
  private readonly PRIMARY_COLOR = 0x6a7a2a; // Sickly yellow-green
  private readonly DARK_GREEN = 0x4a5a1a; // Dark yellow-green
  private readonly PALE_GREEN = 0x8a9a4a; // Pale yellow-green
  private readonly BLOOD_RED = 0x8b0000;
  private readonly BONE_WHITE = 0xcccccc;
  private readonly EYE_GLOW = 0xffff00; // Yellow glow (feral)

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('SWARM');
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();

    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    // Smaller shadow for tiny size
    ShadowEffect.apply(this.graphics, 0, 10, 5);

    // Tiny legs (hunched posture)
    const leftLegX = -2 + anim.leftLegOffset;
    const rightLegX = 0.5 + anim.rightLegOffset;

    // Small legs
    this.graphics.rect(leftLegX, 7, 2, 4).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 7, 2, 4).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.graphics.rect(rightLegX, 7, 2, 4).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 7, 2, 4).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    // Small hunched torso
    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-3, torsoY, 6, 9, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 0.8, alpha: 0.6 });

    // Hunched spine/ribs
    for (let i = 0; i < 2; i++) {
      this.graphics.rect(-2, torsoY + 2 + i * 3, 4, 0.5).fill({
        color: this.DARK_GREEN,
        alpha: 0.7,
      });
    }

    // Small arms (back arm first) - scrawny
    this.drawArm(-3, torsoY + 2, anim.leftArmAngle, 0.7);
    this.drawArm(3, torsoY + 2, anim.rightArmAngle, 1.0);

    // Small head (hunched forward)
    const headY = torsoY - 4;
    const headX = anim.headSway;

    // Small head
    this.graphics.circle(headX, headY, 3).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 3).stroke({ color: 0x000000, width: 0.8, alpha: 0.6 });

    // Decay spot
    this.graphics.circle(headX + 1, headY - 0.5, 1).fill({
      color: this.DARK_GREEN,
      alpha: 0.7,
    });

    // Feral yellow eyes (beady and intense)
    GlowEffect.apply(this.graphics, headX - 1.5, headY - 0.5, 1.2, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 1.5, headY - 0.5, 1.2, this.EYE_GLOW);

    // Eye sockets (small)
    this.graphics.circle(headX - 1.5, headY - 0.5, 0.7).fill({
      color: 0x000000,
      alpha: 0.9,
    });
    this.graphics.circle(headX + 1.5, headY - 0.5, 0.7).fill({
      color: 0x000000,
      alpha: 0.9,
    });

    // Eye pupils (bright yellow)
    this.graphics.circle(headX - 1.5, headY - 0.5, 0.5).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 1.5, headY - 0.5, 0.5).fill(this.EYE_GLOW);

    // Small snarling mouth
    this.graphics.rect(headX - 1.2, headY + 1, 2.4, 0.8).fill({
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
    // Scrawny arms
    const armLength = 5;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Arm outline
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({
        color: 0x000000,
        width: 1.8,
        alpha: alpha * 0.5,
      });

    // Thin arm line
    this.graphics.moveTo(x, y).lineTo(handX, handY).stroke({
      color: this.PRIMARY_COLOR,
      width: 1.5,
      alpha,
    });

    // Small hand
    this.graphics.circle(handX, handY, 1).fill({
      color: this.PRIMARY_COLOR,
      alpha,
    });
    this.graphics.circle(handX, handY, 1).stroke({
      color: 0x000000,
      width: 0.4,
      alpha: alpha * 0.5,
    });
  }

  private drawWounds(healthPercent: number, torsoY: number): void {
    // Small wounds (less blood due to small size)
    const woundCount = Math.floor((1 - healthPercent) * 3);

    for (let i = 0; i < woundCount; i++) {
      const x = (Math.random() - 0.5) * 5;
      const y = torsoY + (Math.random() - 0.5) * 7;
      const size = 0.5 + Math.random() * 0.8;

      this.graphics.circle(x, y, size).fill({
        color: this.BLOOD_RED,
        alpha: 0.8,
      });
    }
  }

  showDamageEffect(_damageType: string, _amount: number): void {
    // Flash yellow
    const originalTint = this.graphics.tint;
    this.graphics.tint = 0xffff00;
    const timeout = EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        EffectCleanupManager.clearTimeout(timeout);
        if (!this.graphics.destroyed) {
          this.graphics.tint = originalTint;
        }
      }, 100)
    );

    // Small blood splatter
    this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
      count: 2,
      velocity: 30,
      lifetime: 500,
      size: 1.5,
    });
  }

  async playDeathAnimation(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed < 200) {
          // Phase 1: Quick impact (faster for small size)
          const t = elapsed / 200;
          this.graphics.rotation = t * 0.4;
          this.graphics.scale.set(1 + t * 0.15);
        } else if (elapsed < 600) {
          // Phase 2: Fast collapse
          const t = (elapsed - 200) / 400;
          this.graphics.rotation = 0.4 + t * (Math.PI / 2 - 0.4);
          this.graphics.scale.y = 1.15 - t * 0.95;
          this.graphics.alpha = 1 - t * 0.6;
        } else if (elapsed < 1000) {
          // Phase 3: Quick fade
          const t = (elapsed - 600) / 400;
          this.graphics.alpha = 0.4 - t * 0.4;
          this.graphics.y += t * 3;
        } else {
          resolve();
          return;
        }

        requestAnimationFrame(animate);
      };

      // Small death burst
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 4,
        velocity: 40,
        lifetime: 700,
        size: 1.5,
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
