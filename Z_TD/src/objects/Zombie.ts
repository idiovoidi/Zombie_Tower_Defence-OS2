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
    this.visual.circle(0, 0, 15).fill(0x00ff00);
    this.visual.stroke({ width: 2, color: 0x000000 });
    this.addChild(this.visual);
    
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
      
      // Show damage indicator
      const transform = this.getComponent<TransformComponent>('Transform');
      if (transform) {
        const pos = transform.position;
        // In a real implementation, we would add this to the game container
        // VisualEffects.createDamageIndicator(this.parent, pos.x, pos.y - 30, actualDamage);
        console.log(`Zombie took ${actualDamage} damage`);
      }
      
      return actualDamage;
    }
    return 0;
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