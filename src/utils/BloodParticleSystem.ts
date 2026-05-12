import { GameConfig } from '@config/gameConfig';
import { type Container, Particle, ParticleContainer } from 'pixi.js';
import { getRadialParticleTexture } from './particleTextures';

interface BloodSim {
  particle: Particle;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  /** Whether this is a ground stain (stops moving but persists) */
  isStain: boolean;
}

/**
 * Blood splatter using Pixi v8 {@link ParticleContainer} + pooled {@link Particle} instances.
 * Supports directional emission, blood mist, and persistent ground stains.
 */
export class BloodParticleSystem {
  private readonly particleContainer: ParticleContainer;
  private readonly texture = getRadialParticleTexture();

  private active: BloodSim[] = [];
  private pool: Particle[] = [];
  private readonly maxParticles = 300;

  private particlesCreated = 0;
  private particlesReused = 0;

  private readonly SCREEN_WIDTH = GameConfig.SCREEN_WIDTH;
  private readonly SCREEN_HEIGHT = GameConfig.SCREEN_HEIGHT;
  private readonly OFF_SCREEN_MARGIN = 50;
  private readonly DISTANT_THRESHOLD = 400;

  constructor(parent: Container) {
    this.particleContainer = new ParticleContainer({
      texture: this.texture,
      dynamicProperties: {
        position: true,
        color: true,
      },
    });
    parent.addChild(this.particleContainer);
  }

