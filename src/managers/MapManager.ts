import { PathfindingManager, type Waypoint } from './PathfindingManager';

export interface MapData {
  name: string;
  width: number;
  height: number;
  waypoints: Waypoint[];
  // Visual properties
  backgroundColor?: number;
  pathColor?: number;
  pathWidth?: number;
  decorations?: {
    type: 'tree' | 'rock' | 'bush';
    x: number;
    y: number;
    size: number;
  }[];
}

export class MapManager {
  private maps: Map<string, MapData>;
  private currentMap: string;
  private pathfindingManager: PathfindingManager;

  constructor() {
    this.maps = new Map<string, MapData>();
    this.currentMap = 'default';
    this.pathfindingManager = new PathfindingManager();
    this.initializeMaps();
  }

  // Initialize predefined maps
  private initializeMaps(): void {
    // Default map (play area is 1024 wide, UI takes remaining 256 pixels)
    this.maps.set('default', {
      name: 'default',
      width: 1024,
      height: 768,
      waypoints: [
        { x: 50, y: 384 },
        { x: 200, y: 384 },
        { x: 200, y: 500 },
        { x: 400, y: 500 },
        { x: 400, y: 200 },
        { x: 600, y: 200 },
        { x: 600, y: 600 },
        { x: 950, y: 600 },
      ],
    });

    // Forest map
    this.maps.set('forest', {
      name: 'forest',
      width: 1024,
      height: 768,
      waypoints: [
        { x: 50, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
        { x: 600, y: 300 },
        { x: 600, y: 500 },
        { x: 200, y: 500 },
        { x: 200, y: 700 },
        { x: 950, y: 700 },
      ],
    });

    // City map
    this.maps.set('city', {
      name: 'city',
      width: 1024,
      height: 768,
      waypoints: [
        { x: 50, y: 200 },
        { x: 150, y: 200 },
        { x: 150, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 400 },
        { x: 700, y: 400 },
        { x: 700, y: 200 },
        { x: 950, y: 200 },
      ],
    });

    // Industrial map - complex zigzag pattern
    this.maps.set('industrial', {
      name: 'industrial',
      width: 1024,
      height: 768,
      waypoints: [
        { x: 50, y: 700 },
        { x: 200, y: 700 },
        { x: 200, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 600 },
        { x: 600, y: 600 },
        { x: 600, y: 200 },
        { x: 800, y: 200 },
        { x: 800, y: 500 },
        { x: 950, y: 500 },
      ],
    });

    // Swamp map - winding path with multiple curves
    this.maps.set('swamp', {
      name: 'swamp',
      width: 1024,
      height: 768,
      waypoints: [
        { x: 50, y: 384 },
        { x: 150, y: 384 },
        { x: 150, y: 150 },
        { x: 350, y: 150 },
        { x: 350, y: 618 },
        { x: 550, y: 618 },
        { x: 550, y: 300 },
        { x: 750, y: 300 },
        { x: 750, y: 600 },
        { x: 950, y: 600 },
      ],
    });

    // Laboratory map - maze-like with backtracking
    this.maps.set('laboratory', {
      name: 'laboratory',
      width: 1024,
      height: 768,
      waypoints: [
        { x: 50, y: 100 },
        { x: 150, y: 100 },
        { x: 150, y: 650 },
        { x: 400, y: 650 },
        { x: 400, y: 200 },
        { x: 650, y: 200 },
        { x: 650, y: 550 },
        { x: 850, y: 550 },
        { x: 850, y: 350 },
        { x: 950, y: 350 },
      ],
    });
  }

  /** Register or replace a map (used by custom map creator). */
  public registerMap(data: MapData): void {
    this.maps.set(data.name, {
      ...data,
      waypoints: data.waypoints.map(wp => ({ x: wp.x, y: wp.y })),
    });
  }

  public unregisterMap(mapName: string): boolean {
    if (this.currentMap === mapName) {
      this.currentMap = 'default';
    }
    return this.maps.delete(mapName);
  }

  // Load a map
  public loadMap(mapName: string): boolean {
    if (!this.maps.has(mapName)) {
      return false;
    }

    this.currentMap = mapName;
    return true;
  }

  // Get current map data
  public getCurrentMap(): MapData | undefined {
    return this.maps.get(this.currentMap);
  }

  // Get waypoints for current map
  public getCurrentMapWaypoints(): Waypoint[] {
    const map = this.maps.get(this.currentMap);
    return map ? map.waypoints : [];
  }

  // Get all available maps
  public getAvailableMaps(): string[] {
    return Array.from(this.maps.keys());
  }

  // Get pathfinding manager
  public getPathfindingManager(): PathfindingManager {
    return this.pathfindingManager;
  }

  // Get spawn point (first waypoint)
  public getSpawnPoint(): Waypoint | null {
    const waypoints = this.getCurrentMapWaypoints();
    return waypoints.length > 0 ? waypoints[0] : null;
  }

  // Get waypoints for zombie path
  public getWaypoints(): Waypoint[] {
    return this.getCurrentMapWaypoints();
  }
}
