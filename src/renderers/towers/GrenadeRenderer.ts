import { Container, Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';

export class GrenadeRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Container, _type: string, upgradeLevel: number): void {
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

  private renderBarrel(barrel: Container, upgradeLevel: number): void {
    const graphics = this.manageBarrelGraphics(barrel);
    const headY = -18;

    // Body - tactical gear
    const bodyColor = this.getUpgradeColor(0x6b8e23, 0x556b2f, 0x3a4a1f, upgradeLevel);
    const armColor = upgradeLevel >= 3 ? 0x556b2f : 0xffdbac;
    this.renderCharacterBase(graphics, upgradeLevel, bodyColor, armColor, headY);

    // Grenade launcher - tube style
    const launcherSize = 3 + upgradeLevel * 0.3;
    graphics.rect(-launcherSize, -10, launcherSize * 2, 8).fill(0x2f4f2f);
    graphics.rect(-launcherSize - 1, -11, launcherSize * 2 + 2, 2).fill(0x1a1a1a);

    // Headgear
    this.renderHeadgear(graphics, upgradeLevel, headY, [
      { type: 'cap', color: 0x6b8e23 },
      { type: 'helmet', color: 0x556b2f, details: 0x3a4a1f },
      { type: 'helmet', color: 0x2a2a2a, details: 0x1a1a1a },
    ]);

    this.finalizeBarrelGraphics(barrel, graphics);
  }

  public renderShootingEffect(barrel: Container, _type: string, _upgradeLevel: number): void {
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
    this.applyShootingEffect(barrel, flash);
  }
}
