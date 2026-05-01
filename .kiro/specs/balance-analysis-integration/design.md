# Design Document

## Overview

This design document outlines the integration of a comprehensive mathematical balance analysis framework into Z-TD's existing logging and stat tracking system. The solution leverages proven mathematical models (Lanchester's Laws, diminishing returns, threat scoring) and statistical analysis libraries (`simple-statistics`, `regression`, `mathjs`) to provide automated balance validation, issue detection, and predictive modeling.

The design focuses on minimal code changes, backward compatibility, and performance efficiency while providing maximum analytical value for rapid playtesting iterations.

### Key Design Principles

1. **Non-Breaking Integration** - Extend existing classes without modifying core functionality
2. **Performance First** - All analysis must complete within 5ms per frame
3. **Graceful Degradation** - System continues working if libraries fail to load
4. **Data-Driven** - All balance decisions backed by mathematical models
5. **Developer-Friendly** - Clear console output and actionable recommendations

---

## Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Game Systems                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ TowerManager │  │ WaveManager  │  │ZombieManager │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           Balance Tracking System (NEW)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      BalanceTrackingManager (NEW CLASS)              │   │
│  │  • Centralized tracking coordinator                  │   │
│  │  • Event-based data collection                       │   │
│  │  • Real-time analysis orchestration                  │   │
│  │  • Performance monitoring                            │   │
│  │  • Report generation coordination                    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Balance Analysis Layer (NEW)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           BalanceAnalyzer (NEW CLASS)                │   │
│  │  • Lanchester's Laws Calculator                      │   │
│  │  • Efficiency Score Calculator                       │   │
│  │  • Diminishing Returns Calculator                    │   │
│  │  • Threat Score Calculator                           │   │
│  │  • Break-Even Analyzer                               │   │
│  │  • Optimal Tower Mix Calculator                      │   │
│  │  • Effective DPS Calculator                          │   │
│  │  • Balance Issue Detector                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      StatisticalAnalyzer (NEW CLASS)                 │   │
│  │  • Outlier Detection (simple-statistics)             │   │
│  │  • Trend Analysis (regression)                       │   │
│  │  • Predictive Modeling (regression)                  │   │
│  │  • Statistical Summaries                             │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            Existing Systems (MINIMAL CHANGES)                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      AIPlayerManager (MINIMAL CHANGES)               │   │
│  │  • Existing AI decision-making                       │   │
│  │  • Emit events to BalanceTrackingManager             │   │
│  │  • No direct balance analysis                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         LogExporter (MINIMAL CHANGES)                │   │
│  │  • Existing report generation                        │   │
│  │  • Accept balance data from BalanceTrackingManager   │   │
│  │  • Format and export enhanced reports                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Game Event (Tower Placed, Damage Dealt, Wave Start, etc.)
     ↓
BalanceTrackingManager (Event Handler)
     ↓
Collect & Store Raw Data
     ↓
     ├─→ Real-Time Analysis (Every 10s)
     │        ↓
     │   BalanceAnalyzer (Mathematical Models)
     │        ↓
     │   Detect Issues → Console Warnings
     │
     └─→ Wave Complete
              ↓
         StatisticalAnalyzer (Trend Analysis)
              ↓
         Store Analysis Results
              ↓
         Game End
              ↓
         Generate Report Data
              ↓
         LogExporter (Format & Save)
              ↓
         Enhanced Report → File System
```

---

## Components and Interfaces

### 1. BalanceTrackingManager Class (NEW)

**Location:** `src/managers/BalanceTrackingManager.ts`

**Purpose:** Centralized system for tracking game balance metrics, coordinating analysis, and generating reports. Acts as the single source of truth for all balance-related data.

**Interface:**

```typescript
export interface BalanceTrackingData {
  // Raw tracking data
  sessionId: string;
  startTime: number;
  gameEvents: GameEvent[];

  // Combat tracking
  damageEvents: Array<{
    time: number;
    wave: number;
    towerType: string;
    damage: number;
    killed: boolean;
    overkill: number;
  }>;

  // Economy tracking
  economyEvents: Array<{
    time: number;
    wave: number;
    money: number;
    action: 'BUILD' | 'UPGRADE' | 'SELL' | 'EARN';
    amount: number;
  }>;

