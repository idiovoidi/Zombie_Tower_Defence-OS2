import { Application, Container, RenderTexture, Sprite, Texture } from 'pixi.js';
import { DebugUtils } from './DebugUtils';

/**
 * Simple approach: Just disable texture smoothing on all textures
 * This is the easiest way to get pixel-perfect rendering
 */
export class PixelPerfectMode {
  private static originalScaleModes: Map<Texture, string> = new Map();

  /**
   * Enable pixel-perfect mode by disabling texture smoothing
   */
  static enable(): void {
    // Set default scale mode for new textures
    Texture.defaultOptions.scaleMode = 'nearest';
    DebugUtils.debug('Pixel-Perfect Mode enabled (nearest-neighbor filtering)');
  }

  /**
   * Disable pixel-perfect mode
   */
  static disable(): void {
    Texture.defaultOptions.scaleMode = 'linear';
    DebugUtils.debug('Pixel-Perfect Mode disabled (linear filtering)');
  }
}

/**
 * True pixel art effect using render texture downscaling
 * This gives authentic pixel art look by rendering at lower resolution
 *
 * NOTE: This is more complex and may have performance implications
 * For most cases, PixelPerfectMode + SimpleRetroFilter is better
 */
export class TruePixelEffect {
  private app: Application;
  private renderTexture: RenderTexture | null = null;
  private sprite: Sprite | null = null;
  private originalContainer: Container;
  private enabled: boolean = false;
  private pixelScale: number = 4;

  constructor(app: Application, container: Container) {
    this.app = app;
    this.originalContainer = container;
  }

  /**
   * Enable true pixel art effect
   * @param pixelScale - How many screen pixels per game pixel (2-8 recommended)
   */
  enable(pixelScale: number = 4): void {
    if (this.enabled) {
      this.disable();
    }

    this.pixelScale = Math.max(2, Math.min(8, pixelScale));

    // Calculate render texture size (smaller = more pixelated)
    const width = Math.floor(this.app.screen.width / this.pixelScale);
    const height = Math.floor(this.app.screen.height / this.pixelScale);

    // Create render texture at lower resolution
    this.renderTexture = RenderTexture.create({
      width,
      height,
    });

    // Create sprite to display the render texture
    this.sprite = new Sprite(this.renderTexture);
    this.sprite.width = this.app.screen.width;
    this.sprite.height = this.app.screen.height;

    // CRITICAL: Disable texture smoothing for pixel-perfect look
    if (this.renderTexture.source) {
      this.renderTexture.source.scaleMode = 'nearest';
    }

    this.enabled = true;

    DebugUtils.debug(`True Pixel Effect enabled: ${width}x${height} (${this.pixelScale}x scale)`);
  }

  /**
   * Disable pixel effect
   */
  disable(): void {
    if (this.renderTexture) {
      this.renderTexture.destroy(true);
      this.renderTexture = null;
    }
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    this.enabled = false;
    DebugUtils.debug('True Pixel Effect disabled');
  }

  /**
   * Update - call this before rendering
   * This renders the game to a low-res texture
   */
  update(): void {
    if (!this.enabled || !this.renderTexture) {
      return;
    }

    // Render the game to the low-res texture
    this.app.renderer.render({
      container: this.originalContainer,
      target: this.renderTexture,
    });
  }

  /**
   * Render the upscaled sprite
   * Call this after update()
   */
  render(): void {
    if (!this.enabled || !this.sprite) {
      return;
    }

    // Render the upscaled sprite to screen
    this.app.renderer.render({
      container: this.sprite,
    });
  }

  /**
   * Change pixel scale on the fly
   */
  setPixelScale(scale: number): void {
    if (this.enabled) {
      this.enable(scale);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getPixelScale(): number {
    return this.pixelScale;
  }
}

/**
 * Collection of stylized visual effects for 2D games
 */
export class StyleEffects {
  /**
   * Apply outline/stroke effect to make game look more cartoony
   */
  static createOutlineStyle(): string {
    return `
      Outline/Stroke Effect:
      - Add black outlines around sprites
      - Makes game look more comic/cartoon style
      - Can be done with filters or sprite borders
    `;
  }

  /**
   * Apply color palette reduction for retro look
   */
  static createPaletteReduction(): string {
    return `
      Color Palette Reduction:
      - Reduce colors to specific palette (e.g., 16 colors)
      - Gives authentic retro game look
      - Can simulate Game Boy, NES, etc.
    `;
  }

  /**
   * Apply dithering for retro texture
   */
  static createDithering(): string {
    return `
      Dithering Effect:
      - Use ordered dithering patterns
      - Simulates old graphics cards
      - Creates texture without gradients
    `;
  }
}
