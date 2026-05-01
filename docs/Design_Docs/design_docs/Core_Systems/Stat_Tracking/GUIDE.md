# Stat Tracking Implementation Guide

## Overview

Z-TD includes a comprehensive stat tracking system that generates detailed JSON reports for both AI and manual gameplay sessions. Reports are saved to `player_reports/` and include 5 major metric categories covering combat, economy, efficiency, and timeline data.

## Architecture

### System Components

The stat tracking system consists of three main components:

1. **LogExporter** (`src/utils/LogExporter.ts`)
   - Handles report generation and storage
   - Manages localStorage backup
   - Communicates with report server
   - Formats balance data for reports

2. **AIPlayerManager** (`src/managers/AIPlayerManager.ts`)
   - Tracks metrics during gameplay
   - Maintains performance statistics
   - Exports data at session end
   - Integrates with combat and economy systems

3. **Report Server** (`server.js`)
   - Receives report data via HTTP POST
   - Saves reports to `player_reports/` directory
   - Runs on port 3001
   - Required for file system access

### Data Flow

```
Gameplay → AIPlayerManager (tracking) → LogExporter (formatting) → Report Server (saving)
                                     ↓
                              localStorage (backup)
```

## Report Structure

### GameLogEntry Interface

The complete report structure is defined by the `GameLogEntry` interface:

```typescript
interface GameLogEntry {
  timestamp: string;           // ISO format
  sessionId: string;           // Unique session identifier
  isAIRun: boolean;           // AI vs manual gameplay
  duration: number;           // Session duration in ms
  startTime: string;          // ISO format
  endTime: string;            // ISO format
  gameData: { ... };          // Basic outcome data
  aiData: { ... };            // AI decision data
  combatStats: { ... };       // Combat performance
  economyStats: { ... };      // Economic performance
  efficiencyStats: { ... };   // Cost-effectiveness
  timelineStats: { ... };     // Temporal snapshots
  balanceAnalysis?: { ... };  // Optional balance data
  statisticalAnalysis?: { ... }; // Optional statistical data
  dashboardData?: { ... };    // Optional visualization data
}
```

### Section Details

#### 1. Game Data

Basic outcome information:

- `highestWave`: Maximum wave reached
- `finalMoney`: Money at session end
- `finalLives`: Lives remaining
- `startLives`: Initial lives
- `survivalRate`: Percentage of lives retained
- `livesLost`: Total lives lost

#### 2. AI Data

AI decision-making metrics:

- `towersBuilt`: Total towers placed
- `towersUpgraded`: Total upgrades performed
- `moneySpent`: Total expenditure
- `moneyEarned`: Total income
- `peakMoney`: Maximum money held
- `lowestLives`: Minimum lives reached
- `averageBuildRate`: Towers per minute
- `towerComposition`: Count by tower type
- `upgradeDistribution`: Upgrade levels by type
- `waveStats`: Per-wave performance data

#### 3. Combat Stats

Combat performance metrics:

- `totalDamageDealt`: Cumulative damage
- `totalZombiesKilled`: Total kills
- `averageDPS`: Mean damage per second
- `peakDPS`: Maximum DPS achieved
- `damageByTowerType`: Damage breakdown
- `killsByTowerType`: Kill breakdown
- `damagePerWave`: Per-wave damage array
- `killsPerWave`: Per-wave kills array
- `overkillDamage`: Wasted damage
- `accuracyRate`: Hit percentage
- `shotsHit`: Successful shots
- `shotsMissed`: Failed shots

#### 4. Economy Stats

Economic performance metrics:

- `moneyTimeline`: Snapshots every 5 seconds
- `moneyPerWave`: Income per wave
- `moneySpentPerWave`: Expenses per wave
- `netIncomePerWave`: Profit/loss per wave
- `averageMoneyPerSecond`: Mean income rate
- `peakMoneyPerSecond`: Maximum income rate
- `totalIncome`: Cumulative earnings
- `totalExpenses`: Cumulative spending
- `netProfit`: Total profit/loss
- `economyEfficiency`: Income/expense ratio
- `bankruptcyEvents`: Times money reached zero
- `cashFlowTrend`: GROWING/STABLE/DECLINING

#### 5. Efficiency Stats

Cost-effectiveness metrics:

- `damagePerDollar`: Damage per money spent
- `killsPerDollar`: Kills per money spent
- `damagePerTower`: Average damage per tower
- `killsPerTower`: Average kills per tower
- `upgradeEfficiency`: Damage per upgrade
- `resourceUtilization`: Money usage percentage
- `towerDensity`: Total towers built
- `averageUpgradeLevel`: Mean upgrade level
- `costEfficiencyRating`: EXCELLENT/GOOD/FAIR/POOR