  // Wave tracking
  waveEvents: Array<{
    wave: number;
    startTime: number;
    endTime: number;
    zombiesSpawned: number;
    zombiesKilled: number;
    livesLost: number;
  }>;

  // Tower tracking
  towerEvents: Array<{
    time: number;
    wave: number;
    action: 'PLACED' | 'UPGRADED' | 'SOLD';
    towerType: string;
    cost: number;
    level: number;
  }>;

  // Analysis results (computed)
  balanceIssues: BalanceIssue[];
  waveDefenseAnalysis: WaveDefenseAnalysis[];
  towerEfficiencies: Map<string, TowerEfficiency>;
  threatScores: Map<string, ThreatScore>;
  statisticalAnalysis: {
    outliers: OutlierAnalysis;
    trends: TrendAnalysis;
    predictions: WavePrediction[];
  };
}

export class BalanceTrackingManager {
  private data: BalanceTrackingData;
  private gameManager: GameManager;
  private enabled: boolean;
  private lastAnalysisTime: number;
  private analysisInterval: number;

  constructor(gameManager: GameManager);

  // Lifecycle
  public enable(): void;
  public disable(): void;
  public isEnabled(): boolean;
  public reset(): void;

  // Event tracking (called by game systems)
  public trackDamage(towerType: string, damage: number, killed: boolean, overkill: number): void;

  public trackEconomy(action: 'BUILD' | 'UPGRADE' | 'SELL' | 'EARN', amount: number): void;

  public trackWaveStart(wave: number): void;
  public trackWaveComplete(wave: number, zombiesKilled: number, livesLost: number): void;

  public trackTowerPlaced(towerType: string, cost: number): void;
  public trackTowerUpgraded(towerType: string, cost: number, level: number): void;
  public trackTowerSold(towerType: string, refund: number): void;

  // Analysis coordination
  public update(deltaTime: number): void;
  private performRealTimeAnalysis(): void;
  private performWaveAnalysis(): void;
  private performEndGameAnalysis(): void;

  // Data access
  public getBalanceIssues(): BalanceIssue[];
  public getWaveDefenseAnalysis(): WaveDefenseAnalysis[];
  public getTowerEfficiencies(): Map<string, TowerEfficiency>;
  public getStatisticalAnalysis(): object;

  // Report generation
  public generateReportData(): object;
}
```

**Key Responsibilities:**

1. **Event Collection** - Receive and store all game events
2. **Analysis Coordination** - Trigger analysis at appropriate times
3. **Data Aggregation** - Combine raw events into meaningful metrics
4. **Issue Detection** - Identify balance problems in real-time
5. **Report Generation** - Provide data to LogExporter

**Integration Points:**

```typescript
// In GameManager constructor
this.balanceTrackingManager = new BalanceTrackingManager(this);

// In TowerCombatManager (when damage is dealt)
if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
  this.gameManager
    .getBalanceTrackingManager()
    .trackDamage(tower.getType(), damage, zombieKilled, overkillAmount);
}

// In TowerPlacementManager (when tower is placed)
if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
  this.gameManager.getBalanceTrackingManager().trackTowerPlaced(towerType, cost);
}

// In WaveManager (wave events)
if (this.gameManager.getBalanceTrackingManager().isEnabled()) {
  this.gameManager.getBalanceTrackingManager().trackWaveStart(wave);
}
```

**Benefits of Separation:**

- ✅ **Single Responsibility** - Each class has one clear purpose
- ✅ **Testability** - Easy to test tracking independently
- ✅ **Flexibility** - Can enable/disable tracking without affecting AI
- ✅ **Maintainability** - Balance logic separate from game logic
- ✅ **Reusability** - Can track manual play or AI play equally

---

### 2. BalanceAnalyzer Class (NEW)

**Location:** `src/utils/BalanceAnalyzer.ts`

**Purpose:** Provides mathematical balance analysis functions using proven game balance formulas.

**Interface:**

```typescript
export interface BalanceIssue {
  type: 'INEFFICIENT_TOWERS' | 'WEAK_DEFENSE' | 'EXCESSIVE_OVERKILL' | 'NEGATIVE_ECONOMY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  value: number;
  threshold: number;
  recommendation: string;
}

