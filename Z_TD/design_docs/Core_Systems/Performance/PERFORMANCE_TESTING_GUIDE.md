# Balance Analysis Performance Testing Guide

## Overview

This guide explains how to test and verify the performance of the balance analysis system to ensure it meets the requirement of < 5ms per analysis with no frame rate impact.

## Performance Requirements

- **Analysis Time**: < 5ms per analysis operation
- **Frame Rate Impact**: < 5% FPS drop during analysis
- **Load Testing**: Handle 1000+ operations without degradation
- **Real-Time Analysis**: Complete within 10-second intervals

## Running Performance Tests

### Quick Start

1. Start the game in development mode:

```bash
npm run dev
```

2. Open browser console (F12)

3. Load performance testing tools:

```javascript
performanceTest();
```

4. Run all tests:

```javascript
runBalancePerformanceTests();
```

5. Test frame rate impact:

```javascript
await runFrameRateTest();
```

## Test Suites

### 1. BalanceAnalyzer Operations Test

Tests all mathematical balance analysis functions:

- `canDefendWave` - Lanchester's Laws calculation
- `calculateEfficiencyScore` - Tower efficiency scoring
- `applyDiminishingReturns` - Diminishing returns formula
- `calculateThreatScore` - Zombie threat scoring
- `calculateEffectiveDPS` - Effective DPS with overkill
- `calculateBreakEvenPoint` - Tower ROI calculation
- `detectBalanceIssues` - Balance issue detection
- `getOptimalTowerMix` - Optimal tower composition
- `analyzeTowerEfficiency` - Comprehensive tower analysis

**Expected Results**: All operations < 5ms

### 2. StatisticalAnalyzer Operations Test

Tests statistical analysis functions:

- `detectOutliers` - Outlier detection (100 values)
- `analyzeTrend` - Linear regression (20 data points)
- `predictWaveDifficulty` - Polynomial regression (5 predictions)
- `calculateSummary` - Statistical summary (100 values)

**Expected Results**: All operations < 5ms

### 3. Combined Analysis Test (Real-World Scenario)

Tests realistic analysis scenarios:

- **Real-Time Analysis** - Balance issue detection + tower efficiency + wave defense
- **Wave-End Analysis** - Trend analysis + predictions
- **End-Game Analysis** - Outlier detection + summary + final balance check

**Expected Results**:

- Real-Time Analysis: < 5ms
- Wave-End Analysis: < 5ms
- End-Game Analysis: < 5ms

### 4. Load Testing

Tests performance under heavy load:

- 1000 balance issue detections
- 1000 efficiency calculations

**Expected Results**: Batch operations < 50ms

### 5. Frame Rate Impact Test

Tests impact on game frame rate:

- Measures baseline FPS (1 second)
- Runs analysis operations for 3 seconds (100 ops/sec)
- Compares FPS before and after

**Expected Results**: FPS drop < 5%

## Interpreting Results

### Console Output

Each test displays:

```
✅ operationName: 2.345ms [PASS] (threshold: 5ms)
❌ operationName: 7.890ms [FAIL] (threshold: 5ms)
```

### Performance Report

At the end of each test suite:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Performance Test Report: Test Name
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  Test Duration: 45.67ms

📈 Summary Statistics:
   Total Operations: 9
   ✅ Passed: 9
   ❌ Failed: 0
   Pass Rate: 100.0%

⚡ Execution Times:
   Average: 2.345ms
   Maximum: 3.890ms
   Minimum: 1.234ms

🎮 Frame Rate Impact:
   Baseline FPS: 60.0
   Test FPS: 59.2
   FPS Drop: 1.3%
   ✅ Impact: ACCEPTABLE

✅ Overall Result: PASSED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Success Criteria

- ✅ **All operations < 5ms**: Each individual operation completes within threshold
- ✅ **Pass rate 100%**: All tests pass
- ✅ **FPS drop < 5%**: Minimal impact on game performance
- ✅ **Average time < 3ms**: Good performance headroom

### Warning Signs

- ⚠️ **Operations > 5ms**: Performance issue detected
- ⚠️ **FPS drop > 5%**: Significant frame rate impact
- ⚠️ **Increasing times**: Performance degradation over time

## Manual Performance Monitoring

### In-Game Performance Stats

The BalanceTrackingManager automatically tracks performance:

```javascript
// Get performance stats
const stats = gameManager.getBalanceTrackingManager().getPerformanceStats();

console.log('Analysis Count:', stats.analysisCount);
console.log('Average Time:', stats.avgAnalysisTime.toFixed(3), 'ms');
console.log('Max Time:', stats.maxAnalysisTime.toFixed(3), 'ms');
console.log('Last Time:', stats.lastAnalysisTime.toFixed(3), 'ms');
```

