import { Container, Graphics, Text } from 'pixi.js';
import { UI_COLORS, UI_FONTS, UI_LAYOUT } from '../config/uiTheme';
import type { EconomyState } from '../managers/EconomyState';
import { TowerManager } from '../managers/TowerManager';
import type { Tower } from '../objects/Tower';
import { MetalUI } from './theme/MetalUI';
import { UIComponent } from './UIComponent';

export class TowerInfoPanel extends UIComponent {
  private selectedTower: Tower | null = null;
  private towerManager: TowerManager;
  private economyState: EconomyState | null = null;
  private upgradeButton!: Container & { labelText: Text; frame: Graphics };
  private sellButton!: Container & { labelText: Text; frame: Graphics };
  private infoText!: Text;
  private statsText!: Text;
  private onUpgradeCallback: (() => void) | null = null;
  private onSellCallback: (() => void) | null = null;

  constructor(towerManager: TowerManager = TowerManager.getInstance()) {
    super();
    this.cullableChildren = false;
    this.towerManager = towerManager;
    this.createPanelUI();
    this.visible = false;
  }

  public setTowerManager(towerManager: TowerManager): void {
    this.towerManager = towerManager;
  }

  public setEconomyState(economyState: EconomyState): void {
    this.economyState = economyState;
  }

  private createPanelUI(): void {
    const width = UI_LAYOUT.TOWER_INFO_WIDTH;
    const height = UI_LAYOUT.TOWER_INFO_HEIGHT;

    const metal = MetalUI.createMetalPanel({
      width,
      height,
      inset: 8,
      rivets: true,
      cautionTop: true,
      cautionBottom: false,
    });
    this.addChild(metal);

    const titleBar = MetalUI.createTitleBar(
      width - 16,
      36,
      'TOWER OPS',
      'UNIT STATUS',
      UI_COLORS.WARNING
    );
    titleBar.position.set(8, 10);
    this.addChild(titleBar);

    this.infoText = new Text({
      text: '',
      style: {
        fontFamily: UI_FONTS.HEADER,
        fontSize: 13,
        fill: UI_COLORS.WARNING,
        letterSpacing: 1,
        wordWrap: true,
        wordWrapWidth: width - 28,
      },
    });
    this.infoText.position.set(14, 56);
    this.addChild(this.infoText);

    this.statsText = MetalUI.createMonoText('', 12, UI_COLORS.TEXT_DIM);
    this.statsText.style.wordWrap = true;
    this.statsText.style.wordWrapWidth = width - 28;
    this.statsText.position.set(14, 100);
    this.addChild(this.statsText);

    this.upgradeButton = MetalUI.createMetalButton({
      label: 'UPGRADE',
      variant: 'ready',
      width: width - 28,
      height: 40,
      fontSize: 14,
      onClick: () => this.onUpgradeCallback?.(),
    });
    this.upgradeButton.position.set(14, 200);
    this.addChild(this.upgradeButton);

    this.sellButton = MetalUI.createMetalButton({
      label: 'SELL',
      variant: 'danger',
      width: width - 28,
      height: 40,
      fontSize: 14,
      onClick: () => this.onSellCallback?.(),
    });
    this.sellButton.position.set(14, 248);
    this.addChild(this.sellButton);
  }

  public showTowerInfo(tower: Tower): void {
    this.selectedTower = tower;
    this.visible = true;
    this.updateInfo();
  }

  public override hide(): void {
    this.visible = false;
    this.selectedTower = null;
  }

  private updateInfo(): void {
    if (!this.selectedTower) {
      return;
    }

    const type = this.selectedTower.getType();
    const level = this.selectedTower.getUpgradeLevel();
    const damage = this.selectedTower.getDamage();
    const range = this.selectedTower.getRange();
    const fireRate = this.selectedTower.getFireRate();

    const infoNext = `${this.getTowerDisplayName(type).toUpperCase()}\nLVL ${level}/${this.selectedTower.getMaxUpgradeLevel()}`;
    if (this.infoText.text !== infoNext) {
      this.infoText.text = infoNext;
    }

    if (type === 'Sludge') {
      const slowPercent = Math.round((0.1 + (level - 1) * 0.075) * 100);
      const poolRadius = 35 + (level - 1) * 3;
      const statsNext = `SLOW: ${slowPercent}%\nPOOL: ${poolRadius}px\nRNG: ${range}\nRATE: ${fireRate}/s\nHP: ${this.selectedTower.getHealth()}/${this.selectedTower.getMaxHealth()}`;
      if (this.statsText.text !== statsNext) {
        this.statsText.text = statsNext;
      }
    } else {
      const statsNext = `DMG: ${damage}\nRNG: ${range}\nRATE: ${fireRate}/s\nHP: ${this.selectedTower.getHealth()}/${this.selectedTower.getMaxHealth()}`;
      if (this.statsText.text !== statsNext) {
        this.statsText.text = statsNext;
      }
    }

    const upgradeCost = this.economyState
      ? this.economyState.getUpgradeCost(this.selectedTower)
      : this.towerManager.calculateUpgradeCost(type, level);
    const canUpgrade = this.selectedTower.canUpgrade();

    if (canUpgrade) {
      const upgradeNext = `UPGRADE $${upgradeCost}`;
      if (this.upgradeButton.labelText.text !== upgradeNext) {
        this.upgradeButton.labelText.text = upgradeNext;
      }
      this.upgradeButton.alpha = 1;
      this.upgradeButton.eventMode = 'static';
    } else {
      if (this.upgradeButton.labelText.text !== 'MAX LEVEL') {
        this.upgradeButton.labelText.text = 'MAX LEVEL';
      }
      this.upgradeButton.alpha = 0.5;
      this.upgradeButton.eventMode = 'none';
    }

    const sellValue = this.economyState
      ? this.economyState.getSellValue(this.selectedTower)
      : (() => {
          const baseCost = this.towerManager.getTowerCost(type);
          let totalCost = baseCost;
          for (let i = 1; i < level; i++) {
            totalCost += this.towerManager.calculateUpgradeCost(type, i);
          }
          return Math.floor(totalCost * 0.75);
        })();
    const sellNext = `SELL $${sellValue}`;
    if (this.sellButton.labelText.text !== sellNext) {
      this.sellButton.labelText.text = sellNext;
    }
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
      case 'Sludge':
        return 'Sludge';
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
    if (this.selectedTower && this.visible) {
      this.updateInfo();
    }
  }
}
