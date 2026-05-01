/**
 * OptimizationValidator - Validates effectiveness of performance optimizations
 *
 * Measures and compares:
 * - Target finding performance (spatial grid vs linear search)
 * - Array rebuild operations (dirty flags vs always rebuild)
 * - Object allocation rates (pooling vs new allocations)
 *
 * Used to verify that optimizations provide measurable improvements.
 */

export interface TargetFindingMetrics {
  linearSearchTimeMs: number;
  spatialGridTimeMs: number;
  improvement: number; // Percentage improvement
  checksLinear: number; // Number of distance checks with linear search
  checksSpatial: number; // Number of distance checks with spatial grid
  checksReduction: number; // Percentage reduction in checks
}

export interface ArrayRebuildMetrics {
  totalFrames: number;
  rebuildsWithoutDirtyFlags: number;
  rebuildsWithDirtyFlags: number;
  rebuildsAvoided: number;
  avoidanceRate: number; // Percentage of rebuilds avoided
}

export interface AllocationMetrics {
  allocationsWithoutPooling: number;
  allocationsWithPooling: number;
  allocationReduction: number; // Percentage reduction
  poolReuseRate: number; // Percentage of objects reused from pool
}

export interface OptimizationReport {
  targetFinding: TargetFindingMetrics;
  arrayRebuilds: ArrayRebuildMetrics;
  allocations: AllocationMetrics;
  timestamp: number;
  summary: string;
}

/**
 * OptimizationValidator - Validates performance optimization effectiveness
 */
export class OptimizationValidator {
  private static enabled: boolean = false;

  // Target finding tracking
  private static targetFindingTests: number = 0;
  private static totalLinearSearchTime: number = 0;
  private static totalSpatialGridTime: number = 0;
  private static totalLinearChecks: number = 0;
  private static totalSpatialChecks: number = 0;

  // Array rebuild tracking
  private static frameCount: number = 0;
  private static towerArrayChanges: number = 0;
  private static zombieArrayChanges: number = 0;
  private static projectileArrayChanges: number = 0;

  // Allocation tracking
  private static allocationsTracked: number = 0;
  private static pooledAllocations: number = 0;
  private static newAllocations: number = 0;
  private static poolReuses: number = 0;

  /**
   * Enable validation tracking
   */
  public static enable(): void {
    this.enabled = true;
    this.reset();
    console.log('🔍 Optimization validation enabled');
  }

  /**
   * Disable validation tracking
   */
  public static disable(): void {
    this.enabled = false;
    console.log('🔍 Optimization validation disabled');
  }

  /**
   * Check if validation is enabled
   */
  public static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Reset all tracking data
   */
  public static reset(): void {
    this.targetFindingTests = 0;
    this.totalLinearSearchTime = 0;
    this.totalSpatialGridTime = 0;
    this.totalLinearChecks = 0;
    this.totalSpatialChecks = 0;

    this.frameCount = 0;
    this.towerArrayChanges = 0;
    this.zombieArrayChanges = 0;
    this.projectileArrayChanges = 0;

    this.allocationsTracked = 0;
    this.pooledAllocations = 0;
    this.newAllocations = 0;
    this.poolReuses = 0;
  }

  /**
   * Track a frame for array rebuild metrics
   */
  public static trackFrame(): void {
    if (!this.enabled) {
      return;
    }
    this.frameCount++;
  }

  /**
   * Track an array rebuild (when dirty flag is set)
   */
  public static trackArrayRebuild(arrayType: 'towers' | 'zombies' | 'projectiles'): void {
    if (!this.enabled) {
      return;
    }

    switch (arrayType) {
      case 'towers':
        this.towerArrayChanges++;
        break;
      case 'zombies':
        this.zombieArrayChanges++;
        break;
      case 'projectiles':
        this.projectileArrayChanges++;
        break;
    }
  }

  /**
   * Track an object allocation
   */
  public static trackAllocation(fromPool: boolean, reused: boolean = false): void {
    if (!this.enabled) {
      return;
    }

    this.allocationsTracked++;

    if (fromPool) {
      this.pooledAllocations++;
      if (reused) {
        this.poolReuses++;
      }
    } else {
      this.newAllocations++;
    }
  }

