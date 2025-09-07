import { UIComponent } from './UIComponent';
import { Text } from 'pixi.js';

export class HUD extends UIComponent {
  private moneyText: Text;
  private livesText: Text;
  private waveText: Text;
  private resourcesText: Text;
  
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
      }
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
      }
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
      }
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
      }
    });
    this.resourcesText.position.set(10, 100);
    this.addChild(this.resourcesText);
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
}