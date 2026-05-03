import type { Container, Graphics } from 'pixi.js';
import { EffectCleanupManager } from './EffectCleanupManager';

/**
 * ResourceCleanupManager - High-level resource orchestration and memory management
 *
 * This module provides centralized cleanup orchestration for all game resources.
 * It coordinates cleanup across multiple managers and handles persistent effects.
 *
 * Architecture:
 * - ResourceCleanupManager (this file) = High-level orchestration
 *   - Tracks persistent effects (Graphics objects)
 *   - Coordinates cleanup across managers
 *   - Provides wave/game cleanup methods
 *
 * - EffectCleanupManager (separate file) = Low-level timer tracking
 *   - Tracks intervals/timeouts only
 *   - Provides timer cleanup methods
 *   - Called by ResourceCleanupManager
 *
 * Why Two Files?
 * - Single Responsibility Principle
 * - EffectCleanupManager = Low-level (timers)
 * - ResourceCleanupManager = High-level (resources + orchestration)
 * - Easy to test independently
 * - Clear separation of concerns
 *
 * Key Features:
 * - Centralized cleanup logic for all game resources
 * - Reusable cleanup utilities for common patterns
 * - Automatic tracking and disposal of persistent effects
 * - Clear separation of concerns from game logic
 * - Correct cleanup order (timers first, then objects)
 *
 * Usage:
 * ```typescript
 * // Register persistent effects for cleanup
 * ResourceCleanupManager.registerPersistentEffect(firePool, {
 *   type: 'fire_pool',
 *   duration: 2000,
 *   onCleanup: () => {
 *     // Custom cleanup logic
 *   }
 * });
 *
 * // Clean up all resources between waves
 * ResourceCleanupManager.cleanupWaveResources(managers);
 *
 * // Clean up all resources when starting new game
 * ResourceCleanupManager.cleanupGameResources(managers);
 *
 * // Debug current state
 * ResourceCleanupManager.logState();
 * ```
 */

export interface PersistentEffect {
  graphics: Graphics;
  onCleanup?: () => void;
  metadata?: {
    type: string;
    createdAt: number;
    duration?: number;
  };
}

export interface GameManagers {
  zombieManager?: {
    clear: () => void;
    getBloodParticleSystem: () => { clear: () => void };
  };
  towerPlacementManager?: {
    clear: () => void;
  };
  projectileManager?: {
    clear: () => void;
  };
  effectManager?: {
    clear: () => void;
  };
  towerCombatManager?: {
    // biome-ignore lint/suspicious/noExplicitAny: Generic tower/zombie arrays for cleanup
    setTowers: (towers: any[]) => void;
    // biome-ignore lint/suspicious/noExplicitAny: Generic tower/zombie arrays for cleanup
    setZombies: (zombies: any[]) => void;
  };
  waveManager?: {
    reset: () => void;
  };
}

// biome-ignore lint/complexity/noStaticOnlyClass: Stateless utility for resource cleanup
export class ResourceCleanupManager {
  // Track all persistent effects (fire pools, sludge pools, explosions, tesla particles)
  private static persistentEffects: Set<PersistentEffect> = new Set();

  // Track cleanup callbacks for custom resources
  private static cleanupCallbacks: Set<() => void> = new Set();

  /**
   * Register a persistent effect for automatic cleanup
   * This should be called when creating fire pools, sludge pools, explosions, etc.
   */
  public static registerPersistentEffect(
    graphics: Graphics,
    options?: {
      onCleanup?: () => void;
      type?: string;
      duration?: number;
    }
  ): void {
    const effect: PersistentEffect = {
      graphics,
      onCleanup: options?.onCleanup,
      metadata: {
        type: options?.type || 'unknown',
        createdAt: Date.now(),
        duration: options?.duration,
      },
    };

    ResourceCleanupManager.persistentEffects.add(effect);
  }

  /**
   * Unregister a persistent effect (called when effect naturally expires)
   */
  public static unregisterPersistentEffect(graphics: Graphics): void {
    for (const effect of ResourceCleanupManager.persistentEffects) {
      if (effect.graphics === graphics) {
        ResourceCleanupManager.persistentEffects.delete(effect);
        break;
      }
    }
  }

  /**
   * Register a custom cleanup callback
   */
  public static registerCleanupCallback(callback: () => void): void {
    ResourceCleanupManager.cleanupCallbacks.add(callback);
  }

  /**
   * Unregister a cleanup callback
   */
  public static unregisterCleanupCallback(callback: () => void): void {
    ResourceCleanupManager.cleanupCallbacks.delete(callback);
  }