  /**
   * Create omnidirectional blood splatter (original behavior).
   */
  public createBloodSplatter(x: number, y: number, intensity = 1): void {
    const particleCount = Math.floor(15 * intensity);
    const bloodTints = [0x8b0000, 0xa00000, 0xb00000, 0xc00000];

    for (let i = 0; i < particleCount; i++) {
      if (this.active.length >= this.maxParticles) {
        const oldest = this.active.shift();
        if (oldest) {
          this.recycle(oldest);
        }
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100 * intensity;
      const baseScale = (2 + Math.random() * 4) / 16;

      const p = this.acquireParticle();
      p.x = x;
      p.y = y;
      p.anchorX = 0.5;
      p.anchorY = 0.5;
      p.scaleX = baseScale;
      p.scaleY = baseScale;
      p.rotation = Math.random() * Math.PI * 2;
      p.tint = bloodTints[Math.floor(Math.random() * bloodTints.length)];
      p.alpha = 0.8;

      this.particleContainer.addParticle(p);
      this.active.push({
        particle: p,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        isStain: false,
      });
    }
  }

  /**
   * Create directional blood splatter in a cone from impact point.
   * Blood sprays in the direction of the killing blow.
   *
   * @param x - Impact position X
   * @param y - Impact position Y
   * @param directionAngle - Angle the blood should spray toward (radians)
   * @param intensity - Splatter intensity multiplier (0.5 - 3.0)
   * @param spread - Cone spread in radians (default 0.8 = ~45°)
   */
  public createDirectionalBloodSplatter(
    x: number,
    y: number,
    directionAngle: number,
    intensity = 1,
    spread = 0.8
  ): void {
    const particleCount = Math.floor(20 * intensity);
    const bloodTints = [0x8b0000, 0xa00000, 0xb00000, 0xc00000, 0x700000];

    for (let i = 0; i < particleCount; i++) {
      this.evictIfFull();

      // Cone emission centered on directionAngle
      const angle = directionAngle + (Math.random() - 0.5) * spread;
      const speed = (80 + Math.random() * 150) * intensity;
      const baseScale = (2 + Math.random() * 5 * intensity) / 16;

      const p = this.acquireParticle();
      p.x = x + (Math.random() - 0.5) * 4;
      p.y = y + (Math.random() - 0.5) * 4;
      p.anchorX = 0.5;
      p.anchorY = 0.5;
      p.scaleX = baseScale;
      p.scaleY = baseScale;
      p.rotation = angle;
      p.tint = bloodTints[Math.floor(Math.random() * bloodTints.length)];
      p.alpha = 0.85;

      this.particleContainer.addParticle(p);
      this.active.push({
        particle: p,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.6,
        isStain: false,
      });
    }

    // Add a few back-spray particles (smaller, opposite direction)
    const backSprayCount = Math.floor(5 * intensity);
    for (let i = 0; i < backSprayCount; i++) {
      this.evictIfFull();

      const angle = directionAngle + Math.PI + (Math.random() - 0.5) * 1.2;
      const speed = 30 + Math.random() * 50;
      const baseScale = (1 + Math.random() * 2) / 16;

      const p = this.acquireParticle();
      p.x = x;
      p.y = y;
      p.anchorX = 0.5;
      p.anchorY = 0.5;
      p.scaleX = baseScale;
      p.scaleY = baseScale;
      p.rotation = Math.random() * Math.PI * 2;
      p.tint = 0x700000;
      p.alpha = 0.6;

      this.particleContainer.addParticle(p);
      this.active.push({
        particle: p,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.3 + Math.random() * 0.3,
        isStain: false,
      });
    }
  }

  /**
   * Create a blood mist cloud (for explosive deaths).
   * Slow-expanding semi-transparent cloud.
   */
  public createBloodMist(x: number, y: number, radius: number, intensity = 1): void {
    const particleCount = Math.floor(12 * intensity);

    for (let i = 0; i < particleCount; i++) {
      this.evictIfFull();

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius * 0.5;
      const speed = 15 + Math.random() * 30;
      const baseScale = (4 + Math.random() * 8) / 16;

      const p = this.acquireParticle();
      p.x = x + Math.cos(angle) * dist;
      p.y = y + Math.sin(angle) * dist;
      p.anchorX = 0.5;
      p.anchorY = 0.5;
      p.scaleX = baseScale;
      p.scaleY = baseScale;
      p.rotation = Math.random() * Math.PI * 2;
      p.tint = [0x440000, 0x550000, 0x330000][Math.floor(Math.random() * 3)];
      p.alpha = 0.35;

      this.particleContainer.addParticle(p);
      this.active.push({
        particle: p,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.6,
        isStain: false,
      });
    }
  }

  /**
   * Create a thin, high-velocity blood drip/spray (for sniper headshots).
   */
  public createBloodDrip(x: number, y: number, directionAngle: number, intensity = 1.5): void {
    const particleCount = Math.floor(10 * intensity);

    for (let i = 0; i < particleCount; i++) {
      this.evictIfFull();

      // Very narrow cone for precision kills
      const angle = directionAngle + (Math.random() - 0.5) * 0.3;
      const speed = 150 + Math.random() * 200;
      const baseScale = (1 + Math.random() * 2) / 16;

      const p = this.acquireParticle();
      p.x = x;
      p.y = y;
      p.anchorX = 0.5;
      p.anchorY = 0.5;
      p.scaleX = baseScale;
      p.scaleY = baseScale * 2; // Elongated
      p.rotation = angle;
      p.tint = [0x8b0000, 0xaa0000][Math.floor(Math.random() * 2)];
      p.alpha = 0.9;

      this.particleContainer.addParticle(p);
      this.active.push({
        particle: p,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.3 + Math.random() * 0.2,
        isStain: false,
      });
    }
  }

  private evictIfFull(): void {
    if (this.active.length >= this.maxParticles) {
      const oldest = this.active.shift();
      if (oldest) {
        this.recycle(oldest);
      }
    }
  }

  public update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    for (let i = this.active.length - 1; i >= 0; i--) {
      const sim = this.active[i];
      const { particle: p } = sim;

      // Stains don't move, just fade
      if (sim.isStain) {
        sim.life -= dt / sim.maxLife;
        p.alpha = Math.max(0, sim.life * 0.4);
        if (sim.life <= 0) {
          this.active.splice(i, 1);
          this.recycle(sim);
        }
        continue;
      }

      const isOffScreen =
        p.x < -this.OFF_SCREEN_MARGIN ||
        p.x > this.SCREEN_WIDTH + this.OFF_SCREEN_MARGIN ||
        p.y < -this.OFF_SCREEN_MARGIN ||
        p.y > this.SCREEN_HEIGHT + this.OFF_SCREEN_MARGIN;

      if (isOffScreen) {
        sim.life -= dt / sim.maxLife;
        p.alpha = Math.max(0, sim.life * 0.8);
        if (sim.life <= 0) {
          this.active.splice(i, 1);
          this.recycle(sim);
        }
        continue;
      }

      const centerX = this.SCREEN_WIDTH / 2;
      const centerY = this.SCREEN_HEIGHT / 2;
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const distanceSquared = dx * dx + dy * dy;
      const isDistant = distanceSquared > this.DISTANT_THRESHOLD * this.DISTANT_THRESHOLD;

      sim.vy += 200 * dt;
      p.x += sim.vx * dt;
      p.y += sim.vy * dt;
      if (!isDistant) {
        sim.vx *= 0.98;
      }

      sim.life -= dt / sim.maxLife;
      p.alpha = Math.max(0, sim.life * 0.8);

      if (sim.life <= 0) {
        this.active.splice(i, 1);
        this.recycle(sim);
      }
    }
  }

  public clear(): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      this.recycle(this.active[i]);
    }
    this.active = [];
  }

  public getStats(): {
    activeParticles: number;
    maxParticles: number;
    poolStats: {
      active: number;
      available: number;
      created: number;
      reused: number;
    };
  } {
    return {
      activeParticles: this.active.length,
      maxParticles: this.maxParticles,
      poolStats: {
        active: this.active.length,
        available: this.pool.length,
        created: this.particlesCreated,
        reused: this.particlesReused,
      },
    };
  }

  private acquireParticle(): Particle {
    const pooled = this.pool.pop();
    if (pooled) {
      this.particlesReused++;
      return pooled;
    }
    this.particlesCreated++;
    return new Particle({
      texture: this.texture,
      anchorX: 0.5,
      anchorY: 0.5,
    });
  }

  private recycle(sim: BloodSim): void {
    this.particleContainer.removeParticle(sim.particle);
    sim.particle.alpha = 1;
    if (this.pool.length < this.maxParticles) {
      this.pool.push(sim.particle);
    }
  }
}
