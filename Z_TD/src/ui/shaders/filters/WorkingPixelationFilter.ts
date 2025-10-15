import { Filter, GlProgram } from 'pixi.js';

/**
 * Working pixelation filter using the exact same approach as DirectTestFilter
 */
export class WorkingPixelationFilter extends Filter {
  private pixelSizeValue: number;

  constructor() {
    console.log('🔲 WorkingPixelationFilter constructor called');

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
          vec2 coord = vTextureCoord;
          
          // Only apply pixelation if pixelSize is greater than 1
          if (pixelSize > 1.0) {
              // Use texture coordinates directly for pixelation
              vec2 pixelCoord = coord * 256.0; // Scale up for pixelation
              pixelCoord = floor(pixelCoord / pixelSize) * pixelSize;
              coord = pixelCoord / 256.0; // Scale back down
          }
          
          // Clamp coordinates to valid range
          coord = clamp(coord, 0.0, 1.0);
          
          // Sample the texture
          gl_FragColor = texture2D(uSampler, coord);
      }
    `;

    try {
      console.log('🔲 Creating GL program...');
      const glProgram = GlProgram.from({
        vertex: vertexShader,
        fragment: fragmentShader,
      });

      console.log('🔲 GL program created, calling super...');
      super({
        glProgram,
        resources: {
          pixelSize: 4.0,
        },
      });

      this.pixelSizeValue = 4.0;
      console.log('🔲 WorkingPixelationFilter created successfully!');
    } catch (error) {
      console.error('🔲 Error in WorkingPixelationFilter:', error);
      throw error;
    }
  }

  /**
   * Set pixel size for pixelation effect
   * @param size - Pixel size (1-20)
   */
  setPixelSize(size: number): void {
    this.pixelSizeValue = Math.max(1, Math.min(20, size));
    this.resources.pixelSize = this.pixelSizeValue;
    console.log('🔲 Pixel size set to:', this.pixelSizeValue);
  }

  /**
   * Get current pixel size
   */
  getPixelSize(): number {
    return this.pixelSizeValue;
  }
}
