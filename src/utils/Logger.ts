import { DevConfig } from '../config/devConfig';

/**
 * Simple logging utility that respects debug configuration
 * Replaces direct console.log statements with conditional logging
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

let currentLevel: number =
  LOG_LEVELS[DevConfig.DEBUG.LOG_LEVEL as keyof typeof LOG_LEVELS] ?? LOG_LEVELS.info;

/**
 * Check if debug mode is enabled
 */
function isDebugEnabled(): boolean {
  return DevConfig.DEBUG.ENABLED;
}

/**
 * Debug level logging - only shown when debug mode is enabled
 */
export function debug(...args: unknown[]): void {
  if (isDebugEnabled() && currentLevel <= LOG_LEVELS.debug) {
    console.log(...args);
  }
}

/**
 * Info level logging
 */
export function info(...args: unknown[]): void {
  if (currentLevel <= LOG_LEVELS.info) {
    console.log(...args);
  }
}

/**
 * Warning level logging
 */
export function warn(...args: unknown[]): void {
  if (currentLevel <= LOG_LEVELS.warn) {
    console.warn(...args);
  }
}

/**
 * Error level logging
 */
export function error(...args: unknown[]): void {
  if (currentLevel <= LOG_LEVELS.error) {
    console.error(...args);
  }
}