  /**
   * Measure target finding performance
   * Compares linear search vs spatial grid for the same scenario
   */
  public static measureTargetFinding<T extends { position: { x: number; y: number } }>(
    entities: T[],
    queryX: number,
    queryY: number,
    range: number,
    spatialGridQuery: () => T | null
  ): void {
    if (!this.enabled || entities.length === 0) {
      return;
    }

    this.targetFindingTests++;

    // Measure linear search (O(n))
    const linearStart = performance.now();
    let linearChecks = 0;
    let closestLinear: T | null = null;
    let closestDistSq = range * range;

    for (const entity of entities) {
      linearChecks++;
      const dx = entity.position.x - queryX;
      const dy = entity.position.y - queryY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= closestDistSq) {
        closestDistSq = distSq;
        closestLinear = entity;
      }
    }
    const linearTime = performance.now() - linearStart;

    // Measure spatial grid query (O(k))
    const spatialStart = performance.now();
    const closestSpatial = spatialGridQuery();
    const spatialTime = performance.now() - spatialStart;

    // Estimate spatial checks (entities in nearby cells)
    // This is an approximation - actual implementation would need to expose this
    const cellSize = 128; // From SpatialGrid default
    const cellsToCheck = Math.ceil((range * 2) / cellSize) ** 2;
    const avgEntitiesPerCell = entities.length / cellsToCheck;
    const spatialChecks = Math.min(Math.ceil(avgEntitiesPerCell * cellsToCheck), entities.length);

    // Accumulate metrics
    this.totalLinearSearchTime += linearTime;
    this.totalSpatialGridTime += spatialTime;
    this.totalLinearChecks += linearChecks;
    this.totalSpatialChecks += spatialChecks;

