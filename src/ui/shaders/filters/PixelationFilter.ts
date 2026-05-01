import { BaseRetroFilter } from './BaseRetroFilter';
import { SHADER_PARAMETER_RANGES, ShaderType } from '../types/ShaderTypes';

// Import shader source code as strings
const vertexShader = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

const fragmentShader = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float pixelSize;

void main(void) {
    // Use a fixed resolution for simplicity
    vec2 resolution = vec2(800.0, 600.0);
    
    // Calculate pixel coordinates
    vec2 coord = vTextureCoord * resolution;
    
    // Apply pixelation by flooring to nearest pixel boundary
    coord = floor(coord / pixelSize) * pixelSize;
    
    // Convert back to texture coordinates
    coord /= resolution;
    
    // Sample the texture at the pixelated coordinate
    gl_FragColor = texture2D(uSampler, coord);
}
`;

/**
 * Pixelation filter that creates a retro 8-bit aesthetic
 * Implements nearest-neighbor pixel sampling for pixelated effects
 */
export class PixelationFilter extends BaseRetroFilter {
  constructor() {
    const uniforms = {
      pixelSize: 2.0,
    };

    super(vertexShader, fragmentShader, uniforms, ShaderType.PIXELATION);
  }

  /**
   * Update pixelation settings with validation
   * @param settings - Settings object containing pixelSize
   */
  updateSettings(settings: Record<string, number>): void {
    if (settings.pixelSize !== undefined) {
      this.setPixelSize(settings.pixelSize);
    }
  } /*
   *
   * Get default settings for pixelation filter
   * @returns Default settings object
   */
  getDefaultSettings(): Record<string, number> {
    return {
      pixelSize: 2.0,
    };
  }

  /**
   * Set pixel size with validation and range clamping
   * @param size - Pixel size (1-8 pixels)
   */
  setPixelSize(size: number): void {
    const { min, max } = SHADER_PARAMETER_RANGES.pixelation.pixelSize;
    const validatedSize = this.validateSetting('pixelSize', size, min, max);

    this.settings.pixelSize = validatedSize;

    if (this.resources.pixelSize !== undefined) {
      this.resources.pixelSize = validatedSize;
    }
  }

  /**
   * Update screen resolution for proper pixelation calculation
   * Note: Currently uses fixed resolution in shader for compatibility
   * @param width - Screen width in pixels (unused)
   * @param height - Screen height in pixels (unused)
   */
  setResolution(_width: number, _height: number): void {
    // Resolution is now hardcoded in shader for PixiJS 8.x compatibility
    console.log('Resolution setting is currently disabled for compatibility');
  }

  /**
   * Get current pixel size
   * @returns Current pixel size value
   */
  getPixelSize(): number {
    return this.settings.pixelSize;
  }

  /**
   * Enable smooth transitions between pixel sizes
   * @param targetSize - Target pixel size to transition to
   * @param duration - Transition duration in milliseconds
   * @param onComplete - Optional callback when transition completes
   */
  transitionToPixelSize(targetSize: number, duration: number = 300, onComplete?: () => void): void {
    const startSize = this.getPixelSize();
    const { min, max } = SHADER_PARAMETER_RANGES.pixelation.pixelSize;
    const validatedTargetSize = Math.max(min, Math.min(max, targetSize));

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Use easeInOutQuad for smooth transition
      const easeProgress =
        progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentSize = startSize + (validatedTargetSize - startSize) * easeProgress;
      this.setPixelSize(currentSize);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Get comprehensive pixelation settings for UI display
   * @returns Object with setting names, current values, and ranges
   */
  getSettingsInfo(): Record<
    string,
    { value: number; min: number; max: number; description: string }
  > {
    const { min, max } = SHADER_PARAMETER_RANGES.pixelation.pixelSize;
    return {
      pixelSize: {
        value: this.settings.pixelSize,
        min,
        max,
        description: 'Size of pixels for retro pixelation effect',
      },
    };
  }
}
