# Performance Data Export Added

## What Was Added

Wave memory snapshots and performance metrics are now automatically exported with game reports.

## New Data in Reports

### performanceStats Section

All game reports now include:

```json
{
  "performanceStats": {
    "waveMemorySnapshots": [
      {
        "wave": 1,
        "timestamp": 1234567890,
        "heapUsedMB": 250.5,
        "heapTotalMB": 300.0
      },
      {
        "wave": 2,
        "timestamp": 1234567920,
        "heapUsedMB": 265.3,
        "heapTotalMB": 300.0
      }
      // ... one snapshot per wave
    ],
    "memoryGrowthRate": 15.2, // MB per wave
    "averageFrameTime": 16.7, // milliseconds
    "peakFrameTime": 25.3, // milliseconds
    "averageFPS": 60,
    "lowestFPS": 40
  }
}
```

## What This Helps With

### 1. Memory Leak Detection

```javascript
// Check if memory grows continuously
const snapshots = report.performanceStats.waveMemorySnapshots;
const firstWave = snapshots[0].heapUsedMB;
const lastWave = snapshots[snapshots.length - 1].heapUsedMB;
const growth = lastWave - firstWave;

if (growth > 200) {
  console.warn('Possible memory leak detected!');
}
```

### 2. Performance Regression Testing

```javascript
// Compare performance across versions
const growthRate = report.performanceStats.memoryGrowthRate;
const avgFPS = report.performanceStats.averageFPS;

if (growthRate > 10) {
  console.warn('Memory growth exceeds 10 MB/wave');
}

if (avgFPS < 30) {
  console.warn('Performance below 30 FPS');
}
```

### 3. Wave-by-Wave Analysis

```javascript
// Find which wave causes performance drop
snapshots.forEach((snapshot, i) => {
  if (i > 0) {
    const memoryIncrease = snapshot.heapUsedMB - snapshots[i - 1].heapUsedMB;
    if (memoryIncrease > 50) {
      console.log(`Wave ${snapshot.wave}: Large memory increase (+${memoryIncrease}MB)`);
    }
  }
});
```

## Files Modified

1. **src/utils/LogExporter.ts**
   - Added `performanceStats` to `GameLogEntry` interface
   - Includes wave memory snapshots and FPS data

2. **src/utils/StatTracker.ts**
   - Added `getPerformanceStats()` method
   - Automatically includes performance data in exports
   - Imports `PerformanceMonitor`

3. **src/managers/GameManager.ts**
   - Updated manual game log export
   - Includes performance stats for manual play sessions

## Usage

### Automatic Export

Performance data is automatically included in all game reports:

- AI test runs
- Manual play sessions
- Balance analysis reports

### Viewing Performance Data

```javascript
// In browser console after game ends
const logs = LogExporter.viewStoredLogs();
const latestLog = logs[logs.length - 1];
console.table(latestLog.performanceStats.waveMemorySnapshots);
```

### Analyzing Memory Growth

```javascript
// Check memory growth rate
const report = /* load report JSON */;
const growthRate = report.performanceStats.memoryGrowthRate;

if (growthRate === null) {
  console.log('Not enough data to calculate growth rate');
} else if (growthRate > 10) {
  console.warn(`High memory growth: ${growthRate.toFixed(2)} MB/wave`);
} else {
  console.log(`Normal memory growth: ${growthRate.toFixed(2)} MB/wave`);
}
```

## Expected Values (After Fixes)

### Healthy Performance:

- **Memory Growth Rate**: 2-5 MB/wave
- **Wave 1 Memory**: 250-300 MB
- **Wave 20 Memory**: 400-500 MB
- **Average FPS**: 50-60
- **Lowest FPS**: 40+

### Warning Signs:

- **Memory Growth Rate**: >10 MB/wave (possible leak)
- **Wave 20 Memory**: >800 MB (memory leak)
- **Average FPS**: <30 (performance issue)
- **Lowest FPS**: <20 (critical performance issue)

## Debugging with Performance Data

### Example: Finding Memory Leak

```javascript
// Load report
const report = require('./player_reports/2025-10-25_14-30-45_AI_wave20.json');

// Check memory growth
const snapshots = report.performanceStats.waveMemorySnapshots;
console.log('Wave | Memory (MB) | Growth');
console.log('-----|-------------|-------');
snapshots.forEach((s, i) => {
  const growth = i > 0 ? s.heapUsedMB - snapshots[i - 1].heapUsedMB : 0;
  console.log(
    `${s.wave.toString().padStart(4)} | ${s.heapUsedMB.toFixed(1).padStart(11)} | ${growth > 0 ? '+' : ''}${growth.toFixed(1)}`
  );
});
```

### Example: Comparing Before/After Fix

```javascript
// Load reports
const before = require('./before_fix_wave20.json');
const after = require('./after_fix_wave20.json');

console.log('Comparison:');
console.log(
  `Memory Growth: ${before.performanceStats.memoryGrowthRate}MB/wave → ${after.performanceStats.memoryGrowthRate}MB/wave`
);
console.log(
  `Average FPS: ${before.performanceStats.averageFPS} → ${after.performanceStats.averageFPS}`
);
console.log(
  `Wave 20 Memory: ${before.performanceStats.waveMemorySnapshots[19].heapUsedMB}MB → ${after.performanceStats.waveMemorySnapshots[19].heapUsedMB}MB`
);
```

## Notes

- Performance data requires Chrome's memory API (`performance.memory`)
- If memory API is unavailable, snapshots will be empty but won't cause errors
- FPS data is based on last frame time (could be enhanced to track averages)
- Memory snapshots are recorded at the start of each wave
