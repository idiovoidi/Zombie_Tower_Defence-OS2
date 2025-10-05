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
    // Draw grass background
    this.mapContainer.rect(0, 0, mapData.width, mapData.height);
    this.mapContainer.fill({ color: 0x33aa33 });

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

  private addDecorativeElements(mapData: MapData): void {
    // Add some random decorative elements to make the map more visually interesting
    // This is a simplified implementation - in a full game this would be more sophisticated
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * mapData.width;
      const y = Math.random() * mapData.height;

      // Only place decorations away from the path
      if (this.isAwayFromPath(x, y, mapData.waypoints)) {
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
