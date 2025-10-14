# Game Balancing Statistics Guide

## Overview

Z-TD's AI system collects comprehensive performance data to help balance the game. This guide explains all tracked metrics and how to use them for game design decisions.

## Collected Statistics

### Core Performance Metrics

#### Session Information
- **startTime**: Timestamp when AI was enabled
- **duration**: Total session length in milliseconds
- **highestWave**: Maximum wave number reached
- **sessionId**: Unique identifier for this playthrough

#### Economy Metrics
- **startMoney**: Initial money amount
- **finalMoney**: Money remaining at end
- **moneySpent**: Total money spent on towers and upgrades
- **moneyEarned**: Total money earned from kills and bonuses
- **peakMoney**: Highest money amount reached during session

**Balancing Use:**
- If `peakMoney` is very high, players may be earning too much
- If `finalMoney` is consistently low, economy might be too tight
- Compare `moneySpent` vs `moneyEarned` for economy balance

#### Survival Metrics
- **startLives**: Initial lives count
- **finalLives**: Lives remaining at end
- **livesLost**: Total lives lost
- **survivalRate**: Percentage of lives retained
- **lowestLives**: Minimum lives reached (before game over)

**Balancing Use:**
- If `lowestLives` is consistently high, game may be too easy
- If `survivalRate` is below 50% on early waves, difficulty curve is too steep
- Track when `lowestLives` occurs to identify difficulty spikes

### Tower Statistics

#### Build Metrics
- **towersBuilt**: Total towers placed
- **towersUpgraded**: Total upgrade actions performed
- **averageBuildRate**: Towers built per minute

**Balancing Use:**
- Low `averageBuildRate` suggests money is too scarce
- High `towersBuilt` with low `towersUpgraded` suggests upgrades are too expensive
- Compare across different runs to find optimal build rates

#### Tower Composition
```json
"towerComposition": {
  "MachineGun": 6,
  "Sniper": 4,
  "Shotgun": 2,
  "Tesla": 2,
  "Flame": 1
}
```

**Balancing Use:**
- Identify dominant strategies (if one tower type is >50%, it may be overpowered)
- Unused tower types may need buffs
- Compare successful vs failed runs to see what works

#### Upgrade Distribution
```json
"upgradeDistribution": {
  "MachineGun": [1, 2, 1, 3, 2, 1],
  "Sniper": [2, 3, 3, 4]
}
```

Each array shows the upgrade levels reached for that tower type.

**Balancing Use:**
- If towers rarely reach level 3+, upgrades may be too expensive
- If all towers max out quickly, upgrades may be too cheap
- Identify which towers benefit most from upgrades

### Wave-by-Wave Analysis

#### Wave Completion Times
```json
"waveCompletionTimes": [15000, 18000, 22000, 25000, ...]
```

Time in milliseconds to complete each wave.

**Balancing Use:**
- Increasing times suggest good difficulty scaling
- Sudden spikes indicate difficulty jumps
- Very short times suggest wave is too easy
- Very long times suggest wave is too hard

#### Lives Lost Per Wave
```json
"livesLostPerWave": [0, 2, 1, 5, 3, ...]
```

Lives lost during each wave.

**Balancing Use:**
- Identify which waves cause the most damage
- Sudden spikes indicate balance issues
- Consistent zeros suggest waves are too easy
- High values indicate difficulty spikes

#### Towers Built Per Wave
```json
"towersBuiltPerWave": [2, 1, 0, 1, 2, ...]
```

Number of towers placed during each wave.

**Balancing Use:**
- Zeros indicate no building (good economy or no space)
- High numbers indicate rapid expansion
- Compare with lives lost to see if building helps

#### Decisions Per Wave
```json
"decisionsPerWave": [15, 18, 12, 20, ...]
```

Number of AI decisions (build/upgrade attempts) per wave.

**Balancing Use:**
- Low numbers suggest AI is idle (too expensive or no options)
- High numbers suggest active gameplay
- Compare with actual builds to see success rate

### Aggregate Statistics

#### Average Wave Completion Time
Average time across all completed waves.

**Balancing Use:**
- Target: 15-30 seconds for early waves, 30-60s for late waves
- Too fast: Increase zombie health or count
- Too slow: Decrease zombie health or increase tower damage

#### Average Lives Lost Per Wave
Average lives lost across all waves.

**Balancing Use:**
- Target: 1-3 lives per wave for balanced difficulty
- <1: Too easy, increase zombie damage or count
- >5: Too hard, decrease zombie damage or increase tower effectiveness

