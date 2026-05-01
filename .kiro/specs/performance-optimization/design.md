# Performance Optimization Design Document

## Overview

This design addresses performance degradation in the Z-TD tower defense game as waves progress. Analysis of the codebase reveals several performance bottlenecks:

1. **Memory accumulation** from Graphics objects not being properly destroyed
2. **Inefficient array operations** rebuilding references every frame
3. **Unoptimized collision detection** checking all zombies for every tower
4. **Excessive particle/effect creation** without proper limits
5. **Missing object pooling** causing frequent garbage collection

The design focuses on optimizing these areas while maintaining visual quality and gameplay mechanics.

## Architecture

### Performance Monitoring System

A new `PerformanceMonitor` utility will track frame times, memory usage, and entity counts:

```
PerformanceMonitor
├── Frame Time Tracking (per-system breakdown)
├── Memory Usage Tracking (heap size, growth rate)
├── Entity Count Tracking (zombies, projectiles, effects)
└── Warning System (threshold-based alerts)
```

### Optimized Update Loop

The game loop will be restructured to minimize redundant operations:

```
GameManager.update()
├── Check dirty flags (towers, zombies)
├── Update only changed arrays
├── Batch spatial grid updates
├── Update effects with early exit
└── Cleanup expired objects
```

### Resource Lifecycle Management

Enhanced cleanup coordination between managers:

```
ResourceCleanupManager
├── Wave Cleanup (projectiles, effects, particles)
├── Game Cleanup (all entities, reset state)
├── Persistent Effect Tracking (fire pools, explosions)
└── Automatic Expiration (timeout-based removal)
```

## Components and Interfaces

### 1. Performance Monitor

**Location:** `src/utils/PerformanceMonitor.ts`

**Interface:**

```typescript
class PerformanceMonitor {
  // Start tracking a system's execution time
  static startMeasure(systemName: string): void;

  // End tracking and record duration
  static endMeasure(systemName: string): void;

  // Get performance metrics
  static getMetrics(): PerformanceMetrics;

  // Log warnings for slow systems
  static checkThresholds(): void;

  // Track entity counts
  static trackEntityCount(type: string, count: number): void;

  // Get memory usage
  static getMemoryUsage(): MemoryInfo;
}

interface PerformanceMetrics {
  frameTimes: Map<string, number[]>; // Last 60 frames per system
  averageFrameTime: number;
  entityCounts: Map<string, number>;
  memoryUsage: number;
  warnings: string[];
}
```

**Responsibilities:**

- Track execution time for each manager's update method
- Monitor entity counts (zombies, projectiles, effects, corpses)
- Detect performance degradation and log warnings
- Provide metrics for debugging and optimization

### 2. Object Pool System

**Location:** `src/utils/ObjectPool.ts`

**Interface:**

```typescript
class ObjectPool<T> {
  constructor(factory: () => T, reset: (obj: T) => void, maxSize: number);

  // Get object from pool or create new
  acquire(): T;

  // Return object to pool
  release(obj: T): void;

  // Clear all pooled objects
  clear(): void;

  // Get pool statistics
  getStats(): PoolStats;
}

interface PoolStats {
  active: number;
  available: number;
  created: number;
  reused: number;
}
```

**Pooled Objects:**

- Graphics objects for common effects
- Particle objects for blood/debris
- Temporary calculation objects (vectors, bounds)

### 3. Enhanced Spatial Grid

**Location:** `src/utils/SpatialGrid.ts` (existing, needs optimization)

**Optimizations:**

- Batch update operations instead of per-entity updates
- Cache grid cell calculations
- Use dirty flags to skip unchanged entities
- Optimize query radius calculations

**Interface Additions:**

```typescript
class SpatialGrid<T> {
  // Existing methods...

  // Batch update multiple entities at once
  batchUpdate(entities: T[]): void;

  // Query with early exit when first match found
  queryFirst(x: number, y: number, radius: number, filter?: (item: T) => boolean): T | null;

  // Get statistics for debugging
  getStats(): GridStats;
}
```

### 4. Optimized Effect Manager

**Location:** `src/effects/EffectManager.ts` (existing, needs enhancement)

**Optimizations:**

- Implement strict limits on effect counts
- Use object pooling for frequently created effects
- Batch similar graphics operations
- Early exit for invisible/off-screen effects

**Interface Additions:**

```typescript
class EffectManager {
  // Existing methods...

  // Set maximum counts for each effect type
  setLimits(limits: EffectLimits): void;

  // Enable/disable effect pooling
  enablePooling(enabled: boolean): void;

  // Get current effect statistics
  getStats(): EffectStats;
}

interface EffectLimits {
  maxShellCasings: number;
  maxMuzzleFlashes: number;
  maxBulletTrails: number;
  maxImpactFlashes: number;
  maxScopeGlints: number;
}
```

