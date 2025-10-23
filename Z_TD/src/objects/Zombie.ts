import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { HealthComponent } from '../components/HealthComponent';
import { GameConfig } from '../config/gameConfig';
import { WaveManager } from '../managers/WaveManager';
import { Container, Graphics } from 'pixi.js';
import {
  type TowerType,
  type ZombieType,
  convertToTowerType,
  getDamageModifier,
} from '../config/zombieResistances';
import { IZombieRenderer, ZombieRenderState } from '../renderers/zombies/ZombieRenderer';
import { ArmoredZombieRenderer } from '../renderers/zombies/types/ArmoredZombieRenderer';
import { BasicZombieRenderer } from '../renderers/zombies/types/BasicZombieRenderer';
import { FastZombieRenderer } from '../renderers/zombies/types/FastZombieRenderer';
import { MechanicalZombieRenderer } from '../renderers/zombies/types/MechanicalZombieRenderer';
import { StealthZombieRenderer } from '../renderers/zombies/types/StealthZombieRenderer';
import { SwarmZombieRenderer } from '../renderers/zombies/types/SwarmZombieRenderer';
import { TankZombieRenderer } from '../renderers/zombies/types/TankZombieRenderer';

export class Zombie extends GameObject {
  private type: string;
  private speed: number = 0;
  private baseSpeed: number = 0; // Base speed before variation
  private reward: number = 0;
  private damage: number = 1; // Damage dealt to survivor camp
  private currentWaypointIndex: number = 0;
  private waypoints: { x: number; y: number }[] = [];
  private visual!: Graphics;
  private healthBar: Container | null = null;
  private healthBarBg!: Graphics;
  private healthBarFg!: Graphics;
  private healthComponent!: HealthComponent;
  private transformComponent!: TransformComponent;
  private swayTime: number = 0; // Time accumulator for sway animation
  private swayOffset: number = 0; // Random offset for varied sway timing
  private speedVariation: number = 1.0; // Random speed multiplier for variation
  private isSlowed: boolean = false; // Track if zombie is currently slowed
  private currentSlowPercent: number = 0; // Current slow percentage applied
  private renderer: IZombieRenderer | null = null; // New modular renderer
  private useNewRenderer: boolean = true; // Toggle for new renderer system

  constructor(type: string, x: number, y: number, wave: number) {
    super();
    this.type = type;
    this.currentWaypointIndex = 0;

    // Set the container position
    this.position.set(x, y);

    // Initialize components
    this.transformComponent = new TransformComponent(x, y);
    this.addComponent(this.transformComponent);

    // Initialize waypoints (simplified for now)
    this.waypoints = [
      { x, y },
      { x: x + 100, y: y },
    ]; // Placeholder

    // Random sway offset so zombies don't all sway in sync
    this.swayOffset = Math.random() * Math.PI * 2;

    // Initialize health component based on zombie type
    this.initializeHealth(wave);

    // Initialize visual representation
    this.initializeVisual();
  }

  private initializeHealth(wave: number): void {
    const waveManager = new WaveManager();
    const health = waveManager.calculateZombieHealth(this.type, wave);

    // Add health component
    this.healthComponent = new HealthComponent(health);
    this.addComponent(this.healthComponent);

    // Set base speed, reward, and damage based on type
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.baseSpeed = 50; // pixels per second
        this.reward = 10;
        this.damage = 1; // 1 survivor killed
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.baseSpeed = 100;
        this.reward = 15;
        this.damage = 1; // Fast but weak
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.baseSpeed = 25;
        this.reward = 50;
        this.damage = 5; // Massive damage
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.baseSpeed = 40;
        this.reward = 30;
        this.damage = 3; // Heavy damage
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.baseSpeed = 60;
        this.reward = 5;
        this.damage = 1; // Small but numerous
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.baseSpeed = 70;
        this.reward = 25;
        this.damage = 2; // Moderate damage
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.baseSpeed = 55;
        this.reward = 40;
        this.damage = 4; // High-tech threat
        break;
      default:
        this.baseSpeed = 50;
        this.reward = 10;
        this.damage = 1;
    }

