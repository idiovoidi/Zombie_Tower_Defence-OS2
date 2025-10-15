---
inclusion: always
---

# Stat Tracking & Player Reports

## Overview

Z-TD includes comprehensive stat tracking for both AI and manual gameplay. All game sessions generate detailed JSON reports saved to `player_reports/` with 5 major metric categories.

## Report System Architecture

### Core Components

- **LogExporter** (`src/utils/LogExporter.ts`) - Handles report generation and storage
- **AIPlayerManager** (`src/managers/AIPlayerManager.ts`) - Tracks metrics during gameplay
- **Report Server** (`server.js`) - Saves reports to filesystem (required for file saving)

### Report Structure

Reports follow the `GameLogEntry` interface with these sections:

1. **Game Data** - Basic outcome (wave, lives, money, survival rate)
2. **AI Data** - Decision-making, tower composition, wave stats
3. **Combat Stats** - Damage, kills, DPS, accuracy, overkill
4. **Economy Stats** - Money timeline, income/expenses, cash flow trends
5. **Efficiency Stats** - Cost-effectiveness, resource utilization
6. **Timeline Stats** - Game state snapshots every 10 seconds

## Metric Tracking Rules

### Automatic Tracking

These metrics track automatically without integration:

- Money timeline (every 5 seconds)
- Game state snapshots (every 10 seconds)
- Peak money and lowest lives
- Tower composition and upgrade distribution
- Wave completion times
- Economy efficiency and cash flow trends

### Manual Integration Required

These require explicit calls from game systems:

```typescript
// From combat system when damage is dealt
aiPlayerManager.trackDamage(damage, towerType, zombieKilled, overkillAmount);

// From tower when shooting
aiPlayerManager.trackShot(projectileHit);
```

## Working with Reports

### Generating Reports

Reports auto-save when:
- AI player is disabled
- Game ends (victory/defeat)
- Player manually stops

Filename format: `YYYY-MM-DD_HH-MM-SS_AI/MANUAL_waveX.json`

### Server Requirement

The report server MUST be running to save files:

```bash
npm run dev:full  # Starts both game and report server
```

Without the server, reports store in localStorage only (max 100).

### Recovery Mode

If server wasn't running, recover logs from localStorage:

```javascript
// In browser console
LogExporter.exportAllLogs();  // Downloads all stored logs
LogExporter.viewStoredLogs(); // View in console
LogExporter.clearAllLogs();   // Clear localStorage
```

## Performance Benchmarks

### Combat Performance

- **Good DPS**: >150 average, >300 peak
- **Good Accuracy**: >80% hit rate
- **Low Overkill**: <5% of total damage

### Economy Health

- **Efficiency**: >150% (earning more than spending)
- **Cash Flow**: GROWING trend
- **Bankruptcy**: 0 events

### Cost Efficiency

- **Excellent**: >100 damage per dollar
- **Good**: 50-100 damage per dollar
- **Fair**: 25-50 damage per dollar
- **Poor**: <25 damage per dollar

## Code Conventions

### Adding New Metrics

When adding metrics to reports:

1. Update `GameLogEntry` interface in `LogExporter.ts`
2. Add tracking fields to `AIPerformanceStats` in `AIPlayerManager.ts`
3. Initialize fields in `createEmptyStats()`
4. Track values in `trackMetrics()` or dedicated tracking methods
5. Export in `exportStats()` method
6. Document in `design_docs/AI_Test_Balance/`

### Metric Naming

- Use camelCase for field names
- Prefix collections with "total" (totalDamageDealt)
- Use "Per" for ratios (damagePerDollar, moneyPerWave)
- Use "average" for means, "peak" for maximums
- End rates with "Rate" (accuracyRate, survivalRate)

### Map to Object Conversion

Always convert Maps to plain objects for JSON export:

```typescript
const plainObject: Record<string, number> = {};
mapData.forEach((value, key) => {
  plainObject[key] = value;
});
```

## Testing & Debugging

### Console Logging

AI manager logs performance every 10 seconds during gameplay:

```
🤖 ─────────────────────────────────────────────────────
🤖 AI Performance Report (120s elapsed)
🤖 Wave: 8 (highest: 8)
🤖 Money: 750 (spent: 1200)
🤖 Towers Built: 9
```

### Validation

Check reports for:

- All required fields present
- No NaN or undefined values
- Maps properly converted to objects
- Timestamps in ISO format
- Percentages between 0-100
- Ratings use correct format (⭐, 🛡️)

## Common Issues

### Reports Not Saving

**Problem**: Reports not appearing in `player_reports/`  
**Solution**: Ensure server is running (`npm run dev:full`)  
**Recovery**: Use `LogExporter.exportAllLogs()` in console

### Missing Combat Stats

**Problem**: Combat stats show 0 or undefined  
**Solution**: Integrate `trackDamage()` and `trackShot()` calls in combat system

### Incorrect Calculations

