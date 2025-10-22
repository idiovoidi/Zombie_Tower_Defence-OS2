# Player Reports Setup

Player reports are automatically saved to the `player_reports/` folder when the report server is running.

**NEW**: Reports now include comprehensive **Balance Analysis** with mathematical models, statistical predictions, and automated issue detection!

## Quick Start

### Option 1: Run with automatic file saving (recommended)

```bash
# Install dependencies (first time only)
npm install

# Run both Vite dev server AND report server
npm run dev:full
```

This will start:

- Vite dev server on `http://localhost:8080`
- Report server on `http://localhost:3001`

Reports will automatically save to `player_reports/` folder.

### Option 2: Run without automatic saving

```bash
# Just run the game
npm run dev
```

Reports will download to your browser's default download folder. You'll need to manually move them to `player_reports/`.

## Manual Server Control

If you want to run the servers separately:

```bash
# Terminal 1: Run Vite dev server
npm run dev

# Terminal 2: Run report server
npm run server
```

## How It Works

When a game ends (AI or manual), the `LogExporter` will:

1. Try to save the report to the local server (if running)
2. If the server is running, the file is saved to `player_reports/`
3. If the server is NOT running, the file downloads to your browser

## Balance Analysis (NEW) 🎯

Reports now include comprehensive balance analysis with mathematical models and statistical predictions to help you make data-driven game balance decisions.

### What's Included

#### Mathematical Balance Models

- **Balance Issues**: Automatically detected problems with severity ratings
  - INEFFICIENT_TOWERS: Damage per dollar below threshold
  - WEAK_DEFENSE: Survival rate too low
  - EXCESSIVE_OVERKILL: Wasted damage on dead zombies
  - NEGATIVE_ECONOMY: Spending more than earning
- **Wave Defense Analysis**: Lanchester's Law predictions
  - Can towers defend against wave?
  - Safety margin calculations (% buffer)
  - Damage required vs damage available
  - Time-to-reach-end calculations
- **Tower Efficiency**: Cost-effectiveness analysis
  - Efficiency scores (DPS × Range × Accuracy / Cost)
  - Effective DPS (accounting for overkill)
  - Break-even time (seconds to pay for itself)
  - Diminishing returns for stacked towers
- **Threat Scores**: Zombie difficulty vs reward balance
  - Threat score formula: (HP × Speed × Count) / (Reward × 10)
  - Balanced range: 0.8-1.2
  - Identifies over/under-rewarded zombie types

#### Statistical Analysis

- **Outlier Detection**: Identifies abnormal data points using standard deviation
- **Trend Analysis**: Linear regression to classify difficulty progression
  - GETTING_HARDER, GETTING_EASIER, or STABLE
  - Confidence levels (HIGH, MEDIUM, LOW)
  - R-squared values for model accuracy
- **Predictive Modeling**: Polynomial regression for future waves
  - Predicts difficulty for next 5 waves
  - Recommends DPS requirements
  - Confidence intervals for predictions
- **Optimal Tower Mix**: Marginal utility calculations
  - Recommends best tower composition for budget
  - Applies 90% efficiency reduction per duplicate
  - Compares actual vs optimal composition

### Enabling Balance Tracking

Balance tracking is automatically enabled when the game starts. To manually control:

```javascript
// Enable tracking
gameManager.getBalanceTrackingManager().enable();

// Disable tracking
gameManager.getBalanceTrackingManager().disable();

// Check status
const isEnabled = gameManager.getBalanceTrackingManager().isEnabled();
```

### Viewing Balance Analysis

Balance analysis appears in three places:

#### 1. Console Output (Real-Time)

During gameplay, balance issues are logged to console with color-coded warnings:

```
⚠️ Balance Issue Detected: INEFFICIENT_TOWERS (MEDIUM)
   Damage per dollar: 12.3 (threshold: 15)
   Recommendation: Build fewer towers and upgrade existing ones more

✅ Wave Defense Analysis: Wave 10
   Can defend: YES
   Safety margin: 25.5%
   Recommendation: Defense is adequate with good buffer

📊 Statistical Analysis: Difficulty Trend
   Trend: GETTING_HARDER
   Confidence: HIGH (R² = 0.89)
   Next wave prediction: 1850 difficulty, 185 DPS recommended
```

#### 2. Game Reports (Post-Game)

Full analysis included in JSON reports saved to `player_reports/`:

```json
{
  "balanceAnalysis": {
    "issues": [...],
    "waveDefenseAnalysis": [...],
    "towerEfficiencies": {...},
    "threatScores": {...},
    "optimalTowerMix": {...},
    "actualTowerMix": {...},
    "mixDeviation": 35.0,
    "overallBalanceRating": "GOOD"
  },
  "statisticalAnalysis": {
    "damageOutliers": {...},
    "dpsOutliers": {...},
    "economyOutliers": {...},
    "difficultyTrend": {...},
    "wavePredictions": [...],
    "summary": {...}
  }
}
```

#### 3. API Access (Programmatic)

Query balance data during or after gameplay:

```javascript
// Get detected balance issues
const issues = gameManager.getBalanceTrackingManager().getBalanceIssues();
issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.message}`);
  console.log(`Recommendation: ${issue.recommendation}`);
});

// Get wave defense analysis
const waveAnalysis = gameManager.getBalanceTrackingManager().getWaveDefenseAnalysis();
console.log(`Wave ${waveAnalysis[0].wave}: Safety margin ${waveAnalysis[0].safetyMargin}%`);

