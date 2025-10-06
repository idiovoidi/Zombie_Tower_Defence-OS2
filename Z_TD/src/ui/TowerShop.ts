import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';
import { GameConfig } from '../config/gameConfig';
import { TowerManager } from '../managers/TowerManager';
import { TextureGenerator } from '../utils/textureGenerator';

export class TowerShop extends UIComponent {
  private towerButtons: Map<string, Container> = new Map();
  private selectedTowerType: string | null = null;
  private towerManager: TowerManager;
  private onTowerSelectCallback: ((type: string) => void) | null = null;

  constructor() {
    super();
    this.towerManager = new TowerManager();
    this.createShopUI();
  }

  private createShopUI(): void {
    // Main panel background - corrugated metal
    const metalBg = TextureGenerator.createCorrugatedMetal(220, 520);
    metalBg.position.set(-10, -10);
    this.addChild(metalBg);

    // Inner panel - rusty metal plate
    const innerBg = TextureGenerator.createRustyMetal(200, 500);
    this.addChild(innerBg);

    // Riveted border frame
    const frame = new Graphics();
    frame.rect(0, 0, 200, 500).stroke({ width: 3, color: 0x2a2a2a });
    this.addChild(frame);

    // Corner rivets
    this.addRivets(frame);

    // Title bar - weathered metal
    const titleBg = new Graphics();
    titleBg.rect(5, 5, 190, 35).fill(0x3a3a3a);
    titleBg.rect(5, 5, 190, 35).stroke({ width: 2, color: 0x1a1a1a });
    this.addChild(titleBg);

    // Caution stripes on title bar edges
    const cautionLeft = new Graphics();
    cautionLeft.rect(5, 5, 8, 35).fill(0xffcc00);
    this.addChild(cautionLeft);
    const cautionRight = new Graphics();
    cautionRight.rect(187, 5, 8, 35).fill(0xffcc00);
    this.addChild(cautionRight);

    // Title text with apocalyptic styling
    const title = new Text({
      text: '⚠ ARMORY ⚠',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 22,
        fill: 0xff3333,
        stroke: { color: 0x000000, width: 3 },
        fontWeight: 'bold',
        letterSpacing: 2,
      },
    });
    title.anchor.set(0.5, 0.5);
    title.position.set(100, 22);
    this.addChild(title);

    // Subtitle
    const subtitle = new Text({
      text: 'DEFENSE SYSTEMS',
      style: {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0xcccccc,
        fontWeight: 'bold',
        letterSpacing: 1,
      },
    });
    subtitle.anchor.set(0.5, 0.5);
    subtitle.position.set(100, 35);
    this.addChild(subtitle);

    // Create tower buttons
    const towerTypes = this.towerManager.getTowerTypes();
    let yPos = 55;

    for (const type of towerTypes) {
      const button = this.createTowerButton(type, yPos);
      this.towerButtons.set(type, button);
      this.addChild(button);
      yPos += 88;
    }