**Problem**: Efficiency metrics seem wrong  
**Solution**: Check for division by zero, ensure all costs tracked, verify Map conversions

## Documentation References

- **Full Metrics Guide**: `design_docs/AI_Test_Balance/ENHANCED_METRICS_GUIDE.md`
- **Quick Reference**: `design_docs/AI_Test_Balance/METRICS_QUICK_REFERENCE.md`
- **Implementation Summary**: `design_docs/AI_Test_Balance/ENHANCED_TRACKING_SUMMARY.md`
- **Example Report**: `player_reports/EXAMPLE_REPORT.json`

## 📊 Key Metrics at a Glance

### Combat Performance ⚔️
| Metric | Good | Fair | Poor |
|--------|------|------|------|
| **Average DPS** | >150 | 100-150 | <100 |
| **Accuracy Rate** | >80% | 60-80% | <60% |
| **Overkill %** | <5% | 5-10% | >10% |

### Economy Health 💰
| Metric | Good | Fair | Poor |
|--------|------|------|------|
| **Economy Efficiency** | >150% | 100-150% | <100% |
| **Cash Flow Trend** | GROWING | STABLE | DECLINING |
| **Bankruptcy Events** | 0 | 1 | >1 |

### Cost Efficiency 📈
| Metric | Excellent | Good | Fair | Poor |
|--------|-----------|------|------|------|
| **Damage/Dollar** | >100 | 50-100 | 25-50 | <25 |
| **Kills/Dollar** | >1.0 | 0.5-1.0 | 0.25-0.5 | <0.25 |

### Defense Quality 🛡️
| Survival Rate | Rating |
|---------------|--------|
| 100% | 🛡️ PERFECT DEFENSE |
| 80-99% | 🛡️ STRONG DEFENSE |
| 50-79% | ⚠️ MODERATE DEFENSE |
| <50% | ❌ WEAK DEFENSE |

### Wave Performance ⭐
| Highest Wave | Rating |
|--------------|--------|
| 20+ | ⭐⭐⭐⭐⭐ EXCELLENT |
| 15-19 | ⭐⭐⭐⭐ GREAT |
| 10-14 | ⭐⭐⭐ GOOD |
| 5-9 | ⭐⭐ FAIR |
| 1-4 | ⭐ NEEDS IMPROVEMENT |

---

## 🚨 Warning Signs

### Critical Issues
- ❌ **Bankruptcy Events > 0** → Running out of money
- ❌ **Economy Efficiency < 100%** → Spending more than earning
- ❌ **Survival Rate < 50%** → Weak defense

### Performance Issues
- ⚠️ **Damage/Dollar < 25** → Inefficient towers
- ⚠️ **Overkill > 10%** → Poor targeting
- ⚠️ **Cash Flow: DECLINING** → Unsustainable economy
- ⚠️ **Average DPS < 100** → Insufficient damage

---

## 💡 Quick Optimization Tips

### If Damage/Dollar is Low:
1. Build fewer towers, upgrade more
2. Focus on cost-effective tower types
3. Place towers in high-traffic areas

### If Overkill is High:
1. Spread towers out more
2. Use different tower types
3. Avoid stacking too much damage in one spot

### If Economy is Declining:
1. Build fewer towers per wave
2. Wait for more money before upgrading
3. Focus on income-generating strategies

### If Accuracy is Low:
1. Use more area-effect towers (Shotgun, Tesla, Flame)
2. Place towers closer to path
3. Upgrade tower range

---

## 📁 Report Location

Reports save to: `player_reports/`

Filename format: `YYYY-MM-DD_HH-MM-SS_AI/MANUAL_waveX.json`

Example: `2025-10-15_14-30-45_AI_wave15.json`

---

## 🎯 Target Benchmarks

### Beginner Goals
- Reach wave 10
- 80%+ survival rate
- 0 bankruptcy events
- Damage/dollar > 15

### Intermediate Goals
- Reach wave 15
- 90%+ survival rate
- Economy efficiency > 120%
- Damage/dollar > 25

### Advanced Goals
- Reach wave 20+
- 100% survival rate
- Economy efficiency > 150%
- Damage/dollar > 50
- Overkill < 5%

---

## 📊 Using Timeline Data

Timeline snapshots (every 10s) show:
- Money trends
- DPS growth
- Tower count progression
- Zombie pressure

**Use for:**
- Identifying critical moments
- Visualizing performance trends
- Comparing different strategies
- Finding bottlenecks

---
# Enhanced Player Tracking - Implementation Summary

## What Was Added

Comprehensive tracking system for player reports with 5 major metric categories.

---

## New Metrics Categories

### 1. Combat Stats ⚔️
- Total damage dealt and DPS (average & peak)
- Zombie kills and accuracy rate
- Damage/kills breakdown by tower type
- Per-wave combat statistics
- Overkill damage tracking