// Get tower efficiencies
const efficiencies = gameManager.getBalanceTrackingManager().getTowerEfficiencies();
efficiencies.forEach((eff, type) => {
  console.log(`${type}: ${eff.efficiencyScore} efficiency, ${eff.breakEvenTime}s break-even`);
});

// Get statistical analysis
const stats = gameManager.getBalanceTrackingManager().getStatisticalAnalysis();
console.log(`Difficulty trend: ${stats.difficultyTrend.trend}`);
console.log(`Next wave prediction:`, stats.wavePredictions[0]);
```

### Report Structure

Reports include two new sections:

```json
{
  "balanceAnalysis": {
    "issues": [...],
    "waveDefenseAnalysis": [...],
    "towerEfficiencies": {...},
    "threatScores": {...},
    "optimalTowerMix": {...},
    "actualTowerMix": {...},
    "overallBalanceRating": "GOOD"
  },
  "statisticalAnalysis": {
    "damageOutliers": {...},
    "difficultyTrend": {...},
    "wavePredictions": [...]
  }
}
```

### Configuration

Balance thresholds can be adjusted in `src/config/balanceConfig.ts`:

```typescript
// Detection thresholds
BalanceConfig.THRESHOLDS.DAMAGE_PER_DOLLAR_MIN = 15;
BalanceConfig.THRESHOLDS.SURVIVAL_RATE_MIN = 50;
BalanceConfig.THRESHOLDS.OVERKILL_PERCENT_MAX = 15;
BalanceConfig.THRESHOLDS.ECONOMY_EFFICIENCY_MIN = 100;
BalanceConfig.THRESHOLDS.BREAK_EVEN_TIME_MIN = 15;
BalanceConfig.THRESHOLDS.BREAK_EVEN_TIME_MAX = 30;
BalanceConfig.THRESHOLDS.THREAT_SCORE_MIN = 0.8;
BalanceConfig.THRESHOLDS.THREAT_SCORE_MAX = 1.2;
BalanceConfig.THRESHOLDS.SAFETY_MARGIN_MIN = 20;

// Diminishing returns
BalanceConfig.DIMINISHING_RETURNS.TOWER_STACKING_FACTOR = 100;
BalanceConfig.DIMINISHING_RETURNS.EFFICIENCY_REDUCTION_PER_DUPLICATE = 0.9;

// Statistical analysis
BalanceConfig.STATISTICAL.OUTLIER_THRESHOLD = 2; // standard deviations
BalanceConfig.STATISTICAL.CONFIDENCE_HIGH_R_SQUARED = 0.85;
BalanceConfig.STATISTICAL.CONFIDENCE_MEDIUM_R_SQUARED = 0.65;

// Performance
BalanceConfig.PERFORMANCE.ANALYSIS_INTERVAL_MS = 10000; // 10 seconds
```

### Performance Impact

Balance analysis is designed to have minimal performance impact:

- **Real-time analysis**: Throttled to every 10 seconds
- **Target performance**: < 5ms per analysis
- **Memory overhead**: < 10MB
- **No frame rate impact**: Analysis runs between frames

Performance is monitored automatically. If analysis exceeds 5ms, a warning is logged to console.

### Documentation

#### Quick Start

- **Quick Reference**: `design_docs/AI_Test_Balance/STATS_QUICK_REFERENCE.md`
- **Enhanced Metrics Guide**: `design_docs/AI_Test_Balance/ENHANCED_METRICS_GUIDE.md`

#### Comprehensive Guides

- **Balance Analysis Guide**: `design_docs/AI_Test_Balance/BALANCE_ANALYSIS_GUIDE.md`
- **Developer Guide**: `design_docs/AI_Test_Balance/BALANCE_ANALYSIS_DEVELOPER_GUIDE.md`
- **Examples**: `design_docs/AI_Test_Balance/BALANCE_ANALYSIS_EXAMPLES.md`
- **Troubleshooting**: `design_docs/AI_Test_Balance/BALANCE_ANALYSIS_TROUBLESHOOTING.md`

#### Reference Documentation

- **Config Reference**: `design_docs/AI_Test_Balance/BALANCE_CONFIG_REFERENCE.md`
- **Report Structure**: `design_docs/AI_Test_Balance/REPORT_STRUCTURE_REFERENCE.md`
- **Report Interpretation**: `design_docs/AI_Test_Balance/REPORT_INTERPRETATION_GUIDE.md`
- **Documentation Index**: `design_docs/AI_Test_Balance/BALANCE_DOCUMENTATION_INDEX.md`

#### Testing Guides

- **Edge Case Testing**: `design_docs/AI_Test_Balance/EDGE_CASE_TESTING_GUIDE.md`
- **Performance Testing**: `design_docs/AI_Test_Balance/PERFORMANCE_TEST_SUMMARY.md`

### Example Reports

See `player_reports/` for example reports:

- **EXAMPLE_BALANCED_GAME.json**: Well-balanced gameplay
- **EXAMPLE_INEFFICIENT_TOWERS.json**: Demonstrates inefficient tower placement
- **EXAMPLE_WEAK_DEFENSE.json**: Shows weak defense issues
- **README_EXAMPLES.md**: Detailed explanation of example reports

## Troubleshooting

**Reports still downloading instead of saving?**

- Make sure the report server is running (`npm run server` or `npm run dev:full`)
- Check the console for "✅ Report saved to: player_reports/..." message
- If you see "📊 Log downloaded" instead, the server isn't running

**Port 3001 already in use?**

- Edit `server.js` and change `const PORT = 3001;` to another port
- Update the port in `src/utils/LogExporter.ts` in the `saveToServer` method

**Server won't start?**

- Run `npm install` to ensure dependencies are installed
- Check that Node.js is installed: `node --version`
