import { Application, Graphics } from 'pixi.js';
import { MapManager, MapData } from '../managers/MapManager';
import { Waypoint } from '../managers/PathfindingManager';

export class VisualMapRenderer {
  private app: Application;
  private mapManager: MapManager;
  private mapContainer: Graphics;
  private pathGraphics: Graphics;

  constructor(app: Application, mapManager: MapManager) {
    this.app = app;
    this.mapManager = mapManager;
    this.mapContainer = new Graphics();
    this.pathGraphics = new Graphics();

    // Add to stage at the beginning (index 0) so it renders behind everything
    this.app.stage.addChildAt(this.mapContainer, 0);
    this.app.stage.addChildAt(this.pathGraphics, 1);
  }

  public renderMap(mapName: string): void {
    // Clear previous map
    this.mapContainer.clear();
    this.pathGraphics.clear();

    // Get map data
    const mapData = this.mapManager.getCurrentMap();
    if (!mapData) return;

    // Render map background
    this.renderMapBackground(mapData);

    // Render path
    this.renderPath(mapData);
  }

  private renderMapBackground(mapData: MapData): void {
    // Draw grass background for play area
    this.mapContainer.rect(0, 0, mapData.width, mapData.height);
    this.mapContainer.fill({ color: 0x33aa33 });

    // Draw UI panel background on the right
    this.mapContainer.rect(1024, 0, 256, 768);
    this.mapContainer.fill({ color: 0x2a2a2a });

    // Draw separator line between play area and UI
    this.mapContainer.rect(1024, 0, 4, 768);
    this.mapContainer.fill({ color: 0x654321 });

    // Add graveyard on the left (zombie spawn area)
    this.renderGraveyard(mapData);

    // Add destroyed houses at the top
    this.renderDestroyedHouses(mapData);

    // Add some visual elements like trees or rocks
    this.addDecorativeElements(mapData);
  }

  private renderPath(mapData: MapData): void {
    if (mapData.waypoints.length < 2) return;

    const pathWidth = 50;
    const cornerRadius = 30; // Radius for corner curves

    // Build smooth path with curves at corners
    this.pathGraphics.moveTo(mapData.waypoints[0].x, mapData.waypoints[0].y);

    // Draw the center line with curves
    for (let i = 0; i < mapData.waypoints.length; i++) {
      const prev = i > 0 ? mapData.waypoints[i - 1] : null;
      const curr = mapData.waypoints[i];
      const next = i < mapData.waypoints.length - 1 ? mapData.waypoints[i + 1] : null;

      if (!prev) {
        // First point - just move to it
        this.pathGraphics.moveTo(curr.x, curr.y);
      } else if (!next) {
        // Last point - draw straight line to it
        this.pathGraphics.lineTo(curr.x, curr.y);
      } else {
        // Middle point - create curved corner
        const v1x = curr.x - prev.x;
        const v1y = curr.y - prev.y;
        const v2x = next.x - curr.x;
        const v2y = next.y - curr.y;

        const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
        const len2 = Math.sqrt(v2x * v2x + v2y * v2y);

        // Normalize vectors
        const n1x = v1x / len1;
        const n1y = v1y / len1;
        const n2x = v2x / len2;
        const n2y = v2y / len2;

        // Calculate curve start and end points
        const curveStart = Math.min(cornerRadius, len1 / 2);
        const curveEnd = Math.min(cornerRadius, len2 / 2);

        const startX = curr.x - n1x * curveStart;
        const startY = curr.y - n1y * curveStart;
        const endX = curr.x + n2x * curveEnd;
        const endY = curr.y + n2y * curveEnd;

        // Draw line to curve start
        this.pathGraphics.lineTo(startX, startY);

        // Draw quadratic curve through the corner
        this.pathGraphics.quadraticCurveTo(curr.x, curr.y, endX, endY);
      }
    }

    // Stroke the path with width
    this.pathGraphics.stroke({ width: pathWidth, color: 0x8b7355, cap: 'round', join: 'round' });

    // Add border
    this.pathGraphics.moveTo(mapData.waypoints[0].x, mapData.waypoints[0].y);
    for (let i = 0; i < mapData.waypoints.length; i++) {
      const prev = i > 0 ? mapData.waypoints[i - 1] : null;
      const curr = mapData.waypoints[i];
      const next = i < mapData.waypoints.length - 1 ? mapData.waypoints[i + 1] : null;

      if (!prev) {
        this.pathGraphics.moveTo(curr.x, curr.y);
      } else if (!next) {
        this.pathGraphics.lineTo(curr.x, curr.y);
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

        this.pathGraphics.lineTo(startX, startY);
        this.pathGraphics.quadraticCurveTo(curr.x, curr.y, endX, endY);
      }
    }

    this.pathGraphics.stroke({
      width: pathWidth + 4,
      color: 0x654321,
      cap: 'round',
      join: 'round',
    });

    // Draw waypoint markers for debugging
    for (const waypoint of mapData.waypoints) {
      this.pathGraphics.circle(waypoint.x, waypoint.y, 8);
      this.pathGraphics.fill({ color: 0xff0000, alpha: 0.5 });
    }

    // Draw survivor camp at the end of the path
    this.renderSurvivorCamp(mapData.waypoints[mapData.waypoints.length - 1]);
  }