### Console Warnings

The system automatically logs warnings if analysis exceeds 5ms:

```
⚠️ Balance analysis took 7.23ms (target: <5ms)
```

## Troubleshooting

### High Execution Times

If operations exceed 5ms:

1. **Check Data Size**: Large datasets slow down analysis
   - Limit damage events to recent data
   - Use sampling for statistical analysis

2. **Optimize Calculations**: Review expensive operations
   - Cache repeated calculations
   - Use early exits where possible

3. **Library Performance**: Check external libraries
   - Verify libraries are loaded correctly
   - Consider alternative implementations

### Frame Rate Impact

If FPS drops > 5%:

1. **Throttle Analysis**: Increase analysis interval
   - Default: 10 seconds
   - Consider: 15-20 seconds

2. **Batch Operations**: Spread work across frames
   - Process data incrementally
   - Use requestIdleCallback

3. **Disable Features**: Temporarily disable expensive features
   - Outlier detection
   - Predictive modeling

## Performance Optimization Tips

### 1. Data Management

```typescript
// ❌ Bad: Process all events
const allDamage = damageEvents.map(e => e.damage);

// ✅ Good: Process recent events only
const recentDamage = damageEvents.filter(e => Date.now() - e.time < 60000).map(e => e.damage);
```

### 2. Caching

```typescript
// ❌ Bad: Recalculate every time
const efficiency = calculateEfficiency(tower);

// ✅ Good: Cache and reuse
if (!cachedEfficiency) {
  cachedEfficiency = calculateEfficiency(tower);
}
```

### 3. Early Exits

```typescript
// ❌ Bad: Always process everything
function analyze(data) {
  // ... expensive operations
}

// ✅ Good: Exit early if possible
function analyze(data) {
  if (data.length === 0) return;
  if (!enabled) return;
  // ... expensive operations
}
```

## Continuous Monitoring

### During Development

1. Run performance tests after changes
2. Monitor console for warnings
3. Check performance stats regularly

### During Playtesting

1. Enable balance tracking
2. Monitor FPS counter
3. Check for warning messages
4. Review performance stats at end

### Before Release

1. Run full test suite
2. Verify all tests pass
3. Test with long sessions (50+ waves)
4. Profile with browser DevTools

## Browser DevTools Profiling

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Run performance tests
5. Stop recording
6. Analyze flame graph

Look for:

- Long-running functions
- Repeated calculations
- Memory allocations

### Firefox DevTools

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Start Recording
4. Run performance tests
5. Stop recording
6. Review call tree

## Automated Testing

### Integration with CI/CD

```javascript
// Example test script
import { BalanceAnalysisPerformanceTest } from './utils/BalanceAnalysisPerformanceTest';

const tester = new BalanceAnalysisPerformanceTest();
tester.runAllTests();

// Check results
const report = tester.profiler.endTest();
if (report.summary.passRate < 100) {
  process.exit(1); // Fail CI build
}
```

## Performance Benchmarks

### Target Performance

| Operation          | Target | Good  | Acceptable |
| ------------------ | ------ | ----- | ---------- |
| Single Analysis    | < 5ms  | < 3ms | < 5ms      |
| Real-Time Analysis | < 5ms  | < 3ms | < 5ms      |
| Wave-End Analysis  | < 5ms  | < 4ms | < 5ms      |
| End-Game Analysis  | < 5ms  | < 4ms | < 5ms      |
| FPS Impact         | < 5%   | < 2%  | < 5%       |

### Hardware Considerations

Performance varies by hardware:

- **High-End** (i7/Ryzen 7+): < 2ms average
- **Mid-Range** (i5/Ryzen 5): < 3ms average
- **Low-End** (i3/Ryzen 3): < 5ms average

## Reporting Issues

If performance tests fail:

1. **Document Environment**:
   - Browser and version
   - Hardware specs
   - Test results

2. **Provide Logs**:
   - Console output
   - Performance report
   - Browser profiler data

3. **Reproduction Steps**:
   - How to trigger issue
   - Specific operations affected
   - Frequency of occurrence

## Summary

The balance analysis system is designed to meet strict performance requirements:

- ✅ All operations < 5ms
- ✅ No frame rate impact
- ✅ Handles high load
- ✅ Continuous monitoring

Regular performance testing ensures the system remains fast and responsive throughout development.

---

_Last Updated: 2025-10-15_  
_Performance Target: < 5ms per analysis_  
_Frame Rate Target: < 5% FPS drop_
