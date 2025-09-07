import { PathfindingManager, Waypoint } from './PathfindingManager';

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
    // Default map
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
        { x: 950, y: 600 }
      ]
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
        { x: 950, y: 700 }
      ]
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
        { x: 950, y: 200 }
      ]
    });
  }
  
  // Load a map
  public loadMap(mapName: string): boolean {
    if (!this.maps.has(mapName)) {
      console.warn(`Map ${mapName} not found`);
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
}