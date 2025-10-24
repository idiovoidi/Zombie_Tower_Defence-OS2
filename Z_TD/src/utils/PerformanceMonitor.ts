/**
 * PerformanceMonitor - Real-time performance monitoring for gameplay
 *
 * Tracks frame times, memory usage, and entity counts during gameplay.
 * Provides threshold-based warnings for performance degradation.
 * Used by GameManager to monitor system performance in real-time.
 */

export interface PerformanceMetrics {
  timestamp: number;
  frameTime: number;
  systemTimes: Map<string, number>;
  entityCounts: Map<string, number>;
  memoryUsage: MemoryInfo;
  warnings: string[];
}

export interface MemoryInfo {
  heapUsed: number;
  heapTotal: number;
  external: number;
}

export interface SystemMeasurement {
  systemName: string;
  startTime: number;
}

/**
 * PerformanceMonitor - Monitors game performance in real-time
 */
export class PerformanceMonitor {
  private static enabled: boolean = true;
  private static frameTimes: Map<string, number[]> = new Map();
  private static currentMeasurements: Map<string, SystemMeasurement> = new Map();
  private static entityCounts: Map<string, number> = new Map();
  private static warnings: string[] = [];
  private static frameStartTime: number = 0;
  private static lastFrameTime: number = 0;

  // Thresholds
  private static readonly SLOW_SYSTEM_THRESHOLD_MS = 5;
  private static readonly SLOW_FRAME_THRESHOLD_MS = 33; // Below 30 FPS
  private static readonly MAX_GRAPHICS_OBJECTS = 100;
  private static readonly MAX_PERSISTENT_EFFECTS = 20;
  private static readonly MAX_FRAME_HISTORY = 60; // Keep last 60 frames

