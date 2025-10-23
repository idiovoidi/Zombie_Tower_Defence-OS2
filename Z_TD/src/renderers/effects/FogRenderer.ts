import { Graphics } from 'pixi.js';
import { COLORS, FOG } from '../../config/visualConstants';

interface FogParticle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speed: number;
  alpha: number;
  baseAlpha: number;
  pulseOffset: number;
  driftOffset: number;
}

/**
 * FogRenderer handles animated fog effects for the graveyard area.
 *
 * Features:
 * - Two-layer fog system (upper ethereal, lower ground-hugging)
 * - Animated drift and bob motion
 * - Pulsing alpha for breathing effect
 * - Horizontal wrapping for seamless animation
 */
export class FogRenderer {
  private fogContainer: Graphics;
  private fogParticles: FogParticle[] = [];
  private fogTime: number = 0;
  private graveyardBounds: { x: number; y: number; width: number; height: number };

  constructor(fogContainer: Graphics) {
    this.fogContainer = fogContainer;
    this.graveyardBounds = { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Initialize fog particles for a specific area (typically the graveyard)
   */
  public initialize(
    graveyardX: number,
    graveyardY: number,
    graveyardWidth: number,
    graveyardHeight: number
  ): void {
    this.graveyardBounds = {
      x: graveyardX,
      y: graveyardY,
      width: graveyardWidth,
      height: graveyardHeight,
    };
    this.fogParticles = [];

    // Upper fog layer (lighter, more ethereal)
    for (let i = 0; i < FOG.UPPER_COUNT; i++) {
      const x = graveyardX + Math.random() * graveyardWidth;
      const y = graveyardY + graveyardHeight + FOG.UPPER_Y_BASE + Math.random() * FOG.UPPER_Y_RANGE;
      this.fogParticles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: FOG.UPPER_MIN_SIZE + Math.random() * (FOG.UPPER_MAX_SIZE - FOG.UPPER_MIN_SIZE),
        speed: FOG.UPPER_MIN_SPEED + Math.random() * (FOG.UPPER_MAX_SPEED - FOG.UPPER_MIN_SPEED),
        alpha: FOG.UPPER_MIN_ALPHA + Math.random() * (FOG.UPPER_MAX_ALPHA - FOG.UPPER_MIN_ALPHA),
        baseAlpha:
          FOG.UPPER_MIN_ALPHA + Math.random() * (FOG.UPPER_MAX_ALPHA - FOG.UPPER_MIN_ALPHA),
        pulseOffset: Math.random() * Math.PI * 2,
        driftOffset: Math.random() * Math.PI * 2,
      });
    }

    // Lower fog layer (denser, ground-hugging)
    for (let i = 0; i < FOG.LOWER_COUNT; i++) {
      const x = graveyardX + Math.random() * graveyardWidth;
      const y = graveyardY + graveyardHeight + FOG.LOWER_Y_BASE + Math.random() * FOG.LOWER_Y_RANGE;
      this.fogParticles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: FOG.LOWER_MIN_SIZE + Math.random() * (FOG.LOWER_MAX_SIZE - FOG.LOWER_MIN_SIZE),
        speed: FOG.LOWER_MIN_SPEED + Math.random() * (FOG.LOWER_MAX_SPEED - FOG.LOWER_MIN_SPEED),
        alpha: FOG.LOWER_MIN_ALPHA + Math.random() * (FOG.LOWER_MAX_ALPHA - FOG.LOWER_MIN_ALPHA),
        baseAlpha:
          FOG.LOWER_MIN_ALPHA + Math.random() * (FOG.LOWER_MAX_ALPHA - FOG.LOWER_MIN_ALPHA),
        pulseOffset: Math.random() * Math.PI * 2,
        driftOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  /**
   * Update fog particle positions and alpha values
   */
  public update(deltaTime: number): void {
    if (this.fogParticles.length === 0) {
      return;
    }

    this.fogTime += deltaTime * 0.001; // Convert to seconds

    // Update fog particle positions and alpha
    for (const particle of this.fogParticles) {
      // Horizontal drift (slow wave motion)
      const driftX =
        Math.sin(this.fogTime * particle.speed + particle.driftOffset) * FOG.DRIFT_AMPLITUDE;
      particle.x = particle.baseX + driftX;

      // Vertical bob (very subtle)
      const bobY =
        Math.sin(
          this.fogTime * particle.speed * FOG.BOB_SPEED_FACTOR +
            particle.driftOffset * FOG.BOB_SPEED_FACTOR
        ) * FOG.BOB_AMPLITUDE;
      particle.y = particle.baseY + bobY;

      // Pulsing alpha (breathing effect)
      const pulseFactor =
        Math.sin(this.fogTime * FOG.PULSE_SPEED + particle.pulseOffset) * 0.5 + 0.5;
      particle.alpha =
        particle.baseAlpha *
        (FOG.PULSE_MIN_FACTOR + pulseFactor * (FOG.PULSE_MAX_FACTOR - FOG.PULSE_MIN_FACTOR));

      // Wrap around horizontally
      if (particle.x < this.graveyardBounds.x - particle.size) {
        particle.baseX = this.graveyardBounds.x + this.graveyardBounds.width + particle.size;
      } else if (particle.x > this.graveyardBounds.x + this.graveyardBounds.width + particle.size) {
        particle.baseX = this.graveyardBounds.x - particle.size;
      }
    }
  }

  /**
   * Render fog particles to the fog container
   */
  public render(): void {
    this.fogContainer.clear();

    for (const particle of this.fogParticles) {
      // Determine color based on height (lower fog is slightly darker/greener)
      const isLowerFog = particle.size > FOG.SIZE_THRESHOLD;
      const color = isLowerFog ? COLORS.FOG_LOWER : COLORS.FOG_UPPER;

      this.fogContainer.circle(particle.x, particle.y, particle.size);
      this.fogContainer.fill({ color, alpha: particle.alpha });
    }
  }

  /**
   * Clear all fog particles and reset state
   */
  public clear(): void {
    this.fogContainer.clear();
    this.fogParticles = [];
    this.fogTime = 0;
  }

  /**
   * Check if fog has been initialized
   */
  public isInitialized(): boolean {
    return this.fogParticles.length > 0;
  }
}
