# Balance Analysis - Example Reports

This document provides example balance analysis reports with interpretations and recommendations.

---

## Table of Contents

1. [Example 1: Well-Balanced Game](#example-1-well-balanced-game)
2. [Example 2: Inefficient Tower Placement](#example-2-inefficient-tower-placement)
3. [Example 3: Weak Defense](#example-3-weak-defense)
4. [Example 4: Excessive Overkill](#example-4-excessive-overkill)
5. [Example 5: Economy Problems](#example-5-economy-problems)
6. [Example 6: Difficulty Spike](#example-6-difficulty-spike)
7. [Report Structure Reference](#report-structure-reference)

---

## Example 1: Well-Balanced Game

### Scenario
Player reaches wave 15 with good tower placement and economy management.

### Balance Analysis Report

```json
{
  "balanceAnalysis": {
    "issues": [],
    "waveDefenseAnalysis": [
      {
        "wave": 15,
        "canDefend": true,
        "totalZombieHP": 12500,
        "totalTowerDPS": 425,
        "timeToReachEnd": 35,
        "damageDealt": 14875,
        "damageRequired": 12500,
        "safetyMargin": 19.0,
        "recommendation": "Defense is adequate with 19% safety margin"
      }
    ],
    "towerEfficiencies": {
      "MachineGun": {
        "type": "MachineGun",
        "cost": 100,
        "dps": 50,
        "range": 150,
        "accuracy": 0.85,
        "efficiencyScore": 63.75,
        "effectiveDPS": 48.5,
        "breakEvenTime": 18.2
      },
      "Sniper": {
        "type": "Sniper",
        "cost": 200,
        "dps": 100,
        "range": 300,
        "accuracy": 0.95,
        "efficiencyScore": 142.5,
        "effectiveDPS": 92.0,
        "breakEvenTime": 22.5
      }
    ],
    "threatScores": {
      "BASIC": {
        "zombieType": "BASIC",
        "health": 175,
        "speed": 50,
        "count": 20,
        "reward": 10,
        "threatScore": 1.75,
        "threatPerDollar": 0.175,
        "isBalanced": false
      },
      "FAST": {
        "zombieType": "FAST",
        "health": 140,
        "speed": 100,
        "count": 15,
        "reward": 15,
        "threatScore": 1.4,
        "threatPerDollar": 0.093,
        "isBalanced": false
      }
    ],
    "optimalTowerMix": {
      "Sniper": 3,
      "MachineGun": 5,
      "Shotgun": 2
    },
    "actualTowerMix": {
      "Sniper": 3,
      "MachineGun": 4,
      "Shotgun": 2,
      "Tesla": 1
    },
    "mixDeviation": 12.5,
    "overallBalanceRating": "GOOD"
  },
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
      },
      {
        "wave": 17,
        "predictedDifficulty": 2040,
        "recommendedDPS": 475,
        "confidenceInterval": { "lower": 1960, "upper": 2120 }
      }
    ]
  }
}
```

### Interpretation

✅ **Strengths**:
- No balance issues detected
- 19% safety margin (close to 20% target)
- Tower mix only 12.5% different from optimal
- Consistent damage output (no outliers)
- Predictable difficulty progression (R² = 0.89)

⚠️ **Areas for Improvement**:
- Threat scores slightly high (zombies under-rewarded)
- Could optimize tower mix slightly (add 1 more Machine Gun, remove Tesla)

📊 **Recommendations**:
1. Increase zombie rewards by ~40% to balance threat scores
2. For wave 16, add 25 more DPS (one upgraded tower)
3. Continue current strategy - it's working well

---

## Example 2: Inefficient Tower Placement

### Scenario
Player builds too many low-level towers instead of upgrading.

### Balance Analysis Report

```json
{
  "balanceAnalysis": {
    "issues": [
      {
        "type": "INEFFICIENT_TOWERS",
        "severity": "MEDIUM",
        "message": "Damage per dollar is 12.3, below threshold of 15",
        "value": 12.3,
        "threshold": 15.0,
        "recommendation": "Build fewer towers and upgrade existing ones more. Focus on cost-effective tower types."
      }
    ],
    "waveDefenseAnalysis": [
      {
        "wave": 10,
        "canDefend": true,
        "totalZombieHP": 8000,
        "totalTowerDPS": 320,
        "timeToReachEnd": 30,
        "damageDealt": 9600,
        "damageRequired": 8000,
        "safetyMargin": 20.0,
        "recommendation": "Defense is adequate but inefficient. Consider upgrading towers instead of building more."
      }
    ],
    "towerEfficiencies": {
      "MachineGun": {
        "type": "MachineGun",
        "cost": 100,
        "dps": 50,
        "efficiencyScore": 63.75,
        "effectiveDPS": 47.0,
        "breakEvenTime": 19.5
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
}
```

### Interpretation

❌ **Problems**:
- Damage per dollar only 12.3 (target: 15+)
- Tower mix 85% different from optimal
- Only using Machine Guns (no diversity)
- Missing out on more efficient Sniper towers

📊 **Recommendations**:
1. **Immediate**: Sell 4 Machine Guns, buy 2 Snipers
2. **Strategy**: Focus on upgrading existing towers
3. **Long-term**: Diversify tower types for better efficiency

💡 **Expected Improvement**:
- Damage per dollar: 12.3 → 18.5 (+50%)
- Same defense capability with less money spent
- Better positioned for future waves

---

## Example 3: Weak Defense

### Scenario
Player doesn't have enough DPS to handle incoming waves.

### Balance Analysis Report

```json
{
  "balanceAnalysis": {
    "issues": [
      {
        "type": "WEAK_DEFENSE",
        "severity": "HIGH",
        "message": "Survival rate is 45%, below threshold of 50%",
        "value": 45.0,
        "threshold": 50.0,
        "recommendation": "Add more towers or upgrade existing ones. Current DPS is insufficient."
      }
    ],
    "waveDefenseAnalysis": [
      {
        "wave": 8,
        "canDefend": false,
        "totalZombieHP": 6500,
        "totalTowerDPS": 180,
        "timeToReachEnd": 28,
        "damageDealt": 5040,
        "damageRequired": 6500,
        "safetyMargin": -22.5,
        "recommendation": "Cannot defend! Need 52.1 more DPS to survive this wave."
      }
    ],
    "towerEfficiencies": {
      "MachineGun": {
        "type": "MachineGun",
        "cost": 100,
        "dps": 50,
        "efficiencyScore": 63.75,
        "effectiveDPS": 48.0,
        "breakEvenTime": 18.0
      }
    },
    "optimalTowerMix": {
      "Sniper": 2,
      "MachineGun": 4
    },
    "actualTowerMix": {
      "MachineGun": 3,
      "Shotgun": 1
    },
    "mixDeviation": 45.0,
    "overallBalanceRating": "POOR"
  }
}
```

### Interpretation

🚨 **Critical Issues**:
- Cannot defend wave 8 (need 52 more DPS)
- Survival rate below 50% (losing too many lives)
- Insufficient tower count/upgrades

📊 **Recommendations**:
1. **Urgent**: Add 1 Sniper + 1 Machine Gun immediately (adds 150 DPS)
2. **Next wave**: Upgrade existing towers
3. **Strategy**: Build towers earlier in waves

💡 **Recovery Plan**:
- Current DPS: 180
- Required DPS: 232
- Add 2 towers: 180 + 150 = 330 DPS ✅
- New safety margin: +42%

---

## Example 4: Excessive Overkill

### Scenario
Player stacks too much damage in one area, wasting damage on already-dead zombies.

### Balance Analysis Report

```json
{
  "balanceAnalysis": {
    "issues": [
      {
        "type": "EXCESSIVE_OVERKILL",
        "severity": "MEDIUM",
        "message": "Overkill percentage is 22%, above threshold of 15%",
        "value": 22.0,
        "threshold": 15.0,
        "recommendation": "Spread towers out more or use different tower types to reduce wasted damage."
      }
    ],
    "waveDefenseAnalysis": [
      {
        "wave": 12,
        "canDefend": true,
        "totalZombieHP": 10000,
        "totalTowerDPS": 500,
        "timeToReachEnd": 32,
        "damageDealt": 16000,
        "damageRequired": 10000,
        "safetyMargin": 60.0,
        "recommendation": "Defense is more than adequate. Consider reducing tower density."
      }
    ],
    "towerEfficiencies": {
      "Sniper": {
        "type": "Sniper",
        "cost": 200,
        "dps": 100,
        "efficiencyScore": 142.5,
        "effectiveDPS": 78.0,
        "breakEvenTime": 25.6
      }
    },
    "optimalTowerMix": {
      "Sniper": 3,
      "MachineGun": 4,
      "Shotgun": 2
    },
    "actualTowerMix": {
      "Sniper": 8
    },
    "mixDeviation": 75.0,
    "overallBalanceRating": "FAIR"
  }
}
```

### Interpretation

⚠️ **Problems**:
- 22% overkill (wasting 1 in 5 damage points)
- 8 Snipers all targeting same zombies
- Effective DPS only 78 (nominal 100) due to overkill
- 60% safety margin (way more than needed)

📊 **Recommendations**:
1. **Immediate**: Sell 3 Snipers, buy diverse towers
2. **Placement**: Spread towers along path, not clustered
3. **Strategy**: Use fast-firing towers (Machine Gun) to reduce overkill

💡 **Expected Improvement**:
- Overkill: 22% → 8% (saves 14% damage)
- Effective DPS: 78 → 92 (+18%)
- Can use saved money for other upgrades

---

## Example 5: Economy Problems

### Scenario
Player spending more than earning, running out of money.

### Balance Analysis Report

```json
{
  "balanceAnalysis": {
    "issues": [
      {
        "type": "NEGATIVE_ECONOMY",
        "severity": "HIGH",
        "message": "Economy efficiency is 85%, below threshold of 100%",
        "value": 85.0,
        "threshold": 100.0,
        "recommendation": "Reduce spending on towers. Focus on income generation and cost-effective builds."
      }
    ],
    "waveDefenseAnalysis": [
      {
        "wave": 9,
        "canDefend": true,
        "totalZombieHP": 7200,
        "totalTowerDPS": 280,
        "timeToReachEnd": 30,
        "damageDealt": 8400,
        "damageRequired": 7200,
        "safetyMargin": 16.7,
        "recommendation": "Defense is adequate. Stop building towers and save money."
      }
    ],
    "economyStats": {
      "totalIncome": 1700,
      "totalExpenses": 2000,
      "netProfit": -300,
      "economyEfficiency": 85.0,
      "bankruptcyEvents": 2,
      "cashFlowTrend": "DECLINING"
    },
    "overallBalanceRating": "POOR"
  }
}
```

### Interpretation

🚨 **Critical Issues**:
- Spending more than earning (85% efficiency)
- Net loss of 300 gold
- 2 bankruptcy events (ran out of money twice)
- Cash flow declining

📊 **Recommendations**:
1. **Immediate**: Stop building towers for 2-3 waves
2. **Strategy**: Only upgrade when necessary
3. **Focus**: Let money accumulate to 500+ before spending

💡 **Recovery Plan**:
- Current: Spending 2000, earning 1700
- Target: Spend max 1500 per game
- Save 200+ gold as emergency buffer

---

## Example 6: Difficulty Spike

### Scenario
Statistical analysis predicts a major difficulty spike in upcoming waves.

### Balance Analysis Report

```json
{
  "statisticalAnalysis": {
    "difficultyTrend": {
      "trend": "GETTING_HARDER",
      "slope": 0.25,
      "intercept": 100,
      "rSquared": 0.94,
      "confidence": "HIGH"
    },
    "wavePredictions": [
      {
        "wave": 11,
        "predictedDifficulty": 1500,
        "recommendedDPS": 150,
        "confidenceInterval": { "lower": 1450, "upper": 1550 }
      },
      {
        "wave": 12,
        "predictedDifficulty": 1875,
        "recommendedDPS": 188,
        "confidenceInterval": { "lower": 1800, "upper": 1950 }
      },
      {
        "wave": 13,
        "predictedDifficulty": 2438,
        "recommendedDPS": 244,
        "confidenceInterval": { "lower": 2300, "upper": 2575 }
      }
    ],
    "damageOutliers": {
      "mean": 1200,
      "standardDeviation": 150,
      "outliers": [
        { "value": 2438, "index": 13, "deviation": 8.25 }
      ],
      "hasOutliers": true
    }
  },
  "balanceAnalysis": {
    "issues": [
      {
        "type": "DIFFICULTY_SPIKE",
        "severity": "CRITICAL",
        "message": "Wave 13 predicted to be 8.25 standard deviations above mean difficulty",
        "value": 2438,
        "threshold": 1500,
        "recommendation": "Major difficulty spike detected. Reduce wave 13 scaling or add more preparation time."
      }
    ]
  }
}
```

### Interpretation

🚨 **Critical Warning**:
- Wave 13 is 8.25 standard deviations above normal
- Difficulty jumps 30% from wave 12 to 13
- High confidence prediction (R² = 0.94)

📊 **Recommendations for Developers**:
1. **Balance Change**: Reduce wave 13 zombie HP by 25%
2. **Alternative**: Add extra reward wave before wave 13
3. **Scaling**: Adjust difficulty curve to be more gradual

📊 **Recommendations for Players**:
1. **Preparation**: Save 500+ gold before wave 13
2. **DPS Target**: Reach 244 DPS by wave 12
3. **Strategy**: Build 2-3 extra towers before wave 13

---

## Report Structure Reference

### Complete Balance Analysis Section

```json
{
  "balanceAnalysis": {
    "issues": [/* Array of BalanceIssue */],
    "waveDefenseAnalysis": [/* Array of WaveDefenseAnalysis */],
    "towerEfficiencies": {/* Map of tower type to TowerEfficiency */},
    "threatScores": {/* Map of zombie type to ThreatScore */},
    "optimalTowerMix": {/* Map of tower type to count */},
    "actualTowerMix": {/* Map of tower type to count */},
    "mixDeviation": /* number (percentage) */,
    "overallBalanceRating": /* "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL" */
  },
  "statisticalAnalysis": {
    "damageOutliers": {/* OutlierAnalysis */},
    "dpsOutliers": {/* OutlierAnalysis */},
    "economyOutliers": {/* OutlierAnalysis */},
    "difficultyTrend": {/* TrendAnalysis */},
    "wavePredictions": [/* Array of WavePrediction */],
    "summary": {
      "avgDamagePerWave": /* number */,
      "avgDPSPerWave": /* number */,
      "avgEconomyEfficiency": /* number */,
      "performanceConsistency": /* number (0-100) */
    }
  }
}
```

### Balance Issue Types

- `INEFFICIENT_TOWERS` - Low damage per dollar
- `WEAK_DEFENSE` - Low survival rate
- `EXCESSIVE_OVERKILL` - High overkill percentage
- `NEGATIVE_ECONOMY` - Spending more than earning
- `DIFFICULTY_SPIKE` - Abnormal difficulty increase

### Severity Levels

- `CRITICAL` - Game-breaking issue
- `HIGH` - Significant problem
- `MEDIUM` - Notable inefficiency
- `LOW` - Minor optimization

### Overall Balance Ratings

- `EXCELLENT` - No issues, optimal play
- `GOOD` - Minor issues, solid performance
- `FAIR` - Some issues, room for improvement
- `POOR` - Multiple issues, needs work
- `CRITICAL` - Severe issues, likely unwinnable

---

## Using Examples for Testing

### Test Case 1: Verify Efficiency Detection

1. Build 12 Machine Guns (no upgrades)
2. Expected: INEFFICIENT_TOWERS issue
3. Verify: Damage per dollar < 15

### Test Case 2: Verify Defense Detection

1. Build only 3 towers by wave 8
2. Expected: WEAK_DEFENSE issue
3. Verify: Cannot defend wave

### Test Case 3: Verify Overkill Detection

1. Stack 8 Snipers in one spot
2. Expected: EXCESSIVE_OVERKILL issue
3. Verify: Overkill > 15%

### Test Case 4: Verify Economy Detection

1. Spend all money immediately each wave
2. Expected: NEGATIVE_ECONOMY issue
3. Verify: Economy efficiency < 100%

### Test Case 5: Verify Prediction Accuracy

1. Play through 10 waves
2. Check predictions for waves 11-15
3. Verify: Predictions within confidence interval

---

## Related Documentation

- **Balance Analysis Guide**: `BALANCE_ANALYSIS_GUIDE.md`
- **Configuration**: `src/config/balanceConfig.ts`
- **Troubleshooting**: `BALANCE_ANALYSIS_TROUBLESHOOTING.md`

---

_Last Updated: 2025-10-15_  
_Version: 1.0_
