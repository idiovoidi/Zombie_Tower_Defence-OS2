// Pathfinding manager using pre-computed waypoints
export interface Waypoint {
  x: number;
  y: number;
}

export class PathfindingManager {
  private waypoints: Waypoint[];
  private gridWidth: number;
  private gridHeight: number;
  private cellSize: number;
  
  constructor(gridWidth: number = 1024, gridHeight: number = 768, cellSize: number = 32) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellSize = cellSize;
    this.waypoints = [];
  }
  
  // Initialize waypoints for a specific map
  public initializeWaypoints(mapName: string): void {
    // In a real implementation, this would load waypoints from a file or data structure
    // For now, we'll create a simple path
    this.waypoints = this.generateSimplePath();
  }
  
  // Generate a simple path for demonstration
  private generateSimplePath(): Waypoint[] {
    const path: Waypoint[] = [];
    
    // Start at the left side
    path.push({ x: 50, y: 384 });
    
    // Move right
    path.push({ x: 200, y: 384 });
    
    // Move down
    path.push({ x: 200, y: 500 });
    
    // Move right
    path.push({ x: 400, y: 500 });
    
    // Move up
    path.push({ x: 400, y: 200 });
    
    // Move right
    path.push({ x: 600, y: 200 });
    
    // Move down
    path.push({ x: 600, y: 600 });
    
    // Move right to end
    path.push({ x: 950, y: 600 });
    
    return path;
  }
  
  // Get the full path
  public getPath(): Waypoint[] {
    return [...this.waypoints];
  }
  
  // Get the next waypoint for an entity at a specific index
  public getNextWaypoint(currentIndex: number): Waypoint | null {
    if (currentIndex + 1 < this.waypoints.length) {
      return this.waypoints[currentIndex + 1];
    }
    return null;
  }
  
  // Get the closest waypoint to a position
  public getClosestWaypoint(x: number, y: number): { waypoint: Waypoint; index: number } | null {
    let closestWaypoint: Waypoint | null = null;
    let closestIndex = -1;
    let closestDistance = Infinity;
    
    for (let i = 0; i < this.waypoints.length; i++) {
      const waypoint = this.waypoints[i];
      const distance = Math.sqrt(Math.pow(waypoint.x - x, 2) + Math.pow(waypoint.y - y, 2));
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestWaypoint = waypoint;
        closestIndex = i;
      }
    }
    
    if (closestWaypoint) {
      return { waypoint: closestWaypoint, index: closestIndex };
    }
    
    return null;
  }
  
  // Check if a position is at a waypoint
  public isAtWaypoint(x: number, y: number, waypointIndex: number, tolerance: number = 5): boolean {
    if (waypointIndex < 0 || waypointIndex >= this.waypoints.length) {
      return false;
    }
    
    const waypoint = this.waypoints[waypointIndex];
    const distance = Math.sqrt(Math.pow(waypoint.x - x, 2) + Math.pow(waypoint.y - y, 2));
    
    return distance <= tolerance;
  }
  
  // Get the total number of waypoints
  public getWaypointCount(): number {
    return this.waypoints.length;
  }
}