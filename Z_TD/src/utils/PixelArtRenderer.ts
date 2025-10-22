import { Application, Container, RenderTexture, Sprite } from 'pixi.js';

/**
 * True pixel art renderer that renders at lower resolution and scales up
 * This is the authentic way to achieve pixel art look
 */
export class PixelArtRenderer {
  private app: Application;
  private gameContainer: Container;
  private renderTexture: RenderTexture | null = null;
  private displaySprite: Sprite | null = null;
  private displayContainer: Container | null = null;
  private enabled: boolean = false;
  private pixelScale: number = 3;
  private renderWidth: number = 0;
  private renderHeight: number = 0;

  constructor(app: Application, gameContainer: Container) {
    this.app = app;
    this.gameContainer = gameContainer;
  }

  /**
   * Enable pixel art rendering
   * @param pixelScale - How many screen pixels per game pixel (2-6 recommended)
   */
  enable(pixelScale: number = 3): void {
    if (this.enabled) {
      this.disable();
    }

    this.pixelScale = Math.max(2, Math.min(8, pixelScale));

    // Calculate render texture size (game resolution / pixel scale)
    this.renderWidth = Math.floor(this.app.screen.width / this.pixelScale);
    this.renderHeight = Math.floor(this.app.screen.height / this.pixelScale);

    console.log(`🎮 Creating render texture: ${this.renderWidth}x${this.renderHeight}`);

    // Create render texture at lower resolution
    this.renderTexture = RenderTexture.create({
      width: this.renderWidth,
      height: this.renderHeight,
    });

    // CRITICAL: Set to nearest-neighbor filtering for sharp pixels
    if (this.renderTexture.source) {
      this.renderTexture.source.scaleMode = 'nearest';
      this.renderTexture.source.autoGenerateMipmaps = false;
    }

    // Create sprite to display the upscaled render texture
    this.displaySprite = new Sprite(this.renderTexture);

    // Scale up to full screen size
    this.displaySprite.width = this.app.screen.width;
    this.displaySprite.height = this.app.screen.height;

    // Create container for the display sprite
    this.displayContainer = new Container();
    this.displayContainer.addChild(this.displaySprite);

    // Hide the original game container (we'll render it to texture instead)
    this.gameContainer.visible = false;

    // Add display container to stage
    this.app.stage.addChild(this.displayContainer);

    this.enabled = true;

    console.log(
      `🎮 Pixel Art Renderer enabled: ${this.renderWidth}x${this.renderHeight} → ${this.app.screen.width}x${this.app.screen.height} (${this.pixelScale}x scale)`
    );
  }

  /**
   * Disable pixel art rendering
   */
  disable(): void {
    if (this.displayContainer && this.app.stage.children.includes(this.displayContainer)) {
      this.app.stage.removeChild(this.displayContainer);
    }

    if (this.displaySprite) {
      this.displaySprite.destroy();
      this.displaySprite = null;
    }

    if (this.displayContainer) {
      this.displayContainer.destroy();
      this.displayContainer = null;
    }

    if (this.renderTexture) {
      this.renderTexture.destroy(true);
      this.renderTexture = null;
    }

    // Show the original game container again
    this.gameContainer.visible = true;

    this.enabled = false;
    console.log('🎮 Pixel Art Renderer disabled');
  }

  /**
   * Render the game to the low-res texture
   * Call this in your game loop INSTEAD of normal rendering
   */
  render(): void {
    if (!this.enabled || !this.renderTexture) {
      return;
    }

    // Temporarily scale down the game container to fit the render texture
    const originalScale = this.gameContainer.scale.x;
    const scaleForRender = 1 / this.pixelScale;
    this.gameContainer.scale.set(scaleForRender);

    // Render game to the low-res texture
    this.app.renderer.render({
      container: this.gameContainer,
      target: this.renderTexture,
      clear: true,
    });

    // Restore original scale
    this.gameContainer.scale.set(originalScale);
  }

  /**
   * Change pixel scale on the fly
   */
  setPixelScale(scale: number): void {
    const wasEnabled = this.enabled;
    if (wasEnabled) {
      this.disable();
      this.enable(scale);
    }
  }

  /**
   * Check if enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current pixel scale
   */
  getPixelScale(): number {
    return this.pixelScale;
  }

  /**
   * Get render resolution
   */
  getRenderResolution(): { width: number; height: number } {
    return {
      width: this.renderWidth,
      height: this.renderHeight,
    };
  }

  /**
   * Get display resolution
   */
  getDisplayResolution(): { width: number; height: number } {
    return {
      width: this.app.screen.width,
      height: this.app.screen.height,
    };
  }

  /**
   * Get debug info
   */
  getDebugInfo(): string {
    if (!this.enabled) {
      return 'Pixel Art Renderer: Disabled';
    }
    return `Pixel Art Renderer: ${this.renderWidth}x${this.renderHeight} → ${this.app.screen.width}x${this.app.screen.height} (${this.pixelScale}x)`;
  }
}
