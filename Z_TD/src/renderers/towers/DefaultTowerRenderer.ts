import { Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';

/**
 * Default fallback renderer for unknown tower types
 * Renders a simple placeholder visual
 */
export class DefaultTowerRenderer extends BaseTowerRenderer {
  render(visual: Graphics, barrel: Graphics, type: string, upgradeLevel: number): void {
    visual.clear();
    barrel.clear();

    const baseSize = 15 + upgradeLevel * 2;

    // Render simple placeholder base
    visual.rect(-baseSize, -baseSize, baseSize * 2, baseSize * 2).fill(0x808080);
    visual.stroke({ width: 2, color: 0x404040 });

    // Add question mark to indicate unknown type
    visual.circle(0, 0, baseSize * 0.6).fill(0xffff00);
    visual.stroke({ width: 1, color: 0xff0000 });

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render simple barrel
    barrel.rect(-2, -10, 4, 10).fill(0x606060);
  }

  renderShootingEffect(barrel: Graphics, _type: string, _upgradeLevel: number): void {
    // Simple flash effect for unknown tower types
    const flash = new Graphics();
    flash.circle(0, -10, 5).fill({ color: 0xffffff, alpha: 0.8 });
    barrel.addChild(flash);

    // Remove flash after short delay
    setTimeout(() => {
      if (barrel && !barrel.destroyed) {
        barrel.removeChild(flash);
        flash.destroy();
      }
    }, 100);
  }
}