## Performance Ratings

### Wave Progress Rating
- ⭐⭐⭐⭐⭐ EXCELLENT (Wave 20+)
- ⭐⭐⭐⭐ GREAT (Wave 15-19)
- ⭐⭐⭐ GOOD (Wave 10-14)
- ⭐⭐ FAIR (Wave 5-9)
- ⭐ NEEDS IMPROVEMENT (Wave 1-4)

### Defense Rating
- 🛡️ PERFECT DEFENSE (100% survival)
- 🛡️ STRONG DEFENSE (80-99% survival)
- ⚠️ MODERATE DEFENSE (50-79% survival)
- ❌ WEAK DEFENSE (<50% survival)

## Analysis Workflows

### Identifying Difficulty Spikes

1. **Load multiple AI run logs**
2. **Check `livesLostPerWave` arrays**
3. **Look for sudden increases**
4. **Cross-reference with `waveCompletionTimes`**

Example:
```
Wave 7: 2 lives lost, 18s completion
Wave 8: 12 lives lost, 45s completion  ← SPIKE!
Wave 9: 3 lives lost, 20s completion
```

**Action**: Wave 8 needs rebalancing (reduce zombie count or health)

### Evaluating Tower Balance

1. **Collect 10+ AI runs**
2. **Aggregate `towerComposition` data**
3. **Calculate usage percentages**

Example Results:
```
MachineGun: 45% (balanced)
Sniper: 30% (balanced)
Shotgun: 15% (balanced)
Tesla: 8% (underused - needs buff)
Flame: 2% (severely underused - needs major buff)
```

### Analyzing Economy Balance

1. **Track `peakMoney` across runs**
2. **Compare `moneySpent` vs `moneyEarned`**
3. **Check `averageBuildRate`**

Healthy Economy:
```
Peak Money: $800-1200
Money Earned: 2-3x Money Spent
Build Rate: 3-5 towers/minute
```

Too Tight:
```
Peak Money: <$500
Money Earned: <1.5x Money Spent
Build Rate: <2 towers/minute
```

Too Loose:
```
Peak Money: >$2000
Money Earned: >5x Money Spent
Build Rate: >8 towers/minute
```

### Wave Progression Analysis

1. **Plot `waveCompletionTimes` on a graph**
2. **Look for linear vs exponential growth**
3. **Identify plateaus or spikes**

Ideal Curve:
```
Wave 1-5: 15-20s (gentle intro)
Wave 6-10: 20-35s (ramping up)
Wave 11-15: 35-50s (challenging)
Wave 16+: 50-70s (intense)
```

## Balancing Recommendations

### Early Game (Waves 1-5)

**Target Metrics:**
- Survival Rate: 95-100%
- Lives Lost Per Wave: 0-1
- Wave Completion Time: 15-25s
- Towers Built: 3-5 total

**If Off Target:**
- Too Easy: Increase zombie speed by 10%
- Too Hard: Decrease zombie health by 15%

### Mid Game (Waves 6-10)

**Target Metrics:**
- Survival Rate: 80-95%
- Lives Lost Per Wave: 1-3
- Wave Completion Time: 25-40s
- Towers Built: 6-10 total

**If Off Target:**
- Too Easy: Increase zombie count by 20%
- Too Hard: Increase money rewards by 25%

### Late Game (Waves 11+)

**Target Metrics:**
- Survival Rate: 60-80%
- Lives Lost Per Wave: 2-5
- Wave Completion Time: 40-60s
- Towers Built: 10-15 total

**If Off Target:**
- Too Easy: Introduce more special zombie types
- Too Hard: Increase tower upgrade effectiveness

## Data Export Format

### JSON Structure
```json
{
  "timestamp": "2025-10-15T14:30:45.123Z",
  "sessionId": "session_1729005045123_abc123",
  "isAIRun": true,
  "duration": 180000,
  "gameData": {
    "highestWave": 12,
    "finalMoney": 320,
    "finalLives": 85,
    "survivalRate": 85.0,
    "livesLost": 15
  },
  "aiData": {
    "towersBuilt": 15,
    "towersUpgraded": 8,
    "moneySpent": 2450,
    "moneyEarned": 3200,
    "peakMoney": 1150,
    "lowestLives": 78,
    "towerComposition": {...},
    "upgradeDistribution": {...},
    "waveStats": {
      "completionTimes": [...],
      "averageCompletionTime": 28.5,
      "livesLostPerWave": [...],
      "averageLivesLostPerWave": 1.25,
      "towersBuiltPerWave": [...],
      "decisionsPerWave": [...]
    },
    "performanceRating": "⭐⭐⭐ GOOD",
    "defenseRating": "🛡️ STRONG DEFENSE"
  }
}
```

