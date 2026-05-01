/**
 * BalanceAnalysisPerformanceTest - Comprehensive performance testing suite
 *
 * Tests all balance analysis operations to verify:
 * - Execution time < 5ms per analysis
 * - No frame rate impact
 * - Performance under load
 */

import { BalanceAnalyzer } from './BalanceAnalyzer';
import { StatisticalAnalyzer } from './StatisticalAnalyzer';
import { PerformanceProfiler } from './PerformanceProfiler';

export class BalanceAnalysisPerformanceTest {
  private profiler: PerformanceProfiler;

  constructor() {
    this.profiler = new PerformanceProfiler();
  }

  /**
   * Run all performance tests
   */
  public runAllTests(): void {
    console.log('🚀 Starting Balance Analysis Performance Tests...\n');

    // Test 1: BalanceAnalyzer operations
    this.testBalanceAnalyzerPerformance();

    // Test 2: StatisticalAnalyzer operations
    this.testStatisticalAnalyzerPerformance();

    // Test 3: Combined analysis (real-world scenario)
    this.testCombinedAnalysisPerformance();

    // Test 4: Load testing
    this.testLoadPerformance();

    console.log('✅ All performance tests completed!\n');
  }

  /**
   * Test BalanceAnalyzer performance
   */
  private testBalanceAnalyzerPerformance(): void {
    this.profiler.startTest('BalanceAnalyzer Operations');

    // Test canDefendWave
    this.profiler.profileOperation('canDefendWave', () => {
      BalanceAnalyzer.canDefendWave(250, 5000, 50, 800, 5);
    });

    // Test calculateEfficiencyScore
    this.profiler.profileOperation('calculateEfficiencyScore', () => {
      BalanceAnalyzer.calculateEfficiencyScore(50, 150, 0.85, 100, 50);
    });

    // Test applyDiminishingReturns
    this.profiler.profileOperation('applyDiminishingReturns', () => {
      BalanceAnalyzer.applyDiminishingReturns(100, 5, 100);
    });

    // Test calculateThreatScore
    this.profiler.profileOperation('calculateThreatScore', () => {
      BalanceAnalyzer.calculateThreatScore(100, 50, 10, 10, 'BASIC');
    });

    // Test calculateEffectiveDPS
    this.profiler.profileOperation('calculateEffectiveDPS', () => {
      BalanceAnalyzer.calculateEffectiveDPS(50, 100, 25);
    });

    // Test calculateBreakEvenPoint
    this.profiler.profileOperation('calculateBreakEvenPoint', () => {
      BalanceAnalyzer.calculateBreakEvenPoint(100, 50, 10, 100);
    });

    // Test detectBalanceIssues
    this.profiler.profileOperation('detectBalanceIssues', () => {
      BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 12.5,
        survivalRate: 45,
        overkillPercent: 18,
        economyEfficiency: 95,
      });
    });

    // Test getOptimalTowerMix
    this.profiler.profileOperation('getOptimalTowerMix', () => {
      const towerStats = [
        { type: 'MachineGun', cost: 100, dps: 50, range: 150 },
        { type: 'Sniper', cost: 200, dps: 100, range: 300 },
        { type: 'Shotgun', cost: 150, dps: 75, range: 100 },
      ];
      BalanceAnalyzer.getOptimalTowerMix(1000, towerStats);
    });

    // Test analyzeTowerEfficiency
    this.profiler.profileOperation('analyzeTowerEfficiency', () => {
      BalanceAnalyzer.analyzeTowerEfficiency('MachineGun', 100, 50, 150, 0.85, 25, 100, 10);
    });

    this.profiler.endTest();
  }

  /**
   * Test StatisticalAnalyzer performance
   */
  private testStatisticalAnalyzerPerformance(): void {
    this.profiler.startTest('StatisticalAnalyzer Operations');

    // Generate test data
    const values = Array.from({ length: 100 }, () => 100 + Math.random() * 50);
    const waveData: Array<[number, number]> = Array.from({ length: 20 }, (_, i) => [
      i + 1,
      100 + i * 10 + Math.random() * 20,
    ]);

    // Test detectOutliers
    this.profiler.profileOperation('detectOutliers', () => {
      StatisticalAnalyzer.detectOutliers(values, 2);
    });

    // Test analyzeTrend
    this.profiler.profileOperation('analyzeTrend', () => {
      StatisticalAnalyzer.analyzeTrend(waveData);
    });

    // Test predictWaveDifficulty
    this.profiler.profileOperation('predictWaveDifficulty', () => {
      StatisticalAnalyzer.predictWaveDifficulty(waveData, [21, 22, 23, 24, 25]);
    });

    // Test calculateSummary
    this.profiler.profileOperation('calculateSummary', () => {
      StatisticalAnalyzer.calculateSummary(values);
    });

    this.profiler.endTest();
  }

  /**
   * Test combined analysis (real-world scenario)
   */
  private testCombinedAnalysisPerformance(): void {
    this.profiler.startTest('Combined Analysis (Real-World Scenario)');

    // Simulate real-time analysis (what happens every 10 seconds)
    this.profiler.profileOperation('Real-Time Analysis', () => {
      // Detect balance issues
      BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 15.5,
        survivalRate: 75,
        overkillPercent: 8,
        economyEfficiency: 120,
      });

      // Analyze tower efficiency
      BalanceAnalyzer.analyzeTowerEfficiency('MachineGun', 150, 60, 150, 0.9, 30, 120, 12);
      BalanceAnalyzer.analyzeTowerEfficiency('Sniper', 250, 120, 300, 0.95, 60, 120, 12);

      // Calculate wave defense
      BalanceAnalyzer.canDefendWave(300, 6000, 55, 850, 8);
    });

    // Simulate wave-end analysis
    this.profiler.profileOperation('Wave-End Analysis', () => {
      const waveData: Array<[number, number]> = Array.from({ length: 10 }, (_, i) => [
        i + 1,
        100 + i * 15,
      ]);

      // Trend analysis
      StatisticalAnalyzer.analyzeTrend(waveData);

      // Predictions
      StatisticalAnalyzer.predictWaveDifficulty(waveData, [11, 12, 13, 14, 15]);
    });

    // Simulate end-game analysis
    this.profiler.profileOperation('End-Game Analysis', () => {
      const damageValues = Array.from({ length: 500 }, () => 50 + Math.random() * 100);

      // Outlier detection
      StatisticalAnalyzer.detectOutliers(damageValues);

      // Statistical summary
      StatisticalAnalyzer.calculateSummary(damageValues);

      // Final balance check
      BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 18.2,
        survivalRate: 85,
        overkillPercent: 6.5,
        economyEfficiency: 145,
      });
    });

    this.profiler.endTest();
  }

  /**
   * Test performance under load
   */
  private testLoadPerformance(): void {
    this.profiler.startTest('Load Testing (1000 Operations)');

    // Test 1000 rapid operations
    this.profiler.profileOperation(
      '1000 Balance Issue Detections',
      () => {
        for (let _i = 0; _i < 1000; _i++) {
          BalanceAnalyzer.detectBalanceIssues({
            damagePerDollar: 10 + Math.random() * 20,
            survivalRate: 50 + Math.random() * 50,
            overkillPercent: Math.random() * 30,
            economyEfficiency: 80 + Math.random() * 60,
          });
        }
      },
      50
    ); // Higher threshold for batch operations

    // Test 1000 efficiency calculations
    this.profiler.profileOperation(
      '1000 Efficiency Calculations',
      () => {
        for (let _i = 0; _i < 1000; _i++) {
          BalanceAnalyzer.calculateEfficiencyScore(
            40 + Math.random() * 60,
            100 + Math.random() * 200,
            0.7 + Math.random() * 0.3,
            80 + Math.random() * 120,
            Math.random() * 100
          );
        }
      },
      50
    );

    this.profiler.endTest();
  }

  /**
   * Test with frame rate monitoring
   */
  public async testWithFrameRateMonitoring(): Promise<void> {
    console.log('🎮 Starting Frame Rate Impact Test...\n');

    this.profiler.startTest('Frame Rate Impact Test');
    this.profiler.startFrameRateMonitoring();

    // Wait for baseline measurement (1 second)
    await this.sleep(1000);

    // Run analysis operations for 3 seconds
    const startTime = Date.now();
    let operationCount = 0;

    while (Date.now() - startTime < 3000) {
      // Simulate real-time analysis
      BalanceAnalyzer.detectBalanceIssues({
        damagePerDollar: 15,
        survivalRate: 75,
        overkillPercent: 10,
        economyEfficiency: 120,
      });

      operationCount++;
      await this.sleep(10); // 10ms between operations (100 ops/sec)
    }

    console.log(`📊 Performed ${operationCount} operations during test`);

    this.profiler.endTest();
  }

  /**
   * Helper: Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run performance tests from console
 */
export function runBalancePerformanceTests(): void {
  const tester = new BalanceAnalysisPerformanceTest();
  tester.runAllTests();
}

/**
 * Run frame rate impact test from console
 */
export async function runFrameRateTest(): Promise<void> {
  const tester = new BalanceAnalysisPerformanceTest();
  await tester.testWithFrameRateMonitoring();
}
