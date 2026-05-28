---
inclusion: fileMatch
fileMatchPattern: ['**/utils/**/*.ts', '**/managers/AIPlayerManager.ts', '**/utils/LogExporter.ts']
---

# Stat Tracking

## Key Files
- `src/utils/LogExporter.ts` — report generation/storage
- `src/managers/AIPlayerManager.ts` — metric tracking (delegates to StatTracker)
- `src/utils/StatTracker.ts` — centralized stat storage
- `server.js` — saves reports to filesystem (`npm run dev:full`)

## Manual Tracking Calls
```typescript
aiPlayerManager.trackDamage(damage, towerType, zombieKilled, overkillAmount);
aiPlayerManager.trackShot(projectileHit);
```

## Adding New Metrics
1. Update `GameLogEntry` in `LogExporter.ts`
2. Add field to `AIPerformanceStats` in `AIPlayerManager.ts`
3. Initialize in `createEmptyStats()`
4. Track in `trackMetrics()` or dedicated method
5. Export in `exportStats()`

## Naming Conventions
- camelCase fields
- `total` prefix for aggregates (`totalDamageDealt`)
- `Per` for ratios (`damagePerDollar`)
- `Rate` suffix for rates (`accuracyRate`)
- Maps → plain objects for JSON: `map.forEach((v, k) => { obj[k] = v; })`

## Report Filename
`YYYY-MM-DD_HH-MM-SS_AI/MANUAL_waveX.json`

## Recovery (if server was offline)
```javascript
LogExporter.exportAllLogs();   // download from localStorage
LogExporter.clearAllLogs();
```

## Benchmarks

| Metric | Good | Poor |
|--------|------|------|
| Avg DPS | >150 | <100 |
| Accuracy | >80% | <60% |
| Overkill | <5% | >10% |
| Economy Efficiency | >150% | <100% |
| Damage/Dollar | >100 | <25 |
