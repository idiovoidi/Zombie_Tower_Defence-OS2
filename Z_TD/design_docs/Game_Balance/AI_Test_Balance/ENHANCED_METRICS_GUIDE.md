# Enhanced Player Metrics Guide

Complete guide to all metrics tracked in player reports for Z-TD.

---

## Overview

Player reports now track comprehensive metrics across 5 major categories:

1. **Game Data** - Basic game outcome
2. **AI Data** - AI decision-making and strategy
3. **Combat Stats** - Damage, kills, and combat efficiency
4. **Economy Stats** - Money flow and financial management
5. **Efficiency Stats** - Cost-effectiveness and resource utilization
6. **Timeline Stats** - Snapshots over time

---

## 1. Game Data

Basic information about the game session.

### Fields

- **highestWave**: Maximum wave reached
- **finalMoney**: Money remaining at end
- **finalLives**: Lives remaining at end
- **startLives**: Lives at game start
- **survivalRate**: Percentage of lives retained (0-100%)
- **livesLost**: Total lives lost during game

### Example

```json
"gameData": {
  "highestWave": 15,
  "finalMoney": 450,
  "finalLives": 18,
  "startLives": 20,
  "survivalRate": 90.0,
  "livesLost": 2
}
```

---

## 2. AI Data

AI-specific metrics for automated gameplay.

### Fields

- **towersBuilt**: Total towers placed
- **towersUpgraded**: Total upgrade actions
- **moneySpent**: Total money spent on towers/upgrades
- **moneyEarned**: Total money earned from kills
- **peakMoney**: Highest money amount reached
- **lowestLives**: Lowest lives before game over
- **averageBuildRate**: Towers built per minute
- **towerComposition**: Count of each tower type built
- **upgradeDistribution**: Upgrade levels achieved per tower type
- **waveStats**: Detailed per-wave statistics
- **performanceRating**: Overall performance (⭐-⭐⭐⭐⭐⭐)
- **defenseRating**: Defense quality (🛡️ ratings)

### Wave Stats

- **completionTimes**: Time to complete each wave (ms)
- **averageCompletionTime**: Mean wave completion time (seconds)
- **livesLostPerWave**: Lives lost in each wave
- **averageLivesLostPerWave**: Mean lives lost per wave
- **towersBuiltPerWave**: Towers built during each wave
- **decisionsPerWave**: AI decisions made per wave

### Example

```json
"aiData": {
  "towersBuilt": 12,
  "towersUpgraded": 8,
  "moneySpent": 2400,
  "moneyEarned": 3500,
  "peakMoney": 1200,
  "lowestLives": 15,
  "averageBuildRate": 2.4,
  "towerComposition": {
    "MACHINE_GUN": 5,
    "SNIPER": 3,
    "SHOTGUN": 2,
    "TESLA": 1,
    "FLAME": 1
  },
  "performanceRating": "⭐⭐⭐⭐ GREAT",
  "defenseRating": "🛡️ STRONG DEFENSE"
}
```

---

## 3. Combat Stats ⚔️

NEW! Detailed combat performance metrics.

### Fields

- **totalDamageDealt**: Total damage across all towers
- **totalZombiesKilled**: Total zombie kills
- **averageDPS**: Mean damage per second
- **peakDPS**: Highest DPS achieved
- **damageByTowerType**: Damage breakdown by tower type
- **killsByTowerType**: Kills breakdown by tower type
- **damagePerWave**: Damage dealt in each wave
- **killsPerWave**: Zombies killed in each wave
- **overkillDamage**: Wasted damage on already-dead zombies
- **accuracyRate**: Percentage of shots that hit (0-100%)
- **shotsHit**: Total successful hits
- **shotsMissed**: Total missed shots

### Use Cases

- **Identify best tower types**: Which towers deal most damage?
- **Optimize DPS**: Track peak DPS to understand combat effectiveness
- **Reduce overkill**: Minimize wasted damage
- **Improve accuracy**: Track hit rate for projectile towers

