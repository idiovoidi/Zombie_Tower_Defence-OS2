import type { Graphics } from 'pixi.js';
import type { ITowerRenderer } from './ITowerRenderer';

/**
 * Base class for tower renderers
 * Provides shared helper methods for all tower renderers
 */
export abstract class BaseTowerRenderer implements ITowerRenderer {
  abstract render(visual: Graphics, barrel: Graphics, type: string, upgradeLevel: number): void;

  abstract renderShootingEffect(barrel: Graphics, type: string, upgradeLevel: number): void;

  /**
   * Helper method to add upgrade stars above the tower
   * @param visual - The visual Graphics container
   * @param upgradeLevel - Current upgrade level (1-5)
   */
  protected addUpgradeStars(visual: Graphics, upgradeLevel: number): void {
    if (upgradeLevel <= 1) {
      return;
    }

    const starCount = Math.min(upgradeLevel - 1, 5);
    const starSize = 3;
    const spacing = 8;
    const startX = (-(starCount - 1) * spacing) / 2;

    for (let i = 0; i < starCount; i++) {
      const x = startX + i * spacing;
      const y = -30;

      // Draw a simple star
      visual
        .moveTo(x, y - starSize)
        .lineTo(x + starSize * 0.3, y - starSize * 0.3)
        .lineTo(x + starSize, y)
        .lineTo(x + starSize * 0.3, y + starSize * 0.3)
        .lineTo(x, y + starSize)
        .lineTo(x - starSize * 0.3, y + starSize * 0.3)
        .lineTo(x - starSize, y)
        .lineTo(x - starSize * 0.3, y - starSize * 0.3)
        .lineTo(x, y - starSize)
        .fill(0xffd700); // Gold stars
    }
  }

  /**
   * Default destroy implementation
   * Override if renderer has specific cleanup needs
   */
  destroy(): void {
    // Override if renderer has specific cleanup needs
  }
}
