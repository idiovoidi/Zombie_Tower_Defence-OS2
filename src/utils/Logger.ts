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
 * Set the current log level
 */
export function setLogLevel(level: keyof typeof LOG_LEVELS): void {
  currentLevel = LOG_LEVELS[level];
}

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

/**
 * Debug group - only shown when debug mode is enabled
 */
export function debugGroup(label: string, callback: () => void): void {
  if (isDebugEnabled() && currentLevel <= LOG_LEVELS.debug) {
    console.group(label);
    callback();
    console.groupEnd();
  }
}

/**
 * Table logging for structured data - only in debug mode
 */
export function table(data: unknown): void {
  if (isDebugEnabled() && currentLevel <= LOG_LEVELS.debug) {
    console.table(data);
  }
}
