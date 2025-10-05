import { Container, Graphics } from 'pixi.js';

interface BloodParticle {
  graphics: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export class BloodParticleSystem {
  private particles: BloodParticle[] = [];
  private container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  // Create blood splatter effect at position
  public createBloodSplatter(x: number, y: number, intensity: number = 1): void {
    const particleCount = Math.floor(15 * intensity);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100 * intensity;
      const size = 2 + Math.random() * 4;

      const particle: BloodParticle = {
        graphics: new Graphics(),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        size,
      };

      // Random blood colors (dark red to bright red)
      const bloodColors = [0x8b0000, 0xa00000, 0xb00000, 0xc00000];
      const color = bloodColors[Math.floor(Math.random() * bloodColors.length)];

      particle.graphics.circle(0, 0, size).fill(color);
      particle.graphics.position.set(x, y);
      particle.graphics.alpha = 0.8;

      this.particles.push(particle);
      this.container.addChild(particle.graphics);
    }
  }

  // Update all particles
  public update(deltaTime: number): void {
    const dt = deltaTime / 1000;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Apply gravity
      particle.vy += 200 * dt;

      // Update position
      particle.graphics.x += particle.vx * dt;
      particle.graphics.y += particle.vy * dt;

      // Slow down horizontal movement (friction)
      particle.vx *= 0.98;

      // Decrease life
      particle.life -= dt / particle.maxLife;

      // Fade out
      particle.graphics.alpha = Math.max(0, particle.life * 0.8);

      // Remove dead particles
      if (particle.life <= 0) {
        this.container.removeChild(particle.graphics);
        particle.graphics.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  // Clear all particles
  public clear(): void {
    for (const particle of this.particles) {
      this.container.removeChild(particle.graphics);
      particle.graphics.destroy();
    }
    this.particles = [];
  }
}
