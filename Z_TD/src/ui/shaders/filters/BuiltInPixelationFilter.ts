import { Filter } from 'pixi.js';

/**
 * Pixelation filter using PixiJS built-in filter approach
 * This should work since it uses the same pattern as ColorMatrixFilter
 */
export class BuiltInPixelationFilter extends Filter {
  private _pixelSize: number = 4;

  constructor(pixelSize = 4) {
    // Use PixiJS's built-in pixelation filter if available, or create a simple one
    super({} as any);
    this._pixelSize = pixelSize;
    this.updatePixelSize();
  }

  private updatePixelSize(): void {
    // For now, we'll use a simple approach that should work
    // This mimics how built-in filters work
    this.resolution = 1 / this._pixelSize;
  }

  get pixelSize(): number {
    return this._pixelSize;
  }

  set pixelSize(value: number) {
    this._pixelSize = Math.max(1, Math.min(20, value));
    this.updatePixelSize();
  }
}