### Example

```json
"combatStats": {
  "totalDamageDealt": 45000.50,
  "totalZombiesKilled": 450,
  "averageDPS": 125.30,
  "peakDPS": 380.75,
  "damageByTowerType": {
    "MACHINE_GUN": 18000,
    "SNIPER": 15000,
    "SHOTGUN": 8000,
    "TESLA": 2500,
    "FLAME": 1500
  },
  "killsByTowerType": {
    "MACHINE_GUN": 180,
    "SNIPER": 150,
    "SHOTGUN": 80,
    "TESLA": 25,
    "FLAME": 15
  },
  "overkillDamage": 2500.25,
  "accuracyRate": 78.5,
  "shotsHit": 1570,
  "shotsMissed": 430
}
```

---

## 4. Economy Stats 💰

NEW! Comprehensive financial tracking.

### Fields

- **moneyTimeline**: Money snapshots every 5 seconds
- **moneyPerWave**: Money earned in each wave
- **moneySpentPerWave**: Money spent in each wave
- **netIncomePerWave**: Net profit/loss per wave
- **averageMoneyPerSecond**: Mean income rate
- **peakMoneyPerSecond**: Highest income rate
- **totalIncome**: Total money earned
- **totalExpenses**: Total money spent
- **netProfit**: Total income - total expenses
- **economyEfficiency**: Income/expenses ratio (%)
- **bankruptcyEvents**: Times money dropped to $0
- **cashFlowTrend**: GROWING, STABLE, or DECLINING

### Use Cases

- **Track cash flow**: Understand income vs expenses over time
- **Identify bottlenecks**: Find waves where money runs low
- **Optimize spending**: Balance tower building with upgrades
- **Prevent bankruptcy**: Avoid running out of money

### Example

```json
"economyStats": {
  "moneyTimeline": [
    { "time": 0, "money": 500, "wave": 1 },
    { "time": 5000, "money": 650, "wave": 2 },
    { "time": 10000, "money": 400, "wave": 3 }
  ],
  "moneyPerWave": [150, 200, 180, 220],
  "moneySpentPerWave": [100, 150, 200, 100],
  "netIncomePerWave": [50, 50, -20, 120],
  "averageMoneyPerSecond": 5.8,
  "totalIncome": 3500,
  "totalExpenses": 2400,
  "netProfit": 1100,
  "economyEfficiency": 145.8,
  "bankruptcyEvents": 0,
  "cashFlowTrend": "GROWING"
}
```

---

## 5. Efficiency Stats 📊

NEW! Cost-effectiveness and resource utilization.

### Fields

- **damagePerDollar**: Damage dealt per $ spent
- **killsPerDollar**: Zombies killed per $ spent
- **damagePerTower**: Average damage per tower
- **killsPerTower**: Average kills per tower
- **upgradeEfficiency**: Damage per upgrade action
- **resourceUtilization**: Percentage of money used (lower = more saved)
- **towerDensity**: Total towers built
- **averageUpgradeLevel**: Mean upgrade level across all towers
- **costEfficiencyRating**: EXCELLENT, GOOD, FAIR, or POOR

### Use Cases

- **Maximize value**: Get most damage per dollar
- **Compare strategies**: Which approach is most efficient?
- **Optimize upgrades**: Are upgrades worth the cost?
- **Resource management**: Are you spending or saving too much?

### Example

```json
"efficiencyStats": {
  "damagePerDollar": 18.75,
  "killsPerDollar": 0.1875,
  "damagePerTower": 3750.04,
  "killsPerTower": 37.5,
  "upgradeEfficiency": 5625.06,
  "resourceUtilization": 84.2,
  "towerDensity": 12,
  "averageUpgradeLevel": 1.67,
  "costEfficiencyRating": "FAIR"
}
```

---

## 6. Timeline Stats 📈

NEW! Snapshots of game state over time.

### Fields