    // Apply random speed variation (±15%) for more organic movement
    this.speedVariation = 0.85 + Math.random() * 0.3;
    this.speed = this.baseSpeed * this.speedVariation;
  }

  // Update visual representation based on zombie type
  private initializeVisual(): void {
    // Try to use new renderer system
    if (this.useNewRenderer) {
      if (this.type === GameConfig.ZOMBIE_TYPES.BASIC) {
        this.renderer = new BasicZombieRenderer();
        return;
      } else if (this.type === GameConfig.ZOMBIE_TYPES.FAST) {
        this.renderer = new FastZombieRenderer();
        return;
      } else if (this.type === GameConfig.ZOMBIE_TYPES.TANK) {
        this.renderer = new TankZombieRenderer();
        return;
      } else if (this.type === GameConfig.ZOMBIE_TYPES.ARMORED) {
        this.renderer = new ArmoredZombieRenderer();
        return;
      } else if (this.type === GameConfig.ZOMBIE_TYPES.SWARM) {
        this.renderer = new SwarmZombieRenderer();
        return;
      } else if (this.type === GameConfig.ZOMBIE_TYPES.STEALTH) {
        this.renderer = new StealthZombieRenderer();
        return;
      } else if (this.type === GameConfig.ZOMBIE_TYPES.MECHANICAL) {
        this.renderer = new MechanicalZombieRenderer();
        return;
      }
    }

    // Fall back to old rendering system
    this.visual = new Graphics();
    this.addChild(this.visual);

    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.createBasicZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.createFastZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.createTankZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.createArmoredZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.createSwarmZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.createStealthZombieVisual();
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.createMechanicalZombieVisual();
        break;
      default:
        // Default visual if type not recognized
        this.visual.circle(0, 0, 15).fill(0x6b8e23);
        this.visual.stroke({ width: 2, color: 0x000000 });
    }

    // Create health bar
    this.healthBarBg = new Graphics();
    this.healthBarBg.rect(-15, -25, 30, 5).fill(0xff0000);

    this.healthBarFg = new Graphics();
    this.healthBarFg.rect(-15, -25, 30, 5).fill(0x00ff00);

    this.healthBar = new Container();
    this.healthBar.addChild(this.healthBarBg);
    this.healthBar.addChild(this.healthBarFg);
    this.healthBar.visible = false; // Hide by default
    this.addChild(this.healthBar);
  }

  // Basic Zombie Visual - Rotting flesh appearance
  private createBasicZombieVisual(): void {
    // Body (sickly gray-green with decay)
    this.visual.circle(0, 0, 10).fill(0x5a6a4a);
    this.visual.circle(0, 0, 10).stroke({ width: 1.5, color: 0x3a4a2a });

    // Rotting flesh patches (darker, more prominent)
    this.visual.circle(-4, -2, 3.5).fill({ color: 0x3a4a2a, alpha: 0.8 });
    this.visual.circle(4, 2, 2.5).fill({ color: 0x2a3a1a, alpha: 0.7 });
    this.visual.circle(-2, 4, 2).fill({ color: 0x4a3a2a, alpha: 0.6 });

    // Exposed bone/wounds
    this.visual.circle(5, -3, 1.5).fill(0xe5e5cc);
    this.visual.circle(-5, 3, 1.2).fill(0xe5e5cc);

    // Glowing dead eyes (more eerie)
    this.visual.circle(-3, -3, 2).fill(0x8b0000);
    this.visual.circle(-3, -3, 1.2).fill(0xff4444);
    this.visual.circle(3, -3, 2).fill(0x8b0000);
    this.visual.circle(3, -3, 1.2).fill(0xff4444);

    // Gaping mouth with teeth
    this.visual.rect(-4, 3, 8, 3).fill(0x1a1a1a);
    // Teeth
    for (let i = 0; i < 4; i++) {
      this.visual.rect(-3 + i * 2, 3, 1, 1.5).fill(0xe5e5cc);
    }

    // Blood stains
    this.visual.circle(-6, 0, 1.5).fill({ color: 0x8b0000, alpha: 0.7 });
    this.visual.circle(2, 5, 1).fill({ color: 0x8b0000, alpha: 0.6 });
  }

  // Fast Zombie Visual - Leaner, more aggressive
  private createFastZombieVisual(): void {
    // Elongated, athletic body (leaner)
    this.visual.ellipse(0, 0, 7, 13).fill(0x6a7a3a);
    this.visual.ellipse(0, 0, 7, 13).stroke({ width: 1.5, color: 0x4a5a2a });

    // Torn flesh and exposed muscle (red)
    this.visual.circle(-3, -5, 2.5).fill({ color: 0x8b2a2a, alpha: 0.8 });
    this.visual.circle(4, 3, 2).fill({ color: 0x7a1a1a, alpha: 0.7 });
    this.visual.circle(-2, 5, 1.5).fill({ color: 0x6a1a1a, alpha: 0.6 });

    // Exposed ribs/bones
    for (let i = 0; i < 3; i++) {
      this.visual
        .moveTo(-4, -2 + i * 3)
        .lineTo(4, -2 + i * 3)
        .stroke({ width: 1, color: 0xe5e5cc, alpha: 0.6 });
    }

    // Wild, aggressive eyes (larger, brighter)
    this.visual.circle(-2, -6, 2.5).fill(0xff0000);
    this.visual.circle(-2, -6, 1.5).fill(0xff6666);
    this.visual.circle(2, -6, 2.5).fill(0xff0000);
    this.visual.circle(2, -6, 1.5).fill(0xff6666);

    // Snarling mouth with fangs
    this.visual.rect(-4, 5, 8, 3).fill(0x1a1a1a);
    // Sharp fangs
    this.visual.moveTo(-3, 5).lineTo(-2, 8).lineTo(-1, 5).fill(0xe5e5cc);
    this.visual.moveTo(1, 5).lineTo(2, 8).lineTo(3, 5).fill(0xe5e5cc);

    // Blood dripping from mouth
    this.visual.circle(0, 9, 1).fill({ color: 0x8b0000, alpha: 0.8 });
    this.visual.circle(-2, 10, 0.8).fill({ color: 0x8b0000, alpha: 0.7 });
  }

  // Tank Zombie Visual - Massive and bloated
  private createTankZombieVisual(): void {
    // Large bloated body (grotesque)
    this.visual.roundRect(-15, -15, 30, 30, 6).fill(0x4a5a2a);
    this.visual.roundRect(-15, -15, 30, 30, 6).stroke({ width: 2.5, color: 0x2a3a1a });

    // Bloated, diseased patches (greenish-yellow)
    this.visual.circle(-6, -6, 7).fill({ color: 0x6a7a3a, alpha: 0.8 });
    this.visual.circle(7, 5, 6).fill({ color: 0x5a6a2a, alpha: 0.7 });
    this.visual.circle(-4, 8, 5).fill({ color: 0x7a8a4a, alpha: 0.6 });

    // Pus-filled boils (yellowish)
    this.visual.circle(-8, -2, 3).fill({ color: 0xaaaa44, alpha: 0.7 });
    this.visual.circle(9, -4, 2.5).fill({ color: 0x999933, alpha: 0.7 });
    this.visual.circle(2, 10, 2).fill({ color: 0x888822, alpha: 0.6 });

    // Small beady eyes (sunken)
    this.visual.circle(-7, -10, 2.5).fill(0x4a0000);
    this.visual.circle(-7, -10, 1.5).fill(0xff0000);
    this.visual.circle(7, -10, 2.5).fill(0x4a0000);
    this.visual.circle(7, -10, 1.5).fill(0xff0000);

    // Massive stitches/scars (Frankenstein-like)
    for (let i = 0; i < 4; i++) {
      this.visual
        .moveTo(-12, -8 + i * 6)
        .lineTo(12, -8 + i * 6)
        .stroke({ width: 2, color: 0x1a1a1a });
      // Stitch marks
      for (let j = 0; j < 5; j++) {
        this.visual.circle(-10 + j * 5, -8 + i * 6, 1).fill(0x1a1a1a);
      }
    }

    // Exposed bone/ribs
    this.visual.circle(10, 0, 2).fill(0xe5e5cc);
    this.visual.circle(-10, 4, 1.8).fill(0xe5e5cc);

    // Blood and gore
    this.visual.circle(-9, 10, 2).fill({ color: 0x8b0000, alpha: 0.8 });
    this.visual.circle(8, -8, 1.5).fill({ color: 0x8b0000, alpha: 0.7 });
  }

  // Armored Zombie Visual - Plated and protected
  private createArmoredZombieVisual(): void {
    // Decayed body underneath
    this.visual.circle(0, 0, 11).fill(0x5a6a4a);
    this.visual.circle(0, 0, 11).stroke({ width: 1, color: 0x3a4a2a });

    // Rusted armor plates (darker, weathered)
    this.visual.rect(-10, -7, 20, 5).fill(0x5a5a5a);
    this.visual.rect(-10, -7, 20, 5).stroke({ width: 1.5, color: 0x3a3a3a });
    this.visual.rect(-10, 3, 20, 5).fill(0x5a5a5a);
    this.visual.rect(-10, 3, 20, 5).stroke({ width: 1.5, color: 0x3a3a3a });

    // Rust spots on armor
    this.visual.circle(-7, -5, 1.5).fill({ color: 0x8b4513, alpha: 0.8 });
    this.visual.circle(6, -4, 1.2).fill({ color: 0x8b4513, alpha: 0.7 });
    this.visual.circle(-5, 5, 1.3).fill({ color: 0x8b4513, alpha: 0.8 });
    this.visual.circle(7, 6, 1).fill({ color: 0x8b4513, alpha: 0.7 });

    // Damaged armor (cracks and dents)
    this.visual.moveTo(-8, -5).lineTo(-4, -3).stroke({ width: 1.5, color: 0x2a2a2a });
    this.visual.moveTo(5, 5).lineTo(8, 7).stroke({ width: 1.5, color: 0x2a2a2a });

    // Battle-worn helmet
    this.visual.rect(-9, -13, 18, 7).fill(0x6a6a6a);
    this.visual.rect(-9, -13, 18, 7).stroke({ width: 2, color: 0x4a4a4a });

    // Helmet damage
    this.visual.circle(-6, -10, 1.5).fill(0x3a3a3a);
    this.visual.circle(5, -11, 1.2).fill(0x3a3a3a);

    // Glowing eye slits (menacing)
    this.visual.rect(-7, -10, 5, 2.5).fill(0x8b0000);
    this.visual.rect(-7, -10, 3, 1.5).fill(0xff0000);
    this.visual.rect(2, -10, 5, 2.5).fill(0x8b0000);
    this.visual.rect(2, -10, 3, 1.5).fill(0xff0000);

    // Rivets on armor
    this.visual.circle(-8, -5, 1).fill(0x4a4a4a);
    this.visual.circle(8, -5, 1).fill(0x4a4a4a);
    this.visual.circle(-8, 5, 1).fill(0x4a4a4a);
    this.visual.circle(8, 5, 1).fill(0x4a4a4a);

    // Blood stains on armor
    this.visual.circle(-3, 0, 2).fill({ color: 0x8b0000, alpha: 0.6 });
    this.visual.circle(4, -2, 1.5).fill({ color: 0x8b0000, alpha: 0.5 });
  }

  // Swarm Zombie Visual - Small and numerous
  private createSwarmZombieVisual(): void {
    // Small, hunched body (yellowish-green)
    this.visual.circle(0, 0, 6).fill(0x7a8a5a);
    this.visual.circle(0, 0, 6).stroke({ width: 1, color: 0x5a6a3a });

    // Decay and rot spots
    this.visual.circle(-2, -1, 2.5).fill({ color: 0x5a6a3a, alpha: 0.8 });
    this.visual.circle(2, 2, 2).fill({ color: 0x4a5a2a, alpha: 0.7 });
    this.visual.circle(-1, 3, 1.5).fill({ color: 0x3a4a1a, alpha: 0.6 });

    // Exposed bone (small)
    this.visual.circle(3, -2, 1).fill(0xe5e5cc);
    this.visual.circle(-3, 2, 0.8).fill(0xe5e5cc);

    // Beady, feral eyes (bright red)
    this.visual.circle(-2, -2, 1.5).fill(0x8b0000);
    this.visual.circle(-2, -2, 1).fill(0xff3333);
    this.visual.circle(2, -2, 1.5).fill(0x8b0000);
    this.visual.circle(2, -2, 1).fill(0xff3333);

    // Small snarling mouth
    this.visual.rect(-2, 2, 4, 1.5).fill(0x1a1a1a);
    // Tiny teeth
    this.visual.rect(-1, 2, 0.5, 1).fill(0xe5e5cc);
    this.visual.rect(0.5, 2, 0.5, 1).fill(0xe5e5cc);

    // Blood spots
    this.visual.circle(-3, 0, 0.8).fill({ color: 0x8b0000, alpha: 0.7 });
    this.visual.circle(1, 4, 0.6).fill({ color: 0x8b0000, alpha: 0.6 });
  }

  // Stealth Zombie Visual - Shadowy and translucent
  private createStealthZombieVisual(): void {
    // Outer ghostly aura (very transparent)
    this.visual.circle(0, 0, 12).fill({ color: 0x4a5a6a, alpha: 0.3 });

    // Semi-transparent body (shadowy)
    this.visual.circle(0, 0, 10).fill({ color: 0x3a4a5a, alpha: 0.5 });
    this.visual.circle(0, 0, 10).stroke({ width: 1, color: 0x2a3a4a, alpha: 0.6 });

    // Darker core (more solid)
    this.visual.circle(0, 0, 6).fill({ color: 0x2a3a4a, alpha: 0.7 });

    // Wispy tendrils (shadowy extensions)
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 10;
      const y = Math.sin(angle) * 10;
      this.visual.moveTo(0, 0).lineTo(x, y).stroke({ width: 1.5, color: 0x3a4a5a, alpha: 0.4 });
    }

    // Eerie glowing eyes (green/purple)
    this.visual.circle(-3, -3, 2.5).fill({ color: 0x00aa00, alpha: 0.9 });
    this.visual.circle(-3, -3, 1.5).fill({ color: 0x00ff00, alpha: 0.9 });
    this.visual.circle(3, -3, 2.5).fill({ color: 0x00aa00, alpha: 0.9 });
    this.visual.circle(3, -3, 1.5).fill({ color: 0x00ff00, alpha: 0.9 });

    // Eye glow effect
    this.visual.circle(-3, -3, 3.5).fill({ color: 0x00ff00, alpha: 0.2 });
    this.visual.circle(3, -3, 3.5).fill({ color: 0x00ff00, alpha: 0.2 });

    // Faint skeletal structure visible through transparency
    this.visual.circle(0, 0, 3).fill({ color: 0xe5e5cc, alpha: 0.3 });
    this.visual.circle(-2, 2, 1.5).fill({ color: 0xe5e5cc, alpha: 0.25 });
    this.visual.circle(2, 2, 1.5).fill({ color: 0xe5e5cc, alpha: 0.25 });
  }

  // Mechanical Zombie Visual - Robotic and industrial
  private createMechanicalZombieVisual(): void {
    // Metal body (weathered steel)
    this.visual.circle(0, 0, 12).fill(0x6a7a8a);
    this.visual.circle(0, 0, 12).stroke({ width: 2, color: 0x4a5a6a });

    // Gear teeth (more prominent)
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = Math.cos(angle) * 12;
      const y1 = Math.sin(angle) * 12;
      const x2 = Math.cos(angle) * 15;
      const y2 = Math.sin(angle) * 15;
      this.visual.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 2.5, color: 0x3a4a5a });
    }

    // Rust and damage on metal
    this.visual.circle(-7, -5, 2).fill({ color: 0x8b4513, alpha: 0.7 });
    this.visual.circle(8, 3, 1.8).fill({ color: 0x8b4513, alpha: 0.6 });
    this.visual.circle(-4, 7, 1.5).fill({ color: 0x8b4513, alpha: 0.7 });

    // Central core (darker, with glow)
    this.visual.circle(0, 0, 7).fill(0x4a5a6a);
    this.visual.circle(0, 0, 5).fill(0x3a4a5a);
    // Core glow
    this.visual.circle(0, 0, 3).fill({ color: 0xff6600, alpha: 0.6 });

    // Glowing mechanical eyes (bright yellow/orange)
    this.visual.circle(-4, -5, 3).fill(0xaa8800);
    this.visual.circle(-4, -5, 2).fill(0xffcc00);
    this.visual.circle(-4, -5, 1).fill(0xffff00);
    this.visual.circle(4, -5, 3).fill(0xaa8800);
    this.visual.circle(4, -5, 2).fill(0xffcc00);
    this.visual.circle(4, -5, 1).fill(0xffff00);

    // Eye glow effect
    this.visual.circle(-4, -5, 4).fill({ color: 0xffff00, alpha: 0.3 });
    this.visual.circle(4, -5, 4).fill({ color: 0xffff00, alpha: 0.3 });

    // Bolts and rivets
    this.visual.circle(-7, 0, 2).fill(0x3a3a3a);
    this.visual.circle(-7, 0, 1).fill(0x5a5a5a);
    this.visual.circle(7, 0, 2).fill(0x3a3a3a);
    this.visual.circle(7, 0, 1).fill(0x5a5a5a);
    this.visual.circle(0, 8, 2).fill(0x3a3a3a);
    this.visual.circle(0, 8, 1).fill(0x5a5a5a);

    // Exposed wiring/cables
    this.visual
      .moveTo(-8, -8)
      .lineTo(-6, -4)
      .lineTo(-7, 0)
      .stroke({ width: 1.5, color: 0xff6600, alpha: 0.8 });
    this.visual
      .moveTo(8, -6)
      .lineTo(6, -2)
      .lineTo(7, 2)
      .stroke({ width: 1.5, color: 0xff6600, alpha: 0.8 });

    // Sparks/electrical damage
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 3;
      this.visual
        .circle(Math.cos(angle) * dist, Math.sin(angle) * dist, 0.8)
        .fill({ color: 0xffff00, alpha: 0.9 });
    }

    // Blood/oil stains
    this.visual.circle(-5, 5, 2).fill({ color: 0x1a1a1a, alpha: 0.7 });
    this.visual.circle(6, -3, 1.5).fill({ color: 0x1a1a1a, alpha: 0.6 });
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);

    // Update new renderer if using it
    if (this.renderer) {
      const state = this.getRenderState();
      this.renderer.update(deltaTime, state);
      this.renderer.render(this, state);
    }

    // Update health bar
    const healthComponent = this.getComponent<HealthComponent>('Health');
    if (healthComponent && this.healthBar) {
      const healthPercentage = healthComponent.getHealthPercentage();
      this.healthBarFg.width = 30 * (healthPercentage / 100);

      // Show health bar when damaged
      if (healthPercentage < 100) {
        this.healthBar.visible = true;
      }
    }

    // Move towards next waypoint
    this.moveTowardsWaypoint(deltaTime);
  }

  private getRenderState(): ZombieRenderState {
    const target = this.waypoints[this.currentWaypointIndex] || this.waypoints[0];
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
      position: { x: this.position.x, y: this.position.y },
      health: this.healthComponent.getHealth(),
      maxHealth: this.healthComponent.getMaxHealth(),
      speed: this.speed,
      direction: distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 },
      isMoving: this.currentWaypointIndex < this.waypoints.length,
      isDamaged: false,
      statusEffects: [],
    };
  }

  private moveTowardsWaypoint(deltaTime: number): void {
    if (this.currentWaypointIndex >= this.waypoints.length) {
      return;
    }

    const target = this.waypoints[this.currentWaypointIndex];

    // Calculate direction vector
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If we've reached the waypoint, move to the next one
    if (distance < 5) {
      this.currentWaypointIndex++;
      return;
    }

    // Normalize direction and apply speed
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    // Calculate movement for this frame (speed is in pixels per second)
    const moveX = normalizedDx * this.speed * (deltaTime / 1000);
    const moveY = normalizedDy * this.speed * (deltaTime / 1000);

    // Add shambling sway effect - perpendicular to movement direction
    this.swayTime += deltaTime / 1000;
    const swayFrequency = 1.5 + Math.random() * 0.5; // Varied sway speed (1.5-2.0 cycles/sec)
    const swayAmplitude = this.getSwayAmplitude(); // How far they sway (pixels)

    // Multiple sine waves for more organic, unpredictable movement
    const primarySway = Math.sin(this.swayTime * swayFrequency * Math.PI * 2 + this.swayOffset);
    const secondarySway =
      Math.sin(this.swayTime * swayFrequency * 1.7 * Math.PI * 2 + this.swayOffset * 0.7) * 0.3;
    const swayValue = primarySway + secondarySway;

    // Calculate perpendicular direction for sway (rotate 90 degrees)
    const perpX = -normalizedDy;
    const perpY = normalizedDx;

    // Apply sway offset perpendicular to movement direction
    const swayX = perpX * swayValue * swayAmplitude;
    const swayY = perpY * swayValue * swayAmplitude;

    // Update container position with movement and sway
    this.position.x += moveX + swayX * (deltaTime / 1000);
    this.position.y += moveY + swayY * (deltaTime / 1000);

    // Update transform component to stay in sync
    this.transformComponent.setPosition(this.position.x, this.position.y);
  }

  // Get sway amplitude based on zombie type (increased for more shambling)
  private getSwayAmplitude(): number {
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        return 18; // Heavy shamble
      case GameConfig.ZOMBIE_TYPES.FAST:
        return 10; // Quick, darting movement
      case GameConfig.ZOMBIE_TYPES.TANK:
        return 25; // Massive lumbering sway
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        return 14; // Heavy armored shamble
      case GameConfig.ZOMBIE_TYPES.SWARM:
        return 22; // Very erratic, chaotic movement
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        return 12; // Weaving, unpredictable
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        return 8; // Slight mechanical drift
      default:
        return 18;
    }
  }

  // Show damage indicator when taking damage
  public getHealth(): number {
    return this.healthComponent.getHealth();
  }

  public takeDamage(damage: number, towerType?: string): number {
    // Apply damage to health component
    const actualDamage = this.healthComponent.takeDamage(damage);

    // Visual feedback for damage
    if (this.renderer) {
      this.renderer.showDamageEffect(towerType || 'unknown', actualDamage);
    } else if (this.visual) {
      // Flash red to indicate damage
      this.visual.tint = 0xff0000;

      // Reset color after a short delay
      setTimeout(() => {
        if (this.visual) {
          this.visual.tint = 0xffffff; // Reset to default
        }
      }, 100);
    }

    // Check if zombie is dead
    if (!this.healthComponent.isAlive()) {
      this.onDeath();
    }

    return actualDamage;
  }

  // Method to show damage effect (for testing)
  public showDamageEffect(damage: number): void {
    // In a real implementation, this would show a visual effect
    // For now, it's just a placeholder for testing
    console.log(`Zombie took ${damage} damage`);
  }

  // Method to show death effect (for testing)
  public showDeathEffect(): void {
    // Trigger death effects
    this.onDeath();
  }

  // Method called when zombie dies
  private async onDeath(): Promise<void> {
    // Play death animation if using new renderer
    if (this.renderer) {
      await this.renderer.playDeathAnimation();
    }

    // Emit death event with position and type for blood/corpse systems
    this.emit('zombieDeath', {
      x: this.position.x,
      y: this.position.y,
      type: this.type,
      size: this.getVisualSize(),
    });
  }

  // Get visual size for corpse creation
  private getVisualSize(): number {
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.TANK:
        return 15;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        return 11;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        return 6;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        return 12;
      default:
        return 10;
    }
  }

  // Check if zombie has reached the end
  public hasReachedEnd(): boolean {
    return this.currentWaypointIndex >= this.waypoints.length;
  }

  // Getters
  public getType(): string {
    return this.type;
  }

  public getReward(): number {
    return this.reward;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public setSpeed(speed: number): void {
    this.speed = speed;
  }

  public applySlow(slowPercent: number): void {
    // Only apply if not already slowed, or if new slow is stronger
    if (!this.isSlowed || slowPercent > this.currentSlowPercent) {
      // Remove old slow if exists
      if (this.isSlowed) {
        this.removeSlow();
      }
      // Apply new slow based on base speed
      this.isSlowed = true;
      this.currentSlowPercent = slowPercent;
      this.speed = this.baseSpeed * this.speedVariation * (1 - slowPercent);
    }
  }

  public removeSlow(): void {
    if (this.isSlowed) {
      this.isSlowed = false;
      this.currentSlowPercent = 0;
      // Restore speed to base speed with variation
      this.speed = this.baseSpeed * this.speedVariation;
    }
  }

  public isCurrentlySlowed(): boolean {
    return this.isSlowed;
  }

  public getDamage(): number {
    return this.damage;
  }

  /**
   * Get damage modifier for this zombie type against a specific tower type
   * @param towerType - The type of tower dealing damage (can be string or TowerType)
   * @returns Damage multiplier (e.g., 1.5 = 150% damage, 0.75 = 75% damage)
   */
  public getDamageModifier(towerType: TowerType | string): number {
    const convertedTowerType =
      typeof towerType === 'string' ? convertToTowerType(towerType) : towerType;
    return getDamageModifier(this.type.toUpperCase() as ZombieType, convertedTowerType);
  }
}