  /**
   * Clean up all persistent effects immediately
   * This is called when a wave ends or game is reset
   */
  public static cleanupPersistentEffects(): void {
    let count = 0;
    const effectTypes: Record<string, number> = {};

    for (const effect of ResourceCleanupManager.persistentEffects) {
      // Skip if already destroyed (e.g., parent zombie was destroyed)
      if (effect.graphics.destroyed) {
        const type = effect.metadata?.type || 'unknown';
        effectTypes[type] = (effectTypes[type] || 0) + 1;
        count++;
        continue;
      }

      // Call custom cleanup logic if provided
      if (effect.onCleanup) {
        try {
          effect.onCleanup();
        } catch (_error) {
          // Error handling not required for cleanup
        }
      }

      // Remove from parent and destroy graphics
      // Per pixijs-scene-container skill: use { children: true } for proper cleanup
      try {
        if (effect.graphics.parent) {
          effect.graphics.parent.removeChild(effect.graphics);
        }
        effect.graphics.destroy({ children: true });
      } catch (_error) {
        // Graphics already destroyed
      }

      // Track effect types for logging
      const type = effect.metadata?.type || 'unknown';
      effectTypes[type] = (effectTypes[type] || 0) + 1;
      count++;
    }

    ResourceCleanupManager.persistentEffects.clear();

    if (count > 0) {
      // Intentionally empty block for future logging or error handling
    }
  }

  /**
   * Execute all registered cleanup callbacks
   */
  public static executeCleanupCallbacks(): void {
    let count = 0;
    for (const callback of ResourceCleanupManager.cleanupCallbacks) {
      try {
        callback();
        count++;
      } catch (_error) {
        // Continue with other callbacks
      }
    }

    if (count > 0) {
      // Callbacks executed
    }
  }

  /**
   * Clean up resources between waves
   * This removes temporary effects but keeps game state
   */
  public static cleanupWaveResources(managers: GameManagers): void {

    // Get state before cleanup for verification
    const stateBefore = ResourceCleanupManager.getState();

    // CRITICAL: Clear all effect timers FIRST before destroying objects
    // This prevents timers from trying to access destroyed objects
    EffectCleanupManager.clearAll();

    // Now safe to destroy persistent effects (fire pools, sludge pools, explosions, tesla particles)
    ResourceCleanupManager.cleanupPersistentEffects();

    // Clear all projectiles
    if (managers.projectileManager) {
      managers.projectileManager.clear();
    }

    // Clear all visual effects (shell casings, muzzle flashes, bullet trails)
    if (managers.effectManager) {
      managers.effectManager.clear();
    }

    // Clear blood particles
    if (managers.zombieManager) {
      const bloodSystem = managers.zombieManager.getBloodParticleSystem();
      bloodSystem.clear();
    }

    // Execute custom cleanup callbacks
    ResourceCleanupManager.executeCleanupCallbacks();

    // Verify cleanup was successful
    ResourceCleanupManager.verifyCleanup(stateBefore, 'wave');
  }

  /**
   * Clean up all game resources when starting a new game
   * This is a full reset of all game state
   */
  public static cleanupGameResources(managers: GameManagers): void {

    // Get state before cleanup for verification
    const stateBefore = ResourceCleanupManager.getState();

    // CRITICAL: Clear all effect timers FIRST before destroying objects
    // This prevents timers from trying to access destroyed objects
    EffectCleanupManager.clearAll();

    // Now safe to destroy persistent effects
    ResourceCleanupManager.cleanupPersistentEffects();

    // Clear all zombies (destroys zombie objects, blood particles, corpses)
    if (managers.zombieManager) {
      managers.zombieManager.clear();
    }

    // Clear all towers (destroys tower objects and their effects)
    if (managers.towerPlacementManager) {
      managers.towerPlacementManager.clear();
    }

    // Clear all projectiles (destroys projectile objects and their effects)
    if (managers.projectileManager) {
      managers.projectileManager.clear();
    }

    // Clear all visual effects (shell casings, muzzle flashes, bullet trails, etc.)
    if (managers.effectManager) {
      managers.effectManager.clear();
    }

    // Clear tower combat manager state
    if (managers.towerCombatManager) {
      managers.towerCombatManager.setTowers([]);
      managers.towerCombatManager.setZombies([]);
    }

    // Reset wave manager
    if (managers.waveManager) {
      managers.waveManager.reset();
    }

    // Execute custom cleanup callbacks
    ResourceCleanupManager.executeCleanupCallbacks();

    // Verify cleanup was successful
    ResourceCleanupManager.verifyCleanup(stateBefore, 'game');
  }

  /**
   * Utility: Safely destroy a Graphics object
   * Per pixijs-scene-container skill: use destroy options for proper cleanup
   */
  public static destroyGraphics(graphics: Graphics | null | undefined): void {
    if (!graphics) {
      return;
    }

    try {
      if (graphics.parent) {
        graphics.parent.removeChild(graphics);
      }
      // Proper destroy with children cleanup
      graphics.destroy({ children: true });
    } catch (_error) {
      // Graphics already destroyed or invalid
    }
  }