    // Bottom warning label
    const warning = new Text({
      text: 'AUTHORIZED PERSONNEL ONLY',
      style: {
        fontFamily: 'Arial',
        fontSize: 8,
        fill: 0xffcc00,
        fontWeight: 'bold',
      },
    });
    warning.anchor.set(0.5, 0.5);
    warning.position.set(100, 490);
    this.addChild(warning);
  }

  private addRivets(container: Container): void {
    const rivetPositions = [
      [3, 3],
      [197, 3],
      [3, 497],
      [197, 497],
      [100, 3],
      [100, 497],
      [3, 250],
      [197, 250],
    ];

    rivetPositions.forEach(([x, y]) => {
      const rivet = new Graphics();
      rivet.circle(0, 0, 4).fill(0x5a5a5a);
      rivet.circle(0, 0, 3).fill(0x6a6a6a);
      rivet.circle(-1, -1, 2).fill(0x8a8a8a);
      rivet.position.set(x, y);
      container.addChild(rivet);
    });
  }

  private createTowerButton(type: string, yPos: number): Container {
    const button = new Container();
    button.position.set(8, yPos);
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const stats = this.towerManager.getTowerStats(type);
    if (!stats) return button;

    // Button background - concrete texture
    const concreteBg = TextureGenerator.createConcrete(184, 82);
    concreteBg.alpha = 0.8;
    button.addChild(concreteBg);

    // Metal frame
    const frame = new Graphics();
    frame.rect(0, 0, 184, 82).stroke({ width: 2, color: 0x3a3a3a });
    button.addChild(frame);

    // Inner border
    const innerBorder = new Graphics();
    innerBorder.rect(2, 2, 180, 78).stroke({ width: 1, color: 0x5a5a5a });
    button.addChild(innerBorder);

    // Icon background plate - riveted metal
    const iconPlate = new Graphics();
    iconPlate.rect(6, 6, 50, 70).fill(0x4a4a4a);
    iconPlate.rect(6, 6, 50, 70).stroke({ width: 1, color: 0x2a2a2a });
    button.addChild(iconPlate);

    // Icon plate rivets
    [
      [8, 8],
      [54, 8],
      [8, 74],
      [54, 74],
    ].forEach(([x, y]) => {
      const rivet = new Graphics();
      rivet.circle(x, y, 2).fill(0x6a6a6a);
      button.addChild(rivet);
    });

    // Tower icon
    const icon = this.createTowerIcon(type);
    icon.position.set(31, 41);
    button.addChild(icon);

    // Info panel background
    const infoBg = new Graphics();
    infoBg.rect(60, 6, 118, 70).fill({ color: 0x2a2a2a, alpha: 0.7 });
    button.addChild(infoBg);

    // Tower name with stencil font style
    const name = new Text({
      text: this.getTowerDisplayName(type).toUpperCase(),
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 13,
        fill: 0xffcc00,
        stroke: { color: 0x000000, width: 2 },
        fontWeight: 'bold',
        letterSpacing: 1,
      },
    });
    name.position.set(65, 10);
    button.addChild(name);

    // Cost display with dollar sign
    const costLabel = new Text({
      text: 'COST:',
      style: {
        fontFamily: 'Arial',
        fontSize: 9,
        fill: 0x888888,
        fontWeight: 'bold',
      },
    });
    costLabel.position.set(65, 30);
    button.addChild(costLabel);

    const cost = new Text({
      text: `$${stats.cost}`,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 14,
        fill: 0x00ff00,
        fontWeight: 'bold',
      },
    });
    cost.position.set(100, 27);
    button.addChild(cost);

    // Stats display
    const dmgLabel = new Text({
      text: `DMG: ${stats.damage}`,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 10,
        fill: 0xff6666,
      },
    });
    dmgLabel.position.set(65, 48);
    button.addChild(dmgLabel);

    const rngLabel = new Text({
      text: `RNG: ${stats.range}`,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 10,
        fill: 0x66ccff,
      },
    });
    rngLabel.position.set(65, 62);
    button.addChild(rngLabel);

    // Status indicator LED
    const led = new Graphics();
    led.circle(170, 15, 4).fill(0x00ff00);
    led.circle(170, 15, 3).fill(0x00ff00);
    led.alpha = 0.5;
    button.addChild(led);

    // Store references for hover effects
    (button as any).bgGraphics = concreteBg;
    (button as any).frame = frame;
    (button as any).led = led;

    // Hover effects
    button.on('pointerover', () => {
      frame.clear();
      frame.rect(0, 0, 184, 82).stroke({ width: 3, color: 0xffcc00 });
      led.alpha = 1.0;
      concreteBg.alpha = 1.0;
    });

    button.on('pointerout', () => {
      if (this.selectedTowerType !== type) {
        frame.clear();
        frame.rect(0, 0, 184, 82).stroke({ width: 2, color: 0x3a3a3a });
        led.alpha = 0.5;
        concreteBg.alpha = 0.8;
      }
    });

    button.on('pointerdown', (event) => {
      event.stopPropagation();
      this.selectTower(type);
    });

    return button;
  }

  private createTowerIcon(type: string): Graphics {
    const icon = new Graphics();

    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        // Tower base
        icon.rect(-8, 0, 16, 12).fill(0x8b7355);
        // Little man with gun
        icon.circle(0, -8, 3).fill(0xffdbac); // Head
        icon.rect(-2, -5, 4, 5).fill(0x0000ff); // Body
        icon.rect(0, -12, 1, 6).fill(0x2f4f4f); // Gun
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        // Tower base
        icon.rect(-6, -2, 12, 14).fill(0x696969);
        // Little man with sniper
        icon.circle(0, -10, 3).fill(0xffdbac); // Head
        icon.rect(-2, -7, 4, 5).fill(0x2f4f4f); // Body
        icon.rect(0, -16, 1, 10).fill(0x1a1a1a); // Long rifle
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        // Bunker base
        icon.roundRect(-9, 0, 18, 12, 3).fill(0x8b4513);
        // Little man with shotgun
        icon.circle(0, -8, 3).fill(0xffdbac); // Head
        icon.rect(-2, -5, 4, 5).fill(0x8b4513); // Body
        icon.rect(-1, -11, 1, 6).fill(0xa0522d); // Shotgun barrel
        icon.rect(1, -11, 1, 6).fill(0xa0522d); // Shotgun barrel
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        // Round tower
        icon.circle(0, 2, 9).fill(0xff4500);
        // Little man with flamethrower
        icon.circle(0, -8, 3).fill(0xffdbac); // Head
        icon.circle(0, -8, 2).fill(0x4a4a4a); // Mask
        icon.rect(-2, -5, 4, 5).fill(0xff4500); // Body
        icon.rect(-1, -12, 2, 7).fill(0xff0000); // Flamethrower
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        // Tech tower
        icon.rect(-8, 0, 16, 12).fill(0x00ced1);
        // Little man with tesla gun
        icon.circle(0, -8, 3).fill(0xffdbac); // Head
        icon.rect(-2, -5, 4, 5).fill(0x00ced1); // Body
        icon.circle(0, -12, 2).fill(0x7fffd4); // Tesla coil
        icon.rect(-1, -12, 2, 5).fill(0x00bfff); // Coil body
        break;
    }

    return icon;
  }

  private getTowerDisplayName(type: string): string {
    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        return 'Machine Gun';
      case GameConfig.TOWER_TYPES.SNIPER:
        return 'Sniper';
      case GameConfig.TOWER_TYPES.SHOTGUN:
        return 'Shotgun';
      case GameConfig.TOWER_TYPES.FLAME:
        return 'Flame';
      case GameConfig.TOWER_TYPES.TESLA:
        return 'Tesla';
      default:
        return type;
    }
  }

  private selectTower(type: string): void {
    // Deselect previous
    if (this.selectedTowerType) {
      const prevButton = this.towerButtons.get(this.selectedTowerType);
      if (prevButton) {
        const frame = prevButton.getChildAt(1) as Graphics;
        const led = (prevButton as any).led as Graphics;
        const bgGraphics = (prevButton as any).bgGraphics as Graphics;
        frame.clear();
        frame.rect(0, 0, 184, 82).stroke({ width: 2, color: 0x3a3a3a });
        led.alpha = 0.5;
        bgGraphics.alpha = 0.8;
      }
    }

    // Select new
    this.selectedTowerType = type;
    const button = this.towerButtons.get(type);
    if (button) {
      const frame = button.getChildAt(1) as Graphics;
      const led = (button as any).led as Graphics;
      const bgGraphics = (button as any).bgGraphics as Graphics;
      frame.clear();
      frame.rect(0, 0, 184, 82).stroke({ width: 3, color: 0x00ff00 });
      led.alpha = 1.0;
      bgGraphics.alpha = 1.0;
    }

    // Notify callback
    if (this.onTowerSelectCallback) {
      this.onTowerSelectCallback(type);
    }
  }

  public setTowerSelectCallback(callback: (type: string) => void): void {
    this.onTowerSelectCallback = callback;
  }

  public getSelectedTowerType(): string | null {
    return this.selectedTowerType;
  }

  public clearSelection(): void {
    if (this.selectedTowerType) {
      const button = this.towerButtons.get(this.selectedTowerType);
      if (button) {
        const frame = button.getChildAt(1) as Graphics;
        const led = (button as any).led as Graphics;
        const bgGraphics = (button as any).bgGraphics as Graphics;
        frame.clear();
        frame.rect(0, 0, 184, 82).stroke({ width: 2, color: 0x3a3a3a });
        led.alpha = 0.5;
        bgGraphics.alpha = 0.8;
      }
      this.selectedTowerType = null;
    }
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }
}