  private renderGraveyard(mapData: MapData): void {
    const graveyardX = 20;
    const graveyardY = 250;
    const graveyardWidth = 140;
    const graveyardHeight = 280;

    // Graveyard ground (darker, dead grass)
    this.mapContainer
      .rect(graveyardX, graveyardY, graveyardWidth, graveyardHeight)
      .fill({ color: 0x2a4a2a, alpha: 0.8 });

    // Rusty iron fence around graveyard
    this.mapContainer
      .rect(graveyardX, graveyardY, graveyardWidth, 4)
      .fill(0x8b4513); // Top fence
    this.mapContainer
      .rect(graveyardX, graveyardY + graveyardHeight - 4, graveyardWidth, 4)
      .fill(0x8b4513); // Bottom fence
    this.mapContainer
      .rect(graveyardX, graveyardY, 4, graveyardHeight)
      .fill(0x8b4513); // Left fence
    this.mapContainer
      .rect(graveyardX + graveyardWidth - 4, graveyardY, 4, graveyardHeight)
      .fill(0x8b4513); // Right fence

    // Fence posts
    for (let i = 0; i <= graveyardHeight; i += 35) {
      this.mapContainer.rect(graveyardX - 2, graveyardY + i, 8, 6).fill(0x654321);
      this.mapContainer.rect(graveyardX + graveyardWidth - 6, graveyardY + i, 8, 6).fill(0x654321);
    }

    // Broken gate (open, hanging)
    const gateX = graveyardX - 2;
    const gateY = graveyardY + graveyardHeight / 2 - 20;
    this.mapContainer
      .moveTo(gateX, gateY)
      .lineTo(gateX - 15, gateY + 5)
      .lineTo(gateX - 15, gateY + 35)
      .lineTo(gateX, gateY + 40)
      .fill({ color: 0x654321, alpha: 0.7 });
    this.mapContainer.stroke({ width: 2, color: 0x4a3a2a });

    // Gravestones (various types)
    const gravestones = [
      { x: 40, y: 280, type: 'cross', tilt: 0.1 },
      { x: 80, y: 290, type: 'rect', tilt: -0.15 },
      { x: 120, y: 285, type: 'round', tilt: 0.05 },
      { x: 50, y: 330, type: 'rect', tilt: 0.2 },
      { x: 95, y: 340, type: 'cross', tilt: -0.1 },
      { x: 135, y: 335, type: 'rect', tilt: 0.15 },
      { x: 35, y: 380, type: 'round', tilt: -0.05 },
      { x: 75, y: 390, type: 'rect', tilt: 0.25 },
      { x: 115, y: 385, type: 'cross', tilt: -0.2 },
      { x: 145, y: 395, type: 'rect', tilt: 0.1 },
      { x: 45, y: 440, type: 'round', tilt: 0.15 },
      { x: 90, y: 450, type: 'rect', tilt: -0.1 },
      { x: 130, y: 445, type: 'cross', tilt: 0.05 },
      { x: 60, y: 490, type: 'rect', tilt: -0.2 },
      { x: 105, y: 500, type: 'round', tilt: 0.1 },
    ];

    for (const stone of gravestones) {
      this.renderGravestone(stone.x, stone.y, stone.type, stone.tilt);
    }

    // Dead tree in graveyard
    this.renderDeadTree(graveyardX + 25, graveyardY + 180);

    // Mist/fog effect
    for (let i = 0; i < 8; i++) {
      const mistX = graveyardX + Math.random() * graveyardWidth;
      const mistY = graveyardY + graveyardHeight - 30 + Math.random() * 20;
      this.mapContainer
        .circle(mistX, mistY, 15 + Math.random() * 10)
        .fill({ color: 0xcccccc, alpha: 0.15 });
    }

    // Open graves (where zombies emerge)
    this.renderOpenGrave(graveyardX + 70, graveyardY + 120);
    this.renderOpenGrave(graveyardX + 110, graveyardY + 160);
  }

