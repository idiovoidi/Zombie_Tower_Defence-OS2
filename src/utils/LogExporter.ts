/**
 * Utility for exporting game logs and AI performance data
 *
 * Logs are stored in localStorage and can be exported to files.
 * In development, logs can be saved directly to player_logs/ folder.
 */

import { BalanceAnalyzer } from './BalanceAnalyzer';

export interface BalanceAnalysisData {
  issues: Array<{
    type: string;
    severity: string;
    message: string;
    value: number;
    threshold: number;
    recommendation: string;
  }>;
  waveDefenseAnalysis: Array<{
    wave: number;
    canDefend: boolean;
    totalZombieHP: number;
    totalTowerDPS: number;
    timeToReachEnd: number;
    damageDealt: number;
    damageRequired: number;
    safetyMargin: number;
    recommendation: string;
  }>;
  towerEfficiencies: Record<
    string,
    {
      type: string;
      cost: number;
      dps: number;
      range: number;
      accuracy: number;
      efficiencyScore: number;
      effectiveDPS: number;
      breakEvenTime: number;
    }
  >;
  damageByType: Record<string, number>;
  optimalTowerMix?: Record<string, number>;
  actualTowerMix?: Record<string, number>;
  mixDeviation?: number;
  overallBalanceRating: string;
}

export interface StatisticalAnalysisData {
  outliers: {
    mean: number;
    standardDeviation: number;
    outliers: Array<{ value: number; index: number; deviation: number }>;
    hasOutliers: boolean;
  } | null;
  trends: {
    trend: string;
    slope: number;
    intercept: number;
    rSquared: number;
    confidence: string;
  } | null;
  predictions: Array<{
    wave: number;
    predictedDifficulty: number;
    recommendedDPS: number;
    confidenceInterval: { lower: number; upper: number };
  }>;
  summary?: {
    avgDamagePerWave: number;
    avgDPSPerWave: number;
    avgEconomyEfficiency: number;
    performanceConsistency: number;
  };
}

export interface DashboardData {
  labels: string[];
  datasets: {
    playerDPS: number[];
    requiredDPS: number[];
    damagePerDollar: number[];
    economyEfficiency: number[];
    survivalRate: number[];
    threatLevel: number[];
  };
}

export interface GameLogEntry {
  timestamp: string;
  sessionId: string;
  isAIRun: boolean;
  duration: number;
  startTime: string;
  endTime: string;
  gameData: {
    highestWave: number;
    finalMoney: number;
    finalLives: number;
    startLives: number;
    survivalRate: number;
    livesLost: number;
  };
  aiData: {
    towersBuilt: number;
    towersUpgraded: number;
    moneySpent: number;
    moneyEarned: number;
    peakMoney: number;
    lowestLives: number;
    averageBuildRate: number;
    towerComposition: Record<string, number>;
    upgradeDistribution: Record<string, number[]>;
    waveStats: {
      completionTimes: number[];
      averageCompletionTime: number;
      livesLostPerWave: number[];
      averageLivesLostPerWave: number;
      towersBuiltPerWave: number[];
      decisionsPerWave: number[];
    };
    performanceRating: string;
    defenseRating: string;
  };
  combatStats: {
    totalDamageDealt: number;
    totalZombiesKilled: number;
    averageDPS: number;
    peakDPS: number;
    damageByTowerType: Record<string, number>;
    killsByTowerType: Record<string, number>;
    damagePerWave: number[];
    killsPerWave: number[];
    overkillDamage: number;
    accuracyRate: number;
    shotsHit: number;
    shotsMissed: number;
  };
  economyStats: {
    moneyTimeline: Array<{ time: number; money: number; wave: number }>;
    moneyPerWave: number[];
    moneySpentPerWave: number[];
    netIncomePerWave: number[];
    averageMoneyPerSecond: number;
    peakMoneyPerSecond: number;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    economyEfficiency: number;
    bankruptcyEvents: number;
    cashFlowTrend: string;
  };
  efficiencyStats: {
    damagePerDollar: number;
    killsPerDollar: number;
    damagePerTower: number;
    killsPerTower: number;
    upgradeEfficiency: number;
    resourceUtilization: number;
    towerDensity: number;
    averageUpgradeLevel: number;
    costEfficiencyRating: string;
  };
  timelineStats: {
    snapshots: Array<{
      time: number;
      wave: number;
      money: number;
      lives: number;
      towersActive: number;
      zombiesAlive: number;
      currentDPS: number;
    }>;
    snapshotInterval: number;
  };
  // Performance monitoring data
  performanceStats?: {
    waveMemorySnapshots: Array<{
      wave: number;
      timestamp: number;
      heapUsedMB: number;
      heapTotalMB: number;
    }>;
    memoryGrowthRate: number | null;
    averageFrameTime: number;
    peakFrameTime: number;
    averageFPS: number;
    lowestFPS: number;
  };
  // NEW: Optional balance analysis fields (backward compatible)
  balanceAnalysis?: BalanceAnalysisData;
  statisticalAnalysis?: StatisticalAnalysisData;
  dashboardData?: DashboardData;
}

