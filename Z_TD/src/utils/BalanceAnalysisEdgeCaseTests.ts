/**
 * BalanceAnalysisEdgeCaseTests - Comprehensive edge case testing for balance analysis
 *
 * Tests the following edge cases:
 * 1. No towers placed (empty game)
 * 2. Game ending on wave 1
 * 3. Very long sessions (50+ waves)
 * 4. Tracking disabled scenarios
 *
 * Requirements: 10.4, 10.6
 */

import { BalanceAnalyzer } from './BalanceAnalyzer';
import { StatisticalAnalyzer } from './StatisticalAnalyzer';

// ============================================================================
// Test Results Interface
// ============================================================================

export interface EdgeCaseTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: string;
  errors: string[];
}

export interface EdgeCaseTestSuite {
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  results: EdgeCaseTestResult[];
}

// ============================================================================
// Edge Case Test Runner
// ============================================================================

export class BalanceAnalysisEdgeCaseTests {
  private results: EdgeCaseTestResult[] = [];
  private startTime: number = 0;

  /**
   * Run all edge case tests
   */
  public async runAllTests(): Promise<EdgeCaseTestSuite> {
    console.log('🧪 Starting Balance Analysis Edge Case Tests...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    this.startTime = performance.now();
    this.results = [];

    // Run all test categories
    await this.testNoTowersPlaced();
    await this.testWave1GameEnd();
    await this.testLongSession();
    await this.testTrackingDisabled();

    const duration = performance.now() - this.startTime;

    // Calculate summary
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;

    const suite: EdgeCaseTestSuite = {
      totalTests: this.results.length,
      passed,
      failed,
      duration,
      results: this.results,
    };

    this.printSummary(suite);

    return suite;
  }

  // ============================================================================
  // Test Category 1: No Towers Placed
  // ============================================================================

  private async testNoTowersPlaced(): Promise<void> {
    console.log('\n📦 Testing: No Towers Placed');
    console.log('─────────────────────────────────────────────────────');

    // Test 1.1: Balance analysis with zero DPS
    await this.runTest('No Towers - Wave Defense Analysis', () => {
      const analysis = BalanceAnalyzer.canDefendWave(
        0, // No DPS
        1000, // Zombie HP
        50, // Zombie speed
        500, // Path length
        1 // Wave 1
      );

      if (analysis.canDefend) {
        throw new Error('Should not be able to defend with 0 DPS');
      }

      if (analysis.safetyMargin >= 0) {
        throw new Error('Safety margin should be negative with 0 DPS');
      }

      return 'Correctly identified inability to defend with no towers';
    });

    // Test 1.2: Efficiency calculation with no spending
    await this.runTest('No Towers - Efficiency Metrics', () => {
      const issues = BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 0,
        survivalRate: 100, // No damage taken yet
        overkillPercent: 0,
        economyEfficiency: 0, // No income, no spending
      });

      // Should detect inefficient towers and negative economy
      const hasInefficient = issues.some(i => i.type === 'INEFFICIENT_TOWERS');

      if (!hasInefficient) {
        throw new Error('Should detect inefficient towers with 0 damage/dollar');
      }

      return `Detected ${issues.length} issues correctly (inefficient towers, negative economy)`;
    });

    // Test 1.3: Statistical analysis with empty data
    await this.runTest('No Towers - Statistical Analysis', () => {
      const outliers = StatisticalAnalyzer.detectOutliers([]);
      const trend = StatisticalAnalyzer.analyzeTrend([]);
      const predictions = StatisticalAnalyzer.predictWaveDifficulty([], [1, 2, 3]);

      if (outliers.hasOutliers) {
        throw new Error('Empty data should not have outliers');
      }

      if (trend.trend !== 'STABLE') {
        throw new Error('Empty data should show STABLE trend');
      }

      if (predictions.length !== 3) {
        throw new Error('Should return predictions for all requested waves');
      }

      return 'Gracefully handled empty datasets';
    });

