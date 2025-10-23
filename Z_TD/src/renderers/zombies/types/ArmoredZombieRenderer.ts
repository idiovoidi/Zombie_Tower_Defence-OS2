import { Container, Graphics } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from '../ZombieParticleSystem';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';

export class ArmoredZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;

  // Gray metallic color scheme for armored zombie
  private readonly PRIMARY_COLOR = 0x4a4a4a; // Dark gray (armor)
  private readonly DARK_GRAY = 0x2a2a2a; // Very dark gray (shadows)
  private readonly LIGHT_GRAY = 0x6a6a6a; // Light gray (highlights)
  private readonly ZOMBIE_GREEN = 0x2d5016; // Zombie flesh showing through
  private readonly RUST_COLOR = 0x8b4513; // Rust brown
  private readonly BLOOD_RED = 0x8b0000;
  private readonly BONE_WHITE = 0xcccccc;
  private readonly EYE_GLOW = 0xff6600; // Orange glow (through visor)

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('ARMORED');
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();

    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    // Shadow
    ShadowEffect.apply(this.graphics, 0, 15, 9);

    // Legs with armor plating
    const leftLegX = -3 + anim.leftLegOffset;
    const rightLegX = 1 + anim.rightLegOffset;

    // Zombie flesh showing at joints
    this.graphics.rect(leftLegX + 0.5, 11, 2, 1.5).fill({
      color: this.ZOMBIE_GREEN,
      alpha: 0.8,
    });
    this.graphics.rect(rightLegX + 0.5, 11, 2, 1.5).fill({
      color: this.ZOMBIE_GREEN,
      alpha: 0.8,
    });

    // Armored legs
    this.graphics.rect(leftLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.graphics.rect(rightLegX, 10, 3, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 3, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    // Torso with armor
    const torsoY = anim.bodyBob;

    // Zombie flesh base (showing through gaps)
    this.graphics
      .roundRect(-5, torsoY, 10, 12, 1)
      .fill(this.ZOMBIE_GREEN)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    // Armor plates (horizontal) - don't cover entire body
    this.graphics.rect(-5, torsoY + 2, 10, 3).fill({
      color: this.LIGHT_GRAY,
      alpha: 0.6,
    });
    this.graphics.rect(-5, torsoY + 2, 10, 3).stroke({
      color: this.DARK_GRAY,
      width: 0.5,
    });

    this.graphics.rect(-5, torsoY + 7, 10, 3).fill({
      color: this.LIGHT_GRAY,
      alpha: 0.6,
    });
    this.graphics.rect(-5, torsoY + 7, 10, 3).stroke({
      color: this.DARK_GRAY,
      width: 0.5,
    });

    // Green flesh visible between armor plates
    this.graphics.rect(-4, torsoY + 5.5, 8, 1).fill({
      color: this.ZOMBIE_GREEN,
      alpha: 0.9,
    });

    // Rivets on armor
    this.drawRivet(-4, torsoY + 3);
    this.drawRivet(4, torsoY + 3);
    this.drawRivet(-4, torsoY + 8);
    this.drawRivet(4, torsoY + 8);

    // Rust spots (more visible at low health)
    if (healthPercent < 0.7) {
      this.drawRust(healthPercent, torsoY);
    }

    // Arms (back arm first) - armored
    this.drawArm(-5, torsoY + 2, anim.leftArmAngle, 0.7);
    this.drawArm(5, torsoY + 2, anim.rightArmAngle, 1.0);

    // Helmet head
    const headY = torsoY - 6;
    const headX = anim.headSway;

    // Zombie head base (green flesh)
    this.graphics.circle(headX, headY, 4).fill(this.ZOMBIE_GREEN);

    // Helmet (angular, not round) - doesn't cover entire head
    this.graphics.rect(headX - 4.5, headY - 4, 9, 8).fill(this.PRIMARY_COLOR);
    this.graphics.rect(headX - 4.5, headY - 4, 9, 8).stroke({
      color: 0x000000,
      width: 1,
      alpha: 0.6,
    });

    // Helmet ridge
    this.graphics.rect(headX - 4.5, headY - 4, 9, 1.5).fill({
      color: this.LIGHT_GRAY,
      alpha: 0.7,
    });

    // Green flesh visible at neck/bottom of helmet
    this.graphics.rect(headX - 3, headY + 2.5, 6, 1.5).fill({
      color: this.ZOMBIE_GREEN,
      alpha: 0.9,
    });

    // Visor slit with orange glow
    this.graphics.rect(headX - 3.5, headY - 1, 7, 1.5).fill({
      color: 0x000000,
      alpha: 0.9,
    });

    // Eyes glowing through visor
    GlowEffect.apply(this.graphics, headX - 2, headY - 0.5, 1.5, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2, headY - 0.5, 1.5, this.EYE_GLOW);

    this.graphics.circle(headX - 2, headY - 0.5, 0.6).fill(this.EYE_GLOW);
    this.graphics.circle(headX + 2, headY - 0.5, 0.6).fill(this.EYE_GLOW);

    // Helmet damage/dents
    if (healthPercent < 0.5) {
      this.graphics.circle(headX - 2, headY + 1, 1).fill({
        color: this.DARK_GRAY,
        alpha: 0.8,
      });
      this.graphics.circle(headX + 1.5, headY - 2, 0.8).fill({
        color: this.DARK_GRAY,
        alpha: 0.8,
      });
    }

    // Wounds (blood seeping through armor)
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
    // Armored arms
    const armLength = 7;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Green zombie flesh underneath
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({
        color: this.ZOMBIE_GREEN,
        width: 2.8,
        alpha: alpha * 0.7,
      });

    // Arm outline
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({
        color: 0x000000,
        width: 2.5,
        alpha: alpha * 0.5,
      });

    // Armored arm (thicker)
    this.graphics.moveTo(x, y).lineTo(handX, handY).stroke({
      color: this.PRIMARY_COLOR,
      width: 2.5,
      alpha,
    });

    // Gauntlet hand
    this.graphics.circle(handX, handY, 1.8).fill({
      color: this.PRIMARY_COLOR,
      alpha,
    });
    this.graphics.circle(handX, handY, 1.8).stroke({
      color: 0x000000,
      width: 0.5,
      alpha: alpha * 0.5,
    });

    // Armor segment line (joint showing green)
    const midX = x + Math.cos(angle) * (armLength * 0.5);
    const midY = y + Math.sin(angle) * (armLength * 0.5);
    this.graphics.circle(midX, midY, 1.2).fill({
      color: this.ZOMBIE_GREEN,
      alpha: alpha * 0.8,
    });
    this.graphics.circle(midX, midY, 1).fill({
      color: this.DARK_GRAY,
      alpha: alpha * 0.6,
    });
  }

  private drawRivet(x: number, y: number): void {
    // Small rivet/bolt
    this.graphics.circle(x, y, 0.8).fill(this.DARK_GRAY);
    this.graphics.circle(x, y, 0.4).fill(this.LIGHT_GRAY);
  }

  private drawRust(healthPercent: number, torsoY: number): void {
    // Rust spots appear as armor degrades
    const rustCount = Math.floor((1 - healthPercent) * 4);

    for (let i = 0; i < rustCount; i++) {
      const x = (Math.random() - 0.5) * 8;
      const y = torsoY + (Math.random() - 0.5) * 10;
      const size = 0.8 + Math.random() * 1.2;

      this.graphics.circle(x, y, size).fill({
        color: this.RUST_COLOR,
        alpha: 0.7,
      });
    }
  }

  private drawWounds(healthPercent: number, torsoY: number): void {
    // Blood seeping through armor cracks
    const woundCount = Math.floor((1 - healthPercent) * 4);

    for (let i = 0; i < woundCount; i++) {
      const x = (Math.random() - 0.5) * 7;
      const y = torsoY + (Math.random() - 0.5) * 9;
      const size = 1 + Math.random() * 1.2;

      this.graphics.circle(x, y, size).fill({
        color: this.BLOOD_RED,
        alpha: 0.7,
      });
    }
  }

  showDamageEffect(_damageType: string, _amount: number): void {
    // Flash gray/white (metal impact)
    const originalTint = this.graphics.tint;
    this.graphics.tint = 0xffffff;
    setTimeout(() => {
      this.graphics.tint = originalTint;
    }, 100);

    // Emit metal sparks instead of blood
    this.particles.emit(ParticleType.SPARKS, 0, 0, {
      count: 4,
      velocity: 45,
      lifetime: 500,
      size: 1.5,
    });

    // Some blood if armor is breached
    if (Math.random() < 0.3) {
      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 2,
        velocity: 35,
        lifetime: 600,
        size: 2,
      });
    }
  }

  async playDeathAnimation(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed < 300) {
          // Phase 1: Impact
          const t = elapsed / 300;
          this.graphics.rotation = t * 0.3;
          this.graphics.scale.set(1 + t * 0.2);
        } else if (elapsed < 800) {
          // Phase 2: Collapse (heavy armor)
          const t = (elapsed - 300) / 500;
          this.graphics.rotation = 0.3 + t * (Math.PI / 2 - 0.3);
          this.graphics.scale.y = 1.2 - t * 0.9;
          this.graphics.alpha = 1 - t * 0.5;
        } else if (elapsed < 1500) {
          // Phase 3: Fade out
          const t = (elapsed - 800) / 700;
          this.graphics.alpha = 0.5 - t * 0.5;
          this.graphics.y += t * 5;
        } else {
          resolve();
          return;
        }

        requestAnimationFrame(animate);
      };

      // Death burst (metal shards + blood)
      this.particles.emit(ParticleType.METAL_SHARDS, 0, 0, {
        count: 6,
        velocity: 55,
        lifetime: 1000,
        size: 2,
      });

      this.particles.emit(ParticleType.BLOOD_SPLATTER, 0, 0, {
        count: 5,
        velocity: 50,
        lifetime: 900,
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
