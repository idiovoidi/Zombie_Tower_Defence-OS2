import type { GameManager } from '@managers/GameManager';
import { type GameLogEntry, LogExporter } from './LogExporter';
import { DebugUtils } from './DebugUtils';

export interface StatTrackerData {
  startTime: number;
  startMoney: number;
  startLives: number;
  towersBuilt: number;
  towersUpgraded: number;
  towersSold: number;
  moneySpent: number;
  highestWave: number;
  zombiesKilled: number;
  towerComposition: Map<string, number>;
  upgradeDistribution: Map<string, number[]>;
  moneyEarned: number;
  waveCompletionTimes: number[];
  livesLostPerWave: number[];
  towersBuiltPerWave: number[];
  peakMoney: number;
  lowestLives: number;
  // Combat tracking
  totalDamageDealt: number;
  damageByTowerType: Map<string, number>;
  killsByTowerType: Map<string, number>;
  damagePerWave: number[];
  killsPerWave: number[];
  shotsHit: number;
  shotsMissed: number;
  overkillDamage: number;
  peakDPS: number;
  lastDPSCheck: number;
  damageInLastSecond: number;
  // Economy tracking
  moneyTimeline: Array<{ time: number; money: number; wave: number }>;
  moneyPerWave: number[];
  moneySpentPerWave: number[];
  lastMoneySnapshot: number;
  lastMoneyAmount: number;
  bankruptcyEvents: number;
  // Timeline snapshots
  snapshots: Array<{
    time: number;
    wave: number;
    money: number;
    lives: number;
    towersActive: number;
    zombiesAlive: number;
    currentDPS: number;
  }>;
  lastSnapshotTime: number;
  // AI tracking
  aiModeEnabled: boolean;
  aiDecisionsPerWave: number[];
}

