# Statistics Quick Reference

## All Tracked Metrics

### Session Metrics

| Metric      | Type      | Description          | Balancing Use         |
| ----------- | --------- | -------------------- | --------------------- |
| `startTime` | timestamp | When AI was enabled  | Session tracking      |
| `duration`  | ms        | Total session length | Performance analysis  |
| `sessionId` | string    | Unique session ID    | Grouping related runs |

### Economy Metrics

| Metric        | Type   | Description           | Balancing Use     |
| ------------- | ------ | --------------------- | ----------------- |
| `startMoney`  | number | Initial money         | Baseline tracking |
| `finalMoney`  | number | Money at end          | Economy tightness |
| `moneySpent`  | number | Total spent           | Spending patterns |
| `moneyEarned` | number | Total earned          | Income balance    |
| `peakMoney`   | number | Highest money reached | Economy ceiling   |

### Survival Metrics

| Metric         | Type   | Description           | Balancing Use      |
| -------------- | ------ | --------------------- | ------------------ |
| `startLives`   | number | Initial lives         | Baseline tracking  |
| `finalLives`   | number | Lives at end          | Survival success   |
| `livesLost`    | number | Total lives lost      | Damage taken       |
| `survivalRate` | %      | Lives retained        | Overall difficulty |
| `lowestLives`  | number | Minimum lives reached | Difficulty spikes  |

### Tower Metrics

| Metric                | Type    | Description             | Balancing Use         |
| --------------------- | ------- | ----------------------- | --------------------- |
| `towersBuilt`         | number  | Total towers placed     | Build activity        |
| `towersUpgraded`      | number  | Total upgrades          | Upgrade activity      |
| `averageBuildRate`    | per min | Towers built/minute     | Economy flow          |
| `towerComposition`    | object  | Count per tower type    | Tower balance         |
| `upgradeDistribution` | object  | Upgrade levels per type | Upgrade effectiveness |

### Wave Metrics (Arrays)

| Metric                | Type     | Description           | Balancing Use    |
| --------------------- | -------- | --------------------- | ---------------- |
| `waveCompletionTimes` | ms[]     | Time per wave         | Difficulty curve |
| `livesLostPerWave`    | number[] | Lives lost per wave   | Damage spikes    |
| `towersBuiltPerWave`  | number[] | Towers built per wave | Build patterns   |
| `decisionsPerWave`    | number[] | AI decisions per wave | Activity level   |

### Aggregate Wave Metrics

| Metric                    | Type    | Description    | Balancing Use         |
| ------------------------- | ------- | -------------- | --------------------- |
| `averageCompletionTime`   | seconds | Avg wave time  | Overall pacing        |
| `averageLivesLostPerWave` | number  | Avg lives lost | Consistent difficulty |

## Target Values

### Early Game (Waves 1-5)

```
Survival Rate: 95-100%
Lives Lost/Wave: 0-1
Wave Time: 15-25s
Towers Built: 3-5 total
Peak Money: $400-600
```

### Mid Game (Waves 6-10)

```
Survival Rate: 80-95%
Lives Lost/Wave: 1-3
Wave Time: 25-40s
Towers Built: 6-10 total
Peak Money: $800-1200
```

### Late Game (Waves 11+)

```
Survival Rate: 60-80%
Lives Lost/Wave: 2-5
Wave Time: 40-60s
Towers Built: 10-15 total
Peak Money: $1000-1500
```

## Quick Diagnosis

### Problem: Game Too Easy

**Symptoms:**

- Survival Rate > 90%
- Peak Money > $2000
- Wave Times < 20s

**Solutions:**

- Increase zombie health 15%
- Increase zombie speed 10%
- Reduce money rewards 20%

### Problem: Game Too Hard

**Symptoms:**

- Survival Rate < 50%
- Lives Lost/Wave > 5
- Wave Times > 60s

**Solutions:**

- Decrease zombie health 15%
- Increase money rewards 25%
- Increase tower damage 10%

### Problem: Tower Imbalance

**Symptoms:**

- One tower > 50% usage
- One tower < 5% usage

**Solutions:**

- Buff underused towers 20%
- Nerf overused towers 10%
- Adjust costs

### Problem: Economy Issues

**Symptoms:**

- Build Rate < 2/min (too tight)
- Build Rate > 8/min (too loose)
- Peak Money never reached

**Solutions:**

- Adjust money rewards ±20%
- Adjust tower costs ±15%
- Adjust upgrade costs ±15%

## Console Commands

```javascript
// View stored logs
LogExporter.viewStoredLogs();

// Export all logs
LogExporter.exportAllLogs();

// Get log count
LogExporter.getStoredLogCount();

// Clear logs
LogExporter.clearAllLogs();
```

## File Locations

- **Logs**: `player_logs/*.json`
- **Stats Guide**: `design_docs/AI_Test_Balance/BALANCING_STATS_GUIDE.md`
- **AI Code**: `src/managers/AIPlayerManager.ts`
- **Log Exporter**: `src/utils/LogExporter.ts`

## Analysis Checklist

- [ ] Run 10+ AI sessions
- [ ] Export all logs
- [ ] Calculate average wave reached
- [ ] Check survival rate distribution
- [ ] Analyze tower composition
- [ ] Plot wave completion times
- [ ] Identify difficulty spikes
- [ ] Compare with target values
- [ ] Make one balance change
- [ ] Re-test and compare

## Balance Analysis Metrics (NEW)

### Mathematical Balance

