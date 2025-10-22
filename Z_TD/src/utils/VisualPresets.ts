import { ColorMatrixFilter, Container } from 'pixi.js';
import {
  BloomFilter,
  ChromaticAberrationFilter,
  FilmGrainFilter,
  VignetteFilter,
} from '../ui/shaders/filters/CreativeFilters';
import { SimpleRetroFilter } from '../ui/shaders/filters/SimpleRetroFilter';

/**
 * Visual preset manager for layered filter effects
 */
export class VisualPresets {
  private container: Container;
  private activeFilters: any[] = [];

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
   * Retro Arcade - Pixelation + scanlines + slight bloom
   */
  private applyRetroArcadePreset(): void {
    const retro = new SimpleRetroFilter({ pixelSize: 3, scanlineIntensity: 0.4 });
    const bloom = new BloomFilter({ intensity: 1.2, threshold: 0.6 });

    this.activeFilters = [retro, bloom];
    this.container.filters = this.activeFilters;
    console.log('🕹️ Retro Arcade preset applied');
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
    });
  }

  /**
   * Get active filters
   */
  getActiveFilters(): any[] {
    return this.activeFilters;
  }
}
