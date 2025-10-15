import { Filter } from 'pixi.js';

/**
 * Pixelation filter that works by changing resolution instead of custom shaders
 * This should work since it doesn't use custom GLSL code
 */
export class ResolutionPixelationFilter extends Filter {
  private _pixelSize: number = 4;

  constructor(pixelSize = 4) {
    super();
    console.log('📐 ResolutionPixelationFilter: Creating filter');
    this._pixelSize = pixelSize;
    this.updateResolution();
  }

  private updateResolution(): void {
    // Change the filter resolution to create pixelation effect
    // Lower resolution = more pixelated
    // Use a more aggressive scaling for better pixelation effect
    const resolution = 1 / (this._pixelSize * 2);
    this.resolution = Math.max(0.01, Math.min(1, resolution));

    // Also adjust padding to prevent edge artifacts
    this.padding = Math.ceil(this._pixelSize / 2);

    // Force the filter to update by toggling enabled
    // This ensures the visual changes are applied
    const wasEnabled = this.enabled;
    this.enabled = false;
    this.enabled = wasEnabled;

    console.log(
      '📐 ResolutionPixelationFilter: Set resolution to',
      this.resolution,
      'padding:',
      this.padding,
      'pixelSize:',
      this._pixelSize
    );
  }

  get pixelSize(): number {
    return this._pixelSize;
  }

  set pixelSize(value: number) {
    this._pixelSize = Math.max(1, Math.min(20, value));
    this.updateResolution();
    console.log('📐 ResolutionPixelationFilter: Pixel size set to', this._pixelSize);
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
