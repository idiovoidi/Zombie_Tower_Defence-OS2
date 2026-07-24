import type { Waypoint } from '../managers/PathfindingManager';
import { CUSTOM_MAP_DEFAULT_CELL_SIZE } from './types';

export function snapToGrid(value: number, cellSize = CUSTOM_MAP_DEFAULT_CELL_SIZE): number {
  if (cellSize <= 0) {
    return value;
  }
  return Math.round(value / cellSize) * cellSize;
}

export function snapWaypoint(
  x: number,
  y: number,
  cellSize = CUSTOM_MAP_DEFAULT_CELL_SIZE,
  bounds?: { width: number; height: number }
): Waypoint {
  let sx = snapToGrid(x, cellSize);
  let sy = snapToGrid(y, cellSize);

  if (bounds) {
    sx = Math.max(0, Math.min(bounds.width, sx));
    sy = Math.max(0, Math.min(bounds.height, sy));
  }

  return { x: sx, y: sy };
}

export function appendSnappedWaypoint(
  waypoints: Waypoint[],
  x: number,
  y: number,
  cellSize = CUSTOM_MAP_DEFAULT_CELL_SIZE,
  bounds?: { width: number; height: number }
): Waypoint[] {
  const next = snapWaypoint(x, y, cellSize, bounds);
  const last = waypoints[waypoints.length - 1];
  if (last && last.x === next.x && last.y === next.y) {
    return waypoints;
  }
  return [...waypoints, next];
}

export function removeLastWaypoint(waypoints: Waypoint[]): Waypoint[] {
  if (waypoints.length === 0) {
    return waypoints;
  }
  return waypoints.slice(0, -1);
}
