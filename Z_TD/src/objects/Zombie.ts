import { GameObject } from './GameObject';
import { TransformComponent } from '../components/TransformComponent';
import { HealthComponent } from '../components/HealthComponent';
import { GameConfig } from '../config/gameConfig';
import { WaveManager } from '../managers/WaveManager';
import { PathfindingManager } from '../managers/PathfindingManager';
import { Graphics, Container } from 'pixi.js';
import { VisualEffects } from '../utils/VisualEffects';

export class Zombie extends GameObject {
  private type: string;
  private speed: number = 0;
  private reward: number = 0;
  private currentWaypoint: number = 0;
  private waypoints: {x: number, y: number}[] = [];
  private visual: Graphics;
  private healthBar: Container | null = null;
  private healthBarBg: Graphics;
  private healthBarFg: Graphics;
  
  constructor(type: string, x: number, y: number, wave: number) {
    super();
    this.type = type;
    this.currentWaypoint = 0;
    
    // Add transform component
    const transform = new TransformComponent(x, y);
    this.addComponent(transform);
    
    // Create visual representation
    this.visual = new Graphics();
    this.addChild(this.visual);
    this.updateVisual(); // Create initial visual based on zombie type
    
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
    
    // Initialize zombie stats based on type and wave
    this.initializeStats(wave);
    
    // Initialize waypoints using pathfinding manager
    const pathfindingManager = new PathfindingManager();
    pathfindingManager.initializeWaypoints('default');
    this.waypoints = pathfindingManager.getPath();
  }
  
  private initializeStats(wave: number): void {
    const waveManager = new WaveManager();
    const health = waveManager.calculateZombieHealth(this.type, wave);
    const damage = waveManager.calculateZombieDamage(this.type, wave);
    
    // Add health component
    const healthComponent = new HealthComponent(health);
    this.addComponent(healthComponent);
    
    // Set speed based on type
    switch (this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.speed = 50; // pixels per second
        this.reward = 10;
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.speed = 100;
        this.reward = 15;
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.speed = 25;
        this.reward = 50;
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.speed = 40;
        this.reward = 30;
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.speed = 60;
        this.reward = 5;
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.speed = 70;
        this.reward = 25;
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.speed = 55;
        this.reward = 40;
        break;
      default:
        this.speed = 50;
        this.reward = 10;
    }
  }
  
  // Update visual representation based on zombie type
  private updateVisual(): void {
    this.visual.clear();
    
    switch(this.type) {
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
        this.visual.circle(0, 0, 15).fill(0x00ff00);
        this.visual.stroke({ width: 2, color: 0x000000 });
    }
  }
  
  // Basic Zombie Visual
  private createBasicZombieVisual(): void {
    this.visual.circle(0, 0, 10).fill(0x008000); // Green
    this.visual.stroke({ width: 1, color: 0x000000 });
  }
  
  // Fast Zombie Visual
  private createFastZombieVisual(): void {
    this.visual.ellipse(0, 0, 9, 12.5).fill(0x9ACD32); // Yellow-green
    this.visual.stroke({ width: 1, color: 0x000000 });
  }
  
  // Tank Zombie Visual
  private createTankZombieVisual(): void {
    this.visual.roundRect(-15, -15, 30, 30, 5).fill(0x006400); // Dark green
    this.visual.stroke({ width: 2, color: 0x000000 });
  }
  
  // Armored Zombie Visual
  private createArmoredZombieVisual(): void {
    // Circle body
    this.visual.circle(0, 0, 11).fill(0x556B2F); // Gray-green
    
    // Armor plate
    this.visual.rect(-12.5, -7.5, 25, 15).fill(0x808080); // Gray armor
    this.visual.stroke({ width: 1, color: 0x000000 });
  }
  
  // Swarm Zombie Visual
  private createSwarmZombieVisual(): void {
    this.visual.circle(0, 0, 6).fill(0x90EE90); // Light green
    this.visual.stroke({ width: 1, color: 0x000000 });
  }
  
  // Stealth Zombie Visual
  private createStealthZombieVisual(): void {
    this.visual.circle(0, 0, 10).fill({ color: 0x2F4F4F, alpha: 0.5 }); // Dark gray with transparency
    this.visual.stroke({ width: 1, color: 0x000000 });
  }
  
