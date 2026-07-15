/**
 * Internal type definitions for Tower class
 * These interfaces define the structure of dynamically added properties
 */

import type { Container, Graphics } from 'pixi.js';

/**
 * Legacy effect-manager surface used by Tower without importing EffectManager.
 */
export interface ITowerLegacyEffects {
  spawnDamageFlash(tower: unknown, duration: number): void;
  spawnBulletTrail(startX: number, startY: number, targetX: number, targetY: number): void;
  spawnImpactFlash(x: number, y: number, isHeadshot: boolean): void;
  getContainer(): Container;
}

/**
 * Interface for shell casing effect objects
 */
export interface ShellCasing {
  destroyed: boolean;
  parent: unknown;
  destroy(): void;
}

/**
 * Interface for muzzle flash effect objects
 */
export interface MuzzleFlash {
  destroyed: boolean;
  parent: unknown;
  destroy(): void;
}

/**
 * Extended Tower interface with dynamic properties
 * These properties are added at runtime for visual effects
 */
export interface TowerEffects {
  selectionHighlight?: Graphics;
  pulseInterval?: NodeJS.Timeout;
  shellCasings?: ShellCasing[];
  muzzleFlashes?: MuzzleFlash[];
}