#### 6. Timeline Stats

Temporal snapshot data:

- `snapshots`: Array of game state snapshots
  - Captured every 10 seconds
  - Includes: time, wave, money, lives, towers, zombies, DPS
- `snapshotInterval`: Snapshot frequency (10000ms)

## Implementation Details

### Automatic Tracking

The following metrics are tracked automatically by the system:

#### Money Timeline (Every 5 Seconds)

```typescript
if (now - this.stats.lastMoneySnapshot >= 5000) {
  this.stats.moneyTimeline.push({
    time: now - this.stats.startTime,
    money: currentMoney,
    wave: currentWave,
  });

  // Check for bankruptcy
  if (currentMoney === 0 && this.stats.lastMoneyAmount > 0) {
    this.stats.bankruptcyEvents++;
  }

  this.stats.lastMoneyAmount = currentMoney;
  this.stats.lastSnapshotTime = now;
}
```

#### Game State Snapshots (Every 10 Seconds)

```typescript
if (now - this.stats.lastSnapshotTime >= 10000) {
  this.stats.snapshots.push({
    time: now - this.stats.startTime,
    wave: currentWave,
    money: currentMoney,
    lives: this.gameManager.getLives(),
    towersActive: placementManager.getPlacedTowers().length,
    zombiesAlive: zombieManager.getZombies().length,
    currentDPS: this.calculateCurrentDPS(),
  });

  this.stats.lastSnapshotTime = now;
}
```

#### DPS Tracking (Every Second)

```typescript
if (now - this.stats.lastDPSCheck >= 1000) {
  const currentDPS = this.stats.damageInLastSecond;
  if (currentDPS > this.stats.peakDPS) {
    this.stats.peakDPS = currentDPS;
  }
  this.stats.damageInLastSecond = 0;
  this.stats.lastDPSCheck = now;
}
```

#### Peak Values

```typescript
// Track peak money
if (money > this.stats.peakMoney) {
  this.stats.peakMoney = money;
}

// Track lowest lives
const currentLives = this.gameManager.getLives();
if (currentLives < this.stats.lowestLives) {
  this.stats.lowestLives = currentLives;
}
```

### Manual Integration

Some metrics require explicit integration with game systems:

#### Combat Damage Tracking

Call from combat system when damage is dealt:

```typescript
// In TowerCombatManager or similar
const aiManager = this.gameManager.getAIPlayerManager();
if (aiManager.isEnabled()) {
  aiManager.trackDamage(damageAmount, tower.getType(), zombieWasKilled, overkillAmount);
}
```

Implementation in AIPlayerManager:

```typescript
public trackDamage(
  damage: number,
  towerType: string,
  killed: boolean,
  overkill: number
): void {
  if (!this.enabled) return;

  this.stats.totalDamageDealt += damage;
  this.stats.damageInLastSecond += damage;

  const currentDamage = this.stats.damageByTowerType.get(towerType) || 0;
  this.stats.damageByTowerType.set(towerType, currentDamage + damage);

  if (killed) {
    this.stats.zombiesKilled++;
    const currentKills = this.stats.killsByTowerType.get(towerType) || 0;
    this.stats.killsByTowerType.set(towerType, currentKills + 1);
    this.stats.overkillDamage += overkill;
  }
}
```

#### Shot Accuracy Tracking

Call from tower when shooting:

```typescript
// In Tower class
const aiManager = this.gameManager.getAIPlayerManager();
if (aiManager.isEnabled()) {
  aiManager.trackShot(projectileHit);
}
```

Implementation in AIPlayerManager:

```typescript
public trackShot(hit: boolean): void {
  if (!this.enabled) return;

  if (hit) {
    this.stats.shotsHit++;
  } else {
    this.stats.shotsMissed++;
  }
}
```

### Wave Completion Tracking

Automatically tracked when wave completes:

```typescript
private trackWaveCompletion(): void {
  const currentMoney = this.gameManager.getMoney();

  // Track money earned this wave
  const moneyEarned = currentMoney - (this.stats.lastMoneyAmount || this.stats.startMoney);
  this.stats.moneyPerWave.push(Math.max(0, moneyEarned));

  // Track wave time
  if (this.currentWaveStartTime > 0) {
    const waveTime = Date.now() - this.currentWaveStartTime;
    this.stats.waveCompletionTimes.push(waveTime);

    const livesLost = this.currentWaveLivesStart - this.gameManager.getLives();
    this.stats.livesLostPerWave.push(livesLost);

    this.stats.towersBuiltPerWave.push(this.currentWaveTowersBuilt);
    this.stats.decisionsPerWave.push(this.currentWaveDecisions);
  }
}
```

