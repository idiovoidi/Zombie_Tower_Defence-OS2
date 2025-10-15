import { Filter, GlProgram } from 'pixi.js';

/**
 * Direct test filter using the exact same approach as the working HTML test
 */
export class DirectTestFilter extends Filter {
  constructor() {
    console.log('🔥 DirectTestFilter constructor called');

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
          vec4 color = texture2D(uSampler, vTextureCoord);
          color.r = color.r + 0.3;
          color.r = clamp(color.r, 0.0, 1.0);
          gl_FragColor = color;
      }
    `;

    try {
      console.log('🔥 Creating GL program...');
      const glProgram = GlProgram.from({
        vertex: vertexShader,
        fragment: fragmentShader,
      });

      console.log('🔥 GL program created, calling super...');
      super({
        glProgram,
        resources: {},
      });

      console.log('🔥 DirectTestFilter created successfully!');
    } catch (error) {
      console.error('🔥 Error in DirectTestFilter:', error);
      throw error;
    }
  }
}
