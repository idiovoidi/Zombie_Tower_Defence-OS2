import { Application, Graphics } from 'pixi.js';
import { GRAVEYARD, LAYER_INDICES } from '../config/visualConstants';
import { InputManager } from '../managers/InputManager';
import { MapData, MapManager } from '../managers/MapManager';
import { CampRenderer } from './map/CampRenderer';
import { GraveyardRenderer } from './map/GraveyardRenderer';
import { PathRenderer } from './map/PathRenderer';
import { StructureRenderer } from './map/StructureRenderer';
import { TerrainRenderer } from './map/TerrainRenderer';
import { ZombieCorpseRenderer } from './zombies/ZombieCorpseRenderer';

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

export class VisualMapRenderer {
  private app: Application;
  private mapManager: MapManager;
  private inputManager: InputManager;
  private mapContainer: Graphics;
  private pathGraphics: Graphics;
  private fogContainer: Graphics;
  private fogParticles: FogParticle[] = [];
  private fogTime: number = 0;
  private graveyardBounds: { x: number; y: number; width: number; height: number } = {
    x: GRAVEYARD.X,
    y: GRAVEYARD.Y,
    width: GRAVEYARD.WIDTH,
    height: GRAVEYARD.HEIGHT,
  };
  private corpseContainer: Graphics;
  private corpseRenderer: ZombieCorpseRenderer;
  private campAnimationContainer: Graphics;

  // Sub-renderers
  private terrainRenderer: TerrainRenderer;
  private pathRenderer: PathRenderer;
  private graveyardRenderer: GraveyardRenderer;
  private campRenderer: CampRenderer;
  private structureRenderer: StructureRenderer;

  constructor(app: Application, mapManager: MapManager, inputManager: InputManager) {
    this.app = app;
    this.mapManager = mapManager;
    this.inputManager = inputManager;
    this.mapContainer = new Graphics();
    this.pathGraphics = new Graphics();
    this.fogContainer = new Graphics();
    this.corpseContainer = new Graphics();
    this.campAnimationContainer = new Graphics();
    this.corpseRenderer = new ZombieCorpseRenderer(this.corpseContainer);

    // Initialize sub-renderers
    this.terrainRenderer = new TerrainRenderer(this.mapContainer);
    this.pathRenderer = new PathRenderer(this.mapContainer);
    this.graveyardRenderer = new GraveyardRenderer(this.mapContainer);
    this.campRenderer = new CampRenderer(this.pathGraphics, this.campAnimationContainer);
    this.structureRenderer = new StructureRenderer(this.mapContainer);

    // Add to stage at the beginning so it renders behind everything
    this.app.stage.addChildAt(this.mapContainer, LAYER_INDICES.MAP_BACKGROUND);
    this.app.stage.addChildAt(this.pathGraphics, LAYER_INDICES.PATH);
    // Corpses render on ground level
    this.app.stage.addChildAt(this.corpseContainer, LAYER_INDICES.CORPSES);
    // Camp animations render above corpses
    this.app.stage.addChildAt(this.campAnimationContainer, LAYER_INDICES.CAMP_ANIMATIONS);
    // Fog renders on top of corpses but behind game objects
    this.app.stage.addChildAt(this.fogContainer, LAYER_INDICES.FOG);
  }

  public setCampClickCallback(callback: () => void): void {
    this.inputManager.setCampClickCallback(callback);
  }

  public renderMap(_mapName: string): void {
    // Clear previous map
    this.mapContainer.clear();
    this.pathGraphics.clear();

    // Get map data
    const mapData = this.mapManager.getCurrentMap();
    if (!mapData) {
      return;
    }

    // Render terrain (ground texture, UI panel)
    this.terrainRenderer.render(mapData);

    // Render path on mapContainer (so it appears under graveyard)
    this.pathRenderer.render(mapData);

    // Render graveyard and other foreground elements
    this.renderForegroundElements(mapData);
  }

  // Note: renderMapBackground() has been replaced by TerrainRenderer
  // Note: renderPath() has been replaced by PathRenderer

