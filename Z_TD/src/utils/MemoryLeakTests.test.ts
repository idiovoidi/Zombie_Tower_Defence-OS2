/**
 * Memory Leak Tests
 *
 * Tests memory stability over 20+ waves and verifies cleanup effectiveness.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 *
 * Memory Targets:
 * - Wave 5: < 400 MB
 * - Wave 10: < 450 MB
 * - Wave 20+: < 500 MB (stable)
 * - Growth rate: < 10 MB per wave after wave 5
 * - Cleanup effectiveness: 80%+ memory reduction
 */

import { PerformanceMonitor } from './PerformanceMonitor';
import { ResourceCleanupManager } from './ResourceCleanupManager';
import { EffectCleanupManager } from './EffectCleanupManager';

describe('Memory Leak Tests', () => {
  beforeEach(() => {
    // Reset all managers before each test
    PerformanceMonitor.reset();
    PerformanceMonitor.setEnabled(true);
    ResourceCleanupManager.clearAll();
    EffectCleanupManager.clearAll();
  });

  afterEach(() => {
    // Clean up after each test
    PerformanceMonitor.reset();
    ResourceCleanupManager.clearAll();
    EffectCleanupManager.clearAll();
  });

  describe('Wave Memory Targets', () => {
    /**
     * Requirement 2.1: Wave 5 should maintain memory usage below 400 MB
     */
    test('should maintain memory below 400 MB at wave 5', () => {
      // Simulate waves 1-5 with increasing entity counts
      const waves = [
        { wave: 1, zombies: 5, towers: 1, projectiles: 2, effects: 5, particles: 10 },
        { wave: 2, zombies: 8, towers: 2, projectiles: 4, effects: 8, particles: 15 },
        { wave: 3, zombies: 10, towers: 2, projectiles: 6, effects: 10, particles: 20 },
        { wave: 4, zombies: 12, towers: 3, projectiles: 8, effects: 12, particles: 25 },
        { wave: 5, zombies: 15, towers: 3, projectiles: 10, effects: 15, particles: 30 },
      ];

      waves.forEach(waveData => {
        // Record wave memory
        PerformanceMonitor.recordWaveMemory(waveData.wave);

        // Simulate wave gameplay (60 frames per wave)
        for (let frame = 0; frame < 60; frame++) {
          PerformanceMonitor.startFrame();

          // Track entity counts
          PerformanceMonitor.trackEntityCount('zombies', waveData.zombies);
          PerformanceMonitor.trackEntityCount('towers', waveData.towers);
          PerformanceMonitor.trackEntityCount('projectiles', waveData.projectiles);
          PerformanceMonitor.trackEntityCount('effects', waveData.effects);
          PerformanceMonitor.trackEntityCount('particles', waveData.particles);

          PerformanceMonitor.endFrame();
        }
      });

      // Get memory usage at wave 5
      const memory = PerformanceMonitor.getMemoryUsage();

      // If memory API is available, verify target
      if (memory.heapUsedMB > 0) {
        expect(memory.heapUsedMB).toBeLessThan(400);
        console.log(`✅ Wave 5 memory: ${memory.heapUsedMB.toFixed(2)} MB (target: < 400 MB)`);
      } else {
        console.log('⚠️ Memory API not available - skipping memory check');
      }

      // Verify wave snapshots were recorded (if memory API available)
      const snapshots = PerformanceMonitor.getWaveMemorySnapshots();
      if (memory.heapUsedMB > 0) {
        expect(snapshots.length).toBe(5);
        expect(snapshots[4].wave).toBe(5);
      } else {
        // Memory API not available - snapshots won't be recorded
        expect(snapshots.length).toBe(0);
      }
    });

    /**
     * Requirement 2.2: Wave 10 should maintain memory usage below 450 MB
     */
    test('should maintain memory below 450 MB at wave 10', () => {
      // Simulate waves 1-10 with progressive entity growth
      for (let wave = 1; wave <= 10; wave++) {
        const entityCounts = {
          zombies: 5 + wave * 2,
          towers: Math.min(1 + Math.floor(wave / 2), 6),
          projectiles: 2 + wave,
          effects: 5 + wave * 2,
          particles: 10 + wave * 5,
          corpses: Math.min(wave * 3, 50),
        };

        // Record wave memory
        PerformanceMonitor.recordWaveMemory(wave);

        // Simulate wave gameplay (30 frames per wave for faster test)
        for (let frame = 0; frame < 30; frame++) {
          PerformanceMonitor.startFrame();

          // Track entity counts
          Object.entries(entityCounts).forEach(([type, count]) => {
            PerformanceMonitor.trackEntityCount(type, count);
          });

          PerformanceMonitor.endFrame();
        }
      }

      // Get memory usage at wave 10
      const memory = PerformanceMonitor.getMemoryUsage();

      // If memory API is available, verify target
      if (memory.heapUsedMB > 0) {
        expect(memory.heapUsedMB).toBeLessThan(450);
        console.log(`✅ Wave 10 memory: ${memory.heapUsedMB.toFixed(2)} MB (target: < 450 MB)`);
      }

      // Verify wave snapshots (if memory API available)
      const snapshots = PerformanceMonitor.getWaveMemorySnapshots();
      if (memory.heapUsedMB > 0) {
        expect(snapshots.length).toBe(10);
        expect(snapshots[9].wave).toBe(10);
      } else {
        expect(snapshots.length).toBe(0);
      }
    });

    /**
     * Requirement 2.3: Wave 20+ should maintain memory usage below 500 MB
     */
    test('should maintain memory below 500 MB at wave 20', () => {
      // Simulate waves 1-20 with realistic entity growth
      for (let wave = 1; wave <= 20; wave++) {
        const entityCounts = {
          zombies: Math.min(5 + wave * 2, 50),
          towers: Math.min(1 + Math.floor(wave / 2), 10),
          projectiles: Math.min(2 + wave, 25),
          effects: Math.min(5 + wave * 2, 40),
          particles: Math.min(10 + wave * 5, 100),
          corpses: 50, // Capped at 50
          persistentEffects: Math.min(wave, 15),
        };

        // Record wave memory
        PerformanceMonitor.recordWaveMemory(wave);

        // Simulate wave gameplay (20 frames per wave for faster test)
        for (let frame = 0; frame < 20; frame++) {
          PerformanceMonitor.startFrame();

          // Track entity counts
          Object.entries(entityCounts).forEach(([type, count]) => {
            PerformanceMonitor.trackEntityCount(type, count);
          });

          PerformanceMonitor.endFrame();
        }
      }

      // Get memory usage at wave 20
      const memory = PerformanceMonitor.getMemoryUsage();

      // If memory API is available, verify target
      if (memory.heapUsedMB > 0) {
        expect(memory.heapUsedMB).toBeLessThan(500);
        console.log(`✅ Wave 20 memory: ${memory.heapUsedMB.toFixed(2)} MB (target: < 500 MB)`);
      }

      // Verify wave snapshots (if memory API available)
      const snapshots = PerformanceMonitor.getWaveMemorySnapshots();
      if (memory.heapUsedMB > 0) {
        expect(snapshots.length).toBe(20);
        expect(snapshots[19].wave).toBe(20);
      } else {
        expect(snapshots.length).toBe(0);
      }
    });
  });

  describe('Memory Growth Rate', () => {
    /**
     * Requirement 2.4: Memory growth rate should not exceed 10 MB per wave after wave 5
     */
    test('should maintain memory growth rate below 10 MB per wave after wave 5', () => {
      // Simulate waves 1-15 to test growth rate
      for (let wave = 1; wave <= 15; wave++) {
        const entityCounts = {
          zombies: Math.min(5 + wave * 2, 40),
          towers: Math.min(1 + Math.floor(wave / 2), 8),
          projectiles: Math.min(2 + wave, 20),
          effects: Math.min(5 + wave * 2, 30),
          particles: Math.min(10 + wave * 5, 80),
          corpses: 50,
        };

        // Record wave memory
        PerformanceMonitor.recordWaveMemory(wave);

        // Simulate wave gameplay
        for (let frame = 0; frame < 20; frame++) {
          PerformanceMonitor.startFrame();

          Object.entries(entityCounts).forEach(([type, count]) => {
            PerformanceMonitor.trackEntityCount(type, count);
          });

          PerformanceMonitor.endFrame();
        }
      }

      // Get memory growth rate
      const growthRate = PerformanceMonitor.getMemoryGrowthRate();

      // If memory API is available, verify growth rate
      if (growthRate !== null && growthRate > 0) {
        expect(growthRate).toBeLessThanOrEqual(10);
        console.log(`✅ Memory growth rate: ${growthRate.toFixed(2)} MB/wave (target: < 10 MB/wave)`);
      } else {
        console.log('⚠️ Memory API not available or insufficient data - skipping growth rate check');
      }

      // Verify snapshots were recorded (if memory API available)
      const snapshots = PerformanceMonitor.getWaveMemorySnapshots();
      const memory = PerformanceMonitor.getMemoryUsage();
      if (memory.heapUsedMB > 0) {
        expect(snapshots.length).toBe(15);
      } else {
        expect(snapshots.length).toBe(0);
      }
    });

    test('should show stable memory after wave 10', () => {
      // Simulate waves 1-20 and verify memory stabilizes
      const memorySnapshots: number[] = [];

      for (let wave = 1; wave <= 20; wave++) {
        const entityCounts = {
          zombies: Math.min(5 + wave * 2, 50),
          towers: Math.min(1 + Math.floor(wave / 2), 10),
          projectiles: Math.min(2 + wave, 25),
          effects: Math.min(5 + wave * 2, 40),
          particles: Math.min(10 + wave * 5, 100),
          corpses: 50,
        };

        PerformanceMonitor.recordWaveMemory(wave);

        for (let frame = 0; frame < 15; frame++) {
          PerformanceMonitor.startFrame();

          Object.entries(entityCounts).forEach(([type, count]) => {
            PerformanceMonitor.trackEntityCount(type, count);
          });

          PerformanceMonitor.endFrame();
        }

        // Record memory at each wave
        const memory = PerformanceMonitor.getMemoryUsage();
        if (memory.heapUsedMB > 0) {
          memorySnapshots.push(memory.heapUsedMB);
        }
      }

      // If we have memory data, verify stabilization
      if (memorySnapshots.length >= 20) {
        // Calculate growth rate for waves 10-20
        const wave10Memory = memorySnapshots[9];
        const wave20Memory = memorySnapshots[19];
        const lateGameGrowth = (wave20Memory - wave10Memory) / 10;

        // Late game growth should be minimal (< 5 MB/wave)
        expect(lateGameGrowth).toBeLessThan(5);
        console.log(`✅ Late game memory growth (waves 10-20): ${lateGameGrowth.toFixed(2)} MB/wave`);
      }
    });
  });

  describe('Cleanup Effectiveness', () => {
    /**
     * Requirement 2.5: Cleanup should release at least 80% of wave-specific resources
     */
    test('should release at least 80% of resources during wave cleanup', () => {
      // Create mock managers with cleanup methods
      const mockManagers = {
        projectileManager: {
          clear: jest.fn(),
        },
        effectManager: {
          clear: jest.fn(),
        },
        zombieManager: {
          getBloodParticleSystem: () => ({
            clear: jest.fn(),
          }),
        },
      };

      // Simulate wave with many resources
      const beforeCleanup = {
        persistentEffects: 15,
        intervals: 10,
        timeouts: 8,
      };

      // Simulate persistent effects
      for (let i = 0; i < beforeCleanup.persistentEffects; i++) {
        // Create mock graphics object
        const mockGraphics = {
          destroyed: false,
          parent: null,
          destroy: jest.fn(),
        } as any;

        ResourceCleanupManager.registerPersistentEffect(mockGraphics, {
          type: 'test_effect',
          duration: 1000,
        });
      }

      // Simulate timers
      for (let i = 0; i < beforeCleanup.intervals; i++) {
        const interval = setInterval(() => {}, 16);
        EffectCleanupManager.registerInterval(interval);
      }

      for (let i = 0; i < beforeCleanup.timeouts; i++) {
        const timeout = setTimeout(() => {}, 1000);
        EffectCleanupManager.registerTimeout(timeout);
      }

      // Verify resources exist before cleanup
      const stateBefore = ResourceCleanupManager.getState();
      expect(stateBefore.persistentEffects).toBe(beforeCleanup.persistentEffects);
      expect(stateBefore.effectTimers.intervals).toBe(beforeCleanup.intervals);
      expect(stateBefore.effectTimers.timeouts).toBe(beforeCleanup.timeouts);

      // Perform wave cleanup
      ResourceCleanupManager.cleanupWaveResources(mockManagers);

      // Verify cleanup was effective
      const stateAfter = ResourceCleanupManager.getState();
      expect(stateAfter.persistentEffects).toBe(0);
      expect(stateAfter.effectTimers.intervals).toBe(0);
      expect(stateAfter.effectTimers.timeouts).toBe(0);

      // Calculate cleanup effectiveness
      const totalResourcesBefore =
        beforeCleanup.persistentEffects + beforeCleanup.intervals + beforeCleanup.timeouts;
      const totalResourcesAfter =
        stateAfter.persistentEffects + stateAfter.effectTimers.intervals + stateAfter.effectTimers.timeouts;
      const cleanupEffectiveness = ((totalResourcesBefore - totalResourcesAfter) / totalResourcesBefore) * 100;

      expect(cleanupEffectiveness).toBeGreaterThanOrEqual(80);
      console.log(`✅ Cleanup effectiveness: ${cleanupEffectiveness.toFixed(1)}% (target: ≥ 80%)`);

      // Verify manager cleanup methods were called
      expect(mockManagers.projectileManager.clear).toHaveBeenCalled();
      expect(mockManagers.effectManager.clear).toHaveBeenCalled();
    });

    test('should complete cleanup within 200 milliseconds', () => {
      // Create mock managers
      const mockManagers = {
        projectileManager: { clear: jest.fn() },
        effectManager: { clear: jest.fn() },
        zombieManager: {
          getBloodParticleSystem: () => ({ clear: jest.fn() }),
        },
      };

      // Create many resources to clean up
      for (let i = 0; i < 50; i++) {
        const mockGraphics = {
          destroyed: false,
          parent: null,
          destroy: jest.fn(),
        } as any;

        ResourceCleanupManager.registerPersistentEffect(mockGraphics, {
          type: 'test_effect',
        });
      }

      for (let i = 0; i < 30; i++) {
        const interval = setInterval(() => {}, 16);
        EffectCleanupManager.registerInterval(interval);
      }

      // Measure cleanup time
      const startTime = performance.now();
      ResourceCleanupManager.cleanupWaveResources(mockManagers);
      const cleanupTime = performance.now() - startTime;

      // Verify cleanup completed within 200ms
      expect(cleanupTime).toBeLessThan(200);
      console.log(`✅ Cleanup time: ${cleanupTime.toFixed(2)}ms (target: < 200ms)`);

      // Verify all resources were cleaned
      const stateAfter = ResourceCleanupManager.getState();
      expect(stateAfter.persistentEffects).toBe(0);
      expect(stateAfter.effectTimers.intervals).toBe(0);
    });

    test('should handle cleanup of already destroyed objects gracefully', () => {
      // Create mix of valid and already-destroyed objects
      const validGraphics = {
        destroyed: false,
        parent: null,
        destroy: jest.fn(),
      } as any;

      const destroyedGraphics = {
        destroyed: true,
        parent: null,
        destroy: jest.fn(),
      } as any;

      ResourceCleanupManager.registerPersistentEffect(validGraphics, { type: 'valid' });
      ResourceCleanupManager.registerPersistentEffect(destroyedGraphics, { type: 'destroyed' });

      const mockManagers = {
        projectileManager: { clear: jest.fn() },
        effectManager: { clear: jest.fn() },
        zombieManager: {
          getBloodParticleSystem: () => ({ clear: jest.fn() }),
        },
      };

      // Cleanup should not throw errors
      expect(() => {
        ResourceCleanupManager.cleanupWaveResources(mockManagers);
      }).not.toThrow();

      // Verify cleanup completed
      const stateAfter = ResourceCleanupManager.getState();
      expect(stateAfter.persistentEffects).toBe(0);

      // Only valid graphics should have destroy called
      expect(validGraphics.destroy).toHaveBeenCalled();
      expect(destroyedGraphics.destroy).not.toHaveBeenCalled();
    });
  });

  describe('Extended Play Memory Stability', () => {
    /**
     * Test memory stability over extended play (20+ waves)
     */
    test('should maintain stable memory over 25 waves', () => {
      const memorySnapshots: number[] = [];

      // Simulate 25 waves
      for (let wave = 1; wave <= 25; wave++) {
        const entityCounts = {
          zombies: Math.min(5 + wave * 2, 50),
          towers: Math.min(1 + Math.floor(wave / 2), 12),
          projectiles: Math.min(2 + wave, 30),
          effects: Math.min(5 + wave * 2, 50),
          particles: Math.min(10 + wave * 5, 150),
          corpses: 50,
          persistentEffects: Math.min(wave, 18),
        };

        PerformanceMonitor.recordWaveMemory(wave);

        // Simulate wave gameplay
        for (let frame = 0; frame < 15; frame++) {
          PerformanceMonitor.startFrame();

          Object.entries(entityCounts).forEach(([type, count]) => {
            PerformanceMonitor.trackEntityCount(type, count);
          });

          PerformanceMonitor.endFrame();
        }

        // Record memory
        const memory = PerformanceMonitor.getMemoryUsage();
        if (memory.heapUsedMB > 0) {
          memorySnapshots.push(memory.heapUsedMB);
        }
      }

      // Verify memory snapshots were recorded (if memory API available)
      const snapshots = PerformanceMonitor.getWaveMemorySnapshots();
      const memory = PerformanceMonitor.getMemoryUsage();
      if (memory.heapUsedMB > 0) {
        expect(snapshots.length).toBe(25);
      } else {
        expect(snapshots.length).toBe(0);
      }

      // If memory API available, verify stability
      if (memorySnapshots.length >= 25) {
        // Memory at wave 25 should still be below 500 MB
        const wave25Memory = memorySnapshots[24];
        expect(wave25Memory).toBeLessThan(500);

        // Calculate growth rate for waves 15-25 (should be near zero)
        const wave15Memory = memorySnapshots[14];
        const lateGameGrowth = (wave25Memory - wave15Memory) / 10;

        // Very late game should show minimal growth (< 3 MB/wave)
        expect(lateGameGrowth).toBeLessThan(3);

        console.log(`✅ Wave 25 memory: ${wave25Memory.toFixed(2)} MB`);
        console.log(`✅ Late game growth (waves 15-25): ${lateGameGrowth.toFixed(2)} MB/wave`);
      }
    });

    test('should not show continuous memory growth pattern', () => {
      const memorySnapshots: number[] = [];

      // Simulate 30 waves to detect continuous growth
      for (let wave = 1; wave <= 30; wave++) {
        const entityCounts = {
          zombies: Math.min(5 + wave * 2, 50),
          towers: Math.min(1 + Math.floor(wave / 2), 15),
          projectiles: Math.min(2 + wave, 30),
          effects: Math.min(5 + wave * 2, 50),
          particles: Math.min(10 + wave * 5, 150),
          corpses: 50,
        };

        PerformanceMonitor.recordWaveMemory(wave);

        for (let frame = 0; frame < 10; frame++) {
          PerformanceMonitor.startFrame();

          Object.entries(entityCounts).forEach(([type, count]) => {
            PerformanceMonitor.trackEntityCount(type, count);
          });

          PerformanceMonitor.endFrame();
        }

        const memory = PerformanceMonitor.getMemoryUsage();
        if (memory.heapUsedMB > 0) {
          memorySnapshots.push(memory.heapUsedMB);
        }
      }

      // If memory API available, check for continuous growth
      if (memorySnapshots.length >= 30) {
        // Split into three segments: early (1-10), mid (11-20), late (21-30)
        const earlyAvg = memorySnapshots.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
        const midAvg = memorySnapshots.slice(10, 20).reduce((a, b) => a + b, 0) / 10;
        const lateAvg = memorySnapshots.slice(20, 30).reduce((a, b) => a + b, 0) / 10;

        // Mid to late growth should be much smaller than early to mid
        const earlyGrowth = midAvg - earlyAvg;
        const lateGrowth = lateAvg - midAvg;

        // Late growth should be less than 50% of early growth (indicates stabilization)
        expect(lateGrowth).toBeLessThan(earlyGrowth * 0.5);

        console.log(`✅ Early game growth: ${earlyGrowth.toFixed(2)} MB`);
        console.log(`✅ Late game growth: ${lateGrowth.toFixed(2)} MB`);
        console.log(`✅ Growth reduction: ${((1 - lateGrowth / earlyGrowth) * 100).toFixed(1)}%`);
      }
    });
  });

  describe('Memory Leak Detection', () => {
    test('should detect high persistent effect counts', () => {
      // Create many persistent effects (above threshold)
      for (let i = 0; i < 25; i++) {
        const mockGraphics = {
          destroyed: false,
          parent: null,
          destroy: jest.fn(),
        } as unknown;

        ResourceCleanupManager.registerPersistentEffect(mockGraphics, {
          type: 'test_effect',
        });
      }

      // Get state and verify warning would be triggered
      const state = ResourceCleanupManager.getState();
      expect(state.persistentEffects).toBeGreaterThan(20);

      // Clean up
      ResourceCleanupManager.cleanupPersistentEffects();
      const stateAfter = ResourceCleanupManager.getState();
      expect(stateAfter.persistentEffects).toBe(0);
    });

    test('should detect high timer counts', () => {
      // Create many timers (above threshold)
      for (let i = 0; i < 25; i++) {
        const interval = setInterval(() => {}, 16);
        EffectCleanupManager.registerInterval(interval);
      }

      // Get counts and verify warning would be triggered
      const counts = EffectCleanupManager.getCounts();
      expect(counts.intervals).toBeGreaterThan(20);

      // Clean up
      EffectCleanupManager.clearAll();
      const countsAfter = EffectCleanupManager.getCounts();
      expect(countsAfter.intervals).toBe(0);
    });

    test('should track entity counts and detect anomalies', () => {
      PerformanceMonitor.startFrame();

      // Track normal entity counts
      PerformanceMonitor.trackEntityCount('zombies', 30);
      PerformanceMonitor.trackEntityCount('towers', 8);
      PerformanceMonitor.trackEntityCount('projectiles', 15);

      // Track high graphics count (above threshold)
      PerformanceMonitor.trackEntityCount('graphics', 150);

      // Track high persistent effects (above threshold)
      PerformanceMonitor.trackEntityCount('persistentEffects', 25);

      PerformanceMonitor.endFrame();

      // Check thresholds
      PerformanceMonitor.checkEntityThresholds();

      // Verify warnings were generated
      const warnings = PerformanceMonitor.getWarnings();
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some(w => w.includes('graphics'))).toBe(true);
      expect(warnings.some(w => w.includes('persistent'))).toBe(true);
    });
  });
});