  /**
   * Utility: Safely destroy a Container and all its children
   * Per pixijs-scene-container skill: use { children: true } instead of manual cleanup
   */
  public static destroyContainer(container: Container | null | undefined): void {
    if (!container) {
      return;
    }

    try {
      // Per pixijs-performance skill: If cacheAsTexture is on, disable it before destroying
      if (
        (container as unknown as { cacheAsTexture: { active: boolean } }).cacheAsTexture?.active
      ) {
        (container as unknown as { cacheAsTexture: (active: boolean) => void }).cacheAsTexture(
          false
        );
      }

      // Per pixijs-scene-container: use { children: true } for recursive destroy
      if (container.parent) {
        container.parent.removeChild(container);
      }
      container.destroy({ children: true });
    } catch (_error) {
      // Container already destroyed or invalid
    }
  }

  /**
   * Get current state for debugging
   */
  public static getState(): {
    persistentEffects: number;
    cleanupCallbacks: number;
    effectTimers: { intervals: number; timeouts: number };
  } {
    return {
      persistentEffects: ResourceCleanupManager.persistentEffects.size,
      cleanupCallbacks: ResourceCleanupManager.cleanupCallbacks.size,
      effectTimers: EffectCleanupManager.getCounts(),
    };
  }

  /**
   * Log current state for debugging
   */
  public static logState(): void {
    const state = ResourceCleanupManager.getState();

    if (state.persistentEffects > 20) {
      // High number of persistent effects detected
    }

    if (state.effectTimers.intervals > 20 || state.effectTimers.timeouts > 20) {
      // High number of timers detected
    }
  }

  /**
   * Verify cleanup was successful and log warnings if resources remain
   * @param stateBefore State before cleanup
   * @param cleanupType Type of cleanup performed ('wave' or 'game')
   */
  private static verifyCleanup(
    stateBefore: {
      persistentEffects: number;
      cleanupCallbacks: number;
      effectTimers: { intervals: number; timeouts: number };
    },
    _cleanupType: 'wave' | 'game'
  ): void {
    const stateAfter = ResourceCleanupManager.getState();

    // Check if cleanup was successful
    const issues: string[] = [];

    if (stateAfter.persistentEffects > 0) {
      issues.push(
        `${stateAfter.persistentEffects} persistent effects remain (expected 0, had ${stateBefore.persistentEffects} before cleanup)`
      );
    }

    if (stateAfter.effectTimers.intervals > 0) {
      issues.push(
        `${stateAfter.effectTimers.intervals} intervals remain (expected 0, had ${stateBefore.effectTimers.intervals} before cleanup)`
      );
    }

    if (stateAfter.effectTimers.timeouts > 0) {
      issues.push(
        `${stateAfter.effectTimers.timeouts} timeouts remain (expected 0, had ${stateBefore.effectTimers.timeouts} before cleanup)`
      );
    }

    // Log results
    if (issues.length > 0) {
      for (const _issue of issues) {
        // Issue logged
      }
      ResourceCleanupManager.forceCleanup();

      // Verify forced cleanup worked
      const stateAfterForced = ResourceCleanupManager.getState();
      if (
        stateAfterForced.persistentEffects === 0 &&
        stateAfterForced.effectTimers.intervals === 0 &&
        stateAfterForced.effectTimers.timeouts === 0
      ) {
        // Forced cleanup successful
      } else {
        // Forced cleanup partially failed
      }
    } else {
      // Cleanup successful
    }
  }

  /**
   * Force cleanup of all resources (fallback for stuck resources)
   * This is more aggressive than normal cleanup and should only be used
   * when normal cleanup fails
   */
  public static forceCleanup(): void {

    // Force clear all timers
    EffectCleanupManager.clearAll();

    // Force destroy all persistent effects (even if already destroyed)
    let forcedCount = 0;
    for (const effect of ResourceCleanupManager.persistentEffects) {
      try {
        if (!effect.graphics.destroyed) {
          if (effect.graphics.parent) {
            effect.graphics.parent.removeChild(effect.graphics);
          }
          effect.graphics.destroy();
          forcedCount++;
        }
      } catch (_error) {
        // Continue with other effects
      }
    }
    ResourceCleanupManager.persistentEffects.clear();

    if (forcedCount > 0) {
      // Forced cleanup completed
    }

    // Clear all callbacks
    ResourceCleanupManager.cleanupCallbacks.clear();
  }

  /**
   * Clear all tracked resources (for testing/debugging)
   */
  public static clearAll(): void {
    ResourceCleanupManager.cleanupPersistentEffects();
    ResourceCleanupManager.cleanupCallbacks.clear();
    EffectCleanupManager.clearAll();
  }
}
