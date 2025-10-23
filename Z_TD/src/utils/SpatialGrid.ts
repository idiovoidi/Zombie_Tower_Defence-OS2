/**
 * Spatial Grid for efficient spatial queries
 * 
 * Divides 2D space into a grid of cells for O(1) insertion and O(k) range queries
 * where k is the number of entities in nearby cells (much smaller than total entities).
 * 
 * Performance:
 * - Insert: O(1)
 * - Remove: O(1) 
 * - Query: O(k) where k = entities in nearby cells
 * - Update: O(1) (remove + insert)
 * 
 * Typical improvement: O(n²) → O(n) for collision detection
 */

export interface SpatialEntity {
  position: { x: number; y: number };
  [key: string]: unknown;
}

export class SpatialGrid<T extends SpatialEntity> {
  private cellSize: number;
  private width: number;
  private height: number;
  private cols: number;
  private rows: number;
  private grid: Map<number, Set<T>>;
  private entityToCell: Map<T, number>;

  /**
   * Create a spatial grid
   * @param width World width in pixels
   * @param height World height in pixels
   * @param cellSize Size of each grid cell in pixels (larger = fewer cells, less precise)
   */
  constructor(width: number, height: number, cellSize: number = 128) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = new Map();
    this.entityToCell = new Map();
  }

  /**
   * Get cell index from world coordinates
   */
  private getCellIndex(x: number, y: number): number {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    // Clamp to grid bounds
    const clampedCol = Math.max(0, Math.min(col, this.cols - 1));
    const clampedRow = Math.max(0, Math.min(row, this.rows - 1));
    
    return clampedRow * this.cols + clampedCol;
  }

  /**
   * Get cell coordinates from cell index
   */
  private getCellCoords(cellIndex: number): { col: number; row: number } {
    const col = cellIndex % this.cols;
    const row = Math.floor(cellIndex / this.cols);
    return { col, row };
  }

  /**
   * Insert entity into the grid
   */
  public insert(entity: T): void {
    const cellIndex = this.getCellIndex(entity.position.x, entity.position.y);
    
    // Get or create cell
    let cell = this.grid.get(cellIndex);
    if (!cell) {
      cell = new Set();
      this.grid.set(cellIndex, cell);
    }
    
    cell.add(entity);
    this.entityToCell.set(entity, cellIndex);
  }

  /**
   * Remove entity from the grid
   */
  public remove(entity: T): void {
    const cellIndex = this.entityToCell.get(entity);
    if (cellIndex === undefined) {
      return;
    }
    
    const cell = this.grid.get(cellIndex);
    if (cell) {
      cell.delete(entity);
      
      // Clean up empty cells to save memory
      if (cell.size === 0) {
        this.grid.delete(cellIndex);
      }
    }
    
    this.entityToCell.delete(entity);
  }

  /**
   * Update entity position (remove from old cell, insert into new cell)
   */
  public update(entity: T): void {
    const oldCellIndex = this.entityToCell.get(entity);
    const newCellIndex = this.getCellIndex(entity.position.x, entity.position.y);
    
    // Only update if cell changed
    if (oldCellIndex !== newCellIndex) {
      this.remove(entity);
      this.insert(entity);
    }
  }

  /**
   * Query entities within a circular range
   * @param x Center X coordinate
   * @param y Center Y coordinate
   * @param range Radius in pixels
   * @returns Array of entities within range
   */
  public queryRange(x: number, y: number, range: number): T[] {
    const results: T[] = [];
    
    // Calculate which cells to check
    const minX = Math.max(0, x - range);
    const maxX = Math.min(this.width, x + range);
    const minY = Math.max(0, y - range);
    const maxY = Math.min(this.height, y + range);
    
    const minCol = Math.floor(minX / this.cellSize);
    const maxCol = Math.floor(maxX / this.cellSize);
    const minRow = Math.floor(minY / this.cellSize);
    const maxRow = Math.floor(maxY / this.cellSize);
    
    // Check all cells in range
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellIndex = row * this.cols + col;
        const cell = this.grid.get(cellIndex);
        
        if (cell) {
          // Add all entities from this cell
          for (const entity of cell) {
            results.push(entity);
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Query entities within range and find the closest one
   * @param x Center X coordinate
   * @param y Center Y coordinate
   * @param range Radius in pixels
   * @param filter Optional filter function
   * @returns Closest entity within range, or null
   */
  public queryClosest(
    x: number,
    y: number,
    range: number,
    filter?: (entity: T) => boolean
  ): T | null {
    const candidates = this.queryRange(x, y, range);
    
    let closest: T | null = null;
    let closestDistSq = range * range; // Use squared distance to avoid sqrt
    
    for (const entity of candidates) {
      // Apply filter if provided
      if (filter && !filter(entity)) {
        continue;
      }
      
      const dx = entity.position.x - x;
      const dy = entity.position.y - y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq <= closestDistSq) {
        closestDistSq = distSq;
        closest = entity;
      }
    }
    
    return closest;
  }

  /**
   * Clear all entities from the grid
   */
  public clear(): void {
    this.grid.clear();
    this.entityToCell.clear();
  }

  /**
   * Get total number of entities in the grid
   */
  public size(): number {
    return this.entityToCell.size;
  }

  /**
   * Get all entities in the grid
   */
  public getAllEntities(): T[] {
    return Array.from(this.entityToCell.keys());
  }

  /**
   * Get grid statistics for debugging
   */
  public getStats(): {
    totalEntities: number;
    activeCells: number;
    totalCells: number;
    avgEntitiesPerCell: number;
    cellSize: number;
  } {
    const totalEntities = this.entityToCell.size;
    const activeCells = this.grid.size;
    const totalCells = this.cols * this.rows;
    const avgEntitiesPerCell = activeCells > 0 ? totalEntities / activeCells : 0;
    
    return {
      totalEntities,
      activeCells,
      totalCells,
      avgEntitiesPerCell: Math.round(avgEntitiesPerCell * 100) / 100,
      cellSize: this.cellSize,
    };
  }
}