export interface TowerEfficiency {
  type: string;
  cost: number;
  dps: number;
  range: number;
  accuracy: number;
  efficiencyScore: number;
  effectiveDPS: number;
  breakEvenTime: number;
}

export interface WaveDefenseAnalysis {
  wave: number;
  canDefend: boolean;
  totalZombieHP: number;
  totalTowerDPS: number;
  timeToReachEnd: number;
  damageDealt: number;
  damageRequired: number;
  safetyMargin: number; // percentage
  recommendation: string;
}

export interface ThreatScore {
  zombieType: string;
  health: number;
  speed: number;
  count: number;
  reward: number;
  threatScore: number;
  threatPerDollar: number;
  isBalanced: boolean;
}

export class BalanceAnalyzer {
  // Lanchester's Laws - Can towers defend against wave?
  static canDefendWave(
    totalDPS: number,
    zombieHP: number,
    zombieSpeed: number,
    pathLength: number
  ): WaveDefenseAnalysis;

  // Calculate tower efficiency score
  static calculateEfficiencyScore(
    dps: number,
    range: number,
    accuracy: number,
    buildCost: number,
    upgradeCost: number
  ): number;

  // Apply diminishing returns to stacked towers
  static applyDiminishingReturns(
    stat: number,
    stackCount: number,
    diminishingFactor: number
  ): number;

  // Calculate threat score for zombie type
  static calculateThreatScore(
    health: number,
    speed: number,
    count: number,
    reward: number
  ): ThreatScore;

  // Detect balance issues from stats
  static detectBalanceIssues(stats: {
    damagePerDollar: number;
    survivalRate: number;
    overkillPercent: number;
    economyEfficiency: number;
  }): BalanceIssue[];

  // Calculate optimal tower mix using marginal utility
  static getOptimalTowerMix(
    budget: number,
    towerStats: Array<{ type: string; cost: number; dps: number; range: number }>
  ): Record<string, number>;

  // Calculate effective DPS accounting for overkill
  static calculateEffectiveDPS(
    nominalDPS: number,
    averageZombieHP: number,
    damagePerHit: number
  ): number;

  // Calculate break-even time for tower investment
  static calculateBreakEvenPoint(
    towerCost: number,
    towerDPS: number,
    averageZombieReward: number,
    averageZombieHP: number
  ): number;

  // Analyze tower efficiency with all metrics
  static analyzeTowerEfficiency(
    type: string,
    cost: number,
    dps: number,
    range: number,
    accuracy: number,
    damagePerHit: number,
    averageZombieHP: number,
    averageZombieReward: number
  ): TowerEfficiency;
}
```

**Key Algorithms:**

1. **Lanchester's Square Law:**

```typescript
// Time for zombies to reach end
const timeToReachEnd = pathLength / zombieSpeed;
// Total damage towers can deal
const damageDealt = totalDPS * timeToReachEnd;
// Can defend if damage >= zombie HP
const canDefend = damageDealt >= zombieHP;
// Safety margin
const safetyMargin = ((damageDealt - zombieHP) / zombieHP) * 100;
```

2. **Efficiency Score:**

```typescript
const efficiencyScore = (dps * range * accuracy) / (buildCost + upgradeCost);
```

3. **Diminishing Returns:**

```typescript
const effectiveValue = (stat / (stat + diminishingFactor)) * cap;
// Example: N=100, cap=0.5
// 25 armor = 10% reduction
// 100 armor = 25% reduction
// 1000 armor = 45% reduction
```

4. **Threat Score:**

```typescript
const threatScore = (health * speed * count) / (reward * 10);
// Balanced if threatScore is between 0.8 and 1.2
```

5. **Effective DPS (Overkill Adjustment):**

```typescript
const shotsToKill = Math.ceil(averageZombieHP / damagePerHit);
const wastedDamage = shotsToKill * damagePerHit - averageZombieHP;
const wastePercent = wastedDamage / (shotsToKill * damagePerHit);
const effectiveDPS = nominalDPS * (1 - wastePercent);
```

6. **Break-Even Time:**

```typescript
const killTime = averageZombieHP / towerDPS;
const revenuePerSecond = averageZombieReward / killTime;
const breakEvenTime = towerCost / revenuePerSecond;
```

---

### 2. StatisticalAnalyzer Class (NEW)

**Location:** `src/utils/StatisticalAnalyzer.ts`

**Purpose:** Provides statistical analysis using external libraries for trend detection and prediction.

**Interface:**

```typescript
export interface OutlierAnalysis {
  mean: number;
  standardDeviation: number;
  outliers: Array<{ value: number; index: number; deviation: number }>;
  hasOutliers: boolean;
}

