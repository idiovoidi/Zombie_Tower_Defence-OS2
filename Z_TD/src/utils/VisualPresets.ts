import { ColorMatrixFilter, Container, Filter } from 'pixi.js';
import {
  BloomFilter,
  ChromaticAberrationFilter,
  ColorShiftFilter,
  FilmGrainFilter,
  KaleidoscopeFilter,
  OilPaintingFilter,
  VignetteFilter,
  WaveDistortionFilter,
} from '../ui/shaders/filters/CreativeFilters';
import { SimpleRetroFilter } from '../ui/shaders/filters/SimpleRetroFilter';
import { VHSFilter } from '../ui/shaders/filters/NewRetroFilters';
import {
  FixedGameBoyFilter,
  PassThroughFilter,
  RedTintFilter,
  SimpleEdgeDetectionFilter,
  SimpleGrayscaleFilter,
  SuperSimplePixelationFilter,
} from '../ui/shaders/filters/TestShaders';
import {
  InscryptionChromaticFilter,
  InscryptionColorGradingFilter,
  InscryptionGrainFilter,
  InscryptionScanlinesFilter,
  InscryptionVignetteFilter,
} from '../ui/shaders/filters/InscryptionFilters';
import { DebugUtils } from './DebugUtils';

/**
 * Visual preset manager for layered filter effects
 */
export class VisualPresets {
  private container: Container;
  private activeFilters: Filter[] = [];

  constructor(container: Container) {
    this.container = container;
  }

  /**
   * Clear all filters
   */
  clear(): void {
    this.container.filters = null;
    this.activeFilters = [];
  }

  /**
   * Apply a preset combination of filters
   */
  applyPreset(presetName: string): void {
    this.clear();

    switch (presetName) {
      case 'cinematic':
        this.applyCinematicPreset();
        break;
      case 'retro-arcade':
        this.applyRetroArcadePreset();
        break;
      case 'horror':
        this.applyHorrorPreset();
        break;
      case 'dark-mode':
        this.applyDarkModePreset();
        break;
      case 'glitch':
        this.applyGlitchPreset();
        break;
      case 'oil-painting':
        this.applyOilPaintingPreset();
        break;
      case 'comic-book':
        this.applyComicBookPreset();
        break;
      case 'psychedelic':
        this.applyPsychedelicPreset();
        break;
      case 'underwater':
        this.applyUnderwaterPreset();
        break;
      case 'kaleidoscope':
        this.applyKaleidoscopePreset();
        break;
      case 'trippy':
        this.applyTrippyPreset();
        break;
      case 'gameboy':
        this.applyGameBoyPreset();
        break;
      case 'vhs':
        this.applyVHSPreset();
        break;
      case 'pixel-perfect':
        this.applyPixelPerfectPreset();
        break;
      case 'dithered':
        this.applyDitheredPreset();
        break;
      case 'crt-monitor':
        this.applyCRTMonitorPreset();
        break;
      case 'test-passthrough':
        this.applyTestPassThroughPreset();
        break;
      case 'test-redtint':
        this.applyTestRedTintPreset();
        break;
      case 'test-grayscale':
        this.applyTestGrayscalePreset();
        break;
      case 'test-pixel':
        this.applyTestPixelPreset();
        break;
      case 'test-gameboy':
        this.applyTestGameBoyPreset();
        break;
      case 'inscryption':
        this.applyInscryptionPreset();
        break;
      default:
        DebugUtils.warn(`Unknown preset: ${presetName}`);
    }
  }

  /**
   * Cinematic - Vignette + film grain + slight desaturation
   */
  private applyCinematicPreset(): void {
    const vignette = new VignetteFilter({ intensity: 0.6, radius: 0.7 });
    const grain = new FilmGrainFilter({ intensity: 0.08 });
    const color = new ColorMatrixFilter();
    color.desaturate();
    color.contrast(1.2, false);

    this.activeFilters = [color, vignette, grain];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🎬 Cinematic preset applied');
  }

  /**
   * Retro Arcade - Pixelation + scanlines (simplified to single filter)
   */
  private applyRetroArcadePreset(): void {
    const retro = new SimpleRetroFilter({ pixelSize: 3, scanlineIntensity: 0.4 });
    this.activeFilters = [retro];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🕹️ Retro Arcade preset applied');
  }

