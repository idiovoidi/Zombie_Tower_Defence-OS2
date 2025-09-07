import { UIComponent } from './UIComponent';
import { Text, Graphics } from 'pixi.js';

export class MainMenu extends UIComponent {
  private titleText: Text;
  private startButton: Graphics;
  private startButtonText: Text;
  
  constructor() {
    super();
    
    // Create title
    this.titleText = new Text('ZOMBIE TOWER DEFENSE', {
      fontFamily: 'Arial',
      fontSize: 36,
      fontWeight: 'bold',
      fill: 0xff0000,
      align: 'center',
    });
    this.titleText.anchor.set(0.5);
    this.titleText.position.set(512, 200); // Centered on screen
    this.addChild(this.titleText);
    
    // Create start button
    this.startButton = new Graphics();
    this.startButton.beginFill(0x00ff00);
    this.startButton.drawRoundedRect(0, 0, 200, 50, 10);
    this.startButton.endFill();
    this.startButton.position.set(412, 300); // Centered horizontally
    this.startButton.interactive = true;
    this.startButton.buttonMode = true;
    this.startButton.on('pointerdown', () => this.onStartClicked());
    this.addChild(this.startButton);
    
    // Create start button text
    this.startButtonText = new Text('START GAME', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x000000,
      align: 'center',
    });
    this.startButtonText.anchor.set(0.5);
    this.startButtonText.position.set(512, 325); // Centered on button
    this.addChild(this.startButtonText);
  }
  
  public update(deltaTime: number): void {
    // Main menu animation or updates
  }
  
  private onStartClicked(): void {
    // This would trigger a game state change to PLAYING
    console.log('Start button clicked');
  }
}