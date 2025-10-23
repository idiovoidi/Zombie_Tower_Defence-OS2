import { Application, Graphics } from 'pixi.js';
import { GRAVEYARD, LAYER_INDICES } from '../config/visualConstants';
import { InputManager } from '../managers/InputManager';
import { MapData, MapManager } from '../managers/MapManager';
import { Waypoint } from '../managers/PathfindingManager';
import { CampRenderer } from './map/CampRenderer';
import { GraveyardRenderer } from './map/GraveyardRenderer';
import { PathRenderer } from './map/PathRenderer';
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

    // Add destroyed houses at the top
    this.renderDestroyedHouses(mapData);

    // Add survivor camp at the end of the path
    const endpoint = mapData.waypoints[mapData.waypoints.length - 1];
    this.campRenderer.render(endpoint);

    // Create clickable area for camp via InputManager
    const campPos = this.campRenderer.getCampPosition();
    this.inputManager.createCampClickArea(campPos.x, campPos.y);

    // Add trees around the corners
    this.addCornerTrees(mapData);

    // Add some visual elements like trees or rocks
    this.addDecorativeElements(mapData);
  }

  private addCornerTrees(mapData: MapData): void {
    // Top-left corner trees
    this.renderTree(80, 80, 35, 'dead');
    this.renderTree(120, 60, 28, 'dead');
    this.renderTree(50, 120, 32, 'dead');

    // Top-right corner trees
    this.renderTree(mapData.width - 80, 80, 38, 'pine');
    this.renderTree(mapData.width - 120, 50, 30, 'pine');
    this.renderTree(mapData.width - 50, 110, 35, 'dead');

    // Bottom-left corner trees
    this.renderTree(70, mapData.height - 80, 40, 'dead');
    this.renderTree(110, mapData.height - 60, 32, 'pine');
    this.renderTree(40, mapData.height - 120, 36, 'dead');

    // Bottom-right corner trees
    this.renderTree(mapData.width - 90, mapData.height - 70, 42, 'pine');
    this.renderTree(mapData.width - 60, mapData.height - 110, 35, 'dead');
    this.renderTree(mapData.width - 130, mapData.height - 90, 38, 'pine');
  }

  private renderTree(x: number, y: number, height: number, type: 'dead' | 'pine'): void {
    if (type === 'dead') {
      // Dead/bare tree
      const trunkWidth = height * 0.15;
      const trunkHeight = height * 0.6;

      // Trunk
      this.mapContainer.rect(x - trunkWidth / 2, y, trunkWidth, trunkHeight).fill(0x4a3a2a);
      this.mapContainer
        .rect(x - trunkWidth / 2, y, trunkWidth, trunkHeight)
        .stroke({ width: 1, color: 0x2a1a1a });

      // Bark texture
      for (let i = 0; i < 4; i++) {
        const barkY = y + (i / 4) * trunkHeight;
        this.mapContainer
          .moveTo(x - trunkWidth / 2, barkY)
          .lineTo(x + trunkWidth / 2, barkY)
          .stroke({ width: 1, color: 0x3a2a1a, alpha: 0.5 });
      }

      // Bare branches
      const branchCount = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < branchCount; i++) {
        const branchY = y + trunkHeight * (0.2 + (i / branchCount) * 0.6);
        const branchLength = height * (0.3 + Math.random() * 0.2);
        const branchAngle = (Math.random() - 0.5) * 0.8;
        const side = i % 2 === 0 ? 1 : -1;

        const endX = x + side * Math.cos(branchAngle) * branchLength;
        const endY = branchY - Math.sin(Math.abs(branchAngle)) * branchLength * 0.5;

        this.mapContainer
          .moveTo(x, branchY)
          .lineTo(endX, endY)
          .stroke({ width: 2 + Math.random(), color: 0x4a3a2a });

        // Small twigs
        if (Math.random() > 0.5) {
          const twigLength = branchLength * 0.3;
          const twigAngle = branchAngle + (Math.random() - 0.5) * 0.5;
          const twigEndX = endX + Math.cos(twigAngle) * twigLength;
          const twigEndY = endY - Math.sin(Math.abs(twigAngle)) * twigLength * 0.5;
          this.mapContainer
            .moveTo(endX, endY)
            .lineTo(twigEndX, twigEndY)
            .stroke({ width: 1, color: 0x4a3a2a, alpha: 0.8 });
        }
      }

      // Shadow
      this.mapContainer
        .ellipse(x, y + trunkHeight, trunkWidth * 1.5, trunkWidth * 0.8)
        .fill({ color: 0x1a1a1a, alpha: 0.3 });
    } else {
      // Pine/evergreen tree
      const trunkWidth = height * 0.12;
      const trunkHeight = height * 0.4;

      // Trunk
      this.mapContainer.rect(x - trunkWidth / 2, y, trunkWidth, trunkHeight).fill(0x5a4a3a);
      this.mapContainer
        .rect(x - trunkWidth / 2, y, trunkWidth, trunkHeight)
        .stroke({ width: 1, color: 0x3a2a1a });

      // Pine foliage (triangular layers)
      const foliageLayers = 4;
      for (let i = 0; i < foliageLayers; i++) {
        const layerY = y - height * 0.15 - i * height * 0.15;
        const layerWidth = height * (0.6 - i * 0.1);
        const layerHeight = height * 0.2;

        // Triangle for pine layer
        this.mapContainer
          .moveTo(x, layerY)
          .lineTo(x - layerWidth / 2, layerY + layerHeight)
          .lineTo(x + layerWidth / 2, layerY + layerHeight)
          .lineTo(x, layerY)
          .fill({ color: 0x2a4a2a, alpha: 0.9 });

        // Darker outline
        this.mapContainer
          .moveTo(x, layerY)
          .lineTo(x - layerWidth / 2, layerY + layerHeight)
          .lineTo(x + layerWidth / 2, layerY + layerHeight)
          .lineTo(x, layerY)
          .stroke({ width: 1, color: 0x1a3a1a });

        // Texture details
        for (let j = 0; j < 3; j++) {
          const detailX = x + (Math.random() - 0.5) * layerWidth * 0.6;
          const detailY = layerY + layerHeight * (0.3 + Math.random() * 0.5);
          this.mapContainer.circle(detailX, detailY, 2).fill({ color: 0x1a3a1a, alpha: 0.6 });
        }
      }

      // Shadow
      this.mapContainer
        .ellipse(x, y + trunkHeight, height * 0.4, height * 0.15)
        .fill({ color: 0x1a1a1a, alpha: 0.3 });
    }
  }

  private renderDestroyedHouses(_mapData: MapData): void {
    // Render several destroyed houses at the top of the map with varied positions
    const houses = [
      { x: 120, y: 20, width: 70, height: 60, destroyed: 0.8 },
      { x: 280, y: 45, width: 80, height: 70, destroyed: 0.6 },
      { x: 480, y: 15, width: 65, height: 55, destroyed: 0.9 },
      { x: 650, y: 35, width: 75, height: 65, destroyed: 0.7 },
      { x: 950, y: 50, width: 55, height: 58, destroyed: 0.75 },
    ];

    for (const house of houses) {
      this.renderDestroyedHouse(house.x, house.y, house.width, house.height, house.destroyed);
    }
  }

  private renderDestroyedHouse(
    x: number,
    y: number,
    width: number,
    height: number,
    destroyedLevel: number
  ): void {
    const wallHeight = height * (1 - destroyedLevel * 0.5);
    const wallThickness = 6;

    // Floor/foundation
    this.mapContainer.rect(x, y + height, width, 8).fill(0x696969);
    this.mapContainer.stroke({ width: 1, color: 0x4a4a4a });

    // Back wall (solid, darkest for depth)
    this.mapContainer.rect(x, y + height - wallHeight, width, wallHeight).fill(0x6b5d4f);
    this.mapContainer.stroke({ width: 2, color: 0x4a3a2a });

    // Left wall (damaged)
    if (destroyedLevel < 0.85) {
      const leftWallHeight = wallHeight * (1 - destroyedLevel * 0.3);
      this.mapContainer
        .rect(x, y + height - leftWallHeight, wallThickness, leftWallHeight)
        .fill(0x8b7355);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });
    }

    // Right wall (more damaged)
    if (destroyedLevel < 0.75) {
      const rightWallHeight = wallHeight * (1 - destroyedLevel * 0.5);
      this.mapContainer
        .rect(
          x + width - wallThickness,
          y + height - rightWallHeight,
          wallThickness,
          rightWallHeight
        )
        .fill(0x8b7355);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });
    }

    // Front wall sections (with gaps)
    const frontWallHeight = wallHeight * 0.9;
    if (destroyedLevel < 0.8) {
      // Left section
      this.mapContainer
        .rect(x + wallThickness, y + height - frontWallHeight, width * 0.3, frontWallHeight)
        .fill(0xa0826d);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });
      // Right section
      this.mapContainer
        .rect(
          x + width * 0.65,
          y + height - frontWallHeight,
          width * 0.35 - wallThickness,
          frontWallHeight
        )
        .fill(0xa0826d);
      this.mapContainer.stroke({ width: 1, color: 0x654321 });
    }

    // Collapsed roof
    if (destroyedLevel < 0.9) {
      this.mapContainer
        .moveTo(x + wallThickness, y + height - wallHeight)
        .lineTo(x + width * 0.4, y + height - wallHeight - 12)
        .lineTo(x + width * 0.8, y + height - wallHeight + 8)
        .lineTo(x + width - wallThickness, y + height - wallHeight * 0.6)
        .lineTo(x + wallThickness, y + height - wallHeight)
        .fill({ color: 0x8b4513, alpha: 0.9 });
      this.mapContainer.stroke({ width: 2, color: 0x654321 });
    }

    // Window
    if (destroyedLevel < 0.75) {
      const windowX = x + width * 0.2;
      const windowY = y + height - frontWallHeight * 0.6;
      this.mapContainer.rect(windowX, windowY, 14, 18).fill(0x1a1a1a);
      this.mapContainer.stroke({ width: 2, color: 0x654321 });
      // Broken glass
      this.mapContainer
        .moveTo(windowX, windowY)
        .lineTo(windowX + 14, windowY + 18)
        .stroke({ width: 1, color: 0x4a4a4a });
      this.mapContainer
        .moveTo(windowX + 14, windowY)
        .lineTo(windowX, windowY + 18)
        .stroke({ width: 1, color: 0x4a4a4a });
    }

    // Door
    if (destroyedLevel < 0.8) {
      const doorX = x + width * 0.45;
      const doorY = y + height - frontWallHeight * 0.8;
      const doorWidth = 18;
      const doorHeight = frontWallHeight * 0.7;
      // Frame
      this.mapContainer.rect(doorX - 2, doorY, doorWidth + 4, doorHeight).fill(0x4a3a2a);
      // Door (tilted)
      this.mapContainer
        .moveTo(doorX, doorY)
        .lineTo(doorX + doorWidth, doorY + 5)
        .lineTo(doorX + doorWidth - 3, doorY + doorHeight)
        .lineTo(doorX - 3, doorY + doorHeight - 5)
        .lineTo(doorX, doorY)
        .fill(0x654321);
      this.mapContainer.stroke({ width: 1, color: 0x4a3a2a });
    }

    // Rubble - irregular chunks
    const rubbleCount = Math.floor(8 + destroyedLevel * 15);
    for (let i = 0; i < rubbleCount; i++) {
      const rx = x + Math.random() * width;
      const ry = y + height + 8 + Math.random() * 12;
      const size = 4 + Math.random() * 6;
      // Irregular rubble shapes - use poly for closed shapes
      const points = 3 + Math.floor(Math.random() * 3);
      const rubblePath: number[] = [];
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.7 + Math.random() * 0.5);
        rubblePath.push(rx + Math.cos(angle) * radius);
        rubblePath.push(ry + Math.sin(angle) * radius);
      }
      this.mapContainer.poly(rubblePath).fill(0x696969);
    }

    // Burn marks - irregular scorch patterns using rectangles instead
    if (destroyedLevel > 0.6) {
      // Left burn mark - multiple overlapping rectangles for organic look
      const burnX1 = x + width * 0.3;
      const burnY1 = y + height - wallHeight * 0.5;
      for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * 12;
        const offsetY = (Math.random() - 0.5) * 12;
        const burnSize = 8 + Math.random() * 8;
        this.mapContainer
          .rect(
            burnX1 + offsetX - burnSize / 2,
            burnY1 + offsetY - burnSize / 2,
            burnSize,
            burnSize
          )
          .fill({ color: 0x1a1a1a, alpha: 0.3 });
      }

      // Right burn mark
      const burnX2 = x + width * 0.7;
      const burnY2 = y + height - wallHeight * 0.3;
      for (let i = 0; i < 4; i++) {
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        const burnSize = 6 + Math.random() * 6;
        this.mapContainer
          .rect(
            burnX2 + offsetX - burnSize / 2,
            burnY2 + offsetY - burnSize / 2,
            burnSize,
            burnSize
          )
          .fill({ color: 0x1a1a1a, alpha: 0.25 });
      }
    }

    // Smoke - use ellipses for organic puffs
    if (destroyedLevel > 0.7) {
      for (let i = 0; i < 4; i++) {
        const sx = x + width * 0.5 + (Math.random() - 0.5) * 25;
        const sy = y + height - wallHeight - 15 - i * 10;
        const smokeSize = 4 + i * 0.5;
        // Use ellipse for organic smoke
        this.mapContainer
          .ellipse(sx, sy, smokeSize * 1.2, smokeSize * 0.8)
          .fill({ color: 0x808080, alpha: 0.35 - i * 0.08 });
      }
    }

    // Add cracks in walls
    if (destroyedLevel > 0.5) {
      // Vertical cracks
      for (let i = 0; i < 3; i++) {
        const crackX = x + width * (0.2 + i * 0.3);
        const crackY = y + height - wallHeight;
        this.mapContainer
          .moveTo(crackX, crackY)
          .lineTo(crackX + (Math.random() - 0.5) * 8, crackY + wallHeight * 0.6)
          .stroke({ width: 2, color: 0x2a2a2a, alpha: 0.6 });
      }
    }

    // Add bullet holes / impact marks - use small rectangles
    if (destroyedLevel > 0.6) {
      for (let i = 0; i < 5; i++) {
        const holeX = x + Math.random() * width;
        const holeY = y + height - wallHeight * Math.random();
        const holeSize = 2 + Math.random() * 2;
        // Small dark rectangles for bullet impacts
        this.mapContainer
          .rect(holeX - holeSize / 2, holeY - holeSize / 2, holeSize, holeSize)
          .fill({ color: 0x1a1a1a, alpha: 0.7 });
        // Add small cracks around impact
        for (let j = 0; j < 3; j++) {
          const angle = (j / 3) * Math.PI * 2 + Math.random();
          const crackLength = 3 + Math.random() * 3;
          this.mapContainer
            .moveTo(holeX, holeY)
            .lineTo(holeX + Math.cos(angle) * crackLength, holeY + Math.sin(angle) * crackLength)
            .stroke({ width: 1, color: 0x2a2a2a, alpha: 0.5 });
        }
      }
    }
  }

  private addDecorativeElements(mapData: MapData): void {
    // Add apocalyptic decorative elements with organic shapes
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;

      // Only place decorations away from the path and not at the top (where houses are)
      if (y > 150 && this.isAwayFromPath(x, y, mapData.waypoints)) {
        const decorType = Math.random();

        if (decorType < 0.3) {
          // Dead bushes/shrubs (organic blob shapes)
          const size = 10 + Math.random() * 15;
          const points = 6 + Math.floor(Math.random() * 4);

          this.mapContainer.moveTo(x, y);
          for (let j = 0; j < points; j++) {
            const angle = (j / points) * Math.PI * 2;
            const radius = size * (0.6 + Math.random() * 0.6);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.mapContainer.lineTo(px, py);
          }
          this.mapContainer.fill({ color: 0x4a3a2a, alpha: 0.7 });
        } else if (decorType < 0.5) {
          // Rocks/debris (irregular polygons)
          const size = 8 + Math.random() * 12;
          const points = 4 + Math.floor(Math.random() * 3);

          this.mapContainer.moveTo(x, y);
          for (let j = 0; j < points; j++) {
            const angle = (j / points) * Math.PI * 2 + Math.random() * 0.3;
            const radius = size * (0.7 + Math.random() * 0.5);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.mapContainer.lineTo(px, py);
          }
          this.mapContainer.fill(0x6a6a6a);
          this.mapContainer.stroke({ width: 1, color: 0x4a4a4a });
        } else if (decorType < 0.7) {
          // Dead tree stumps (organic trunk shape)
          const width = 5 + Math.random() * 4;
          const height = 10 + Math.random() * 8;

          // Irregular trunk
          this.mapContainer
            .moveTo(x - width / 2, y + height)
            .lineTo(x - width / 2 - 1, y + height * 0.6)
            .lineTo(x - width / 2, y + height * 0.3)
            .lineTo(x, y)
            .lineTo(x + width / 2, y + height * 0.3)
            .lineTo(x + width / 2 + 1, y + height * 0.6)
            .lineTo(x + width / 2, y + height)
            .fill(0x5a4a3a);

          // Broken branch
          this.mapContainer
            .moveTo(x, y + height * 0.4)
            .lineTo(x - 10, y + height * 0.3)
            .stroke({ width: 2, color: 0x5a4a3a });
        } else {
          // Withered grass patches (organic clumps)
          const size = 12 + Math.random() * 18;
          const points = 8 + Math.floor(Math.random() * 5);

          this.mapContainer.moveTo(x, y);
          for (let j = 0; j < points; j++) {
            const angle = (j / points) * Math.PI * 2;
            const radius = size * (0.5 + Math.random() * 0.7);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.mapContainer.lineTo(px, py);
          }
          this.mapContainer.fill({ color: 0x3a4a2a, alpha: 0.6 });
        }
      }
    }

    // Add some scattered bones/skulls for extra apocalyptic feel
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;

      if (y > 150 && this.isAwayFromPath(x, y, mapData.waypoints)) {
        // Small skull (slightly irregular)
        this.mapContainer
          .moveTo(x - 4, y)
          .lineTo(x - 3, y - 3)
          .lineTo(x, y - 4)
          .lineTo(x + 3, y - 3)
          .lineTo(x + 4, y)
          .lineTo(x + 3, y + 3)
          .lineTo(x - 3, y + 3)
          .fill(0xf5f5dc);
        this.mapContainer.circle(x - 2, y - 1, 1.5).fill(0x1a1a1a); // Eye socket
        this.mapContainer.circle(x + 2, y - 1, 1.5).fill(0x1a1a1a); // Eye socket
      }
    }
  }

  private isAwayFromPath(x: number, y: number, waypoints: Waypoint[]): boolean {
    // Simple distance check from path
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      // Calculate distance from point to line segment
      const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
      if (distance < 50) {
        return false;
      } // Too close to path
    }
    return true;
  }

  private distanceToLineSegment(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    // Simplified distance calculation
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
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