  /**
   * Horror - Desaturated + vignette + chromatic aberration
   */
  private applyHorrorPreset(): void {
    const color = new ColorMatrixFilter();
    color.desaturate();
    color.contrast(1.3, false);

    const vignette = new VignetteFilter({ intensity: 0.8, radius: 0.6 });
    const chromatic = new ChromaticAberrationFilter({ offset: 0.005 });

    this.activeFilters = [color, vignette, chromatic];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('👻 Horror preset applied');
  }

  /**
   * Dark Mode - Mild horror effect with better readability
   */
  private applyDarkModePreset(): void {
    const color = new ColorMatrixFilter();
    // Less desaturation for better color clarity
    color.desaturate();
    color.saturate(0.7, false); // Bring back some color
    color.contrast(1.15, false); // Less contrast for readability

    // Lighter vignette for less darkness
    const vignette = new VignetteFilter({ intensity: 0.5, radius: 0.75 });

    this.activeFilters = [color, vignette];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🌙 Dark Mode preset applied');
  }

  /**
   * Glitch - Chromatic aberration + film grain
   */
  private applyGlitchPreset(): void {
    const chromatic = new ChromaticAberrationFilter({ offset: 0.008 });
    const grain = new FilmGrainFilter({ intensity: 0.15 });

    this.activeFilters = [chromatic, grain];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('⚡ Glitch preset applied');
  }

  /**
   * Oil Painting - Artistic painterly effect
   */
  private applyOilPaintingPreset(): void {
    const oil = new OilPaintingFilter({ radius: 3.0, intensity: 8.0 });
    const color = new ColorMatrixFilter();
    color.saturate(1.3, false);

    this.activeFilters = [oil, color];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🎨 Oil Painting preset applied');
  }

  /**
   * Comic Book - Just edge detection (simplified to single filter)
   */
  private applyComicBookPreset(): void {
    const edge = new SimpleEdgeDetectionFilter({ thickness: 1.5 });
    this.activeFilters = [edge];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('💥 Comic Book preset applied');
  }

  /**
   * Psychedelic - Color shift + kaleidoscope
   */
  private applyPsychedelicPreset(): void {
    const colorShift = new ColorShiftFilter({ speed: 1.0, intensity: 2.0 });
    const bloom = new BloomFilter({ intensity: 1.5, threshold: 0.4 });

    this.activeFilters = [colorShift, bloom];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🌈 Psychedelic preset applied');
  }

  /**
   * Underwater - Wave distortion + blue tint
   */
  private applyUnderwaterPreset(): void {
    const wave = new WaveDistortionFilter({ amplitude: 0.015, frequency: 8.0, speed: 1.5 });
    const color = new ColorMatrixFilter();
    // Blue tint
    color.matrix = [0.7, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0, 1, 0];

    this.activeFilters = [wave, color];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🌊 Underwater preset applied');
  }

  /**
   * Kaleidoscope - Mirror effect
   */
  private applyKaleidoscopePreset(): void {
    const kaleidoscope = new KaleidoscopeFilter({ segments: 6, angle: 0 });
    const bloom = new BloomFilter({ intensity: 1.3, threshold: 0.5 });

    this.activeFilters = [kaleidoscope, bloom];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🔮 Kaleidoscope preset applied');
  }

  /**
   * Trippy - All the effects combined!
   */
  private applyTrippyPreset(): void {
    const wave = new WaveDistortionFilter({ amplitude: 0.02, frequency: 12.0, speed: 2.0 });
    const colorShift = new ColorShiftFilter({ speed: 1.5, intensity: 3.0 });
    const bloom = new BloomFilter({ intensity: 2.0, threshold: 0.3 });
    const chromatic = new ChromaticAberrationFilter({ offset: 0.006 });

    this.activeFilters = [wave, colorShift, chromatic, bloom];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🎪 Trippy preset applied');
  }

  /**
   * Game Boy - Classic Game Boy green screen
   */
  private applyGameBoyPreset(): void {
    // Use the working FixedGameBoyFilter instead
    const gameboy = new FixedGameBoyFilter();

    this.activeFilters = [gameboy];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🎮 Game Boy preset applied');
  }

