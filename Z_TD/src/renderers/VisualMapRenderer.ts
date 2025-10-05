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

  public clear(): void {
    this.mapContainer.clear();
    this.pathGraphics.clear();
  }
}
