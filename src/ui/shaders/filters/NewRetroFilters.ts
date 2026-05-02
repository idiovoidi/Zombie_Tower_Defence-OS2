import { Filter, GlProgram } from 'pixi.js';

/**
 * VHS Filter - Retro VHS tape effect
 */
export class VHSFilter extends Filter {
  constructor(options: { intensity?: number } = {}) {
    const intensity = options.intensity ?? 0.5;

    const vertex = `
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

    const fragment = `
      in vec2 vTextureCoord;
      uniform sampler2D uTexture;
      uniform float uIntensity;
      uniform float uTime;

      out vec4 finalColor;

      void main(void) {
        vec2 uv = vTextureCoord;
        
        // VHS tracking lines
        float line = sin(uv.y * 100.0 + uTime * 5.0) * 0.01 * uIntensity;
        uv.x += line;
        
        // Sample with slight offset for RGB channels (VHS chromatic aberration)
        float r = texture(uTexture, uv + vec2(0.002 * uIntensity, 0.0)).r;
        float g = texture(uTexture, uv).g;
        float b = texture(uTexture, uv - vec2(0.002 * uIntensity, 0.0)).b;
        
        vec3 color = vec3(r, g, b);
        
        // Add slight desaturation
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(color, vec3(gray), 0.2 * uIntensity);
        
        finalColor = vec4(color, 1.0);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'vhs-filter' });

    super({
      glProgram: gpuProgram,
      resources: {
        vhsUniforms: {
          uIntensity: { value: intensity, type: 'f32' },
          uTime: { value: 0, type: 'f32' },
        },
      },
    });
  }

  set intensity(value: number) {
    this.resources.vhsUniforms.uniforms.uIntensity = value;
  }

  get intensity(): number {
    return this.resources.vhsUniforms.uniforms.uIntensity;
  }

  updateTime(deltaTime: number): void {
    this.resources.vhsUniforms.uniforms.uTime += deltaTime * 0.001;
  }
}
