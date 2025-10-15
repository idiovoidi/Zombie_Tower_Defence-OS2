# Balance Configuration Reference

Complete reference for all balance analysis configuration options.

---

## Configuration File

Location: `src/config/balanceConfig.ts`

---

## Balance Thresholds

### DAMAGE_PER_DOLLAR_MIN

**Type**: `number`  
**Default**: `15`  
**Description**: Minimum acceptable damage per dollar spent  
**Issue Triggered**: `INEFFICIENT_TOWERS` if below threshold

**Tuning Guide**:
- **Easy Mode**: 10-12
- **Normal Mode**: 15-20
- **Hard Mode**: 20-25

**Calculation**:
```typescript
damagePerDollar = totalDamageDealt / totalMoneySpent
```

---

### SURVIVAL_RATE_MIN

**Type**: `number`  
**Default**: `50`  
**Description**: Minimum acceptable survival rate (percentage)  
**Issue Triggered**: `WEAK_DEFENSE` if below threshold

**Tuning Guide**:
- **Easy Mode**: 40-50%
- **Normal Mode**: 50-60%
- **Hard Mode**: 60-70%

**Calculation**:
```typescript
survivalRate = (finalLives / startLives) * 100
```

---

### OVERKILL_PERCENT_MAX

**Type**: `number`  
**Default**: `15`  
**Description**: Maximum acceptable overkill percentage  
**Issue Triggered**: `EXCESSIVE_OVERKILL` if above threshold

**Tuning Guide**:
- **Precision Towers** (Sniper): 10-15%
- **Fast Towers** (Machine Gun): 5-10%
- **Area Towers** (Shotgun): 15-20%

**Calculation**:
```typescript
overkillPercent = (totalOverkillDamage / totalDamageDealt) * 100
```

---

### ECONOMY_EFFICIENCY_MIN

**Type**: `number`  
**Default**: `100`  
**Description**: Minimum economy efficiency (percentage)  
**Issue Triggered**: `NEGATIVE_ECONOMY` if below threshold

**Tuning Guide**:
- **Tight Economy**: 100-120%
- **Balanced Economy**: 120-150%
- **Loose Economy**: 150-200%

**Calculation**:
```typescript
economyEfficiency = (totalIncome / totalExpenses) * 100
```

---

### BREAK_EVEN_TIME_MIN

**Type**: `number` (seconds)  
**Default**: `15`  
**Description**: Minimum time for tower to pay for itself  
**Issue Triggered**: Warning if below (tower underpriced)

**Tuning Guide**:
- **Cheap Towers**: 10-15s
- **Medium Towers**: 15-25s
- **Expensive Towers**: 25-35s

**Calculation**:
```typescript
breakEvenTime = towerCost / (zombieReward / killTime)
```

---

### BREAK_EVEN_TIME_MAX

**Type**: `number` (seconds)  
**Default**: `30`  
**Description**: Maximum time for tower to pay for itself  
**Issue Triggered**: Warning if above (tower overpriced)

**Tuning Guide**:
- **Early Game**: 20-30s
- **Mid Game**: 30-40s
- **Late Game**: 40-50s

---

### THREAT_SCORE_MIN

**Type**: `number`  
**Default**: `0.8`  
**Description**: Minimum balanced threat score  
**Issue Triggered**: Warning if below (zombie over-rewarded)

**Tuning Guide**:
- **Easy Zombies**: 0.5-0.8
- **Balanced Zombies**: 0.8-1.2
- **Hard Zombies**: 1.2-2.0

**Calculation**:
```typescript
threatScore = (health * speed * count) / (reward * 10)
```

---

### THREAT_SCORE_MAX

**Type**: `number`  
**Default**: `1.2`  
**Description**: Maximum balanced threat score  
**Issue Triggered**: Warning if above (zombie under-rewarded)

---

### SAFETY_MARGIN_MIN

**Type**: `number` (percentage)  
**Default**: `20`  
**Description**: Minimum safety margin for wave defense  
**Issue Triggered**: Warning if below (defense too tight)

**Tuning Guide**:
- **Tight Defense**: 10-20%
- **Balanced Defense**: 20-30%
- **Safe Defense**: 30-50%

**Calculation**:
```typescript
safetyMargin = ((damageDealt - damageRequired) / damageRequired) * 100
```

---

## Diminishing Returns

### TOWER_STACKING_FACTOR

**Type**: `number`  
**Default**: `100`  
**Description**: Steepness of diminishing returns curve  
**Effect**: Higher = less diminishing returns

**Tuning Guide**:
- **Harsh Diminishing**: 50-75
- **Moderate Diminishing**: 75-125
- **Mild Diminishing**: 125-200

**Formula**:
```typescript
effectiveValue = (stat / (stat + factor)) * cap
```

