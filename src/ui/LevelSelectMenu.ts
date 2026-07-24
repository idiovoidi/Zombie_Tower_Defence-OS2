import { Graphics, Text } from 'pixi.js';
import type { LevelData } from '../managers/LevelManager';
import { UIComponent } from './UIComponent';

export class LevelSelectMenu extends UIComponent {
  private titleText: Text;
  private levelButtons: { button: Graphics; text: Text; levelId: string }[];
  private backButton: Graphics;
  private backButtonText: Text;
  private onLevelSelectCallback: ((levelId: string) => void) | null = null;
  private onBackCallback: (() => void) | null = null;

  constructor() {
    super();

    this.titleText = new Text({
      text: 'SELECT LEVEL',
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.position.set(512, 60);
    this.addChild(this.titleText);

    this.levelButtons = [];

    this.backButton = new Graphics();
    this.backButton.roundRect(0, 0, 150, 50, 10).fill(0xff0000);
    this.backButton.position.set(50, 700);
    this.backButton.eventMode = 'static';
    this.backButton.cursor = 'pointer';
    this.backButton.on('pointerdown', event => {
      event.stopPropagation();
      this.onBackClicked();
    });
    this.addChild(this.backButton);

    this.backButtonText = new Text({
      text: 'BACK',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.backButtonText.anchor.set(0.5);
    this.backButtonText.position.set(125, 725);
    this.addChild(this.backButtonText);
  }

  public updateLevels(levels: LevelData[]): void {
    this.levelButtons.forEach(item => {
      item.button.destroy({ children: true });
      item.text.destroy({ children: true });
    });
    this.levelButtons = [];

    const campaign = levels.filter(l => !l.id.startsWith('custom_'));
    const custom = levels.filter(l => l.id.startsWith('custom_'));

    campaign.forEach((level, index) => {
      this.createLevelButton(level, index, false);
    });

    custom.forEach((level, index) => {
      const slot = campaign.length + index;
      this.createLevelButton(level, slot, true);
    });
  }

  private createLevelButton(level: LevelData, index: number, isCustom: boolean): void {
    const x = 80 + (index % 4) * 220;
    const y = 120 + Math.floor(index / 4) * 110;

    const button = new Graphics();
    button.roundRect(0, 0, 200, 80, 10).fill(isCustom ? 0x2266aa : 0x00aa00);
    button.position.set(x, y);
    button.eventMode = 'static';
    button.cursor = 'pointer';
    button.on('pointerdown', event => {
      event.stopPropagation();
      this.onLevelSelected(level.id);
    });
    this.addChild(button);

    const suffix = isCustom ? '\n(custom)' : '';
    const levelText = new Text({
      text: `${level.name}\n${level.difficulty}${suffix}`,
      style: {
        fontFamily: 'Arial',
        fontSize: 15,
        fill: 0xffffff,
        align: 'center',
      },
    });
    levelText.anchor.set(0.5);
    levelText.position.set(x + 100, y + 40);
    this.addChild(levelText);

    this.levelButtons.push({
      button,
      text: levelText,
      levelId: level.id,
    });
  }

  public update(_deltaTime: number): void {
    // Level select menu animation or updates
  }

  private onLevelSelected(levelId: string): void {
    this.onLevelSelectCallback?.(levelId);
  }

  private onBackClicked(): void {
    this.onBackCallback?.();
  }

  public setLevelSelectCallback(callback: (levelId: string) => void): void {
    this.onLevelSelectCallback = callback;
  }

  public setBackCallback(callback: () => void): void {
    this.onBackCallback = callback;
  }
}
