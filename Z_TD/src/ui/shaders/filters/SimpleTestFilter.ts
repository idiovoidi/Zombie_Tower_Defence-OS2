import { BaseRetroFilter } from './BaseRetroFilter';

// Ultra-simple test shader with no uniforms
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
    
    // Apply a simple red tint without uniforms
    color.r = color.r + 0.3;
    color.r = clamp(color.r, 0.0, 1.0);
    
    gl_FragColor = color;
}
`;

/**
 * Ultra-simple test filter with no uniforms to test basic shader functionality
 */
export class SimpleTestFilter extends BaseRetroFilter {
  constructor() {
    console.log('🟢 SimpleTestFilter constructor called');

    // No uniforms at all
    const uniforms = {};

    console.log('🟢 Simple test uniforms:', uniforms);

    try {
      super(vertexShader, fragmentShader, uniforms, 'SIMPLE_TEST');
      console.log('🟢 Simple test filter created successfully');
    } catch (error) {
      console.error('🟢 Error creating simple test filter:', error);
      throw error;
    }
  }

  getDefaultSettings(): Record<string, number> {
    return {};
  }

  updateSettings(_settings: Record<string, number>): void {
    // No settings to update
  }

  getSettingsInfo(): Record<
    string,
    { value: number; min: number; max: number; description: string }
  > {
    return {};
  }
}
