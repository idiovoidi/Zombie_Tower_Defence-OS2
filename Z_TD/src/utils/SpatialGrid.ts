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

export interface GridStats {
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  totalCells: number;
  occupiedCells: number;
  totalEntities: number;
  averageEntitiesPerCell: number;
  maxEntitiesInCell: number;
}

export class SpatialGrid<T extends SpatialEntity> {
  private cellSize: number;
  private width: number;
  private height: number;
  private cols: number;
  private rows: number;
  private grid: Map<number, Set<T>>;
  private entityToCell: Map<T, number>;

  // Cache for cell calculations
  private cellIndexCache: Map<T, number>;

  // Query result cache
  private queryCache: Map<string, { results: T[]; timestamp: number }>;
  private queryCacheDuration: number = 100; // Cache for ~6 frames (100ms) - more effective caching

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
    this.cellIndexCache = new Map();
    this.queryCache = new Map();
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

      // Invalidate query cache when grid changes
      this.queryCache.clear();
    }
  }

  /**
   * Batch update multiple entities at once
   * More efficient than calling update() individually for many entities
   * @param entities Array of entities to update
   */
  public batchUpdate(entities: T[]): void {
    const entitiesToUpdate: Array<{ entity: T; oldCell: number; newCell: number }> = [];

    // First pass: calculate new cells and identify entities that need updating
    for (const entity of entities) {
      const oldCellIndex = this.entityToCell.get(entity);
      if (oldCellIndex === undefined) {
        continue;
      }

      // Cache cell calculation
      let newCellIndex = this.cellIndexCache.get(entity);
      if (newCellIndex === undefined) {
        newCellIndex = this.getCellIndex(entity.position.x, entity.position.y);
        this.cellIndexCache.set(entity, newCellIndex);
      }

      // Only update if cell changed
      if (oldCellIndex !== newCellIndex) {
        entitiesToUpdate.push({ entity, oldCell: oldCellIndex, newCell: newCellIndex });
      }
    }

    // Second pass: batch remove from old cells
    for (const { entity, oldCell } of entitiesToUpdate) {
      const cell = this.grid.get(oldCell);
      if (cell) {
        cell.delete(entity);
        if (cell.size === 0) {
          this.grid.delete(oldCell);
        }
      }
    }

    // Third pass: batch insert into new cells
    for (const { entity, newCell } of entitiesToUpdate) {
      let cell = this.grid.get(newCell);
      if (!cell) {
        cell = new Set();
        this.grid.set(newCell, cell);
      }
      cell.add(entity);
      this.entityToCell.set(entity, newCell);
    }

    // Clear cell index cache after batch update
    this.cellIndexCache.clear();

    // Invalidate query cache if any entities were updated
    if (entitiesToUpdate.length > 0) {
      this.queryCache.clear();
    }
  }

  /**
   * Query entities within a circular range
   * @param x Center X coordinate
   * @param y Center Y coordinate
   * @param range Radius in pixels
   * @returns Array of entities within range (candidates from nearby cells, not distance-filtered)
   */
  public queryRange(x: number, y: number, range: number): T[] {
    // Check query cache
    const cacheKey = `${Math.round(x)},${Math.round(y)},${range}`;
    const cached = this.queryCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.queryCacheDuration) {
      return cached.results;
    }

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

    // Cache the results
    this.queryCache.set(cacheKey, { results, timestamp: now });

    return results;
  }

  /**
   * Query for the first entity that matches the filter
   * More efficient than queryRange when you only need one result
   * @param x Center X coordinate
   * @param y Center Y coordinate
   * @param range Radius in pixels
   * @param filter Optional filter function
   * @returns First matching entity, or null
   */
  public queryFirst(
    x: number,
    y: number,
    range: number,
    filter?: (entity: T) => boolean
  ): T | null {
    // Calculate which cells to check
    const minX = Math.max(0, x - range);
    const maxX = Math.min(this.width, x + range);
    const minY = Math.max(0, y - range);
    const maxY = Math.min(this.height, y + range);

    const minCol = Math.floor(minX / this.cellSize);
    const maxCol = Math.floor(maxX / this.cellSize);
    const minRow = Math.floor(minY / this.cellSize);
    const maxRow = Math.floor(maxY / this.cellSize);

    const rangeSq = range * range; // Use squared distance to avoid sqrt

    // Check all cells in range
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellIndex = row * this.cols + col;
        const cell = this.grid.get(cellIndex);

        if (cell) {
          // Check entities in this cell
          for (const entity of cell) {
            // Apply filter if provided
            if (filter && !filter(entity)) {
              continue;
            }

            // Check if entity is within range using squared distance
            const dx = entity.position.x - x;
            const dy = entity.position.y - y;
            const distSq = dx * dx + dy * dy;

            if (distSq <= rangeSq) {
              return entity; // Early exit on first match
            }
          }
        }
      }
    }

    return null;
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
    this.cellIndexCache.clear();
    this.queryCache.clear();
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
   * Get comprehensive grid statistics for debugging and performance monitoring
   */
  public getStats(): GridStats {
    const totalEntities = this.entityToCell.size;
    const occupiedCells = this.grid.size;
    const totalCells = this.cols * this.rows;
    const averageEntitiesPerCell = occupiedCells > 0 ? totalEntities / occupiedCells : 0;

    // Find max entities in a single cell
    let maxEntitiesInCell = 0;
    for (const cell of this.grid.values()) {
      if (cell.size > maxEntitiesInCell) {
        maxEntitiesInCell = cell.size;
      }
    }

    const stats: GridStats = {
      cellSize: this.cellSize,
      gridWidth: this.width,
      gridHeight: this.height,
      totalCells,
      occupiedCells,
      totalEntities,
      averageEntitiesPerCell: Math.round(averageEntitiesPerCell * 100) / 100,
      maxEntitiesInCell,
    };

    // Log warnings when grid becomes inefficient
    if (maxEntitiesInCell > 20) {
      console.warn(
        `⚠️ Spatial grid inefficient: ${maxEntitiesInCell} entities in one cell. Consider smaller cell size.`
      );
    }

    if (occupiedCells > totalCells * 0.8) {
      console.warn(
        `⚠️ Spatial grid highly occupied: ${occupiedCells}/${totalCells} cells. Consider larger grid or cell size.`
      );
    }

    return stats;
  }
}
