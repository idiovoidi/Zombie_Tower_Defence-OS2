import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';
import { CampUpgrade, CampUpgradeManager } from '../managers/CampUpgradeManager';
import { TextureGenerator } from '../utils/textureGenerator';

export class CampUpgradePanel extends UIComponent {
  private background!: Graphics;
  private contentContainer!: Container;
  private isExpanded: boolean = false;
  private campUpgradeManager: CampUpgradeManager | null = null;
  private upgradeButtons: Map<string, Container> = new Map();
  private moneyAvailable: number = 0;
  private onUpgradeCallback: ((upgradeId: string, cost: number) => boolean) | null = null;

  constructor() {
    super();
    this.createPanel();
  }

  public setCampUpgradeManager(manager: CampUpgradeManager): void {
    this.campUpgradeManager = manager;
    this.updateUpgradeDisplay();
  }

  public setMoneyAvailable(money: number): void {
    this.moneyAvailable = money;
    this.updateUpgradeDisplay();
  }

  public setUpgradeCallback(callback: (upgradeId: string, cost: number) => boolean): void {
    this.onUpgradeCallback = callback;
  }

  private createPanel(): void {
    // Main panel container
    this.background = new Graphics();
    this.contentContainer = new Container();
    this.contentContainer.visible = this.isExpanded;

    this.createPanelContent();
    this.addChild(this.contentContainer);
  }

  public getContentContainer(): Container {
    return this.contentContainer;
  }

  private createPanelContent(): void {
    const panelWidth = 400;
    const panelHeight = 550;

    // Position centered
    this.contentContainer.position.set(640 - panelWidth / 2, 384 - panelHeight / 2);

    // Background - corrugated metal
    const metalBg = TextureGenerator.createCorrugatedMetal(panelWidth + 20, panelHeight + 20);
    metalBg.position.set(-10, -10);
    this.contentContainer.addChild(metalBg);

    // Inner panel - rusty metal
    const innerBg = TextureGenerator.createRustyMetal(panelWidth, panelHeight);
    this.contentContainer.addChild(innerBg);

    // Border
    const border = new Graphics();
    border.rect(0, 0, panelWidth, panelHeight).stroke({ width: 4, color: 0x2a2a2a });
    this.contentContainer.addChild(border);

    // Corner rivets
    const corners = [
      [5, 5],
      [panelWidth - 5, 5],
      [5, panelHeight - 5],
      [panelWidth - 5, panelHeight - 5],
    ];
    corners.forEach(([x, y]) => {
      const rivet = new Graphics();
      rivet.circle(x, y, 4).fill(0x5a5a5a);
      rivet.circle(x, y, 3).fill(0x6a6a6a);
      rivet.circle(x - 1, y - 1, 2).fill(0x8a8a8a);
      this.contentContainer.addChild(rivet);
    });

    // Title bar
    const titleBg = new Graphics();
    titleBg.rect(10, 10, panelWidth - 20, 40).fill(0x3a3a3a);
    titleBg.stroke({ width: 2, color: 0x2a2a2a });
    this.contentContainer.addChild(titleBg);

    // Caution stripes
    titleBg.rect(10, 10, 8, 40).fill(0xffcc00);
    titleBg.rect(panelWidth - 18, 10, 8, 40).fill(0xffcc00);
    this.contentContainer.addChild(titleBg);

    // Title
    const title = new Text({
      text: '🏕️ CAMP UPGRADES',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 20,
        fill: 0xffcc00,
        stroke: { color: 0x000000, width: 3 },
        fontWeight: 'bold',
        letterSpacing: 2,
      },
    });
    title.anchor.set(0.5, 0.5);
    title.position.set(panelWidth / 2, 30);
    this.contentContainer.addChild(title);

    // Subtitle
    const subtitle = new Text({
      text: 'Permanent Passive Bonuses',
      style: {
        fontFamily: 'Arial',
        fontSize: 11,
        fill: 0xcccccc,
        fontStyle: 'italic',
      },
    });
    subtitle.anchor.set(0.5, 0.5);
    subtitle.position.set(panelWidth / 2, 45);
    this.contentContainer.addChild(subtitle);

    // Close button
    const closeButton = this.createCloseButton();
    closeButton.position.set(panelWidth - 35, 15);
    this.contentContainer.addChild(closeButton);

