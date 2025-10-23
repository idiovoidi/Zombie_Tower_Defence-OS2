import { Application } from 'pixi.js';
import { GameConfig } from '@config/gameConfig';
import { DebugUtils } from './DebugUtils';

export class ScaleManager {
  private app: Application;
  private baseWidth: number = GameConfig.SCREEN_WIDTH;
  private baseHeight: number = GameConfig.SCREEN_HEIGHT;
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(app: Application) {
    this.app = app;
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

    // Calculate scale to fit the game while maintaining aspect ratio
    const scaleX = windowWidth / this.baseWidth;
    const scaleY = windowHeight / this.baseHeight;
    this.scale = Math.min(scaleX, scaleY);

    // Calculate centering offsets
    const scaledWidth = this.baseWidth * this.scale;
    const scaledHeight = this.baseHeight * this.scale;
    this.offsetX = (windowWidth - scaledWidth) / 2;
    this.offsetY = (windowHeight - scaledHeight) / 2;

    // Apply transformations directly to the main stage
    this.app.stage.scale.set(this.scale);
    this.app.stage.position.set(this.offsetX, this.offsetY);

    // Resize the renderer to fill the window
    this.app.renderer.resize(windowWidth, windowHeight);

    DebugUtils.debug(
      `Scale updated: Window ${windowWidth}x${windowHeight}, Scale ${this.scale.toFixed(3)}, Offset (${this.offsetX.toFixed(1)}, ${this.offsetY.toFixed(1)})`
    );
  }

  // Simple and reliable coordinate conversion
  public screenToGame(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.offsetX) / this.scale,
      y: (screenY - this.offsetY) / this.scale,
    };
  }

  // Getters for current values
  public getScale(): number {
    return this.scale;
  }

  public getOffset(): { x: number; y: number } {
    return { x: this.offsetX, y: this.offsetY };
  }

  public getGameBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.offsetX,
      y: this.offsetY,
      width: this.baseWidth * this.scale,
      height: this.baseHeight * this.scale,
    };
  }

  public getDebugInfo(): string {
    return `Scale: ${this.scale.toFixed(2)}, Offset: (${this.offsetX.toFixed(1)}, ${this.offsetY.toFixed(1)})`;
  }
}
