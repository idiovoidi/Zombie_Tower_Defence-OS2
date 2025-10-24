---
inclusion: fileMatch
fileMatchPattern: ['**/utils/**/*.ts', '**/managers/AIPlayerManager.ts', '**/utils/LogExporter.ts']
---

# Stat Tracking & Player Reports

## Quick Reference

### Report System Components

- **LogExporter** (`src/utils/LogExporter.ts`) - Report generation and storage
- **AIPlayerManager** (`src/managers/AIPlayerManager.ts`) - Metric tracking during gameplay
- **Report Server** (`server.js`) - Saves reports to filesystem

### Report Sections

1. **Game Data** - Wave, lives, money, survival rate
2. **AI Data** - Decisions, tower composition, wave stats
3. **Combat Stats** - Damage, kills, DPS, accuracy, overkill
4. **Economy Stats** - Money timeline, income/expenses, cash flow
5. **Efficiency Stats** - Cost-effectiveness, resource utilization
6. **Timeline Stats** - Game state snapshots (every 10s)

## Performance Benchmarks

### Combat Performance ⚔️

| Metric            | Good | Fair    | Poor |
| ----------------- | ---- | ------- | ---- |
| **Average DPS**   | >150 | 100-150 | <100 |
| **Accuracy Rate** | >80% | 60-80%  | <60% |
| **Overkill %**    | <5%  | 5-10%   | >10% |

### Economy Health 💰

| Metric                 | Good    | Fair     | Poor      |
| ---------------------- | ------- | -------- | --------- |
| **Economy Efficiency** | >150%   | 100-150% | <100%     |
| **Cash Flow Trend**    | GROWING | STABLE   | DECLINING |
| **Bankruptcy Events**  | 0       | 1        | >1        |

### Cost Efficiency 📈

| Metric            | Excellent | Good    | Fair     | Poor  |
| ----------------- | --------- | ------- | -------- | ----- |
| **Damage/Dollar** | >100      | 50-100  | 25-50    | <25   |
| **Kills/Dollar**  | >1.0      | 0.5-1.0 | 0.25-0.5 | <0.25 |

### Defense Quality 🛡️

| Survival Rate | Rating              |
| ------------- | ------------------- |
| 100%          | 🛡️ PERFECT DEFENSE  |
| 80-99%        | 🛡️ STRONG DEFENSE   |
| 50-79%        | ⚠️ MODERATE DEFENSE |
| <50%          | ❌ WEAK DEFENSE     |

### Wave Performance ⭐

| Highest Wave | Rating               |
| ------------ | -------------------- |
| 20+          | ⭐⭐⭐⭐⭐ EXCELLENT |
| 15-19        | ⭐⭐⭐⭐ GREAT       |
| 10-14        | ⭐⭐⭐ GOOD          |
| 5-9          | ⭐⭐ FAIR            |
| 1-4          | ⭐ NEEDS IMPROVEMENT |

## Tracking Integration

### Automatic Tracking

These metrics track automatically:
- Money timeline (every 5 seconds)
- Game state snapshots (every 10 seconds)
- Peak money and lowest lives
- Tower composition and upgrade distribution
- Wave completion times
- Economy efficiency and cash flow trends

### Manual Integration Required

```typescript
// From combat system when damage is dealt
aiPlayerManager.trackDamage(damage, towerType, zombieKilled, overkillAmount);

// From tower when shooting
aiPlayerManager.trackShot(projectileHit);
```

## Report Generation

### Server Requirement

Reports auto-save when AI is disabled or game ends. Server MUST be running:

```bash
npm run dev:full  # Starts both game and report server
```

### Filename Format

`YYYY-MM-DD_HH-MM-SS_AI/MANUAL_waveX.json`

Example: `2025-10-15_14-30-45_AI_wave15.json`

### Recovery Mode

If server wasn't running, recover from localStorage:

```javascript
LogExporter.exportAllLogs();  // Downloads all stored logs
LogExporter.viewStoredLogs(); // View in console
LogExporter.clearAllLogs();   // Clear localStorage
```

## Code Conventions

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

### Adding New Metrics

1. Update `GameLogEntry` interface in `LogExporter.ts`
2. Add tracking fields to `AIPerformanceStats` in `AIPlayerManager.ts`
3. Initialize fields in `createEmptyStats()`
4. Track values in `trackMetrics()` or dedicated methods
5. Export in `exportStats()` method

## Warning Signs

### Critical Issues

- ❌ **Bankruptcy Events > 0** → Running out of money
- ❌ **Economy Efficiency < 100%** → Spending more than earning
- ❌ **Survival Rate < 50%** → Weak defense

### Performance Issues

- ⚠️ **Damage/Dollar < 25** → Inefficient towers
- ⚠️ **Overkill > 10%** → Poor targeting
- ⚠️ **Cash Flow: DECLINING** → Unsustainable economy
- ⚠️ **Average DPS < 100** → Insufficient damage

## See Also

- [Detailed Implementation Guide](../../../design_docs/Core_Systems/Stat_Tracking/GUIDE.md)
- [Code Examples](../../../design_docs/Core_Systems/Stat_Tracking/EXAMPLES.md)
