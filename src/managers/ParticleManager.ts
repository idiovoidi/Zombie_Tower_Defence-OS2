import { type Container, Particle, ParticleContainer } from 'pixi.js';
import { getRadialParticleTexture } from '../utils/particleTextures';

interface ParticleConfig {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  decay: number;
  color: number;
  size: number;
}

interface ManagedParticle {
  particle: Particle;
  vx: number;
  vy: number;
  life: number;
  decay: number;
}

/**
 * Generic explosion / burst particles using Pixi v8 {@link ParticleContainer}.
 * Motion and `life` use the same millisecond `deltaTime` convention as the legacy
 * `Graphics` implementation (see `velocity * deltaTime`, `decay * deltaTime`).
 */
export class ParticleManager {
  private readonly particleContainer: ParticleContainer;
  private readonly texture = getRadialParticleTexture();

  private active: ManagedParticle[] = [];
  private pool: Particle[] = [];

  constructor() {
    this.particleContainer = new ParticleContainer({
      texture: this.texture,
      dynamicProperties: {
        position: true,
        color: true,
        rotation: true,
      },
    });
  }

  public getContainer(): Container {
    return this.particleContainer;
  }

  public createParticle(config: ParticleConfig): void {
    const p = this.acquireParticle();
    const scale = config.size / 16;

    p.x = config.x;
    p.y = config.y;
    p.anchorX = 0.5;
    p.anchorY = 0.5;
    p.scaleX = scale;
    p.scaleY = scale;
    p.rotation = Math.random() * Math.PI * 2;
    p.tint = config.color;
    p.alpha = 1;

    this.particleContainer.addParticle(p);
    this.active.push({
      particle: p,
      vx: config.velocityX,
      vy: config.velocityY,
      life: config.life,
      decay: config.decay,
    });
  }

  public createExplosion(x: number, y: number, color: number = 0xff6600): void {
    const particleCount = 10 + Math.floor(Math.random() * 10);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 4;

      this.createParticle({
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const sim = this.active[i];
      const { particle: p } = sim;

      sim.vy += 0.5 * deltaTime;
      p.x += sim.vx * deltaTime;
      p.y += sim.vy * deltaTime;
      p.rotation += deltaTime * 0.003;

      sim.life -= sim.decay * deltaTime;
      p.alpha = Math.max(0, sim.life);

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

  private acquireParticle(): Particle {
    const pooled = this.pool.pop();
    if (pooled) {
      return pooled;
    }
    return new Particle({
      texture: this.texture,
      anchorX: 0.5,
      anchorY: 0.5,
    });
  }

  private recycle(sim: ManagedParticle): void {
    this.particleContainer.removeParticle(sim.particle);
    sim.particle.alpha = 1;
    if (this.pool.length < 500) {
      this.pool.push(sim.particle);
    }
  }
}
