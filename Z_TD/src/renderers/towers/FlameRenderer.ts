import { Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';
import { EffectCleanupManager } from '@/utils/EffectCleanupManager';

export class FlameRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Graphics, _type: string, upgradeLevel: number): void {
    visual.clear();
    const towerSize = 18 + upgradeLevel * 2;

    // Render base structure based on upgrade level
    if (upgradeLevel <= 2) {
      this.renderMakeshiftPlatform(visual, towerSize);
    } else if (upgradeLevel <= 4) {
      this.renderReinforcedStation(visual, towerSize);
    } else {
      this.renderMilitaryIncinerator(visual, towerSize);
    }

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render barrel/character
    this.renderBarrel(barrel, upgradeLevel);
  }

  private renderMakeshiftPlatform(visual: Graphics, towerSize: number): void {
    // Level 1-2: Makeshift barrel platform
    visual.circle(0, 5, towerSize).fill(0x8b4513); // Wood platform
    visual.stroke({ width: 2, color: 0x654321 });
    // Oil barrels
    visual.rect(-8, -5, 6, 12).fill(0x4a4a4a);
    visual.rect(2, -5, 6, 12).fill(0x4a4a4a);
    // Barrel bands
    visual.rect(-8, -2, 6, 2).fill(0x5a5a5a);
    visual.rect(2, -2, 6, 2).fill(0x5a5a5a);
    // Warning paint
    visual.circle(-5, 0, 3).fill({ color: 0xff4500, alpha: 0.7 });
    visual.circle(5, 0, 3).fill({ color: 0xff4500, alpha: 0.7 });
  }

  private renderReinforcedStation(visual: Graphics, towerSize: number): void {
    // Level 3-4: Reinforced fuel station
    visual.circle(0, 5, towerSize).fill(0x5a5a5a); // Metal platform
    visual.stroke({ width: 2, color: 0x3a3a3a });
    // Fuel tanks
    visual.circle(0, 0, 10).fill(0xff4500);
    visual.stroke({ width: 2, color: 0x8b0000 });
    // Heat vents
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = Math.cos(angle) * (towerSize - 5);
      const y = 5 + Math.sin(angle) * (towerSize - 5);
      visual.rect(x - 1.5, y, 3, 6).fill(0x8b0000);
    }
    // Caution stripes
    for (let i = 0; i < 8; i += 2) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * towerSize;
      const y = 5 + Math.sin(angle) * towerSize;
      visual.circle(x, y, 3).fill(0xffcc00);
    }
  }

  private renderMilitaryIncinerator(visual: Graphics, towerSize: number): void {
    // Level 5: Military incinerator unit
    visual.circle(0, 5, towerSize).fill(0x4a4a4a); // Dark metal
    visual.stroke({ width: 3, color: 0x2a2a2a });
    // Armored fuel core
    visual.circle(0, 0, 12).fill(0xff4500);
    visual.stroke({ width: 3, color: 0x8b0000 });
    // Advanced vents
    const ventCount = 6;
    for (let i = 0; i < ventCount; i++) {
      const angle = (i / ventCount) * Math.PI * 2;
      const x = Math.cos(angle) * (towerSize - 5);
      const y = 5 + Math.sin(angle) * (towerSize - 5);
      visual.rect(x - 2, y, 4, 8).fill(0x8b0000);
      visual.stroke({ width: 1, color: 0xff4500 });
    }
    // Caution markings
    visual.circle(0, -10, 8).fill({ color: 0xffcc00, alpha: 0.5 });
    visual.circle(0, -10, 6).fill({ color: 0xff0000, alpha: 0.5 });
  }

  private renderBarrel(barrel: Graphics, upgradeLevel: number): void {
    barrel.clear();

    // Body - protective gear improves
    let suitColor = 0x654321; // Brown clothes
    if (upgradeLevel >= 3) {
      suitColor = 0xff4500; // Fire suit
    }
    if (upgradeLevel >= 5) {
      suitColor = 0xff6347; // Advanced suit
    }

    // Render character body
    barrel.rect(-3, -13, 6, 8).fill(suitColor);
    // Arms
    const armColor = upgradeLevel >= 3 ? 0xff4500 : 0xffdbac;
    barrel.rect(-4, -11, 2, 4).fill(armColor);
    barrel.rect(2, -11, 2, 4).fill(armColor);
    // Flamethrower - gets bigger
    const tankSize = 3 + upgradeLevel * 0.5;
    barrel.rect(-tankSize / 2, -10, tankSize, 8).fill(0xff0000);
    barrel.rect(-1, -11, 2, 6).fill(0x8b0000);
    // Head
    barrel.circle(0, -18, 5).fill(0xffdbac);
    barrel.stroke({ width: 1, color: 0x000000 });

    // Protective gear improves with level
    if (upgradeLevel <= 2) {
      // Bandana/goggles
      barrel.rect(-4, -19, 8, 2).fill(0x1a1a1a);
    } else if (upgradeLevel <= 4) {
      // Gas mask
      barrel.circle(0, -18, 4).fill(0x4a4a4a);
      barrel.circle(-2, -19, 1.5).fill(0x1a1a1a);
      barrel.circle(2, -19, 1.5).fill(0x1a1a1a);
      barrel.circle(0, -15, 2).fill(0x2a2a2a);
    } else {
      // Full hazmat helmet
      barrel.circle(0, -18, 5).fill(0xff4500);
      barrel.rect(-3, -19, 6, 3).fill({ color: 0x1a1a1a, alpha: 0.5 }); // Visor
    }
  }

  public renderShootingEffect(barrel: Graphics, _type: string, _upgradeLevel: number): void {
    const flash = new Graphics();

    // Flamethrower starts at -10, extends down by 6
    // Nozzle tip is at -10 + 6 = -4
    const flameTip = -10 + 6;

    // Hot core (white/yellow)
    flash.circle(0, flameTip, 4).fill({ color: 0xffffff, alpha: 0.9 });
    flash.circle(0, flameTip, 6).fill({ color: 0xffff00, alpha: 0.8 });
    // Orange middle layer
    flash.circle(0, flameTip + 2, 8).fill({ color: 0xffa500, alpha: 0.7 });
    // Red outer layer
    flash.circle(0, flameTip + 4, 10).fill({ color: 0xff4500, alpha: 0.6 });
    // Flame particles bursting out
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = 8 + Math.random() * 4;
      const particleX = Math.cos(angle) * dist;
      const particleY = flameTip + Math.sin(angle) * dist;
      const particleSize = 2 + Math.random() * 3;
      const particleColor = Math.random() > 0.5 ? 0xff6347 : 0xff8c00;
      flash.circle(particleX, particleY, particleSize).fill({ color: particleColor, alpha: 0.8 });
    }
    // Smoke puff
    flash.circle(0, flameTip + 8, 6).fill({ color: 0x4a4a4a, alpha: 0.4 });

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
