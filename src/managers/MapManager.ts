import {
  ensurePathGraph,
  getEndWaypoint,
  getSpawnWaypoint,
  type PathGraph,
  type PathSegment,
  pathGraphFromWaypoints,
  pathGraphToSegments,
  resolveRandomPath,
} from '../path/pathGraph';
import { PathfindingManager, type Waypoint } from './PathfindingManager';

export interface MapData {
  name: string;
  width: number;
  height: number;
  /** Legacy primary polyline (also used as fallback / editor path). */
  waypoints: Waypoint[];
  /** Branching path graph; when omitted, derived from waypoints. */
  pathGraph?: PathGraph;
  // Visual properties
  backgroundColor?: number;
  pathColor?: number;
  pathWidth?: number;
  decorations?: {
    type: 'tree' | 'rock' | 'bush' | 'pond';
    x: number;
    y: number;
    size: number;
  }[];
}

function withLinearGraph(
  name: string,
  width: number,
  height: number,
  waypoints: Waypoint[]
): MapData {
  return {
    name,
    width,
    height,
    waypoints,
    pathGraph: pathGraphFromWaypoints(waypoints),
  };
}

/** Mid-path fork that merges before camp — proves branching gameplay. */
function createForkedMap(): MapData {
  const nodes = [
    { id: 'spawn', x: 50, y: 384 },
    { id: 'approach', x: 220, y: 384 },
    { id: 'fork', x: 360, y: 384 },
    { id: 'north_a', x: 480, y: 180 },
    { id: 'north_b', x: 680, y: 180 },
    { id: 'south_a', x: 480, y: 600 },
    { id: 'south_b', x: 680, y: 600 },
    { id: 'merge', x: 800, y: 384 },
    { id: 'camp', x: 950, y: 384 },
  ];
  const edges = [
    { from: 'spawn', to: 'approach' },
    { from: 'approach', to: 'fork' },
    { from: 'fork', to: 'north_a' },
    { from: 'fork', to: 'south_a' },
    { from: 'north_a', to: 'north_b' },
    { from: 'north_b', to: 'merge' },
    { from: 'south_a', to: 'south_b' },
    { from: 'south_b', to: 'merge' },
    { from: 'merge', to: 'camp' },
  ];
  const pathGraph: PathGraph = {
    nodes,
    edges,
    spawnId: 'spawn',
    endId: 'camp',
  };
  // Primary waypoints = northern route (for any legacy single-polyline reader)
  const waypoints = resolveRandomPath(pathGraph, () => 0);
  return {
    name: 'forked',
    width: 1024,
    height: 768,
    waypoints,
    pathGraph,
  };
}

export class MapManager {
  private maps: Map<string, MapData>;
  private currentMap: string;
  private pathfindingManager: PathfindingManager;

  constructor() {
    this.maps = new Map<string, MapData>();
    this.currentMap = 'forked';
    this.pathfindingManager = new PathfindingManager();
    this.initializeMaps();
  }

