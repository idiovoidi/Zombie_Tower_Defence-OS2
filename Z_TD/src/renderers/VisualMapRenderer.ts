import { Application, Graphics } from 'pixi.js';
import { GRAVEYARD, LAYER_INDICES } from '../config/visualConstants';
import { InputManager } from '../managers/InputManager';
import { MapData, MapManager } from '../managers/MapManager';
import { Waypoint } from '../managers/PathfindingManager';
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
  private campAnimationTime: number = 0;
  private campX: number = 0;
  private campY: number = 0;
  private campAnimationContainer: Graphics;

  // Sub-renderers
  private terrainRenderer: TerrainRenderer;
  private pathRenderer: PathRenderer;
  private graveyardRenderer: GraveyardRenderer;

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
    this.renderSurvivorCamp(mapData.waypoints[mapData.waypoints.length - 1]);

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

  private renderSurvivorCamp(endpoint: Waypoint): void {
    const campX = endpoint.x;
    const campY = endpoint.y;

    // Store camp position for animations
    this.campX = campX;
    this.campY = campY;

    // === GROUND LAYER (BACK) ===
    // Cleared, compacted earth
    this.pathGraphics.circle(campX, campY, 70).fill({ color: 0x4a3a2a, alpha: 0.5 });

    // Subtle wear patterns (static - use seeded random for consistency)
    const seed = campX + campY;
    for (let i = 0; i < 15; i++) {
      const angle = ((seed + i * 137.5) % 360) * (Math.PI / 180);
      const dist = (seed + i * 73) % 55;
      const x = campX + Math.cos(angle) * dist;
      const y = campY + Math.sin(angle) * dist;
      this.pathGraphics.ellipse(x, y, 2, 4).fill({ color: 0x3a2a1a, alpha: 0.15 });
    }

    // === SIMPLE METAL FENCE PERIMETER ===
    const drawFencePanel = (x: number, y: number, width: number, height: number) => {
      // Metal panel background
      this.pathGraphics.rect(x, y, width, height).fill({ color: 0x5a5a5a, alpha: 0.9 });
      this.pathGraphics.stroke({ width: 2, color: 0x3a3a3a });

      // Simple horizontal bars for texture
      const barCount = Math.floor(height / 6);
      for (let i = 1; i < barCount; i++) {
        const barY = y + (i * height) / barCount;
        this.pathGraphics
          .moveTo(x, barY)
          .lineTo(x + width, barY)
          .stroke({ width: 1, color: 0x4a4a4a, alpha: 0.5 });
      }

      // Vertical supports
      if (width > height) {
        // Horizontal fence - add vertical supports
        const supportCount = Math.floor(width / 8);
        for (let i = 1; i < supportCount; i++) {
          const supportX = x + (i * width) / supportCount;
          this.pathGraphics
            .moveTo(supportX, y)
            .lineTo(supportX, y + height)
            .stroke({ width: 1, color: 0x4a4a4a, alpha: 0.5 });
        }
      }
    };

    const gateHeight = 50;
    const gateCenter = 0; // Gate centered on path

    // Left fence with gate opening (where path enters from graveyard)
    // Top section of left fence (above gate)
    drawFencePanel(campX - 68, campY - 55, 6, campY + gateCenter - gateHeight / 2 - (campY - 55));

    // Bottom section of left fence (below gate)
    drawFencePanel(
      campX - 68,
      campY + gateCenter + gateHeight / 2,
      6,
      campY + 55 - (campY + gateCenter + gateHeight / 2)
    );

    // Right fence (solid)
    drawFencePanel(campX + 62, campY - 55, 6, 110);

    // Top fence (solid)
    drawFencePanel(campX - 62, campY - 60, 124, 6);

    // Bottom fence (solid)
    drawFencePanel(campX - 62, campY + 54, 124, 6);

    // === GATE (on left side where path enters) ===
    // Gate posts
    this.pathGraphics.rect(campX - 71, campY - gateHeight / 2 - 4, 6, 6).fill(0x5a5a5a);
    this.pathGraphics.stroke({ width: 1, color: 0x3a3a3a });
    this.pathGraphics.rect(campX - 71, campY + gateHeight / 2 - 2, 6, 6).fill(0x5a5a5a);
    this.pathGraphics.stroke({ width: 1, color: 0x3a3a3a });

    // Gate doors (opening outward)
    const gateY1 = campY - gateHeight / 2;
    const gateY2 = campY + gateHeight / 2;

    // Top door
    this.pathGraphics
      .moveTo(campX - 68, gateY1)
      .lineTo(campX - 83, gateY1 - 7)
      .lineTo(campX - 83, campY - 2)
      .lineTo(campX - 68, campY + 2)
      .fill({ color: 0x7a7a7a, alpha: 0.85 });
    this.pathGraphics.stroke({ width: 2, color: 0x5a5a5a });
    // Horizontal bar
    this.pathGraphics
      .moveTo(campX - 81, gateY1 - 3)
      .lineTo(campX - 70, campY)
      .stroke({ width: 1.5, color: 0x5a5a5a });

    // Bottom door
    this.pathGraphics
      .moveTo(campX - 68, gateY2)
      .lineTo(campX - 83, gateY2 + 7)
      .lineTo(campX - 83, campY + 2)
      .lineTo(campX - 68, campY - 2)
      .fill({ color: 0x7a7a7a, alpha: 0.85 });
    this.pathGraphics.stroke({ width: 2, color: 0x5a5a5a });
    // Horizontal bar
    this.pathGraphics
      .moveTo(campX - 81, gateY2 + 3)
      .lineTo(campX - 70, campY)
      .stroke({ width: 1.5, color: 0x5a5a5a });

    // === MAIN COMMAND TENT ===
    // Tent base
    this.pathGraphics.rect(campX - 32, campY - 10, 64, 35).fill(0x6b7c3a);
    this.pathGraphics.stroke({ width: 2, color: 0x4a5a2a });

    // Tent roof - peaked
    this.pathGraphics
      .moveTo(campX - 35, campY - 10)
      .lineTo(campX, campY - 32)
      .lineTo(campX + 35, campY - 10)
      .lineTo(campX - 35, campY - 10)
      .fill(0x5a6a2a);
    this.pathGraphics.stroke({ width: 2, color: 0x3a4a1a });

    // Center seam
    this.pathGraphics
      .moveTo(campX, campY - 32)
      .lineTo(campX, campY - 10)
      .stroke({ width: 2, color: 0x4a5a2a });

    // Single repair patch
    this.pathGraphics.rect(campX - 25, campY - 5, 8, 6).fill({ color: 0x4a4a4a, alpha: 0.6 });

    // Entrance flap
    this.pathGraphics.rect(campX - 10, campY + 15, 20, 10).fill(0x4a5a2a);
    this.pathGraphics.stroke({ width: 2, color: 0x3a4a1a });

    // Guy lines
    this.pathGraphics
      .moveTo(campX - 35, campY - 10)
      .lineTo(campX - 45, campY + 5)
      .stroke({ width: 1, color: 0x654321 });
    this.pathGraphics
      .moveTo(campX + 35, campY - 10)
      .lineTo(campX + 45, campY + 5)
      .stroke({ width: 1, color: 0x654321 });
    // Stakes
    this.pathGraphics.rect(campX - 46, campY + 5, 3, 8).fill(0x654321);
    this.pathGraphics.rect(campX + 43, campY + 5, 3, 8).fill(0x654321);

    // === MEDICAL TENT (Left - Behind main tent) ===
    this.pathGraphics
      .moveTo(campX - 52, campY - 40)
      .lineTo(campX - 37, campY - 50)
      .lineTo(campX - 22, campY - 40)
      .lineTo(campX - 52, campY - 40)
      .fill(0xe5e5cc);
    this.pathGraphics.stroke({ width: 2, color: 0xc5c5ac });
    this.pathGraphics.rect(campX - 50, campY - 40, 28, 18).fill(0xf5f5dc);
    this.pathGraphics.stroke({ width: 1, color: 0xc5c5ac });
    // Red cross
    this.pathGraphics.rect(campX - 39, campY - 34, 5, 2).fill(0xcc0000);
    this.pathGraphics.rect(campX - 38, campY - 36, 2, 5).fill(0xcc0000);

    // === SUPPLY TENT (Right - Behind main tent) ===
    this.pathGraphics
      .moveTo(campX + 22, campY - 40)
      .lineTo(campX + 37, campY - 50)
      .lineTo(campX + 52, campY - 40)
      .lineTo(campX + 22, campY - 40)
      .fill(0x8b7355);
    this.pathGraphics.stroke({ width: 2, color: 0x654321 });
    this.pathGraphics.rect(campX + 24, campY - 40, 26, 18).fill(0xa0826d);
    this.pathGraphics.stroke({ width: 1, color: 0x654321 });

    // === SANDBAG BARRIERS ===
    const drawSandbag = (x: number, y: number) => {
      this.pathGraphics.roundRect(x, y, 12, 8, 2).fill(0x8b7355);
      this.pathGraphics.stroke({ width: 1, color: 0x654321 });
    };

    // Left barrier (2 bags)
    drawSandbag(campX - 58, campY + 30);
    drawSandbag(campX - 58, campY + 40);

    // Right barrier (2 bags)
    drawSandbag(campX + 46, campY + 30);
    drawSandbag(campX + 46, campY + 40);

    // === SUPPLY CRATES (Behind tents) ===
    const drawCrate = (x: number, y: number) => {
      this.pathGraphics.rect(x, y, 14, 14).fill(0x8b7355);
      this.pathGraphics.stroke({ width: 2, color: 0x654321 });
      // Metal bands
      this.pathGraphics.rect(x, y + 3, 14, 2).fill({ color: 0x4a4a4a, alpha: 0.6 });
      this.pathGraphics.rect(x, y + 9, 14, 2).fill({ color: 0x4a4a4a, alpha: 0.6 });
    };

    // Position crates further back to avoid overlap
    drawCrate(campX - 56, campY - 48);
    drawCrate(campX - 56, campY - 32);
    drawCrate(campX - 40, campY - 48);

    // === WATCHTOWER (LEFT SIDE - facing zombie spawn) ===
    // Tower legs
    this.pathGraphics.rect(campX - 60, campY - 35, 4, 45).fill(0x654321);
    this.pathGraphics.rect(campX - 46, campY - 35, 4, 45).fill(0x654321);

    // Cross braces
    this.pathGraphics
      .moveTo(campX - 58, campY - 30)
      .lineTo(campX - 48, campY - 20)
      .stroke({ width: 2, color: 0x654321 });
    this.pathGraphics
      .moveTo(campX - 48, campY - 30)
      .lineTo(campX - 58, campY - 20)
      .stroke({ width: 2, color: 0x654321 });

    // Platform
    this.pathGraphics.rect(campX - 64, campY - 40, 26, 8).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 2, color: 0x654321 });

    // Railing
    this.pathGraphics.rect(campX - 64, campY - 42, 26, 2).fill(0x654321);

    // Guard (static - will be animated separately)
    // Note: Guard animation is in campAnimationContainer

    // Radio antenna
    this.pathGraphics
      .moveTo(campX - 66, campY - 40)
      .lineTo(campX - 66, campY - 58)
      .stroke({ width: 2, color: 0x4a4a4a });
    this.pathGraphics.circle(campX - 66, campY - 58, 2).fill(0xff0000);

    // === CAMPFIRE (STATIC ELEMENTS - PROPER PERSPECTIVE) ===
    // Stone ring (elliptical for top-down perspective)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = campX + Math.cos(angle) * 12;
      const y = campY + 32 + Math.sin(angle) * 6; // Compressed Y for perspective
      this.pathGraphics.circle(x, y, 3).fill(0x5a5a5a);
      this.pathGraphics.stroke({ width: 1, color: 0x3a3a3a });
    }

    // Fire pit base (ellipse for perspective)
    this.pathGraphics.ellipse(campX, campY + 32, 10, 5).fill({ color: 0x2a2a2a, alpha: 0.6 });

    // Seating logs (perspective - wider at bottom)
    // Left log
    this.pathGraphics
      .moveTo(campX - 22, campY + 40)
      .lineTo(campX - 10, campY + 38)
      .lineTo(campX - 10, campY + 42)
      .lineTo(campX - 22, campY + 44)
      .lineTo(campX - 22, campY + 40)
      .fill(0x654321);
    this.pathGraphics.stroke({ width: 1, color: 0x4a3211 });

    // Right log
    this.pathGraphics
      .moveTo(campX + 10, campY + 38)
      .lineTo(campX + 22, campY + 40)
      .lineTo(campX + 22, campY + 44)
      .lineTo(campX + 10, campY + 42)
      .lineTo(campX + 10, campY + 38)
      .fill(0x654321);
    this.pathGraphics.stroke({ width: 1, color: 0x4a3211 });

    // Note: Animated fire and survivors are rendered in campAnimationContainer

    // Note: Animated survivors are rendered in campAnimationContainer to avoid overlapping with game objects

    // === LAUNDRY LINE ===
    this.pathGraphics
      .moveTo(campX - 20, campY - 25)
      .lineTo(campX + 20, campY - 25)
      .stroke({ width: 1, color: 0x3a3a3a });
    // Clothes
    this.pathGraphics.rect(campX - 10, campY - 25, 6, 8).fill({ color: 0x4169e1, alpha: 0.7 });
    this.pathGraphics.rect(campX + 4, campY - 25, 6, 8).fill({ color: 0x228b22, alpha: 0.7 });

    // === WARNING SIGN ===
    this.pathGraphics.rect(campX - 40, campY - 60, 80, 18).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 3, color: 0x654321 });
    // Warning stripes
    this.pathGraphics.rect(campX - 38, campY - 58, 6, 14).fill({ color: 0xffcc00, alpha: 0.8 });
    this.pathGraphics.rect(campX + 32, campY - 58, 6, 14).fill({ color: 0xffcc00, alpha: 0.8 });
    // Safe zone area
    this.pathGraphics.rect(campX - 35, campY - 56, 70, 12).fill({ color: 0x00aa00, alpha: 0.7 });
    this.pathGraphics.stroke({ width: 2, color: 0x008800 });
    // Nails
    this.pathGraphics.circle(campX - 36, campY - 56, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX + 36, campY - 56, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX - 36, campY - 44, 1.5).fill(0x4a4a4a);
    this.pathGraphics.circle(campX + 36, campY - 44, 1.5).fill(0x4a4a4a);

    // Generator (small)
    this.pathGraphics.rect(campX + 48, campY + 20, 12, 10).fill(0x6a6a6a);
    this.pathGraphics.stroke({ width: 2, color: 0x4a4a4a });
    // Exhaust pipe
    this.pathGraphics.rect(campX + 54, campY + 16, 2, 4).fill(0x2a2a2a);
    // Fuel can nearby
    this.pathGraphics.rect(campX + 48, campY + 32, 6, 8).fill(0xcc0000);
    this.pathGraphics.stroke({ width: 1, color: 0xaa0000 });

    // Picnic table
    this.pathGraphics.rect(campX - 12, campY + 12, 24, 3).fill(0x8b7355);
    this.pathGraphics.rect(campX - 10, campY + 15, 2, 6).fill(0x654321);
    this.pathGraphics.rect(campX + 8, campY + 15, 2, 6).fill(0x654321);
    // Items on table
    this.pathGraphics.circle(campX - 6, campY + 13, 2).fill(0x4a6a8a); // Cup
    this.pathGraphics.rect(campX + 2, campY + 12, 4, 2).fill(0x8b4513); // Book

    // String lights between posts (festive but practical)
    this.pathGraphics
      .moveTo(campX - 50, campY - 10)
      .quadraticCurveTo(campX - 25, campY - 5, campX, campY - 8)
      .quadraticCurveTo(campX + 25, campY - 5, campX + 50, campY - 10)
      .stroke({ width: 1, color: 0x3a3a3a });
    // Light bulbs
    for (let i = -40; i <= 40; i += 20) {
      this.pathGraphics.circle(campX + i, campY - 7, 2).fill({ color: 0xffaa00, alpha: 0.6 });
      this.pathGraphics.circle(campX + i, campY - 7, 3).fill({ color: 0xffaa00, alpha: 0.2 });
    }

    // Scattered personal items
    // Backpack
    this.pathGraphics.rect(campX - 26, campY - 2, 6, 8).fill(0x3a4a2a);
    this.pathGraphics.stroke({ width: 1, color: 0x2a3a1a });
    // Boots
    this.pathGraphics.rect(campX + 20, campY - 4, 4, 6).fill(0x4a3a2a);
    this.pathGraphics.rect(campX + 26, campY - 4, 4, 6).fill(0x4a3a2a);
    // Guitar leaning on crate
    this.pathGraphics.ellipse(campX - 32, campY - 32, 4, 6).fill(0x8b7355);
    this.pathGraphics.rect(campX - 32, campY - 38, 2, 12).fill(0x654321);

    // Memorial marker (small cross)
    this.pathGraphics.rect(campX + 60, campY + 42, 2, 10).fill(0x8b7355);
    this.pathGraphics.rect(campX + 56, campY + 44, 10, 2).fill(0x8b7355);
    // Flowers at base
    this.pathGraphics.circle(campX + 60, campY + 52, 2).fill({ color: 0xff6666, alpha: 0.6 });
    this.pathGraphics.circle(campX + 62, campY + 52, 2).fill({ color: 0xffff66, alpha: 0.6 });

    // Create clickable area for camp via InputManager
    this.inputManager.createCampClickArea(campX, campY);
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
    this.campAnimationTime += deltaTime * 0.001; // Update camp animations

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
    this.updateCampAnimations();

    // Render fog and corpses
    this.renderFog();
    this.renderCorpses();
  }

  private updateCampAnimations(): void {
    if (this.campX === 0 || this.campY === 0) {
      return;
    }

    this.campAnimationContainer.clear();
    this.renderAnimatedCampElements(this.campX, this.campY);
  }

  private renderAnimatedCampElements(campX: number, campY: number): void {
    // === ANIMATED CAMPFIRE ===
    // Animated fire with flicker
    const flicker1 = Math.sin(this.campAnimationTime * 8) * 0.5 + 0.5;
    const flicker2 = Math.sin(this.campAnimationTime * 10 + 1) * 0.5 + 0.5;
    const flicker3 = Math.sin(this.campAnimationTime * 12 + 2) * 0.5 + 0.5;

    // Fire layers (from bottom to top)
    this.campAnimationContainer
      .ellipse(campX, campY + 32, 8 + flicker1, 4)
      .fill({ color: 0xff4500, alpha: 0.9 });
    this.campAnimationContainer
      .ellipse(campX, campY + 30, 6 + flicker2 * 0.5, 3)
      .fill({ color: 0xffa500, alpha: 0.9 });
    this.campAnimationContainer
      .ellipse(campX, campY + 28, 4 + flicker3 * 0.3, 2)
      .fill({ color: 0xffff00, alpha: 0.95 });
    this.campAnimationContainer
      .ellipse(campX, campY + 27, 2, 1)
      .fill({ color: 0xffffaa, alpha: 1 });

    // === ANIMATED SURVIVORS (5 total) ===
    // Animation values
    const breathe = Math.sin(this.campAnimationTime * 2) * 0.3;
    const breathe2 = Math.sin(this.campAnimationTime * 2.3 + 1) * 0.3; // Offset breathing
    const sway = Math.sin(this.campAnimationTime * 1.5) * 0.5;
    const headTurn = Math.sin(this.campAnimationTime * 0.8) * 1;
    const headTurn2 = Math.sin(this.campAnimationTime * 0.9 + 2) * 1; // Different timing

    // Survivor 1 - Watchtower guard (scanning, breathing)
    this.campAnimationContainer
      .circle(campX - 51 + headTurn2 * 0.5, campY - 38 + breathe * 0.1, 4)
      .fill(0xffdbac);
    this.campAnimationContainer
      .rect(campX - 54 + headTurn2 * 0.5, campY - 34 + breathe * 0.1, 6, 8)
      .fill(0x654321);
    // Rifle
    this.campAnimationContainer
      .rect(campX - 51 + headTurn2 * 0.5, campY - 43 + breathe * 0.1, 1, 7)
      .fill(0x4a4a4a);

    // Survivor 2 - sitting by fire (breathing, slight sway)
    this.campAnimationContainer.circle(campX - 18, campY + 36 + breathe * 0.2, 4).fill(0xffdbac);
    this.campAnimationContainer.rect(campX - 21, campY + 40, 6, 6 + breathe * 0.5).fill(0x4169e1);

    // Survivor 3 - standing guard with weapon (swaying, head turning)
    this.campAnimationContainer
      .circle(campX + 25 + headTurn, campY + 20 + sway * 0.3, 4)
      .fill(0xffdbac);
    this.campAnimationContainer.rect(campX + 22 + sway * 0.5, campY + 24, 6, 8).fill(0x654321);
    this.campAnimationContainer.rect(campX + 25 + sway * 0.5, campY + 18, 1, 6).fill(0x2a2a2a);

    // Survivor 4 - working on crate (bobbing up and down)
    const workBob = Math.abs(Math.sin(this.campAnimationTime * 3)) * 2;
    this.campAnimationContainer.circle(campX - 50, campY - 36 - workBob, 4).fill(0xffdbac);
    this.campAnimationContainer.rect(campX - 53, campY - 32 - workBob, 6, 8).fill(0x4a4a4a);

    // Survivor 5 - medic near medical tent (breathing, slight head turn)
    this.campAnimationContainer
      .circle(campX - 32 + headTurn * 0.3, campY - 26 + breathe2 * 0.15, 4)
      .fill(0xffdbac);
    this.campAnimationContainer
      .rect(campX - 35 + headTurn * 0.3, campY - 22 + breathe2 * 0.15, 6, 8)
      .fill(0xf5f5dc);
    // Red cross armband
    this.campAnimationContainer
      .rect(campX - 34 + headTurn * 0.3, campY - 20 + breathe2 * 0.15, 4, 2)
      .fill(0xcc0000);
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