**Example**:
```
Factor = 100, Cap = 0.5
25 stat = 10% reduction
100 stat = 25% reduction
1000 stat = 45% reduction
```

---

### EFFICIENCY_REDUCTION_PER_DUPLICATE

**Type**: `number`  
**Default**: `0.9`  
**Description**: Efficiency multiplier per duplicate tower  
**Effect**: Each duplicate tower is this % as effective

**Tuning Guide**:
- **Harsh Penalty**: 0.7-0.8 (30-20% loss)
- **Moderate Penalty**: 0.85-0.95 (15-5% loss)
- **Mild Penalty**: 0.95-1.0 (5-0% loss)

**Example**:
```
Factor = 0.9
1st tower: 100% effective
2nd tower: 90% effective
3rd tower: 80% effective
4th tower: 70% effective
```

---

## Statistical Analysis

### OUTLIER_THRESHOLD

**Type**: `number` (standard deviations)  
**Default**: `2`  
**Description**: Number of standard deviations for outlier detection  
**Effect**: Higher = fewer outliers detected

**Tuning Guide**:
- **Sensitive**: 1.5-2.0 (detect more outliers)
- **Moderate**: 2.0-2.5 (balanced)
- **Conservative**: 2.5-3.0 (detect fewer outliers)

**Statistical Meaning**:
```
1 std dev: 68% of data within range
2 std dev: 95% of data within range
3 std dev: 99.7% of data within range
```

---

### CONFIDENCE_HIGH_R_SQUARED

**Type**: `number` (0-1)  
**Default**: `0.85`  
**Description**: R² threshold for high confidence predictions  
**Effect**: Higher = stricter confidence requirements

**Tuning Guide**:
- **Lenient**: 0.75-0.85
- **Moderate**: 0.85-0.90
- **Strict**: 0.90-0.95

**R² Interpretation**:
```
0.85 = 85% of variance explained by model
0.90 = 90% of variance explained by model
0.95 = 95% of variance explained by model
```

---

### CONFIDENCE_MEDIUM_R_SQUARED

**Type**: `number` (0-1)  
**Default**: `0.65`  
**Description**: R² threshold for medium confidence predictions  
**Effect**: Below this is low confidence

**Tuning Guide**:
- **Lenient**: 0.55-0.65
- **Moderate**: 0.65-0.75
- **Strict**: 0.75-0.85

---

## Performance

### ANALYSIS_INTERVAL_MS

**Type**: `number` (milliseconds)  
**Default**: `10000` (10 seconds)  
**Description**: How often to run balance analysis  
**Effect**: Lower = more frequent analysis, higher overhead

**Tuning Guide**:
- **Frequent**: 5000-10000ms (5-10s)
- **Moderate**: 10000-15000ms (10-15s)
- **Infrequent**: 15000-30000ms (15-30s)

**Performance Impact**:
```
5s interval: ~12 analyses per minute
10s interval: ~6 analyses per minute
15s interval: ~4 analyses per minute
```

---

### MAX_ANALYSIS_TIME_MS

**Type**: `number` (milliseconds)  
**Default**: `5`  
**Description**: Performance budget for analysis  
**Effect**: Warning logged if exceeded

**Tuning Guide**:
- **Strict**: 3-5ms
- **Moderate**: 5-10ms
- **Lenient**: 10-20ms

**Frame Rate Impact**:
```
60 FPS = 16.67ms per frame
5ms analysis = 30% of frame budget
10ms analysis = 60% of frame budget
```

---

## Example Configurations

### Easy Mode

```typescript
export const EasyModeConfig = {
  THRESHOLDS: {
    DAMAGE_PER_DOLLAR_MIN: 10,
    SURVIVAL_RATE_MIN: 40,
    OVERKILL_PERCENT_MAX: 20,
    ECONOMY_EFFICIENCY_MIN: 90,
    BREAK_EVEN_TIME_MIN: 10,
    BREAK_EVEN_TIME_MAX: 35,
    THREAT_SCORE_MIN: 0.6,
    THREAT_SCORE_MAX: 1.4,
    SAFETY_MARGIN_MIN: 15,
  },
  DIMINISHING_RETURNS: {
    TOWER_STACKING_FACTOR: 150,
    EFFICIENCY_REDUCTION_PER_DUPLICATE: 0.95,
  },
  STATISTICAL: {
    OUTLIER_THRESHOLD: 2.5,
    CONFIDENCE_HIGH_R_SQUARED: 0.80,
    CONFIDENCE_MEDIUM_R_SQUARED: 0.60,
  },
  PERFORMANCE: {
    ANALYSIS_INTERVAL_MS: 15000,
    MAX_ANALYSIS_TIME_MS: 10,
  },
};
```

### Hard Mode

