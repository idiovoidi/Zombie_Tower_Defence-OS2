import { Filter, GlProgram } from 'pixi.js';

/**
 * Shared vertex shader used by all custom filters.
 * This handles the standard PixiJS vertex transformation.
 */
export const STANDARD_VERTEX_SHADER = `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
    return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
  }
`;

/**
 * Configuration for a single uniform value.
 */
export interface UniformConfig {
  value: number | number[];
  type: 'f32' | 'vec2' | 'vec3' | 'vec4' | 'i32';
}

/**
 * Configuration for filter resources.
 */
export type UniformsConfig = Record<string, UniformConfig>;

/**
 * Abstract base class for custom shader filters.
 * Provides shared vertex shader and helper methods for uniform access.
 *
 * Subclasses only need to:
 * 1. Provide a fragment shader
 * 2. Define uniform configuration
 * 3. Optionally add custom getters/setters for convenience
 */
export abstract class BaseShaderFilter extends Filter {
  protected readonly uniformResourceName: string;

  constructor(
    fragmentShader: string,
    uniforms: UniformsConfig,
    uniformResourceName: string,
    filterName: string
  ) {
    const gpuProgram = GlProgram.from({
      vertex: STANDARD_VERTEX_SHADER,
      fragment: fragmentShader,
      name: filterName,
    });

    super({
      glProgram: gpuProgram,
      resources: {
        [uniformResourceName]: uniforms,
      },
    });

    this.uniformResourceName = uniformResourceName;
  }

  /**
   * Get a uniform value by name.
   */
  protected getUniform(name: string): number {
    return this.resources[this.uniformResourceName].uniforms[name];
  }

  /**
   * Set a uniform value by name.
   */
  protected setUniform(name: string, value: number): void {
    this.resources[this.uniformResourceName].uniforms[name] = value;
  }

  /**
   * Increment a time-based uniform by delta time (in ms).
   */
  protected incrementTime(deltaTime: number): void {
    this.resources[this.uniformResourceName].uniforms.uTime += deltaTime * 0.001;
  }
}

/**
 * Helper to create a filter with the standard vertex shader.
 * Use this for one-off filters that don't need a dedicated class.
 */
export function createFilter(
  fragmentShader: string,
  uniforms: UniformsConfig,
  uniformResourceName: string,
  filterName: string
): Filter {
  const gpuProgram = GlProgram.from({
    vertex: STANDARD_VERTEX_SHADER,
    fragment: fragmentShader,
    name: filterName,
  });

  return new Filter({
    glProgram: gpuProgram,
    resources: {
      [uniformResourceName]: uniforms,
    },
  });
}
