import { BlurFilter, ColorMatrixFilter } from 'pixi.js';

/**
 * Alternative pixelation using multiple built-in filters
 * Since custom shaders don't work, let's combine built-in filters
 */
export class AlternativePixelationFilter extends ColorMatrixFilter {
  private _pixelSize: number = 4;
  private blurFilter: BlurFilter;

  constructor(pixelSize = 4) {
    super();
    console.log('🎨 AlternativePixelationFilter: Creating filter');

    this._pixelSize = pixelSize;
    this.blurFilter = new BlurFilter();
    this.updateEffect();
  }

  private updateEffect(): void {
    // Use blur and color matrix to simulate pixelation
    const blurAmount = this._pixelSize * 0.5;
    this.blurFilter.blur = blurAmount;

    // Reduce color precision to simulate pixelation
    const colorReduction = Math.max(0.1, 1 - this._pixelSize * 0.05);
    this.matrix = [
      colorReduction,
      0,
      0,
      0,
      0,
      0,
      colorReduction,
      0,
      0,
      0,
      0,
      0,
      colorReduction,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ];

    console.log(
      '🎨 AlternativePixelationFilter: Updated effect, blur:',
      blurAmount,
      'color:',
      colorReduction
    );
  }

  get pixelSize(): number {
    return this._pixelSize;
  }

  set pixelSize(value: number) {
    this._pixelSize = Math.max(1, Math.min(20, value));
    this.updateEffect();
    console.log('🎨 AlternativePixelationFilter: Pixel size set to', this._pixelSize);
  }

  /**
   * Get current pixel size
   */
  getPixelSize(): number {
    return this._pixelSize;
  }

  /**
   * Set pixel size
   */
  setPixelSize(size: number): void {
    this.pixelSize = size;
  }
}
