import { UIComponent } from './UIComponent';
import { Text, Graphics } from 'pixi.js';

export class MainMenu extends UIComponent {
  private titleText: Text;
  private startButton: Graphics;
  private startButtonText: Text;
  private onStartCallback: (() => void) | null = null;

  constructor() {
    super();

    // Create title
    this.titleText = new Text({
      text: 'ZOMBIE TOWER DEFENSE',
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        fill: 0xff0000,
        align: 'center',
      },
    });
    this.titleText.anchor.set(0.5);
    this.titleText.position.set(512, 200); // Centered on screen
    this.addChild(this.titleText);

    // Create start button
    this.startButton = new Graphics();
    this.startButton.roundRect(0, 0, 200, 50, 10).fill(0x00ff00);
    this.startButton.position.set(412, 300); // Centered horizontally
    this.startButton.eventMode = 'static';
    this.startButton.cursor = 'pointer';
    this.startButton.on('pointerdown', event => {
      event.stopPropagation();
      this.onStartClicked();
    });
    this.addChild(this.startButton);

    // Create start button text
    this.startButtonText = new Text({
      text: 'START GAME',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x000000,
        align: 'center',
      },
    });
    this.startButtonText.anchor.set(0.5);
    this.startButtonText.position.set(512, 325); // Centered on button
    this.addChild(this.startButtonText);
  }

  public update(_deltaTime: number): void {
    // Main menu animation or updates
  }

  private onStartClicked(): void {
    console.log('Start button clicked');
    if (this.onStartCallback) {
      this.onStartCallback();
    }
  }

  public setStartCallback(callback: () => void): void {
    this.onStartCallback = callback;
  }
}
