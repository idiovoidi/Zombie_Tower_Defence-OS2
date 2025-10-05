import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';
import { Tower } from '../objects/Tower';
import { TowerManager } from '../managers/TowerManager';

export class TowerInfoPanel extends UIComponent {
  private selectedTower: Tower | null = null;
  private towerManager: TowerManager;
  private upgradeButton!: Container;
  private sellButton!: Container;
  private infoText!: Text;
  private statsText!: Text;
  private onUpgradeCallback: (() => void) | null = null;
  private onSellCallback: (() => void) | null = null;

  constructor() {
    super();
    this.towerManager = new TowerManager();
    this.createPanelUI();
    this.visible = false; // Hidden by default
  }

  private createPanelUI(): void {
    // Panel background
    const bg = new Graphics();
    bg.roundRect(0, 0, 200, 300, 10).fill({ color: 0x1a1a1a, alpha: 0.9 });
    bg.stroke({ width: 2, color: 0x444444 });
    this.addChild(bg);

    // Title
    const title = new Text({
      text: 'Tower Info',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    title.anchor.set(0.5, 0);
    title.position.set(100, 10);
    this.addChild(title);

    // Info text
    this.infoText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: 180,
      },
    });
    this.infoText.position.set(10, 40);
    this.addChild(this.infoText);

    // Stats text
    this.statsText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: 0xcccccc,
        wordWrap: true,
        wordWrapWidth: 180,
      },
    });
    this.statsText.position.set(10, 120);
    this.addChild(this.statsText);

    // Upgrade button
    this.upgradeButton = this.createButton('Upgrade', 10, 200, 0x00aa00);
    this.upgradeButton.on('pointerdown', (event) => {
      event.stopPropagation();
      if (this.onUpgradeCallback) {
        this.onUpgradeCallback();
      }
    });
    this.addChild(this.upgradeButton);

    // Sell button
    this.sellButton = this.createButton('Sell', 10, 250, 0xaa0000);
    this.sellButton.on('pointerdown', (event) => {
      event.stopPropagation();
      if (this.onSellCallback) {
        this.onSellCallback();
      }
    });
    this.addChild(this.sellButton);
  }

  private createButton(label: string, x: number, y: number, color: number): Container {
    const button = new Container();
    button.position.set(x, y);
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, 180, 40, 5).fill(color);
    bg.stroke({ width: 2, color: 0xffffff });
    button.addChild(bg);

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.position.set(90, 20);
    button.addChild(text);

    // Hover effects
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, 180, 40, 5).fill(color);
      bg.stroke({ width: 3, color: 0xffff00 });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, 180, 40, 5).fill(color);
      bg.stroke({ width: 2, color: 0xffffff });
    });

    return button;
  }

  public showTowerInfo(tower: Tower): void {
    this.selectedTower = tower;
    this.visible = true;
    this.updateInfo();
  }

  public hide(): void {
    this.visible = false;
    this.selectedTower = null;
  }

  private updateInfo(): void {
    if (!this.selectedTower) return;

    const type = this.selectedTower.getType();
    const level = this.selectedTower.getUpgradeLevel();
    const damage = this.selectedTower.getDamage();
    const range = this.selectedTower.getRange();
    const fireRate = this.selectedTower.getFireRate();

    // Update info text
    this.infoText.text = `Type: ${this.getTowerDisplayName(type)}\nLevel: ${level}/${this.selectedTower.getMaxUpgradeLevel()}`;

    // Update stats text
    this.statsText.text = `Damage: ${damage}\nRange: ${range}\nFire Rate: ${fireRate}/s\nHealth: ${this.selectedTower.getHealth()}/${this.selectedTower.getMaxHealth()}`;

    // Update upgrade button
    const upgradeCost = this.towerManager.calculateUpgradeCost(type, level);
    const canUpgrade = this.selectedTower.canUpgrade();
    const upgradeText = this.upgradeButton.getChildAt(1) as Text;

    if (canUpgrade) {
      upgradeText.text = `Upgrade ($${upgradeCost})`;
      this.upgradeButton.alpha = 1;
      (this.upgradeButton as any).interactive = true;
    } else {
      upgradeText.text = 'Max Level';
      this.upgradeButton.alpha = 0.5;
      (this.upgradeButton as any).interactive = false;
    }

    // Update sell button (sell for 75% of total cost)
    const baseCost = this.towerManager.getTowerCost(type);
    let totalCost = baseCost;
    for (let i = 1; i < level; i++) {
      totalCost += this.towerManager.calculateUpgradeCost(type, i);
    }
    const sellValue = Math.floor(totalCost * 0.75);
    const sellText = this.sellButton.getChildAt(1) as Text;
    sellText.text = `Sell ($${sellValue})`;
  }

  private getTowerDisplayName(type: string): string {
    switch (type) {
      case 'MachineGun':
        return 'Machine Gun';
      case 'Sniper':
        return 'Sniper';
      case 'Shotgun':
        return 'Shotgun';
      case 'Flame':
        return 'Flame';
      case 'Tesla':
        return 'Tesla';
      default:
        return type;
    }
  }

  public setUpgradeCallback(callback: () => void): void {
    this.onUpgradeCallback = callback;
  }

  public setSellCallback(callback: () => void): void {
    this.onSellCallback = callback;
  }

  public update(_deltaTime: number): void {
    // Update info if tower is selected
    if (this.selectedTower && this.visible) {
      this.updateInfo();
    }
  }
}
