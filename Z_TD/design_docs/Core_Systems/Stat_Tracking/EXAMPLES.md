# Stat Tracking Code Examples

## Complete Integration Examples

### Example 1: Integrating Combat Tracking

#### In TowerCombatManager

```typescript
export class TowerCombatManager {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  public processDamage(tower: Tower, zombie: Zombie, damage: number): void {
    const zombieHealth = zombie.getHealth();
    const actualDamage = Math.min(damage, zombieHealth);
    const overkill = damage - actualDamage;

    // Apply damage to zombie
    zombie.takeDamage(actualDamage);

    const zombieKilled = zombie.getHealth() <= 0;

    // Track for AI stats
    const aiManager = this.gameManager.getAIPlayerManager();
    if (aiManager && aiManager.isEnabled()) {
      aiManager.trackDamage(actualDamage, tower.getType(), zombieKilled, overkill);
    }

    // Track for balance analysis
    if (this.gameManager.isBalanceTrackingEnabled()) {
      this.gameManager.getBalanceTrackingManager().trackDamage(actualDamage, tower.getType());
    }
  }
}
```

### Example 2: Integrating Shot Tracking

#### In Tower Base Class

```typescript
export class Tower extends GameObject {
  protected fireProjectile(target: Zombie): void {
    const projectile = this.createProjectile(target);

    // Track shot accuracy
    projectile.onHit = () => {
      this.trackShot(true);
    };

    projectile.onMiss = () => {
      this.trackShot(false);
    };

    this.gameManager.getProjectileManager().addProjectile(projectile);
  }

  private trackShot(hit: boolean): void {
    const aiManager = this.gameManager.getAIPlayerManager();
    if (aiManager && aiManager.isEnabled()) {
      aiManager.trackShot(hit);
    }
  }
}
```

### Example 3: Custom Metric Tracking

#### Adding Tower Synergy Tracking

```typescript
// 1. Update AIPerformanceStats interface
interface AIPerformanceStats {
  // ... existing fields
  towerSynergies: Map<string, number>;
  synergyBonusDamage: number;
}

// 2. Initialize in createEmptyStats()
private createEmptyStats(): AIPerformanceStats {
  return {
    // ... existing fields
    towerSynergies: new Map<string, number>(),
    synergyBonusDamage: 0,
  };
}

// 3. Add tracking method
public trackSynergy(towerType1: string, towerType2: string, bonusDamage: number): void {
  if (!this.enabled) return;

  const synergyKey = [towerType1, towerType2].sort().join('+');
  const currentBonus = this.stats.towerSynergies.get(synergyKey) || 0;
  this.stats.towerSynergies.set(synergyKey, currentBonus + bonusDamage);
  this.stats.synergyBonusDamage += bonusDamage;
}

// 4. Export in exportStats()
private exportStats(): void {
  // ... existing code

  // Convert synergies Map to object
  const towerSynergies: Record<string, number> = {};
  this.stats.towerSynergies.forEach((bonus, key) => {
    towerSynergies[key] = bonus;
  });

  const logEntry: GameLogEntry = {
    // ... existing sections
    synergyStats: {
      towerSynergies: towerSynergies,
      totalSynergyBonus: this.stats.synergyBonusDamage,
      synergyEfficiency: this.stats.totalDamageDealt > 0
        ? (this.stats.synergyBonusDamage / this.stats.totalDamageDealt) * 100
        : 0,
    },
  };

  LogExporter.exportLog(logEntry);
}

// 5. Use in combat system
export class TowerCombatManager {
  private checkSynergies(tower: Tower, zombie: Zombie): number {
    const nearbyTowers = this.findNearbyTowers(tower, 200);
    let synergyBonus = 0;

    for (const nearbyTower of nearbyTowers) {
      if (this.hasSynergy(tower.getType(), nearbyTower.getType())) {
        const bonus = this.calculateSynergyBonus(tower, nearbyTower);
        synergyBonus += bonus;

        // Track synergy
        const aiManager = this.gameManager.getAIPlayerManager();
        if (aiManager && aiManager.isEnabled()) {
          aiManager.trackSynergy(
            tower.getType(),
            nearbyTower.getType(),
            bonus
          );
        }
      }
    }

    return synergyBonus;
  }
}
```

## Report Generation Examples

### Example 4: Generating Custom Report Section

