/**
 * PerformanceProfiler - Performance testing and profiling utility
 *
 * Provides comprehensive performance testing for balance analysis system:
 * - Profile analysis execution time
 * - Verify < 5ms per analysis requirement
 * - Monitor frame rate impact
 * - Generate performance reports
 */

export interface PerformanceMetrics {
  operationName: string;
  executionTime: number;
  timestamp: number;
  passed: boolean;
  threshold: number;
}

export interface PerformanceReport {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  metrics: PerformanceMetrics[];
  summary: {
    totalOperations: number;
    passedOperations: number;
    failedOperations: number;
    averageExecutionTime: number;
    maxExecutionTime: number;
    minExecutionTime: number;
    passRate: number;
  };
  frameRateImpact: {
    baselineFPS: number;
    testFPS: number;
    fpsDropPercent: number;
    acceptable: boolean;
  } | null;
}

/**
 * PerformanceProfiler - Profiles and tests performance of operations
 */
export class PerformanceProfiler {
  private metrics: PerformanceMetrics[] = [];
  private testStartTime: number = 0;
  private testName: string = '';
  private frameRateMonitor: FrameRateMonitor | null = null;

  /**
   * Start a new performance test
   */
  public startTest(testName: string): void {
    this.testName = testName;
    this.testStartTime = performance.now();
    this.metrics = [];
    console.log(`🔬 Performance Test Started: ${testName}`);
  }

