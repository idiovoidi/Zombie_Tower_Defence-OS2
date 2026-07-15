/**
 * Debug utilities for development logging and diagnostics.
 */

// biome-ignore lint/complexity/noStaticOnlyClass: Intentional singleton utility class
export class DebugUtils {
  private static enabled = false;
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  public static setEnabled(enabled: boolean): void {
    DebugUtils.enabled = enabled;
  }

  public static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    DebugUtils.logLevel = level;
  }

  public static debug(message: string, ...data: unknown[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('debug')) {
      console.log(message, ...data);
    }
  }

  public static info(message: string, ...data: unknown[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('info')) {
      console.log(message, ...data);
    }
  }

  public static warn(message: string, ...data: unknown[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('warn')) {
      console.warn(message, ...data);
    }
  }

  public static error(message: string, ...data: unknown[]): void {
    if (DebugUtils.enabled && DebugUtils.shouldLog('error')) {
      console.error(message, ...data);
    }
  }

  private static shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(DebugUtils.logLevel);
  }
}
