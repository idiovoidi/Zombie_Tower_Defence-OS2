import { Container } from 'pixi.js';
import { Zombie } from '../objects/Zombie';
import { ZombieFactory } from '../objects/ZombieFactory';
import { WaveManager, ZombieGroup } from './WaveManager';
import { MapManager } from './MapManager';

export class ZombieManager {
  private zombies: Zombie[] = [];
  private container: Container;
  private waveManager: WaveManager;
  private mapManager: MapManager;
  private spawnQueue: Array<{ type: string; delay: number }> = [];
  private spawnTimer: number = 0;
  private isSpawning: boolean = false;

  constructor(container: Container, waveManager: WaveManager, mapManager: MapManager) {
    this.container = container;
    this.waveManager = waveManager;
    this.mapManager = mapManager;
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
        const spawnData = this.spawnQueue.shift()!;
        this.spawnZombie(spawnData.type);
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
      const healthComponent = zombie.getComponent('Health');
      if (healthComponent && !(healthComponent as any).isAlive()) {
        this.removeZombie(i);
      }
    }
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

    const zombie = ZombieFactory.createZombie(
      type,
      spawnPoint.x,
      spawnPoint.y,
      this.waveManager.getCurrentWave()
    );

    if (zombie) {
      // Set waypoints for zombie path
      if (waypoints.length > 0) {
        (zombie as any).waypoints = waypoints;
      }

      this.zombies.push(zombie);
      this.container.addChild(zombie);
    }
  }

  // Remove zombie from game
  private removeZombie(index: number): void {
    const zombie = this.zombies[index];
    this.container.removeChild(zombie);
    this.zombies.splice(index, 1);
  }

  // Get all active zombies
  public getZombies(): Zombie[] {
    return this.zombies;
  }

  // Check if wave is complete (all zombies spawned and cleared)
  public isWaveComplete(): boolean {
    return !this.isSpawning && this.zombies.length === 0;
  }

  // Clear all zombies
  public clear(): void {
    for (const zombie of this.zombies) {
      this.container.removeChild(zombie);
    }
    this.zombies = [];
    this.spawnQueue = [];
    this.isSpawning = false;
  }
}
