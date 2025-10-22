# Balance Analysis Edge Case Testing Guide

## Overview

This guide covers comprehensive edge case testing for the balance analysis integration. These tests verify that the system handles unusual scenarios gracefully without crashing or producing invalid results.

## Test Categories

### 1. No Towers Placed (Empty Game)

Tests scenarios where the player hasn't built any towers yet.

**Tests:**

- Wave defense analysis with 0 DPS
- Efficiency metrics with no spending
- Statistical analysis with empty datasets
- Optimal tower mix with zero budget

**Expected Behavior:**

- ✅ Should correctly identify inability to defend
- ✅ Should detect balance issues (inefficient towers, negative economy)
- ✅ Should handle empty arrays gracefully
- ✅ Should return empty tower mix for zero budget

### 2. Game Ending on Wave 1

Tests scenarios where the game ends very early with minimal data.

**Tests:**

- Single wave data point analysis
- Predictions with minimal historical data
- Outlier detection with single value
- Break-even analysis with minimal playtime

**Expected Behavior:**

- ✅ Should handle single data points without errors
- ✅ Should generate predictions even with minimal history
- ✅ Should not identify single values as outliers
- ✅ Should calculate finite break-even times

### 3. Very Long Sessions (50+ Waves)

Tests performance and accuracy with large datasets from extended gameplay.

**Tests:**

- Large dataset performance (50 waves)
- Memory efficiency with 10,000+ events
- Prediction accuracy over long sessions
- Large budget optimization

**Expected Behavior:**

- ✅ Analysis should complete in < 50ms for 50 waves
- ✅ Outlier detection should handle 10,000 events in < 100ms
- ✅ Predictions should remain accurate and finite
- ✅ Tower mix optimization should handle large budgets efficiently

### 4. Tracking Disabled

Tests that analysis functions work independently without the tracking manager.

**Tests:**

- Independent analysis function calls
- Graceful degradation without libraries
- Zero value handling
- Negative value handling
- Extreme value handling

**Expected Behavior:**

- ✅ All analysis functions should work standalone
- ✅ Should handle missing libraries gracefully
- ✅ Should handle zero values without division errors
- ✅ Should handle negative values without crashing
- ✅ Should handle extreme values (very large/small) correctly

## Running the Tests

### Method 1: Browser Console

```javascript
// Run all edge case tests
const results = await runEdgeCaseTests();

// View results
console.log(results);
```

### Method 2: Programmatic

```typescript
import { BalanceAnalysisEdgeCaseTests } from './utils/BalanceAnalysisEdgeCaseTests';

const tester = new BalanceAnalysisEdgeCaseTests();
const suite = await tester.runAllTests();

console.log(`Passed: ${suite.passed}/${suite.totalTests}`);
```

### Method 3: Integration with Game

Add to your test menu or debug panel:

```typescript
// In debug menu
if (debugMenu.addButton('Run Edge Case Tests')) {
  runEdgeCaseTests().then(results => {
    console.log(`Tests completed: ${results.passed}/${results.totalTests} passed`);
  });
}
```

## Test Output Format

### Console Output

