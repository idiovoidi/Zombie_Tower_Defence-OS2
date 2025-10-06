import { UIComponent } from './UIComponent';
import { Graphics, Text, Container } from 'pixi.js';

export class DebugInfoPanel extends UIComponent {
  private background!: Graphics;
  private titleText!: Text;
  private contentContainer!: Container;
  private isExpanded: boolean = false;
  private toggleButton!: Container;
  private zombieInfoTexts: Map<string, Text> = new Map();
  private gameStatsTexts: Map<string, Text> = new Map();

  constructor() {
    super();
    this.createPanel();
  }

  private createPanel(): void {
    // Toggle button (always visible)
    this.toggleButton = new Container();
    this.toggleButton.eventMode = 'static';
    this.toggleButton.cursor = 'pointer';

    const buttonBg = new Graphics();
    buttonBg.roundRect(0, 0, 120, 30, 5).fill({ color: 0x1a1a1a, alpha: 0.9 });
    buttonBg.stroke({ width: 2, color: 0x00ff00 });
    this.toggleButton.addChild(buttonBg);

    const buttonText = new Text({
      text: '🐛 Debug Info',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0x00ff00,
        fontWeight: 'bold',
      },
    });
    buttonText.anchor.set(0.5);
    buttonText.position.set(60, 15);
    this.toggleButton.addChild(buttonText);

    this.toggleButton.on('pointerdown', () => {
      this.togglePanel();
    });

    this.addChild(this.toggleButton);

    // Main panel (hidden by default)
    this.background = new Graphics();
    this.contentContainer = new Container();
    this.contentContainer.visible = false;

    this.createPanelContent();
  }

  private createPanelContent(): void {
    // Background - opens to the left
    const panelWidth = 280;
    const panelHeight = 580;
    this.background.roundRect(-panelWidth, 35, panelWidth, panelHeight, 10).fill({ color: 0x1a1a1a, alpha: 0.95 });
    this.background.stroke({ width: 2, color: 0x00ff00 });
    this.contentContainer.addChild(this.background);

    // Title
    this.titleText = new Text({
      text: 'Debug Information',
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: 0x00ff00,
        fontWeight: 'bold',
      },
    });
    this.titleText.position.set(-panelWidth + 10, 45);
    this.contentContainer.addChild(this.titleText);

    // Zombie Types Section
    const zombieTitle = new Text({
      text: '🧟 Zombie Types:',
      style: {
        fontFamily: 'Arial',
        fontSize: 13,
        fill: 0xffff00,
        fontWeight: 'bold',
      },
    });
    zombieTitle.position.set(-panelWidth + 10, 75);
    this.contentContainer.addChild(zombieTitle);

    // Create text for each zombie type
    const zombieTypes = [
      { type: 'Basic', color: 0x00ff00, desc: 'Standard' },
      { type: 'Fast', color: 0xff6600, desc: 'Runner' },
      { type: 'Tank', color: 0xff0000, desc: 'High HP' },
      { type: 'Armored', color: 0x888888, desc: 'Armored' },
      { type: 'Swarm', color: 0xffff00, desc: 'Numerous' },
      { type: 'Stealth', color: 0x6600ff, desc: 'Sneaky' },
      { type: 'Mechanical', color: 0x00ffff, desc: 'Robot' },
    ];

    let yPos = 98;
    zombieTypes.forEach((zombie) => {
      const text = new Text({
        text: `${zombie.type}: ${zombie.desc}`,
        style: {
          fontFamily: 'Arial',
          fontSize: 10,
          fill: zombie.color,
        },
      });
      text.position.set(-panelWidth + 20, yPos);
      this.contentContainer.addChild(text);
      this.zombieInfoTexts.set(zombie.type, text);
      yPos += 16;
    });

    // Game Stats Section
    const statsTitle = new Text({
      text: '📊 Game Stats:',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffff00,
        fontWeight: 'bold',
      },
    });
    statsTitle.position.set(10, yPos + 20);
    this.contentContainer.addChild(statsTitle);

    // Create stat text fields
    const statFields = [
      'Active Zombies',
      'Zombies Killed',
      'Active Towers',
      'Total Damage Dealt',
      'Wave Progress',
      'FPS',
    ];

    yPos += 45;
    statFields.forEach((field) => {
      const text = new Text({
        text: `${field}: 0`,
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: 0xffffff,
        },
      });
      text.position.set(20, yPos);
      this.contentContainer.addChild(text);
      this.gameStatsTexts.set(field, text);
      yPos += 20;
    });

    // Controls Section
    const controlsTitle = new Text({
      text: '⌨️ Debug Controls:',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffff00,
        fontWeight: 'bold',
      },
    });
    controlsTitle.position.set(10, yPos + 20);
    this.contentContainer.addChild(controlsTitle);

    const controls = [
      'D - Toggle Debug Info',
      'G - Toggle God Mode',
      'K - Kill All Zombies',
      'N - Next Wave',
      'M - Add $1000',
      'R - Show Ranges',
    ];

    yPos += 45;
    controls.forEach((control) => {
      const text = new Text({
        text: control,
        style: {
          fontFamily: 'Arial',
          fontSize: 11,
          fill: 0xcccccc,
        },
      });
      text.position.set(20, yPos);
      this.contentContainer.addChild(text);
      yPos += 18;
    });

    // Config Info
    const configTitle = new Text({
      text: '⚙️ Debug Config:',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffff00,
        fontWeight: 'bold',
      },
    });
    configTitle.position.set(10, yPos + 20);
    this.contentContainer.addChild(configTitle);

    const configText = new Text({
      text: 'Edit: src/config/debugConstants.ts',
      style: {
        fontFamily: 'Arial',
        fontSize: 10,
        fill: 0x00ff00,
        fontStyle: 'italic',
      },
    });
    configText.position.set(20, yPos + 45);
    this.contentContainer.addChild(configText);

    this.addChild(this.contentContainer);
  }

  private togglePanel(): void {
    this.isExpanded = !this.isExpanded;
    this.contentContainer.visible = this.isExpanded;
  }

  public updateStats(stats: {
    activeZombies?: number;
    zombiesKilled?: number;
    activeTowers?: number;
    totalDamage?: number;
    waveProgress?: string;
    fps?: number;
  }): void {
    if (stats.activeZombies !== undefined) {
      const text = this.gameStatsTexts.get('Active Zombies');
      if (text) text.text = `Active Zombies: ${stats.activeZombies}`;
    }

    if (stats.zombiesKilled !== undefined) {
      const text = this.gameStatsTexts.get('Zombies Killed');
      if (text) text.text = `Zombies Killed: ${stats.zombiesKilled}`;
    }

    if (stats.activeTowers !== undefined) {
      const text = this.gameStatsTexts.get('Active Towers');
      if (text) text.text = `Active Towers: ${stats.activeTowers}`;
    }

    if (stats.totalDamage !== undefined) {
      const text = this.gameStatsTexts.get('Total Damage Dealt');
      if (text) text.text = `Total Damage Dealt: ${Math.floor(stats.totalDamage)}`;
    }

    if (stats.waveProgress !== undefined) {
      const text = this.gameStatsTexts.get('Wave Progress');
      if (text) text.text = `Wave Progress: ${stats.waveProgress}`;
    }

    if (stats.fps !== undefined) {
      const text = this.gameStatsTexts.get('FPS');
      if (text) text.text = `FPS: ${Math.round(stats.fps)}`;
    }
  }

  public show(): void {
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }

  public update(_deltaTime: number): void {
    // Update logic if needed
  }
}
