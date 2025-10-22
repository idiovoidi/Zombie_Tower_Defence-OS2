import { Filter, GlProgram } from 'pixi.js';

/**
 * Bloom/Glow effect - makes bright areas glow
 */
export class BloomFilter extends Filter {
  constructor(options: { intensity?: number; threshold?: number } = {}) {
    const intensity = options.intensity ?? 1.5;
    const threshold = options.threshold ?? 0.5;

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
      uniform float uThreshold;

      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Calculate luminance
        float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        
        // Only bloom bright areas
        if (luminance > uThreshold) {
          float bloom = (luminance - uThreshold) * uIntensity;
          color.rgb += vec3(bloom);
        }
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'bloom-filter' });

    super({
      glProgram: gpuProgram,
      resources: {
        bloomUniforms: {
          uIntensity: { value: intensity, type: 'f32' },
          uThreshold: { value: threshold, type: 'f32' },
        },
      },
    });
  }

  set intensity(value: number) {
    this.resources.bloomUniforms.uniforms.uIntensity = value;
  }

  get intensity(): number {
    return this.resources.bloomUniforms.uniforms.uIntensity;
  }

  set threshold(value: number) {
    this.resources.bloomUniforms.uniforms.uThreshold = value;
  }

  get threshold(): number {
    return this.resources.bloomUniforms.uniforms.uThreshold;
  }
}

/**
 * Vignette effect - darkens edges
 */
export class VignetteFilter extends Filter {
  constructor(options: { intensity?: number; radius?: number } = {}) {
    const intensity = options.intensity ?? 0.5;
    const radius = options.radius ?? 0.8;

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
      uniform float uRadius;

      out vec4 finalColor;

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Calculate distance from center
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vTextureCoord, center);
        
        // Create vignette
        float vignette = smoothstep(uRadius, uRadius - 0.3, dist);
        vignette = mix(1.0 - uIntensity, 1.0, vignette);
        
        color.rgb *= vignette;
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'vignette-filter' });

    super({
      glProgram: gpuProgram,
      resources: {
        vignetteUniforms: {
          uIntensity: { value: intensity, type: 'f32' },
          uRadius: { value: radius, type: 'f32' },
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

  set radius(value: number) {
    this.resources.vignetteUniforms.uniforms.uRadius = value;
  }

  get radius(): number {
    return this.resources.vignetteUniforms.uniforms.uRadius;
  }
}

/**
 * Chromatic Aberration - RGB color separation
 */
export class ChromaticAberrationFilter extends Filter {
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
        // Sample red, green, and blue channels at slightly different positions
        vec2 direction = vTextureCoord - vec2(0.5);
        
        float r = texture(uTexture, vTextureCoord + direction * uOffset).r;
        float g = texture(uTexture, vTextureCoord).g;
        float b = texture(uTexture, vTextureCoord - direction * uOffset).b;
        float a = texture(uTexture, vTextureCoord).a;
        
        finalColor = vec4(r, g, b, a);
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'chromatic-aberration-filter' });

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
 * Film Grain effect
 */
export class FilmGrainFilter extends Filter {
  constructor(options: { intensity?: number } = {}) {
    const intensity = options.intensity ?? 0.1;

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

      // Random function
      float random(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main(void) {
        vec4 color = texture(uTexture, vTextureCoord);
        
        // Generate noise
        float noise = random(vTextureCoord + uTime) * 2.0 - 1.0;
        
        // Apply grain
        color.rgb += noise * uIntensity;
        
        finalColor = color;
      }
    `;

    const gpuProgram = GlProgram.from({ vertex, fragment, name: 'film-grain-filter' });

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
