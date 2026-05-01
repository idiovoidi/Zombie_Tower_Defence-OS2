/**
 * BalanceTrackingManager - Centralized balance tracking and analysis coordinator
 *
 * Responsibilities:
 * - Collect game events (damage, economy, waves, towers)
 * - Coordinate real-time balance analysis
 * - Generate comprehensive reports for LogExporter
 * - Monitor performance of analysis operations
 */

import type { GameManager } from './GameManager';
import {
  BalanceAnalyzer,
  type BalanceIssue,
  type TowerEfficiency,
  type WaveDefenseAnalysis,
} from '../utils/BalanceAnalyzer';
import {
  type OutlierAnalysis,
  StatisticalAnalyzer,
  type TrendAnalysis,
  type WavePrediction,
} from '../utils/StatisticalAnalyzer';

// ============================================================================
// Interfaces
// ============================================================================

export interface DamageEvent {
  time: number;
  wave: number;
  towerType: string;
  damage: number;
  killed: boolean;
  overkill: number;
}

export interface EconomyEvent {
  time: number;
  wave: number;
  money: number;
  action: 'BUILD' | 'UPGRADE' | 'SELL' | 'EARN';
  amount: number;
}

export interface WaveEvent {
  wave: number;
  startTime: number;
  endTime: number;
  zombiesSpawned: number;
  zombiesKilled: number;
  livesLost: number;
}

export interface TowerEvent {
  time: number;
  wave: number;
  action: 'PLACED' | 'UPGRADED' | 'SOLD';
  towerType: string;
  cost: number;
  level: number;
}

export interface BalanceTrackingData {
  // Session info
  sessionId: string;
  startTime: number;
  enabled: boolean;

  // Event collections
  damageEvents: DamageEvent[];
  economyEvents: EconomyEvent[];
  waveEvents: WaveEvent[];
  towerEvents: TowerEvent[];

  // Analysis results
  balanceIssues: BalanceIssue[];
  waveDefenseAnalysis: WaveDefenseAnalysis[];
  towerEfficiencies: Map<string, TowerEfficiency>;
  statisticalAnalysis: {
    outliers: OutlierAnalysis | null;
    trends: TrendAnalysis | null;
    predictions: WavePrediction[];
  };

  // Performance monitoring
  performanceStats: {
    analysisCount: number;
    totalAnalysisTime: number;
    maxAnalysisTime: number;
    lastAnalysisTime: number;
  };
}

// ============================================================================
// BalanceTrackingManager Class
// ============================================================================

export class BalanceTrackingManager {
  private gameManager: GameManager;
  private data: BalanceTrackingData;
  private lastAnalysisTime: number;
  private analysisInterval: number;
  private currentWaveStartTime: number;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.lastAnalysisTime = 0;
    this.analysisInterval = 10000; // 10 seconds
    this.currentWaveStartTime = 0;