```typescript
export const HardModeConfig = {
  THRESHOLDS: {
    DAMAGE_PER_DOLLAR_MIN: 25,
    SURVIVAL_RATE_MIN: 70,
    OVERKILL_PERCENT_MAX: 10,
    ECONOMY_EFFICIENCY_MIN: 120,
    BREAK_EVEN_TIME_MIN: 20,
    BREAK_EVEN_TIME_MAX: 25,
    THREAT_SCORE_MIN: 0.9,
    THREAT_SCORE_MAX: 1.1,
    SAFETY_MARGIN_MIN: 30,
  },
  DIMINISHING_RETURNS: {
    TOWER_STACKING_FACTOR: 75,
    EFFICIENCY_REDUCTION_PER_DUPLICATE: 0.85,
  },
  STATISTICAL: {
    OUTLIER_THRESHOLD: 1.5,
    CONFIDENCE_HIGH_R_SQUARED: 0.90,
    CONFIDENCE_MEDIUM_R_SQUARED: 0.70,
  },
  PERFORMANCE: {
    ANALYSIS_INTERVAL_MS: 10000,
    MAX_ANALYSIS_TIME_MS: 5,
  },
};
```

### Competitive Mode

```typescript
export const CompetitiveModeConfig = {
  THRESHOLDS: {
    DAMAGE_PER_DOLLAR_MIN: 30,
    SURVIVAL_RATE_MIN: 80,
    OVERKILL_PERCENT_MAX: 5,
    ECONOMY_EFFICIENCY_MIN: 150,
    BREAK_EVEN_TIME_MIN: 15,
    BREAK_EVEN_TIME_MAX: 20,
    THREAT_SCORE_MIN: 0.95,
    THREAT_SCORE_MAX: 1.05,
    SAFETY_MARGIN_MIN: 40,
  },
  DIMINISHING_RETURNS: {
    TOWER_STACKING_FACTOR: 50,
    EFFICIENCY_REDUCTION_PER_DUPLICATE: 0.80,
  },
  STATISTICAL: {
    OUTLIER_THRESHOLD: 1.5,
    CONFIDENCE_HIGH_R_SQUARED: 0.95,
    CONFIDENCE_MEDIUM_R_SQUARED: 0.75,
  },
  PERFORMANCE: {
    ANALYSIS_INTERVAL_MS: 5000,
    MAX_ANALYSIS_TIME_MS: 3,
  },
};
```

---

## Runtime Configuration

### Changing Configuration at Runtime

```typescript
// Import config
import { BalanceConfig } from '@config/balanceConfig';

// Modify thresholds
BalanceConfig.THRESHOLDS.DAMAGE_PER_DOLLAR_MIN = 20;
BalanceConfig.THRESHOLDS.SURVIVAL_RATE_MIN = 60;

// Modify performance settings
BalanceConfig.PERFORMANCE.ANALYSIS_INTERVAL_MS = 15000;

// Apply mode-specific config
Object.assign(BalanceConfig, HardModeConfig);
```

### Per-Game Configuration

```typescript
// Store original config
const originalConfig = { ...BalanceConfig };

// Apply game-specific config
public startGame(difficulty: 'easy' | 'normal' | 'hard'): void {
  switch (difficulty) {
    case 'easy':
      Object.assign(BalanceConfig, EasyModeConfig);
      break;
    case 'hard':
      Object.assign(BalanceConfig, HardModeConfig);
      break;
    default:
      Object.assign(BalanceConfig, originalConfig);
  }
  
  this.balanceTrackingManager.enable();
}
```

---

## Calibration Guide

### Step 1: Baseline Testing

1. Use default configuration
2. Run 10+ test games
3. Record all metrics
4. Calculate averages

### Step 2: Identify Issues

1. Check which thresholds are frequently violated
2. Check which thresholds are never violated
3. Look for false positives/negatives

### Step 3: Adjust Thresholds

1. Increase thresholds that are too easy to meet
2. Decrease thresholds that are too hard to meet
3. Test with new thresholds

### Step 4: Validate

1. Run 10+ more test games
2. Verify issues are detected correctly
3. Check for false positives/negatives
4. Iterate if needed

### Example Calibration

```typescript
// Initial: Too many false positives for INEFFICIENT_TOWERS
// Average damage per dollar in good games: 18
// Threshold was: 15
// Adjustment: Increase to 16

BalanceConfig.THRESHOLDS.DAMAGE_PER_DOLLAR_MIN = 16;

// Test again
// Result: Better detection, fewer false positives
// Keep new threshold
```

---

## Related Documentation

- **User Guide**: `BALANCE_ANALYSIS_GUIDE.md`
- **Developer Guide**: `BALANCE_ANALYSIS_DEVELOPER_GUIDE.md`
- **Examples**: `BALANCE_ANALYSIS_EXAMPLES.md`

---

_Last Updated: 2025-10-15_  
_Version: 1.0_
