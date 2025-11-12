import { Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';
import { EffectCleanupManager } from '@/utils/EffectCleanupManager';

export class TeslaRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Graphics, _type: string, upgradeLevel: number): void {
    visual.clear();
    const towerWidth = 32 + upgradeLevel * 3;

    // Render base structure based on upgrade level
    if (upgradeLevel <= 2) {
      this.renderScavengedTech(visual, towerWidth);
    } else if (upgradeLevel <= 4) {
      this.renderImprovedStation(visual, towerWidth);
    } else {
      this.renderAdvancedPlatform(visual, towerWidth);
    }

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render barrel/character
    this.renderBarrel(barrel, upgradeLevel);
  }

  private renderScavengedTech(visual: Graphics, towerWidth: number): void {
    // Level 1-2: Scavenged tech setup
    visual.rect(-towerWidth / 2, -5, towerWidth, 25).fill(0x5a5a5a); // Metal base
    visual.stroke({ width: 2, color: 0x3a3a3a });
    // Exposed wiring
    visual
      .moveTo(-towerWidth / 2 + 5, 0)
      .lineTo(towerWidth / 2 - 5, 0)
      .stroke({ width: 2, color: 0x00ced1 });
    visual
      .moveTo(-towerWidth / 2 + 5, 10)
      .lineTo(towerWidth / 2 - 5, 10)
      .stroke({ width: 2, color: 0x00ced1 });
    // Makeshift panels
    visual.rect(-12, 2, 8, 6).fill(0x4a4a4a);
    visual.rect(4, 2, 8, 6).fill(0x4a4a4a);
    // Basic indicators
    visual.circle(-8, 5, 2).fill(0x00ffff);
    visual.circle(8, 5, 2).fill(0x00ffff);
  }

  private renderImprovedStation(visual: Graphics, towerWidth: number): void {
    // Level 3-4: Improved tech station
    visual.rect(-towerWidth / 2, -5, towerWidth, 25).fill(0x00ced1); // Cyan base
    visual.stroke({ width: 2, color: 0x008b8b });
    // Tech panels
    visual.rect(-14, 0, 10, 8).fill(0x7fffd4);
    visual.rect(4, 0, 10, 8).fill(0x7fffd4);
    // Energy conduits
    for (let x = -towerWidth / 2 + 5; x < towerWidth / 2; x += 8) {
      visual.rect(x, -3, 2, 23).fill({ color: 0x00ffff, alpha: 0.3 });
    }
    // Multiple indicators
    for (let i = 0; i < 4; i++) {
      const x = -towerWidth / 2 + 10 + (i * (towerWidth - 20)) / 3;
      visual.circle(x, 3, 2).fill(0x00ffff);
    }
  }

  private renderAdvancedPlatform(visual: Graphics, towerWidth: number): void {
    // Level 5: Advanced energy weapon platform
    visual.rect(-towerWidth / 2, -5, towerWidth, 25).fill(0x00ced1); // Cyan
    visual.stroke({ width: 3, color: 0x008b8b });
    // Armored tech panels
    visual.rect(-14, -2, 10, 10).fill(0x7fffd4);
    visual.rect(4, -2, 10, 10).fill(0x7fffd4);
    // Energy grid
    for (let x = -towerWidth / 2 + 4; x < towerWidth / 2; x += 6) {
      visual.rect(x, -4, 2, 24).fill({ color: 0x00ffff, alpha: 0.4 });
    }
    // Advanced indicators
    const indicatorCount = 6;
    for (let i = 0; i < indicatorCount; i++) {
      const x = -towerWidth / 2 + 8 + (i * (towerWidth - 16)) / (indicatorCount - 1);
      visual.circle(x, 3, 2.5).fill(0x00ffff);
      visual.circle(x, 3, 1.5).fill(0xffffff);
    }
    // Caution markings
    visual.rect(-towerWidth / 2, -5, 4, 25).fill({ color: 0xffcc00, alpha: 0.3 });
    visual.rect(towerWidth / 2 - 4, -5, 4, 25).fill({ color: 0xffcc00, alpha: 0.3 });
  }

  private renderBarrel(barrel: Graphics, upgradeLevel: number): void {
    barrel.clear();

    // Body - tech suit improves
    let suitColor = 0x4a4a4a; // Gray
    if (upgradeLevel >= 3) {
      suitColor = 0x00ced1; // Cyan suit
    }
    if (upgradeLevel >= 5) {
      suitColor = 0x00ffff; // Glowing suit
    }

    // Render character body
    barrel.rect(-3, -13, 6, 8).fill(suitColor);
    // Arms
    const armColor = upgradeLevel >= 3 ? 0x00ced1 : 0xffdbac;
    barrel.rect(-4, -11, 2, 4).fill(armColor);
    barrel.rect(2, -11, 2, 4).fill(armColor);
    // Tesla coil gun - gets bigger
    const coilSize = 3 + upgradeLevel * 0.5;
    barrel.circle(0, -10, coilSize).fill(0x7fffd4);
    barrel.rect(-2, -10, 4, 7).fill(0x00bfff);
    // Electric arcs
    for (let i = 0; i < Math.min(upgradeLevel, 3); i++) {
      const offset = i * 2;
      barrel
        .moveTo(-2, -8 + offset)
        .lineTo(2, -6 + offset)
        .stroke({ width: 1, color: 0xffffff });
    }
    // Head
    barrel.circle(0, -18, 5).fill(0xffdbac);
    barrel.stroke({ width: 1, color: 0x000000 });

    // Tech gear improves with level
    if (upgradeLevel <= 2) {
      // Basic goggles
      barrel.rect(-4, -19, 8, 2).fill(0x4a4a4a);
    } else if (upgradeLevel <= 4) {
      // Tech visor
      barrel.rect(-4, -19, 8, 3).fill(0x00ffff);
      barrel.rect(-4, -19, 8, 3).fill({ color: 0x00ffff, alpha: 0.5 });
    } else {
      // Full tech helmet
      barrel.circle(0, -18, 5).fill(0x00ced1);
      barrel.rect(-4, -19, 8, 3).fill({ color: 0x00ffff, alpha: 0.7 });
      barrel.rect(-5, -21, 2, 4).fill(0x00ced1);
      barrel.rect(3, -21, 2, 4).fill(0x00ced1);
    }
  }

  public renderShootingEffect(barrel: Graphics, _type: string, _upgradeLevel: number): void {
    const flash = new Graphics();

    // Tesla gun starts at -10, extends down by 7
    // Gun tip is at -10 + 7 = -3
    const teslaTip = -10 + 7;

    // Electric discharge effect (bright cyan core)
    flash.circle(0, teslaTip, 8).fill({ color: 0x00ffff, alpha: 0.9 });
    flash.circle(0, teslaTip, 5).fill({ color: 0xffffff, alpha: 0.8 });
    // Outer glow
    flash.circle(0, teslaTip, 12).fill({ color: 0x00ffff, alpha: 0.4 });
    // Electric sparks radiating outward
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const sparkLength = 6 + Math.random() * 4;
      const endX = Math.cos(angle) * sparkLength;
      const endY = teslaTip + Math.sin(angle) * sparkLength;
      flash
        .moveTo(0, teslaTip)
        .lineTo(endX, endY)
        .stroke({ width: 2, color: 0xffffff, alpha: 0.8 });
    }

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
