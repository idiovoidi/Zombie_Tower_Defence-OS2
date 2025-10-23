import { Container, Graphics } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from '../ZombieParticleSystem';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';

export class StealthZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;
  private fadePhase: number = 0; // For pulsing transparency effect

  // Purple/shadow color scheme for stealth zombie
  private readonly PRIMARY_COLOR = 0x3a2a4a; // Dark purple
  private readonly DARK_PURPLE = 0x2a1a3a; // Very dark purple
  private readonly PALE_PURPLE = 0x4a3a5a; // Pale purple
  private readonly BLOOD_RED = 0x8b0000;
  private readonly BONE_WHITE = 0xcccccc;
  private readonly EYE_GLOW = 0x9966ff; // Purple glow (mysterious)

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('STEALTH');
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();

    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    // Calculate pulsing transparency (50-70% alpha)
    const baseAlpha = 0.5 + Math.sin(this.fadePhase) * 0.1;

    // Faint shadow (barely visible)
    ShadowEffect.apply(this.graphics, 0, 15, 8);
    this.graphics.alpha = baseAlpha * 0.3; // Very faint shadow

    // Legs (crouched, stealthy)
    const leftLegX = -3 + anim.leftLegOffset;
    const rightLegX = 1 + anim.rightLegOffset;

    this.graphics.rect(leftLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.4 });

    this.graphics.rect(rightLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.4 });

    // Torso (crouched posture)
    const torsoY = anim.bodyBob;
    this.graphics
      .roundRect(-5, torsoY, 10, 12, 1)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.4 });

    // Shadowy wisps on torso
    this.graphics.circle(-3, torsoY + 3, 2).fill({
      color: this.DARK_PURPLE,
      alpha: 0.5,
    });
    this.graphics.circle(3, torsoY + 6, 2.5).fill({
      color: this.DARK_PURPLE,
      alpha: 0.5,
    });

    // Faint skeletal structure visible
    for (let i = 0; i < 3; i++) {
      this.graphics.rect(-3, torsoY + 3 + i * 3, 6, 0.5).fill({
        color: this.BONE_WHITE,
        alpha: 0.2,
      });
    }

    // Arms (back arm first) - ghostly
    this.drawArm(-5, torsoY + 2, anim.leftArmAngle, 0.7 * baseAlpha);
    this.drawArm(5, torsoY + 2, anim.rightArmAngle, 1.0 * baseAlpha);

    // Head (semi-transparent)
    const headY = torsoY - 6;
    const headX = anim.headSway;

    // Ghostly aura around head
    this.graphics.circle(headX, headY, 6).fill({
      color: this.PALE_PURPLE,
      alpha: 0.15,
    });

    // Head
    this.graphics.circle(headX, headY, 4.5).fill(this.PRIMARY_COLOR);
    this.graphics.circle(headX, headY, 4.5).stroke({ color: 0x000000, width: 1, alpha: 0.4 });

    // Shadowy features
    this.graphics.circle(headX - 1.5, headY + 0.5, 1.5).fill({
      color: this.DARK_PURPLE,
      alpha: 0.6,
    });

    // Mysterious purple eyes with strong glow
    GlowEffect.apply(this.graphics, headX - 2, headY - 0.5, 2, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2, headY - 0.5, 2, this.EYE_GLOW);

    // Eye sockets (dark)
    this.graphics.circle(headX - 2, headY - 0.5, 1.2).fill({
      color: 0x000000,
      alpha: 0.8,
    });
    this.graphics.circle(headX + 2, headY - 0.5, 1.2).fill({
      color: 0x000000,
      alpha: 0.8,
    });

    // Eye pupils (glowing purple)
    this.graphics.circle(headX - 2, headY - 0.5, 0.8).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 2, headY - 0.5, 0.8).fill(this.EYE_GLOW);

    // Faint mouth
    this.graphics.rect(headX - 1.5, headY + 1.5, 3, 1).fill({
      color: 0x000000,
      alpha: 0.6,
    });

    // Wounds (less visible due to transparency)
    this.drawWounds(healthPercent, torsoY, baseAlpha);

    // Apply base transparency
    this.graphics.alpha = baseAlpha;

    // Tint based on health (darker when damaged)
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

    // Update fade phase for pulsing effect
    this.fadePhase += deltaTime * 0.002;

    const healthPercent = state.health / state.maxHealth;

    // Minimal blood (mostly shadowy)
    if (healthPercent < 0.6 && Math.random() < 0.015) {
      this.particles.emit(ParticleType.BLOOD_DRIP, 0, 5, {
        count: 1,
        velocity: 12,
        lifetime: 800,
        size: 1.2,
      });
    }

    // Shadow wisps when moving
    if (state.isMoving && Math.random() < 0.08) {
      this.particles.emit(ParticleType.SMOKE, 0, 8, {
        count: 1,
        velocity: 8,
        lifetime: 800,
        size: 2.5,
      });
    }
  }

  private drawArm(x: number, y: number, angle: number, alpha: number): void {
    // Ghostly arms
    const armLength = 7;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Arm outline (very faint)
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({
        color: 0x000000,
        width: 2.5,
        alpha: alpha * 0.3,
      });

    // Ghostly arm line
    this.graphics.moveTo(x, y).lineTo(handX, handY).stroke({
      color: this.PRIMARY_COLOR,
      width: 2,
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
      alpha: alpha * 0.3,
    });
  }

  private drawWounds(healthPercent: number, torsoY: number, baseAlpha: number): void {
    // Shadowy wounds (less visible)
    const woundCount = Math.floor((1 - healthPercent) * 4);

    for (let i = 0; i < woundCount; i++) {
      const x = (Math.random() - 0.5) * 7;
      const y = torsoY + (Math.random() - 0.5) * 9;
      const size = 1 + Math.random() * 1.5;

      this.graphics.circle(x, y, size).fill({
        color: this.BLOOD_RED,
        alpha: 0.5 * baseAlpha,
      });
    }
  }

  showDamageEffect(_damageType: string, _amount: number): void {
    // Flash purple/white
    const originalTint = this.graphics.tint;
    this.graphics.tint = 0xaa88ff;
    setTimeout(() => {
      this.graphics.tint = originalTint;
    }, 100);

    // Shadowy particles + some blood
    this.particles.emit(ParticleType.SMOKE, 0, 0, {
      count: 3,
      velocity: 35,
      lifetime: 600,
      size: 2,
    });

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

        if (elapsed < 300) {
          // Phase 1: Flicker
          const t = elapsed / 300;
          this.graphics.alpha = 0.6 - t * 0.2;
          this.graphics.rotation = t * 0.2;
        } else if (elapsed < 800) {
          // Phase 2: Dissipate (fade to nothing)
          const t = (elapsed - 300) / 500;
          this.graphics.alpha = 0.4 - t * 0.4;
          this.graphics.scale.set(1 + t * 0.3);
        } else if (elapsed < 1200) {
          // Phase 3: Final fade
          const t = (elapsed - 800) / 400;
          this.graphics.alpha = 0 + (1 - t) * 0.05;
        } else {
          resolve();
          return;
        }

        requestAnimationFrame(animate);
      };

      // Shadow burst (no blood, just wisps)
      this.particles.emit(ParticleType.SMOKE, 0, 0, {
        count: 8,
        velocity: 50,
        lifetime: 1000,
        size: 2.5,
      });

      // Small amount of blood
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 3,
        velocity: 40,
        lifetime: 800,
        size: 2,
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
