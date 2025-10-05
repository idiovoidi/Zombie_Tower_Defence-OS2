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

    // Draw path with a visible dirt/road texture
    const pathWidth = 50;
    
    // Draw path segments
    for (let i = 0; i < mapData.waypoints.length - 1; i++) {
      const p1 = mapData.waypoints[i];
      const p2 = mapData.waypoints[i + 1];
      
      // Calculate perpendicular offset for path width
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / length;
      const ny = dx / length;
      
      // Draw path segment as a polygon
      const halfWidth = pathWidth / 2;
      this.pathGraphics.poly([
        p1.x + nx * halfWidth, p1.y + ny * halfWidth,
        p1.x - nx * halfWidth, p1.y - ny * halfWidth,
        p2.x - nx * halfWidth, p2.y - ny * halfWidth,
        p2.x + nx * halfWidth, p2.y + ny * halfWidth,
      ]);
      this.pathGraphics.fill({ color: 0x8b7355 }); // Brown dirt color
      
      // Add path border
      this.pathGraphics.poly([
        p1.x + nx * halfWidth, p1.y + ny * halfWidth,
        p1.x - nx * halfWidth, p1.y - ny * halfWidth,
        p2.x - nx * halfWidth, p2.y - ny * halfWidth,
        p2.x + nx * halfWidth, p2.y + ny * halfWidth,
      ]);
      this.pathGraphics.stroke({ width: 2, color: 0x654321 }); // Darker brown border
    }
    
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