export interface TrendAnalysis {
  trend: 'GETTING_HARDER' | 'GETTING_EASIER' | 'STABLE';
  slope: number;
  intercept: number;
  rSquared: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface WavePrediction {
  wave: number;
  predictedDifficulty: number;
  recommendedDPS: number;
  confidenceInterval: { lower: number; upper: number };
}

export class StatisticalAnalyzer {
  // Detect outliers using standard deviation
  static detectOutliers(values: number[], threshold: number = 2): OutlierAnalysis;

  // Analyze trend using linear regression
  static analyzeTrend(waveData: Array<[number, number]>): TrendAnalysis;

  // Predict future wave difficulty using polynomial regression
  static predictWaveDifficulty(
    historicalData: Array<[number, number]>,
    futureWaves: number[]
  ): WavePrediction[];

  // Calculate statistical summary
  static calculateSummary(values: number[]): {
    mean: number;
    median: number;
    mode: number;
    standardDeviation: number;
    variance: number;
    min: number;
    max: number;
    range: number;
  };
}
```

**Library Integration:**

```typescript
import * as ss from 'simple-statistics';
import regression from 'regression';
import { create, all } from 'mathjs';

const math = create(all);
```

**Key Algorithms:**

1. **Outlier Detection:**

```typescript
const mean = ss.mean(values);
const stdDev = ss.standardDeviation(values);
const outliers = values.filter(v => Math.abs(v - mean) > threshold * stdDev);
```

2. **Trend Analysis:**

```typescript
const result = ss.linearRegression(waveData);
const trend = result.m > 0 ? 'GETTING_HARDER' : 'GETTING_EASIER';
const rSquared = ss.rSquared(waveData, line);
```

3. **Predictive Modeling:**

```typescript
const model = regression.polynomial(waveData, { order: 2 });
const prediction = model.predict(nextWave);
```

---

### 3. AIPlayerManager (MINIMAL CHANGES)

**Location:** `src/managers/AIPlayerManager.ts`

**Changes:**

The AIPlayerManager will remain focused on AI decision-making. Balance tracking is delegated to BalanceTrackingManager.

```typescript
class AIPlayerManager {
  // ... existing fields and methods unchanged ...
  // REMOVED: All balance analysis logic
  // REMOVED: Statistical analysis methods
  // REMOVED: Balance issue detection
  // The AIPlayerManager now only:
  // 1. Makes AI decisions (place towers, upgrade, etc.)
  // 2. Tracks basic AI-specific stats (decisions made, strategy used)
  // 3. Logs AI performance to console
  // Balance tracking is handled by BalanceTrackingManager
}
```

**Integration:**

The AIPlayerManager no longer performs balance analysis. Instead, the BalanceTrackingManager listens to game events from all sources (AI or manual play).

**Benefits:**

- ✅ **Cleaner Code** - AI logic separate from balance tracking
- ✅ **Works for Manual Play** - Balance tracking works whether AI is enabled or not
- ✅ **Easier Testing** - Can test AI decisions without balance analysis
- ✅ **Better Performance** - AI doesn't wait for analysis to complete

---

### 4. LogExporter (MINIMAL CHANGES)

**Location:** `src/utils/LogExporter.ts`

**Changes:**

LogExporter receives balance data from BalanceTrackingManager and formats it for reports.

```typescript
export interface GameLogEntry {
  // ... existing fields ...

  // NEW: Balance analysis section (optional for backward compatibility)
  balanceAnalysis?: {
    issues: BalanceIssue[];
    waveDefenseAnalysis: WaveDefenseAnalysis[];
    towerEfficiencies: Record<string, TowerEfficiency>;
    threatScores: Record<string, ThreatScore>;
    optimalTowerMix: Record<string, number>;
    actualTowerMix: Record<string, number>;
    mixDeviation: number;
    overallBalanceRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  };