  /**
   * Profile a single operation
   */
  public profileOperation(
    operationName: string,
    operation: () => void,
    threshold: number = 5
  ): PerformanceMetrics {
    const startTime = performance.now();

    try {
      operation();
    } catch (error) {
      console.error(`❌ Error in operation ${operationName}:`, error);
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    const passed = executionTime < threshold;

    const metric: PerformanceMetrics = {
      operationName,
      executionTime,
      timestamp: startTime,
      passed,
      threshold,
    };

    this.metrics.push(metric);

    // Log result
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(
      `${icon} ${operationName}: ${executionTime.toFixed(3)}ms [${status}] (threshold: ${threshold}ms)`
    );

    return metric;
  }

  /**
   * Profile an async operation
   */
  public async profileAsyncOperation(
    operationName: string,
    operation: () => Promise<void>,
    threshold: number = 5
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();

    try {
      await operation();
    } catch (error) {
      console.error(`❌ Error in async operation ${operationName}:`, error);
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;
    const passed = executionTime < threshold;

    const metric: PerformanceMetrics = {
      operationName,
      executionTime,
      timestamp: startTime,
      passed,
      threshold,
    };

    this.metrics.push(metric);

    // Log result
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(
      `${icon} ${operationName}: ${executionTime.toFixed(3)}ms [${status}] (threshold: ${threshold}ms)`
    );

    return metric;
  }

  /**
   * Start monitoring frame rate
   */
  public startFrameRateMonitoring(): void {
    this.frameRateMonitor = new FrameRateMonitor();
    this.frameRateMonitor.start();
  }

  /**
   * Stop monitoring frame rate and get results
   */
  public stopFrameRateMonitoring(): {
    baselineFPS: number;
    testFPS: number;
    fpsDropPercent: number;
    acceptable: boolean;
  } | null {
    if (!this.frameRateMonitor) {
      return null;
    }

    const result = this.frameRateMonitor.stop();
    this.frameRateMonitor = null;
    return result;
  }

  /**
   * End the performance test and generate report
   */
  public endTest(): PerformanceReport {
    const endTime = performance.now();
    const duration = endTime - this.testStartTime;

    // Calculate summary statistics
    const totalOperations = this.metrics.length;
    const passedOperations = this.metrics.filter(m => m.passed).length;
    const failedOperations = totalOperations - passedOperations;

    const executionTimes = this.metrics.map(m => m.executionTime);
    const averageExecutionTime =
      executionTimes.length > 0
        ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
        : 0;
    const maxExecutionTime = executionTimes.length > 0 ? Math.max(...executionTimes) : 0;
    const minExecutionTime = executionTimes.length > 0 ? Math.min(...executionTimes) : 0;
    const passRate = totalOperations > 0 ? (passedOperations / totalOperations) * 100 : 0;

    // Get frame rate impact if monitored
    const frameRateImpact = this.stopFrameRateMonitoring();

    const report: PerformanceReport = {
      testName: this.testName,
      startTime: this.testStartTime,
      endTime,
      duration,
      metrics: [...this.metrics],
      summary: {
        totalOperations,
        passedOperations,
        failedOperations,
        averageExecutionTime,
        maxExecutionTime,
        minExecutionTime,
        passRate,
      },
      frameRateImpact,
    };

    // Log summary
    this.logReport(report);

    return report;
  }

  /**
   * Log performance report to console
   */
  private logReport(report: PerformanceReport): void {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Performance Test Report: ${report.testName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log(`\n⏱️  Test Duration: ${report.duration.toFixed(2)}ms`);

    console.log(`\n📈 Summary Statistics:`);
    console.log(`   Total Operations: ${report.summary.totalOperations}`);
    console.log(`   ✅ Passed: ${report.summary.passedOperations}`);
    console.log(`   ❌ Failed: ${report.summary.failedOperations}`);
    console.log(`   Pass Rate: ${report.summary.passRate.toFixed(1)}%`);

    console.log(`\n⚡ Execution Times:`);
    console.log(`   Average: ${report.summary.averageExecutionTime.toFixed(3)}ms`);
    console.log(`   Maximum: ${report.summary.maxExecutionTime.toFixed(3)}ms`);
    console.log(`   Minimum: ${report.summary.minExecutionTime.toFixed(3)}ms`);

    if (report.frameRateImpact) {
      console.log(`\n🎮 Frame Rate Impact:`);
      console.log(`   Baseline FPS: ${report.frameRateImpact.baselineFPS.toFixed(1)}`);
      console.log(`   Test FPS: ${report.frameRateImpact.testFPS.toFixed(1)}`);
      console.log(`   FPS Drop: ${report.frameRateImpact.fpsDropPercent.toFixed(1)}%`);
      const impactIcon = report.frameRateImpact.acceptable ? '✅' : '❌';
      const impactStatus = report.frameRateImpact.acceptable ? 'ACCEPTABLE' : 'UNACCEPTABLE';
      console.log(`   ${impactIcon} Impact: ${impactStatus}`);
    }

    // Overall result
    const overallPass = report.summary.passRate === 100;
    const resultIcon = overallPass ? '✅' : '❌';
    const resultStatus = overallPass ? 'PASSED' : 'FAILED';
    console.log(`\n${resultIcon} Overall Result: ${resultStatus}`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Export report as JSON
   */
  public exportReport(report: PerformanceReport): string {
    return JSON.stringify(report, null, 2);
  }
}

/**
 * FrameRateMonitor - Monitors frame rate during testing
 */
class FrameRateMonitor {
  private baselineFPS: number = 0;
  private testFPS: number = 0;
  private frameCount: number = 0;
  private startTime: number = 0;
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;
  private animationFrameId: number | null = null;

  /**
   * Start monitoring frame rate
   */
  public start(): void {
    this.isMonitoring = true;
    this.frameCount = 0;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;

    // Measure baseline FPS (first 1 second)
    this.measureBaseline();
  }

  /**
   * Measure baseline FPS
   */
  private measureBaseline(): void {
    const baselineStartTime = performance.now();
    let baselineFrameCount = 0;

    const baselineLoop = () => {
      const now = performance.now();
      baselineFrameCount++;

      if (now - baselineStartTime < 1000) {
        requestAnimationFrame(baselineLoop);
      } else {
        this.baselineFPS = baselineFrameCount;
        console.log(`📊 Baseline FPS: ${this.baselineFPS.toFixed(1)}`);

        // Start test monitoring
        this.startTestMonitoring();
      }
    };

    requestAnimationFrame(baselineLoop);
  }

  /**
   * Start test monitoring
   */
  private startTestMonitoring(): void {
    this.frameCount = 0;
    this.startTime = performance.now();

    const monitorLoop = () => {
      if (!this.isMonitoring) {
        return;
      }

      this.frameCount++;
      this.animationFrameId = requestAnimationFrame(monitorLoop);
    };

    this.animationFrameId = requestAnimationFrame(monitorLoop);
  }

  /**
   * Stop monitoring and return results
   */
  public stop(): {
    baselineFPS: number;
    testFPS: number;
    fpsDropPercent: number;
    acceptable: boolean;
  } {
    this.isMonitoring = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const endTime = performance.now();
    const duration = (endTime - this.startTime) / 1000; // Convert to seconds

    this.testFPS = duration > 0 ? this.frameCount / duration : 0;

    const fpsDropPercent =
      this.baselineFPS > 0 ? ((this.baselineFPS - this.testFPS) / this.baselineFPS) * 100 : 0;

    // Acceptable if FPS drop is less than 5%
    const acceptable = fpsDropPercent < 5;

    return {
      baselineFPS: this.baselineFPS,
      testFPS: this.testFPS,
      fpsDropPercent,
      acceptable,
    };
  }
}
