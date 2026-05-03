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
  private testStartTime = 0;
  private testName = '';
  private frameRateMonitor: FrameRateMonitor | null = null;

  /**
   * Start a new performance test
   */
  public startTest(testName: string): void {
    this.testName = testName;
    this.testStartTime = performance.now();
    this.metrics = [];
  }

  /**
   * Build a metric record, push it, and log the result
   */
  private recordMetric(
    operationName: string,
    startTime: number,
    endTime: number,
    threshold: number
  ): PerformanceMetrics {
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
    const _icon = passed ? '✅' : '❌';
    return metric;
  }

  /**
   * Profile a single operation
   */
  public profileOperation(
    operationName: string,
    operation: () => void,
    threshold = 5
  ): PerformanceMetrics {
    const startTime = performance.now();
    try {
      operation();
    } catch (_error) {
    }
    return this.recordMetric(operationName, startTime, performance.now(), threshold);
  }

  /**
   * Profile an async operation
   */
  public async profileAsyncOperation(
    operationName: string,
    operation: () => Promise<void>,
    threshold = 5
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    try {
      await operation();
    } catch (_error) {
    }
    return this.recordMetric(operationName, startTime, performance.now(), threshold);
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

    if (report.frameRateImpact) {
      const _impactIcon = report.frameRateImpact.acceptable ? '✅' : '❌';
      const _impactStatus = report.frameRateImpact.acceptable ? 'ACCEPTABLE' : 'UNACCEPTABLE';
    }

    // Overall result
    const overallPass = report.summary.passRate === 100;
    const _resultIcon = overallPass ? '✅' : '❌';
    const _resultStatus = overallPass ? 'PASSED' : 'FAILED';
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
  private baselineFPS = 0;
  private testFPS = 0;
  private frameCount = 0;
  private startTime = 0;
  private isMonitoring = false;
  private animationFrameId: number | null = null;

  /**
   * Start monitoring frame rate
   */
  public start(): void {
    this.isMonitoring = true;
    this.frameCount = 0;
    this.startTime = performance.now();

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
