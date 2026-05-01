import { Graphics } from 'pixi.js';
import { COLORS, PATH } from '../../config/visualConstants';
import { MapData } from '../../managers/MapManager';
import { Waypoint } from '../../managers/PathfindingManager';

/**
 * PathRenderer
 *
 * Responsible for rendering the zombie path including:
 * - Path borders (dark edges)
 * - Main path surface (worn dirt)
 * - Center worn track
 * - Tire/cart tracks
 * - Dirt texture patches
 * - Small rocks
 * - Footprints
 * - Edge wear
 */
export class PathRenderer {
  private graphics: Graphics;

  constructor(graphics: Graphics) {
    this.graphics = graphics;
  }

  public render(mapData: MapData): void {
    if (mapData.waypoints.length < 2) {
      return;
    }

    const pathWidth = PATH.WIDTH;

    // Draw layers from bottom to top
    this.renderPathBorder(mapData.waypoints, pathWidth);
    this.renderMainPath(mapData.waypoints, pathWidth);
    this.renderCenterTrack(mapData.waypoints, pathWidth);
    this.renderTireTracks(mapData.waypoints, pathWidth);
    this.renderPathTexture(mapData.waypoints, pathWidth);
    this.renderEdgeWear(mapData.waypoints, pathWidth);
  }

  private drawPathLine(waypoints: Waypoint[], cornerRadius: number): void {
    this.graphics.moveTo(waypoints[0].x, waypoints[0].y);

    for (let i = 0; i < waypoints.length; i++) {
      const prev = i > 0 ? waypoints[i - 1] : null;
      const curr = waypoints[i];
      const next = i < waypoints.length - 1 ? waypoints[i + 1] : null;

      if (!prev) {
        this.graphics.moveTo(curr.x, curr.y);
      } else if (!next) {
        this.graphics.lineTo(curr.x, curr.y);
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

        this.graphics.lineTo(startX, startY);
        this.graphics.quadraticCurveTo(curr.x, curr.y, endX, endY);
      }
    }
  }

  private renderPathBorder(waypoints: Waypoint[], pathWidth: number): void {
    // Draw dark border first (darker dirt edges)
    this.drawPathLine(waypoints, PATH.CORNER_RADIUS);
    this.graphics.stroke({
      width: pathWidth + PATH.OUTER_BORDER_WIDTH,
      color: COLORS.PATH_OUTER,
      cap: 'round',
      join: 'round',
    });
  }

  private renderMainPath(waypoints: Waypoint[], pathWidth: number): void {
    // Draw main path (worn dirt)
    this.drawPathLine(waypoints, PATH.CORNER_RADIUS);
    this.graphics.stroke({
      width: pathWidth,
      color: COLORS.PATH_DIRT,
      cap: 'round',
      join: 'round',
    });
  }

  private renderCenterTrack(waypoints: Waypoint[], pathWidth: number): void {
    // Add center worn track (darker from heavy use)
    this.drawPathLine(waypoints, PATH.CORNER_RADIUS);
    this.graphics.stroke({
      width: pathWidth * PATH.INNER_WIDTH_FACTOR,
      color: COLORS.PATH_INNER,
      cap: 'round',
      join: 'round',
      alpha: PATH.INNER_ALPHA,
    });
  }

  private renderTireTracks(waypoints: Waypoint[], pathWidth: number): void {
    // Add tire/cart tracks (two parallel lines)
    const trackOffset = pathWidth * PATH.TRACK_OFFSET_FACTOR;

    // Calculate perpendicular offsets for tracks
    for (let i = 0; i < waypoints.length - 1; i++) {
      const curr = waypoints[i];
      const next = waypoints[i + 1];

      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;

      // Left track
      this.graphics.moveTo(curr.x + nx * trackOffset, curr.y + ny * trackOffset);
      this.graphics.lineTo(next.x + nx * trackOffset, next.y + ny * trackOffset);
      this.graphics.stroke({
        width: PATH.TRACK_WIDTH,
        color: COLORS.PATH_TRACK,
        alpha: PATH.TRACK_ALPHA,
      });

      // Right track
      this.graphics.moveTo(curr.x - nx * trackOffset, curr.y - ny * trackOffset);
      this.graphics.lineTo(next.x - nx * trackOffset, next.y - ny * trackOffset);
      this.graphics.stroke({
        width: PATH.TRACK_WIDTH,
        color: COLORS.PATH_TRACK,
        alpha: PATH.TRACK_ALPHA,
      });
    }
  }

