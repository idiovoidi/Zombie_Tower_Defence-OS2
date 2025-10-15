import { Filter, GlProgram } from 'pixi.js';

/**
 * Debug pixelation filter that shows what's happening
 */
export class DebugPixelationFilter extends Filter {
  constructor() {
    console.log('🐛 DebugPixelationFilter constructor called');

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
          vec2 coord = vTextureCoord;
          
          // Debug: Show texture coordinates as colors
          // Red = X coordinate, Green = Y coordinate
          vec4 debugColor = vec4(coord.x, coord.y, 0.0, 1.0);
          
          // Sample original texture
          vec4 originalColor = texture2D(uSampler, coord);
          
          // Mix debug and original (50/50)
          gl_FragColor = mix(originalColor, debugColor, 0.3);
      }
    `;

    try {
      console.log('🐛 Creating GL program...');
      const glProgram = GlProgram.from({
        vertex: vertexShader,
        fragment: fragmentShader,
      });

      console.log('🐛 GL program created, calling super...');
      super({
        glProgram,
        resources: {},
      });

      console.log('🐛 DebugPixelationFilter created successfully!');
    } catch (error) {
      console.error('🐛 Error in DebugPixelationFilter:', error);
      throw error;
    }
  }
}
