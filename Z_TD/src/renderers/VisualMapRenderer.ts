import { Application, Graphics } from 'pixi.js';
import { GRAVEYARD, LAYER_INDICES } from '../config/visualConstants';
import { InputManager } from '../managers/InputManager';
import { MapData, MapManager } from '../managers/MapManager';
import { CampRenderer } from './map/CampRenderer';
import { GraveyardRenderer } from './map/GraveyardRenderer';
import { PathRenderer } from './map/PathRenderer';
import { StructureRenderer } from './map/StructureRenderer';
import { TerrainRenderer } from './map/TerrainRenderer';
import { FogRenderer } from './effects/FogRenderer';
import { ZombieCorpseRenderer } from './zombies/ZombieCorpseRenderer';

export class VisualMapRenderer {
  private app: Application;
  private mapManager: MapManager;
  private inputManager: InputManager;
  private mapContainer: Graphics;
  private pathGraphics: Graphics;
  private fogContainer: Graphics;
  private corpseContainer: Graphics;
  private corpseRenderer: ZombieCorpseRenderer;
  private campAnimationContainer: Graphics;

  // Sub-renderers
  private terrainRenderer: TerrainRenderer;
  private pathRenderer: PathRenderer;
  private graveyardRenderer: GraveyardRenderer;
  private campRenderer: CampRenderer;
  private structureRenderer: StructureRenderer;
  private fogRenderer: FogRenderer;

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
    this.fogRenderer = new FogRenderer(this.fogContainer);

    // Initialize fog for graveyard area
    this.fogRenderer.initialize(GRAVEYARD.X, GRAVEYARD.Y, GRAVEYARD.WIDTH, GRAVEYARD.HEIGHT);

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
  // Note: initializeFogParticles(), updateFog(), renderFog()
  // have been replaced by FogRenderer

  public clear(): void {
    this.mapContainer.clear();
    this.pathGraphics.clear();
    this.corpseContainer.clear();
    this.corpseRenderer.clear();
    this.fogRenderer.clear();

    // Clean up click area via InputManager
    this.inputManager.clearCampClickArea();
  }

  public updateFog(deltaTime: number): void {
    // Update fog animation
    this.fogRenderer.update(deltaTime);

    // Update corpses (fade over time)
    this.corpseRenderer.update(deltaTime);

    // Update camp animations
    this.campRenderer.updateAnimations(deltaTime);

    // Render fog and corpses
    this.fogRenderer.render();
    this.renderCorpses();
  }

  public addCorpse(x: number, y: number, type: string): void {
    this.corpseRenderer.addCorpse(x, y, type);
  }

  private renderCorpses(): void {
    this.corpseContainer.clear();
    this.corpseRenderer.render();
  }
}