## Analysis Tools

### Spreadsheet Analysis

1. **Export multiple logs**
2. **Import into Excel/Google Sheets**
3. **Create pivot tables for:**
   - Average wave reached by tower composition
   - Survival rate vs money spent
   - Wave completion times trend

### Python Analysis Example

```python
import json
import glob
import matplotlib.pyplot as plt

# Load all AI logs
logs = []
for file in glob.glob("player_logs/*_AI_*.json"):
    with open(file) as f:
        logs.append(json.load(f))

# Analyze wave completion times
all_times = []
for log in logs:
    times = log["aiData"]["waveStats"]["completionTimes"]
    all_times.extend(times)

# Plot distribution
plt.hist(all_times, bins=20)
plt.xlabel("Wave Completion Time (ms)")
plt.ylabel("Frequency")
plt.title("Wave Completion Time Distribution")
plt.show()
```

### JavaScript Analysis Example

```javascript
// Load and analyze logs
const logs = await Promise.all(
  logFiles.map(file => fetch(file).then(r => r.json()))
);

// Calculate average survival rate
const avgSurvival = logs.reduce((sum, log) => 
  sum + log.gameData.survivalRate, 0) / logs.length;

console.log(`Average Survival Rate: ${avgSurvival.toFixed(1)}%`);

// Find most used tower
const towerUsage = {};
logs.forEach(log => {
  Object.entries(log.aiData.towerComposition).forEach(([type, count]) => {
    towerUsage[type] = (towerUsage[type] || 0) + count;
  });
});

console.log("Tower Usage:", towerUsage);
```

## Continuous Balancing Process

### 1. Baseline Testing
- Run 20 AI sessions with current balance
- Record all metrics
- Establish baseline performance

### 2. Identify Issues
- Analyze collected data
- Find outliers and patterns
- Prioritize balance issues

### 3. Make Changes
- Adjust one variable at a time
- Document changes in git commit
- Keep changes small and measurable

### 4. Validation Testing
- Run 20 more AI sessions
- Compare with baseline
- Verify improvements

### 5. Iterate
- Repeat process for next issue
- Track changes over time
- Build historical data

## Common Patterns

### Pattern: "The Wall"
**Symptoms:**
- Consistent failure at specific wave
- Sudden spike in lives lost
- Long completion times

**Diagnosis:**
- Check zombie stats for that wave
- Compare with previous wave
- Look for new zombie types introduced

**Solution:**
- Reduce zombie health by 10-15%
- OR increase money rewards before that wave
- OR adjust zombie spawn timing

### Pattern: "Snowball Effect"
**Symptoms:**
- Early success leads to easy late game
- Peak money keeps increasing
- No challenge after wave 10

**Diagnosis:**
- Economy too generous
- Tower upgrades too powerful
- Zombie scaling too slow

**Solution:**
- Reduce money rewards by 15%
- OR increase zombie health scaling
- OR reduce tower upgrade effectiveness

### Pattern: "Resource Starvation"
**Symptoms:**
- Low build rate
- High peak money never reached
- Towers rarely upgraded

**Diagnosis:**
- Money rewards too low
- Towers too expensive
- Upgrades too expensive

**Solution:**
- Increase money rewards by 20%
- OR reduce tower costs by 10%
- OR reduce upgrade costs by 15%

## Best Practices

1. **Run Multiple Sessions**: Never balance based on single run
2. **Control Variables**: Change one thing at a time
3. **Document Changes**: Track what you changed and why
4. **Use Version Control**: Tag releases for comparison
5. **Test Edge Cases**: Try different strategies manually
6. **Listen to Data**: Don't let bias override statistics
7. **Iterate Quickly**: Small frequent changes beat big rare ones
8. **Track History**: Keep old logs for comparison

## Metrics Dashboard (Recommended)

Create a simple dashboard tracking:
- Average wave reached (trend over time)
- Average survival rate (trend over time)
- Tower usage distribution (pie chart)
- Wave completion times (line graph)
- Lives lost per wave (bar chart)

Update after each balance change to visualize impact.

---

_For implementation details, see `src/managers/AIPlayerManager.ts`_  
_For log format details, see `GAME_LOGS_README.md`_  
_For AI strategy details, see `AI_PLAYER_GUIDE.md`_