```typescript
// In LogExporter.ts

export interface CustomAnalysisData {
  criticalMoments: Array<{
    time: number;
    wave: number;
    event: string;
    impact: string;
  }>;
  recommendations: string[];
}

export interface GameLogEntry {
  // ... existing fields
  customAnalysis?: CustomAnalysisData;
}

// In AIPlayerManager.ts

private generateCustomAnalysis(): CustomAnalysisData {
  const criticalMoments: Array<{
    time: number;
    wave: number;
    event: string;
    impact: string;
  }> = [];

  // Detect critical moments
  this.stats.snapshots.forEach((snapshot, index) => {
    // Low money critical moment
    if (snapshot.money < 100 && snapshot.wave > 5) {
      criticalMoments.push({
        time: snapshot.time,
        wave: snapshot.wave,
        event: 'Low Money',
        impact: 'Unable to build/upgrade towers',
      });
    }

    // Low lives critical moment
    if (snapshot.lives < 5) {
      criticalMoments.push({
        time: snapshot.time,
        wave: snapshot.wave,
        event: 'Low Lives',
        impact: 'Near defeat',
      });
    }

    // DPS drop
    if (index > 0) {
      const prevDPS = this.stats.snapshots[index - 1].currentDPS;
      if (snapshot.currentDPS < prevDPS * 0.5) {
        criticalMoments.push({
          time: snapshot.time,
          wave: snapshot.wave,
          event: 'DPS Drop',
          impact: 'Towers destroyed or ineffective',
        });
      }
    }
  });

  // Generate recommendations
  const recommendations: string[] = [];

  const damagePerDollar = this.stats.totalDamageDealt / this.stats.moneySpent;
  if (damagePerDollar < 25) {
    recommendations.push('Build fewer towers and upgrade more frequently');
  }

  const overkillPercent = (this.stats.overkillDamage / this.stats.totalDamageDealt) * 100;
  if (overkillPercent > 10) {
    recommendations.push('Spread towers out to reduce overkill damage');
  }

  if (this.stats.bankruptcyEvents > 0) {
    recommendations.push('Manage economy better - avoid running out of money');
  }

  return {
    criticalMoments,
    recommendations,
  };
}

private exportStats(): void {
  // ... existing code

  const logEntry: GameLogEntry = {
    // ... existing sections
    customAnalysis: this.generateCustomAnalysis(),
  };

  LogExporter.exportLog(logEntry);
}
```

### Example 5: Balance Data Integration

```typescript
// In AIPlayerManager.ts

private exportStats(): void {
  // ... build logEntry

  // Get balance data from BalanceTrackingManager
  let balanceData: Record<string, unknown> | undefined;
  const balanceManager = this.gameManager.getBalanceTrackingManager();

  if (balanceManager && balanceManager.isEnabled()) {
    balanceData = balanceManager.generateReportData() as Record<string, unknown>;
    console.log('📊 Including balance analysis in report');
  }

  // Export with balance data
  LogExporter.exportLog(logEntry, balanceData);
}

// In LogExporter.ts

public static async exportLog(
  logEntry: GameLogEntry,
  balanceData?: Record<string, unknown>
): Promise<void> {
  // Merge balance data if provided
  let finalLogEntry = logEntry;
  if (balanceData) {
    const formattedBalanceData = this.formatBalanceData(balanceData);
    finalLogEntry = {
      ...logEntry,
      ...formattedBalanceData,
    };
  }

  // Save to server
  await this.saveToServer(filename, finalLogEntry);
}

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

  // Extract and format balance issues
  const issues = (balanceData.balanceIssues as Array<{
    type: string;
    severity: string;
    message: string;
    value: number;
    threshold: number;
    recommendation: string;
  }>) || [];

  // Calculate overall rating
  const overallBalanceRating = this.calculateBalanceRating(issues);

  result.balanceAnalysis = {
    issues,
    // ... other balance data
    overallBalanceRating,
  };

  return result;
}
```

## Utility Examples

### Example 6: Recovery from localStorage

```typescript
// In browser console

// View all stored logs
LogExporter.viewStoredLogs();

// Export all logs to downloads
LogExporter.exportAllLogs();

// Export as single bundle
LogExporter.exportAllLogsAsBundle();

// Clear all logs
LogExporter.clearAllLogs();

// Check count
console.log(`Stored logs: ${LogExporter.getStoredLogCount()}`);
```

### Example 7: Manual Report Generation