  private renderGravestone(x: number, y: number, type: string, tilt: number): void {
    const baseColor = 0x696969;
    const darkColor = 0x4a4a4a;

    if (type === 'rect') {
      // Rectangular gravestone
      this.mapContainer.rect(x - 8, y, 16, 25).fill(baseColor);
      this.mapContainer.stroke({ width: 1, color: darkColor });
      // Moss/weathering
      this.mapContainer.circle(x - 3, y + 5, 3).fill({ color: 0x2a4a2a, alpha: 0.5 });
      this.mapContainer.circle(x + 4, y + 15, 2).fill({ color: 0x2a4a2a, alpha: 0.5 });
    } else if (type === 'round') {
      // Rounded top gravestone
      this.mapContainer.rect(x - 8, y + 8, 16, 20).fill(baseColor);
      this.mapContainer.circle(x, y + 8, 8).fill(baseColor);
      this.mapContainer.stroke({ width: 1, color: darkColor });
      // Crack
      this.mapContainer
        .moveTo(x - 2, y + 5)
        .lineTo(x + 1, y + 20)
        .stroke({ width: 1, color: darkColor });
    } else if (type === 'cross') {
      // Cross gravestone
      this.mapContainer.rect(x - 2, y, 4, 25).fill(baseColor); // Vertical
      this.mapContainer.rect(x - 8, y + 8, 16, 4).fill(baseColor); // Horizontal
      this.mapContainer.stroke({ width: 1, color: darkColor });
    }

    // Shadow/base
    this.mapContainer.rect(x - 10, y + 25, 20, 3).fill({ color: 0x1a1a1a, alpha: 0.4 });
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

  private renderDestroyedHouses(mapData: MapData): void {
    // Render several destroyed houses at the top of the map with varied positions
    const houses = [
      { x: 120, y: 50, width: 70, height: 60, destroyed: 0.8 },
      { x: 280, y: 85, width: 80, height: 70, destroyed: 0.6 },
      { x: 480, y: 45, width: 65, height: 55, destroyed: 0.9 },
      { x: 650, y: 70, width: 75, height: 65, destroyed: 0.7 },
      { x: 820, y: 55, width: 60, height: 50, destroyed: 0.85 },
      { x: 950, y: 90, width: 55, height: 58, destroyed: 0.75 },
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

    // Rubble
    const rubbleCount = Math.floor(8 + destroyedLevel * 15);
    for (let i = 0; i < rubbleCount; i++) {
      const rx = x + Math.random() * width;
      const ry = y + height + 8 + Math.random() * 12;
      const size = 4 + Math.random() * 6;
      this.mapContainer.rect(rx, ry, size, size * 0.8).fill(0x696969);
    }

    // Burn marks
    if (destroyedLevel > 0.6) {
      this.mapContainer
        .circle(x + width * 0.3, y + height - wallHeight * 0.5, 18)
        .fill({ color: 0x1a1a1a, alpha: 0.5 });
      this.mapContainer
        .circle(x + width * 0.7, y + height - wallHeight * 0.3, 14)
        .fill({ color: 0x1a1a1a, alpha: 0.4 });
    }

    // Smoke
    if (destroyedLevel > 0.7) {
      for (let i = 0; i < 4; i++) {
        const sx = x + width * 0.5 + (Math.random() - 0.5) * 25;
        const sy = y + height - wallHeight - 15 - i * 10;
        this.mapContainer
          .circle(sx, sy, 4 + i * 0.5)
          .fill({ color: 0x808080, alpha: 0.35 - i * 0.08 });
      }
    }
  }

  private addDecorativeElements(mapData: MapData): void {
    // Add some random decorative elements to make the map more visually interesting
    // This is a simplified implementation - in a full game this would be more sophisticated
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;

      // Only place decorations away from the path and not at the top (where houses are)
      if (y > 150 && this.isAwayFromPath(x, y, mapData.waypoints)) {
        this.mapContainer.circle(x, y, 5 + Math.random() * 10);
        this.mapContainer.fill({ color: 0x228822 });
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
      if (distance < 50) return false; // Too close to path
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

    if (lenSq !== 0) param = dot / lenSq;

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

    // Wooden fence perimeter
    this.pathGraphics.rect(campX - 60, campY - 50, 120, 100).fill(0x8b4513);
    this.pathGraphics.stroke({ width: 3, color: 0x654321 });

    // Fence posts
    for (let i = -60; i <= 60; i += 20) {
      this.pathGraphics.rect(campX + i - 2, campY - 50, 4, 100).fill(0x654321);
    }
    for (let i = -50; i <= 50; i += 20) {
      this.pathGraphics.rect(campX - 60, campY + i - 2, 120, 4).fill(0x654321);
    }

    // Main shelter/tent
    this.pathGraphics
      .moveTo(campX - 30, campY - 10)
      .lineTo(campX, campY - 35)
      .lineTo(campX + 30, campY - 10)
      .lineTo(campX - 30, campY - 10)
      .fill(0x8b7355);
    this.pathGraphics.rect(campX - 30, campY - 10, 60, 30).fill(0xa0826d);
    this.pathGraphics.stroke({ width: 2, color: 0x654321 });

    // Tent entrance
    this.pathGraphics.rect(campX - 10, campY + 10, 20, 10).fill(0x4a4a4a);

    // Campfire in front
    this.pathGraphics.circle(campX, campY + 30, 8).fill(0x8b4513); // Fire pit
    this.pathGraphics.circle(campX, campY + 30, 5).fill(0xff4500); // Fire
    this.pathGraphics.circle(campX, campY + 28, 3).fill(0xffa500); // Flame

    // Supply crates
    this.pathGraphics.rect(campX - 45, campY - 30, 15, 15).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 1, color: 0x654321 });
    this.pathGraphics.rect(campX - 45, campY - 10, 15, 15).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 1, color: 0x654321 });

