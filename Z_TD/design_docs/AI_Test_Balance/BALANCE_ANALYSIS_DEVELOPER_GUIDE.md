# Balance Analysis - Developer Guide

Complete guide for developers integrating and using the balance analysis system.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Integration Guide](#integration-guide)
4. [API Reference](#api-reference)
5. [Configuration](#configuration)
6. [Best Practices](#best-practices)
7. [Testing](#testing)
8. [Performance](#performance)

---

## Getting Started

### Prerequisites

- TypeScript 5.7.3+
- Node.js runtime
- Statistical libraries installed:

```bash
npm install simple-statistics regression mathjs
npm install @types/simple-statistics @types/regression --save-dev
```

### Quick Start

1. **Enable tracking in your game**:

```typescript
// In GameManager.startGame()
this.balanceTrackingManager.enable();
```

2. **Integrate tracking calls**:

```typescript
// When damage is dealt
this.balanceTrackingManager.trackDamage(towerType, damage, killed, overkill);

// When tower is placed
this.balanceTrackingManager.trackTowerPlaced(towerType, cost);

// When wave starts
this.balanceTrackingManager.trackWaveStart(waveNumber);
```

3. **Generate reports**:

```typescript
// When game ends
const balanceData = this.balanceTrackingManager.generateReportData();
await LogExporter.exportLog(gameLogEntry, balanceData);
```

---

## Architecture Overview

### Component Hierarchy

```
GameManager
    ↓
BalanceTrackingManager (Coordinator)
    ↓
    ├─→ BalanceAnalyzer (Mathematical Models)
    │   ├─ Lanchester's Laws
    │   ├─ Efficiency Calculations
    │   ├─ Diminishing Returns
    │   ├─ Threat Scoring
    │   ├─ Overkill Analysis
    │   └─ Break-Even Analysis
    │
    └─→ StatisticalAnalyzer (Statistical Models)
        ├─ Outlier Detection
        ├─ Trend Analysis
        └─ Predictive Modeling
```

### Data Flow

```
Game Events
    ↓
BalanceTrackingManager.trackXXX()
    ↓
Store in tracking data structures
    ↓
Periodic Analysis (every 10s)
    ↓
BalanceAnalyzer + StatisticalAnalyzer
    ↓
Store results
    ↓
Generate report data
    ↓
LogExporter
    ↓
JSON Report
```

---

## Integration Guide

### Step 1: Add BalanceTrackingManager to GameManager

```typescript
// In GameManager.ts
import { BalanceTrackingManager } from '@managers/BalanceTrackingManager';

export class GameManager {
  private balanceTrackingManager: BalanceTrackingManager;

  constructor() {
    // ... other initialization
    this.balanceTrackingManager = new BalanceTrackingManager(this);
  }

  public getBalanceTrackingManager(): BalanceTrackingManager {
    return this.balanceTrackingManager;
  }

  public update(deltaTime: number): void {
    // ... other updates
    this.balanceTrackingManager.update(deltaTime);
  }

  public startGame(): void {
    // ... other start logic
    this.balanceTrackingManager.enable();
  }

  public endGame(): void {
    // ... other end logic
    const balanceData = this.balanceTrackingManager.generateReportData();
    // Pass to LogExporter
  }
}
```

### Step 2: Integrate Combat Tracking

```typescript
// In TowerCombatManager.ts or Tower.ts
private dealDamage(tower: Tower, zombie: Zombie): void {
  const damage = tower.getDamage();
  const zombieHP = zombie.getHealth();
  const killed = damage >= zombieHP;
  const overkill = killed ? damage - zombieHP : 0;

  // Track BEFORE applying damage
  if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
    this.gameManager.getBalanceTrackingManager().trackDamage(
      tower.getType(),
      damage,
      killed,
      overkill
    );
  }

  // Then apply damage
  zombie.takeDamage(damage);
}
```

### Step 3: Integrate Tower Tracking

```typescript
// In TowerPlacementManager.ts
public placeTower(type: string, position: Point): Tower {
  const tower = this.towerFactory.createTower(type);
  const cost = tower.getCost();

  // Place tower
  this.towers.push(tower);

  // Track placement
  if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
    this.gameManager.getBalanceTrackingManager().trackTowerPlaced(type, cost);
  }

  return tower;
}

public upgradeTower(tower: Tower): void {
  const cost = tower.getUpgradeCost();
  const newLevel = tower.getLevel() + 1;

  // Upgrade tower
  tower.upgrade();

  // Track upgrade
  if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
    this.gameManager.getBalanceTrackingManager().trackTowerUpgraded(
      tower.getType(),
      cost,
      newLevel
    );
  }
}

public sellTower(tower: Tower): void {
  const refund = tower.getSellValue();

  // Remove tower
  this.towers = this.towers.filter(t => t !== tower);

  // Track sale
  if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
    this.gameManager.getBalanceTrackingManager().trackTowerSold(
      tower.getType(),
      refund
    );
  }
}
```

### Step 4: Integrate Wave Tracking

```typescript
// In WaveManager.ts
public startWave(waveNumber: number): void {
  // Start wave logic
  this.currentWave = waveNumber;

  // Track wave start
  if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
    this.gameManager.getBalanceTrackingManager().trackWaveStart(waveNumber);
  }
}

public completeWave(waveNumber: number): void {
  const zombiesKilled = this.getZombiesKilledThisWave();
  const livesLost = this.getLivesLostThisWave();

  // Complete wave logic
  this.waveComplete = true;

  // Track wave completion
  if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
    this.gameManager.getBalanceTrackingManager().trackWaveComplete(
      waveNumber,
      zombiesKilled,
      livesLost
    );
  }
}
```

### Step 5: Integrate Economy Tracking

```typescript
// When money is earned (zombie killed)
if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
  this.gameManager.getBalanceTrackingManager().trackEconomy('EARN', reward);
}

// When money is spent (tower built)
if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
  this.gameManager.getBalanceTrackingManager().trackEconomy('BUILD', cost);
}

// When money is spent (tower upgraded)
if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
  this.gameManager.getBalanceTrackingManager().trackEconomy('UPGRADE', cost);
}

// When money is refunded (tower sold)
if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
  this.gameManager.getBalanceTrackingManager().trackEconomy('SELL', refund);
}
```

### Step 6: Extend LogExporter

```typescript
// In LogExporter.ts
export interface GameLogEntry {
  // ... existing fields

  // NEW: Balance analysis section
  balanceAnalysis?: {
    issues: BalanceIssue[];
    waveDefenseAnalysis: WaveDefenseAnalysis[];
    towerEfficiencies: Record<string, TowerEfficiency>;
    threatScores: Record<string, ThreatScore>;
    optimalTowerMix: Record<string, number>;
    actualTowerMix: Record<string, number>;
    mixDeviation: number;
    overallBalanceRating: string;
  };

  // NEW: Statistical analysis section
  statisticalAnalysis?: {
    damageOutliers: OutlierAnalysis;
    dpsOutliers: OutlierAnalysis;
    economyOutliers: OutlierAnalysis;
    difficultyTrend: TrendAnalysis;
    wavePredictions: WavePrediction[];
    summary: object;
  };
}

public static async exportLog(
  logEntry: GameLogEntry,
  balanceData?: object
): Promise<void> {
  // Add balance data if provided
  if (balanceData) {
    logEntry.balanceAnalysis = balanceData.balanceAnalysis;
    logEntry.statisticalAnalysis = balanceData.statisticalAnalysis;
  }

  // ... rest of export logic
}
```

---

## API Reference

### BalanceTrackingManager

#### Lifecycle Methods

```typescript
// Enable tracking
public enable(): void

// Disable tracking
public disable(): void

// Check if enabled
public isEnabled(): boolean

// Reset all data
public reset(): void
```

#### Event Tracking Methods

```typescript
// Track damage dealt
public trackDamage(
  towerType: string,
  damage: number,
  killed: boolean,
  overkill: number
): void

// Track economy events
public trackEconomy(
  action: 'BUILD' | 'UPGRADE' | 'SELL' | 'EARN',
  amount: number
): void

// Track wave events
public trackWaveStart(wave: number): void
public trackWaveComplete(
  wave: number,
  zombiesKilled: number,
  livesLost: number
): void

// Track tower events
public trackTowerPlaced(towerType: string, cost: number): void
public trackTowerUpgraded(towerType: string, cost: number, level: number): void
public trackTowerSold(towerType: string, refund: number): void
```

#### Analysis Methods

```typescript
// Trigger analysis (called automatically by update())
public update(deltaTime: number): void

// Get detected balance issues
public getBalanceIssues(): BalanceIssue[]

// Get wave defense analysis
public getWaveDefenseAnalysis(): WaveDefenseAnalysis[]

// Get tower efficiencies
public getTowerEfficiencies(): Map<string, TowerEfficiency>

// Get statistical analysis
public getStatisticalAnalysis(): object

// Generate report data
public generateReportData(): object
```

### BalanceAnalyzer

All methods are static:

```typescript
// Lanchester's Laws
static canDefendWave(
  totalDPS: number,
  zombieHP: number,
  zombieSpeed: number,
  pathLength: number
): WaveDefenseAnalysis

// Efficiency score
static calculateEfficiencyScore(
  dps: number,
  range: number,
  accuracy: number,
  buildCost: number,
  upgradeCost: number
): number

// Diminishing returns
static applyDiminishingReturns(
  stat: number,
  stackCount: number,
  diminishingFactor: number
): number

// Threat score
static calculateThreatScore(
  health: number,
  speed: number,
  count: number,
  reward: number
): ThreatScore

// Effective DPS
static calculateEffectiveDPS(
  nominalDPS: number,
  averageZombieHP: number,
  damagePerHit: number
): number

// Break-even time
static calculateBreakEvenPoint(
  towerCost: number,
  towerDPS: number,
  averageZombieReward: number,
  averageZombieHP: number
): number

// Balance issues
static detectBalanceIssues(stats: {
  damagePerDollar: number;
  survivalRate: number;
  overkillPercent: number;
  economyEfficiency: number;
}): BalanceIssue[]

// Optimal tower mix
static getOptimalTowerMix(
  budget: number,
  towerStats: Array<{
    type: string;
    cost: number;
    dps: number;
    range: number;
  }>
): Record<string, number>

// Tower efficiency analysis
static analyzeTowerEfficiency(
  type: string,
  cost: number,
  dps: number,
  range: number,
  accuracy: number,
  damagePerHit: number,
  averageZombieHP: number,
  averageZombieReward: number
): TowerEfficiency
```

### StatisticalAnalyzer

All methods are static:

```typescript
// Outlier detection
static detectOutliers(
  values: number[],
  threshold: number = 2
): OutlierAnalysis

// Trend analysis
static analyzeTrend(
  waveData: Array<[number, number]>
): TrendAnalysis

// Predictive modeling
static predictWaveDifficulty(
  historicalData: Array<[number, number]>,
  futureWaves: number[]
): WavePrediction[]

// Statistical summary
static calculateSummary(values: number[]): {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
}
```

---

## Configuration

### Balance Thresholds

Edit `src/config/balanceConfig.ts`:

```typescript
export const BalanceConfig = {
  THRESHOLDS: {
    DAMAGE_PER_DOLLAR_MIN: 15,
    SURVIVAL_RATE_MIN: 50,
    OVERKILL_PERCENT_MAX: 15,
    ECONOMY_EFFICIENCY_MIN: 100,
    BREAK_EVEN_TIME_MIN: 15,
    BREAK_EVEN_TIME_MAX: 30,
    THREAT_SCORE_MIN: 0.8,
    THREAT_SCORE_MAX: 1.2,
    SAFETY_MARGIN_MIN: 20,
  },

  DIMINISHING_RETURNS: {
    TOWER_STACKING_FACTOR: 100,
    EFFICIENCY_REDUCTION_PER_DUPLICATE: 0.9,
  },

  STATISTICAL: {
    OUTLIER_THRESHOLD: 2,
    CONFIDENCE_HIGH_R_SQUARED: 0.85,
    CONFIDENCE_MEDIUM_R_SQUARED: 0.65,
  },

  PERFORMANCE: {
    ANALYSIS_INTERVAL_MS: 10000,
    MAX_ANALYSIS_TIME_MS: 5,
  },
};
```

### Runtime Configuration

```typescript
// Adjust thresholds at runtime
BalanceConfig.THRESHOLDS.DAMAGE_PER_DOLLAR_MIN = 20;

// Change analysis frequency
BalanceConfig.PERFORMANCE.ANALYSIS_INTERVAL_MS = 15000; // 15 seconds
```

---

## Best Practices

### 1. Enable Tracking Early

```typescript
// Enable at game start for complete data
public startGame(): void {
  this.balanceTrackingManager.enable();
  // ... rest of start logic
}
```

### 2. Check Enabled Status Before Tracking

```typescript
// Always check if enabled to avoid overhead
if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
  this.gameManager.getBalanceTrackingManager().trackDamage(...);
}
```

### 3. Track Before State Changes

```typescript
// Track BEFORE applying damage so zombie HP is accurate
const overkill = damage > zombie.getHealth() ? damage - zombie.getHealth() : 0;
this.trackDamage(tower.getType(), damage, killed, overkill);
zombie.takeDamage(damage); // Apply after tracking
```

### 4. Handle Graceful Degradation

```typescript
// System should work even if libraries fail
try {
  const analysis = StatisticalAnalyzer.analyzeTrend(data);
} catch (e) {
  console.warn('Statistical analysis failed:', e);
  // Continue without statistical analysis
}
```

### 5. Monitor Performance

```typescript
// Check analysis time regularly
const perfStats = balanceTrackingManager.getPerformanceStats();
if (perfStats.maxTime > 5) {
  console.warn(`Analysis taking too long: ${perfStats.maxTime}ms`);
}
```

### 6. Reset Between Games

```typescript
// Clear data when starting new game
public startNewGame(): void {
  this.balanceTrackingManager.reset();
  this.balanceTrackingManager.enable();
  // ... rest of start logic
}
```

---

## Testing

### Unit Tests

```typescript
// Test BalanceAnalyzer formulas
describe('BalanceAnalyzer', () => {
  it('should calculate efficiency score correctly', () => {
    const score = BalanceAnalyzer.calculateEfficiencyScore(
      50,  // dps
      150, // range
      0.85, // accuracy
      100, // build cost
      0    // upgrade cost
    );
    expect(score).toBe(63.75);
  });

  it('should detect weak defense', () => {
    const issues = BalanceAnalyzer.detectBalanceIssues({
      damagePerDollar: 20,
      survivalRate: 40, // Below 50% threshold
      overkillPercent: 10,
      economyEfficiency: 120
    });
    expect(issues).toContainEqual(
      expect.objectContaining({ type: 'WEAK_DEFENSE' })
    );
  });
});
```

### Integration Tests

```typescript
// Test tracking integration
describe('BalanceTrackingManager Integration', () => {
  it('should track damage events', () => {
    const manager = new BalanceTrackingManager(gameManager);
    manager.enable();

    manager.trackDamage('MachineGun', 50, true, 10);

    const data = manager.getData();
    expect(data.damageEvents).toHaveLength(1);
    expect(data.damageEvents[0].damage).toBe(50);
  });

  it('should generate balance issues', () => {
    const manager = new BalanceTrackingManager(gameManager);
    manager.enable();

    // Simulate poor performance
    for (let i = 0; i < 100; i++) {
      manager.trackDamage('MachineGun', 10, false, 0);
    }
    manager.trackEconomy('BUILD', 1000);

    manager.update(999999); // Force analysis

    const issues = manager.getBalanceIssues();
    expect(issues.length).toBeGreaterThan(0);
  });
});
```

### Manual Testing

```typescript
// Test in browser console
const manager = gameManager.getBalanceTrackingManager();

// Enable tracking
manager.enable();

// Play for a few waves

// Check results
console.log('Issues:', manager.getBalanceIssues());
console.log('Wave Analysis:', manager.getWaveDefenseAnalysis());
console.log('Tower Efficiencies:', manager.getTowerEfficiencies());
```

---

## Performance

### Performance Budget

- **Per-frame overhead**: < 1ms
- **Periodic analysis**: < 5ms
- **End-game report**: < 50ms
- **Memory overhead**: < 10MB

### Optimization Strategies

1. **Throttle Analysis**:
```typescript
// Run analysis every 10 seconds, not every frame
if (now - this.lastAnalysisTime < this.analysisInterval) {
  return;
}
```

2. **Cache Calculations**:
```typescript
// Cache expensive calculations
private cachedEfficiencies: Map<string, TowerEfficiency> = new Map();
```

3. **Limit Data Retention**:
```typescript
// Keep only recent events
private readonly MAX_EVENTS = 1000;
if (this.data.damageEvents.length > this.MAX_EVENTS) {
  this.data.damageEvents.shift();
}
```

4. **Profile Performance**:
```typescript
const start = performance.now();
this.performAnalysis();
const elapsed = performance.now() - start;
if (elapsed > 5) {
  console.warn(`Analysis took ${elapsed}ms`);
}
```

### Performance Monitoring

```typescript
// Get performance statistics
const perfStats = manager.getPerformanceStats();
console.log('Analyses run:', perfStats.count);
console.log('Average time:', perfStats.avgTime, 'ms');
console.log('Max time:', perfStats.maxTime, 'ms');
```

---

## Related Documentation

- **User Guide**: `BALANCE_ANALYSIS_GUIDE.md`
- **Examples**: `BALANCE_ANALYSIS_EXAMPLES.md`
- **Troubleshooting**: `BALANCE_ANALYSIS_TROUBLESHOOTING.md`
- **Quick Reference**: `STATS_QUICK_REFERENCE.md`
- **Design Document**: `.kiro/specs/balance-analysis-integration/design.md`

---

_Last Updated: 2025-10-15_  
_Version: 1.0_
