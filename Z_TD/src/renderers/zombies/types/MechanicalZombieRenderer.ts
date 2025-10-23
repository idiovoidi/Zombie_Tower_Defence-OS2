import { Container, Graphics } from 'pixi.js';
import { IZombieRenderer, ZombieRenderState } from '../ZombieRenderer';
import { ZombieAnimator } from '../ZombieAnimator';
import { ParticleType, ZombieParticleSystem } from '../ZombieParticleSystem';
import { GlowEffect, ShadowEffect } from '../components/ZombieEffects';

export class MechanicalZombieRenderer implements IZombieRenderer {
  private graphics: Graphics;
  private animator: ZombieAnimator;
  private particles: ZombieParticleSystem;
  private sparkTimer: number = 0;

  // Cyan-gray metallic color scheme for mechanical zombie
  private readonly PRIMARY_COLOR = 0x3a4a5a; // Dark cyan-gray
  private readonly DARK_METAL = 0x2a3a4a; // Very dark metal
  private readonly LIGHT_METAL = 0x5a6a7a; // Light metal
  private readonly RUST_COLOR = 0x8b4513; // Rust brown
  private readonly OIL_BLACK = 0x1a1a1a; // Oil/grease
  private readonly BLOOD_RED = 0x8b0000;
  private readonly EYE_GLOW = 0x00ffff; // Cyan glow (robotic)

  constructor() {
    this.graphics = new Graphics();
    this.animator = new ZombieAnimator('MECHANICAL');
    this.particles = new ZombieParticleSystem();
  }

