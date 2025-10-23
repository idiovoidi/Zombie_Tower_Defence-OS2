import { Container, Graphics } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from '../ZombieParticleSystem';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';

export class BasicZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;

  private readonly PRIMARY_COLOR = 0x2d5016; // Dark zombie green
  private readonly DARK_GREEN = 0x1a3010; // Very dark green for shadows
  private readonly PALE_GREEN = 0x3d6020; // Slightly lighter green
  private readonly BLOOD_RED = 0x8b0000;
  private readonly BONE_WHITE = 0xcccccc;
  private readonly EYE_GLOW = 0xff0000;

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('BASIC');
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();

    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    // Shadow
    ShadowEffect.apply(this.graphics, 0, 15, 8);

    // Legs with shuffle animation (simplified)
    const leftLegX = -3 + anim.leftLegOffset;
    const rightLegX = 1 + anim.rightLegOffset;

    // Simple leg rectangles with subtle outline
    this.graphics.rect(leftLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.graphics.rect(rightLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    // Torso with bob and subtle outline
    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-5, torsoY, 10, 12, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    // Simple ribcage lines
    for (let i = 0; i < 3; i++) {
      this.graphics.rect(-3, torsoY + 3 + i * 3, 6, 0.5).fill({
        color: this.DARK_GREEN,
        alpha: 0.8,
      });
    }

    // Arms (back arm first for layering)
    this.drawArm(-5, torsoY + 2, anim.leftArmAngle, 0.7);
    this.drawArm(5, torsoY + 2, anim.rightArmAngle, 1.0);

    // Head with tilt and sway (directly on torso, no neck)
    const headY = torsoY - 6;
    const headX = anim.headSway;

    // Simple head circle with subtle outline
    this.graphics.circle(headX, headY, 4.5).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 4.5).stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    // Eyes with glow
    GlowEffect.apply(this.graphics, headX - 2, headY - 0.5, 1.5, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2, headY - 0.5, 1.5, this.EYE_GLOW);

    // Eye sockets
    this.graphics.circle(headX - 2, headY - 0.5, 1).fill({
      color: 0x000000,
      alpha: 0.9,
    });
    this.graphics.circle(headX + 2, headY - 0.5, 1).fill({
      color: 0x000000,
      alpha: 0.9,
    });

    // Eye pupils (glowing)
    this.graphics.circle(headX - 2, headY - 0.5, 0.6).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 2, headY - 0.5, 0.6).fill(this.EYE_GLOW);

    // Simple mouth
    this.graphics.rect(headX - 1.5, headY + 1.5, 3, 1).fill({
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

    const healthPercent = state.health / state.maxHealth;

    // Emit drip particles occasionally when damaged
    if (healthPercent < 0.7 && Math.random() < 0.03) {
      this.particles.emit(ParticleType.BLOOD_DRIP, 0, 5, {
        count: 1,
        velocity: 15,
        lifetime: 1000,
        size: 1.5,
      });
    }
  }

  private drawArm(x: number, y: number, angle: number, alpha: number): void {
    // Simple arm as single line with outline
    const armLength = 7;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Arm outline (subtle black)
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({
        color: 0x000000,
        width: 2.5,
        alpha: alpha * 0.5,
      });

    // Arm line
    this.graphics.moveTo(x, y).lineTo(handX, handY).stroke({
      color: this.PRIMARY_COLOR,
      width: 2,
      alpha,
    });

    // Simple hand circle with subtle outline
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
      const x = (Math.random() - 0.5) * 7;
      const y = torsoY + (Math.random() - 0.5) * 9;
      const size = 1 + Math.random() * 1.5;

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

    // Emit blood particles (reduced)
    this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
      count: 3,
      velocity: 40,
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

      // Emit death burst (simplified)
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 8,
        velocity: 60,
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