  private renderPathTexture(waypoints: Waypoint[], pathWidth: number): void {
    // Add dirt texture - random small patches along path
    for (let i = 0; i < waypoints.length - 1; i++) {
      const curr = waypoints[i];
      const next = waypoints[i + 1];

      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(len / PATH.DIRT_STEP_SIZE);

      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const x = curr.x + dx * t;
        const y = curr.y + dy * t;

        // Random dirt patches
        if (Math.random() > PATH.DIRT_PATCH_PROBABILITY) {
          const size =
            PATH.DIRT_PATCH_MIN_SIZE +
            Math.random() * (PATH.DIRT_PATCH_MAX_SIZE - PATH.DIRT_PATCH_MIN_SIZE);
          const offsetX = (Math.random() - 0.5) * pathWidth * PATH.DIRT_PATCH_OFFSET_FACTOR;
          const offsetY = (Math.random() - 0.5) * pathWidth * PATH.DIRT_PATCH_OFFSET_FACTOR;
          this.graphics.circle(x + offsetX, y + offsetY, size).fill({
            color: COLORS.PATH_DIRT,
            alpha:
              PATH.DIRT_PATCH_MIN_ALPHA +
              Math.random() * (PATH.DIRT_PATCH_MAX_ALPHA - PATH.DIRT_PATCH_MIN_ALPHA),
          });
        }

        // Random small rocks
        if (Math.random() > PATH.ROCK_PROBABILITY) {
          const size =
            PATH.ROCK_MIN_SIZE + Math.random() * (PATH.ROCK_MAX_SIZE - PATH.ROCK_MIN_SIZE);
          const offsetX = (Math.random() - 0.5) * pathWidth * PATH.ROCK_OFFSET_FACTOR;
          const offsetY = (Math.random() - 0.5) * pathWidth * PATH.ROCK_OFFSET_FACTOR;
          this.graphics.circle(x + offsetX, y + offsetY, size).fill({
            color: COLORS.PATH_ROCK,
            alpha:
              PATH.ROCK_MIN_ALPHA + Math.random() * (PATH.ROCK_MAX_ALPHA - PATH.ROCK_MIN_ALPHA),
          });
        }

        // Footprints (small ovals)
        if (Math.random() > PATH.FOOTPRINT_PROBABILITY) {
          const offsetX = (Math.random() - 0.5) * pathWidth * PATH.FOOTPRINT_OFFSET_FACTOR;
          const offsetY = (Math.random() - 0.5) * pathWidth * PATH.FOOTPRINT_OFFSET_FACTOR;
          const _angle = Math.random() * Math.PI * 2;
          this.graphics
            .ellipse(x + offsetX, y + offsetY, PATH.FOOTPRINT_WIDTH, PATH.FOOTPRINT_HEIGHT)
            .fill({
              color: COLORS.PATH_FOOTPRINT,
              alpha:
                PATH.FOOTPRINT_MIN_ALPHA +
                Math.random() * (PATH.FOOTPRINT_MAX_ALPHA - PATH.FOOTPRINT_MIN_ALPHA),
            });
        }
      }
    }
  }

  private renderEdgeWear(waypoints: Waypoint[], pathWidth: number): void {
    // Add edge wear - lighter dirt at edges
    this.drawPathLine(waypoints, PATH.CORNER_RADIUS);
    this.graphics.stroke({
      width: pathWidth + PATH.HIGHLIGHT_BORDER_WIDTH,
      color: COLORS.PATH_HIGHLIGHT,
      cap: 'round',
      join: 'round',
      alpha: PATH.HIGHLIGHT_ALPHA,
    });
  }
}
