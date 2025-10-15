import { ColorMatrixFilter, Filter } from 'pixi.js';

/**
 * Enhanced pixelation filter that combines resolution and color reduction
 * for a better retro pixel effect
 */
export class EnhancedPixelationFilter extends Filter {
  private _pixelSize: number = 4;
  private colorFilter: ColorMatrixFilter;

  constructor(pixelSize = 4) {
    // Call super with empty options
    super({});
    console.log('✨ EnhancedPixelationFilter: Creating filter');

    this._pixelSize = pixelSize;
    this.colorFilter = new ColorMatrixFilter();

    this.updateEffect();
  }

  private updateEffect(): void {
    // Adjust resolution for pixelation
    const resolution = 1 / (this._pixelSize * 2);
    this.resolution = Math.max(0.01, Math.min(1, resolution));

    // Adjust padding
    this.padding = Math.ceil(this._pixelSize / 2);

    // Reduce color depth for more retro look
    const colorDepth = Math.max(0.7, 1 - this._pixelSize * 0.02);
    this.colorFilter.matrix = [
      colorDepth,
      0,
      0,
      0,
      0,
      0,
      colorDepth,
      0,
      0,
      0,
      0,
      0,
      colorDepth,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ];

    console.log(
      '✨ EnhancedPixelationFilter: resolution:',
      this.resolution,
      'colorDepth:',
      colorDepth
    );
  }

  get pixelSize(): number {
    return this._pixelSize;
  }

  set pixelSize(value: number) {
    this._pixelSize = Math.max(1, Math.min(20, value));
    this.updateEffect();
    console.log('✨ EnhancedPixelationFilter: Pixel size set to', this._pixelSize);
  }

  getPixelSize(): number {
    return this._pixelSize;
  }

  setPixelSize(size: number): void {
    this.pixelSize = size;
  }

  getColorFilter(): ColorMatrixFilter {
    return this.colorFilter;
  }
}