```typescript
// Create a manual report without AI

import { LogExporter, type GameLogEntry } from './utils/LogExporter';

function generateManualReport(gameManager: GameManager): void {
  const logEntry: GameLogEntry = {
    timestamp: new Date().toISOString(),
    sessionId: LogExporter.getSessionId(),
    isAIRun: false,
    duration: Date.now() - gameStartTime,
    startTime: new Date(gameStartTime).toISOString(),
    endTime: new Date().toISOString(),
    gameData: {
      highestWave: gameManager.getWave(),
      finalMoney: gameManager.getMoney(),
      finalLives: gameManager.getLives(),
      startLives: 20,
      survivalRate: (gameManager.getLives() / 20) * 100,
      livesLost: 20 - gameManager.getLives(),
    },
    aiData: {
      towersBuilt: 0,
      towersUpgraded: 0,
      moneySpent: 0,
      moneyEarned: 0,
      peakMoney: 0,
      lowestLives: 20,
      averageBuildRate: 0,
      towerComposition: {},
      upgradeDistribution: {},
      waveStats: {
        completionTimes: [],
        averageCompletionTime: 0,
        livesLostPerWave: [],
        averageLivesLostPerWave: 0,
        towersBuiltPerWave: [],
        decisionsPerWave: [],
      },
      performanceRating: LogExporter.getPerformanceRating(gameManager.getWave()),
      defenseRating: LogExporter.getDefenseRating((gameManager.getLives() / 20) * 100),
    },
    combatStats: {
      totalDamageDealt: 0,
      totalZombiesKilled: 0,
      averageDPS: 0,
      peakDPS: 0,
      damageByTowerType: {},
      killsByTowerType: {},
      damagePerWave: [],
      killsPerWave: [],
      overkillDamage: 0,
      accuracyRate: 0,
      shotsHit: 0,
      shotsMissed: 0,
    },
    economyStats: {
      moneyTimeline: [],
      moneyPerWave: [],
      moneySpentPerWave: [],
      netIncomePerWave: [],
      averageMoneyPerSecond: 0,
      peakMoneyPerSecond: 0,
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      economyEfficiency: 0,
      bankruptcyEvents: 0,
      cashFlowTrend: 'STABLE',
    },
    efficiencyStats: {
      damagePerDollar: 0,
      killsPerDollar: 0,
      damagePerTower: 0,
      killsPerTower: 0,
      upgradeEfficiency: 0,
      resourceUtilization: 0,
      towerDensity: 0,
      averageUpgradeLevel: 0,
      costEfficiencyRating: 'FAIR',
    },
    timelineStats: {
      snapshots: [],
      snapshotInterval: 10000,
    },
  };

  LogExporter.exportLog(logEntry);
}
```

### Example 8: Validation Helper

```typescript
// Validate report data before export

function validateReportData(logEntry: GameLogEntry): boolean {
  const errors: string[] = [];

  // Check required fields
  if (!logEntry.timestamp) errors.push('Missing timestamp');
  if (!logEntry.sessionId) errors.push('Missing sessionId');
  if (logEntry.duration < 0) errors.push('Invalid duration');

  // Check percentages
  if (logEntry.gameData.survivalRate < 0 || logEntry.gameData.survivalRate > 100) {
    errors.push('Invalid survival rate');
  }

  if (logEntry.combatStats.accuracyRate < 0 || logEntry.combatStats.accuracyRate > 100) {
    errors.push('Invalid accuracy rate');
  }

  // Check for NaN values
  const checkForNaN = (obj: any, path: string = ''): void => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof value === 'number' && isNaN(value)) {
        errors.push(`NaN value at ${currentPath}`);
      } else if (typeof value === 'object' && value !== null) {
        checkForNaN(value, currentPath);
      }
    }
  };

  checkForNaN(logEntry);

  // Check arrays
  if (logEntry.timelineStats.snapshots.length === 0) {
    console.warn('No timeline snapshots recorded');
  }

  // Log errors
  if (errors.length > 0) {
    console.error('Report validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  console.log('✅ Report validation passed');
  return true;
}

// Use before export
private exportStats(): void {
  const logEntry = this.buildLogEntry();

  if (validateReportData(logEntry)) {
    LogExporter.exportLog(logEntry);
  } else {
    console.error('❌ Report export cancelled due to validation errors');
  }
}
```

## Testing Examples

### Example 9: Mock Data for Testing

