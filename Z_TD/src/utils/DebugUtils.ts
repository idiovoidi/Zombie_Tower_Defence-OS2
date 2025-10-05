/**
 * Debug utilities for development
 */

export class DebugUtils {
  private static enabled: boolean = false;
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  /**
   * Enable or disable debug mode
   * @param enabled Whether to enable debug mode
   */
  public static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Set the log level
   * @param level The log level
   */
  public static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.logLevel = level;
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static debug(message: string, ...data: any[]): void {
    if (this.enabled && this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...data);
    }
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static info(message: string, ...data: any[]): void {
    if (this.enabled && this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...data);
    }
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static warn(message: string, ...data: any[]): void {
    if (this.enabled && this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...data);
    }
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param data Optional data to log
   */
  public static error(message: string, ...data: any[]): void {
    if (this.enabled && this.shouldLog('error')) {
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
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  /**
   * Measure the execution time of a function
   * @param name The name of the measurement
   * @param fn The function to measure
   * @returns The result of the function
   */
  public static async time<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) {
      return await fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      this.debug(`[TIMER] ${name}: ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      this.debug(`[TIMER] ${name}: ${end - start}ms (failed)`);
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
    if (!this.enabled) {
      return fn();
    }

    const start = performance.now();
    try {
      const result = fn();
      const end = performance.now();
      this.debug(`[TIMER] ${name}: ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      this.debug(`[TIMER] ${name}: ${end - start}ms (failed)`);
      throw error;
    }
  }
}
