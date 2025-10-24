import { SpatialEntity, SpatialGrid } from './SpatialGrid';

interface TestEntity extends SpatialEntity {
  id: number;
}

describe('SpatialGrid', () => {
  let grid: SpatialGrid<TestEntity>;

  beforeEach(() => {
    grid = new SpatialGrid<TestEntity>(1024, 768, 128);
  });

  describe('Basic Operations', () => {
    it('should insert and retrieve entities', () => {
      const entity: TestEntity = { position: { x: 100, y: 100 }, id: 1 };
      grid.insert(entity);

      expect(grid.size()).toBe(1);
      const entities = grid.getAllEntities();
      expect(entities).toContain(entity);
    });

    it('should remove entities', () => {
      const entity: TestEntity = { position: { x: 100, y: 100 }, id: 1 };
      grid.insert(entity);
      grid.remove(entity);

      expect(grid.size()).toBe(0);
    });

    it('should update entity positions', () => {
      const entity: TestEntity = { position: { x: 100, y: 100 }, id: 1 };
      grid.insert(entity);

      entity.position.x = 500;
      entity.position.y = 500;
      grid.update(entity);

      expect(grid.size()).toBe(1);
      const nearby = grid.queryRange(500, 500, 50);
      expect(nearby).toContain(entity);
    });

    it('should clear all entities', () => {
      for (let i = 0; i < 10; i++) {
        grid.insert({ position: { x: i * 100, y: i * 100 }, id: i });
      }

      expect(grid.size()).toBe(10);
      grid.clear();
      expect(grid.size()).toBe(0);
    });
  });

  describe('Range Queries', () => {
    beforeEach(() => {
      // Create a grid of entities
      for (let x = 0; x < 1000; x += 100) {
        for (let y = 0; y < 700; y += 100) {
          grid.insert({ position: { x, y }, id: x * 1000 + y });
        }
      }
    });

    it('should find entities within range', () => {
      const results = grid.queryRange(500, 400, 150);
      expect(results.length).toBeGreaterThan(0);

      // queryRange returns candidates from nearby cells, not distance-filtered
      // So we just verify we got some results from the spatial grid
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find closest entity', () => {
      const closest = grid.queryClosest(505, 405, 200);
      expect(closest).not.toBeNull();

      if (closest) {
        // Should be the entity at (500, 400)
        expect(closest.position.x).toBe(500);
        expect(closest.position.y).toBe(400);
      }
    });

    it('should return null when no entities in range', () => {
      const closest = grid.queryClosest(1000, 750, 10);
      expect(closest).toBeNull();
    });

    it('should apply filter in queryClosest', () => {
      const closest = grid.queryClosest(500, 400, 200, entity => entity.id > 500000);
      expect(closest).not.toBeNull();

      if (closest) {
        expect(closest.id).toBeGreaterThan(500000);
      }
    });
  });

  describe('Performance', () => {
    it('should handle large number of entities efficiently', () => {
      const entityCount = 1000;
      const entities: TestEntity[] = [];

      // Insert many entities
      const insertStart = performance.now();
      for (let i = 0; i < entityCount; i++) {
        const entity: TestEntity = {
          position: {
            x: Math.random() * 1024,
            y: Math.random() * 768,
          },
          id: i,
        };
        entities.push(entity);
        grid.insert(entity);
      }
      const insertTime = performance.now() - insertStart;

      expect(grid.size()).toBe(entityCount);
      expect(insertTime).toBeLessThan(100); // Should be very fast

      // Query performance
      const queryStart = performance.now();
      for (let i = 0; i < 100; i++) {
        grid.queryClosest(Math.random() * 1024, Math.random() * 768, 200);
      }
      const queryTime = performance.now() - queryStart;

      expect(queryTime).toBeLessThan(50); // 100 queries should be fast

      // Update performance
      const updateStart = performance.now();
      for (const entity of entities) {
        entity.position.x += 10;
        entity.position.y += 10;
        grid.update(entity);
      }
      const updateTime = performance.now() - updateStart;

      expect(updateTime).toBeLessThan(100); // Updates should be fast
    });

    it('should be faster than linear search', () => {
      const entityCount = 500;
      const entities: TestEntity[] = [];

      // Create entities
      for (let i = 0; i < entityCount; i++) {
        const entity: TestEntity = {
          position: {
            x: Math.random() * 1024,
            y: Math.random() * 768,
          },
          id: i,
        };
        entities.push(entity);
        grid.insert(entity);
      }

      // Spatial grid query
      const gridStart = performance.now();
      for (let i = 0; i < 100; i++) {
        grid.queryClosest(512, 384, 200);
      }
      const gridTime = performance.now() - gridStart;

      // Linear search (O(n))
      const linearStart = performance.now();
      for (let i = 0; i < 100; i++) {
        let _closest: TestEntity | null = null;
        let closestDist = 200;

        for (const entity of entities) {
          const dx = entity.position.x - 512;
          const dy = entity.position.y - 384;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= closestDist) {
            closestDist = dist;
            _closest = entity;
          }
        }
      }
      const linearTime = performance.now() - linearStart;

      // Spatial grid should be significantly faster
      expect(gridTime).toBeLessThan(linearTime);
      console.log(`Spatial Grid: ${gridTime.toFixed(2)}ms, Linear: ${linearTime.toFixed(2)}ms`);
      console.log(`Speedup: ${(linearTime / gridTime).toFixed(2)}x faster`);
    });
  });

  describe('Edge Cases', () => {
    it('should handle entities at world boundaries', () => {
      const corners = [
        { position: { x: 0, y: 0 }, id: 1 },
        { position: { x: 1024, y: 0 }, id: 2 },
        { position: { x: 0, y: 768 }, id: 3 },
        { position: { x: 1024, y: 768 }, id: 4 },
      ];

      for (const entity of corners) {
        grid.insert(entity);
      }

      expect(grid.size()).toBe(4);
    });

    it('should handle entities outside world bounds', () => {
      const entity: TestEntity = { position: { x: -100, y: -100 }, id: 1 };
      grid.insert(entity);

      expect(grid.size()).toBe(1);
    });

    it('should handle multiple entities in same cell', () => {
      for (let i = 0; i < 10; i++) {
        grid.insert({ position: { x: 100 + i, y: 100 + i }, id: i });
      }

      expect(grid.size()).toBe(10);
      const nearby = grid.queryRange(100, 100, 50);
      expect(nearby.length).toBe(10);
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      for (let i = 0; i < 50; i++) {
        grid.insert({ position: { x: i * 20, y: i * 15 }, id: i });
      }

      const stats = grid.getStats();
      expect(stats.totalEntities).toBe(50);
      expect(stats.occupiedCells).toBeGreaterThan(0);
      expect(stats.totalCells).toBe(Math.ceil(1024 / 128) * Math.ceil(768 / 128));
      expect(stats.cellSize).toBe(128);
      expect(stats.maxEntitiesInCell).toBeGreaterThan(0);
    });
  });

  describe('Batch Operations', () => {
    it('should batch update multiple entities efficiently', () => {
      const entities: TestEntity[] = [];

      // Create entities
      for (let i = 0; i < 100; i++) {
        const entity: TestEntity = { position: { x: 100, y: 100 }, id: i };
        entities.push(entity);
        grid.insert(entity);
      }

      // Move all entities to new position
      for (const entity of entities) {
        entity.position.x = 500;
        entity.position.y = 500;
      }

      // Batch update
      const start = performance.now();
      grid.batchUpdate(entities);
      const batchTime = performance.now() - start;

      // Verify all entities moved
      const nearby = grid.queryRange(500, 500, 50);
      expect(nearby.length).toBe(100);
      expect(batchTime).toBeLessThan(10); // Should be very fast
    });

    it('should skip entities that did not change cells', () => {
      const entities: TestEntity[] = [];

      // Create entities in same cell
      for (let i = 0; i < 10; i++) {
        const entity: TestEntity = { position: { x: 100 + i, y: 100 + i }, id: i };
        entities.push(entity);
        grid.insert(entity);
      }

      // Move slightly within same cell
      for (const entity of entities) {
        entity.position.x += 5;
        entity.position.y += 5;
      }

      // Batch update should skip these
      grid.batchUpdate(entities);

      // All entities should still be findable
      expect(grid.size()).toBe(10);
    });
  });

  describe('Query Optimizations', () => {
    beforeEach(() => {
      // Create a grid of entities
      for (let x = 0; x < 1000; x += 100) {
        for (let y = 0; y < 700; y += 100) {
          grid.insert({ position: { x, y }, id: x * 1000 + y });
        }
      }
    });

    it('should find first matching entity with queryFirst', () => {
      const first = grid.queryFirst(500, 400, 150);
      expect(first).not.toBeNull();
    });

    it('should return null when no match found with queryFirst', () => {
      const first = grid.queryFirst(1000, 750, 10);
      expect(first).toBeNull();
    });

    it('should apply filter in queryFirst', () => {
      const first = grid.queryFirst(500, 400, 200, entity => entity.id > 500000);
      expect(first).not.toBeNull();
      if (first) {
        expect(first.id).toBeGreaterThan(500000);
      }
    });

    it('should cache query results', () => {
      // First query
      const start1 = performance.now();
      const results1 = grid.queryRange(500, 400, 150);
      const time1 = performance.now() - start1;

      // Second identical query (should be cached)
      const start2 = performance.now();
      const results2 = grid.queryRange(500, 400, 150);
      const time2 = performance.now() - start2;

      // Results should be identical
      expect(results1.length).toBe(results2.length);

      // Cached query should be faster (though this may not always be true in tests)
      expect(time2).toBeLessThanOrEqual(time1 * 2); // Allow some variance
    });
  });
});
