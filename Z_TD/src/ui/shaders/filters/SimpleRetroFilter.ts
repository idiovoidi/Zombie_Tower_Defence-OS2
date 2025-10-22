import { Filter, GlProgram } from 'pixi.js';

/**
 * Simple retro filter that works with PixiJS v8
 * Provides pixelation and CRT-like scanline effects
 */
export class SimpleRetroFilter extends Filter {
  constructor(
    options: {
      pixelSize?: number;
      scanlineIntensity?: number;
      enabled?: boolean;
    } = {}
  ) {
    const pixelSize = options.pixelSize ?? 4;
    const scanlineIntensity = options.scanlineIntensity ?? 0.3;

    // Simple vertex shader
    const vertex = `
      in vec2 aPosition;
      out vec2 vTextureCoord;
      out vec2 vFilterCoord;

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
        vFilterCoord = vTextureCoord * uInputSize.xy / uOutputFrame.zw;
      }
    `;

    // Simple fragment shader with pixelation and scanlines
    const fragment = `
      in vec2 vTextureCoord;
      in vec2 vFilterCoord;

      uniform sampler2D uTexture;
      uniform vec4 uInputSize;
      uniform float uPixelSize;
      uniform float uScanlineIntensity;
      uniform float uTime;

      out vec4 finalColor;

      void main(void) {
        vec2 coord = vTextureCoord;
        
        // Apply pixelation
        if (uPixelSize > 1.0) {
          vec2 pixelatedCoord = floor(coord * uInputSize.xy / uPixelSize) * uPixelSize / uInputSize.xy;
          coord = pixelatedCoord;
        }
        
        // Sample texture
        vec4 color = texture(uTexture, coord);
        
        // Apply scanlines
        if (uScanlineIntensity > 0.0) {
          float scanline = sin(vFilterCoord.y * 3.14159 * 2.0 * uInputSize.y / 2.0) * 0.5 + 0.5;
          float scanlineFactor = 1.0 - (1.0 - scanline) * uScanlineIntensity;
          color.rgb *= scanlineFactor;
        }
        
        // Slight flicker effect
        float flicker = sin(uTime * 60.0) * 0.02 + 0.98;
        color.rgb *= flicker;
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({
      vertex,
      fragment,
      name: 'simple-retro-filter',
    });

    super({
      glProgram: gpuProgram,
      resources: {
        retroUniforms: {
          uPixelSize: { value: pixelSize, type: 'f32' },
          uScanlineIntensity: { value: scanlineIntensity, type: 'f32' },
          uTime: { value: 0, type: 'f32' },
        },
      },
    });

    this.enabled = options.enabled ?? true;
  }

  /**
   * Set pixel size for pixelation effect
   */
  set pixelSize(value: number) {
    this.resources.retroUniforms.uniforms.uPixelSize = Math.max(1, value);
  }

  get pixelSize(): number {
    return this.resources.retroUniforms.uniforms.uPixelSize;
  }

  /**
   * Set scanline intensity (0.0 to 1.0)
   */
  set scanlineIntensity(value: number) {
    this.resources.retroUniforms.uniforms.uScanlineIntensity = Math.max(0, Math.min(1, value));
  }

  get scanlineIntensity(): number {
    return this.resources.retroUniforms.uniforms.uScanlineIntensity;
  }

  /**
   * Update time for animated effects
   */
  updateTime(deltaTime: number): void {
    this.resources.retroUniforms.uniforms.uTime += deltaTime * 0.001;
  }
}
