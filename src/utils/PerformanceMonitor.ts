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
// biome-ignore lint/complexity/noStaticOnlyClass: Stateless utility for performance tracking
export class PerformanceMonitor {
  private static enabled = true;
  private static frameTimes: Map<string, number[]> = new Map();
  private static currentMeasurements: Map<string, SystemMeasurement> = new Map();
  private static entityCounts: Map<string, number> = new Map();
  private static warnings: string[] = [];
  private static frameStartTime = 0;
  private static lastFrameTime = 0;

  // Memory tracking
  private static waveMemorySnapshots: WaveMemorySnapshot[] = [];
  private static lastMemoryCheck = 0;
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
    PerformanceMonitor.enabled = enabled;
    if (!enabled) {
      PerformanceMonitor.reset();
    }
  }

  /**
   * Check if monitoring is enabled
   */
  public static isEnabled(): boolean {
    return PerformanceMonitor.enabled;
  }

  /**
   * Toggle monitoring on/off
   */
  public static toggle(): void {
    PerformanceMonitor.enabled = !PerformanceMonitor.enabled;
    console.log(`🔧 Performance monitoring ${PerformanceMonitor.enabled ? 'enabled' : 'disabled'}`);
    if (!PerformanceMonitor.enabled) {
      PerformanceMonitor.reset();
    }
  }

  /**
   * Start measuring frame time
   */
  public static startFrame(): void {
    if (!PerformanceMonitor.enabled) {
      return;
    }
    PerformanceMonitor.frameStartTime = performance.now();
    PerformanceMonitor.warnings = [];
  }

  /**
   * End frame measurement and check thresholds
   */
  public static endFrame(): void {
    if (!PerformanceMonitor.enabled) {
      return;
    }

    const frameTime = performance.now() - PerformanceMonitor.frameStartTime;
    PerformanceMonitor.lastFrameTime = frameTime;

    // Check frame time threshold
    if (frameTime > PerformanceMonitor.SLOW_FRAME_THRESHOLD_MS) {
      const fps = Math.round(1000 / frameTime);
      PerformanceMonitor.logWarning(`Low frame rate: ${fps} FPS (${frameTime.toFixed(2)}ms)`);
    }
  }

  /**
   * Start measuring a system's execution time
   */
  public static startMeasure(systemName: string): void {
    if (!PerformanceMonitor.enabled) {
      return;
    }

    PerformanceMonitor.currentMeasurements.set(systemName, {
      systemName,
      startTime: performance.now(),
    });
  }

  /**
   * End measuring a system's execution time
   */
  public static endMeasure(systemName: string): void {
    if (!PerformanceMonitor.enabled) {
      return;
    }

    const measurement = PerformanceMonitor.currentMeasurements.get(systemName);
    if (!measurement) {
      console.warn(`⚠️ No measurement started for system: ${systemName}`);
      return;
    }

    const duration = performance.now() - measurement.startTime;
    PerformanceMonitor.currentMeasurements.delete(systemName);

    // Store frame time
    if (!PerformanceMonitor.frameTimes.has(systemName)) {
      PerformanceMonitor.frameTimes.set(systemName, []);
    }
    const times = PerformanceMonitor.frameTimes.get(systemName);
    if (times) {
      times.push(duration);

      // Keep only last N frames
      if (times.length > PerformanceMonitor.MAX_FRAME_HISTORY) {
        times.shift();
      }
    }

    // Check threshold
    if (duration > PerformanceMonitor.SLOW_SYSTEM_THRESHOLD_MS) {
      PerformanceMonitor.logWarning(`Slow system: ${systemName} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Track entity count
   */
  public static trackEntityCount(type: string, count: number): void {
    if (!PerformanceMonitor.enabled) {
      return;
    }
    PerformanceMonitor.entityCounts.set(type, count);
  }

  /**
   * Check entity count thresholds
   */
  public static checkEntityThresholds(): void {
    if (!PerformanceMonitor.enabled) {
      return;
    }

    const graphicsCount = PerformanceMonitor.entityCounts.get('graphics') || 0;
    const persistentEffects = PerformanceMonitor.entityCounts.get('persistentEffects') || 0;

    if (graphicsCount > PerformanceMonitor.MAX_GRAPHICS_OBJECTS) {
      PerformanceMonitor.logWarning(`High graphics object count: ${graphicsCount}`);
    }

    if (persistentEffects > PerformanceMonitor.MAX_PERSISTENT_EFFECTS) {
      PerformanceMonitor.logWarning(`High persistent effect count: ${persistentEffects}`);
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
    if (!PerformanceMonitor.enabled) {
      return;
    }

    const now = performance.now();
    if (now - PerformanceMonitor.lastMemoryCheck < PerformanceMonitor.MEMORY_CHECK_INTERVAL_MS) {
      return;
    }

    PerformanceMonitor.lastMemoryCheck = now;
    const memory = PerformanceMonitor.getMemoryUsage();

    // Check memory thresholds if we have memory data
    if (memory.heapUsedMB > 0) {
      PerformanceMonitor.checkMemoryThresholds(memory.heapUsedMB);
    }
  }

  /**
   * Record memory snapshot at wave start
   */
  public static recordWaveMemory(wave: number): void {
    if (!PerformanceMonitor.enabled) {
      return;
    }

    const memory = PerformanceMonitor.getMemoryUsage();
    if (memory.heapUsedMB === 0) {
      return; // Memory API not available
    }

    const snapshot: WaveMemorySnapshot = {
      wave,
      timestamp: Date.now(),
      heapUsedMB: memory.heapUsedMB,
      heapTotalMB: memory.heapTotalMB,
    };

    PerformanceMonitor.waveMemorySnapshots.push(snapshot);

    // Log wave memory
    console.log(
      `📊 Wave ${wave} Memory: ${memory.heapUsedMB.toFixed(2)} MB (Total: ${memory.heapTotalMB.toFixed(2)} MB)`
    );

    // Calculate and log growth rate if we have previous waves
    if (PerformanceMonitor.waveMemorySnapshots.length > 1) {
      const growthRate = PerformanceMonitor.calculateMemoryGrowthRate();
      if (growthRate !== null) {
        console.log(`📈 Memory growth rate: ${growthRate.toFixed(2)} MB/wave`);

        // Check if growth rate exceeds threshold after wave 5
        if (wave > 5 && growthRate > PerformanceMonitor.MAX_MEMORY_GROWTH_PER_WAVE) {
          PerformanceMonitor.logWarning(
            `High memory growth rate: ${growthRate.toFixed(2)} MB/wave (target: ${PerformanceMonitor.MAX_MEMORY_GROWTH_PER_WAVE} MB/wave)`
          );
        }
      }
    }
  }

  /**
   * Calculate memory growth rate per wave
   */
  private static calculateMemoryGrowthRate(): number | null {
    if (PerformanceMonitor.waveMemorySnapshots.length < 2) {
      return null;
    }

    // Calculate growth rate from last 5 waves (or all available if less than 5)
    const recentSnapshots = PerformanceMonitor.waveMemorySnapshots.slice(-5);
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
    if (PerformanceMonitor.waveMemorySnapshots.length === 0) {
      return;
    }

    const currentWave =
      PerformanceMonitor.waveMemorySnapshots[PerformanceMonitor.waveMemorySnapshots.length - 1]
        .wave;

    // Check wave-specific thresholds
    if (currentWave >= 20 && heapUsedMB > PerformanceMonitor.MEMORY_TARGET_WAVE_20) {
      PerformanceMonitor.logWarning(
        `Memory exceeds wave 20 target: ${heapUsedMB.toFixed(2)} MB (target: ${PerformanceMonitor.MEMORY_TARGET_WAVE_20} MB)`
      );
    } else if (currentWave >= 10 && heapUsedMB > PerformanceMonitor.MEMORY_TARGET_WAVE_10) {
      PerformanceMonitor.logWarning(
        `Memory exceeds wave 10 target: ${heapUsedMB.toFixed(2)} MB (target: ${PerformanceMonitor.MEMORY_TARGET_WAVE_10} MB)`
      );
    } else if (currentWave >= 5 && heapUsedMB > PerformanceMonitor.MEMORY_TARGET_WAVE_5) {
      PerformanceMonitor.logWarning(
        `Memory exceeds wave 5 target: ${heapUsedMB.toFixed(2)} MB (target: ${PerformanceMonitor.MEMORY_TARGET_WAVE_5} MB)`
      );
    }
  }

  /**
   * Get wave memory snapshots
   */
  public static getWaveMemorySnapshots(): WaveMemorySnapshot[] {
    return [...PerformanceMonitor.waveMemorySnapshots];
  }

  /**
   * Get memory growth rate
   */
  public static getMemoryGrowthRate(): number | null {
    return PerformanceMonitor.calculateMemoryGrowthRate();
  }

  /**
   * Get current performance metrics
   */
  public static getMetrics(): PerformanceMetrics {
    const systemTimes = new Map<string, number>();

    // Calculate average times for each system
    PerformanceMonitor.frameTimes.forEach((times, systemName) => {
      if (times.length > 0) {
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        systemTimes.set(systemName, avg);
      }
    });

    return {
      timestamp: Date.now(),
      frameTime: PerformanceMonitor.lastFrameTime,
      systemTimes,
      entityCounts: new Map(PerformanceMonitor.entityCounts),
      memoryUsage: PerformanceMonitor.getMemoryUsage(),
      warnings: [...PerformanceMonitor.warnings],
    };
  }

  /**
   * Log a warning
   */
  public static logWarning(message: string): void {
    if (!PerformanceMonitor.enabled) {
      return;
    }

    PerformanceMonitor.warnings.push(message);
    console.warn(`⚠️ ${message}`);
  }

  /**
   * Log current metrics to console
   */
  public static logMetrics(): void {
    if (!PerformanceMonitor.enabled) {
      console.log('📊 Performance monitoring is disabled');
      return;
    }

    const metrics = PerformanceMonitor.getMetrics();

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
        const icon = time > PerformanceMonitor.SLOW_SYSTEM_THRESHOLD_MS ? '⚠️' : '✅';
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
      console.log('\n💾 Memory Usage:');
      console.log(`   Heap Used: ${metrics.memoryUsage.heapUsedMB.toFixed(2)} MB`);
      console.log(`   Heap Total: ${metrics.memoryUsage.heapTotalMB.toFixed(2)} MB`);

      // Show memory growth rate if available
      const growthRate = PerformanceMonitor.getMemoryGrowthRate();
      if (growthRate !== null) {
        const icon = growthRate > PerformanceMonitor.MAX_MEMORY_GROWTH_PER_WAVE ? '⚠️' : '✅';
        console.log(`   ${icon} Growth Rate: ${growthRate.toFixed(2)} MB/wave`);
      }

      // Show wave memory history
      if (PerformanceMonitor.waveMemorySnapshots.length > 0) {
        console.log(`   Wave History: ${PerformanceMonitor.waveMemorySnapshots.length} snapshots`);
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
    PerformanceMonitor.frameTimes.clear();
    PerformanceMonitor.currentMeasurements.clear();
    PerformanceMonitor.entityCounts.clear();
    PerformanceMonitor.warnings = [];
    PerformanceMonitor.frameStartTime = 0;
    PerformanceMonitor.lastFrameTime = 0;
    PerformanceMonitor.waveMemorySnapshots = [];
    PerformanceMonitor.lastMemoryCheck = 0;
  }

  /**
   * Get average frame time for a specific system
   */
  public static getAverageSystemTime(systemName: string): number {
    const times = PerformanceMonitor.frameTimes.get(systemName);
    if (!times || times.length === 0) {
      return 0;
    }
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Get all warnings
   */
  public static getWarnings(): string[] {
    return [...PerformanceMonitor.warnings];
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
