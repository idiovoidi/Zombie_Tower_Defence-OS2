/**
 * Debug utilities for development
 */

// biome-ignore lint/complexity/noStaticOnlyClass: Intentional singleton utility class
export class DebugUtils {
  private static enabled: boolean = false;
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
  public static debug(message: string, ...data: any[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...data);
    }
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static info(message: string, ...data: any[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...data);
    }
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static warn(message: string, ...data: any[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...data);
    }
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static error(message: string, ...data: any[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...data);
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

  private static logTimerResult(name: string, start: number, failed: boolean = false): void {
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
