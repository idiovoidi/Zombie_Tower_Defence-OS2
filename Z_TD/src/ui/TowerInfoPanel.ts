import { UIComponent } from './UIComponent';
import { Text, Graphics } from 'pixi.js';
import { Tower } from '../objects/Tower';

export class TowerInfoPanel extends UIComponent {
  private background: Graphics;
  private towerNameText: Text;
  private towerLevelText: Text;
  private towerDamageText: Text;
  private towerRangeText: Text;
  private towerFireRateText: Text;
  private upgradeCostText: Text;
  private upgradeButton: Graphics;
  private upgradeButtonText: Text;
  private onUpgradeCallback: ((tower: Tower) => void) | null = null;
  private selectedTower: Tower | null = null;

  constructor() {
    super();

    // Create background
    this.background = new Graphics();
    this.background.roundRect(0, 0, 300, 250, 10).fill(0x333333);
    this.background.stroke({ width: 2, color: 0xffffff });
    this.addChild(this.background);

    // Create tower name text
    this.towerNameText = new Text({
      text: 'No Tower Selected',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.towerNameText.anchor.set(0.5);
    this.towerNameText.position.set(150, 30);
    this.addChild(this.towerNameText);

    // Create tower level text
    this.towerLevelText = new Text({
      text: 'Level: -',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffffff,
        align: 'left',
      },
    });
    this.towerLevelText.position.set(20, 70);
    this.addChild(this.towerLevelText);

    // Create tower damage text
    this.towerDamageText = new Text({
      text: 'Damage: -',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffffff,
        align: 'left',
      },
    });
    this.towerDamageText.position.set(20, 100);
    this.addChild(this.towerDamageText);

    // Create tower range text
    this.towerRangeText = new Text({
      text: 'Range: -',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffffff,
        align: 'left',
      },
    });
    this.towerRangeText.position.set(20, 130);
    this.addChild(this.towerRangeText);

    // Create tower fire rate text
    this.towerFireRateText = new Text({
      text: 'Fire Rate: -',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffffff,
        align: 'left',
      },
    });
    this.towerFireRateText.position.set(20, 160);
    this.addChild(this.towerFireRateText);

    // Create upgrade cost text
    this.upgradeCostText = new Text({
      text: 'Upgrade Cost: $-',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffff00,
        align: 'left',
      },
    });
    this.upgradeCostText.position.set(20, 190);
    this.addChild(this.upgradeCostText);

    // Create upgrade button
    this.upgradeButton = new Graphics();
    this.upgradeButton.roundRect(0, 0, 120, 40, 5).fill(0x00aa00);
    this.upgradeButton.position.set(90, 210);
    this.upgradeButton.eventMode = 'static';
    this.upgradeButton.cursor = 'pointer';
    this.upgradeButton.on('pointerdown', () => this.onUpgradeClicked());
    this.addChild(this.upgradeButton);

    // Create upgrade button text
    this.upgradeButtonText = new Text({
      text: 'UPGRADE',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.upgradeButtonText.anchor.set(0.5);
    this.upgradeButtonText.position.set(150, 230);
    this.addChild(this.upgradeButtonText);

    // Initially hide the panel
    this.hide();
  }

  public update(_deltaTime: number): void {
    // Update tower info if a tower is selected
    if (this.selectedTower) {
      this.updateTowerInfo();
    }
  }

  // Set the selected tower and update the panel
  public setSelectedTower(tower: Tower | null): void {
    this.selectedTower = tower;
    if (tower) {
      this.show();
      this.updateTowerInfo();
    } else {
      this.hide();
    }
  }

  // Update the tower information displayed in the panel
  private updateTowerInfo(): void {
    if (!this.selectedTower) {
      this.towerNameText.text = 'No Tower Selected';
      this.towerLevelText.text = 'Level: -';
      this.towerDamageText.text = 'Damage: -';
      this.towerRangeText.text = 'Range: -';
      this.towerFireRateText.text = 'Fire Rate: -';
      this.upgradeCostText.text = 'Upgrade Cost: $-';
      this.upgradeButton.visible = false;
      return;
    }

    // Update tower information
    this.towerNameText.text = `${this.selectedTower.getType()} Tower`;
    this.towerLevelText.text = `Level: ${this.selectedTower.getUpgradeLevel()}/${this.selectedTower.getMaxUpgradeLevel()}`;
    this.towerDamageText.text = `Damage: ${this.selectedTower.getDamage()}`;
    this.towerRangeText.text = `Range: ${Math.floor(this.selectedTower.getRange())}`;
    this.towerFireRateText.text = `Fire Rate: ${this.selectedTower.getFireRate()}/s`;

    // Update upgrade cost and button state
    if (this.selectedTower.canUpgrade()) {
      const upgradeCost = this.selectedTower.getUpgradeCost();
      this.upgradeCostText.text = `Upgrade Cost: $${upgradeCost}`;
      this.upgradeButton.visible = true;

      // Change button color based on whether upgrade is possible
      // This would typically be handled by the UpgradeSystem checking resources
      // For now, we'll just show the button as enabled
      this.upgradeButton.clear();
      this.upgradeButton.roundRect(0, 0, 120, 40, 5).fill(0x00aa00);
    } else {
      this.upgradeCostText.text = 'Max Level Reached';
      this.upgradeButton.visible = false;
    }
  }

  private onUpgradeClicked(): void {
    if (this.selectedTower && this.onUpgradeCallback) {
      this.onUpgradeCallback(this.selectedTower);
    }
  }

  public setUpgradeCallback(callback: (tower: Tower) => void): void {
    this.onUpgradeCallback = callback;
  }

  // Position the panel on the screen
  public setPosition(x: number, y: number): void {
    this.position.set(x, y);
  }
}
