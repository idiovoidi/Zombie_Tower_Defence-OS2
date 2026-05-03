/**
 * Debug utilities for development
 */

// biome-ignore lint/complexity/noStaticOnlyClass: Intentional singleton utility class
export class DebugUtils {
  private static enabled = false;
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  /**
   * Enable or disable debug mode
   * @param enabled Whether to enable debug mode
   */
  public static setEnabled(enabled: boolean): void {
    DebugUtils.enabled = enabled;
  }

  /**
   * Set the log level
   * @param level The log level
   */
  public static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    DebugUtils.logLevel = level;
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static debug(_message: string, ..._data: unknown[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('debug')) {
      // Debug logging disabled in production
    }
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static info(_message: string, ..._data: unknown[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('info')) {
      // Info logging disabled in production
    }
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static warn(_message: string, ..._data: unknown[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('warn')) {
      // Warning logging disabled in production
    }
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static error(_message: string, ..._data: unknown[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('error')) {
      // Error logging disabled in production
    }
  }

  /**
   * Check if a message should be logged based on the current log level
   * @param level The level of the message
   * @returns Whether the message should be logged
   */
  private static shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(DebugUtils.logLevel);
  }

  private static logTimerResult(name: string, start: number, failed = false): void {
    const end = performance.now();
    const statusSuffix = failed ? ' (failed)' : '';
    DebugUtils.debug(`[TIMER] ${name}: ${end - start}ms${statusSuffix}`);
  }

  /**
   * Measure the execution time of a function
   * @param name The name of the measurement
   * @param fn The function to measure
   * @returns The result of the function
   */
  public static async time<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!DebugUtils.enabled) {
      return await fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      DebugUtils.logTimerResult(name, start);
      return result;
    } catch (error) {
      DebugUtils.logTimerResult(name, start, true);
      throw error;
    }
  }

  /**
   * Measure the execution time of a synchronous function
   * @param name The name of the measurement
   * @param fn The function to measure
   * @returns The result of the function
   */
  public static timeSync<T>(name: string, fn: () => T): T {
    if (!DebugUtils.enabled) {
      return fn();
    }

    const start = performance.now();
    try {
      const result = fn();
      DebugUtils.logTimerResult(name, start);
      return result;
    } catch (error) {
      DebugUtils.logTimerResult(name, start, true);
      throw error;
    }
  }
}
