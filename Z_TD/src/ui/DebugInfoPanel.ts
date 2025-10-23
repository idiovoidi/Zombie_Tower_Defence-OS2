import { UIComponent } from './UIComponent';
import { Container, Graphics, Text } from 'pixi.js';

export class DebugInfoPanel extends UIComponent {
  private background!: Graphics;
  private titleText!: Text;
  private contentContainer!: Container;
  private isExpanded: boolean = false;
  private toggleButton!: Container;
  private onOpenShaderTest?: () => void;
  private onOpenWaveInfo?: () => void;
  private onOpenBestiary?: () => void;
  private onOpenStats?: () => void;
  private onOpenAIControl?: () => void;

  constructor() {
    super();
    this.createPanel();
  }

  // Set callbacks for opening debug panels
  public setShaderTestCallback(callback: () => void): void {
    this.onOpenShaderTest = callback;
  }

  public setWaveInfoCallback(callback: () => void): void {
    this.onOpenWaveInfo = callback;
  }

  public setBestiaryCallback(callback: () => void): void {
    this.onOpenBestiary = callback;
  }

  public setStatsCallback(callback: () => void): void {
    this.onOpenStats = callback;
  }

  public setAIControlCallback(callback: () => void): void {
    this.onOpenAIControl = callback;
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

    // Main panel (hidden by default) - will be added to stage separately
    this.background = new Graphics();
    this.contentContainer = new Container();
    this.contentContainer.visible = false;

    this.createPanelContent();
  }

  // Get the content container to add it to the stage separately
  public getContentContainer(): Container {
    return this.contentContainer;
  }

  private createPanelContent(): void {
    // Position at absolute screen coordinates (centered)
    const panelWidth = 280;
    const panelHeight = 500;
    this.contentContainer.position.set(640 - panelWidth / 2, 384 - panelHeight / 2);

    // Background - simple positioning from (0,0)
    const panelLeft = 0;
    const panelTop = 0;

    this.background
      .roundRect(panelLeft, panelTop, panelWidth, panelHeight, 10)
      .fill({ color: 0x1a1a1a, alpha: 0.95 });
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
    this.titleText.position.set(panelLeft + 10, panelTop + 10);
    this.contentContainer.addChild(this.titleText);

    let yPos = panelTop + 45;

    // Debug Panels Section
    const panelsTitle = new Text({
      text: '🔧 Debug Panels:',
      style: {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0xffff00,
        fontWeight: 'bold',
      },
    });
    panelsTitle.position.set(panelLeft + 10, yPos);
    this.contentContainer.addChild(panelsTitle);
    yPos += 30;

    // Performance Stats Button
    const statsButton = this.createPanelButton('📊 Performance Stats', 0x4caf50, () => {
      if (this.onOpenStats) {
        this.onOpenStats();
      }
      this.close();
    });
    statsButton.position.set(panelLeft + 20, yPos);
    this.contentContainer.addChild(statsButton);
    yPos += 40;

    // Shader Test Button
    const shaderButton = this.createPanelButton('🎨 Shader Test', 0x9966ff, () => {
      if (this.onOpenShaderTest) {
        this.onOpenShaderTest();
      }
      this.close();
    });
    shaderButton.position.set(panelLeft + 20, yPos);
    this.contentContainer.addChild(shaderButton);
    yPos += 40;

    // Wave Info Button
    const waveButton = this.createPanelButton('📊 Wave Info', 0xffcc00, () => {
      if (this.onOpenWaveInfo) {
        this.onOpenWaveInfo();
      }
      this.close();
    });
    waveButton.position.set(panelLeft + 20, yPos);
    this.contentContainer.addChild(waveButton);
    yPos += 40;

    // Bestiary Button
    const bestiaryButton = this.createPanelButton('📖 Bestiary', 0xff0000, () => {
      if (this.onOpenBestiary) {
        this.onOpenBestiary();
      }
      this.close();
    });
    bestiaryButton.position.set(panelLeft + 20, yPos);
    this.contentContainer.addChild(bestiaryButton);
    yPos += 40;

    // AI Control Button
    const aiButton = this.createPanelButton('🤖 AI Control', 0x00aaff, () => {
      if (this.onOpenAIControl) {
        this.onOpenAIControl();
      }
      this.close();
    });
    aiButton.position.set(panelLeft + 20, yPos);
    this.contentContainer.addChild(aiButton);
    yPos += 50;

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
    controlsTitle.position.set(panelLeft + 10, yPos + 20);
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
    controls.forEach(control => {
      const text = new Text({
        text: control,
        style: {
          fontFamily: 'Arial',
          fontSize: 11,
          fill: 0xcccccc,
        },
      });
      text.position.set(panelLeft + 20, yPos);
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
    configTitle.position.set(panelLeft + 10, yPos + 20);
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
    configText.position.set(panelLeft + 20, yPos + 45);
    this.contentContainer.addChild(configText);

    this.addChild(this.contentContainer);
  }

  private createPanelButton(label: string, color: number, onClick: () => void): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    const bg = new Graphics();
    bg.roundRect(0, 0, 240, 30, 5).fill({ color: 0x2a2a2a, alpha: 0.9 });
    bg.stroke({ width: 2, color: color });
    button.addChild(bg);

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial',
        fontSize: 13,
        fill: color,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.position.set(120, 15);
    button.addChild(text);

    button.on('pointerdown', onClick);

    return button;
  }

  private togglePanel(): void {
    this.isExpanded = !this.isExpanded;
    this.contentContainer.visible = this.isExpanded;
  }

  public close(): void {
    this.isExpanded = false;
    this.contentContainer.visible = false;
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
