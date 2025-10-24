import { Container, Graphics } from 'pixi.js';
import { ObjectPool } from './ObjectPool';
import { GameConfig } from '@config/gameConfig';

interface BloodParticle {
  graphics: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
}

export class BloodParticleSystem {
  private particles: BloodParticle[] = [];
  private container: Container;
  private particlePool: ObjectPool<BloodParticle>;
  private maxParticles: number = 200;

  // Performance optimization thresholds
  private readonly SCREEN_WIDTH = GameConfig.SCREEN_WIDTH;
  private readonly SCREEN_HEIGHT = GameConfig.SCREEN_HEIGHT;
  private readonly OFF_SCREEN_MARGIN = 50; // Extra margin for off-screen culling
  private readonly DISTANT_THRESHOLD = 400; // Distance for simplified physics

  constructor(container: Container) {
    this.container = container;

    // Initialize particle pool
    this.particlePool = new ObjectPool<BloodParticle>(
      () => ({
        graphics: new Graphics(),
        vx: 0,
        vy: 0,
        life: 1,
        maxLife: 1,
        size: 2,
        color: 0x8b0000,
      }),
      (particle: BloodParticle) => {
        particle.graphics.clear();
        particle.graphics.alpha = 1;
        particle.graphics.visible = true;
        particle.graphics.x = 0;
        particle.graphics.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.life = 1;
        particle.maxLife = 1;
        particle.size = 2;
        particle.color = 0x8b0000;
      },
      this.maxParticles
    );
  }

  // Create blood splatter effect at position
  public createBloodSplatter(x: number, y: number, intensity: number = 1): void {
    const particleCount = Math.floor(15 * intensity);

    for (let i = 0; i < particleCount; i++) {
      // Remove oldest particle if at limit
      if (this.particles.length >= this.maxParticles) {
        const oldest = this.particles.shift();
        if (oldest) {
          this.container.removeChild(oldest.graphics);
          this.particlePool.release(oldest);
        }
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100 * intensity;
      const size = 2 + Math.random() * 4;

      // Acquire particle from pool
      const particle = this.particlePool.acquire();
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 1;
      particle.maxLife = 0.5 + Math.random() * 0.5;
      particle.size = size;

      // Random blood colors (dark red to bright red)
      const bloodColors = [0x8b0000, 0xa00000, 0xb00000, 0xc00000];
      particle.color = bloodColors[Math.floor(Math.random() * bloodColors.length)];

      particle.graphics.circle(0, 0, size).fill(particle.color);
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

      // Check if particle is off-screen (with margin)
      const isOffScreen =
        particle.graphics.x < -this.OFF_SCREEN_MARGIN ||
        particle.graphics.x > this.SCREEN_WIDTH + this.OFF_SCREEN_MARGIN ||
        particle.graphics.y < -this.OFF_SCREEN_MARGIN ||
        particle.graphics.y > this.SCREEN_HEIGHT + this.OFF_SCREEN_MARGIN;

      // Skip physics updates for off-screen particles (only update life)
      if (isOffScreen) {
        particle.life -= dt / particle.maxLife;
        particle.graphics.alpha = Math.max(0, particle.life * 0.8);

        if (particle.life <= 0) {
          this.container.removeChild(particle.graphics);
          this.particlePool.release(particle);
          this.particles.splice(i, 1);
        }
        continue;
      }

      // Calculate distance from screen center for physics optimization
      const centerX = this.SCREEN_WIDTH / 2;
      const centerY = this.SCREEN_HEIGHT / 2;
      const dx = particle.graphics.x - centerX;
      const dy = particle.graphics.y - centerY;
      const distanceSquared = dx * dx + dy * dy;
      const isDistant = distanceSquared > this.DISTANT_THRESHOLD * this.DISTANT_THRESHOLD;

      // Use simplified physics for distant particles
      if (isDistant) {
        // Simplified physics: only gravity and position update
        particle.vy += 200 * dt;
        particle.graphics.x += particle.vx * dt;
        particle.graphics.y += particle.vy * dt;
      } else {
        // Full physics for nearby particles
        particle.vy += 200 * dt;
        particle.graphics.x += particle.vx * dt;
        particle.graphics.y += particle.vy * dt;
        particle.vx *= 0.98; // Friction only for nearby particles
      }

      // Decrease life
      particle.life -= dt / particle.maxLife;

      // Fade out
      particle.graphics.alpha = Math.max(0, particle.life * 0.8);

      // Remove dead particles
      if (particle.life <= 0) {
        this.container.removeChild(particle.graphics);
        this.particlePool.release(particle);
        this.particles.splice(i, 1);
      }
    }
  }

  // Clear all particles
  public clear(): void {
    for (const particle of this.particles) {
      this.container.removeChild(particle.graphics);
      this.particlePool.release(particle);
    }
    this.particles = [];
  }

  /**
   * Get particle statistics
   */
  public getStats(): {
    activeParticles: number;
    maxParticles: number;
    poolStats: ReturnType<ObjectPool<BloodParticle>['getStats']>;
  } {
    return {
      activeParticles: this.particles.length,
      maxParticles: this.maxParticles,
      poolStats: this.particlePool.getStats(),
    };
  }
}
