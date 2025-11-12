import { Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';
import { EffectCleanupManager } from '@/utils/EffectCleanupManager';

export class SniperRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Graphics, _type: string, upgradeLevel: number): void {
    visual.clear();
    const towerHeight = 30 + upgradeLevel * 3;

    // Render base structure based on upgrade level
    if (upgradeLevel <= 2) {
      this.renderWoodenPlatform(visual, towerHeight);
    } else if (upgradeLevel <= 4) {
      this.renderReinforcedWatchtower(visual, towerHeight);
    } else {
      this.renderMilitaryObservationTower(visual, towerHeight);
    }

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render barrel/character
    this.renderBarrel(barrel, upgradeLevel);
  }

  private renderWoodenPlatform(visual: Graphics, towerHeight: number): void {
    // Level 1-2: Wooden platform/treehouse style
    visual.rect(-12, -10, 24, towerHeight).fill(0x8b7355); // Wood
    visual.stroke({ width: 2, color: 0x654321 });
    // Wood planks
    for (let y = -10; y < towerHeight - 10; y += 5) {
      visual.moveTo(-12, y).lineTo(12, y).stroke({ width: 1, color: 0x654321, alpha: 0.3 });
    }
    // Wooden roof
    visual.moveTo(-12, -10).lineTo(0, -18).lineTo(12, -10).fill(0x654321);
    // Window
    visual.rect(-6, -5, 12, 6).fill(0x4a4a4a);
  }

  private renderReinforcedWatchtower(visual: Graphics, towerHeight: number): void {
    // Level 3-4: Reinforced watchtower
    visual.rect(-12, -10, 24, towerHeight).fill(0x5a5a5a); // Metal frame
    visual.stroke({ width: 2, color: 0x3a3a3a });
    // Cross braces
    visual
      .moveTo(-10, 0)
      .lineTo(10, towerHeight - 15)
      .stroke({ width: 2, color: 0x4a4a4a });
    visual
      .moveTo(10, 0)
      .lineTo(-10, towerHeight - 15)
      .stroke({ width: 2, color: 0x4a4a4a });
    // Metal roof
    visual.moveTo(-12, -10).lineTo(0, -18).lineTo(12, -10).fill(0x4a4a4a);
    // Firing slit
    visual.rect(-8, -5, 16, 4).fill(0x2a2a2a);
  }

  private renderMilitaryObservationTower(visual: Graphics, towerHeight: number): void {
    // Level 5: Military observation tower
    visual.rect(-12, -10, 24, towerHeight).fill(0x4a4a4a); // Dark metal
    visual.stroke({ width: 3, color: 0x2a2a2a });
    // Armored panels
    visual.rect(-10, -8, 20, 10).fill(0x3a3a3a);
    visual.rect(-10, 8, 20, 10).fill(0x3a3a3a);
    // Rivets
    for (let y = -5; y < towerHeight - 10; y += 8) {
      visual.circle(-10, y, 1.5).fill(0x6a6a6a);
      visual.circle(10, y, 1.5).fill(0x6a6a6a);
    }
    // Armored roof
    visual.moveTo(-12, -10).lineTo(0, -18).lineTo(12, -10).fill(0x2a2a2a);
    // Reinforced slit
    visual.rect(-8, -5, 16, 4).fill(0x1a1a1a);
    visual.stroke({ width: 2, color: 0xffcc00 });
  }

  private renderBarrel(barrel: Graphics, upgradeLevel: number): void {
    barrel.clear();

    // Body - camo improves
    let bodyColor = 0x654321; // Brown
    if (upgradeLevel >= 3) {
      bodyColor = 0x3a4a2a; // Camo green
    }
    if (upgradeLevel >= 5) {
      bodyColor = 0x1a1a1a; // Black ops
    }

    // Render character body
    barrel.rect(-3, -15, 6, 8).fill(bodyColor);
    // Arms
    barrel.rect(-4, -13, 2, 4).fill(0xffdbac);
    barrel.rect(2, -13, 2, 4).fill(0xffdbac);
    // Sniper rifle - gets longer
    const rifleLength = 12 + upgradeLevel * 2;
    barrel.rect(-1, -12, 2, rifleLength).fill(0x1a1a1a);
    barrel.circle(0, -13, 2 + upgradeLevel * 0.5).fill(0x1a1a1a); // Scope
    // Head
    barrel.circle(0, -20, 5).fill(0xffdbac);
    barrel.stroke({ width: 1, color: 0x000000 });

    // Headgear
    if (upgradeLevel <= 2) {
      // Boonie hat
      barrel.circle(0, -23, 6).fill(0x654321);
      barrel.rect(-6, -21, 12, 1).fill(0x654321);
    } else if (upgradeLevel <= 4) {
      // Tactical cap with sunglasses
      barrel.rect(-5, -22, 10, 3).fill(0x3a4a2a);
      barrel.rect(-4, -20, 8, 2).fill(0x1a1a1a); // Sunglasses
    } else {
      // Full tactical helmet with visor
      barrel.circle(0, -20, 5).fill(0x1a1a1a);
      barrel.rect(-4, -20, 8, 2).fill(0x4a4a4a); // Visor
    }
  }

  public renderShootingEffect(barrel: Graphics, _type: string, upgradeLevel: number): void {
    const flash = new Graphics();

    // Rifle starts at -12, extends down by rifleLength (12 + upgradeLevel * 2)
    // Rifle tip is at -12 + rifleLength = 0 to +10 depending on upgrade
    const sniperRifleLength = 12 + upgradeLevel * 2;
    const sniperRifleTip = -12 + sniperRifleLength;

    // Enhanced sniper muzzle flash - larger and more dramatic
    flash.circle(0, sniperRifleTip, 5).fill({ color: 0xffffff, alpha: 1.0 });
    flash.circle(0, sniperRifleTip, 8).fill({ color: 0xffff00, alpha: 0.7 });
    flash.circle(0, sniperRifleTip, 12).fill({ color: 0xff9900, alpha: 0.4 });
    flash.circle(0, sniperRifleTip, 16).fill({ color: 0xff6600, alpha: 0.2 });

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
