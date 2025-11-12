import { Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';
import { EffectCleanupManager } from '@/utils/EffectCleanupManager';

export class MachineGunRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Graphics, _type: string, upgradeLevel: number): void {
    visual.clear();
    const baseSize = 15 + upgradeLevel * 2;

    // Render base structure based on upgrade level
    if (upgradeLevel <= 2) {
      this.renderWoodenBase(visual, baseSize);
    } else if (upgradeLevel <= 4) {
      this.renderReinforcedBase(visual, baseSize);
    } else {
      this.renderMilitaryBase(visual, baseSize);
    }

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render barrel/character
    this.renderBarrel(barrel, upgradeLevel);
  }

  private renderWoodenBase(visual: Graphics, baseSize: number): void {
    // Level 1-2: Wooden barricade with sandbags
    visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x8b7355); // Wood base
    visual.stroke({ width: 2, color: 0x654321 });
    // Wood planks
    for (let i = -baseSize; i < baseSize; i += 6) {
      visual.moveTo(i, -5).lineTo(i, 20).stroke({ width: 1, color: 0x654321, alpha: 0.3 });
    }
    // Sandbags
    visual.roundRect(-12, 12, 10, 6, 2).fill(0x8b7355);
    visual.roundRect(2, 12, 10, 6, 2).fill(0x8b7355);
  }

  private renderReinforcedBase(visual: Graphics, baseSize: number): void {
    // Level 3-4: Reinforced position with metal plates
    visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x5a5a5a); // Metal base
    visual.stroke({ width: 2, color: 0x3a3a3a });
    // Metal panels
    visual.rect(-baseSize + 2, -3, baseSize - 4, 10).fill(0x4a4a4a);
    visual.rect(4, -3, baseSize - 4, 10).fill(0x4a4a4a);
    // Rivets
    for (let x = -baseSize + 5; x < baseSize; x += 8) {
      visual.circle(x, 0, 1.5).fill(0x6a6a6a);
      visual.circle(x, 15, 1.5).fill(0x6a6a6a);
    }
  }

  private renderMilitaryBase(visual: Graphics, baseSize: number): void {
    // Level 5: Military fortification
    visual.rect(-baseSize, -5, baseSize * 2, 25).fill(0x4a4a4a); // Dark metal
    visual.stroke({ width: 3, color: 0x2a2a2a });
    // Armored plates
    visual.rect(-baseSize + 2, -3, baseSize - 4, 10).fill(0x3a3a3a);
    visual.rect(4, -3, baseSize - 4, 10).fill(0x3a3a3a);
    // Caution stripes
    visual.rect(-baseSize, -5, 4, 25).fill({ color: 0xffcc00, alpha: 0.5 });
    visual.rect(baseSize - 4, -5, 4, 25).fill({ color: 0xffcc00, alpha: 0.5 });
    // Heavy rivets
    for (let x = -baseSize + 5; x < baseSize; x += 6) {
      visual.circle(x, 0, 2).fill(0x6a6a6a);
      visual.circle(x, 15, 2).fill(0x6a6a6a);
    }
  }

  private renderBarrel(barrel: Graphics, upgradeLevel: number): void {
    barrel.clear();

    // Body color improves with upgrades
    let bodyColor = 0x654321; // Brown civilian
    if (upgradeLevel >= 3) {
      bodyColor = 0x4a4a4a; // Gray tactical
    }
    if (upgradeLevel >= 5) {
      bodyColor = 0x2a2a2a; // Black military
    }

    // Render character body
    barrel.rect(-3, -13, 6, 8).fill(bodyColor);
    // Arms
    barrel.rect(-4, -11, 2, 4).fill(0xffdbac);
    barrel.rect(2, -11, 2, 4).fill(0xffdbac);
    // Gun - gets bigger with upgrades
    const gunLength = 8 + upgradeLevel;
    barrel.rect(-1, -10, 2, gunLength).fill(0x2f4f4f);
    barrel.rect(-2, -11, 4, 2).fill(0x2f4f4f);
    // Head
    barrel.circle(0, -18, 5).fill(0xffdbac);
    barrel.stroke({ width: 1, color: 0x000000 });

    // Headgear improves with level
    if (upgradeLevel <= 2) {
      // Bandana
      barrel.rect(-5, -21, 10, 2).fill(0x8b0000);
    } else if (upgradeLevel <= 4) {
      // Cap
      barrel.rect(-5, -21, 10, 3).fill(0x4a4a4a);
      barrel.rect(-3, -23, 6, 2).fill(0x4a4a4a);
    } else {
      // Military helmet
      barrel.circle(0, -20, 5).fill(0x2a2a2a);
      barrel.rect(-4, -21, 8, 2).fill(0x1a1a1a);
    }
  }

  public renderShootingEffect(barrel: Graphics, _type: string, upgradeLevel: number): void {
    const flash = new Graphics();

    // Gun starts at -10, extends down by gunLength (8 + upgradeLevel)
    // Gun tip is at -10 + gunLength = -2 to +3 depending on upgrade
    const mgGunLength = 8 + upgradeLevel;
    const mgGunTip = -10 + mgGunLength;

    // Enhanced muzzle flash - more realistic and subtle
    // Bright white core
    flash.circle(0, mgGunTip, 3).fill({ color: 0xffffff, alpha: 0.9 });
    // Yellow-orange glow
    flash.circle(0, mgGunTip, 5).fill({ color: 0xffcc00, alpha: 0.6 });
    // Outer orange fade
    flash.circle(0, mgGunTip, 7).fill({ color: 0xff9933, alpha: 0.3 });

    barrel.addChild(flash);

    // Apply recoil animation (little man recoils back slightly)
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
