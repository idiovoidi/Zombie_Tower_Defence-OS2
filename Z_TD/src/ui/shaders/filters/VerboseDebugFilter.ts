import { Filter, GlProgram } from 'pixi.js';

/**
 * Verbose debug filter that logs every step of the process
 */
export class VerboseDebugFilter extends Filter {
  constructor() {
    console.log('🔍 VerboseDebugFilter: Starting constructor');

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
          gl_FragColor = texture2D(uSampler, vTextureCoord);
      }
    `;

    console.log('🔍 VerboseDebugFilter: Vertex shader length:', vertexShader.length);
    console.log('🔍 VerboseDebugFilter: Fragment shader length:', fragmentShader.length);
    console.log(
      '🔍 VerboseDebugFilter: Vertex shader preview:',
      vertexShader.substring(0, 100) + '...'
    );
    console.log(
      '🔍 VerboseDebugFilter: Fragment shader preview:',
      fragmentShader.substring(0, 100) + '...'
    );

    try {
      console.log('🔍 VerboseDebugFilter: Creating GL program...');
      const glProgram = GlProgram.from({
        vertex: vertexShader,
        fragment: fragmentShader,
      });
      console.log('🔍 VerboseDebugFilter: GL program created successfully');
      console.log('🔍 VerboseDebugFilter: GL program object:', glProgram);

      console.log('🔍 VerboseDebugFilter: Calling super constructor...');
      super({
        glProgram,
        resources: {},
      });
      console.log('🔍 VerboseDebugFilter: Super constructor completed');

      console.log('🔍 VerboseDebugFilter: Filter object created');
      console.log('🔍 VerboseDebugFilter: this.resources:', this.resources);
      console.log('🔍 VerboseDebugFilter: Constructor completed successfully!');
    } catch (error) {
      console.error('🔍 VerboseDebugFilter: Error in constructor:', error);
      console.error('🔍 VerboseDebugFilter: Error stack:', error.stack);
      console.error('🔍 VerboseDebugFilter: Error name:', error.name);
      console.error('🔍 VerboseDebugFilter: Error message:', error.message);
      throw error;
    }
  }

  // Override apply method to log when it's called
  apply(filterManager: any, input: any, output: any, clearMode?: any): void {
    console.log('🔍 VerboseDebugFilter: apply() called');
    console.log('🔍 VerboseDebugFilter: filterManager:', filterManager);
    console.log('🔍 VerboseDebugFilter: input:', input);
    console.log('🔍 VerboseDebugFilter: output:', output);
    console.log('🔍 VerboseDebugFilter: clearMode:', clearMode);

    try {
      super.apply(filterManager, input, output, clearMode);
      console.log('🔍 VerboseDebugFilter: apply() completed successfully');
    } catch (error) {
      console.error('🔍 VerboseDebugFilter: Error in apply():', error);
      throw error;
    }
  }
}
