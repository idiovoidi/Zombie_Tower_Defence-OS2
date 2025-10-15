import { BaseRetroFilter } from './BaseRetroFilter';

// Simple test shader that tints the screen red
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
uniform float redTint;

void main(void) {
    vec4 color = texture2D(uSampler, vTextureCoord);
    
    // Apply red tint
    color.r = color.r + redTint;
    color.r = clamp(color.r, 0.0, 1.0);
    
    gl_FragColor = color;
}
`;

/**
 * Simple test filter that adds a red tint to verify shaders are working
 */
export class TestFilter extends BaseRetroFilter {
  constructor() {
    console.log('🔴 TestFilter constructor called');

    const uniforms = {
      redTint: 0.3,
    };

    console.log('🔴 Test uniforms:', uniforms);

    try {
      super(vertexShader, fragmentShader, uniforms, 'TEST');
      console.log('🔴 Test filter created successfully');
    } catch (error) {
      console.error('🔴 Error creating test filter:', error);
      throw error;
    }
  }

  getDefaultSettings(): Record<string, number> {
    return {
      redTint: 0.3,
    };
  }

  updateSettings(settings: Record<string, number>): void {
    if (settings.redTint !== undefined) {
      this.settings.redTint = this.validateSetting('redTint', settings.redTint, 0.0, 1.0);
      this.resources.redTint = this.settings.redTint;
    }
  }

  getSettingsInfo(): Record<
    string,
    { value: number; min: number; max: number; description: string }
  > {
    return {
      redTint: {
        value: this.settings.redTint,
        min: 0.0,
        max: 1.0,
        description: 'Amount of red tint to apply',
      },
    };
  }

  setRedTint(tint: number): void {
    this.updateSettings({ redTint: tint });
  }
}