// biome-ignore lint/complexity/noStaticOnlyClass: Stateless utility for log export
export class LogExporter {
  private static sessionId: string = LogExporter.generateSessionId();
  private static readonly STORAGE_KEY = 'ztd_game_logs';
  private static readonly MAX_STORED_LOGS = 100; // Limit to prevent localStorage overflow

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Save log to localStorage and save to server (server required)
   * @param logEntry - The game log entry to export
   * @param balanceData - Optional balance analysis data from BalanceTrackingManager
   */
  public static async exportLog(
    logEntry: GameLogEntry,
    balanceData?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Merge balance data into log entry if provided
      let finalLogEntry = logEntry;
      if (balanceData) {
        const formattedBalanceData = LogExporter.formatBalanceData(balanceData);
        finalLogEntry = {
          ...logEntry,
          ...formattedBalanceData,
        };
      }

      // Format filename with date and AI indicator
      const date = new Date(finalLogEntry.timestamp);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const aiIndicator = finalLogEntry.isAIRun ? 'AI' : 'MANUAL';
      const filename = `${dateStr}_${timeStr}_${aiIndicator}_wave${finalLogEntry.gameData.highestWave}.json`;

      // Store in localStorage as backup
      LogExporter.storeLog(filename, finalLogEntry);

      // Save to server (REQUIRED - no browser download fallback)
      const savedToServer = await LogExporter.saveToServer(filename, finalLogEntry);

      if (!savedToServer) {
        return;
      }
    } catch (_error) {
      // Log export failed
    }
  }

  /**
   * Try to save report to local server
   */
  private static async saveToServer(filename: string, data: GameLogEntry): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:3001/api/save-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, data }),
      });

      if (response.ok) {
        const _result = await response.json();
        return true;
      }
      return false;
    } catch {
      // Server not running, silently fail
      return false;
    }
  }

  /**
   * Store log in localStorage
   */
  private static storeLog(filename: string, logEntry: GameLogEntry): void {
    try {
      const logs = LogExporter.getStoredLogs();
      logs[filename] = logEntry;

      // Limit number of stored logs
      const logKeys = Object.keys(logs);
      if (logKeys.length > LogExporter.MAX_STORED_LOGS) {
        // Remove oldest logs
        const sortedKeys = logKeys.sort();
        const toRemove = sortedKeys.slice(0, logKeys.length - LogExporter.MAX_STORED_LOGS);
        toRemove.forEach(key => {
          delete logs[key];
        });
      }

      localStorage.setItem(LogExporter.STORAGE_KEY, JSON.stringify(logs));
    } catch (_error) {
      // Storage failed
    }
  }

  /**
   * Get all stored logs from localStorage
   */
  private static getStoredLogs(): Record<string, GameLogEntry> {
    try {
      const stored = localStorage.getItem(LogExporter.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (_error) {
      return {};
    }
  }

  /**
   * Get count of stored logs
   */
  public static getStoredLogCount(): number {
    return Object.keys(LogExporter.getStoredLogs()).length;
  }

  /**
   * Export all stored logs as individual files (RECOVERY ONLY)
   * Use this if the server was not running and you need to recover logs
   */
  public static exportAllLogs(): void {
    const logs = LogExporter.getStoredLogs();
    const logCount = Object.keys(logs).length;

    if (logCount === 0) {
      return;
    }

    Object.entries(logs).forEach(([filename, logEntry]) => {
      const jsonData = JSON.stringify(logEntry, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  /**
   * Export all logs as a single JSON file
   */
  public static exportAllLogsAsBundle(): void {
    const logs = LogExporter.getStoredLogs();
    const logCount = Object.keys(logs).length;

    if (logCount === 0) {
      return;
    }

    const bundle = {
      exportDate: new Date().toISOString(),
      logCount: logCount,
      logs: logs,
    };

    const jsonData = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ztd_logs_bundle_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all stored logs
   */
  public static clearAllLogs(): void {
    const _count = LogExporter.getStoredLogCount();
    localStorage.removeItem(LogExporter.STORAGE_KEY);
  }

  /**
   * View all stored logs in console
   */
  public static viewStoredLogs(): void {
    const _logs = LogExporter.getStoredLogs();
  }

  /**
   * Get current session ID
   */
  public static getSessionId(): string {
    return LogExporter.sessionId;
  }

  /**
   * Generate new session ID (call when starting new game)
   */
  public static newSession(): string {
    LogExporter.sessionId = LogExporter.generateSessionId();
    return LogExporter.sessionId;
  }

  /**
   * Format balance data from BalanceTrackingManager for report
   * Converts Maps to plain objects and calculates overall balance rating
   */
  private static formatBalanceData(balanceData: Record<string, unknown>): {
    balanceAnalysis?: BalanceAnalysisData;
    statisticalAnalysis?: StatisticalAnalysisData;
    dashboardData?: DashboardData;
  } {
    const result: {
      balanceAnalysis?: BalanceAnalysisData;
      statisticalAnalysis?: StatisticalAnalysisData;
      dashboardData?: DashboardData;
    } = {};

    // Extract balance issues and other analysis data
    const issues =
      (balanceData['balanceIssues'] as Array<{
        type: string;
        severity: string;
        message: string;
        value: number;
        threshold: number;
        recommendation: string;
      }>) || [];

    const waveDefenseAnalysis =
      (balanceData['waveDefenseAnalysis'] as Array<{
        wave: number;
        canDefend: boolean;
        totalZombieHP: number;
        totalTowerDPS: number;
        timeToReachEnd: number;
        damageDealt: number;
        damageRequired: number;
        safetyMargin: number;
        recommendation: string;
      }>) || [];

    const towerEfficiencies = (balanceData['towerEfficiencies'] as Record<string, unknown>) || {};
    const damageByType = (balanceData['damageByType'] as Record<string, number>) || {};

    // Calculate overall balance rating
    const overallBalanceRating = LogExporter.calculateBalanceRating(issues);

    // Format balance analysis section
    if (
      issues.length > 0 ||
      waveDefenseAnalysis.length > 0 ||
      Object.keys(towerEfficiencies).length > 0
    ) {
      result.balanceAnalysis = {
        issues,
        waveDefenseAnalysis,
        towerEfficiencies: towerEfficiencies as Record<
          string,
          {
            type: string;
            cost: number;
            dps: number;
            range: number;
            accuracy: number;
            efficiencyScore: number;
            effectiveDPS: number;
            breakEvenTime: number;
          }
        >,
        damageByType,
        overallBalanceRating,
      };
    }

    // Format statistical analysis section
    const statisticalAnalysis = balanceData['statisticalAnalysis'] as
      | StatisticalAnalysisData
      | undefined;

    if (statisticalAnalysis) {
      result.statisticalAnalysis = {
        outliers: statisticalAnalysis.outliers,
        trends: statisticalAnalysis.trends,
        predictions: statisticalAnalysis.predictions,
      };
    }

    // Format dashboard data for Chart.js visualization
    const summary = balanceData['summary'] as {
      totalDamage: number;
      totalMoneySpent: number;
      totalMoneyEarned: number;
      damagePerDollar: number;
      currentDPS: number;
      survivalRate: number;
      overkillPercent: number;
      economyEfficiency: number;
    };

    if (summary && waveDefenseAnalysis.length > 0) {
      // Generate labels and datasets for visualization
      const labels = waveDefenseAnalysis.map(w => `Wave ${w.wave}`);
      const playerDPS = waveDefenseAnalysis.map(w => w.totalTowerDPS);
      const requiredDPS = waveDefenseAnalysis.map(w => w.damageRequired / w.timeToReachEnd);

      result.dashboardData = {
        labels,
        datasets: {
          playerDPS,
          requiredDPS,
          damagePerDollar: [summary.damagePerDollar],
          economyEfficiency: [summary.economyEfficiency],
          survivalRate: [summary.survivalRate],
          threatLevel: waveDefenseAnalysis.map(w => (w.canDefend ? 50 : 100)),
        },
      };
    }

    return result;
  }

  /**
   * Calculate overall balance rating based on detected issues
   */
  private static calculateBalanceRating(issues: Array<{ severity: string }>): string {
    if (issues.length === 0) {
      return 'EXCELLENT';
    }

    return BalanceAnalyzer.calculateRatingFromIssues(
      issues as Array<{ severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }>
    );
  }

  /**
   * Calculate performance rating based on wave reached
   */
  public static getPerformanceRating(wave: number): string {
    if (wave >= 20) {
      return '⭐⭐⭐⭐⭐ EXCELLENT';
    }
    if (wave >= 15) {
      return '⭐⭐⭐⭐ GREAT';
    }
    if (wave >= 10) {
      return '⭐⭐⭐ GOOD';
    }
    if (wave >= 5) {
      return '⭐⭐ FAIR';
    }
    return '⭐ NEEDS IMPROVEMENT';
  }

  /**
   * Calculate defense rating based on survival rate
   */
  public static getDefenseRating(survivalRate: number): string {
    if (survivalRate === 100) {
      return '🛡️ PERFECT DEFENSE';
    }
    if (survivalRate >= 80) {
      return '🛡️ STRONG DEFENSE';
    }
    if (survivalRate >= 50) {
      return '⚠️ MODERATE DEFENSE';
    }
    return '❌ WEAK DEFENSE';
  }
}