  // NEW: Statistical analysis section (optional)
  statisticalAnalysis?: {
    damageOutliers: OutlierAnalysis;
    dpsOutliers: OutlierAnalysis;
    economyOutliers: OutlierAnalysis;
    difficultyTrend: TrendAnalysis;
    wavePredictions: WavePrediction[];
    summary: {
      avgDamagePerWave: number;
      avgDPSPerWave: number;
      avgEconomyEfficiency: number;
      performanceConsistency: number;
    };
  };

  // NEW: Dashboard data (optional)
  dashboardData?: {
    labels: string[];
    datasets: {
      playerDPS: number[];
      requiredDPS: number[];
      damagePerDollar: number[];
      economyEfficiency: number[];
      survivalRate: number[];
      threatLevel: number[];
    };
  };
}
```

**New Methods:**

```typescript
class LogExporter {
  // ... existing methods ...

  // MODIFIED: Accept balance data from BalanceTrackingManager
  public static async exportLog(
    logEntry: GameLogEntry,
    balanceData?: object // Optional balance data
  ): Promise<void>;

  // NEW: Format balance data for report
  private static formatBalanceData(balanceData: object): object;

  // NEW: Calculate overall balance rating
  private static calculateBalanceRating(issues: BalanceIssue[]): string;
}
```

**Integration:**

```typescript
// In GameManager when game ends
const balanceData = this.balanceTrackingManager.generateReportData();
await LogExporter.exportLog(gameLogEntry, balanceData);
```

---

## Data Models

### Balance Analysis Data Structure

```typescript
// Stored in AIPerformanceStats
{
  balanceIssues: [
    {
      type: 'INEFFICIENT_TOWERS',
      severity: 'MEDIUM',
      message: 'Damage per dollar is 12.5, below threshold of 15',
      value: 12.5,
      threshold: 15,
      recommendation: 'Build fewer towers and upgrade existing ones more'
    }
  ],
  waveDefenseAnalysis: [
    {
      wave: 5,
      canDefend: true,
      totalZombieHP: 5000,
      totalTowerDPS: 250,
      timeToReachEnd: 30,
      damageDealt: 7500,
      damageRequired: 5000,
      safetyMargin: 50, // 50% overkill capacity
      recommendation: 'Defense is adequate with 50% safety margin'
    }
  ],
  towerEfficiencies: {
    'MachineGun': {
      type: 'MachineGun',
      cost: 100,
      dps: 50,
      range: 150,
      accuracy: 0.85,
      efficiencyScore: 63.75,
      effectiveDPS: 47.5,
      breakEvenTime: 18.2
    }
  }
}
```

### Statistical Analysis Data Structure

```typescript
{
  damageOutliers: {
    mean: 1250.5,
    standardDeviation: 180.3,
    outliers: [
      { value: 2100, index: 7, deviation: 4.7 }
    ],
    hasOutliers: true
  },
  difficultyTrend: {
    trend: 'GETTING_HARDER',
    slope: 0.15,
    intercept: 100,
    rSquared: 0.92,
    confidence: 'HIGH'
  },
  wavePredictions: [
    {
      wave: 11,
      predictedDifficulty: 1850,
      recommendedDPS: 185,
      confidenceInterval: { lower: 1750, upper: 1950 }
    }
  ]
}
```

---

## Error Handling

### Library Loading Failures

```typescript
// Graceful degradation if libraries fail to load
let statisticsAvailable = false;
let regressionAvailable = false;
let mathAvailable = false;

try {
  require('simple-statistics');
  statisticsAvailable = true;
} catch (e) {
  console.warn('⚠️ simple-statistics not available. Statistical analysis disabled.');
}

// In analysis methods
if (!statisticsAvailable) {
  return {
    mean: 0,
    standardDeviation: 0,
    outliers: [],
    hasOutliers: false,
    error: 'Library not available',
  };
}
```

### Invalid Data Handling

```typescript
// Handle edge cases
static detectOutliers(values: number[]): OutlierAnalysis {
  if (!values || values.length === 0) {
    return { mean: 0, standardDeviation: 0, outliers: [], hasOutliers: false };
  }

  if (values.length === 1) {
    return { mean: values[0], standardDeviation: 0, outliers: [], hasOutliers: false };
  }

  // Normal processing
  // ...
}
```

### Performance Safeguards

```typescript
// Limit analysis frequency to avoid performance impact
private lastAnalysisTime: number = 0;
private analysisInterval: number = 10000; // 10 seconds

private performAnalysis(): void {
  const now = Date.now();
  if (now - this.lastAnalysisTime < this.analysisInterval) {
    return; // Skip analysis
  }

  const startTime = performance.now();

  // Perform analysis
  this.detectBalanceIssues();
  this.performStatisticalAnalysis();

  const elapsed = performance.now() - startTime;
  if (elapsed > 5) {
    console.warn(`⚠️ Balance analysis took ${elapsed.toFixed(2)}ms (target: <5ms)`);
  }

  this.lastAnalysisTime = now;
}
```

---

## Testing Strategy

### Unit Tests

**BalanceAnalyzer Tests:**

- Test Lanchester's Laws with known scenarios
- Test efficiency score calculations
- Test diminishing returns formula
- Test threat score calculations
- Test break-even calculations
- Test effective DPS with overkill

**StatisticalAnalyzer Tests:**

- Test outlier detection with known datasets
- Test trend analysis with linear data
- Test prediction accuracy with historical data
- Test edge cases (empty arrays, single values)

**Integration Tests:**

- Test AIPlayerManager balance analysis integration
- Test LogExporter report generation with balance data
- Test performance under load (1000 data points)

### Manual Testing Scenarios

1. **Scenario: Weak Defense**
   - Build only 2 towers
   - Verify "WEAK_DEFENSE" issue detected
   - Verify survival rate < 50%

2. **Scenario: Inefficient Towers**
   - Build many low-level towers
   - Verify "INEFFICIENT_TOWERS" issue detected
   - Verify damage per dollar < 15

3. **Scenario: Excessive Overkill**
   - Stack 10 snipers in one spot
   - Verify "EXCESSIVE_OVERKILL" issue detected
   - Verify overkill > 15%

4. **Scenario: Negative Economy**
   - Spend all money immediately
   - Verify "NEGATIVE_ECONOMY" issue detected
   - Verify economy efficiency < 100%

5. **Scenario: Difficulty Spike**
   - Play through waves 1-10
   - Verify trend analysis shows "GETTING_HARDER"
   - Verify predictions for waves 11-15

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Calculation** - Only calculate when needed
2. **Caching** - Cache expensive calculations (efficiency scores, threat scores)
3. **Throttling** - Limit analysis frequency (every 10 seconds)
4. **Batch Processing** - Process multiple data points together
5. **Early Exit** - Skip analysis if data hasn't changed

### Performance Targets

- **Per-Frame Analysis:** < 1ms
- **Periodic Analysis (10s):** < 5ms
- **End-Game Report:** < 50ms
- **Memory Overhead:** < 10MB

### Monitoring

```typescript
// Performance monitoring
const perfMonitor = {
  analysisCount: 0,
  totalTime: 0,
  maxTime: 0,

  record(elapsed: number): void {
    this.analysisCount++;
    this.totalTime += elapsed;
    this.maxTime = Math.max(this.maxTime, elapsed);
  },

  report(): void {
    const avg = this.totalTime / this.analysisCount;
    console.log(`📊 Balance Analysis Performance:`);
    console.log(`   Analyses: ${this.analysisCount}`);
    console.log(`   Avg Time: ${avg.toFixed(2)}ms`);
    console.log(`   Max Time: ${this.maxTime.toFixed(2)}ms`);
  },
};
```

---

## Integration Plan

### Phase 1: Core Balance Analyzer

1. Create `BalanceAnalyzer.ts` with all mathematical functions
2. Write unit tests for each function
3. Verify calculations match expected results
4. No game integration yet - pure math library

### Phase 2: Statistical Analyzer

1. Install npm packages (`simple-statistics`, `regression`, `mathjs`)
2. Create `StatisticalAnalyzer.ts` with library integrations
3. Write unit tests with known datasets
4. Test graceful degradation if libraries fail
5. No game integration yet - pure analysis library

### Phase 3: Balance Tracking Manager

1. Create `BalanceTrackingManager.ts` class
2. Implement event tracking methods (trackDamage, trackEconomy, etc.)
3. Implement data storage structures
4. Add to GameManager as a new manager
5. Write unit tests for tracking logic
6. No analysis yet - just data collection

### Phase 4: Analysis Integration

1. Integrate BalanceAnalyzer into BalanceTrackingManager
2. Integrate StatisticalAnalyzer into BalanceTrackingManager
3. Implement real-time analysis (every 10 seconds)
4. Implement wave-end analysis
5. Implement end-game analysis
6. Test analysis triggers and results

### Phase 5: Game System Integration

1. Add tracking calls to TowerCombatManager (trackDamage)
2. Add tracking calls to TowerPlacementManager (trackTowerPlaced, trackTowerUpgraded)
3. Add tracking calls to WaveManager (trackWaveStart, trackWaveComplete)
4. Add tracking calls to economy system (trackEconomy)
5. Test that all events are captured correctly

### Phase 6: Report Generation

1. Extend `GameLogEntry` interface in LogExporter
2. Implement report data generation in BalanceTrackingManager
3. Modify LogExporter to accept and format balance data
4. Test report generation with balance data
5. Verify backward compatibility (reports work without balance data)

### Phase 7: Testing & Validation

1. Run full playtest sessions with tracking enabled
2. Verify all metrics are accurate
3. Validate predictions against actual outcomes
4. Performance profiling (ensure < 5ms per analysis)
5. Test with AI enabled and disabled
6. Test with manual play

### Phase 8: Documentation

1. Update design docs with examples
2. Create developer guide for using balance analysis
3. Document all formulas and thresholds
4. Create troubleshooting guide

---

## Configuration

### Balance Thresholds

```typescript
// src/config/balanceConfig.ts
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
    SAFETY_MARGIN_MIN: 20, // 20% overkill capacity
  },

  DIMINISHING_RETURNS: {
    TOWER_STACKING_FACTOR: 100,
    EFFICIENCY_REDUCTION_PER_DUPLICATE: 0.9, // 90% efficiency
  },

  STATISTICAL: {
    OUTLIER_THRESHOLD: 2, // standard deviations
    CONFIDENCE_HIGH_R_SQUARED: 0.85,
    CONFIDENCE_MEDIUM_R_SQUARED: 0.65,
  },

  PERFORMANCE: {
    ANALYSIS_INTERVAL_MS: 10000, // 10 seconds
    MAX_ANALYSIS_TIME_MS: 5,
  },
};
```

---

## Dependencies

### NPM Packages

```json
{
  "dependencies": {
    "simple-statistics": "^7.8.3",
    "regression": "^2.0.1",
    "mathjs": "^12.0.0"
  }
}
```

### Installation

```bash
npm install simple-statistics regression mathjs
npm install --save-dev @types/regression
```

---

## Future Enhancements

### Phase 2 Features (Out of Scope for Initial Release)

1. **Visual Dashboard UI** - Real-time charts using Chart.js
2. **Multi-Session Analysis** - Compare balance across multiple playtests
3. **Automated Balance Adjustments** - Suggest specific config changes
4. **Machine Learning Models** - Predict player behavior patterns
5. **A/B Testing Framework** - Compare different balance configurations
6. **Historical Tracking** - Track balance changes across game versions

---

## Backward Compatibility

### Ensuring No Breaking Changes

1. **Optional Fields** - All new fields in interfaces are optional
2. **Default Values** - Provide sensible defaults if analysis fails
3. **Feature Flags** - Allow disabling balance analysis entirely
4. **Graceful Degradation** - System works without libraries
5. **Report Format** - Maintain existing report structure, add new sections

### Migration Path

```typescript
// Old reports still work
const oldReport: GameLogEntry = {
  timestamp: '...',
  gameData: { ... },
  aiData: { ... },
  combatStats: { ... },
  // balanceAnalysis is optional
};

// New reports include balance analysis
const newReport: GameLogEntry = {
  ...oldReport,
  balanceAnalysis: { ... },
  statisticalAnalysis: { ... },
  dashboardData: { ... }
};
```

---

## Security Considerations

- No external API calls (all processing local)
- No sensitive data in reports
- File system access limited to report directory
- Input validation on all user-provided data
- Safe math operations (no division by zero)

---

## Accessibility

- Console output uses clear, readable formatting
- Color-coded warnings (⚠️, ❌, ✅)
- Structured JSON reports for programmatic access
- Human-readable recommendations in plain English

---

_Design Version: 1.0_  
_Last Updated: 2025-10-15_