### 5. Optimized Particle Systems

**Location:** `src/utils/BloodParticleSystem.ts` (existing, needs optimization)

**Optimizations:**

- Implement particle pooling
- Limit maximum active particles (200 max)
- Use simplified physics for distant particles
- Batch particle rendering

**Interface Additions:**

```typescript
class BloodParticleSystem {
  // Existing methods...

  // Set maximum particle count
  setMaxParticles(max: number): void;

  // Enable particle pooling
  enablePooling(enabled: boolean): void;

  // Get particle statistics
  getStats(): ParticleStats;
}
```

### 6. Dirty Flag System

**Location:** Integrated into existing managers

**Implementation:**

- Add dirty flags to TowerPlacementManager (already exists)
- Add dirty flags to ZombieManager (already exists)
- Add dirty flags to ProjectileManager (new)
- Use flags to skip unnecessary array rebuilds

**Pattern:**

```typescript
class Manager {
  private entities: Entity[] = [];
  private entitiesDirty: boolean = false;

  addEntity(entity: Entity): void {
    this.entities.push(entity);
    this.entitiesDirty = true; // Mark as changed
  }

  removeEntity(index: number): void {
    this.entities.splice(index, 1);
    this.entitiesDirty = true; // Mark as changed
  }

  areEntitiesDirty(): boolean {
    return this.entitiesDirty;
  }

  clearEntitiesDirty(): void {
    this.entitiesDirty = false;
  }
}
```

## Data Models

### Performance Metrics

```typescript
interface PerformanceMetrics {
  timestamp: number;
  frameTime: number;
  systemTimes: {
    zombieManager: number;
    towerCombat: number;
    projectileManager: number;
    effectManager: number;
    particleSystem: number;
    corpseManager: number;
  };
  entityCounts: {
    zombies: number;
    towers: number;
    projectiles: number;
    effects: number;
    particles: number;
    corpses: number;
    persistentEffects: number;
  };
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  warnings: string[];
}
```

### Pool Statistics

```typescript
interface PoolStats {
  poolName: string;
  maxSize: number;
  active: number;
  available: number;
  totalCreated: number;
  totalReused: number;
  reuseRate: number; // Percentage
}
```

### Spatial Grid Statistics

```typescript
interface GridStats {
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  totalCells: number;
  occupiedCells: number;
  totalEntities: number;
  averageEntitiesPerCell: number;
  maxEntitiesInCell: number;
}
```

## Error Handling

### Memory Leak Detection

```typescript
// Warn when entity counts exceed thresholds
if (persistentEffects > 20) {
  console.warn('⚠️ High persistent effect count:', persistentEffects);
  PerformanceMonitor.logWarning('Possible memory leak: persistent effects');
}

if (timers > 20) {
  console.warn('⚠️ High timer count:', timers);
  PerformanceMonitor.logWarning('Possible memory leak: timers');
}
```

### Performance Degradation Detection

```typescript
// Warn when frame times exceed thresholds
if (frameTime > 33) {
  // Below 30 FPS
  console.warn('⚠️ Low frame rate:', Math.round(1000 / frameTime), 'FPS');
  PerformanceMonitor.logWarning('Performance degradation detected');
}

// Warn when system update times are excessive
if (systemTime > 5) {
  console.warn(`⚠️ Slow system: ${systemName} took ${systemTime}ms`);
  PerformanceMonitor.logWarning(`Slow system: ${systemName}`);
}
```

### Cleanup Verification

```typescript
// Verify cleanup completed successfully
const afterCleanup = ResourceCleanupManager.getState();
if (afterCleanup.persistentEffects > 5) {
  console.error('❌ Cleanup failed: persistent effects remain');
  // Force cleanup
  ResourceCleanupManager.cleanupPersistentEffects();
}
```

## Testing Strategy

### Performance Benchmarks

**Test Scenarios:**

1. **Wave 1-5:** Baseline performance (should be 60 FPS)
2. **Wave 10:** Medium load (should maintain 45+ FPS)
3. **Wave 20:** Heavy load (should maintain 40+ FPS)
4. **Extended Play:** 30+ waves (memory should stabilize below 500 MB)

**Metrics to Track:**

- Frame time per system
- Memory usage per wave
- Entity counts over time
- Garbage collection frequency
- Pool reuse rates

### Memory Leak Tests

**Test Procedure:**

1. Start game and complete 5 waves
2. Record memory usage
3. Complete 5 more waves
4. Verify memory growth is less than 50 MB
5. Repeat for 20+ waves

**Expected Results:**

- Memory stabilizes after wave 5
- Growth rate less than 10 MB per wave
- No continuous memory growth
- Cleanup reduces memory by 80%+