```
🧪 Starting Balance Analysis Edge Case Tests...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Testing: No Towers Placed
─────────────────────────────────────────────────────
  ✅ No Towers - Wave Defense Analysis
     Correctly identified inability to defend with no towers
  ✅ No Towers - Efficiency Metrics
     Detected 2 issues correctly (inefficient towers, negative economy)
  ✅ No Towers - Statistical Analysis
     Gracefully handled empty datasets
  ✅ No Towers - Optimal Mix Calculation
     Correctly handled zero budget scenario

📦 Testing: Game Ending on Wave 1
─────────────────────────────────────────────────────
  ✅ Wave 1 End - Single Data Point
     Handled single wave data correctly
  ✅ Wave 1 End - Predictions
     Generated predictions with minimal historical data
  ✅ Wave 1 End - Outlier Detection
     Handled single value outlier detection correctly
  ✅ Wave 1 End - Break-Even Analysis
     Break-even calculated: 20.00s

📦 Testing: Very Long Sessions (50+ Waves)
─────────────────────────────────────────────────────
  ✅ Long Session - Large Dataset Performance
     Analyzed 50 waves in 12.34ms
  ✅ Long Session - Memory Efficiency
     Processed 10,000 events in 45.67ms, found 234 outliers
  ✅ Long Session - Prediction Accuracy
     Generated 5 predictions with valid confidence intervals
  ✅ Long Session - Large Budget Optimization
     Optimized tower mix in 8.90ms: 45 towers

📦 Testing: Tracking Disabled Scenarios
─────────────────────────────────────────────────────
  ✅ Tracking Disabled - Independent Analysis
     All analysis functions work independently
  ✅ Tracking Disabled - Library Graceful Degradation
     Libraries available: stats=true, regression=true, math=true
  ✅ Tracking Disabled - Zero Values
     Handled zero values correctly
  ✅ Tracking Disabled - Negative Values
     Handled negative values without crashing
  ✅ Tracking Disabled - Extreme Values
     Handled extreme values correctly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Edge Case Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests: 18
✅ Passed: 18
❌ Failed: 0
⏱️  Duration: 234.56ms
📈 Success Rate: 100.0%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Result Object

```typescript
{
  totalTests: 18,
  passed: 18,
  failed: 0,
  duration: 234.56,
  results: [
    {
      testName: "No Towers - Wave Defense Analysis",
      passed: true,
      duration: 1.23,
      details: "Correctly identified inability to defend with no towers",
      errors: []
    },
    // ... more results
  ]
}
```

## Performance Targets

| Test Category           | Target Time | Critical Threshold |
| ----------------------- | ----------- | ------------------ |
| Single test             | < 10ms      | 50ms               |
| 50 wave analysis        | < 50ms      | 100ms              |
| 10,000 event processing | < 100ms     | 200ms              |
| Full test suite         | < 500ms     | 1000ms             |

## Common Issues and Solutions

### Issue: Tests Fail Due to Missing Libraries

**Symptom:** Tests report library not available errors

**Solution:**

```bash
npm install simple-statistics regression mathjs
```

### Issue: Performance Tests Fail

**Symptom:** Tests exceed time thresholds

**Solution:**

- Check if running in debug mode (slower)
- Verify no other heavy processes running
- Consider adjusting thresholds for slower machines

### Issue: Division by Zero Errors

**Symptom:** Tests crash with division errors

**Solution:**

- Verify all analysis functions check for zero denominators
- Add guards: `if (denominator === 0) return 0;`

### Issue: NaN or Infinity Results

**Symptom:** Tests report non-finite values

**Solution:**

- Check for invalid inputs (negative values where not allowed)
- Verify calculations handle edge cases
- Use `isFinite()` checks in analysis functions

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Run Edge Case Tests
  run: |
    npm run dev &
    sleep 5
    npm run test:edge-cases
```

### Test Script in package.json

```json
{
  "scripts": {
    "test:edge-cases": "node -e \"import('./dist/utils/BalanceAnalysisEdgeCaseTests.js').then(m => m.runEdgeCaseTests())\""
  }
}
```

## Validation Checklist

Before deploying balance analysis:

- [ ] All edge case tests pass
- [ ] No division by zero errors
- [ ] No NaN or Infinity results
- [ ] Performance targets met
- [ ] Graceful degradation works
- [ ] Empty data handled correctly
- [ ] Single data point handled correctly
- [ ] Large datasets processed efficiently
- [ ] Zero/negative values handled safely
- [ ] Extreme values handled correctly

## Requirements Coverage

This test suite covers the following requirements:

- **10.4**: Graceful degradation when balance analysis fails
- **10.6**: Graceful degradation when libraries are missing

## Next Steps

After all edge case tests pass:

1. ✅ Verify integration with game systems
2. ✅ Test with real gameplay scenarios
3. ✅ Monitor performance in production
4. ✅ Document any new edge cases discovered
5. ✅ Add regression tests for bug fixes

## Additional Resources

- **Implementation**: `src/utils/BalanceAnalysisEdgeCaseTests.ts`
- **Balance Analyzer**: `src/utils/BalanceAnalyzer.ts`
- **Statistical Analyzer**: `src/utils/StatisticalAnalyzer.ts`
- **Tracking Manager**: `src/managers/BalanceTrackingManager.ts`

---

_Last Updated: 2025-10-15_
_Version: 1.0_
