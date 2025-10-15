# Balance Analysis System - Complete Guide

## Overview

The Balance Analysis System provides automated mathematical analysis of game balance using proven formulas and statistical methods. It detects balance issues in real-time, predicts wave difficulty, and provides actionable recommendations for game tuning.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Balance Formulas](#balance-formulas)
3. [Statistical Analysis](#statistical-analysis)
4. [Using the System](#using-the-system)
5. [Configuration](#configuration)
6. [Interpreting Results](#interpreting-results)
7. [Troubleshooting](#troubleshooting)

---

## Core Concepts

### What is Balance Analysis?

Balance analysis uses mathematical models to evaluate whether game mechanics are fair, challenging, and fun. The system automatically:

- **Validates Defense Capability**: Can towers defend against waves?
- **Measures Efficiency**: Are towers cost-effective?
- **Detects Issues**: Are there balance problems?
- **Predicts Difficulty**: Will future waves be too hard/easy?
- **Recommends Solutions**: What should be changed?

### Key Components

1. **BalanceAnalyzer** - Mathematical balance calculations
2. **StatisticalAnalyzer** - Trend detection and prediction
3. **BalanceTrackingManager** - Data collection and coordination
4. **Balance Reports** - Comprehensive analysis output

---

## Balance Formulas

### 1. Lanchester's Laws (Wave Defense)

**Purpose**: Determine if towers can defend against a wave

**Formula**:
```
timeToReachEnd = pathLength / zombieSpeed
damageDealt = totalTowerDPS × timeToReachEnd
canDefend = damageDealt >= totalZombieHP
safetyMargin = ((damageDealt - totalZombieHP) / totalZombieHP) × 100
```

**Interpretation**:
- **Safety Margin > 20%**: Good defense with buffer
- **Safety Margin 0-20%**: Tight defense, risky
- **Safety Margin < 0%**: Cannot defend, will lose lives

**Example**:
```typescript
// Wave 5: 10 zombies × 500 HP = 5000 total HP
// Path: 800 pixels, Speed: 50 px/s → 16 seconds to reach end
// Towers: 250 DPS × 16s = 4000 damage
// Result: Cannot defend (need 5000, only have 4000)
// Recommendation: Add 62.5 more DPS
```

---

### 2. Efficiency Score

**Purpose**: Measure tower cost-effectiveness

**Formula**:
```
efficiencyScore = (DPS × Range × Accuracy) / (BuildCost + UpgradeCost)
```

**Interpretation**:
- **Higher score** = More efficient tower
- Compare scores to find best value towers
- Use for optimal tower mix calculations

**Example**:
```typescript
// Machine Gun: (50 DPS × 150 range × 0.85 accuracy) / 100 cost = 63.75
// Sniper: (100 DPS × 300 range × 0.95 accuracy) / 200 cost = 142.5
// Result: Sniper is 2.2× more efficient than Machine Gun
```

---

### 3. Diminishing Returns

**Purpose**: Model reduced effectiveness of stacking same tower type

**Formula**:
```
effectiveValue = baseStat × (1 - (0.1 × (duplicateCount - 1)))
```

**Interpretation**:
- Each duplicate tower loses 10% effectiveness
- 1st tower: 100% effective
- 2nd tower: 90% effective
- 3rd tower: 80% effective
- Encourages tower diversity

**Example**:
```typescript
// 5 Machine Guns at 50 DPS each
// Effective DPS: 50 + 45 + 40 + 35 + 30 = 200 DPS
// Without diminishing returns: 250 DPS
// Efficiency loss: 20%
```

---

### 4. Threat Score

**Purpose**: Evaluate if zombie rewards match their difficulty

**Formula**:
```
threatScore = (Health × Speed × Count) / (Reward × 10)
```

**Interpretation**:
- **0.8 - 1.2**: Balanced
- **< 0.8**: Under-rewarded (too hard for reward)
- **> 1.2**: Over-rewarded (too easy for reward)

**Example**:
```typescript
// Tank Zombie: 300 HP × 25 speed × 5 count / (50 reward × 10)
// = 37500 / 500 = 75
// Result: Severely under-rewarded (should give ~625 gold)
```

---

### 5. Effective DPS (Overkill Adjustment)

**Purpose**: Calculate true DPS accounting for wasted damage

**Formula**:
```
shotsToKill = ceil(zombieHP / damagePerShot)
wastedDamage = (shotsToKill × damagePerShot) - zombieHP
wastePercent = wastedDamage / (shotsToKill × damagePerShot)
effectiveDPS = nominalDPS × (1 - wastePercent)
```

**Interpretation**:
- **Waste < 5%**: Excellent damage efficiency
- **Waste 5-15%**: Acceptable
- **Waste > 15%**: Significant overkill problem

**Example**:
```typescript
// Sniper: 100 damage per shot, zombie has 180 HP
// Shots to kill: 2 (200 damage total)
// Wasted: 20 damage (10% waste)
// Effective DPS: 100 × 0.9 = 90 DPS
```

---

### 6. Break-Even Analysis

**Purpose**: Calculate how long towers take to pay for themselves

**Formula**:
```
killTime = zombieHP / towerDPS
revenuePerSecond = zombieReward / killTime
breakEvenTime = towerCost / revenuePerSecond
```

**Interpretation**:
- **< 15 seconds**: Tower pays for itself too quickly (underpriced)
- **15-30 seconds**: Balanced
- **> 30 seconds**: Tower takes too long to pay off (overpriced)

**Example**:
```typescript
// Machine Gun: 100 cost, 50 DPS
// Zombie: 100 HP, 10 reward
// Kill time: 2 seconds
// Revenue: 5 gold/second
// Break-even: 20 seconds (balanced)
```

---

### 7. Optimal Tower Mix

**Purpose**: Calculate best tower composition for a budget

**Algorithm**:
1. Calculate efficiency score for each tower type
2. Sort by efficiency (highest first)
3. Greedily select towers until budget exhausted
4. Apply 10% diminishing returns per duplicate

**Example**:
```typescript
// Budget: 500 gold
// Sniper: 200 cost, 142.5 efficiency
// Machine Gun: 100 cost, 63.75 efficiency
// Optimal: 2 Snipers (400) + 1 Machine Gun (100) = 500
```

---

## Statistical Analysis

### 1. Outlier Detection

**Purpose**: Find abnormal data points that indicate balance issues

**Method**: Standard deviation analysis
```
mean = average(values)
stdDev = standardDeviation(values)
outlier = |value - mean| > (threshold × stdDev)
```

**Default Threshold**: 2 standard deviations (95% confidence)

**Use Cases**:
- Detect waves with abnormal difficulty spikes
- Find towers dealing unusually high/low damage
- Identify economy anomalies

---

### 2. Trend Analysis

**Purpose**: Determine if difficulty is increasing, decreasing, or stable

**Method**: Linear regression
```
y = mx + b
m = slope (positive = getting harder)
R² = goodness of fit (higher = more confident)
```

**Trend Classification**:
- **GETTING_HARDER**: slope > 0
- **GETTING_EASIER**: slope < 0
- **STABLE**: slope ≈ 0

**Confidence Levels**:
- **HIGH**: R² > 0.85
- **MEDIUM**: R² 0.65-0.85
- **LOW**: R² < 0.65

---

### 3. Predictive Modeling

**Purpose**: Forecast future wave difficulty

**Method**: Polynomial regression (order 2)
```
y = ax² + bx + c
```

**Output**:
- Predicted difficulty for next 5 waves
- Recommended DPS for each wave
- Confidence intervals

**Use Cases**:
- Proactively balance upcoming waves
- Warn about difficulty spikes
- Adjust scaling factors

---

## Using the System

### Enabling Balance Tracking

```typescript
// In GameManager or via console
gameManager.getBalanceTrackingManager().enable();
```

### Disabling Balance Tracking

```typescript
gameManager.getBalanceTrackingManager().disable();
```

### Checking Status

```typescript
const isTracking = gameManager.getBalanceTrackingManager().isEnabled();
console.log(`Balance tracking: ${isTracking ? 'ON' : 'OFF'}`);
```

### Manual Analysis Trigger

```typescript
// Force immediate analysis (normally runs every 10 seconds)
gameManager.getBalanceTrackingManager().update(0);
```

### Accessing Results

```typescript
// Get detected balance issues
const issues = gameManager.getBalanceTrackingManager().getBalanceIssues();

// Get wave defense analysis
const waveAnalysis = gameManager.getBalanceTrackingManager().getWaveDefenseAnalysis();

// Get tower efficiencies
const efficiencies = gameManager.getBalanceTrackingManager().getTowerEfficiencies();

// Get statistical analysis
const stats = gameManager.getBalanceTrackingManager().getStatisticalAnalysis();
```

---

## Configuration

### Balance Thresholds

Located in `src/config/balanceConfig.ts`:

```typescript
export const BalanceConfig = {
  THRESHOLDS: {
    DAMAGE_PER_DOLLAR_MIN: 15,        // Minimum acceptable damage/dollar
    SURVIVAL_RATE_MIN: 50,            // Minimum survival rate (%)
    OVERKILL_PERCENT_MAX: 15,         // Maximum acceptable overkill (%)
    ECONOMY_EFFICIENCY_MIN: 100,      // Minimum economy efficiency (%)
    BREAK_EVEN_TIME_MIN: 15,          // Minimum break-even time (seconds)
    BREAK_EVEN_TIME_MAX: 30,          // Maximum break-even time (seconds)
    THREAT_SCORE_MIN: 0.8,            // Minimum balanced threat score
    THREAT_SCORE_MAX: 1.2,            // Maximum balanced threat score
    SAFETY_MARGIN_MIN: 20,            // Minimum safety margin (%)
  },
  
  DIMINISHING_RETURNS: {
    TOWER_STACKING_FACTOR: 100,       // Diminishing returns curve steepness
    EFFICIENCY_REDUCTION_PER_DUPLICATE: 0.9,  // 90% efficiency per duplicate
  },
  
  STATISTICAL: {
    OUTLIER_THRESHOLD: 2,             // Standard deviations for outliers
    CONFIDENCE_HIGH_R_SQUARED: 0.85,  // R² threshold for high confidence
    CONFIDENCE_MEDIUM_R_SQUARED: 0.65, // R² threshold for medium confidence
  },
  
  PERFORMANCE: {
    ANALYSIS_INTERVAL_MS: 10000,      // Analysis frequency (10 seconds)
    MAX_ANALYSIS_TIME_MS: 5,          // Performance budget (5ms)
  }
};
```

### Customizing Thresholds

```typescript
// Adjust thresholds for different game modes
BalanceConfig.THRESHOLDS.DAMAGE_PER_DOLLAR_MIN = 20; // Harder mode
BalanceConfig.THRESHOLDS.SAFETY_MARGIN_MIN = 30;     // More buffer required
```

---

## Interpreting Results

### Balance Issues

Issues are categorized by type and severity:

#### Issue Types

1. **INEFFICIENT_TOWERS**
   - Damage per dollar below threshold
   - Recommendation: Build fewer towers, upgrade more

2. **WEAK_DEFENSE**
   - Survival rate below threshold
   - Recommendation: Add more towers or upgrade existing

3. **EXCESSIVE_OVERKILL**
   - Overkill percentage above threshold
   - Recommendation: Spread towers out, use different types

4. **NEGATIVE_ECONOMY**
   - Economy efficiency below 100%
   - Recommendation: Reduce spending, focus on income

#### Severity Levels

- **CRITICAL**: Immediate action required, game likely unwinnable
- **HIGH**: Significant problem, will cause issues soon
- **MEDIUM**: Notable inefficiency, should be addressed
- **LOW**: Minor optimization opportunity

### Wave Defense Analysis

```typescript
{
  wave: 5,
  canDefend: true,
  totalZombieHP: 5000,
  totalTowerDPS: 250,
  timeToReachEnd: 30,
  damageDealt: 7500,
  damageRequired: 5000,
  safetyMargin: 50,  // 50% overkill capacity
  recommendation: "Defense is adequate with 50% safety margin"
}
```

**Interpretation**:
- **canDefend = true**: Towers can handle the wave
- **safetyMargin = 50%**: 50% more damage than needed (good buffer)
- **recommendation**: Specific advice for this wave

### Tower Efficiency

```typescript
{
  type: 'MachineGun',
  cost: 100,
  dps: 50,
  range: 150,
  accuracy: 0.85,
  efficiencyScore: 63.75,
  effectiveDPS: 47.5,
  breakEvenTime: 18.2
}
```

**Interpretation**:
- **efficiencyScore**: Higher = better value
- **effectiveDPS**: True DPS after overkill
- **breakEvenTime**: 18.2s to pay for itself (balanced)

### Statistical Analysis

```typescript
{
  damageOutliers: {
    mean: 1250.5,
    standardDeviation: 180.3,
    outliers: [{ value: 2100, index: 7, deviation: 4.7 }],
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

**Interpretation**:
- **Outliers**: Wave 7 had abnormally high damage (4.7 std devs)
- **Trend**: Difficulty increasing with high confidence (R² = 0.92)
- **Predictions**: Wave 11 will need ~185 DPS

---

## Troubleshooting

### Issue: Analysis Not Running

**Symptoms**: No console output, no balance issues detected

**Solutions**:
1. Check if tracking is enabled: `gameManager.getBalanceTrackingManager().isEnabled()`
2. Verify analysis interval hasn't been set too high
3. Check console for errors during initialization
4. Ensure statistical libraries loaded correctly

### Issue: Inaccurate Predictions

**Symptoms**: Predictions don't match actual difficulty

**Solutions**:
1. Check if enough data collected (need 3+ waves for regression)
2. Verify zombie HP and speed values are correct
3. Check if path length is accurate
4. Ensure DPS calculations include all active towers

### Issue: Performance Problems

**Symptoms**: Frame rate drops, analysis takes > 5ms

**Solutions**:
1. Increase analysis interval: `BalanceConfig.PERFORMANCE.ANALYSIS_INTERVAL_MS = 15000`
2. Reduce data collection frequency
3. Check for memory leaks in tracking arrays
4. Profile with: `gameManager.getBalanceTrackingManager().getPerformanceStats()`

### Issue: Missing Balance Data in Reports

**Symptoms**: Reports don't include balance analysis section

**Solutions**:
1. Ensure tracking was enabled during gameplay
2. Check if `generateReportData()` was called before export
3. Verify LogExporter integration is complete
4. Check console for export errors

### Issue: False Positive Balance Issues

**Symptoms**: Issues flagged incorrectly

**Solutions**:
1. Adjust thresholds in `balanceConfig.ts`
2. Check if game mode requires different thresholds
3. Verify tracking data is accurate
4. Review issue detection logic for edge cases

### Issue: Libraries Not Loading

**Symptoms**: "Library not available" warnings in console

**Solutions**:
1. Run `npm install` to ensure dependencies installed
2. Check `package.json` for correct library versions
3. Verify import statements in analyzer files
4. System will gracefully degrade, but statistical analysis disabled

---

## Best Practices

### 1. Enable Tracking Early

Enable tracking at game start for complete data:
```typescript
// In GameManager.startGame()
this.balanceTrackingManager.enable();
```

### 2. Review Console Output

Balance issues log to console in real-time:
```
⚠️ Balance Issue Detected: INEFFICIENT_TOWERS
   Damage per dollar: 12.5 (threshold: 15)
   Recommendation: Build fewer towers and upgrade existing ones more
```

### 3. Analyze Reports After Each Session

Check generated reports for:
- Balance issues summary
- Wave defense analysis
- Tower efficiency comparisons
- Statistical trends and predictions

### 4. Iterate on Thresholds

Adjust thresholds based on game mode and difficulty:
- Easy mode: Lower thresholds
- Hard mode: Higher thresholds
- Endless mode: Different scaling

### 5. Use Predictions Proactively

Don't wait for waves to become impossible:
- Check predictions after each wave
- Adjust tower strategy based on forecasts
- Balance upcoming waves before playtesting

### 6. Monitor Performance

Keep analysis under 5ms budget:
```typescript
// Check performance stats
const perfStats = balanceTrackingManager.getPerformanceStats();
console.log(`Avg analysis time: ${perfStats.avgTime}ms`);
```

---

## Advanced Usage

### Custom Balance Formulas

Add custom formulas to `BalanceAnalyzer`:

```typescript
// In src/utils/BalanceAnalyzer.ts
static calculateCustomMetric(param1: number, param2: number): number {
  // Your custom formula
  return param1 * param2 / 100;
}
```

### Custom Issue Detection

Add custom issue types:

```typescript
// In BalanceTrackingManager
private detectCustomIssue(): BalanceIssue | null {
  if (customCondition) {
    return {
      type: 'CUSTOM_ISSUE',
      severity: 'MEDIUM',
      message: 'Custom issue detected',
      value: actualValue,
      threshold: expectedValue,
      recommendation: 'Do something to fix it'
    };
  }
  return null;
}
```

### Integration with External Tools

Export balance data for external analysis:

```typescript
// Get all balance data
const balanceData = gameManager.getBalanceTrackingManager().generateReportData();

// Send to external API
fetch('/api/balance-analysis', {
  method: 'POST',
  body: JSON.stringify(balanceData)
});
```

---

## Related Documentation

- **Implementation Details**: `.kiro/specs/balance-analysis-integration/design.md`
- **Requirements**: `.kiro/specs/balance-analysis-integration/requirements.md`
- **Example Reports**: `design_docs/AI_Test_Balance/BALANCE_ANALYSIS_EXAMPLES.md`
- **Configuration Reference**: `src/config/balanceConfig.ts`
- **API Documentation**: `src/utils/BalanceAnalyzer.ts`, `src/utils/StatisticalAnalyzer.ts`

---

_Last Updated: 2025-10-15_  
_Version: 1.0_
