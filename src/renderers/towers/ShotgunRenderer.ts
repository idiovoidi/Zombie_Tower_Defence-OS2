import { Container, Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';

export class ShotgunRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Container, _type: string, upgradeLevel: number): void {
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

  private renderBarrel(barrel: Container, upgradeLevel: number): void {
    const graphics = this.manageBarrelGraphics(barrel);
    const headY = -16;

    // Body - armor improves
    const bodyColor = this.getUpgradeColor(0x654321, 0x4a4a4a, 0x2a2a2a, upgradeLevel);
    this.renderCharacterBase(graphics, upgradeLevel, bodyColor, 0xffdbac, headY);

    // Shotgun - gets wider (note: using adjusted positions for this tower's layout)
    const barrelWidth = 2 + upgradeLevel * 0.3;
    graphics.rect(-3, headY + 8, barrelWidth, 8).fill(0xa0522d);
    graphics.rect(1, headY + 8, barrelWidth, 8).fill(0xa0522d);

    // Headgear
    this.renderHeadgear(graphics, upgradeLevel, headY, [
      { type: 'cap', color: 0x654321 },
      { type: 'helmet', color: 0x4a4a4a },
      { type: 'helmet', color: 0x2a2a2a, details: 0x8b8b8b },
    ]);

    this.finalizeBarrelGraphics(barrel, graphics);
  }

  public renderShootingEffect(barrel: Container, _type: string, _upgradeLevel: number): void {
    const flash = new Graphics();

    // Shotgun starts at -8, extends down by 8
    // Shotgun tip is at -8 + 8 = 0
    const shotgunTip = -8 + 8;
    flash.circle(-2, shotgunTip, 5).fill(0xffff00);
    flash.circle(2, shotgunTip, 5).fill(0xffff00);

    barrel.addChild(flash);
    this.applyShootingEffect(barrel, flash);
  }
}
