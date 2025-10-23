/**
 * EffectCleanupManager - Centralized manager for tracking and cleaning up timers
 * 
 * This manager solves memory leaks caused by orphaned setInterval/setTimeout calls
 * in projectile effects (explosions, fire pools, sludge pools) and other animations.
 * 
 * Problem:
 * - Projectile effects use setInterval for animations
 * - If game is reset/cleared while intervals are running, they continue executing
 * - Intervals hold references to Graphics objects and zombie arrays
 * - This prevents garbage collection and causes memory leaks
 * 
 * Solution:
 * - Track all active intervals/timeouts in a central registry
 * - Provide cleanup methods that can be called on game reset/clear
 * - Automatically clean up completed timers
 */

export interface IDisposable {
  dispose(): void;
}

export class EffectCleanupManager {
  private static intervals: Set<NodeJS.Timeout> = new Set();
  private static timeouts: Set<NodeJS.Timeout> = new Set();
  private static disposables: Set<IDisposable> = new Set();

  /**
   * Register an interval for tracking and cleanup
   */
  public static registerInterval(interval: NodeJS.Timeout): NodeJS.Timeout {
    this.intervals.add(interval);
    return interval;
  }

  /**
   * Register a timeout for tracking and cleanup
   */
  public static registerTimeout(timeout: NodeJS.Timeout): NodeJS.Timeout {
    this.timeouts.add(timeout);
    return timeout;
  }

  /**
   * Register a disposable object for cleanup
   */
  public static registerDisposable(disposable: IDisposable): void {
    this.disposables.add(disposable);
  }

  /**
   * Unregister an interval (call this when interval completes normally)
   */
  public static unregisterInterval(interval: NodeJS.Timeout): void {
    this.intervals.delete(interval);
  }

  /**
   * Unregister a timeout (call this when timeout completes normally)
   */
  public static unregisterTimeout(timeout: NodeJS.Timeout): void {
    this.timeouts.delete(timeout);
  }

  /**
   * Unregister a disposable
   */
  public static unregisterDisposable(disposable: IDisposable): void {
    this.disposables.delete(disposable);
  }

  /**
   * Clear a specific interval and unregister it
   */
  public static clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  /**
   * Clear a specific timeout and unregister it
   */
  public static clearTimeout(timeout: NodeJS.Timeout): void {
    clearTimeout(timeout);
    this.timeouts.delete(timeout);
  }

  /**
   * Clear all tracked intervals (call on game reset/clear)
   */
  public static clearAllIntervals(): void {
    let count = 0;
    for (const interval of this.intervals) {
      clearInterval(interval);
      count++;
    }
    this.intervals.clear();
    if (count > 0) {
      console.log(`🧹 Cleaned up ${count} orphaned intervals`);
    }
  }

  /**
   * Clear all tracked timeouts (call on game reset/clear)
   */
  public static clearAllTimeouts(): void {
    let count = 0;
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
      count++;
    }
    this.timeouts.clear();
    if (count > 0) {
      console.log(`🧹 Cleaned up ${count} orphaned timeouts`);
    }
  }

  /**
   * Dispose all tracked disposables
   */
  public static disposeAll(): void {
    let count = 0;
    for (const disposable of this.disposables) {
      try {
        disposable.dispose();
        count++;
      } catch (error) {
        console.error('Error disposing object:', error);
      }
    }
    this.disposables.clear();
    if (count > 0) {
      console.log(`🧹 Disposed ${count} tracked objects`);
    }
  }

  /**
   * Clear everything (intervals, timeouts, disposables)
   * Call this on game reset, level change, or cleanup
   */
  public static clearAll(): void {
    this.clearAllIntervals();
    this.clearAllTimeouts();
    this.disposeAll();
  }

  /**
   * Get current counts (for debugging)
   */
  public static getCounts(): { intervals: number; timeouts: number; disposables: number } {
    return {
      intervals: this.intervals.size,
      timeouts: this.timeouts.size,
      disposables: this.disposables.size,
    };
  }

  /**
   * Log current state (for debugging)
   */
  public static logState(): void {
    const counts = this.getCounts();
    console.log('🔍 EffectCleanupManager State:', counts);
    if (counts.intervals > 10 || counts.timeouts > 10) {
      console.warn('⚠️ High number of tracked timers - possible memory leak!');
    }
  }
}