export class StatTracker {
  private gameManager: GameManager;
  private stats: StatTrackerData;
  private isTracking: boolean = false;
  private currentWaveStartTime: number = 0;
  private currentWaveLivesStart: number = 0;
  private currentWaveTowersBuilt: number = 0;
  private lastTrackedWave: number = 0;
  private damageInLastSecond: number = 0;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.stats = this.createEmptyStats();
  }

  private createEmptyStats(): StatTrackerData {
    return {
      startTime: Date.now(),
      startMoney: 0,
      startLives: 0,
      towersBuilt: 0,
      towersUpgraded: 0,
      towersSold: 0,
      moneySpent: 0,
      highestWave: 0,
      zombiesKilled: 0,
      towerComposition: new Map(),
      upgradeDistribution: new Map(),
      moneyEarned: 0,
      waveCompletionTimes: [],
      livesLostPerWave: [],
      towersBuiltPerWave: [],
      peakMoney: 0,
      lowestLives: 0,
      totalDamageDealt: 0,
      damageByTowerType: new Map(),
      killsByTowerType: new Map(),
      damagePerWave: [],
      killsPerWave: [],
      shotsHit: 0,
      shotsMissed: 0,
      overkillDamage: 0,
      peakDPS: 0,
      lastDPSCheck: Date.now(),
      damageInLastSecond: 0,
      moneyTimeline: [],
      moneyPerWave: [],
      moneySpentPerWave: [],
      lastMoneySnapshot: Date.now(),
      lastMoneyAmount: 0,
      bankruptcyEvents: 0,
      snapshots: [],
      lastSnapshotTime: Date.now(),
      aiModeEnabled: false,
      aiDecisionsPerWave: [],
    };
  }

  public startTracking(aiModeEnabled: boolean = false): void {
    this.stats = this.createEmptyStats();
    this.stats.startMoney = this.gameManager.getMoney();
    this.stats.startLives = this.gameManager.getLives();
    this.stats.lastMoneyAmount = this.stats.startMoney;
    this.stats.peakMoney = this.stats.startMoney;
    this.stats.lowestLives = this.stats.startLives;
    this.stats.aiModeEnabled = aiModeEnabled;
    this.isTracking = true;
    this.lastTrackedWave = 0;
  }

  public stopTracking(): void {
    if (this.isTracking) {
      this.exportStats();
      this.isTracking = false;
    }
  }

  public isActive(): boolean {
    return this.isTracking;
  }

  public setAIModeEnabled(enabled: boolean): void {
    this.stats.aiModeEnabled = enabled;
  }

  public trackTowerBuilt(towerType: string, cost: number): void {
    if (!this.isTracking) {
      return;
    }

    this.stats.towersBuilt++;
    this.stats.moneySpent += cost;
    this.currentWaveTowersBuilt++;

    const count = this.stats.towerComposition.get(towerType) || 0;
    this.stats.towerComposition.set(towerType, count + 1);

    if (!this.stats.upgradeDistribution.has(towerType)) {
      this.stats.upgradeDistribution.set(towerType, []);
    }
    const levels = this.stats.upgradeDistribution.get(towerType);
    if (levels) {
      levels.push(0);
    }
  }

  public trackTowerUpgraded(towerType: string, cost: number, newLevel: number): void {
    if (!this.isTracking) {
      return;
    }

    this.stats.towersUpgraded++;
    this.stats.moneySpent += cost;

    const levels = this.stats.upgradeDistribution.get(towerType);
    if (levels && levels.length > 0) {
      levels[levels.length - 1] = newLevel;
    }
  }

  public trackTowerSold(towerType: string, refund: number): void {
    if (!this.isTracking) {
      return;
    }

    this.stats.towersSold++;
    this.stats.moneyEarned += refund;

    const count = this.stats.towerComposition.get(towerType) || 0;
    if (count > 0) {
      this.stats.towerComposition.set(towerType, count - 1);
    }
  }

  public trackDamage(
    damage: number,
    towerType: string,
    zombieKilled: boolean,
    overkill: number = 0
  ): void {
    if (!this.isTracking) {
      return;
    }

    this.stats.totalDamageDealt += damage;
    this.damageInLastSecond += damage;

    const towerDamage = this.stats.damageByTowerType.get(towerType) || 0;
    this.stats.damageByTowerType.set(towerType, towerDamage + damage);

    if (zombieKilled) {
      this.stats.zombiesKilled++;
      const towerKills = this.stats.killsByTowerType.get(towerType) || 0;
      this.stats.killsByTowerType.set(towerType, towerKills + 1);
    }

    if (overkill > 0) {
      this.stats.overkillDamage += overkill;
    }
  }

  public trackShot(hit: boolean): void {
    if (!this.isTracking) {
      return;
    }

    if (hit) {
      this.stats.shotsHit++;
    } else {
      this.stats.shotsMissed++;
    }
  }

  public trackMoneyEarned(amount: number): void {
    if (!this.isTracking) {
      return;
    }
    this.stats.moneyEarned += amount;
  }

  public trackAIDecision(): void {
    if (!this.isTracking) {
      return;
    }

    const currentWave = this.gameManager.getWaveManager().getCurrentWave();
    while (this.stats.aiDecisionsPerWave.length < currentWave) {
      this.stats.aiDecisionsPerWave.push(0);
    }
    if (this.stats.aiDecisionsPerWave.length > 0) {
      this.stats.aiDecisionsPerWave[this.stats.aiDecisionsPerWave.length - 1]++;
    }
  }

  public trackWaveStart(): void {
    if (!this.isTracking) {
      return;
    }

    this.currentWaveStartTime = Date.now();
    this.currentWaveLivesStart = this.gameManager.getLives();
    this.currentWaveTowersBuilt = 0;

    const currentWave = this.gameManager.getWaveManager().getCurrentWave();
    if (currentWave > this.stats.highestWave) {
      this.stats.highestWave = currentWave;
    }
  }

  public trackWaveComplete(): void {
    if (!this.isTracking) {
      return;
    }

    const currentWave = this.gameManager.getWaveManager().getCurrentWave();

    if (currentWave > this.lastTrackedWave) {
      const waveTime = Date.now() - this.currentWaveStartTime;
      this.stats.waveCompletionTimes.push(waveTime);

      const livesLost = this.currentWaveLivesStart - this.gameManager.getLives();
      this.stats.livesLostPerWave.push(livesLost);

      this.stats.towersBuiltPerWave.push(this.currentWaveTowersBuilt);

      const currentMoney = this.gameManager.getMoney();
      const moneyGained =
        currentMoney -
        this.stats.lastMoneyAmount +
        (this.stats.moneySpentPerWave[currentWave - 1] || 0);
      this.stats.moneyPerWave.push(moneyGained);
      this.stats.lastMoneyAmount = currentMoney;

      this.stats.damagePerWave.push(0);
      this.stats.killsPerWave.push(0);
      this.stats.moneySpentPerWave.push(0);

      this.lastTrackedWave = currentWave;
    }
  }

  public update(_deltaTime: number): void {
    if (!this.isTracking) {
      return;
    }

    const now = Date.now();
    const currentMoney = this.gameManager.getMoney();
    const currentLives = this.gameManager.getLives();

    if (currentMoney > this.stats.peakMoney) {
      this.stats.peakMoney = currentMoney;
    }

    if (currentLives < this.stats.lowestLives) {
      this.stats.lowestLives = currentLives;
    }

    if (currentMoney === 0 && this.stats.lastMoneyAmount > 0) {
      this.stats.bankruptcyEvents++;
    }

    if (now - this.stats.lastDPSCheck >= 1000) {
      const currentDPS = this.damageInLastSecond;
      if (currentDPS > this.stats.peakDPS) {
        this.stats.peakDPS = currentDPS;
      }
      this.damageInLastSecond = 0;
      this.stats.lastDPSCheck = now;
    }

    if (now - this.stats.lastMoneySnapshot >= 5000) {
      const currentWave = this.gameManager.getWaveManager().getCurrentWave();
      this.stats.moneyTimeline.push({
        time: now - this.stats.startTime,
        money: currentMoney,
        wave: currentWave,
      });
      this.stats.lastMoneySnapshot = now;
    }

    if (now - this.stats.lastSnapshotTime >= 10000) {
      const currentWave = this.gameManager.getWaveManager().getCurrentWave();
      const towersActive = this.gameManager.getTowerPlacementManager().getPlacedTowers().length;
      const zombiesAlive = this.gameManager.getZombieManager().getZombies().length;
      const currentDPS = this.calculateCurrentDPS();

      this.stats.snapshots.push({
        time: now - this.stats.startTime,
        wave: currentWave,
        money: currentMoney,
        lives: currentLives,
        towersActive,
        zombiesAlive,
        currentDPS,
      });
      this.stats.lastSnapshotTime = now;
    }
  }

  private calculateCurrentDPS(): number {
    const duration = Date.now() - this.stats.startTime;
    return duration > 0 ? this.stats.totalDamageDealt / (duration / 1000) : 0;
  }

  public getCurrentStats(): {
    currentWave: number;
    highestWave: number;
    currentMoney: number;
    currentLives: number;
    totalDamage: number;
    averageDPS: number;
    peakDPS: number;
    totalKills: number;
    accuracy: number;
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    economyEfficiency: number;
    damagePerDollar: number;
    killsPerDollar: number;
  } {
    const currentWave = this.gameManager.getWaveManager().getCurrentWave();
    const currentMoney = this.gameManager.getMoney();
    const currentLives = this.gameManager.getLives();
    const duration = Date.now() - this.stats.startTime;
    const totalShots = this.stats.shotsHit + this.stats.shotsMissed;
    const accuracy = totalShots > 0 ? (this.stats.shotsHit / totalShots) * 100 : 0;
    const avgDPS = duration > 0 ? this.stats.totalDamageDealt / (duration / 1000) : 0;
    const totalIncome = this.stats.moneyPerWave.reduce((a, b) => a + b, 0) + this.stats.moneyEarned;
    const economyEfficiency =
      this.stats.moneySpent > 0 ? (totalIncome / this.stats.moneySpent) * 100 : 0;
    const damagePerDollar =
      this.stats.moneySpent > 0 ? this.stats.totalDamageDealt / this.stats.moneySpent : 0;
    const killsPerDollar =
      this.stats.moneySpent > 0 ? this.stats.zombiesKilled / this.stats.moneySpent : 0;

    return {
      currentWave,
      highestWave: this.stats.highestWave,
      currentMoney,
      currentLives,
      totalDamage: this.stats.totalDamageDealt,
      averageDPS: avgDPS,
      peakDPS: this.stats.peakDPS,
      totalKills: this.stats.zombiesKilled,
      accuracy,
      totalIncome,
      totalExpenses: this.stats.moneySpent,
      netProfit: totalIncome - this.stats.moneySpent,
      economyEfficiency,
      damagePerDollar,
      killsPerDollar,
    };
  }

  private exportStats(): void {
    const endTime = Date.now();
    const duration = endTime - this.stats.startTime;
    const currentMoney = this.gameManager.getMoney();
    const currentLives = this.gameManager.getLives();
    const livesLost = this.stats.startLives - currentLives;
    const survivalRate = (currentLives / this.stats.startLives) * 100;

    const towerComposition: Record<string, number> = {};
    this.stats.towerComposition.forEach((count, type) => {
      towerComposition[type] = count;
    });

    const upgradeDistribution: Record<string, number[]> = {};
    this.stats.upgradeDistribution.forEach((levels, type) => {
      upgradeDistribution[type] = levels;
    });

    const damageByTowerType: Record<string, number> = {};
    this.stats.damageByTowerType.forEach((damage, type) => {
      damageByTowerType[type] = damage;
    });

    const killsByTowerType: Record<string, number> = {};
    this.stats.killsByTowerType.forEach((kills, type) => {
      killsByTowerType[type] = kills;
    });

    const avgWaveTime =
      this.stats.waveCompletionTimes.length > 0
        ? this.stats.waveCompletionTimes.reduce((a, b) => a + b, 0) /
          this.stats.waveCompletionTimes.length
        : 0;

    const avgLivesLostPerWave =
      this.stats.livesLostPerWave.length > 0
        ? this.stats.livesLostPerWave.reduce((a, b) => a + b, 0) /
          this.stats.livesLostPerWave.length
        : 0;

    const totalShots = this.stats.shotsHit + this.stats.shotsMissed;
    const accuracyRate = totalShots > 0 ? (this.stats.shotsHit / totalShots) * 100 : 0;
    const avgDPS = duration > 0 ? this.stats.totalDamageDealt / (duration / 1000) : 0;

    const totalIncome = this.stats.moneyPerWave.reduce((a, b) => a + b, 0) + this.stats.moneyEarned;
    const totalExpenses = this.stats.moneySpent;
    const netProfit = totalIncome - totalExpenses;
    const avgMoneyPerSecond = duration > 0 ? totalIncome / (duration / 1000) : 0;
    const economyEfficiency = totalExpenses > 0 ? (totalIncome / totalExpenses) * 100 : 0;

    const netIncomePerWave = this.stats.moneyPerWave.map((income, i) => {
      const spent = this.stats.moneySpentPerWave[i] || 0;
      return income - spent;
    });

    let cashFlowTrend = 'STABLE';
    if (netIncomePerWave.length >= 3) {
      const recent = netIncomePerWave.slice(-3);
      const increasing = recent.every((val, i) => i === 0 || val >= recent[i - 1]);
      const decreasing = recent.every((val, i) => i === 0 || val <= recent[i - 1]);
      if (increasing) {
        cashFlowTrend = 'GROWING';
      } else if (decreasing) {
        cashFlowTrend = 'DECLINING';
      }
    }

    const damagePerDollar = totalExpenses > 0 ? this.stats.totalDamageDealt / totalExpenses : 0;
    const killsPerDollar = totalExpenses > 0 ? this.stats.zombiesKilled / totalExpenses : 0;
    const damagePerTower =
      this.stats.towersBuilt > 0 ? this.stats.totalDamageDealt / this.stats.towersBuilt : 0;
    const killsPerTower =
      this.stats.towersBuilt > 0 ? this.stats.zombiesKilled / this.stats.towersBuilt : 0;

    let totalUpgradeLevels = 0;
    let upgradeCount = 0;
    this.stats.upgradeDistribution.forEach(levels => {
      totalUpgradeLevels += levels.reduce((a, b) => a + b, 0);
      upgradeCount += levels.length;
    });
    const avgUpgradeLevel = upgradeCount > 0 ? totalUpgradeLevels / upgradeCount : 0;

    const upgradeEfficiency =
      this.stats.towersUpgraded > 0 ? this.stats.totalDamageDealt / this.stats.towersUpgraded : 0;
    const resourceUtilization = (currentMoney / (this.stats.startMoney + totalIncome)) * 100;

    let costEfficiencyRating = 'POOR';
    if (damagePerDollar > 100) {
      costEfficiencyRating = 'EXCELLENT';
    } else if (damagePerDollar > 50) {
      costEfficiencyRating = 'GOOD';
    } else if (damagePerDollar > 25) {
      costEfficiencyRating = 'FAIR';
    }

    const logEntry: GameLogEntry = {
      timestamp: new Date(this.stats.startTime).toISOString(),
      sessionId: LogExporter.getSessionId(),
      isAIRun: this.stats.aiModeEnabled,
      duration: duration,
      startTime: new Date(this.stats.startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      gameData: {
        highestWave: this.stats.highestWave,
        finalMoney: currentMoney,
        finalLives: currentLives,
        startLives: this.stats.startLives,
        survivalRate: parseFloat(survivalRate.toFixed(1)),
        livesLost: livesLost,
      },
      aiData: {
        towersBuilt: this.stats.towersBuilt,
        towersUpgraded: this.stats.towersUpgraded,
        moneySpent: this.stats.moneySpent,
        moneyEarned: totalIncome,
        peakMoney: this.stats.peakMoney,
        lowestLives: this.stats.lowestLives,
        averageBuildRate: parseFloat((this.stats.towersBuilt / (duration / 60000)).toFixed(2)),
        towerComposition: towerComposition,
        upgradeDistribution: upgradeDistribution,
        waveStats: {
          completionTimes: this.stats.waveCompletionTimes,
          averageCompletionTime: parseFloat((avgWaveTime / 1000).toFixed(1)),
          livesLostPerWave: this.stats.livesLostPerWave,
          averageLivesLostPerWave: parseFloat(avgLivesLostPerWave.toFixed(2)),
          towersBuiltPerWave: this.stats.towersBuiltPerWave,
          decisionsPerWave: this.stats.aiDecisionsPerWave,
        },
        performanceRating: LogExporter.getPerformanceRating(this.stats.highestWave),
        defenseRating: LogExporter.getDefenseRating(survivalRate),
      },
      combatStats: {
        totalDamageDealt: parseFloat(this.stats.totalDamageDealt.toFixed(2)),
        totalZombiesKilled: this.stats.zombiesKilled,
        averageDPS: parseFloat(avgDPS.toFixed(2)),
        peakDPS: parseFloat(this.stats.peakDPS.toFixed(2)),
        damageByTowerType: damageByTowerType,
        killsByTowerType: killsByTowerType,
        damagePerWave: this.stats.damagePerWave,
        killsPerWave: this.stats.killsPerWave,
        overkillDamage: parseFloat(this.stats.overkillDamage.toFixed(2)),
        accuracyRate: parseFloat(accuracyRate.toFixed(2)),
        shotsHit: this.stats.shotsHit,
        shotsMissed: this.stats.shotsMissed,
      },
      economyStats: {
        moneyTimeline: this.stats.moneyTimeline,
        moneyPerWave: this.stats.moneyPerWave,
        moneySpentPerWave: this.stats.moneySpentPerWave,
        netIncomePerWave: netIncomePerWave,
        averageMoneyPerSecond: parseFloat(avgMoneyPerSecond.toFixed(2)),
        peakMoneyPerSecond: 0,
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netProfit: netProfit,
        economyEfficiency: parseFloat(economyEfficiency.toFixed(2)),
        bankruptcyEvents: this.stats.bankruptcyEvents,
        cashFlowTrend: cashFlowTrend,
      },
      efficiencyStats: {
        damagePerDollar: parseFloat(damagePerDollar.toFixed(2)),
        killsPerDollar: parseFloat(killsPerDollar.toFixed(4)),
        damagePerTower: parseFloat(damagePerTower.toFixed(2)),
        killsPerTower: parseFloat(killsPerTower.toFixed(2)),
        upgradeEfficiency: parseFloat(upgradeEfficiency.toFixed(2)),
        resourceUtilization: parseFloat(resourceUtilization.toFixed(2)),
        towerDensity: this.stats.towersBuilt,
        averageUpgradeLevel: parseFloat(avgUpgradeLevel.toFixed(2)),
        costEfficiencyRating: costEfficiencyRating,
      },
      timelineStats: {
        snapshots: this.stats.snapshots,
        snapshotInterval: 10000,
      },
    };

    // Get balance data from BalanceTrackingManager if enabled
    let balanceData: Record<string, unknown> | undefined;
    const balanceTrackingManager = this.gameManager.getBalanceTrackingManager();
    if (balanceTrackingManager && balanceTrackingManager.isEnabled()) {
      balanceData = balanceTrackingManager.generateReportData() as Record<string, unknown>;
      DebugUtils.debug('Including balance analysis in stat tracker report');
    }

    LogExporter.exportLog(logEntry, balanceData);
  }

  public exportCurrentStats(): void {
    if (this.isTracking) {
      this.exportStats();
    }
  }
}