  private renderForegroundElements(mapData: MapData): void {
    // Add graveyard on the left (zombie spawn area)
    this.graveyardRenderer.render();

    // Add structures (houses, trees, decorations)
    this.structureRenderer.render(mapData);

    // Add survivor camp at the end of the path
    const endpoint = mapData.waypoints[mapData.waypoints.length - 1];
    this.campRenderer.render(endpoint);

    // Create clickable area for camp via InputManager
    const campPos = this.campRenderer.getCampPosition();
    this.inputManager.createCampClickArea(campPos.x, campPos.y);
  }

  // Note: addCornerTrees(), renderTree(), renderDestroyedHouses(), renderDestroyedHouse()
  // have been replaced by StructureRenderer
  // Note: addDecorativeElements(), isAwayFromPath(), distanceToLineSegment()
  // have been replaced by StructureRenderer

  public clear(): void {
    this.mapContainer.clear();
    this.pathGraphics.clear();
    this.fogContainer.clear();
    this.corpseContainer.clear();
    this.fogParticles = [];
    this.corpseRenderer.clear();

    // Clean up click area via InputManager
    this.inputManager.clearCampClickArea();
  }

  private initializeFogParticles(
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
    for (let i = 0; i < 12; i++) {
      const x = graveyardX + Math.random() * graveyardWidth;
      const y = graveyardY + graveyardHeight - 40 + Math.random() * 30;
      this.fogParticles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: 18 + Math.random() * 15,
        speed: 0.3 + Math.random() * 0.4,
        alpha: 0.12 + Math.random() * 0.08,
        baseAlpha: 0.12 + Math.random() * 0.08,
        pulseOffset: Math.random() * Math.PI * 2,
        driftOffset: Math.random() * Math.PI * 2,
      });
    }

    // Lower fog layer (denser, ground-hugging)
    for (let i = 0; i < 10; i++) {
      const x = graveyardX + Math.random() * graveyardWidth;
      const y = graveyardY + graveyardHeight - 15 + Math.random() * 10;
      this.fogParticles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: 25 + Math.random() * 20,
        speed: 0.2 + Math.random() * 0.3,
        alpha: 0.15 + Math.random() * 0.1,
        baseAlpha: 0.15 + Math.random() * 0.1,
        pulseOffset: Math.random() * Math.PI * 2,
        driftOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  public updateFog(deltaTime: number): void {
    if (this.fogParticles.length === 0) {
      return;
    }

    this.fogTime += deltaTime * 0.001; // Convert to seconds

    // Update fog particle positions and alpha
    for (const particle of this.fogParticles) {
      // Horizontal drift (slow wave motion)
      const driftX = Math.sin(this.fogTime * particle.speed + particle.driftOffset) * 15;
      particle.x = particle.baseX + driftX;

      // Vertical bob (very subtle)
      const bobY = Math.sin(this.fogTime * particle.speed * 0.5 + particle.driftOffset * 0.5) * 3;
      particle.y = particle.baseY + bobY;

      // Pulsing alpha (breathing effect)
      const pulseFactor = Math.sin(this.fogTime * 0.5 + particle.pulseOffset) * 0.5 + 0.5;
      particle.alpha = particle.baseAlpha * (0.7 + pulseFactor * 0.3);

      // Wrap around horizontally
      if (particle.x < this.graveyardBounds.x - particle.size) {
        particle.baseX = this.graveyardBounds.x + this.graveyardBounds.width + particle.size;
      } else if (particle.x > this.graveyardBounds.x + this.graveyardBounds.width + particle.size) {
        particle.baseX = this.graveyardBounds.x - particle.size;
      }
    }

    // Update corpses (fade over time)
    this.corpseRenderer.update(deltaTime);

    // Update camp animations
    this.campRenderer.updateAnimations(deltaTime);

    // Render fog and corpses
    this.renderFog();
    this.renderCorpses();
  }

  public addCorpse(x: number, y: number, type: string): void {
    this.corpseRenderer.addCorpse(x, y, type);
  }

  private renderCorpses(): void {
    this.corpseContainer.clear();
    this.corpseRenderer.render();
  }

  private renderFog(): void {
    this.fogContainer.clear();

    for (const particle of this.fogParticles) {
      // Determine color based on height (lower fog is slightly darker/greener)
      const isLowerFog = particle.size > 30;
      const color = isLowerFog ? 0xa0b0a0 : 0xb0c0b0;

      this.fogContainer.circle(particle.x, particle.y, particle.size);
      this.fogContainer.fill({ color, alpha: particle.alpha });
    }
  }
}
