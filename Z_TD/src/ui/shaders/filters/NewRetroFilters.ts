import { Filter, GlProgram } from 'pixi.js';

/**
 * Ultra Simple Pixelation - Just pixelation, nothing else
 */
export class UltraSimplePixelationFilter extends Filter {
  constructor(options: { pixelSize?: number } = {}) {
    const pixelSize = options.pixelSize ?? 4.0;

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
      uniform vec4 uInputSize;
      uniform float uPixelSize;

      out vec4 finalColor;

      void main(void) {
        // Calculate pixelated coordinates
        vec2 pixelSize = vec2(uPixelSize) / uInputSize.xy;
        vec2 coord = floor(vTextureCoord / pixelSize) * pixelSize;
        
        // Sample texture at pixelated coordinate
        finalColor = texture(uTexture, coord);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'ultra-simple-pixelation' });

    super({
      glProgram: gpuProgram,
      resources: {
        pixelUniforms: {
          uPixelSize: { value: pixelSize, type: 'f32' },
        },
      },
    });
  }

  set pixelSize(value: number) {
    this.resources.pixelUniforms.uniforms.uPixelSize = value;
  }

  get pixelSize(): number {
    return this.resources.pixelUniforms.uniforms.uPixelSize;
  }
}

/**
 * CRT Scanlines - Just scanlines, nothing else
 */
export class CRTScanlinesFilter extends Filter {
  constructor(options: { intensity?: number } = {}) {
    const intensity = options.intensity ?? 0.3;

    const vertex = `
      in vec2 aPosition;
      out vec2 vTextureCoord;
      out vec2 vScreenCoord;

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
        vScreenCoord = vTextureCoord * uInputSize.xy;
      }
    `;

    const fragment = `
      in vec2 vTextureCoord;
      in vec2 vScreenCoord;
      uniform sampler2D uTexture;
      uniform float uIntensity;

      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Create scanline effect
        float scanline = sin(vScreenCoord.y * 3.14159 * 0.5) * 0.5 + 0.5;
        float darken = 1.0 - (1.0 - scanline) * uIntensity;
        
        color.rgb *= darken;
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'crt-scanlines' });

    super({
      glProgram: gpuProgram,
      resources: {
        scanlineUniforms: {
          uIntensity: { value: intensity, type: 'f32' },
        },
      },
    });
  }

  set intensity(value: number) {
    this.resources.scanlineUniforms.uniforms.uIntensity = value;
  }

  get intensity(): number {
    return this.resources.scanlineUniforms.uniforms.uIntensity;
  }
}

/**
 * Retro Color Palette - Reduces colors to retro palette
 */
export class RetroColorPaletteFilter extends Filter {
  constructor(options: { levels?: number } = {}) {
    const levels = options.levels ?? 8.0;

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
      uniform float uLevels;

      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Posterize colors to limited palette
        color.r = floor(color.r * uLevels) / uLevels;
        color.g = floor(color.g * uLevels) / uLevels;
        color.b = floor(color.b * uLevels) / uLevels;
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'retro-color-palette' });

    super({
      glProgram: gpuProgram,
      resources: {
        paletteUniforms: {
          uLevels: { value: levels, type: 'f32' },
        },
      },
    });
  }

  set levels(value: number) {
    this.resources.paletteUniforms.uniforms.uLevels = value;
  }

  get levels(): number {
    return this.resources.paletteUniforms.uniforms.uLevels;
  }
}

/**
 * Game Boy Filter - Green tint like original Game Boy
 */
export class GameBoyFilter extends Filter {
  constructor() {
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

      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Convert to grayscale
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        
        // Map to Game Boy palette (4 shades of green)
        vec3 gbColor;
        if (gray < 0.25) {
          gbColor = vec3(0.06, 0.22, 0.06);  // Darkest
        } else if (gray < 0.5) {
          gbColor = vec3(0.19, 0.38, 0.19);  // Dark
        } else if (gray < 0.75) {
          gbColor = vec3(0.55, 0.68, 0.06);  // Light
        } else {
          gbColor = vec3(0.61, 0.74, 0.06);  // Lightest
        }
        
        finalColor = vec4(gbColor, color.a);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'gameboy-filter' });

    super({
      glProgram: gpuProgram,
      resources: {},
    });
  }
}

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

/**
 * Dithering Filter - Classic dithering effect
 */
export class DitheringFilter extends Filter {
  constructor(options: { intensity?: number } = {}) {
    const intensity = options.intensity ?? 1.0;

    const vertex = `
      in vec2 aPosition;
      out vec2 vTextureCoord;
      out vec2 vScreenCoord;

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
        vScreenCoord = vTextureCoord * uInputSize.xy;
      }
    `;

    const fragment = `
      in vec2 vTextureCoord;
      in vec2 vScreenCoord;
      uniform sampler2D uTexture;
      uniform float uIntensity;

      out vec4 finalColor;

      // Simple Bayer-like dithering pattern
      float bayer2(vec2 pos) {
        vec2 p = mod(pos, 2.0);
        float value = 0.0;
        
        if (p.x < 1.0 && p.y < 1.0) {
          value = 0.0;
        } else if (p.x >= 1.0 && p.y < 1.0) {
          value = 2.0;
        } else if (p.x < 1.0 && p.y >= 1.0) {
          value = 3.0;
        } else {
          value = 1.0;
        }
        
        return value / 4.0;
      }

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Apply dithering
        float dither = bayer2(vScreenCoord) - 0.5;
        color.rgb += dither * 0.1 * uIntensity;
        
        // Quantize colors
        float levels = 16.0 - (uIntensity * 8.0);
        color.r = floor(color.r * levels) / levels;
        color.g = floor(color.g * levels) / levels;
        color.b = floor(color.b * levels) / levels;
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'dithering-filter' });

    super({
      glProgram: gpuProgram,
      resources: {
        ditherUniforms: {
          uIntensity: { value: intensity, type: 'f32' },
        },
      },
    });
  }

  set intensity(value: number) {
    this.resources.ditherUniforms.uniforms.uIntensity = value;
  }

  get intensity(): number {
    return this.resources.ditherUniforms.uniforms.uIntensity;
  }
}
