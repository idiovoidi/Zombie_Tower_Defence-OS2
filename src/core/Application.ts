import { Application, CullerPlugin, extensions } from 'pixi.js';
import { ScaleManager } from '../utils/ScaleManager';

export interface AppContext {
  app: Application;
  pixelArtRenderer: Awaited<ReturnType<typeof createPixelArtRenderer>>;
  scaleManager: ScaleManager;
}

type PixelArtRendererClass = InstanceType<typeof import('../utils/PixelArtRenderer').PixelArtRenderer>;

async function createPixelArtRenderer(app: Application): Promise<PixelArtRendererClass> {
  const { PixelArtRenderer } = await import('../utils/PixelArtRenderer');
  return new PixelArtRenderer(app, app.stage);
}

export async function createApp(): Promise<AppContext> {
  const app = new Application();

  await app.init({
    background: '#101010',
    width: 1280,
    height: 768,
  });

  extensions.add(CullerPlugin);
  console.log('🎮 Culling enabled for off-screen objects');

  document.getElementById('pixi-container')?.appendChild(app.canvas);

  console.log('🎮 Pixel-perfect mode: Use PixelArtRenderer for true pixel art');

  const pixelArtRenderer = await createPixelArtRenderer(app);

  // Uncomment to enable pixel art rendering (renders at lower resolution)
  // pixelArtRenderer.enable(3); // 3x scale = 1/3 resolution

  const scaleManager = new ScaleManager(app);

  return { app, pixelArtRenderer, scaleManager };
}
