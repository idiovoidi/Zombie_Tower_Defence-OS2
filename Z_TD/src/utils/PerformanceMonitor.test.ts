import { PerformanceMonitor } from './PerformanceMonitor';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    PerformanceMonitor.reset();
    PerformanceMonitor.setEnabled(true);
  });

  afterEach(() => {
    PerformanceMonitor.reset();
  });

  describe('Enable/Disable', () => {
    it('should be enabled by default', () => {
      expect(PerformanceMonitor.isEnabled()).toBe(true);
    });

    it('should toggle enabled state', () => {
      PerformanceMonitor.toggle();
      expect(PerformanceMonitor.isEnabled()).toBe(false);
      PerformanceMonitor.toggle();
      expect(PerformanceMonitor.isEnabled()).toBe(true);
    });

    it('should reset data when disabled', () => {
      PerformanceMonitor.trackEntityCount('zombies', 10);
      PerformanceMonitor.setEnabled(false);
      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.entityCounts.size).toBe(0);
    });
  });

  describe('Frame Measurement', () => {
    it('should track frame time', () => {
      PerformanceMonitor.startFrame();
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 5) {
        // Wait 5ms
      }
      PerformanceMonitor.endFrame();

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.frameTime).toBeGreaterThan(0);
    });

    it('should not track when disabled', () => {
      PerformanceMonitor.setEnabled(false);
      PerformanceMonitor.startFrame();
      PerformanceMonitor.endFrame();

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.frameTime).toBe(0);
    });
  });

  describe('System Measurement', () => {
    it('should measure system execution time', () => {
      PerformanceMonitor.startMeasure('testSystem');
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 2) {
        // Wait 2ms
      }
      PerformanceMonitor.endMeasure('testSystem');

      const avgTime = PerformanceMonitor.getAverageSystemTime('testSystem');
      expect(avgTime).toBeGreaterThan(0);
    });

    it('should track multiple systems', () => {
      PerformanceMonitor.startMeasure('system1');
      PerformanceMonitor.endMeasure('system1');

      PerformanceMonitor.startMeasure('system2');
      PerformanceMonitor.endMeasure('system2');

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.systemTimes.size).toBe(2);
    });

    it('should keep only last 60 frames of data', () => {
      // Add 70 measurements
      for (let i = 0; i < 70; i++) {
        PerformanceMonitor.startMeasure('testSystem');
        PerformanceMonitor.endMeasure('testSystem');
      }

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.systemTimes.has('testSystem')).toBe(true);
    });
  });

  describe('Entity Tracking', () => {
    it('should track entity counts', () => {
      PerformanceMonitor.trackEntityCount('zombies', 50);
      PerformanceMonitor.trackEntityCount('towers', 10);

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.entityCounts.get('zombies')).toBe(50);
      expect(metrics.entityCounts.get('towers')).toBe(10);
    });

    it('should update entity counts', () => {
      PerformanceMonitor.trackEntityCount('zombies', 50);
      PerformanceMonitor.trackEntityCount('zombies', 75);

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.entityCounts.get('zombies')).toBe(75);
    });
  });

  describe('Warnings', () => {
    it('should log warnings for slow systems', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      PerformanceMonitor.startMeasure('slowSystem');
      // Simulate slow work (>5ms threshold)
      const start = performance.now();
      while (performance.now() - start < 10) {
        // Wait 10ms
      }
      PerformanceMonitor.endMeasure('slowSystem');

      expect(consoleSpy).toHaveBeenCalled();
      const warnings = PerformanceMonitor.getWarnings();
      expect(warnings.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should clear warnings each frame', () => {
      PerformanceMonitor.logWarning('Test warning');
      expect(PerformanceMonitor.getWarnings().length).toBe(1);

      PerformanceMonitor.startFrame();
      expect(PerformanceMonitor.getWarnings().length).toBe(0);
    });
  });

  describe('Memory Usage', () => {
    it('should return memory info', () => {
      const memoryInfo = PerformanceMonitor.getMemoryUsage();
      expect(memoryInfo).toHaveProperty('heapUsed');
      expect(memoryInfo).toHaveProperty('heapTotal');
      expect(memoryInfo).toHaveProperty('external');
    });

    it('should include memory in metrics', () => {
      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.memoryUsage).toBeDefined();
    });
  });

  describe('Metrics', () => {
    it('should return complete metrics', () => {
      PerformanceMonitor.startFrame();
      PerformanceMonitor.startMeasure('testSystem');
      PerformanceMonitor.endMeasure('testSystem');
      PerformanceMonitor.trackEntityCount('zombies', 50);
      PerformanceMonitor.endFrame();

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.timestamp).toBeGreaterThan(0);
      expect(metrics.frameTime).toBeGreaterThan(0);
      expect(metrics.systemTimes.size).toBeGreaterThan(0);
      expect(metrics.entityCounts.size).toBeGreaterThan(0);
      expect(metrics.memoryUsage).toBeDefined();
      expect(Array.isArray(metrics.warnings)).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should clear all tracking data', () => {
      PerformanceMonitor.startMeasure('testSystem');
      PerformanceMonitor.endMeasure('testSystem');
      PerformanceMonitor.trackEntityCount('zombies', 50);
      PerformanceMonitor.logWarning('Test warning');

      PerformanceMonitor.reset();

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics.systemTimes.size).toBe(0);
      expect(metrics.entityCounts.size).toBe(0);
      expect(metrics.warnings.length).toBe(0);
      expect(metrics.frameTime).toBe(0);
    });
  });
});
