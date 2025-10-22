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
      case 'neon':
        this.applyNeonPreset();
        break;
      case 'cinematic':
        this.applyCinematicPreset();
        break;
      case 'retro-arcade':
        this.applyRetroArcadePreset();
        break;
      case 'horror':
        this.applyHorrorPreset();
        break;
      case 'dreamy':
        this.applyDreamyPreset();
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
        console.warn(`Unknown preset: ${presetName}`);
    }
  }

  /**
   * Neon - Bright bloom with high contrast
   */
  private applyNeonPreset(): void {
    const bloom = new BloomFilter({ intensity: 2.0, threshold: 0.4 });
    const contrast = new ColorMatrixFilter();
    contrast.contrast(1.5, true);

    this.activeFilters = [contrast, bloom];
    this.container.filters = this.activeFilters;
    console.log('🌟 Neon preset applied');
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
    console.log('🎬 Cinematic preset applied');
  }

  /**
   * Retro Arcade - Pixelation + scanlines (simplified to single filter)
   */
  private applyRetroArcadePreset(): void {
    console.log('🕹️ Creating SimpleRetroFilter...');
    const retro = new SimpleRetroFilter({ pixelSize: 3, scanlineIntensity: 0.4 });
    console.log('✅ SimpleRetroFilter created:', retro);

    this.activeFilters = [retro];
    console.log('✅ Active filters array:', this.activeFilters);

    this.container.filters = this.activeFilters;
    console.log('✅ Filters applied to container');
    console.log('✅ Container.filters:', this.container.filters);
    console.log('🕹️ Retro Arcade preset applied (single filter)');
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
    console.log('👻 Horror preset applied');
  }

  /**
   * Dreamy - Bloom + slight blur effect via low contrast
   */
  private applyDreamyPreset(): void {
    const bloom = new BloomFilter({ intensity: 1.8, threshold: 0.3 });
    const color = new ColorMatrixFilter();
    color.contrast(0.8, false);
    color.saturate(1.2, false);

    this.activeFilters = [color, bloom];
    this.container.filters = this.activeFilters;
    console.log('✨ Dreamy preset applied');
  }

  /**
   * Glitch - Chromatic aberration + film grain
   */
  private applyGlitchPreset(): void {
    const chromatic = new ChromaticAberrationFilter({ offset: 0.008 });
    const grain = new FilmGrainFilter({ intensity: 0.15 });

    this.activeFilters = [chromatic, grain];
    this.container.filters = this.activeFilters;
    console.log('⚡ Glitch preset applied');
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
    console.log('🎨 Oil Painting preset applied');
  }

  /**
   * Comic Book - Just edge detection (simplified to single filter)
   */
  private applyComicBookPreset(): void {
    console.log('💥 Creating SimpleEdgeDetectionFilter...');
    const edge = new SimpleEdgeDetectionFilter({ thickness: 1.5 });
    console.log('✅ SimpleEdgeDetectionFilter created:', edge);

    this.activeFilters = [edge];
    console.log('✅ Active filters array:', this.activeFilters);

    this.container.filters = this.activeFilters;
    console.log('✅ Filters applied to container');
    console.log('✅ Container.filters:', this.container.filters);
    console.log('💥 Comic Book preset applied (edge detection only)');
  }

  /**
   * Psychedelic - Color shift + kaleidoscope
   */
  private applyPsychedelicPreset(): void {
    const colorShift = new ColorShiftFilter({ speed: 1.0, intensity: 2.0 });
    const bloom = new BloomFilter({ intensity: 1.5, threshold: 0.4 });

    this.activeFilters = [colorShift, bloom];
    this.container.filters = this.activeFilters;
    console.log('🌈 Psychedelic preset applied');
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
    console.log('🌊 Underwater preset applied');
  }

  /**
   * Kaleidoscope - Mirror effect
   */
  private applyKaleidoscopePreset(): void {
    const kaleidoscope = new KaleidoscopeFilter({ segments: 6, angle: 0 });
    const bloom = new BloomFilter({ intensity: 1.3, threshold: 0.5 });

    this.activeFilters = [kaleidoscope, bloom];
    this.container.filters = this.activeFilters;
    console.log('🔮 Kaleidoscope preset applied');
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
    console.log('🎪 Trippy preset applied');
  }

  /**
   * Game Boy - Classic Game Boy green screen
   */
  private applyGameBoyPreset(): void {
    // Use the working FixedGameBoyFilter instead
    const gameboy = new FixedGameBoyFilter();

    this.activeFilters = [gameboy];
    this.container.filters = this.activeFilters;
    console.log('🎮 Game Boy preset applied');
  }

  /**
   * VHS - Retro VHS tape effect
   */
  private applyVHSPreset(): void {
    const vhs = new VHSFilter({ intensity: 0.6 });

    this.activeFilters = [vhs];
    this.container.filters = this.activeFilters;
    console.log('📼 VHS preset applied');
  }

  /**
   * Pixel Perfect - Clean pixelation
   */
  private applyPixelPerfectPreset(): void {
    // Use the working SuperSimplePixelationFilter
    const pixel = new SuperSimplePixelationFilter();

    this.activeFilters = [pixel];
    this.container.filters = this.activeFilters;
    console.log('🔲 Pixel Perfect preset applied');
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
    console.log('⬛ Dithered preset applied (simplified)');
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
    console.log('📺 CRT Monitor preset applied (simplified)');
  }

  /**
   * TEST: Pass Through - Does nothing (tests if filters work at all)
   */
  private applyTestPassThroughPreset(): void {
    const passthrough = new PassThroughFilter();
    this.activeFilters = [passthrough];
    this.container.filters = this.activeFilters;
    console.log('✅ TEST: Pass Through applied (should see no change)');
  }

  /**
   * TEST: Red Tint - Adds red tint (tests basic color manipulation)
   */
  private applyTestRedTintPreset(): void {
    const redtint = new RedTintFilter();
    this.activeFilters = [redtint];
    this.container.filters = this.activeFilters;
    console.log('🔴 TEST: Red Tint applied (should see red tint)');
  }

  /**
   * TEST: Grayscale - Simple grayscale (tests color calculations)
   */
  private applyTestGrayscalePreset(): void {
    const grayscale = new SimpleGrayscaleFilter();
    this.activeFilters = [grayscale];
    this.container.filters = this.activeFilters;
    console.log('⚫ TEST: Grayscale applied (should be black & white)');
  }

  /**
   * TEST: Pixelation - Super simple pixelation (tests coordinate manipulation)
   */
  private applyTestPixelPreset(): void {
    const pixel = new SuperSimplePixelationFilter();
    this.activeFilters = [pixel];
    this.container.filters = this.activeFilters;
    console.log('🔲 TEST: Pixelation applied (should be pixelated)');
  }

  /**
   * TEST: Game Boy - Fixed Game Boy filter (tests if-else logic)
   */
  private applyTestGameBoyPreset(): void {
    const gameboy = new FixedGameBoyFilter();
    this.activeFilters = [gameboy];
    this.container.filters = this.activeFilters;
    console.log('🎮 TEST: Game Boy applied (should be green)');
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
    console.log('🃏 Inscryption preset applied (dark, eerie aesthetic)');
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
