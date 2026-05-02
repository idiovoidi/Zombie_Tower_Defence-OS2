import { Container, Graphics } from 'pixi.js';
import { BaseTowerRenderer } from './BaseTowerRenderer';

export class TeslaRenderer extends BaseTowerRenderer {
  public render(visual: Graphics, barrel: Container, _type: string, upgradeLevel: number): void {
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

  private renderBarrel(barrel: Container, upgradeLevel: number): void {
    const graphics = this.manageBarrelGraphics(barrel);
    const headY = -18;

    // Body - tech suit improves
    const suitColor = this.getUpgradeColor(0x4a4a4a, 0x00ced1, 0x00ffff, upgradeLevel);
    const armColor = upgradeLevel >= 3 ? 0x00ced1 : 0xffdbac;
    this.renderCharacterBase(graphics, upgradeLevel, suitColor, armColor, headY);

    // Tesla coil gun - gets bigger
    const coilSize = 3 + upgradeLevel * 0.5;
    graphics.circle(0, -10, coilSize).fill(0x7fffd4);
    graphics.rect(-2, -10, 4, 7).fill(0x00bfff);
    // Electric arcs
    for (let i = 0; i < Math.min(upgradeLevel, 3); i++) {
      const offset = i * 2;
      graphics
        .moveTo(-2, -8 + offset)
        .lineTo(2, -6 + offset)
        .stroke({ width: 1, color: 0xffffff });
    }

    // Tech gear improves with level
    this.renderHeadgear(graphics, upgradeLevel, headY, [
      { type: 'cap', color: 0x4a4a4a },
      { type: 'visor', color: 0x00ffff, details: 0x00ffff },
      { type: 'helmet', color: 0x00ced1, details: 0x00ced1 },
    ]);
    if (upgradeLevel >= 5) {
      graphics.rect(-5, headY - 3, 2, 4).fill(0x00ced1);
      graphics.rect(3, headY - 3, 2, 4).fill(0x00ced1);
    }

    this.finalizeBarrelGraphics(barrel, graphics);
  }

  public renderShootingEffect(barrel: Container, _type: string, _upgradeLevel: number): void {
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
    this.applyShootingEffect(barrel, flash);
  }
}