    // Initialize data structure
    this.data = this.createEmptyData();
  }

  // ============================================================================
  // Lifecycle Methods (Task 4.1)
  // ============================================================================

  /**
   * Enable balance tracking
   */
  public enable(): void {
    if (this.data.enabled) {
      console.log('⚠️ Balance tracking already enabled');
      return;
    }

    this.data.enabled = true;
    this.data.sessionId = `balance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.data.startTime = Date.now();

    console.log('✅ Balance tracking enabled');
    console.log(`📊 Session ID: ${this.data.sessionId}`);
  }

  /**
   * Disable balance tracking
   */
  public disable(): void {
    if (!this.data.enabled) {
      console.log('⚠️ Balance tracking already disabled');
      return;
    }

    this.data.enabled = false;
    console.log('❌ Balance tracking disabled');
  }

  /**
   * Check if tracking is enabled
   */
  public isEnabled(): boolean {
    return this.data.enabled;
  }

  /**
   * Reset all tracking data
   */
  public reset(): void {
    this.data = this.createEmptyData();
    this.lastAnalysisTime = 0;
    this.currentWaveStartTime = 0;
    console.log('🔄 Balance tracking data reset');
  }

  /**
   * Create empty data structure
   */
  private createEmptyData(): BalanceTrackingData {
    return {
      sessionId: '',
      startTime: 0,
      enabled: false,
      damageEvents: [],
      economyEvents: [],
      waveEvents: [],
      towerEvents: [],
      balanceIssues: [],
      waveDefenseAnalysis: [],
      towerEfficiencies: new Map(),
      statisticalAnalysis: {
        outliers: null,
        trends: null,
        predictions: [],
      },
      performanceStats: {
        analysisCount: 0,
        totalAnalysisTime: 0,
        maxAnalysisTime: 0,
        lastAnalysisTime: 0,
      },
    };
  }

  // ============================================================================
  // Event Tracking Methods (Task 4.2)
  // ============================================================================

  /**
   * Track damage dealt by towers
   */
  public trackDamage(towerType: string, damage: number, killed: boolean, overkill: number): void {
    if (!this.data.enabled) {
      return;
    }

    const event: DamageEvent = {
      time: Date.now(),
      wave: this.gameManager.getWave(),
      towerType,
      damage,
      killed,
      overkill,
    };

    this.data.damageEvents.push(event);
  }

  /**
   * Track economy events (money earned/spent)
   */
  public trackEconomy(action: 'BUILD' | 'UPGRADE' | 'SELL' | 'EARN', amount: number): void {
    if (!this.data.enabled) {
      return;
    }

    const event: EconomyEvent = {
      time: Date.now(),
      wave: this.gameManager.getWave(),
      money: this.gameManager.getMoney(),
      action,
      amount,
    };

    this.data.economyEvents.push(event);
  }

  /**
   * Track wave start
   */
  public trackWaveStart(): void {
    if (!this.data.enabled) {
      return;
    }

    this.currentWaveStartTime = Date.now();
    console.log(`📊 Wave ${this.gameManager.getWave()} tracking started`);
  }

  /**
   * Track wave completion
   */
  public trackWaveComplete(zombiesKilled: number, livesLost: number): void {
    if (!this.data.enabled) {
      return;
    }

    const wave = this.gameManager.getWave();
    const endTime = Date.now();

    const event: WaveEvent = {
      wave,
      startTime: this.currentWaveStartTime,
      endTime,
      zombiesSpawned: zombiesKilled, // Passed from GameManager
      zombiesKilled,
      livesLost,
    };

    this.data.waveEvents.push(event);

    // Trigger wave-end analysis
    this.performWaveAnalysis();

    console.log(
      `📊 Wave ${wave} tracking complete (${zombiesKilled} zombies, ${livesLost} lives lost)`
    );
  }

  /**
   * Track tower placement
   */
  public trackTowerPlaced(towerType: string, cost: number): void {
    if (!this.data.enabled) {
      return;
    }

    const event: TowerEvent = {
      time: Date.now(),
      wave: this.gameManager.getWave(),
      action: 'PLACED',
      towerType,
      cost,
      level: 1,
    };

    this.data.towerEvents.push(event);
    this.trackEconomy('BUILD', cost);
  }

  /**
   * Track tower upgrade
   */
  public trackTowerUpgraded(towerType: string, cost: number, level: number): void {
    if (!this.data.enabled) {
      return;
    }

    const event: TowerEvent = {
      time: Date.now(),
      wave: this.gameManager.getWave(),
      action: 'UPGRADED',
      towerType,
      cost,
      level,
    };

    this.data.towerEvents.push(event);
    this.trackEconomy('UPGRADE', cost);
  }

  /**
   * Track tower sale
   */
  public trackTowerSold(towerType: string, refund: number): void {
    if (!this.data.enabled) {
      return;
    }

    const event: TowerEvent = {
      time: Date.now(),
      wave: this.gameManager.getWave(),
      action: 'SOLD',
      towerType,
      cost: -refund, // Negative cost for refund
      level: 0,
    };

    this.data.towerEvents.push(event);
    this.trackEconomy('SELL', refund);
  }

  // ============================================================================
  // Data Aggregation Methods (Task 4.3)
  // ============================================================================

  /**
   * Calculate total damage dealt
   */
  private getTotalDamage(): number {
    return this.data.damageEvents.reduce((sum, event) => sum + event.damage, 0);
  }

  /**
   * Calculate total money spent
   */
  private getTotalMoneySpent(): number {
    return this.data.economyEvents
      .filter(e => e.action === 'BUILD' || e.action === 'UPGRADE')
      .reduce((sum, event) => sum + event.amount, 0);
  }

  /**
   * Calculate total money earned
   */
  private getTotalMoneyEarned(): number {
    return this.data.economyEvents
      .filter(e => e.action === 'EARN')
      .reduce((sum, event) => sum + event.amount, 0);
  }

  /**
   * Calculate damage per dollar
   */
  private getDamagePerDollar(): number {
    const totalSpent = this.getTotalMoneySpent();
    if (totalSpent === 0) {
      return 0;
    }
    return this.getTotalDamage() / totalSpent;
  }

  /**
   * Calculate current DPS
   */
  private getCurrentDPS(): number {
    // Calculate DPS from recent damage events (last 5 seconds)
    const now = Date.now();
    const recentEvents = this.data.damageEvents.filter(e => now - e.time < 5000);

    if (recentEvents.length === 0) {
      return 0;
    }

    const totalDamage = recentEvents.reduce((sum, e) => sum + e.damage, 0);
    const timeSpan = (now - recentEvents[0].time) / 1000; // Convert to seconds

    return timeSpan > 0 ? totalDamage / timeSpan : 0;
  }

  /**
   * Calculate survival rate
   */
  private getSurvivalRate(): number {
    const currentLives = this.gameManager.getLives();
    const startingLives = 20; // TODO: Get from GameConfig
    return (currentLives / startingLives) * 100;
  }

  /**
   * Calculate overkill percentage
   */
  private getOverkillPercent(): number {
    const totalDamage = this.getTotalDamage();
    if (totalDamage === 0) {
      return 0;
    }

    const totalOverkill = this.data.damageEvents.reduce((sum, e) => sum + e.overkill, 0);
    return (totalOverkill / totalDamage) * 100;
  }

  /**
   * Calculate economy efficiency
   */
  private getEconomyEfficiency(): number {
    const earned = this.getTotalMoneyEarned();
    const spent = this.getTotalMoneySpent();
    if (spent === 0) {
      return 100;
    }
    return (earned / spent) * 100;
  }

  /**
   * Get damage by tower type
   */
  private getDamageByTowerType(): Map<string, number> {
    const damageMap = new Map<string, number>();

    for (const event of this.data.damageEvents) {
      const current = damageMap.get(event.towerType) || 0;
      damageMap.set(event.towerType, current + event.damage);
    }

    return damageMap;
  }

  // ============================================================================
  // Analysis Coordination (Task 4.4, 4.5, 4.6)
  // ============================================================================

  /**
   * Update method called every frame
   */
  public update(_deltaTime: number): void {
    if (!this.data.enabled) {
      return;
    }

    const now = Date.now();

    // Throttle analysis to every 10 seconds
    if (now - this.lastAnalysisTime >= this.analysisInterval) {
      this.performRealTimeAnalysis();
      this.lastAnalysisTime = now;
    }
  }

  /**
   * Perform real-time analysis (every 10 seconds)
   */
  private performRealTimeAnalysis(): void {
    const startTime = performance.now();

    try {
      // Detect balance issues
      const stats = {
        damagePerDollar: this.getDamagePerDollar(),
        survivalRate: this.getSurvivalRate(),
        overkillPercent: this.getOverkillPercent(),
        economyEfficiency: this.getEconomyEfficiency(),
      };

      const issues = BalanceAnalyzer.detectBalanceIssues(stats);
      this.data.balanceIssues = issues;

      // Log issues to console with clear formatting
      this.logBalanceIssues(issues);

      // Track performance
      const elapsed = performance.now() - startTime;
      this.recordAnalysisPerformance(elapsed);
    } catch (error) {
      console.error('❌ Error in real-time analysis:', error);
    }
  }

  /**
   * Perform wave-end analysis
   */
  private performWaveAnalysis(): void {
    const startTime = performance.now();

    try {
      // Perform statistical analysis on wave difficulty
      if (this.data.waveEvents.length >= 3) {
        // Prepare data for trend analysis (wave number, zombies killed)
        const waveData: Array<[number, number]> = this.data.waveEvents.map(e => [
          e.wave,
          e.zombiesKilled,
        ]);

        // Analyze trend
        const trend = StatisticalAnalyzer.analyzeTrend(waveData);
        this.data.statisticalAnalysis.trends = trend;

        // Generate predictions for next 5 waves
        const currentWave = this.gameManager.getWave();
        const futureWaves = [
          currentWave + 1,
          currentWave + 2,
          currentWave + 3,
          currentWave + 4,
          currentWave + 5,
        ];
        const predictions = StatisticalAnalyzer.predictWaveDifficulty(waveData, futureWaves);
        this.data.statisticalAnalysis.predictions = predictions;

        console.log(`📈 Trend: ${trend.trend} (confidence: ${trend.confidence})`);
      }

      // Track performance
      const elapsed = performance.now() - startTime;
      this.recordAnalysisPerformance(elapsed);
    } catch (error) {
      console.error('❌ Error in wave analysis:', error);
    }
  }

  /**
   * Perform end-game analysis
   */
  public performEndGameAnalysis(): void {
    const startTime = performance.now();

    try {
      console.log('📊 Performing end-game analysis...');

      // Calculate tower efficiencies
      // TODO: Get tower stats from TowerManager to calculate full efficiency metrics
      // const damageByType = this.getDamageByTowerType();

      // Detect outliers in damage
      const damageValues = this.data.damageEvents.map(e => e.damage);
      if (damageValues.length > 0) {
        const outliers = StatisticalAnalyzer.detectOutliers(damageValues);
        this.data.statisticalAnalysis.outliers = outliers;
      }

      // Final balance issue check
      this.performRealTimeAnalysis();

      console.log('✅ End-game analysis complete');

      // Track performance
      const elapsed = performance.now() - startTime;
      this.recordAnalysisPerformance(elapsed);
    } catch (error) {
      console.error('❌ Error in end-game analysis:', error);
    }
  }

  // ============================================================================
  // Console Logging (Task 12)
  // ============================================================================

  /**
   * Log balance issues to console with clear formatting
   * Uses color-coded warnings and includes recommendations
   */
  private logBalanceIssues(issues: BalanceIssue[]): void {
    if (issues.length === 0) {
      // Log success if no issues detected
      console.log('✅ Balance Check: No issues detected');
      return;
    }

    // Header with separator
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  BALANCE ISSUES DETECTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Log each issue with appropriate icon and formatting
    issues.forEach((issue, index) => {
      // Select icon based on severity
      let icon: string;
      let severityColor: string;

      switch (issue.severity) {
        case 'CRITICAL':
          icon = '❌';
          severityColor = 'CRITICAL';
          break;
        case 'HIGH':
          icon = '⚠️';
          severityColor = 'HIGH';
          break;
        case 'MEDIUM':
          icon = '⚡';
          severityColor = 'MEDIUM';
          break;
        case 'LOW':
          icon = 'ℹ️';
          severityColor = 'LOW';
          break;
        default:
          icon = '⚠️';
          severityColor = issue.severity;
      }

      // Issue header
      console.log(`\n${icon} Issue #${index + 1}: ${issue.type}`);
      console.log(`   Severity: ${severityColor}`);
      console.log(`   ${issue.message}`);
      console.log(`   Current: ${issue.value.toFixed(2)} | Threshold: ${issue.threshold}`);
      console.log(`   💡 Recommendation: ${issue.recommendation}`);
    });

    // Footer with separator
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Issues: ${issues.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  // ============================================================================
  // Performance Monitoring (Task 4.8)
  // ============================================================================

  /**
   * Record analysis performance
   */
  private recordAnalysisPerformance(elapsed: number): void {
    this.data.performanceStats.analysisCount++;
    this.data.performanceStats.totalAnalysisTime += elapsed;
    this.data.performanceStats.maxAnalysisTime = Math.max(
      this.data.performanceStats.maxAnalysisTime,
      elapsed
    );
    this.data.performanceStats.lastAnalysisTime = elapsed;

    // Warn if analysis exceeds 5ms
    if (elapsed > 5) {
      console.warn(`⚠️ Balance analysis took ${elapsed.toFixed(2)}ms (target: <5ms)`);
    }
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    analysisCount: number;
    avgAnalysisTime: number;
    maxAnalysisTime: number;
    lastAnalysisTime: number;
  } {
    const avg =
      this.data.performanceStats.analysisCount > 0
        ? this.data.performanceStats.totalAnalysisTime / this.data.performanceStats.analysisCount
        : 0;

    return {
      analysisCount: this.data.performanceStats.analysisCount,
      avgAnalysisTime: avg,
      maxAnalysisTime: this.data.performanceStats.maxAnalysisTime,
      lastAnalysisTime: this.data.performanceStats.lastAnalysisTime,
    };
  }

  // ============================================================================
  // Data Access Methods
  // ============================================================================

  /**
   * Get detected balance issues
   */
  public getBalanceIssues(): BalanceIssue[] {
    return [...this.data.balanceIssues];
  }

  /**
   * Get wave defense analysis
   */
  public getWaveDefenseAnalysis(): WaveDefenseAnalysis[] {
    return [...this.data.waveDefenseAnalysis];
  }

  /**
   * Get tower efficiencies
   */
  public getTowerEfficiencies(): Map<string, TowerEfficiency> {
    return new Map(this.data.towerEfficiencies);
  }

  /**
   * Get statistical analysis
   */
  public getStatisticalAnalysis(): {
    outliers: OutlierAnalysis | null;
    trends: TrendAnalysis | null;
    predictions: WavePrediction[];
  } {
    return {
      outliers: this.data.statisticalAnalysis.outliers,
      trends: this.data.statisticalAnalysis.trends,
      predictions: [...this.data.statisticalAnalysis.predictions],
    };
  }

  // ============================================================================
  // Report Generation (Task 4.7)
  // ============================================================================

  /**
   * Generate report data for LogExporter
   */
  public generateReportData(): object {
    // Convert Maps to plain objects for JSON serialization
    const towerEfficiencies: Record<string, TowerEfficiency> = {};
    this.data.towerEfficiencies.forEach((value, key) => {
      towerEfficiencies[key] = value;
    });

    const damageByType: Record<string, number> = {};
    this.getDamageByTowerType().forEach((value, key) => {
      damageByType[key] = value;
    });

    return {
      sessionId: this.data.sessionId,
      duration: Date.now() - this.data.startTime,

      // Summary metrics
      summary: {
        totalDamage: this.getTotalDamage(),
        totalMoneySpent: this.getTotalMoneySpent(),
        totalMoneyEarned: this.getTotalMoneyEarned(),
        damagePerDollar: this.getDamagePerDollar(),
        currentDPS: this.getCurrentDPS(),
        survivalRate: this.getSurvivalRate(),
        overkillPercent: this.getOverkillPercent(),
        economyEfficiency: this.getEconomyEfficiency(),
      },

      // Event counts
      eventCounts: {
        damageEvents: this.data.damageEvents.length,
        economyEvents: this.data.economyEvents.length,
        waveEvents: this.data.waveEvents.length,
        towerEvents: this.data.towerEvents.length,
      },

      // Analysis results
      balanceIssues: this.data.balanceIssues,
      waveDefenseAnalysis: this.data.waveDefenseAnalysis,
      towerEfficiencies,
      damageByType,

      // Statistical analysis
      statisticalAnalysis: {
        outliers: this.data.statisticalAnalysis.outliers,
        trends: this.data.statisticalAnalysis.trends,
        predictions: this.data.statisticalAnalysis.predictions,
      },

      // Performance stats
      performanceStats: this.getPerformanceStats(),
    };
  }
}
