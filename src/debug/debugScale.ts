import { DebugConstants } from '../config/debugConstants';

/** Apply a debug multiplier only when debug mode is enabled. */
export function debugMul(base: number, multiplier: number): number {
  if (!DebugConstants.ENABLED) {
    return base;
  }
  return base * multiplier;
}

/** Floor after applying a debug multiplier. */
export function debugMulFloor(base: number, multiplier: number): number {
  return Math.floor(debugMul(base, multiplier));
}