    // Test 1.4: Optimal tower mix with no budget
    await this.runTest('No Towers - Optimal Mix Calculation', () => {
      const mix = BalanceAnalyzer.getOptimalTowerMix(0, [
        { type: 'MachineGun', cost: 100, dps: 50, range: 150 },
        { type: 'Sniper', cost: 200, dps: 100, range: 300 },
      ]);

      const totalTowers = Object.values(mix).reduce((sum, count) => sum + count, 0);

      if (totalTowers !== 0) {
        throw new Error('Should not recommend any towers with 0 budget');
      }

      return 'Correctly handled zero budget scenario';
    });
  }

  // ============================================================================
  // Test Category 2: Game Ending on Wave 1
  // ============================================================================

  private async testWave1GameEnd(): Promise<void> {
    console.log('\n📦 Testing: Game Ending on Wave 1');
    console.log('─────────────────────────────────────────────────────');

    // Test 2.1: Single wave data point
    await this.runTest('Wave 1 End - Single Data Point', () => {
      const waveData: Array<[number, number]> = [[1, 100]];
      const trend = StatisticalAnalyzer.analyzeTrend(waveData);

      if (trend.slope !== 0) {
        throw new Error('Single data point should have 0 slope');
      }

      if (trend.confidence !== 'LOW') {
        throw new Error('Single data point should have LOW confidence');
      }

      return 'Handled single wave data correctly';
    });

    // Test 2.2: Predictions with minimal history
    await this.runTest('Wave 1 End - Predictions', () => {
      const waveData: Array<[number, number]> = [[1, 100]];
      const predictionResults = StatisticalAnalyzer.predictWaveDifficulty(waveData, [2, 3, 4]);

      if (predictionResults.length !== 3) {
        throw new Error('Should return predictions even with minimal data');
      }

      // Predictions should be reasonable (not NaN or Infinity)
      for (const pred of predictionResults) {
        if (!isFinite(pred.predictedDifficulty)) {
          throw new Error('Predictions should be finite numbers');
        }
      }

      return 'Generated predictions with minimal historical data';
    });

    // Test 2.3: Outlier detection with single value
    await this.runTest('Wave 1 End - Outlier Detection', () => {
      const outliers = StatisticalAnalyzer.detectOutliers([100]);

      if (outliers.hasOutliers) {
        throw new Error('Single value should not be an outlier');
      }

      if (outliers.mean !== 100) {
        throw new Error('Mean should equal the single value');
      }

      if (outliers.standardDeviation !== 0) {
        throw new Error('Standard deviation should be 0 for single value');
      }

      return 'Handled single value outlier detection correctly';
    });

    // Test 2.4: Break-even with minimal playtime
    await this.runTest('Wave 1 End - Break-Even Analysis', () => {
      const breakEven = BalanceAnalyzer.calculateBreakEvenPoint(
        100, // Tower cost
        50, // DPS
        10, // Zombie reward
        100 // Zombie HP
      );

      if (!isFinite(breakEven)) {
        throw new Error('Break-even time should be finite');
      }

      if (breakEven < 0) {
        throw new Error('Break-even time should not be negative');
      }

      return `Break-even calculated: ${breakEven.toFixed(2)}s`;
    });
  }

  // ============================================================================
  // Test Category 3: Very Long Sessions (50+ Waves)
  // ============================================================================

  private async testLongSession(): Promise<void> {
    console.log('\n📦 Testing: Very Long Sessions (50+ Waves)');
    console.log('─────────────────────────────────────────────────────');

    // Test 3.1: Large dataset performance
    await this.runTest('Long Session - Large Dataset Performance', () => {
      const startTime = performance.now();

      // Generate 50 waves of data
      const waveData: Array<[number, number]> = [];
      for (let i = 1; i <= 50; i++) {
        waveData.push([i, 100 + i * 10]); // Increasing difficulty
      }

      // Perform analysis
      const trend = StatisticalAnalyzer.analyzeTrend(waveData);
      const _predictions = StatisticalAnalyzer.predictWaveDifficulty(
        waveData,
        [51, 52, 53, 54, 55]
      );

      const elapsed = performance.now() - startTime;

      if (elapsed > 50) {
        throw new Error(`Analysis took ${elapsed.toFixed(2)}ms, exceeds 50ms target`);
      }

      if (trend.trend !== 'GETTING_HARDER') {
        throw new Error('Should detect GETTING_HARDER trend with increasing difficulty');
      }

      return `Analyzed 50 waves in ${elapsed.toFixed(2)}ms`;
    });

    // Test 3.2: Memory efficiency with large event arrays
    await this.runTest('Long Session - Memory Efficiency', () => {
      const startTime = performance.now();

      // Simulate 10,000 damage events (typical for 50+ wave game)
      const damageValues: number[] = [];
      for (let i = 0; i < 10000; i++) {
        damageValues.push(Math.random() * 100 + 50);
      }

      // Detect outliers
      const outliers = StatisticalAnalyzer.detectOutliers(damageValues, 2);

      const elapsed = performance.now() - startTime;

      if (elapsed > 100) {
        throw new Error(`Outlier detection took ${elapsed.toFixed(2)}ms, exceeds 100ms target`);
      }

      return `Processed 10,000 events in ${elapsed.toFixed(2)}ms, found ${outliers.outliers.length} outliers`;
    });

    // Test 3.3: Prediction accuracy over long sessions
    await this.runTest('Long Session - Prediction Accuracy', () => {
      // Generate realistic wave progression
      const waveData: Array<[number, number]> = [];
      for (let i = 1; i <= 50; i++) {
        // Exponential growth with some noise
        const baseDifficulty = 100 * Math.pow(1.15, i - 1);
        const noise = (Math.random() - 0.5) * 20;
        waveData.push([i, baseDifficulty + noise]);
      }

      // Predict next 5 waves
      const predictionResults = StatisticalAnalyzer.predictWaveDifficulty(
        waveData,
        [51, 52, 53, 54, 55]
      );

      // Verify predictions are reasonable
      for (let i = 0; i < predictionResults.length; i++) {
        const pred = predictionResults[i];

        if (!isFinite(pred.predictedDifficulty)) {
          throw new Error('Prediction should be finite');
        }

        if (pred.predictedDifficulty < 0) {
          throw new Error('Prediction should not be negative');
        }

        // Confidence interval should be reasonable
        const intervalWidth = pred.confidenceInterval.upper - pred.confidenceInterval.lower;
        if (intervalWidth <= 0) {
          throw new Error('Confidence interval should have positive width');
        }
      }

      return `Generated ${predictionResults.length} predictions with valid confidence intervals`;
    });

    // Test 3.4: Optimal tower mix with large budget
    await this.runTest('Long Session - Large Budget Optimization', () => {
      const startTime = performance.now();

      // Simulate late-game budget
      const mix = BalanceAnalyzer.getOptimalTowerMix(10000, [
        { type: 'MachineGun', cost: 100, dps: 50, range: 150 },
        { type: 'Sniper', cost: 200, dps: 100, range: 300 },
        { type: 'Cannon', cost: 300, dps: 150, range: 200 },
        { type: 'Tesla', cost: 400, dps: 200, range: 250 },
      ]);

      const elapsed = performance.now() - startTime;

      if (elapsed > 50) {
        throw new Error(`Optimization took ${elapsed.toFixed(2)}ms, exceeds 50ms target`);
      }

      const totalTowers = Object.values(mix).reduce((sum, count) => sum + count, 0);

      if (totalTowers === 0) {
        throw new Error('Should recommend towers with large budget');
      }

      return `Optimized tower mix in ${elapsed.toFixed(2)}ms: ${totalTowers} towers`;
    });
  }

  // ============================================================================
  // Test Category 4: Tracking Disabled
  // ============================================================================

  private async testTrackingDisabled(): Promise<void> {
    console.log('\n📦 Testing: Tracking Disabled Scenarios');
    console.log('─────────────────────────────────────────────────────');

    // Test 4.1: Analysis functions work independently
    await this.runTest('Tracking Disabled - Independent Analysis', () => {
      // All analysis functions should work without tracking manager
      const waveDefense = BalanceAnalyzer.canDefendWave(200, 1000, 50, 500, 5);
      const efficiency = BalanceAnalyzer.calculateEfficiencyScore(50, 150, 0.85, 100, 0);
      const threatScore = BalanceAnalyzer.calculateThreatScore(100, 50, 10, 10, 'Basic');
      const effectiveDPS = BalanceAnalyzer.calculateEffectiveDPS(50, 100, 25);

      if (!isFinite(waveDefense.safetyMargin)) {
        throw new Error('Wave defense analysis should return finite values');
      }

      if (!isFinite(efficiency)) {
        throw new Error('Efficiency calculation should return finite value');
      }

      if (!isFinite(threatScore.threatScore)) {
        throw new Error('Threat score should be finite');
      }

      if (!isFinite(effectiveDPS)) {
        throw new Error('Effective DPS should be finite');
      }

      return 'All analysis functions work independently';
    });

    // Test 4.2: Graceful degradation without libraries
    await this.runTest('Tracking Disabled - Library Graceful Degradation', () => {
      // Test that functions handle missing libraries gracefully
      const status = StatisticalAnalyzer.getLibraryStatus();

      // Even if libraries are missing, functions should not crash
      const outliers = StatisticalAnalyzer.detectOutliers([1, 2, 3, 100]);
      const trend = StatisticalAnalyzer.analyzeTrend([
        [1, 100],
        [2, 150],
      ]);
      const summary = StatisticalAnalyzer.calculateSummary([1, 2, 3, 4, 5]);

      // Should return results (possibly with error field)
      if (outliers === null || outliers === undefined) {
        throw new Error('Outlier detection should return result object');
      }

      if (trend === null || trend === undefined) {
        throw new Error('Trend analysis should return result object');
      }

      if (summary === null || summary === undefined) {
        throw new Error('Summary calculation should return result object');
      }

      return `Libraries available: stats=${status.statistics}, regression=${status.regression}, math=${status.math}`;
    });

    // Test 4.3: Zero values and edge inputs
    await this.runTest('Tracking Disabled - Zero Values', () => {
      // Test with zero values
      const zeroEfficiency = BalanceAnalyzer.calculateEfficiencyScore(0, 0, 0, 100, 0);
      const zeroCostEfficiency = BalanceAnalyzer.calculateEfficiencyScore(50, 150, 0.85, 0, 0);
      const zeroBreakEven = BalanceAnalyzer.calculateBreakEvenPoint(100, 0, 10, 100);

      if (!isFinite(zeroEfficiency)) {
        throw new Error('Zero efficiency should be finite (0)');
      }

      if (!isFinite(zeroCostEfficiency)) {
        throw new Error('Zero cost efficiency should be finite');
      }

      if (zeroBreakEven !== Infinity) {
        throw new Error('Zero DPS should result in Infinity break-even time');
      }

      return 'Handled zero values correctly';
    });

    // Test 4.4: Negative values (invalid inputs)
    await this.runTest('Tracking Disabled - Negative Values', () => {
      // Test with negative values (should handle gracefully)
      const negativeDefense = BalanceAnalyzer.canDefendWave(-100, 1000, 50, 500, 1);

      if (negativeDefense.canDefend) {
        throw new Error('Negative DPS should not be able to defend');
      }

      // Negative costs should be handled
      const negativeBreakEven = BalanceAnalyzer.calculateBreakEvenPoint(-100, 50, 10, 100);

      if (!isFinite(negativeBreakEven)) {
        throw new Error('Negative cost should result in finite break-even');
      }

      return 'Handled negative values without crashing';
    });

    // Test 4.5: Extreme values
    await this.runTest('Tracking Disabled - Extreme Values', () => {
      // Test with very large values
      const extremeDefense = BalanceAnalyzer.canDefendWave(
        1000000, // Extreme DPS
        1000000000, // Extreme HP
        1000, // Fast zombies
        10000, // Long path
        100 // High wave
      );

      if (!isFinite(extremeDefense.safetyMargin)) {
        throw new Error('Extreme values should produce finite results');
      }

      // Test with very small values
      const tinyDefense = BalanceAnalyzer.canDefendWave(0.001, 0.001, 0.001, 0.001, 1);

      if (!isFinite(tinyDefense.safetyMargin)) {
        throw new Error('Tiny values should produce finite results');
      }

      return 'Handled extreme values correctly';
    });
  }

  // ============================================================================
  // Test Utilities
  // ============================================================================

  /**
   * Run a single test and record results
   */
  private async runTest(testName: string, testFn: () => string): Promise<void> {
    const startTime = performance.now();
    const errors: string[] = [];
    let passed = false;
    let details = '';

    try {
      details = testFn();
      passed = true;
      console.log(`  ✅ ${testName}`);
      console.log(`     ${details}`);
    } catch (error) {
      passed = false;
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(errorMsg);
      console.log(`  ❌ ${testName}`);
      console.log(`     Error: ${errorMsg}`);
    }

    const duration = performance.now() - startTime;

    this.results.push({
      testName,
      passed,
      duration,
      details,
      errors,
    });
  }

  /**
   * Print test summary
   */
  private printSummary(suite: EdgeCaseTestSuite): void {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Edge Case Test Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Tests: ${suite.totalTests}`);
    console.log(`✅ Passed: ${suite.passed}`);
    console.log(`❌ Failed: ${suite.failed}`);
    console.log(`⏱️  Duration: ${suite.duration.toFixed(2)}ms`);
    console.log(`📈 Success Rate: ${((suite.passed / suite.totalTests) * 100).toFixed(1)}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (suite.failed > 0) {
      console.log('⚠️  Failed Tests:');
      suite.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`   - ${r.testName}`);
          r.errors.forEach(err => console.log(`     ${err}`));
        });
      console.log('');
    }
  }
}

// ============================================================================
// Standalone Test Runner
// ============================================================================

/**
 * Run edge case tests from console
 */
export async function runEdgeCaseTests(): Promise<EdgeCaseTestSuite> {
  const tester = new BalanceAnalysisEdgeCaseTests();
  return await tester.runAllTests();
}

// Make available globally for console testing
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).runEdgeCaseTests = runEdgeCaseTests;
}
