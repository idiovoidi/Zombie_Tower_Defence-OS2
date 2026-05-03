/**
 * EffectCleanupManager - Low-level timer tracking and cleanup
 *
 * This manager provides a focused solution for tracking and cleaning up timers
 * (setInterval/setTimeout) to prevent memory leaks from orphaned callbacks.
 *
 * Scope:
 * - ONLY handles timers (intervals and timeouts)
 * - Does NOT handle Graphics objects or game resources
 * - For resource cleanup, use ResourceCleanupManager
 *
 * Problem:
 * - Animation effects use setInterval for animations
 * - If game is reset/cleared while intervals are running, they continue executing
 * - Intervals hold references to objects, preventing garbage collection
 *
 * Solution:
 * - Track all active intervals/timeouts in a central registry
 * - Provide cleanup methods that can be called on game reset/clear
 * - Automatically clean up completed timers
 *
 * Usage:
 * ```typescript
 * // Register interval for tracking
 * const interval = EffectCleanupManager.registerInterval(
 *   setInterval(() => { ... }, 16)
 * );
 *
 * // Clear when done
 * EffectCleanupManager.clearInterval(interval);
 *
 * // Or clear all on cleanup
 * EffectCleanupManager.clearAll();
 * ```
 */

// biome-ignore lint/complexity/noStaticOnlyClass: Intentional singleton manager
export class EffectCleanupManager {
  private static intervals: Set<NodeJS.Timeout> = new Set();
  private static timeouts: Set<NodeJS.Timeout> = new Set();

  /**
   * Register an interval for tracking and cleanup
   */
  public static registerInterval(interval: NodeJS.Timeout): NodeJS.Timeout {
    EffectCleanupManager.intervals.add(interval);
    return interval;
  }

  /**
   * Register a timeout for tracking and cleanup
   */
  public static registerTimeout(timeout: NodeJS.Timeout): NodeJS.Timeout {
    EffectCleanupManager.timeouts.add(timeout);
    return timeout;
  }

  /**
   * Unregister an interval (call this when interval completes normally)
   */
  public static unregisterInterval(interval: NodeJS.Timeout): void {
    EffectCleanupManager.intervals.delete(interval);
  }

  /**
   * Unregister a timeout (call this when timeout completes normally)
   */
  public static unregisterTimeout(timeout: NodeJS.Timeout): void {
    EffectCleanupManager.timeouts.delete(timeout);
  }

  /**
   * Clear a specific interval and unregister it
   */
  public static clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    EffectCleanupManager.intervals.delete(interval);
  }

  /**
   * Clear a specific timeout and unregister it
   */
  public static clearTimeout(timeout: NodeJS.Timeout): void {
    clearTimeout(timeout);
    EffectCleanupManager.timeouts.delete(timeout);
  }

  /**
   * Clear all tracked intervals (call on game reset/clear)
   */
  public static clearAllIntervals(): void {
    let count = 0;
    for (const interval of EffectCleanupManager.intervals) {
      clearInterval(interval);
      count++;
    }
    EffectCleanupManager.intervals.clear();
    if (count > 0) {
    }
  }

  /**
   * Clear all tracked timeouts (call on game reset/clear)
   */
  public static clearAllTimeouts(): void {
    let count = 0;
    for (const timeout of EffectCleanupManager.timeouts) {
      clearTimeout(timeout);
      count++;
    }
    EffectCleanupManager.timeouts.clear();
    if (count > 0) {
    }
  }

  /**
   * Clear everything (intervals and timeouts)
   * Call this on game reset, level change, or cleanup
   */
  public static clearAll(): void {
    EffectCleanupManager.clearAllIntervals();
    EffectCleanupManager.clearAllTimeouts();
  }

  /**
   * Get current counts (for debugging)
   */
  public static getCounts(): { intervals: number; timeouts: number } {
    return {
      intervals: EffectCleanupManager.intervals.size,
      timeouts: EffectCleanupManager.timeouts.size,
    };
  }

  /**
   * Log current state (for debugging)
   */
  public static logState(): void {
    const counts = EffectCleanupManager.getCounts();
    if (counts.intervals > 10 || counts.timeouts > 10) {
    }
  }
}