  // Mechanical Zombie Visual
  private createMechanicalZombieVisual(): void {
    // Gear-like shape (simplified as a circle with lines)
    this.visual.circle(0, 0, 12.5).fill(0x808080); // Metallic gray
    this.visual.stroke({ width: 1, color: 0x000000 });
    
    // Gear teeth
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI / 4);
      const x1 = Math.cos(angle) * 12.5;
      const y1 = Math.sin(angle) * 12.5;
      const x2 = Math.cos(angle) * 16;
      const y2 = Math.sin(angle) * 16;
      this.visual.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 2, color: 0x000000 });
    }
  }
  
  public update(deltaTime: number): void {
    super.update(deltaTime);
    
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
  
  private moveTowardsWaypoint(deltaTime: number): void {
    if (this.currentWaypoint >= this.waypoints.length) return;
    
    const transform = this.getComponent<TransformComponent>('Transform');
    if (!transform) return;
    
    const target = this.waypoints[this.currentWaypoint];
    const currentPosition = transform.position;
    
    // Calculate direction vector
    const dx = target.x - currentPosition.x;
    const dy = target.y - currentPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If we've reached the waypoint, move to the next one
    if (distance < 5) {
      this.currentWaypoint++;
      return;
    }
    
    // Normalize direction and apply speed
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    // Update velocity
    transform.setVelocity(
      normalizedDx * this.speed,
      normalizedDy * this.speed
    );
  }
  
  // Show damage indicator when taking damage
  public takeDamage(damage: number): number {
    const healthComponent = this.getComponent<HealthComponent>('Health');
    if (healthComponent) {
      const actualDamage = healthComponent.takeDamage(damage);
      
      // Show damage visual effect
      this.showDamageEffect(actualDamage);
      
      return actualDamage;
    }
    return 0;
  }
  
  // Show damage visual effects
  public showDamageEffect(damage: number): void {
    // Flash red to indicate damage
    const originalFill = this.visual.fillColor; // Store original color
    
    this.visual.clear();
    
    // Show damage flash based on zombie type
    switch(this.type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        this.visual.circle(0, 0, 10).fill(0xFF0000); // Red flash
        this.visual.stroke({ width: 1, color: 0x000000 });
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        this.visual.ellipse(0, 0, 9, 12.5).fill(0xFF0000); // Red flash
        this.visual.stroke({ width: 1, color: 0x000000 });
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        this.visual.roundRect(-15, -15, 30, 30, 5).fill(0xFF0000); // Red flash
        this.visual.stroke({ width: 2, color: 0x000000 });
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        this.visual.circle(0, 0, 11).fill(0xFF0000); // Red flash
        this.visual.rect(-12.5, -7.5, 25, 15).fill(0x808080);
        this.visual.stroke({ width: 1, color: 0x000000 });
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        this.visual.circle(0, 0, 6).fill(0xFF0000); // Red flash
        this.visual.stroke({ width: 1, color: 0x000000 });
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        this.visual.circle(0, 0, 10).fill({ color: 0xFF0000, alpha: 0.7 }); // More opaque red flash
        this.visual.stroke({ width: 1, color: 0x000000 });
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        this.visual.circle(0, 0, 12.5).fill(0xFF0000); // Red flash
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI / 4);
          const x1 = Math.cos(angle) * 12.5;
          const y1 = Math.sin(angle) * 12.5;
          const x2 = Math.cos(angle) * 16;
          const y2 = Math.sin(angle) * 16;
          this.visual.moveTo(x1, y1).lineTo(x2, y2).stroke({ width: 2, color: 0x000000 });
        }
        break;
      default:
        this.visual.circle(0, 0, 15).fill(0xFF0000); // Red flash
        this.visual.stroke({ width: 2, color: 0x000000 });
    }
    
    // Show damage indicator
    const transform = this.getComponent<TransformComponent>('Transform');
    if (transform) {
      const pos = transform.position;
      // In a real implementation, we would add this to the game container
      // VisualEffects.createDamageIndicator(this.parent, pos.x, pos.y - 30, damage);
      console.log(`Zombie took ${damage} damage`);
    }
    
    // Reset after a short delay
    setTimeout(() => {
      this.updateVisual(); // Recreate the original visual
    }, 150);
  }
  
  // Show death visual effects
  public showDeathEffect(): void {
    // This would typically create a death animation
    console.log(`Zombie ${this.type} died`);
  }
  
  // Check if zombie has reached the end
  public hasReachedEnd(): boolean {
    return this.currentWaypoint >= this.waypoints.length;
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
}