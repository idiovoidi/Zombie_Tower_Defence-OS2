import { BaseRetroFilter } from './BaseRetroFilter';

// Import shader source files
import crtVertexShader from '../shaders/crt.vert?raw';
import crtFragmentShader from '../shaders/crt.frag?raw';

// Fallback embedded shaders in case file loading fails
const embeddedVertexShader = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
`;

const embeddedFragmentShader = `
precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float time;
uniform float curvature;
uniform float scanlineIntensity;
uniform float phosphorGlow;
uniform float screenFlicker;
uniform float noiseAmount;

void main(void) {
    vec2 coord = vTextureCoord;
    
    // Sample the original texture
    vec4 color = texture2D(uSampler, coord);
    
    // Apply simple scanlines for testing
    if (scanlineIntensity > 0.0) {
        float scanline = sin(coord.y * 600.0 * 3.14159 * 2.0) * 0.5 + 0.5;
        float scanlineFactor = 1.0 - (1.0 - scanline) * scanlineIntensity;
        color.rgb *= scanlineFactor;
    }
    
    // Apply simple red tint for testing
    if (phosphorGlow > 0.0) {
        color.r += phosphorGlow * 0.2;
    }
    
    // Apply flicker
    if (screenFlicker > 0.0) {
        float flicker = sin(time * 60.0) * 0.5 + 0.5;
        color.rgb *= mix(1.0, flicker, screenFlicker * 0.1);
    }
    
    color.rgb = clamp(color.rgb, 0.0, 1.0);
    gl_FragColor = color;
}
`;

/**
 * CRT (Cathode Ray Tube) filter that simulates vintage monitor effects
 * Includes screen curvature, scanlines, phosphor glow, flicker, and noise
 */
export class CRTFilter extends BaseRetroFilter {
  private startTime: number;

  constructor() {
    console.log('🖥️ CRTFilter constructor called');

    const uniforms = {
      time: 0.0,
      curvature: 0.3,
      scanlineIntensity: 0.5,
      phosphorGlow: 0.4,
      screenFlicker: 0.2,
      noiseAmount: 0.1,
    };

    console.log('🖥️ CRT uniforms:', uniforms);
    console.log('🖥️ CRT vertex shader length:', crtVertexShader?.length || 'undefined');
    console.log('🖥️ CRT fragment shader length:', crtFragmentShader?.length || 'undefined');

    // Use embedded shaders if file loading failed
    const vertexShader = crtVertexShader || embeddedVertexShader;
    const fragmentShader = crtFragmentShader || embeddedFragmentShader;

    console.log('🖥️ Using vertex shader length:', vertexShader.length);
    console.log('🖥️ Using fragment shader length:', fragmentShader.length);

    try {
      super(vertexShader, fragmentShader, uniforms, 'CRT');
      console.log('🖥️ CRT filter created successfully');
    } catch (error) {
      console.error('🖥️ Error creating CRT filter:', error);
      throw error;
    }

    this.startTime = Date.now();
    this.updateTime();
  }

  /**
   * Get default settings for CRT filter
   * @returns Default CRT settings
   */
  getDefaultSettings(): Record<string, number> {
    return {
      curvature: 0.3,
      scanlineIntensity: 0.5,
      phosphorGlow: 0.4,
      screenFlicker: 0.2,
      noiseAmount: 0.1,
    };
  }

  /**
   * Update CRT filter settings with validation
   * @param settings - New settings to apply
   */
  updateSettings(settings: Record<string, number>): void {
    // Validate and update curvature (0.0 to 1.0)
    if (settings.curvature !== undefined) {
      this.settings.curvature = this.validateSetting('curvature', settings.curvature, 0.0, 1.0);
      this.resources.curvature = this.settings.curvature;
    }

    // Validate and update scanline intensity (0.0 to 1.0)
    if (settings.scanlineIntensity !== undefined) {
      this.settings.scanlineIntensity = this.validateSetting(
        'scanlineIntensity',
        settings.scanlineIntensity,
        0.0,
        1.0
      );
      this.resources.scanlineIntensity = this.settings.scanlineIntensity;
    }

    // Validate and update phosphor glow (0.0 to 1.0)
    if (settings.phosphorGlow !== undefined) {
      this.settings.phosphorGlow = this.validateSetting(
        'phosphorGlow',
        settings.phosphorGlow,
        0.0,
        1.0
      );
      this.resources.phosphorGlow = this.settings.phosphorGlow;
    }

    // Validate and update screen flicker (0.0 to 1.0)
    if (settings.screenFlicker !== undefined) {
      this.settings.screenFlicker = this.validateSetting(
        'screenFlicker',
        settings.screenFlicker,
        0.0,
        1.0
      );
      this.resources.screenFlicker = this.settings.screenFlicker;
    }

    // Validate and update noise amount (0.0 to 1.0)
    if (settings.noiseAmount !== undefined) {
      this.settings.noiseAmount = this.validateSetting(
        'noiseAmount',
        settings.noiseAmount,
        0.0,
        1.0
      );
      this.resources.noiseAmount = this.settings.noiseAmount;
    }
  }

  /**
   * Set screen curvature amount
   * @param amount - Curvature amount (0.0 to 1.0)
   */
  setCurvature(amount: number): void {
    this.updateSettings({ curvature: amount });
  }

  /**
   * Set scanline intensity
   * @param intensity - Scanline intensity (0.0 to 1.0)
   */
  setScanlineIntensity(intensity: number): void {
    this.updateSettings({ scanlineIntensity: intensity });
  }

  /**
   * Set phosphor glow amount
   * @param glow - Phosphor glow amount (0.0 to 1.0)
   */
  setPhosphorGlow(glow: number): void {
    this.updateSettings({ phosphorGlow: glow });
  }

  /**
   * Set screen flicker intensity
   * @param flicker - Screen flicker intensity (0.0 to 1.0)
   */
  setScreenFlicker(flicker: number): void {
    this.updateSettings({ screenFlicker: flicker });
  }

  /**
   * Set noise amount
   * @param noise - Noise amount (0.0 to 1.0)
   */
  setNoiseAmount(noise: number): void {
    this.updateSettings({ noiseAmount: noise });
  }

  /**
   * Update time uniform for time-based effects
   * Should be called each frame for flicker and noise animation
   */
  updateTime(): void {
    const currentTime = (Date.now() - this.startTime) / 1000.0;
    this.resources.time = currentTime;
  }

  /**
   * Apply smooth transitions between settings
   * @param targetSettings - Target settings to transition to
   * @param duration - Transition duration in milliseconds
   * @param onComplete - Optional callback when transition completes
   */
  transitionToSettings(
    targetSettings: Record<string, number>,
    duration = 500,
    onComplete?: () => void
  ): void {
    const startSettings = { ...this.settings };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Use easing function for smooth transition
      const easedProgress = this.easeInOutCubic(progress);

      const currentSettings: Record<string, number> = {};
      Object.keys(targetSettings).forEach(key => {
        if (startSettings[key] !== undefined) {
          const start = startSettings[key];
          const target = targetSettings[key];
          currentSettings[key] = start + (target - start) * easedProgress;
        }
      });

      this.updateSettings(currentSettings);

      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    animate();
  }

  /**
   * Easing function for smooth transitions
   * @param t - Progress value (0 to 1)
   * @returns Eased progress value
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Get comprehensive CRT settings for UI display
   * @returns Object with setting names, current values, and ranges
   */
  getSettingsInfo(): Record<
    string,
    { value: number; min: number; max: number; description: string }
  > {
    return {
      curvature: {
        value: this.settings.curvature,
        min: 0.0,
        max: 1.0,
        description: 'Screen curvature distortion amount',
      },
      scanlineIntensity: {
        value: this.settings.scanlineIntensity,
        min: 0.0,
        max: 1.0,
        description: 'Intensity of horizontal scanlines',
      },
      phosphorGlow: {
        value: this.settings.phosphorGlow,
        min: 0.0,
        max: 1.0,
        description: 'Phosphor glow effect on bright areas',
      },
      screenFlicker: {
        value: this.settings.screenFlicker,
        min: 0.0,
        max: 1.0,
        description: 'Screen flicker intensity',
      },
      noiseAmount: {
        value: this.settings.noiseAmount,
        min: 0.0,
        max: 1.0,
        description: 'Amount of screen noise',
      },
    };
  }

  /**
   * Override apply method to update time uniform
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply(filterManager: any, input: any, output: any, clearMode?: any): void {
    this.updateTime();
    super.apply(filterManager, input, output, clearMode);
  }
}