### Optimization Validation

**Before/After Comparisons:**

1. **Target Finding:** Measure time to find targets for 10 towers with 50 zombies
   - Before: O(n) linear search = ~500 checks
   - After: O(k) spatial grid = ~50 checks (10x improvement)

2. **Array Rebuilds:** Count unnecessary array operations per frame
   - Before: 2 rebuilds per frame (towers + zombies)
   - After: 0-2 rebuilds only when dirty (90% reduction)

3. **Effect Creation:** Track object allocations per second
   - Before: 100+ allocations/sec (no pooling)
   - After: 10-20 allocations/sec (80% reduction)

### Visual Quality Tests

**Verification:**

- All visual effects remain visible and impactful
- No noticeable reduction in particle counts
- Explosions, fire, lightning effects unchanged
- Blood splatter and corpses still appear
- Muzzle flashes and shell casings present

**Acceptance Criteria:**

- Players cannot visually distinguish optimized version
- All gameplay mechanics function identically
- Visual feedback remains satisfying

### Stress Tests

**Extreme Scenarios:**

1. **Spawn 100 zombies simultaneously**
   - Verify frame rate stays above 30 FPS
   - Verify memory doesn't spike excessively

2. **Place 20 towers firing continuously**
   - Verify projectile system handles load
   - Verify effect system doesn't overflow

3. **Run game for 50+ waves**
   - Verify no memory leaks
   - Verify performance remains stable

## Implementation Notes

### Priority Order

1. **High Priority (Critical Performance Impact):**
   - Fix memory leaks in persistent effects
   - Implement dirty flags for array operations
   - Optimize spatial grid queries
   - Add strict limits to particle systems

2. **Medium Priority (Significant Impact):**
   - Implement object pooling for effects
   - Add performance monitoring
   - Optimize corpse management
   - Batch graphics operations

3. **Low Priority (Polish):**
   - Add detailed performance metrics
   - Implement advanced pooling strategies
   - Optimize off-screen culling
   - Add performance profiling UI

### Backward Compatibility

All optimizations must maintain:

- Existing gameplay mechanics
- Visual effect quality
- API compatibility with existing code
- Save/load functionality (if applicable)

### Configuration

Add performance settings to `DevConfig`:

```typescript
export const PerformanceConfig = {
  ENABLE_MONITORING: true,
  ENABLE_POOLING: true,
  MAX_PARTICLES: 200,
  MAX_CORPSES: 50,
  MAX_SHELL_CASINGS: 50,
  MAX_BULLET_TRAILS: 20,
  SPATIAL_GRID_CELL_SIZE: 128,
  LOG_SLOW_SYSTEMS: true,
  SLOW_SYSTEM_THRESHOLD_MS: 5,
};
```

### Debugging Tools

Add console commands for testing:

```typescript
// Log current performance state
window.debugPerformance = () => {
  PerformanceMonitor.logMetrics();
  ResourceCleanupManager.logState();
  EffectCleanupManager.logState();
};

// Force cleanup
window.debugCleanup = () => {
  ResourceCleanupManager.cleanupWaveResources(managers);
};

// Toggle performance monitoring
window.debugToggleMonitoring = () => {
  PerformanceMonitor.toggle();
};
```

## Performance Targets

### Frame Rate Targets

- **Wave 1-5:** 60 FPS (16.67ms per frame)
- **Wave 6-10:** 50+ FPS (20ms per frame)
- **Wave 11-20:** 45+ FPS (22ms per frame)
- **Wave 20+:** 40+ FPS (25ms per frame)

### Memory Targets

- **Wave 1:** 300-350 MB
- **Wave 5:** 350-400 MB
- **Wave 10:** 400-450 MB
- **Wave 20+:** 450-500 MB (stable)

### System Time Budgets (per frame)

- **ZombieManager:** 3ms max
- **TowerCombatManager:** 4ms max
- **ProjectileManager:** 2ms max
- **EffectManager:** 2ms max
- **ParticleSystem:** 1ms max
- **CorpseManager:** 1ms max
- **Other Systems:** 3ms max
- **Total:** 16ms (60 FPS)

## Optimization Techniques Summary

1. **Spatial Partitioning:** Reduce collision checks from O(n²) to O(k)
2. **Dirty Flags:** Eliminate unnecessary array rebuilds (90% reduction)
3. **Object Pooling:** Reduce garbage collection overhead (80% reduction)
4. **Strict Limits:** Prevent unbounded entity growth
5. **Batch Operations:** Reduce per-entity overhead
6. **Early Exit:** Skip unnecessary calculations
7. **Memory Cleanup:** Ensure all Graphics objects are destroyed
8. **Timer Tracking:** Prevent orphaned intervals/timeouts
