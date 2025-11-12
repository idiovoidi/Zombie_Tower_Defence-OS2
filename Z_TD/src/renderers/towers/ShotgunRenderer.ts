import { Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';
import { EffectCleanupManager } from '@/utils/EffectCleanupManager';

export class ShotgunRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Graphics, _type: string, upgradeLevel: number): void {
    visual.clear();
    const bunkerWidth = 36 + upgradeLevel * 4;

    // Render base structure based on upgrade level
    if (upgradeLevel <= 2) {
      this.renderSandbagWall(visual, bunkerWidth);
    } else if (upgradeLevel <= 4) {
      this.renderReinforcedBunker(visual, bunkerWidth);
    } else {
      this.renderHeavyBunker(visual, bunkerWidth);
    }

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render barrel/character
    this.renderBarrel(barrel, upgradeLevel);
  }

  private renderSandbagWall(visual: Graphics, bunkerWidth: number): void {
    // Level 1-2: Sandbag wall
    visual.roundRect(-bunkerWidth / 2, -8, bunkerWidth, 28, 8).fill(0x8b7355); // Sandbags
    visual.stroke({ width: 2, color: 0x654321 });
    // Sandbag texture
    for (let x = -bunkerWidth / 2 + 5; x < bunkerWidth / 2; x += 8) {
      visual.roundRect(x, -5, 7, 10, 2).fill({ color: 0x654321, alpha: 0.3 });
      visual.roundRect(x, 5, 7, 10, 2).fill({ color: 0x654321, alpha: 0.3 });
    }
    // Firing gap
    visual.rect(-8, 0, 16, 6).fill(0x4a4a4a);
  }

  private renderReinforcedBunker(visual: Graphics, bunkerWidth: number): void {
    // Level 3-4: Reinforced bunker with metal
    visual.roundRect(-bunkerWidth / 2, -8, bunkerWidth, 28, 8).fill(0x5a5a5a); // Metal
    visual.stroke({ width: 2, color: 0x3a3a3a });
    // Metal panels
    visual.rect(-bunkerWidth / 2 + 4, -5, bunkerWidth / 2 - 12, 10).fill(0x4a4a4a);
    visual.rect(8, -5, bunkerWidth / 2 - 12, 10).fill(0x4a4a4a);
    // Sandbags on top
    for (let i = 0; i < 4; i++) {
      const x = -bunkerWidth / 2 + 10 + (i * (bunkerWidth - 20)) / 3;
      visual.roundRect(x, -10, 8, 6, 2).fill(0x8b7355);
    }
    // Firing slit
    visual.rect(-10, 0, 20, 5).fill(0x2a2a2a);
  }

  private renderHeavyBunker(visual: Graphics, bunkerWidth: number): void {
    // Level 5: Heavy fortified bunker
    visual.roundRect(-bunkerWidth / 2, -8, bunkerWidth, 28, 8).fill(0x4a4a4a); // Dark metal
    visual.stroke({ width: 3, color: 0x2a2a2a });
    // Armored plates
    visual.rect(-bunkerWidth / 2 + 4, -5, bunkerWidth / 2 - 12, 12).fill(0x3a3a3a);
    visual.rect(8, -5, bunkerWidth / 2 - 12, 12).fill(0x3a3a3a);
    // Caution stripes
    visual.rect(-bunkerWidth / 2, -8, 6, 28).fill({ color: 0xffcc00, alpha: 0.4 });
    visual.rect(bunkerWidth / 2 - 6, -8, 6, 28).fill({ color: 0xffcc00, alpha: 0.4 });
    // Heavy rivets
    for (let x = -bunkerWidth / 2 + 8; x < bunkerWidth / 2; x += 8) {
      visual.circle(x, -5, 2).fill(0x6a6a6a);
      visual.circle(x, 15, 2).fill(0x6a6a6a);
    }
    // Reinforced firing port
    visual.rect(-10, 0, 20, 5).fill(0x1a1a1a);
    visual.stroke({ width: 2, color: 0xffcc00 });
  }

  private renderBarrel(barrel: Graphics, upgradeLevel: number): void {
    barrel.clear();

    // Body - armor improves
    let bodyColor = 0x654321; // Brown
    if (upgradeLevel >= 3) {
      bodyColor = 0x4a4a4a; // Gray armor
    }
    if (upgradeLevel >= 5) {
      bodyColor = 0x2a2a2a; // Heavy armor
    }

    // Render character body
    barrel.rect(-3, -11, 6, 8).fill(bodyColor);
    // Arms
    barrel.rect(-4, -9, 2, 4).fill(0xffdbac);
    barrel.rect(2, -9, 2, 4).fill(0xffdbac);
    // Shotgun - gets wider
    const barrelWidth = 2 + upgradeLevel * 0.3;
    barrel.rect(-3, -8, barrelWidth, 8).fill(0xa0522d);
    barrel.rect(1, -8, barrelWidth, 8).fill(0xa0522d);
    // Head
    barrel.circle(0, -16, 5).fill(0xffdbac);
    barrel.stroke({ width: 1, color: 0x000000 });

    // Headgear
    if (upgradeLevel <= 2) {
      // Basic cap
      barrel.rect(-5, -19, 10, 3).fill(0x654321);
    } else if (upgradeLevel <= 4) {
      // Tactical helmet
      barrel.rect(-5, -19, 10, 3).fill(0x4a4a4a);
      barrel.circle(0, -18, 4).fill(0x4a4a4a);
    } else {
      // Full combat helmet with visor
      barrel.circle(0, -18, 5).fill(0x2a2a2a);
      barrel.rect(-2, -19, 4, 1).fill(0x8b8b8b);
    }
  }

  public renderShootingEffect(barrel: Graphics, _type: string, _upgradeLevel: number): void {
    const flash = new Graphics();

    // Shotgun starts at -8, extends down by 8
    // Shotgun tip is at -8 + 8 = 0
    const shotgunTip = -8 + 8;
    flash.circle(-2, shotgunTip, 5).fill(0xffff00);
    flash.circle(2, shotgunTip, 5).fill(0xffff00);

    barrel.addChild(flash);

    // Apply recoil animation
    const originalY = barrel.y;
    barrel.y = 2;

    // Reset after a short delay (tracked to prevent memory leaks)
    EffectCleanupManager.registerTimeout(
      setTimeout(() => {
        if (barrel && !barrel.destroyed) {
          barrel.removeChild(flash);
          flash.destroy();
          // Return to original position
          barrel.y = originalY;
        }
      }, 100)
    );
  }
}
