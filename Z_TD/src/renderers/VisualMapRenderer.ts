import { Application, Graphics } from 'pixi.js';
import {
  COLORS,
  GRAVEYARD,
  GROUND_TEXTURE,
  LAYER_INDICES,
  PATH,
  UI_DIMENSIONS,
} from '../config/visualConstants';
import { InputManager } from '../managers/InputManager';
import { MapData, MapManager } from '../managers/MapManager';
import { Waypoint } from '../managers/PathfindingManager';
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
  private graveyardBounds = {
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

    // Render map background first
    this.renderMapBackground(mapData);

    // Render path on mapContainer (so it appears under graveyard)
    this.renderPath(mapData);

    // Render graveyard and other foreground elements
    this.renderForegroundElements(mapData);
  }

  private renderMapBackground(mapData: MapData): void {
    // Draw apocalyptic ground texture for play area
    // Base layer - darker, more desolate ground
    this.mapContainer.rect(0, 0, mapData.width, mapData.height);
    this.mapContainer.fill({ color: COLORS.GROUND_BASE });

    // Add varied dirt/mud patches for texture variation
    for (let i = 0; i < GROUND_TEXTURE.DIRT_PATCH_COUNT; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size =
        GROUND_TEXTURE.DIRT_PATCH_MIN_SIZE +
        Math.random() * (GROUND_TEXTURE.DIRT_PATCH_MAX_SIZE - GROUND_TEXTURE.DIRT_PATCH_MIN_SIZE);
      const points =
        GROUND_TEXTURE.DIRT_PATCH_MIN_POINTS +
        Math.floor(
          Math.random() *
            (GROUND_TEXTURE.DIRT_PATCH_MAX_POINTS - GROUND_TEXTURE.DIRT_PATCH_MIN_POINTS)
        );

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius =
          size *
          (GROUND_TEXTURE.DIRT_PATCH_MIN_RADIUS_FACTOR +
            Math.random() *
              (GROUND_TEXTURE.DIRT_PATCH_MAX_RADIUS_FACTOR -
                GROUND_TEXTURE.DIRT_PATCH_MIN_RADIUS_FACTOR));
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.mapContainer.lineTo(px, py);
      }
      this.mapContainer.fill({
        color: COLORS.GROUND_DIRT_PATCH,
        alpha:
          GROUND_TEXTURE.DIRT_PATCH_MIN_ALPHA +
          Math.random() *
            (GROUND_TEXTURE.DIRT_PATCH_MAX_ALPHA - GROUND_TEXTURE.DIRT_PATCH_MIN_ALPHA),
      });
    }

    // Dead grass patches (lighter, sparse)
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 15 + Math.random() * 30;
      const points = 5 + Math.floor(Math.random() * 4);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.7 + Math.random() * 0.5);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.mapContainer.lineTo(px, py);
      }
      this.mapContainer.fill({ color: 0x5a6a4a, alpha: 0.2 + Math.random() * 0.2 });
    }

    // Barren dirt patches (brown/tan)
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 25 + Math.random() * 45;
      const points = 4 + Math.floor(Math.random() * 4);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2 + Math.random() * 0.5;
        const radius = size * (0.5 + Math.random() * 0.8);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.mapContainer.lineTo(px, py);
      }
      this.mapContainer.fill({ color: 0x6a5a4a, alpha: 0.3 + Math.random() * 0.3 });
    }

    // Scattered rocks and debris
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 3 + Math.random() * 12;
      const points = 3 + Math.floor(Math.random() * 4);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.7 + Math.random() * 0.5);
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        this.mapContainer.lineTo(px, py);
      }
      this.mapContainer.fill({ color: 0x5a5a5a, alpha: 0.4 + Math.random() * 0.4 });
    }

    // Small pebbles scattered around
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 1 + Math.random() * 3;
      this.mapContainer
        .circle(x, y, size)
        .fill({ color: 0x6a6a6a, alpha: 0.5 + Math.random() * 0.3 });
    }

    // Add organic ground cracks (branching) - more prominent
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const mainLength = 40 + Math.random() * 70;
      const angle = Math.random() * Math.PI * 2;

      // Main crack
      let currentX = x;
      let currentY = y;
      const segments = 4 + Math.floor(Math.random() * 5);

      for (let j = 0; j < segments; j++) {
        const segmentLength = mainLength / segments;
        const segmentAngle = angle + (Math.random() - 0.5) * 0.6;
        const nextX = currentX + Math.cos(segmentAngle) * segmentLength;
        const nextY = currentY + Math.sin(segmentAngle) * segmentLength;

        // Main crack line (darker, thicker)
        this.mapContainer
          .moveTo(currentX, currentY)
          .lineTo(nextX, nextY)
          .stroke({ width: 1.5 + Math.random() * 0.5, color: 0x2a2a1a, alpha: 0.6 });

        // Add small branch cracks
        if (Math.random() > 0.6) {
          const branchAngle = segmentAngle + (Math.random() - 0.5) * Math.PI;
          const branchLength = segmentLength * (0.3 + Math.random() * 0.4);
          const branchX = currentX + Math.cos(branchAngle) * branchLength;
          const branchY = currentY + Math.sin(branchAngle) * branchLength;
          this.mapContainer
            .moveTo(currentX, currentY)
            .lineTo(branchX, branchY)
            .stroke({ width: 1, color: 0x2a2a1a, alpha: 0.4 });
        }

        currentX = nextX;
        currentY = nextY;
      }
    }

    // Add weathering stains and discoloration
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 20 + Math.random() * 40;
      this.mapContainer
        .circle(x, y, size)
        .fill({ color: 0x2a3a1a, alpha: 0.15 + Math.random() * 0.15 });
    }

    // Add subtle grass tufts (small details)
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;
      const size = 2 + Math.random() * 4;
      // Small irregular shapes for grass
      const points = 3 + Math.floor(Math.random() * 3);
      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.8 + Math.random() * 0.4);
        this.mapContainer.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      this.mapContainer.fill({ color: 0x4a5a3a, alpha: 0.3 + Math.random() * 0.2 });
    }

    // Draw UI panel background on the right
    this.mapContainer.rect(
      UI_DIMENSIONS.PLAY_AREA_WIDTH,
      0,
      UI_DIMENSIONS.PANEL_WIDTH,
      UI_DIMENSIONS.HEIGHT
    );
    this.mapContainer.fill({ color: COLORS.UI_PANEL_BG });

    // Draw separator line between play area and UI
    this.mapContainer.rect(
      UI_DIMENSIONS.PLAY_AREA_WIDTH,
      0,
      UI_DIMENSIONS.SEPARATOR_WIDTH,
      UI_DIMENSIONS.HEIGHT
    );
    this.mapContainer.fill({ color: COLORS.UI_SEPARATOR });
  }

  private renderForegroundElements(mapData: MapData): void {
    // Add graveyard on the left (zombie spawn area)
    this.renderGraveyard(mapData);

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

  private renderPath(mapData: MapData): void {
    if (mapData.waypoints.length < 2) {
      return;
    }

    const pathWidth = PATH.WIDTH;
    const cornerRadius = PATH.CORNER_RADIUS;

    // Helper function to draw path
    const drawPathLine = (graphics: Graphics, waypoints: Waypoint[]) => {
      graphics.moveTo(waypoints[0].x, waypoints[0].y);

      for (let i = 0; i < waypoints.length; i++) {
        const prev = i > 0 ? waypoints[i - 1] : null;
        const curr = waypoints[i];
        const next = i < waypoints.length - 1 ? waypoints[i + 1] : null;

        if (!prev) {
          graphics.moveTo(curr.x, curr.y);
        } else if (!next) {
          graphics.lineTo(curr.x, curr.y);
        } else {
          const v1x = curr.x - prev.x;
          const v1y = curr.y - prev.y;
          const v2x = next.x - curr.x;
          const v2y = next.y - curr.y;

          const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
          const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

          const n1x = v1x / len1;
          const n1y = v1y / len1;
          const n2x = v2x / len2;
          const n2y = v2y / len2;

          const curveStart = Math.min(cornerRadius, len1 / 2);
          const curveEnd = Math.min(cornerRadius, len2 / 2);

          const startX = curr.x - n1x * curveStart;
          const startY = curr.y - n1y * curveStart;
          const endX = curr.x + n2x * curveEnd;
          const endY = curr.y + n2y * curveEnd;

          graphics.lineTo(startX, startY);
          graphics.quadraticCurveTo(curr.x, curr.y, endX, endY);
        }
      }
    };

    // Draw dark border first (darker dirt edges)
    drawPathLine(this.mapContainer, mapData.waypoints);
    this.mapContainer.stroke({
      width: pathWidth + PATH.OUTER_BORDER_WIDTH,
      color: COLORS.PATH_OUTER,
      cap: 'round',
      join: 'round',
    });

    // Draw main path (worn dirt)
    drawPathLine(this.mapContainer, mapData.waypoints);
    this.mapContainer.stroke({ width: pathWidth, color: 0x6a5a4a, cap: 'round', join: 'round' });

    // Add center worn track (darker from heavy use)
    drawPathLine(this.mapContainer, mapData.waypoints);
    this.mapContainer.stroke({
      width: pathWidth * PATH.INNER_WIDTH_FACTOR,
      color: COLORS.PATH_INNER,
      cap: 'round',
      join: 'round',
      alpha: PATH.INNER_ALPHA,
    });

    // Add tire/cart tracks (two parallel lines)
    const trackOffset = pathWidth * 0.25;

    // Calculate perpendicular offsets for tracks
    for (let i = 0; i < mapData.waypoints.length - 1; i++) {
      const curr = mapData.waypoints[i];
      const next = mapData.waypoints[i + 1];

      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      // Left track
      this.mapContainer.moveTo(curr.x + nx * trackOffset, curr.y + ny * trackOffset);
      this.mapContainer.lineTo(next.x + nx * trackOffset, next.y + ny * trackOffset);
      this.mapContainer.stroke({ width: 3, color: 0x4a3a2a, alpha: 0.6 });

      // Right track
      this.mapContainer.moveTo(curr.x - nx * trackOffset, curr.y - ny * trackOffset);
      this.mapContainer.lineTo(next.x - nx * trackOffset, next.y - ny * trackOffset);
      this.mapContainer.stroke({ width: 3, color: 0x4a3a2a, alpha: 0.6 });
    }

    // Add dirt texture - random small patches along path
    for (let i = 0; i < mapData.waypoints.length - 1; i++) {
      const curr = mapData.waypoints[i];
      const next = mapData.waypoints[i + 1];

      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(len / 15);

      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const x = curr.x + dx * t;
        const y = curr.y + dy * t;

        // Random dirt patches
        if (Math.random() > 0.7) {
          const size = 3 + Math.random() * 5;
          const offsetX = (Math.random() - 0.5) * pathWidth * 0.6;
          const offsetY = (Math.random() - 0.5) * pathWidth * 0.6;
          this.mapContainer.circle(x + offsetX, y + offsetY, size).fill({
            color: 0x4a3a2a,
            alpha: 0.3 + Math.random() * 0.3,
          });
        }

        // Random small rocks
        if (Math.random() > 0.85) {
          const size = 2 + Math.random() * 3;
          const offsetX = (Math.random() - 0.5) * pathWidth * 0.5;
          const offsetY = (Math.random() - 0.5) * pathWidth * 0.5;
          this.mapContainer.circle(x + offsetX, y + offsetY, size).fill({
            color: 0x5a5a5a,
            alpha: 0.5 + Math.random() * 0.3,
          });
        }

        // Footprints (small ovals)
        if (Math.random() > 0.8) {
          const offsetX = (Math.random() - 0.5) * pathWidth * 0.4;
          const offsetY = (Math.random() - 0.5) * pathWidth * 0.4;
          const _angle = Math.random() * Math.PI * 2;
          this.mapContainer.ellipse(x + offsetX, y + offsetY, 3, 5).fill({
            color: 0x3a2a1a,
            alpha: 0.2 + Math.random() * 0.2,
          });
        }
      }
    }

    // Add edge wear - lighter dirt at edges
    drawPathLine(this.mapContainer, mapData.waypoints);
    this.mapContainer.stroke({
      width: pathWidth + 4,
      color: 0x7a6a5a,
      cap: 'round',
      join: 'round',
      alpha: 0.3,
    });
  }

  private renderGraveyard(_mapData: MapData): void {
    const graveyardX = 20;
    const graveyardY = 250;
    const graveyardWidth = 140;
    const graveyardHeight = 280;

    // Graveyard ground - base layer (very dark, cursed earth)
    this.mapContainer
      .rect(graveyardX, graveyardY, graveyardWidth, graveyardHeight)
      .fill({ color: 0x1a2a1a });

    // Add dead grass patches (darker than surrounding area)
    for (let i = 0; i < 30; i++) {
      const x = graveyardX + Math.random() * graveyardWidth;
      const y = graveyardY + Math.random() * graveyardHeight;
      const size = 8 + Math.random() * 15;
      const points = 5 + Math.floor(Math.random() * 3);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.6 + Math.random() * 0.6);
        this.mapContainer.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      this.mapContainer.fill({ color: 0x2a3a2a, alpha: 0.4 + Math.random() * 0.3 });
    }

    // Add disturbed earth patches (where zombies emerged)
    for (let i = 0; i < 20; i++) {
      const x = graveyardX + Math.random() * graveyardWidth;
      const y = graveyardY + Math.random() * graveyardHeight;
      const size = 10 + Math.random() * 20;
      const points = 4 + Math.floor(Math.random() * 3);

      this.mapContainer.moveTo(x, y);
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radius = size * (0.5 + Math.random() * 0.7);
        this.mapContainer.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
      }
      this.mapContainer.fill({ color: 0x4a3a2a, alpha: 0.5 + Math.random() * 0.3 });
    }

    // Add scattered bones and debris
    for (let i = 0; i < 25; i++) {
      const x = graveyardX + Math.random() * graveyardWidth;
      const y = graveyardY + Math.random() * graveyardHeight;
      const size = 2 + Math.random() * 4;
      this.mapContainer
        .rect(x, y, size, size * 2)
        .fill({ color: 0xf5f5dc, alpha: 0.6 + Math.random() * 0.3 });
    }

    // Add dark stains (blood/decay)
    for (let i = 0; i < 15; i++) {
      const x = graveyardX + Math.random() * graveyardWidth;
      const y = graveyardY + Math.random() * graveyardHeight;
      const size = 8 + Math.random() * 15;
      this.mapContainer
        .circle(x, y, size)
        .fill({ color: 0x1a1a1a, alpha: 0.3 + Math.random() * 0.2 });
    }

    // Weathered iron fence around graveyard
    const gateGapStart = 360 - graveyardY; // Gate starts at y: 360
    const gateGapEnd = gateGapStart + 60; // Gate is 60px tall

    // Top fence - rusty and weathered
    this.mapContainer.rect(graveyardX, graveyardY, graveyardWidth, 5).fill(0x6a4513);
    this.mapContainer
      .rect(graveyardX, graveyardY, graveyardWidth, 5)
      .stroke({ width: 1, color: 0x4a3013 });
    // Add rust spots on top fence
    for (let i = 0; i < 8; i++) {
      const x = graveyardX + (i / 8) * graveyardWidth;
      this.mapContainer.circle(x, graveyardY + 2, 2).fill({ color: 0x8b4513, alpha: 0.7 });
    }

    // Bottom fence - rusty and weathered
    this.mapContainer
      .rect(graveyardX, graveyardY + graveyardHeight - 5, graveyardWidth, 5)
      .fill(0x6a4513);
    this.mapContainer
      .rect(graveyardX, graveyardY + graveyardHeight - 5, graveyardWidth, 5)
      .stroke({ width: 1, color: 0x4a3013 });
    // Add rust spots on bottom fence
    for (let i = 0; i < 8; i++) {
      const x = graveyardX + (i / 8) * graveyardWidth;
      this.mapContainer
        .circle(x, graveyardY + graveyardHeight - 3, 2)
        .fill({ color: 0x8b4513, alpha: 0.7 });
    }

    // Left fence (solid) - weathered
    this.mapContainer.rect(graveyardX, graveyardY, 5, graveyardHeight).fill(0x6a4513);
    this.mapContainer
      .rect(graveyardX, graveyardY, 5, graveyardHeight)
      .stroke({ width: 1, color: 0x4a3013 });
    // Add vertical rust streaks
    for (let i = 0; i < 5; i++) {
      const y = graveyardY + (i / 5) * graveyardHeight;
      this.mapContainer
        .moveTo(graveyardX + 2, y)
        .lineTo(graveyardX + 2, y + 20)
        .stroke({ width: 1, color: 0x8b4513, alpha: 0.5 });
    }

    // Right fence - top section (above gate) - weathered
    this.mapContainer
      .rect(graveyardX + graveyardWidth - 5, graveyardY, 5, gateGapStart)
      .fill(0x6a4513);
    this.mapContainer
      .rect(graveyardX + graveyardWidth - 5, graveyardY, 5, gateGapStart)
      .stroke({ width: 1, color: 0x4a3013 });

    // Right fence - bottom section (below gate) - weathered
    this.mapContainer
      .rect(
        graveyardX + graveyardWidth - 5,
        graveyardY + gateGapEnd,
        5,
        graveyardHeight - gateGapEnd
      )
      .fill(0x6a4513);
    this.mapContainer
      .rect(
        graveyardX + graveyardWidth - 5,
        graveyardY + gateGapEnd,
        5,
        graveyardHeight - gateGapEnd
      )
      .stroke({ width: 1, color: 0x4a3013 });

    // Fence posts (avoiding gate area on right side) - weathered wood
    for (let i = 0; i <= graveyardHeight; i += 35) {
      // Left posts
      this.mapContainer.rect(graveyardX - 3, graveyardY + i, 9, 7).fill(0x5a4321);
      this.mapContainer
        .rect(graveyardX - 3, graveyardY + i, 9, 7)
        .stroke({ width: 1, color: 0x3a2a11 });
      // Wood grain
      this.mapContainer
        .moveTo(graveyardX - 2, graveyardY + i + 1)
        .lineTo(graveyardX + 4, graveyardY + i + 1)
        .stroke({ width: 1, color: 0x4a3211, alpha: 0.5 });

      // Right posts (skip gate area)
      if (i < gateGapStart || i > gateGapEnd) {
        this.mapContainer
          .rect(graveyardX + graveyardWidth - 6, graveyardY + i, 9, 7)
          .fill(0x5a4321);
        this.mapContainer
          .rect(graveyardX + graveyardWidth - 6, graveyardY + i, 9, 7)
          .stroke({ width: 1, color: 0x3a2a11 });
        // Wood grain
        this.mapContainer
          .moveTo(graveyardX + graveyardWidth - 5, graveyardY + i + 1)
          .lineTo(graveyardX + graveyardWidth + 1, graveyardY + i + 1)
          .stroke({ width: 1, color: 0x4a3211, alpha: 0.5 });
      }
    }

    // Gate opening (where zombies exit) - on RIGHT side, aligned with spawn point
    const gateX = graveyardX + graveyardWidth - 50; // Position on right side
    const gateY = 360; // Aligned with spawn point at y: 384
    const gateWidth = 50;
    const gateHeight = 60;

    // Gate posts (weathered stone pillars with cracks)
    this.mapContainer.rect(gateX - 8, gateY, 8, gateHeight).fill(0x5a5a5a);
    this.mapContainer.rect(gateX - 8, gateY, 8, gateHeight).stroke({ width: 2, color: 0x3a3a3a });
    // Add cracks to left pillar
    this.mapContainer
      .moveTo(gateX - 6, gateY + 10)
      .lineTo(gateX - 4, gateY + 25)
      .stroke({ width: 1, color: 0x2a2a2a, alpha: 0.7 });
    // Moss/weathering on left pillar
    for (let i = 0; i < 3; i++) {
      this.mapContainer
        .circle(gateX - 5 + Math.random() * 3, gateY + 15 + i * 15, 2)
        .fill({ color: 0x2a4a2a, alpha: 0.6 });
    }

    this.mapContainer.rect(gateX + gateWidth, gateY, 8, gateHeight).fill(0x5a5a5a);
    this.mapContainer
      .rect(gateX + gateWidth, gateY, 8, gateHeight)
      .stroke({ width: 2, color: 0x3a3a3a });
    // Add cracks to right pillar
    this.mapContainer
      .moveTo(gateX + gateWidth + 2, gateY + 15)
      .lineTo(gateX + gateWidth + 4, gateY + 30)
      .stroke({ width: 1, color: 0x2a2a2a, alpha: 0.7 });
    // Moss/weathering on right pillar
    for (let i = 0; i < 3; i++) {
      this.mapContainer
        .circle(gateX + gateWidth + 2 + Math.random() * 3, gateY + 20 + i * 15, 2)
        .fill({ color: 0x2a4a2a, alpha: 0.6 });
    }

    // Decorative skulls on gate posts (more detailed)
    // Left skull
    this.mapContainer.circle(gateX - 4, gateY + 10, 5).fill(0xe5e5cc);
    this.mapContainer.circle(gateX - 4, gateY + 10, 5).stroke({ width: 1, color: 0xc5c5ac });
    this.mapContainer.circle(gateX - 6, gateY + 9, 2).fill(0x1a1a1a); // Left eye
    this.mapContainer.circle(gateX - 2, gateY + 9, 2).fill(0x1a1a1a); // Right eye
    // Nose cavity
    this.mapContainer
      .moveTo(gateX - 4, gateY + 11)
      .lineTo(gateX - 4, gateY + 13)
      .stroke({ width: 1, color: 0x1a1a1a });
    // Jaw
    this.mapContainer
      .moveTo(gateX - 6, gateY + 13)
      .lineTo(gateX - 2, gateY + 13)
      .stroke({ width: 1, color: 0x1a1a1a });

    // Right skull
    this.mapContainer.circle(gateX + gateWidth + 4, gateY + 10, 5).fill(0xe5e5cc);
    this.mapContainer
      .circle(gateX + gateWidth + 4, gateY + 10, 5)
      .stroke({ width: 1, color: 0xc5c5ac });
    this.mapContainer.circle(gateX + gateWidth + 2, gateY + 9, 2).fill(0x1a1a1a); // Left eye
    this.mapContainer.circle(gateX + gateWidth + 6, gateY + 9, 2).fill(0x1a1a1a); // Right eye
    // Nose cavity
    this.mapContainer
      .moveTo(gateX + gateWidth + 4, gateY + 11)
      .lineTo(gateX + gateWidth + 4, gateY + 13)
      .stroke({ width: 1, color: 0x1a1a1a });
    // Jaw
    this.mapContainer
      .moveTo(gateX + gateWidth + 2, gateY + 13)
      .lineTo(gateX + gateWidth + 6, gateY + 13)
      .stroke({ width: 1, color: 0x1a1a1a });

    // Broken iron gate (left side, hanging inward) - more rusted
    this.mapContainer
      .moveTo(gateX - 8, gateY + 5)
      .lineTo(gateX - 2, gateY + 10)
      .lineTo(gateX - 2, gateY + 45)
      .lineTo(gateX - 8, gateY + 50)
      .fill({ color: 0x5a4a3a, alpha: 0.9 });
    this.mapContainer.stroke({ width: 2, color: 0x3a2a1a });
    // Rust spots on left gate
    for (let i = 0; i < 4; i++) {
      this.mapContainer
        .circle(gateX - 5, gateY + 15 + i * 10, 2)
        .fill({ color: 0x8b4513, alpha: 0.8 });
    }

    // Gate bars (broken and rusted)
    for (let i = 0; i < 3; i++) {
      this.mapContainer
        .moveTo(gateX - 6, gateY + 15 + i * 10)
        .lineTo(gateX - 2, gateY + 15 + i * 10)
        .stroke({ width: 2, color: 0x3a2a1a });
    }

    // Broken iron gate (right side, swung open outward) - more rusted
    this.mapContainer
      .moveTo(gateX + gateWidth + 8, gateY + 5)
      .lineTo(gateX + gateWidth + 20, gateY + 10)
      .lineTo(gateX + gateWidth + 20, gateY + 50)
      .lineTo(gateX + gateWidth + 8, gateY + 55)
      .fill({ color: 0x5a4a3a, alpha: 0.9 });
    this.mapContainer.stroke({ width: 2, color: 0x3a2a1a });
    // Rust spots on right gate
    for (let i = 0; i < 4; i++) {
      this.mapContainer
        .circle(gateX + gateWidth + 14, gateY + 20 + i * 10, 2)
        .fill({ color: 0x8b4513, alpha: 0.8 });
    }

    // Gate bars
    for (let i = 0; i < 3; i++) {
      this.mapContainer
        .moveTo(gateX + gateWidth + 10, gateY + 20 + i * 10)
        .lineTo(gateX + gateWidth + 18, gateY + 20 + i * 10)
        .stroke({ width: 2, color: 0x3a2a1a });
    }

    // "RIP" sign above gate (heavily weathered)
    this.mapContainer.rect(gateX + 10, gateY - 15, 30, 12).fill(0x3a2a1a);
    this.mapContainer.rect(gateX + 10, gateY - 15, 30, 12).stroke({ width: 2, color: 0x2a1a0a });
    // Cracks in sign
    this.mapContainer
      .moveTo(gateX + 15, gateY - 15)
      .lineTo(gateX + 18, gateY - 3)
      .stroke({ width: 1, color: 0x1a0a0a, alpha: 0.7 });

    // Rusty chains hanging from gate
    this.mapContainer
      .moveTo(gateX - 8, gateY + 5)
      .lineTo(gateX - 5, gateY + 15)
      .lineTo(gateX - 8, gateY + 25)
      .stroke({ width: 2, color: 0x5a4a3a });
    // Chain links
    for (let i = 0; i < 3; i++) {
      this.mapContainer
        .circle(gateX - 6, gateY + 10 + i * 8, 2)
        .stroke({ width: 1, color: 0x3a2a1a });
    }

    this.mapContainer
      .moveTo(gateX + gateWidth + 8, gateY + 5)
      .lineTo(gateX + gateWidth + 11, gateY + 15)
      .lineTo(gateX + gateWidth + 8, gateY + 25)
      .stroke({ width: 2, color: 0x5a4a3a });
    // Chain links
    for (let i = 0; i < 3; i++) {
      this.mapContainer
        .circle(gateX + gateWidth + 9, gateY + 10 + i * 8, 2)
        .stroke({ width: 1, color: 0x3a2a1a });
    }

    // Gravestones (various types with better variety)
    const gravestones = [
      // Top row
      { x: 40, y: 280, type: 'cross', size: 12, tilt: 0.1 },
      { x: 70, y: 275, type: 'headstone', size: 14, tilt: -0.08 },
      { x: 100, y: 285, type: 'cross', size: 10, tilt: 0.15 },
      { x: 130, y: 280, type: 'headstone', size: 13, tilt: -0.12 },

      // Second row
      { x: 35, y: 320, type: 'headstone', size: 15, tilt: 0.2 },
      { x: 65, y: 315, type: 'cross', size: 11, tilt: -0.1 },
      { x: 95, y: 325, type: 'monument', size: 18, tilt: 0.05 },
      { x: 125, y: 320, type: 'headstone', size: 12, tilt: 0.18 },

      // Third row (middle - avoid gate area)
      { x: 40, y: 365, type: 'cross', size: 13, tilt: -0.15 },
      { x: 70, y: 370, type: 'headstone', size: 14, tilt: 0.1 },
      { x: 100, y: 360, type: 'cross', size: 10, tilt: -0.2 },

      // Fourth row
      { x: 35, y: 410, type: 'headstone', size: 16, tilt: 0.12 },
      { x: 65, y: 405, type: 'cross', size: 11, tilt: -0.08 },
      { x: 95, y: 415, type: 'headstone', size: 13, tilt: 0.25 },
      { x: 125, y: 410, type: 'cross', size: 12, tilt: -0.15 },

      // Bottom row
      { x: 45, y: 455, type: 'monument', size: 17, tilt: 0.08 },
      { x: 75, y: 450, type: 'headstone', size: 14, tilt: -0.1 },
      { x: 105, y: 460, type: 'cross', size: 10, tilt: 0.15 },
      { x: 135, y: 455, type: 'headstone', size: 13, tilt: -0.18 },

      // Last row
      { x: 50, y: 500, type: 'cross', size: 11, tilt: 0.2 },
      { x: 80, y: 495, type: 'headstone', size: 12, tilt: -0.12 },
      { x: 110, y: 505, type: 'cross', size: 10, tilt: 0.1 },
    ];

    for (const stone of gravestones) {
      this.renderGravestone(stone.x, stone.y, stone.type, stone.size, stone.tilt);
    }

    // Dead trees in graveyard (multiple for atmosphere)
    this.renderDeadTree(graveyardX + 25, graveyardY + 180);
    this.renderDeadTree(graveyardX + 115, graveyardY + 220);

    // Initialize animated fog particles
    this.initializeFogParticles(graveyardX, graveyardY, graveyardWidth, graveyardHeight);

    // Add eerie green glow spots (supernatural effect) - static
    for (let i = 0; i < 5; i++) {
      const glowX = graveyardX + Math.random() * graveyardWidth;
      const glowY = graveyardY + Math.random() * graveyardHeight;
      this.mapContainer
        .circle(glowX, glowY, 8 + Math.random() * 8)
        .fill({ color: 0x00ff00, alpha: 0.08 });
    }

    // Open graves (where zombies emerge)
    this.renderOpenGrave(graveyardX + 70, graveyardY + 120);
    this.renderOpenGrave(graveyardX + 110, graveyardY + 160);
  }

  private renderGravestone(x: number, y: number, type: string, size: number, tilt: number): void {
    const graphics = this.mapContainer;

    if (type === 'cross') {
      // Wooden cross - weathered and tilted
      const crossWidth = size * 0.6;
      const crossHeight = size;
      const beamThickness = size * 0.15;

      // Apply tilt transformation
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);

      // Vertical beam
      const v1x = x + (-beamThickness / 2) * cos - 0 * sin;
      const v1y = y + (-beamThickness / 2) * sin + 0 * cos;
      const v2x = x + (beamThickness / 2) * cos - 0 * sin;
      const v2y = y + (beamThickness / 2) * sin + 0 * cos;
      const v3x = x + (beamThickness / 2) * cos - crossHeight * sin;
      const v3y = y + (beamThickness / 2) * sin + crossHeight * cos;
      const v4x = x + (-beamThickness / 2) * cos - crossHeight * sin;
      const v4y = y + (-beamThickness / 2) * sin + crossHeight * cos;

      graphics.moveTo(v1x, v1y).lineTo(v2x, v2y).lineTo(v3x, v3y).lineTo(v4x, v4y).lineTo(v1x, v1y);
      graphics.fill({ color: 0x4a3a2a });
      graphics.moveTo(v1x, v1y).lineTo(v2x, v2y).lineTo(v3x, v3y).lineTo(v4x, v4y).lineTo(v1x, v1y);
      graphics.stroke({ width: 1, color: 0x2a1a1a });

      // Horizontal beam
      const hBeamY = crossHeight * 0.3;
      const h1x = x + (-crossWidth / 2) * cos - hBeamY * sin;
      const h1y = y + (-crossWidth / 2) * sin + hBeamY * cos;
      const h2x = x + (crossWidth / 2) * cos - hBeamY * sin;
      const h2y = y + (crossWidth / 2) * sin + hBeamY * cos;
      const h3x = x + (crossWidth / 2) * cos - (hBeamY + beamThickness) * sin;
      const h3y = y + (crossWidth / 2) * sin + (hBeamY + beamThickness) * cos;
      const h4x = x + (-crossWidth / 2) * cos - (hBeamY + beamThickness) * sin;
      const h4y = y + (-crossWidth / 2) * sin + (hBeamY + beamThickness) * cos;

      graphics.moveTo(h1x, h1y).lineTo(h2x, h2y).lineTo(h3x, h3y).lineTo(h4x, h4y).lineTo(h1x, h1y);
      graphics.fill({ color: 0x4a3a2a });
      graphics.moveTo(h1x, h1y).lineTo(h2x, h2y).lineTo(h3x, h3y).lineTo(h4x, h4y).lineTo(h1x, h1y);
      graphics.stroke({ width: 1, color: 0x2a1a1a });

      // Shadow
      graphics.ellipse(x + 2, y + crossHeight + 2, size * 0.4, size * 0.2);
      graphics.fill({ color: 0x000000, alpha: 0.3 });
    } else if (type === 'headstone') {
      // Stone headstone - rectangular with rounded top
      const width = size * 0.8;
      const height = size;

      // Apply tilt
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);

      // Draw rounded rectangle (simplified)
      const points = [
        { x: -width / 2, y: height * 0.2 },
        { x: -width / 2, y: height },
        { x: width / 2, y: height },
        { x: width / 2, y: height * 0.2 },
      ];

      const transformedPoints = points.map(p => ({
        x: x + p.x * cos - p.y * sin,
        y: y + p.x * sin + p.y * cos,
      }));

      graphics.moveTo(transformedPoints[0].x, transformedPoints[0].y);
      for (let i = 1; i < transformedPoints.length; i++) {
        graphics.lineTo(transformedPoints[i].x, transformedPoints[i].y);
      }
      graphics.lineTo(transformedPoints[0].x, transformedPoints[0].y);
      graphics.fill({ color: 0x5a5a5a });

      graphics.moveTo(transformedPoints[0].x, transformedPoints[0].y);
      for (let i = 1; i < transformedPoints.length; i++) {
        graphics.lineTo(transformedPoints[i].x, transformedPoints[i].y);
      }
      graphics.lineTo(transformedPoints[0].x, transformedPoints[0].y);
      graphics.stroke({ width: 1, color: 0x3a3a3a });

      // Rounded top
      const topCenterX = x + 0 * cos - height * 0.2 * sin;
      const topCenterY = y + 0 * sin + height * 0.2 * cos;
      graphics.arc(topCenterX, topCenterY, width / 2, Math.PI, 0);
      graphics.fill({ color: 0x5a5a5a });
      graphics.arc(topCenterX, topCenterY, width / 2, Math.PI, 0);
      graphics.stroke({ width: 1, color: 0x3a3a3a });

      // Add crack
      const crackStartX = x + -width * 0.2 * cos - height * 0.4 * sin;
      const crackStartY = y + -width * 0.2 * sin + height * 0.4 * cos;
      const crackEndX = x + width * 0.1 * cos - height * 0.7 * sin;
      const crackEndY = y + width * 0.1 * sin + height * 0.7 * cos;
      graphics.moveTo(crackStartX, crackStartY).lineTo(crackEndX, crackEndY);
      graphics.stroke({ width: 1, color: 0x2a2a2a, alpha: 0.7 });

      // Moss patches
      for (let i = 0; i < 2; i++) {
        const mossX =
          x + (Math.random() - 0.5) * width * 0.5 * cos - height * (0.5 + i * 0.2) * sin;
        const mossY =
          y + (Math.random() - 0.5) * width * 0.5 * sin + height * (0.5 + i * 0.2) * cos;
        graphics.circle(mossX, mossY, 2);
        graphics.fill({ color: 0x2a4a2a, alpha: 0.6 });
      }

      // Shadow
      graphics.ellipse(x + 3, y + height + 2, width * 0.5, width * 0.25);
      graphics.fill({ color: 0x000000, alpha: 0.3 });
    } else if (type === 'monument') {
      // Larger stone monument
      const width = size * 0.9;
      const height = size * 1.2;

      // Apply tilt
      const cos = Math.cos(tilt);
      const sin = Math.sin(tilt);

      // Base
      const basePoints = [
        { x: -width / 2, y: height * 0.8 },
        { x: -width / 2, y: height },
        { x: width / 2, y: height },
        { x: width / 2, y: height * 0.8 },
      ];

      const transformedBase = basePoints.map(p => ({
        x: x + p.x * cos - p.y * sin,
        y: y + p.x * sin + p.y * cos,
      }));

      graphics.moveTo(transformedBase[0].x, transformedBase[0].y);
      for (let i = 1; i < transformedBase.length; i++) {
        graphics.lineTo(transformedBase[i].x, transformedBase[i].y);
      }
      graphics.lineTo(transformedBase[0].x, transformedBase[0].y);
      graphics.fill({ color: 0x6a6a6a });
      graphics.stroke({ width: 1, color: 0x4a4a4a });

      // Main body
      const bodyPoints = [
        { x: -width * 0.4, y: height * 0.2 },
        { x: -width * 0.4, y: height * 0.8 },
        { x: width * 0.4, y: height * 0.8 },
        { x: width * 0.4, y: height * 0.2 },
      ];

      const transformedBody = bodyPoints.map(p => ({
        x: x + p.x * cos - p.y * sin,
        y: y + p.x * sin + p.y * cos,
      }));

      graphics.moveTo(transformedBody[0].x, transformedBody[0].y);
      for (let i = 1; i < transformedBody.length; i++) {
        graphics.lineTo(transformedBody[i].x, transformedBody[i].y);
      }
      graphics.lineTo(transformedBody[0].x, transformedBody[0].y);
      graphics.fill({ color: 0x5a5a5a });
      graphics.stroke({ width: 1, color: 0x3a3a3a });

      // Top (pointed)
      const topPoints = [
        { x: -width * 0.4, y: height * 0.2 },
        { x: 0, y: 0 },
        { x: width * 0.4, y: height * 0.2 },
      ];

      const transformedTop = topPoints.map(p => ({
        x: x + p.x * cos - p.y * sin,
        y: y + p.x * sin + p.y * cos,
      }));

      graphics.moveTo(transformedTop[0].x, transformedTop[0].y);
      for (let i = 1; i < transformedTop.length; i++) {
        graphics.lineTo(transformedTop[i].x, transformedTop[i].y);
      }
      graphics.lineTo(transformedTop[0].x, transformedTop[0].y);
      graphics.fill({ color: 0x6a6a6a });
      graphics.stroke({ width: 1, color: 0x4a4a4a });

      // Shadow
      graphics.ellipse(x + 4, y + height + 2, width * 0.6, width * 0.3);
      graphics.fill({ color: 0x000000, alpha: 0.3 });
    }
  }

  private renderDeadTree(x: number, y: number): void {
    // Trunk
    this.mapContainer.rect(x - 3, y, 6, 40).fill(0x4a3a2a);
    this.mapContainer.stroke({ width: 1, color: 0x2a1a1a });

    // Bare branches
    this.mapContainer
      .moveTo(x, y + 10)
      .lineTo(x - 15, y)
      .stroke({ width: 2, color: 0x4a3a2a });
    this.mapContainer
      .moveTo(x, y + 15)
      .lineTo(x + 12, y + 5)
      .stroke({ width: 2, color: 0x4a3a2a });
    this.mapContainer
      .moveTo(x, y + 25)
      .lineTo(x - 10, y + 18)
      .stroke({ width: 2, color: 0x4a3a2a });
    this.mapContainer
      .moveTo(x, y + 30)
      .lineTo(x + 8, y + 25)
      .stroke({ width: 1, color: 0x4a3a2a });

    // Broken branch on ground
    this.mapContainer
      .moveTo(x + 10, y + 45)
      .lineTo(x + 20, y + 48)
      .stroke({ width: 2, color: 0x4a3a2a });
  }

  private renderOpenGrave(x: number, y: number): void {
    // Grave hole (dark opening)
    this.mapContainer.rect(x - 15, y, 30, 20).fill(0x1a1a1a);
    this.mapContainer.stroke({ width: 2, color: 0x2a2a2a });

    // Dirt piles on sides
    this.mapContainer.circle(x - 20, y + 10, 8).fill(0x654321);
    this.mapContainer.circle(x - 25, y + 15, 6).fill(0x654321);
    this.mapContainer.circle(x + 20, y + 10, 8).fill(0x654321);
    this.mapContainer.circle(x + 25, y + 15, 6).fill(0x654321);

    // Broken coffin pieces
    this.mapContainer.rect(x - 10, y + 5, 8, 3).fill(0x4a3a2a);
    this.mapContainer.rect(x + 5, y + 12, 6, 3).fill(0x4a3a2a);

    // Skeletal hand reaching out
    this.mapContainer.circle(x - 5, y + 8, 2).fill(0xf5f5dc); // Palm
    this.mapContainer.rect(x - 6, y + 6, 1, 4).fill(0xf5f5dc); // Finger
    this.mapContainer.rect(x - 4, y + 5, 1, 5).fill(0xf5f5dc); // Finger
    this.mapContainer.rect(x - 2, y + 6, 1, 4).fill(0xf5f5dc); // Finger
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
