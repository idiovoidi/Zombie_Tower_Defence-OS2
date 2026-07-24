import type { Zombie } from '../objects/Zombie';
import { GooCoatingEffect } from '../renderers/effects/GooCoatingEffect';
import type { SludgePoolEffect } from '../renderers/effects/SludgePoolEffect';
import type { ZombieSpatialQuery } from '../types/zombieSpatialQuery';

/**
 * SludgePoolManager - Manages sludge pool effects and zombie slow interactions
 *
 * Handles collision detection between zombies and sludge pools, applies slow effects,
 * and manages goo coating visual effects on slowed zombies.
 */
export class SludgePoolManager {
  private activePools: SludgePoolEffect[] = [];
  private zombieGooEffects: Map<Zombie, GooCoatingEffect> = new Map();

  /**
   * Add a new sludge pool to track
   */
  public addPool(pool: SludgePoolEffect): void {
    this.activePools.push(pool);
  }

  /**
   * Remove a sludge pool from tracking
   */
  public removePool(pool: SludgePoolEffect): void {
    const index = this.activePools.indexOf(pool);
    if (index > -1) {
      this.activePools.splice(index, 1);
    }
  }

  /**
   * Update sludge pool collisions and effects
   */
  public update(spatialQuery: ZombieSpatialQuery): void {
    // Clear all affected zombies from pools first
    for (const pool of this.activePools) {
      const poolData = pool.getPoolData();
      poolData.affectedZombies.clear();
    }

    // Query nearby zombies per pool via spatial grid (avoids O(zombies × pools))
    for (const pool of this.activePools) {
      const poolData = pool.getPoolData();
      const nearby = spatialQuery.queryZombiesInRadius(poolData.x, poolData.y, poolData.radius);

      for (const zombie of nearby) {
        zombie.applySlow(poolData.slowPercent);
        poolData.affectedZombies.add(zombie);
        this.applyGooCoating(zombie, poolData.slowPercent);
      }
    }

    // Remove goo effects from zombies that are no longer slowed
    this.cleanupGooEffects();
  }

  /**
   * Apply goo coating effect to a zombie
   */
  private applyGooCoating(zombie: Zombie, slowPercent: number): void {
    // Check if zombie already has goo effect
    if (!this.zombieGooEffects.has(zombie)) {
      const gooEffect = new GooCoatingEffect(slowPercent);

      // Position the goo effect to match the zombie's world position
      gooEffect.position.set(zombie.position.x, zombie.position.y);

      // Add the goo effect to the zombie's parent container (game world)
      // This ensures it appears over the zombie and can be properly masked
      if (zombie.parent) {
        zombie.parent.addChild(gooEffect);

        // Set a high zIndex to ensure it appears over the zombie
        gooEffect.zIndex = 1000;
      }

      // Store reference with position tracking
      this.zombieGooEffects.set(zombie, gooEffect);
    } else {
      // Update existing goo effect intensity
      const existingEffect = this.zombieGooEffects.get(zombie);
      if (existingEffect) {
        existingEffect.updateSlowPercent(slowPercent);
      }
    }
  }

  /**
   * Remove goo effects from zombies that are no longer slowed
   */
  private cleanupGooEffects(): void {
    const zombiesToRemove: Zombie[] = [];

    for (const [zombie, gooEffect] of this.zombieGooEffects) {
      // Update goo effect position to follow zombie
      if (zombie.parent && !zombie.getIsDying()) {
        gooEffect.position.set(zombie.position.x, zombie.position.y);
      }

      // Remove goo if zombie is not slowed or is dead/removed
      if (!zombie.isCurrentlySlowed() || !zombie.parent || zombie.getIsDying()) {
        gooEffect.destroy();
        zombiesToRemove.push(zombie);
      }
    }

    // Clean up the map
    for (const zombie of zombiesToRemove) {
      this.zombieGooEffects.delete(zombie);
    }
  }

  /**
   * Clear all sludge pools and effects
   */
  public clear(): void {
    // Destroy all goo effects
    for (const gooEffect of this.zombieGooEffects.values()) {
      gooEffect.destroy();
    }
    this.zombieGooEffects.clear();

    // Clear pool references
    this.activePools.length = 0;
  }

  /**
   * Get statistics about active effects
   */
  public getStats(): { activePools: number; gooEffects: number } {
    return {
      activePools: this.activePools.length,
      gooEffects: this.zombieGooEffects.size,
    };
  }
}
