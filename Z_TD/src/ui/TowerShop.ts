import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';
import { GameConfig } from '../config/gameConfig';
import { TowerManager } from '../managers/TowerManager';

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
    // Shop background
    const bg = new Graphics();
    bg.roundRect(0, 0, 200, 500, 10).fill({ color: 0x1a1a1a, alpha: 0.9 });
    bg.stroke({ width: 2, color: 0x444444 });
    this.addChild(bg);

    // Title
    const title = new Text({
      text: 'Tower Shop',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5, 0);
    title.position.set(100, 10);
    this.addChild(title);

    // Create tower buttons
    const towerTypes = this.towerManager.getTowerTypes();
    let yPos = 50;

    for (const type of towerTypes) {
      const button = this.createTowerButton(type, yPos);
      this.towerButtons.set(type, button);
      this.addChild(button);
      yPos += 90;
    }
  }

  private createTowerButton(type: string, yPos: number): Container {
    const button = new Container();
    button.position.set(10, yPos);
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const stats = this.towerManager.getTowerStats(type);
    if (!stats) return button;

    // Button background
    const bg = new Graphics();
    bg.roundRect(0, 0, 180, 80, 5).fill(0x2a2a2a);
    bg.stroke({ width: 2, color: 0x555555 });
    button.addChild(bg);

    // Tower icon (simplified visual)
    const icon = this.createTowerIcon(type);
    icon.position.set(15, 40);
    button.addChild(icon);

    // Tower name
    const name = new Text({
      text: this.getTowerDisplayName(type),
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    name.position.set(50, 5);
    button.addChild(name);

    // Cost
    const cost = new Text({
      text: `$${stats.cost}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0x00ff00,
      },
    });
    cost.position.set(50, 25);
    button.addChild(cost);

    // Stats
    const statsText = new Text({
      text: `DMG:${stats.damage} RNG:${stats.range}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xcccccc,
      },
    });
    statsText.position.set(50, 45);
    button.addChild(statsText);

    // Hover effects
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, 180, 80, 5).fill(0x3a3a3a);
      bg.stroke({ width: 2, color: 0x00ff00 });
    });

    button.on('pointerout', () => {
      if (this.selectedTowerType !== type) {
        bg.clear();
        bg.roundRect(0, 0, 180, 80, 5).fill(0x2a2a2a);
        bg.stroke({ width: 2, color: 0x555555 });
      }
    });

    button.on('pointerdown', () => {
      this.selectTower(type);
    });

    return button;
  }

  private createTowerIcon(type: string): Graphics {
    const icon = new Graphics();

    switch (type) {
      case GameConfig.TOWER_TYPES.MACHINE_GUN:
        icon.circle(0, 0, 15).fill(0x0000ff);
        icon.moveTo(0, -15).lineTo(0, -25).stroke({ width: 2, color: 0x4169e1 });
        break;
      case GameConfig.TOWER_TYPES.SNIPER:
        icon.ellipse(0, 0, 12, 18).fill(0x2f4f4f);
        icon.moveTo(0, -18).lineTo(0, -30).stroke({ width: 2, color: 0x696969 });
        break;
      case GameConfig.TOWER_TYPES.SHOTGUN:
        icon.roundRect(-13, -13, 26, 26, 5).fill(0x8b4513);
        break;
      case GameConfig.TOWER_TYPES.FLAME:
        icon.circle(0, 0, 15).fill(0xff4500);
        break;
      case GameConfig.TOWER_TYPES.TESLA:
        icon.circle(0, 0, 15).fill(0x00ced1);
        icon.circle(0, 0, 8).fill(0x7fffd4);
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
        const bg = prevButton.getChildAt(0) as Graphics;
        bg.clear();
        bg.roundRect(0, 0, 180, 80, 5).fill(0x2a2a2a);
        bg.stroke({ width: 2, color: 0x555555 });
      }
    }

    // Select new
    this.selectedTowerType = type;
    const button = this.towerButtons.get(type);
    if (button) {
      const bg = button.getChildAt(0) as Graphics;
      bg.clear();
      bg.roundRect(0, 0, 180, 80, 5).fill(0x3a3a3a);
      bg.stroke({ width: 3, color: 0x00ff00 });
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
        const bg = button.getChildAt(0) as Graphics;
        bg.clear();
        bg.roundRect(0, 0, 180, 80, 5).fill(0x2a2a2a);
        bg.stroke({ width: 2, color: 0x555555 });
      }
      this.selectedTowerType = null;
    }
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }
}