  render(container: Container, state: ZombieRenderState): void {
    this.graphics.clear();

    const anim = this.animator.getCurrentFrame();
    const healthPercent = state.health / state.maxHealth;

    // Shadow
    ShadowEffect.apply(this.graphics, 0, 16, 9);

    // Mechanical legs with joints
    const leftLegX = -3.5 + anim.leftLegOffset;
    const rightLegX = 1.5 + anim.rightLegOffset;

    // Legs with mechanical segments
    this.graphics.rect(leftLegX, 10, 3.5, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(leftLegX, 10, 3.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    this.graphics.rect(rightLegX, 10, 3.5, 6).fill(this.PRIMARY_COLOR);
    this.graphics.rect(rightLegX, 10, 3.5, 6).stroke({ color: 0x000000, width: 0.5, alpha: 0.6 });

    // Knee joints
    this.graphics.circle(leftLegX + 1.75, 13, 1.2).fill(this.DARK_METAL);
    this.graphics.circle(leftLegX + 1.75, 13, 0.6).fill(this.LIGHT_METAL);

    this.graphics.circle(rightLegX + 1.75, 13, 1.2).fill(this.DARK_METAL);
    this.graphics.circle(rightLegX + 1.75, 13, 0.6).fill(this.LIGHT_METAL);

    // Torso (angular, mechanical)
    const torsoY = anim.bodyBob;
    this.graphics
      .rect(-6, torsoY, 12, 13)
      .fill(this.PRIMARY_COLOR)
      .stroke({ color: 0x000000, width: 1, alpha: 0.6 });

    // Chest panel (lighter)
    this.graphics.rect(-5, torsoY + 2, 10, 8).fill({
      color: this.LIGHT_METAL,
      alpha: 0.5,
    });
    this.graphics.rect(-5, torsoY + 2, 10, 8).stroke({
      color: this.DARK_METAL,
      width: 0.5,
    });

    // Panel lines (geometric)
    this.graphics.rect(-4, torsoY + 5, 8, 0.5).fill(this.DARK_METAL);
    this.graphics.rect(-0.5, torsoY + 3, 1, 6).fill(this.DARK_METAL);

    // Bolts/rivets
    this.drawBolt(-5, torsoY + 3);
    this.drawBolt(5, torsoY + 3);
    this.drawBolt(-5, torsoY + 9);
    this.drawBolt(5, torsoY + 9);

    // Core glow (power source)
    this.graphics.circle(0, torsoY + 6, 2).fill({
      color: this.EYE_GLOW,
      alpha: 0.4,
    });
    this.graphics.circle(0, torsoY + 6, 1.2).fill({
      color: this.EYE_GLOW,
      alpha: 0.7,
    });

    // Damage/rust based on health
    if (healthPercent < 0.7) {
      this.drawDamage(healthPercent, torsoY);
    }

    // Arms (back arm first) - mechanical
    this.drawArm(-6, torsoY + 3, anim.leftArmAngle, 0.7);
    this.drawArm(6, torsoY + 3, anim.rightArmAngle, 1.0);

    // Mechanical head
    const headY = torsoY - 7;
    const headX = anim.headSway;

    // Angular head (not round)
    this.graphics.rect(headX - 5, headY - 4, 10, 9).fill(this.PRIMARY_COLOR);
    this.graphics.rect(headX - 5, headY - 4, 10, 9).stroke({
      color: 0x000000,
      width: 1,
      alpha: 0.6,
    });

    // Head panel
    this.graphics.rect(headX - 4, headY - 3, 8, 7).fill({
      color: this.LIGHT_METAL,
      alpha: 0.4,
    });

    // Antenna/sensor
    this.graphics.rect(headX - 0.5, headY - 6, 1, 2).fill(this.DARK_METAL);
    this.graphics.circle(headX, headY - 6, 1).fill({
      color: this.EYE_GLOW,
      alpha: 0.8,
    });

    // Visor/eye panel with cyan glow
    this.graphics.rect(headX - 4, headY - 1, 8, 2).fill({
      color: 0x000000,
      alpha: 0.9,
    });

    // Glowing mechanical eyes
    GlowEffect.apply(this.graphics, headX - 2.5, headY, 1.8, this.EYE_GLOW);
    GlowEffect.apply(this.graphics, headX + 2.5, headY, 1.8, this.EYE_GLOW);

    this.graphics.rect(headX - 3, headY - 0.5, 1.5, 1).fill(this.EYE_GLOW);
    this.graphics.rect(headX + 1.5, headY - 0.5, 1.5, 1).fill(this.EYE_GLOW);

    // Vent/speaker
    this.graphics.rect(headX - 2, headY + 2, 4, 1.5).fill({
      color: this.DARK_METAL,
      alpha: 0.8,
    });
    for (let i = 0; i < 4; i++) {
      this.graphics.rect(headX - 1.5 + i, headY + 2.2, 0.5, 1).fill({
        color: 0x000000,
        alpha: 0.6,
      });
    }

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
    this.sparkTimer += deltaTime;

    // Oil leaks when damaged
    if (healthPercent < 0.6 && Math.random() < 0.03) {
      this.particles.emit(ParticleType.SMOKE, 0, 6, {
        count: 1,
        velocity: 8,
        lifetime: 1000,
        size: 1.5,
      });
    }

    // Electrical sparks when heavily damaged
    if (healthPercent < 0.4 && this.sparkTimer > 500 && Math.random() < 0.1) {
      this.particles.emit(ParticleType.SPARKS, 0, 3, {
        count: 2,
        velocity: 25,
        lifetime: 400,
        size: 1.2,
      });
      this.sparkTimer = 0;
    }
  }

  private drawArm(x: number, y: number, angle: number, alpha: number): void {
    // Mechanical arms with segments
    const armLength = 8;
    const handX = x + Math.cos(angle) * armLength;
    const handY = y + Math.sin(angle) * armLength;

    // Arm outline
    this.graphics
      .moveTo(x, y)
      .lineTo(handX, handY)
      .stroke({
        color: 0x000000,
        width: 2.8,
        alpha: alpha * 0.5,
      });

    // Mechanical arm
    this.graphics.moveTo(x, y).lineTo(handX, handY).stroke({
      color: this.PRIMARY_COLOR,
      width: 2.5,
      alpha,
    });

    // Elbow joint
    const elbowX = x + Math.cos(angle) * (armLength * 0.5);
    const elbowY = y + Math.sin(angle) * (armLength * 0.5);
    this.graphics.circle(elbowX, elbowY, 1.5).fill({
      color: this.DARK_METAL,
      alpha,
    });
    this.graphics.circle(elbowX, elbowY, 0.8).fill({
      color: this.LIGHT_METAL,
      alpha,
    });

    // Mechanical claw hand
    this.graphics.circle(handX, handY, 2).fill({
      color: this.PRIMARY_COLOR,
      alpha,
    });
    this.graphics.circle(handX, handY, 2).stroke({
      color: 0x000000,
      width: 0.5,
      alpha: alpha * 0.5,
    });

    // Claw details
    this.graphics.circle(handX, handY, 1).fill({
      color: this.DARK_METAL,
      alpha,
    });
  }

  private drawBolt(x: number, y: number): void {
    // Mechanical bolt/rivet
    this.graphics.circle(x, y, 1).fill(this.DARK_METAL);
    this.graphics.circle(x, y, 0.5).fill(this.LIGHT_METAL);
    // Cross pattern
    this.graphics.rect(x - 0.6, y - 0.1, 1.2, 0.2).fill(0x000000);
    this.graphics.rect(x - 0.1, y - 0.6, 0.2, 1.2).fill(0x000000);
  }

  private drawDamage(healthPercent: number, torsoY: number): void {
    // Rust spots
    const rustCount = Math.floor((1 - healthPercent) * 5);
    for (let i = 0; i < rustCount; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = torsoY + (Math.random() - 0.5) * 11;
      const size = 0.8 + Math.random() * 1.5;

      this.graphics.circle(x, y, size).fill({
        color: this.RUST_COLOR,
        alpha: 0.7,
      });
    }

    // Oil stains
    const oilCount = Math.floor((1 - healthPercent) * 3);
    for (let i = 0; i < oilCount; i++) {
      const x = (Math.random() - 0.5) * 9;
      const y = torsoY + (Math.random() - 0.5) * 10;
      const size = 1 + Math.random() * 1.8;

      this.graphics.circle(x, y, size).fill({
        color: this.OIL_BLACK,
        alpha: 0.6,
      });
    }

    // Exposed wiring at critical health
    if (healthPercent < 0.3) {
      this.graphics
        .moveTo(-4, torsoY + 4)
        .lineTo(-2, torsoY + 6)
        .lineTo(-3, torsoY + 8)
        .stroke({
          color: 0xff6600,
          width: 0.8,
          alpha: 0.8,
        });
    }
  }

  showDamageEffect(_damageType: string, _amount: number): void {
    // Flash cyan/white (electrical)
    const originalTint = this.graphics.tint;
    this.graphics.tint = 0x00ffff;
    setTimeout(() => {
      this.graphics.tint = originalTint;
    }, 100);

    // Emit sparks (primary effect)
    this.particles.emit(ParticleType.SPARKS, 0, 0, {
      count: 5,
      velocity: 50,
      lifetime: 500,
      size: 1.5,
    });

    // Small amount of oil
    this.particles.emit(ParticleType.SMOKE, 0, 0, {
      count: 2,
      velocity: 25,
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
          // Phase 1: Electrical failure (sparking)
          const t = elapsed / 300;
          this.graphics.rotation = t * 0.2;
          // Flicker effect
          this.graphics.alpha = t % 0.2 < 0.1 ? 0.5 : 1.0;
        } else if (elapsed < 800) {
          // Phase 2: Shutdown and collapse
          const t = (elapsed - 300) / 500;
          this.graphics.rotation = 0.2 + t * (Math.PI / 2 - 0.2);
          this.graphics.scale.y = 1 - t * 0.7;
          this.graphics.alpha = 1 - t * 0.4;
        } else if (elapsed < 1500) {
          // Phase 3: Power down
          const t = (elapsed - 800) / 700;
          this.graphics.alpha = 0.6 - t * 0.6;
          this.graphics.y += t * 4;
        } else {
          resolve();
          return;
        }

        requestAnimationFrame(animate);
      };

      // Electrical explosion
      this.particles.emit(ParticleType.SPARKS, 0, 0, {
        count: 12,
        velocity: 70,
        lifetime: 1000,
        size: 2,
      });

      // Smoke/oil
      this.particles.emit(ParticleType.SMOKE, 0, 0, {
        count: 8,
        velocity: 40,
        lifetime: 1200,
        size: 2.5,
      });

      // Metal shards
      this.particles.emit(ParticleType.METAL_SHARDS, 0, 0, {
        count: 6,
        velocity: 55,
        lifetime: 1000,
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
