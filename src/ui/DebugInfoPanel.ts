import { Text } from 'pixi.js';
import { UIPanel } from './UIPanel';

export class DebugInfoPanel extends UIPanel {
  private onOpenShaderTest?: () => void;
  private onOpenWaveInfo?: () => void;
  private onOpenBestiary?: () => void;
  private onOpenStats?: () => void;
  private onOpenAIControl?: () => void;
  private onProgressToNextLevel?: () => void;

  constructor() {
    super();
    this.createToggleButton('🐛 Debug Info', 120, 0x00ff00);
    this.createPanelFrame(280, 500, 'Debug Information', '', 0x00ff00);
    this.buildPanelContent();
  }

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
  public setProgressToNextLevelCallback(callback: () => void): void {
    this.onProgressToNextLevel = callback;
  }

  private buildPanelContent(): void {
    const _panelWidth = 280;
    let yPos = 45;

    const panelsTitle = new Text({
      text: '🔧 Debug Panels:',
      style: { fontFamily: 'Arial', fontSize: 14, fill: 0xffff00, fontWeight: 'bold' },
    });
    panelsTitle.position.set(10, yPos);
    this.contentContainer.addChild(panelsTitle);
    yPos += 30;

    const buttons: Array<[string, number, () => void]> = [
      [
        '📊 Performance Stats',
        0x4caf50,
        () => {
          this.onOpenStats?.();
          this.close();
        },
      ],
      [
        '🎨 Shader Test',
        0x9966ff,
        () => {
          this.onOpenShaderTest?.();
          this.close();
        },
      ],
      [
        '📊 Wave Info',
        0xffcc00,
        () => {
          this.onOpenWaveInfo?.();
          this.close();
        },
      ],
      [
        '📖 Bestiary',
        0xff0000,
        () => {
          this.onOpenBestiary?.();
          this.close();
        },
      ],
      [
        '🤖 AI Control',
        0x00aaff,
        () => {
          this.onOpenAIControl?.();
          this.close();
        },
      ],
      [
        '📈 Progress Level',
        0xff6600,
        () => {
          this.onProgressToNextLevel?.();
          this.close();
        },
      ],
    ];

    for (const [label, color, handler] of buttons) {
      const btn = this.createActionButton(label, 240, 30, color, handler);
      btn.position.set(20, yPos);
      this.contentContainer.addChild(btn);
      yPos += 40;
    }

    yPos += 10;
    const controlsTitle = new Text({
      text: '⌨️ Debug Controls:',
      style: { fontFamily: 'Arial', fontSize: 14, fill: 0xffff00, fontWeight: 'bold' },
    });
    controlsTitle.position.set(10, yPos);
    this.contentContainer.addChild(controlsTitle);
    yPos += 25;

    const controls = [
      'D - Toggle Debug Info',
      'G - Toggle God Mode',
      'K - Kill All Zombies',
      'N - Next Wave',
      'M - Add $1000',
      'R - Show Ranges',
    ];
    for (const control of controls) {
      const text = new Text({
        text: control,
        style: { fontFamily: 'Arial', fontSize: 11, fill: 0xcccccc },
      });
      text.position.set(20, yPos);
      this.contentContainer.addChild(text);
      yPos += 18;
    }

    yPos += 20;
    const configTitle = new Text({
      text: '⚙️ Debug Config:',
      style: { fontFamily: 'Arial', fontSize: 14, fill: 0xffff00, fontWeight: 'bold' },
    });
    configTitle.position.set(10, yPos);
    this.contentContainer.addChild(configTitle);

    const configText = new Text({
      text: 'Edit: src/config/debugConstants.ts',
      style: { fontFamily: 'Arial', fontSize: 10, fill: 0x00ff00, fontStyle: 'italic' },
    });
    configText.position.set(20, yPos + 25);
    this.contentContainer.addChild(configText);
  }

  public update(_deltaTime: number): void {
    // Debug info updates handled on toggle
  }
}