| Metric              | Type   | Description                    | Target Range |
| ------------------- | ------ | ------------------------------ | ------------ |
| `damagePerDollar`   | number | Damage dealt per $ spent       | 15-50        |
| `efficiencyScore`   | number | Tower cost-effectiveness       | 50-150       |
| `safetyMargin`      | %      | Defense buffer vs wave         | 20-40%       |
| `breakEvenTime`     | sec    | Time for tower to pay for self | 15-30s       |
| `overkillPercent`   | %      | Wasted damage on dead zombies  | <15%         |
| `threatScore`       | number | Zombie difficulty vs reward    | 0.8-1.2      |
| `economyEfficiency` | %      | Income vs expenses ratio       | >100%        |

### Statistical Analysis

| Metric            | Type   | Description             | Use Case           |
| ----------------- | ------ | ----------------------- | ------------------ |
| `outliers`        | array  | Abnormal data points    | Detect spikes      |
| `difficultyTrend` | string | HARDER/EASIER/STABLE    | Progression check  |
| `trendConfidence` | string | HIGH/MEDIUM/LOW         | Prediction quality |
| `wavePredictions` | array  | Forecasted difficulty   | Proactive balance  |
| `rSquared`        | number | Trend fit quality (0-1) | Model accuracy     |

### Balance Issues

| Issue Type           | Severity | Threshold Violated        | Fix                      |
| -------------------- | -------- | ------------------------- | ------------------------ |
| `INEFFICIENT_TOWERS` | MEDIUM   | Damage/dollar < 15        | Upgrade more, build less |
| `WEAK_DEFENSE`       | HIGH     | Survival rate < 50%       | Add more towers          |
| `EXCESSIVE_OVERKILL` | MEDIUM   | Overkill > 15%            | Spread towers out        |
| `NEGATIVE_ECONOMY`   | HIGH     | Economy efficiency < 100% | Reduce spending          |
| `DIFFICULTY_SPIKE`   | CRITICAL | Wave outlier > 2 std devs | Adjust wave scaling      |

## Common Metrics Combinations

### Economy Health

```
Healthy: moneyEarned / moneySpent = 2-3x
Too Tight: < 1.5x
Too Loose: > 5x

NEW - Economy Efficiency:
Excellent: > 150%
Good: 100-150%
Poor: < 100%
```

### Difficulty Progression

```
Good: waveCompletionTimes increase linearly
Bad: Sudden spikes or plateaus

NEW - Statistical Trend:
GETTING_HARDER: slope > 0, R² > 0.85
STABLE: slope ≈ 0
GETTING_EASIER: slope < 0
```

### Tower Diversity

```
Balanced: All towers 10-40% usage
Imbalanced: Any tower <5% or >50%

NEW - Optimal Mix:
Compare actualTowerMix vs optimalTowerMix
Deviation < 30%: Good strategy
Deviation > 50%: Suboptimal
```

### Upgrade Effectiveness

```
Good: 50-70% of towers upgraded
Too Expensive: <30% upgraded
Too Cheap: >90% upgraded

NEW - Break-Even Analysis:
Fast ROI: < 15s (underpriced)
Balanced: 15-30s
Slow ROI: > 30s (overpriced)
```

### Defense Capability (NEW)

```
Lanchester's Law Analysis:
Safety Margin > 20%: Good buffer
Safety Margin 0-20%: Risky
Safety Margin < 0%: Will fail

Effective DPS:
Overkill < 5%: Excellent
Overkill 5-15%: Acceptable
Overkill > 15%: Wasteful
```

## Balance Analysis Quick Reference

### Enable Balance Tracking

```javascript
// In console or code
gameManager.getBalanceTrackingManager().enable();
```

### Check Balance Issues

```javascript
// Get detected issues
const issues = gameManager.getBalanceTrackingManager().getBalanceIssues();
issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.message}`);
  console.log(`Recommendation: ${issue.recommendation}`);
});
```

### View Wave Defense Analysis

```javascript
// Check if towers can defend
const analysis = gameManager.getBalanceTrackingManager().getWaveDefenseAnalysis();
analysis.forEach(wave => {
  console.log(`Wave ${wave.wave}: ${wave.canDefend ? 'CAN' : 'CANNOT'} defend`);
  console.log(`Safety margin: ${wave.safetyMargin}%`);
});
```

### Get Tower Efficiencies

```javascript
// Compare tower cost-effectiveness
const efficiencies = gameManager.getBalanceTrackingManager().getTowerEfficiencies();
efficiencies.forEach((eff, type) => {
  console.log(`${type}: ${eff.efficiencyScore.toFixed(2)} efficiency`);
  console.log(`Break-even: ${eff.breakEvenTime.toFixed(1)}s`);
});
```

## Configuration

Balance thresholds can be adjusted in `src/config/balanceConfig.ts`:

```typescript
BalanceConfig.THRESHOLDS.DAMAGE_PER_DOLLAR_MIN = 15;
BalanceConfig.THRESHOLDS.SURVIVAL_RATE_MIN = 50;
BalanceConfig.THRESHOLDS.OVERKILL_PERCENT_MAX = 15;
BalanceConfig.THRESHOLDS.SAFETY_MARGIN_MIN = 20;
```

---

_For detailed analysis, see `BALANCING_STATS_GUIDE.md`_  
_For balance analysis guide, see `BALANCE_ANALYSIS_GUIDE.md`_  
_For examples, see `BALANCE_ANALYSIS_EXAMPLES.md`_