    // Watchtower
    this.pathGraphics.rect(campX + 35, campY - 40, 20, 50).fill(0x8b7355);
    this.pathGraphics.stroke({ width: 2, color: 0x654321 });
    this.pathGraphics.rect(campX + 30, campY - 45, 30, 10).fill(0x654321); // Platform
    this.pathGraphics.circle(campX + 45, campY - 40, 3).fill(0xffdbac); // Guard head

    // Flag on watchtower
    this.pathGraphics
      .moveTo(campX + 55, campY - 45)
      .lineTo(campX + 55, campY - 60)
      .stroke({
        width: 2,
        color: 0x654321,
      });
    this.pathGraphics
      .moveTo(campX + 55, campY - 60)
      .lineTo(campX + 70, campY - 55)
      .lineTo(campX + 55, campY - 50)
      .fill(0xff0000); // Red flag

    // Survivors (little people)
    // Survivor 1
    this.pathGraphics.circle(campX - 15, campY + 25, 4).fill(0xffdbac); // Head
    this.pathGraphics.rect(campX - 18, campY + 29, 6, 8).fill(0x4169e1); // Body

    // Survivor 2
    this.pathGraphics.circle(campX + 15, campY + 25, 4).fill(0xffdbac); // Head
    this.pathGraphics.rect(campX + 12, campY + 29, 6, 8).fill(0x228b22); // Body

    // "SAFE ZONE" text indicator
    this.pathGraphics.rect(campX - 35, campY - 55, 70, 15).fill({ color: 0x228b22, alpha: 0.8 });
    this.pathGraphics.stroke({ width: 2, color: 0x006400 });
  }

  public clear(): void {
    this.mapContainer.clear();
    this.pathGraphics.clear();
  }
}
