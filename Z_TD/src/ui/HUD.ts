import { UIComponent } from './UIComponent';
import { Text, Graphics, Container } from 'pixi.js';

export class HUD extends UIComponent {
  private moneyText: Text;
  private livesText: Text;
  private waveText: Text;
  private resourcesText: Text;
  private nextWaveButton: Container;
  private nextWaveCallback: (() => void) | null = null;

  constructor() {
    super();

    // Create text elements for the HUD
    this.moneyText = new Text({
      text: 'Money: $0',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.moneyText.position.set(10, 10);
    this.addChild(this.moneyText);

    this.livesText = new Text({
      text: 'Lives: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.livesText.position.set(10, 40);
    this.addChild(this.livesText);

    this.waveText = new Text({
      text: 'Wave: 0',
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.waveText.position.set(10, 70);
    this.addChild(this.waveText);

    this.resourcesText = new Text({
      text: 'Resources: W:0 M:0 E:0',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        align: 'center',
      },
    });
    this.resourcesText.position.set(10, 100);
    this.addChild(this.resourcesText);

    // Create next wave button
    this.nextWaveButton = this.createNextWaveButton();
    this.nextWaveButton.position.set(850, 700);
    this.nextWaveButton.visible = false; // Hidden by default
    this.addChild(this.nextWaveButton);
  }

  private createNextWaveButton(): Container {
    const button = new Container();
    button.eventMode = 'static';
    button.cursor = 'pointer';

    // Button background
    const bg = new Graphics();
    bg.roundRect(0, 0, 150, 50, 10).fill(0x00aa00);
    bg.stroke({ width: 2, color: 0x00ff00 });
    button.addChild(bg);

    // Button text
    const text = new Text({
      text: 'Next Wave',
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        align: 'center',
      },
    });
    text.anchor.set(0.5);
    text.position.set(75, 25);
    button.addChild(text);

    // Hover effects
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, 150, 50, 10).fill(0x00cc00);
      bg.stroke({ width: 2, color: 0x00ff00 });
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, 150, 50, 10).fill(0x00aa00);
      bg.stroke({ width: 2, color: 0x00ff00 });
    });

    button.on('pointerdown', () => {
      if (this.nextWaveCallback) {
        this.nextWaveCallback();
      }
    });

    return button;
  }

  public update(_deltaTime: number): void {
    // HUD updates would happen when game state changes
  }

  // Update HUD values
  public updateMoney(money: number): void {
    this.moneyText.text = `Money: $${money}`;
  }

  public updateLives(lives: number): void {
    this.livesText.text = `Lives: ${lives}`;
  }

  public updateWave(wave: number): void {
    this.waveText.text = `Wave: ${wave}`;
  }

  public updateResources(wood: number, metal: number, energy: number): void {
    this.resourcesText.text = `Resources: W:${Math.floor(wood)} M:${Math.floor(metal)} E:${Math.floor(energy)}`;
  }

  public showNextWaveButton(): void {
    this.nextWaveButton.visible = true;
  }

  public hideNextWaveButton(): void {
    this.nextWaveButton.visible = false;
  }

  public setNextWaveCallback(callback: () => void): void {
    this.nextWaveCallback = callback;
  }
}
