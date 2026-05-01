import { UIComponent } from './UIComponent';
import { Graphics, Text } from 'pixi.js';

export class GameOverScreen extends UIComponent {
  private background: Graphics;
  private titleText: Text;
  private scoreText: Text;
  private mainMenuButton: Graphics;
  private mainMenuButtonText: Text;
  private restartButton: Graphics;
  private restartButtonText: Text;
  private onMainMenuCallback: (() => void) | null = null;
  private onRestartCallback: (() => void) | null = null;

  constructor() {
    super();

    // Create semi-transparent background overlay
    this.background = new Graphics();
    this.background.rect(0, 0, 1024, 768).fill({ color: 0x000000, alpha: 0.8 });
    this.addChild(this.background);

    // Create "GAME OVER" title
    this.titleText = new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xff0000,
        align: 'center',
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.position.set(512, 250);
    this.addChild(this.titleText);

    // Create score display
    this.scoreText = new Text({
      text: 'Score: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 32,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.position.set(512, 340);
    this.addChild(this.scoreText);

    // Create restart button
    this.restartButton = new Graphics();
    this.restartButton.roundRect(0, 0, 200, 50, 10).fill(0x00ff00);
    this.restartButton.position.set(412, 420);
    this.restartButton.eventMode = 'static';
    this.restartButton.cursor = 'pointer';
    this.restartButton.on('pointerdown', event => {
      event.stopPropagation();
      this.onRestartClicked();
    });
    this.addChild(this.restartButton);

    this.restartButtonText = new Text({
      text: 'RESTART',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x000000,
        align: 'center',
      },
    });
    this.restartButtonText.anchor.set(0.5);
    this.restartButtonText.position.set(512, 445);
    this.addChild(this.restartButtonText);

    // Create main menu button
    this.mainMenuButton = new Graphics();
    this.mainMenuButton.roundRect(0, 0, 200, 50, 10).fill(0x4444ff);
    this.mainMenuButton.position.set(412, 490);
    this.mainMenuButton.eventMode = 'static';
    this.mainMenuButton.cursor = 'pointer';
    this.mainMenuButton.on('pointerdown', event => {
      event.stopPropagation();
      this.onMainMenuClicked();
    });
    this.addChild(this.mainMenuButton);

    this.mainMenuButtonText = new Text({
      text: 'MAIN MENU',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.mainMenuButtonText.anchor.set(0.5);
    this.mainMenuButtonText.position.set(512, 515);
    this.addChild(this.mainMenuButtonText);

    // Hide by default
    this.visible = false;
  }

  public update(_deltaTime: number): void {
    // No animations needed for now
  }

  public showGameOver(score: number): void {
    this.scoreText.text = `Score: ${score}`;
    this.visible = true;
  }

  private onRestartClicked(): void {
    console.log('Restart button clicked');
    if (this.onRestartCallback) {
      this.onRestartCallback();
    }
  }

  private onMainMenuClicked(): void {
    console.log('Main menu button clicked');
    if (this.onMainMenuCallback) {
      this.onMainMenuCallback();
    }
  }

  public setRestartCallback(callback: () => void): void {
    this.onRestartCallback = callback;
  }

  public setMainMenuCallback(callback: () => void): void {
    this.onMainMenuCallback = callback;
  }
}
