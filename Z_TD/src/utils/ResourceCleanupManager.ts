import { Container, Graphics } from 'pixi.js';
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
    setTowers: (towers: any[]) => void;
    setZombies: (zombies: any[]) => void;
  };
  waveManager?: {
    reset: () => void;
  };
}

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

    this.persistentEffects.add(effect);
  }

  /**
   * Unregister a persistent effect (called when effect naturally expires)
   */
  public static unregisterPersistentEffect(graphics: Graphics): void {
    for (const effect of this.persistentEffects) {
      if (effect.graphics === graphics) {
        this.persistentEffects.delete(effect);
        break;
      }
    }
  }

  /**
   * Register a custom cleanup callback
   */
  public static registerCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.add(callback);
  }

  /**
   * Unregister a cleanup callback
   */
  public static unregisterCleanupCallback(callback: () => void): void {
    this.cleanupCallbacks.delete(callback);
  }

  /**
   * Clean up all persistent effects immediately
   * This is called when a wave ends or game is reset
   */
  public static cleanupPersistentEffects(): void {
    let count = 0;
    const effectTypes: Record<string, number> = {};

    for (const effect of this.persistentEffects) {
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
        } catch (error) {
          console.error('Error in custom cleanup:', error);
        }
      }

      // Remove from parent and destroy graphics
      try {
        if (effect.graphics.parent) {
          effect.graphics.parent.removeChild(effect.graphics);
        }
        effect.graphics.destroy();
      } catch (error) {
        console.error('Error destroying persistent effect:', error);
      }

      // Track effect types for logging
      const type = effect.metadata?.type || 'unknown';
      effectTypes[type] = (effectTypes[type] || 0) + 1;
      count++;
    }

    this.persistentEffects.clear();

    if (count > 0) {
      console.log(`🧹 Cleaned up ${count} persistent effects:`, effectTypes);
    }
  }

  /**
   * Execute all registered cleanup callbacks
   */
  public static executeCleanupCallbacks(): void {
    let count = 0;
    for (const callback of this.cleanupCallbacks) {
      try {
        callback();
        count++;
      } catch (error) {
        console.error('Error in cleanup callback:', error);
      }
    }

    if (count > 0) {
      console.log(`🧹 Executed ${count} cleanup callbacks`);
    }
  }

  /**
   * Clean up resources between waves
   * This removes temporary effects but keeps game state
   */
  public static cleanupWaveResources(managers: GameManagers): void {
    console.log('🧹 Cleaning up wave resources...');

    // Get state before cleanup for verification
    const stateBefore = this.getState();

    // CRITICAL: Clear all effect timers FIRST before destroying objects
    // This prevents timers from trying to access destroyed objects
    EffectCleanupManager.clearAll();
    console.log('  ✓ Effect timers cleared');

    // Now safe to destroy persistent effects (fire pools, sludge pools, explosions, tesla particles)
    this.cleanupPersistentEffects();

    // Clear all projectiles
    if (managers.projectileManager) {
      managers.projectileManager.clear();
      console.log('  ✓ Projectiles cleared');
    }

    // Clear all visual effects (shell casings, muzzle flashes, bullet trails)
    if (managers.effectManager) {
      managers.effectManager.clear();
      console.log('  ✓ Visual effects cleared');
    }

    // Clear blood particles
    if (managers.zombieManager) {
      const bloodSystem = managers.zombieManager.getBloodParticleSystem();
      bloodSystem.clear();
      console.log('  ✓ Blood particles cleared');
    }

    // Execute custom cleanup callbacks
    this.executeCleanupCallbacks();

    // Verify cleanup was successful
    this.verifyCleanup(stateBefore, 'wave');

    console.log('🧹 Wave cleanup complete');
  }

  /**
   * Clean up all game resources when starting a new game
   * This is a full reset of all game state
   */
  public static cleanupGameResources(managers: GameManagers): void {
    console.log('🧹 Cleaning up game resources...');

    // Get state before cleanup for verification
    const stateBefore = this.getState();

    // CRITICAL: Clear all effect timers FIRST before destroying objects
    // This prevents timers from trying to access destroyed objects
    EffectCleanupManager.clearAll();
    console.log('  ✓ Effect timers cleared');

    // Now safe to destroy persistent effects
    this.cleanupPersistentEffects();

    // Clear all zombies (destroys zombie objects, blood particles, corpses)
    if (managers.zombieManager) {
      managers.zombieManager.clear();
      console.log('  ✓ Zombies cleared');
    }

    // Clear all towers (destroys tower objects and their effects)
    if (managers.towerPlacementManager) {
      managers.towerPlacementManager.clear();
      console.log('  ✓ Towers cleared');
    }

    // Clear all projectiles (destroys projectile objects and their effects)
    if (managers.projectileManager) {
      managers.projectileManager.clear();
      console.log('  ✓ Projectiles cleared');
    }

    // Clear all visual effects (shell casings, muzzle flashes, bullet trails, etc.)
    if (managers.effectManager) {
      managers.effectManager.clear();
      console.log('  ✓ Visual effects cleared');
    }

    // Clear tower combat manager state
    if (managers.towerCombatManager) {
      managers.towerCombatManager.setTowers([]);
      managers.towerCombatManager.setZombies([]);
      console.log('  ✓ Combat manager cleared');
    }

    // Reset wave manager
    if (managers.waveManager) {
      managers.waveManager.reset();
      console.log('  ✓ Wave manager reset');
    }

    // Execute custom cleanup callbacks
    this.executeCleanupCallbacks();

    // Verify cleanup was successful
    this.verifyCleanup(stateBefore, 'game');

    console.log('🧹 Game cleanup complete');
  }

  /**
   * Utility: Safely destroy a Graphics object
   */
  public static destroyGraphics(graphics: Graphics | null | undefined): void {
    if (!graphics) {
      return;
    }

    try {
      if (graphics.parent) {
        graphics.parent.removeChild(graphics);
      }
      graphics.destroy();
    } catch (error) {
      console.error('Error destroying graphics:', error);
    }
  }

  /**
   * Utility: Safely destroy a Container and all its children
   */
  public static destroyContainer(container: Container | null | undefined): void {
    if (!container) {
      return;
    }

    try {
      // Destroy all children first
      while (container.children.length > 0) {
        const child = container.children[0];
        container.removeChild(child);
        if ('destroy' in child && typeof child.destroy === 'function') {
          child.destroy();
        }
      }

      // Destroy the container itself
      if (container.parent) {
        container.parent.removeChild(container);
      }
      container.destroy();
    } catch (error) {
      console.error('Error destroying container:', error);
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
      persistentEffects: this.persistentEffects.size,
      cleanupCallbacks: this.cleanupCallbacks.size,
      effectTimers: EffectCleanupManager.getCounts(),
    };
  }

  /**
   * Log current state for debugging
   */
  public static logState(): void {
    const state = this.getState();
    console.log('🔍 ResourceCleanupManager State:', state);

    if (state.persistentEffects > 20) {
      console.warn('⚠️ High number of persistent effects - possible memory leak!');
    }

    if (state.effectTimers.intervals > 20 || state.effectTimers.timeouts > 20) {
      console.warn('⚠️ High number of effect timers - possible memory leak!');
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
    cleanupType: 'wave' | 'game'
  ): void {
    const stateAfter = this.getState();

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
      console.warn(`⚠️ ${cleanupType} cleanup verification failed:`);
      for (const issue of issues) {
        console.warn(`  - ${issue}`);
      }

      // Attempt forced cleanup
      console.warn('🔧 Attempting forced cleanup...');
      this.forceCleanup();

      // Verify forced cleanup worked
      const stateAfterForced = this.getState();
      if (
        stateAfterForced.persistentEffects === 0 &&
        stateAfterForced.effectTimers.intervals === 0 &&
        stateAfterForced.effectTimers.timeouts === 0
      ) {
        console.log('✅ Forced cleanup successful');
      } else {
        console.error('❌ Forced cleanup failed - manual intervention required');
        console.error('Final state:', stateAfterForced);
      }
    } else {
      console.log(
        `✅ ${cleanupType} cleanup verified: ${stateBefore.persistentEffects} effects, ${stateBefore.effectTimers.intervals} intervals, ${stateBefore.effectTimers.timeouts} timeouts removed`
      );
    }
  }

  /**
   * Force cleanup of all resources (fallback for stuck resources)
   * This is more aggressive than normal cleanup and should only be used
   * when normal cleanup fails
   */
  public static forceCleanup(): void {
    console.log('🔧 Force cleanup initiated...');

    // Force clear all timers
    EffectCleanupManager.clearAll();

    // Force destroy all persistent effects (even if already destroyed)
    let forcedCount = 0;
    for (const effect of this.persistentEffects) {
      try {
        if (!effect.graphics.destroyed) {
          if (effect.graphics.parent) {
            effect.graphics.parent.removeChild(effect.graphics);
          }
          effect.graphics.destroy();
          forcedCount++;
        }
      } catch (error) {
        console.error('Error in force cleanup:', error);
      }
    }
    this.persistentEffects.clear();

    if (forcedCount > 0) {
      console.log(`🔧 Force destroyed ${forcedCount} stuck effects`);
    }

    // Clear all callbacks
    this.cleanupCallbacks.clear();

    console.log('🔧 Force cleanup complete');
  }

  /**
   * Clear all tracked resources (for testing/debugging)
   */
  public static clearAll(): void {
    this.cleanupPersistentEffects();
    this.cleanupCallbacks.clear();
    EffectCleanupManager.clearAll();
  }
}
