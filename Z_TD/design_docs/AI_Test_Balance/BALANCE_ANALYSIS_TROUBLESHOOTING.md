# Balance Analysis - Troubleshooting Guide

Quick solutions to common problems with the balance analysis system.

---

## Table of Contents

1. [System Not Running](#system-not-running)
2. [Inaccurate Results](#inaccurate-results)
3. [Performance Issues](#performance-issues)
4. [Missing Data](#missing-data)
5. [Library Errors](#library-errors)
6. [Integration Issues](#integration-issues)
7. [Report Problems](#report-problems)
8. [Configuration Issues](#configuration-issues)

---

## System Not Running

### Problem: No Balance Analysis Output

**Symptoms**:

- No console messages about balance issues
- Reports don't include balance analysis section
- `getBalanceIssues()` returns empty array

**Diagnostic Steps**:

```typescript
// Check if tracking is enabled
const isEnabled = gameManager.getBalanceTrackingManager().isEnabled();
console.log('Tracking enabled:', isEnabled);

// Check if manager exists
const manager = gameManager.getBalanceTrackingManager();
console.log('Manager exists:', manager !== null);

// Check last analysis time
console.log('Last analysis:', manager.getLastAnalysisTime());
```

**Solutions**:

1. **Enable tracking manually**:

```typescript
gameManager.getBalanceTrackingManager().enable();
```

2. **Check initialization**:

```typescript
// In GameManager constructor
this.balanceTrackingManager = new BalanceTrackingManager(this);
```

3. **Verify update loop**:

```typescript
// In GameManager.update()
this.balanceTrackingManager.update(deltaTime);
```

4. **Check analysis interval**:

```typescript
// May be set too high
BalanceConfig.PERFORMANCE.ANALYSIS_INTERVAL_MS = 10000; // 10 seconds
```

---

### Problem: Tracking Enabled But No Analysis

**Symptoms**:

- `isEnabled()` returns true
- No analysis results
- No console output

**Diagnostic Steps**:

```typescript
// Force immediate analysis
gameManager.getBalanceTrackingManager().update(999999);

// Check for errors
try {
  gameManager.getBalanceTrackingManager().performRealTimeAnalysis();
} catch (e) {
  console.error('Analysis error:', e);
}
```

**Solutions**:

1. **Check data collection**:

```typescript
const data = gameManager.getBalanceTrackingManager().getData();
console.log('Damage events:', data.damageEvents.length);
console.log('Tower events:', data.towerEvents.length);
```

2. **Verify integration points**:

- TowerCombatManager calling `trackDamage()`
- TowerPlacementManager calling `trackTowerPlaced()`
- WaveManager calling `trackWaveStart()`

3. **Check for silent failures**:

```typescript
// Add debug logging to BalanceTrackingManager
console.log('Performing analysis...');
const issues = BalanceAnalyzer.detectBalanceIssues(stats);
console.log('Issues found:', issues.length);
```

---

## Inaccurate Results

### Problem: Wrong DPS Calculations

**Symptoms**:

- DPS values don't match expected
- Wave defense analysis incorrect
- Efficiency scores seem wrong

**Diagnostic Steps**:

```typescript
// Check tower stats
const towers = gameManager.getTowerManager().getAllTowers();
towers.forEach(tower => {
  console.log(`${tower.getType()}: ${tower.getDPS()} DPS`);
});

// Check damage tracking
const damageEvents = gameManager.getBalanceTrackingManager().getData().damageEvents;
console.log('Total damage events:', damageEvents.length);
console.log('Sample event:', damageEvents[0]);
```

**Solutions**:

1. **Verify damage tracking integration**:

```typescript
// In TowerCombatManager
const overkill = Math.max(0, damage - zombie.getHealth());
gameManager
  .getBalanceTrackingManager()
  .trackDamage(tower.getType(), damage, zombie.getHealth() <= 0, overkill);
```

2. **Check DPS calculation**:

```typescript
// In BalanceTrackingManager
private calculateCurrentDPS(): number {
  const recentDamage = this.data.damageEvents
    .filter(e => e.time > Date.now() - 1000)
    .reduce((sum, e) => sum + e.damage, 0);
  return recentDamage; // Damage in last second = DPS
}
```

3. **Verify tower stats**:

```typescript
// Check if tower stats are correct
const tower = towerFactory.createTower('MachineGun');
console.log('Expected DPS:', 50);
console.log('Actual DPS:', tower.getDPS());
```

---

### Problem: Incorrect Wave Defense Predictions

**Symptoms**:

- Says can defend but player loses
- Says cannot defend but player wins
- Safety margins way off

**Diagnostic Steps**:

```typescript
// Check path length
const pathLength = gameManager.getPathManager().getPathLength();
console.log('Path length:', pathLength);

// Check zombie speed
const zombie = zombieFactory.createZombie('BASIC');
console.log('Zombie speed:', zombie.getSpeed());

// Check time calculation
const timeToEnd = pathLength / zombie.getSpeed();
console.log('Time to reach end:', timeToEnd);
```

**Solutions**:

1. **Verify path length calculation**:

```typescript
// Ensure path length is accurate
const path = gameManager.getPathManager().getPath();
let totalLength = 0;
for (let i = 0; i < path.length - 1; i++) {
  const dx = path[i + 1].x - path[i].x;
  const dy = path[i + 1].y - path[i].y;
  totalLength += Math.sqrt(dx * dx + dy * dy);
}
```

2. **Check zombie speed scaling**:

```typescript
// Verify speed scales with wave
const baseSpeed = 50;
const waveMultiplier = 1 + (wave - 1) * 0.05;
const actualSpeed = baseSpeed * waveMultiplier;
```

3. **Account for tower range**:

```typescript
// Zombies may be in range longer than path length suggests
const effectivePathLength = pathLength + averageTowerRange * 0.5;
```

---

### Problem: False Positive Balance Issues

**Symptoms**:

- Issues flagged incorrectly
- Thresholds seem wrong
- Too many warnings

**Solutions**:

1. **Adjust thresholds for game mode**:

```typescript
// Easy mode
BalanceConfig.THRESHOLDS.DAMAGE_PER_DOLLAR_MIN = 10;
BalanceConfig.THRESHOLDS.SURVIVAL_RATE_MIN = 40;

// Hard mode
BalanceConfig.THRESHOLDS.DAMAGE_PER_DOLLAR_MIN = 20;
BalanceConfig.THRESHOLDS.SURVIVAL_RATE_MIN = 60;
```

2. **Check data quality**:

```typescript
// Ensure enough data collected
if (damageEvents.length < 10) {
  console.warn('Not enough data for accurate analysis');
  return;
}
```

3. **Review issue detection logic**:

```typescript
// May need to adjust formulas
const damagePerDollar = totalDamage / totalSpent;
if (damagePerDollar < threshold && totalSpent > 500) {
  // Only flag if significant spending
  issues.push(inefficientTowersIssue);
}
```

---

## Performance Issues

### Problem: Frame Rate Drops

**Symptoms**:

- Game stutters when analysis runs
- FPS drops every 10 seconds
- Analysis takes > 5ms

**Diagnostic Steps**:

```typescript
// Profile analysis time
const start = performance.now();
gameManager.getBalanceTrackingManager().update(deltaTime);
const elapsed = performance.now() - start;
console.log('Analysis time:', elapsed, 'ms');

// Check data size
const data = gameManager.getBalanceTrackingManager().getData();
console.log('Damage events:', data.damageEvents.length);
console.log('Tower events:', data.towerEvents.length);
console.log('Wave events:', data.waveEvents.length);
```

**Solutions**:

1. **Increase analysis interval**:

```typescript
// Run less frequently
BalanceConfig.PERFORMANCE.ANALYSIS_INTERVAL_MS = 15000; // 15 seconds
```

2. **Limit data retention**:

```typescript
// Keep only recent events
private pruneOldEvents(): void {
  const cutoff = Date.now() - 60000; // Keep last 60 seconds
  this.data.damageEvents = this.data.damageEvents.filter(e => e.time > cutoff);
}
```

3. **Optimize calculations**:

```typescript
// Cache expensive calculations
private cachedEfficiencies: Map<string, TowerEfficiency> = new Map();

private getTowerEfficiency(type: string): TowerEfficiency {
  if (this.cachedEfficiencies.has(type)) {
    return this.cachedEfficiencies.get(type)!;
  }
  const efficiency = BalanceAnalyzer.analyzeTowerEfficiency(...);
  this.cachedEfficiencies.set(type, efficiency);
  return efficiency;
}
```

4. **Disable expensive features**:

```typescript
// Skip statistical analysis if too slow
if (elapsed > 3) {
  console.warn('Skipping statistical analysis due to performance');
  return;
}
```

---

### Problem: Memory Leaks

**Symptoms**:

- Memory usage grows over time
- Game slows down after many waves
- Browser tab crashes

**Diagnostic Steps**:

```typescript
// Check array sizes
const data = gameManager.getBalanceTrackingManager().getData();
console.log('Memory usage estimate:');
console.log('Damage events:', data.damageEvents.length * 100, 'bytes');
console.log('Economy events:', data.economyEvents.length * 80, 'bytes');
console.log('Timeline snapshots:', data.timelineSnapshots.length * 120, 'bytes');
```

**Solutions**:

1. **Implement data pruning**:

```typescript
// Limit array sizes
private readonly MAX_EVENTS = 1000;

private addDamageEvent(event: DamageEvent): void {
  this.data.damageEvents.push(event);
  if (this.data.damageEvents.length > this.MAX_EVENTS) {
    this.data.damageEvents.shift(); // Remove oldest
  }
}
```

2. **Clear data on reset**:

```typescript
public reset(): void {
  this.data = this.createEmptyData();
  this.cachedEfficiencies.clear();
  this.analysisResults = [];
}
```

3. **Use object pooling**:

```typescript
// Reuse event objects
private eventPool: DamageEvent[] = [];

private getDamageEvent(): DamageEvent {
  return this.eventPool.pop() || { time: 0, damage: 0, ... };
}

private recycleDamageEvent(event: DamageEvent): void {
  this.eventPool.push(event);
}
```

---

## Missing Data

### Problem: No Combat Stats

**Symptoms**:

- `totalDamageDealt` is 0
- `damageByTowerType` is empty
- Combat analysis missing

**Solutions**:

1. **Integrate damage tracking**:

```typescript
// In TowerCombatManager or Tower class
if (gameManager.getBalanceTrackingManager().isEnabled()) {
  gameManager
    .getBalanceTrackingManager()
    .trackDamage(this.type, damage, zombieKilled, overkillAmount);
}
```

2. **Verify tracking is called**:

```typescript
// Add debug logging
public trackDamage(towerType: string, damage: number, killed: boolean, overkill: number): void {
  console.log('Tracking damage:', towerType, damage);
  // ... rest of method
}
```

3. **Check timing**:

```typescript
// Ensure tracking happens before zombie is destroyed
const zombieHP = zombie.getHealth();
const damage = this.calculateDamage();
const killed = damage >= zombieHP;
const overkill = killed ? damage - zombieHP : 0;

// Track BEFORE applying damage
this.trackDamage(this.type, damage, killed, overkill);

// Then apply damage
zombie.takeDamage(damage);
```

---

### Problem: No Economy Stats

**Symptoms**:

- `moneyTimeline` is empty
- `economyEfficiency` is 0
- Economy analysis missing

**Solutions**:

1. **Integrate economy tracking**:

```typescript
// When money is earned
gameManager.getBalanceTrackingManager().trackEconomy('EARN', amount);

// When tower is built
gameManager.getBalanceTrackingManager().trackEconomy('BUILD', cost);

// When tower is upgraded
gameManager.getBalanceTrackingManager().trackEconomy('UPGRADE', cost);
```

2. **Verify automatic tracking**:

```typescript
// In BalanceTrackingManager.update()
if (this.shouldSnapshotMoney()) {
  const money = this.gameManager.getPlayerMoney();
  this.data.moneyTimeline.push({
    time: Date.now(),
    money: money,
    wave: this.gameManager.getCurrentWave(),
  });
}
```

---

### Problem: No Wave Stats

**Symptoms**:

- `waveDefenseAnalysis` is empty
- Wave predictions missing
- No wave-specific data

**Solutions**:

1. **Integrate wave tracking**:

```typescript
// In WaveManager.startWave()
gameManager.getBalanceTrackingManager().trackWaveStart(waveNumber);

// In WaveManager.completeWave()
gameManager.getBalanceTrackingManager().trackWaveComplete(waveNumber, zombiesKilled, livesLost);
```

2. **Verify wave analysis triggers**:

```typescript
// In BalanceTrackingManager
public trackWaveComplete(wave: number, zombiesKilled: number, livesLost: number): void {
  // Store wave data
  this.data.waveEvents.push({ wave, zombiesKilled, livesLost });

  // Trigger wave analysis
  this.performWaveAnalysis();
}
```

---

## Library Errors

### Problem: "simple-statistics not available"

**Symptoms**:

- Warning in console about missing library
- Statistical analysis disabled
- Outlier detection not working

**Solutions**:

1. **Install dependencies**:

```bash
npm install simple-statistics
npm install @types/simple-statistics --save-dev
```

2. **Verify installation**:

```bash
npm list simple-statistics
```

3. **Check imports**:

```typescript
// In StatisticalAnalyzer.ts
import * as ss from 'simple-statistics';

// Test import
console.log('simple-statistics loaded:', typeof ss.mean === 'function');
```

4. **Graceful degradation**:

```typescript
// System should continue without library
let statisticsAvailable = false;
try {
  require('simple-statistics');
  statisticsAvailable = true;
} catch (e) {
  console.warn('⚠️ simple-statistics not available. Statistical analysis disabled.');
}
```

---

### Problem: "regression not available"

**Symptoms**:

- Warning about missing regression library
- Predictions not working
- Trend analysis disabled

**Solutions**:

1. **Install dependencies**:

```bash
npm install regression
npm install @types/regression --save-dev
```

2. **Check import**:

```typescript
import regression from 'regression';

// Test
const result = regression.linear([
  [0, 0],
  [1, 1],
]);
console.log('Regression working:', result.equation);
```

---

### Problem: "mathjs not available"

**Symptoms**:

- Warning about missing mathjs
- Matrix operations failing
- Advanced calculations disabled

**Solutions**:

1. **Install dependencies**:

```bash
npm install mathjs
```

2. **Check import**:

```typescript
import { create, all } from 'mathjs';
const math = create(all);

// Test
console.log('mathjs working:', math.sqrt(4) === 2);
```

---

## Integration Issues

### Problem: TypeScript Errors

**Symptoms**:

- Compilation errors
- Type mismatches
- Missing properties

**Solutions**:

1. **Check interface definitions**:

```typescript
// Ensure interfaces match implementation
interface BalanceIssue {
  type: string;
  severity: string;
  message: string;
  value: number;
  threshold: number;
  recommendation: string;
}
```

2. **Verify type imports**:

```typescript
import type { BalanceIssue, TowerEfficiency } from '@utils/BalanceAnalyzer';
```

3. **Check optional properties**:

```typescript
// Use optional chaining
const issues = gameManager.getBalanceTrackingManager()?.getBalanceIssues() ?? [];
```

---

### Problem: Circular Dependencies

**Symptoms**:

- Import errors
- Undefined at runtime
- Module resolution issues

**Solutions**:

1. **Use dependency injection**:

```typescript
// Pass GameManager to BalanceTrackingManager
constructor(private gameManager: GameManager) {
  // Don't import GameManager, receive it
}
```

2. **Use interfaces instead of classes**:

```typescript
// Define interface in separate file
interface IGameManager {
  getCurrentWave(): number;
  getPlayerMoney(): number;
}

// Use interface instead of class
constructor(private gameManager: IGameManager) {}
```

---

## Report Problems

### Problem: Reports Don't Include Balance Data

**Symptoms**:

- `balanceAnalysis` section missing
- Reports look like old format
- No statistical analysis

**Solutions**:

1. **Check report generation**:

```typescript
// In GameManager when game ends
const balanceData = this.balanceTrackingManager.generateReportData();
await LogExporter.exportLog(gameLogEntry, balanceData);
```

2. **Verify LogExporter integration**:

```typescript
// In LogExporter.exportLog()
public static async exportLog(
  logEntry: GameLogEntry,
  balanceData?: object
): Promise<void> {
  if (balanceData) {
    logEntry.balanceAnalysis = this.formatBalanceData(balanceData);
  }
  // ... rest of export
}
```

3. **Check data format**:

```typescript
// Ensure Maps are converted to objects
const reportData = {
  towerEfficiencies: Object.fromEntries(this.towerEfficiencies),
  threatScores: Object.fromEntries(this.threatScores),
};
```

---

### Problem: Report Server Not Saving Files

**Symptoms**:

- Reports not in `player_reports/` folder
- Only saved to localStorage
- Server errors in console

**Solutions**:

1. **Start report server**:

```bash
npm run dev:full
# or
node server.js
```

2. **Check server is running**:

```bash
# Should see: Server running on http://localhost:3000
```

3. **Verify server endpoint**:

```typescript
// In LogExporter
const response = await fetch('http://localhost:3000/save-log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(logEntry),
});
```

4. **Check CORS settings**:

```javascript
// In server.js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
```

---

## Configuration Issues

### Problem: Thresholds Don't Match Game

**Symptoms**:

- Too many false positives
- Issues not detected when they should be
- Ratings seem wrong

**Solutions**:

1. **Adjust for game mode**:

```typescript
// Create mode-specific configs
const EasyModeConfig = {
  ...BalanceConfig,
  THRESHOLDS: {
    ...BalanceConfig.THRESHOLDS,
    DAMAGE_PER_DOLLAR_MIN: 10,
    SURVIVAL_RATE_MIN: 40,
  },
};

const HardModeConfig = {
  ...BalanceConfig,
  THRESHOLDS: {
    ...BalanceConfig.THRESHOLDS,
    DAMAGE_PER_DOLLAR_MIN: 25,
    SURVIVAL_RATE_MIN: 70,
  },
};
```

2. **Calibrate thresholds**:

```typescript
// Play test games and adjust
// Record actual values for good games
// Set thresholds based on data
```

3. **Document threshold rationale**:

```typescript
// Add comments explaining why
DAMAGE_PER_DOLLAR_MIN: 15, // Based on 10 test games, avg was 18
```

---

## Getting Help

### Debug Checklist

Before asking for help, check:

- [ ] Tracking is enabled
- [ ] Integration points are connected
- [ ] Libraries are installed
- [ ] No console errors
- [ ] Data is being collected
- [ ] Analysis is running
- [ ] Reports are generating

### Diagnostic Report

Generate a diagnostic report:

```typescript
function generateDiagnosticReport(): void {
  const manager = gameManager.getBalanceTrackingManager();

  console.log('=== Balance Analysis Diagnostic Report ===');
  console.log('Enabled:', manager.isEnabled());
  console.log('Last analysis:', manager.getLastAnalysisTime());

  const data = manager.getData();
  console.log('Damage events:', data.damageEvents.length);
  console.log('Tower events:', data.towerEvents.length);
  console.log('Wave events:', data.waveEvents.length);
  console.log('Economy events:', data.economyEvents.length);

  const issues = manager.getBalanceIssues();
  console.log('Balance issues:', issues.length);

  const perfStats = manager.getPerformanceStats();
  console.log('Avg analysis time:', perfStats.avgTime, 'ms');
  console.log('Max analysis time:', perfStats.maxTime, 'ms');

  console.log('Libraries available:');
  console.log('- simple-statistics:', typeof ss !== 'undefined');
  console.log('- regression:', typeof regression !== 'undefined');
  console.log('- mathjs:', typeof math !== 'undefined');
}
```

### Contact Information

For additional support:

- Check design docs in `design_docs/AI_Test_Balance/`
- Review implementation in `src/utils/` and `src/managers/`
- See examples in `BALANCE_ANALYSIS_EXAMPLES.md`

---

_Last Updated: 2025-10-15_  
_Version: 1.0_
