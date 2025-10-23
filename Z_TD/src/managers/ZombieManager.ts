import { Container } from 'pixi.js';
import { Zombie } from '../objects/Zombie';
import { ZombieFactory } from '../objects/ZombieFactory';
import { WaveManager } from './WaveManager';
import { MapManager } from './MapManager';
import { BloodParticleSystem } from '../utils/BloodParticleSystem';
import { CorpseManager } from './CorpseManager';
import type { HealthComponent } from '../components/HealthComponent';
import type { HasWaypoints } from '../types/zombie-waypoints';

export class ZombieManager {
  private zombies: Zombie[] = [];
  private container: Container;
  private waveManager: WaveManager;
  private mapManager: MapManager;
  private spawnQueue: Array<{ type: string; delay: number }> = [];
  private spawnTimer: number = 0;
  private isSpawning: boolean = false;
  private bloodParticleSystem: BloodParticleSystem;
  private corpseManager: CorpseManager;
  private zombiesDirty: boolean = false; // Track when zombie array changes

  constructor(container: Container, waveManager: WaveManager, mapManager: MapManager) {
    this.container = container;
    this.waveManager = waveManager;
    this.mapManager = mapManager;

    // Create separate containers for proper z-ordering
    const corpseContainer = new Container();
    const zombieContainer = new Container();

    // Add containers in correct order (corpses below zombies)
    container.addChild(corpseContainer);
    container.addChild(zombieContainer);

    // Initialize blood and corpse systems with proper containers
    this.bloodParticleSystem = new BloodParticleSystem(corpseContainer); // Blood on ground layer
    this.corpseManager = new CorpseManager(corpseContainer); // Corpses on ground layer

    // Update zombie container reference
    this.container = zombieContainer;
  }

  // Start spawning zombies for the current wave
  public startWave(): void {
    this.isSpawning = true;
    this.spawnQueue = [];
    this.spawnTimer = 0;

    const zombieGroups = this.waveManager.getCurrentWaveZombies();

    // Build spawn queue with delays
    let currentDelay = 0;
    for (const group of zombieGroups) {
      const adjustedCount = this.waveManager.calculateZombieCount(
        group.count,
        this.waveManager.getCurrentWave()
      );
      const spawnInterval = this.waveManager.calculateSpawnRate(
        group.spawnInterval,
        this.waveManager.getCurrentWave()
      );

      for (let i = 0; i < adjustedCount; i++) {
        this.spawnQueue.push({
          type: group.type,
          delay: currentDelay,
        });
        currentDelay += spawnInterval;
      }
    }

    // Shuffle spawn queue for variety
    this.shuffleSpawnQueue();
  }

  // Shuffle spawn queue to mix zombie types
  private shuffleSpawnQueue(): void {
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
    }
  }

  // Update zombie spawning and movement
  public update(deltaTime: number): void {
    if (this.isSpawning && this.spawnQueue.length > 0) {
      this.spawnTimer += deltaTime;

      // Spawn zombies from queue
      while (this.spawnQueue.length > 0 && this.spawnQueue[0].delay <= this.spawnTimer) {
        const spawnData = this.spawnQueue.shift();
        if (spawnData) {
          this.spawnZombie(spawnData.type);
        }
      }

      // Check if wave is complete
      if (this.spawnQueue.length === 0) {
        this.isSpawning = false;
      }
    }

    // Update all zombies
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i];
      zombie.update(deltaTime);

      // Remove dead zombies
      const healthComponent = zombie.getComponent<HealthComponent>('Health');
      if (healthComponent && !healthComponent.isAlive()) {
        this.removeZombie(i);
      }
    }

    // Update blood particles and corpses
    this.bloodParticleSystem.update(deltaTime);
    this.corpseManager.update(deltaTime);
  }

  // Spawn a single zombie
  private spawnZombie(type: string): void {
    // Get spawn position from map
    const spawnPoint = this.mapManager.getSpawnPoint();
    const waypoints = this.mapManager.getWaypoints();

    if (!spawnPoint) {
      console.warn('No spawn point found on map');
      return;
    }

    // Add spacing variation to prevent visual clumping
    // Spread zombies across the path width (±15px from center)
    const lateralOffset = (Math.random() - 0.5) * 30;
    // Add small random backward offset to create depth (0-20px behind spawn point)
    const depthOffset = Math.random() * -20;

    const spawnX = spawnPoint.x + lateralOffset;
    const spawnY = spawnPoint.y + depthOffset;

    console.log(`Spawning zombie: ${type} at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)})`);

    const zombie = ZombieFactory.createZombie(
      type,
      spawnX,
      spawnY,
      this.waveManager.getCurrentWave()
    );

    if (zombie) {
      // Set waypoints for zombie path
      if (waypoints.length > 0) {
        (zombie as HasWaypoints).waypoints = waypoints;
        console.log(`Zombie waypoints set: ${waypoints.length} waypoints`);
      }

      // Listen for zombie death to trigger effects
      zombie.on('zombieDeath', (data: { x: number; y: number; type: string; size: number }) => {
        this.onZombieDeath(data);
      });

      this.zombies.push(zombie);
      this.zombiesDirty = true; // Mark zombies as changed
      this.container.addChild(zombie);
      console.log(`✓ Zombie spawned successfully. Total zombies: ${this.zombies.length}`);
    } else {
      console.warn('Failed to create zombie');
    }
  }

  // Handle zombie death effects
  private onZombieDeath(data: { x: number; y: number; type: string; size: number }): void {
    // Create blood splatter
    const intensity = data.size / 10; // Scale intensity based on zombie size
    this.bloodParticleSystem.createBloodSplatter(data.x, data.y, intensity);

    // Create corpse
    this.corpseManager.createCorpse(data.x, data.y, data.type, data.size);
  }

  // Remove zombie from game
  public removeZombie(index: number): Zombie {
    const zombie = this.zombies[index];
    this.container.removeChild(zombie);
    zombie.destroy(); // CRITICAL: Destroy zombie to free memory and clean up event listeners
    this.zombies.splice(index, 1);
    this.zombiesDirty = true; // Mark zombies as changed
    return zombie;
  }

  // Get all active zombies
  public getZombies(): Zombie[] {
    return this.zombies;
  }

  // Check if zombies array has changed since last check
  public areZombiesDirty(): boolean {
    return this.zombiesDirty;
  }

  // Reset dirty flag after consuming the change
  public clearZombiesDirty(): void {
    this.zombiesDirty = false;
  }

  // Check if wave is complete (all zombies spawned and cleared)
  public isWaveComplete(): boolean {
    return !this.isSpawning && this.zombies.length === 0;
  }

  // Clear all zombies
  public clear(): void {
    for (const zombie of this.zombies) {
      this.container.removeChild(zombie);
      zombie.destroy(); // CRITICAL: Destroy zombie to free memory and clean up event listeners
    }
    this.zombies = [];
    this.zombiesDirty = true; // Mark zombies as changed
    this.spawnQueue = [];
    this.isSpawning = false;
    this.bloodParticleSystem.clear();
    this.corpseManager.clear();
  }

  // Get blood particle system (for external access if needed)
  public getBloodParticleSystem(): BloodParticleSystem {
    return this.bloodParticleSystem;
  }

  // Get corpse manager (for external access if needed)
  public getCorpseManager(): CorpseManager {
    return this.corpseManager;
  }

  // Spawn a specific zombie type (for debugging/testing)
  public spawnZombieType(type: string): void {
    this.spawnZombie(type);
  }
}