## Report Generation

### Export Process

Reports are generated when:

1. AI player is disabled
2. Game ends (victory/defeat)
3. Player manually stops

The export process:

```typescript
private exportStats(): void {
  // 1. Calculate all metrics
  const duration = Date.now() - this.stats.startTime;
  const survivalRate = (currentLives / this.stats.startLives) * 100;
  // ... more calculations

  // 2. Convert Maps to plain objects
  const towerComposition: Record<string, number> = {};
  this.stats.towerComposition.forEach((count, type) => {
    towerComposition[type] = count;
  });

  // 3. Build GameLogEntry object
  const logEntry: GameLogEntry = {
    timestamp: new Date(this.stats.startTime).toISOString(),
    sessionId: LogExporter.getSessionId(),
    isAIRun: true,
    duration: duration,
    // ... all sections
  };

  // 4. Get balance data if enabled
  let balanceData: Record<string, unknown> | undefined;
  if (balanceTrackingManager?.isEnabled()) {
    balanceData = balanceTrackingManager.generateReportData();
  }

  // 5. Export via LogExporter
  LogExporter.exportLog(logEntry, balanceData);
}
```

### Server Communication

LogExporter sends reports to the server:

```typescript
private static async saveToServer(
  filename: string,
  data: GameLogEntry
): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/api/save-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, data }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Report saved to: ${result.filepath}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
```

### localStorage Backup

If server is unavailable, reports store in localStorage:

```typescript
private static storeLog(filename: string, logEntry: GameLogEntry): void {
  const logs = this.getStoredLogs();
  logs[filename] = logEntry;

  // Limit to MAX_STORED_LOGS (100)
  const logKeys = Object.keys(logs);
  if (logKeys.length > this.MAX_STORED_LOGS) {
    const sortedKeys = logKeys.sort();
    const toRemove = sortedKeys.slice(0, logKeys.length - this.MAX_STORED_LOGS);
    toRemove.forEach(key => delete logs[key]);
  }

  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
}
```

## Calculations and Ratings

### Performance Rating

Based on highest wave reached:

```typescript
public static getPerformanceRating(wave: number): string {
  if (wave >= 20) return '⭐⭐⭐⭐⭐ EXCELLENT';
  if (wave >= 15) return '⭐⭐⭐⭐ GREAT';
  if (wave >= 10) return '⭐⭐⭐ GOOD';
  if (wave >= 5) return '⭐⭐ FAIR';
  return '⭐ NEEDS IMPROVEMENT';
}
```

### Defense Rating

Based on survival rate:

```typescript
public static getDefenseRating(survivalRate: number): string {
  if (survivalRate === 100) return '🛡️ PERFECT DEFENSE';
  if (survivalRate >= 80) return '🛡️ STRONG DEFENSE';
  if (survivalRate >= 50) return '⚠️ MODERATE DEFENSE';
  return '❌ WEAK DEFENSE';
}
```

### Cost Efficiency Rating

Based on damage per dollar:

```typescript
let costEfficiencyRating = 'POOR';
if (damagePerDollar > 100) {
  costEfficiencyRating = 'EXCELLENT';
} else if (damagePerDollar > 50) {
  costEfficiencyRating = 'GOOD';
} else if (damagePerDollar > 25) {
  costEfficiencyRating = 'FAIR';
}
```

### Cash Flow Trend

Based on recent net income:

```typescript
let cashFlowTrend = 'STABLE';
if (netIncomePerWave.length >= 3) {
  const recent = netIncomePerWave.slice(-3);
  const increasing = recent.every((val, i) => i === 0 || val >= recent[i - 1]);
  const decreasing = recent.every((val, i) => i === 0 || val <= recent[i - 1]);
  if (increasing) cashFlowTrend = 'GROWING';
  else if (decreasing) cashFlowTrend = 'DECLINING';
}
```

### Balance Rating

Based on detected issues:

```typescript
private static calculateBalanceRating(
  issues: Array<{ severity: string }>
): string {
  if (issues.length === 0) return 'EXCELLENT';

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;
  const mediumCount = issues.filter(i => i.severity === 'MEDIUM').length;

  if (criticalCount > 0) return 'CRITICAL';
  if (highCount >= 2) return 'POOR';
  if (highCount === 1 || mediumCount >= 3) return 'FAIR';
  if (mediumCount > 0) return 'GOOD';

  return 'EXCELLENT';
}
```

## Testing and Debugging

### Console Logging

AI manager logs performance every 10 seconds:

```typescript
private logPerformanceStats(): void {
  const elapsed = (Date.now() - this.stats.startTime) / 1000;

  console.log('🤖 ─────────────────────────────────────────────────────');
  console.log(`🤖 AI Performance Report (${Math.floor(elapsed)}s elapsed)`);
  console.log(`🤖 Wave: ${currentWave} (highest: ${this.stats.highestWave})`);
  console.log(`🤖 Lives: ${currentLives} (lost: ${livesLost})`);
  console.log(`🤖 Money: ${currentMoney} (spent: ${this.stats.moneySpent})`);
  console.log(`🤖 Towers Built: ${this.stats.towersBuilt}`);
  console.log(`🤖 Towers Upgraded: ${this.stats.towersUpgraded}`);
  // ... tower composition
}
```

### Validation Checklist

When reviewing reports, verify:

- ✅ All required fields present
- ✅ No NaN or undefined values
- ✅ Maps converted to plain objects
- ✅ Timestamps in ISO format
- ✅ Percentages between 0-100
- ✅ Ratings use correct format
- ✅ Arrays have expected lengths
- ✅ Calculations are accurate

### Common Issues

#### Reports Not Saving

**Problem**: Reports not appearing in `player_reports/`

**Diagnosis**:

1. Check if server is running (look for "🚀 Report server running")
2. Check browser console for fetch errors
3. Check server console for POST requests

**Solution**:

- Start with `npm run dev:full` instead of `npm run dev`
- If server crashed, restart it
- Use recovery mode: `LogExporter.exportAllLogs()`

#### Missing Combat Stats

**Problem**: Combat stats show 0 or undefined

**Diagnosis**:

1. Check if `trackDamage()` is being called
2. Check if `trackShot()` is being called
3. Verify AI is enabled during gameplay

**Solution**:

- Integrate tracking calls in combat system
- Add console.log to verify calls
- Check that `aiManager.isEnabled()` returns true

#### Incorrect Calculations

**Problem**: Efficiency metrics seem wrong

**Diagnosis**:

1. Check for division by zero
2. Verify all costs are tracked
3. Check Map to object conversions
4. Verify timing calculations

**Solution**:

- Add guards for zero denominators
- Ensure all spending tracked in `moneySpent`
- Verify Maps are properly converted
- Use `Date.now()` consistently

## Adding New Metrics

To add a new metric to the tracking system:

### 1. Update Interfaces

Add field to `GameLogEntry` in `LogExporter.ts`:

```typescript
export interface GameLogEntry {
  // ... existing fields
  newMetricSection?: {
    newMetric: number;
    anotherMetric: string;
  };
}
```

### 2. Update AIPerformanceStats

Add tracking fields in `AIPlayerManager.ts`:

```typescript
interface AIPerformanceStats {
  // ... existing fields
  newMetricValue: number;
  newMetricHistory: number[];
}
```

### 3. Initialize in createEmptyStats()

```typescript
private createEmptyStats(): AIPerformanceStats {
  return {
    // ... existing fields
    newMetricValue: 0,
    newMetricHistory: [],
  };
}
```

### 4. Track Values

Add tracking logic:

```typescript
// In trackMetrics() for automatic tracking
private trackMetrics(deltaTime: number): void {
  // ... existing tracking
  this.stats.newMetricValue = this.calculateNewMetric();
}

// Or create dedicated method for manual tracking
public trackNewMetric(value: number): void {
  if (!this.enabled) return;
  this.stats.newMetricValue += value;
  this.stats.newMetricHistory.push(value);
}
```

### 5. Export in exportStats()

```typescript
private exportStats(): void {
  // ... existing calculations

  const logEntry: GameLogEntry = {
    // ... existing sections
    newMetricSection: {
      newMetric: this.stats.newMetricValue,
      anotherMetric: this.calculateAnotherMetric(),
    },
  };

  LogExporter.exportLog(logEntry);
}
```

### 6. Document

Update documentation:

- Add to quick reference in steering rule
- Document calculation in this guide
- Add to code examples
- Update benchmarks if applicable

## Best Practices

### Performance

- Use efficient data structures (Maps for lookups)
- Batch calculations in export phase
- Avoid tracking in hot loops
- Use appropriate snapshot intervals

### Accuracy

- Track at source (combat system, economy system)
- Use consistent timing (Date.now())
- Handle edge cases (division by zero)
- Validate data before export

### Maintainability

- Follow naming conventions
- Document calculations
- Keep interfaces up to date
- Add validation checks
- Write clear error messages

### Testing

- Test with AI enabled/disabled
- Test with server running/stopped
- Test recovery mode
- Verify all calculations
- Check edge cases (wave 1, game over, etc.)

## See Also

- [Code Examples](./EXAMPLES.md) - Implementation examples
- [Quick Reference](../../../.kiro/steering/features/stats.md) - Steering rule
- Example Reports in `player_reports/`
