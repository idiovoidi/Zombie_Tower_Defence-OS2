import { Container, Graphics } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from '../ZombieParticleSystem';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';

export class FastZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;

  // Orange color scheme for fast zombie
  private readonly PRIMARY_COLOR = 0x8b4513; // Dark orange-brown
  private readonly DARK_ORANGE = 0x5a2a0a; // Very dark orange for shadows
  private readonly PALE_ORANGE = 0xa0522d; // Slightly lighter orange
  private readonly BLOOD_RED = 0x8b0000;
  private readonly BONE_WHITE = 0xcccccc;
  private readonly EYE_GLOW = 0xff6600; // Orange glow

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('FAST');
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();

    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    // Shadow
    ShadowEffect.apply(this.graphics, 0, 15, 7);

    // Legs with shuffle animation (thinner/faster looking)
    const leftLegX = -2.5 + anim.leftLegOffset;
    const rightLegX = 0.5 + anim.rightLegOffset;

    // Thinner legs for speed
    this.graphics.rect(leftLegX, 10, 2.5, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 2.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.graphics.rect(rightLegX, 10, 2.5, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 2.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    // Torso (leaner/more athletic)
    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-4, torsoY, 8, 11, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    // Muscle definition lines
    for (let i = 0; i < 3; i++) {
      this.graphics.rect(-2.5, torsoY + 2 + i * 3, 5, 0.5).fill({
        color: this.DARK_ORANGE,
        alpha: 0.7,
      });
    }

    // Arms (back arm first for layering) - more extended for running pose
    this.drawArm(-4, torsoY + 2, anim.leftArmAngle, 0.7);
    this.drawArm(4, torsoY + 2, anim.rightArmAngle, 1.0);

    // Head (smaller, more aerodynamic)
    const headY = torsoY - 6;
    const headX = anim.headSway;

    // Smaller head for speed
    this.graphics.circle(headX, headY, 4).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 4).stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    // Eyes with orange glow (more intense/aggressive)
    GlowEffect.apply(this.graphics, headX - 1.8, headY - 0.5, 1.8, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 1.8, headY - 0.5, 1.8, this.EYE_GLOW);

    // Eye sockets
    this.graphics.circle(headX - 1.8, headY - 0.5, 1).fill({
      color: 0x000000,
      alpha: 0.9,
    });
    this.graphics.circle(headX + 1.8, headY - 0.5, 1).fill({
      color: 0x000000,
      alpha: 0.9,
    });

    // Eye pupils (glowing orange)
    this.graphics.circle(headX - 1.8, headY - 0.5, 0.7).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 1.8, headY - 0.5, 0.7).fill(this.EYE_GLOW);

    // Snarling mouth (wider for aggression)
    this.graphics.rect(headX - 1.8, headY + 1.5, 3.6, 1).fill({
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
    // Slightly longer arms for running motion
    const armLength = 8;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Arm outline (subtle)
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({
        color: 0x000000,
        width: 2.5,
        alpha: alpha * 0.5,
      });

    // Arm line (thinner for speed)
    this.graphics.moveTo(x, y).lineTo(handX, handY).stroke({
      color: this.PRIMARY_COLOR,
      width: 1.8,
      alpha,
    });

    // Hand
    this.graphics.circle(handX, handY, 1.5).fill({
      color: this.PRIMARY_COLOR,
      alpha,
    });
    this.graphics.circle(handX, handY, 1.5).stroke({
      color: 0x000000,
      width: 0.5,
      alpha: alpha * 0.5,
    });
  }

  private drawWounds(healthPercent: number, torsoY: number): void {
    // Simple blood spots when damaged
    const woundCount = Math.floor((1 - healthPercent) * 5);

    for (let i = 0; i < woundCount; i++) {
      const x = (Math.random() - 0.5) * 6;
      const y = torsoY + (Math.random() - 0.5) * 8;
      const size = 1 + Math.random() * 1.5;

      this.graphics.circle(x, y, size).fill({
        color: this.BLOOD_RED,
        alpha: 0.8,
      });
    }
  }

  showDamageEffect(_damageType: string, _amount: number): void {
    // Flash orange
    const originalTint = this.graphics.tint;
    this.graphics.tint = 0xff6600;
    setTimeout(() => {
      this.graphics.tint = originalTint;
    }, 100);

    // Emit blood particles
    this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
      count: 3,
      velocity: 50,
      lifetime: 600,
      size: 2,
    });
  }

  async playDeathAnimation(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed < 300) {
          // Phase 1: Impact (0-300ms)
          const t = elapsed / 300;
          this.graphics.rotation = t * 0.3;
          this.graphics.scale.set(1 + t * 0.2);
        } else if (elapsed < 800) {
          // Phase 2: Collapse (300-800ms)
          const t = (elapsed - 300) / 500;
          this.graphics.rotation = 0.3 + t * (Math.PI / 2 - 0.3);
          this.graphics.scale.y = 1.2 - t * 0.9;
          this.graphics.alpha = 1 - t * 0.5;
        } else if (elapsed < 1500) {
          // Phase 3: Fade out (800-1500ms)
          const t = (elapsed - 800) / 700;
          this.graphics.alpha = 0.5 - t * 0.5;
          this.graphics.y += t * 5;
        } else {
          // Done
          resolve();
          return;
        }

        requestAnimationFrame(animate);
      };

      // Emit death burst
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 8,
        velocity: 70,
        lifetime: 1000,
        size: 2.5,
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
