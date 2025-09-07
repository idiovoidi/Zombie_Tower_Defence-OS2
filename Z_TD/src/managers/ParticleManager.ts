import { Graphics, Container } from 'pixi.js';

export interface ParticleConfig {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  decay: number;
  color: number;
  size: number;
}

export class Particle extends Container {
  private graphics: Graphics;
  private velocityX: number;
  private velocityY: number;
  private life: number;
  private decay: number;
  
  constructor(config: ParticleConfig) {
    super();
    this.velocityX = config.velocityX;
    this.velocityY = config.velocityY;
    this.life = config.life;
    this.decay = config.decay;
    
    // Create the particle visual
    this.graphics = new Graphics();
    this.graphics.beginFill(config.color);
    this.graphics.drawCircle(0, 0, config.size);
    this.graphics.endFill();
    this.addChild(this.graphics);
    
    this.position.set(config.x, config.y);
  }
  
  public update(deltaTime: number): boolean {
    // Update position
    this.position.x += this.velocityX * deltaTime;
    this.position.y += this.velocityY * deltaTime;
    
    // Apply gravity
    this.velocityY += 0.5 * deltaTime;
    
    // Update life
    this.life -= this.decay * deltaTime;
    
    // Update alpha based on life
    this.alpha = this.life;
    
    // Return true if particle is still alive
    return this.life > 0;
  }
}

export class ParticleManager {
  private particles: Particle[];
  private container: Container;
  
  constructor() {
    this.particles = [];
    this.container = new Container();
  }
  
  public getContainer(): Container {
    return this.container;
  }
  
  public createParticle(config: ParticleConfig): void {
    const particle = new Particle(config);
    this.particles.push(particle);
    this.container.addChild(particle);
  }
  
  public createExplosion(x: number, y: number, color: number = 0xff6600): void {
    const particleCount = 10 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      
      const config: ParticleConfig = {
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        color,
        size: 2 + Math.random() * 3
      };
      
      this.createParticle(config);
    }
  }
  
  public update(deltaTime: number): void {
    // Update all particles and remove dead ones
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const isAlive = particle.update(deltaTime);
      
      if (!isAlive) {
        particle.destroy();
        this.particles.splice(i, 1);
      }
    }
  }
  
  public clear(): void {
    for (const particle of this.particles) {
      particle.destroy();
    }
    this.particles = [];
  }
}