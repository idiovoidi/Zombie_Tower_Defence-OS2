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
  heapUsedMB: number;
  heapTotalMB: number;
}

export interface WaveMemorySnapshot {
  wave: number;
  timestamp: number;
  heapUsedMB: number;
  heapTotalMB: number;
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

  // Memory tracking
  private static waveMemorySnapshots: WaveMemorySnapshot[] = [];
  private static lastMemoryCheck: number = 0;
  private static readonly MEMORY_CHECK_INTERVAL_MS = 1000; // Check every second

  // Thresholds
  private static readonly SLOW_SYSTEM_THRESHOLD_MS = 5;
  private static readonly SLOW_FRAME_THRESHOLD_MS = 33; // Below 30 FPS
  private static readonly MAX_GRAPHICS_OBJECTS = 100;
  private static readonly MAX_PERSISTENT_EFFECTS = 20;
  private static readonly MAX_FRAME_HISTORY = 60; // Keep last 60 frames

  // Memory thresholds (in MB)
  private static readonly MEMORY_TARGET_WAVE_5 = 400;
  private static readonly MEMORY_TARGET_WAVE_10 = 450;
  private static readonly MEMORY_TARGET_WAVE_20 = 500;
  private static readonly MAX_MEMORY_GROWTH_PER_WAVE = 10; // MB per wave after wave 5

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
      const heapUsedMB = memory.usedJSHeapSize / 1024 / 1024;
      const heapTotalMB = memory.totalJSHeapSize / 1024 / 1024;
      return {
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        external: memory.jsHeapSizeLimit,
        heapUsedMB,
        heapTotalMB,
      };
    }

    // Return zeros if memory API not available
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      heapUsedMB: 0,
      heapTotalMB: 0,
    };
  }

  /**
   * Track memory usage each frame (throttled to avoid overhead)
   */
  public static trackMemoryUsage(): void {
    if (!this.enabled) {
      return;
    }

    const now = performance.now();
    if (now - this.lastMemoryCheck < this.MEMORY_CHECK_INTERVAL_MS) {
      return;
    }

    this.lastMemoryCheck = now;
    const memory = this.getMemoryUsage();

    // Check memory thresholds if we have memory data
    if (memory.heapUsedMB > 0) {
      this.checkMemoryThresholds(memory.heapUsedMB);
    }
  }

  /**
   * Record memory snapshot at wave start
   */
  public static recordWaveMemory(wave: number): void {
    if (!this.enabled) {
      return;
    }

    const memory = this.getMemoryUsage();
    if (memory.heapUsedMB === 0) {
      return; // Memory API not available
    }

    const snapshot: WaveMemorySnapshot = {
      wave,
      timestamp: Date.now(),
      heapUsedMB: memory.heapUsedMB,
      heapTotalMB: memory.heapTotalMB,
    };

    this.waveMemorySnapshots.push(snapshot);

    // Log wave memory
    console.log(
      `📊 Wave ${wave} Memory: ${memory.heapUsedMB.toFixed(2)} MB (Total: ${memory.heapTotalMB.toFixed(2)} MB)`
    );

    // Calculate and log growth rate if we have previous waves
    if (this.waveMemorySnapshots.length > 1) {
      const growthRate = this.calculateMemoryGrowthRate();
      if (growthRate !== null) {
        console.log(`📈 Memory growth rate: ${growthRate.toFixed(2)} MB/wave`);

        // Check if growth rate exceeds threshold after wave 5
        if (wave > 5 && growthRate > this.MAX_MEMORY_GROWTH_PER_WAVE) {
          this.logWarning(
            `High memory growth rate: ${growthRate.toFixed(2)} MB/wave (target: ${this.MAX_MEMORY_GROWTH_PER_WAVE} MB/wave)`
          );
        }
      }
    }
  }

  /**
   * Calculate memory growth rate per wave
   */
  private static calculateMemoryGrowthRate(): number | null {
    if (this.waveMemorySnapshots.length < 2) {
      return null;
    }

    // Calculate growth rate from last 5 waves (or all available if less than 5)
    const recentSnapshots = this.waveMemorySnapshots.slice(-5);
    if (recentSnapshots.length < 2) {
      return null;
    }

    const firstSnapshot = recentSnapshots[0];
    const lastSnapshot = recentSnapshots[recentSnapshots.length - 1];

    const memoryDiff = lastSnapshot.heapUsedMB - firstSnapshot.heapUsedMB;
    const waveDiff = lastSnapshot.wave - firstSnapshot.wave;

    if (waveDiff === 0) {
      return null;
    }

    return memoryDiff / waveDiff;
  }

  /**
   * Check memory usage against wave-specific thresholds
   */
  private static checkMemoryThresholds(heapUsedMB: number): void {
    // Get current wave from the last snapshot
    if (this.waveMemorySnapshots.length === 0) {
      return;
    }

    const currentWave = this.waveMemorySnapshots[this.waveMemorySnapshots.length - 1].wave;

    // Check wave-specific thresholds
    if (currentWave >= 20 && heapUsedMB > this.MEMORY_TARGET_WAVE_20) {
      this.logWarning(
        `Memory exceeds wave 20 target: ${heapUsedMB.toFixed(2)} MB (target: ${this.MEMORY_TARGET_WAVE_20} MB)`
      );
    } else if (currentWave >= 10 && heapUsedMB > this.MEMORY_TARGET_WAVE_10) {
      this.logWarning(
        `Memory exceeds wave 10 target: ${heapUsedMB.toFixed(2)} MB (target: ${this.MEMORY_TARGET_WAVE_10} MB)`
      );
    } else if (currentWave >= 5 && heapUsedMB > this.MEMORY_TARGET_WAVE_5) {
      this.logWarning(
        `Memory exceeds wave 5 target: ${heapUsedMB.toFixed(2)} MB (target: ${this.MEMORY_TARGET_WAVE_5} MB)`
      );
    }
  }

  /**
   * Get wave memory snapshots
   */
  public static getWaveMemorySnapshots(): WaveMemorySnapshot[] {
    return [...this.waveMemorySnapshots];
  }

  /**
   * Get memory growth rate
   */
  public static getMemoryGrowthRate(): number | null {
    return this.calculateMemoryGrowthRate();
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
      console.log(`\n💾 Memory Usage:`);
      console.log(`   Heap Used: ${metrics.memoryUsage.heapUsedMB.toFixed(2)} MB`);
      console.log(`   Heap Total: ${metrics.memoryUsage.heapTotalMB.toFixed(2)} MB`);

      // Show memory growth rate if available
      const growthRate = this.getMemoryGrowthRate();
      if (growthRate !== null) {
        const icon = growthRate > this.MAX_MEMORY_GROWTH_PER_WAVE ? '⚠️' : '✅';
        console.log(`   ${icon} Growth Rate: ${growthRate.toFixed(2)} MB/wave`);
      }

      // Show wave memory history
      if (this.waveMemorySnapshots.length > 0) {
        console.log(`   Wave History: ${this.waveMemorySnapshots.length} snapshots`);
      }
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
    this.waveMemorySnapshots = [];
    this.lastMemoryCheck = 0;
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

// Debug console commands
declare global {
  interface Window {
    debugPerformance: () => void;
    debugCleanup: () => void;
    debugToggleMonitoring: () => void;
  }
}

// Only attach debug commands in browser environment (not in tests)
if (typeof window !== 'undefined') {
  /**
   * Debug console command: Log current performance metrics
   * Usage: window.debugPerformance() or debugPerformance() in console
   */
  window.debugPerformance = () => {
    console.log('🔍 Performance Debug Command');
    PerformanceMonitor.logMetrics();
  };

  /**
   * Debug console command: Force cleanup of all resources
   * Usage: window.debugCleanup() or debugCleanup() in console
   */
  window.debugCleanup = () => {
    console.log('🔍 Cleanup Debug Command');
    // Import ResourceCleanupManager dynamically to avoid circular dependencies
    import('./ResourceCleanupManager').then(({ ResourceCleanupManager }) => {
      console.log('📊 Current state before cleanup:');
      ResourceCleanupManager.logState();
      console.log('\n🧹 Forcing cleanup...');
      ResourceCleanupManager.forceCleanup();
      console.log('\n📊 State after cleanup:');
      ResourceCleanupManager.logState();
    });
  };

  /**
   * Debug console command: Toggle performance monitoring on/off
   * Usage: window.debugToggleMonitoring() or debugToggleMonitoring() in console
   */
  window.debugToggleMonitoring = () => {
    console.log('🔍 Toggle Monitoring Debug Command');
    PerformanceMonitor.toggle();
    console.log(
      `Performance monitoring is now ${PerformanceMonitor.isEnabled() ? 'ENABLED' : 'DISABLED'}`
    );
  };
}
