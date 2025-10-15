import { BlurFilter } from 'pixi.js';

/**
 * Pixelation filter using blur to create pixelation effect
 * This actually works and responds to slider changes
 */
export class WorkingResolutionPixelFilter extends BlurFilter {
  private _pixelSize: number = 4;

  constructor(pixelSize = 4) {
    // Start with some blur
    super();
    console.log('🎯 WorkingResolutionPixelFilter: Creating filter');
    this._pixelSize = pixelSize;
    this.updateEffect();
  }

  private updateEffect(): void {
    // Use blur amount to simulate pixelation
    // Higher pixel size = more blur
    const blurAmount = Math.max(0, this._pixelSize - 1);
    this.blur = blurAmount;

    // Adjust quality for performance
    this.quality = Math.max(1, Math.min(5, Math.floor(this._pixelSize / 4)));

    // Lower resolution for more pixelation
    this.resolution = Math.max(0.1, 1 / this._pixelSize);

    console.log(
      '🎯 WorkingResolutionPixelFilter: blur:',
      this.blur,
      'quality:',
      this.quality,
      'resolution:',
      this.resolution,
      'pixelSize:',
      this._pixelSize
    );
  }

  get pixelSize(): number {
    return this._pixelSize;
  }

  set pixelSize(value: number) {
    const newValue = Math.max(1, Math.min(20, value));
    if (newValue !== this._pixelSize) {
      this._pixelSize = newValue;
      this.updateEffect();
      console.log('🎯 WorkingResolutionPixelFilter: Pixel size changed to', this._pixelSize);
    }
  }

  getPixelSize(): number {
    return this._pixelSize;
  }

  setPixelSize(size: number): void {
    this.pixelSize = size;
  }
}
