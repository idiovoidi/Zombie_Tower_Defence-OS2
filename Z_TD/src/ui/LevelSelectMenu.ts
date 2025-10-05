import { UIComponent } from './UIComponent';
import { Text, Graphics } from 'pixi.js';
import { LevelData } from '../managers/LevelManager';

export class LevelSelectMenu extends UIComponent {
  private titleText: Text;
  private levelButtons: { button: Graphics; text: Text; levelId: string }[];
  private backButton: Graphics;
  private backButtonText: Text;
  private onLevelSelectCallback: ((levelId: string) => void) | null = null;
  private onBackCallback: (() => void) | null = null;

  constructor() {
    super();

    // Create title
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
    this.titleText.position.set(512, 100);
    this.addChild(this.titleText);

    // Create level buttons (will be populated dynamically)
    this.levelButtons = [];

    // Create back button
    this.backButton = new Graphics();
    this.backButton.roundRect(0, 0, 150, 50, 10).fill(0xff0000);
    this.backButton.position.set(50, 650);
    this.backButton.eventMode = 'static';
    this.backButton.cursor = 'pointer';
    this.backButton.on('pointerdown', (event) => {
      event.stopPropagation();
      this.onBackClicked();
    });
    this.addChild(this.backButton);

    // Create back button text
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
    this.backButtonText.position.set(125, 675);
    this.addChild(this.backButtonText);
  }

  public updateLevels(levels: LevelData[]): void {
    // Clear existing level buttons
    this.levelButtons.forEach(item => {
      item.button.destroy();
      item.text.destroy();
    });
    this.levelButtons = [];

    // Create buttons for each level
    levels.forEach((level, index) => {
      const x = 200 + (index % 3) * 220;
      const y = 200 + Math.floor(index / 3) * 120;

      // Create level button
      const button = new Graphics();
      button.roundRect(0, 0, 200, 80, 10).fill(0x00aa00);
      button.position.set(x, y);
      button.eventMode = 'static';
      button.cursor = 'pointer';
      button.on('pointerdown', (event) => {
        event.stopPropagation();
        this.onLevelSelected(level.id);
      });
      this.addChild(button);

      // Create level text
      const levelText = new Text({
        text: `${level.name}\n${level.difficulty}`,
        style: {
          fontFamily: 'Arial',
          fontSize: 16,
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
    });
  }

  public update(_deltaTime: number): void {
    // Level select menu animation or updates
  }

  private onLevelSelected(levelId: string): void {
    console.log(`Level selected: ${levelId}`);
    if (this.onLevelSelectCallback) {
      this.onLevelSelectCallback(levelId);
    }
  }

  private onBackClicked(): void {
    console.log('Back button clicked');
    if (this.onBackCallback) {
      this.onBackCallback();
    }
  }

  public setLevelSelectCallback(callback: (levelId: string) => void): void {
    this.onLevelSelectCallback = callback;
  }

  public setBackCallback(callback: () => void): void {
    this.onBackCallback = callback;
  }
}
