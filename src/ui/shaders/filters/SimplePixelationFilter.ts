import { Filter, GlProgram } from 'pixi.js';

/**
 * Ultra-simple pixelation filter that should definitely work
 */
export class SimplePixelationFilter extends Filter {
  constructor() {
    console.log('🟦 SimplePixelationFilter constructor called');

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
      
      void main(void) {
          // Simple pixelation by reducing precision
          vec2 coord = vTextureCoord;
          
          // Apply pixelation by reducing coordinate precision
          float pixelSize = 8.0;
          coord = floor(coord * 64.0 / pixelSize) * pixelSize / 64.0;
          
          // Sample the texture
          gl_FragColor = texture2D(uSampler, coord);
      }
    `;

    try {
      console.log('🟦 Creating GL program...');
      const glProgram = GlProgram.from({
        vertex: vertexShader,
        fragment: fragmentShader,
      });

      console.log('🟦 GL program created, calling super...');
      super({
        glProgram,
        resources: {},
      });

      console.log('🟦 SimplePixelationFilter created successfully!');
    } catch (error) {
      console.error('🟦 Error in SimplePixelationFilter:', error);
      throw error;
    }
  }
}
