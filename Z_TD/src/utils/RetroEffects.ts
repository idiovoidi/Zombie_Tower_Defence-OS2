import { ColorMatrixFilter, Container } from 'pixi.js';
import { SimpleRetroFilter } from '../ui/shaders/filters/SimpleRetroFilter';

/**
 * Utility class for applying retro visual effects to the game
 */
export class RetroEffects {
  private container: Container;
  private retroFilter: SimpleRetroFilter | null = null;
  private colorFilter: ColorMatrixFilter | null = null;
  private enabled: boolean = false;

  constructor(container: Container) {
    this.container = container;
  }

  /**
   * Enable retro effects with custom settings
   */
  enable(
    options: {
      pixelSize?: number;
      scanlines?: boolean;
      scanlineIntensity?: number;
      colorMode?: 'normal' | 'sepia' | 'desaturate' | 'greenscreen';
    } = {}
  ): void {
    const pixelSize = options.pixelSize ?? 3;
    const scanlineIntensity = options.scanlines !== false ? (options.scanlineIntensity ?? 0.3) : 0;
    const colorMode = options.colorMode ?? 'normal';

    // Create retro filter
    this.retroFilter = new SimpleRetroFilter({
      pixelSize,
      scanlineIntensity,
      enabled: true,
    });

    // Create color filter for retro color effects
    this.colorFilter = new ColorMatrixFilter();

    // Apply color mode
    switch (colorMode) {
      case 'sepia':
        this.colorFilter.sepia(true);
        break;
      case 'desaturate':
        this.colorFilter.desaturate();
        break;
      case 'greenscreen':
        // Old green phosphor monitor look
        this.colorFilter.matrix = [
          0.3,
          0.6,
          0.1,
          0,
          0, // Red channel
          0.3,
          0.6,
          0.1,
          0,
          0, // Green channel
          0.1,
          0.2,
          0.05,
          0,
          0, // Blue channel
          0,
          0,
          0,
          1,
          0, // Alpha channel
        ];
        break;
      case 'normal':
      default:
        // Slight desaturation for retro look
        this.colorFilter.desaturate();
        break;
    }

    // Apply filters
    const filters = [this.retroFilter, this.colorFilter];
    this.container.filters = filters;
    this.enabled = true;

    console.log('🎮 Retro effects enabled:', {
      pixelSize,
      scanlineIntensity,
      colorMode,
    });
  }

  /**
   * Disable retro effects
   */
  disable(): void {
    this.container.filters = null;
    this.retroFilter = null;
    this.colorFilter = null;
    this.enabled = false;
    console.log('🎮 Retro effects disabled');
  }

  /**
   * Toggle retro effects on/off
   */
  toggle(): void {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Update animated effects (call this in game loop)
   */
  update(deltaTime: number): void {
    if (this.retroFilter && this.enabled) {
      this.retroFilter.updateTime(deltaTime);
    }
  }

  /**
   * Adjust pixel size
   */
  setPixelSize(size: number): void {
    if (this.retroFilter) {
      this.retroFilter.pixelSize = size;
    }
  }

  /**
   * Adjust scanline intensity
   */
  setScanlineIntensity(intensity: number): void {
    if (this.retroFilter) {
      this.retroFilter.scanlineIntensity = intensity;
    }
  }

  /**
   * Check if effects are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current settings
   */
  getSettings(): {
    enabled: boolean;
    pixelSize: number;
    scanlineIntensity: number;
  } {
    return {
      enabled: this.enabled,
      pixelSize: this.retroFilter?.pixelSize ?? 0,
      scanlineIntensity: this.retroFilter?.scanlineIntensity ?? 0,
    };
  }
}