  /**
   * Enable or disable performance monitoring
   */
  public static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.reset();
    }
  }

  /**
   * Check if monitoring is enabled
   */
  public static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle monitoring on/off
   */
  public static toggle(): void {
    this.enabled = !this.enabled;
    console.log(`🔧 Performance monitoring ${this.enabled ? 'enabled' : 'disabled'}`);
    if (!this.enabled) {
      this.reset();
    }
  }

  /**
   * Start measuring frame time
   */
  public static startFrame(): void {
    if (!this.enabled) {
      return;
    }
    this.frameStartTime = performance.now();
    this.warnings = [];
  }

  /**
   * End frame measurement and check thresholds
   */
  public static endFrame(): void {
    if (!this.enabled) {
      return;
    }

    const frameTime = performance.now() - this.frameStartTime;
    this.lastFrameTime = frameTime;

    // Check frame time threshold
    if (frameTime > this.SLOW_FRAME_THRESHOLD_MS) {
      const fps = Math.round(1000 / frameTime);
      this.logWarning(`Low frame rate: ${fps} FPS (${frameTime.toFixed(2)}ms)`);
    }
  }

  /**
   * Start measuring a system's execution time
   */
  public static startMeasure(systemName: string): void {
    if (!this.enabled) {
      return;
    }

    this.currentMeasurements.set(systemName, {
      systemName,
      startTime: performance.now(),
    });
  }

  /**
   * End measuring a system's execution time
   */
  public static endMeasure(systemName: string): void {
    if (!this.enabled) {
      return;
    }

    const measurement = this.currentMeasurements.get(systemName);
    if (!measurement) {
      console.warn(`⚠️ No measurement started for system: ${systemName}`);
      return;
    }

    const duration = performance.now() - measurement.startTime;
    this.currentMeasurements.delete(systemName);

    // Store frame time
    if (!this.frameTimes.has(systemName)) {
      this.frameTimes.set(systemName, []);
    }
    const times = this.frameTimes.get(systemName);
    if (times) {
      times.push(duration);

      // Keep only last N frames
      if (times.length > this.MAX_FRAME_HISTORY) {
        times.shift();
      }
    }

    // Check threshold
    if (duration > this.SLOW_SYSTEM_THRESHOLD_MS) {
      this.logWarning(`Slow system: ${systemName} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Track entity count
   */
  public static trackEntityCount(type: string, count: number): void {
    if (!this.enabled) {
      return;
    }
    this.entityCounts.set(type, count);
  }

  /**
   * Check entity count thresholds
   */
  public static checkEntityThresholds(): void {
    if (!this.enabled) {
      return;
    }

    const graphicsCount = this.entityCounts.get('graphics') || 0;
    const persistentEffects = this.entityCounts.get('persistentEffects') || 0;

    if (graphicsCount > this.MAX_GRAPHICS_OBJECTS) {
      this.logWarning(`High graphics object count: ${graphicsCount}`);
    }

    if (persistentEffects > this.MAX_PERSISTENT_EFFECTS) {
      this.logWarning(`High persistent effect count: ${persistentEffects}`);
    }
  }

  /**
   * Get memory usage information
   */
  public static getMemoryUsage(): MemoryInfo {
    // Check if Chrome's memory API is available
    const perfWithMemory = performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };

    if (typeof performance !== 'undefined' && perfWithMemory.memory) {
      const memory = perfWithMemory.memory;
      return {
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        external: memory.jsHeapSizeLimit,
      };
    }

    // Return zeros if memory API not available
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
    };
  }

  /**
   * Get current performance metrics
   */
  public static getMetrics(): PerformanceMetrics {
    const systemTimes = new Map<string, number>();

    // Calculate average times for each system
    this.frameTimes.forEach((times, systemName) => {
      if (times.length > 0) {
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        systemTimes.set(systemName, avg);
      }
    });

    return {
      timestamp: Date.now(),
      frameTime: this.lastFrameTime,
      systemTimes,
      entityCounts: new Map(this.entityCounts),
      memoryUsage: this.getMemoryUsage(),
      warnings: [...this.warnings],
    };
  }

  /**
   * Log a warning
   */
  public static logWarning(message: string): void {
    if (!this.enabled) {
      return;
    }

    this.warnings.push(message);
    console.warn(`⚠️ ${message}`);
  }

  /**
   * Log current metrics to console
   */
  public static logMetrics(): void {
    if (!this.enabled) {
      console.log('📊 Performance monitoring is disabled');
      return;
    }

    const metrics = this.getMetrics();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Performance Metrics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Frame time
    const fps = metrics.frameTime > 0 ? Math.round(1000 / metrics.frameTime) : 0;
    console.log(`\n⏱️  Frame Time: ${metrics.frameTime.toFixed(2)}ms (${fps} FPS)`);

    // System times
    if (metrics.systemTimes.size > 0) {
      console.log('\n🔧 System Times (average):');
      metrics.systemTimes.forEach((time, system) => {
        const icon = time > this.SLOW_SYSTEM_THRESHOLD_MS ? '⚠️' : '✅';
        console.log(`   ${icon} ${system}: ${time.toFixed(2)}ms`);
      });
    }

    // Entity counts
    if (metrics.entityCounts.size > 0) {
      console.log('\n📦 Entity Counts:');
      metrics.entityCounts.forEach((count, type) => {
        console.log(`   ${type}: ${count}`);
      });
    }

    // Memory usage
    if (metrics.memoryUsage.heapUsed > 0) {
      const heapUsedMB = (metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
      const heapTotalMB = (metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
      console.log(`\n💾 Memory Usage:`);
      console.log(`   Heap Used: ${heapUsedMB} MB`);
      console.log(`   Heap Total: ${heapTotalMB} MB`);
    }

    // Warnings
    if (metrics.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      metrics.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Reset all tracking data
   */
  public static reset(): void {
    this.frameTimes.clear();
    this.currentMeasurements.clear();
    this.entityCounts.clear();
    this.warnings = [];
    this.frameStartTime = 0;
    this.lastFrameTime = 0;
  }

  /**
   * Get average frame time for a specific system
   */
  public static getAverageSystemTime(systemName: string): number {
    const times = this.frameTimes.get(systemName);
    if (!times || times.length === 0) {
      return 0;
    }
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Get all warnings
   */
  public static getWarnings(): string[] {
    return [...this.warnings];
  }
}