### 2. Economy Stats 💰
- Money timeline (snapshots every 5 seconds)
- Income vs expenses per wave
- Net profit/loss tracking
- Cash flow trends (GROWING/STABLE/DECLINING)
- Bankruptcy event detection
- Economy efficiency rating

### 3. Efficiency Stats 📊
- Damage per dollar spent
- Kills per dollar spent
- Damage/kills per tower
- Upgrade efficiency
- Resource utilization percentage
- Cost efficiency rating (EXCELLENT/GOOD/FAIR/POOR)

### 4. Timeline Stats 📈
- Game state snapshots every 10 seconds
- Tracks: money, lives, towers, zombies, DPS
- Enables visualization and trend analysis

### 5. Enhanced AI Data
- All previous AI metrics retained
- Now includes money earned tracking
- Per-wave spending breakdown

---

## Files Modified

### `src/utils/LogExporter.ts`
- **Added**: `combatStats` interface
- **Added**: `economyStats` interface
- **Added**: `efficiencyStats` interface
- **Added**: `timelineStats` interface
- **Updated**: `GameLogEntry` interface with new fields

### `src/managers/AIPlayerManager.ts`
- **Added**: Combat tracking fields to `AIPerformanceStats`
- **Added**: Economy tracking fields
- **Added**: Timeline snapshot system
- **Added**: `trackMetrics()` method - runs every frame
- **Added**: `trackDamage()` method - call from combat system
- **Added**: `trackShot()` method - call from towers
- **Added**: `calculateCurrentDPS()` method
- **Updated**: `exportStats()` - generates all new metrics

---

## How It Works

### Automatic Tracking

The AI manager now tracks metrics continuously:

1. **Every Frame**: Updates DPS, checks for peak values
2. **Every 5 Seconds**: Snapshots money for timeline
3. **Every 10 Seconds**: Full game state snapshot
4. **Every Wave**: Tracks income, expenses, combat stats

### Manual Tracking (TODO)

Some metrics require integration with other systems:

```typescript
// From TowerCombatManager when damage is dealt:
aiPlayerManager.trackDamage(damage, towerType, killed, overkill);

// From Tower when shooting:
aiPlayerManager.trackShot(hit);
```

---

## Report Structure

```json
{
  "timestamp": "2025-10-15T14:30:45.123Z",
  "sessionId": "session_1729012345_abc123",
  "isAIRun": true,
  "duration": 300000,
  "gameData": { ... },
  "aiData": { ... },
  "combatStats": {
    "totalDamageDealt": 45000.50,
    "averageDPS": 125.30,
    "peakDPS": 380.75,
    ...
  },
  "economyStats": {
    "totalIncome": 3500,
    "totalExpenses": 2400,
    "netProfit": 1100,
    "cashFlowTrend": "GROWING",
    ...
  },
  "efficiencyStats": {
    "damagePerDollar": 18.75,
    "costEfficiencyRating": "FAIR",
    ...
  },
  "timelineStats": {
    "snapshots": [...],
    ...
  }
}
```

---

## Usage

### Running with Enhanced Tracking

```bash
# Start both servers
npm run dev:full

# Play game or run AI
# Reports automatically save to player_reports/
```

### Analyzing Reports

1. **Check combat efficiency**: Look at `damagePerDollar` and `costEfficiencyRating`
2. **Monitor economy**: Check `cashFlowTrend` and `economyEfficiency`
3. **Optimize DPS**: Compare `averageDPS` vs `peakDPS`
4. **Reduce waste**: Check `overkillDamage` percentage
5. **Visualize trends**: Use `timelineStats.snapshots` for graphs

---

## Next Steps

### Integration Required

To fully utilize combat tracking, integrate these calls:

1. **In TowerCombatManager** (when damage is dealt):
```typescript
const aiManager = this.gameManager.getAIPlayerManager();
if (aiManager.isEnabled()) {
  aiManager.trackDamage(damage, tower.getType(), zombieKilled, overkillAmount);
}
```

2. **In Tower classes** (when shooting):
```typescript
const aiManager = this.gameManager.getAIPlayerManager();
if (aiManager.isEnabled()) {
  aiManager.trackShot(projectileHit);
}
```

### Future Enhancements

- Tower synergy detection
- Zombie type-specific analysis
- Critical moment identification
- Heatmap generation
- Multi-run comparison tools

---

## Documentation

- **Full Guide**: `design_docs/ENHANCED_METRICS_GUIDE.md`
- **Server Setup**: `START_SERVER.md`
- **Report Format**: See `GameLogEntry` interface in `src/utils/LogExporter.ts`

---

## Benefits

✅ **Comprehensive Data**: Track everything that matters  
✅ **Performance Analysis**: Identify bottlenecks and inefficiencies  
✅ **Strategy Optimization**: Data-driven decision making  
✅ **Trend Visualization**: See how metrics change over time  
✅ **Cost Analysis**: Understand ROI for every dollar spent  
✅ **Combat Insights**: Know which towers perform best  