    // Verify results match (sanity check)
    if (closestLinear !== closestSpatial) {
      console.warn(
        '⚠️ Target finding results differ between linear and spatial grid (this may be expected due to filtering)'
      );
    }
  }

  /**
   * Generate target finding metrics
   */
  public static getTargetFindingMetrics(): TargetFindingMetrics {
    const avgLinearTime =
      this.targetFindingTests > 0 ? this.totalLinearSearchTime / this.targetFindingTests : 0;
    const avgSpatialTime =
      this.targetFindingTests > 0 ? this.totalSpatialGridTime / this.targetFindingTests : 0;
    const improvement =
      avgLinearTime > 0 ? ((avgLinearTime - avgSpatialTime) / avgLinearTime) * 100 : 0;

    const avgLinearChecks =
      this.targetFindingTests > 0 ? this.totalLinearChecks / this.targetFindingTests : 0;
    const avgSpatialChecks =
      this.targetFindingTests > 0 ? this.totalSpatialChecks / this.targetFindingTests : 0;
    const checksReduction =
      avgLinearChecks > 0 ? ((avgLinearChecks - avgSpatialChecks) / avgLinearChecks) * 100 : 0;

    return {
      linearSearchTimeMs: avgLinearTime,
      spatialGridTimeMs: avgSpatialTime,
      improvement,
      checksLinear: Math.round(avgLinearChecks),
      checksSpatial: Math.round(avgSpatialChecks),
      checksReduction,
    };
  }

  /**
   * Generate array rebuild metrics
   */
  public static getArrayRebuildMetrics(): ArrayRebuildMetrics {
    // Calculate total rebuilds that occurred
    const rebuildsWithDirtyFlags =
      this.towerArrayChanges + this.zombieArrayChanges + this.projectileArrayChanges;

    // Without dirty flags, we would rebuild every frame for each array type (3 arrays)
    const rebuildsWithoutDirtyFlags = this.frameCount * 3;

    // Calculate rebuilds avoided
    const rebuildsAvoided = rebuildsWithoutDirtyFlags - rebuildsWithDirtyFlags;
    const avoidanceRate =
      rebuildsWithoutDirtyFlags > 0 ? (rebuildsAvoided / rebuildsWithoutDirtyFlags) * 100 : 0;

    return {
      totalFrames: this.frameCount,
      rebuildsWithoutDirtyFlags,
      rebuildsWithDirtyFlags,
      rebuildsAvoided,
      avoidanceRate,
    };
  }

  /**
   * Generate allocation metrics
   */
  public static getAllocationMetrics(): AllocationMetrics {
    // Without pooling, all allocations would be new
    const allocationsWithoutPooling = this.allocationsTracked;

    // With pooling, we have a mix of new and reused
    const allocationsWithPooling = this.newAllocations;

    const allocationReduction =
      allocationsWithoutPooling > 0
        ? ((allocationsWithoutPooling - allocationsWithPooling) / allocationsWithoutPooling) * 100
        : 0;

    const poolReuseRate =
      this.pooledAllocations > 0 ? (this.poolReuses / this.pooledAllocations) * 100 : 0;

    return {
      allocationsWithoutPooling,
      allocationsWithPooling,
      allocationReduction,
      poolReuseRate,
    };
  }

  /**
   * Generate comprehensive optimization report
   */
  public static generateReport(): OptimizationReport {
    const targetFinding = this.getTargetFindingMetrics();
    const arrayRebuilds = this.getArrayRebuildMetrics();
    const allocations = this.getAllocationMetrics();

    // Generate summary
    const summaryLines: string[] = [];

    summaryLines.push('=== Optimization Effectiveness Report ===\n');

    // Target Finding
    summaryLines.push('Target Finding (Spatial Grid):');
    summaryLines.push(
      `  Linear Search: ${targetFinding.linearSearchTimeMs.toFixed(4)}ms avg (${targetFinding.checksLinear} checks)`
    );
    summaryLines.push(
      `  Spatial Grid:  ${targetFinding.spatialGridTimeMs.toFixed(4)}ms avg (${targetFinding.checksSpatial} checks)`
    );
    summaryLines.push(`  Improvement:   ${targetFinding.improvement.toFixed(1)}% faster`);
    summaryLines.push(`  Check Reduction: ${targetFinding.checksReduction.toFixed(1)}%\n`);

    // Array Rebuilds
    summaryLines.push('Array Rebuilds (Dirty Flags):');
    summaryLines.push(`  Total Frames:  ${arrayRebuilds.totalFrames}`);
    summaryLines.push(`  Without Flags: ${arrayRebuilds.rebuildsWithoutDirtyFlags} rebuilds`);
    summaryLines.push(`  With Flags:    ${arrayRebuilds.rebuildsWithDirtyFlags} rebuilds`);
    summaryLines.push(`  Avoided:       ${arrayRebuilds.rebuildsAvoided} rebuilds`);
    summaryLines.push(`  Avoidance Rate: ${arrayRebuilds.avoidanceRate.toFixed(1)}%\n`);

    // Allocations
    summaryLines.push('Object Allocations (Pooling):');
    summaryLines.push(`  Without Pooling: ${allocations.allocationsWithoutPooling} new objects`);
    summaryLines.push(`  With Pooling:    ${allocations.allocationsWithPooling} new objects`);
    summaryLines.push(`  Reduction:       ${allocations.allocationReduction.toFixed(1)}%`);
    summaryLines.push(`  Pool Reuse Rate: ${allocations.poolReuseRate.toFixed(1)}%\n`);

    // Overall assessment
    summaryLines.push('Overall Assessment:');
    const targetFindingGood = targetFinding.improvement > 50;
    const arrayRebuildsGood = arrayRebuilds.avoidanceRate > 80;
    const allocationsGood = allocations.allocationReduction > 70;

    summaryLines.push(
      `  Target Finding: ${targetFindingGood ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`
    );
    summaryLines.push(
      `  Array Rebuilds: ${arrayRebuildsGood ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`
    );
    summaryLines.push(`  Allocations:    ${allocationsGood ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);

    const summary = summaryLines.join('\n');

    return {
      targetFinding,
      arrayRebuilds,
      allocations,
      timestamp: Date.now(),
      summary,
    };
  }

  /**
   * Log optimization report to console
   */
  public static logReport(): void {
    if (!this.enabled) {
      console.log('🔍 Optimization validation is disabled');
      return;
    }

    const report = this.generateReport();
    console.log('\n' + report.summary);
  }

  /**
   * Export report data for analysis
   */
  public static exportReport(): OptimizationReport {
    return this.generateReport();
  }
}

// Debug console commands
declare global {
  interface Window {
    debugOptimizations: () => void;
    debugOptimizationsEnable: () => void;
    debugOptimizationsDisable: () => void;
  }
}

// Only attach debug commands in browser environment (not in tests)
if (typeof window !== 'undefined') {
  /**
   * Debug console command: Log optimization validation report
   * Usage: window.debugOptimizations() or debugOptimizations() in console
   */
  window.debugOptimizations = () => {
    console.log('🔍 Optimization Validation Report');
    OptimizationValidator.logReport();
  };

  /**
   * Debug console command: Enable optimization validation
   * Usage: window.debugOptimizationsEnable() or debugOptimizationsEnable() in console
   */
  window.debugOptimizationsEnable = () => {
    console.log('🔍 Enabling Optimization Validation');
    OptimizationValidator.enable();
  };

  /**
   * Debug console command: Disable optimization validation
   * Usage: window.debugOptimizationsDisable() or debugOptimizationsDisable() in console
   */
  window.debugOptimizationsDisable = () => {
    console.log('🔍 Disabling Optimization Validation');
    OptimizationValidator.disable();
  };
}
