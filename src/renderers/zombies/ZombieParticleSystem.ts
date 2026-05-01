import { Graphics } from 'pixi.js';

export enum ParticleType {
  BLOOD_SPLATTER,
  BLOOD_DRIP,
  DECAY_CLOUD,
  SPARKS,
  SMOKE,
  FIRE,
  ELECTRICITY,
  BONE_FRAGMENTS,
  METAL_SHARDS,
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
}

export interface ParticleConfig {
  count: number;
  velocity: number;
  lifetime?: number;
  size?: number;
}

export class ZombieParticleSystem {
  private particles: Particle[] = [];
  private graphics: Graphics;
  private maxParticles: number = 100;

  constructor() {
    this.graphics = new Graphics();
  }

  emit(type: ParticleType, x: number, y: number, config: ParticleConfig): void {
    const count = Math.min(config.count, this.maxParticles - this.particles.length);

    for (let i = 0; i < count; i++) {
      let angle: number;
      let speed: number;

      // Different emission patterns based on type
      if (type === ParticleType.BLOOD_DRIP) {
        // Drips fall mostly downward
        angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        speed = config.velocity * (0.8 + Math.random() * 0.4);
      } else if (type === ParticleType.DECAY_CLOUD) {
        // Decay floats upward
        angle = -Math.PI / 2 + (Math.random() - 0.5) * 1;
        speed = config.velocity * (0.5 + Math.random() * 0.5);
      } else {
        // Splatter in all directions
        angle = Math.random() * Math.PI * 2;
        speed = config.velocity * (0.5 + Math.random() * 0.5);
      }

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: config.lifetime || 1000,
        maxLife: config.lifetime || 1000,
        size: (config.size || 3) * (0.7 + Math.random() * 0.6),
        color: this.getParticleColor(type),
        alpha: 1,
      });
    }
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Different physics for different particle types
      if (p.color === 0x006600) {
        // Decay cloud floats up slowly
        p.vy -= 20 * dt;
        p.vx *= 0.98; // Air resistance
      } else {
        // Blood particles fall with gravity
        p.vy += 200 * dt;
      }

      p.life -= deltaTime;
      p.alpha = p.life / p.maxLife;

      // Fade out faster at the end
      if (p.life < p.maxLife * 0.3) {
        p.alpha *= p.life / (p.maxLife * 0.3);
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(graphics: Graphics): void {
    for (const p of this.particles) {
      graphics.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: p.alpha });
    }
  }

  private getParticleColor(type: ParticleType): number {
    switch (type) {
      case ParticleType.BLOOD_SPLATTER:
        return 0x8b0000;
      case ParticleType.BLOOD_DRIP:
        return 0x8b0000;
      case ParticleType.DECAY_CLOUD:
        return 0x006600;
      case ParticleType.SPARKS:
        return 0xffff00;
      case ParticleType.SMOKE:
        return 0x333333;
      case ParticleType.FIRE:
        return 0xff6600;
      case ParticleType.ELECTRICITY:
        return 0x00ffff;
      case ParticleType.BONE_FRAGMENTS:
        return 0xeeeeee;
      case ParticleType.METAL_SHARDS:
        return 0x888888;
      default:
        return 0xffffff;
    }
  }

  destroy(): void {
    this.graphics.destroy();
    this.particles = [];
  }

  getGraphics(): Graphics {
    return this.graphics;
  }
}