```typescript
// Generate mock report for testing

function generateMockReport(): GameLogEntry {
  return {
    timestamp: new Date().toISOString(),
    sessionId: 'test_session_123',
    isAIRun: true,
    duration: 300000, // 5 minutes
    startTime: new Date(Date.now() - 300000).toISOString(),
    endTime: new Date().toISOString(),
    gameData: {
      highestWave: 15,
      finalMoney: 500,
      finalLives: 15,
      startLives: 20,
      survivalRate: 75,
      livesLost: 5,
    },
    aiData: {
      towersBuilt: 12,
      towersUpgraded: 8,
      moneySpent: 2400,
      moneyEarned: 3500,
      peakMoney: 1200,
      lowestLives: 12,
      averageBuildRate: 2.4,
      towerComposition: {
        'Machine Gun': 5,
        Sniper: 3,
        Shotgun: 2,
        Tesla: 1,
        Flame: 1,
      },
      upgradeDistribution: {
        'Machine Gun': [1, 2, 2, 3, 3],
        Sniper: [2, 3, 3],
        Shotgun: [1, 2],
        Tesla: [2],
        Flame: [1],
      },
      waveStats: {
        completionTimes: Array(15)
          .fill(0)
          .map((_, i) => 15000 + i * 1000),
        averageCompletionTime: 20,
        livesLostPerWave: Array(15)
          .fill(0)
          .map(() => (Math.random() < 0.3 ? 1 : 0)),
        averageLivesLostPerWave: 0.33,
        towersBuiltPerWave: Array(15)
          .fill(0)
          .map(() => Math.floor(Math.random() * 2)),
        decisionsPerWave: Array(15)
          .fill(0)
          .map(() => Math.floor(Math.random() * 5) + 3),
      },
      performanceRating: '⭐⭐⭐⭐ GREAT',
      defenseRating: '🛡️ STRONG DEFENSE',
    },
    combatStats: {
      totalDamageDealt: 45000,
      totalZombiesKilled: 150,
      averageDPS: 150,
      peakDPS: 380,
      damageByTowerType: {
        'Machine Gun': 18000,
        Sniper: 15000,
        Shotgun: 7000,
        Tesla: 3000,
        Flame: 2000,
      },
      killsByTowerType: {
        'Machine Gun': 60,
        Sniper: 45,
        Shotgun: 25,
        Tesla: 12,
        Flame: 8,
      },
      damagePerWave: Array(15)
        .fill(0)
        .map((_, i) => 2000 + i * 200),
      killsPerWave: Array(15)
        .fill(0)
        .map((_, i) => 8 + i),
      overkillDamage: 2250,
      accuracyRate: 85,
      shotsHit: 340,
      shotsMissed: 60,
    },
    economyStats: {
      moneyTimeline: Array(60)
        .fill(0)
        .map((_, i) => ({
          time: i * 5000,
          money: 500 + Math.sin(i / 10) * 300,
          wave: Math.floor(i / 4) + 1,
        })),
      moneyPerWave: Array(15)
        .fill(0)
        .map(() => 200 + Math.random() * 100),
      moneySpentPerWave: Array(15)
        .fill(0)
        .map(() => 150 + Math.random() * 100),
      netIncomePerWave: Array(15)
        .fill(0)
        .map(() => 50 + Math.random() * 50),
      averageMoneyPerSecond: 11.67,
      peakMoneyPerSecond: 25,
      totalIncome: 3500,
      totalExpenses: 2400,
      netProfit: 1100,
      economyEfficiency: 145.83,
      bankruptcyEvents: 0,
      cashFlowTrend: 'GROWING',
    },
    efficiencyStats: {
      damagePerDollar: 18.75,
      killsPerDollar: 0.0625,
      damagePerTower: 3750,
      killsPerTower: 12.5,
      upgradeEfficiency: 5625,
      resourceUtilization: 82.76,
      towerDensity: 12,
      averageUpgradeLevel: 2.1,
      costEfficiencyRating: 'FAIR',
    },
    timelineStats: {
      snapshots: Array(30)
        .fill(0)
        .map((_, i) => ({
          time: i * 10000,
          wave: Math.floor(i / 2) + 1,
          money: 500 + Math.sin(i / 5) * 300,
          lives: 20 - Math.floor(i / 6),
          towersActive: Math.min(12, Math.floor(i / 2.5)),
          zombiesAlive: Math.floor(Math.random() * 20),
          currentDPS: 50 + i * 10,
        })),
      snapshotInterval: 10000,
    },
  };
}

// Test report generation
const mockReport = generateMockReport();
console.log('Mock report generated:', mockReport);
LogExporter.exportLog(mockReport);
```

### Example 10: Performance Testing

```typescript
// Test tracking performance

function testTrackingPerformance(): void {
  const iterations = 10000;
  const aiManager = gameManager.getAIPlayerManager();

  // Test damage tracking
  console.time('trackDamage');
  for (let i = 0; i < iterations; i++) {
    aiManager.trackDamage(10, 'Machine Gun', false, 0);
  }
  console.timeEnd('trackDamage');

  // Test shot tracking
  console.time('trackShot');
  for (let i = 0; i < iterations; i++) {
    aiManager.trackShot(true);
  }
  console.timeEnd('trackShot');

  // Test metrics update
  console.time('trackMetrics');
  for (let i = 0; i < iterations; i++) {
    aiManager.update(0.016); // 60 FPS
  }
  console.timeEnd('trackMetrics');

  console.log('Performance test complete');
}
```

## See Also

- [Implementation Guide](./GUIDE.md) - Detailed implementation documentation
- [Quick Reference](../../../.kiro/steering/features/stats.md) - Steering rule
- Example Reports in `player_reports/`