- **snapshots**: Array of game state snapshots
- **snapshotInterval**: Time between snapshots (ms)

### Snapshot Fields

- **time**: Milliseconds since game start
- **wave**: Current wave number
- **money**: Current money
- **lives**: Current lives
- **towersActive**: Number of towers placed
- **zombiesAlive**: Number of zombies on map
- **currentDPS**: Current damage per second

### Use Cases

- **Visualize progression**: Graph stats over time
- **Identify critical moments**: When did things go wrong?
- **Compare runs**: How do different strategies progress?
- **Analyze trends**: Is DPS increasing appropriately?

### Example

```json
"timelineStats": {
  "snapshots": [
    {
      "time": 10000,
      "wave": 2,
      "money": 650,
      "lives": 20,
      "towersActive": 3,
      "zombiesAlive": 5,
      "currentDPS": 85.5
    },
    {
      "time": 20000,
      "wave": 4,
      "money": 800,
      "lives": 19,
      "towersActive": 5,
      "zombiesAlive": 8,
      "currentDPS": 142.3
    }
  ],
  "snapshotInterval": 10000
}
```

---

## Performance Ratings

### Performance Rating (Wave-Based)

- **⭐⭐⭐⭐⭐ EXCELLENT**: Wave 20+
- **⭐⭐⭐⭐ GREAT**: Wave 15-19
- **⭐⭐⭐ GOOD**: Wave 10-14
- **⭐⭐ FAIR**: Wave 5-9
- **⭐ NEEDS IMPROVEMENT**: Wave 1-4

### Defense Rating (Survival-Based)

- **🛡️ PERFECT DEFENSE**: 100% survival
- **🛡️ STRONG DEFENSE**: 80-99% survival
- **⚠️ MODERATE DEFENSE**: 50-79% survival
- **❌ WEAK DEFENSE**: <50% survival

### Cost Efficiency Rating

- **EXCELLENT**: >100 damage per dollar
- **GOOD**: 50-100 damage per dollar
- **FAIR**: 25-50 damage per dollar
- **POOR**: <25 damage per dollar

---

## Analyzing Reports

### Key Metrics to Watch

1. **Survival Rate**: Are you losing too many lives?
2. **Economy Efficiency**: Are you earning more than spending?
3. **Damage Per Dollar**: Are your towers cost-effective?
4. **Cash Flow Trend**: Is your economy growing or declining?
5. **Average DPS**: Is your damage output sufficient?
6. **Overkill Damage**: Are you wasting damage?

### Red Flags

- ⚠️ **Bankruptcy Events > 0**: Running out of money
- ⚠️ **Economy Efficiency < 100%**: Spending more than earning
- ⚠️ **Damage Per Dollar < 25**: Inefficient tower placement
- ⚠️ **Overkill > 10% of total damage**: Poor targeting
- ⚠️ **Cash Flow Trend: DECLINING**: Unsustainable economy

### Optimization Tips

1. **High overkill?** → Spread towers out, don't stack damage
2. **Low damage per dollar?** → Focus on cost-effective towers
3. **Bankruptcy events?** → Build fewer towers, upgrade more
4. **Low accuracy?** → Use more area-effect towers
5. **Declining cash flow?** → Balance spending with income

---

## 7. Balance Analysis (NEW) 🎯

Automated mathematical balance analysis using proven formulas.

### Fields

- **issues**: Array of detected balance problems
- **waveDefenseAnalysis**: Lanchester's Law predictions
- **towerEfficiencies**: Cost-effectiveness scores
- **threatScores**: Zombie difficulty vs reward balance
- **optimalTowerMix**: Recommended tower composition
- **actualTowerMix**: Player's tower composition
- **mixDeviation**: Difference from optimal (%)
- **overallBalanceRating**: EXCELLENT, GOOD, FAIR, POOR, or CRITICAL

### Balance Issue Types

1. **INEFFICIENT_TOWERS**
   - Damage per dollar below threshold (< 15)
   - Recommendation: Build fewer towers, upgrade more

