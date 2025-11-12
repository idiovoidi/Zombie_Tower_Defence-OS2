import { Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';
import { EffectCleanupManager } from '@/utils/EffectCleanupManager';

export class GrenadeRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Graphics, _type: string, upgradeLevel: number): void {
    visual.clear();
    const towerSize = 20 + upgradeLevel * 2;

    // Render base structure based on upgrade level
    if (upgradeLevel <= 2) {
      this.renderMakeshiftBase(visual, towerSize);
    } else if (upgradeLevel <= 4) {
      this.renderReinforcedBase(visual, towerSize);
    } else {
      this.renderMilitaryBase(visual, towerSize);
    }

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render barrel/character
    this.renderBarrel(barrel, upgradeLevel);
  }

  private renderMakeshiftBase(visual: Graphics, towerSize: number): void {
    // Level 1-2: Makeshift mortar/launcher
    visual.rect(-towerSize, -5, towerSize * 2, 25).fill(0x6b8e23); // Olive drab
    visual.stroke({ width: 2, color: 0x556b2f });
    // Ammo crates
    visual.rect(-12, 2, 10, 8).fill(0x8b7355);
    visual.rect(2, 2, 10, 8).fill(0x8b7355);
    // Grenade symbols
    visual.circle(-7, 6, 2).fill(0x2f4f2f);
    visual.circle(7, 6, 2).fill(0x2f4f2f);
  }

  private renderReinforcedBase(visual: Graphics, towerSize: number): void {
    // Level 3-4: Reinforced launcher platform
    visual.rect(-towerSize, -5, towerSize * 2, 25).fill(0x556b2f); // Dark olive
    visual.stroke({ width: 2, color: 0x3a4a1f });
    // Metal ammo boxes
    visual.rect(-14, 0, 12, 10).fill(0x4a4a4a);
    visual.rect(2, 0, 12, 10).fill(0x4a4a4a);
    // Warning stripes
    for (let i = 0; i < 3; i++) {
      const x = -towerSize + 5 + i * 10;
      visual.rect(x, -3, 4, 23).fill({ color: 0xffcc00, alpha: 0.3 });
    }
  }

  private renderMilitaryBase(visual: Graphics, towerSize: number): void {
    // Level 5: Military grenade launcher
    visual.rect(-towerSize, -5, towerSize * 2, 25).fill(0x3a4a1f); // Military green
    visual.stroke({ width: 3, color: 0x2a3a0f });
    // Armored ammo storage
    visual.rect(-14, -2, 12, 12).fill(0x2a2a2a);
    visual.rect(2, -2, 12, 12).fill(0x2a2a2a);
    // Caution markings
    visual.rect(-towerSize, -5, 6, 25).fill({ color: 0xffcc00, alpha: 0.4 });
    visual.rect(towerSize - 6, -5, 6, 25).fill({ color: 0xffcc00, alpha: 0.4 });
    // Explosive warning
    visual.circle(0, 5, 6).fill({ color: 0xff6600, alpha: 0.5 });
  }

  private renderBarrel(barrel: Graphics, upgradeLevel: number): void {
    barrel.clear();

    // Body - tactical gear
    let bodyColor = 0x6b8e23; // Olive
    if (upgradeLevel >= 3) {
      bodyColor = 0x556b2f; // Dark olive
    }
    if (upgradeLevel >= 5) {
      bodyColor = 0x3a4a1f; // Military green
    }
    barrel.rect(-3, -13, 6, 8).fill(bodyColor);

    // Arms
    const armColor = upgradeLevel >= 3 ? 0x556b2f : 0xffdbac;
    barrel.rect(-4, -11, 2, 4).fill(armColor);
    barrel.rect(2, -11, 2, 4).fill(armColor);

    // Grenade launcher - tube style
    const launcherSize = 3 + upgradeLevel * 0.3;
    barrel.rect(-launcherSize, -10, launcherSize * 2, 8).fill(0x2f4f2f);
    barrel.rect(-launcherSize - 1, -11, launcherSize * 2 + 2, 2).fill(0x1a1a1a);

    // Head
    barrel.circle(0, -18, 5).fill(0xffdbac);
    barrel.stroke({ width: 1, color: 0x000000 });

    // Headgear
    if (upgradeLevel <= 2) {
      // Basic helmet
      barrel.rect(-5, -21, 10, 3).fill(0x6b8e23);
    } else if (upgradeLevel <= 4) {
      // Tactical helmet
      barrel.circle(0, -20, 5).fill(0x556b2f);
      barrel.rect(-4, -21, 8, 2).fill(0x3a4a1f);
    } else {
      // Full combat helmet
      barrel.circle(0, -20, 5).fill(0x2a2a2a);
      barrel.rect(-3, -21, 6, 2).fill(0x1a1a1a);
    }
  }

  public renderShootingEffect(barrel: Graphics, _type: string, _upgradeLevel: number): void {
    const flash = new Graphics();

    // Grenade launcher - launch flash
    const launchTip = -8;
    // Bright orange/yellow launch flash
    flash.circle(0, launchTip, 5).fill({ color: 0xffaa00, alpha: 0.9 });
    flash.circle(0, launchTip, 8).fill({ color: 0xff8800, alpha: 0.6 });
    flash.circle(0, launchTip, 12).fill({ color: 0xff6600, alpha: 0.3 });
    // Smoke puff
    flash.circle(0, launchTip + 5, 8).fill({ color: 0x6a6a6a, alpha: 0.5 });

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