    // Upgrade buttons will be added dynamically
  }

  private createCloseButton(): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.rect(0, 0, 25, 25).fill(0x8b0000);
    bg.stroke({ width: 2, color: 0xff0000 });
    button.addChild(bg);

    const text = new Text({
      text: '✕',
      style: {
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5, 0.5);
    text.position.set(12.5, 12.5);
    button.addChild(text);

    button.on('pointerdown', () => {
      this.hide();
    });

    return button;
  }

  private updateUpgradeDisplay(): void {
    if (!this.campUpgradeManager) {
      return;
    }

    // Clear existing buttons
    this.upgradeButtons.forEach(button => {
      this.contentContainer.removeChild(button);
      button.destroy();
    });
    this.upgradeButtons.clear();

    const upgrades = this.campUpgradeManager.getAvailableUpgrades();
    let yPos = 70;

    upgrades.forEach(upgrade => {
      const button = this.createUpgradeButton(upgrade);
      button.position.set(15, yPos);
      this.contentContainer.addChild(button);
      this.upgradeButtons.set(upgrade.id, button);
      yPos += 70;
    });
  }

  private createUpgradeButton(upgrade: CampUpgrade): Container {
    const button = new Container();
    const width = 370;
    const height = 65;

    // Background - concrete
    const concreteBg = TextureGenerator.createConcrete(width, height);
    concreteBg.alpha = 0.8;
    button.addChild(concreteBg);

    // Frame
    const canUpgrade = this.campUpgradeManager!.canUpgrade(upgrade.id);
    const cost = this.campUpgradeManager!.getUpgradeCost(upgrade.id);
    const canAfford = this.moneyAvailable >= cost;

    const frameColor = !canUpgrade ? 0x4a4a4a : canAfford ? 0x00aa00 : 0x8b0000;
    const frame = new Graphics();
    frame.rect(0, 0, width, height).stroke({ width: 2, color: frameColor });
    button.addChild(frame);

    // Upgrade name
    const name = new Text({
      text: upgrade.name,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 14,
        fill: 0xffcc00,
        stroke: { color: 0x000000, width: 2 },
        fontWeight: 'bold',
      },
    });
    name.position.set(10, 8);
    button.addChild(name);

    // Level indicator
    const levelText = new Text({
      text: `Lv ${upgrade.level}/${upgrade.maxLevel}`,
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 12,
        fill: upgrade.level === upgrade.maxLevel ? 0x00ff00 : 0xffffff,
        fontWeight: 'bold',
      },
    });
    levelText.anchor.set(1, 0);
    levelText.position.set(width - 10, 8);
    button.addChild(levelText);

    // Description
    const desc = new Text({
      text: upgrade.description,
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0xcccccc,
      },
    });
    desc.position.set(10, 28);
    button.addChild(desc);

    // Cost and button
    if (canUpgrade) {
      const costBg = new Graphics();
      costBg.rect(10, 45, 100, 15).fill(0x2a2a2a);
      costBg.stroke({ width: 1, color: 0x4a4a4a });
      button.addChild(costBg);

      const costText = new Text({
        text: `Cost: $${cost}`,
        style: {
          fontFamily: 'Courier New, monospace',
          fontSize: 11,
          fill: canAfford ? 0x00ff00 : 0xff6666,
          fontWeight: 'bold',
        },
      });
      costText.position.set(15, 47);
      button.addChild(costText);

      // Upgrade button
      if (canAfford) {
        const upgradeBtn = new Container();
        upgradeBtn.eventMode = 'static';
        upgradeBtn.cursor = 'pointer';

        const btnBg = new Graphics();
        btnBg.rect(0, 0, 80, 15).fill(0x00aa00);
        btnBg.stroke({ width: 2, color: 0x00ff00 });
        upgradeBtn.addChild(btnBg);

        const btnText = new Text({
          text: 'UPGRADE',
          style: {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: 10,
            fill: 0xffffff,
            fontWeight: 'bold',
          },
        });
        btnText.anchor.set(0.5, 0.5);
        btnText.position.set(40, 7.5);
        upgradeBtn.addChild(btnText);

        upgradeBtn.position.set(width - 90, 45);
        button.addChild(upgradeBtn);

        upgradeBtn.on('pointerdown', event => {
          event.stopPropagation();
          this.purchaseUpgrade(upgrade.id);
        });

        upgradeBtn.on('pointerover', () => {
          btnBg.clear();
          btnBg.rect(0, 0, 80, 15).fill(0x00cc00);
          btnBg.stroke({ width: 2, color: 0x00ff00 });
        });

        upgradeBtn.on('pointerout', () => {
          btnBg.clear();
          btnBg.rect(0, 0, 80, 15).fill(0x00aa00);
          btnBg.stroke({ width: 2, color: 0x00ff00 });
        });
      }
    } else {
      const maxText = new Text({
        text: '✓ MAX LEVEL',
        style: {
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 11,
          fill: 0x00ff00,
          fontWeight: 'bold',
        },
      });
      maxText.position.set(10, 45);
      button.addChild(maxText);
    }

    return button;
  }

  private purchaseUpgrade(upgradeId: string): void {
    if (!this.campUpgradeManager || !this.onUpgradeCallback) {
      return;
    }

    const cost = this.campUpgradeManager.getUpgradeCost(upgradeId);
    const success = this.onUpgradeCallback(upgradeId, cost);

    if (success) {
      this.campUpgradeManager.purchaseUpgrade(upgradeId);
      this.updateUpgradeDisplay();
    }
  }

  public show(): void {
    console.log('🏕️ CampUpgradePanel.show() called');
    this.visible = true;
    this.isExpanded = true;
    this.contentContainer.visible = true;
    console.log(
      '🏕️ Panel visibility set, contentContainer visible:',
      this.contentContainer.visible
    );
    this.updateUpgradeDisplay();
    console.log('🏕️ Panel should now be visible');
  }

  public hide(): void {
    this.isExpanded = false;
    this.contentContainer.visible = false;
  }

  public toggle(): void {
    if (this.isExpanded) {
      this.hide();
    } else {
      this.show();
    }
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }
}