2. **WEAK_DEFENSE**
   - Survival rate below threshold (< 50%)
   - Recommendation: Add more towers or upgrade

3. **EXCESSIVE_OVERKILL**
   - Overkill percentage above threshold (> 15%)
   - Recommendation: Spread towers out, diversify types

4. **NEGATIVE_ECONOMY**
   - Economy efficiency below 100%
   - Recommendation: Reduce spending, focus on income

5. **DIFFICULTY_SPIKE**
   - Wave difficulty outlier (> 2 standard deviations)
   - Recommendation: Adjust wave scaling

### Wave Defense Analysis

Uses Lanchester's Laws to predict if towers can defend:

```typescript
{
  wave: 10,
  canDefend: true,
  totalZombieHP: 8000,
  totalTowerDPS: 320,
  timeToReachEnd: 30,
  damageDealt: 9600,
  damageRequired: 8000,
  safetyMargin: 20.0,  // 20% buffer
  recommendation: "Defense is adequate with 20% safety margin"
}
```

**Interpretation**:

- **canDefend = true**: Towers can handle wave
- **safetyMargin > 20%**: Good buffer
- **safetyMargin < 0%**: Will lose lives

### Tower Efficiency

Measures cost-effectiveness of each tower type:

```typescript
{
  type: 'Sniper',
  cost: 200,
  dps: 100,
  range: 300,
  accuracy: 0.95,
  efficiencyScore: 142.5,  // (DPS × Range × Accuracy) / Cost
  effectiveDPS: 92.0,      // Accounting for overkill
  breakEvenTime: 22.5      // Seconds to pay for itself
}
```

**Use Cases**:

- Compare tower types for best value
- Identify overpriced/underpriced towers
- Calculate optimal tower mix

### Threat Scores

Evaluates if zombie rewards match difficulty:

```typescript
{
  zombieType: 'TANK',
  health: 300,
  speed: 25,
  count: 5,
  reward: 50,
  threatScore: 75.0,       // (HP × Speed × Count) / (Reward × 10)
  threatPerDollar: 1.5,
  isBalanced: false        // Should be 0.8-1.2
}
```

**Interpretation**:

- **0.8-1.2**: Balanced
- **< 0.8**: Over-rewarded (too easy)
- **> 1.2**: Under-rewarded (too hard)

### Example

```json
"balanceAnalysis": {
  "issues": [
    {
      "type": "INEFFICIENT_TOWERS",
      "severity": "MEDIUM",
      "message": "Damage per dollar is 12.3, below threshold of 15",
      "value": 12.3,
      "threshold": 15.0,
      "recommendation": "Build fewer towers and upgrade existing ones more"
    }
  ],
  "waveDefenseAnalysis": [
    {
      "wave": 10,
      "canDefend": true,
      "safetyMargin": 20.0,
      "recommendation": "Defense is adequate"
    }
  ],
  "towerEfficiencies": {
    "MachineGun": {
      "efficiencyScore": 63.75,
      "effectiveDPS": 47.0,
      "breakEvenTime": 19.5
    },
    "Sniper": {
      "efficiencyScore": 142.5,
      "effectiveDPS": 92.0,
      "breakEvenTime": 22.5
    }
  },
  "optimalTowerMix": {
    "Sniper": 4,
    "MachineGun": 3
  },
  "actualTowerMix": {
    "MachineGun": 12
  },
  "mixDeviation": 85.0,
  "overallBalanceRating": "FAIR"
}
```

---

## 8. Statistical Analysis (NEW) 📈

Advanced statistical analysis for trend detection and prediction.

### Fields

- **damageOutliers**: Abnormal damage values
- **dpsOutliers**: Abnormal DPS values
- **economyOutliers**: Abnormal economy events
- **difficultyTrend**: Trend classification
- **wavePredictions**: Future wave forecasts
- **summary**: Aggregate statistics

### Outlier Detection

Identifies abnormal data points using standard deviation:

```typescript
{
  mean: 1250.5,
  standardDeviation: 180.3,
  outliers: [
    { value: 2100, index: 7, deviation: 4.7 }
  ],
  hasOutliers: true
}
```

**Use Cases**:

- Detect difficulty spikes
- Find abnormally strong/weak towers
- Identify economy anomalies

### Trend Analysis

Determines if difficulty is increasing, decreasing, or stable:

```typescript
{
  trend: 'GETTING_HARDER',
  slope: 0.15,
  intercept: 100,
  rSquared: 0.92,
  confidence: 'HIGH'
}
```

**Trend Types**:

- **GETTING_HARDER**: slope > 0
- **GETTING_EASIER**: slope < 0
- **STABLE**: slope ≈ 0

**Confidence Levels**:

- **HIGH**: R² > 0.85
- **MEDIUM**: R² 0.65-0.85
- **LOW**: R² < 0.65

### Wave Predictions

Forecasts future wave difficulty using polynomial regression:

```typescript
{
  wave: 11,
  predictedDifficulty: 1850,
  recommendedDPS: 185,
  confidenceInterval: { lower: 1750, upper: 1950 }
}
```

**Use Cases**:

- Proactively balance upcoming waves
- Warn about difficulty spikes
- Adjust scaling factors before playtesting

### Example

```json
"statisticalAnalysis": {
  "damageOutliers": {
    "mean": 850.5,
    "standardDeviation": 125.3,
    "outliers": [],
    "hasOutliers": false
  },
  "difficultyTrend": {
    "trend": "GETTING_HARDER",
    "slope": 0.12,
    "intercept": 100,
    "rSquared": 0.89,
    "confidence": "HIGH"
  },
  "wavePredictions": [
    {
      "wave": 16,
      "predictedDifficulty": 1920,
      "recommendedDPS": 450,
      "confidenceInterval": { "lower": 1850, "upper": 1990 }
    }
  ],
  "summary": {
    "avgDamagePerWave": 850.5,
    "avgDPSPerWave": 125.3,
    "avgEconomyEfficiency": 145.8,
    "performanceConsistency": 92.5
  }
}
```

---

## Using Balance Analysis

### Enable Tracking

```typescript
// In GameManager or console
gameManager.getBalanceTrackingManager().enable();
```

### Check Balance Issues

```typescript
const issues = gameManager.getBalanceTrackingManager().getBalanceIssues();
issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.message}`);
  console.log(`Recommendation: ${issue.recommendation}`);
});
```

### View Wave Defense

```typescript
const analysis = gameManager.getBalanceTrackingManager().getWaveDefenseAnalysis();
analysis.forEach(wave => {
  console.log(`Wave ${wave.wave}: ${wave.canDefend ? 'CAN' : 'CANNOT'} defend`);
  console.log(`Safety margin: ${wave.safetyMargin}%`);
});
```

### Get Predictions

```typescript
const stats = gameManager.getBalanceTrackingManager().getStatisticalAnalysis();
console.log('Difficulty trend:', stats.difficultyTrend.trend);
console.log('Next wave prediction:', stats.wavePredictions[0]);
```

---

## Future Enhancements

Planned metrics for future versions:

1. **Tower Synergy**: Bonus damage from tower combinations
2. **Zombie Type Analysis**: Performance against specific zombie types
3. **Critical Moments**: Identify turning points in the game
4. **Heatmaps**: Where zombies leaked through most
5. **Upgrade ROI**: Return on investment for each upgrade
6. **Comparison Mode**: Compare multiple runs side-by-side

---

_Last Updated: Current Build_  
_For implementation details, see: `src/utils/LogExporter.ts` and `src/managers/AIPlayerManager.ts`_  
_For balance analysis details, see: `design_docs/AI_Test_Balance/BALANCE_ANALYSIS_GUIDE.md`_  
_For examples, see: `design_docs/AI_Test_Balance/BALANCE_ANALYSIS_EXAMPLES.md`_
