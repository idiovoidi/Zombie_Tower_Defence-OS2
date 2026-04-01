import { UIComponent } from './UIComponent';
import { Container } from 'pixi.js';

export class HUD extends UIComponent {
  private nextWaveButton: Container;

  constructor() {
    super();
    // HUD is now mostly empty - info moved to BottomBar
    // Keeping this component for backward compatibility and potential future overlays

    // Create next wave button (kept for backward compatibility)
    this.nextWaveButton = new Container();
    this.nextWaveButton.visible = false;
    this.addChild(this.nextWaveButton);
  }

  public update(_deltaTime: number): void {
    // HUD updates would happen when game state changes
  }

  // Keep these methods for backward compatibility (no-ops now)
  public updateMoney(_money: number): void {
    // Info now displayed in BottomBar
  }

  public updateLives(_lives: number): void {
    // Info now displayed in BottomBar
  }

  public updateWave(_wave: number): void {
    // Info now displayed in BottomBar
  }

  public updateResources(_wood: number, _metal: number, _energy: number): void {
    // Info now displayed in BottomBar
  }

  public showNextWaveButton(): void {
    // Button now in BottomBar
  }

  public hideNextWaveButton(): void {
    // Button now in BottomBar
  }

  public setNextWaveCallback(_callback: () => void): void {
    // Callback stored for future use when next wave button is re-enabled
  }
}
