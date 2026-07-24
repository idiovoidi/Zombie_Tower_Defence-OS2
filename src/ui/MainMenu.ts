import { Graphics, Text } from 'pixi.js';
import { UIComponent } from './UIComponent';

export class MainMenu extends UIComponent {
  private titleText: Text;
  private startButton: Graphics;
  private startButtonText: Text;
  private mapCreatorButton: Graphics;
  private mapCreatorButtonText: Text;
  private onStartCallback: (() => void) | null = null;
  private onMapCreatorCallback: (() => void) | null = null;

  constructor() {
    super();

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
    this.titleText.position.set(512, 200);
    this.addChild(this.titleText);

    this.startButton = new Graphics();
    this.startButton.roundRect(0, 0, 200, 50, 10).fill(0x00ff00);
    this.startButton.position.set(412, 300);
    this.startButton.eventMode = 'static';
    this.startButton.cursor = 'pointer';
    this.startButton.on('pointerdown', event => {
      event.stopPropagation();
      this.onStartClicked();
    });
    this.addChild(this.startButton);

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
    this.startButtonText.position.set(512, 325);
    this.addChild(this.startButtonText);

    this.mapCreatorButton = new Graphics();
    this.mapCreatorButton.roundRect(0, 0, 200, 50, 10).fill(0x4488cc);
    this.mapCreatorButton.position.set(412, 370);
    this.mapCreatorButton.eventMode = 'static';
    this.mapCreatorButton.cursor = 'pointer';
    this.mapCreatorButton.on('pointerdown', event => {
      event.stopPropagation();
      this.onMapCreatorClicked();
    });
    this.addChild(this.mapCreatorButton);

    this.mapCreatorButtonText = new Text({
      text: 'MAP CREATOR',
      style: {
        fontFamily: 'Arial',
        fontSize: 22,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.mapCreatorButtonText.anchor.set(0.5);
    this.mapCreatorButtonText.position.set(512, 395);
    this.addChild(this.mapCreatorButtonText);
  }

  public update(_deltaTime: number): void {
    // Main menu animation or updates
  }

  private onStartClicked(): void {
    this.onStartCallback?.();
  }

  private onMapCreatorClicked(): void {
    this.onMapCreatorCallback?.();
  }

  public setStartCallback(callback: () => void): void {
    this.onStartCallback = callback;
  }

  public setMapCreatorCallback(callback: () => void): void {
    this.onMapCreatorCallback = callback;
  }
}
