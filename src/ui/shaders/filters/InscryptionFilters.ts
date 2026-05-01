import { Filter, GlProgram } from 'pixi.js';

/**
 * Inscryption-style dark vignette with heavy shadows
 */
export class InscryptionVignetteFilter extends Filter {
  constructor(options: { intensity?: number } = {}) {
    const intensity = options.intensity ?? 0.85;

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

      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Heavy vignette from all edges
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vTextureCoord, center);
        
        // Stronger, more aggressive vignette
        float vignette = smoothstep(0.8, 0.3, dist);
        vignette = mix(0.0, 1.0, vignette);
        vignette = pow(vignette, 0.6); // Make it even darker
        
        // Apply vignette
        color.rgb *= vignette * (1.0 - uIntensity * 0.5) + (1.0 - uIntensity);
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'inscryption-vignette' });

    super({
      glProgram: gpuProgram,
      resources: {
        vignetteUniforms: {
          uIntensity: { value: intensity, type: 'f32' },
        },
      },
    });
  }

  set intensity(value: number) {
    this.resources.vignetteUniforms.uniforms.uIntensity = value;
  }

  get intensity(): number {
    return this.resources.vignetteUniforms.uniforms.uIntensity;
  }
}

/**
 * Desaturated, cold color grading like Inscryption
 */
export class InscryptionColorGradingFilter extends Filter {
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
        
        // Desaturate heavily
        float gray = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
        color.rgb = mix(color.rgb, vec3(gray), 0.6);
        
        // Cold blue-green tint (Inscryption's signature look)
        color.r *= 0.85;
        color.g *= 0.95;
        color.b *= 1.15;
        
        // Crush blacks (make dark areas darker)
        color.rgb = pow(color.rgb, vec3(1.2));
        
        // Reduce overall brightness
        color.rgb *= 0.85;
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'inscryption-color-grading' });

    super({
      glProgram: gpuProgram,
      resources: {},
    });
  }
}

/**
 * Subtle film grain for that analog horror feel
 */
export class InscryptionGrainFilter extends Filter {
  constructor(options: { intensity?: number } = {}) {
    const intensity = options.intensity ?? 0.15;

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

      float random(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Coarse grain for that old camera feel
        float noise = random(vTextureCoord * 2.0 + uTime) * 2.0 - 1.0;
        
        // Apply grain more to darker areas (like real film)
        float luminance = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
        float grainAmount = uIntensity * (1.0 - luminance * 0.5);
        
        color.rgb += noise * grainAmount;
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'inscryption-grain' });

    super({
      glProgram: gpuProgram,
      resources: {
        grainUniforms: {
          uIntensity: { value: intensity, type: 'f32' },
          uTime: { value: 0, type: 'f32' },
        },
      },
    });
  }

  set intensity(value: number) {
    this.resources.grainUniforms.uniforms.uIntensity = value;
  }

  get intensity(): number {
    return this.resources.grainUniforms.uniforms.uIntensity;
  }

  updateTime(deltaTime: number): void {
    this.resources.grainUniforms.uniforms.uTime += deltaTime * 0.001;
  }
}

/**
 * Subtle chromatic aberration for that unsettling feel
 */
export class InscryptionChromaticFilter extends Filter {
  constructor(options: { offset?: number } = {}) {
    const offset = options.offset ?? 0.003;

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
      uniform float uOffset;

      out vec4 finalColor;

      void main(void) {
        vec2 direction = vTextureCoord - vec2(0.5);
        
        // Subtle RGB separation
        float r = texture(uTexture, vTextureCoord + direction * uOffset).r;
        float g = texture(uTexture, vTextureCoord).g;
        float b = texture(uTexture, vTextureCoord - direction * uOffset).b;
        float a = texture(uTexture, vTextureCoord).a;
        
        finalColor = vec4(r, g, b, a);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'inscryption-chromatic' });

    super({
      glProgram: gpuProgram,
      resources: {
        chromaticUniforms: {
          uOffset: { value: offset, type: 'f32' },
        },
      },
    });
  }

  set offset(value: number) {
    this.resources.chromaticUniforms.uniforms.uOffset = value;
  }

  get offset(): number {
    return this.resources.chromaticUniforms.uniforms.uOffset;
  }
}

/**
 * Subtle scanlines for that old monitor feel
 */
export class InscryptionScanlinesFilter extends Filter {
  constructor(options: { intensity?: number } = {}) {
    const intensity = options.intensity ?? 0.15;

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
        
        // Very subtle scanlines
        float scanline = sin(vScreenCoord.y * 3.14159 * 0.5) * 0.5 + 0.5;
        float darken = 1.0 - (1.0 - scanline) * uIntensity;
        
        color.rgb *= darken;
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'inscryption-scanlines' });

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