  /**
   * VHS - Retro VHS tape effect
   */
  private applyVHSPreset(): void {
    const vhs = new VHSFilter({ intensity: 0.6 });

    this.activeFilters = [vhs];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('📼 VHS preset applied');
  }

  /**
   * Pixel Perfect - Clean pixelation
   */
  private applyPixelPerfectPreset(): void {
    // Use the working SuperSimplePixelationFilter
    const pixel = new SuperSimplePixelationFilter();

    this.activeFilters = [pixel];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🔲 Pixel Perfect preset applied');
  }

  /**
   * Dithered - Classic dithering effect
   */
  private applyDitheredPreset(): void {
    // Simplified - just pixelation for now since dithering is complex
    const pixel = new SuperSimplePixelationFilter();
    const grayscale = new SimpleGrayscaleFilter();

    this.activeFilters = [pixel, grayscale];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('⬛ Dithered preset applied');
  }

  /**
   * CRT Monitor - Old CRT monitor look
   */
  private applyCRTMonitorPreset(): void {
    // Simplified - use only working filters
    const pixel = new SuperSimplePixelationFilter();
    const bloom = new BloomFilter({ intensity: 0.8, threshold: 0.7 });

    this.activeFilters = [pixel, bloom];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('📺 CRT Monitor preset applied');
  }

  /**
   * TEST: Pass Through - Does nothing (tests if filters work at all)
   */
  private applyTestPassThroughPreset(): void {
    const passthrough = new PassThroughFilter();
    this.activeFilters = [passthrough];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('✅ TEST: Pass Through applied');
  }

  /**
   * TEST: Red Tint - Adds red tint (tests basic color manipulation)
   */
  private applyTestRedTintPreset(): void {
    const redtint = new RedTintFilter();
    this.activeFilters = [redtint];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🔴 TEST: Red Tint applied');
  }

  /**
   * TEST: Grayscale - Simple grayscale (tests color calculations)
   */
  private applyTestGrayscalePreset(): void {
    const grayscale = new SimpleGrayscaleFilter();
    this.activeFilters = [grayscale];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('⚫ TEST: Grayscale applied');
  }

  /**
   * TEST: Pixelation - Super simple pixelation (tests coordinate manipulation)
   */
  private applyTestPixelPreset(): void {
    const pixel = new SuperSimplePixelationFilter();
    this.activeFilters = [pixel];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🔲 TEST: Pixelation applied');
  }

  /**
   * TEST: Game Boy - Fixed Game Boy filter (tests if-else logic)
   */
  private applyTestGameBoyPreset(): void {
    const gameboy = new FixedGameBoyFilter();
    this.activeFilters = [gameboy];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🎮 TEST: Game Boy applied');
  }

  /**
   * Inscryption - Dark, eerie, desaturated aesthetic
   */
  private applyInscryptionPreset(): void {
    const colorGrading = new InscryptionColorGradingFilter();
    const vignette = new InscryptionVignetteFilter({ intensity: 0.85 });
    const grain = new InscryptionGrainFilter({ intensity: 0.15 });
    const chromatic = new InscryptionChromaticFilter({ offset: 0.003 });
    const scanlines = new InscryptionScanlinesFilter({ intensity: 0.15 });

    this.activeFilters = [colorGrading, vignette, chromatic, grain, scanlines];
    this.container.filters = this.activeFilters;
    DebugUtils.debug('🃏 Inscryption preset applied');
  }

  /**
   * Update animated filters (call in game loop)
   */
  update(deltaTime: number): void {
    this.activeFilters.forEach(filter => {
      if (filter instanceof FilmGrainFilter) {
        filter.updateTime(deltaTime);
      }
      if (filter instanceof SimpleRetroFilter) {
        filter.updateTime(deltaTime);
      }
      if (filter instanceof WaveDistortionFilter) {
        filter.updateTime(deltaTime);
      }
      if (filter instanceof ColorShiftFilter) {
        filter.updateTime(deltaTime);
      }
      if (filter instanceof KaleidoscopeFilter) {
        filter.updateAngle(deltaTime);
      }
      if (filter instanceof VHSFilter) {
        filter.updateTime(deltaTime);
      }
      if (filter instanceof InscryptionGrainFilter) {
        filter.updateTime(deltaTime);
      }
    });
  }

  /**
   * Get active filters
   */
  getActiveFilters(): unknown[] {
    return this.activeFilters;
  }
}
