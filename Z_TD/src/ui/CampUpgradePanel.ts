import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';
import { CampUpgrade, CampUpgradeManager } from '../managers/CampUpgradeManager';
import { TextureGenerator } from '../utils/textureGenerator';

export class CampUpgradePanel extends UIComponent {
  private background!: Graphics;
  private contentContainer!: Container;
  private campUpgradeManager: CampUpgradeManager | null = null;
  private upgradeButtons: Map<string, Container> = new Map();
  private moneyAvailable: number = 0;
  private onUpgradeCallback: ((upgradeId: string, cost: number) => boolean) | null = null;

  constructor() {
    super();
    this.createPanel();
    this.visible = false; // Hidden by default
  }

  public setCampUpgradeManager(manager: CampUpgradeManager): void {
    this.campUpgradeManager = manager;
    this.updateUpgradeDisplay();
  }

  private createPanel(): void {
    // Create background overlay
    this.background = new Graphics();
    this.background.rect(0, 0, 1280, 768);
    this.background.fill({ color: 0x000000, alpha: 0.7 });
    this.background.eventMode = 'static';
    this.background.on('pointerdown', event => {
      event.stopPropagation();
      this.hide();
    });
    this.addChild(this.background);

    // Create content container
    this.contentContainer = new Container();
    const panelWidth = 400;
    const panelHeight = 500;
    this.contentContainer.position.set(640 - panelWidth / 2, 384 - panelHeight / 2);

    // Background - corrugated metal
    const metalBg = TextureGenerator.createCorrugatedMetal(panelWidth + 20, panelHeight + 20);
    metalBg.position.set(-10, -10);
    this.contentContainer.addChild(metalBg);

    // Inner panel - rusty metal
    const innerBg = TextureGenerator.createRustyMetal(panelWidth, panelHeight);
    this.contentContainer.addChild(innerBg);

    // Title bar
    const titleBg = new Graphics();
    titleBg.rect(0, 0, panelWidth, 50);
    titleBg.fill(0x2a2a2a);
    this.contentContainer.addChild(titleBg);

    const titleText = new Text({
      text: 'CAMP UPGRADES',
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 24,
        fill: 0xffcc00,
        stroke: { color: 0x000000, width: 3 },
        fontWeight: 'bold',
        letterSpacing: 2,
      },
    });
    titleText.anchor.set(0.5, 0.5);
    titleText.position.set(panelWidth / 2, 25);
    this.contentContainer.addChild(titleText);

    // Close button
    const closeButton = this.createCloseButton();
    closeButton.position.set(panelWidth - 35, 15);
    this.contentContainer.addChild(closeButton);

    this.addChild(this.contentContainer);
  }

  private createCloseButton(): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.circle(0, 0, 15);
    bg.fill(0xff0000);
    bg.stroke({ width: 2, color: 0x8b0000 });
    button.addChild(bg);

    const xText = new Text({
      text: 'X',
      style: {
        fontFamily: 'Arial Black, sans-serif',
        fontSize: 16,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    xText.anchor.set(0.5, 0.5);
    button.addChild(xText);

    button.on('pointerdown', event => {
      event.stopPropagation();
      this.hide();
    });

    return button;
  }

  public setUpgradeCallback(callback: (upgradeId: string, cost: number) => boolean): void {
    this.onUpgradeCallback = callback;
  }

  public setMoneyAvailable(money: number): void {
    this.moneyAvailable = money;
    this.updateUpgradeDisplay();
  }

  private updateUpgradeDisplay(): void {
    if (!this.campUpgradeManager) {
      return;
    }

    // Clear existing upgrade buttons
    for (const button of this.upgradeButtons.values()) {
      this.contentContainer.removeChild(button);
    }
    this.upgradeButtons.clear();

    const upgrades = this.campUpgradeManager.getAvailableUpgrades();
    let yPos = 70;

    for (const upgrade of upgrades) {
      const button = this.createUpgradeButton(upgrade);
      button.position.set(15, yPos);
      this.contentContainer.addChild(button);
      this.upgradeButtons.set(upgrade.id, button);
      yPos += 130;
    }
  }

  private createUpgradeButton(upgrade: CampUpgrade): Container {
    const button = new Container();
    const width = 370;
    const height = 120;

    // Background
    const concreteBg = TextureGenerator.createConcrete(width, height);
    button.addChild(concreteBg);

    // Frame
    const canUpgrade = this.campUpgradeManager
      ? this.campUpgradeManager.canUpgrade(upgrade.id)
      : false;
    const cost = this.campUpgradeManager ? this.campUpgradeManager.getUpgradeCost(upgrade.id) : 0;
    const canAfford = this.moneyAvailable >= cost;

    const frameColor = canUpgrade && canAfford ? 0x00aa00 : canUpgrade ? 0xaa6600 : 0x666666;
    const frame = new Graphics();
    frame.rect(0, 0, width, height);
    frame.stroke({ width: 3, color: frameColor });
    button.addChild(frame);

    // Title
    const titleText = new Text({
      text: upgrade.name,
      style: {
        fontFamily: 'Impact, Arial Black, sans-serif',
        fontSize: 20,
        fill: 0xffcc00,
        fontWeight: 'bold',
      },
    });
    titleText.position.set(10, 10);
    button.addChild(titleText);

    // Level indicator
    const levelText = new Text({
      text: `Level ${upgrade.level}/${upgrade.maxLevel}`,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: 0xcccccc,
      },
    });
    levelText.anchor.set(1, 0);
    levelText.position.set(width - 10, 10);
    button.addChild(levelText);

    // Description
    const descText = new Text({
      text: upgrade.description,
      style: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fill: 0xaaaaaa,
        wordWrap: true,
        wordWrapWidth: width - 20,
      },
    });
    descText.position.set(10, 40);
    button.addChild(descText);

    // Cost and button
    if (canUpgrade) {
      const costBg = new Graphics();
      costBg.roundRect(10, height - 35, width - 20, 25, 5);
      costBg.fill(canAfford ? 0x00aa00 : 0xaa6600);
      button.addChild(costBg);

      const costText = new Text({
        text: `Upgrade - $${cost}`,
        style: {
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 16,
          fill: 0xffffff,
          fontWeight: 'bold',
        },
      });
      costText.anchor.set(0.5, 0.5);
      costText.position.set(width / 2, height - 22);
      button.addChild(costText);

      if (canAfford) {
        button.eventMode = 'static';
        button.cursor = 'pointer';

        button.on('pointerover', () => {
          costBg.clear();
          costBg.roundRect(10, height - 35, width - 20, 25, 5);
          costBg.fill(0x00ff00);
        });

        button.on('pointerout', () => {
          costBg.clear();
          costBg.roundRect(10, height - 35, width - 20, 25, 5);
          costBg.fill(0x00aa00);
        });

        button.on('pointerdown', event => {
          event.stopPropagation();
          this.purchaseUpgrade(upgrade.id);
        });
      }
    } else {
      const maxLevelBg = new Graphics();
      maxLevelBg.roundRect(10, height - 35, width - 20, 25, 5);
      maxLevelBg.fill(0x666666);
      button.addChild(maxLevelBg);

      const maxText = new Text({
        text: 'MAX LEVEL',
        style: {
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSize: 16,
          fill: 0xaaaaaa,
          fontWeight: 'bold',
        },
      });
      maxText.anchor.set(0.5, 0.5);
      maxText.position.set(width / 2, height - 22);
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
    this.updateUpgradeDisplay();
  }

  public hide(): void {
    this.visible = false;
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }
}
