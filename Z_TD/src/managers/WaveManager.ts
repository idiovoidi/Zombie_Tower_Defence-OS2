import { GameConfig } from '../config/gameConfig';
import { ZombieFactory } from '../objects/ZombieFactory';

export interface ZombieGroup {
  type: string;
  count: number;
  spawnInterval: number; // seconds between spawns
}

export class WaveManager {
  private currentWave: number;
  private waveData: Map<number, ZombieGroup[]>;
  private playerPerformance: {
    killRate: number;
    livesLost: number;
    resourceEfficiency: number;
  };
  private difficultyModifier: number;

  constructor() {
    this.currentWave = 1;
    this.waveData = new Map<number, ZombieGroup[]>();
    this.playerPerformance = {
      killRate: 100,
      livesLost: 0,
      resourceEfficiency: 100,
    };
    this.difficultyModifier = 1.0;
    this.initializeWaveData();
  }

  // Initialize wave composition data based on the design document
  private initializeWaveData(): void {
    // Waves 1-5 (80% Basic, 20% Fast)
    for (let i = 1; i <= 5; i++) {
      const totalZombies = Math.floor(10 + i * 1.5);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.8),
          spawnInterval: 1.5,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 2.0,
        },
      ]);
    }

    // Waves 6-10 (60% Basic, 30% Fast, 10% Tank)
    for (let i = 6; i <= 10; i++) {
      const totalZombies = Math.floor(15 + i * 2);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.6),
          spawnInterval: 1.3,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.3),
          spawnInterval: 1.8,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.TANK,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 3.0,
        },
      ]);
    }

    // Waves 11-15 (50% Basic, 30% Fast, 15% Tank, 5% Armored)
    for (let i = 11; i <= 15; i++) {
      const totalZombies = Math.floor(20 + i * 2.5);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.5),
          spawnInterval: 1.2,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.3),
          spawnInterval: 1.6,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.TANK,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 2.8,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.ARMORED,
          count: Math.floor(totalZombies * 0.05),
          spawnInterval: 3.5,
        },
      ]);
    }

    // Waves 16-20 (40% Basic, 25% Fast, 20% Tank, 10% Armored, 5% Swarm)
    for (let i = 16; i <= 20; i++) {
      const totalZombies = Math.floor(25 + i * 3);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.4),
          spawnInterval: 1.2,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.25),
          spawnInterval: 1.5,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.TANK,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 2.5,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.ARMORED,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 3.0,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.SWARM,
          count: Math.floor(totalZombies * 0.05),
          spawnInterval: 1.0,
        },
      ]);
    }

    // Waves 21-25 (35% Basic, 20% Fast, 20% Tank, 15% Armored, 5% Swarm, 5% Stealth)
    for (let i = 21; i <= 25; i++) {
      const totalZombies = Math.floor(30 + i * 3.5);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.35),
          spawnInterval: 1.1,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 1.4,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.TANK,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 2.2,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.ARMORED,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 2.8,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.SWARM,
          count: Math.floor(totalZombies * 0.05),
          spawnInterval: 0.8,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.STEALTH,
          count: Math.floor(totalZombies * 0.05),
          spawnInterval: 1.6,
        },
      ]);
    }

    // Waves 26-30 (30% Basic, 15% Fast, 20% Tank, 20% Armored, 10% Swarm, 5% Stealth)
    for (let i = 26; i <= 30; i++) {
      const totalZombies = Math.floor(35 + i * 4);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.3),
          spawnInterval: 1.0,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 1.3,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.TANK,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 2.0,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.ARMORED,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 2.5,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.SWARM,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 0.7,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.STEALTH,
          count: Math.floor(totalZombies * 0.05),
          spawnInterval: 1.5,
        },
      ]);
    }

    // Waves 31-35 (25% Basic, 15% Fast, 15% Tank, 20% Armored, 15% Swarm, 5% Stealth, 5% Mechanical)
    for (let i = 31; i <= 35; i++) {
      const totalZombies = Math.floor(40 + i * 4.5);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.25),
          spawnInterval: 0.9,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 1.2,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.TANK,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 1.8,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.ARMORED,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 2.2,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.SWARM,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 0.6,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.STEALTH,
          count: Math.floor(totalZombies * 0.05),
          spawnInterval: 1.4,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.MECHANICAL,
          count: Math.floor(totalZombies * 0.05),
          spawnInterval: 2.0,
        },
      ]);
    }

    // Waves 36-40 (20% Basic, 10% Fast, 15% Tank, 20% Armored, 15% Swarm, 10% Stealth, 10% Mechanical)
    for (let i = 36; i <= 40; i++) {
      const totalZombies = Math.floor(45 + i * 5);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 0.8,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 1.1,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.TANK,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 1.6,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.ARMORED,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 2.0,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.SWARM,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 0.5,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.STEALTH,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 1.3,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.MECHANICAL,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 1.8,
        },
      ]);
    }

    // Waves 41+ (15% Basic, 10% Fast, 10% Tank, 20% Armored, 20% Swarm, 15% Stealth, 10% Mechanical)
    for (let i = 41; i <= 50; i++) {
      const totalZombies = Math.floor(50 + i * 6);
      this.waveData.set(i, [
        {
          type: GameConfig.ZOMBIE_TYPES.BASIC,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 0.7,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.FAST,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 1.0,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.TANK,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 1.4,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.ARMORED,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 1.8,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.SWARM,
          count: Math.floor(totalZombies * 0.2),
          spawnInterval: 0.4,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.STEALTH,
          count: Math.floor(totalZombies * 0.15),
          spawnInterval: 1.2,
        },
        {
          type: GameConfig.ZOMBIE_TYPES.MECHANICAL,
          count: Math.floor(totalZombies * 0.1),
          spawnInterval: 1.6,
        },
      ]);
    }
  }

  // Get zombie groups for current wave
  public getCurrentWaveZombies(): ZombieGroup[] {
    return this.waveData.get(this.currentWave) || [];
  }

  // Advance to next wave
  public nextWave(): void {
    this.currentWave++;
  }

  // Get current wave number
  public getCurrentWave(): number {
    return this.currentWave;
  }

  // Calculate zombie health based on wave number and type
  public calculateZombieHealth(type: string, wave: number): number {
    let baseHealth = 100;

    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        baseHealth = 100;
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        baseHealth = 70;
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        baseHealth = 500;
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        baseHealth = 300;
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        baseHealth = 50;
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        baseHealth = 120;
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        baseHealth = 250;
        break;
    }

    // Scale health based on wave (from design document)
    return Math.floor(baseHealth + wave * 1.8);
  }

  // Calculate zombie damage based on wave number and type
  public calculateZombieDamage(type: string, wave: number): number {
    let baseDamage = 10;

    switch (type) {
      case GameConfig.ZOMBIE_TYPES.BASIC:
        baseDamage = 10;
        break;
      case GameConfig.ZOMBIE_TYPES.FAST:
        baseDamage = 8;
        break;
      case GameConfig.ZOMBIE_TYPES.TANK:
        baseDamage = 25;
        break;
      case GameConfig.ZOMBIE_TYPES.ARMORED:
        baseDamage = 15;
        break;
      case GameConfig.ZOMBIE_TYPES.SWARM:
        baseDamage = 5;
        break;
      case GameConfig.ZOMBIE_TYPES.STEALTH:
        baseDamage = 12;
        break;
      case GameConfig.ZOMBIE_TYPES.MECHANICAL:
        baseDamage = 20;
        break;
    }

    // Scale damage based on wave (from design document)
    return Math.floor(baseDamage + wave * 1.5 * this.difficultyModifier);
  }

  // Update player performance metrics
  public updatePerformanceMetrics(
    killRate: number,
    livesLost: number,
    resourceEfficiency: number
  ): void {
    this.playerPerformance = {
      killRate,
      livesLost,
      resourceEfficiency,
    };

    // Adjust difficulty based on performance
    this.adjustDifficulty();
  }

  // Adjust difficulty based on player performance
  private adjustDifficulty(): void {
    // Below 70% kill rate: Reduce next wave zombie count by 15%
    if (this.playerPerformance.killRate < 70) {
      this.difficultyModifier = Math.max(0.85, this.difficultyModifier - 0.15);
    }
    // Above 90% kill rate: Increase next wave zombie count by 10%
    else if (this.playerPerformance.killRate > 90) {
      this.difficultyModifier = Math.min(1.2, this.difficultyModifier + 0.1);
    }

    // Fast track players: +5% difficulty if consistently above 95% performance
    if (this.playerPerformance.killRate > 95) {
      this.difficultyModifier = Math.min(1.3, this.difficultyModifier + 0.05);
    }
    // Struggling players: -10% difficulty if below 60% performance for 3 consecutive waves
    else if (this.playerPerformance.killRate < 60) {
      this.difficultyModifier = Math.max(0.7, this.difficultyModifier - 0.1);
    }
  }

  // Get difficulty modifier
  public getDifficultyModifier(): number {
    return this.difficultyModifier;
  }

  // Calculate spawn rate with scaling (from design document)
  public calculateSpawnRate(baseInterval: number, wave: number): number {
    const scaledInterval = baseInterval * Math.pow(0.95, wave) * this.difficultyModifier;
    return Math.max(0.5, scaledInterval); // Minimum 0.5 seconds
  }

  // Calculate zombie count with scaling (from design document)
  public calculateZombieCount(baseCount: number, wave: number): number {
    let count = baseCount * Math.pow(1.08, wave) * this.difficultyModifier;

    // 20% spikes every 5 waves
    if (wave % 5 === 0) {
      count *= 1.2;
    }

    return Math.floor(count);
  }

  // Create zombies for current wave
  public createWaveZombies(): any[] {
    const zombies: any[] = [];
    const zombieGroups = this.getCurrentWaveZombies();

    for (const group of zombieGroups) {
      // Calculate adjusted count based on wave and difficulty
      const adjustedCount = this.calculateZombieCount(group.count, this.currentWave);

      for (let i = 0; i < adjustedCount; i++) {
        // Create zombie using ZombieFactory
        const zombie = ZombieFactory.createZombie(group.type, 50, 384, this.currentWave);
        if (zombie) {
          zombies.push(zombie);
        }
      }
    }

    return zombies;
  }
}
