import { Application } from 'pixi.js';
import { GameConfig } from '@config/gameConfig';

export class ScaleManager {
  private app: Application;
  private baseWidth: number;
  private baseHeight: number;
  private currentScale: number = 1;

  constructor(app: Application) {
    this.app = app;
    this.baseWidth = GameConfig.SCREEN_WIDTH;
    this.baseHeight = GameConfig.SCREEN_HEIGHT;

    this.setupResizeHandler();
    this.updateScale();
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      this.updateScale();
    });
  }

  private updateScale(): void {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate scale to fit while maintaining aspect ratio
    const scaleX = windowWidth / this.baseWidth;
    const scaleY = windowHeight / this.baseHeight;

    // Use the smaller scale to ensure everything fits
    this.currentScale = Math.min(scaleX, scaleY);

    // Apply scale to the stage
    this.app.stage.scale.set(this.currentScale);

    // Center the game
    const scaledWidth = this.baseWidth * this.currentScale;
    const scaledHeight = this.baseHeight * this.currentScale;

    this.app.stage.position.set((windowWidth - scaledWidth) / 2, (windowHeight - scaledHeight) / 2);

    // Update canvas size
    this.app.renderer.resize(windowWidth, windowHeight);
  }

  public getScale(): number {
    return this.currentScale;
  }

  public getScaledDimensions(): { width: number; height: number } {
    return {
      width: this.baseWidth * this.currentScale,
      height: this.baseHeight * this.currentScale,
    };
  }

  // Convert screen coordinates to game coordinates
  public screenToGame(screenX: number, screenY: number): { x: number; y: number } {
    const bounds = this.app.stage.getBounds();
    return {
      x: (screenX - bounds.x) / this.currentScale,
      y: (screenY - bounds.y) / this.currentScale,
    };
  }
}