  private initializeMaps(): void {
    this.maps.set(
      'default',
      withLinearGraph('default', 1024, 768, [
        { x: 50, y: 384 },
        { x: 200, y: 384 },
        { x: 200, y: 500 },
        { x: 400, y: 500 },
        { x: 400, y: 200 },
        { x: 600, y: 200 },
        { x: 600, y: 600 },
        { x: 950, y: 600 },
      ])
    );

    this.maps.set(
      'forest',
      withLinearGraph('forest', 1024, 768, [
        { x: 50, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
        { x: 600, y: 300 },
        { x: 600, y: 500 },
        { x: 200, y: 500 },
        { x: 200, y: 700 },
        { x: 950, y: 700 },
      ])
    );

    this.maps.set(
      'city',
      withLinearGraph('city', 1024, 768, [
        { x: 50, y: 200 },
        { x: 150, y: 200 },
        { x: 150, y: 100 },
        { x: 400, y: 100 },
        { x: 400, y: 400 },
        { x: 700, y: 400 },
        { x: 700, y: 200 },
        { x: 950, y: 200 },
      ])
    );

    this.maps.set(
      'industrial',
      withLinearGraph('industrial', 1024, 768, [
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
      ])
    );

    this.maps.set(
      'swamp',
      withLinearGraph('swamp', 1024, 768, [
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
      ])
    );

    this.maps.set(
      'laboratory',
      withLinearGraph('laboratory', 1024, 768, [
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
      ])
    );

    this.maps.set('forked', createForkedMap());

    // Wider map (1.5× play viewport) — requires camera pan to reach camp
    this.maps.set(
      'highway',
      withLinearGraph('highway', 1536, 768, [
        { x: 50, y: 384 },
        { x: 220, y: 384 },
        { x: 220, y: 180 },
        { x: 480, y: 180 },
        { x: 480, y: 580 },
        { x: 760, y: 580 },
        { x: 760, y: 220 },
        { x: 1040, y: 220 },
        { x: 1040, y: 520 },
        { x: 1280, y: 520 },
        { x: 1280, y: 384 },
        { x: 1480, y: 384 },
      ])
    );
  }

  /** Register or replace a map (used by custom map creator). */
  public registerMap(data: MapData): void {
    const waypoints = data.waypoints.map(wp => ({ x: wp.x, y: wp.y }));
    const pathGraph = data.pathGraph
      ? {
          ...data.pathGraph,
          nodes: data.pathGraph.nodes.map(n => ({ ...n })),
          edges: data.pathGraph.edges.map(e => ({ ...e })),
        }
      : pathGraphFromWaypoints(waypoints);

    this.maps.set(data.name, {
      ...data,
      waypoints,
      pathGraph,
    });
  }

  public unregisterMap(mapName: string): boolean {
    if (this.currentMap === mapName) {
      this.currentMap = 'forked';
    }
    return this.maps.delete(mapName);
  }

  public loadMap(mapName: string): boolean {
    if (!this.maps.has(mapName)) {
      return false;
    }

    this.currentMap = mapName;
    return true;
  }

  public getCurrentMap(): MapData | undefined {
    return this.maps.get(this.currentMap);
  }

  public getCurrentMapName(): string {
    return this.currentMap;
  }

  public getCurrentMapWaypoints(): Waypoint[] {
    const map = this.maps.get(this.currentMap);
    return map ? map.waypoints : [];
  }

  public getPathGraph(): PathGraph | null {
    const map = this.maps.get(this.currentMap);
    if (!map) {
      return null;
    }
    return ensurePathGraph(map);
  }

  public getPathSegments(): PathSegment[] {
    const graph = this.getPathGraph();
    return graph ? pathGraphToSegments(graph) : [];
  }

  /** Resolve a random spawn→camp route through the path graph. */
  public getRandomPath(): Waypoint[] {
    const graph = this.getPathGraph();
    if (!graph) {
      return [];
    }
    return resolveRandomPath(graph);
  }

  public getAvailableMaps(): string[] {
    return Array.from(this.maps.keys());
  }

  public getPathfindingManager(): PathfindingManager {
    return this.pathfindingManager;
  }

  public getSpawnPoint(): Waypoint | null {
    const graph = this.getPathGraph();
    if (graph) {
      return getSpawnWaypoint(graph);
    }
    const waypoints = this.getCurrentMapWaypoints();
    return waypoints.length > 0 ? waypoints[0] : null;
  }

  public getEndPoint(): Waypoint | null {
    const graph = this.getPathGraph();
    if (graph) {
      return getEndWaypoint(graph);
    }
    const waypoints = this.getCurrentMapWaypoints();
    return waypoints.length > 0 ? waypoints[waypoints.length - 1] : null;
  }

  /** Legacy: primary polyline waypoints (not a random branch). */
  public getWaypoints(): Waypoint[] {
    return this.getCurrentMapWaypoints();
  }
}
