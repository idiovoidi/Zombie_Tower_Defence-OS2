import { Filter, GlProgram } from 'pixi.js';

/**
 * Abstract base class for all retro-style filters
 * Provides common functionality for shader management and parameter validation
 */
export abstract class BaseRetroFilter extends Filter {
  protected settings: Record<string, number> = {};
  protected shaderType: string;

  constructor(
    vertexShader: string,
    fragmentShader: string,
    uniforms: Record<string, unknown>,
    shaderType: string
  ) {
    console.log(`🎨 BaseRetroFilter constructor for ${shaderType}`);
    console.log(`🎨 Vertex shader: ${vertexShader.substring(0, 100)}...`);
    console.log(`🎨 Fragment shader: ${fragmentShader.substring(0, 100)}...`);
    console.log(`🎨 Uniforms:`, uniforms);

    // Create GL program for PixiJS 8.x
    const glProgram = GlProgram.from({
      vertex: vertexShader,
      fragment: fragmentShader,
    });

    console.log(`🎨 GL Program created for ${shaderType}`);

    super({
      glProgram,
      resources: uniforms,
    });

    console.log(`🎨 Filter created successfully for ${shaderType}`);

    this.shaderType = shaderType;
    this.settings = this.getDefaultSettings();
    this.applyDefaultSettings();
  }

  /**
   * Update shader settings with validation
   * @param settings - New settings to apply
   */
  abstract updateSettings(settings: Record<string, number>): void;

  /**
   * Get default settings for this shader type
   * @returns Default settings object
   */
  abstract getDefaultSettings(): Record<string, number>;

  /**
   * Validate a setting value against allowed range
   * @param key - Setting key
   * @param value - Value to validate
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value
   * @returns Clamped value within range
   */
  protected validateSetting(key: string, value: number, min: number, max: number): number {
    if (isNaN(value) || !isFinite(value)) {
      console.warn(`Invalid value for ${key}: ${value}, using default`);
      return this.getDefaultSettings()[key] || min;
    }
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Apply default settings to shader uniforms
   */
  protected applyDefaultSettings(): void {
    Object.entries(this.settings).forEach(([key, value]) => {
      if (this.resources[key] !== undefined) {
        this.resources[key] = value;
      }
    });
  }

  /**
   * Get current shader type
   * @returns Shader type identifier
   */
  getShaderType(): string {
    return this.shaderType;
  }

  /**
   * Get current settings
   * @returns Current settings object
   */
  getCurrentSettings(): Record<string, number> {
    return { ...this.settings };
  }

  /**
   * Get comprehensive settings info for UI display
   * @returns Object with setting names, current values, and ranges
   */
  abstract getSettingsInfo(): Record<
    string,
    { value: number; min: number; max: number; description: string }
  >;

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings = this.getDefaultSettings();
    this.applyDefaultSettings();
  }

  /**
   * Dispose of filter resources
   */
  dispose(): void {
    super.destroy();
  }
}
