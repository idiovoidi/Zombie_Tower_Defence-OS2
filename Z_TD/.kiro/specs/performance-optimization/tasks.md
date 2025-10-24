# Implementation Plan

- [x] 1. Create Performance Monitoring System
  - Create `PerformanceMonitor` utility class to track frame times, memory usage, and entity counts
  - Implement methods for starting/ending measurements, tracking entity counts, and logging warnings
  - Add threshold-based warning system for slow systems and high entity counts
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Implement Object Pooling System
  - [x] 2.1 Create generic ObjectPool class
    - Implement factory pattern for object creation and reset
    - Add acquire/release methods with automatic pool management
    - Implement pool statistics tracking (active, available, reuse rate)
    - _Requirements: 6.4_

  - [x] 2.2 Apply pooling to Graphics objects
    - Create pools for common effect graphics (circles, rectangles, lines)
    - Modify effect creation to use pooled graphics
    - Ensure proper reset when objects are released back to pool
    - _Requirements: 7.4_

  - [x] 2.3 Apply pooling to particle objects
    - Create pool for blood particle objects
    - Modify BloodParticleSystem to use pooled particles
    - Implement particle reset logic for reuse
    - _Requirements: 6.4, 7.3_

- [x] 3. Optimize Spatial Grid System
  - [x] 3.1 Implement batch update operations
    - Add `batchUpdate()` method to process multiple entities at once
    - Cache grid cell calculations to avoid redundant math
    - Use dirty flags to skip unchanged entities
    - _Requirements: 5.3_

  - [x] 3.2 Optimize query operations
    - Implement `queryFirst()` for early exit when first match is found
    - Optimize radius calculations with squared distance comparisons
    - Add query result caching for frequently accessed areas
    - _Requirements: 5.1, 5.2_

  - [x] 3.3 Add spatial grid statistics
    - Implement `getStats()` method for debugging
    - Track occupied cells, entities per cell, and query performance
    - Log warnings when grid becomes inefficient
    - _Requirements: 3.1, 3.3_

- [x] 4. Enhance Effect Manager with Limits and Pooling
  - [x] 4.1 Implement strict effect limits
    - Add configurable limits for each effect type
    - Implement oldest-first removal when limits are reached

    - Ensure limits prevent unbounded growth
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 4.2 Integrate object pooling
    - Apply pooling to shell casings, muzzle flashes, and bullet trails
    - Modify effect creation to acquire from pools
    - Ensure effects are released back to pools when destroyed
    - _Requirements: 6.4, 7.4_

  - [x] 4.3 Add effect statistics tracking
    - Implement `getStats()` method for current effect counts
    - Track pool reuse rates and allocation counts
    - Log warnings when effect counts are high
    - _Requirements: 3.3, 3.4_

- [x] 5. Optimize Particle Systems
  - [x] 5.1 Implement particle limits
    - Add maximum particle count (200) to BloodParticleSystem
    - Remove oldest particles when limit is reached
    - Ensure particle creation respects limits
    - _Requirements: 7.3_

  - [x] 5.2 Add particle pooling
    - Integrate ObjectPool for particle reuse
    - Modify particle creation to use pooled objects
    - Implement particle reset for proper reuse
    - _Requirements: 6.4_
  - [x] 5.3 Optimize particle physics
    - Use simplified physics for distant particles
    - Skip updates for off-screen particles
    - Batch particle rendering operations
    - _Requirements: 7.4_

- [x] 6. Implement Dirty Flag Optimizations
  - [x] 6.1 Add dirty flags to ProjectileManager
    - Add `projectilesDirty` flag to track array changes
    - Set flag when projectiles are added or removed
    - Provide methods to check and clear dirty flag
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 6.2 Optimize GameManager update loop
    - Check dirty flags before rebuilding arrays
    - Only update combat manager when arrays change
    - Skip unnecessary spatial grid rebuilds
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 6.3 Verify existing dirty flag usage
    - Ensure TowerPlacementManager dirty flags work correctly
    - Ensure ZombieManager dirty flags work correctly
    - Add logging to verify flags prevent unnecessary rebuilds
    - _Requirements: 6.1, 6.2, 6.3_

