import { Texture } from 'pixi.js';

/** Single-pixel PNG fallback when canvas is unavailable (e.g. some test runners). */
const FALLBACK_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

let radialParticleTexture: Texture | null = null;

function createRadialGradientCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2d context for particle texture');
  }
  const cx = size / 2;
  const r = size / 2 - 1;
  const g = ctx.createRadialGradient(cx, cx, 0, cx, cx, r);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/**
 * Shared soft-circle texture for tinted particle batches (blood, sparks, smoke-style blobs).
 * All particles in one {@link ParticleContainer} must share the same texture source.
 */
export function getRadialParticleTexture(): Texture {
  if (radialParticleTexture) {
    return radialParticleTexture;
  }

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    radialParticleTexture = Texture.from(createRadialGradientCanvas(32));
  } else {
    radialParticleTexture = Texture.from(FALLBACK_DATA_URL);
  }

  return radialParticleTexture;
}
