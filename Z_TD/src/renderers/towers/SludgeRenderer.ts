import { Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';
import { EffectCleanupManager } from '@/utils/EffectCleanupManager';

export class SludgeRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Graphics, _type: string, upgradeLevel: number): void {
    visual.clear();
    const towerSize = 18 + upgradeLevel * 2;

    // Render base structure based on upgrade level
    if (upgradeLevel <= 2) {
      this.renderMakeshiftBase(visual, towerSize);
    } else if (upgradeLevel <= 4) {
      this.renderIndustrialBase(visual, towerSize);
    } else {
      this.renderMilitaryBase(visual, towerSize);
    }

    // Add upgrade stars
    this.addUpgradeStars(visual, upgradeLevel);

    // Render barrel/character
    this.renderBarrel(barrel, upgradeLevel);
  }

  private renderMakeshiftBase(visual: Graphics, towerSize: number): void {
    // Level 1-2: Makeshift toxic barrel platform
    visual.rect(-towerSize, -5, towerSize * 2, 25).fill(0x4a5a3a); // Dirty green
    visual.stroke({ width: 2, color: 0x3a4a2a });
    // Toxic barrels
    visual.rect(-10, 0, 8, 12).fill(0x228b22);
    visual.rect(2, 0, 8, 12).fill(0x228b22);
    // Barrel bands
    visual.rect(-10, 3, 8, 2).fill(0x1a6b1a);
    visual.rect(2, 3, 8, 2).fill(0x1a6b1a);
    // Toxic symbols
    visual.circle(-6, 6, 2).fill({ color: 0x00ff00, alpha: 0.7 });
    visual.circle(6, 6, 2).fill({ color: 0x00ff00, alpha: 0.7 });
    // Drips
    visual.circle(-6, 13, 1.5).fill({ color: 0x32cd32, alpha: 0.6 });
    visual.circle(6, 13, 1.5).fill({ color: 0x32cd32, alpha: 0.6 });
  }

  private renderIndustrialBase(visual: Graphics, towerSize: number): void {
    // Level 3-4: Industrial toxic storage
    visual.rect(-towerSize, -5, towerSize * 2, 25).fill(0x3a4a2a); // Dark green
    visual.stroke({ width: 2, color: 0x2a3a1a });
    // Reinforced tanks
    visual.circle(-6, 5, 8).fill(0x228b22);
    visual.circle(6, 5, 8).fill(0x228b22);
    // Hazard stripes
    for (let i = 0; i < 3; i++) {
      const x = -towerSize + 5 + i * 12;
      visual.rect(x, -3, 4, 23).fill({ color: 0xffff00, alpha: 0.4 });
    }
    // Biohazard symbols
    visual.circle(-6, 5, 4).fill({ color: 0x00ff00, alpha: 0.8 });
    visual.circle(6, 5, 4).fill({ color: 0x00ff00, alpha: 0.8 });
    // Toxic glow
    visual.circle(-6, 5, 6).fill({ color: 0x32cd32, alpha: 0.3 });
    visual.circle(6, 5, 6).fill({ color: 0x32cd32, alpha: 0.3 });
  }

  private renderMilitaryBase(visual: Graphics, towerSize: number): void {
    // Level 5: Military hazmat facility
    visual.rect(-towerSize, -5, towerSize * 2, 25).fill(0x2a3a1a); // Military green
    visual.stroke({ width: 3, color: 0x1a2a0a });
    // Armored containment
    visual.circle(-6, 5, 9).fill(0x1a6b1a);
    visual.circle(6, 5, 9).fill(0x1a6b1a);
    // Heavy hazard markings
    visual.rect(-towerSize, -5, 6, 25).fill({ color: 0xffff00, alpha: 0.5 });
    visual.rect(towerSize - 6, -5, 6, 25).fill({ color: 0xffff00, alpha: 0.5 });
    // Biohazard warning
    visual.circle(0, 5, 8).fill({ color: 0x00ff00, alpha: 0.6 });
    visual.circle(0, 5, 5).fill({ color: 0x32cd32, alpha: 0.8 });
    // Toxic glow effect
    visual.circle(-6, 5, 10).fill({ color: 0x32cd32, alpha: 0.2 });
    visual.circle(6, 5, 10).fill({ color: 0x32cd32, alpha: 0.2 });
  }

  private renderBarrel(barrel: Graphics, upgradeLevel: number): void {
    barrel.clear();

    // Body - hazmat suit improves
    let suitColor = 0x654321; // Brown clothes
    if (upgradeLevel >= 3) {
      suitColor = 0xffff00; // Yellow hazmat
    }
    if (upgradeLevel >= 5) {
      suitColor = 0x32cd32; // Advanced hazmat
    }
    barrel.rect(-3, -13, 6, 8).fill(suitColor);

    // Arms
    const armColor = upgradeLevel >= 3 ? suitColor : 0xffdbac;
    barrel.rect(-4, -11, 2, 4).fill(armColor);
    barrel.rect(2, -11, 2, 4).fill(armColor);

    // Sludge launcher - barrel style
    const barrelSize = 4 + upgradeLevel * 0.4;
    barrel.rect(-barrelSize / 2, -10, barrelSize, 10).fill(0x228b22);
    barrel.rect(-barrelSize / 2 - 1, -11, barrelSize + 2, 2).fill(0x1a6b1a);

    // Toxic drip
    barrel.circle(0, 1, 1.5).fill({ color: 0x32cd32, alpha: 0.7 });

    // Head
    barrel.circle(0, -18, 5).fill(0xffdbac);
    barrel.stroke({ width: 1, color: 0x000000 });

    // Protective gear
    if (upgradeLevel <= 2) {
      // Gas mask
      barrel.circle(0, -18, 4).fill(0x4a4a4a);
      barrel.circle(-2, -19, 1.5).fill(0x1a1a1a);
      barrel.circle(2, -19, 1.5).fill(0x1a1a1a);
    } else if (upgradeLevel <= 4) {
      // Full hazmat hood
      barrel.circle(0, -18, 5).fill(0xffff00);
      barrel.rect(-3, -19, 6, 3).fill({ color: 0x1a1a1a, alpha: 0.4 }); // Visor
    } else {
      // Advanced sealed helmet
      barrel.circle(0, -18, 5).fill(0x32cd32);
      barrel.rect(-3, -19, 6, 3).fill({ color: 0x00ff00, alpha: 0.5 }); // Glowing visor
      barrel.circle(-3, -20, 1).fill(0x00ff00); // Indicator lights
      barrel.circle(3, -20, 1).fill(0x00ff00);
    }
  }

  public renderShootingEffect(barrel: Graphics, _type: string, _upgradeLevel: number): void {
    const flash = new Graphics();

    // Sludge launcher - toxic splash
    const sludgeTip = -8;
    // Toxic green splash
    flash.circle(0, sludgeTip, 4).fill({ color: 0x32cd32, alpha: 0.9 });
    flash.circle(0, sludgeTip, 6).fill({ color: 0x00ff00, alpha: 0.7 });
    flash.circle(0, sludgeTip, 9).fill({ color: 0x228b22, alpha: 0.5 });
    // Toxic drips
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const dist = 5 + Math.random() * 3;
      const dropX = Math.cos(angle) * dist;
      const dropY = sludgeTip + Math.sin(angle) * dist;
      flash.circle(dropX, dropY, 1.5).fill({ color: 0x32cd32, alpha: 0.8 });
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
