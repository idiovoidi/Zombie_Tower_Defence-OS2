import { OptimizationValidator } from './OptimizationValidator';

describe('OptimizationValidator', () => {
  beforeEach(() => {
    OptimizationValidator.reset();
  });

  describe('Target Finding Metrics', () => {
    it('should track target finding performance', () => {
      OptimizationValidator.enable();

      // Create mock entities
      const entities = Array.from({ length: 50 }, (_, i) => ({
        position: { x: i * 10, y: i * 10 },
      }));

      // Simulate target finding measurement
      OptimizationValidator.measureTargetFinding(
        entities,
        250,
        250,
        150,
        () => entities[25] // Mock spatial grid query
      );

      const metrics = OptimizationValidator.getTargetFindingMetrics();

      expect(metrics.checksLinear).toBe(50); // Checked all entities
      expect(metrics.checksSpatial).toBeLessThanOrEqual(50); // Checked fewer or equal with spatial grid
      expect(metrics.linearSearchTimeMs).toBeGreaterThanOrEqual(0);
      expect(metrics.spatialGridTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should calculate improvement percentage', () => {
      OptimizationValidator.enable();

      const entities = Array.from({ length: 100 }, (_, i) => ({
        position: { x: i * 5, y: i * 5 },
      }));

      OptimizationValidator.measureTargetFinding(entities, 250, 250, 150, () => entities[50]);

      const metrics = OptimizationValidator.getTargetFindingMetrics();

      expect(metrics.improvement).toBeGreaterThanOrEqual(0);
      expect(metrics.linearSearchTimeMs).toBeGreaterThanOrEqual(0);
      expect(metrics.spatialGridTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Array Rebuild Metrics', () => {
    it('should track frame count', () => {
      OptimizationValidator.enable();

      for (let i = 0; i < 100; i++) {
        OptimizationValidator.trackFrame();
      }

      const metrics = OptimizationValidator.getArrayRebuildMetrics();
      expect(metrics.totalFrames).toBe(100);
    });

    it('should track array rebuilds', () => {
      OptimizationValidator.enable();

      // Simulate 100 frames with occasional rebuilds
      for (let i = 0; i < 100; i++) {
        OptimizationValidator.trackFrame();

        // Rebuild towers every 10 frames
        if (i % 10 === 0) {
          OptimizationValidator.trackArrayRebuild('towers');
        }

        // Rebuild zombies every 5 frames
        if (i % 5 === 0) {
          OptimizationValidator.trackArrayRebuild('zombies');
        }
      }

      const metrics = OptimizationValidator.getArrayRebuildMetrics();

      expect(metrics.totalFrames).toBe(100);
      expect(metrics.rebuildsWithDirtyFlags).toBe(30); // 10 tower + 20 zombie rebuilds
      expect(metrics.rebuildsWithoutDirtyFlags).toBe(300); // 100 frames * 3 arrays
      expect(metrics.rebuildsAvoided).toBe(270);
      expect(metrics.avoidanceRate).toBeCloseTo(90, 0);
    });

    it('should calculate avoidance rate correctly', () => {
      OptimizationValidator.enable();

      // Simulate perfect scenario - no rebuilds needed
      for (let i = 0; i < 60; i++) {
        OptimizationValidator.trackFrame();
      }

      const metrics = OptimizationValidator.getArrayRebuildMetrics();

      expect(metrics.avoidanceRate).toBe(100); // Avoided all rebuilds
    });
  });

  describe('Allocation Metrics', () => {
    it('should track pooled allocations', () => {
      OptimizationValidator.enable();

      // Simulate pooled allocations
      for (let i = 0; i < 50; i++) {
        OptimizationValidator.trackAllocation(true, i > 10); // First 10 are new, rest are reused
      }

      const metrics = OptimizationValidator.getAllocationMetrics();

      expect(metrics.allocationsWithoutPooling).toBe(50);
      expect(metrics.poolReuseRate).toBeCloseTo(78, 0); // 39/50 = 78%
    });

    it('should track non-pooled allocations', () => {
      OptimizationValidator.enable();

      // Simulate non-pooled allocations
      for (let i = 0; i < 30; i++) {
        OptimizationValidator.trackAllocation(false);
      }

      const metrics = OptimizationValidator.getAllocationMetrics();

      expect(metrics.allocationsWithoutPooling).toBe(30);
      expect(metrics.allocationsWithPooling).toBe(30);
      expect(metrics.allocationReduction).toBe(0); // No reduction without pooling
    });

    it('should calculate allocation reduction', () => {
      OptimizationValidator.enable();

      // Simulate mixed allocations
      for (let i = 0; i < 100; i++) {
        if (i < 20) {
          OptimizationValidator.trackAllocation(false); // New allocations
        } else {
          OptimizationValidator.trackAllocation(true, true); // Pooled reuses
        }
      }

      const metrics = OptimizationValidator.getAllocationMetrics();

      expect(metrics.allocationsWithoutPooling).toBe(100);
      expect(metrics.allocationsWithPooling).toBe(20);
      expect(metrics.allocationReduction).toBe(80);
    });
  });

  describe('Report Generation', () => {
    it('should generate comprehensive report', () => {
      OptimizationValidator.enable();

      // Simulate some activity
      const entities = Array.from({ length: 30 }, (_, i) => ({
        position: { x: i * 10, y: i * 10 },
      }));

      OptimizationValidator.measureTargetFinding(entities, 150, 150, 100, () => entities[15]);

      for (let i = 0; i < 60; i++) {
        OptimizationValidator.trackFrame();
        if (i % 10 === 0) {
          OptimizationValidator.trackArrayRebuild('towers');
        }
      }

      for (let i = 0; i < 50; i++) {
        OptimizationValidator.trackAllocation(true, i > 10);
      }

      const report = OptimizationValidator.generateReport();

      expect(report.targetFinding).toBeDefined();
      expect(report.arrayRebuilds).toBeDefined();
      expect(report.allocations).toBeDefined();
      expect(report.timestamp).toBeGreaterThan(0);
      expect(report.summary).toContain('Optimization Effectiveness Report');
    });

    it('should include assessment in summary', () => {
      OptimizationValidator.enable();

      // Create good metrics
      for (let i = 0; i < 100; i++) {
        OptimizationValidator.trackFrame();
        OptimizationValidator.trackAllocation(true, true);
      }

      const report = OptimizationValidator.generateReport();

      expect(report.summary).toContain('Overall Assessment');
      expect(report.summary).toContain('✅'); // Should have some good marks
    });
  });

  describe('Enable/Disable', () => {
    it('should not track when disabled', () => {
      OptimizationValidator.disable();

      OptimizationValidator.trackFrame();
      OptimizationValidator.trackArrayRebuild('towers');
      OptimizationValidator.trackAllocation(true, true);

      const metrics = OptimizationValidator.getArrayRebuildMetrics();
      expect(metrics.totalFrames).toBe(0);
    });

    it('should track when enabled', () => {
      OptimizationValidator.enable();

      OptimizationValidator.trackFrame();

      const metrics = OptimizationValidator.getArrayRebuildMetrics();
      expect(metrics.totalFrames).toBe(1);
    });

    it('should reset data when enabled', () => {
      OptimizationValidator.enable();
      OptimizationValidator.trackFrame();
      OptimizationValidator.enable(); // Enable again should reset

      const metrics = OptimizationValidator.getArrayRebuildMetrics();
      expect(metrics.totalFrames).toBe(0);
    });
  });
});
