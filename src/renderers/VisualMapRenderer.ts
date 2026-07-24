import { type Application, type Container, Graphics } from 'pixi.js';
import { GRAVEYARD, LAYER_INDICES } from '../config/visualConstants';
import type { InputManager } from '../managers/InputManager';
import type { MapData, MapManager } from '../managers/MapManager';
import { FogRenderer } from './effects/FogRenderer';
import { CampRenderer } from './map/CampRenderer';
import { DecalRenderer } from './map/DecalRenderer';
import { GraveyardRenderer } from './map/GraveyardRenderer';
import { PathRenderer } from './map/PathRenderer';
import { StructureRenderer } from './map/StructureRenderer';
import { TerrainRenderer } from './map/TerrainRenderer';
import { ZombieCorpseRenderer } from './zombies/ZombieCorpseRenderer';

export class VisualMapRenderer {
  private mapManager: MapManager;
  private inputManager: InputManager;
  private worldContainer: Container;
  private mapContainer: Graphics;
  private pathGraphics: Graphics;
  private fogContainer: Graphics;
  private corpseContainer: Graphics;
  private corpseRenderer: ZombieCorpseRenderer;
  private campAnimationContainer: Graphics;
  private decalContainer: Graphics;

  // Sub-renderers
  private terrainRenderer: TerrainRenderer;
  private pathRenderer: PathRenderer;
  private graveyardRenderer: GraveyardRenderer;
  private campRenderer: CampRenderer;
  private structureRenderer: StructureRenderer;
  private decalRenderer: DecalRenderer;
  private fogRenderer: FogRenderer;
  private onMapRendered: ((mapData: MapData | null) => void) | null = null;

  constructor(
    _app: Application,
    mapManager: MapManager,
    inputManager: InputManager,
    worldContainer: Container
  ) {
    this.mapManager = mapManager;
    this.inputManager = inputManager;
    this.worldContainer = worldContainer;
    this.mapContainer = new Graphics();
    this.pathGraphics = new Graphics();
    this.fogContainer = new Graphics();
    this.corpseContainer = new Graphics();
    this.campAnimationContainer = new Graphics();
    this.decalContainer = new Graphics();
    this.corpseRenderer = new ZombieCorpseRenderer(this.corpseContainer);

    // Initialize sub-renderers
    this.terrainRenderer = new TerrainRenderer(this.mapContainer);
    this.pathRenderer = new PathRenderer(this.mapContainer);
    this.graveyardRenderer = new GraveyardRenderer(this.mapContainer);
    this.campRenderer = new CampRenderer(this.pathGraphics, this.campAnimationContainer);
    this.structureRenderer = new StructureRenderer(this.mapContainer);
    this.decalRenderer = new DecalRenderer(this.decalContainer);
    this.fogRenderer = new FogRenderer(this.fogContainer);

    // Initialize fog for graveyard area
    this.fogRenderer.initialize(GRAVEYARD.X, GRAVEYARD.Y, GRAVEYARD.WIDTH, GRAVEYARD.HEIGHT);

    this.mapContainer.zIndex = LAYER_INDICES.MAP_BACKGROUND;
    this.pathGraphics.zIndex = LAYER_INDICES.PATH;
    this.corpseContainer.zIndex = LAYER_INDICES.CORPSES;
    this.decalContainer.zIndex = LAYER_INDICES.DECAL_ANIMATIONS;
    this.campAnimationContainer.zIndex = LAYER_INDICES.CAMP_ANIMATIONS;
    this.fogContainer.zIndex = LAYER_INDICES.FOG;

    this.worldContainer.addChild(this.mapContainer);
    this.worldContainer.addChild(this.pathGraphics);
    this.worldContainer.addChild(this.corpseContainer);
    this.worldContainer.addChild(this.decalContainer);
    this.worldContainer.addChild(this.campAnimationContainer);
    this.worldContainer.addChild(this.fogContainer);

    this.inputManager.setWorldParent(this.worldContainer);
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
      this.onMapRendered?.(null);
      return;
    }

    // Ensure fog banks exist after a full clear / level reload
    if (!this.fogRenderer.isInitialized()) {
      this.fogRenderer.initialize(GRAVEYARD.X, GRAVEYARD.Y, GRAVEYARD.WIDTH, GRAVEYARD.HEIGHT);
    }

    // Render terrain (ground texture, UI panel)
    this.terrainRenderer.render(mapData);

    // Render path on mapContainer (so it appears under graveyard)
    this.pathRenderer.render(mapData);

    // Render graveyard and other foreground elements
    this.renderForegroundElements(mapData);

    this.onMapRendered?.(mapData);
  }

  private renderForegroundElements(mapData: MapData): void {
    // Add graveyard on the left (zombie spawn area)
    this.graveyardRenderer.render();

    // Add structures (houses, trees, decorations)
    this.structureRenderer.render(mapData);

    // Seed lightweight animated decals (swaying trees, ponds, birds)
    this.decalRenderer.initialize(mapData);

    // Add survivor camp at the end of the path
    const graphEnd = mapData.pathGraph
      ? mapData.pathGraph.nodes.find(n => n.id === mapData.pathGraph?.endId)
      : undefined;
    const endpoint = graphEnd
      ? { x: graphEnd.x, y: graphEnd.y }
      : mapData.waypoints[mapData.waypoints.length - 1];
    this.campRenderer.render(endpoint);

    // Create clickable area for camp via InputManager
    const campPos = this.campRenderer.getCampPosition();
    this.inputManager.createCampClickArea(campPos.x, campPos.y);
  }

  public clear(): void {
    this.mapContainer.clear();
    this.pathGraphics.clear();
    this.corpseContainer.clear();
    this.corpseRenderer.clear();
    this.decalRenderer.clear();
    this.fogRenderer.clear();

    // Clean up click area via InputManager
    this.inputManager.clearCampClickArea();
  }

  public updateFog(deltaTime: number): void {
    // Update fog animation
    this.fogRenderer.update(deltaTime);

    // Update corpses (fade over time)
    this.corpseRenderer.update(deltaTime);

    // Update ambient map decals
    this.decalRenderer.update(deltaTime);

    // Update camp animations
    this.campRenderer.updateAnimations(deltaTime);

    // Render fog and corpses
    this.fogRenderer.render();
    this.renderCorpses();
  }

  public addCorpse(x: number, y: number, type: string): void {
    this.corpseRenderer.addCorpse(x, y, type);
  }

  public setOnMapRendered(callback: ((mapData: MapData | null) => void) | null): void {
    this.onMapRendered = callback;
  }

  private renderCorpses(): void {
    this.corpseContainer.clear();
    this.corpseRenderer.render();
  }
}