- [-] 7. Enhance Memory Cleanup Systems


  - [x] 7.1 Audit Graphics object destruction


    - Search for all Graphics object creation in codebase
    - Verify each has corresponding destroy() call
    - Add missing destroy() calls where needed
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 7.2 Verify persistent effect cleanup
    - Ensure all persistent effects are registered with ResourceCleanupManager
    - Verify effects are unregistered when they expire naturally
    - Test cleanup during wave transitions
    - _Requirements: 4.2, 4.3_
  - [ ] 7.3 Optimize corpse cleanup
    - Verify corpse limit (50) is enforced
    - Ensure oldest corpses are removed when limit reached
    - Verify corpse Graphics objects are properly destroyed
    - _Requirements: 7.1, 7.2_
  - [ ] 7.4 Add cleanup verification
    - Implement post-cleanup state checks
    - Log warnings if cleanup fails to remove resources
    - Add forced cleanup fallback for stuck resources
    - _Requirements: 2.5, 4.3_

- [ ] 8. Integrate Performance Monitoring

  - [ ] 8.1 Add monitoring to GameManager
    - Wrap each manager update with performance measurements
    - Track total frame time and per-system times
    - Log warnings when systems exceed time budgets
    - _Requirements: 3.1, 3.2_
  - [ ] 8.2 Add entity count tracking
    - Track zombies, towers, projectiles, effects, particles, corpses
    - Update counts each frame
    - Log warnings when counts exceed thresholds
    - _Requirements: 3.3, 3.4, 3.5_
  - [ ] 8.3 Add memory usage tracking
    - Track heap usage each frame
    - Calculate memory growth rate per wave
    - Log warnings when memory exceeds targets
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ] 8.4 Create debug console commands
    - Add `window.debugPerformance()` to log current metrics
    - Add `window.debugCleanup()` to force cleanup
    - Add `window.debugToggleMonitoring()` to enable/disable monitoring
    - _Requirements: 3.1_

- [ ] 9. Add Performance Configuration
  - Create `PerformanceConfig` in DevConfig with tunable parameters
  - Add settings for max particles, corpses, effects, and grid cell size
  - Add flags to enable/disable monitoring and pooling
  - Add threshold values for warnings and performance targets
  - _Requirements: 3.1, 7.1, 7.2, 7.3_

- [ ] 10. Performance Testing and Validation
  - [ ]\* 10.1 Create performance benchmark tests
    - Test frame rates at waves 1, 5, 10, 20
    - Verify frame rates meet targets (60, 50, 45, 40 FPS)
    - Test with varying entity counts
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ]\* 10.2 Create memory leak tests
    - Run game for 20+ waves and track memory
    - Verify memory stabilizes below 500 MB
    - Verify cleanup reduces memory by 80%+
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]\* 10.3 Validate optimization effectiveness
    - Measure target finding performance (before/after)
    - Count array rebuild operations (before/after)
    - Track object allocation rates (before/after)
    - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.4_
  - [ ]\* 10.4 Verify visual quality maintained
    - Manually test all visual effects are present
    - Verify explosions, fire, lightning effects unchanged
    - Verify blood splatter and corpses appear correctly
    - Verify muzzle flashes and shell casings present
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]\* 10.5 Run stress tests
    - Test with 100 zombies spawned simultaneously
    - Test with 20 towers firing continuously
    - Run game for 50+ waves to verify stability
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 11. Documentation and Cleanup
  - [ ]\* 11.1 Update performance documentation
    - Document new PerformanceMonitor API
    - Document ObjectPool usage patterns
    - Document performance targets and budgets
    - _Requirements: 3.1_
  - [ ]\* 11.2 Add inline code comments
    - Comment performance-critical sections
    - Explain optimization techniques used
    - Document why specific limits were chosen
    - _Requirements: 3.1_
  - [ ]\* 11.3 Create performance tuning guide
    - Document how to adjust performance settings
    - Explain trade-offs between quality and performance
    - Provide troubleshooting tips for performance issues
    - _Requirements: 3.1_
