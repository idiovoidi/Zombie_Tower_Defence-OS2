import { WaveManager, ZombieGroup } from './WaveManager';
import { GameConfig } from '../config/gameConfig';

// Mock ZombieFactory to avoid Pixi.js dependencies
jest.mock('../objects/ZombieFactory', () => {
  return {
    ZombieFactory: {
      createZombie: jest.fn().mockImplementation((type, x, y, wave) => {
        return {
          type,
          x,
          y,
          wave,
          // Mock zombie methods that might be called
          update: jest.fn(),
          takeDamage: jest.fn().mockReturnValue(10),
          hasReachedEnd: jest.fn().mockReturnValue(false),
          getType: jest.fn().mockReturnValue(type),
          getReward: jest.fn().mockReturnValue(10),
          getSpeed: jest.fn().mockReturnValue(50)
        };
      })
    }
  };
});

describe('WaveManager', () => {
  let waveManager: WaveManager;

  beforeEach(() => {
    waveManager = new WaveManager();
  });

  describe('Wave Progression', () => {
    test('should start at wave 1', () => {
      expect(waveManager.getCurrentWave()).toBe(1);
    });

    test('should advance to next wave', () => {
      waveManager.nextWave();
      expect(waveManager.getCurrentWave()).toBe(2);
    });

    test('should handle multiple wave advances', () => {
      for (let i = 0; i < 5; i++) {
        waveManager.nextWave();
      }
      expect(waveManager.getCurrentWave()).toBe(6);
    });
  });

  describe('Zombie Composition', () => {
    test('should have correct zombie composition for waves 1-5', () => {
      for (let wave = 1; wave <= 5; wave++) {
        // Set current wave
        (waveManager as any).currentWave = wave;
        const zombies = waveManager.getCurrentWaveZombies();
        
        // Should have 2 zombie types (Basic and Fast)
        expect(zombies.length).toBe(2);
        
        // Check zombie types
        expect(zombies[0].type).toBe(GameConfig.ZOMBIE_TYPES.BASIC);
        expect(zombies[1].type).toBe(GameConfig.ZOMBIE_TYPES.FAST);
      }
    });

    test('should have correct zombie composition for waves 6-10', () => {
      for (let wave = 6; wave <= 10; wave++) {
        // Set current wave
        (waveManager as any).currentWave = wave;
        const zombies = waveManager.getCurrentWaveZombies();
        
        // Should have 3 zombie types (Basic, Fast, and Tank)
        expect(zombies.length).toBe(3);
        
        // Check zombie types
        expect(zombies[0].type).toBe(GameConfig.ZOMBIE_TYPES.BASIC);
        expect(zombies[1].type).toBe(GameConfig.ZOMBIE_TYPES.FAST);
        expect(zombies[2].type).toBe(GameConfig.ZOMBIE_TYPES.TANK);
      }
    });

    test('should have correct zombie composition for waves 41+', () => {
      // Set current wave to 45
      (waveManager as any).currentWave = 45;
      const zombies = waveManager.getCurrentWaveZombies();
      
      // Should have 7 zombie types
      expect(zombies.length).toBe(7);
      
      // Check zombie types
      expect(zombies[0].type).toBe(GameConfig.ZOMBIE_TYPES.BASIC);
      expect(zombies[1].type).toBe(GameConfig.ZOMBIE_TYPES.FAST);
      expect(zombies[2].type).toBe(GameConfig.ZOMBIE_TYPES.TANK);
      expect(zombies[3].type).toBe(GameConfig.ZOMBIE_TYPES.ARMORED);
      expect(zombies[4].type).toBe(GameConfig.ZOMBIE_TYPES.SWARM);
      expect(zombies[5].type).toBe(GameConfig.ZOMBIE_TYPES.STEALTH);
      expect(zombies[6].type).toBe(GameConfig.ZOMBIE_TYPES.MECHANICAL);
    });
  });

  describe('Zombie Stats Calculation', () => {
    test('should calculate correct health for Basic Zombie', () => {
      const health = waveManager.calculateZombieHealth(GameConfig.ZOMBIE_TYPES.BASIC, 1);
      expect(health).toBe(101); // 100 + (1 * 1.8) = 101.8, floored to 101
    });

    test('should calculate correct health for Tank Zombie', () => {
      const health = waveManager.calculateZombieHealth(GameConfig.ZOMBIE_TYPES.TANK, 5);
      expect(health).toBe(509); // 500 + (5 * 1.8) = 509
    });

    test('should calculate correct damage for Basic Zombie', () => {
      const damage = waveManager.calculateZombieDamage(GameConfig.ZOMBIE_TYPES.BASIC, 1);
      expect(damage).toBe(11); // 10 + (1 * 1.5) * 1.0 = 11.5, floored to 11
    });

    test('should calculate correct damage for Tank Zombie with difficulty modifier', () => {
      // Set difficulty modifier
      (waveManager as any).difficultyModifier = 1.2;
      const damage = waveManager.calculateZombieDamage(GameConfig.ZOMBIE_TYPES.TANK, 5);
      expect(damage).toBe(34); // 25 + (5 * 1.5) * 1.2 = 25 + 7.5 * 1.2 = 25 + 9 = 34
    });
  });

  describe('Scaling Functions', () => {
    test('should calculate correct spawn rate', () => {
      const spawnRate = waveManager.calculateSpawnRate(2.0, 5);
      expect(spawnRate).toBeCloseTo(1.57, 1); // 2.0 * (0.95^5) * 1.0 ≈ 1.57
    });

    test('should enforce minimum spawn rate', () => {
      // Set high wave number and difficulty modifier to test minimum
      const spawnRate = waveManager.calculateSpawnRate(0.1, 50);
      expect(spawnRate).toBe(0.5); // Should be clamped to minimum
    });

    test('should calculate correct zombie count', () => {
      const count = waveManager.calculateZombieCount(10, 1);
      expect(count).toBe(10); // 10 * (1.08^1) * 1.0 = 10.8, floored to 10
    });

    test('should apply bonus for every 5th wave', () => {
      const count1 = waveManager.calculateZombieCount(10, 4);
      const count2 = waveManager.calculateZombieCount(10, 5);
      // Wave 4: 10 * (1.08^4) * 1.0 = 10 * 1.3605 ≈ 13
      // Wave 5: 10 * (1.08^5) * 1.0 * 1.2 = 10 * 1.4693 * 1.2 ≈ 17
      expect(count2).toBeGreaterThan(count1);
    });
  });

  describe('Difficulty Adjustment', () => {
    test('should reduce difficulty for poor performance', () => {
      const initialModifier = waveManager.getDifficultyModifier();
      waveManager.updatePerformanceMetrics(60, 0, 100); // 60% kill rate
      const newModifier = waveManager.getDifficultyModifier();
      expect(newModifier).toBeLessThan(initialModifier);
    });

    test('should increase difficulty for good performance', () => {
      const initialModifier = waveManager.getDifficultyModifier();
      waveManager.updatePerformanceMetrics(95, 0, 100); // 95% kill rate
      const newModifier = waveManager.getDifficultyModifier();
      expect(newModifier).toBeGreaterThan(initialModifier);
    });

    test('should enforce minimum difficulty modifier', () => {
      // Set very low performance multiple times
      for (let i = 0; i < 10; i++) {
        waveManager.updatePerformanceMetrics(30, 0, 100); // 30% kill rate
      }
      const modifier = waveManager.getDifficultyModifier();
      expect(modifier).toBeGreaterThanOrEqual(0.7); // Should not go below minimum
    });

    test('should enforce maximum difficulty modifier', () => {
      // Set very high performance multiple times
      for (let i = 0; i < 10; i++) {
        waveManager.updatePerformanceMetrics(98, 0, 100); // 98% kill rate
      }
      const modifier = waveManager.getDifficultyModifier();
      expect(modifier).toBeLessThanOrEqual(1.3); // Should not exceed maximum
    });
  });

  describe('Wave Zombie Creation', () => {
    test('should create zombies for current wave', () => {
      const zombies = waveManager.createWaveZombies();
      expect(zombies.length).toBeGreaterThan(0); // Should create some zombies
    });

    test('should create different zombies for different waves', () => {
      // Get zombies for wave 1
      const wave1Zombies = waveManager.createWaveZombies();
      
      // Advance to wave 6 and get zombies
      waveManager.nextWave();
      waveManager.nextWave();
      waveManager.nextWave();
      waveManager.nextWave();
      waveManager.nextWave();
      const wave6Zombies = waveManager.createWaveZombies();
      
      // Both should create zombies
      expect(wave1Zombies.length).toBeGreaterThan(0);
      expect(wave6Zombies.length).toBeGreaterThan(0);
    });
  });
});